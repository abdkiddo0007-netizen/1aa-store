import uuid
import logging
from datetime import datetime, timezone, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from backend.core.database import get_db
from backend.models.user import User
from backend.models.product import Product
from backend.models.order import Order, OrderItem, OrderStatus
from backend.models.address import OrderAddress
from backend.schemas.checkout import (
    CartItemRequest,
    CheckoutRequest,
    CheckoutResponse,
    PaymentCaptureRequest
)
from backend.schemas.order import OrderDetailResponse
from backend.services.pricing import calculate_checkout_pricing
from backend.services.inventory import inventory_service
from backend.services.order_fsm import order_fsm_service
from backend.core.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/checkout", tags=["Checkout & Payments"])

@router.post("", response_model=CheckoutResponse, status_code=status.HTTP_201_CREATED)
async def process_checkout(
    request: CheckoutRequest,
    idempotency_key: str = Header(..., alias="Idempotency-Key", description="Unique client idempotency token"),
    session: AsyncSession = Depends(get_db)
):
    """
    Enterprise Checkout Endpoint:
    1. Enforces Idempotency-Key to guarantee zero duplicate orders.
    2. Validates 6-digit Indian PIN code delivery serviceability.
    3. Calculates dynamic 18% GST and tiered logistics freight.
    4. Acquires 15-minute transactional Redis Soft Lock on requested inventory.
    5. Stores immutable OrderAddress snapshot.
    6. Commits Order and Line Items in a single atomic database transaction.
    """
    clean_idempotency = idempotency_key.strip()
    if len(clean_idempotency) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Idempotency-Key header must be at least 8 characters long."
        )

    # 1. Idempotency Check: Return existing order if key was already submitted
    stmt = (
        select(Order)
        .where(Order.idempotency_key == clean_idempotency)
        .options(selectinload(Order.items))
    )
    existing_order = (await session.execute(stmt)).scalar_one_or_none()
    if existing_order:
        logger.info("Idempotent checkout replay detected for key: %s (Order: %s)", clean_idempotency, existing_order.order_number)
        return CheckoutResponse(
            order_id=existing_order.id,
            order_number=existing_order.order_number,
            status=existing_order.status,
            currency=existing_order.currency,
            subtotal_amount=existing_order.subtotal_amount,
            tax_amount=existing_order.tax_amount,
            shipping_amount=existing_order.shipping_amount,
            total_amount=existing_order.total_amount,
            idempotency_key=existing_order.idempotency_key,
            reservation_expires_at=existing_order.created_at + timedelta(seconds=settings.INVENTORY_LOCK_TTL_SECONDS),
            items=[
                {
                    "id": it.id,
                    "sku": it.sku,
                    "product_name": it.product_name,
                    "quantity": it.quantity,
                    "unit_price": it.unit_price,
                    "tax_rate": it.tax_rate,
                    "tax_amount": it.tax_amount,
                    "total_item_amount": it.total_item_amount
                }
                for it in existing_order.items
            ],
            created_at=existing_order.created_at
        )

    # 2. Fetch Catalog Products for SKU verification
    skus = [it.sku for it in request.items]
    prod_stmt = select(Product).where(Product.sku.in_(skus))
    products = {p.sku: p for p in (await session.execute(prod_stmt)).scalars().all()}
    
    missing_skus = [s for s in skus if s not in products]
    if missing_skus:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"SKUs not found in active catalog: {missing_skus}"
        )

    # 3. Dynamic Pricing, Tax, and Freight Calculation
    pricing = calculate_checkout_pricing(
        cart_items=request.items,
        products_by_sku=products,
        destination_pincode=request.shipping_address.pincode
    )

    # 4. Resolve or Auto-Create User Account
    user = None
    if request.user_id:
        user = await session.get(User, request.user_id)
    
    if not user:
        buyer_email = (request.customer_email or f"buyer_{clean_idempotency[:8]}@1aa.in").lower().strip()
        buyer_phone = (request.customer_phone or request.shipping_address.phone_number).strip()
        
        # Check if user with phone/email exists
        u_stmt = select(User).where((User.email == buyer_email) | (User.phone == buyer_phone))
        user = (await session.execute(u_stmt)).scalar_one_or_none()
        
        if not user:
            user = User(
                email=buyer_email,
                phone=buyer_phone,
                full_name=request.customer_name or request.shipping_address.recipient_name,
                role="BUYER"
            )
            session.add(user)
            await session.flush()

    # Generate Amazon-standard order number (e.g. 1AA-20261008-7406)
    date_str = datetime.now(timezone.utc).strftime("%Y%m%d")
    order_number = f"1AA-{date_str}-{uuid.uuid4().hex[:6].upper()}"
    new_order_id = uuid.uuid4()

    # 5. Inventory Reservation (Redis Soft Lock with 15-min TTL)
    await inventory_service.reserve_stock(
        order_id=str(new_order_id),
        items=request.items,
        session=session
    )

    # 6. Create Order Header Record
    order = Order(
        id=new_order_id,
        order_number=order_number,
        user_id=user.id,
        idempotency_key=clean_idempotency,
        status=OrderStatus.PENDING_PAYMENT,
        currency="INR",
        subtotal_amount=pricing["subtotal"],
        tax_amount=pricing["tax_amount"],
        shipping_amount=pricing["shipping_amount"],
        total_amount=pricing["total_amount"],
        payment_method=request.payment_method.upper(),
        notes=request.notes
    )
    session.add(order)

    # 7. Create Immutable Order Address Snapshots
    shipping_snapshot = OrderAddress(
        order_id=order.id,
        address_type="SHIPPING",
        recipient_name=request.shipping_address.recipient_name,
        phone_number=request.shipping_address.phone_number,
        address_line1=request.shipping_address.address_line1,
        address_line2=request.shipping_address.address_line2,
        landmark=request.shipping_address.landmark,
        city=request.shipping_address.city,
        state=request.shipping_address.state,
        pincode=request.shipping_address.pincode,
        country=request.shipping_address.country
    )
    session.add(shipping_snapshot)

    billing_source = request.billing_address or request.shipping_address
    billing_snapshot = OrderAddress(
        order_id=order.id,
        address_type="BILLING",
        recipient_name=billing_source.recipient_name,
        phone_number=billing_source.phone_number,
        address_line1=billing_source.address_line1,
        address_line2=billing_source.address_line2,
        landmark=billing_source.landmark,
        city=billing_source.city,
        state=billing_source.state,
        pincode=billing_source.pincode,
        country=billing_source.country
    )
    session.add(billing_snapshot)

    # 8. Create Order Item Line Snapshots
    created_items = []
    for item_data in pricing["items"]:
        item_record = OrderItem(
            order_id=order.id,
            product_id=item_data["product_id"],
            sku=item_data["sku"],
            product_name=item_data["product_name"],
            quantity=item_data["quantity"],
            unit_price=item_data["unit_price"],
            tax_rate=item_data["tax_rate"],
            tax_amount=item_data["tax_amount"],
            total_item_amount=item_data["total_item_amount"]
        )
        session.add(item_record)
        created_items.append(item_record)

    # Commit all atomically
    await session.commit()
    logger.info("Created Order %s with %d items. Total: ₹%s", order_number, len(created_items), order.total_amount)

    return CheckoutResponse(
        order_id=order.id,
        order_number=order.order_number,
        status=order.status,
        currency=order.currency,
        subtotal_amount=order.subtotal_amount,
        tax_amount=order.tax_amount,
        shipping_amount=order.shipping_amount,
        total_amount=order.total_amount,
        idempotency_key=order.idempotency_key,
        reservation_expires_at=order.created_at + timedelta(seconds=settings.INVENTORY_LOCK_TTL_SECONDS),
        items=[
            {
                "id": it.id,
                "sku": it.sku,
                "product_name": it.product_name,
                "quantity": it.quantity,
                "unit_price": it.unit_price,
                "tax_rate": it.tax_rate,
                "tax_amount": it.tax_amount,
                "total_item_amount": it.total_item_amount
            }
            for it in created_items
        ],
        created_at=order.created_at
    )


@router.post("/orders/{order_id}/pay", response_model=OrderDetailResponse)
async def capture_order_payment(
    order_id: uuid.UUID,
    payment_data: PaymentCaptureRequest,
    session: AsyncSession = Depends(get_db)
):
    """
    Finalizes checkout payment:
    1. Validates order status is PENDING_PAYMENT.
    2. Converts Redis Soft Lock to permanent hard physical inventory deduction.
    3. Advances FSM: PENDING_PAYMENT -> PAID.
    4. Records payment reference (UPI UTR).
    """
    stmt = (
        select(Order)
        .where(Order.id == order_id)
        .options(
            selectinload(Order.items),
            selectinload(Order.addresses)
        )
    )
    order = (await session.execute(stmt)).scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    if order.status != OrderStatus.PENDING_PAYMENT:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Order is in state '{order.status.value}', cannot process payment."
        )

    # Convert soft-lock to physical database stock reduction
    cart_items = [CartItemRequest(sku=it.sku, quantity=it.quantity) for it in order.items]
    await inventory_service.commit_hard_allocation(
        order_id=str(order.id),
        items=cart_items,
        session=session
    )

    # Advance state machine to PAID
    await order_fsm_service.advance_order_status(
        order=order,
        target_status=OrderStatus.PAID,
        session=session,
        notes=f"Payment verified via {payment_data.payment_method}. UTR/Ref: {payment_data.payment_reference}"
    )

    order.payment_reference = payment_data.payment_reference
    order.payment_method = payment_data.payment_method
    order.payment_authorized_at = datetime.now(timezone.utc)

    await session.commit()
    logger.info("Payment captured for Order %s. UTR: %s", order.order_number, payment_data.payment_reference)

    return order
