import logging
import secrets
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_scopes
from app.db.session import get_async_session
from app.models.connection import Connection, ConnectionStatus
from app.models.holding import Holding
from app.models.investment_account import InvestmentAccount
from app.models.user import User
from app.schemas.connection import (
    ConnectionCallbackRequest,
    ConnectionResponse,
    LinkSessionRequest,
    LinkSessionResponse,
)
from app.services.connection_sync import sync_connection_accounts
from app.services.providers.snaptrade import SnapTradeProvider

logger = logging.getLogger(__name__)

# In-memory store for pending link sessions (use Redis in production)
# Maps session_token -> {user_id, user_secret, created_at}
_pending_link_sessions: dict[str, dict] = {}

router = APIRouter(prefix="/connections", tags=["connections"])


def get_provider() -> SnapTradeProvider:
    """Get the SnapTrade provider instance."""
    return SnapTradeProvider()


async def _get_user_connection(
    session: AsyncSession,
    connection_id: uuid.UUID,
    user_id: uuid.UUID,
) -> Connection:
    """Get a connection owned by the user or raise 404."""
    result = await session.execute(
        select(Connection).where(
            Connection.id == connection_id,
            Connection.user_id == user_id,
        )
    )
    connection = result.scalar_one_or_none()

    if not connection:
        raise HTTPException(status_code=404, detail="Connection not found")

    return connection


@router.post("/link", response_model=LinkSessionResponse)
async def create_link_session(
    request: LinkSessionRequest,
    user: User = Depends(require_scopes(["connections:write"])),
    provider: SnapTradeProvider = Depends(get_provider),
) -> LinkSessionResponse:
    """Create a link session to connect a new investment account.

    Returns a redirect URL that the client should navigate to for the user
    to authenticate with their brokerage. The session_token should be passed
    back in the callback to retrieve the stored credentials.
    """
    link_session = await provider.create_link_session(
        user_id=str(user.id),
        redirect_uri=request.redirect_uri,
    )

    # Generate a secure session token and store the user_secret server-side
    # In production, use Redis or database with TTL for this
    session_token = secrets.token_urlsafe(32)
    _pending_link_sessions[session_token] = {
        "user_id": str(user.id),
        "user_secret": link_session.user_secret,
        "created_at": datetime.now(timezone.utc),
    }

    # Clean up old sessions (simple cleanup, use TTL in production)
    _cleanup_old_sessions()

    return LinkSessionResponse(
        redirect_url=link_session.redirect_url,
        session_id=session_token,  # Return the session token, not the user_secret
    )


def _cleanup_old_sessions() -> None:
    """Remove sessions older than 15 minutes."""
    cutoff = datetime.now(timezone.utc).timestamp() - 900  # 15 minutes
    expired = [
        token for token, data in _pending_link_sessions.items()
        if data["created_at"].timestamp() < cutoff
    ]
    for token in expired:
        del _pending_link_sessions[token]


@router.post("/callback", response_model=ConnectionResponse)
async def handle_callback(
    request: ConnectionCallbackRequest,
    user: User = Depends(require_scopes(["connections:write"])),
    session: AsyncSession = Depends(get_async_session),
    provider: SnapTradeProvider = Depends(get_provider),
) -> ConnectionResponse:
    """Handle the OAuth callback from the brokerage.

    This endpoint is called after the user completes the connection flow.
    It creates a new Connection record and fetches the initial account data.
    The session_token from the link session must be provided to retrieve credentials.
    """
    if request.error:
        raise HTTPException(
            status_code=400,
            detail=f"Connection failed: {request.error_description or request.error}",
        )

    # Retrieve the user_secret from server-side storage using the session token
    session_token = request.state
    if not session_token or session_token not in _pending_link_sessions:
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired session. Please restart the connection flow.",
        )

    pending_session = _pending_link_sessions.pop(session_token)

    # Verify the session belongs to this user
    if pending_session["user_id"] != str(user.id):
        raise HTTPException(
            status_code=403,
            detail="Session does not belong to this user.",
        )

    user_secret = pending_session["user_secret"]

    # Handle the callback with the provider
    credentials = await provider.handle_callback(
        user_id=str(user.id),
        user_secret=user_secret,
        authorization_id=request.code,
    )

    # Create the connection record
    connection = Connection(
        user_id=user.id,
        provider=provider.provider_name,
        provider_user_id=credentials.get("snaptrade_user_id", ""),
        credentials=credentials,
        status=ConnectionStatus.active,
        last_synced_at=datetime.now(timezone.utc),
    )
    session.add(connection)
    await session.commit()
    await session.refresh(connection)

    # Sync accounts in the background (or trigger a sync job)
    # For MVP, we'll sync inline
    await sync_connection_accounts(session, connection, provider)

    return ConnectionResponse.model_validate(connection)


@router.get("", response_model=list[ConnectionResponse])
async def list_connections(
    user: User = Depends(require_scopes(["connections:read"])),
    session: AsyncSession = Depends(get_async_session),
) -> list[ConnectionResponse]:
    """List all connections for the current user."""
    result = await session.execute(
        select(Connection)
        .where(Connection.user_id == user.id)
        .order_by(Connection.created_at.desc())
    )
    connections = result.scalars().all()

    return [ConnectionResponse.model_validate(c) for c in connections]


@router.delete("/{connection_id}")
async def delete_connection(
    connection_id: uuid.UUID,
    user: User = Depends(require_scopes(["connections:write"])),
    session: AsyncSession = Depends(get_async_session),
    provider: SnapTradeProvider = Depends(get_provider),
) -> dict:
    """Delete a connection and all associated accounts/holdings."""
    connection = await _get_user_connection(session, connection_id, user.id)

    # Delete from provider first
    await provider.delete_connection(connection)

    # Get all investment accounts for this connection
    accounts_result = await session.execute(
        select(InvestmentAccount).where(InvestmentAccount.connection_id == connection.id)
    )
    accounts = accounts_result.scalars().all()

    # Delete holdings for each account, then delete the accounts
    for account in accounts:
        await session.execute(
            delete(Holding).where(Holding.account_id == account.id)
        )
        await session.delete(account)

    # Finally delete the connection
    await session.delete(connection)
    await session.commit()

    logger.info(
        f"Deleted connection {connection_id} with {len(accounts)} accounts "
        f"for user {user.id}"
    )

    return {"status": "deleted"}


@router.post("/{connection_id}/sync", response_model=ConnectionResponse)
async def sync_connection(
    connection_id: uuid.UUID,
    user: User = Depends(require_scopes(["connections:write"])),
    session: AsyncSession = Depends(get_async_session),
    provider: SnapTradeProvider = Depends(get_provider),
) -> ConnectionResponse:
    """Manually trigger a sync for a connection."""
    connection = await _get_user_connection(session, connection_id, user.id)

    try:
        await sync_connection_accounts(session, connection, provider)
        connection.status = ConnectionStatus.active
        connection.last_synced_at = datetime.now(timezone.utc)
        connection.error_code = None
        connection.error_message = None
    except Exception as e:
        connection.status = ConnectionStatus.error
        connection.error_code = "SYNC_FAILED"
        connection.error_message = str(e)[:1000]

    await session.commit()
    await session.refresh(connection)

    return ConnectionResponse.model_validate(connection)
