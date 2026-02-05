import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app


@pytest.mark.asyncio
async def test_list_points_programs() -> None:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/v1/data/points-programs")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert data[0]["id"]


@pytest.mark.asyncio
async def test_list_credit_card_data() -> None:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/v1/data/credit-cards")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert data[0]["id"]


@pytest.mark.asyncio
async def test_list_liquid_assets() -> None:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/v1/data/liquid-assets")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert data[0]["id"]


@pytest.mark.asyncio
async def test_get_investments() -> None:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/v1/data/investments")
    assert response.status_code == 200
    data = response.json()
    assert "contribution_limits" in data


@pytest.mark.asyncio
async def test_get_real_assets() -> None:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/v1/data/real-assets")
    assert response.status_code == 200
    data = response.json()
    assert "mortgage_rates" in data


@pytest.mark.asyncio
async def test_get_liabilities() -> None:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/v1/data/liabilities")
    assert response.status_code == 200
    data = response.json()
    assert "loan_rates" in data


@pytest.mark.asyncio
async def test_get_income() -> None:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/v1/data/income")
    assert response.status_code == 200
    data = response.json()
    assert "tax_brackets" in data


@pytest.mark.asyncio
async def test_get_credit() -> None:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/v1/data/credit")
    assert response.status_code == 200
    data = response.json()
    assert "score_factors" in data


@pytest.mark.asyncio
async def test_get_protection() -> None:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/v1/data/protection")
    assert response.status_code == 200
    data = response.json()
    assert "insurance_estimates" in data


@pytest.mark.asyncio
async def test_get_tool_presets() -> None:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/v1/data/tool-presets")
    assert response.status_code == 200
    data = response.json()
    assert "presets" in data
