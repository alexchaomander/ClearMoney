from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class PointsValuations(BaseModel):
    tpg: float
    conservative: float
    moderate: float
    optimistic: float


class PointsMethodology(BaseModel):
    cash_out: float | None = Field(default=None, alias="cash_out")
    portal_value: float | None = Field(default=None, alias="portal_value")
    transfer_value: str


class PointsProgram(BaseModel):
    id: str
    name: str
    short_name: str
    issuer: str
    category: str
    valuations: PointsValuations
    methodology: PointsMethodology
    best_uses: list[str]
    worst_uses: list[str]
    last_updated: str

    model_config = ConfigDict(validate_by_name=True)


class CardCreditData(BaseModel):
    name: str
    value: float
    period: str
    description: str | None = None
    category: str | None = None
    default_usable_pct: int | None = None


class CardBenefitData(BaseModel):
    name: str
    description: str | None = None
    valuation_method: str | None = None
    default_value: float | None = None


class CardSignupBonus(BaseModel):
    points: int
    spend_required: int
    timeframe_months: int


class CreditCardData(BaseModel):
    id: str
    name: str
    issuer: str
    annual_fee: float
    currency_id: str | None = None
    image_url: str | None = None
    apply_url: str | None = None
    affiliate_payout_estimate: float | None = None
    tpg_rank: int | None = None
    default_rewards_rate: float | None = None
    credits: list[CardCreditData]
    benefits: list[CardBenefitData]
    earn_rates: dict[str, float] | None = None
    signup_bonus: CardSignupBonus | None = None


class SavingsProduct(BaseModel):
    id: str
    name: str
    provider: str
    product_type: str
    apy: float
    minimum_balance: float | None = None
    monthly_fee: float | None = None
    fdic_insured: bool = True
    last_updated: str | None = None
    notes: str | None = None


class ContributionLimit(BaseModel):
    id: str
    account_type: str
    year: int
    base_limit: float
    catch_up_50: float | None = None
    catch_up_60_63: float | None = None
    notes: str | None = None


class MarketAssumption(BaseModel):
    id: str
    name: str
    expected_return: float
    volatility: float
    inflation: float
    notes: str | None = None


class InvestmentData(BaseModel):
    last_updated: str | None = None
    contribution_limits: list[ContributionLimit] = []
    market_assumptions: list[MarketAssumption] = []


class MortgageRate(BaseModel):
    id: str
    loan_type: str
    term_years: int
    rate: float
    points: float | None = None
    notes: str | None = None


class HomePriceAssumption(BaseModel):
    id: str
    name: str
    appreciation_rate: float
    notes: str | None = None


class RealAssetData(BaseModel):
    last_updated: str | None = None
    mortgage_rates: list[MortgageRate] = []
    home_price_assumptions: list[HomePriceAssumption] = []


class LoanRate(BaseModel):
    id: str
    loan_type: str
    rate: float
    term_years: int | None = None
    notes: str | None = None


class LiabilityData(BaseModel):
    last_updated: str | None = None
    loan_rates: list[LoanRate] = []


class TaxBracket(BaseModel):
    rate: float
    cap: float | None = None


class IncomeTaxBracket(BaseModel):
    id: str
    year: int
    filing_status: str
    brackets: list[TaxBracket]


class StandardDeduction(BaseModel):
    year: int
    filing_status: str
    amount: float


class PayrollLimit(BaseModel):
    year: int
    social_security_wage_base: float
    medicare_additional_threshold: float


class IncomeData(BaseModel):
    last_updated: str | None = None
    tax_brackets: list[IncomeTaxBracket] = []
    standard_deductions: list[StandardDeduction] = []
    payroll_limits: list[PayrollLimit] = []


class CreditScoreFactor(BaseModel):
    id: str
    name: str
    weight: float
    description: str | None = None


class UtilizationGuideline(BaseModel):
    label: str
    min: float
    max: float
    notes: str | None = None


class CreditData(BaseModel):
    last_updated: str | None = None
    score_factors: list[CreditScoreFactor] = []
    utilization_guidelines: list[UtilizationGuideline] = []


class InsuranceEstimate(BaseModel):
    id: str
    name: str
    coverage_multiple_income: float
    typical_cost_pct_income: float
    notes: str | None = None


class ProtectionData(BaseModel):
    last_updated: str | None = None
    insurance_estimates: list[InsuranceEstimate] = []


class ToolPreset(BaseModel):
    tool_id: str
    defaults: dict[str, Any]
    updated_at: str | None = None


class ToolPresetBundle(BaseModel):
    last_updated: str | None = None
    presets: list[ToolPreset] = []
