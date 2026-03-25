from __future__ import annotations

import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel

from app.models.financial_memory import FilingStatus, RiskTolerance
from app.models.memory_event import MemoryEventSource


class FinancialMemoryUpdate(BaseModel):
    """Partial update — all fields optional."""

    # Demographics
    age: int | None = None
    state: str | None = None
    filing_status: FilingStatus | None = None
    num_dependents: int | None = None

    # Income
    annual_income: Decimal | None = None
    monthly_income: Decimal | None = None
    income_growth_rate: Decimal | None = None

    # Tax
    federal_tax_rate: Decimal | None = None
    state_tax_rate: Decimal | None = None
    capital_gains_rate: Decimal | None = None

    # Retirement
    retirement_age: int | None = None
    current_retirement_savings: Decimal | None = None
    monthly_retirement_contribution: Decimal | None = None
    employer_match_pct: Decimal | None = None
    expected_social_security: Decimal | None = None
    desired_retirement_income: Decimal | None = None

    # Housing
    home_value: Decimal | None = None
    mortgage_balance: Decimal | None = None
    mortgage_rate: Decimal | None = None
    monthly_rent: Decimal | None = None

    # Goals & Preferences
    risk_tolerance: RiskTolerance | None = None
    investment_horizon_years: int | None = None
    monthly_savings_target: Decimal | None = None
    average_monthly_expenses: Decimal | None = None
    emergency_fund_target_months: int | None = None
    spending_categories_monthly: dict | None = None
    debt_profile: dict | None = None
    portfolio_summary: dict | None = None
    equity_compensation: dict | None = None

    # Freeform
    notes: dict | None = None

    # User preferences & overrides
    preferences: dict | None = None

    # Employer Data
    employer_name: str | None = None
    employer_industry: str | None = None

    # Insurance Details
    life_insurance_benefit: Decimal | None = None
    disability_insurance_benefit: Decimal | None = None
    umbrella_policy_limit: Decimal | None = None

    # Estate Planning
    has_will: bool | None = None
    has_trust: bool | None = None
    has_poa: bool | None = None

    # Entity Structure
    entity_type: str | None = None

    # Source tracking (not stored on memory itself, used for event logging)
    source: MemoryEventSource = MemoryEventSource.user_input
    source_context: str | None = None


class FinancialMemoryResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID

    # Demographics
    age: int | None
    state: str | None
    filing_status: FilingStatus | None
    num_dependents: int | None

    # Income
    annual_income: Decimal | None
    monthly_income: Decimal | None
    income_growth_rate: Decimal | None

    # Tax
    federal_tax_rate: Decimal | None
    state_tax_rate: Decimal | None
    capital_gains_rate: Decimal | None

    # Retirement
    retirement_age: int | None
    current_retirement_savings: Decimal | None
    monthly_retirement_contribution: Decimal | None
    employer_match_pct: Decimal | None
    expected_social_security: Decimal | None
    desired_retirement_income: Decimal | None

    # Housing
    home_value: Decimal | None
    mortgage_balance: Decimal | None
    mortgage_rate: Decimal | None
    monthly_rent: Decimal | None

    # Goals & Preferences
    risk_tolerance: RiskTolerance | None
    investment_horizon_years: int | None
    monthly_savings_target: Decimal | None
    average_monthly_expenses: Decimal | None
    emergency_fund_target_months: int | None
    spending_categories_monthly: dict | None
    debt_profile: dict | None
    portfolio_summary: dict | None
    equity_compensation: dict | None

    # Freeform
    notes: dict | None
    preferences: dict | None

    # Employer Data
    employer_name: str | None
    employer_industry: str | None

    # Insurance Details
    life_insurance_benefit: Decimal | None
    disability_insurance_benefit: Decimal | None
    umbrella_policy_limit: Decimal | None

    # Estate Planning
    has_will: bool | None
    has_trust: bool | None
    has_poa: bool | None

    # Entity Structure
    entity_type: str | None

    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class MemoryEventResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    field_name: str
    old_value: str | None
    new_value: str | None
    source: MemoryEventSource
    context: str | None
    created_at: datetime

    model_config = {"from_attributes": True}
