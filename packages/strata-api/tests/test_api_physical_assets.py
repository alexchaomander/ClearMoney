import uuid
from datetime import datetime, timezone
from decimal import Decimal

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.main import app
from app.models.physical_asset import (
    AlternativeAsset,
    AlternativeAssetType,
    AssetType,
    AssetValuation,
)
from app.models.user import User


@pytest.fixture
async def test_user(session: AsyncSession) -> User:
    user = User(clerk_id="test_user_phys", email="phys_test@example.com")
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user


@pytest.mark.asyncio
async def test_create_real_estate_with_history(
    session: AsyncSession, test_user: User
) -> None:
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        # 1. Create a real estate asset
        asset_data = {
            "name": "Primary Home",
            "address": "123 Main St",
            "city": "San Francisco",
            "state": "CA",
            "zip_code": "94105",
            "market_value": 1500000.00,
            "purchase_price": 1200000.00,
            "valuation_type": "manual",
        }
        response = await client.post(
            "/api/v1/physical-assets/real-estate",
            json=asset_data,
            headers={"x-clerk-user-id": test_user.clerk_id},
        )
        assert response.status_code == 200
        data = response.json()
        asset_id = data["id"]
        assert data["name"] == "Primary Home"
        assert Decimal(str(data["market_value"])) == Decimal("1500000.00")

        # 2. Verify valuation history was recorded
        result = await session.execute(
            select(AssetValuation).where(
                AssetValuation.asset_id == uuid.UUID(asset_id),
                AssetValuation.asset_type == AssetType.real_estate,
            )
        )
        history = result.scalars().all()
        assert len(history) == 1
        assert history[0].value == Decimal("1500000.00")
        assert history[0].source and "Initial" in history[0].source


@pytest.mark.asyncio
async def test_alternative_asset_crud_and_summary(
    session: AsyncSession, test_user: User
) -> None:
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        # 1. Create alternative asset
        asset_data = {
            "name": "Angel Investment - Startup X",
            "asset_type": "angel_investment",
            "market_value": 50000.00,
            "cost_basis": 25000.00,
            "description": "Seed round investment",
        }
        response = await client.post(
            "/api/v1/physical-assets/alternative",
            json=asset_data,
            headers={"x-clerk-user-id": test_user.clerk_id},
        )
        assert response.status_code == 200
        asset_id = response.json()["id"]

        # 2. Update market value
        update_data = {"market_value": 75000.00}
        response = await client.patch(
            f"/api/v1/physical-assets/alternative/{asset_id}",
            json=update_data,
            headers={"x-clerk-user-id": test_user.clerk_id},
        )
        assert response.status_code == 200

        # 3. Verify history for update
        result = await session.execute(
            select(AssetValuation)
            .where(
                AssetValuation.asset_id == uuid.UUID(asset_id),
                AssetValuation.asset_type == AssetType.alternative,
            )
            .order_by(AssetValuation.valuation_date.asc())
        )
        history = result.scalars().all()
        assert len(history) == 2
        assert history[0].value == Decimal("50000.00")
        assert history[1].value == Decimal("75000.00")
        assert history[1].source == "Manual Update"

        # 4. Check summary includes it
        response = await client.get(
            "/api/v1/physical-assets/summary",
            headers={"x-clerk-user-id": test_user.clerk_id},
        )
        assert response.status_code == 200
        summary = response.json()
        assert any(a["id"] == asset_id for a in summary["alternative_assets"])
        assert Decimal(str(summary["total_value"])) >= Decimal("75000.00")


@pytest.mark.asyncio
async def test_get_valuation_history_api(
    session: AsyncSession, test_user: User
) -> None:
    # 1. Create asset manually in DB with history
    asset = AlternativeAsset(
        user_id=test_user.id,
        name="Wine Collection",
        asset_type=AlternativeAssetType.other,
        market_value=Decimal("10000.00"),
    )
    session.add(asset)
    await session.flush()

    v1 = AssetValuation(
        user_id=test_user.id,
        asset_id=asset.id,
        asset_type=AssetType.alternative,
        value=Decimal("8000.00"),
        valuation_date=datetime(2025, 1, 1, tzinfo=timezone.utc),
    )
    v2 = AssetValuation(
        user_id=test_user.id,
        asset_id=asset.id,
        asset_type=AssetType.alternative,
        value=Decimal("10000.00"),
        valuation_date=datetime(2026, 1, 1, tzinfo=timezone.utc),
    )
    session.add_all([v1, v2])
    await session.commit()

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        # 2. Call history API
        response = await client.get(
            f"/api/v1/physical-assets/alternative/{asset.id}/history",
            headers={"x-clerk-user-id": test_user.clerk_id},
        )
        assert response.status_code == 200
        history_data = response.json()
        assert len(history_data) == 2
        # Should be sorted desc by date
        assert Decimal(str(history_data[0]["value"])) == Decimal("10000.00")
        assert Decimal(str(history_data[1]["value"])) == Decimal("8000.00")
