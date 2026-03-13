from __future__ import annotations

import uuid
from datetime import datetime, timezone

from fastapi import HTTPException
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.agent_session import Recommendation
from app.models.decision_trace import DecisionTrace
from app.models.recommendation_review import (
    RecommendationReview,
    RecommendationReviewStatus,
)
from app.schemas.recommendation_review import (
    RecommendationReviewConvertToCorrection,
    RecommendationReviewCreate,
    RecommendationReviewResolve,
)
from app.services.corrections import CorrectionService


class RecommendationReviewService:
    def __init__(self, session: AsyncSession):
        self._session = session

    async def create_review(
        self,
        user_id: uuid.UUID,
        payload: RecommendationReviewCreate,
    ) -> RecommendationReview:
        trace = await self._get_trace(user_id, payload.decision_trace_id)
        trace_type = trace.trace_type.value if hasattr(trace.trace_type, "value") else str(trace.trace_type)
        if trace_type == "action":
            raise HTTPException(
                status_code=400,
                detail="Recommendation reviews are only supported for analysis and recommendation traces",
            )
        recommendation_id = payload.recommendation_id or trace.recommendation_id
        if recommendation_id is not None:
            await self._get_recommendation(user_id, recommendation_id)

        review = RecommendationReview(
            user_id=user_id,
            decision_trace_id=trace.id,
            recommendation_id=recommendation_id,
            review_type=payload.review_type,
            opened_reason=payload.opened_reason,
            applied_changes={},
        )
        self._session.add(review)
        await self._session.commit()
        await self._session.refresh(review)
        return review

    async def list_reviews(
        self,
        user_id: uuid.UUID,
        *,
        status: RecommendationReviewStatus | None = None,
        recommendation_id: uuid.UUID | None = None,
        decision_trace_id: uuid.UUID | None = None,
    ) -> list[RecommendationReview]:
        query = select(RecommendationReview).where(RecommendationReview.user_id == user_id)
        if status is not None:
            query = query.where(RecommendationReview.status == status)
        if recommendation_id is not None:
            query = query.where(RecommendationReview.recommendation_id == recommendation_id)
        if decision_trace_id is not None:
            query = query.where(RecommendationReview.decision_trace_id == decision_trace_id)
        result = await self._session.execute(query.order_by(RecommendationReview.created_at.desc()))
        return list(result.scalars().all())

    async def open_review_count(self, user_id: uuid.UUID) -> int:
        result = await self._session.execute(
            select(func.count()).select_from(RecommendationReview).where(
                RecommendationReview.user_id == user_id,
                RecommendationReview.status == RecommendationReviewStatus.open,
            )
        )
        return int(result.scalar_one())

    async def has_open_review_for_recommendation_title(
        self,
        user_id: uuid.UUID,
        title: str,
    ) -> bool:
        normalized_title = title.strip().lower()
        if not normalized_title:
            return False
        result = await self._session.execute(
            select(Recommendation.title)
            .select_from(RecommendationReview)
            .join(
                Recommendation,
                Recommendation.id == RecommendationReview.recommendation_id,
            )
            .where(
                RecommendationReview.user_id == user_id,
                RecommendationReview.status == RecommendationReviewStatus.open,
            )
        )
        for candidate in result.scalars().all():
            if candidate and candidate.strip().lower() == normalized_title:
                return True
        return False

    async def resolve_review(
        self,
        user_id: uuid.UUID,
        review_id: uuid.UUID,
        payload: RecommendationReviewResolve,
    ) -> RecommendationReview:
        review = await self._get_review(user_id, review_id)
        review.status = payload.status
        review.resolution = payload.resolution
        review.resolution_notes = payload.resolution_notes
        review.reviewer_label = payload.reviewer_label
        review.applied_changes = payload.applied_changes
        review.resolved_at = datetime.now(timezone.utc)
        await self._session.commit()
        await self._session.refresh(review)
        return review

    async def convert_to_correction(
        self,
        user_id: uuid.UUID,
        review_id: uuid.UUID,
        payload: RecommendationReviewConvertToCorrection,
    ) -> RecommendationReview:
        review = await self._get_review(user_id, review_id)
        if review.status != RecommendationReviewStatus.open:
            raise HTTPException(status_code=409, detail="Only open recommendation reviews can be converted")
        correction_payload = payload.correction.model_copy(deep=True)
        if correction_payload.trace_id is None:
            correction_payload.trace_id = review.decision_trace_id
        if correction_payload.metric_id is None and review.recommendation_id is not None:
            correction_payload.metric_id = "recommendationReview"

        correction = await CorrectionService(self._session).create_correction(user_id, correction_payload)
        review.status = RecommendationReviewStatus.converted_to_correction
        review.resolution = "converted_to_correction"
        review.resolution_notes = payload.resolution_notes
        review.reviewer_label = payload.reviewer_label
        review.applied_changes = {
            "correction_id": str(correction.id),
            "correction_status": correction.status.value if hasattr(correction.status, "value") else str(correction.status),
        }
        review.resolved_at = datetime.now(timezone.utc)
        await self._session.commit()
        await self._session.refresh(review)
        return review

    async def summarize_by_trace(
        self,
        user_id: uuid.UUID,
        trace_ids: list[uuid.UUID],
    ) -> dict[uuid.UUID, dict]:
        if not trace_ids:
            return {}
        result = await self._session.execute(
            select(RecommendationReview)
            .where(
                RecommendationReview.user_id == user_id,
                RecommendationReview.decision_trace_id.in_(trace_ids),
            )
            .order_by(RecommendationReview.created_at.desc())
        )
        reviews = list(result.scalars().all())
        grouped: dict[uuid.UUID, list[RecommendationReview]] = {}
        for review in reviews:
            grouped.setdefault(review.decision_trace_id, []).append(review)

        summaries: dict[uuid.UUID, dict] = {}
        for trace_id, items in grouped.items():
            latest = items[0]
            open_count = sum(1 for item in items if item.status == RecommendationReviewStatus.open)
            latest_resolution_item = next((item for item in items if item.status != RecommendationReviewStatus.open), None)
            summaries[trace_id] = {
                "review_status": RecommendationReviewStatus.open.value if open_count > 0 else latest.status.value,
                "open_review_count": open_count,
                "latest_resolution": latest_resolution_item.resolution if latest_resolution_item else None,
                "latest_resolution_notes": latest_resolution_item.resolution_notes if latest_resolution_item else None,
                "reviewer_label": latest_resolution_item.reviewer_label if latest_resolution_item else None,
            }
        return summaries

    async def _get_trace(self, user_id: uuid.UUID, trace_id: uuid.UUID) -> DecisionTrace:
        result = await self._session.execute(
            select(DecisionTrace).where(
                DecisionTrace.id == trace_id,
                DecisionTrace.user_id == user_id,
            )
        )
        trace = result.scalar_one_or_none()
        if trace is None:
            raise HTTPException(status_code=404, detail="Decision trace not found")
        return trace

    async def _get_recommendation(self, user_id: uuid.UUID, recommendation_id: uuid.UUID) -> Recommendation:
        result = await self._session.execute(
            select(Recommendation).where(
                Recommendation.id == recommendation_id,
                Recommendation.user_id == user_id,
            )
        )
        recommendation = result.scalar_one_or_none()
        if recommendation is None:
            raise HTTPException(status_code=404, detail="Recommendation not found")
        return recommendation

    async def _get_review(self, user_id: uuid.UUID, review_id: uuid.UUID) -> RecommendationReview:
        result = await self._session.execute(
            select(RecommendationReview).where(
                RecommendationReview.id == review_id,
                RecommendationReview.user_id == user_id,
            )
        )
        review = result.scalar_one_or_none()
        if review is None:
            raise HTTPException(status_code=404, detail="Recommendation review not found")
        return review
