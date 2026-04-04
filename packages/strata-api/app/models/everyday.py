import enum
import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import (
    JSON,
    Boolean,
    Date,
    DateTime,
    Enum,
    ForeignKey,
    Numeric,
    String,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.user import User


class BudgetCategoryType(str, enum.Enum):
    fixed = "fixed"
    flexible = "flexible"


class GoalType(str, enum.Enum):
    emergency_fund = "emergency_fund"
    general_savings = "general_savings"
    debt_payoff = "debt_payoff"
    major_purchase = "major_purchase"


class GoalStatus(str, enum.Enum):
    active = "active"
    paused = "paused"
    completed = "completed"


class RecurringCadence(str, enum.Enum):
    weekly = "weekly"
    monthly = "monthly"
    quarterly = "quarterly"


class RecurringState(str, enum.Enum):
    review = "review"
    active = "active"
    dismissed = "dismissed"


class RuleMatchMode(str, enum.Enum):
    contains = "contains"
    exact = "exact"


class TransactionKind(str, enum.Enum):
    standard = "standard"
    transfer = "transfer"
    personal = "personal"
    business = "business"


class InboxItemType(str, enum.Enum):
    budget_drift = "budget_drift"
    recurring_change = "recurring_change"
    goal_risk = "goal_risk"
    data_freshness = "data_freshness"
    review = "review"
    general = "general"


class ItemSeverity(str, enum.Enum):
    info = "info"
    warning = "warning"
    critical = "critical"


class ReviewItemType(str, enum.Enum):
    transaction = "transaction"
    recurring = "recurring"
    goal = "goal"


class ReviewItemStatus(str, enum.Enum):
    open = "open"
    resolved = "resolved"
    dismissed = "dismissed"


class Budget(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "budgets"
    __table_args__ = (
        UniqueConstraint("user_id", "month_start", name="uq_budget_user_month"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    name: Mapped[str] = mapped_column(String(200), default="Monthly plan")
    month_start: Mapped[date] = mapped_column(Date, index=True)
    notes: Mapped[str | None] = mapped_column(String(500), nullable=True)

    user: Mapped["User"] = relationship(back_populates="budgets")
    categories: Mapped[list["BudgetCategory"]] = relationship(
        back_populates="budget", cascade="all, delete-orphan"
    )


class BudgetCategory(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "budget_categories"

    budget_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("budgets.id", ondelete="CASCADE"), index=True
    )
    name: Mapped[str] = mapped_column(String(120))
    planned_amount: Mapped[Decimal] = mapped_column(
        Numeric(precision=14, scale=2), default=Decimal("0.00")
    )
    category_type: Mapped[BudgetCategoryType] = mapped_column(
        Enum(BudgetCategoryType, values_callable=lambda e: [x.value for x in e]),
        default=BudgetCategoryType.flexible,
    )
    rollover_enabled: Mapped[bool] = mapped_column(Boolean, default=False)
    rollover_amount: Mapped[Decimal] = mapped_column(
        Numeric(precision=14, scale=2), default=Decimal("0.00")
    )

    budget: Mapped["Budget"] = relationship(back_populates="categories")


class Goal(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "goals"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    name: Mapped[str] = mapped_column(String(200))
    goal_type: Mapped[GoalType] = mapped_column(
        Enum(GoalType, values_callable=lambda e: [x.value for x in e]),
        default=GoalType.general_savings,
    )
    target_amount: Mapped[Decimal] = mapped_column(Numeric(precision=14, scale=2))
    current_amount: Mapped[Decimal] = mapped_column(
        Numeric(precision=14, scale=2), default=Decimal("0.00")
    )
    monthly_contribution: Mapped[Decimal | None] = mapped_column(
        Numeric(precision=14, scale=2), nullable=True
    )
    target_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    linked_account_ids: Mapped[list[str] | None] = mapped_column(JSON, nullable=True)
    status: Mapped[GoalStatus] = mapped_column(
        Enum(GoalStatus, values_callable=lambda e: [x.value for x in e]),
        default=GoalStatus.active,
    )

    user: Mapped["User"] = relationship(back_populates="goals")


class RecurringItem(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "recurring_items"
    __table_args__ = (
        UniqueConstraint("user_id", "merchant_name", name="uq_recurring_user_merchant"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    name: Mapped[str] = mapped_column(String(200))
    merchant_name: Mapped[str] = mapped_column(String(200), index=True)
    category: Mapped[str | None] = mapped_column(String(100), nullable=True)
    cadence: Mapped[RecurringCadence] = mapped_column(
        Enum(RecurringCadence, values_callable=lambda e: [x.value for x in e]),
        default=RecurringCadence.monthly,
    )
    expected_amount: Mapped[Decimal] = mapped_column(Numeric(precision=14, scale=2))
    amount_tolerance: Mapped[Decimal] = mapped_column(
        Numeric(precision=14, scale=2), default=Decimal("0.00")
    )
    next_due_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    last_seen_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    confidence: Mapped[Decimal] = mapped_column(
        Numeric(precision=5, scale=4), default=Decimal("0.5000")
    )
    state: Mapped[RecurringState] = mapped_column(
        Enum(RecurringState, values_callable=lambda e: [x.value for x in e]),
        default=RecurringState.review,
    )
    metadata_json: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    user: Mapped["User"] = relationship(back_populates="recurring_items")


class TransactionRule(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "transaction_rules"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    name: Mapped[str] = mapped_column(String(200))
    match_text: Mapped[str] = mapped_column(String(255), index=True)
    match_mode: Mapped[RuleMatchMode] = mapped_column(
        Enum(RuleMatchMode, values_callable=lambda e: [x.value for x in e]),
        default=RuleMatchMode.contains,
    )
    merchant_name_override: Mapped[str | None] = mapped_column(String(200), nullable=True)
    primary_category_override: Mapped[str | None] = mapped_column(String(100), nullable=True)
    transaction_kind_override: Mapped[TransactionKind | None] = mapped_column(
        Enum(TransactionKind, values_callable=lambda e: [x.value for x in e]),
        nullable=True,
    )
    exclude_from_budget: Mapped[bool] = mapped_column(Boolean, default=False)
    exclude_from_goals: Mapped[bool] = mapped_column(Boolean, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    user: Mapped["User"] = relationship(back_populates="transaction_rules")


class InboxItem(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "inbox_items"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    item_type: Mapped[InboxItemType] = mapped_column(
        Enum(InboxItemType, values_callable=lambda e: [x.value for x in e]),
        default=InboxItemType.general,
    )
    severity: Mapped[ItemSeverity] = mapped_column(
        Enum(ItemSeverity, values_callable=lambda e: [x.value for x in e]),
        default=ItemSeverity.info,
    )
    title: Mapped[str] = mapped_column(String(200))
    message: Mapped[str] = mapped_column(String(500))
    due_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    is_resolved: Mapped[bool] = mapped_column(Boolean, default=False)
    action_url: Mapped[str | None] = mapped_column(String(200), nullable=True)
    metadata_json: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    user: Mapped["User"] = relationship(back_populates="inbox_items")


class ReviewItem(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "review_items"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    review_type: Mapped[ReviewItemType] = mapped_column(
        Enum(ReviewItemType, values_callable=lambda e: [x.value for x in e]),
        default=ReviewItemType.transaction,
    )
    title: Mapped[str] = mapped_column(String(200))
    message: Mapped[str] = mapped_column(String(500))
    status: Mapped[ReviewItemStatus] = mapped_column(
        Enum(ReviewItemStatus, values_callable=lambda e: [x.value for x in e]),
        default=ReviewItemStatus.open,
    )
    confidence: Mapped[Decimal | None] = mapped_column(
        Numeric(precision=5, scale=4), nullable=True
    )
    source_type: Mapped[str | None] = mapped_column(String(100), nullable=True)
    source_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    due_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    user: Mapped["User"] = relationship(back_populates="review_items")
    user: Mapped["User"] = relationship(back_populates="goals")

    user: Mapped["User"] = relationship(back_populates="recurring_items")

    user: Mapped["User"] = relationship(back_populates="transaction_rules")

    user: Mapped["User"] = relationship(back_populates="inbox_items")

    user: Mapped["User"] = relationship(back_populates="review_items")
