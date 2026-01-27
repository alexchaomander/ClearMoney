import uuid
from decimal import Decimal

import pytest
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import (
    CashAccount,
    CashAccountType,
    Connection,
    ConnectionStatus,
    DebtAccount,
    DebtType,
    IncomeFrequency,
    IncomeSource,
    IncomeSourceType,
    User,
)


@pytest.mark.asyncio
async def test_create_user(session: AsyncSession) -> None:
    user = User(clerk_id="clerk_123", email="test@example.com")
    session.add(user)
    await session.commit()

    result = await session.execute(select(User).where(User.clerk_id == "clerk_123"))
    fetched = result.scalar_one()
    assert fetched.email == "test@example.com"
    assert isinstance(fetched.id, uuid.UUID)


@pytest.mark.asyncio
async def test_create_cash_account(session: AsyncSession) -> None:
    user = User(clerk_id="clerk_456", email="cash@example.com")
    session.add(user)
    await session.commit()

    account = CashAccount(
        user_id=user.id,
        name="Checking",
        account_type=CashAccountType.checking,
        balance=Decimal("1500.50"),
        institution_name="Test Bank",
    )
    session.add(account)
    await session.commit()

    result = await session.execute(
        select(CashAccount).where(CashAccount.user_id == user.id)
    )
    fetched = result.scalar_one()
    assert fetched.name == "Checking"
    assert fetched.balance == Decimal("1500.50")


@pytest.mark.asyncio
async def test_create_debt_account(session: AsyncSession) -> None:
    user = User(clerk_id="clerk_789", email="debt@example.com")
    session.add(user)
    await session.commit()

    debt = DebtAccount(
        user_id=user.id,
        name="Credit Card",
        debt_type=DebtType.credit_card,
        balance=Decimal("2500.00"),
        interest_rate=Decimal("19.9900"),
        minimum_payment=Decimal("50.00"),
    )
    session.add(debt)
    await session.commit()

    result = await session.execute(
        select(DebtAccount).where(DebtAccount.user_id == user.id)
    )
    fetched = result.scalar_one()
    assert fetched.debt_type == DebtType.credit_card
    assert fetched.interest_rate == Decimal("19.9900")


@pytest.mark.asyncio
async def test_create_income_source(session: AsyncSession) -> None:
    user = User(clerk_id="clerk_inc", email="income@example.com")
    session.add(user)
    await session.commit()

    income = IncomeSource(
        user_id=user.id,
        name="Day Job",
        source_type=IncomeSourceType.salary,
        amount=Decimal("5000.00"),
        frequency=IncomeFrequency.monthly,
        is_variable=False,
    )
    session.add(income)
    await session.commit()

    result = await session.execute(
        select(IncomeSource).where(IncomeSource.user_id == user.id)
    )
    fetched = result.scalar_one()
    assert fetched.frequency == IncomeFrequency.monthly
    assert fetched.is_variable is False


@pytest.mark.asyncio
async def test_create_connection(session: AsyncSession) -> None:
    user = User(clerk_id="clerk_conn", email="conn@example.com")
    session.add(user)
    await session.commit()

    conn = Connection(
        user_id=user.id,
        provider="plaid",
        provider_user_id="plaid_user_123",
        status=ConnectionStatus.active,
    )
    session.add(conn)
    await session.commit()

    result = await session.execute(
        select(Connection).where(Connection.user_id == user.id)
    )
    fetched = result.scalar_one()
    assert fetched.provider == "plaid"
    assert fetched.status == ConnectionStatus.active


@pytest.mark.asyncio
async def test_cascade_delete(session: AsyncSession) -> None:
    user = User(clerk_id="clerk_cascade", email="cascade@example.com")
    session.add(user)
    await session.commit()

    account = CashAccount(
        user_id=user.id,
        name="Savings",
        account_type=CashAccountType.savings,
        balance=Decimal("1000.00"),
    )
    session.add(account)
    await session.commit()

    await session.delete(user)
    await session.commit()

    result = await session.execute(select(CashAccount))
    assert result.scalars().all() == []
