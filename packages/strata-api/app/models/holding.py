import uuid
from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.investment_account import InvestmentAccount
    from app.models.security import Security


class Holding(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "holdings"

    account_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("investment_accounts.id", ondelete="CASCADE"), index=True
    )
    security_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("securities.id", ondelete="CASCADE"), index=True
    )
    quantity: Mapped[Decimal] = mapped_column(Numeric(precision=18, scale=8))
    cost_basis: Mapped[Decimal | None] = mapped_column(Numeric(precision=14, scale=2))
    market_value: Mapped[Decimal | None] = mapped_column(Numeric(precision=14, scale=2))
    as_of: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    account: Mapped["InvestmentAccount"] = relationship(back_populates="holdings")
    security: Mapped["Security"] = relationship(back_populates="holdings")
