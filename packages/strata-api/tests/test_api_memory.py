"""Tests for the Financial Memory API endpoints."""

from decimal import Decimal

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.main import app
from app.models import (
    FinancialMemory,
    InvestmentAccount,
    Institution,
    User,
)
from app.models.investment_account import InvestmentAccountType


@pytest.fixture
async def test_user(session: AsyncSession) -> User:
    user = User(clerk_id="mem_test_user", email="mem_test@example.com")
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user


@pytest.fixture
def headers(test_user: User) -> dict[str, str]:
    return {"x-clerk-user-id": test_user.clerk_id}


# --- GET /api/v1/memory ---


@pytest.mark.asyncio
async def test_get_memory_creates_empty(test_user: User, headers: dict) -> None:
    """First GET should auto-create an empty memory record."""
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        resp = await client.get("/api/v1/memory", headers=headers)
        assert resp.status_code == 200
        data = resp.json()
        assert data["user_id"] == str(test_user.id)
        assert data["age"] is None
        assert data["annual_income"] is None


@pytest.mark.asyncio
async def test_get_memory_unauthorized() -> None:
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        resp = await client.get("/api/v1/memory")
        assert resp.status_code == 401


@pytest.mark.asyncio
async def test_get_memory_idempotent(headers: dict) -> None:
    """Multiple GETs should return the same record."""
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        r1 = await client.get("/api/v1/memory", headers=headers)
        r2 = await client.get("/api/v1/memory", headers=headers)
        assert r1.json()["id"] == r2.json()["id"]


# --- PATCH /api/v1/memory ---


@pytest.mark.asyncio
async def test_update_memory_basic(headers: dict) -> None:
    """Partial update should set fields and leave others null."""
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        resp = await client.patch(
            "/api/v1/memory",
            headers=headers,
            json={"age": 35, "annual_income": "125000.00", "state": "CA"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["age"] == 35
        assert Decimal(data["annual_income"]) == Decimal("125000.00")
        assert data["state"] == "CA"
        assert data["retirement_age"] is None


@pytest.mark.asyncio
async def test_update_memory_creates_events(headers: dict) -> None:
    """Each changed field should produce a MemoryEvent."""
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        await client.patch(
            "/api/v1/memory",
            headers=headers,
            json={"age": 30, "annual_income": "100000.00"},
        )
        events_resp = await client.get("/api/v1/memory/events", headers=headers)
        assert events_resp.status_code == 200
        events = events_resp.json()
        assert len(events) == 2
        field_names = {e["field_name"] for e in events}
        assert "age" in field_names
        assert "annual_income" in field_names


@pytest.mark.asyncio
async def test_update_memory_no_change_no_event(headers: dict) -> None:
    """Setting the same value twice should not create a second event."""
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        await client.patch(
            "/api/v1/memory", headers=headers, json={"age": 42}
        )
        await client.patch(
            "/api/v1/memory", headers=headers, json={"age": 42}
        )
        events_resp = await client.get("/api/v1/memory/events", headers=headers)
        events = events_resp.json()
        age_events = [e for e in events if e["field_name"] == "age"]
        assert len(age_events) == 1


@pytest.mark.asyncio
async def test_update_memory_filing_status(headers: dict) -> None:
    """Enum fields like filing_status should work correctly."""
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        resp = await client.patch(
            "/api/v1/memory",
            headers=headers,
            json={"filing_status": "married_filing_jointly"},
        )
        assert resp.status_code == 200
        assert resp.json()["filing_status"] == "married_filing_jointly"


@pytest.mark.asyncio
async def test_update_memory_risk_tolerance(headers: dict) -> None:
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        resp = await client.patch(
            "/api/v1/memory",
            headers=headers,
            json={"risk_tolerance": "aggressive"},
        )
        assert resp.status_code == 200
        assert resp.json()["risk_tolerance"] == "aggressive"


@pytest.mark.asyncio
async def test_update_memory_source_tracking(headers: dict) -> None:
    """Source and source_context should be logged on events."""
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        await client.patch(
            "/api/v1/memory",
            headers=headers,
            json={
                "retirement_age": 62,
                "source": "calculator",
                "source_context": "FIRE Calculator",
            },
        )
        events_resp = await client.get("/api/v1/memory/events", headers=headers)
        events = events_resp.json()
        assert len(events) >= 1
        event = next(e for e in events if e["field_name"] == "retirement_age")
        assert event["source"] == "calculator"
        assert event["context"] == "FIRE Calculator"


# --- GET /api/v1/memory/events ---


@pytest.mark.asyncio
async def test_events_pagination(headers: dict) -> None:
    """Events endpoint supports limit and offset."""
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        # Create several events
        for age in range(25, 30):
            await client.patch(
                "/api/v1/memory", headers=headers, json={"age": age}
            )
        resp = await client.get(
            "/api/v1/memory/events", headers=headers, params={"limit": 2, "offset": 0}
        )
        assert resp.status_code == 200
        assert len(resp.json()) == 2


# --- POST /api/v1/memory/derive ---


@pytest.mark.asyncio
async def test_derive_memory(
    session: AsyncSession, test_user: User, headers: dict
) -> None:
    """Derivation should populate current_retirement_savings from tax-advantaged accounts."""
    institution = Institution(
        name="Test Brokerage",
        logo_url="https://example.com/logo.png",
        providers={},
    )
    session.add(institution)
    await session.commit()
    await session.refresh(institution)

    acct = InvestmentAccount(
        user_id=test_user.id,
        institution_id=institution.id,
        name="401k",
        account_type=InvestmentAccountType.k401,
        balance=Decimal("75000.00"),
        is_tax_advantaged=True,
    )
    session.add(acct)
    await session.commit()

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        resp = await client.post("/api/v1/memory/derive", headers=headers)
        assert resp.status_code == 200
        data = resp.json()
        assert Decimal(data["current_retirement_savings"]) == Decimal("75000.00")


@pytest.mark.asyncio
async def test_derive_memory_creates_event(
    session: AsyncSession, test_user: User, headers: dict
) -> None:
    institution = Institution(
        name="Test Brokerage 2",
        logo_url="https://example.com/logo.png",
        providers={},
    )
    session.add(institution)
    await session.commit()
    await session.refresh(institution)

    acct = InvestmentAccount(
        user_id=test_user.id,
        institution_id=institution.id,
        name="IRA",
        account_type=InvestmentAccountType.ira,
        balance=Decimal("30000.00"),
        is_tax_advantaged=True,
    )
    session.add(acct)
    await session.commit()

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        await client.post("/api/v1/memory/derive", headers=headers)
        events_resp = await client.get("/api/v1/memory/events", headers=headers)
        events = events_resp.json()
        derive_events = [
            e for e in events if e["source"] == "account_sync"
        ]
        assert len(derive_events) >= 1


# --- DELETE /api/v1/memory ---


@pytest.mark.asyncio
async def test_delete_memory(headers: dict) -> None:
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        # Create and populate
        await client.patch(
            "/api/v1/memory", headers=headers, json={"age": 40}
        )
        # Delete
        resp = await client.delete("/api/v1/memory", headers=headers)
        assert resp.status_code == 200
        assert resp.json()["status"] == "deleted"
        # Get again should create fresh empty memory
        get_resp = await client.get("/api/v1/memory", headers=headers)
        assert get_resp.json()["age"] is None


# --- GET /api/v1/memory/context ---


@pytest.mark.asyncio
async def test_get_context_json(headers: dict) -> None:
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        await client.patch(
            "/api/v1/memory",
            headers=headers,
            json={"age": 30, "annual_income": "100000.00"},
        )
        resp = await client.get("/api/v1/memory/context", headers=headers)
        assert resp.status_code == 200
        data = resp.json()
        assert "profile" in data
        assert data["profile"]["age"] == 30


@pytest.mark.asyncio
async def test_get_context_markdown(headers: dict) -> None:
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        await client.patch(
            "/api/v1/memory",
            headers=headers,
            json={"age": 30},
        )
        resp = await client.get(
            "/api/v1/memory/context",
            headers=headers,
            params={"format": "markdown"},
        )
        assert resp.status_code == 200
        assert "text/markdown" in resp.headers.get("content-type", "")
        assert "Age" in resp.text or "age" in resp.text.lower()
