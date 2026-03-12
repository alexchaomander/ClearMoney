from __future__ import annotations

import uuid
from datetime import date
from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.bank_transaction import BankTransaction
from app.models.cash_account import CashAccount
from app.models.connection import Connection
from app.models.financial_memory import FinancialMemory
from app.schemas.agent import MetricTraceDataPoint, MetricTraceResponse
from app.services.financial_context import build_financial_context
from app.services.runway import RunwayService


def _round_money(value: float) -> float:
    return round(value, 2)


def _last_sync_as_iso(connections: list[Connection]) -> str | None:
    timestamps = [connection.last_synced_at for connection in connections if connection.last_synced_at]
    if not timestamps:
        return None
    return max(timestamps).isoformat()


async def _get_connections(user_id: uuid.UUID, session: AsyncSession) -> list[Connection]:
    result = await session.execute(select(Connection).where(Connection.user_id == user_id))
    return list(result.scalars().all())


async def _get_memory(user_id: uuid.UUID, session: AsyncSession) -> FinancialMemory | None:
    result = await session.execute(select(FinancialMemory).where(FinancialMemory.user_id == user_id))
    return result.scalar_one_or_none()


async def _get_observed_monthly_spend(
    user_id: uuid.UUID,
    session: AsyncSession,
    months: int = 3,
) -> Decimal:
    end_date = date.today()
    year = end_date.year
    month = end_date.month - months
    while month <= 0:
        month += 12
        year -= 1
    start_date = date(year, month, min(end_date.day, 28))

    result = await session.execute(
        select(func.sum(BankTransaction.amount))
        .join(CashAccount)
        .where(
            CashAccount.user_id == user_id,
            BankTransaction.transaction_date >= start_date,
            BankTransaction.transaction_date <= end_date,
            BankTransaction.amount < 0,
        )
    )
    total_spend = result.scalar_one_or_none() or Decimal("0")
    return abs(total_spend) / Decimal(str(months)) if months > 0 else Decimal("0")


async def build_metric_trace(
    user_id: uuid.UUID,
    metric_id: str,
    session: AsyncSession,
) -> MetricTraceResponse:
    context = await build_financial_context(user_id, session)
    connections = await _get_connections(user_id, session)
    memory = await _get_memory(user_id, session)
    last_sync = _last_sync_as_iso(connections)

    metrics = context.get("portfolio_metrics", {})
    profile = context.get("profile", {})

    total_cash = float(metrics.get("total_cash_value") or 0.0)
    total_investment = float(metrics.get("total_investment_value") or 0.0)
    total_physical = float(metrics.get("total_physical_asset_value") or 0.0)
    total_equity_vested = float(metrics.get("total_equity_vested_value") or 0.0)
    total_debt = float(metrics.get("total_debt_value") or 0.0)
    total_assets = total_cash + total_investment + total_physical + total_equity_vested

    if metric_id == "netWorth":
        return MetricTraceResponse(
            metric_id="netWorth",
            label="Net Worth",
            formula="Total Assets - Total Liabilities",
            description="The total value of everything you own minus everything you owe.",
            data_points=[
                MetricTraceDataPoint(
                    label="Total Assets",
                    value=_round_money(total_assets),
                    source="Portfolio summary from linked cash, investment, equity, and physical assets",
                ),
                MetricTraceDataPoint(
                    label="Total Liabilities",
                    value=_round_money(total_debt),
                    source="Linked debt accounts",
                ),
                MetricTraceDataPoint(
                    label="Net Worth",
                    value=_round_money(float(metrics.get("net_worth") or 0.0)),
                    source="Deterministic portfolio calculation",
                ),
            ],
            confidence_score=0.99,
            as_of=last_sync,
        )

    if metric_id == "totalAssets":
        return MetricTraceResponse(
            metric_id="totalAssets",
            label="Total Assets",
            formula="Cash + Investments + Vested Equity + Physical Assets",
            description="The sum of liquid, invested, and owned asset value currently tracked in ClearMoney.",
            data_points=[
                MetricTraceDataPoint(label="Cash", value=_round_money(total_cash), source="Linked cash accounts"),
                MetricTraceDataPoint(
                    label="Investments",
                    value=_round_money(total_investment),
                    source="Linked brokerage and retirement accounts",
                ),
                MetricTraceDataPoint(
                    label="Vested Equity",
                    value=_round_money(total_equity_vested),
                    source="Equity grants with current valuation inputs",
                ),
                MetricTraceDataPoint(
                    label="Physical Assets",
                    value=_round_money(total_physical),
                    source="Tracked real estate, vehicles, collectibles, metals, and alternatives",
                ),
            ],
            confidence_score=0.98,
            as_of=last_sync,
        )

    if metric_id == "savingsRate":
        monthly_income = float(profile.get("monthly_income") or 0.0)
        observed_monthly_spend = float(await _get_observed_monthly_spend(user_id, session, months=3))
        fallback_monthly_spend = float(profile.get("average_monthly_expenses") or 0.0)
        monthly_spend = observed_monthly_spend if observed_monthly_spend > 0 else fallback_monthly_spend
        warnings: list[str] = []
        source = "Observed debit transactions from the last 90 days"
        confidence = 0.9

        if observed_monthly_spend <= 0 and fallback_monthly_spend > 0:
            source = "Financial memory fallback because observed transaction spend was unavailable"
            confidence = 0.72
            warnings.append("Monthly spend is using memory fallback, not observed transaction flow.")
        elif observed_monthly_spend <= 0:
            confidence = 0.4
            warnings.append("Monthly spend is unavailable, so savings rate defaults to zero.")

        if monthly_income <= 0:
            confidence = min(confidence, 0.35)
            warnings.append("Monthly income is missing, so savings rate defaults to zero.")

        savings_rate = ((monthly_income - monthly_spend) / monthly_income) if monthly_income > 0 else 0.0
        savings_rate = max(0.0, savings_rate)

        return MetricTraceResponse(
            metric_id="savingsRate",
            label="Savings Rate",
            formula="(Monthly Income - Monthly Spend) / Monthly Income",
            description="The percentage of monthly income left after current monthly spending.",
            data_points=[
                MetricTraceDataPoint(
                    label="Monthly Income",
                    value=_round_money(monthly_income),
                    source="Financial profile memory",
                ),
                MetricTraceDataPoint(
                    label="Monthly Spend",
                    value=_round_money(monthly_spend),
                    source=source,
                ),
                MetricTraceDataPoint(
                    label="Savings Rate",
                    value=round(savings_rate * 100, 1),
                    source="Deterministic ratio",
                ),
            ],
            confidence_score=confidence,
            as_of=last_sync,
            warnings=warnings,
        )

    if metric_id == "personalRunway":
        runway_service = RunwayService(session)
        runway_metrics = await runway_service.get_runway_metrics(user_id)
        observed_personal_burn = await runway_service._calculate_observed_burn(user_id, is_business=False)
        personal = runway_metrics["personal"]
        monthly_burn = float(personal["monthly_burn"])
        warnings: list[str] = []
        confidence = 0.94
        source = "Observed personal cash-account debits over the last 90 days"

        if observed_personal_burn <= 0 and memory and memory.average_monthly_expenses:
            confidence = 0.8
            source = "Financial memory fallback for monthly expenses"
            warnings.append("Personal runway is using memory fallback because observed burn was unavailable.")

        return MetricTraceResponse(
            metric_id="personalRunway",
            label="Personal Runway",
            formula="Personal Liquid Cash / Monthly Personal Burn",
            description="How many months your personal cash can support current personal spending without new income.",
            data_points=[
                MetricTraceDataPoint(
                    label="Personal Liquid Cash",
                    value=_round_money(float(personal["liquid_cash"])),
                    source="Personal cash accounts",
                ),
                MetricTraceDataPoint(
                    label="Monthly Personal Burn",
                    value=_round_money(monthly_burn),
                    source=source,
                ),
                MetricTraceDataPoint(
                    label="Runway Months",
                    value=round(float(personal["runway_months"]), 1),
                    source="Deterministic ratio",
                ),
            ],
            confidence_score=confidence,
            as_of=last_sync,
            warnings=warnings,
        )

    raise ValueError(f"Unsupported metric trace: {metric_id}")
