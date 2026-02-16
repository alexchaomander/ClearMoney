"""Renders a financial context dict as markdown optimized for LLM system prompts."""


def _sanitize(value: str | None) -> str:
    """Strip newlines and escape potential markdown control characters from untrusted strings."""
    if value is None:
        return "—"
    # Convert to string and remove newlines to prevent prompt structure breaking
    cleaned = str(value).replace("\n", " ").replace("\r", " ")
    # Simple escape for common markdown/control characters if they appear at start of line
    return cleaned.replace("|", "\\|")


def render_context_as_markdown(context: dict) -> str:
    """Convert the structured financial context into readable markdown."""
    sections: list[str] = []

    # Profile
    profile = context.get("profile", {})
    if profile:
        lines = ["## Financial Profile"]
        field_labels = {
            "age": "Age",
            "state": "State",
            "filing_status": "Filing Status",
            "num_dependents": "Dependents",
            "annual_income": "Annual Income",
            "monthly_income": "Monthly Income",
            "income_growth_rate": "Income Growth Rate",
            "federal_tax_rate": "Federal Tax Rate",
            "state_tax_rate": "State Tax Rate",
            "capital_gains_rate": "Capital Gains Rate",
            "retirement_age": "Retirement Age",
            "current_retirement_savings": "Current Retirement Savings",
            "monthly_retirement_contribution": "Monthly Retirement Contribution",
            "employer_match_pct": "Employer Match %",
            "expected_social_security": "Expected Social Security (monthly)",
            "desired_retirement_income": "Desired Retirement Income (annual)",
            "home_value": "Home Value",
            "mortgage_balance": "Mortgage Balance",
            "mortgage_rate": "Mortgage Rate",
            "monthly_rent": "Monthly Rent",
            "risk_tolerance": "Risk Tolerance",
            "investment_horizon_years": "Investment Horizon (years)",
            "monthly_savings_target": "Monthly Savings Target",
            "average_monthly_expenses": "Average Monthly Expenses",
            "emergency_fund_target_months": "Emergency Fund Target (months)",
        }
        currency_fields = {
            "annual_income", "monthly_income", "current_retirement_savings",
            "monthly_retirement_contribution", "expected_social_security",
            "desired_retirement_income", "home_value", "mortgage_balance",
            "monthly_rent", "monthly_savings_target", "average_monthly_expenses",
        }
        rate_fields = {
            "income_growth_rate", "federal_tax_rate", "state_tax_rate",
            "capital_gains_rate", "employer_match_pct", "mortgage_rate",
        }

        for field, label in field_labels.items():
            val = profile.get(field)
            if val is None:
                continue
            if field in currency_fields:
                lines.append(f"- **{label}**: ${val:,.2f}")
            elif field in rate_fields:
                lines.append(f"- **{label}**: {val * 100:.1f}%")
            else:
                lines.append(f"- **{label}**: {val}")

        sections.append("\n".join(lines))

    # Accounts
    accounts = context.get("accounts", {})
    account_lines = ["## Accounts"]
    has_accounts = False

    for acct_type, label in [("investment", "Investment"), ("cash", "Cash"), ("debt", "Debt")]:
        accts = accounts.get(acct_type, [])
        if not accts:
            continue
        has_accounts = True
        account_lines.append(f"\n### {label} Accounts")
        account_lines.append("| Name | Type | Balance |")
        account_lines.append("|------|------|---------|")
        for a in accts:
            bal = a.get("balance", 0) or 0
            extra = ""
            if a.get("is_tax_advantaged"):
                extra = " (tax-advantaged)"
            if a.get("interest_rate"):
                extra = f" @ {a['interest_rate'] * 100:.1f}%"
            account_lines.append(
                f"| {_sanitize(a.get('name'))} | {a['type']}{extra} | ${bal:,.2f} |"
            )

    if has_accounts:
        sections.append("\n".join(account_lines))

    # Holdings (top)
    holdings = context.get("holdings", [])
    if holdings:
        lines = ["## Top Holdings"]
        lines.append("| Ticker | Name | Type | Qty | Market Value | Account |")
        lines.append("|--------|------|------|-----|-------------|---------|")
        for h in holdings[:15]:
            ticker = _sanitize(h.get("ticker"))
            mv = h.get("market_value") or 0
            qty = h.get("quantity", 0)
            lines.append(
                f"| {ticker} | {_sanitize(h.get('name'))} | {h['security_type']} "
                f"| {qty:,.2f} | ${mv:,.2f} | {_sanitize(h.get('account'))} |"
            )
        sections.append("\n".join(lines))

    # Portfolio metrics
    metrics = context.get("portfolio_metrics", {})
    if metrics:
        lines = ["## Portfolio Summary"]
        metric_labels = {
            "net_worth": "Net Worth",
            "total_investment_value": "Total Investments",
            "total_cash_value": "Total Cash",
            "total_debt_value": "Total Debt",
            "tax_advantaged_value": "Tax-Advantaged",
            "taxable_value": "Taxable",
            "runway_months": "Runway (Months)",
        }
        currency_metrics = {
            "net_worth",
            "total_investment_value",
            "total_cash_value",
            "total_debt_value",
            "tax_advantaged_value",
            "taxable_value",
        }

        for key, label in metric_labels.items():
            val = metrics.get(key)
            if val is not None:
                if key in currency_metrics:
                    lines.append(f"- **{label}**: ${val:,.2f}")
                else:
                    lines.append(f"- **{label}**: {val}")
        sections.append("\n".join(lines))

    # Data freshness
    freshness = context.get("data_freshness", {})
    if freshness:
        lines = ["## Data Freshness"]
        if freshness.get("last_sync"):
            lines.append(f"- **Last sync**: {freshness['last_sync']}")
        if freshness.get("profile_updated"):
            lines.append(f"- **Profile updated**: {freshness['profile_updated']}")
        lines.append(f"- **Accounts**: {freshness.get('accounts_count', 0)}")
        lines.append(f"- **Connections**: {freshness.get('connections_count', 0)}")
        sections.append("\n".join(lines))

    if not sections:
        return "No financial data available yet."

    return "\n\n".join(sections)
