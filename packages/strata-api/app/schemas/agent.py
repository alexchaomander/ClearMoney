from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class FreshnessStatus(BaseModel):
    is_fresh: bool
    age_hours: float | None = None
    max_age_hours: float
    last_sync: str | None = None
    warning: str | None = None


class ConfidenceFactor(BaseModel):
    label: str
    value: float
    impact: str
    reason: str


class TraceCorrectionTarget(BaseModel):
    field: str
    label: str
    input_type: str
    metric_ids: list[str] = Field(default_factory=list)


class TraceComponent(BaseModel):
    component_kind: str
    label: str
    raw_value: float | int | str | None = None
    display_value: str
    source: str | None = None
    source_tier: str
    determinism_class: str
    as_of: str | None = None
    freshness_status: str | None = None
    policy_reference: str | None = None


class ContextQualityResponse(BaseModel):
    continuity_status: str
    recommendation_readiness: str
    confidence_score: float
    freshness: FreshnessStatus
    coverage_ratio: float
    active_connection_count: int
    total_connection_count: int
    stale_connection_count: int
    errored_connection_count: int
    warnings: list[str] = Field(default_factory=list)
    confidence_factors: list[ConfidenceFactor] = Field(default_factory=list)


class DecisionTraceRuleCheck(BaseModel):
    name: str
    passed: bool | None = None
    value: float | int | str | None = None
    threshold: float | int | str | None = None
    message: str | None = None


class DecisionTraceInsight(BaseModel):
    title: str
    summary: str | None = None
    recommendation: str | None = None
    severity: str | None = None


class DecisionTraceRemediationAction(BaseModel):
    action_id: str
    label: str
    description: str
    href: str
    priority: str = "medium"


class DecisionTraceReviewSummary(BaseModel):
    review_status: str | None = None
    open_review_count: int = 0
    latest_resolution: str | None = None
    latest_resolution_notes: str | None = None
    reviewer_label: str | None = None


class DecisionTracePayload(BaseModel):
    trace_version: str = "v2"
    trace_kind: str
    title: str | None = None
    summary: str | None = None
    rules_applied: list[DecisionTraceRuleCheck] = Field(default_factory=list)
    insights: list[DecisionTraceInsight] = Field(default_factory=list)
    assumptions: list[str] = Field(default_factory=list)
    confidence_score: float | None = None
    confidence_factors: list[ConfidenceFactor] = Field(default_factory=list)
    determinism_class: str = "deterministic"
    source_tier: str = "derived_context"
    continuity_status: str = "healthy"
    recommendation_readiness: str = "ready"
    coverage_status: str = "full"
    policy_version: str = "context-policy-v1"
    freshness: FreshnessStatus
    context_quality: ContextQualityResponse
    warnings: list[str] = Field(default_factory=list)
    remediation_actions: list[DecisionTraceRemediationAction] = Field(default_factory=list)
    correction_targets: list[TraceCorrectionTarget] = Field(default_factory=list)
    review_summary: DecisionTraceReviewSummary | None = None
    deterministic: dict[str, Any] = Field(default_factory=dict)


class FinancialContextAccount(BaseModel):
    name: str
    type: str
    balance: float | None = None
    is_tax_advantaged: bool | None = None
    interest_rate: float | None = None
    minimum_payment: float | None = None


class FinancialContextRealEstateAsset(BaseModel):
    name: str
    address: str | None = None
    type: str
    market_value: float | None = None


class FinancialContextVehicleAsset(BaseModel):
    name: str
    make: str | None = None
    model: str | None = None
    year: int | None = None
    type: str
    market_value: float | None = None


class FinancialContextCollectibleAsset(BaseModel):
    name: str
    type: str
    market_value: float | None = None


class FinancialContextPreciousMetalAsset(BaseModel):
    name: str
    type: str
    weight_oz: float | None = None
    market_value: float | None = None


class FinancialContextAlternativeAsset(BaseModel):
    name: str
    type: str
    market_value: float | None = None


class FinancialContextAccounts(BaseModel):
    investment: list[FinancialContextAccount] = Field(default_factory=list)
    cash: list[FinancialContextAccount] = Field(default_factory=list)
    debt: list[FinancialContextAccount] = Field(default_factory=list)
    real_estate: list[FinancialContextRealEstateAsset] = Field(default_factory=list)
    vehicles: list[FinancialContextVehicleAsset] = Field(default_factory=list)
    collectibles: list[FinancialContextCollectibleAsset] = Field(default_factory=list)
    precious_metals: list[FinancialContextPreciousMetalAsset] = Field(default_factory=list)
    alternative_assets: list[FinancialContextAlternativeAsset] = Field(default_factory=list)


class FinancialContextHolding(BaseModel):
    ticker: str | None = None
    name: str
    security_type: str
    quantity: float
    market_value: float | None = None
    cost_basis: float | None = None
    account: str


class FinancialContextTransaction(BaseModel):
    type: str
    amount: float | None = None
    description: str | None = None
    trade_date: str | None = None


class PortfolioMetrics(BaseModel):
    net_worth: float | None = None
    total_investment_value: float | None = None
    total_cash_value: float | None = None
    total_debt_value: float | None = None
    total_physical_asset_value: float | None = None
    total_equity_vested_value: float | None = None
    total_equity_unvested_value: float | None = None
    tax_advantaged_value: float | None = None
    taxable_value: float | None = None
    allocation_by_asset_type: dict[str, float] = Field(default_factory=dict)
    runway_months: float | None = None


class DataFreshness(BaseModel):
    last_sync: str | None = None
    profile_updated: str | None = None
    accounts_count: int | None = None
    connections_count: int | None = None


class FinancialContextPayload(BaseModel):
    profile: dict[str, Any] = Field(default_factory=dict)
    accounts: FinancialContextAccounts = Field(default_factory=FinancialContextAccounts)
    holdings: list[FinancialContextHolding] = Field(default_factory=list)
    equity: dict[str, Any] = Field(default_factory=dict)
    recent_transactions: list[FinancialContextTransaction] = Field(default_factory=list)
    portfolio_metrics: PortfolioMetrics = Field(default_factory=PortfolioMetrics)
    data_freshness: DataFreshness = Field(default_factory=DataFreshness)


class AgentContextResponse(BaseModel):
    allowed: bool
    freshness: FreshnessStatus
    context: FinancialContextPayload


class DecisionTraceResponse(BaseModel):
    id: UUID
    session_id: UUID
    recommendation_id: UUID | None
    trace_type: str
    input_data: dict[str, Any]
    reasoning_steps: list[Any]
    outputs: dict[str, Any]
    data_freshness: dict[str, Any]
    warnings: list[str]
    source: str
    created_at: datetime
    trace_payload: DecisionTracePayload | None = None

    model_config = ConfigDict(from_attributes=True)


class MetricTraceDataPoint(BaseModel):
    label: str
    value: str | float | int
    source: str | None = None


class MetricTraceResponse(BaseModel):
    metric_id: str
    formula_id: str
    formula_version: str
    label: str
    formula: str
    description: str
    data_points: list[MetricTraceDataPoint] = Field(default_factory=list)
    components: list[TraceComponent] = Field(default_factory=list)
    confidence_score: float
    confidence_factors: list[ConfidenceFactor] = Field(default_factory=list)
    determinism_class: str = "deterministic"
    source_tier: str = "derived_context"
    continuity_status: str = "healthy"
    recommendation_readiness: str = "ready"
    coverage_status: str = "full"
    methodology_version: str = "v1"
    as_of: str | None = None
    warnings: list[str] = Field(default_factory=list)
    policy_version: str = "context-policy-v1"
    correction_targets: list[TraceCorrectionTarget] = Field(default_factory=list)


class ExecuteRecommendationRequest(BaseModel):
    action: str
    connection_id: UUID | None = None
    payload: dict[str, Any] | None = None


class ExecuteRecommendationResponse(BaseModel):
    recommendation_id: UUID
    action: str
    status: str
    result: dict[str, Any]
    trace_id: UUID
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
