from datetime import date, timedelta
from decimal import Decimal

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.main import app
from app.models import BankTransaction, CashAccount, CashAccountType, Goal, GoalStatus, GoalType, User


@pytest.fixture
async def everyday_user(session: AsyncSession) -> User:
    user = User(clerk_id="everyday_user", email="everyday@example.com")
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user


@pytest.fixture
def headers(everyday_user: User) -> dict[str, str]:
    return {"x-clerk-user-id": everyday_user.clerk_id}


@pytest.fixture
async def cash_account(session: AsyncSession, everyday_user: User) -> CashAccount:
    account = CashAccount(
        user_id=everyday_user.id,
        name="Checking",
        account_type=CashAccountType.checking,
        balance=Decimal("9500.00"),
        is_manual=True,
    )
    session.add(account)
    await session.commit()
    await session.refresh(account)
    return account


@pytest.fixture
async def current_month_transactions(
    session: AsyncSession,
    cash_account: CashAccount,
) -> list[BankTransaction]:
    today = date.today()
    txs = [
        BankTransaction(
            cash_account_id=cash_account.id,
            provider_transaction_id="everyday_tx_food",
            transaction_date=today - timedelta(days=3),
            name="Sweetgreen",
            merchant_name="Sweetgreen",
            amount=Decimal("-48.00"),
            iso_currency_code="USD",
            primary_category="FOOD_AND_DRINK",
            detailed_category="Restaurant",
        ),
        BankTransaction(
            cash_account_id=cash_account.id,
            provider_transaction_id="everyday_tx_shopping",
            transaction_date=today - timedelta(days=2),
            name="Target",
            merchant_name="Target",
            amount=Decimal("-120.00"),
            iso_currency_code="USD",
            primary_category="SHOPPING",
            detailed_category="Retail",
        ),
    ]
    session.add_all(txs)
    await session.commit()
    for tx in txs:
        await session.refresh(tx)
    return txs


@pytest.mark.asyncio
async def test_budget_crud_and_summary(
    headers: dict[str, str],
    current_month_transactions: list[BankTransaction],
) -> None:
    month_start = date.today().replace(day=1).isoformat()

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        create = await client.post(
            "/api/v1/budgets",
            headers=headers,
            json={
                "name": "April plan",
                "month_start": month_start,
                "categories": [
                    {"name": "FOOD_AND_DRINK", "planned_amount": 300, "category_type": "flexible"},
                    {"name": "SHOPPING", "planned_amount": 400, "category_type": "flexible"},
                ],
            },
        )
        assert create.status_code == 201
        budget_id = create.json()["id"]

        summary = await client.get(
            f"/api/v1/budgets/{budget_id}/summary",
            headers=headers,
        )
        assert summary.status_code == 200
        data = summary.json()
        assert data["total_planned"] == "700.00"
        assert data["total_actual"] == "120.00"
        assert data["safe_to_spend"] == "580.00"
        assert {item["name"] for item in data["categories"]} == {"FOOD_AND_DRINK", "SHOPPING"}


@pytest.mark.asyncio
async def test_transaction_override_updates_spending_summary(
    headers: dict[str, str],
    current_month_transactions: list[BankTransaction],
) -> None:
    tx = current_month_transactions[1]

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        patch = await client.patch(
            f"/api/v1/banking/transactions/{tx.id}",
            headers=headers,
            json={
                "primary_category": "TRANSFER_OUT",
                "merchant_name": "Target Household",
                "exclude_from_budget": True,
                "transaction_kind": "transfer",
            },
        )
        assert patch.status_code == 200
        payload = patch.json()
        assert payload["primary_category"] == "TRANSFER_OUT"
        assert payload["merchant_name"] == "Target Household"
        assert payload["excluded_from_budget"] is True
        assert payload["transaction_kind"] == "transfer"

        spending = await client.get(
            "/api/v1/banking/spending-summary?months=1",
            headers=headers,
        )
        assert spending.status_code == 200
        data = spending.json()
        assert data["total_spending"] == "48.00"
        assert [row["category"] for row in data["categories"]] == ["FOOD_AND_DRINK"]


@pytest.mark.asyncio
async def test_consumer_home_includes_goal_and_inbox_signal(
    session: AsyncSession,
    everyday_user: User,
    headers: dict[str, str],
) -> None:
    goal = Goal(
        user_id=everyday_user.id,
        name="Emergency fund",
        goal_type=GoalType.emergency_fund,
        target_amount=Decimal("24000.00"),
        current_amount=Decimal("6000.00"),
        monthly_contribution=Decimal("250.00"),
        target_date=date.today() + timedelta(days=180),
        status=GoalStatus.active,
    )
    session.add(goal)
    await session.commit()

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.get("/api/v1/consumer-home", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert data["weekly_briefing"]["headline"]
        assert len(data["goals"]) == 1
        assert data["goals"][0]["name"] == "Emergency fund"
        assert any(item["item_type"] == "goal_risk" for item in data["inbox_items"])
