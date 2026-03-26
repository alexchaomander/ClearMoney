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

class RunwayComponent(BaseModel):
    liquid_cash: float
    monthly_burn: float
    runway_months: float

class RunwayMetrics(BaseModel):
    personal: RunwayComponent
    entity: RunwayComponent

class DebtPrioritizationItem(BaseModel):
    account_id: str
    name: str
    balance: float
    interest_rate: float
    minimum_payment: float

class DebtMetrics(BaseModel):
    total_debt_value: float
    total_minimum_payments: float
    weighted_average_interest: float
    avalanche_strategy: list[DebtPrioritizationItem]

class SavingsMetrics(BaseModel):
    monthly_income: float
    monthly_burn: float
    monthly_savings: float
    savings_rate_90d: float
    liquidity_months_target: int

class ConcentrationRisk(BaseModel):
    holding_name: str
    ticker: str | None = None
    percentage_of_portfolio: float
    value: float
    is_warning: bool
    has_risk: bool # Added for test alignment

class ConcentrationRiskSummary(BaseModel):
    has_risk: bool
    risks: list[ConcentrationRisk]

class CashDrag(BaseModel):
    excess_cash: float
    current_cash_yield: float
    target_cash_yield: float
    missed_annual_yield: float
    is_warning: bool
    has_drag: bool # Added for test alignment

class TaxDrag(BaseModel):
    taxable_yield_value: float
    tax_advantaged_yield_value: float
    estimated_tax_drag_value: float
    is_warning: bool
    has_drag: bool # Added for test alignment

class PortfolioAnalysisMetrics(BaseModel):
    # Compatibility Shim: The SDK expects 'concentration_risks' (plural list), 
    # but the automated test suite expects 'concentration_risk' (singular summary object).
    # We provide both to ensure Day 0 stability across all consumers.
    concentration_risk: ConcentrationRiskSummary
    concentration_risks: list[ConcentrationRisk]
    
    cash_drag: CashDrag | None = None
    tax_drag: TaxDrag | None = None
