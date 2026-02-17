from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.agent_action_policy import ActionPolicyStatus, AgentActionPolicy
from app.services.action_approval import ActionApprovalService


class ActionPolicyService:
    def __init__(self, session: AsyncSession):
        self._session = session

    async def get_policy(self, user_id) -> AgentActionPolicy | None:
        result = await self._session.execute(
            select(AgentActionPolicy)
            .where(
                AgentActionPolicy.user_id == user_id,
                AgentActionPolicy.status == ActionPolicyStatus.active,
            )
            .order_by(AgentActionPolicy.created_at.desc())
        )
        return result.scalar_one_or_none()

    async def upsert_policy(
        self,
        *,
        user_id,
        allowed_actions: list[str],
        max_amount: float | None,
        require_confirmation: bool,
        require_mfa: bool,
        status: str,
    ) -> AgentActionPolicy:
        policy = await self.get_policy(user_id)
        if policy is None:
            policy = AgentActionPolicy(user_id=user_id)
            self._session.add(policy)

        policy.allowed_actions = allowed_actions
        policy.max_amount = max_amount
        policy.require_confirmation = require_confirmation
        policy.require_mfa = require_mfa
        policy.status = ActionPolicyStatus(status)
        await self._session.commit()
        await self._session.refresh(policy)
        return policy

    async def validate_action(
        self,
        *,
        user_id,
        action_type: str,
        amount: float | None = None,
        payload: dict | None = None,
    ) -> None:
        policy = await self.get_policy(user_id)
        if policy is None:
            raise HTTPException(status_code=403, detail="No action policy configured")
        if action_type not in policy.allowed_actions:
            raise HTTPException(
                status_code=403,
                detail=f"Action '{action_type}' is not allowed by policy",
            )
        if policy.max_amount is not None and amount is not None:
            if amount > float(policy.max_amount):
                raise HTTPException(
                    status_code=403,
                    detail="Action amount exceeds configured policy limit",
                )
        if policy.require_confirmation:
            approval_service = ActionApprovalService(self._session)
            approval = await approval_service.create_approval(
                user_id=user_id,
                action_type=action_type,
                payload=payload or {},
            )
            raise HTTPException(
                status_code=403,
                detail={
                    "error": "approval_required",
                    "approval_id": str(approval.id),
                },
            )
