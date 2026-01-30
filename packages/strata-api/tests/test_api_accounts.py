import uuid
from decimal import Decimal

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.main import app
from app.models import (
    Holding,
    Institution,
    InvestmentAccount,
    InvestmentAccountType,
    Security,
    SecurityType,
    User,
)


@pytest.fixture
async def test_user(session: AsyncSession) -> User:
    user = User(clerk_id="test_user_api", email="api_test@example.com")
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user


@pytest.fixture
async def test_institution(session: AsyncSession) -> Institution:
    institution = Institution(
        name="Test Brokerage",
        logo_url="https://example.com/logo.png",
        providers={"snaptrade": {"brokerage_id": "test123"}},
    )
    session.add(institution)
    await session.commit()
    await session.refresh(institution)
    return institution


@pytest.fixture
async def test_accounts(
    session: AsyncSession, test_user: User, test_institution: Institution
) -> list[InvestmentAccount]:
    accounts = [
        InvestmentAccount(
            user_id=test_user.id,
            institution_id=test_institution.id,
            name="Retirement 401k",
            account_type=InvestmentAccountType.k401,
            balance=Decimal("100000.00"),
            is_tax_advantaged=True,
            provider_account_id="prov_acct_1",
        ),
        InvestmentAccount(
            user_id=test_user.id,
            institution_id=test_institution.id,
            name="Brokerage",
            account_type=InvestmentAccountType.brokerage,
            balance=Decimal("50000.00"),
            is_tax_advantaged=False,
            provider_account_id="prov_acct_2",
        ),
    ]
    for acc in accounts:
        session.add(acc)
    await session.commit()
    for acc in accounts:
        await session.refresh(acc)
    return accounts


@pytest.fixture
async def test_securities(session: AsyncSession) -> list[Security]:
    securities = [
        Security(
            ticker="AAPL",
            name="Apple Inc.",
            security_type=SecurityType.stock,
            close_price=Decimal("185.00"),
        ),
        Security(
            ticker="VTI",
            name="Vanguard Total Stock Market ETF",
            security_type=SecurityType.etf,
            close_price=Decimal("250.00"),
        ),
    ]
    for sec in securities:
        session.add(sec)
    await session.commit()
    for sec in securities:
        await session.refresh(sec)
    return securities


@pytest.fixture
async def test_holdings(
    session: AsyncSession,
    test_accounts: list[InvestmentAccount],
    test_securities: list[Security],
) -> list[Holding]:
    holdings = [
        Holding(
            account_id=test_accounts[0].id,
            security_id=test_securities[0].id,
            quantity=Decimal("100.00"),
            cost_basis=Decimal("15000.00"),
            market_value=Decimal("18500.00"),
        ),
        Holding(
            account_id=test_accounts[0].id,
            security_id=test_securities[1].id,
            quantity=Decimal("200.00"),
            cost_basis=Decimal("40000.00"),
            market_value=Decimal("50000.00"),
        ),
        Holding(
            account_id=test_accounts[1].id,
            security_id=test_securities[0].id,
            quantity=Decimal("50.00"),
            cost_basis=Decimal("7500.00"),
            market_value=Decimal("9250.00"),
        ),
    ]
    for h in holdings:
        session.add(h)
    await session.commit()
    for h in holdings:
        await session.refresh(h)
    return holdings


@pytest.mark.asyncio
async def test_list_accounts_unauthorized() -> None:
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.get("/api/v1/accounts")
        assert response.status_code == 401  # Missing authentication


@pytest.mark.asyncio
async def test_list_accounts(
    test_user: User,
    test_accounts: list[InvestmentAccount],
) -> None:
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.get(
            "/api/v1/accounts",
            headers={"x-clerk-user-id": test_user.clerk_id},
        )
        assert response.status_code == 200
        data = response.json()
        # Response is a dict with account type keys
        assert "investment_accounts" in data
        assert "cash_accounts" in data
        assert "debt_accounts" in data
        assert len(data["investment_accounts"]) == 2


@pytest.mark.asyncio
async def test_list_investment_accounts(
    test_user: User,
    test_accounts: list[InvestmentAccount],
) -> None:
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.get(
            "/api/v1/accounts/investment",
            headers={"x-clerk-user-id": test_user.clerk_id},
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2

        # Check first account
        acct_names = [a["name"] for a in data]
        assert "Retirement 401k" in acct_names
        assert "Brokerage" in acct_names


@pytest.mark.asyncio
async def test_get_investment_account_detail(
    test_user: User,
    test_accounts: list[InvestmentAccount],
    test_holdings: list[Holding],
    test_institution: Institution,
) -> None:
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.get(
            f"/api/v1/accounts/investment/{test_accounts[0].id}",
            headers={"x-clerk-user-id": test_user.clerk_id},
        )
        assert response.status_code == 200
        data = response.json()

        assert data["name"] == "Retirement 401k"
        assert data["account_type"] == "401k"
        assert data["is_tax_advantaged"] is True
        assert len(data["holdings"]) == 2
        assert data["institution_id"] == str(test_institution.id)


@pytest.mark.asyncio
async def test_get_investment_account_not_found(test_user: User) -> None:
    fake_id = uuid.uuid4()
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.get(
            f"/api/v1/accounts/investment/{fake_id}",
            headers={"x-clerk-user-id": test_user.clerk_id},
        )
        assert response.status_code == 404


@pytest.mark.asyncio
async def test_get_investment_account_wrong_user(
    session: AsyncSession,
    test_accounts: list[InvestmentAccount],
) -> None:
    # Create another user
    other_user = User(clerk_id="other_user", email="other@example.com")
    session.add(other_user)
    await session.commit()

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.get(
            f"/api/v1/accounts/investment/{test_accounts[0].id}",
            headers={"x-clerk-user-id": "other_user"},
        )
        assert response.status_code == 404
