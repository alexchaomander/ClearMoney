import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_scopes, require_step_up
from app.db.session import get_async_session
from app.models.user import User
from app.schemas.action_approval import ActionApprovalResponse
from app.services.action_approval import ActionApprovalService

router = APIRouter(prefix="/agent/action-approvals", tags=["agent"])


@router.post("/{approval_id}/approve", response_model=ActionApprovalResponse)
async def approve_action(
    approval_id: uuid.UUID,
    user: User = Depends(require_scopes(["agent:write"])),
    _: None = Depends(require_step_up),
    session: AsyncSession = Depends(get_async_session),
) -> ActionApprovalResponse:
    service = ActionApprovalService(session)
    approval = await service.approve(approval_id, user.id)
    return ActionApprovalResponse.model_validate(approval)


@router.post("/{approval_id}/reject", response_model=ActionApprovalResponse)
async def reject_action(
    approval_id: uuid.UUID,
    user: User = Depends(require_scopes(["agent:write"])),
    _: None = Depends(require_step_up),
    session: AsyncSession = Depends(get_async_session),
) -> ActionApprovalResponse:
    service = ActionApprovalService(session)
    approval = await service.reject(approval_id, user.id)
    return ActionApprovalResponse.model_validate(approval)
