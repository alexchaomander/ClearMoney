from datetime import date
from decimal import Decimal

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.main import app
from app.models import CashAccount, FinancialMemory, User
from app.models.bank_transaction import BankTransaction
from app.models.cash_account import CashAccountType


@pytest.fixture
async def correction_user(session: AsyncSession) -> User:
    user = User(clerk_id="correction_user", email="correction@example.com")
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user


@pytest.fixture
async def correction_data(session: AsyncSession, correction_user: User) -> dict:
    memory = FinancialMemory(
        user_id=correction_user.id,
        monthly_income=Decimal("10000.00"),
        average_monthly_expenses=Decimal("4000.00"),
    )
    account = CashAccount(
        user_id=correction_user.id,
        name="Checking",
        account_type=CashAccountType.checking,
        balance=Decimal("12000.00"),
        institution_name="Bank",
    )
    session.add_all([memory, account])
    await session.commit()
    await session.refresh(account)

    tx = BankTransaction(
        cash_account_id=account.id,
        provider_transaction_id="corr-tx-1",
        amount=Decimal("-42.00"),
        transaction_date=date.today(),
        name="Coffee",
        primary_category="FOOD_AND_DRINK",
    )
    session.add(tx)
    await session.commit()
    await session.refresh(tx)
    return {"transaction_id": str(tx.id)}


@pytest.mark.asyncio
async def test_create_memory_correction_applies_immediately(
    correction_user: User,
) -> None:
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.post(
            "/api/v1/corrections",
            headers={"x-clerk-user-id": correction_user.clerk_id},
            json={
                "metric_id": "savingsRate",
                "correction_type": "wrong_fact",
                "target_field": "monthly_income",
                "reason": "Income increased after a compensation change.",
                "proposed_value": {"value": 12500},
                "apply_immediately": True,
            },
        )

        memory_response = await client.get("/api/v1/memory", headers={"x-clerk-user-id": correction_user.clerk_id})

    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "applied"
    assert data["impact_summary"]["applied"] is True
    assert "savingsRate" in data["impact_summary"]["recomputed_traces"]
    assert memory_response.json()["monthly_income"] == "12500.00"


@pytest.mark.asyncio
async def test_create_transaction_category_correction(
    correction_user: User,
    correction_data: dict,
) -> None:
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.post(
            "/api/v1/corrections",
            headers={"x-clerk-user-id": correction_user.clerk_id},
            json={
                "correction_type": "wrong_categorization",
                "target_field": "transaction_category",
                "target_id": correction_data["transaction_id"],
                "reason": "This was office spend, not food.",
                "proposed_value": {"primary_category": "GENERAL_SERVICES"},
                "apply_immediately": True,
            },
        )
        list_response = await client.get(
            "/api/v1/corrections",
            headers={"x-clerk-user-id": correction_user.clerk_id},
        )

    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "applied"
    assert data["impact_summary"]["new_primary_category"] == "GENERAL_SERVICES"
    assert list_response.status_code == 200
    assert len(list_response.json()) >= 1
