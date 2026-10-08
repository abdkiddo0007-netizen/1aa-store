import uuid
import logging
from typing import List
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from backend.core.database import get_db
from backend.models.order import Order, OrderItem, OrderStatus
from backend.models.shipment import Shipment, ShipmentItem, ShipmentStatus
from backend.schemas.order import (
    OrderDetailResponse,
    OrderTransitionRequest,
    OrderTransitionResponse
)
from backend.schemas.shipment import (
    ShipmentCreateRequest,
    ShipmentResponse
)
from backend.services.order_fsm import order_fsm_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/orders", tags=["Order Management (OMS)"])

@router.get("/{order_ref}", response_model=OrderDetailResponse)
async def get_order_by_id_or_number(
    order_ref: str,
    session: AsyncSession = Depends(get_db)
):
    """Retrieves full order details, addresses, and item snapshots by Order UUID or Order Number."""
    is_uuid = False
    try:
        parsed_uuid = uuid.UUID(order_ref)
        is_uuid = True
    except ValueError:
        is_uuid = False

    query = select(Order).options(
        selectinload(Order.items),
        selectinload(Order.addresses)
    )

    if is_uuid:
        query = query.where(Order.id == parsed_uuid)
    else:
        query = query.where(Order.order_number == order_ref.strip())

    order = (await session.execute(query)).scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Order '{order_ref}' not found")

    return order


@router.post("/{order_id}/transition", response_model=OrderTransitionResponse)
async def transition_order_status(
    order_id: uuid.UUID,
    transition_data: OrderTransitionRequest,
    session: AsyncSession = Depends(get_db)
):
    """Advances order through the strict Finite State Machine with validation guards."""
    order = await session.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    previous_status = order.status
    
    # Enforce strict transition rules
    await order_fsm_service.advance_order_status(
        order=order,
        target_status=transition_data.target_status,
        session=session,
        notes=transition_data.notes
    )

    await session.commit()

    return OrderTransitionResponse(
        order_id=order.id,
        order_number=order.order_number,
        previous_status=previous_status,
        current_status=order.status,
        transition_timestamp=order.updated_at,
        message=f"Order successfully advanced to '{order.status.value}'"
    )


@router.post("/{order_id}/shipments", response_model=ShipmentResponse, status_code=status.HTTP_201_CREATED)
async def create_order_shipment(
    order_id: uuid.UUID,
    payload: ShipmentCreateRequest,
    session: AsyncSession = Depends(get_db)
):
    """
    Creates a physical shipment/consignment with 3PL carrier details and AWB number.
    Supports split-fulfillment by mapping specific order items to this parcel.
    """
    order = await session.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    if order.status not in (OrderStatus.PAID, OrderStatus.PROCESSING, OrderStatus.PARTIALLY_SHIPPED):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot dispatch shipment for order in '{order.status.value}' state."
        )

    # Check for duplicate AWB
    existing_awb = (await session.execute(
        select(Shipment).where(Shipment.awb_tracking_number == payload.awb_tracking_number.strip())
    )).scalar_one_or_none()
    if existing_awb:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"AWB tracking number '{payload.awb_tracking_number}' is already registered."
        )

    shipment_number = f"SHP-{uuid.uuid4().hex[:8].upper()}"
    new_shipment = Shipment(
        shipment_number=shipment_number,
        order_id=order.id,
        carrier_name=payload.carrier_name,
        awb_tracking_number=payload.awb_tracking_number.strip(),
        status=ShipmentStatus.MANIFESTED,
        shipping_label_url=payload.shipping_label_url
    )
    session.add(new_shipment)
    await session.flush()

    # Map items to this shipment
    for item in payload.items:
        shipment_item = ShipmentItem(
            shipment_id=new_shipment.id,
            order_item_id=item.order_item_id,
            quantity=item.quantity
        )
        session.add(shipment_item)

    # Advance order to PROCESSING or PARTIALLY_SHIPPED
    if order.status == OrderStatus.PAID:
        await order_fsm_service.advance_order_status(
            order,
            OrderStatus.PROCESSING,
            session,
            f"Consignment {shipment_number} created with {payload.carrier_name}"
        )

    await session.commit()

    # Return refreshed shipment
    query = (
        select(Shipment)
        .where(Shipment.id == new_shipment.id)
        .options(
            selectinload(Shipment.items),
            selectinload(Shipment.tracking_events)
        )
    )
    return (await session.execute(query)).scalar_one()


@router.get("/{order_id}/shipments", response_model=List[ShipmentResponse])
async def list_order_shipments(
    order_id: uuid.UUID,
    session: AsyncSession = Depends(get_db)
):
    """Lists all consignments and AWB tracking numbers associated with an order."""
    query = (
        select(Shipment)
        .where(Shipment.order_id == order_id)
        .options(
            selectinload(Shipment.items),
            selectinload(Shipment.tracking_events)
        )
    )
    res = await session.execute(query)
    return res.scalars().all()
