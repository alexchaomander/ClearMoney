from datetime import date, timedelta
from decimal import Decimal

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.main import app
from app.models import CashAccount, DebtAccount, FinancialMemory, User
from app.models.bank_transaction import BankTransaction
from app.models.cash_account import CashAccountType
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
    assert data["formula"] == "Total Assets - Total Liabilities"
    assert len(data["data_points"]) == 3
    assert data["data_points"][0]["label"] == "Total Assets"
    assert data["data_points"][1]["label"] == "Total Liabilities"
    assert data["data_points"][2]["value"] == 12500.0
    assert data["confidence_score"] == 0.99


@pytest.mark.asyncio
async def test_metric_trace_savings_rate(agent_user: User, agent_trace_data: None) -> None:
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
    assert data["data_points"][0]["value"] == 12000.0
    assert data["data_points"][1]["value"] == 3000.0
    assert data["data_points"][2]["value"] == 75.0
    assert data["warnings"] == []


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
