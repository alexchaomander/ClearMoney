"""Tests for the Financial Advisor API endpoints and service."""

import uuid

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.main import app
from app.models import AgentSession, FinancialMemory, Recommendation, User
from app.models.agent_session import RecommendationStatus, SessionStatus
from app.services.financial_advisor import FinancialAdvisor


@pytest.fixture
async def test_user(session: AsyncSession) -> User:
    user = User(clerk_id="advisor_test_user", email="advisor@example.com")
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user


@pytest.fixture
def headers(test_user: User) -> dict[str, str]:
    return {"x-clerk-user-id": test_user.clerk_id}


@pytest.fixture
async def memory(session: AsyncSession, test_user: User) -> FinancialMemory:
    mem = FinancialMemory(user_id=test_user.id, age=30, annual_income=100000)
    session.add(mem)
    await session.commit()
    await session.refresh(mem)
    return mem


# --- POST /api/v1/advisor/sessions ---


@pytest.mark.asyncio
async def test_create_session(headers: dict) -> None:
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        resp = await client.post(
            "/api/v1/advisor/sessions",
            headers=headers,
            json={"skill_name": None},
        )
        assert resp.status_code == 201
        data = resp.json()
        assert data["status"] == "active"
        assert data["skill_name"] is None
        assert data["messages"] == []


@pytest.mark.asyncio
async def test_create_session_with_skill(headers: dict) -> None:
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        resp = await client.post(
            "/api/v1/advisor/sessions",
            headers=headers,
            json={"skill_name": "retirement_planning"},
        )
        assert resp.status_code == 201
        assert resp.json()["skill_name"] == "retirement_planning"


@pytest.mark.asyncio
async def test_create_session_unauthorized() -> None:
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        resp = await client.post(
            "/api/v1/advisor/sessions",
            json={"skill_name": None},
        )
        assert resp.status_code == 401


# --- GET /api/v1/advisor/sessions ---


@pytest.mark.asyncio
async def test_list_sessions(headers: dict) -> None:
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        # Create two sessions
        await client.post(
            "/api/v1/advisor/sessions",
            headers=headers,
            json={"skill_name": None},
        )
        await client.post(
            "/api/v1/advisor/sessions",
            headers=headers,
            json={"skill_name": "tax_optimization"},
        )
        resp = await client.get("/api/v1/advisor/sessions", headers=headers)
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 2
        # Should include message_count
        assert "message_count" in data[0]


@pytest.mark.asyncio
async def test_list_sessions_empty(headers: dict) -> None:
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        resp = await client.get("/api/v1/advisor/sessions", headers=headers)
        assert resp.status_code == 200
        assert resp.json() == []


# --- GET /api/v1/advisor/sessions/{id} ---


@pytest.mark.asyncio
async def test_get_session(headers: dict) -> None:
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        create_resp = await client.post(
            "/api/v1/advisor/sessions",
            headers=headers,
            json={"skill_name": "emergency_fund"},
        )
        session_id = create_resp.json()["id"]

        resp = await client.get(
            f"/api/v1/advisor/sessions/{session_id}", headers=headers
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["id"] == session_id
        assert data["skill_name"] == "emergency_fund"


@pytest.mark.asyncio
async def test_get_session_not_found(headers: dict) -> None:
    fake_id = str(uuid.uuid4())
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        resp = await client.get(
            f"/api/v1/advisor/sessions/{fake_id}", headers=headers
        )
        assert resp.status_code == 404


@pytest.mark.asyncio
async def test_get_session_wrong_user(
    session: AsyncSession, test_user: User
) -> None:
    """A user should not be able to access another user's session."""
    other_user = User(clerk_id="other_advisor_user", email="other@example.com")
    session.add(other_user)
    await session.commit()
    await session.refresh(other_user)

    # Create session for test_user
    agent_session = AgentSession(
        user_id=test_user.id,
        skill_name=None,
        status=SessionStatus.active,
        messages=[],
    )
    session.add(agent_session)
    await session.commit()
    await session.refresh(agent_session)

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        resp = await client.get(
            f"/api/v1/advisor/sessions/{agent_session.id}",
            headers={"x-clerk-user-id": other_user.clerk_id},
        )
        assert resp.status_code == 404


# --- GET /api/v1/advisor/recommendations ---


@pytest.mark.asyncio
async def test_list_recommendations_empty(headers: dict) -> None:
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        resp = await client.get(
            "/api/v1/advisor/recommendations", headers=headers
        )
        assert resp.status_code == 200
        assert resp.json() == []


@pytest.mark.asyncio
async def test_list_recommendations(
    session: AsyncSession, test_user: User, headers: dict
) -> None:
    """Recommendations created via the ORM should be listable via API."""
    agent_session = AgentSession(
        user_id=test_user.id,
        skill_name="retirement_planning",
        status=SessionStatus.active,
        messages=[],
    )
    session.add(agent_session)
    await session.commit()
    await session.refresh(agent_session)

    rec = Recommendation(
        user_id=test_user.id,
        session_id=agent_session.id,
        skill_name="retirement_planning",
        title="Increase 401k Contributions",
        summary="Increase monthly contributions by $500 to maximize employer match.",
        details={"monthly_increase": 500, "annual_savings": 6000},
        status=RecommendationStatus.pending,
    )
    session.add(rec)
    await session.commit()

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        resp = await client.get(
            "/api/v1/advisor/recommendations", headers=headers
        )
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 1
        assert data[0]["title"] == "Increase 401k Contributions"
        assert data[0]["skill_name"] == "retirement_planning"
        assert data[0]["status"] == "pending"


# --- FinancialAdvisor service (unit tests) ---


@pytest.mark.asyncio
async def test_advisor_start_session(
    session: AsyncSession, test_user: User
) -> None:
    advisor = FinancialAdvisor(session)
    agent_session = await advisor.start_session(test_user.id, "tax_optimization")
    assert agent_session.user_id == test_user.id
    assert agent_session.skill_name == "tax_optimization"
    assert agent_session.status == SessionStatus.active
    assert agent_session.messages == []
    assert agent_session.id is not None


@pytest.mark.asyncio
async def test_advisor_start_session_no_skill(
    session: AsyncSession, test_user: User
) -> None:
    advisor = FinancialAdvisor(session)
    agent_session = await advisor.start_session(test_user.id)
    assert agent_session.skill_name is None


@pytest.mark.asyncio
async def test_advisor_handle_tool_create_recommendation(
    session: AsyncSession, test_user: User
) -> None:
    """Test the _handle_create_recommendation tool handler directly."""
    advisor = FinancialAdvisor(session)
    agent_session = await advisor.start_session(test_user.id, "debt_payoff")

    result = await advisor._handle_tool_call(
        test_user.id,
        agent_session.id,
        "create_recommendation",
        {
            "title": "Pay off high-interest debt first",
            "summary": "Focus on the credit card at 22% APR before other debts.",
            "details": {"strategy": "avalanche", "estimated_savings": 3200},
        },
    )
    assert result["status"] == "created"
    assert "recommendation_id" in result


@pytest.mark.asyncio
async def test_advisor_handle_tool_update_memory(
    session: AsyncSession, test_user: User, memory: FinancialMemory
) -> None:
    """Test the _handle_update_memory tool handler directly."""
    advisor = FinancialAdvisor(session)
    agent_session = await advisor.start_session(test_user.id)

    result = await advisor._handle_tool_call(
        test_user.id,
        agent_session.id,
        "update_memory",
        {
            "field_name": "retirement_age",
            "value": "62",
            "reason": "User stated they want to retire at 62",
        },
    )
    assert result["status"] == "updated"
    assert result["field"] == "retirement_age"


@pytest.mark.asyncio
async def test_advisor_handle_tool_update_memory_no_memory(
    session: AsyncSession, test_user: User
) -> None:
    """Updating memory when none exists should auto-create it."""
    advisor = FinancialAdvisor(session)
    agent_session = await advisor.start_session(test_user.id)

    result = await advisor._handle_tool_call(
        test_user.id,
        agent_session.id,
        "update_memory",
        {"field_name": "age", "value": "30", "reason": "test"},
    )
    assert result["status"] == "updated"
    assert result["field"] == "age"


@pytest.mark.asyncio
async def test_advisor_handle_tool_update_memory_blocked_field(
    session: AsyncSession, test_user: User
) -> None:
    """Updating protected fields like user_id should be rejected."""
    advisor = FinancialAdvisor(session)
    agent_session = await advisor.start_session(test_user.id)

    result = await advisor._handle_tool_call(
        test_user.id,
        agent_session.id,
        "update_memory",
        {"field_name": "user_id", "value": "abc", "reason": "test"},
    )
    assert "error" in result


@pytest.mark.asyncio
async def test_advisor_handle_tool_update_memory_bad_value(
    session: AsyncSession, test_user: User, memory: FinancialMemory
) -> None:
    """Non-numeric value for an integer field should return an error."""
    advisor = FinancialAdvisor(session)
    agent_session = await advisor.start_session(test_user.id)

    result = await advisor._handle_tool_call(
        test_user.id,
        agent_session.id,
        "update_memory",
        {"field_name": "age", "value": "sixty-five", "reason": "test"},
    )
    assert "error" in result


@pytest.mark.asyncio
async def test_advisor_handle_tool_unknown(
    session: AsyncSession, test_user: User
) -> None:
    advisor = FinancialAdvisor(session)
    agent_session = await advisor.start_session(test_user.id)
    result = await advisor._handle_tool_call(
        test_user.id, agent_session.id, "nonexistent_tool", {}
    )
    assert "error" in result


@pytest.mark.asyncio
async def test_advisor_handle_tool_get_context(
    session: AsyncSession, test_user: User, memory: FinancialMemory
) -> None:
    """Test the get_financial_context tool handler."""
    advisor = FinancialAdvisor(session)
    agent_session = await advisor.start_session(test_user.id)

    result = await advisor._handle_tool_call(
        test_user.id, agent_session.id, "get_financial_context", {}
    )
    assert "profile" in result
    assert result["profile"]["age"] == 30


# --- get_portfolio_metrics tool ---


@pytest.mark.asyncio
async def test_advisor_handle_tool_get_portfolio_metrics(
    session: AsyncSession, test_user: User, memory: FinancialMemory
) -> None:
    """Test the get_portfolio_metrics tool handler."""
    advisor = FinancialAdvisor(session)
    agent_session = await advisor.start_session(test_user.id)

    result = await advisor._handle_tool_call(
        test_user.id, agent_session.id, "get_portfolio_metrics", {}
    )
    assert "net_worth" in result
    assert "allocation_pct" in result
    assert "top_holdings" in result
    assert "holding_count" in result
    assert isinstance(result["allocation_pct"], dict)
    assert isinstance(result["top_holdings"], list)


# --- calculate tool ---


@pytest.mark.asyncio
async def test_advisor_handle_tool_calculate_compound_growth(
    session: AsyncSession, test_user: User
) -> None:
    """Test compound_growth calculator via tool handler."""
    advisor = FinancialAdvisor(session)
    agent_session = await advisor.start_session(test_user.id)

    result = await advisor._handle_tool_call(
        test_user.id,
        agent_session.id,
        "calculate",
        {
            "calculator": "compound_growth",
            "inputs": {
                "principal": 10000,
                "monthly_contribution": 500,
                "annual_rate": 7,
                "years": 10,
            },
        },
    )
    assert result["calculator"] == "compound_growth"
    assert result["final_balance"] > 10000
    assert result["total_contributions"] == 10000 + 500 * 120
    assert result["total_growth"] > 0


@pytest.mark.asyncio
async def test_advisor_handle_tool_calculate_loan_payment(
    session: AsyncSession, test_user: User
) -> None:
    """Test loan_payment calculator via tool handler."""
    advisor = FinancialAdvisor(session)
    agent_session = await advisor.start_session(test_user.id)

    result = await advisor._handle_tool_call(
        test_user.id,
        agent_session.id,
        "calculate",
        {
            "calculator": "loan_payment",
            "inputs": {
                "principal": 300000,
                "annual_rate": 6.5,
                "years": 30,
            },
        },
    )
    assert result["calculator"] == "loan_payment"
    assert result["monthly_payment"] > 0
    assert result["total_paid"] > 300000
    assert result["total_interest"] > 0


@pytest.mark.asyncio
async def test_advisor_handle_tool_calculate_retirement_gap(
    session: AsyncSession, test_user: User
) -> None:
    """Test retirement_gap calculator via tool handler."""
    advisor = FinancialAdvisor(session)
    agent_session = await advisor.start_session(test_user.id)

    result = await advisor._handle_tool_call(
        test_user.id,
        agent_session.id,
        "calculate",
        {
            "calculator": "retirement_gap",
            "inputs": {
                "current_savings": 100000,
                "monthly_contribution": 1000,
                "years_to_retirement": 30,
                "annual_return": 7,
                "desired_annual_income": 60000,
                "withdrawal_rate": 4,
            },
        },
    )
    assert result["calculator"] == "retirement_gap"
    assert "projected_savings" in result
    assert "needed_for_goal" in result
    assert "gap" in result
    assert isinstance(result["on_track"], bool)


@pytest.mark.asyncio
async def test_advisor_handle_tool_calculate_savings_goal(
    session: AsyncSession, test_user: User
) -> None:
    """Test savings_goal calculator via tool handler."""
    advisor = FinancialAdvisor(session)
    agent_session = await advisor.start_session(test_user.id)

    result = await advisor._handle_tool_call(
        test_user.id,
        agent_session.id,
        "calculate",
        {
            "calculator": "savings_goal",
            "inputs": {
                "goal": 50000,
                "current": 5000,
                "monthly_contribution": 1000,
                "annual_rate": 5,
            },
        },
    )
    assert result["calculator"] == "savings_goal"
    assert result["months_to_goal"] > 0
    assert result["years_to_goal"] > 0
    assert result["final_balance"] >= 50000


@pytest.mark.asyncio
async def test_advisor_handle_tool_calculate_unknown(
    session: AsyncSession, test_user: User
) -> None:
    """Unknown calculator should return an error."""
    advisor = FinancialAdvisor(session)
    agent_session = await advisor.start_session(test_user.id)

    result = await advisor._handle_tool_call(
        test_user.id,
        agent_session.id,
        "calculate",
        {"calculator": "nonexistent", "inputs": {}},
    )
    assert "error" in result


# --- ask_user tool ---


@pytest.mark.asyncio
async def test_advisor_handle_tool_ask_user(
    session: AsyncSession, test_user: User
) -> None:
    """Test the ask_user tool handler."""
    advisor = FinancialAdvisor(session)
    agent_session = await advisor.start_session(test_user.id)

    result = await advisor._handle_tool_call(
        test_user.id,
        agent_session.id,
        "ask_user",
        {
            "question": "What is your target retirement age?",
            "options": ["55", "60", "65", "70"],
        },
    )
    assert result["type"] == "question"
    assert result["question"] == "What is your target retirement age?"
    assert len(result["options"]) == 4


@pytest.mark.asyncio
async def test_advisor_handle_tool_ask_user_no_options(
    session: AsyncSession, test_user: User
) -> None:
    """ask_user without options should return empty list."""
    advisor = FinancialAdvisor(session)
    agent_session = await advisor.start_session(test_user.id)

    result = await advisor._handle_tool_call(
        test_user.id,
        agent_session.id,
        "ask_user",
        {"question": "Tell me about your financial goals."},
    )
    assert result["type"] == "question"
    assert result["question"] == "Tell me about your financial goals."
    assert result["options"] == []
