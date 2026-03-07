import logging
import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.action_intent import ActionIntent
from app.models.agent_session import AgentSession
from app.models.connection import Connection
from app.models.consent import ConsentGrant
from app.models.notification import Notification
from app.models.tax_document import TaxDocument
from app.models.tax_plan_workspace import TaxPlan
from app.models.user import User
from app.services.financial_context import build_financial_context
from app.services.providers.plaid import PlaidProvider
from app.services.providers.snaptrade import SnapTradeProvider

logger = logging.getLogger(__name__)


async def export_user_data(user_id: uuid.UUID, session: AsyncSession) -> dict:
    """Return a comprehensive JSON export of all user data.

    Reuses build_financial_context() for the bulk of financial data,
    then appends consent grants, advisor sessions, tax plans, tax
    documents metadata, action intents, and notifications.
    """
    financial_context = await build_financial_context(user_id, session)

    # Consent grants
    consent_result = await session.execute(
        select(ConsentGrant).where(ConsentGrant.user_id == user_id)
    )
    consent_grants = consent_result.scalars().all()

    # Advisor sessions with messages
    sessions_result = await session.execute(
        select(AgentSession).where(AgentSession.user_id == user_id)
    )
    advisor_sessions = sessions_result.scalars().all()

    # Tax plans
    tax_plans_result = await session.execute(
        select(TaxPlan).where(TaxPlan.user_id == user_id)
    )
    tax_plans = tax_plans_result.scalars().all()

    # Tax documents metadata (no binary content)
    tax_docs_result = await session.execute(
        select(TaxDocument).where(TaxDocument.user_id == user_id)
    )
    tax_documents = tax_docs_result.scalars().all()

    # Action intents
    intents_result = await session.execute(
        select(ActionIntent).where(ActionIntent.user_id == user_id)
    )
    action_intents = intents_result.scalars().all()

    # Notifications
    notif_result = await session.execute(
        select(Notification).where(Notification.user_id == user_id)
    )
    notifications = notif_result.scalars().all()

    return {
        **financial_context,
        "consent_grants": [
            {
                "id": str(g.id),
                "scopes": g.scopes,
                "purpose": g.purpose,
                "status": g.status.value,
                "source": g.source,
                "created_at": g.created_at.isoformat() if g.created_at else None,
            }
            for g in consent_grants
        ],
        "advisor_sessions": [
            {
                "id": str(s.id),
                "skill_name": s.skill_name,
                "status": s.status.value,
                "messages": s.messages,
                "created_at": s.created_at.isoformat() if s.created_at else None,
            }
            for s in advisor_sessions
        ],
        "tax_plans": [
            {
                "id": str(tp.id),
                "name": tp.name,
                "household_name": tp.household_name,
                "status": tp.status,
                "created_at": tp.created_at.isoformat() if tp.created_at else None,
            }
            for tp in tax_plans
        ],
        "tax_documents": [
            {
                "id": str(td.id),
                "original_filename": td.original_filename,
                "document_type": td.document_type,
                "tax_year": td.tax_year,
                "status": td.status,
                "created_at": td.created_at.isoformat() if td.created_at else None,
            }
            for td in tax_documents
        ],
        "action_intents": [
            {
                "id": str(ai.id),
                "intent_type": ai.intent_type.value,
                "status": ai.status.value,
                "title": ai.title,
                "description": ai.description,
                "payload": ai.payload,
                "impact_summary": ai.impact_summary,
                "created_at": ai.created_at.isoformat() if ai.created_at else None,
            }
            for ai in action_intents
        ],
        "notifications": [
            {
                "id": str(n.id),
                "type": n.type.value,
                "severity": n.severity.value,
                "title": n.title,
                "message": n.message,
                "is_read": n.is_read,
                "created_at": n.created_at.isoformat() if n.created_at else None,
            }
            for n in notifications
        ],
        "export_metadata": {
            "exported_at": datetime.now(timezone.utc).isoformat(),
            "format_version": "1.0",
        },
    }


async def delete_user_account(user_id: uuid.UUID, session: AsyncSession) -> None:
    """Delete a user account and all associated data.

    Steps:
    1. Revoke active provider connections (Plaid/SnapTrade) so external
       access tokens are invalidated.
    2. Delete the user row. Because the User model defines
       cascade="all, delete-orphan" on all relationships and all child
       tables use ``ondelete="CASCADE"`` foreign keys, the database
       handles the rest.
    3. Commit the transaction.
    """
    # 1. Revoke external provider connections
    conn_result = await session.execute(
        select(Connection).where(Connection.user_id == user_id)
    )
    connections = conn_result.scalars().all()

    for connection in connections:
        try:
            if connection.provider == "plaid":
                provider = PlaidProvider()
                await provider.delete_connection(connection)
            elif connection.provider == "snaptrade":
                provider = SnapTradeProvider()
                await provider.delete_connection(connection)
        except Exception:
            logger.warning(
                "Failed to revoke %s connection %s for user %s, proceeding with deletion",
                connection.provider,
                connection.id,
                user_id,
            )

    # 2. Delete user row — cascades handle all child records
    user_result = await session.execute(
        select(User).where(User.id == user_id)
    )
    user = user_result.scalar_one_or_none()
    if user is None:
        return

    await session.delete(user)

    # 3. Commit
    await session.commit()

    logger.info("Deleted user account %s with %d connections revoked", user_id, len(connections))
