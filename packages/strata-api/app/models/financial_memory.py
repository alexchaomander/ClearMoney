import enum
import uuid
from decimal import Decimal

from sqlalchemy import Enum, ForeignKey, JSON, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class FilingStatus(str, enum.Enum):
    single = "single"
    married_filing_jointly = "married_filing_jointly"
    married_filing_separately = "married_filing_separately"
    head_of_household = "head_of_household"


class RiskTolerance(str, enum.Enum):
    conservative = "conservative"
    moderate = "moderate"
    aggressive = "aggressive"


class FinancialMemory(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "financial_memories"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True
    )

    # Demographics
    age: Mapped[int | None] = mapped_column(default=None)
    state: Mapped[str | None] = mapped_column(String(2), default=None)
    filing_status: Mapped[FilingStatus | None] = mapped_column(
        Enum(FilingStatus, values_callable=lambda e: [x.value for x in e]),
        default=None,
    )
    num_dependents: Mapped[int | None] = mapped_column(default=None)

    # Income
    annual_income: Mapped[Decimal | None] = mapped_column(
        Numeric(14, 2), default=None
    )
    monthly_income: Mapped[Decimal | None] = mapped_column(
        Numeric(14, 2), default=None
    )
    income_growth_rate: Mapped[Decimal | None] = mapped_column(
        Numeric(6, 4), default=None
    )

    # Tax
    federal_tax_rate: Mapped[Decimal | None] = mapped_column(
        Numeric(6, 4), default=None
    )
    state_tax_rate: Mapped[Decimal | None] = mapped_column(
        Numeric(6, 4), default=None
    )
    capital_gains_rate: Mapped[Decimal | None] = mapped_column(
        Numeric(6, 4), default=None
    )

    # Retirement
    retirement_age: Mapped[int | None] = mapped_column(default=None)
    current_retirement_savings: Mapped[Decimal | None] = mapped_column(
        Numeric(14, 2), default=None
    )
    monthly_retirement_contribution: Mapped[Decimal | None] = mapped_column(
        Numeric(14, 2), default=None
    )
    employer_match_pct: Mapped[Decimal | None] = mapped_column(
        Numeric(6, 4), default=None
    )
    expected_social_security: Mapped[Decimal | None] = mapped_column(
        Numeric(14, 2), default=None
    )
    desired_retirement_income: Mapped[Decimal | None] = mapped_column(
        Numeric(14, 2), default=None
    )

    # Housing
    home_value: Mapped[Decimal | None] = mapped_column(
        Numeric(14, 2), default=None
    )
    mortgage_balance: Mapped[Decimal | None] = mapped_column(
        Numeric(14, 2), default=None
    )
    mortgage_rate: Mapped[Decimal | None] = mapped_column(
        Numeric(6, 4), default=None
    )
    monthly_rent: Mapped[Decimal | None] = mapped_column(
        Numeric(14, 2), default=None
    )

    # Goals & Preferences
    risk_tolerance: Mapped[RiskTolerance | None] = mapped_column(
        Enum(RiskTolerance, values_callable=lambda e: [x.value for x in e]),
        default=None,
    )
    investment_horizon_years: Mapped[int | None] = mapped_column(default=None)
    monthly_savings_target: Mapped[Decimal | None] = mapped_column(
        Numeric(14, 2), default=None
    )
    average_monthly_expenses: Mapped[Decimal | None] = mapped_column(
        Numeric(14, 2), default=None
    )
    emergency_fund_target_months: Mapped[int | None] = mapped_column(default=None)

    # Derived summaries & category inputs (JSON)
    spending_categories_monthly: Mapped[dict | None] = mapped_column(
        JSON, nullable=True, default=None
    )
    debt_profile: Mapped[dict | None] = mapped_column(JSON, nullable=True, default=None)
    portfolio_summary: Mapped[dict | None] = mapped_column(
        JSON, nullable=True, default=None
    )
    equity_compensation: Mapped[dict | None] = mapped_column(
        JSON, nullable=True, default=None
    )

    # Freeform (for agent observations)
    notes: Mapped[dict | None] = mapped_column(JSON, nullable=True, default=None)
