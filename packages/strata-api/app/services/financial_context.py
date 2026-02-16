import uuid
from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.cash_account import CashAccount
from app.models.connection import Connection
from app.models.debt_account import DebtAccount
from app.models.financial_memory import FinancialMemory
from app.models.holding import Holding
from app.models.investment_account import InvestmentAccount
from app.models.security import Security
from app.models.transaction import Transaction


def _decimal_to_float(v: Decimal | None) -> float | None:
    return float(v) if v is not None else None


async def build_financial_context(
    user_id: uuid.UUID, session: AsyncSession
) -> dict:
    """Assemble complete financial context for agent consumption.

    Returns a structured dict with sections:
    - profile (from FinancialMemory)
    - accounts (investment, cash, debt with balances)
    - holdings (top holdings with values)
    - portfolio_metrics (net worth, allocation percentages)
    - data_freshness (last sync times)
    """
    # Load all data concurrently-ish (SQLite doesn't truly parallelize, but
    # the pattern scales to Postgres)
    memory_result = await session.execute(
        select(FinancialMemory).where(FinancialMemory.user_id == user_id)
    )
    memory = memory_result.scalar_one_or_none()

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

    conn_result = await session.execute(
        select(Connection).where(Connection.user_id == user_id)
    )
    connections = conn_result.scalars().all()

    # Load holdings with securities
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

    # Load recent transactions
    recent_tx_result = await session.execute(
        select(Transaction)
        .where(Transaction.account_id.in_(account_ids) if account_ids else False)
        .order_by(Transaction.trade_date.desc().nulls_last())
        .limit(20)
    )
    recent_transactions = recent_tx_result.scalars().all() if account_ids else []

    # -- Build profile section --
    profile = {}
    if memory:
        for field in [
            "age", "state", "filing_status", "num_dependents",
            "annual_income", "monthly_income", "income_growth_rate",
            "federal_tax_rate", "state_tax_rate", "capital_gains_rate",
            "retirement_age", "current_retirement_savings",
            "monthly_retirement_contribution", "employer_match_pct",
            "expected_social_security", "desired_retirement_income",
            "home_value", "mortgage_balance", "mortgage_rate", "monthly_rent",
            "risk_tolerance", "investment_horizon_years",
            "monthly_savings_target", "average_monthly_expenses", "emergency_fund_target_months",
            "spending_categories_monthly", "debt_profile", "portfolio_summary", "equity_compensation",
        ]:
            val = getattr(memory, field)
            if val is not None:
                if isinstance(val, Decimal):
                    val = float(val)
                elif hasattr(val, "value"):
                    val = val.value
                profile[field] = val

    # -- Build accounts section --
    accounts_section = {
        "investment": [
            {
                "name": a.name,
                "type": a.account_type.value,
                "balance": _decimal_to_float(a.balance),
                "is_tax_advantaged": a.is_tax_advantaged,
            }
            for a in investment_accounts
        ],
        "cash": [
            {
                "name": a.name,
                "type": a.account_type.value,
                "balance": _decimal_to_float(a.balance),
            }
            for a in cash_accounts
        ],
        "debt": [
            {
                "name": a.name,
                "type": a.debt_type.value,
                "balance": _decimal_to_float(a.balance),
                "interest_rate": _decimal_to_float(a.interest_rate),
                "minimum_payment": _decimal_to_float(a.minimum_payment),
            }
            for a in debt_accounts
        ],
    }

    # -- Build holdings section (top 20) --
    account_name_map = {a.id: a.name for a in investment_accounts}
    holdings_section = []
    for holding, security in holdings[:20]:
        holdings_section.append({
            "ticker": security.ticker,
            "name": security.name,
            "security_type": security.security_type.value,
            "quantity": float(holding.quantity) if holding.quantity else 0,
            "market_value": _decimal_to_float(holding.market_value),
            "cost_basis": _decimal_to_float(holding.cost_basis),
            "account": account_name_map.get(holding.account_id, "Unknown"),
        })

    # -- Portfolio metrics --
    total_investment = sum(
        (float(a.balance) for a in investment_accounts if a.balance), 0.0
    )
    total_cash = sum(
        (float(a.balance) for a in cash_accounts if a.balance), 0.0
    )
    total_debt = sum(
        (float(a.balance) for a in debt_accounts if a.balance), 0.0
    )
    net_worth = total_investment + total_cash - total_debt

    tax_advantaged = sum(
        (float(a.balance) for a in investment_accounts if a.is_tax_advantaged and a.balance),
        0.0,
    )
    taxable = total_investment - tax_advantaged

    # Calculate allocation by asset type
    allocation_by_asset_type = {}
    if total_investment > 0:
        for holding, security in holdings:
            asset_type = security.security_type.value
            val = float(holding.market_value) if holding.market_value else 0.0
            allocation_by_asset_type[asset_type] = allocation_by_asset_type.get(asset_type, 0.0) + val
        
        # Convert to percentages
        allocation_by_asset_type = {
            k: round(v / total_investment * 100, 1) 
            for k, v in allocation_by_asset_type.items()
        }

    runway_months = None
    if memory and memory.average_monthly_expenses and memory.average_monthly_expenses > 0:
        runway_months = total_cash / float(memory.average_monthly_expenses)

    portfolio_metrics = {
        "net_worth": round(net_worth, 2),
        "total_investment_value": round(total_investment, 2),
        "total_cash_value": round(total_cash, 2),
        "total_debt_value": round(total_debt, 2),
        "tax_advantaged_value": round(tax_advantaged, 2),
        "taxable_value": round(taxable, 2),
        "allocation_by_asset_type": allocation_by_asset_type,
        "runway_months": round(runway_months, 1) if runway_months is not None else None,
    }

    # -- Transactions --
    transactions_section = [
        {
            "type": tx.type.value,
            "amount": _decimal_to_float(tx.amount),
            "description": tx.description,
            "trade_date": tx.trade_date.isoformat() if tx.trade_date else None,
        }
        for tx in recent_transactions
    ]

    # -- Data freshness --
    now = datetime.now(timezone.utc)
    last_sync = None
    for conn in connections:
        if conn.last_synced_at:
            if last_sync is None or conn.last_synced_at > last_sync:
                last_sync = conn.last_synced_at

    data_freshness = {
        "last_sync": last_sync.isoformat() if last_sync else None,
        "profile_updated": memory.updated_at.isoformat() if memory else None,
        "accounts_count": len(investment_accounts) + len(cash_accounts) + len(debt_accounts),
        "connections_count": len(connections),
    }

    return {
        "profile": profile,
        "accounts": accounts_section,
        "holdings": holdings_section,
        "recent_transactions": transactions_section,
        "portfolio_metrics": portfolio_metrics,
        "data_freshness": data_freshness,
    }
