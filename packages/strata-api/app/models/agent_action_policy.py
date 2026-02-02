import enum
import uuid

from sqlalchemy import Enum, ForeignKey, JSON, Numeric
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class ActionPolicyStatus(str, enum.Enum):
    active = "active"
    inactive = "inactive"


class AgentActionPolicy(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "agent_action_policies"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    allowed_actions: Mapped[list[str]] = mapped_column(JSON, default=lambda: [])
    max_amount: Mapped[float | None] = mapped_column(Numeric(18, 2), nullable=True)
    require_confirmation: Mapped[bool] = mapped_column(default=True)
    status: Mapped[ActionPolicyStatus] = mapped_column(
        Enum(ActionPolicyStatus, values_callable=lambda e: [x.value for x in e]),
        default=ActionPolicyStatus.active,
    )
