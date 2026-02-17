import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_scopes
from app.db.session import get_async_session
from app.models.notification import Notification
from app.models.user import User
from app.schemas.notification import NotificationResponse, NotificationUpdate

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("", response_model=list[NotificationResponse])
async def list_notifications(
    user: User = Depends(require_scopes(["notifications:read"])),
    session: AsyncSession = Depends(get_async_session),
) -> list[NotificationResponse]:
    result = await session.execute(
        select(Notification)
        .where(Notification.user_id == user.id)
        .order_by(Notification.created_at.desc())
    )
    notifications = result.scalars().all()
    return [NotificationResponse.model_validate(n) for n in notifications]


@router.patch("/{notification_id}", response_model=NotificationResponse)
async def update_notification(
    notification_id: uuid.UUID,
    data: NotificationUpdate,
    user: User = Depends(require_scopes(["notifications:write"])),
    session: AsyncSession = Depends(get_async_session),
) -> NotificationResponse:
    result = await session.execute(
        select(Notification).where(
            Notification.id == notification_id,
            Notification.user_id == user.id,
        )
    )
    notification = result.scalar_one_or_none()
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")

    if data.is_read is not None:
        notification.is_read = data.is_read

    await session.commit()
    await session.refresh(notification)
    return NotificationResponse.model_validate(notification)


@router.post("/mark-all-read")
async def mark_all_read(
    user: User = Depends(require_scopes(["notifications:write"])),
    session: AsyncSession = Depends(get_async_session),
):
    await session.execute(
        update(Notification)
        .where(Notification.user_id == user.id)
        .values(is_read=True)
    )
    await session.commit()
    return {"status": "ok"}
