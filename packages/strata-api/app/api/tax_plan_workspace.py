from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import NamedTuple

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, or_, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_async_session
from app.models.tax_plan_workspace import (
    TaxPlan,
    TaxPlanCollaborator,
    TaxPlanComment,
    TaxPlanEvent,
    TaxPlanVersion,
)
from app.models.user import User
from app.schemas.tax_plan_workspace import (
    CollaboratorRole,
    TaxPlanCollaboratorCreateRequest,
    TaxPlanCollaboratorResponse,
    TaxPlanCommentCreateRequest,
    TaxPlanCommentResponse,
    TaxPlanCreateRequest,
    TaxPlanEventCreateRequest,
    TaxPlanEventResponse,
    TaxPlanResponse,
    TaxPlanUpdateRequest,
    TaxPlanVersionCreateRequest,
    TaxPlanVersionResponse,
)

router = APIRouter(prefix="/tax-plan-workspace", tags=["tax-plan-workspace"])


class PlanAccess(NamedTuple):
    plan: TaxPlan
    role: CollaboratorRole


def _normalize_email(email: str | None) -> str:
    return (email or "").strip().lower()


async def _get_active_collaborator(
    session: AsyncSession,
    plan_id: uuid.UUID,
    email: str,
) -> TaxPlanCollaborator | None:
    if not email:
        return None
    result = await session.execute(
        select(TaxPlanCollaborator).where(
            TaxPlanCollaborator.plan_id == plan_id,
            TaxPlanCollaborator.revoked_at.is_(None),
            func.lower(TaxPlanCollaborator.email) == email,
        )
    )
    return result.scalar_one_or_none()


async def _get_plan_accessible(
    session: AsyncSession,
    user: User,
    plan_id: uuid.UUID,
    *,
    require_write: bool = False,
    require_owner: bool = False,
) -> PlanAccess:
    result = await session.execute(select(TaxPlan).where(TaxPlan.id == plan_id))
    plan = result.scalar_one_or_none()
    if not plan:
        raise HTTPException(status_code=404, detail="Tax plan not found")

    if plan.user_id == user.id:
        return PlanAccess(plan=plan, role="owner")

    collaborator = await _get_active_collaborator(
        session,
        plan_id,
        _normalize_email(user.email),
    )
    if not collaborator:
        raise HTTPException(status_code=404, detail="Tax plan not found")

    if require_owner:
        raise HTTPException(
            status_code=403,
            detail="Only plan owners can perform this action",
        )

    if require_write and collaborator.role == "viewer":
        raise HTTPException(
            status_code=403,
            detail="Viewer collaborators do not have write access",
        )

    return PlanAccess(plan=plan, role=collaborator.role)


@router.post("/plans", response_model=TaxPlanResponse)
async def create_tax_plan(
    data: TaxPlanCreateRequest,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session),
) -> TaxPlanResponse:
    plan = TaxPlan(
        user_id=user.id,
        name=data.name,
        household_name=data.household_name,
        status="draft",
    )
    session.add(plan)
    await session.commit()
    await session.refresh(plan)
    return TaxPlanResponse.model_validate(plan)


@router.get("/plans", response_model=list[TaxPlanResponse])
async def list_tax_plans(
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session),
    limit: int = Query(50, ge=1, le=200),
) -> list[TaxPlanResponse]:
    normalized_email = _normalize_email(user.email)
    collaborator_plan_ids = select(TaxPlanCollaborator.plan_id).where(
        TaxPlanCollaborator.revoked_at.is_(None),
        func.lower(TaxPlanCollaborator.email) == normalized_email,
    )

    result = await session.execute(
        select(TaxPlan)
        .where(
            or_(
                TaxPlan.user_id == user.id,
                TaxPlan.id.in_(collaborator_plan_ids),
            )
        )
        .order_by(TaxPlan.updated_at.desc())
        .limit(limit)
    )
    plans = result.scalars().all()
    return [TaxPlanResponse.model_validate(plan) for plan in plans]


@router.get("/plans/{plan_id}", response_model=TaxPlanResponse)
async def get_tax_plan(
    plan_id: uuid.UUID,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session),
) -> TaxPlanResponse:
    access = await _get_plan_accessible(session, user, plan_id)
    return TaxPlanResponse.model_validate(access.plan)


@router.patch("/plans/{plan_id}", response_model=TaxPlanResponse)
async def update_tax_plan(
    plan_id: uuid.UUID,
    data: TaxPlanUpdateRequest,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session),
) -> TaxPlanResponse:
    access = await _get_plan_accessible(session, user, plan_id, require_owner=True)
    plan = access.plan

    provided = data.model_fields_set
    if "name" in provided:
        plan.name = data.name  # type: ignore[assignment]
    if "household_name" in provided:
        plan.household_name = data.household_name
    if "status" in provided:
        plan.status = data.status  # type: ignore[assignment]

    await session.commit()
    await session.refresh(plan)
    return TaxPlanResponse.model_validate(plan)


@router.post("/plans/{plan_id}/versions", response_model=TaxPlanVersionResponse)
async def create_tax_plan_version(
    plan_id: uuid.UUID,
    data: TaxPlanVersionCreateRequest,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session),
) -> TaxPlanVersionResponse:
    access = await _get_plan_accessible(session, user, plan_id, require_write=True)

    version = TaxPlanVersion(
        plan_id=access.plan.id,
        created_by_user_id=user.id,
        label=data.label,
        inputs=data.inputs,
        results=data.results,
        source=data.source,
    )
    session.add(version)
    await session.flush()

    session.add(
        TaxPlanEvent(
            plan_id=access.plan.id,
            version_id=version.id,
            actor_user_id=user.id,
            event_type="version_created",
            event_metadata={"label": data.label, "source": data.source},
        )
    )

    await session.commit()
    await session.refresh(version)
    return TaxPlanVersionResponse.model_validate(version)


@router.get("/plans/{plan_id}/versions", response_model=list[TaxPlanVersionResponse])
async def list_tax_plan_versions(
    plan_id: uuid.UUID,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session),
    limit: int = Query(100, ge=1, le=500),
) -> list[TaxPlanVersionResponse]:
    access = await _get_plan_accessible(session, user, plan_id)

    result = await session.execute(
        select(TaxPlanVersion)
        .where(TaxPlanVersion.plan_id == access.plan.id)
        .order_by(TaxPlanVersion.created_at.desc())
        .limit(limit)
    )
    versions = result.scalars().all()
    return [TaxPlanVersionResponse.model_validate(v) for v in versions]


@router.post(
    "/plans/{plan_id}/versions/{version_id}/approve",
    response_model=TaxPlanVersionResponse,
)
async def approve_tax_plan_version(
    plan_id: uuid.UUID,
    version_id: uuid.UUID,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session),
) -> TaxPlanVersionResponse:
    access = await _get_plan_accessible(session, user, plan_id, require_owner=True)
    plan = access.plan

    if plan.status == "archived":
        raise HTTPException(
            status_code=409,
            detail="Cannot approve versions on an archived plan",
        )

    result = await session.execute(
        select(TaxPlanVersion).where(
            TaxPlanVersion.id == version_id,
            TaxPlanVersion.plan_id == plan.id,
        )
    )
    version = result.scalar_one_or_none()
    if not version:
        raise HTTPException(status_code=404, detail="Tax plan version not found")

    now = datetime.now(timezone.utc)

    # Bulk-clear approval on all sibling versions
    await session.execute(
        update(TaxPlanVersion)
        .where(
            TaxPlanVersion.plan_id == plan.id,
            TaxPlanVersion.id != version_id,
        )
        .values(is_approved=False, approved_at=None, approved_by_user_id=None)
    )

    version.is_approved = True
    version.approved_at = now
    version.approved_by_user_id = user.id

    plan.approved_version_id = version.id
    plan.status = "active"

    session.add(
        TaxPlanEvent(
            plan_id=plan.id,
            version_id=version.id,
            actor_user_id=user.id,
            event_type="version_approved",
            event_metadata={"version_id": str(version.id)},
        )
    )

    await session.commit()
    await session.refresh(version)
    return TaxPlanVersionResponse.model_validate(version)


@router.post("/plans/{plan_id}/comments", response_model=TaxPlanCommentResponse)
async def create_tax_plan_comment(
    plan_id: uuid.UUID,
    data: TaxPlanCommentCreateRequest,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session),
) -> TaxPlanCommentResponse:
    access = await _get_plan_accessible(session, user, plan_id, require_write=True)

    if data.version_id is not None:
        result = await session.execute(
            select(TaxPlanVersion).where(
                TaxPlanVersion.id == data.version_id,
                TaxPlanVersion.plan_id == access.plan.id,
            )
        )
        if result.scalar_one_or_none() is None:
            raise HTTPException(status_code=404, detail="Tax plan version not found")

    # Derive author_role from actual access level rather than trusting client
    author_role = access.role

    comment = TaxPlanComment(
        plan_id=access.plan.id,
        version_id=data.version_id,
        author_user_id=user.id,
        author_role=author_role,
        body=data.body,
    )
    session.add(comment)

    session.add(
        TaxPlanEvent(
            plan_id=access.plan.id,
            version_id=data.version_id,
            actor_user_id=user.id,
            event_type="comment_created",
            event_metadata={"author_role": author_role},
        )
    )

    await session.commit()
    await session.refresh(comment)
    return TaxPlanCommentResponse.model_validate(comment)


@router.get("/plans/{plan_id}/comments", response_model=list[TaxPlanCommentResponse])
async def list_tax_plan_comments(
    plan_id: uuid.UUID,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session),
    limit: int = Query(200, ge=1, le=1000),
) -> list[TaxPlanCommentResponse]:
    access = await _get_plan_accessible(session, user, plan_id)

    result = await session.execute(
        select(TaxPlanComment)
        .where(TaxPlanComment.plan_id == access.plan.id)
        .order_by(TaxPlanComment.created_at.desc())
        .limit(limit)
    )
    comments = result.scalars().all()
    return [TaxPlanCommentResponse.model_validate(comment) for comment in comments]


@router.post(
    "/plans/{plan_id}/collaborators",
    response_model=TaxPlanCollaboratorResponse,
)
async def add_tax_plan_collaborator(
    plan_id: uuid.UUID,
    data: TaxPlanCollaboratorCreateRequest,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session),
) -> TaxPlanCollaboratorResponse:
    access = await _get_plan_accessible(session, user, plan_id, require_owner=True)

    normalized_email = _normalize_email(data.email)
    if not normalized_email:
        raise HTTPException(status_code=422, detail="Collaborator email is required")

    if normalized_email == _normalize_email(user.email):
        raise HTTPException(status_code=409, detail="Owner already has plan access")

    existing = await _get_active_collaborator(session, access.plan.id, normalized_email)
    if existing is not None:
        raise HTTPException(status_code=409, detail="Collaborator already exists")

    collaborator = TaxPlanCollaborator(
        plan_id=access.plan.id,
        email=normalized_email,
        role=data.role,
        invited_by_user_id=user.id,
        accepted_at=None,
        revoked_at=None,
    )
    session.add(collaborator)

    session.add(
        TaxPlanEvent(
            plan_id=access.plan.id,
            actor_user_id=user.id,
            event_type="collaborator_added",
            event_metadata={"email": normalized_email, "role": data.role},
        )
    )

    await session.commit()
    await session.refresh(collaborator)
    return TaxPlanCollaboratorResponse.model_validate(collaborator)


@router.get(
    "/plans/{plan_id}/collaborators",
    response_model=list[TaxPlanCollaboratorResponse],
)
async def list_tax_plan_collaborators(
    plan_id: uuid.UUID,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session),
    active_only: bool = Query(True),
) -> list[TaxPlanCollaboratorResponse]:
    access = await _get_plan_accessible(session, user, plan_id)

    stmt = (
        select(TaxPlanCollaborator)
        .where(TaxPlanCollaborator.plan_id == access.plan.id)
        .order_by(TaxPlanCollaborator.created_at.desc())
    )
    if active_only:
        stmt = stmt.where(TaxPlanCollaborator.revoked_at.is_(None))

    result = await session.execute(stmt)
    rows = result.scalars().all()
    return [TaxPlanCollaboratorResponse.model_validate(row) for row in rows]


@router.delete("/plans/{plan_id}/collaborators/{collaborator_id}")
async def revoke_tax_plan_collaborator(
    plan_id: uuid.UUID,
    collaborator_id: uuid.UUID,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session),
) -> dict[str, str]:
    access = await _get_plan_accessible(session, user, plan_id, require_owner=True)

    result = await session.execute(
        select(TaxPlanCollaborator).where(
            TaxPlanCollaborator.id == collaborator_id,
            TaxPlanCollaborator.plan_id == access.plan.id,
        )
    )
    collaborator = result.scalar_one_or_none()
    if not collaborator:
        raise HTTPException(status_code=404, detail="Collaborator not found")

    collaborator.revoked_at = datetime.now(timezone.utc)

    session.add(
        TaxPlanEvent(
            plan_id=access.plan.id,
            actor_user_id=user.id,
            event_type="collaborator_revoked",
            event_metadata={"email": collaborator.email},
        )
    )

    await session.commit()
    return {"status": "revoked"}


@router.post("/plans/{plan_id}/events", response_model=TaxPlanEventResponse)
async def create_tax_plan_event(
    plan_id: uuid.UUID,
    data: TaxPlanEventCreateRequest,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session),
) -> TaxPlanEventResponse:
    access = await _get_plan_accessible(session, user, plan_id, require_write=True)

    if data.version_id is not None:
        result = await session.execute(
            select(TaxPlanVersion).where(
                TaxPlanVersion.id == data.version_id,
                TaxPlanVersion.plan_id == access.plan.id,
            )
        )
        if result.scalar_one_or_none() is None:
            raise HTTPException(status_code=404, detail="Tax plan version not found")

    event = TaxPlanEvent(
        plan_id=access.plan.id,
        version_id=data.version_id,
        actor_user_id=user.id,
        event_type=data.event_type,
        event_metadata=data.event_metadata,
    )
    session.add(event)
    await session.commit()
    await session.refresh(event)
    return TaxPlanEventResponse.model_validate(event)


@router.get("/plans/{plan_id}/events", response_model=list[TaxPlanEventResponse])
async def list_tax_plan_events(
    plan_id: uuid.UUID,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session),
    limit: int = Query(200, ge=1, le=2000),
) -> list[TaxPlanEventResponse]:
    access = await _get_plan_accessible(session, user, plan_id)

    result = await session.execute(
        select(TaxPlanEvent)
        .where(TaxPlanEvent.plan_id == access.plan.id)
        .order_by(TaxPlanEvent.created_at.desc())
        .limit(limit)
    )
    rows = result.scalars().all()
    return [TaxPlanEventResponse.model_validate(row) for row in rows]
