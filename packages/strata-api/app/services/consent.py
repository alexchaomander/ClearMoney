from fastapi import HTTPException
from sqlalchemy import delete, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.agent_session import AgentSession, Recommendation
from app.models.consent import ConsentGrant, ConsentStatus
from app.models.decision_trace import DecisionTrace
from app.models.connection import Connection, ConnectionStatus


class ConsentService:
    def __init__(self, session: AsyncSession):
        self._session = session

    async def require_scopes(self, user_id, required_scopes: list[str]) -> ConsentGrant:
        if not required_scopes:
            raise HTTPException(status_code=500, detail="Consent scopes not configured")

        result = await self._session.execute(
            select(ConsentGrant)
            .where(
                ConsentGrant.user_id == user_id,
                ConsentGrant.status == ConsentStatus.active,
            )
            .order_by(ConsentGrant.created_at.desc())
        )
        grants = result.scalars().all()

        for grant in grants:
            if set(required_scopes).issubset(set(grant.scopes)):
                return grant

        raise HTTPException(
            status_code=403,
            detail=f"Missing consent for scopes: {', '.join(required_scopes)}",
        )

    async def revoke_and_purge(self, consent: ConsentGrant) -> None:
        consent.status = ConsentStatus.revoked
        await self._session.commit()
        await self._session.execute(
            delete(DecisionTrace).where(DecisionTrace.user_id == consent.user_id)
        )
        await self._session.execute(
            delete(Recommendation).where(Recommendation.user_id == consent.user_id)
        )
        await self._session.execute(
            delete(AgentSession).where(AgentSession.user_id == consent.user_id)
        )
        await self._session.execute(
            update(Connection)
            .where(Connection.user_id == consent.user_id)
            .values(
                credentials=None,
                status=ConnectionStatus.inactive,
                error_code="CONSENT_REVOKED",
                error_message="Consent revoked; connection disabled.",
            )
        )
        await self._session.commit()
