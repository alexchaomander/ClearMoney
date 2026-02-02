from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.action_approval import ActionApproval, ActionApprovalStatus


class ActionApprovalService:
    def __init__(self, session: AsyncSession):
        self._session = session

    async def create_approval(
        self,
        *,
        user_id,
        action_type: str,
        payload: dict,
    ) -> ActionApproval:
        approval = ActionApproval(
            user_id=user_id,
            action_type=action_type,
            payload=payload,
            status=ActionApprovalStatus.pending,
        )
        self._session.add(approval)
        await self._session.commit()
        await self._session.refresh(approval)
        return approval

    async def approve(self, approval_id, user_id) -> ActionApproval:
        approval = await self._get_approval(approval_id, user_id)
        approval.status = ActionApprovalStatus.approved
        await self._session.commit()
        await self._session.refresh(approval)
        return approval

    async def reject(self, approval_id, user_id) -> ActionApproval:
        approval = await self._get_approval(approval_id, user_id)
        approval.status = ActionApprovalStatus.rejected
        await self._session.commit()
        await self._session.refresh(approval)
        return approval

    async def _get_approval(self, approval_id, user_id) -> ActionApproval:
        result = await self._session.execute(
            select(ActionApproval).where(
                ActionApproval.id == approval_id,
                ActionApproval.user_id == user_id,
            )
        )
        approval = result.scalar_one_or_none()
        if approval is None:
            raise HTTPException(status_code=404, detail="Approval not found")
        return approval
