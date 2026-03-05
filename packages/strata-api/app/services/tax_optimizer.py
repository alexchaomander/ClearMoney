import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.tax_plan_workspace import TaxPlanVersion


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

        def _parse_float(val: any) -> float:
            if val is None or val == "":
                return 0.0
            try:
                return float(val)
            except (ValueError, TypeError):
                return 0.0

        inputs = version.inputs or {}
        wages = _parse_float(inputs.get("wagesIncome"))
        short_term = _parse_float(inputs.get("shortTermGains"))
        long_term = _parse_float(inputs.get("longTermGains"))
        withholding = _parse_float(inputs.get("currentWithholding"))

        # Simple heuristic-based optimization report (MVP for AI analysis)
        report = {
            "summary": "Tax Optimization Report based on your extracted documents.",
            "current_strategy": f"You have ${wages} in wages and ${short_term} in short term gains.",
            "optimal_strategy": "Consider tax loss harvesting to offset short term gains.",
            "dollar_amounts_saved": float(min(short_term * 0.35, 3000 * 0.35)) if short_term > 0 else 0,
            "yoy_comparison": "This is your first year tracking with ClearMoney.",
            "recommendations": []
        }

        if short_term > 0:
            report["recommendations"].append({
                "title": "Tax Loss Harvesting",
                "description": f"You have ${short_term} in short term gains. You can offset this by selling losing positions.",
                "potential_savings": float(min(short_term * 0.35, 3000 * 0.35))
            })

        if wages > 100000:
            report["recommendations"].append({
                "title": "Maximize Pre-Tax Retirement",
                "description": "Ensure you are maxing out your 401(k) to reduce taxable wage income.",
                "potential_savings": float(23000 * 0.24)
            })

        return report
