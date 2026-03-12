import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field

from app.models.recommendation_review import (
    RecommendationReviewStatus,
    RecommendationReviewType,
)
from app.schemas.correction import FinancialCorrectionCreate


class RecommendationReviewCreate(BaseModel):
    decision_trace_id: uuid.UUID
    recommendation_id: uuid.UUID | None = None
    review_type: RecommendationReviewType = RecommendationReviewType.user_dispute
    opened_reason: str


class RecommendationReviewResolve(BaseModel):
    status: RecommendationReviewStatus
    resolution: str
    resolution_notes: str | None = None
    reviewer_label: str | None = None
    applied_changes: dict[str, Any] = Field(default_factory=dict)


class RecommendationReviewConvertToCorrection(BaseModel):
    correction: FinancialCorrectionCreate
    reviewer_label: str | None = None
    resolution_notes: str | None = None


class RecommendationReviewResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    decision_trace_id: uuid.UUID
    recommendation_id: uuid.UUID | None
    review_type: RecommendationReviewType
    status: RecommendationReviewStatus
    opened_reason: str
    resolution: str | None
    resolution_notes: str | None
    applied_changes: dict[str, Any]
    reviewer_label: str | None
    resolved_at: datetime | None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
