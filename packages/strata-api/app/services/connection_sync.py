from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.connection import Connection
from app.models.holding import Holding
from app.models.investment_account import InvestmentAccount
from app.models.security import Security
from app.models.transaction import Transaction, TransactionType
from app.services.providers.base import BaseProvider
from app.services.user_refresh import refresh_user_financials


async def sync_connection_accounts(
    session: AsyncSession,
    connection: Connection,
    provider: BaseProvider,
) -> None:
    """Sync accounts, holdings, and transactions for a connection."""
    normalized_accounts = await provider.get_accounts(connection)

    for normalized_account in normalized_accounts:
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
            account.name = normalized_account.name
            account.balance = normalized_account.balance
            account.account_type = normalized_account.account_type
            account.is_tax_advantaged = normalized_account.is_tax_advantaged

        await session.flush()

        normalized_holdings = await provider.get_holdings(
            connection,
            normalized_account.provider_account_id,
        )

        await session.execute(
            delete(Holding).where(Holding.account_id == account.id)
        )

        for normalized_holding in normalized_holdings:
            security = await get_or_create_security(
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

        await sync_account_transactions(
            session,
            connection,
            account,
            provider,
        )

    await session.flush()
    await refresh_user_financials(session, connection.user_id, commit=False)


async def get_or_create_security(
    session: AsyncSession,
    normalized_security,
) -> Security:
    """Get or create a security from normalized data."""
    if normalized_security.ticker:
        result = await session.execute(
            select(Security).where(Security.ticker == normalized_security.ticker)
        )
        security = result.scalar_one_or_none()
        if security:
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


async def sync_account_transactions(
    session: AsyncSession,
    connection: Connection,
    account: InvestmentAccount,
    provider: BaseProvider,
) -> None:
    normalized_transactions = await provider.get_transactions(
        connection,
        account.provider_account_id or "",
    )

    await session.execute(
        delete(Transaction).where(Transaction.account_id == account.id)
    )

    for normalized in normalized_transactions:
        security_id = None
        if normalized.security is not None:
            security = await get_or_create_security(session, normalized.security)
            security_id = security.id

        transaction = Transaction(
            account_id=account.id,
            security_id=security_id,
            provider_transaction_id=normalized.provider_transaction_id,
            type=normalized.transaction_type or TransactionType.other,
            quantity=normalized.quantity,
            price=normalized.price,
            amount=normalized.amount,
            trade_date=normalized.trade_date,
            settlement_date=normalized.settlement_date,
            currency=normalized.currency or "USD",
            description=normalized.description,
            source=normalized.source or connection.provider,
        )
        session.add(transaction)

    await session.flush()
