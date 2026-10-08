import uuid
import enum
from datetime import datetime, timezone
from sqlalchemy import String, DateTime, Integer, ForeignKey, Text, JSON, Enum as SQLEnum, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from backend.core.database import Base

class ShipmentStatus(str, enum.Enum):
    MANIFESTED = "MANIFESTED"
    PICKED_UP = "PICKED_UP"
    IN_TRANSIT = "IN_TRANSIT"
    OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY"
    DELIVERED = "DELIVERED"
    FAILED_ATTEMPT = "FAILED_ATTEMPT"
    RTO = "RTO"

class Shipment(Base):
    __tablename__ = "shipments"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )
    shipment_number: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    order_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("orders.id", ondelete="CASCADE"),
        index=True,
        nullable=False
    )
    carrier_name: Mapped[str] = mapped_column(String(100), nullable=False) # BlueDart, Delhivery, DTDC
    awb_tracking_number: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    status: Mapped[ShipmentStatus] = mapped_column(
        SQLEnum(ShipmentStatus, name="shipment_status_enum", native_enum=False),
        default=ShipmentStatus.MANIFESTED,
        nullable=False,
        index=True
    )
    shipped_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    estimated_delivery_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    delivered_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    shipping_label_url: Mapped[str] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    # Relationships
    order = relationship("Order", back_populates="shipments", lazy="selectin")
    items = relationship("ShipmentItem", back_populates="shipment", cascade="all, delete-orphan", lazy="selectin")
    tracking_events = relationship("ShipmentTrackingEvent", back_populates="shipment", cascade="all, delete-orphan", lazy="selectin")


class ShipmentItem(Base):
    """Enables multi-parcel split fulfillment where line items or portions thereof are shipped separately."""
    __tablename__ = "shipment_items"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )
    shipment_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("shipments.id", ondelete="CASCADE"),
        index=True,
        nullable=False
    )
    order_item_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("order_items.id", ondelete="CASCADE"),
        index=True,
        nullable=False
    )
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    # Relationships
    shipment = relationship("Shipment", back_populates="items", lazy="selectin")
    order_item = relationship("OrderItem", back_populates="shipment_items", lazy="selectin")


class ShipmentTrackingEvent(Base):
    """Immutable audit ledger of 3PL tracking webhooks with JSONB payload."""
    __tablename__ = "shipment_tracking_events"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )
    shipment_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("shipments.id", ondelete="CASCADE"),
        index=True,
        nullable=False
    )
    carrier_name: Mapped[str] = mapped_column(String(100), nullable=False)
    status_code: Mapped[str] = mapped_column(String(50), nullable=False)
    status_description: Mapped[str] = mapped_column(Text, nullable=True)
    location: Mapped[str] = mapped_column(String(255), nullable=True)
    carrier_timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    raw_payload: Mapped[dict] = mapped_column(JSON, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        index=True
    )

    __table_args__ = (
        UniqueConstraint(
            "shipment_id",
            "status_code",
            "carrier_timestamp",
            name="uq_shipment_tracking_event"
        ),
    )

    # Relationships
    shipment = relationship("Shipment", back_populates="tracking_events", lazy="selectin")
