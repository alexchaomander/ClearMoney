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
from app.schemas.agent import (
    ConfidenceFactor,
    MetricTraceDataPoint,
    MetricTraceResponse,
    TraceComponent,
    TraceCorrectionTarget,
)
from app.services.context_quality import evaluate_context_quality
from app.services.financial_context import build_financial_context
from app.services.formula_registry import FormulaDefinition, get_formula_definition
from app.services.runway import RunwayService


def _round_money(value: float) -> float:
    return round(value, 2)


def _currency(value: float) -> str:
    return f"${value:,.2f}"


def _percent(value: float) -> str:
    return f"{value:.1f}%"


def _months(value: float) -> str:
    return f"{value:.1f} mo"


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


def _build_trace_response(
    definition: FormulaDefinition,
    *,
    components: list[TraceComponent],
    confidence_factors: list[ConfidenceFactor],
    context_quality,
    as_of: str | None,
    warnings: list[str],
) -> MetricTraceResponse:
    data_points = [
        MetricTraceDataPoint(
            label=component.label,
            value=component.display_value,
            source=component.source,
        )
        for component in components
    ]
    return MetricTraceResponse(
        metric_id=definition.metric_id,
        formula_id=definition.formula_id,
        formula_version=definition.version,
        label=definition.label,
        formula=definition.formula,
        description=definition.description,
        data_points=data_points,
        components=components,
        confidence_score=round(sum(factor.value for factor in confidence_factors) / len(confidence_factors), 2),
        confidence_factors=confidence_factors,
        determinism_class=definition.determinism_class,
        source_tier=definition.source_tier,
        continuity_status=context_quality.continuity_status,
        recommendation_readiness=context_quality.recommendation_readiness,
        coverage_status="full" if context_quality.coverage_ratio >= 0.8 else "partial",
        methodology_version=definition.version,
        as_of=as_of,
        warnings=warnings,
        policy_version=definition.policy_version,
        correction_targets=[TraceCorrectionTarget(**target) for target in definition.correction_targets],
    )


async def build_metric_trace(
    user_id: uuid.UUID,
    metric_id: str,
    session: AsyncSession,
) -> MetricTraceResponse:
    definition = get_formula_definition(metric_id)
    context = await build_financial_context(user_id, session)
    connections = await _get_connections(user_id, session)
    memory = await _get_memory(user_id, session)
    context_quality = evaluate_context_quality(context, connections)
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
        components = [
            TraceComponent(
                component_kind="input",
                label="Total Assets",
                raw_value=_round_money(total_assets),
                display_value=_currency(total_assets),
                source="Portfolio summary from linked cash, investment, equity, and physical assets",
                source_tier="derived_context",
                determinism_class="deterministic",
                as_of=last_sync,
                freshness_status=context_quality.continuity_status,
            ),
            TraceComponent(
                component_kind="input",
                label="Total Liabilities",
                raw_value=_round_money(total_debt),
                display_value=_currency(total_debt),
                source="Linked debt accounts",
                source_tier="verified_account",
                determinism_class="deterministic",
                as_of=last_sync,
                freshness_status=context_quality.continuity_status,
            ),
            TraceComponent(
                component_kind="derived",
                label="Net Worth",
                raw_value=_round_money(float(metrics.get("net_worth") or 0.0)),
                display_value=_currency(float(metrics.get("net_worth") or 0.0)),
                source="Deterministic portfolio calculation",
                source_tier="derived_context",
                determinism_class="deterministic",
                as_of=last_sync,
                freshness_status=context_quality.continuity_status,
                policy_reference=definition.policy_version,
            ),
        ]
        confidence_factors = [
            *context_quality.confidence_factors,
            ConfidenceFactor(label="Formula Stability", value=0.99, impact="positive", reason="Net worth comes from a deterministic registered formula."),
        ]
        return _build_trace_response(
            definition,
            components=components,
            confidence_factors=confidence_factors,
            context_quality=context_quality,
            as_of=last_sync,
            warnings=context_quality.warnings,
        )

    if metric_id == "totalAssets":
        components = [
            TraceComponent(component_kind="input", label="Cash", raw_value=_round_money(total_cash), display_value=_currency(total_cash), source="Linked cash accounts", source_tier="verified_account", determinism_class="deterministic", as_of=last_sync, freshness_status=context_quality.continuity_status),
            TraceComponent(component_kind="input", label="Investments", raw_value=_round_money(total_investment), display_value=_currency(total_investment), source="Linked brokerage and retirement accounts", source_tier="verified_account", determinism_class="deterministic", as_of=last_sync, freshness_status=context_quality.continuity_status),
            TraceComponent(component_kind="input", label="Vested Equity", raw_value=_round_money(total_equity_vested), display_value=_currency(total_equity_vested), source="Equity grants with current valuation inputs", source_tier="derived_context", determinism_class="deterministic", as_of=last_sync, freshness_status=context_quality.continuity_status),
            TraceComponent(component_kind="input", label="Physical Assets", raw_value=_round_money(total_physical), display_value=_currency(total_physical), source="Tracked real estate, vehicles, collectibles, metals, and alternatives", source_tier="user_declared", determinism_class="deterministic", as_of=last_sync, freshness_status=context_quality.continuity_status),
            TraceComponent(component_kind="derived", label="Total Assets", raw_value=_round_money(total_assets), display_value=_currency(total_assets), source="Registered total-assets formula", source_tier="derived_context", determinism_class="deterministic", as_of=last_sync, freshness_status=context_quality.continuity_status, policy_reference=definition.policy_version),
        ]
        confidence_factors = [
            *context_quality.confidence_factors,
            ConfidenceFactor(label="Asset Coverage", value=0.95 if total_assets > 0 else 0.4, impact="positive" if total_assets > 0 else "negative", reason="Core asset classes are included in the current context."),
        ]
        return _build_trace_response(
            definition,
            components=components,
            confidence_factors=confidence_factors,
            context_quality=context_quality,
            as_of=last_sync,
            warnings=context_quality.warnings,
        )

    if metric_id == "savingsRate":
        monthly_income = float(profile.get("monthly_income") or 0.0)
        observed_monthly_spend = float(await _get_observed_monthly_spend(user_id, session, months=3))
        fallback_monthly_spend = float(profile.get("average_monthly_expenses") or 0.0)
        monthly_spend = observed_monthly_spend if observed_monthly_spend > 0 else fallback_monthly_spend
        warnings = list(context_quality.warnings)
        spend_component_kind = "input"
        spend_source = "Observed debit transactions from the last 90 days"
        spend_source_tier = "observed_transactions"
        spend_determinism = "deterministic"
        spend_factor_value = 0.9

        if observed_monthly_spend <= 0 and fallback_monthly_spend > 0:
            spend_component_kind = "fallback"
            spend_source = "Financial memory fallback because observed transaction spend was unavailable"
            spend_source_tier = "user_declared"
            spend_determinism = "fallback"
            spend_factor_value = 0.65
            warnings.append("Monthly spend is using memory fallback, not observed transaction flow.")
        elif observed_monthly_spend <= 0:
            spend_component_kind = "fallback"
            spend_source = "No observed monthly spend was available"
            spend_source_tier = "derived_context"
            spend_determinism = "fallback"
            spend_factor_value = 0.3
            warnings.append("Monthly spend is unavailable, so savings rate defaults to zero.")

        income_factor_value = 0.92 if monthly_income > 0 else 0.35
        if monthly_income <= 0:
            warnings.append("Monthly income is missing, so savings rate defaults to zero.")

        savings_rate = ((monthly_income - monthly_spend) / monthly_income) if monthly_income > 0 else 0.0
        savings_rate = max(0.0, savings_rate)
        components = [
            TraceComponent(component_kind="input", label="Monthly Income", raw_value=_round_money(monthly_income), display_value=_currency(monthly_income), source="Financial profile memory", source_tier="user_declared", determinism_class="deterministic", as_of=last_sync, freshness_status=context_quality.continuity_status),
            TraceComponent(component_kind=spend_component_kind, label="Monthly Spend", raw_value=_round_money(monthly_spend), display_value=_currency(monthly_spend), source=spend_source, source_tier=spend_source_tier, determinism_class=spend_determinism, as_of=last_sync, freshness_status=context_quality.continuity_status),
            TraceComponent(component_kind="derived", label="Savings Rate", raw_value=round(savings_rate * 100, 1), display_value=_percent(savings_rate * 100), source="Registered savings-rate formula", source_tier="derived_context", determinism_class="deterministic", as_of=last_sync, freshness_status=context_quality.continuity_status, policy_reference=definition.policy_version),
        ]
        confidence_factors = [
            *context_quality.confidence_factors,
            ConfidenceFactor(label="Income Coverage", value=income_factor_value, impact="positive" if monthly_income > 0 else "negative", reason="Monthly income is present in memory." if monthly_income > 0 else "Monthly income is missing from memory."),
            ConfidenceFactor(label="Spend Coverage", value=spend_factor_value, impact="positive" if observed_monthly_spend > 0 else "mixed", reason=spend_source),
        ]
        return _build_trace_response(
            definition,
            components=components,
            confidence_factors=confidence_factors,
            context_quality=context_quality,
            as_of=last_sync,
            warnings=warnings,
        )

    if metric_id == "personalRunway":
        runway_service = RunwayService(session)
        runway_metrics = await runway_service.get_runway_metrics(user_id)
        observed_personal_burn = await runway_service._calculate_observed_burn(user_id, is_business=False)
        personal = runway_metrics["personal"]
        monthly_burn = float(personal["monthly_burn"])
        warnings = list(context_quality.warnings)
        burn_component_kind = "input"
        burn_source = "Observed personal cash-account debits over the last 90 days"
        burn_source_tier = "observed_transactions"
        burn_determinism = "deterministic"
        burn_factor_value = 0.92

        if observed_personal_burn <= 0 and memory and memory.average_monthly_expenses:
            burn_component_kind = "fallback"
            burn_source = "Financial memory fallback for monthly expenses"
            burn_source_tier = "user_declared"
            burn_determinism = "fallback"
            burn_factor_value = 0.7
            warnings.append("Personal runway is using memory fallback because observed burn was unavailable.")

        components = [
            TraceComponent(component_kind="input", label="Personal Liquid Cash", raw_value=_round_money(float(personal["liquid_cash"])), display_value=_currency(float(personal["liquid_cash"])), source="Personal cash accounts", source_tier="verified_account", determinism_class="deterministic", as_of=last_sync, freshness_status=context_quality.continuity_status),
            TraceComponent(component_kind=burn_component_kind, label="Monthly Personal Burn", raw_value=_round_money(monthly_burn), display_value=_currency(monthly_burn), source=burn_source, source_tier=burn_source_tier, determinism_class=burn_determinism, as_of=last_sync, freshness_status=context_quality.continuity_status),
            TraceComponent(component_kind="derived", label="Runway Months", raw_value=round(float(personal["runway_months"]), 1), display_value=_months(float(personal["runway_months"])), source="Registered personal-runway formula", source_tier="derived_context", determinism_class="deterministic", as_of=last_sync, freshness_status=context_quality.continuity_status, policy_reference=definition.policy_version),
        ]
        confidence_factors = [
            *context_quality.confidence_factors,
            ConfidenceFactor(label="Burn Coverage", value=burn_factor_value, impact="positive" if observed_personal_burn > 0 else "mixed", reason=burn_source),
            ConfidenceFactor(label="Liquidity Coverage", value=0.95 if float(personal["liquid_cash"]) > 0 else 0.5, impact="positive" if float(personal["liquid_cash"]) > 0 else "mixed", reason="Personal cash accounts are included in runway math."),
        ]
        return _build_trace_response(
            definition,
            components=components,
            confidence_factors=confidence_factors,
            context_quality=context_quality,
            as_of=last_sync,
            warnings=warnings,
        )

    raise ValueError(f"Unsupported metric trace: {metric_id}")
