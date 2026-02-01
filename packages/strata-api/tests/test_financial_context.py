"""Tests for financial context building and markdown rendering."""

from decimal import Decimal

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import (
    CashAccount,
    DebtAccount,
    FinancialMemory,
    Holding,
    Institution,
    InvestmentAccount,
    Security,
    User,
)
from app.models.cash_account import CashAccountType
from app.models.debt_account import DebtType
from app.models.financial_memory import FilingStatus
from app.models.investment_account import InvestmentAccountType
from app.models.security import SecurityType
from app.services.financial_context import build_financial_context
from app.services.context_renderer import render_context_as_markdown


@pytest.fixture
async def user(session: AsyncSession) -> User:
    user = User(clerk_id="ctx_test_user", email="ctx@example.com")
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user


@pytest.fixture
async def memory(session: AsyncSession, user: User) -> FinancialMemory:
    mem = FinancialMemory(
        user_id=user.id,
        age=35,
        state="NY",
        filing_status=FilingStatus.married_filing_jointly,
        annual_income=Decimal("150000.00"),
        monthly_income=Decimal("10000.00"),
        average_monthly_expenses=Decimal("5000.00"),
        retirement_age=65,
        current_retirement_savings=Decimal("200000.00"),
    )
    session.add(mem)
    await session.commit()
    await session.refresh(mem)
    return mem


@pytest.fixture
async def institution(session: AsyncSession) -> Institution:
    inst = Institution(
        name="Test Brokerage",
        logo_url="https://example.com/logo.png",
        providers={},
    )
    session.add(inst)
    await session.commit()
    await session.refresh(inst)
    return inst


@pytest.fixture
async def accounts_and_holdings(
    session: AsyncSession, user: User, institution: Institution
) -> dict:
    acct = InvestmentAccount(
        user_id=user.id,
        institution_id=institution.id,
        name="Brokerage",
        account_type=InvestmentAccountType.brokerage,
        balance=Decimal("100000.00"),
        is_tax_advantaged=False,
    )
    cash = CashAccount(
        user_id=user.id,
        name="Checking",
        account_type=CashAccountType.checking,
        balance=Decimal("5000.00"),
        institution_name="Local Bank",
    )
    debt = DebtAccount(
        user_id=user.id,
        name="Student Loan",
        debt_type=DebtType.student_loan,
        balance=Decimal("25000.00"),
        interest_rate=Decimal("5.5"),
        minimum_payment=Decimal("300.00"),
    )
    session.add_all([acct, cash, debt])
    await session.commit()
    await session.refresh(acct)

    sec = Security(
        ticker="VTI",
        name="Vanguard Total Stock",
        security_type=SecurityType.etf,
        close_price=Decimal("250.00"),
    )
    session.add(sec)
    await session.commit()
    await session.refresh(sec)

    holding = Holding(
        account_id=acct.id,
        security_id=sec.id,
        quantity=Decimal("400"),
        cost_basis=Decimal("80000.00"),
        market_value=Decimal("100000.00"),
    )
    session.add(holding)
    await session.commit()

    return {"account": acct, "cash": cash, "debt": debt, "holding": holding}


# --- build_financial_context ---


@pytest.mark.asyncio
async def test_context_empty_user(session: AsyncSession, user: User) -> None:
    """Context for a user with no data should still return a valid structure."""
    ctx = await build_financial_context(user.id, session)
    assert "profile" in ctx
    assert "accounts" in ctx
    assert "holdings" in ctx
    assert "portfolio_metrics" in ctx
    assert "data_freshness" in ctx


@pytest.mark.asyncio
async def test_context_includes_profile(
    session: AsyncSession, user: User, memory: FinancialMemory
) -> None:
    ctx = await build_financial_context(user.id, session)
    profile = ctx["profile"]
    assert profile["age"] == 35
    assert profile["state"] == "NY"
    assert profile["filing_status"] == "married_filing_jointly"
    assert float(profile["annual_income"]) == 150000.00


@pytest.mark.asyncio
async def test_context_includes_accounts(
    session: AsyncSession, user: User, memory: FinancialMemory, accounts_and_holdings: dict
) -> None:
    ctx = await build_financial_context(user.id, session)
    accounts = ctx["accounts"]
    assert len(accounts["investment"]) >= 1
    assert len(accounts["cash"]) >= 1
    assert len(accounts["debt"]) >= 1


@pytest.mark.asyncio
async def test_context_includes_holdings(
    session: AsyncSession, user: User, memory: FinancialMemory, accounts_and_holdings: dict
) -> None:
    ctx = await build_financial_context(user.id, session)
    assert len(ctx["holdings"]) >= 1
    holding = ctx["holdings"][0]
    assert "ticker" in holding or "name" in holding


@pytest.mark.asyncio
async def test_context_portfolio_metrics(
    session: AsyncSession, user: User, memory: FinancialMemory, accounts_and_holdings: dict
) -> None:
    ctx = await build_financial_context(user.id, session)
    metrics = ctx["portfolio_metrics"]
    # Net worth = investments + cash - debt = 100000 + 5000 - 25000 = 80000
    assert metrics["net_worth"] is not None
    # Runway = 5000 (cash) / 5000 (expenses) = 1.0 month
    # Note: Using the fixtures defined above
    assert metrics.get("runway_months") == 1.0
    
    profile = ctx["profile"]
    assert profile.get("average_monthly_expenses") == 5000.00


# --- render_context_as_markdown ---


@pytest.mark.asyncio
async def test_markdown_rendering(
    session: AsyncSession, user: User, memory: FinancialMemory, accounts_and_holdings: dict
) -> None:
    ctx = await build_financial_context(user.id, session)
    md = render_context_as_markdown(ctx)
    assert isinstance(md, str)
    assert len(md) > 0
    # Should contain key section headers
    assert "Profile" in md or "profile" in md.lower()


@pytest.mark.asyncio
async def test_markdown_empty_context(session: AsyncSession, user: User) -> None:
    """Markdown rendering of an empty context should not crash."""
    ctx = await build_financial_context(user.id, session)
    md = render_context_as_markdown(ctx)
    assert isinstance(md, str)
