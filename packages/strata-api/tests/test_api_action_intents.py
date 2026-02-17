
import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.main import app
from app.models.action_intent import ActionIntent, ActionIntentStatus, ActionIntentType
from app.models.user import User


@pytest.fixture
async def test_user(session: AsyncSession) -> User:
    user = User(clerk_id="test_user_intent", email="intent@example.com")
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user

@pytest.fixture
async def client() -> AsyncClient:
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        yield ac

async def test_create_and_fetch_action_intent_direct(session: AsyncSession, test_user: User):
    """Test directly creating an ActionIntent and ensuring manifest is generated."""
    from app.services.ghost_service import GhostService

    payload = {
        "amount": 5000,
        "source_institution_slug": "fidelity",
        "source_account_name": "Fidelity Checking",
        "target_account_name": "Strata HYSA",
        "target_account_number": "987654321"
    }

    ghost_service = GhostService()
    manifest = ghost_service.generate_manifest(
        ActionIntentType.ACH_TRANSFER,
        "fidelity",
        payload
    )

    intent = ActionIntent(
        user_id=test_user.id,
        intent_type=ActionIntentType.ACH_TRANSFER,
        status=ActionIntentStatus.DRAFT,
        title="Move Funds",
        description="Optimize cash",
        payload=payload,
        impact_summary={"savings": 225.0},
        execution_manifest=manifest
    )

    session.add(intent)
    await session.commit()
    await session.refresh(intent)

    assert intent.title == "Move Funds"
    assert "steps" in intent.execution_manifest
    assert len(intent.execution_manifest["steps"]) == 3
    assert "fidelity" in intent.execution_manifest["steps"][0]["url"]

async def test_api_intents_lifecycle(client: AsyncClient, test_user: User, session: AsyncSession):
    """Test creating and listing intents via the API."""
    # Mock auth headers
    headers = {"X-Clerk-User-Id": "test_user_intent"}

    # 1. Create an intent via API
    create_payload = {
        "intent_type": ActionIntentType.ACH_TRANSFER,
        "title": "API Intent",
        "description": "Created via API",
        "payload": {
            "amount": 1000,
            "source_institution_slug": "fidelity"
        }
    }

    response = await client.post("/api/v1/action-intents", json=create_payload, headers=headers)
    assert response.status_code == 200
    created_data = response.json()
    assert created_data["title"] == "API Intent"
    assert "execution_manifest" in created_data
    assert len(created_data["execution_manifest"]["steps"]) == 3 # Generated via GhostService

    intent_id = created_data["id"]

    # 2. List intents
    response = await client.get("/api/v1/action-intents", headers=headers)
    assert response.status_code == 200
    list_data = response.json()
    assert any(i["id"] == intent_id for i in list_data)

    # 3. Get single intent
    response = await client.get(f"/api/v1/action-intents/{intent_id}", headers=headers)
    assert response.status_code == 200
    assert response.json()["id"] == intent_id
    assert "execution_manifest" in response.json()


async def test_api_create_intent_non_numeric_amount_does_not_500(
    client: AsyncClient, test_user: User
):
    headers = {"X-Clerk-User-Id": "test_user_intent"}
    create_payload = {
        "intent_type": ActionIntentType.ACH_TRANSFER,
        "title": "API Intent Invalid Amount",
        "payload": {
            "amount": "not-a-number",
            "source_institution_slug": "fidelity",
        },
    }

    response = await client.post("/api/v1/action-intents", json=create_payload, headers=headers)
    assert response.status_code == 200
    created_data = response.json()
    assert "execution_manifest" in created_data
    snippets = created_data["execution_manifest"]["steps"][1]["snippets"]
    assert any(
        s["label"] == "Transfer Amount" and s["value"] == "$0.00"
        for s in snippets
    )


async def test_api_patch_rejects_null_execution_manifest(
    client: AsyncClient, test_user: User
):
    headers = {"X-Clerk-User-Id": "test_user_intent"}
    create_payload = {
        "intent_type": ActionIntentType.ACH_TRANSFER,
        "title": "Intent To Patch",
        "payload": {"amount": 250, "source_institution_slug": "fidelity"},
    }
    create_resp = await client.post(
        "/api/v1/action-intents", json=create_payload, headers=headers
    )
    assert create_resp.status_code == 200
    intent_id = create_resp.json()["id"]

    patch_resp = await client.patch(
        f"/api/v1/action-intents/{intent_id}",
        json={"execution_manifest": None},
        headers=headers,
    )
    assert patch_resp.status_code == 422
