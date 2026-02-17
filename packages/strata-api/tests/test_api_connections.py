from datetime import datetime, timezone
from decimal import Decimal

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.connections import _pending_link_sessions, get_provider
from app.main import app
from app.models import Connection, InvestmentAccountType, SecurityType, User
from app.models.transaction import TransactionType
from app.services.providers.base import (
    LinkSession,
    NormalizedAccount,
    NormalizedHolding,
    NormalizedSecurity,
    NormalizedTransaction,
)


class MockProvider:
    provider_name = "snaptrade"

    async def create_link_session(self, user_id: str, redirect_uri: str | None = None) -> LinkSession:
        return LinkSession(
            redirect_url="https://snaptrade.test/connect",
            user_secret="secret_123",
        )

    async def handle_callback(
        self,
        user_id: str,
        user_secret: str,
        authorization_id: str | None = None,
    ) -> dict:
        return {
            "snaptrade_user_id": "snaptrade_user",
            "user_secret": user_secret,
            "authorization_id": authorization_id,
        }

    async def get_accounts(self, connection: Connection) -> list[NormalizedAccount]:
        return [
            NormalizedAccount(
                provider_account_id="acct_1",
                name="Test Brokerage",
                account_type=InvestmentAccountType.brokerage,
                balance=Decimal("1000.00"),
                currency="USD",
                is_tax_advantaged=False,
            )
        ]

    async def get_holdings(self, connection: Connection, provider_account_id: str) -> list[NormalizedHolding]:
        return [
            NormalizedHolding(
                security=NormalizedSecurity(
                    ticker="AAPL",
                    name="Apple Inc.",
                    security_type=SecurityType.stock,
                ),
                quantity=Decimal("10"),
                cost_basis=Decimal("1000.00"),
                market_value=Decimal("1200.00"),
                as_of=datetime.now(timezone.utc),
            )
        ]

    async def get_transactions(
        self,
        connection: Connection,
        provider_account_id: str,
    ) -> list[NormalizedTransaction]:
        return [
            NormalizedTransaction(
                provider_transaction_id="txn_1",
                transaction_type=TransactionType.buy,
                quantity=Decimal("10"),
                price=Decimal("100.00"),
                amount=Decimal("1000.00"),
                trade_date=datetime.now(timezone.utc).date(),
                settlement_date=datetime.now(timezone.utc).date(),
                currency="USD",
                description="Buy AAPL",
                security=NormalizedSecurity(
                    ticker="AAPL",
                    name="Apple Inc.",
                    security_type=SecurityType.stock,
                ),
                source="snaptrade",
            )
        ]

    async def delete_connection(self, connection: Connection) -> None:
        return None


@pytest.fixture
async def connection_user(session: AsyncSession) -> User:
    user = User(clerk_id="conn_user", email="conn@example.com")
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user


@pytest.fixture(autouse=True)
def override_provider() -> None:
    app.dependency_overrides[get_provider] = lambda: MockProvider()
    yield
    app.dependency_overrides.pop(get_provider, None)


@pytest.fixture(autouse=True)
def clear_pending_sessions() -> None:
    _pending_link_sessions.clear()
    yield
    _pending_link_sessions.clear()


@pytest.mark.asyncio
async def test_create_link_session(connection_user: User) -> None:
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.post(
            "/api/v1/connections/link",
            json={"redirect_uri": "https://app.test/callback"},
            headers={"x-clerk-user-id": connection_user.clerk_id},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["redirect_url"] == "https://snaptrade.test/connect"
        assert data["session_id"]


@pytest.mark.asyncio
async def test_connection_callback_success(
    connection_user: User,
    session: AsyncSession,
) -> None:
    session_token = "session_token_123"
    _pending_link_sessions[session_token] = {
        "user_id": str(connection_user.id),
        "user_secret": "secret_123",
        "created_at": datetime.now(timezone.utc),
    }

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.post(
            "/api/v1/connections/callback",
            json={"state": session_token, "code": "auth_code"},
            headers={"x-clerk-user-id": connection_user.clerk_id},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "active"

    result = await session.execute(
        select(Connection).where(Connection.user_id == connection_user.id)
    )
    connection = result.scalar_one_or_none()
    assert connection is not None


@pytest.mark.asyncio
async def test_connection_callback_invalid_session(connection_user: User) -> None:
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.post(
            "/api/v1/connections/callback",
            json={"state": "missing", "code": "auth_code"},
            headers={"x-clerk-user-id": connection_user.clerk_id},
        )
        assert response.status_code == 400


@pytest.mark.asyncio
async def test_connection_callback_session_user_mismatch(
    connection_user: User,
    session: AsyncSession,
) -> None:
    other_user = User(clerk_id="other_user", email="other@example.com")
    session.add(other_user)
    await session.commit()
    await session.refresh(other_user)

    session_token = "session_token_mismatch"
    _pending_link_sessions[session_token] = {
        "user_id": str(other_user.id),
        "user_secret": "secret_123",
        "created_at": datetime.now(timezone.utc),
    }

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.post(
            "/api/v1/connections/callback",
            json={"state": session_token, "code": "auth_code"},
            headers={"x-clerk-user-id": connection_user.clerk_id},
        )
        assert response.status_code == 403
