import enum
import uuid
from decimal import Decimal
from datetime import datetime

from sqlalchemy import Enum, ForeignKey, Numeric, String, DateTime
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class ValuationType(str, enum.Enum):
    manual = "manual"
    auto = "auto"


class RealEstateType(str, enum.Enum):
    primary_residence = "primary_residence"
    investment_property = "investment_property"
    vacation_home = "vacation_home"
    commercial = "commercial"
    land = "land"


class VehicleType(str, enum.Enum):
    car = "car"
    motorcycle = "motorcycle"
    boat = "boat"
    aircraft = "aircraft"
    other = "other"


class CollectibleType(str, enum.Enum):
    art = "art"
    watch = "watch"
    handbag = "handbag"
    jewelry = "jewelry"
    wine = "wine"
    card = "card"  # Sports/Trading cards
    other = "other"


class MetalType(str, enum.Enum):
    gold = "gold"
    silver = "silver"
    platinum = "platinum"
    palladium = "palladium"


class RealEstateAsset(UUIDPrimaryKeyMixin, TimestampMixin, Base)
:
    __tablename__ = "real_estate_assets"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    name: Mapped[str] = mapped_column(String(255))
    address: Mapped[str] = mapped_column(String(512))
    city: Mapped[str | None] = mapped_column(String(255))
    state: Mapped[str | None] = mapped_column(String(2))
    zip_code: Mapped[str | None] = mapped_column(String(20))
    
    property_type: Mapped[RealEstateType] = mapped_column(
        Enum(RealEstateType, values_callable=lambda e: [x.value for x in e]),
        default=RealEstateType.primary_residence,
    )
    
    valuation_type: Mapped[ValuationType] = mapped_column(
        Enum(ValuationType, values_callable=lambda e: [x.value for x in e]),
        default=ValuationType.manual,
    )
    
    # Current estimated value
    market_value: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=0)
    purchase_price: Mapped[Decimal | None] = mapped_column(Numeric(14, 2))
    purchase_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    
    # Auto-valuation metadata
    zillow_zpid: Mapped[str | None] = mapped_column(String(100))
    last_valuation_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    
    # Optional mortgage link (if we want to automate debt-to-asset mapping)
    # mortgage_account_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("debt_accounts.id"))


class VehicleAsset(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "vehicle_assets"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    name: Mapped[str] = mapped_column(String(255))
    make: Mapped[str] = mapped_column(String(100))
    model: Mapped[str] = mapped_column(String(100))
    year: Mapped[int] = mapped_column()
    vin: Mapped[str | None] = mapped_column(String(17))
    mileage: Mapped[int | None] = mapped_column()
    
    vehicle_type: Mapped[VehicleType] = mapped_column(
        Enum(VehicleType, values_callable=lambda e: [x.value for x in e]),
        default=VehicleType.car,
    )
    
    valuation_type: Mapped[ValuationType] = mapped_column(
        Enum(ValuationType, values_callable=lambda e: [x.value for x in e]),
        default=ValuationType.manual,
    )
    
    market_value: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=0)
    purchase_price: Mapped[Decimal | None] = mapped_column(Numeric(14, 2))
    purchase_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    
    last_valuation_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class CollectibleAsset(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "collectible_assets"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    name: Mapped[str] = mapped_column(String(255))
    item_type: Mapped[CollectibleType] = mapped_column(
        Enum(CollectibleType, values_callable=lambda e: [x.value for x in e]),
        default=CollectibleType.other,
    )
    
    # Valuation metadata
    valuation_type: Mapped[ValuationType] = mapped_column(
        Enum(ValuationType, values_callable=lambda e: [x.value for x in e]),
        default=ValuationType.manual,
    )
    
    market_value: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=0)
    purchase_price: Mapped[Decimal | None] = mapped_column(Numeric(14, 2))
    purchase_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    
    # Optional metadata (JSON for flexible tracking: condition, serial, etc)
    metadata_json: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    last_valuation_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class PreciousMetalAsset(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "precious_metal_assets"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    name: Mapped[str] = mapped_column(String(255))
    metal_type: Mapped[MetalType] = mapped_column(
        Enum(MetalType, values_callable=lambda e: [x.value for x in e]),
    )
    
    weight_oz: Mapped[Decimal] = mapped_column(Numeric(14, 4))
    
    # Usually auto for metals based on spot price
    valuation_type: Mapped[ValuationType] = mapped_column(
        Enum(ValuationType, values_callable=lambda e: [x.value for x in e]),
        default=ValuationType.auto,
    )
    
    market_value: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=0)
    last_valuation_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
