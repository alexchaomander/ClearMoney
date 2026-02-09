import uuid

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.main import app
from app.models import User


@pytest.fixture
async def share_user(session: AsyncSession) -> User:
    user = User(clerk_id="share_user", email="share_user@example.com")
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user


@pytest.fixture
def headers(share_user: User) -> dict[str, str]:
    return {"x-clerk-user-id": share_user.clerk_id}


@pytest.mark.asyncio
async def test_share_report_create_and_get_increments_view_count(headers: dict) -> None:
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        create = await client.post(
            "/api/v1/share-reports",
            headers=headers,
            json={
                "tool_id": "founder-coverage-planner",
                "mode": "full",
                "payload": {"hello": "world"},
                "expires_in_days": 30,
            },
        )
        assert create.status_code == 200
        created = create.json()
        report_id = created["id"]
        token = created["token"]

        fetched = await client.get(f"/api/v1/share-reports/{report_id}", params={"token": token})
        assert fetched.status_code == 200
        data = fetched.json()
        assert data["id"] == report_id
        assert data["payload"] == {"hello": "world"}
        assert data["view_count"] == 1
        assert data["last_viewed_at"] is not None


@pytest.mark.asyncio
async def test_share_report_invalid_token_is_404(headers: dict) -> None:
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        create = await client.post(
            "/api/v1/share-reports",
            headers=headers,
            json={
                "tool_id": "founder-coverage-planner",
                "mode": "full",
                "payload": {"ok": True},
                "expires_in_days": 30,
            },
        )
        created = create.json()
        report_id = created["id"]

        fetched = await client.get(
            f"/api/v1/share-reports/{report_id}",
            params={"token": "definitely-not-the-token"},
        )
        assert fetched.status_code == 404


@pytest.mark.asyncio
async def test_share_report_one_time_link(headers: dict) -> None:
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        create = await client.post(
            "/api/v1/share-reports",
            headers=headers,
            json={
                "tool_id": "founder-coverage-planner",
                "mode": "redacted",
                "payload": {"mode": "redacted"},
                "expires_in_days": 30,
                "max_views": 1,
            },
        )
        created = create.json()
        report_id = created["id"]
        token = created["token"]

        r1 = await client.get(f"/api/v1/share-reports/{report_id}", params={"token": token})
        assert r1.status_code == 200
        assert r1.json()["view_count"] == 1

        r2 = await client.get(f"/api/v1/share-reports/{report_id}", params={"token": token})
        assert r2.status_code == 404


@pytest.mark.asyncio
async def test_share_report_rotate_invalidates_old_token_and_resets_counter(headers: dict) -> None:
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        create = await client.post(
            "/api/v1/share-reports",
            headers=headers,
            json={
                "tool_id": "founder-coverage-planner",
                "mode": "full",
                "payload": {"v": 1},
                "expires_in_days": 30,
                "max_views": 1,
            },
        )
        created = create.json()
        report_id = created["id"]
        token = created["token"]

        viewed = await client.get(f"/api/v1/share-reports/{report_id}", params={"token": token})
        assert viewed.status_code == 200
        assert viewed.json()["view_count"] == 1

        rotate = await client.post(f"/api/v1/share-reports/{report_id}/rotate", headers=headers)
        assert rotate.status_code == 200
        rotated = rotate.json()
        assert rotated["id"] == report_id
        new_token = rotated["token"]
        assert new_token != token

        old = await client.get(f"/api/v1/share-reports/{report_id}", params={"token": token})
        assert old.status_code == 404

        fresh = await client.get(f"/api/v1/share-reports/{report_id}", params={"token": new_token})
        assert fresh.status_code == 200
        assert fresh.json()["view_count"] == 1


@pytest.mark.asyncio
async def test_share_report_revoke(headers: dict) -> None:
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        create = await client.post(
            "/api/v1/share-reports",
            headers=headers,
            json={
                "tool_id": "founder-coverage-planner",
                "mode": "full",
                "payload": {"v": 1},
                "expires_in_days": 30,
            },
        )
        created = create.json()
        report_id = created["id"]
        token = created["token"]

        revoke = await client.delete(f"/api/v1/share-reports/{report_id}", headers=headers)
        assert revoke.status_code == 200

        fetched = await client.get(f"/api/v1/share-reports/{report_id}", params={"token": token})
        assert fetched.status_code == 404


@pytest.mark.asyncio
async def test_share_report_cannot_be_retrieved_by_random_id() -> None:
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        fetched = await client.get(
            f"/api/v1/share-reports/{uuid.uuid4()}",
            params={"token": "invalid-token"},
        )
        assert fetched.status_code == 404

