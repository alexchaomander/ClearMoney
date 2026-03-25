import uuid
import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy import select
from app.main import app
from app.models import User, AgentSession, DecisionTrace, Recommendation
from app.models.agent_session import RecommendationStatus, SessionStatus
from app.models.decision_trace import DecisionTraceType
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

@pytest.fixture
def auth_headers(test_user: User) -> dict[str, str]:
    return {"x-clerk-user-id": test_user.clerk_id}

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

@pytest.mark.asyncio
async def test_duplicate_pending_blocked(session, test_user):
    user_id = test_user.id
    advisor = FinancialAdvisor(session)
    agent_session = await advisor.start_session(user_id, skill_name="retirement")
    
    rec_input = {
        "title": "Pending Recommendation",
        "summary": "Test Summary",
        "details": {"action": {"type": "increase_contribution", "amount": 0.02}},
        "confidence": 0.9
    }
    
    # Create first one
    await advisor._handle_create_recommendation(user_id, agent_session.id, rec_input)
    
    # Try to create identical one while first is still pending
    result = await advisor._handle_create_recommendation(user_id, agent_session.id, rec_input)
    assert "error" in result
    assert "Pending guidance" in result["error"]

@pytest.mark.asyncio
async def test_api_resolve_review_as_superseded(
    session, auth_headers, test_user
) -> None:
    # Setup a trace and recommendation
    agent_session = AgentSession(user_id=test_user.id, skill_name="general")
    session.add(agent_session)
    await session.flush()
    
    rec = Recommendation(
        user_id=test_user.id,
        session_id=agent_session.id,
        title="Old",
        summary="Old summary",
        skill_name="general",
        status=RecommendationStatus.pending
    )
    session.add(rec)
    await session.flush()
    
    trace = DecisionTrace(
        user_id=test_user.id,
        session_id=agent_session.id,
        recommendation_id=rec.id,
        trace_type=DecisionTraceType.recommendation,
        outputs={"trace": {"title": "Old"}}
    )
    session.add(trace)
    await session.commit()

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Create review
        review_resp = await client.post(
            "/api/v1/recommendation-reviews",
            headers=auth_headers,
            json={
                "decision_trace_id": str(trace.id),
                "recommendation_id": str(rec.id),
                "opened_reason": "Outdated",
            },
        )
        review_id = review_resp.json()["id"]

        # Resolve as superseded
        new_rec = Recommendation(
            user_id=test_user.id,
            session_id=agent_session.id,
            title="New",
            summary="New summary",
            skill_name="general",
            status=RecommendationStatus.pending
        )
        session.add(new_rec)
        await session.commit()

        new_rec_id = str(new_rec.id)
        resolve_resp = await client.post(
            f"/api/v1/recommendation-reviews/{review_id}/resolve",
            headers=auth_headers,
            json={
                "status": "superseded",
                "resolution": "superseded",
                "applied_changes": {"superseded_by_recommendation_id": new_rec_id},
            },
        )
        assert resolve_resp.status_code == 200

    await session.refresh(rec)
    assert rec.status == RecommendationStatus.superseded
    assert str(rec.superseded_by_recommendation_id) == new_rec_id

@pytest.mark.asyncio
async def test_api_reopen_review(session, auth_headers, test_user) -> None:
    # Setup
    agent_session = AgentSession(user_id=test_user.id, skill_name="general")
    session.add(agent_session)
    await session.flush()
    trace = DecisionTrace(user_id=test_user.id, session_id=agent_session.id, outputs={})
    session.add(trace)
    await session.commit()

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Create
        review_resp = await client.post(
            "/api/v1/recommendation-reviews",
            headers=auth_headers,
            json={"decision_trace_id": str(trace.id), "opened_reason": "Test"},
        )
        review_id = review_resp.json()["id"]
        
        # Resolve
        await client.post(
            f"/api/v1/recommendation-reviews/{review_id}/resolve",
            headers=auth_headers,
            json={"status": "resolved", "resolution": "fixed"},
        )

        # Reopen
        reopen_resp = await client.post(
            f"/api/v1/recommendation-reviews/{review_id}/reopen",
            headers=auth_headers,
            params={"notes": "More info"},
        )
        assert reopen_resp.status_code == 200
        assert reopen_resp.json()["status"] == "open"

@pytest.mark.asyncio
async def test_api_trace_serialization_updates(session, auth_headers, test_user) -> None:
    # Setup
    agent_session = AgentSession(user_id=test_user.id, skill_name="general")
    session.add(agent_session)
    await session.flush()
    rec = Recommendation(
        user_id=test_user.id,
        session_id=agent_session.id,
        title="Test",
        summary="Test summary",
        skill_name="general",
        status=RecommendationStatus.pending
    )
    session.add(rec)
    await session.flush()
    trace = DecisionTrace(
        user_id=test_user.id, 
        session_id=agent_session.id, 
        recommendation_id=rec.id,
        outputs={
            "trace": {
                "trace_version": "v2",
                "trace_kind": "recommendation",
                "title": "Test",
                "summary": "Test summary",
                "recommendation_status": "pending",
                "freshness": {"is_fresh": True, "max_age_hours": 24},
                "context_quality": {
                    "continuity_status": "healthy",
                    "recommendation_readiness": "ready",
                    "confidence_score": 1.0,
                    "freshness": {"is_fresh": True, "max_age_hours": 24},
                    "coverage_ratio": 1.0,
                    "active_connection_count": 1,
                    "total_connection_count": 1,
                    "stale_connection_count": 0,
                    "errored_connection_count": 0,
                },
            }
        }
    )
    session.add(trace)
    await session.commit()

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Update rec status
        rec.status = RecommendationStatus.resolved
        await session.commit()

        # Get traces
        resp = await client.get("/api/v1/agent/decision-traces", headers=auth_headers)
        assert resp.status_code == 200
        trace_json = next(t for t in resp.json() if t["id"] == str(trace.id))
        assert trace_json["trace_payload"]["recommendation_status"] == "resolved"
