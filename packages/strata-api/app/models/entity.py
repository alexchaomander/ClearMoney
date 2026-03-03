import enum
import uuid
from typing import TYPE_CHECKING

from sqlalchemy import Enum, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.cash_account import CashAccount
    from app.models.debt_account import DebtAccount
    from app.models.investment_account import InvestmentAccount
    from app.models.user import User

class EntityType(str, enum.Enum):
    personal = "personal"
    c_corp = "c_corp"
    llc = "llc"
    spv = "spv"
    trust = "trust"

class LegalEntity(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "entities"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    name: Mapped[str] = mapped_column(String(255))
    entity_type: Mapped[EntityType] = mapped_column(
        Enum(EntityType, values_callable=lambda e: [x.value for x in e]),
        default=EntityType.personal,
        server_default="personal"
    )

    user: Mapped["User"] = relationship(back_populates="entities")
    cash_accounts: Mapped[list["CashAccount"]] = relationship(
        back_populates="entity", cascade="all, delete-orphan"
    )
    debt_accounts: Mapped[list["DebtAccount"]] = relationship(
        back_populates="entity", cascade="all, delete-orphan"
    )
    investment_accounts: Mapped[list["InvestmentAccount"]] = relationship(
        back_populates="entity", cascade="all, delete-orphan"
    )