import json
import logging
from typing import List, Dict, Any, Optional
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from backend.models.product import Product
from backend.core.redis_client import get_redis
from backend.core.config import settings
from backend.schemas.checkout import CartItemRequest

logger = logging.getLogger(__name__)

class InventoryReservationService:
    """
    Implements high-concurrency Redis 'Soft Lock' with a 15-minute TTL.
    Prevents overselling during high-traffic flash sales and checkout payment flows.
    """

    @staticmethod
    def _reservation_key(order_id: str, sku: str) -> str:
        return f"inventory:lock:{order_id}:{sku}"

    @staticmethod
    def _sku_reserved_count_key(sku: str) -> str:
        return f"inventory:reserved:{sku}"

    async def reserve_stock(
        self,
        order_id: str,
        items: List[CartItemRequest],
        session: AsyncSession
    ) -> Dict[str, Any]:
        """
        Transactional Soft Lock:
        1. Checks database stock and active Redis locks.
        2. Sets TTL lock of 15 mins (900s) on Redis.
        3. If any item is insufficient, rollbacks reservations and raises 409 Conflict.
        """
        redis = await get_redis()
        reserved_locks = []

        try:
            # 1. Fetch live stock from DB for all items
            skus = [it.sku for it in items]
            stmt = select(Product).where(Product.sku.in_(skus)).with_for_update()
            result = await session.execute(stmt)
            products = {p.sku: p for p in result.scalars().all()}

            for item in items:
                prod = products.get(item.sku)
                if not prod:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail=f"Product with SKU '{item.sku}' not found"
                    )

                # Fetch active soft-reserved quantity in Redis across other orders
                reserved_str = await redis.get(self._sku_reserved_count_key(item.sku))
                current_reserved = int(reserved_str) if reserved_str else 0
                available_stock = prod.stock_quantity - current_reserved

                if available_stock < item.quantity:
                    raise HTTPException(
                        status_code=status.HTTP_409_CONFLICT,
                        detail=(
                            f"Insufficient inventory for '{prod.title}' (SKU: {item.sku}). "
                            f"Requested: {item.quantity}, Available: {max(0, available_stock)}."
                        )
                    )

                # Set individual lock key with 15-minute TTL
                lock_key = self._reservation_key(order_id, item.sku)
                lock_set = await redis.set(
                    lock_key,
                    item.quantity,
                    ex=settings.INVENTORY_LOCK_TTL_SECONDS,
                    nx=True
                )
                if not lock_set:
                    # Idempotent retry: if lock already exists for this exact order, renew TTL
                    await redis.set(
                        lock_key,
                        item.quantity,
                        ex=settings.INVENTORY_LOCK_TTL_SECONDS
                    )
                else:
                    # Increment total reserved counter
                    new_reserved = current_reserved + item.quantity
                    await redis.set(
                        self._sku_reserved_count_key(item.sku),
                        new_reserved,
                        ex=settings.INVENTORY_LOCK_TTL_SECONDS * 2
                    )

                reserved_locks.append((item.sku, item.quantity))

            logger.info("Successfully soft-locked inventory for Order %s: %s", order_id, reserved_locks)
            return {
                "order_id": order_id,
                "status": "RESERVED",
                "ttl_seconds": settings.INVENTORY_LOCK_TTL_SECONDS,
                "reserved_items": reserved_locks
            }

        except Exception as e:
            # Rollback any locks acquired during this failed attempt
            logger.warning("Reservation failed for Order %s. Releasing partial locks. Error: %s", order_id, e)
            for sku, qty in reserved_locks:
                await self._release_single(order_id, sku, qty, redis)
            raise

    async def commit_hard_allocation(
        self,
        order_id: str,
        items: List[CartItemRequest],
        session: AsyncSession
    ) -> None:
        """
        Called upon successful payment authorization:
        1. Hard-deducts physical inventory in the database table `products`.
        2. Releases the Redis soft lock.
        """
        redis = await get_redis()
        skus = [it.sku for it in items]
        
        stmt = select(Product).where(Product.sku.in_(skus)).with_for_update()
        result = await session.execute(stmt)
        products = {p.sku: p for p in result.scalars().all()}

        for item in items:
            prod = products.get(item.sku)
            if prod:
                # Decrement DB stock count
                prod.stock_quantity = max(0, prod.stock_quantity - item.quantity)
            
            # Remove soft lock & decrement reserved counter
            await self._release_single(order_id, item.sku, item.quantity, redis)

        await session.commit()
        logger.info("Order %s payment verified: stock converted to hard allocation.", order_id)

    async def release_reservation(
        self,
        order_id: str,
        items: List[CartItemRequest]
    ) -> None:
        """
        Called when payment times out, gets cancelled, or fails:
        Releases reserved stock back to the active catalog pool immediately.
        """
        redis = await get_redis()
        for item in items:
            await self._release_single(order_id, item.sku, item.quantity, redis)
        logger.info("Order %s cancelled/timed out: soft locks released back to catalog.", order_id)

    async def _release_single(self, order_id: str, sku: str, qty: int, redis) -> None:
        lock_key = self._reservation_key(order_id, sku)
        existed = await redis.delete(lock_key)
        if existed:
            reserved_str = await redis.get(self._sku_reserved_count_key(sku))
            if reserved_str:
                current = int(reserved_str)
                new_val = max(0, current - qty)
                if new_val == 0:
                    await redis.delete(self._sku_reserved_count_key(sku))
                else:
                    await redis.set(self._sku_reserved_count_key(sku), new_val)

    async def get_effective_available_stock(self, sku: str, session: AsyncSession) -> int:
        redis = await get_redis()
        stmt = select(Product.stock_quantity).where(Product.sku == sku)
        result = await session.execute(stmt)
        db_stock = result.scalar_one_or_none()
        if db_stock is None:
            return 0
        
        reserved_str = await redis.get(self._sku_reserved_count_key(sku))
        reserved = int(reserved_str) if reserved_str else 0
        return max(0, db_stock - reserved)

inventory_service = InventoryReservationService()
