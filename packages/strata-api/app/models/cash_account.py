import enum
import uuid
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import Enum, ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.user import User


class CashAccountType(str, enum.Enum):
    checking = "checking"
    savings = "savings"
    money_market = "money_market"
    cd = "cd"
    other = "other"


class CashAccount(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "cash_accounts"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    name: Mapped[str] = mapped_column(String(255))
    account_type: Mapped[CashAccountType] = mapped_column(
        Enum(CashAccountType, values_callable=lambda e: [x.value for x in e]),
    )
    balance: Mapped[Decimal] = mapped_column(
        Numeric(precision=14, scale=2), default=Decimal("0.00")
    )
    apy: Mapped[Decimal | None] = mapped_column(Numeric(precision=6, scale=4))
    institution_name: Mapped[str | None] = mapped_column(String(255))

    user: Mapped["User"] = relationship(back_populates="cash_accounts")
