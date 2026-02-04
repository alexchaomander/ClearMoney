from __future__ import annotations

from typing import Any


def _safe_float(value: Any) -> float | None:
    try:
        if value is None:
            return None
        return float(value)
    except (TypeError, ValueError):
        return None


def run_deterministic_checks(context: dict) -> dict:
    profile = context.get("profile", {}) or {}
    accounts = context.get("accounts", {}) or {}
    metrics = context.get("portfolio_metrics", {}) or {}

    rules_applied: list[dict] = []
    insights: list[dict] = []
    assumptions: list[str] = []

    runway = _safe_float(metrics.get("runway_months"))
    if runway is None:
        rules_applied.append({
            "name": "Emergency fund runway available",
            "passed": False,
            "value": None,
            "threshold": 3,
            "message": "No monthly expense data available to compute runway.",
        })
        assumptions.append("Monthly expense data missing; runway check skipped.")
    else:
        rules_applied.append({
            "name": "Emergency fund runway >= 3 months",
            "passed": runway >= 3,
            "value": runway,
            "threshold": 3,
            "message": f"Runway estimated at {runway:.1f} months.",
        })
        if runway < 3:
            insights.append({
                "id": "emergency_fund",
                "title": "Emergency fund is below 3 months",
                "severity": "high",
                "summary": f"Current runway is about {runway:.1f} months.",
                "recommendation": "Build emergency reserves to 3-6 months of expenses before taking new risk.",
                "data_points": {"runway_months": runway},
            })

    debt_accounts = accounts.get("debt", []) or []
    high_interest = [
        d for d in debt_accounts
        if (_safe_float(d.get("interest_rate")) or 0) >= 0.1
    ]
    if high_interest:
        total_balance = sum((_safe_float(d.get("balance")) or 0) for d in high_interest)
        max_rate = max((_safe_float(d.get("interest_rate")) or 0) for d in high_interest)
        insights.append({
            "id": "high_interest_debt",
            "title": "High-interest debt detected",
            "severity": "high",
            "summary": f"${total_balance:,.0f} at rates up to {max_rate * 100:.1f}%.",
            "recommendation": "Prioritize paying off high-interest balances before investing excess cash.",
            "data_points": {"high_interest_balance": total_balance, "max_rate": max_rate},
        })
    rules_applied.append({
        "name": "High-interest debt < 10% APR",
        "passed": len(high_interest) == 0,
        "value": len(high_interest),
        "threshold": 0,
        "message": "Checks if any debt exceeds 10% APR.",
    })

    annual_income = _safe_float(profile.get("annual_income"))
    monthly_retirement = _safe_float(profile.get("monthly_retirement_contribution"))
    if annual_income and monthly_retirement is not None:
        annual_retirement = monthly_retirement * 12
        rate = annual_retirement / annual_income if annual_income > 0 else 0
        rules_applied.append({
            "name": "Retirement savings rate >= 10%",
            "passed": rate >= 0.10,
            "value": round(rate * 100, 1),
            "threshold": 10,
            "message": f"Estimated savings rate {rate * 100:.1f}%.",
        })
        if rate < 0.10:
            insights.append({
                "id": "retirement_savings_rate",
                "title": "Retirement savings rate below 10%",
                "severity": "medium",
                "summary": f"Estimated at {rate * 100:.1f}% of income.",
                "recommendation": "Consider increasing retirement contributions or capturing full employer match.",
                "data_points": {"retirement_savings_rate": rate},
            })
    else:
        assumptions.append("Annual income or retirement contribution missing; savings rate check skipped.")

    total_investment = _safe_float(metrics.get("total_investment_value")) or 0
    holdings = context.get("holdings", []) or []
    if total_investment > 0 and holdings:
        top_holding = max(holdings, key=lambda h: _safe_float(h.get("market_value")) or 0)
        top_value = _safe_float(top_holding.get("market_value")) or 0
        concentration = top_value / total_investment if total_investment > 0 else 0
        rules_applied.append({
            "name": "Top holding < 25% of portfolio",
            "passed": concentration < 0.25,
            "value": round(concentration * 100, 1),
            "threshold": 25,
            "message": f"Top holding at {concentration * 100:.1f}% of portfolio.",
        })
        if concentration >= 0.25:
            insights.append({
                "id": "concentration_risk",
                "title": "Portfolio concentration risk",
                "severity": "medium",
                "summary": f"Top holding is {concentration * 100:.1f}% of the portfolio.",
                "recommendation": "Consider diversifying to reduce single-name risk.",
                "data_points": {"top_holding": top_holding.get("ticker"), "concentration": concentration},
            })
    else:
        assumptions.append("Holdings data missing; concentration check skipped.")

    return {
        "rules_applied": rules_applied,
        "insights": insights,
        "assumptions": assumptions,
    }
