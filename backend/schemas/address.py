import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator
import re

INDIAN_PINCODE_REGEX = re.compile(r"^[1-9][0-9]{5}$")

class AddressBase(BaseModel):
    recipient_name: str = Field(..., min_length=2, max_length=255, description="Full name of receiver")
    phone_number: str = Field(..., min_length=10, max_length=15, description="Contact phone number")
    address_line1: str = Field(..., min_length=3, description="Door no., building, street")
    address_line2: Optional[str] = Field(None, description="Apartment, suite, area")
    landmark: Optional[str] = Field(None, description="Nearby landmark")
    city: str = Field(..., min_length=2, max_length=100)
    state: str = Field(..., min_length=2, max_length=100)
    pincode: str = Field(..., description="6-digit Indian Postal PIN Code")
    country: str = Field(default="IN", max_length=10)

    @field_validator("pincode")
    @classmethod
    def validate_pincode(cls, v: str) -> str:
        clean_pin = v.strip()
        if not INDIAN_PINCODE_REGEX.match(clean_pin):
            raise ValueError(f"Invalid Indian postal PIN Code: '{v}'. Must be exactly 6 digits not starting with 0.")
        return clean_pin


class UserAddressCreate(AddressBase):
    address_type: str = Field(default="WAREHOUSE", description="HOME, SHOP, WAREHOUSE, OFFICE")
    is_default: bool = False


class UserAddressUpdate(BaseModel):
    recipient_name: Optional[str] = None
    phone_number: Optional[str] = None
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    landmark: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    address_type: Optional[str] = None
    is_default: Optional[bool] = None

    @field_validator("pincode")
    @classmethod
    def validate_optional_pincode(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            clean_pin = v.strip()
            if not INDIAN_PINCODE_REGEX.match(clean_pin):
                raise ValueError(f"Invalid Indian postal PIN Code: '{v}'")
            return clean_pin
        return v


class UserAddressResponse(AddressBase):
    id: uuid.UUID
    user_id: uuid.UUID
    address_type: str
    is_default: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class OrderAddressSnapshot(AddressBase):
    """Immutable snapshot captured directly at checkout."""
    address_type: str = Field(default="SHIPPING", description="SHIPPING or BILLING")

    model_config = ConfigDict(from_attributes=True)
