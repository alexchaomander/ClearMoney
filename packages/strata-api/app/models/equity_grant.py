import enum
import uuid
from datetime import date
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import JSON, Date, Enum, ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.user import User


class EquityGrantType(str, enum.Enum):
    rsu = "rsu"
    iso = "iso"
    nso = "nso"
    restricted_stock = "restricted_stock"
    phantom_stock = "phantom_stock"
    safe = "safe"
    convertible_note = "convertible_note"
    founder_stock = "founder_stock"


class EquityGrant(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "equity_grants"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    symbol: Mapped[str | None] = mapped_column(String(20), index=True, nullable=True)
    company_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    grant_name: Mapped[str] = mapped_column(String(255))
    grant_type: Mapped[EquityGrantType] = mapped_column(
        Enum(EquityGrantType, values_callable=lambda e: [x.value for x in e]),
    )
    quantity: Mapped[Decimal] = mapped_column(
        Numeric(precision=18, scale=6), default=Decimal("0.00")
    )
    strike_price: Mapped[Decimal | None] = mapped_column(
        Numeric(precision=14, scale=4), default=None
    )
    grant_date: Mapped[date] = mapped_column(Date)

    # Cap Table Specific Fields
    valuation_cap: Mapped[Decimal | None] = mapped_column(Numeric(18, 2), default=None)
    discount_rate: Mapped[Decimal | None] = mapped_column(Numeric(5, 4), default=None)
    amount_invested: Mapped[Decimal | None] = mapped_column(
        Numeric(18, 2), default=None
    )

    # JSON-based vesting schedule
    # Format: [{"date": "2024-01-01", "quantity": 100}, ...]
    vesting_schedule: Mapped[list[dict] | None] = mapped_column(JSON, nullable=True)

    # Metadata and overrides
    notes: Mapped[str | None] = mapped_column(String(1000), nullable=True)

    user: Mapped["User"] = relationship(back_populates="equity_grants")
