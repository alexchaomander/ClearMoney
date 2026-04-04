from __future__ import annotations

from collections import defaultdict
from datetime import UTC, date, datetime, timedelta
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.bank_transaction import BankTransaction
from app.models.cash_account import CashAccount
from app.models.everyday import (
    Budget,
    Goal,
    InboxItem,
    InboxItemType,
    ItemSeverity,
    RecurringCadence,
    RecurringItem,
    RecurringState,
    ReviewItem,
    ReviewItemStatus,
    ReviewItemType,
    RuleMatchMode,
    TransactionKind,
    TransactionRule,
)
from app.models.portfolio_snapshot import PortfolioSnapshot


def month_window(month_start: date) -> tuple[date, date]:
    next_month = date(
        month_start.year + (1 if month_start.month == 12 else 0),
        1 if month_start.month == 12 else month_start.month + 1,
        1,
    )
    return month_start, next_month


def cadence_delta(cadence: RecurringCadence) -> timedelta:
    if cadence == RecurringCadence.weekly:
        return timedelta(days=7)
    if cadence == RecurringCadence.quarterly:
        return timedelta(days=91)
    return timedelta(days=30)


def _normalized_tx_text(tx: BankTransaction) -> str:
    return f"{tx.merchant_name or ''} {tx.name}".strip().lower()


def rule_matches(rule: TransactionRule, tx: BankTransaction) -> bool:
    haystack = _normalized_tx_text(tx)
    needle = rule.match_text.strip().lower()
    if not needle:
        return False
    if rule.match_mode == RuleMatchMode.exact:
        return haystack == needle
    return needle in haystack


def choose_rule(rules: list[TransactionRule], tx: BankTransaction) -> TransactionRule | None:
    for rule in rules:
        if rule.is_active and rule_matches(rule, tx):
            return rule
    return None


def effective_merchant(tx: BankTransaction, rule: TransactionRule | None = None) -> str:
    return (
        tx.user_merchant_name
        or (rule.merchant_name_override if rule and rule.merchant_name_override else None)
        or tx.merchant_name
        or tx.name
    )


def effective_category(tx: BankTransaction, rule: TransactionRule | None = None) -> str:
    return (
        tx.user_primary_category
        or (rule.primary_category_override if rule and rule.primary_category_override else None)
        or tx.primary_category
        or "Uncategorized"
    )


def effective_transaction_kind(
    tx: BankTransaction,
    rule: TransactionRule | None = None,
) -> TransactionKind:
    if tx.transaction_kind:
        return TransactionKind(tx.transaction_kind)
    if rule and rule.transaction_kind_override:
        return rule.transaction_kind_override
    return TransactionKind.standard


def excluded_from_budget(tx: BankTransaction, rule: TransactionRule | None = None) -> bool:
    return tx.excluded_from_budget or bool(rule and rule.exclude_from_budget)


def excluded_from_goals(tx: BankTransaction, rule: TransactionRule | None = None) -> bool:
    return tx.excluded_from_goals or bool(rule and rule.exclude_from_goals)


async def get_transaction_rules(session: AsyncSession, user_id) -> list[TransactionRule]:
    result = await session.execute(
        select(TransactionRule)
        .where(TransactionRule.user_id == user_id)
        .order_by(TransactionRule.created_at.asc())
    )
    return list(result.scalars().all())


async def build_budget_summary(session: AsyncSession, budget: Budget) -> dict:
    period_start, period_end = month_window(budget.month_start)
    rules = await get_transaction_rules(session, budget.user_id)
    tx_result = await session.execute(
        select(BankTransaction)
        .join(CashAccount)
        .where(
            CashAccount.user_id == budget.user_id,
            BankTransaction.transaction_date >= period_start,
            BankTransaction.transaction_date < period_end,
            BankTransaction.amount < 0,
        )
    )
    txs = tx_result.scalars().all()

    category_actuals: defaultdict[str, Decimal] = defaultdict(lambda: Decimal("0.00"))
    for tx in txs:
        rule = choose_rule(rules, tx)
        if excluded_from_budget(tx, rule):
            continue
        if effective_transaction_kind(tx, rule) == TransactionKind.transfer:
            continue
        category_actuals[effective_category(tx, rule)] += abs(tx.amount)

    categories = []
    total_planned = Decimal("0.00")
    total_actual = Decimal("0.00")
    for category in budget.categories:
        planned = category.planned_amount + (
            category.rollover_amount if category.rollover_enabled else Decimal("0.00")
        )
        actual = category_actuals.get(category.name, Decimal("0.00"))
        remaining = planned - actual
        total_planned += planned
        total_actual += actual
        categories.append(
            {
                "id": str(category.id),
                "name": category.name,
                "planned_amount": planned,
                "actual_amount": actual,
                "remaining_amount": remaining,
                "category_type": category.category_type.value,
                "rollover_enabled": category.rollover_enabled,
                "rollover_amount": category.rollover_amount,
            }
        )

    return {
        "budget_id": str(budget.id),
        "month_start": budget.month_start,
        "month_end": period_end - timedelta(days=1),
        "total_planned": total_planned,
        "total_actual": total_actual,
        "total_remaining": total_planned - total_actual,
        "safe_to_spend": max(total_planned - total_actual, Decimal("0.00")),
        "categories": categories,
    }


async def sync_recurring_items(session: AsyncSession, user_id) -> list[RecurringItem]:
    rules = await get_transaction_rules(session, user_id)
    tx_result = await session.execute(
        select(BankTransaction)
        .join(CashAccount)
        .where(
            CashAccount.user_id == user_id,
            BankTransaction.amount < 0,
        )
        .order_by(BankTransaction.transaction_date.desc())
    )
    txs = tx_result.scalars().all()

    grouped: defaultdict[str, list[BankTransaction]] = defaultdict(list)
    for tx in txs:
        rule = choose_rule(rules, tx)
        merchant = effective_merchant(tx, rule)
        grouped[merchant.lower()].append(tx)

    existing_result = await session.execute(
        select(RecurringItem).where(RecurringItem.user_id == user_id)
    )
    existing = {item.merchant_name.lower(): item for item in existing_result.scalars().all()}
    touched: list[RecurringItem] = []

    for merchant_key, items in grouped.items():
        if len(items) < 2:
            continue
        items.sort(key=lambda tx: tx.transaction_date)
        intervals = [
            (items[idx + 1].transaction_date - items[idx].transaction_date).days
            for idx in range(len(items) - 1)
        ]
        avg_interval = sum(intervals) / len(intervals)
        cadence: RecurringCadence | None = None
        confidence = Decimal("0.6000")
        if 6 <= avg_interval <= 8:
            cadence = RecurringCadence.weekly
            confidence = Decimal("0.9000")
        elif 25 <= avg_interval <= 35:
            cadence = RecurringCadence.monthly
            confidence = Decimal("0.9500")
        elif 80 <= avg_interval <= 100:
            cadence = RecurringCadence.quarterly
            confidence = Decimal("0.8500")
        if cadence is None:
            continue

        latest = items[-1]
        latest_amount = abs(latest.amount)
        rule = choose_rule(rules, latest)
        merchant_name = effective_merchant(latest, rule)
        category = effective_category(latest, rule)
        next_due = latest.transaction_date + cadence_delta(cadence)
        state = RecurringState.active if confidence >= Decimal("0.9000") else RecurringState.review

        record = existing.get(merchant_key)
        if record is None:
            record = RecurringItem(
                user_id=user_id,
                name=merchant_name,
                merchant_name=merchant_name,
                category=category,
                cadence=cadence,
                expected_amount=latest_amount,
                amount_tolerance=(latest_amount * Decimal("0.15")).quantize(Decimal("0.01")),
                next_due_date=next_due,
                last_seen_at=datetime.combine(latest.transaction_date, datetime.min.time(), tzinfo=UTC),
                confidence=confidence,
                state=state,
                metadata_json={"source": "transaction_scan"},
            )
            session.add(record)
        else:
            record.name = record.name or merchant_name
            record.category = record.category or category
            record.cadence = cadence
            record.expected_amount = latest_amount
            record.amount_tolerance = (latest_amount * Decimal("0.15")).quantize(Decimal("0.01"))
            record.next_due_date = next_due
            record.last_seen_at = datetime.combine(latest.transaction_date, datetime.min.time(), tzinfo=UTC)
            record.confidence = confidence
            if record.state != RecurringState.dismissed:
                record.state = state
        touched.append(record)

    await session.commit()
    for item in touched:
        await session.refresh(item)
    return touched or list(existing.values())


async def ensure_review_items(session: AsyncSession, user_id) -> list[ReviewItem]:
    recurring_items = await sync_recurring_items(session, user_id)
    current_result = await session.execute(
        select(ReviewItem).where(
            ReviewItem.user_id == user_id,
            ReviewItem.status == ReviewItemStatus.open,
        )
    )
    existing_keys = {
        (item.review_type.value, item.source_id or "")
        for item in current_result.scalars().all()
    }

    created = False
    for recurring in recurring_items:
        if recurring.state != RecurringState.review:
            continue
        key = (ReviewItemType.recurring.value, str(recurring.id))
        if key in existing_keys:
            continue
        session.add(
            ReviewItem(
                user_id=user_id,
                review_type=ReviewItemType.recurring,
                title=f"Confirm recurring charge: {recurring.name}",
                message="We detected a recurring bill pattern. Confirm the cadence and expected amount.",
                confidence=recurring.confidence,
                source_type="recurring_item",
                source_id=str(recurring.id),
            )
        )
        created = True

    rules = await get_transaction_rules(session, user_id)
    tx_result = await session.execute(
        select(BankTransaction)
        .join(CashAccount)
        .where(CashAccount.user_id == user_id)
        .order_by(BankTransaction.transaction_date.desc())
        .limit(200)
    )
    for tx in tx_result.scalars().all():
        rule = choose_rule(rules, tx)
        category = effective_category(tx, rule)
        key = (ReviewItemType.transaction.value, str(tx.id))
        if category.lower() != "uncategorized" or key in existing_keys:
            continue
        session.add(
            ReviewItem(
                user_id=user_id,
                review_type=ReviewItemType.transaction,
                title=f"Categorize transaction: {effective_merchant(tx, rule)}",
                message="This transaction is still uncategorized and should be reviewed.",
                confidence=Decimal("0.4000"),
                source_type="bank_transaction",
                source_id=str(tx.id),
            )
        )
        created = True

    if created:
        await session.commit()

    result = await session.execute(
        select(ReviewItem)
        .where(ReviewItem.user_id == user_id)
        .order_by(ReviewItem.created_at.desc())
    )
    return list(result.scalars().all())


async def ensure_inbox_items(session: AsyncSession, user_id) -> list[InboxItem]:
    created = False

    budgets = (
        await session.execute(
            select(Budget)
            .where(Budget.user_id == user_id)
            .order_by(Budget.month_start.desc())
            .limit(1)
        )
    ).scalars().all()
    if budgets:
        summary = await build_budget_summary(session, budgets[0])
        if summary["total_remaining"] < 0:
            existing = await session.execute(
                select(InboxItem).where(
                    InboxItem.user_id == user_id,
                    InboxItem.item_type == InboxItemType.budget_drift,
                    InboxItem.is_resolved.is_(False),
                )
            )
            if existing.scalar_one_or_none() is None:
                session.add(
                    InboxItem(
                        user_id=user_id,
                        item_type=InboxItemType.budget_drift,
                        severity=ItemSeverity.warning,
                        title="You are over plan this month",
                        message=f"Current month spending is ${abs(summary['total_remaining']):,.0f} above budget.",
                        action_url="/dashboard/everyday",
                    )
                )
                created = True

    goals = (
        await session.execute(
            select(Goal)
            .where(Goal.user_id == user_id, Goal.status == "active")
            .order_by(Goal.created_at.desc())
        )
    ).scalars().all()
    for goal in goals:
        if goal.target_date and goal.current_amount < goal.target_amount:
            remaining_months = max(
                1,
                (goal.target_date.year - date.today().year) * 12
                + goal.target_date.month
                - date.today().month,
            )
            implied = (goal.target_amount - goal.current_amount) / Decimal(str(remaining_months))
            if goal.monthly_contribution and goal.monthly_contribution < implied:
                existing = await session.execute(
                    select(InboxItem).where(
                        InboxItem.user_id == user_id,
                        InboxItem.item_type == InboxItemType.goal_risk,
                        InboxItem.is_resolved.is_(False),
                    )
                )
                existing_goal_items = [
                    item
                    for item in existing.scalars().all()
                    if (item.metadata_json or {}).get("goal_id") == str(goal.id)
                ]
                if not existing_goal_items:
                    session.add(
                        InboxItem(
                            user_id=user_id,
                            item_type=InboxItemType.goal_risk,
                            severity=ItemSeverity.warning,
                            title=f"Goal at risk: {goal.name}",
                            message="Your current monthly contribution is below the pace needed to hit this goal.",
                            action_url="/dashboard/everyday",
                            metadata_json={"goal_id": str(goal.id)},
                        )
                    )
                    created = True

    reviews = await ensure_review_items(session, user_id)
    open_reviews = [item for item in reviews if item.status == ReviewItemStatus.open]
    if open_reviews:
        existing = await session.execute(
            select(InboxItem).where(
                InboxItem.user_id == user_id,
                InboxItem.item_type == InboxItemType.review,
                InboxItem.is_resolved.is_(False),
            )
        )
        if existing.scalar_one_or_none() is None:
            session.add(
                InboxItem(
                    user_id=user_id,
                    item_type=InboxItemType.review,
                    severity=ItemSeverity.info,
                    title="You have items to review",
                    message=f"{len(open_reviews)} transaction or recurring items need confirmation.",
                    action_url="/dashboard/everyday",
                )
            )
            created = True

    if created:
        await session.commit()

    result = await session.execute(
        select(InboxItem)
        .where(InboxItem.user_id == user_id)
        .order_by(InboxItem.created_at.desc())
    )
    return list(result.scalars().all())


async def build_weekly_briefing(session: AsyncSession, user_id) -> dict:
    today = date.today()
    week_ago = today - timedelta(days=7)

    tx_result = await session.execute(
        select(BankTransaction)
        .join(CashAccount)
        .where(
            CashAccount.user_id == user_id,
            BankTransaction.transaction_date >= week_ago,
            BankTransaction.amount < 0,
        )
    )
    week_spend = sum((abs(tx.amount) for tx in tx_result.scalars().all()), Decimal("0.00"))

    snapshot_result = await session.execute(
        select(PortfolioSnapshot)
        .where(PortfolioSnapshot.user_id == user_id)
        .order_by(PortfolioSnapshot.snapshot_date.desc())
        .limit(2)
    )
    snapshots = snapshot_result.scalars().all()
    net_worth_change = Decimal("0.00")
    if len(snapshots) >= 2:
        net_worth_change = snapshots[0].net_worth - snapshots[1].net_worth

    goals_result = await session.execute(
        select(Goal).where(Goal.user_id == user_id, Goal.status == "active")
    )
    goals = goals_result.scalars().all()
    at_risk_goals = 0
    for goal in goals:
        if goal.target_date and goal.monthly_contribution:
            remaining_months = max(
                1,
                (goal.target_date.year - today.year) * 12 + goal.target_date.month - today.month,
            )
            needed = (goal.target_amount - goal.current_amount) / Decimal(str(remaining_months))
            if goal.monthly_contribution < needed:
                at_risk_goals += 1

    recurring = await sync_recurring_items(session, user_id)
    changed_recurring = len([item for item in recurring if item.state == RecurringState.review])

    return {
        "period_start": week_ago,
        "period_end": today,
        "spending_total": week_spend,
        "net_worth_change": net_worth_change,
        "goal_risk_count": at_risk_goals,
        "recurring_review_count": changed_recurring,
        "headline": (
            f"You spent ${week_spend:,.0f} in the last 7 days and "
            f"{'gained' if net_worth_change >= 0 else 'lost'} ${abs(net_worth_change):,.0f} in net worth."
        ),
    }
