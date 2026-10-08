import uuid
from typing import Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

class CarrierWebhookPayload(BaseModel):
    awb_tracking_number: str = Field(..., description="Unique carrier Air Waybill number")
    carrier_name: str = Field(..., description="Carrier ID, e.g. BlueDart, Delhivery, DTDC")
    status_code: str = Field(..., description="Standardized carrier state, e.g. PICKED_UP, IN_TRANSIT, DELIVERED")
    status_description: Optional[str] = Field(None, description="Detailed carrier scan text")
    location: Optional[str] = Field(None, description="City, Hub, or Facility where event was logged")
    carrier_timestamp: datetime = Field(..., description="Exact timestamp of carrier scan")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Raw carrier telemetry fields")


class CarrierWebhookResult(BaseModel):
    status: str = Field(..., description="'SUCCESS', 'DUPLICATE_IGNORED', or 'DLQ_STORED'")
    message: str
    tracking_event_id: Optional[uuid.UUID] = None
    shipment_id: Optional[uuid.UUID] = None
    order_status: Optional[str] = None
    dlq_id: Optional[str] = None
