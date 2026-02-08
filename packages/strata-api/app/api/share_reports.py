from __future__ import annotations

import hashlib
import secrets
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_async_session
from app.models.share_report import ShareReport
from app.models.user import User
from app.schemas.share_reports import (
    ShareReportCreateRequest,
    ShareReportCreateResponse,
    ShareReportListItem,
    ShareReportPublicResponse,
    compute_expires_at,
)

router = APIRouter(prefix="/share-reports", tags=["share-reports"])


def _hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


@router.post("", response_model=ShareReportCreateResponse)
async def create_share_report(
    data: ShareReportCreateRequest,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session),
) -> ShareReportCreateResponse:
    token = secrets.token_urlsafe(24)
    token_hash = _hash_token(token)
    expires_at = compute_expires_at(data.expires_in_days)

    report = ShareReport(
        user_id=user.id,
        tool_id=data.tool_id,
        mode=data.mode,
        token_hash=token_hash,
        payload=data.payload,
        expires_at=expires_at,
        revoked_at=None,
        max_views=data.max_views,
        view_count=0,
        first_viewed_at=None,
        last_viewed_at=None,
    )
    session.add(report)
    await session.commit()
    await session.refresh(report)

    return ShareReportCreateResponse(
        id=report.id,
        token=token,
        tool_id=report.tool_id,
        mode=report.mode,  # type: ignore[arg-type]
        created_at=report.created_at,
        expires_at=report.expires_at,
        max_views=report.max_views,
    )


@router.get("/{report_id}", response_model=ShareReportPublicResponse)
async def get_share_report(
    report_id: uuid.UUID,
    token: str = Query(min_length=8, max_length=256),
    session: AsyncSession = Depends(get_async_session),
) -> ShareReportPublicResponse:
    now = datetime.now(timezone.utc)

    async with session.begin():
        result = await session.execute(select(ShareReport).where(ShareReport.id == report_id))
        report = result.scalar_one_or_none()
        if not report:
            raise HTTPException(status_code=404, detail="Share report not found")

        if report.revoked_at is not None:
            raise HTTPException(status_code=404, detail="Share report not found")
        if report.expires_at is not None and report.expires_at <= now:
            raise HTTPException(status_code=404, detail="Share report not found")

        if _hash_token(token) != report.token_hash:
            raise HTTPException(status_code=404, detail="Share report not found")

        if report.max_views is not None and report.view_count >= report.max_views:
            raise HTTPException(status_code=404, detail="Share report not found")

        report.view_count = (report.view_count or 0) + 1
        if report.first_viewed_at is None:
            report.first_viewed_at = now
        report.last_viewed_at = now

    return ShareReportPublicResponse(
        id=report.id,
        tool_id=report.tool_id,
        mode=report.mode,  # type: ignore[arg-type]
        created_at=report.created_at,
        expires_at=report.expires_at,
        max_views=report.max_views,
        view_count=report.view_count,
        last_viewed_at=report.last_viewed_at,
        payload=report.payload,
    )


@router.get("", response_model=list[ShareReportListItem])
async def list_share_reports(
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session),
    tool_id: str | None = Query(None),
    limit: int = Query(50, ge=1, le=200),
) -> list[ShareReportListItem]:
    stmt = select(ShareReport).where(ShareReport.user_id == user.id).order_by(ShareReport.created_at.desc())
    if tool_id:
        stmt = stmt.where(ShareReport.tool_id == tool_id)
    stmt = stmt.limit(limit)

    result = await session.execute(stmt)
    rows = result.scalars().all()
    return [ShareReportListItem.model_validate(r) for r in rows]


@router.post("/{report_id}/rotate", response_model=ShareReportCreateResponse)
async def rotate_share_report_token(
    report_id: uuid.UUID,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session),
    expires_in_days: int | None = Query(default=None, ge=1, le=365),
) -> ShareReportCreateResponse:
    """Rotate the share token, invalidating prior links.

    Returns a new token (shown once) while keeping the same report id.
    """
    token = secrets.token_urlsafe(24)
    token_hash = _hash_token(token)

    result = await session.execute(
        select(ShareReport).where(ShareReport.id == report_id, ShareReport.user_id == user.id)
    )
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(status_code=404, detail="Share report not found")

    report.token_hash = token_hash
    if expires_in_days is not None:
        report.expires_at = compute_expires_at(expires_in_days)

    # Rotation starts a fresh view counter for max-view links.
    report.view_count = 0
    report.first_viewed_at = None
    report.last_viewed_at = None

    await session.commit()
    await session.refresh(report)

    return ShareReportCreateResponse(
        id=report.id,
        token=token,
        tool_id=report.tool_id,
        mode=report.mode,  # type: ignore[arg-type]
        created_at=report.created_at,
        expires_at=report.expires_at,
        max_views=report.max_views,
    )


@router.delete("/{report_id}")
async def revoke_share_report(
    report_id: uuid.UUID,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session),
) -> dict:
    result = await session.execute(
        select(ShareReport).where(ShareReport.id == report_id, ShareReport.user_id == user.id)
    )
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(status_code=404, detail="Share report not found")

    report.revoked_at = datetime.now(timezone.utc)
    await session.commit()
    return {"status": "revoked"}
