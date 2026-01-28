import uuid
from datetime import datetime

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
    to authenticate with their brokerage.
    """
    link_session = await provider.create_link_session(
        user_id=str(user.id),
        redirect_uri=request.redirect_uri,
    )

    return LinkSessionResponse(
        redirect_url=link_session.redirect_url,
        session_id=link_session.session_id,
    )


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
    """
    if request.error:
        raise HTTPException(
            status_code=400,
            detail=f"Connection failed: {request.error_description or request.error}",
        )

    # Get the user secret from the request state (stored during link session)
    # In a real implementation, you'd retrieve this from a session store
    user_secret = request.state if hasattr(request, "state") else None

    if not user_secret:
        raise HTTPException(
            status_code=400,
            detail="Missing user secret. Please restart the connection flow.",
        )

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
        last_synced_at=datetime.utcnow(),
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

    await provider.delete_connection(connection)
    await session.delete(connection)
    await session.commit()

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
        connection.last_synced_at = datetime.utcnow()
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
            # Update price if we have newer data
            if normalized_security.close_price is not None:
                security.close_price = normalized_security.close_price
                security.close_price_as_of = (
                    normalized_security.close_price_as_of.date()
                    if normalized_security.close_price_as_of
                    else None
                )
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
