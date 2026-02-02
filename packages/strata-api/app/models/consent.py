import enum
import uuid

from sqlalchemy import Enum, ForeignKey, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class ConsentStatus(str, enum.Enum):
    active = "active"
    revoked = "revoked"
    expired = "expired"


class ConsentGrant(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "consent_grants"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    scopes: Mapped[list[str]] = mapped_column(JSON, default=lambda: [])
    purpose: Mapped[str] = mapped_column(Text)
    status: Mapped[ConsentStatus] = mapped_column(
        Enum(ConsentStatus, values_callable=lambda e: [x.value for x in e]),
        default=ConsentStatus.active,
    )
    source: Mapped[str] = mapped_column(String(50), default="api")
