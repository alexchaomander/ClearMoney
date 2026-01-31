from datetime import date, timedelta
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
    PortfolioSnapshot,
    Security,
    SecurityType,
    User,
)


@pytest.fixture
async def portfolio_user(session: AsyncSession) -> User:
    user = User(clerk_id="portfolio_user", email="portfolio@example.com")
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user


@pytest.fixture
async def portfolio_data(
    session: AsyncSession, portfolio_user: User
) -> dict:
    institution = Institution(name="Fidelity", providers={})
    session.add(institution)
    await session.commit()

    # Create accounts
    accounts = [
        InvestmentAccount(
            user_id=portfolio_user.id,
            institution_id=institution.id,
            name="401k",
            account_type=InvestmentAccountType.k401,
            balance=Decimal("80000.00"),
            is_tax_advantaged=True,
        ),
        InvestmentAccount(
            user_id=portfolio_user.id,
            institution_id=institution.id,
            name="IRA",
            account_type=InvestmentAccountType.ira,
            balance=Decimal("20000.00"),
            is_tax_advantaged=True,
        ),
    ]
    for acc in accounts:
        session.add(acc)
    await session.commit()

    # Create securities
    securities = [
        Security(ticker="VTI", name="Vanguard Total Stock", security_type=SecurityType.etf),
        Security(ticker="BND", name="Vanguard Total Bond", security_type=SecurityType.etf),
        Security(ticker="AAPL", name="Apple Inc.", security_type=SecurityType.stock),
    ]
    for sec in securities:
        session.add(sec)
    await session.commit()

    for acc in accounts:
        await session.refresh(acc)
    for sec in securities:
        await session.refresh(sec)

    # Create holdings
    holdings = [
        Holding(
            account_id=accounts[0].id,
            security_id=securities[0].id,
            quantity=Decimal("100"),
            market_value=Decimal("25000.00"),
        ),
        Holding(
            account_id=accounts[0].id,
            security_id=securities[1].id,
            quantity=Decimal("200"),
            market_value=Decimal("20000.00"),
        ),
        Holding(
            account_id=accounts[0].id,
            security_id=securities[2].id,
            quantity=Decimal("100"),
            market_value=Decimal("18500.00"),
        ),
        Holding(
            account_id=accounts[1].id,
            security_id=securities[0].id,
            quantity=Decimal("50"),
            market_value=Decimal("12500.00"),
        ),
        Holding(
            account_id=accounts[1].id,
            security_id=securities[2].id,
            quantity=Decimal("40"),
            market_value=Decimal("7400.00"),
        ),
    ]
    for h in holdings:
        session.add(h)
    await session.commit()

    return {
        "accounts": accounts,
        "securities": securities,
        "holdings": holdings,
    }


@pytest.mark.asyncio
async def test_portfolio_summary_unauthorized() -> None:
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.get("/api/v1/portfolio/summary")
        assert response.status_code == 401


@pytest.mark.asyncio
async def test_portfolio_summary(
    portfolio_user: User,
    portfolio_data: dict,
) -> None:
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.get(
            "/api/v1/portfolio/summary",
            headers={"x-clerk-user-id": portfolio_user.clerk_id},
        )
        assert response.status_code == 200
        data = response.json()

        # Total investment value = 80000 + 20000 = 100000
        assert float(data["total_investment_value"]) == 100000.0
        assert float(data["net_worth"]) == 100000.0  # No cash or debt

        # Check allocations by asset type
        allocations = data["allocation_by_asset_type"]
        etf_alloc = next((a for a in allocations if a["category"] == "etf"), None)
        stock_alloc = next((a for a in allocations if a["category"] == "stock"), None)

        assert etf_alloc is not None
        # VTI (25000 + 12500) + BND (20000) = 57500
        assert float(etf_alloc["value"]) == 57500.0

        assert stock_alloc is not None
        # AAPL (18500 + 7400) = 25900
        assert float(stock_alloc["value"]) == 25900.0


@pytest.mark.asyncio
async def test_portfolio_summary_empty(portfolio_user: User) -> None:
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.get(
            "/api/v1/portfolio/summary",
            headers={"x-clerk-user-id": portfolio_user.clerk_id},
        )
        assert response.status_code == 200
        data = response.json()

        assert float(data["total_investment_value"]) == 0.0
        assert float(data["net_worth"]) == 0.0
        assert data["allocation_by_asset_type"] == []
        assert data["allocation_by_account_type"] == []


@pytest.mark.asyncio
async def test_portfolio_holdings(
    portfolio_user: User,
    portfolio_data: dict,
) -> None:
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.get(
            "/api/v1/portfolio/holdings",
            headers={"x-clerk-user-id": portfolio_user.clerk_id},
        )
        assert response.status_code == 200
        data = response.json()

        assert len(data) == 5

        # Check a holding has expected fields
        holding = data[0]
        assert "id" in holding
        assert "quantity" in holding
        assert "market_value" in holding
        assert "security" in holding
        assert "ticker" in holding["security"]
        assert "security_type" in holding["security"]
        assert "account_name" in holding


@pytest.mark.asyncio
async def test_portfolio_holdings_empty(portfolio_user: User) -> None:
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.get(
            "/api/v1/portfolio/holdings",
            headers={"x-clerk-user-id": portfolio_user.clerk_id},
        )
        assert response.status_code == 200
        data = response.json()
        assert data == []


@pytest.mark.asyncio
async def test_portfolio_history_uses_snapshots(
    portfolio_user: User,
    session: AsyncSession,
) -> None:
    today = date.today()
    snapshots = [
        PortfolioSnapshot(
            user_id=portfolio_user.id,
            snapshot_date=today - timedelta(days=10),
            net_worth=Decimal("1000.00"),
            total_investment_value=Decimal("1200.00"),
            total_cash_value=Decimal("100.00"),
            total_debt_value=Decimal("300.00"),
        ),
        PortfolioSnapshot(
            user_id=portfolio_user.id,
            snapshot_date=today - timedelta(days=5),
            net_worth=Decimal("1500.00"),
            total_investment_value=Decimal("1700.00"),
            total_cash_value=Decimal("200.00"),
            total_debt_value=Decimal("400.00"),
        ),
    ]
    session.add_all(snapshots)
    await session.commit()

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.get(
            "/api/v1/portfolio/history?range=30d",
            headers={"x-clerk-user-id": portfolio_user.clerk_id},
        )
        assert response.status_code == 200
        data = response.json()

        assert len(data) == 2
        assert data[0]["date"] == (today - timedelta(days=10)).isoformat()
        assert float(data[0]["value"]) == 1000.0
