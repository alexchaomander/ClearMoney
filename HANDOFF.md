# Handoff

*Last updated: March 25, 2026*

This document is for the next coding agent picking up work after PR `#151` (`feat/recommendation-supersession-v1`).

## Current State

The platform now supports a complete recommendation lifecycle and lineage system:

- **Recommendation States**: Explicit tracking of `pending`, `accepted`, `dismissed`, `needs_review`, `cautious`, `blocked`, `superseded`, and `resolved`.
- **Bidirectional Supersession**: `RecommendationReviewService` handles linking old guidance to its replacement, ensuring lineage is preserved.
- **Lineage-Aware Continuity**:
    - `FinancialAdvisor` blocks duplicate recommendations based on exact title match.
    - Semantic overlap protection blocks redundant guidance within the same skill/domain or affected metric.
    - Checks both open reviews and existing `pending` recommendations to avoid advisor spam.
- **Dynamic Trace Projection**: Decision traces dynamically project the latest recommendation status and provide direct links to replacement traces.
- **Review Console Upgrades**: New 'Supersede' tool in the UI allowing manual entry of replacement recommendation IDs.
- **Unified Testing**: `test_recommendation_lifecycle.py` provides high-fidelity coverage of the full dispute-to-supersession lifecycle across both Service and API layers.

This sits on top of the already-merged context-quality, correction, provenance, and decision-trace work.

## Key Files

Backend:
- [packages/strata-api/app/api/agent.py](/Users/alexchao/projects/ClearMoney/packages/strata-api/app/api/agent.py) (serialization & dynamic projection)
- [packages/strata-api/app/services/recommendation_reviews.py](/Users/alexchao/projects/ClearMoney/packages/strata-api/app/services/recommendation_reviews.py) (lineage & resolution logic)
- [packages/strata-api/app/services/financial_advisor.py](/Users/alexchao/projects/ClearMoney/packages/strata-api/app/services/financial_advisor.py) (continuity guards)
- [packages/strata-api/tests/test_recommendation_lifecycle.py](/Users/alexchao/projects/ClearMoney/packages/strata-api/tests/test_recommendation_lifecycle.py) (unified lifecycle tests)

Frontend / SDK:
- [packages/web/src/app/dashboard/decision-narrative/page.tsx](/Users/alexchao/projects/ClearMoney/packages/web/src/app/dashboard/decision-narrative/page.tsx) (lineage visualization)
- [packages/web/src/app/dashboard/recommendation-reviews/page.tsx](/Users/alexchao/projects/ClearMoney/packages/web/src/app/dashboard/recommendation-reviews/page.tsx) (supersession console)

Planning docs:
- [IMPLEMENTATION_PLAN.md](/Users/alexchao/projects/ClearMoney/IMPLEMENTATION_PLAN.md)
- [ROADMAP.md](/Users/alexchao/projects/ClearMoney/ROADMAP.md)

## Verification Baseline

Run these exact commands before and after the next slice:

```bash
.venv/bin/python -m pytest packages/strata-api/tests/test_recommendation_lifecycle.py -q
pnpm --filter @clearmoney/strata-sdk type-check
pnpm --filter @clearmoney/web type-check
git diff --check
```

## What Is Still Missing

1. **Automated Supersession Suggestions**
- Currently, users must manually paste a recommendation ID to supersede.
- The advisor should suggest "this looks like a replacement for Trace [ID]" when a high semantic overlap is detected.

2. **Supersession Chain Visualization**
- The UI shows 1-to-1 links, but doesn't yet render a "History of this advice" tree for complex evolutions.

3. **Domain-Specific Blockers**
- A 'blocked' recommendation currently triggers a generic warning. We could implement domain-specific blocks (e.g., "Don't suggest retirement changes until I finish my house purchase").

## Recommended Next Build

Build **Automated Advisor Continuity v2** next.

That means:

### 1. Implement 'Replace Guidance' Prompting
When the advisor identifies a semantic overlap that *would* have blocked a recommendation, offer a "Replace existing guidance" option instead of a hard block.

### 2. Implement /settings and /profile
The `/settings` and `/profile` pages are currently placeholders. The billing management interface linked from the dashboard needs implementation.

### 3. Expand Context OS
Tie the 'blocked' status of recommendations directly into the "Canonical Context Graph" to prevent future session "drift".
