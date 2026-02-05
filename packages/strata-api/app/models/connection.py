import enum
import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Enum, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from app.db.types import EncryptedJSON

if TYPE_CHECKING:
    from app.models.cash_account import CashAccount
    from app.models.institution import Institution
    from app.models.investment_account import InvestmentAccount
    from app.models.user import User


class ConnectionStatus(str, enum.Enum):
    active = "active"
    inactive = "inactive"
    error = "error"
    pending = "pending"


class Connection(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "connections"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    institution_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("institutions.id", ondelete="SET NULL"), index=True
    )
    provider: Mapped[str] = mapped_column(String(100))
    provider_user_id: Mapped[str] = mapped_column(String(255))
    credentials: Mapped[dict | None] = mapped_column(EncryptedJSON)
    status: Mapped[ConnectionStatus] = mapped_column(
        Enum(ConnectionStatus, values_callable=lambda e: [x.value for x in e]),
        default=ConnectionStatus.pending,
    )
    last_synced_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    error_code: Mapped[str | None] = mapped_column(String(50))
    error_message: Mapped[str | None] = mapped_column(String(1000))

    user: Mapped["User"] = relationship(back_populates="connections")
    institution: Mapped["Institution | None"] = relationship(
        back_populates="connections"
    )
    investment_accounts: Mapped[list["InvestmentAccount"]] = relationship(
        back_populates="connection"
    )
    cash_accounts: Mapped[list["CashAccount"]] = relationship(
        back_populates="connection"
    )
