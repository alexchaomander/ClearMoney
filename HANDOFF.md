# Handoff

*Last updated: March 12, 2026*

This document is for the next coding agent picking up work after PR `#143` (`feat/recommendation-review-workflows`).

## Current State

The current branch adds the first end-to-end recommendation review workflow:

- recommendation review persistence, migration, schemas, and APIs
- trace-level `review_summary` projection on `/api/v1/agent/decision-traces`
- advisor continuity hooks that:
  - inject warnings when open reviews exist
  - block duplicate recommendation titles that are already under active review
- user-facing review entry points in decision traces
- dashboard review queue at `/dashboard/recommendation-reviews`
- conversion from recommendation review -> correction workflow

This sits on top of the already-merged context-quality, correction, provenance, and decision-trace work.

## Key Files

Backend:
- [packages/strata-api/app/api/recommendation_reviews.py](/Users/alexchao/projects/ClearMoney/packages/strata-api/app/api/recommendation_reviews.py)
- [packages/strata-api/app/services/recommendation_reviews.py](/Users/alexchao/projects/ClearMoney/packages/strata-api/app/services/recommendation_reviews.py)
- [packages/strata-api/app/services/financial_advisor.py](/Users/alexchao/projects/ClearMoney/packages/strata-api/app/services/financial_advisor.py)
- [packages/strata-api/app/services/decision_trace_builder.py](/Users/alexchao/projects/ClearMoney/packages/strata-api/app/services/decision_trace_builder.py)
- [packages/strata-api/app/schemas/agent.py](/Users/alexchao/projects/ClearMoney/packages/strata-api/app/schemas/agent.py)
- [packages/strata-api/app/schemas/recommendation_review.py](/Users/alexchao/projects/ClearMoney/packages/strata-api/app/schemas/recommendation_review.py)
- [packages/strata-api/alembic/versions/b3d9f4e8c2a1_add_recommendation_reviews.py](/Users/alexchao/projects/ClearMoney/packages/strata-api/alembic/versions/b3d9f4e8c2a1_add_recommendation_reviews.py)

Frontend / SDK:
- [packages/strata-sdk/src/types.ts](/Users/alexchao/projects/ClearMoney/packages/strata-sdk/src/types.ts)
- [packages/strata-sdk/src/client.ts](/Users/alexchao/projects/ClearMoney/packages/strata-sdk/src/client.ts)
- [packages/web/src/lib/strata/hooks.ts](/Users/alexchao/projects/ClearMoney/packages/web/src/lib/strata/hooks.ts)
- [packages/web/src/components/dashboard/RecommendationReviewDialog.tsx](/Users/alexchao/projects/ClearMoney/packages/web/src/components/dashboard/RecommendationReviewDialog.tsx)
- [packages/web/src/components/dashboard/DecisionTracePanel.tsx](/Users/alexchao/projects/ClearMoney/packages/web/src/components/dashboard/DecisionTracePanel.tsx)
- [packages/web/src/app/dashboard/decision-narrative/page.tsx](/Users/alexchao/projects/ClearMoney/packages/web/src/app/dashboard/decision-narrative/page.tsx)
- [packages/web/src/app/dashboard/recommendation-reviews/page.tsx](/Users/alexchao/projects/ClearMoney/packages/web/src/app/dashboard/recommendation-reviews/page.tsx)

Planning docs:
- [IMPLEMENTATION_PLAN.md](/Users/alexchao/projects/ClearMoney/IMPLEMENTATION_PLAN.md)
- [ROADMAP.md](/Users/alexchao/projects/ClearMoney/ROADMAP.md)

## Verification Baseline

Run these exact commands before and after the next slice:

```bash
.venv/bin/python -m pytest packages/strata-api/tests -q
pnpm --filter @clearmoney/strata-sdk type-check
pnpm --filter @clearmoney/web type-check
git diff --check
```

Python environment standard:

```bash
uv venv --python 3.12
```

Use the repo-root `.venv` and install Python packages with `uv pip install ...`.

## What Is Still Missing

This PR is a strong v1, but it is not the full review/continuity system yet.

Major remaining gaps:

1. Recommendation-state convergence is incomplete.
- Reviews exist separately from recommendation state.
- Recommendations do not yet have explicit lifecycle values like `needs_review`, `superseded`, or `blocked_by_review`.

2. Continuity is still shallow.
- The advisor blocks duplicate titles under open review, but it does not yet reason over semantic overlap, supersession chains, or recommendation families.

3. Review handling is still user-surface oriented.
- The current queue is useful, but it is not a true ops console with richer filters, audit inspection, escalation, or reviewer-only controls.

4. Correction conversion is generic.
- Recommendation-specific corrections are funneled through `manual_review` / `recommendationReview`, not a richer recommendation dispute taxonomy.

5. There is no recommendation supersession model yet.
- A reviewer cannot explicitly say “this new recommendation replaces that prior one” and have that reflected through traces and continuity.

## Recommended Next Build

Build **Recommendation State and Supersession v1** next.

That means:

### 1. Add explicit recommendation lifecycle state

Extend recommendation state beyond `pending`, `accepted`, `dismissed`.

Add states like:
- `needs_review`
- `cautious`
- `blocked`
- `superseded`
- `resolved`

Do not overload review summaries to carry all lifecycle meaning.

Likely files:
- [packages/strata-api/app/models/agent_session.py](/Users/alexchao/projects/ClearMoney/packages/strata-api/app/models/agent_session.py)
- related schemas / serializers / SDK types / UI badges

### 2. Add recommendation supersession links

Introduce a way to mark:
- `superseded_recommendation_id`
- `superseded_by_recommendation_id`
- optional `supersession_reason`

This should be review-driven, not ad hoc.

Goal:
- old guidance is visibly retired
- new guidance can point back to what it replaced
- future advisor sessions stop resurfacing retired advice

### 3. Upgrade continuity from title-match to lineage-aware

Current duplicate suppression only checks normalized recommendation titles.

Replace or augment that with:
- same recommendation family / intent type
- same affected metric or policy domain
- same trace rule cluster
- optional lightweight semantic fingerprinting from deterministic metadata, not just free text

Avoid embedding a fuzzy LLM dependency into this first pass. Keep it deterministic.

### 4. Add reviewer actions for supersede / block / reopen

Extend review resolution actions to support:
- `resolve`
- `dismiss`
- `convert_to_correction`
- `mark_blocked`
- `mark_superseded`
- `reopen`

Each should have a durable audit trail.

### 5. Project recommendation lifecycle into trace payloads

`DecisionTracePayload` should eventually include recommendation lifecycle state distinct from review summary, for example:
- `recommendation_status`
- `superseded_by_trace_id`
- `superseded_at`
- `blocked_reason`

Keep `review_summary` as a review surface, not the only continuity primitive.

## Concrete Implementation Order

Recommended sequence:

1. Add recommendation status expansion + migration
2. Add supersession fields / model links
3. Add service methods for:
- supersede recommendation
- reopen review
- mark blocked
4. Extend review API payloads and resolution options
5. Update advisor continuity logic to inspect lifecycle state, not just open reviews
6. Update trace payload projection
7. Update recommendation review queue UI
8. Add regression tests

## Acceptance Criteria For The Next Agent

The next slice should be considered complete only if:

- a recommendation can be explicitly marked `superseded`
- a new recommendation can reference the recommendation it replaces
- the advisor avoids reissuing superseded guidance
- trace UIs clearly show review state vs recommendation lifecycle state
- the review queue can perform at least one full supersession flow
- backend tests and both TypeScript type checks remain green

## Things To Preserve

Do not regress these behaviors:

- action traces must not be reviewable
- converting a review to a correction must be one-time only
- open reviews must dominate `review_summary.review_status`
- recommendation traces must remain backward-compatible through fallback parsing
- use `uv` + `.venv` + Python 3.12 for Python verification

## If You Need A Smaller Slice Instead

If the full recommendation-state/supersession slice is too large for one PR, do this narrower version:

1. recommendation status expansion
2. `mark_superseded` review resolution path
3. trace payload projection of superseded state
4. minimal UI badges in:
- decision trace panel
- decision narrative page
- recommendation review queue

That smaller slice would still materially deepen continuity without trying to solve the entire ops system in one pass.
