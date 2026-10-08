import uuid
from decimal import Decimal
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from backend.schemas.address import OrderAddressSnapshot
from backend.models.order import OrderStatus

class CartItemRequest(BaseModel):
    sku: str = Field(..., description="Unique product SKU identifier")
    quantity: int = Field(..., gt=0, description="Quantity to purchase (must be > 0)")


class CheckoutRequest(BaseModel):
    user_id: Optional[uuid.UUID] = Field(None, description="Registered User ID; auto-created for guest buyers")
    customer_name: Optional[str] = Field(None, description="Buyer Full Name")
    customer_email: Optional[str] = Field(None, description="Buyer Email Address")
    customer_phone: Optional[str] = Field(None, description="Buyer Phone Number")
    
    shipping_address: OrderAddressSnapshot
    billing_address: Optional[OrderAddressSnapshot] = None
    
    items: List[CartItemRequest] = Field(..., min_length=1, description="Cart item line items")
    payment_method: str = Field(default="UPI", description="UPI, CARD, NETBANKING, COD")
    notes: Optional[str] = None


class CheckoutItemSummary(BaseModel):
    id: uuid.UUID
    sku: str
    product_name: str
    quantity: int
    unit_price: Decimal
    tax_rate: Decimal
    tax_amount: Decimal
    total_item_amount: Decimal

    model_config = ConfigDict(from_attributes=True)


class CheckoutResponse(BaseModel):
    order_id: uuid.UUID
    order_number: str
    status: OrderStatus
    currency: str
    subtotal_amount: Decimal
    tax_amount: Decimal
    shipping_amount: Decimal
    total_amount: Decimal
    idempotency_key: str
    reservation_expires_at: Optional[datetime] = None
    items: List[CheckoutItemSummary]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PaymentCaptureRequest(BaseModel):
    payment_reference: str = Field(..., min_length=4, description="UPI UTR number or Gateway Transaction ID")
    payment_method: str = Field(default="UPI", description="UPI, CARD, NETBANKING")
