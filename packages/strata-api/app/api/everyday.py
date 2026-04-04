import uuid
from datetime import date
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import require_scopes
from app.db.session import get_async_session
from app.models.everyday import (
    Budget,
    BudgetCategory,
    Goal,
    InboxItem,
    RecurringItem,
    ReviewItem,
    TransactionRule,
)
from app.models.user import User
from app.schemas.everyday import (
    BudgetCreate,
    BudgetResponse,
    BudgetSummaryResponse,
    BudgetUpdate,
    ConsumerHomeResponse,
    GoalCreate,
    GoalProgressResponse,
    GoalResponse,
    GoalUpdate,
    InboxItemResponse,
    InboxItemUpdate,
    RecurringItemResponse,
    RecurringItemUpdate,
    ReviewItemResponse,
    ReviewItemUpdate,
    TransactionRuleCreate,
    TransactionRuleResponse,
    TransactionRuleUpdate,
    WeeklyBriefingResponse,
)
from app.services.everyday import (
    build_budget_summary,
    build_weekly_briefing,
    ensure_inbox_items,
    ensure_review_items,
    sync_recurring_items,
)

router = APIRouter(tags=["everyday"])


def _month_start_or_default(raw: date | None) -> date:
    today = raw or date.today()
    return date(today.year, today.month, 1)


def _goal_progress(goal: Goal) -> GoalProgressResponse:
    progress = float((goal.current_amount / goal.target_amount) * 100) if goal.target_amount > 0 else 0.0
    required = None
    if goal.target_date and goal.current_amount < goal.target_amount:
        remaining_months = max(
            1,
            (goal.target_date.year - date.today().year) * 12
            + goal.target_date.month
            - date.today().month,
        )
        required = ((goal.target_amount - goal.current_amount) / Decimal(str(remaining_months))).quantize(
            Decimal("0.01")
        )
    return GoalProgressResponse(
        id=str(goal.id),
        name=goal.name,
        goal_type=goal.goal_type.value,
        target_amount=goal.target_amount,
        current_amount=goal.current_amount,
        progress_percent=round(progress, 1),
        monthly_contribution=goal.monthly_contribution,
        target_date=goal.target_date,
        required_monthly_contribution=required,
        status=goal.status.value,
    )


@router.get("/budgets", response_model=list[BudgetResponse])
async def list_budgets(
    user: User = Depends(require_scopes(["accounts:read"])),
    session: AsyncSession = Depends(get_async_session),
) -> list[BudgetResponse]:
    result = await session.execute(
        select(Budget)
        .options(selectinload(Budget.categories))
        .where(Budget.user_id == user.id)
        .order_by(Budget.month_start.desc())
    )
    return [BudgetResponse.model_validate(item) for item in result.scalars().all()]


@router.post("/budgets", response_model=BudgetResponse, status_code=201)
async def create_budget(
    data: BudgetCreate,
    user: User = Depends(require_scopes(["accounts:write"])),
    session: AsyncSession = Depends(get_async_session),
) -> BudgetResponse:
    budget = Budget(user_id=user.id, name=data.name, month_start=data.month_start, notes=data.notes)
    budget.categories = [
        BudgetCategory(
            name=category.name,
            planned_amount=category.planned_amount,
            category_type=category.category_type,
            rollover_enabled=category.rollover_enabled,
            rollover_amount=category.rollover_amount,
        )
        for category in data.categories
    ]
    session.add(budget)
    await session.commit()
    budget = (
        await session.execute(
            select(Budget).options(selectinload(Budget.categories)).where(Budget.id == budget.id)
        )
    ).scalar_one()
    return BudgetResponse.model_validate(budget)


@router.patch("/budgets/{budget_id}", response_model=BudgetResponse)
async def update_budget(
    budget_id: uuid.UUID,
    data: BudgetUpdate,
    user: User = Depends(require_scopes(["accounts:write"])),
    session: AsyncSession = Depends(get_async_session),
) -> BudgetResponse:
    budget = (
        await session.execute(
            select(Budget)
            .options(selectinload(Budget.categories))
            .where(Budget.id == budget_id, Budget.user_id == user.id)
        )
    ).scalar_one_or_none()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")

    if data.name is not None:
        budget.name = data.name
    if data.notes is not None:
        budget.notes = data.notes
    if data.categories is not None:
        budget.categories.clear()
        budget.categories.extend(
            BudgetCategory(
                name=category.name,
                planned_amount=category.planned_amount,
                category_type=category.category_type,
                rollover_enabled=category.rollover_enabled,
                rollover_amount=category.rollover_amount,
            )
            for category in data.categories
        )
    await session.commit()
    budget = (
        await session.execute(
            select(Budget).options(selectinload(Budget.categories)).where(Budget.id == budget.id)
        )
    ).scalar_one()
    return BudgetResponse.model_validate(budget)


@router.delete("/budgets/{budget_id}")
async def delete_budget(
    budget_id: uuid.UUID,
    user: User = Depends(require_scopes(["accounts:write"])),
    session: AsyncSession = Depends(get_async_session),
) -> dict:
    budget = (
        await session.execute(
            select(Budget)
            .options(selectinload(Budget.categories))
            .where(Budget.id == budget_id, Budget.user_id == user.id)
        )
    ).scalar_one_or_none()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    await session.delete(budget)
    await session.commit()
    return {"status": "deleted"}


@router.get("/budgets/{budget_id}/summary", response_model=BudgetSummaryResponse)
async def get_budget_summary(
    budget_id: uuid.UUID,
    user: User = Depends(require_scopes(["accounts:read"])),
    session: AsyncSession = Depends(get_async_session),
) -> BudgetSummaryResponse:
    budget = (
        await session.execute(
            select(Budget)
            .options(selectinload(Budget.categories))
            .where(Budget.id == budget_id, Budget.user_id == user.id)
        )
    ).scalar_one_or_none()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    return BudgetSummaryResponse.model_validate(await build_budget_summary(session, budget))


@router.get("/goals", response_model=list[GoalResponse])
async def list_goals(
    user: User = Depends(require_scopes(["accounts:read"])),
    session: AsyncSession = Depends(get_async_session),
) -> list[GoalResponse]:
    result = await session.execute(
        select(Goal).where(Goal.user_id == user.id).order_by(Goal.created_at.desc())
    )
    return [GoalResponse.model_validate(item) for item in result.scalars().all()]


@router.post("/goals", response_model=GoalResponse, status_code=201)
async def create_goal(
    data: GoalCreate,
    user: User = Depends(require_scopes(["accounts:write"])),
    session: AsyncSession = Depends(get_async_session),
) -> GoalResponse:
    goal = Goal(user_id=user.id, **data.model_dump())
    session.add(goal)
    await session.commit()
    await session.refresh(goal)
    return GoalResponse.model_validate(goal)


@router.patch("/goals/{goal_id}", response_model=GoalResponse)
async def update_goal(
    goal_id: uuid.UUID,
    data: GoalUpdate,
    user: User = Depends(require_scopes(["accounts:write"])),
    session: AsyncSession = Depends(get_async_session),
) -> GoalResponse:
    goal = (
        await session.execute(select(Goal).where(Goal.id == goal_id, Goal.user_id == user.id))
    ).scalar_one_or_none()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(goal, field, value)
    await session.commit()
    await session.refresh(goal)
    return GoalResponse.model_validate(goal)


@router.delete("/goals/{goal_id}")
async def delete_goal(
    goal_id: uuid.UUID,
    user: User = Depends(require_scopes(["accounts:write"])),
    session: AsyncSession = Depends(get_async_session),
) -> dict:
    goal = (
        await session.execute(select(Goal).where(Goal.id == goal_id, Goal.user_id == user.id))
    ).scalar_one_or_none()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    await session.delete(goal)
    await session.commit()
    return {"status": "deleted"}


@router.get("/recurring-items", response_model=list[RecurringItemResponse])
async def list_recurring_items(
    user: User = Depends(require_scopes(["accounts:read"])),
    session: AsyncSession = Depends(get_async_session),
) -> list[RecurringItemResponse]:
    items = await sync_recurring_items(session, user.id)
    return [RecurringItemResponse.model_validate(item) for item in items]


@router.patch("/recurring-items/{item_id}", response_model=RecurringItemResponse)
async def update_recurring_item(
    item_id: uuid.UUID,
    data: RecurringItemUpdate,
    user: User = Depends(require_scopes(["accounts:write"])),
    session: AsyncSession = Depends(get_async_session),
) -> RecurringItemResponse:
    item = (
        await session.execute(
            select(RecurringItem).where(RecurringItem.id == item_id, RecurringItem.user_id == user.id)
        )
    ).scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Recurring item not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    await session.commit()
    await session.refresh(item)
    return RecurringItemResponse.model_validate(item)


@router.get("/transaction-rules", response_model=list[TransactionRuleResponse])
async def list_transaction_rules(
    user: User = Depends(require_scopes(["accounts:read"])),
    session: AsyncSession = Depends(get_async_session),
) -> list[TransactionRuleResponse]:
    result = await session.execute(
        select(TransactionRule).where(TransactionRule.user_id == user.id).order_by(TransactionRule.created_at.desc())
    )
    return [TransactionRuleResponse.model_validate(item) for item in result.scalars().all()]


@router.post("/transaction-rules", response_model=TransactionRuleResponse, status_code=201)
async def create_transaction_rule(
    data: TransactionRuleCreate,
    user: User = Depends(require_scopes(["accounts:write"])),
    session: AsyncSession = Depends(get_async_session),
) -> TransactionRuleResponse:
    rule = TransactionRule(user_id=user.id, **data.model_dump())
    session.add(rule)
    await session.commit()
    await session.refresh(rule)
    return TransactionRuleResponse.model_validate(rule)


@router.patch("/transaction-rules/{rule_id}", response_model=TransactionRuleResponse)
async def update_transaction_rule(
    rule_id: uuid.UUID,
    data: TransactionRuleUpdate,
    user: User = Depends(require_scopes(["accounts:write"])),
    session: AsyncSession = Depends(get_async_session),
) -> TransactionRuleResponse:
    rule = (
        await session.execute(
            select(TransactionRule).where(TransactionRule.id == rule_id, TransactionRule.user_id == user.id)
        )
    ).scalar_one_or_none()
    if not rule:
        raise HTTPException(status_code=404, detail="Transaction rule not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(rule, field, value)
    await session.commit()
    await session.refresh(rule)
    return TransactionRuleResponse.model_validate(rule)


@router.delete("/transaction-rules/{rule_id}")
async def delete_transaction_rule(
    rule_id: uuid.UUID,
    user: User = Depends(require_scopes(["accounts:write"])),
    session: AsyncSession = Depends(get_async_session),
) -> dict:
    rule = (
        await session.execute(
            select(TransactionRule).where(TransactionRule.id == rule_id, TransactionRule.user_id == user.id)
        )
    ).scalar_one_or_none()
    if not rule:
        raise HTTPException(status_code=404, detail="Transaction rule not found")
    await session.delete(rule)
    await session.commit()
    return {"status": "deleted"}


@router.get("/inbox", response_model=list[InboxItemResponse])
async def list_inbox_items(
    user: User = Depends(require_scopes(["notifications:read"])),
    session: AsyncSession = Depends(get_async_session),
) -> list[InboxItemResponse]:
    items = await ensure_inbox_items(session, user.id)
    return [InboxItemResponse.model_validate(item) for item in items]


@router.patch("/inbox/{item_id}", response_model=InboxItemResponse)
async def update_inbox_item(
    item_id: uuid.UUID,
    data: InboxItemUpdate,
    user: User = Depends(require_scopes(["notifications:write"])),
    session: AsyncSession = Depends(get_async_session),
) -> InboxItemResponse:
    item = (
        await session.execute(select(InboxItem).where(InboxItem.id == item_id, InboxItem.user_id == user.id))
    ).scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Inbox item not found")
    if data.is_resolved is not None:
        item.is_resolved = data.is_resolved
    await session.commit()
    await session.refresh(item)
    return InboxItemResponse.model_validate(item)


@router.get("/review-items", response_model=list[ReviewItemResponse])
async def list_review_items(
    user: User = Depends(require_scopes(["accounts:read"])),
    session: AsyncSession = Depends(get_async_session),
) -> list[ReviewItemResponse]:
    items = await ensure_review_items(session, user.id)
    return [ReviewItemResponse.model_validate(item) for item in items]


@router.patch("/review-items/{item_id}", response_model=ReviewItemResponse)
async def update_review_item(
    item_id: uuid.UUID,
    data: ReviewItemUpdate,
    user: User = Depends(require_scopes(["accounts:write"])),
    session: AsyncSession = Depends(get_async_session),
) -> ReviewItemResponse:
    item = (
        await session.execute(select(ReviewItem).where(ReviewItem.id == item_id, ReviewItem.user_id == user.id))
    ).scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Review item not found")
    item.status = data.status
    await session.commit()
    await session.refresh(item)
    return ReviewItemResponse.model_validate(item)


@router.get("/weekly-briefing", response_model=WeeklyBriefingResponse)
async def get_weekly_briefing(
    user: User = Depends(require_scopes(["accounts:read"])),
    session: AsyncSession = Depends(get_async_session),
) -> WeeklyBriefingResponse:
    return WeeklyBriefingResponse.model_validate(await build_weekly_briefing(session, user.id))


@router.get("/consumer-home", response_model=ConsumerHomeResponse)
async def get_consumer_home(
    month_start: date | None = Query(None),
    user: User = Depends(require_scopes(["accounts:read", "notifications:read"])),
    session: AsyncSession = Depends(get_async_session),
) -> ConsumerHomeResponse:
    target_month = _month_start_or_default(month_start)
    budget = (
        await session.execute(
            select(Budget)
            .options(selectinload(Budget.categories))
            .where(Budget.user_id == user.id, Budget.month_start == target_month)
        )
    ).scalar_one_or_none()
    if budget is None:
        budget = (
            await session.execute(
                select(Budget)
                .options(selectinload(Budget.categories))
                .where(Budget.user_id == user.id)
                .order_by(Budget.month_start.desc())
                .limit(1)
            )
        ).scalar_one_or_none()

    budget_summary = None
    if budget is not None:
        budget_summary = BudgetSummaryResponse.model_validate(await build_budget_summary(session, budget))

    goals = (
        await session.execute(select(Goal).where(Goal.user_id == user.id).order_by(Goal.created_at.desc()))
    ).scalars().all()
    recurring_items = await sync_recurring_items(session, user.id)
    inbox_items = await ensure_inbox_items(session, user.id)
    review_items = await ensure_review_items(session, user.id)
    briefing = await build_weekly_briefing(session, user.id)

    return ConsumerHomeResponse(
        budget_summary=budget_summary,
        goals=[_goal_progress(goal) for goal in goals],
        recurring_items=[RecurringItemResponse.model_validate(item) for item in recurring_items],
        inbox_items=[InboxItemResponse.model_validate(item) for item in inbox_items[:6]],
        review_items=[ReviewItemResponse.model_validate(item) for item in review_items[:6]],
        weekly_briefing=WeeklyBriefingResponse.model_validate(briefing),
    )
