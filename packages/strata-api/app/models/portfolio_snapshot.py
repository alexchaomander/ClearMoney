import uuid
from datetime import date
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import Date, ForeignKey, Numeric, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.user import User


class PortfolioSnapshot(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "portfolio_snapshots"
    __table_args__ = (
        UniqueConstraint("user_id", "snapshot_date", name="uq_portfolio_snapshot_user_date"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    snapshot_date: Mapped[date] = mapped_column(Date, index=True)
    net_worth: Mapped[Decimal] = mapped_column(
        Numeric(precision=14, scale=2), default=Decimal("0.00")
    )
    total_investment_value: Mapped[Decimal] = mapped_column(
        Numeric(precision=14, scale=2), default=Decimal("0.00")
    )
    total_cash_value: Mapped[Decimal] = mapped_column(
        Numeric(precision=14, scale=2), default=Decimal("0.00")
    )
    total_debt_value: Mapped[Decimal] = mapped_column(
        Numeric(precision=14, scale=2), default=Decimal("0.00")
    )

    user: Mapped["User"] = relationship(back_populates="portfolio_snapshots")
