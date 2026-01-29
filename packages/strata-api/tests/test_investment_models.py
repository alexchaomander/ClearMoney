import uuid
from datetime import date, datetime
from decimal import Decimal

import pytest
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import (
    Connection,
    ConnectionStatus,
    Holding,
    Institution,
    InvestmentAccount,
    InvestmentAccountType,
    Security,
    SecurityType,
    User,
)


@pytest.mark.asyncio
async def test_create_institution(session: AsyncSession) -> None:
    institution = Institution(
        name="Fidelity",
        logo_url="https://example.com/fidelity.png",
        providers={"snaptrade": {"brokerage_id": "fidelity123"}},
    )
    session.add(institution)
    await session.commit()

    result = await session.execute(
        select(Institution).where(Institution.name == "Fidelity")
    )
    fetched = result.scalar_one()
    assert fetched.name == "Fidelity"
    assert fetched.logo_url == "https://example.com/fidelity.png"
    assert fetched.providers == {"snaptrade": {"brokerage_id": "fidelity123"}}
    assert isinstance(fetched.id, uuid.UUID)


@pytest.mark.asyncio
async def test_create_investment_account(session: AsyncSession) -> None:
    user = User(clerk_id="clerk_inv_001", email="investor@example.com")
    session.add(user)
    await session.commit()

    account = InvestmentAccount(
        user_id=user.id,
        name="Retirement 401k",
        account_type=InvestmentAccountType.k401,
        balance=Decimal("125000.00"),
        currency="USD",
        is_tax_advantaged=True,
    )
    session.add(account)
    await session.commit()

    result = await session.execute(
        select(InvestmentAccount).where(InvestmentAccount.user_id == user.id)
    )
    fetched = result.scalar_one()
    assert fetched.name == "Retirement 401k"
    assert fetched.account_type == InvestmentAccountType.k401
    assert fetched.balance == Decimal("125000.00")
    assert fetched.is_tax_advantaged is True
    assert fetched.currency == "USD"


@pytest.mark.asyncio
async def test_create_investment_account_with_institution(session: AsyncSession) -> None:
    user = User(clerk_id="clerk_inv_002", email="inst_investor@example.com")
    institution = Institution(name="Schwab", providers={})
    session.add(user)
    session.add(institution)
    await session.commit()

    account = InvestmentAccount(
        user_id=user.id,
        institution_id=institution.id,
        name="Brokerage Account",
        account_type=InvestmentAccountType.brokerage,
        balance=Decimal("50000.00"),
        is_tax_advantaged=False,
    )
    session.add(account)
    await session.commit()

    result = await session.execute(
        select(InvestmentAccount).where(InvestmentAccount.institution_id == institution.id)
    )
    fetched = result.scalar_one()
    assert fetched.institution_id == institution.id
    assert fetched.account_type == InvestmentAccountType.brokerage


@pytest.mark.asyncio
async def test_create_security(session: AsyncSession) -> None:
    security = Security(
        ticker="AAPL",
        name="Apple Inc.",
        security_type=SecurityType.stock,
        cusip="037833100",
        close_price=Decimal("185.50"),
        close_price_as_of=date(2024, 1, 15),
    )
    session.add(security)
    await session.commit()

    result = await session.execute(
        select(Security).where(Security.ticker == "AAPL")
    )
    fetched = result.scalar_one()
    assert fetched.name == "Apple Inc."
    assert fetched.security_type == SecurityType.stock
    assert fetched.cusip == "037833100"
    assert fetched.close_price == Decimal("185.50")


@pytest.mark.asyncio
async def test_create_security_etf(session: AsyncSession) -> None:
    security = Security(
        ticker="VTI",
        name="Vanguard Total Stock Market ETF",
        security_type=SecurityType.etf,
    )
    session.add(security)
    await session.commit()

    result = await session.execute(
        select(Security).where(Security.ticker == "VTI")
    )
    fetched = result.scalar_one()
    assert fetched.security_type == SecurityType.etf


@pytest.mark.asyncio
async def test_create_holding(session: AsyncSession) -> None:
    user = User(clerk_id="clerk_hold_001", email="holder@example.com")
    session.add(user)
    await session.commit()

    account = InvestmentAccount(
        user_id=user.id,
        name="Brokerage",
        account_type=InvestmentAccountType.brokerage,
        balance=Decimal("10000.00"),
    )
    security = Security(
        ticker="MSFT",
        name="Microsoft Corporation",
        security_type=SecurityType.stock,
    )
    session.add(account)
    session.add(security)
    await session.commit()

    holding = Holding(
        account_id=account.id,
        security_id=security.id,
        quantity=Decimal("50.00"),
        cost_basis=Decimal("15000.00"),
        market_value=Decimal("18500.00"),
        as_of=datetime(2024, 1, 15, 12, 0, 0),
    )
    session.add(holding)
    await session.commit()

    result = await session.execute(
        select(Holding).where(Holding.account_id == account.id)
    )
    fetched = result.scalar_one()
    assert fetched.quantity == Decimal("50.00")
    assert fetched.cost_basis == Decimal("15000.00")
    assert fetched.market_value == Decimal("18500.00")
    assert fetched.security_id == security.id


@pytest.mark.asyncio
async def test_holding_relationships(session: AsyncSession) -> None:
    user = User(clerk_id="clerk_rel_001", email="relationships@example.com")
    session.add(user)
    await session.commit()

    account = InvestmentAccount(
        user_id=user.id,
        name="IRA",
        account_type=InvestmentAccountType.ira,
        balance=Decimal("25000.00"),
    )
    security = Security(
        ticker="GOOGL",
        name="Alphabet Inc.",
        security_type=SecurityType.stock,
    )
    session.add(account)
    session.add(security)
    await session.commit()

    holding = Holding(
        account_id=account.id,
        security_id=security.id,
        quantity=Decimal("10.00"),
        market_value=Decimal("1500.00"),
    )
    session.add(holding)
    await session.commit()

    # Test relationship from account to holdings
    result = await session.execute(
        select(InvestmentAccount).where(InvestmentAccount.id == account.id)
    )
    fetched_account = result.scalar_one()
    await session.refresh(fetched_account, ["holdings"])
    assert len(fetched_account.holdings) == 1
    assert fetched_account.holdings[0].quantity == Decimal("10.00")


@pytest.mark.asyncio
async def test_connection_with_institution(session: AsyncSession) -> None:
    user = User(clerk_id="clerk_conn_inst", email="conn_inst@example.com")
    institution = Institution(name="Vanguard", providers={"snaptrade": {}})
    session.add(user)
    session.add(institution)
    await session.commit()

    connection = Connection(
        user_id=user.id,
        institution_id=institution.id,
        provider="snaptrade",
        provider_user_id="snap_user_123",
        credentials={"user_secret": "encrypted_secret"},
        status=ConnectionStatus.active,
        last_synced_at=datetime(2024, 1, 15, 10, 0, 0),
    )
    session.add(connection)
    await session.commit()

    result = await session.execute(
        select(Connection).where(Connection.institution_id == institution.id)
    )
    fetched = result.scalar_one()
    assert fetched.provider == "snaptrade"
    assert fetched.last_synced_at == datetime(2024, 1, 15, 10, 0, 0)


@pytest.mark.asyncio
async def test_connection_error_fields(session: AsyncSession) -> None:
    user = User(clerk_id="clerk_conn_err", email="conn_err@example.com")
    session.add(user)
    await session.commit()

    connection = Connection(
        user_id=user.id,
        provider="snaptrade",
        provider_user_id="snap_user_err",
        credentials={},
        status=ConnectionStatus.error,
        error_code="AUTH_EXPIRED",
        error_message="Authentication token has expired",
    )
    session.add(connection)
    await session.commit()

    result = await session.execute(
        select(Connection).where(Connection.user_id == user.id)
    )
    fetched = result.scalar_one()
    assert fetched.status == ConnectionStatus.error
    assert fetched.error_code == "AUTH_EXPIRED"
    assert fetched.error_message == "Authentication token has expired"


@pytest.mark.asyncio
async def test_investment_account_cascade_delete(session: AsyncSession) -> None:
    user = User(clerk_id="clerk_cascade_inv", email="cascade_inv@example.com")
    session.add(user)
    await session.commit()

    account = InvestmentAccount(
        user_id=user.id,
        name="Test Account",
        account_type=InvestmentAccountType.brokerage,
        balance=Decimal("5000.00"),
    )
    security = Security(ticker="TEST", name="Test Security", security_type=SecurityType.stock)
    session.add(account)
    session.add(security)
    await session.commit()

    holding = Holding(
        account_id=account.id,
        security_id=security.id,
        quantity=Decimal("10.00"),
    )
    session.add(holding)
    await session.commit()

    # Delete the account - holdings should cascade
    await session.delete(account)
    await session.commit()

    result = await session.execute(
        select(Holding).where(Holding.account_id == account.id)
    )
    assert result.scalars().all() == []

    # Security should still exist
    result = await session.execute(
        select(Security).where(Security.ticker == "TEST")
    )
    assert result.scalar_one() is not None


@pytest.mark.asyncio
async def test_all_investment_account_types(session: AsyncSession) -> None:
    user = User(clerk_id="clerk_types", email="types@example.com")
    session.add(user)
    await session.commit()

    account_types = [
        InvestmentAccountType.brokerage,
        InvestmentAccountType.ira,
        InvestmentAccountType.roth_ira,
        InvestmentAccountType.k401,
        InvestmentAccountType.hsa,
        InvestmentAccountType.other,
    ]

    for i, acc_type in enumerate(account_types):
        account = InvestmentAccount(
            user_id=user.id,
            name=f"Account {acc_type.value}",
            account_type=acc_type,
            balance=Decimal(str(i * 1000)),
        )
        session.add(account)

    await session.commit()

    result = await session.execute(
        select(InvestmentAccount).where(InvestmentAccount.user_id == user.id)
    )
    accounts = result.scalars().all()
    assert len(accounts) == len(account_types)


@pytest.mark.asyncio
async def test_all_security_types(session: AsyncSession) -> None:
    security_types = [
        (SecurityType.stock, "AAPL_TEST"),
        (SecurityType.etf, "VTI_TEST"),
        (SecurityType.mutual_fund, "VFIAX"),
        (SecurityType.bond, "BOND001"),
        (SecurityType.crypto, "BTC"),
        (SecurityType.cash, "CASH"),
        (SecurityType.option, "OPT001"),
        (SecurityType.other, "OTHER"),
    ]

    for sec_type, ticker in security_types:
        security = Security(
            ticker=ticker,
            name=f"Test {sec_type.value}",
            security_type=sec_type,
        )
        session.add(security)

    await session.commit()

    result = await session.execute(select(Security))
    securities = result.scalars().all()
    assert len(securities) == len(security_types)
