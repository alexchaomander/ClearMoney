import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_manual_audit_input():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post(
            "/api/v1/public/audit/manual",
            json={"monthly_income": 10000, "monthly_expenses": 5000}
        )
    assert response.status_code == 200
    data = response.json()
    assert "session_id" in data
    assert data["status"] == "success"

@pytest.mark.asyncio
async def test_upload_audit_document_invalid_type():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        files = {"file": ("test.txt", b"dummy content", "text/plain")}
        response = await ac.post("/api/v1/public/audit/upload", files=files)
    assert response.status_code == 400
    assert response.json()["detail"] == "Unsupported file type"
