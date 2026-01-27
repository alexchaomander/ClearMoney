import enum
import uuid
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import Enum, ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.user import User


class IncomeSourceType(str, enum.Enum):
    salary = "salary"
    hourly = "hourly"
    freelance = "freelance"
    investment = "investment"
    rental = "rental"
    other = "other"


class IncomeFrequency(str, enum.Enum):
    weekly = "weekly"
    biweekly = "biweekly"
    semimonthly = "semimonthly"
    monthly = "monthly"
    quarterly = "quarterly"
    annually = "annually"


class IncomeSource(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "income_sources"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    name: Mapped[str] = mapped_column(String(255))
    source_type: Mapped[IncomeSourceType] = mapped_column(
        Enum(IncomeSourceType, values_callable=lambda e: [x.value for x in e]),
    )
    amount: Mapped[Decimal] = mapped_column(Numeric(precision=14, scale=2))
    frequency: Mapped[IncomeFrequency] = mapped_column(
        Enum(IncomeFrequency, values_callable=lambda e: [x.value for x in e]),
    )
    is_variable: Mapped[bool] = mapped_column(default=False)

    user: Mapped["User"] = relationship(back_populates="income_sources")
