import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.main import app
from app.models import Institution, User


@pytest.fixture
async def institutions_user(session: AsyncSession) -> User:
    user = User(clerk_id="inst_search_user", email="inst_search@example.com")
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user


@pytest.fixture
async def sample_institutions(session: AsyncSession) -> list[Institution]:
    institutions = [
        Institution(
            name="Fidelity Investments",
            logo_url="https://example.com/fidelity.png",
            providers={"snaptrade": {"brokerage_id": "fid123"}},
        ),
        Institution(
            name="Charles Schwab",
            logo_url="https://example.com/schwab.png",
            providers={"snaptrade": {"brokerage_id": "sch456"}},
        ),
        Institution(
            name="Vanguard",
            logo_url="https://example.com/vanguard.png",
            providers={"snaptrade": {"brokerage_id": "van789"}},
        ),
        Institution(
            name="TD Ameritrade",
            logo_url=None,
            providers={"snaptrade": {"brokerage_id": "tda000"}},
        ),
    ]
    for inst in institutions:
        session.add(inst)
    await session.commit()
    for inst in institutions:
        await session.refresh(inst)
    return institutions


@pytest.mark.asyncio
async def test_search_institutions_no_auth_required() -> None:
    """Institutions endpoint is public (no auth required)."""
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.get("/api/v1/institutions")
        # No auth required for institutions search
        assert response.status_code == 200


@pytest.mark.asyncio
async def test_search_institutions_all(
    institutions_user: User,
    sample_institutions: list[Institution],
) -> None:
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.get(
            "/api/v1/institutions",
            headers={"x-clerk-user-id": institutions_user.clerk_id},
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 4


@pytest.mark.asyncio
async def test_search_institutions_by_query(
    institutions_user: User,
    sample_institutions: list[Institution],
) -> None:
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.get(
            "/api/v1/institutions",
            params={"q": "Fidelity"},
            headers={"x-clerk-user-id": institutions_user.clerk_id},
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["name"] == "Fidelity Investments"


@pytest.mark.asyncio
async def test_search_institutions_case_insensitive(
    institutions_user: User,
    sample_institutions: list[Institution],
) -> None:
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.get(
            "/api/v1/institutions",
            params={"q": "vanguard"},
            headers={"x-clerk-user-id": institutions_user.clerk_id},
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["name"] == "Vanguard"


@pytest.mark.asyncio
async def test_search_institutions_partial_match(
    institutions_user: User,
    sample_institutions: list[Institution],
) -> None:
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.get(
            "/api/v1/institutions",
            params={"q": "charles"},
            headers={"x-clerk-user-id": institutions_user.clerk_id},
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["name"] == "Charles Schwab"


@pytest.mark.asyncio
async def test_search_institutions_no_results(
    institutions_user: User,
    sample_institutions: list[Institution],
) -> None:
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.get(
            "/api/v1/institutions",
            params={"q": "nonexistent"},
            headers={"x-clerk-user-id": institutions_user.clerk_id},
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 0


@pytest.mark.asyncio
async def test_institution_response_format(
    institutions_user: User,
    sample_institutions: list[Institution],
) -> None:
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.get(
            "/api/v1/institutions",
            params={"q": "Fidelity"},
            headers={"x-clerk-user-id": institutions_user.clerk_id},
        )
        assert response.status_code == 200
        data = response.json()

        inst = data[0]
        assert "id" in inst
        assert "name" in inst
        assert "logo_url" in inst
        assert inst["logo_url"] == "https://example.com/fidelity.png"
