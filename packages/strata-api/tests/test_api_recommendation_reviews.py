import uuid

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.main import app
from app.models import AgentSession, DecisionTrace, Recommendation, User
from app.models.agent_session import RecommendationStatus, SessionStatus
from app.models.decision_trace import DecisionTraceType
from app.models.financial_correction import FinancialCorrection
from app.models.recommendation_review import RecommendationReview, RecommendationReviewStatus


@pytest.fixture
async def review_user(session: AsyncSession) -> User:
    user = User(clerk_id="review_user", email="review@example.com")
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user


@pytest.fixture
def review_headers(review_user: User) -> dict[str, str]:
    return {"x-clerk-user-id": review_user.clerk_id}


@pytest.fixture
async def review_trace(session: AsyncSession, review_user: User) -> dict[str, str]:
    agent_session = AgentSession(
        user_id=review_user.id,
        skill_name="general",
        status=SessionStatus.active,
        messages=[],
    )
    session.add(agent_session)
    await session.commit()
    await session.refresh(agent_session)

    recommendation = Recommendation(
        user_id=review_user.id,
        session_id=agent_session.id,
        skill_name="general",
        title="Move cash into a higher-yield account",
        summary="Increase yield on idle cash.",
        details={"target_apy": 4.5},
        status=RecommendationStatus.pending,
    )
    session.add(recommendation)
    await session.commit()
    await session.refresh(recommendation)

    trace = DecisionTrace(
        user_id=review_user.id,
        session_id=agent_session.id,
        recommendation_id=recommendation.id,
        trace_type=DecisionTraceType.recommendation,
        input_data={"profile": {}},
        reasoning_steps=[],
        outputs={
            "trace": {
                "trace_version": "v2",
                "trace_kind": "recommendation",
                "title": recommendation.title,
                "summary": recommendation.summary,
                "rules_applied": [],
                "insights": [],
                "assumptions": [],
                "confidence_score": 0.82,
                "confidence_factors": [],
                "determinism_class": "deterministic",
                "source_tier": "derived_context",
                "continuity_status": "healthy",
                "recommendation_readiness": "ready",
                "coverage_status": "full",
                "policy_version": "context-policy-v1",
                "freshness": {
                    "is_fresh": True,
                    "age_hours": 1.0,
                    "max_age_hours": 24,
                    "last_sync": None,
                    "warning": None,
                },
                "context_quality": {
                    "continuity_status": "healthy",
                    "recommendation_readiness": "ready",
                    "confidence_score": 0.82,
                    "freshness": {
                        "is_fresh": True,
                        "age_hours": 1.0,
                        "max_age_hours": 24,
                        "last_sync": None,
                        "warning": None,
                    },
                    "coverage_ratio": 1.0,
                    "active_connection_count": 1,
                    "total_connection_count": 1,
                    "stale_connection_count": 0,
                    "errored_connection_count": 0,
                    "warnings": [],
                    "confidence_factors": [],
                },
                "warnings": [],
                "remediation_actions": [],
                "correction_targets": [],
                "review_summary": None,
                "deterministic": {},
            }
        },
        data_freshness={},
        warnings=[],
        source="advisor",
    )
    session.add(trace)
    await session.commit()
    await session.refresh(trace)

    return {
        "session_id": str(agent_session.id),
        "recommendation_id": str(recommendation.id),
        "trace_id": str(trace.id),
    }


@pytest.mark.asyncio
async def test_create_and_list_recommendation_reviews(
    review_headers: dict[str, str],
    review_trace: dict[str, str],
) -> None:
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        create_response = await client.post(
            "/api/v1/recommendation-reviews",
            headers=review_headers,
            json={
                "decision_trace_id": review_trace["trace_id"],
                "recommendation_id": review_trace["recommendation_id"],
                "review_type": "user_dispute",
                "opened_reason": "The recommendation assumes idle cash that is already earmarked.",
            },
        )
        list_response = await client.get(
            "/api/v1/recommendation-reviews",
            headers=review_headers,
            params={"decision_trace_id": review_trace["trace_id"]},
        )

    assert create_response.status_code == 201
    create_data = create_response.json()
    assert create_data["status"] == "open"
    assert create_data["recommendation_id"] == review_trace["recommendation_id"]

    assert list_response.status_code == 200
    list_data = list_response.json()
    assert len(list_data) == 1
    assert list_data[0]["opened_reason"].startswith("The recommendation assumes")


@pytest.mark.asyncio
async def test_convert_recommendation_review_to_correction(
    session: AsyncSession,
    review_headers: dict[str, str],
    review_trace: dict[str, str],
) -> None:
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        create_response = await client.post(
            "/api/v1/recommendation-reviews",
            headers=review_headers,
            json={
                "decision_trace_id": review_trace["trace_id"],
                "recommendation_id": review_trace["recommendation_id"],
                "review_type": "factual_followup",
                "opened_reason": "This recommendation needs manual review before action.",
            },
        )
        review_id = create_response.json()["id"]
        convert_response = await client.post(
            f"/api/v1/recommendation-reviews/{review_id}/convert-to-correction",
            headers=review_headers,
            json={
                "reviewer_label": "ops_console",
                "resolution_notes": "Escalated into correction workflow.",
                "correction": {
                    "trace_id": review_trace["trace_id"],
                    "metric_id": "recommendationReview",
                    "correction_type": "wrong_assumption",
                    "target_field": "manual_review",
                    "summary": "Escalated recommendation review",
                    "reason": "This recommendation needs manual review before action.",
                    "proposed_value": {"note": "manual review required"},
                    "apply_immediately": False,
                },
            },
        )

    assert convert_response.status_code == 200
    convert_data = convert_response.json()
    assert convert_data["status"] == "converted_to_correction"
    assert convert_data["applied_changes"]["correction_id"]

    review_result = await session.execute(
        select(RecommendationReview).where(RecommendationReview.id == uuid.UUID(review_id))
    )
    review = review_result.scalar_one()
    assert review.status == RecommendationReviewStatus.converted_to_correction

    correction_result = await session.execute(select(FinancialCorrection))
    correction = correction_result.scalar_one()
    assert correction.target_field == "manual_review"


@pytest.mark.asyncio
async def test_decision_traces_include_review_summary(
    review_headers: dict[str, str],
    review_trace: dict[str, str],
) -> None:
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        await client.post(
            "/api/v1/recommendation-reviews",
            headers=review_headers,
            json={
                "decision_trace_id": review_trace["trace_id"],
                "recommendation_id": review_trace["recommendation_id"],
                "review_type": "outdated",
                "opened_reason": "The transfer has already happened.",
            },
        )
        response = await client.get("/api/v1/agent/decision-traces", headers=review_headers)

    assert response.status_code == 200
    data = response.json()
    assert data[0]["trace_payload"]["review_summary"]["review_status"] == "open"
    assert data[0]["trace_payload"]["review_summary"]["open_review_count"] == 1
