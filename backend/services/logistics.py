import logging
from typing import Dict, Any, Optional
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.exc import IntegrityError
from backend.models.shipment import Shipment, ShipmentTrackingEvent, ShipmentStatus
from backend.models.order import Order
from backend.schemas.webhook import CarrierWebhookPayload, CarrierWebhookResult
from backend.services.order_fsm import order_fsm_service
from backend.services.dlq import dlq_service

logger = logging.getLogger(__name__)

CARRIER_STATUS_MAP: Dict[str, ShipmentStatus] = {
    "MANIFESTED": ShipmentStatus.MANIFESTED,
    "DATA_RECEIVED": ShipmentStatus.MANIFESTED,
    "PICKED_UP": ShipmentStatus.PICKED_UP,
    "PICKUP_DONE": ShipmentStatus.PICKED_UP,
    "IN_TRANSIT": ShipmentStatus.IN_TRANSIT,
    "HUB_INSCAN": ShipmentStatus.IN_TRANSIT,
    "OUT_FOR_DELIVERY": ShipmentStatus.OUT_FOR_DELIVERY,
    "OFD": ShipmentStatus.OUT_FOR_DELIVERY,
    "DELIVERED": ShipmentStatus.DELIVERED,
    "FAILED_ATTEMPT": ShipmentStatus.FAILED_ATTEMPT,
    "UNDELIVERED": ShipmentStatus.FAILED_ATTEMPT,
    "RTO": ShipmentStatus.RTO,
    "RETURN_TO_ORIGIN": ShipmentStatus.RTO,
}

class LogisticsWebhookService:
    """
    Handles carrier tracking webhooks with:
    1. Idempotent upsert via unique constraint on (shipment_id, status_code, carrier_timestamp).
    2. Real-time FSM synchronization across Shipments and parent Orders.
    3. Resilient Dead-Letter Queue (DLQ) fallback.
    """

    async def ingest_tracking_update(
        self,
        payload: CarrierWebhookPayload,
        raw_body: bytes,
        headers: Dict[str, str],
        session: AsyncSession
    ) -> CarrierWebhookResult:
        try:
            # 1. Lookup shipment by AWB number with eagerly loaded order
            stmt = (
                select(Shipment)
                .where(Shipment.awb_tracking_number == payload.awb_tracking_number)
                .options(selectinload(Shipment.order))
            )
            res = await session.execute(stmt)
            shipment = res.scalar_one_or_none()

            if not shipment:
                # If shipment is not in DB yet (e.g. carrier generated AWB ahead of local sync), buffer in DLQ
                dlq_id = await dlq_service.push_to_dlq(
                    raw_body=raw_body,
                    headers=headers,
                    error_reason=f"Unknown AWB number: '{payload.awb_tracking_number}'",
                    awb=payload.awb_tracking_number
                )
                return CarrierWebhookResult(
                    status="DLQ_STORED",
                    message=f"AWB {payload.awb_tracking_number} not recognized; stored in DLQ for reconciliation.",
                    dlq_id=dlq_id
                )

            saved_shipment_id = shipment.id
            order = shipment.order

            # 2. Prepare tracking event ledger entry
            tracking_event = ShipmentTrackingEvent(
                shipment_id=saved_shipment_id,
                carrier_name=payload.carrier_name,
                status_code=payload.status_code.upper(),
                status_description=payload.status_description,
                location=payload.location,
                carrier_timestamp=payload.carrier_timestamp,
                raw_payload=payload.metadata
            )
            session.add(tracking_event)

            try:
                await session.flush()
            except IntegrityError as ie:
                # Duplicate carrier scan detected!
                await session.rollback()
                logger.info(
                    "Duplicate tracking event ignored for AWB %s (Status: %s at %s)",
                    payload.awb_tracking_number,
                    payload.status_code,
                    payload.carrier_timestamp
                )
                return CarrierWebhookResult(
                    status="DUPLICATE_IGNORED",
                    message="Carrier tracking event already exists; idempotent skip applied.",
                    shipment_id=saved_shipment_id
                )

            # 3. Advance shipment status if recognizable
            normalized_status = CARRIER_STATUS_MAP.get(payload.status_code.upper())
            if normalized_status:
                try:
                    order_fsm_service.validate_shipment_transition(shipment.status, normalized_status)
                    shipment.status = normalized_status
                    if normalized_status == ShipmentStatus.DELIVERED:
                        shipment.delivered_at = payload.carrier_timestamp
                    elif normalized_status == ShipmentStatus.PICKED_UP:
                        shipment.shipped_at = payload.carrier_timestamp
                except Exception as transition_err:
                    logger.warning("Shipment transition warning for %s: %s", shipment.shipment_number, transition_err)

            # 4. Sync parent order status
            order = shipment.order
            all_shipments = [shipment]
            if order:
                all_shipments_stmt = select(Shipment).where(Shipment.order_id == order.id)
                all_shipments = (await session.execute(all_shipments_stmt)).scalars().all()
                await order_fsm_service.sync_order_from_shipments(order, list(all_shipments), session)

            await session.commit()

            return CarrierWebhookResult(
                status="SUCCESS",
                message="Carrier tracking event ingested and order state synchronized.",
                tracking_event_id=tracking_event.id,
                shipment_id=shipment.id,
                order_status=order.status.value if order else None
            )

        except Exception as unhandled_err:
            await session.rollback()
            logger.error("Database failure during carrier webhook ingestion: %s", unhandled_err, exc_info=True)
            
            # Zero-Loss DLQ Fallback
            dlq_id = await dlq_service.push_to_dlq(
                raw_body=raw_body,
                headers=headers,
                error_reason=f"Database ingestion error: {str(unhandled_err)}",
                awb=payload.awb_tracking_number
            )
            return CarrierWebhookResult(
                status="DLQ_STORED",
                message="Temporary database contention; raw carrier payload pushed to DLQ.",
                dlq_id=dlq_id
            )

logistics_service = LogisticsWebhookService()
