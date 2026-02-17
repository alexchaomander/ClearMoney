import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import (
    JSON,
    Boolean,
    Date,
    DateTime,
    ForeignKey,
    Numeric,
    String,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.cash_account import CashAccount


class BankTransaction(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """Bank transaction from a linked banking provider (e.g., Plaid)."""

    __tablename__ = "bank_transactions"
    __table_args__ = (
        UniqueConstraint(
            "cash_account_id",
            "provider_transaction_id",
            name="uq_bank_tx_account_provider",
        ),
    )

    cash_account_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("cash_accounts.id", ondelete="CASCADE"), index=True
    )
    provider_transaction_id: Mapped[str] = mapped_column(String(255))

    # Transaction data
    amount: Mapped[Decimal] = mapped_column(
        Numeric(precision=14, scale=2)
    )  # Negative=debit, Positive=credit
    transaction_date: Mapped[date] = mapped_column(Date, index=True)
    posted_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    name: Mapped[str] = mapped_column(String(500))

    # Categorization (leverage Plaid's categories)
    primary_category: Mapped[str | None] = mapped_column(String(100), index=True)
    detailed_category: Mapped[str | None] = mapped_column(String(100))
    plaid_category: Mapped[list | None] = mapped_column(JSON, nullable=True)

    # Metadata
    merchant_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    payment_channel: Mapped[str | None] = mapped_column(String(50), nullable=True)
    pending: Mapped[bool] = mapped_column(Boolean, default=False)
    iso_currency_code: Mapped[str] = mapped_column(String(3), default="USD")

    # User annotations for bookkeeping workflows.
    reimbursed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    reimbursement_memo: Mapped[str | None] = mapped_column(String(500), nullable=True)
    is_commingled: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false")

    # Relationships
    cash_account: Mapped["CashAccount"] = relationship(back_populates="transactions")
