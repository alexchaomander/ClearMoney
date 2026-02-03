import uuid
import json
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.cash_account import CashAccount
from app.models.holding import Holding
from app.models.financial_memory import FinancialMemory
from app.models.investment_account import InvestmentAccount
from app.models.debt_account import DebtAccount, DebtType
from app.models.memory_event import MemoryEvent, MemoryEventSource
from app.models.security import Security


async def derive_memory_from_accounts(
    user_id: uuid.UUID,
    memory: FinancialMemory,
    session: AsyncSession,
) -> list[str]:
    """Auto-populate memory fields from linked account data.

    Returns a list of field names that were updated.
    """
    updated_fields: list[str] = []

    updated_fields.extend(await _derive_retirement_savings(user_id, memory, session))
    updated_fields.extend(await _derive_mortgage_details(user_id, memory, session))
    updated_fields.extend(await _derive_debt_profile(user_id, memory, session))
    updated_fields.extend(await _derive_portfolio_summary(user_id, memory, session))

    return updated_fields


async def _derive_retirement_savings(
    user_id: uuid.UUID,
    memory: FinancialMemory,
    session: AsyncSession,
) -> list[str]:
    updated_fields = []
    
    # Derive current_retirement_savings from tax-advantaged accounts
    result = await session.execute(
        select(InvestmentAccount).where(
            InvestmentAccount.user_id == user_id,
            InvestmentAccount.is_tax_advantaged.is_(True),
        )
    )
    tax_advantaged_accounts = result.scalars().all()

    if tax_advantaged_accounts:
        total = sum(
            (a.balance for a in tax_advantaged_accounts), Decimal("0.00")
        )
        old_value = (
            str(memory.current_retirement_savings)
            if memory.current_retirement_savings is not None
            else None
        )
        if memory.current_retirement_savings != total:
            memory.current_retirement_savings = total
            updated_fields.append("current_retirement_savings")
            session.add(
                MemoryEvent(
                    user_id=user_id,
                    field_name="current_retirement_savings",
                    old_value=old_value,
                    new_value=str(total),
                    source=MemoryEventSource.account_sync,
                    context="Derived from sum of tax-advantaged account balances",
                )
            )
            
    return updated_fields


async def _derive_debt_profile(
    user_id: uuid.UUID,
    memory: FinancialMemory,
    session: AsyncSession,
) -> list[str]:
    updated_fields = []

    result = await session.execute(
        select(DebtAccount).where(DebtAccount.user_id == user_id)
    )
    debt_accounts = result.scalars().all()

    if not debt_accounts:
        return updated_fields

    total_balance = sum((a.balance for a in debt_accounts), Decimal("0.00"))
    total_min_payment = sum(
        (a.minimum_payment for a in debt_accounts), Decimal("0.00")
    )

    weighted_rate_sum = Decimal("0.00")
    balance_with_rates = Decimal("0.00")
    for account in debt_accounts:
        if account.interest_rate is not None:
            weighted_rate_sum += account.interest_rate * account.balance
            balance_with_rates += account.balance

    weighted_rate = (
        (weighted_rate_sum / balance_with_rates)
        if balance_with_rates > 0
        else None
    )

    by_type: dict[str, dict] = {}
    for account in debt_accounts:
        key = account.debt_type.value
        if key not in by_type:
            by_type[key] = {
                "count": 0,
                "balance": Decimal("0.00"),
                "minimum_payment": Decimal("0.00"),
                "rate_weighted_sum": Decimal("0.00"),
                "rate_balance": Decimal("0.00"),
            }
        by_type[key]["count"] += 1
        by_type[key]["balance"] += account.balance
        by_type[key]["minimum_payment"] += account.minimum_payment
        if account.interest_rate is not None:
            by_type[key]["rate_weighted_sum"] += account.interest_rate * account.balance
            by_type[key]["rate_balance"] += account.balance

    by_type_serialized: dict[str, dict] = {}
    for key, bucket in by_type.items():
        balance = bucket["balance"]
        rate_balance = bucket["rate_balance"]
        weighted_rate = (
            bucket["rate_weighted_sum"] / rate_balance
            if rate_balance > 0
            else None
        )
        by_type_serialized[key] = {
            "count": bucket["count"],
            "balance": float(balance),
            "minimum_payment": float(bucket["minimum_payment"]),
            "weighted_interest_rate": float(weighted_rate) if weighted_rate is not None else None,
        }

    profile = {
        "total_balance": float(total_balance),
        "total_minimum_payment": float(total_min_payment),
        "weighted_interest_rate": float(weighted_rate) if weighted_rate is not None else None,
        "by_type": by_type_serialized,
    }

    if memory.debt_profile != profile:
        old_value = json.dumps(memory.debt_profile) if memory.debt_profile is not None else None
        memory.debt_profile = profile
        updated_fields.append("debt_profile")
        session.add(
            MemoryEvent(
                user_id=user_id,
                field_name="debt_profile",
                old_value=old_value,
                new_value=json.dumps(profile, sort_keys=True),
                source=MemoryEventSource.account_sync,
                context="Derived from linked debt accounts",
            )
        )

    return updated_fields


async def _derive_portfolio_summary(
    user_id: uuid.UUID,
    memory: FinancialMemory,
    session: AsyncSession,
) -> list[str]:
    updated_fields = []

    inv_result = await session.execute(
        select(InvestmentAccount).where(InvestmentAccount.user_id == user_id)
    )
    investment_accounts = inv_result.scalars().all()

    cash_result = await session.execute(
        select(CashAccount).where(CashAccount.user_id == user_id)
    )
    cash_accounts = cash_result.scalars().all()

    debt_result = await session.execute(
        select(DebtAccount).where(DebtAccount.user_id == user_id)
    )
    debt_accounts = debt_result.scalars().all()

    account_ids = [a.id for a in investment_accounts]
    holdings = []
    if account_ids:
        holdings_result = await session.execute(
            select(Holding, Security)
            .join(Security, Holding.security_id == Security.id)
            .where(Holding.account_id.in_(account_ids))
            .order_by(Holding.market_value.desc().nulls_last())
        )
        holdings = holdings_result.all()

    total_investment = sum(
        (a.balance for a in investment_accounts if a.balance), Decimal("0.00")
    )
    total_cash = sum(
        (a.balance for a in cash_accounts if a.balance), Decimal("0.00")
    )
    total_debt = sum(
        (a.balance for a in debt_accounts if a.balance), Decimal("0.00")
    )
    net_worth = total_investment + total_cash - total_debt

    allocation: dict[str, dict] = {}
    total_holdings_value = Decimal("0.00")
    for holding, security in holdings:
        if holding.market_value is None:
            continue
        total_holdings_value += holding.market_value
        key = security.security_type.value
        if key not in allocation:
            allocation[key] = {"value": Decimal("0.00"), "percent": Decimal("0.00")}
        allocation[key]["value"] += holding.market_value

    allocation_serialized: dict[str, dict] = {}
    if total_holdings_value > 0:
        for key, bucket in allocation.items():
            percent = (bucket["value"] / total_holdings_value) * Decimal("100")
            allocation_serialized[key] = {
                "value": float(bucket["value"]),
                "percent": float(percent.quantize(Decimal("0.01"))),
            }
    else:
        allocation_serialized = {
            key: {"value": float(bucket["value"]), "percent": 0.0}
            for key, bucket in allocation.items()
        }

    top_holdings = []
    for holding, security in holdings[:5]:
        top_holdings.append(
            {
                "ticker": security.ticker,
                "name": security.name,
                "security_type": security.security_type.value,
                "market_value": float(holding.market_value) if holding.market_value is not None else None,
            }
        )

    summary = {
        "total_investment_value": float(total_investment),
        "total_cash_value": float(total_cash),
        "total_debt_value": float(total_debt),
        "net_worth": float(net_worth),
        "allocation_by_security_type": allocation_serialized,
        "top_holdings": top_holdings,
    }

    if memory.portfolio_summary != summary:
        old_value = (
            json.dumps(memory.portfolio_summary)
            if memory.portfolio_summary is not None
            else None
        )
        memory.portfolio_summary = summary
        updated_fields.append("portfolio_summary")
        session.add(
            MemoryEvent(
                user_id=user_id,
                field_name="portfolio_summary",
                old_value=old_value,
                new_value=json.dumps(summary, sort_keys=True),
                source=MemoryEventSource.account_sync,
                context="Derived from holdings and account balances",
            )
        )

    return updated_fields


async def _derive_mortgage_details(
    user_id: uuid.UUID,
    memory: FinancialMemory,
    session: AsyncSession,
) -> list[str]:
    updated_fields = []
    
    # Derive mortgage balance and rate from debt accounts
    result = await session.execute(
        select(DebtAccount).where(
            DebtAccount.user_id == user_id,
            DebtAccount.debt_type == DebtType.mortgage,
        )
    )
    mortgage_accounts = result.scalars().all()
    
    # If we have multiple mortgages, we sum balances and average rates (weighted?)
    # For MVP, we'll just take the primary (largest balance) one or sum balances.
    if mortgage_accounts:
        total_balance = sum(
            (a.balance for a in mortgage_accounts), Decimal("0.00")
        )
        
        # Weighted average interest rate
        weighted_rate_sum = Decimal("0.00")
        total_balance_with_rates = Decimal("0.00")

        for a in mortgage_accounts:
            if a.interest_rate is not None:
                weighted_rate_sum += a.interest_rate * a.balance
                total_balance_with_rates += a.balance

        avg_rate = (
            (weighted_rate_sum / total_balance_with_rates)
            if total_balance_with_rates > 0
            else None
        )
        
        # Update Balance
        old_balance = (
            str(memory.mortgage_balance)
            if memory.mortgage_balance is not None
            else None
        )
        if memory.mortgage_balance != total_balance:
            memory.mortgage_balance = total_balance
            updated_fields.append("mortgage_balance")
            session.add(
                MemoryEvent(
                    user_id=user_id,
                    field_name="mortgage_balance",
                    old_value=old_balance,
                    new_value=str(total_balance),
                    source=MemoryEventSource.account_sync,
                    context="Derived from linked mortgage accounts",
                )
            )
            
        # Update Rate (only if we calculated one)
        if avg_rate is not None:
             old_rate = (
                str(memory.mortgage_rate)
                if memory.mortgage_rate is not None
                else None
            )
             # Fuzzy float comparison
             if memory.mortgage_rate is None or abs(memory.mortgage_rate - avg_rate) > Decimal("0.001"):
                memory.mortgage_rate = avg_rate
                updated_fields.append("mortgage_rate")
                session.add(
                    MemoryEvent(
                        user_id=user_id,
                        field_name="mortgage_rate",
                        old_value=old_rate,
                        new_value=str(avg_rate),
                        source=MemoryEventSource.account_sync,
                        context="Derived from linked mortgage accounts (weighted average)",
                    )
                )

    return updated_fields
