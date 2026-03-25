from decimal import Decimal

from pydantic import BaseModel


class AssetAllocation(BaseModel):
    """Asset allocation by category."""

    category: str
    value: Decimal
    percentage: Decimal


class TopHolding(BaseModel):
    """Top holding in the portfolio."""

    ticker: str | None
    name: str
    security_type: str
    quantity: Decimal
    market_value: Decimal
    cost_basis: Decimal | None
    account_name: str


class ConcentrationAlert(BaseModel):
    """Concentration risk alert."""

    ticker: str | None
    name: str
    percentage: Decimal
    message: str


class PortfolioSummary(BaseModel):
    """Portfolio summary with aggregate data."""

    total_investment_value: Decimal
    total_cash_value: Decimal
    total_debt_value: Decimal
    total_physical_asset_value: Decimal
    total_equity_vested_value: Decimal
    total_equity_unvested_value: Decimal
    net_worth: Decimal
    tax_advantaged_value: Decimal
    taxable_value: Decimal
    allocation_by_asset_type: list[AssetAllocation]
    allocation_by_account_type: list[AssetAllocation]
    top_holdings: list[TopHolding]
    concentration_alerts: list[ConcentrationAlert]


class PortfolioHistoryPoint(BaseModel):
    """A single point in portfolio history."""

    date: str
    value: Decimal

class TaxShieldMetrics(BaseModel):
    """Estimated tax obligations and income breakdown."""

    ytd_1099_income: float
    ytd_w2_income: float
    estimated_federal_tax: float
    estimated_state_tax: float
    estimated_self_employment_tax: float
    total_tax_liability_ytd: float
    next_quarterly_payment: float
    current_quarter: int
    safe_harbor_met: bool
