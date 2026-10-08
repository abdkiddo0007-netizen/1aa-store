import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.core.database import get_db
from backend.models.product import Product
from backend.schemas.checkout import CartItemRequest
from backend.services.inventory import inventory_service

router = APIRouter(prefix="/inventory", tags=["Inventory & Soft Lock"])

@router.get("/{sku}")
async def get_inventory_stock(
    sku: str,
    session: AsyncSession = Depends(get_db)
):
    """Returns database physical stock and effective real-time available stock minus active soft locks."""
    stmt = select(Product).where(Product.sku == sku.strip())
    product = (await session.execute(stmt)).scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Product with SKU '{sku}' not found")

    effective_available = await inventory_service.get_effective_available_stock(sku, session)

    return {
        "sku": product.sku,
        "title": product.title,
        "physical_stock": product.stock_quantity,
        "effective_available_stock": effective_available,
        "soft_locked_quantity": max(0, product.stock_quantity - effective_available)
    }


@router.post("/reserve")
async def manual_reserve_stock(
    order_id: str,
    items: List[CartItemRequest],
    session: AsyncSession = Depends(get_db)
):
    """Explicitly soft-reserves stock in Redis with a 15-minute TTL."""
    result = await inventory_service.reserve_stock(order_id, items, session)
    return result


@router.post("/release")
async def manual_release_stock(
    order_id: str,
    items: List[CartItemRequest]
):
    """Releases active Redis soft locks back to the active catalog."""
    await inventory_service.release_reservation(order_id, items)
    return {
        "order_id": order_id,
        "status": "RELEASED",
        "message": "Stock reservations successfully cleared"
    }
