import enum
import uuid

from sqlalchemy import JSON, Enum, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class ActionApprovalStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"


class ActionApproval(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "action_approvals"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    action_type: Mapped[str] = mapped_column(String(100))
    payload: Mapped[dict] = mapped_column(JSON, default=lambda: {})
    status: Mapped[ActionApprovalStatus] = mapped_column(
        Enum(ActionApprovalStatus, values_callable=lambda e: [x.value for x in e]),
        default=ActionApprovalStatus.pending,
    )
