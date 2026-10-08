import logging
from typing import Dict, Set, Optional
from datetime import datetime, timezone
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from backend.models.order import Order, OrderStatus
from backend.models.shipment import Shipment, ShipmentStatus

logger = logging.getLogger(__name__)

# Strict forward transition matrix
ALLOWED_ORDER_TRANSITIONS: Dict[OrderStatus, Set[OrderStatus]] = {
    OrderStatus.PENDING_PAYMENT: {OrderStatus.PAID, OrderStatus.CANCELLED},
    OrderStatus.PAID: {OrderStatus.PROCESSING, OrderStatus.CANCELLED},
    OrderStatus.PROCESSING: {OrderStatus.PARTIALLY_SHIPPED, OrderStatus.SHIPPED, OrderStatus.CANCELLED},
    OrderStatus.PARTIALLY_SHIPPED: {OrderStatus.SHIPPED, OrderStatus.CANCELLED},
    OrderStatus.SHIPPED: {OrderStatus.OUT_FOR_DELIVERY},
    OrderStatus.OUT_FOR_DELIVERY: {OrderStatus.DELIVERED},
    OrderStatus.DELIVERED: {OrderStatus.REFUNDED},
    OrderStatus.CANCELLED: set(), # Terminal state
    OrderStatus.REFUNDED: set(),  # Terminal state
}

ALLOWED_SHIPMENT_TRANSITIONS: Dict[ShipmentStatus, Set[ShipmentStatus]] = {
    ShipmentStatus.MANIFESTED: {ShipmentStatus.PICKED_UP, ShipmentStatus.IN_TRANSIT, ShipmentStatus.OUT_FOR_DELIVERY, ShipmentStatus.DELIVERED, ShipmentStatus.RTO},
    ShipmentStatus.PICKED_UP: {ShipmentStatus.IN_TRANSIT, ShipmentStatus.OUT_FOR_DELIVERY, ShipmentStatus.DELIVERED, ShipmentStatus.RTO},
    ShipmentStatus.IN_TRANSIT: {ShipmentStatus.OUT_FOR_DELIVERY, ShipmentStatus.DELIVERED, ShipmentStatus.FAILED_ATTEMPT, ShipmentStatus.RTO},
    ShipmentStatus.OUT_FOR_DELIVERY: {ShipmentStatus.DELIVERED, ShipmentStatus.FAILED_ATTEMPT, ShipmentStatus.RTO},
    ShipmentStatus.FAILED_ATTEMPT: {ShipmentStatus.OUT_FOR_DELIVERY, ShipmentStatus.DELIVERED, ShipmentStatus.RTO},
    ShipmentStatus.DELIVERED: set(), # Strict Terminal: impossible to revert from DELIVERED
    ShipmentStatus.RTO: set(),       # Strict Terminal: impossible to revert from RTO
}

class OrderFSMService:
    """Enforces enterprise state machine integrity across Orders and Consignments."""

    @staticmethod
    def validate_order_transition(current: OrderStatus, target: OrderStatus) -> None:
        if current == target:
            return # Idempotent no-op

        allowed = ALLOWED_ORDER_TRANSITIONS.get(current, set())
        if target not in allowed:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Illegal order state transition: Cannot advance order from '{current.value}' "
                    f"to '{target.value}'. Allowed transitions: {[s.value for s in allowed]}"
                )
            )

    @staticmethod
    def validate_shipment_transition(current: ShipmentStatus, target: ShipmentStatus) -> None:
        if current == target:
            return

        allowed = ALLOWED_SHIPMENT_TRANSITIONS.get(current, set())
        if target not in allowed:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Illegal shipment state transition: Cannot transition consignment from '{current.value}' "
                    f"to '{target.value}'. Allowed transitions: {[s.value for s in allowed]}"
                )
            )

    async def advance_order_status(
        self,
        order: Order,
        target_status: OrderStatus,
        session: AsyncSession,
        notes: Optional[str] = None
    ) -> Order:
        if order.status == target_status:
            return order

        self.validate_order_transition(order.status, target_status)
        previous = order.status
        order.status = target_status
        order.updated_at = datetime.now(timezone.utc)
        
        if notes:
            existing = order.notes or ""
            order.notes = f"{existing}\n[{datetime.now(timezone.utc).isoformat()}] Status changed {previous.value} -> {target_status.value}: {notes}".strip()

        logger.info("Order %s transitioned from %s to %s", order.order_number, previous.value, target_status.value)
        return order

    async def sync_order_from_shipments(
        self,
        order: Order,
        shipments: list[Shipment],
        session: AsyncSession
    ) -> Order:
        """
        Synchronizes parent Order status based on aggregate state of child consignments.
        """
        if not shipments or order.status in (OrderStatus.PENDING_PAYMENT, OrderStatus.CANCELLED, OrderStatus.REFUNDED):
            return order

        all_statuses = [s.status for s in shipments]

        if all(s == ShipmentStatus.DELIVERED for s in all_statuses):
            # Step forward to DELIVERED
            if order.status == OrderStatus.PAID:
                await self.advance_order_status(order, OrderStatus.PROCESSING, session, "Auto-advanced to processing")
            if order.status == OrderStatus.PROCESSING or order.status == OrderStatus.PARTIALLY_SHIPPED:
                await self.advance_order_status(order, OrderStatus.SHIPPED, session, "Auto-advanced to shipped")
            if order.status == OrderStatus.SHIPPED:
                await self.advance_order_status(order, OrderStatus.OUT_FOR_DELIVERY, session, "Auto-advanced to out for delivery")
            if order.status == OrderStatus.OUT_FOR_DELIVERY:
                await self.advance_order_status(order, OrderStatus.DELIVERED, session, "All shipments delivered to recipient")
        elif any(s == ShipmentStatus.OUT_FOR_DELIVERY for s in all_statuses):
            if order.status == OrderStatus.PAID:
                await self.advance_order_status(order, OrderStatus.PROCESSING, session, "Auto-advanced to processing")
            if order.status == OrderStatus.PROCESSING or order.status == OrderStatus.PARTIALLY_SHIPPED:
                await self.advance_order_status(order, OrderStatus.SHIPPED, session, "Consignments handed over to logistics carrier")
            if order.status == OrderStatus.SHIPPED:
                await self.advance_order_status(order, OrderStatus.OUT_FOR_DELIVERY, session, "Consignment out for delivery with local courier")
        elif all(s in (ShipmentStatus.IN_TRANSIT, ShipmentStatus.PICKED_UP, ShipmentStatus.MANIFESTED) for s in all_statuses):
            if order.status == OrderStatus.PAID:
                await self.advance_order_status(order, OrderStatus.PROCESSING, session, "Auto-advanced to processing")
            if order.status == OrderStatus.PROCESSING:
                await self.advance_order_status(order, OrderStatus.SHIPPED, session, "Shipments handed over to logistics carrier")
        elif any(s in (ShipmentStatus.IN_TRANSIT, ShipmentStatus.PICKED_UP) for s in all_statuses):
            if order.status == OrderStatus.PAID:
                await self.advance_order_status(order, OrderStatus.PROCESSING, session, "Auto-advanced to processing")
            if order.status == OrderStatus.PROCESSING:
                await self.advance_order_status(order, OrderStatus.PARTIALLY_SHIPPED, session, "Partial consignments dispatched from Mysore hub")

        return order

order_fsm_service = OrderFSMService()
