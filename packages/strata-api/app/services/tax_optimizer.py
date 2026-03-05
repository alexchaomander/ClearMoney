import uuid
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.tax_plan_workspace import TaxPlanVersion

# Heuristic constants used for MVP savings estimates.
_SHORT_TERM_TAX_RATE = 0.35
_MAX_CAPITAL_LOSS_DEDUCTION = 3_000
_IRS_401K_LIMIT = 23_000  # 2024 limit; update annually
_RETIREMENT_MARGINAL_RATE = 0.24
_RETIREMENT_SUGGESTION_WAGE_THRESHOLD = 100_000


class TaxOptimizerService:
    def __init__(self, session: AsyncSession):
        self._session = session

    async def generate_optimization_report(self, version_id: uuid.UUID) -> dict:
        result = await self._session.execute(
            select(TaxPlanVersion).where(TaxPlanVersion.id == version_id)
        )
        version = result.scalar_one_or_none()
        if not version:
            raise ValueError("Tax Plan Version not found")

        def _parse_float(val: Any) -> float:
            if val is None or val == "":
                return 0.0
            try:
                return float(val)
            except (ValueError, TypeError):
                return 0.0

        inputs = version.inputs or {}
        wages = _parse_float(inputs.get("wagesIncome"))
        short_term = _parse_float(inputs.get("shortTermGains"))
        long_term = _parse_float(inputs.get("longTermGains"))  # noqa: F841 – reserved for future use

        # Simple heuristic-based optimization report (MVP for AI analysis)
        report = {
            "summary": "Tax Optimization Report based on your extracted documents.",
            "current_strategy": f"You have ${wages} in wages and ${short_term} in short term gains.",
            "optimal_strategy": "Consider tax loss harvesting to offset short term gains.",
            "dollar_amounts_saved": float(min(short_term, _MAX_CAPITAL_LOSS_DEDUCTION) * _SHORT_TERM_TAX_RATE) if short_term > 0 else 0,
            "yoy_comparison": "This is your first year tracking with ClearMoney.",
            "recommendations": []
        }

        if short_term > 0:
            savings = float(min(short_term, _MAX_CAPITAL_LOSS_DEDUCTION) * _SHORT_TERM_TAX_RATE)
            report["recommendations"].append({
                "title": "Tax Loss Harvesting",
                "description": f"You have ${short_term} in short term gains. You can offset this by selling losing positions.",
                "potential_savings": savings
            })

        if wages > _RETIREMENT_SUGGESTION_WAGE_THRESHOLD:
            report["recommendations"].append({
                "title": "Maximize Pre-Tax Retirement",
                "description": "Ensure you are maxing out your 401(k) to reduce taxable wage income.",
                "potential_savings": float(_IRS_401K_LIMIT * _RETIREMENT_MARGINAL_RATE)
            })

        return report
