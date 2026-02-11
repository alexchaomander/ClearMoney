import uuid

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.main import app
from app.models import User


@pytest.mark.asyncio
async def test_tax_plan_workspace_lifecycle() -> None:
    headers = {"x-clerk-user-id": "tax_plan_user_a"}

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        create_plan = await client.post(
            "/api/v1/tax-plan-workspace/plans",
            headers=headers,
            json={"name": "2026 Plan", "household_name": "Jordan Household"},
        )
        assert create_plan.status_code == 200
        plan = create_plan.json()
        plan_id = plan["id"]
        assert plan["status"] == "draft"

        listed_plans = await client.get(
            "/api/v1/tax-plan-workspace/plans",
            headers=headers,
        )
        assert listed_plans.status_code == 200
        assert any(row["id"] == plan_id for row in listed_plans.json())

        update_plan = await client.patch(
            f"/api/v1/tax-plan-workspace/plans/{plan_id}",
            headers=headers,
            json={"name": "2026 Plan v2"},
        )
        assert update_plan.status_code == 200
        assert update_plan.json()["name"] == "2026 Plan v2"

        create_version_1 = await client.post(
            f"/api/v1/tax-plan-workspace/plans/{plan_id}/versions",
            headers=headers,
            json={
                "label": "Baseline",
                "inputs": {"mode": "individual", "wagesIncome": 180000},
                "results": {"estimatedSavings": 1200},
                "source": "workspace",
            },
        )
        assert create_version_1.status_code == 200
        version_1 = create_version_1.json()

        create_version_2 = await client.post(
            f"/api/v1/tax-plan-workspace/plans/{plan_id}/versions",
            headers=headers,
            json={
                "label": "Aggressive",
                "inputs": {"mode": "advisor", "wagesIncome": 180000},
                "results": {"estimatedSavings": 3900},
                "source": "workspace",
            },
        )
        assert create_version_2.status_code == 200
        version_2 = create_version_2.json()

        approve = await client.post(
            f"/api/v1/tax-plan-workspace/plans/{plan_id}/versions/{version_2['id']}/approve",
            headers=headers,
        )
        assert approve.status_code == 200
        approved = approve.json()
        assert approved["is_approved"] is True

        listed_versions = await client.get(
            f"/api/v1/tax-plan-workspace/plans/{plan_id}/versions",
            headers=headers,
        )
        assert listed_versions.status_code == 200
        version_rows = listed_versions.json()
        assert len(version_rows) == 2
        by_id = {row["id"]: row for row in version_rows}
        assert by_id[version_2["id"]]["is_approved"] is True
        assert by_id[version_1["id"]]["is_approved"] is False

        get_plan = await client.get(
            f"/api/v1/tax-plan-workspace/plans/{plan_id}",
            headers=headers,
        )
        assert get_plan.status_code == 200
        assert get_plan.json()["approved_version_id"] == version_2["id"]

        create_comment = await client.post(
            f"/api/v1/tax-plan-workspace/plans/{plan_id}/comments",
            headers=headers,
            json={
                "version_id": version_2["id"],
                "body": "Looks ready for Q2",
                "author_role": "owner",
            },
        )
        assert create_comment.status_code == 200

        listed_comments = await client.get(
            f"/api/v1/tax-plan-workspace/plans/{plan_id}/comments",
            headers=headers,
        )
        assert listed_comments.status_code == 200
        assert listed_comments.json()[0]["body"] == "Looks ready for Q2"

        add_collaborator = await client.post(
            f"/api/v1/tax-plan-workspace/plans/{plan_id}/collaborators",
            headers=headers,
            json={"email": "advisor@example.com", "role": "editor"},
        )
        assert add_collaborator.status_code == 200
        collaborator = add_collaborator.json()

        listed_collaborators = await client.get(
            f"/api/v1/tax-plan-workspace/plans/{plan_id}/collaborators",
            headers=headers,
        )
        assert listed_collaborators.status_code == 200
        assert len(listed_collaborators.json()) == 1

        revoke_collaborator = await client.delete(
            f"/api/v1/tax-plan-workspace/plans/{plan_id}/collaborators/{collaborator['id']}",
            headers=headers,
        )
        assert revoke_collaborator.status_code == 200
        assert revoke_collaborator.json()["status"] == "revoked"

        create_event = await client.post(
            f"/api/v1/tax-plan-workspace/plans/{plan_id}/events",
            headers=headers,
            json={
                "event_type": "packet_exported",
                "event_metadata": {"format": "markdown"},
            },
        )
        assert create_event.status_code == 200

        listed_events = await client.get(
            f"/api/v1/tax-plan-workspace/plans/{plan_id}/events",
            headers=headers,
        )
        assert listed_events.status_code == 200
        event_types = {row["event_type"] for row in listed_events.json()}
        assert "version_created" in event_types
        assert "version_approved" in event_types
        assert "comment_created" in event_types
        assert "collaborator_added" in event_types
        assert "packet_exported" in event_types


@pytest.mark.asyncio
async def test_tax_plan_workspace_requires_authentication() -> None:
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.get("/api/v1/tax-plan-workspace/plans")
        assert response.status_code == 401


@pytest.mark.asyncio
async def test_tax_plan_workspace_is_user_scoped() -> None:
    owner_headers = {"x-clerk-user-id": "tax_plan_owner"}
    other_headers = {"x-clerk-user-id": "tax_plan_other"}

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        created = await client.post(
            "/api/v1/tax-plan-workspace/plans",
            headers=owner_headers,
            json={"name": "Owner Plan", "household_name": "Owner Household"},
        )
        assert created.status_code == 200
        plan_id = created.json()["id"]

        read_other = await client.get(
            f"/api/v1/tax-plan-workspace/plans/{plan_id}",
            headers=other_headers,
        )
        assert read_other.status_code == 404

        version_other = await client.post(
            f"/api/v1/tax-plan-workspace/plans/{plan_id}/versions",
            headers=other_headers,
            json={"label": "Invalid", "inputs": {"mode": "individual"}},
        )
        assert version_other.status_code == 404

        event_other = await client.post(
            f"/api/v1/tax-plan-workspace/plans/{plan_id}/events",
            headers=other_headers,
            json={"event_type": "should_fail", "event_metadata": {}},
        )
        assert event_other.status_code == 404


@pytest.mark.asyncio
async def test_tax_plan_workspace_rejects_duplicate_active_collaborator() -> None:
    headers = {"x-clerk-user-id": "tax_plan_dup_collab"}

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        created = await client.post(
            "/api/v1/tax-plan-workspace/plans",
            headers=headers,
            json={"name": "Plan", "household_name": "Household"},
        )
        assert created.status_code == 200
        plan_id = created.json()["id"]

        first = await client.post(
            f"/api/v1/tax-plan-workspace/plans/{plan_id}/collaborators",
            headers=headers,
            json={"email": "advisor@example.com", "role": "viewer"},
        )
        assert first.status_code == 200

        duplicate = await client.post(
            f"/api/v1/tax-plan-workspace/plans/{plan_id}/collaborators",
            headers=headers,
            json={"email": "advisor@example.com", "role": "editor"},
        )
        assert duplicate.status_code == 409

        missing = await client.get(
            f"/api/v1/tax-plan-workspace/plans/{uuid.uuid4()}/collaborators",
            headers=headers,
        )
        assert missing.status_code == 404


@pytest.mark.asyncio
async def test_tax_plan_workspace_collaborator_permissions(
    session: AsyncSession,
) -> None:
    owner_headers = {"x-clerk-user-id": "tax_plan_owner_collab"}
    viewer_headers = {"x-clerk-user-id": "tax_plan_viewer_collab"}
    editor_headers = {"x-clerk-user-id": "tax_plan_editor_collab"}

    viewer = User(clerk_id="tax_plan_viewer_collab", email="viewer@example.com")
    editor = User(clerk_id="tax_plan_editor_collab", email="editor@example.com")
    session.add_all([viewer, editor])
    await session.commit()

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        created = await client.post(
            "/api/v1/tax-plan-workspace/plans",
            headers=owner_headers,
            json={"name": "Owner Plan", "household_name": "Owner Household"},
        )
        assert created.status_code == 200
        plan_id = created.json()["id"]

        invite_viewer = await client.post(
            f"/api/v1/tax-plan-workspace/plans/{plan_id}/collaborators",
            headers=owner_headers,
            json={"email": "viewer@example.com", "role": "viewer"},
        )
        assert invite_viewer.status_code == 200

        invite_editor = await client.post(
            f"/api/v1/tax-plan-workspace/plans/{plan_id}/collaborators",
            headers=owner_headers,
            json={"email": "editor@example.com", "role": "editor"},
        )
        assert invite_editor.status_code == 200

        viewer_list = await client.get(
            "/api/v1/tax-plan-workspace/plans",
            headers=viewer_headers,
        )
        assert viewer_list.status_code == 200
        assert any(row["id"] == plan_id for row in viewer_list.json())

        viewer_read = await client.get(
            f"/api/v1/tax-plan-workspace/plans/{plan_id}",
            headers=viewer_headers,
        )
        assert viewer_read.status_code == 200

        viewer_write = await client.post(
            f"/api/v1/tax-plan-workspace/plans/{plan_id}/versions",
            headers=viewer_headers,
            json={"label": "Viewer Edit", "inputs": {"mode": "individual"}},
        )
        assert viewer_write.status_code == 403

        editor_write = await client.post(
            f"/api/v1/tax-plan-workspace/plans/{plan_id}/versions",
            headers=editor_headers,
            json={
                "label": "Editor Scenario",
                "inputs": {"mode": "advisor"},
                "results": {"estimatedSavings": 2500},
            },
        )
        assert editor_write.status_code == 200

        editor_owner_action = await client.patch(
            f"/api/v1/tax-plan-workspace/plans/{plan_id}",
            headers=editor_headers,
            json={"name": "Editor should not rename"},
        )
        assert editor_owner_action.status_code == 403
