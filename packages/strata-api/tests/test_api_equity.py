import pytest
from datetime import date
from decimal import Decimal
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.main import app
from app.models.user import User
from app.models.equity_grant import EquityGrant, EquityGrantType

@pytest.fixture
async def test_user(session: AsyncSession) -> User:
    user = User(clerk_id="equity_test_user", email="equity@example.com")
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user

@pytest.mark.asyncio
async def test_create_equity_grant(test_user: User) -> None:
    grant_data = {
        "grant_name": "Initial RSU Grant",
        "grant_type": "rsu",
        "symbol": "NVDA",
        "quantity": "1000.00",
        "grant_date": "2024-01-01",
        "is_83b_elected": True,
        "election_date": "2024-01-15",
        "is_qsbs_eligible": True,
        "qsbs_holding_start": "2024-01-01",
        "vesting_schedule": [
            {"date": "2024-01-01", "quantity": "250.00"},
            {"date": "2025-01-01", "quantity": "250.00"},
            {"date": "2026-01-01", "quantity": "250.00"},
            {"date": "2027-01-01", "quantity": "250.00"}
        ]
    }
    
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.post(
            "/api/v1/equity/grants",
            json=grant_data,
            headers={"x-clerk-user-id": test_user.clerk_id},
        )
    
    assert response.status_code == 200
    data = response.json()
    assert data["grant_name"] == "Initial RSU Grant"
    assert data["symbol"] == "NVDA"
    assert data["is_83b_elected"] is True
    assert data["is_qsbs_eligible"] is True
    assert len(data["vesting_schedule"]) == 4

@pytest.mark.asyncio
async def test_get_equity_portfolio(test_user: User, session: AsyncSession) -> None:
    # Add a grant manually
    grant = EquityGrant(
        user_id=test_user.id,
        grant_name="Options Grant",
        grant_type=EquityGrantType.iso,
        symbol="AAPL",
        quantity=Decimal("500.00"),
        strike_price=Decimal("150.00"),
        grant_date=date(2023, 1, 1),
        is_83b_elected=True,
        election_date=date(2023, 1, 15),
        is_qsbs_eligible=True,
        qsbs_holding_start=date(2023, 1, 1),
        vesting_schedule=[
            {"date": "2024-01-01", "quantity": "125.00"},
            {"date": "2025-01-01", "quantity": "125.00"}
        ]
    )
    session.add(grant)
    await session.commit()

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.get(
            "/api/v1/equity/portfolio",
            headers={"x-clerk-user-id": test_user.clerk_id},
        )
    
    assert response.status_code == 200
    data = response.json()
    assert "total_value" in data
    assert len(data["grant_valuations"]) == 1
    assert data["grant_valuations"][0]["symbol"] == "AAPL"
    assert data["grant_valuations"][0]["is_83b_elected"] is True
    assert "election_deadline" in data["grant_valuations"][0]
    assert data["grant_valuations"][0]["is_qsbs_eligible"] is True
    assert "qsbs_progress_percent" in data["grant_valuations"][0]

@pytest.mark.asyncio
async def test_get_equity_projections(test_user: User, session: AsyncSession) -> None:
    # Add a grant
    grant = EquityGrant(
        user_id=test_user.id,
        grant_name="RSU Grant",
        grant_type=EquityGrantType.rsu,
        symbol="MSFT",
        quantity=Decimal("400.00"),
        grant_date=date(2024, 1, 1),
        vesting_schedule=[
            {"date": "2024-01-01", "quantity": "100.00"},
            {"date": "2025-01-01", "quantity": "100.00"},
            {"date": "2026-01-01", "quantity": "100.00"},
            {"date": "2027-01-01", "quantity": "100.00"}
        ]
    )
    session.add(grant)
    await session.commit()

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.get(
            "/api/v1/equity/projections",
            headers={"x-clerk-user-id": test_user.clerk_id},
        )
    
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 25 # Current month + 24 months
    assert float(data[0]["total_value"]) > 0
