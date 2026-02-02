import enum
import uuid

from sqlalchemy import Enum, ForeignKey, JSON, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class DecisionTraceType(str, enum.Enum):
    recommendation = "recommendation"
    analysis = "analysis"
    action = "action"


class DecisionTrace(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "decision_traces"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    session_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("agent_sessions.id", ondelete="CASCADE"), index=True
    )
    recommendation_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("recommendations.id", ondelete="SET NULL"), nullable=True
    )
    trace_type: Mapped[DecisionTraceType] = mapped_column(
        Enum(DecisionTraceType, values_callable=lambda e: [x.value for x in e]),
        default=DecisionTraceType.recommendation,
    )
    input_data: Mapped[dict] = mapped_column(JSON, default=lambda: {})
    reasoning_steps: Mapped[list] = mapped_column(JSON, default=lambda: [])
    outputs: Mapped[dict] = mapped_column(JSON, default=lambda: {})
    data_freshness: Mapped[dict] = mapped_column(JSON, default=lambda: {})
    warnings: Mapped[list] = mapped_column(JSON, default=lambda: [])
    source: Mapped[str] = mapped_column(String(50), default="advisor")
