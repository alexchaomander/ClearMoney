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
    )


@router.get("/{report_id}", response_model=ShareReportPublicResponse)
async def get_share_report(
    report_id: uuid.UUID,
    token: str = Query(min_length=8, max_length=256),
    session: AsyncSession = Depends(get_async_session),
) -> ShareReportPublicResponse:
    result = await session.execute(select(ShareReport).where(ShareReport.id == report_id))
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(status_code=404, detail="Share report not found")

    if report.revoked_at is not None:
        raise HTTPException(status_code=404, detail="Share report not found")
    if report.expires_at is not None and report.expires_at <= datetime.now(timezone.utc):
        raise HTTPException(status_code=404, detail="Share report not found")

    if _hash_token(token) != report.token_hash:
        raise HTTPException(status_code=404, detail="Share report not found")

    return ShareReportPublicResponse(
        id=report.id,
        tool_id=report.tool_id,
        mode=report.mode,  # type: ignore[arg-type]
        created_at=report.created_at,
        expires_at=report.expires_at,
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
