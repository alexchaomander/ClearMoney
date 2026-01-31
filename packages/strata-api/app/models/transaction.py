import enum
import uuid
from datetime import date
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import Date, Enum, ForeignKey, Numeric, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.investment_account import InvestmentAccount
    from app.models.security import Security


class TransactionType(str, enum.Enum):
    buy = "buy"
    sell = "sell"
    dividend = "dividend"
    interest = "interest"
    fee = "fee"
    transfer = "transfer"
    other = "other"


class Transaction(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "transactions"
    __table_args__ = (
        UniqueConstraint("account_id", "provider_transaction_id", name="uq_transaction_account_provider_id"),
    )

    account_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("investment_accounts.id", ondelete="CASCADE"), index=True
    )
    security_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("securities.id", ondelete="SET NULL"), index=True
    )
    provider_transaction_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    type: Mapped[TransactionType] = mapped_column(
        Enum(TransactionType, values_callable=lambda e: [x.value for x in e]),
        default=TransactionType.other,
    )
    quantity: Mapped[Decimal | None] = mapped_column(
        Numeric(precision=18, scale=8), nullable=True
    )
    price: Mapped[Decimal | None] = mapped_column(
        Numeric(precision=14, scale=4), nullable=True
    )
    amount: Mapped[Decimal | None] = mapped_column(
        Numeric(precision=14, scale=2), nullable=True
    )
    trade_date: Mapped[date | None] = mapped_column(Date, index=True, nullable=True)
    settlement_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    currency: Mapped[str] = mapped_column(String(3), default="USD")
    description: Mapped[str | None] = mapped_column(String(500), nullable=True)
    source: Mapped[str | None] = mapped_column(String(100), nullable=True)

    account: Mapped["InvestmentAccount"] = relationship(back_populates="transactions")
    security: Mapped["Security | None"] = relationship(back_populates="transactions")
