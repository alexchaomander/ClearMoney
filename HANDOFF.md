# Handoff

*Last updated: April 3, 2026*

This document is for the next coding agent picking up work after the Everyday Money foundation PR.

## Current State

This branch implements the first concrete slice of the ClearMoney personal-finance expansion: a new `Everyday` product layer that sits alongside the existing founder, portfolio, and transparency surfaces.

What shipped in this slice:

- first-class backend models for:
  - budgets
  - budget categories
  - goals
  - recurring items
  - transaction rules
  - inbox items
  - review items
- a new `/api/v1` everyday router with:
  - budgets CRUD
  - budget summary
  - goals CRUD
  - recurring item list/update
  - transaction rules CRUD
  - inbox list/update
  - review queue list/update
  - weekly briefing
  - consumer home
- transaction-level correction support for:
  - user category override
  - merchant rename override
  - exclude from budget
  - exclude from goals
  - transaction kind override
- spending-summary logic updated so user corrections and rules affect downstream consumer views
- SDK and web hooks for the new surfaces
- a new consumer dashboard at `/dashboard/everyday`
- focused API tests for the new everyday behavior

This is the product/data foundation for the broader 12-month plan. It is not the full plan.

## Key Files

Backend:
- [packages/strata-api/app/models/everyday.py](/Users/alexchao/projects/clearmoney/packages/strata-api/app/models/everyday.py)
- [packages/strata-api/app/services/everyday.py](/Users/alexchao/projects/clearmoney/packages/strata-api/app/services/everyday.py)
- [packages/strata-api/app/api/everyday.py](/Users/alexchao/projects/clearmoney/packages/strata-api/app/api/everyday.py)
- [packages/strata-api/app/models/bank_transaction.py](/Users/alexchao/projects/clearmoney/packages/strata-api/app/models/bank_transaction.py)
- [packages/strata-api/app/api/banking.py](/Users/alexchao/projects/clearmoney/packages/strata-api/app/api/banking.py)
- [packages/strata-api/app/schemas/everyday.py](/Users/alexchao/projects/clearmoney/packages/strata-api/app/schemas/everyday.py)
- [packages/strata-api/app/schemas/banking.py](/Users/alexchao/projects/clearmoney/packages/strata-api/app/schemas/banking.py)
- [packages/strata-api/app/models/user.py](/Users/alexchao/projects/clearmoney/packages/strata-api/app/models/user.py)
- [packages/strata-api/app/main.py](/Users/alexchao/projects/clearmoney/packages/strata-api/app/main.py)
- [packages/strata-api/alembic/versions/5a0f0c0a8b6b_everyday_money_foundation.py](/Users/alexchao/projects/clearmoney/packages/strata-api/alembic/versions/5a0f0c0a8b6b_everyday_money_foundation.py)
- [packages/strata-api/tests/test_api_everyday.py](/Users/alexchao/projects/clearmoney/packages/strata-api/tests/test_api_everyday.py)

Frontend / SDK:
- [packages/strata-sdk/src/types.ts](/Users/alexchao/projects/clearmoney/packages/strata-sdk/src/types.ts)
- [packages/strata-sdk/src/client.ts](/Users/alexchao/projects/clearmoney/packages/strata-sdk/src/client.ts)
- [packages/web/src/lib/strata/hooks.ts](/Users/alexchao/projects/clearmoney/packages/web/src/lib/strata/hooks.ts)
- [packages/web/src/lib/strata/demo-client.ts](/Users/alexchao/projects/clearmoney/packages/web/src/lib/strata/demo-client.ts)
- [packages/web/src/app/dashboard/everyday/page.tsx](/Users/alexchao/projects/clearmoney/packages/web/src/app/dashboard/everyday/page.tsx)
- [packages/web/src/components/layout/DashboardHeader.tsx](/Users/alexchao/projects/clearmoney/packages/web/src/components/layout/DashboardHeader.tsx)

Planning / product context:
- [README.md](/Users/alexchao/projects/clearmoney/README.md)
- [packages/strata-api/README.md](/Users/alexchao/projects/clearmoney/packages/strata-api/README.md)
- [ROADMAP.md](/Users/alexchao/projects/clearmoney/ROADMAP.md)
- [IMPLEMENTATION_PLAN.md](/Users/alexchao/projects/clearmoney/IMPLEMENTATION_PLAN.md)

## Verification Baseline

Run these exact commands before and after the next slice:

```bash
cd /Users/alexchao/projects/clearmoney/packages/strata-api
../../.venv/bin/python -m pytest tests/test_api_everyday.py tests/test_api_banking_reimbursements.py

cd /Users/alexchao/projects/clearmoney
pnpm --dir packages/web type-check
git diff --check
```

Python environment standard:

```bash
cd /Users/alexchao/projects/clearmoney
uv venv --python 3.12
uv pip install --python .venv/bin/python -e "packages/strata-api[dev]"
```

Use the repo-root `.venv` for `packages/strata-api`.

## Data Model Notes

New everyday entities are user-scoped and independent from founder/entity workflows:

- `Budget` and `BudgetCategory` model monthly planning
- `Goal` models target amount, progress, cadence, and status
- `RecurringItem` upgrades subscription detection into a durable object
- `TransactionRule` captures deterministic transaction transformations
- `InboxItem` is the user-facing action feed
- `ReviewItem` is the low-confidence or needs-attention queue

Bank transactions now also carry user-editable consumer metadata:

- `user_primary_category`
- `user_merchant_name`
- `excluded_from_budget`
- `excluded_from_goals`
- `transaction_kind`

Those fields matter because they are now consumed by:

- `/api/v1/banking/transactions`
- `/api/v1/banking/spending-summary`
- `/api/v1/budgets/{id}/summary`
- `/api/v1/consumer-home`

## Product Surface Added

The new dashboard route is:

- `/dashboard/everyday`

It currently provides:

- a weekly briefing headline
- monthly budget summary / safe-to-spend
- simple starter budget creation
- goal creation and progress display
- recurring item review/confirm controls
- inbox resolve controls
- review queue resolve controls
- simple transaction-rule creation

This is intentionally a v1 shell. It proves the full stack contract, but it is not yet polished enough to be the final consumer home.

## What Is Still Missing

This PR builds the foundation, but major gaps remain before ClearMoney is the default personal-finance destination.

Highest-priority missing pieces:

1. Budget workflow depth is still limited.
- No period switching UI
- No budget editing surface beyond create
- No category management UX
- No rollover carry-forward workflow across months

2. Goal workflow is still shallow.
- No edit/delete UI
- No account linking UI
- No contribution history
- No household/shared-goal support

3. Recurring logic is still heuristic-heavy.
- No stronger forecasting model
- No duplicate / increased / missed billing UX
- No notification delivery for recurring changes

4. Inbox and review are only v1.
- No richer action taxonomy
- No prioritization beyond severity
- No notifications integration
- No audit timeline / provenance UI

5. Public-tool continuity is not implemented yet.
- Tool results cannot yet be saved into budgets, goals, or action plans

6. Product-mode separation is still incomplete.
- The new everyday dashboard exists, but onboarding and app-level mode architecture are not yet built

7. Household planning is not wired.
- Current models are user-scoped, not shared-household scoped

## Recommended Next Build

Build **Everyday Workflow Completion v1** next.

That means turning the new primitives into a usable loop instead of adding a large new category.

### 1. Complete the budget management flow

Add:

- budget update UI
- category add/remove/edit
- month switching
- budget-history list
- rollover-forward behavior between months

### 2. Complete the goal management flow

Add:

- goal edit/delete UI
- linked account selection
- contribution schedule display
- projection messaging based on target date

### 3. Upgrade recurring items into a true bill surface

Add:

- due soon / overdue states
- changed amount detection
- dismiss vs archive semantics
- recurring item provenance in the UI

### 4. Make inbox and review the retention loop

Add:

- richer inbox generation rules
- unusual spend alerts
- goal risk alerts
- data freshness alerts
- better review resolution copy and source links

### 5. Add save-to-workspace primitives for public tools

Start with one calculator flow and prove:

- save result
- connect account
- continue inside the everyday workspace

## Concrete Implementation Order

Recommended sequence:

1. Budget edit/history endpoints and UI
2. Goal edit/delete and linked-account support
3. Recurring status expansion and better inbox generation
4. Consumer-home UI polish and mobile responsiveness pass
5. Public-tool save-to-workspace v1
6. Notification delivery integration
7. Additional regression tests

## Acceptance Criteria For The Next Agent

The next slice should be considered complete only if:

- a user can create and edit a budget from the UI
- a user can create and edit a goal from the UI
- recurring items support a clearer state model than `review` vs `active`
- the inbox has at least one new generated alert type beyond the current minimal set
- the everyday dashboard remains distinct from founder/advanced surfaces
- backend focused tests and web type-check remain green

## Things To Preserve

Do not regress these behaviors:

- transaction rules and user transaction overrides must affect downstream budget/spending views
- transfer-like transactions must stay excluded from budget actuals
- the everyday models must remain user-scoped until household scope is designed intentionally
- `packages/strata-api` must continue using the repo-root `.venv`
- keep the consumer layer additive; do not collapse founder-specific workflows into generic consumer abstractions

## Migration Notes

Before running the app against a fresh or shared database, apply:

```bash
cd /Users/alexchao/projects/clearmoney/packages/strata-api
../../.venv/bin/python -m alembic upgrade head
```

The everyday-money migration adds:

- new tables for budgets, goals, recurring items, transaction rules, inbox items, and review items
- new user-override columns on `bank_transactions`

## If You Need A Smaller Slice Instead

If the full workflow-completion slice is too large for one PR, do this narrower version:

1. budget edit/history support
2. goal edit/delete support
3. recurring item status expansion
4. mobile polish for `/dashboard/everyday`

That smaller slice would still make the new consumer foundation materially more usable without overreaching into the later phases of the plan.
