import uuid
import pytest
from sqlalchemy import select
from app.models import User
from app.models.agent_session import Recommendation, RecommendationStatus
from app.models.recommendation_review import RecommendationReview, RecommendationReviewStatus
from app.services.financial_advisor import FinancialAdvisor
from app.services.recommendation_reviews import RecommendationReviewService
from app.schemas.recommendation_review import RecommendationReviewCreate, RecommendationReviewResolve

from app.services.action_policy import ActionPolicyService

@pytest.fixture
async def test_user(session):
    user = User(clerk_id="test_user", email="test@example.com")
    session.add(user)
    await session.commit()
    await session.refresh(user)
    
    # Add an action policy
    policy_service = ActionPolicyService(session)
    await policy_service.upsert_policy(
        user_id=user.id,
        allowed_actions=["increase_contribution", "hsa_contribution"],
        max_amount=10000,
        require_confirmation=False,
        require_mfa=False,
        status="active"
    )
    
    return user

@pytest.mark.asyncio
async def test_recommendation_supersession_lifecycle(session, test_user):
    user_id = test_user.id
    # 1. Start a session
    advisor = FinancialAdvisor(session)
    agent_session = await advisor.start_session(user_id, skill_name="retirement")
    
    # 2. Create an initial recommendation
    rec1_input = {
        "title": "Save more for retirement",
        "summary": "Increase your 401k contribution by 2%.",
        "details": {"action": {"type": "increase_contribution", "amount": 0.02}},
        "confidence": 0.9
    }
    result1 = await advisor._handle_create_recommendation(user_id, agent_session.id, rec1_input)
    rec1_id = uuid.UUID(result1["recommendation_id"])
    
    # Find the created trace for rec1
    from app.models.decision_trace import DecisionTrace
    res = await session.execute(
        select(DecisionTrace).where(DecisionTrace.recommendation_id == rec1_id)
    )
    trace1 = res.scalar_one()
    
    # Verify initial state
    res = await session.execute(select(Recommendation).where(Recommendation.id == rec1_id))
    rec1 = res.scalar_one()
    assert rec1.status == RecommendationStatus.pending
    
    # 3. Create a review for it (e.g. user disputes it)
    review_service = RecommendationReviewService(session)
    review = await review_service.create_review(user_id, RecommendationReviewCreate(
        decision_trace_id=trace1.id,
        recommendation_id=rec1_id,
        opened_reason="I already contribute the max."
    ))
    assert review.status == RecommendationReviewStatus.open
    
    # 4. Try to create the same recommendation again - should be blocked by open review
    result2 = await advisor._handle_create_recommendation(user_id, agent_session.id, rec1_input)
    assert "error" in result2
    assert "already has an open review" in result2["error"]
    
    # 5. Create a NEW recommendation that explicitly supersedes the first one
    rec2_input = {
        "title": "Maximize HSA instead",
        "summary": "Since your 401k is maxed, focus on your HSA.",
        "details": {"action": {"type": "hsa_contribution", "amount": 3000}},
        "confidence": 0.95,
        "supersedes_recommendation_id": str(rec1_id)
    }
    result3 = await advisor._handle_create_recommendation(user_id, agent_session.id, rec2_input)
    rec2_id = uuid.UUID(result3["recommendation_id"])
    
    # Verify supersession links
    await session.refresh(rec1)
    res = await session.execute(select(Recommendation).where(Recommendation.id == rec2_id))
    rec2 = res.scalar_one()
    
    assert rec1.status == RecommendationStatus.superseded
    assert rec1.superseded_by_recommendation_id == rec2_id
    assert rec2.superseded_recommendation_id == rec1_id
    
    # 6. Resolve the review as superseded by linking to rec2
    await review_service.resolve_review(user_id, review.id, RecommendationReviewResolve(
        status=RecommendationReviewStatus.superseded,
        resolution="Superseded by newer HSA guidance",
        applied_changes={"superseded_by_recommendation_id": str(rec2_id)}
    ))

    await session.refresh(review)
    await session.refresh(rec1)
    await session.refresh(rec2)
    assert review.status == RecommendationReviewStatus.superseded
    assert review.applied_changes["superseded_by_recommendation_id"] == str(rec2_id)
    assert rec1.superseded_by_recommendation_id == rec2_id
    assert rec2.superseded_recommendation_id == rec1.id

