import enum
import uuid
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, Enum, ForeignKey, JSON, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.connection import Connection
    from app.models.holding import Holding
    from app.models.institution import Institution
    from app.models.transaction import Transaction
    from app.models.user import User


class InvestmentAccountType(str, enum.Enum):
    brokerage = "brokerage"
    ira = "ira"
    roth_ira = "roth_ira"
    k401 = "401k"
    k403b = "403b"
    hsa = "hsa"
    sep_ira = "sep_ira"
    simple_ira = "simple_ira"
    pension = "pension"
    trust = "trust"
    other = "other"


class InvestmentAccount(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "investment_accounts"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    connection_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("connections.id", ondelete="SET NULL"), index=True
    )
    institution_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("institutions.id", ondelete="SET NULL"), index=True
    )
    name: Mapped[str] = mapped_column(String(255))
    account_type: Mapped[InvestmentAccountType] = mapped_column(
        Enum(InvestmentAccountType, values_callable=lambda e: [x.value for x in e]),
    )
    provider_account_id: Mapped[str | None] = mapped_column(String(255))
    balance: Mapped[Decimal] = mapped_column(
        Numeric(precision=14, scale=2), default=Decimal("0.00")
    )
    currency: Mapped[str] = mapped_column(String(3), default="USD")
    is_tax_advantaged: Mapped[bool] = mapped_column(Boolean, default=False)
    is_business: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false")
    capabilities: Mapped[list[str]] = mapped_column(JSON, default=lambda: ["read_only"])

    user: Mapped["User"] = relationship(back_populates="investment_accounts")
    connection: Mapped["Connection | None"] = relationship(
        back_populates="investment_accounts"
    )
    institution: Mapped["Institution | None"] = relationship(
        back_populates="investment_accounts"
    )
    holdings: Mapped[list["Holding"]] = relationship(
        back_populates="account", cascade="all, delete-orphan"
    )
    transactions: Mapped[list["Transaction"]] = relationship(
        back_populates="account", cascade="all, delete-orphan"
    )
