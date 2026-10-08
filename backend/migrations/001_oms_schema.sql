-- ============================================================================
-- 1AA Enterprise Order Management System (OMS) Database Migration
-- PostgreSQL 14+ / Supabase Schema
-- Includes:
-- 1. users & products (Core Catalog Integration)
-- 2. user_addresses (Mutable User Address Book)
-- 3. order_addresses (Immutable Checkout Snapshot)
-- 4. orders (Order Header, Financials, Idempotency, FSM Status)
-- 5. order_items (SKU Line Item Snapshot with 18% GST)
-- 6. shipments (Physical Consignments, Carrier AWB)
-- 7. shipment_items (Multi-Parcel Split-Fulfillment Mapping)
-- 8. shipment_tracking_events (Idempotent 3PL Webhook Ledger with JSONB)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. BASE TABLES: USERS & PRODUCTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'BUYER',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(100) PRIMARY KEY, -- SKU / Catalog ID
    sku VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    base_cost NUMERIC(12, 2) NOT NULL,
    price NUMERIC(12, 2) NOT NULL,
    market_price NUMERIC(12, 2),
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    hsn_code VARCHAR(20) DEFAULT '9503',
    tax_rate NUMERIC(5, 2) DEFAULT 18.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 2. USER ADDRESSES (Mutable Customer Address Book)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipient_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    landmark VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    country VARCHAR(10) DEFAULT 'IN',
    address_type VARCHAR(20) DEFAULT 'WAREHOUSE', -- HOME, SHOP, WAREHOUSE, OFFICE
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id ON user_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_addresses_pincode ON user_addresses(pincode);

-- ----------------------------------------------------------------------------
-- 3. ORDERS (Header, Financials, Idempotency, FSM State)
-- ----------------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE order_status_enum AS ENUM (
        'PENDING_PAYMENT',
        'PAID',
        'PROCESSING',
        'PARTIALLY_SHIPPED',
        'SHIPPED',
        'OUT_FOR_DELIVERY',
        'DELIVERED',
        'CANCELLED',
        'REFUNDED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id),
    idempotency_key VARCHAR(255) UNIQUE NOT NULL,
    status order_status_enum NOT NULL DEFAULT 'PENDING_PAYMENT',
    currency VARCHAR(3) NOT NULL DEFAULT 'INR',
    subtotal_amount NUMERIC(12, 2) NOT NULL,
    discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    tax_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00, -- Dynamic 18% GST
    shipping_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(12, 2) NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'UPI',
    payment_reference VARCHAR(100), -- UPI UTR / Transaction ID
    payment_authorized_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_idempotency ON orders(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- ----------------------------------------------------------------------------
-- 4. ORDER ADDRESSES (Immutable Snapshot at Checkout)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    address_type VARCHAR(20) NOT NULL, -- 'SHIPPING' or 'BILLING'
    recipient_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    landmark VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    country VARCHAR(10) DEFAULT 'IN',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_addresses_order_id ON order_addresses(order_id);

-- ----------------------------------------------------------------------------
-- 5. ORDER ITEMS (SKU Line Item Snapshot with Dynamic Tax)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id VARCHAR(100) NOT NULL REFERENCES products(id),
    sku VARCHAR(100) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12, 2) NOT NULL,
    tax_rate NUMERIC(5, 2) NOT NULL DEFAULT 18.00,
    tax_amount NUMERIC(12, 2) NOT NULL,
    total_item_amount NUMERIC(12, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_sku ON order_items(sku);

-- ----------------------------------------------------------------------------
-- 6. SHIPMENTS (Physical Consignments & 3PL AWB Tracking)
-- ----------------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE shipment_status_enum AS ENUM (
        'MANIFESTED',
        'PICKED_UP',
        'IN_TRANSIT',
        'OUT_FOR_DELIVERY',
        'DELIVERED',
        'FAILED_ATTEMPT',
        'RTO'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS shipments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shipment_number VARCHAR(50) UNIQUE NOT NULL,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    carrier_name VARCHAR(100) NOT NULL, -- BlueDart, Delhivery, DTDC, Shadowfax
    awb_tracking_number VARCHAR(100) UNIQUE NOT NULL,
    status shipment_status_enum NOT NULL DEFAULT 'MANIFESTED',
    shipped_at TIMESTAMPTZ,
    estimated_delivery_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    shipping_label_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shipments_order_id ON shipments(order_id);
CREATE INDEX IF NOT EXISTS idx_shipments_awb ON shipments(awb_tracking_number);
CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status);

-- ----------------------------------------------------------------------------
-- 7. SHIPMENT ITEMS (Split-Fulfillment Mapping: Order Item to Consignment)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS shipment_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shipment_id UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
    order_item_id UUID NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shipment_items_shipment_id ON shipment_items(shipment_id);
CREATE INDEX IF NOT EXISTS idx_shipment_items_order_item_id ON shipment_items(order_item_id);

-- ----------------------------------------------------------------------------
-- 8. SHIPMENT TRACKING EVENTS (3PL Webhook Ingestion Ledger with JSONB)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS shipment_tracking_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shipment_id UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
    carrier_name VARCHAR(100) NOT NULL,
    status_code VARCHAR(50) NOT NULL,
    status_description TEXT,
    location VARCHAR(255),
    carrier_timestamp TIMESTAMPTZ NOT NULL,
    raw_payload JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Crucial: Unique constraint ensures idempotent webhook ingestion
    CONSTRAINT uq_shipment_tracking_event UNIQUE (shipment_id, status_code, carrier_timestamp)
);

CREATE INDEX IF NOT EXISTS idx_tracking_events_shipment_id ON shipment_tracking_events(shipment_id);
CREATE INDEX IF NOT EXISTS idx_tracking_events_timestamp ON shipment_tracking_events(carrier_timestamp DESC);
