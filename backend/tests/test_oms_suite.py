import os
import hmac
import hashlib
import json
import uuid
import pytest
from decimal import Decimal
from datetime import datetime, timezone
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

# Configure test environment to use async SQLite
os.environ["TESTING"] = "1"
os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///:memory:"

from backend.core.config import settings
from backend.core.database import Base, get_db
from backend.models.product import Product
from backend.models.order import OrderStatus
from backend.models.shipment import ShipmentStatus
from backend.main import app

test_engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)
TestSessionLocal = async_sessionmaker(bind=test_engine, class_=AsyncSession, expire_on_commit=False)

async def override_get_db():
    async with TestSessionLocal() as session:
        yield session

app.dependency_overrides[get_db] = override_get_db

@pytest_asyncio.fixture(autouse=True)
async def prepare_database():
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Seed sample catalog products
    async with TestSessionLocal() as session:
        sample_prod1 = Product(
            id="sku-bubble-gun-84",
            sku="wh/195_89531_bubble_gun_23_hole_assorted_color_at84",
            title="Bubble Gun 23 Hole Automatic Gatling (Assorted)",
            category="TOYS_GAMES",
            base_cost=Decimal("84.00"),
            price=Decimal("184.00"),
            market_price=Decimal("349.00"),
            stock_quantity=50,
            hsn_code="9503",
            tax_rate=Decimal("18.00")
        )
        sample_prod2 = Product(
            id="sku-air-gun-129",
            sku="wh/196_76949_air_gun_shooting_game_toy_at129",
            title="Air Gun Shooting Game Toy Set",
            category="TOYS_GAMES",
            base_cost=Decimal("129.00"),
            price=Decimal("229.00"),
            market_price=Decimal("499.00"),
            stock_quantity=2, # Low stock for concurrency testing
            hsn_code="9503",
            tax_rate=Decimal("18.00")
        )
        session.add_all([sample_prod1, sample_prod2])
        await session.commit()

    yield

    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest.mark.asyncio
async def test_health_check():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get("/health")
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "HEALTHY"
        assert "7406231167" in data["support_hotline"]


@pytest.mark.asyncio
async def test_checkout_atomic_and_idempotency():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        idempotency_key = f"idem-key-{uuid.uuid4()}"
        payload = {
            "customer_name": "Abdul Darvesh",
            "customer_email": "1aaavailablealways@gmail.com",
            "customer_phone": "7406231167",
            "shipping_address": {
                "recipient_name": "Abdul Darvesh",
                "phone_number": "7406231167",
                "address_line1": "Rajendra Nagar, Kesare",
                "city": "Mysore",
                "state": "Karnataka",
                "pincode": "570007",
                "country": "IN",
                "address_type": "WAREHOUSE"
            },
            "items": [
                {
                    "sku": "wh/195_89531_bubble_gun_23_hole_assorted_color_at84",
                    "quantity": 2
                }
            ],
            "payment_method": "UPI"
        }

        # 1. Initial checkout request
        res1 = await client.post("/api/v1/checkout", json=payload, headers={"Idempotency-Key": idempotency_key})
        assert res1.status_code == 201
        order_data = res1.json()
        order_id = order_data["order_id"]
        order_number = order_data["order_number"]
        assert order_data["status"] == "PENDING_PAYMENT"
        
        # Verify 18% GST calculation:
        # 2 * 184 = 368.00 subtotal
        # 18% GST = 66.24
        # Total = 368.00 + 66.24 + 60 (shipping since < 999) = 494.24
        assert Decimal(str(order_data["subtotal_amount"])) == Decimal("368.00")
        assert Decimal(str(order_data["tax_amount"])) == Decimal("66.24")
        assert Decimal(str(order_data["total_amount"])) == Decimal("494.24")

        # 2. Idempotent Retry: Replaying exact same request must return cached order without creating a duplicate
        res2 = await client.post("/api/v1/checkout", json=payload, headers={"Idempotency-Key": idempotency_key})
        assert res2.status_code == 201 or res2.status_code == 200
        replay_data = res2.json()
        assert replay_data["order_id"] == order_id
        assert replay_data["order_number"] == order_number


@pytest.mark.asyncio
async def test_postal_code_validation():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Invalid 5-digit PIN code
        bad_payload = {
            "shipping_address": {
                "recipient_name": "Test User",
                "phone_number": "9999999999",
                "address_line1": "Street 1",
                "city": "Mysore",
                "state": "Karnataka",
                "pincode": "57000", # Invalid length
                "address_type": "HOME"
            },
            "items": [{"sku": "wh/195_89531_bubble_gun_23_hole_assorted_color_at84", "quantity": 1}]
        }
        res = await client.post("/api/v1/checkout", json=bad_payload, headers={"Idempotency-Key": f"key-{uuid.uuid4()}"})
        assert res.status_code == 422 # Pydantic validation error


@pytest.mark.asyncio
async def test_inventory_soft_lock_concurrency_and_oversell_prevention():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Product 2 has stock_quantity = 2
        sku = "wh/196_76949_air_gun_shooting_game_toy_at129"

        # Buyer 1 books 2 units
        p1 = {
            "customer_name": "Buyer 1",
            "customer_email": "buyer1@test.com",
            "customer_phone": "9876543210",
            "shipping_address": {
                "recipient_name": "Buyer 1",
                "phone_number": "9876543210",
                "address_line1": "Main Road",
                "city": "Bangalore",
                "state": "Karnataka",
                "pincode": "560001"
            },
            "items": [{"sku": sku, "quantity": 2}]
        }
        res1 = await client.post("/api/v1/checkout", json=p1, headers={"Idempotency-Key": f"key-{uuid.uuid4()}"})
        assert res1.status_code == 201

        # Buyer 2 attempts to checkout 1 unit while Buyer 1 holds the 15-minute soft lock
        p2 = {
            "customer_name": "Buyer 2",
            "customer_email": "buyer2@test.com",
            "customer_phone": "9876543211",
            "shipping_address": {
                "recipient_name": "Buyer 2",
                "phone_number": "9876543211",
                "address_line1": "MG Road",
                "city": "Bangalore",
                "state": "Karnataka",
                "pincode": "560001"
            },
            "items": [{"sku": sku, "quantity": 1}]
        }
        res2 = await client.post("/api/v1/checkout", json=p2, headers={"Idempotency-Key": f"key-{uuid.uuid4()}"})
        assert res2.status_code == 409 # Conflict: Insufficient inventory due to active soft lock!


@pytest.mark.asyncio
async def test_payment_and_fsm_illegal_transition_prevention():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Create order
        payload = {
            "shipping_address": {
                "recipient_name": "Abdul Darvesh",
                "phone_number": "7406231167",
                "address_line1": "Kesare",
                "city": "Mysore",
                "state": "Karnataka",
                "pincode": "570007"
            },
            "items": [{"sku": "wh/195_89531_bubble_gun_23_hole_assorted_color_at84", "quantity": 1}]
        }
        create_res = await client.post("/api/v1/checkout", json=payload, headers={"Idempotency-Key": f"key-{uuid.uuid4()}"})
        order_id = create_res.json()["order_id"]

        # 1. Capture payment: PENDING_PAYMENT -> PAID
        pay_res = await client.post(f"/api/v1/checkout/orders/{order_id}/pay", json={
            "payment_reference": "UPI-UTR-922010002282280",
            "payment_method": "UPI"
        })
        assert pay_res.status_code == 200
        assert pay_res.json()["status"] == "PAID"
        assert pay_res.json()["payment_reference"] == "UPI-UTR-922010002282280"

        # 2. Advance to PROCESSING
        proc_res = await client.post(f"/api/v1/orders/{order_id}/transition", json={
            "target_status": "PROCESSING",
            "notes": "Picked in Mysore Warehouse"
        })
        assert proc_res.status_code == 200
        assert proc_res.json()["current_status"] == "PROCESSING"

        # 3. Illegal state jump test: Cannot transition directly from PROCESSING to DELIVERED
        illegal_res = await client.post(f"/api/v1/orders/{order_id}/transition", json={
            "target_status": "DELIVERED",
            "notes": "Invalid jump attempt"
        })
        assert illegal_res.status_code == 400
        assert "Illegal order state transition" in illegal_res.json()["detail"]


@pytest.mark.asyncio
async def test_carrier_webhook_hmac_and_idempotency_and_dlq():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Create order and shipment
        c_res = await client.post("/api/v1/checkout", json={
            "shipping_address": {
                "recipient_name": "Test User",
                "phone_number": "7406231167",
                "address_line1": "Hub 1",
                "city": "Mysore",
                "state": "Karnataka",
                "pincode": "570007"
            },
            "items": [{"sku": "wh/195_89531_bubble_gun_23_hole_assorted_color_at84", "quantity": 1}]
        }, headers={"Idempotency-Key": f"key-{uuid.uuid4()}"})
        order_id = c_res.json()["order_id"]
        order_item_id = c_res.json()["items"][0]["id"]

        # Pay order
        await client.post(f"/api/v1/checkout/orders/{order_id}/pay", json={
            "payment_reference": "UTR-12345"
        })

        # Create physical consignment with AWB
        awb = f"BLUEDART-{uuid.uuid4().hex[:8].upper()}"
        shp_res = await client.post(f"/api/v1/orders/{order_id}/shipments", json={
            "order_id": order_id,
            "carrier_name": "BlueDart",
            "awb_tracking_number": awb,
            "items": [{"order_item_id": order_item_id, "quantity": 1}]
        })
        assert shp_res.status_code == 201

        # Prepare Webhook Payload
        webhook_payload = {
            "awb_tracking_number": awb,
            "carrier_name": "BlueDart",
            "status_code": "OUT_FOR_DELIVERY",
            "status_description": "Courier out for delivery at customer address",
            "location": "Mysore Delivery Station",
            "carrier_timestamp": datetime.now(timezone.utc).isoformat(),
            "metadata": {"courier_name": "Ramesh", "van_number": "KA-09-EA-1167"}
        }
        body_bytes = json.dumps(webhook_payload).encode("utf-8")

        # 1. Missing HMAC signature must be rejected with 401 Unauthorized
        unauth_res = await client.post("/webhooks/logistics/tracking", content=body_bytes)
        assert unauth_res.status_code == 401

        # 2. Valid HMAC signature
        secret_bytes = settings.WEBHOOK_SECRET.encode("utf-8")
        valid_signature = hmac.new(secret_bytes, body_bytes, hashlib.sha256).hexdigest()

        auth_res = await client.post(
            "/webhooks/logistics/tracking",
            content=body_bytes,
            headers={
                "Content-Type": "application/json",
                "X-Carrier-Signature": valid_signature
            }
        )
        assert auth_res.status_code == 200
        webhook_result = auth_res.json()
        assert webhook_result["status"] == "SUCCESS"
        assert webhook_result["order_status"] == "OUT_FOR_DELIVERY"

        # 3. Idempotent Duplicate Webhook Ingestion: Replaying exact carrier event must return DUPLICATE_IGNORED
        auth_dup_res = await client.post(
            "/webhooks/logistics/tracking",
            content=body_bytes,
            headers={
                "Content-Type": "application/json",
                "X-Carrier-Signature": valid_signature
            }
        )
        assert auth_dup_res.status_code == 200
        assert auth_dup_res.json()["status"] == "DUPLICATE_IGNORED"

        # 4. Unknown AWB triggers DLQ Fallback
        unknown_awb_payload = {
            "awb_tracking_number": "UNKNOWN-AWB-99999",
            "carrier_name": "Delhivery",
            "status_code": "IN_TRANSIT",
            "carrier_timestamp": datetime.now(timezone.utc).isoformat(),
            "metadata": {}
        }
        unknown_bytes = json.dumps(unknown_awb_payload).encode("utf-8")
        unknown_sig = hmac.new(secret_bytes, unknown_bytes, hashlib.sha256).hexdigest()

        dlq_res = await client.post(
            "/webhooks/logistics/tracking",
            content=unknown_bytes,
            headers={
                "Content-Type": "application/json",
                "X-Carrier-Signature": unknown_sig
            }
        )
        assert dlq_res.status_code == 200
        assert dlq_res.json()["status"] == "DLQ_STORED"
        assert dlq_res.json()["dlq_id"] is not None
