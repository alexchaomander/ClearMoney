import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app


@pytest.mark.asyncio
async def test_join_waitlist():
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        response = await ac.post(
            "/api/v1/waitlist/",
            json={
                "email": "founder@example.com",
                "role": "Founder",
                "source_tool": "AI Tax Shield Audit",
            },
        )

    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert "referral_code" in data
