import logging

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db, require_step_up
from app.models.user import User
from app.services.account_management import delete_user_account, export_user_data

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/account", tags=["Account Management"])


@router.get("/export")
async def export_account_data(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Export all user data as a comprehensive JSON document.

    Returns the user's complete financial context, consent grants,
    advisor sessions, tax plans, tax documents metadata, action
    intents, and notifications.
    """
    return await export_user_data(current_user.id, db)


@router.delete("")
async def delete_account(
    current_user: User = Depends(get_current_user),
    _step_up: None = Depends(require_step_up),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Permanently delete the user's account and all associated data.

    This is an irreversible action that requires step-up authentication
    via the ``X-Step-Up-Token`` header.
    """
    await delete_user_account(current_user.id, db)
    return {"status": "deleted"}
