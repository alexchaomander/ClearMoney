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
    recent_transactions = context.get("recent_transactions", []) or []

    rules_applied: list[dict] = []
    insights: list[dict] = []
    assumptions: list[str] = []

    runway = _safe_float(metrics.get("runway_months"))
    target_runway = _safe_float(profile.get("emergency_fund_target_months"))
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
        if target_runway:
            rules_applied.append({
                "name": "Emergency fund meets your target months",
                "passed": runway >= target_runway,
                "value": runway,
                "threshold": target_runway,
                "message": f"Target runway is {target_runway:.0f} months.",
            })
            if runway < target_runway:
                insights.append({
                    "id": "emergency_fund_target",
                    "title": "Emergency fund below your target",
                    "severity": "medium",
                    "summary": f"Target is {target_runway:.0f} months, current runway is {runway:.1f}.",
                    "recommendation": "Increase cash reserves to match your stated emergency fund target.",
                    "data_points": {"runway_months": runway, "target_months": target_runway},
                })

    debt_accounts = accounts.get("debt", []) or []
    total_min_payment = sum(
        (_safe_float(d.get("minimum_payment")) or 0) for d in debt_accounts
    )
    total_debt_balance = sum(
        (_safe_float(d.get("balance")) or 0) for d in debt_accounts
    )
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

    monthly_income = _safe_float(profile.get("monthly_income"))
    if monthly_income:
        dti = (total_min_payment / monthly_income) if monthly_income > 0 else 0
        rules_applied.append({
            "name": "Debt payments <= 36% of monthly income",
            "passed": dti <= 0.36,
            "value": round(dti * 100, 1),
            "threshold": 36,
            "message": f"Estimated debt payment ratio {dti * 100:.1f}%.",
        })
        if dti > 0.36:
            insights.append({
                "id": "debt_to_income",
                "title": "Debt payments are a large share of income",
                "severity": "high",
                "summary": f"Debt payments are about {dti * 100:.1f}% of monthly income.",
                "recommendation": "Consider reducing debt obligations or refinancing to lower payments.",
                "data_points": {"debt_payment_ratio": dti},
            })
    else:
        assumptions.append("Monthly income missing; debt-to-income check skipped.")

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

    monthly_savings_target = _safe_float(profile.get("monthly_savings_target"))
    if monthly_income and monthly_savings_target is not None:
        savings_rate = monthly_savings_target / monthly_income if monthly_income > 0 else 0
        rules_applied.append({
            "name": "Monthly savings target >= 10% of income",
            "passed": savings_rate >= 0.10,
            "value": round(savings_rate * 100, 1),
            "threshold": 10,
            "message": f"Target savings rate {savings_rate * 100:.1f}%.",
        })
        if savings_rate < 0.10:
            insights.append({
                "id": "savings_rate",
                "title": "Savings target below 10% of income",
                "severity": "medium",
                "summary": f"Targeted savings is {savings_rate * 100:.1f}% of income.",
                "recommendation": "Aim to save at least 10% of income to stay on track with long-term goals.",
                "data_points": {"savings_rate": savings_rate},
            })
    elif monthly_savings_target is None:
        assumptions.append("Monthly savings target missing; savings rate check skipped.")

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

    if total_investment > 0:
        tax_advantaged = _safe_float(metrics.get("tax_advantaged_value")) or 0
        ratio = tax_advantaged / total_investment if total_investment > 0 else 0
        rules_applied.append({
            "name": "Tax-advantaged share >= 40%",
            "passed": ratio >= 0.40,
            "value": round(ratio * 100, 1),
            "threshold": 40,
            "message": f"Tax-advantaged share {ratio * 100:.1f}%.",
        })
        if ratio < 0.40:
            insights.append({
                "id": "tax_advantaged_mix",
                "title": "Low tax-advantaged allocation",
                "severity": "low",
                "summary": f"{ratio * 100:.1f}% of investments are tax-advantaged.",
                "recommendation": "Increase contributions to tax-advantaged accounts if eligible.",
                "data_points": {"tax_advantaged_ratio": ratio},
            })

    if monthly_income and profile.get("monthly_rent"):
        rent = _safe_float(profile.get("monthly_rent")) or 0
        rent_ratio = rent / monthly_income if monthly_income > 0 else 0
        rules_applied.append({
            "name": "Housing cost <= 30% of income",
            "passed": rent_ratio <= 0.30,
            "value": round(rent_ratio * 100, 1),
            "threshold": 30,
            "message": f"Rent is {rent_ratio * 100:.1f}% of income.",
        })
        if rent_ratio > 0.30:
            insights.append({
                "id": "housing_ratio",
                "title": "Housing cost is high relative to income",
                "severity": "medium",
                "summary": f"Rent is {rent_ratio * 100:.1f}% of monthly income.",
                "recommendation": "Consider adjusting housing costs to free up savings capacity.",
                "data_points": {"housing_ratio": rent_ratio},
            })

    net_worth = _safe_float(metrics.get("net_worth"))
    if net_worth is not None and net_worth < 0:
        insights.append({
            "id": "negative_net_worth",
            "title": "Net worth is negative",
            "severity": "high",
            "summary": f"Net worth is approximately ${net_worth:,.0f}.",
            "recommendation": "Focus on reducing high-interest debt and building cash reserves.",
            "data_points": {"net_worth": net_worth, "total_debt": total_debt_balance},
        })

    if not recent_transactions:
        assumptions.append("No recent transactions available; cash flow signals may be limited.")

    return {
        "rules_applied": rules_applied,
        "insights": insights,
        "assumptions": assumptions,
    }
