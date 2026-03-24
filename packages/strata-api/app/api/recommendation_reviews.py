import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, require_scopes
from app.db.session import get_async_session
from app.models.recommendation_review import RecommendationReviewStatus
from app.models.user import User
from app.schemas.recommendation_review import (
    RecommendationReviewConvertToCorrection,
    RecommendationReviewCreate,
    RecommendationReviewResolve,
    RecommendationReviewResponse,
)
from app.services.recommendation_reviews import RecommendationReviewService

router = APIRouter(prefix="/recommendation-reviews", tags=["recommendation-reviews"])


@router.post("", response_model=RecommendationReviewResponse, status_code=201)
async def create_recommendation_review(
    payload: RecommendationReviewCreate,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session),
) -> RecommendationReviewResponse:
    review = await RecommendationReviewService(session).create_review(user.id, payload)
    return RecommendationReviewResponse.model_validate(review)


@router.get("", response_model=list[RecommendationReviewResponse])
async def list_recommendation_reviews(
    status: RecommendationReviewStatus | None = Query(default=None),
    recommendation_id: uuid.UUID | None = Query(default=None),
    decision_trace_id: uuid.UUID | None = Query(default=None),
    user: User = Depends(require_scopes(["decision_traces:read"])),
    session: AsyncSession = Depends(get_async_session),
) -> list[RecommendationReviewResponse]:
    reviews = await RecommendationReviewService(session).list_reviews(
        user.id,
        status=status,
        recommendation_id=recommendation_id,
        decision_trace_id=decision_trace_id,
    )
    return [RecommendationReviewResponse.model_validate(item) for item in reviews]


@router.post("/{review_id}/resolve", response_model=RecommendationReviewResponse)
async def resolve_recommendation_review(
    review_id: uuid.UUID,
    payload: RecommendationReviewResolve,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session),
) -> RecommendationReviewResponse:
    review = await RecommendationReviewService(session).resolve_review(
        user.id, review_id, payload
    )
    return RecommendationReviewResponse.model_validate(review)


@router.post("/{review_id}/reopen", response_model=RecommendationReviewResponse)
async def reopen_recommendation_review(
    review_id: uuid.UUID,
    notes: str | None = Query(default=None),
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session),
) -> RecommendationReviewResponse:
    review = await RecommendationReviewService(session).reopen_review(
        user.id, review_id, notes
    )
    return RecommendationReviewResponse.model_validate(review)


@router.post(
    "/{review_id}/convert-to-correction", response_model=RecommendationReviewResponse
)
async def convert_recommendation_review_to_correction(
    review_id: uuid.UUID,
    payload: RecommendationReviewConvertToCorrection,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session),
) -> RecommendationReviewResponse:
    review = await RecommendationReviewService(session).convert_to_correction(
        user.id, review_id, payload
    )
    return RecommendationReviewResponse.model_validate(review)
