import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import Any

from pydantic import BaseModel, ConfigDict, Field

from app.models.everyday import (
    BudgetCategoryType,
    GoalStatus,
    GoalType,
    InboxItemType,
    ItemSeverity,
    RecurringCadence,
    RecurringState,
    ReviewItemStatus,
    ReviewItemType,
    RuleMatchMode,
    TransactionKind,
)


class BudgetCategoryInput(BaseModel):
    name: str
    planned_amount: Decimal
    category_type: BudgetCategoryType = BudgetCategoryType.flexible
    rollover_enabled: bool = False
    rollover_amount: Decimal = Decimal("0.00")


class BudgetCreate(BaseModel):
    name: str = "Monthly plan"
    month_start: date
    notes: str | None = None
    categories: list[BudgetCategoryInput] = Field(default_factory=list)


class BudgetUpdate(BaseModel):
    name: str | None = None
    notes: str | None = None
    categories: list[BudgetCategoryInput] | None = None


class BudgetCategoryResponse(BudgetCategoryInput):
    id: uuid.UUID
    budget_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class BudgetResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    name: str
    month_start: date
    notes: str | None
    categories: list[BudgetCategoryResponse]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class BudgetSummaryCategory(BaseModel):
    id: str
    name: str
    planned_amount: Decimal
    actual_amount: Decimal
    remaining_amount: Decimal
    category_type: str
    rollover_enabled: bool
    rollover_amount: Decimal


class BudgetSummaryResponse(BaseModel):
    budget_id: str
    month_start: date
    month_end: date
    total_planned: Decimal
    total_actual: Decimal
    total_remaining: Decimal
    safe_to_spend: Decimal
    categories: list[BudgetSummaryCategory]


class GoalCreate(BaseModel):
    name: str
    goal_type: GoalType = GoalType.general_savings
    target_amount: Decimal
    current_amount: Decimal = Decimal("0.00")
    monthly_contribution: Decimal | None = None
    target_date: date | None = None
    linked_account_ids: list[str] | None = None
    status: GoalStatus = GoalStatus.active


class GoalUpdate(BaseModel):
    name: str | None = None
    goal_type: GoalType | None = None
    target_amount: Decimal | None = None
    current_amount: Decimal | None = None
    monthly_contribution: Decimal | None = None
    target_date: date | None = None
    linked_account_ids: list[str] | None = None
    status: GoalStatus | None = None


class GoalResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    name: str
    goal_type: GoalType
    target_amount: Decimal
    current_amount: Decimal
    monthly_contribution: Decimal | None
    target_date: date | None
    linked_account_ids: list[str] | None
    status: GoalStatus
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class GoalProgressResponse(BaseModel):
    id: str
    name: str
    goal_type: str
    target_amount: Decimal
    current_amount: Decimal
    progress_percent: float
    monthly_contribution: Decimal | None
    target_date: date | None
    required_monthly_contribution: Decimal | None
    status: str


class RecurringItemUpdate(BaseModel):
    name: str | None = None
    category: str | None = None
    cadence: RecurringCadence | None = None
    expected_amount: Decimal | None = None
    amount_tolerance: Decimal | None = None
    next_due_date: date | None = None
    state: RecurringState | None = None


class RecurringItemResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    name: str
    merchant_name: str
    category: str | None
    cadence: RecurringCadence
    expected_amount: Decimal
    amount_tolerance: Decimal
    next_due_date: date | None
    last_seen_at: datetime | None
    confidence: Decimal
    state: RecurringState
    metadata_json: dict[str, Any] | None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TransactionRuleCreate(BaseModel):
    name: str
    match_text: str
    match_mode: RuleMatchMode = RuleMatchMode.contains
    merchant_name_override: str | None = None
    primary_category_override: str | None = None
    transaction_kind_override: TransactionKind | None = None
    exclude_from_budget: bool = False
    exclude_from_goals: bool = False
    is_active: bool = True


class TransactionRuleUpdate(BaseModel):
    name: str | None = None
    match_text: str | None = None
    match_mode: RuleMatchMode | None = None
    merchant_name_override: str | None = None
    primary_category_override: str | None = None
    transaction_kind_override: TransactionKind | None = None
    exclude_from_budget: bool | None = None
    exclude_from_goals: bool | None = None
    is_active: bool | None = None


class TransactionRuleResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    name: str
    match_text: str
    match_mode: RuleMatchMode
    merchant_name_override: str | None
    primary_category_override: str | None
    transaction_kind_override: TransactionKind | None
    exclude_from_budget: bool
    exclude_from_goals: bool
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class InboxItemUpdate(BaseModel):
    is_resolved: bool | None = None


class InboxItemResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    item_type: InboxItemType
    severity: ItemSeverity
    title: str
    message: str
    due_at: datetime | None
    is_resolved: bool
    action_url: str | None
    metadata_json: dict[str, Any] | None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ReviewItemUpdate(BaseModel):
    status: ReviewItemStatus


class ReviewItemResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    review_type: ReviewItemType
    title: str
    message: str
    status: ReviewItemStatus
    confidence: Decimal | None
    source_type: str | None
    source_id: str | None
    due_at: datetime | None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class WeeklyBriefingResponse(BaseModel):
    period_start: date
    period_end: date
    spending_total: Decimal
    net_worth_change: Decimal
    goal_risk_count: int
    recurring_review_count: int
    headline: str


class ConsumerHomeResponse(BaseModel):
    budget_summary: BudgetSummaryResponse | None
    goals: list[GoalProgressResponse]
    recurring_items: list[RecurringItemResponse]
    inbox_items: list[InboxItemResponse]
    review_items: list[ReviewItemResponse]
    weekly_briefing: WeeklyBriefingResponse
