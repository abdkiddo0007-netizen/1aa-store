import uuid
from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field
from backend.models.shipment import ShipmentStatus

class ShipmentItemCreate(BaseModel):
    order_item_id: uuid.UUID
    quantity: int = Field(..., gt=0)


class ShipmentCreateRequest(BaseModel):
    order_id: uuid.UUID
    carrier_name: str = Field(..., description="BlueDart, Delhivery, DTDC, Shadowfax")
    awb_tracking_number: str = Field(..., min_length=4, description="Air Waybill Tracking Number")
    items: List[ShipmentItemCreate] = Field(..., min_length=1, description="Items mapped to this physical parcel")
    shipping_label_url: Optional[str] = None


class ShipmentItemResponse(BaseModel):
    id: uuid.UUID
    order_item_id: uuid.UUID
    quantity: int

    model_config = ConfigDict(from_attributes=True)


class ShipmentTrackingEventResponse(BaseModel):
    id: uuid.UUID
    carrier_name: str
    status_code: str
    status_description: Optional[str] = None
    location: Optional[str] = None
    carrier_timestamp: datetime
    raw_payload: Dict[str, Any]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ShipmentResponse(BaseModel):
    id: uuid.UUID
    shipment_number: str
    order_id: uuid.UUID
    carrier_name: str
    awb_tracking_number: str
    status: ShipmentStatus
    shipped_at: Optional[datetime] = None
    estimated_delivery_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None
    shipping_label_url: Optional[str] = None
    created_at: datetime
    items: List[ShipmentItemResponse] = []
    tracking_events: List[ShipmentTrackingEventResponse] = []

    model_config = ConfigDict(from_attributes=True)
