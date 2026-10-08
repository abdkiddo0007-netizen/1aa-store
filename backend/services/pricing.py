from decimal import Decimal, ROUND_HALF_UP
from typing import List, Dict, Any, Tuple
from fastapi import HTTPException, status
from backend.schemas.checkout import CartItemRequest
from backend.models.product import Product
from backend.core.config import settings

# Non-serviceable PIN code prefixes or remote defense zones (demo validation rule)
BLOCKED_PINCODE_PREFIXES = {"000", "999"}

def validate_postal_serviceability(pincode: str) -> Dict[str, Any]:
    """
    Validates delivery postal code serviceability across Indian logistics zones.
    Central dispatch: 570007 (Mysore, Karnataka).
    """
    clean_pin = pincode.strip()
    if len(clean_pin) != 6 or not clean_pin.isdigit():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid postal code format: '{clean_pin}'. Must be 6 digits."
        )

    for prefix in BLOCKED_PINCODE_PREFIXES:
        if clean_pin.startswith(prefix):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"PIN Code {clean_pin} is located in an unserviceable remote zone."
            )

    # Zone calculation based on Mysore central dispatch (570007)
    first_digit = int(clean_pin[0])
    is_intra_state = clean_pin.startswith("57") or clean_pin.startswith("56") or clean_pin.startswith("58") or clean_pin.startswith("59")
    
    if is_intra_state:
        zone = "INTRA_STATE_KARNATAKA"
        estimated_days = 2
    elif first_digit in (5, 6): # South India
        zone = "SOUTH_ZONE"
        estimated_days = 3
    elif first_digit in (4, 7): # West / East
        zone = "REGIONAL_ZONE"
        estimated_days = 4
    else: # North / North-East
        zone = "NATIONAL_ZONE"
        estimated_days = 5

    return {
        "serviceable": True,
        "pincode": clean_pin,
        "zone": zone,
        "is_intra_state": is_intra_state,
        "estimated_transit_days": estimated_days
    }


def calculate_checkout_pricing(
    cart_items: List[CartItemRequest],
    products_by_sku: Dict[str, Product],
    destination_pincode: str
) -> Dict[str, Any]:
    """
    Calculates dynamic subtotal, 18% GST (CGST/SGST or IGST), and shipping dynamically.
    Enforces Amazon/Flipkart enterprise pricing conventions.
    """
    serviceability = validate_postal_serviceability(destination_pincode)
    is_intra_state = serviceability["is_intra_state"]

    subtotal = Decimal("0.00")
    total_tax = Decimal("0.00")
    line_item_details = []

    for item in cart_items:
        prod = products_by_sku.get(item.sku)
        if not prod:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with SKU '{item.sku}' not found in active catalog"
            )

        unit_price = Decimal(str(prod.price))
        qty = item.quantity
        item_subtotal = (unit_price * qty).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        
        # 18% GST calculation
        tax_rate = Decimal(str(prod.tax_rate or settings.DEFAULT_GST_RATE))
        item_tax = (item_subtotal * (tax_rate / Decimal("100.00"))).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        item_total = item_subtotal + item_tax

        subtotal += item_subtotal
        total_tax += item_tax

        line_item_details.append({
            "product_id": prod.id,
            "sku": prod.sku,
            "product_name": prod.title,
            "quantity": qty,
            "unit_price": unit_price,
            "tax_rate": tax_rate,
            "tax_amount": item_tax,
            "total_item_amount": item_total,
            "tax_breakup": {
                "cgst": (item_tax / 2).quantize(Decimal("0.01")) if is_intra_state else Decimal("0.00"),
                "sgst": (item_tax / 2).quantize(Decimal("0.01")) if is_intra_state else Decimal("0.00"),
                "igst": item_tax if not is_intra_state else Decimal("0.00")
            }
        })

    # Free delivery on orders >= ₹999; flat ₹60 standard shipping otherwise
    if subtotal >= Decimal("999.00"):
        shipping_fee = Decimal("0.00")
    else:
        shipping_fee = Decimal("60.00")

    total_amount = subtotal + total_tax + shipping_fee

    return {
        "subtotal": subtotal,
        "tax_amount": total_tax,
        "shipping_amount": shipping_fee,
        "total_amount": total_amount,
        "serviceability": serviceability,
        "items": line_item_details
    }
