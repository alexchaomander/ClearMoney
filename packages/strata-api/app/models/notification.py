import enum
import uuid
from datetime import datetime

from sqlalchemy import Enum, ForeignKey, JSON, String, Boolean
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class NotificationType(str, enum.Enum):
    low_emergency_fund = "low_emergency_fund"
    tax_loss_harvesting = "tax_loss_harvesting"
    data_stale = "data_stale"
    sync_failure = "sync_failure"
    policy_breach = "policy_breach"
    general = "general"


class NotificationSeverity(str, enum.Enum):
    info = "info"
    warning = "warning"
    critical = "critical"


class Notification(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "notifications"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    type: Mapped[NotificationType] = mapped_column(
        Enum(NotificationType, values_callable=lambda e: [x.value for x in e]),
        default=NotificationType.general,
    )
    severity: Mapped[NotificationSeverity] = mapped_column(
        Enum(NotificationSeverity, values_callable=lambda e: [x.value for x in e]),
        default=NotificationSeverity.info,
    )
    title: Mapped[str] = mapped_column(String(200))
    message: Mapped[str] = mapped_column(String(500))
    metadata_json: Mapped[dict | None] = mapped_column(JSON, nullable=True, default=None)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)
    action_url: Mapped[str | None] = mapped_column(String(200), nullable=True)
