from datetime import date, timedelta
from decimal import Decimal

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.main import app
from app.models import CashAccount, Connection, DebtAccount, FinancialMemory, User
from app.models.bank_transaction import BankTransaction
from app.models.cash_account import CashAccountType
from app.models.connection import ConnectionStatus
from app.models.debt_account import DebtType


@pytest.fixture
async def agent_user(session: AsyncSession) -> User:
    user = User(clerk_id="agent_trace_user", email="agent-trace@example.com")
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user


@pytest.fixture
async def agent_trace_data(session: AsyncSession, agent_user: User) -> None:
    session.add(
        FinancialMemory(
            user_id=agent_user.id,
            monthly_income=Decimal("12000.00"),
            average_monthly_expenses=Decimal("3500.00"),
        )
    )
    checking = CashAccount(
        user_id=agent_user.id,
        name="Primary Checking",
        account_type=CashAccountType.checking,
        balance=Decimal("15000.00"),
        institution_name="Bank",
    )
    debt = DebtAccount(
        user_id=agent_user.id,
        name="Card Balance",
        debt_type=DebtType.credit_card,
        balance=Decimal("2500.00"),
        interest_rate=Decimal("19.99"),
        minimum_payment=Decimal("100.00"),
    )
    session.add_all([checking, debt])
    await session.commit()
    await session.refresh(checking)

    for index in range(3):
        session.add(
            BankTransaction(
                cash_account_id=checking.id,
                provider_transaction_id=f"trace-tx-{index}",
                amount=Decimal("-3000.00"),
                transaction_date=date.today() - timedelta(days=10 * (index + 1)),
                name=f"Expense {index}",
                primary_category="GENERAL_SERVICES",
            )
        )
    await session.commit()


@pytest.mark.asyncio
async def test_metric_trace_net_worth(agent_user: User, agent_trace_data: None) -> None:
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.get(
            "/api/v1/agent/metric-traces/netWorth",
            headers={"x-clerk-user-id": agent_user.clerk_id},
        )

    assert response.status_code == 200
    data = response.json()
    assert data["metric_id"] == "netWorth"
    assert data["formula_id"] == "portfolio.net_worth"
    assert data["formula_version"] == "2.0.0"
    assert data["formula"] == "Total Assets - Total Liabilities"
    assert len(data["data_points"]) == 3
    assert len(data["components"]) == 3
    assert data["data_points"][0]["label"] == "Total Assets"
    assert data["data_points"][1]["label"] == "Total Liabilities"
    assert data["data_points"][2]["value"] == "$12,500.00"
    assert data["recommendation_readiness"] == "cautious"
    assert data["coverage_status"] == "partial"
    assert data["confidence_score"] > 0


@pytest.mark.asyncio
async def test_metric_trace_savings_rate(
    agent_user: User, agent_trace_data: None
) -> None:
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.get(
            "/api/v1/agent/metric-traces/savingsRate",
            headers={"x-clerk-user-id": agent_user.clerk_id},
        )

    assert response.status_code == 200
    data = response.json()
    assert data["metric_id"] == "savingsRate"
    assert data["formula_id"] == "cashflow.savings_rate"
    assert data["data_points"][0]["value"] == "$12,000.00"
    assert data["data_points"][1]["value"] == "$3,000.00"
    assert data["data_points"][2]["value"] == "75.0%"
    assert len(data["confidence_factors"]) >= 3
    assert any(
        target["field"] == "monthly_income" for target in data["correction_targets"]
    )


@pytest.mark.asyncio
async def test_metric_trace_unknown_metric(agent_user: User) -> None:
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.get(
            "/api/v1/agent/metric-traces/not-real",
            headers={"x-clerk-user-id": agent_user.clerk_id},
        )

    assert response.status_code == 404


@pytest.mark.asyncio
async def test_context_quality_degraded(
    session: AsyncSession,
    agent_user: User,
    agent_trace_data: None,
) -> None:
    session.add(
        Connection(
            user_id=agent_user.id,
            institution_id=None,
            provider="plaid",
            provider_user_id="prov-1",
            credentials=None,
            status=ConnectionStatus.error,
            error_code="ITEM_LOGIN_REQUIRED",
            error_message="Connection revoked and needs reauth",
        )
    )
    await session.commit()

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.get(
            "/api/v1/agent/context-quality",
            headers={"x-clerk-user-id": agent_user.clerk_id},
        )

    assert response.status_code == 200
    data = response.json()
    assert data["continuity_status"] == "revoked"
    assert data["recommendation_readiness"] == "blocked"
    assert data["errored_connection_count"] == 1
