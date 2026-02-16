from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_scopes
from app.db.session import get_async_session
from app.models.user import User
from app.schemas.action_policy import ActionPolicyRequest, ActionPolicyResponse
from app.services.action_policy import ActionPolicyService

router = APIRouter(prefix="/agent/action-policy", tags=["agent"])


@router.get("", response_model=ActionPolicyResponse)
async def get_action_policy(
    user: User = Depends(require_scopes(["agent:read"])),
    session: AsyncSession = Depends(get_async_session),
) -> ActionPolicyResponse:
    service = ActionPolicyService(session)
    policy = await service.get_policy(user.id)
    if policy is None:
        raise HTTPException(status_code=404, detail="Action policy not configured")
    return ActionPolicyResponse.model_validate(policy)


@router.put("", response_model=ActionPolicyResponse)
async def upsert_action_policy(
    data: ActionPolicyRequest,
    user: User = Depends(require_scopes(["agent:write"])),
    session: AsyncSession = Depends(get_async_session),
) -> ActionPolicyResponse:
    service = ActionPolicyService(session)
    policy = await service.upsert_policy(
        user_id=user.id,
        allowed_actions=data.allowed_actions,
        max_amount=data.max_amount,
        require_confirmation=data.require_confirmation,
        require_mfa=data.require_mfa,
        status=data.status,
    )
    return ActionPolicyResponse.model_validate(policy)
