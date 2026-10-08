import uuid
from decimal import Decimal
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field
from backend.models.order import OrderStatus

class OrderItemDetail(BaseModel):
    id: uuid.UUID
    sku: str
    product_name: str
    quantity: int
    unit_price: Decimal
    tax_rate: Decimal
    tax_amount: Decimal
    total_item_amount: Decimal

    model_config = ConfigDict(from_attributes=True)


class OrderAddressDetail(BaseModel):
    id: uuid.UUID
    address_type: str
    recipient_name: str
    phone_number: str
    address_line1: str
    address_line2: Optional[str] = None
    landmark: Optional[str] = None
    city: str
    state: str
    pincode: str
    country: str

    model_config = ConfigDict(from_attributes=True)


class OrderDetailResponse(BaseModel):
    id: uuid.UUID
    order_number: str
    user_id: uuid.UUID
    status: OrderStatus
    currency: str
    subtotal_amount: Decimal
    discount_amount: Decimal
    tax_amount: Decimal
    shipping_amount: Decimal
    total_amount: Decimal
    payment_method: str
    payment_reference: Optional[str] = None
    payment_authorized_at: Optional[datetime] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    addresses: List[OrderAddressDetail] = []
    items: List[OrderItemDetail] = []

    model_config = ConfigDict(from_attributes=True)


class OrderTransitionRequest(BaseModel):
    target_status: OrderStatus = Field(..., description="Target state to transition to")
    notes: Optional[str] = Field(None, description="Operational notes or carrier dispatch reason")
    actor: Optional[str] = Field(default="SYSTEM", description="Actor performing transition")


class OrderTransitionResponse(BaseModel):
    order_id: uuid.UUID
    order_number: str
    previous_status: OrderStatus
    current_status: OrderStatus
    transition_timestamp: datetime
    message: str
