import enum
import uuid

from sqlalchemy import Enum, ForeignKey, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class SessionStatus(str, enum.Enum):
    active = "active"
    completed = "completed"
    paused = "paused"


class RecommendationStatus(str, enum.Enum):
    pending = "pending"
    accepted = "accepted"
    dismissed = "dismissed"


class AgentSession(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "agent_sessions"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    skill_name: Mapped[str | None] = mapped_column(String(100), default=None)
    status: Mapped[SessionStatus] = mapped_column(
        Enum(SessionStatus, values_callable=lambda e: [x.value for x in e]),
        default=SessionStatus.active,
    )
    messages: Mapped[list] = mapped_column(JSON, default=lambda: [])


class Recommendation(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "recommendations"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    session_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("agent_sessions.id", ondelete="CASCADE")
    )
    skill_name: Mapped[str] = mapped_column(String(100))
    title: Mapped[str] = mapped_column(String(500))
    summary: Mapped[str] = mapped_column(Text)
    details: Mapped[dict] = mapped_column(JSON, default=lambda: {})
    status: Mapped[RecommendationStatus] = mapped_column(
        Enum(RecommendationStatus, values_callable=lambda e: [x.value for x in e]),
        default=RecommendationStatus.pending,
    )
