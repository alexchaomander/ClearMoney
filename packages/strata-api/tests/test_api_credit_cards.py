import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.main import app
from app.models.credit_cards import CardBenefit, CardCredit, CreditCard

@pytest.mark.asyncio
async def test_list_credit_cards_empty() -> None:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/v1/credit-cards/")
    assert response.status_code == 200
    assert response.json() == []

@pytest.mark.asyncio
async def test_seed_and_retrieve_card(session: AsyncSession) -> None:
    card = CreditCard(
        name="Test Card",
        issuer="Test Bank",
        annual_fee=100.00
    )
    session.add(card)
    await session.commit()
    await session.refresh(card)

    # 2. List
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/v1/credit-cards/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["name"] == "Test Card"
    assert data[0]["annual_fee"] == "100.00"

    # 3. Get by ID
    card_id = data[0]["id"]
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get(f"/api/v1/credit-cards/{card_id}")
    assert response.status_code == 200
    assert response.json()["id"] == card_id

@pytest.mark.asyncio
async def test_credit_card_relations(session: AsyncSession) -> None:
    card = CreditCard(
        name="Complex Card",
        issuer="Bank of Tests",
        annual_fee=500.00
    )
    session.add(card)
    await session.flush()

    credit = CardCredit(
        card_id=card.id,
        name="Travel Credit",
        value=300.00,
        period="annual"
    )
    benefit = CardBenefit(
        card_id=card.id,
        name="Lounge Access",
        default_value=100.00
    )
    session.add(credit)
    session.add(benefit)
    await session.commit()

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get(f"/api/v1/credit-cards/{card.id}")
    assert response.status_code == 200
    data = response.json()
    
    assert len(data["credits"]) == 1
    assert data["credits"][0]["name"] == "Travel Credit"
    assert len(data["benefits"]) == 1
    assert data["benefits"][0]["name"] == "Lounge Access"
