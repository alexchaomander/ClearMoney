from datetime import date
from decimal import Decimal

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.main import app
from app.models import (
    Institution,
    InvestmentAccount,
    InvestmentAccountType,
    Security,
    SecurityType,
    Transaction,
    User,
)
from app.models.transaction import TransactionType


@pytest.fixture
async def txn_user(session: AsyncSession) -> User:
    user = User(clerk_id="txn_user", email="txn@example.com")
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user


@pytest.fixture
async def txn_data(
    session: AsyncSession, txn_user: User
) -> dict:
    institution = Institution(name="Fidelity", providers={})
    session.add(institution)
    await session.flush()

    account = InvestmentAccount(
        user_id=txn_user.id,
        institution_id=institution.id,
        name="Brokerage",
        account_type=InvestmentAccountType.brokerage,
        balance=Decimal("50000.00"),
        is_tax_advantaged=False,
    )
    session.add(account)
    await session.flush()

    security = Security(
        ticker="AAPL", name="Apple Inc.", security_type=SecurityType.stock
    )
    session.add(security)
    await session.flush()

    transactions = [
        Transaction(
            account_id=account.id,
            security_id=security.id,
            provider_transaction_id="txn_1",
            type=TransactionType.buy,
            quantity=Decimal("10"),
            price=Decimal("150.00"),
            amount=Decimal("1500.00"),
            trade_date=date(2026, 1, 15),
            currency="USD",
            description="Buy AAPL",
            source="snaptrade",
        ),
        Transaction(
            account_id=account.id,
            security_id=security.id,
            provider_transaction_id="txn_2",
            type=TransactionType.sell,
            quantity=Decimal("5"),
            price=Decimal("160.00"),
            amount=Decimal("800.00"),
            trade_date=date(2026, 1, 20),
            currency="USD",
            description="Sell AAPL",
            source="snaptrade",
        ),
    ]
    for txn in transactions:
        session.add(txn)
    await session.commit()

    return {"account": account, "security": security, "transactions": transactions}


@pytest.mark.asyncio
async def test_list_transactions(txn_user: User, txn_data: dict) -> None:
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.get(
            "/api/v1/transactions",
            headers={"x-clerk-user-id": txn_user.clerk_id},
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2
        # Ordered by trade_date desc
        assert data[0]["description"] == "Sell AAPL"
        assert data[1]["description"] == "Buy AAPL"


@pytest.mark.asyncio
async def test_list_transactions_unauthorized() -> None:
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.get("/api/v1/transactions")
        assert response.status_code == 401


@pytest.mark.asyncio
async def test_list_transactions_pagination(txn_user: User, txn_data: dict) -> None:
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.get(
            "/api/v1/transactions",
            params={"limit": 1, "offset": 0},
            headers={"x-clerk-user-id": txn_user.clerk_id},
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1

        response2 = await client.get(
            "/api/v1/transactions",
            params={"limit": 1, "offset": 1},
            headers={"x-clerk-user-id": txn_user.clerk_id},
        )
        assert response2.status_code == 200
        data2 = response2.json()
        assert len(data2) == 1

        # They should be different transactions
        assert data[0]["id"] != data2[0]["id"]


@pytest.mark.asyncio
async def test_list_transactions_filter_by_account(
    txn_user: User, txn_data: dict
) -> None:
    account = txn_data["account"]
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.get(
            "/api/v1/transactions",
            params={"account_id": str(account.id)},
            headers={"x-clerk-user-id": txn_user.clerk_id},
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2
        assert all(t["account_id"] == str(account.id) for t in data)
