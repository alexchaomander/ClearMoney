import enum
import uuid
from datetime import datetime

from sqlalchemy import JSON, DateTime, Enum, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class RecommendationReviewType(str, enum.Enum):
    user_dispute = "user_dispute"
    outdated = "outdated"
    human_review = "human_review"
    context_block = "context_block"
    factual_followup = "factual_followup"


class RecommendationReviewStatus(str, enum.Enum):
    open = "open"
    resolved = "resolved"
    dismissed = "dismissed"
    converted_to_correction = "converted_to_correction"
    superseded = "superseded"
    blocked = "blocked"


class RecommendationReview(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "recommendation_reviews"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    decision_trace_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("decision_traces.id", ondelete="CASCADE"), index=True
    )
    recommendation_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("recommendations.id", ondelete="SET NULL"), nullable=True, index=True
    )
    review_type: Mapped[RecommendationReviewType] = mapped_column(
        Enum(RecommendationReviewType, values_callable=lambda e: [x.value for x in e]),
        default=RecommendationReviewType.user_dispute,
    )
    status: Mapped[RecommendationReviewStatus] = mapped_column(
        Enum(
            RecommendationReviewStatus, values_callable=lambda e: [x.value for x in e]
        ),
        default=RecommendationReviewStatus.open,
        index=True,
    )
    opened_reason: Mapped[str] = mapped_column(Text)
    resolution: Mapped[str | None] = mapped_column(String(255), nullable=True)
    resolution_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    applied_changes: Mapped[dict] = mapped_column(JSON, default=lambda: {})
    reviewer_label: Mapped[str | None] = mapped_column(String(255), nullable=True)
    resolved_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
