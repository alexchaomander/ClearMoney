import logging
import secrets
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_async_session
from app.models.connection import Connection, ConnectionStatus
from app.models.holding import Holding
from app.models.investment_account import InvestmentAccount
from app.models.security import Security
from app.models.user import User
from app.schemas.connection import (
    ConnectionCallbackRequest,
    ConnectionResponse,
    LinkSessionRequest,
    LinkSessionResponse,
)
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
    user: User = Depends(get_current_user),
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
    user: User = Depends(get_current_user),
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
    await _sync_connection_accounts(session, connection, provider)

    return ConnectionResponse.model_validate(connection)


@router.get("", response_model=list[ConnectionResponse])
async def list_connections(
    user: User = Depends(get_current_user),
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
    user: User = Depends(get_current_user),
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
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session),
    provider: SnapTradeProvider = Depends(get_provider),
) -> ConnectionResponse:
    """Manually trigger a sync for a connection."""
    connection = await _get_user_connection(session, connection_id, user.id)

    try:
        await _sync_connection_accounts(session, connection, provider)
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


async def _sync_connection_accounts(
    session: AsyncSession,
    connection: Connection,
    provider: SnapTradeProvider,
) -> None:
    """Sync accounts and holdings for a connection."""
    # Get accounts from provider
    normalized_accounts = await provider.get_accounts(connection)

    for normalized_account in normalized_accounts:
        # Find or create investment account
        result = await session.execute(
            select(InvestmentAccount).where(
                InvestmentAccount.connection_id == connection.id,
                InvestmentAccount.provider_account_id == normalized_account.provider_account_id,
            )
        )
        account = result.scalar_one_or_none()

        if account is None:
            account = InvestmentAccount(
                user_id=connection.user_id,
                connection_id=connection.id,
                provider_account_id=normalized_account.provider_account_id,
                name=normalized_account.name,
                account_type=normalized_account.account_type,
                balance=normalized_account.balance,
                currency=normalized_account.currency,
                is_tax_advantaged=normalized_account.is_tax_advantaged,
            )
            session.add(account)
        else:
            # Update existing account
            account.name = normalized_account.name
            account.balance = normalized_account.balance
            account.account_type = normalized_account.account_type
            account.is_tax_advantaged = normalized_account.is_tax_advantaged

        await session.flush()

        # Get holdings for this account
        normalized_holdings = await provider.get_holdings(
            connection,
            normalized_account.provider_account_id,
        )

        # Delete existing holdings before recreating
        await session.execute(
            delete(Holding).where(Holding.account_id == account.id)
        )

        # Create new holdings
        for normalized_holding in normalized_holdings:
            # Find or create security
            security = await _get_or_create_security(
                session,
                normalized_holding.security,
            )

            holding = Holding(
                account_id=account.id,
                security_id=security.id,
                quantity=normalized_holding.quantity,
                cost_basis=normalized_holding.cost_basis,
                market_value=normalized_holding.market_value,
                as_of=normalized_holding.as_of,
            )
            session.add(holding)

    await session.commit()


async def _get_or_create_security(
    session: AsyncSession,
    normalized_security,
) -> Security:
    """Get or create a security from normalized data."""
    # Try to find by ticker first
    if normalized_security.ticker:
        result = await session.execute(
            select(Security).where(Security.ticker == normalized_security.ticker)
        )
        security = result.scalar_one_or_none()
        if security:
            # Update price only if we have newer data
            new_price_date = (
                normalized_security.close_price_as_of.date()
                if normalized_security.close_price_as_of
                else None
            )
            should_update = (
                normalized_security.close_price is not None
                and (
                    security.close_price_as_of is None
                    or (new_price_date and new_price_date > security.close_price_as_of)
                )
            )
            if should_update:
                security.close_price = normalized_security.close_price
                security.close_price_as_of = new_price_date
            return security

    # Create new security
    security = Security(
        ticker=normalized_security.ticker,
        name=normalized_security.name,
        security_type=normalized_security.security_type,
        cusip=normalized_security.cusip,
        isin=normalized_security.isin,
        close_price=normalized_security.close_price,
        close_price_as_of=(
            normalized_security.close_price_as_of.date()
            if normalized_security.close_price_as_of
            else None
        ),
    )
    session.add(security)
    await session.flush()

    return security
