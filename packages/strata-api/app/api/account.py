import logging

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db, require_step_up
from app.core.rate_limit import limiter
from app.models.user import User
from app.schemas.user import UserResponse
from app.services.account_management import delete_user_account, export_user_data

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/account", tags=["Account Management"])


@router.get("/me", response_model=UserResponse)
async def get_me(
    current_user: User = Depends(get_current_user),
) -> UserResponse:
    """Get the current user's profile and plan information."""
    return UserResponse.model_validate(current_user)


from app.services.billing import BillingService

@router.post("/upgrade")
async def upgrade_account(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Create a Stripe checkout session for upgrading to Premium."""
    billing_service = BillingService(db)
    
    # In a real app, these would come from environment variables or be dynamic
    success_url = str(request.base_url).rstrip("/") + "/settings?tab=billing&session_id={CHECKOUT_SESSION_ID}"
    cancel_url = str(request.base_url).rstrip("/") + "/settings?tab=billing"
    
    checkout_url = await billing_service.create_checkout_session(
        current_user, success_url, cancel_url
    )
    return {"checkout_url": checkout_url}


@router.get("/invoices")
async def get_invoices(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list:
    """Get the user's billing history from Stripe."""
    billing_service = BillingService(db)
    return await billing_service.get_invoices(current_user)


@router.get("/export")
@limiter.limit("5/minute")
async def export_account_data(
    request: Request,
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
@limiter.limit("3/minute")
async def delete_account(
    request: Request,
    current_user: User = Depends(get_current_user),
    _step_up: None = Depends(require_step_up),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Permanently delete the user's account and all associated data.

    This is an irreversible action that requires step-up authentication
    via the ``X-Step-Up-Token`` header.
    """
    try:
        await delete_user_account(current_user.id, db)
    except ValueError:
        raise HTTPException(status_code=404, detail="User not found")
    return {"status": "deleted"}
