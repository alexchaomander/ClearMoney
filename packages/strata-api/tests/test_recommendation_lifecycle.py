import uuid

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.main import app
from app.models import AgentSession, DecisionTrace, Recommendation, User
from app.models.agent_session import RecommendationStatus, SessionStatus
from app.models.decision_trace import DecisionTraceType
from app.services.financial_advisor import FinancialAdvisor


@pytest.fixture
async def lifecycle_user(session: AsyncSession) -> User:
    user = User(clerk_id="lifecycle_user", email="lifecycle@example.com")
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user


@pytest.fixture
def lifecycle_headers(lifecycle_user: User) -> dict[str, str]:
    return {"x-clerk-user-id": lifecycle_user.clerk_id}


@pytest.fixture
async def lifecycle_trace(
    session: AsyncSession, lifecycle_user: User
) -> dict[str, str]:
    agent_session = AgentSession(
        user_id=lifecycle_user.id,
        skill_name="general",
        status=SessionStatus.active,
        messages=[],
    )
    session.add(agent_session)
    await session.commit()
    await session.refresh(agent_session)

    recommendation = Recommendation(
        user_id=lifecycle_user.id,
        session_id=agent_session.id,
        skill_name="general",
        title="Original Recommendation",
        summary="Original Summary",
        details={},
        status=RecommendationStatus.pending,
    )
    session.add(recommendation)
    await session.commit()
    await session.refresh(recommendation)

    trace = DecisionTrace(
        user_id=lifecycle_user.id,
        session_id=agent_session.id,
        recommendation_id=recommendation.id,
        trace_type=DecisionTraceType.recommendation,
        input_data={},
        reasoning_steps=[],
        outputs={
            "trace": {
                "trace_version": "v2",
                "trace_kind": "recommendation",
                "title": recommendation.title,
                "summary": recommendation.summary,
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
async def test_resolve_review_as_superseded(
    session: AsyncSession,
    lifecycle_headers: dict[str, str],
    lifecycle_trace: dict[str, str],
) -> None:
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        # Create review
        review_resp = await client.post(
            "/api/v1/recommendation-reviews",
            headers=lifecycle_headers,
            json={
                "decision_trace_id": lifecycle_trace["trace_id"],
                "recommendation_id": lifecycle_trace["recommendation_id"],
                "opened_reason": "Outdated guidance",
            },
        )
        review_id = review_resp.json()["id"]

        # Resolve as superseded
        new_rec_id = str(uuid.uuid4())
        resolve_resp = await client.post(
            f"/api/v1/recommendation-reviews/{review_id}/resolve",
            headers=lifecycle_headers,
            json={
                "status": "superseded",
                "resolution": "superseded",
                "resolution_notes": "Replaced by new guidance",
                "applied_changes": {"superseded_by_recommendation_id": new_rec_id},
            },
        )

    assert resolve_resp.status_code == 200

    # Check recommendation status
    rec_result = await session.execute(
        select(Recommendation).where(
            Recommendation.id == uuid.UUID(lifecycle_trace["recommendation_id"])
        )
    )
    recommendation = rec_result.scalar_one()
    assert recommendation.status == RecommendationStatus.superseded
    assert str(recommendation.superseded_by_recommendation_id) == new_rec_id


@pytest.mark.asyncio
async def test_reopen_review(
    session: AsyncSession,
    lifecycle_headers: dict[str, str],
    lifecycle_trace: dict[str, str],
) -> None:
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        # Create and resolve review
        review_resp = await client.post(
            "/api/v1/recommendation-reviews",
            headers=lifecycle_headers,
            json={
                "decision_trace_id": lifecycle_trace["trace_id"],
                "recommendation_id": lifecycle_trace["recommendation_id"],
                "opened_reason": "Test reopen",
            },
        )
        review_id = review_resp.json()["id"]
        await client.post(
            f"/api/v1/recommendation-reviews/{review_id}/resolve",
            headers=lifecycle_headers,
            json={
                "status": "resolved",
                "resolution": "fixed",
            },
        )

        # Reopen
        reopen_resp = await client.post(
            f"/api/v1/recommendation-reviews/{review_id}/reopen",
            headers=lifecycle_headers,
            params={"notes": "Need more info"},
        )

    assert reopen_resp.status_code == 200
    assert reopen_resp.json()["status"] == "open"
    assert "Need more info" in reopen_resp.json()["resolution_notes"]

    # Check recommendation status
    rec_result = await session.execute(
        select(Recommendation).where(
            Recommendation.id == uuid.UUID(lifecycle_trace["recommendation_id"])
        )
    )
    recommendation = rec_result.scalar_one()
    assert recommendation.status == RecommendationStatus.needs_review


@pytest.mark.asyncio
async def test_create_recommendation_with_supersession(
    session: AsyncSession,
    lifecycle_user: User,
    lifecycle_trace: dict[str, str],
) -> None:
    advisor = FinancialAdvisor(session)

    # Create new recommendation that supersedes the original
    result = await advisor._handle_create_recommendation(
        user_id=lifecycle_user.id,
        session_id=uuid.UUID(lifecycle_trace["session_id"]),
        tool_input={
            "title": "New Recommendation",
            "summary": "New Summary",
            "supersedes_recommendation_id": lifecycle_trace["recommendation_id"],
        },
    )

    assert result["status"] == "created"
    new_rec_id = uuid.UUID(result["recommendation_id"])

    # Check original recommendation
    old_rec_result = await session.execute(
        select(Recommendation).where(
            Recommendation.id == uuid.UUID(lifecycle_trace["recommendation_id"])
        )
    )
    old_rec = old_rec_result.scalar_one()
    assert old_rec.status == RecommendationStatus.superseded
    assert old_rec.superseded_by_recommendation_id == new_rec_id

    # Check new recommendation
    new_rec_result = await session.execute(
        select(Recommendation).where(Recommendation.id == new_rec_id)
    )
    new_rec = new_rec_result.scalar_one()
    assert new_rec.superseded_recommendation_id == old_rec.id


@pytest.mark.asyncio
async def test_decision_trace_serialization_updates_status(
    session: AsyncSession,
    lifecycle_headers: dict[str, str],
    lifecycle_trace: dict[str, str],
) -> None:
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        # Update recommendation status manually to simulated resolution
        rec_result = await session.execute(
            select(Recommendation).where(
                Recommendation.id == uuid.UUID(lifecycle_trace["recommendation_id"])
            )
        )
        recommendation = rec_result.scalar_one()
        recommendation.status = RecommendationStatus.resolved
        await session.commit()

        # Get traces
        response = await client.get(
            "/api/v1/agent/decision-traces", headers=lifecycle_headers
        )

    assert response.status_code == 200
    traces = response.json()
    trace = next(t for t in traces if t["id"] == lifecycle_trace["trace_id"])
    assert trace["trace_payload"]["recommendation_status"] == "resolved"
