import json
import logging
from typing import Dict, Any
from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from backend.core.database import get_db
from backend.core.security import verify_carrier_hmac_signature
from backend.schemas.webhook import CarrierWebhookPayload, CarrierWebhookResult
from backend.services.logistics import logistics_service
from backend.services.dlq import dlq_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/webhooks/logistics", tags=["3PL Logistics Webhook & DLQ"])

@router.post("/tracking", response_model=CarrierWebhookResult, status_code=status.HTTP_200_OK)
async def ingest_carrier_tracking_webhook(
    request: Request,
    raw_body: bytes = Depends(verify_carrier_hmac_signature),
    session: AsyncSession = Depends(get_db)
):
    """
    3PL Carrier Webhook Tracking Ingestion Endpoint:
    1. Authenticates webhook using HMAC SHA-256 signature verification ('X-Carrier-Signature').
    2. Enforces database idempotency via unique constraint on (shipment_id, status_code, timestamp).
    3. Advances shipment and parent order FSM states.
    4. Guarantees Zero Event Loss: if DB transaction fails, falls back immediately to Redis/SQS DLQ.
    """
    headers = dict(request.headers)
    
    # Parse payload
    try:
        data = json.loads(raw_body.decode("utf-8"))
        payload = CarrierWebhookPayload(**data)
    except Exception as parse_err:
        logger.warning("Malformed carrier webhook payload: %s", parse_err)
        dlq_id = await dlq_service.push_to_dlq(
            raw_body=raw_body,
            headers=headers,
            error_reason=f"JSON validation error: {str(parse_err)}"
        )
        return CarrierWebhookResult(
            status="DLQ_STORED",
            message="Malformed payload stored in DLQ for manual inspection.",
            dlq_id=dlq_id
        )

    # Ingest with full idempotency and transactional safety
    result = await logistics_service.ingest_tracking_update(
        payload=payload,
        raw_body=raw_body,
        headers=headers,
        session=session
    )

    return result


@router.get("/dlq")
async def inspect_dead_letter_queue():
    """Operational audit endpoint returning DLQ buffer count and recent queued events."""
    count = await dlq_service.get_dlq_count()
    events = await dlq_service.inspect_dlq_events(limit=20)
    return {
        "dlq_count": count,
        "recent_events": events
    }
