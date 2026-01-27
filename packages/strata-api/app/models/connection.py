import enum
import uuid
from typing import TYPE_CHECKING

from sqlalchemy import Enum, ForeignKey, String
from sqlalchemy.dialects.postgresql import JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
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
    provider: Mapped[str] = mapped_column(String(100))
    provider_user_id: Mapped[str] = mapped_column(String(255))
    credentials: Mapped[dict | None] = mapped_column(JSON)
    status: Mapped[ConnectionStatus] = mapped_column(
        Enum(ConnectionStatus, values_callable=lambda e: [x.value for x in e]),
        default=ConnectionStatus.pending,
    )

    user: Mapped["User"] = relationship(back_populates="connections")
