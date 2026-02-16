import enum
import uuid
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, Enum, ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.user import User


class DebtType(str, enum.Enum):
    credit_card = "credit_card"
    student_loan = "student_loan"
    mortgage = "mortgage"
    auto_loan = "auto_loan"
    personal_loan = "personal_loan"
    medical = "medical"
    other = "other"


class DebtAccount(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "debt_accounts"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    name: Mapped[str] = mapped_column(String(255))
    debt_type: Mapped[DebtType] = mapped_column(
        Enum(DebtType, values_callable=lambda e: [x.value for x in e]),
    )
    balance: Mapped[Decimal] = mapped_column(
        Numeric(precision=14, scale=2), default=Decimal("0.00")
    )
    interest_rate: Mapped[Decimal] = mapped_column(Numeric(precision=6, scale=4))
    minimum_payment: Mapped[Decimal] = mapped_column(
        Numeric(precision=14, scale=2), default=Decimal("0.00")
    )
    institution_name: Mapped[str | None] = mapped_column(String(255))
    is_business: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false")

    user: Mapped["User"] = relationship(back_populates="debt_accounts")
