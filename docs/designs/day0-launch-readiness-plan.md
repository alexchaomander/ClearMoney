# Day 0 Launch Readiness Plan

Generated from `/plan-eng-review` on 2026-04-01  
Branch: `main`  
Repo: `alexchaomander/ClearMoney`

## Goal

Ship the smallest complete Day 0 system for a private beta.

That system is:

- Founder-first homepage and launch funnel
- Invite-gated entry
- Tight onboarding
- One clear first-value loop on the dashboard
- Transparent trust UX around data freshness and decision traces
- Smoke-tested production path
- Basic launch ops, analytics, and support posture

This is not a platform rewrite. It is a coherence pass on top of the product that already exists.

## Product Definition

### User promise

ClearMoney helps founders understand runway, tax exposure, and financial blind spots with transparent calculations and auditable reasoning.

### Day 0 primary user

- Startup founders from seed to Series B
- Secondary audience stays discoverable through public tools, but the signed-in product flow optimizes for founders first

### Day 0 first-value loop

1. User lands on homepage
2. User understands founder-specific value in one screen
3. User tries Founder Runway or Tax Shield Audit
4. User enters beta via invite
5. User completes lightweight onboarding
6. User connects accounts or supplies minimum manual context
7. User lands on dashboard and sees one actionable founder insight
8. User can inspect the math and see data freshness

## Scope Decision

Chosen path: **Scope-reduced Day 0**

We are not trying to finish the whole product. We are making the existing product shippable, trustworthy, and legible for a small invited cohort.

## What Already Exists

### Reuse, do not rebuild

| Area | Existing code / flow | Reuse strategy |
|------|----------------------|----------------|
| Homepage | [`packages/web/src/app/page.tsx`](../../packages/web/src/app/page.tsx) | Narrow messaging and CTA order, do not replace page architecture |
| Invite gate | [`packages/web/middleware.ts`](../../packages/web/middleware.ts), [`packages/web/src/app/invite/page.tsx`](../../packages/web/src/app/invite/page.tsx) | Tighten production safety and copy, keep route structure |
| Onboarding shell | [`packages/web/src/app/onboarding/page.tsx`](../../packages/web/src/app/onboarding/page.tsx), [`packages/web/src/components/dashboard/MemoryWizard.tsx`](../../packages/web/src/components/dashboard/MemoryWizard.tsx) | Refocus steps on founder activation, avoid new onboarding subsystem |
| Connect flow | [`packages/web/src/app/connect/page.tsx`](../../packages/web/src/app/connect/page.tsx) | Keep page and data hooks, improve sequencing and fallback messaging |
| Dashboard | [`packages/web/src/app/dashboard/page.tsx`](../../packages/web/src/app/dashboard/page.tsx) | Reorder existing blocks around first-value loop |
| Data freshness | [`packages/web/src/components/dashboard/DataSourceStatusStrip.tsx`](../../packages/web/src/components/dashboard/DataSourceStatusStrip.tsx), [`packages/web/src/app/data-health/page.tsx`](../../packages/web/src/app/data-health/page.tsx) | Reuse continuity model, improve founder-facing wording |
| Explainability | [`packages/web/src/components/dashboard/DecisionTracePanel.tsx`](../../packages/web/src/components/dashboard/DecisionTracePanel.tsx), `/api/v1/agent/*` in [`packages/strata-api/app/main.py`](../../packages/strata-api/app/main.py) | Keep trace infrastructure, surface it in activation path |
| Public tools | [`packages/web/src/app/tools/founder-runway/page.tsx`](../../packages/web/src/app/tools/founder-runway/page.tsx), [`packages/web/src/app/tools/tax-shield-audit/page.tsx`](../../packages/web/src/app/tools/tax-shield-audit/page.tsx) | Use as top-of-funnel, no parallel marketing microsite |
| API app | [`packages/strata-api/app/main.py`](../../packages/strata-api/app/main.py) | Keep monolith + brokerage split as-is |

### Avoid rebuilding

- No new launch-only dashboard
- No new onboarding service
- No new analytics backend
- No new notifications system beyond launch-critical instrumentation and placeholders
- No new trust/explainability schema for Day 0 beyond surfacing what already exists

## NOT In Scope

- Full autonomous action layer rollout, too much regulatory and product blast radius
- Broad consumer-persona optimization of the signed-in app, Day 0 should stay founder-first
- Mobile app or native wrapper, unnecessary for private beta
- Full proactive alerts system across email/SMS/web push, Day 0 only needs event instrumentation and clear future hooks
- New provider classes or connector architecture, existing Plaid + brokerage split is enough
- Canonical context graph completion, too large for this launch slice
- Complete recommendation-trace parity for every product surface, Day 0 only requires parity on the founder-first activation path

## Architecture Review

### System shape

Use the existing monorepo and route map. The Day 0 plan is a flow alignment project, not a topology change.

```text
                   PUBLIC FUNNEL

  /  ─────┬─────> /tools/founder-runway
          └─────> /tools/tax-shield-audit
                        │
                        ▼
                    /invite
                        │
                        ▼
                   Clerk auth
                        │
                        ▼
                  /onboarding
                        │
                        ▼
                    /connect
              ┌─────────┴─────────┐
              │                   │
              ▼                   ▼
       linked accounts      manual context
              │                   │
              └─────────┬─────────┘
                        ▼
                  /dashboard
             ┌───────┼────────┬───────────┐
             ▼       ▼        ▼           ▼
        founder insight  data freshness  traces  next actions
```

### Day 0 architecture decisions

1. Homepage becomes founder-first for signed-up conversion, while still exposing other tools.
2. Onboarding captures only activation-critical context.
3. Connect step remains separate, but onboarding and dashboard guide users there explicitly.
4. Dashboard becomes a focused first-value screen instead of a buffet.
5. Existing continuity and trace infrastructure becomes part of the first session, not a buried advanced feature.

### Realistic production failure scenarios

| Codepath | Failure | Plan response |
|----------|---------|---------------|
| Invite gate | Production env forgets beta codes and default code remains active | Fail launch checklist, remove unsafe fallback for production |
| Onboarding wizard | Memory update succeeds partially or stalls | Add optimistic UX + error toast + retry path before redirect |
| Connect flow | Institution search/API unavailable | Keep API error state, add manual fallback CTA |
| Dashboard | No linked accounts or stale connections | Promote data strip and profile progress into first-value guidance |
| Decision trace panel | No traces yet | Copy should route user to the exact next action that generates one |
| Data health page | Health API unavailable | Keep retry state, also surface summary signal on dashboard |

### Distribution architecture

No new artifact type.

Existing distribution remains:

- Web: Vercel build
- API: Railway deploy
- Brokerage service: separate FastAPI deploy
- CI: existing test/build/deploy workflows

The plan adds no new publish pipeline. Good. Boring by default.

## Code Quality Review

### Key code-quality calls

1. Keep changes centered in existing route pages and shared components.
2. Avoid adding a new “launch mode” abstraction. The current app already has demo, consent, and continuity patterns.
3. Prefer copy, ordering, and state-transition changes over new service layers.
4. Keep onboarding state explicit, not inferred from multiple scattered flags.

### Known code-quality hotspots to address in implementation

- Onboarding currently pivots off localStorage and immediately redirects to `/dashboard?tour=true`. That is enough for a beta, but the experience needs clearer success/failure handling around the wizard save.
- Connect flow assumes onboarding completion via localStorage. Day 0 should keep that pattern for minimal diff, but centralize the helper to reduce repeated logic.
- Dashboard is feature-rich. Day 0 should reduce cognitive load by reordering, not by adding a second dashboard.
- Existing trust affordances are spread across `DecisionTracePanel`, `DataSourceStatusStrip`, `ProfileProgressCard`, and `DataHealthPage`. The implementation plan should unify their copy and ordering.

### Diagram maintenance

Inline ASCII diagrams should be added or refreshed in:

- [`packages/web/src/app/onboarding/page.tsx`](../../packages/web/src/app/onboarding/page.tsx)
- [`packages/web/src/app/connect/page.tsx`](../../packages/web/src/app/connect/page.tsx)
- [`packages/web/src/app/dashboard/page.tsx`](../../packages/web/src/app/dashboard/page.tsx)
- [`packages/web/src/components/dashboard/MemoryWizard.tsx`](../../packages/web/src/components/dashboard/MemoryWizard.tsx)
- [`packages/web/src/components/dashboard/DataSourceStatusStrip.tsx`](../../packages/web/src/components/dashboard/DataSourceStatusStrip.tsx)
- [`packages/web/src/components/dashboard/DecisionTracePanel.tsx`](../../packages/web/src/components/dashboard/DecisionTracePanel.tsx)

Recommended inline comments:

```text
ONBOARDING FLOW
invite -> auth -> onboarding wizard -> connect/manual context -> dashboard first value
```

```text
DASHBOARD DAY 0 PRIORITY
trust signal -> first founder insight -> explainability -> connect/fix next step
```

## Implementation Plan

### Phase 1. Founder-first funnel alignment

**Goal:** Make the entrypoint match the actual Day 0 product.

**Modules**

- `packages/web/src/app/page.tsx`
- `packages/web/src/app/transparency/*`
- `packages/web/src/app/methodology/page.tsx`
- optional supporting shared landing components

**Changes**

1. Rewrite hero and top CTA stack around founders.
2. Put Founder Runway and Tax Shield Audit above generic multi-persona browsing.
3. Move trust proof higher:
   - show the math
   - independence
   - data security
4. Keep broader tools lower on page as exploration, not primary pitch.
5. Add direct CTA path:
   - Try Founder Runway
   - Enter beta
   - See transparency

**Acceptance criteria**

- First screen clearly says who it is for
- Primary CTA path is founder-first
- Trust proof appears before long-scroll feature sprawl

### Phase 2. Invite and onboarding tightening

**Goal:** Turn invite + onboarding into a clean activation path.

**Modules**

- `packages/web/middleware.ts`
- `packages/web/src/app/invite/page.tsx`
- `packages/web/src/app/onboarding/page.tsx`
- `packages/web/src/components/dashboard/MemoryWizard.tsx`
- shared helpers if needed

**Changes**

1. Remove production-risky invite fallback behavior from launch checklist and gate logic.
2. Update invite copy to set expectation:
   - private beta
   - founder-first
   - what happens next
3. Refocus onboarding cards and wizard prompts on founder activation:
   - founder or not
   - income / runway-relevant context
   - risk profile only if used immediately
4. On wizard submit:
   - save
   - show success state
   - redirect intentionally to connect or dashboard based on missing data
5. Centralize onboarding-complete check to avoid drift between pages.

**Acceptance criteria**

- Invalid invite is clear
- Valid invite leads to one obvious next step
- User never wonders “why am I being asked this?”
- User can finish onboarding with minimal fields

### Phase 3. Connect and manual fallback flow

**Goal:** Let users recover if live linking fails or is skipped.

**Modules**

- `packages/web/src/app/connect/page.tsx`
- existing add-account/manual account flows inside dashboard components
- relevant SDK hooks only if necessary

**Changes**

1. Reword connect page around founder value, not generic portfolio completeness.
2. Add explicit “skip for now” / manual path if institution search or linking fails.
3. Make bank vs investment connection hierarchy clearer.
4. Show what unlocks after connect:
   - runway
   - tax estimate
   - data freshness
   - decision traces
5. Improve empty and error states:
   - no search results
   - API down
   - auth/provider redirect failure

**Acceptance criteria**

- User has a path forward even if linking fails
- Connect page makes value legible, not just mechanics
- No dead-end state after onboarding

### Phase 4. Dashboard first-value loop

**Goal:** The first signed-in dashboard session should answer “what matters now?”

**Modules**

- `packages/web/src/app/dashboard/page.tsx`
- `packages/web/src/components/dashboard/DataSourceStatusStrip.tsx`
- `packages/web/src/components/dashboard/DecisionTracePanel.tsx`
- `packages/web/src/components/dashboard/AdvisorBriefing.tsx`
- `packages/web/src/components/dashboard/TaxShieldCard.tsx`
- `packages/web/src/components/dashboard/ProfileProgressCard` inside dashboard page

**Changes**

1. Reorder top-of-dashboard experience:
   - data/trust strip
   - founder insight card
   - profile completion / connect next steps
   - decision trace
2. Tighten the copy on the data strip to speak to user consequences:
   - healthy
   - stale
   - degraded
   - revoked
3. Make trace panel empty state actionable:
   - what creates a trace
   - where to click
4. Ensure the first founder-relevant block is above lower-priority modules.
5. Keep demo/synthetic labeling obvious.

**Acceptance criteria**

- A founder can understand status in under 15 seconds
- The first visible insight is not generic portfolio chrome
- Every degraded/stale state points to a fix path

### Phase 5. Trust UX consolidation

**Goal:** Put trust affordances on the primary path instead of hiding them in secondary screens.

**Modules**

- `packages/web/src/app/dashboard/page.tsx`
- `packages/web/src/app/data-health/page.tsx`
- `packages/web/src/app/privacy/page.tsx`
- `packages/web/src/app/methodology/page.tsx`
- `packages/web/src/components/dashboard/DecisionTracePanel.tsx`
- `packages/web/src/components/dashboard/DataSourceStatusStrip.tsx`

**Changes**

1. Standardize copy for:
   - synthetic/demo
   - live
   - stale
   - degraded
   - revoked
2. Add direct path from dashboard trust indicators to:
   - data health
   - methodology
   - recommendation review queue
3. Ensure every Day 0 recommendation/trace surface exposes:
   - readiness
   - continuity
   - actionability
4. Audit privacy/support/disclosure links from launch pages.

**Acceptance criteria**

- User can inspect why a number exists
- User can inspect whether data is fresh
- User can tell what is live vs preview

### Phase 6. Launch instrumentation and support

**Goal:** Learn fast from the first cohort and keep them unstuck.

**Modules**

- Web analytics wiring points
- support/contact links in launch surfaces
- docs and runbooks

**Changes**

1. Instrument funnel milestones:
   - landing CTA click
   - invite submit
   - onboarding started
   - onboarding completed
   - connect started
   - connect completed
   - manual fallback chosen
   - first dashboard loaded
   - trace opened
   - data health viewed
2. Ensure `beta@clearmoney.com` appears on invite and support-relevant states.
3. Add launch runbook doc:
   - env checklist
   - smoke commands
   - rollback owners
4. Add known-limitations doc for beta cohort.

**Acceptance criteria**

- You can answer where activation is breaking
- Users have a human fallback
- Team has a first-hour launch checklist

## Data Flow Diagram

```text
             USER ARRIVES
                  │
                  ▼
             Landing page
                  │
      ┌───────────┴───────────┐
      ▼                       ▼
  Public tool usage       Invite CTA
      │                       │
      ▼                       ▼
  See useful math         Invite code valid?
      │                  ┌──────┴───────┐
      │                  ▼              ▼
      │               yes/auth         no/error
      │                  │              │
      ▼                  ▼              ▼
  Beta interest       Onboarding      Retry/help
                         │
                         ▼
                Context captured?
                   ┌─────┴─────┐
                   ▼           ▼
             enough for value  not enough
                   │           │
                   ▼           ▼
                Dashboard    Connect/manual path
                   │           │
                   └─────┬─────┘
                         ▼
                   First insight
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
      Trace opened   Data health   Next action
```

## State Machine

```text
UNINVITED
  │ valid invite
  ▼
INVITED
  │ auth success
  ▼
AUTHENTICATED
  │ onboarding complete
  ▼
CONTEXT_PARTIAL
  │ connect/manual context
  ▼
ACTIVATED
  │ stale or degraded data
  ▼
ACTIVATED_WITH_WARNING
  │ reconnect / update context
  ▼
ACTIVATED
```

Invalid transitions:

- `UNINVITED -> DASHBOARD`
- `AUTHENTICATED -> CONNECT` without onboarding marker
- `ACTIVATED_WITH_WARNING -> healthy insight` without new sync or fallback context

## Deployment Sequence

```text
1. Merge reduced Day 0 funnel changes
2. Run web + api + brokerage tests
3. Run launch smoke suite
4. Confirm env vars:
   - Clerk
   - API URLs
   - beta codes
   - Sentry
   - Redis if required
5. Deploy API
6. Verify /api/v1/health
7. Deploy web
8. Verify invite -> onboarding -> connect -> dashboard path
9. Invite first cohort
```

## Rollback Flow

```text
Launch issue detected
        │
        ▼
Is issue isolated to web copy/order/state?
   ┌────┴────┐
   ▼         ▼
 yes        no
   │         │
   ▼         ▼
Revert web   Is API broken?
deploy only   ┌────┴────┐
              ▼         ▼
             yes       no
              │         │
              ▼         ▼
        rollback API   pause invites / hotfix
        and re-run health
```

## Test Review

### Existing framework

- Web unit tests: Vitest
- Web E2E: Playwright
- API tests: pytest
- Brokerage service tests: pytest

### Test coverage diagram

```text
CODE PATH COVERAGE
===========================
[+] packages/web/src/app/page.tsx
    ├── Homepage render and primary CTA ordering
    │   └── [GAP] No test asserting founder-first CTA hierarchy
    └── Public-tool launch path
        └── [GAP] No test for homepage -> tool -> beta CTA flow

[+] packages/web/src/app/invite/page.tsx
    ├── Valid invite code
    │   └── [GAP] No E2E covering cookie set + redirect
    ├── Invalid invite code
    │   └── [GAP] No E2E for failure state
    └── Production-safe config
        └── [GAP] No test guarding unsafe default behavior

[+] packages/web/src/app/onboarding/page.tsx
    ├── Load onboarding
    │   └── [★ TESTED] onboarding.spec.ts exists but appears stale
    ├── Open MemoryWizard
    │   └── [GAP] No E2E
    ├── Complete wizard
    │   └── [GAP] No E2E
    ├── Save failure / retry
    │   └── [GAP] No E2E or unit test
    └── Redirect sequencing
        └── [GAP] No E2E

[+] packages/web/src/app/connect/page.tsx
    ├── Redirect when onboarding incomplete
    │   └── [GAP] No E2E
    ├── Search institutions
    │   └── [GAP] No E2E
    ├── API error state
    │   └── [GAP] No E2E
    ├── Manual fallback CTA
    │   └── [GAP] No test, feature needs explicit path
    └── Connect redirect initiation
        └── [GAP] No E2E

[+] packages/web/src/app/dashboard/page.tsx
    ├── Empty/no-links first session
    │   └── [GAP] No focused E2E
    ├── Stale/degraded/revoked continuity states
    │   └── [GAP] Needs unit + E2E assertions
    ├── Demo vs live labeling
    │   └── [★★ TESTED] demo-flow.spec.ts covers demo basics only
    ├── Decision trace empty state
    │   └── [GAP] No test
    └── First founder insight ordering
        └── [GAP] No test

USER FLOW COVERAGE
===========================
[+] Founder launch flow
    / -> /tools/founder-runway -> /invite -> /onboarding -> /connect -> /dashboard
    └── [GAP] [->E2E] No full launch-path test

[+] Tax audit launch flow
    /tools/tax-shield-audit -> waitlist/beta CTA
    └── [GAP] [->E2E] No proof that CTA path stays intact

[+] Trust inspection flow
    dashboard -> data source strip -> data health / trace panel
    └── [GAP] [->E2E] No trust-path test

[+] Failure recovery flow
    connect error -> manual fallback / support path
    └── [GAP] [->E2E] No recovery-path test

─────────────────────────────────
COVERAGE: 2/18 meaningful paths partially covered
QUALITY:  ★★★: 0  ★★: 1  ★: 1
GAPS: 16 paths need tests
CRITICAL: onboarding spec appears stale relative to UI copy
─────────────────────────────────
```

### Required test additions

1. `packages/web/tests/day0-founder-funnel.spec.ts`
   - homepage founder CTA visible above generic tool exploration
   - founder runway path works
   - invite page accepts valid code and rejects invalid code

2. `packages/web/tests/day0-onboarding-connect.spec.ts`
   - onboarding loads
   - wizard opens
   - wizard completion redirects correctly
   - connect page blocks users who skipped onboarding

3. `packages/web/tests/day0-dashboard-trust.spec.ts`
   - no-link dashboard state
   - stale/degraded/revoked labels
   - trace panel empty state and populated state
   - data-health navigation

4. Update `packages/web/tests/onboarding.spec.ts`
   - **CRITICAL regression test**
   - align it with actual onboarding UI and button labels

5. API tests
   - add or extend tests for continuity-state wording contracts if dashboard copy depends on serialized values

### Failure modes

| Codepath | Failure mode | Test? | Error handling? | User sees? | Notes |
|----------|--------------|-------|-----------------|------------|-------|
| invite submit | invalid code | planned | yes | clear error | safe |
| invite config | prod fallback code left enabled | missing | no | silent policy failure | **critical gap** |
| onboarding save | memory update fails | missing | weak | likely confusing redirect risk | **critical gap** |
| connect search | institutions API down | planned | yes | visible API error | okay after test |
| connect path | provider redirect creation fails | missing | yes toast | user-visible | add E2E |
| dashboard load | no links / no data | partial | yes | visible but not tightly tested | improve |
| continuity warning | stale connection | missing | yes | visible warning | test it |
| trace panel | no traces exist | missing | yes | visible empty state | test it |

Critical gaps are the ones that can fail silently or lead to policy drift.

## Performance Review

This reduced plan is mostly UX and sequencing, not new heavy compute.

### Main performance concerns

1. Homepage should not add more heavy motion or render work than it already has.
2. Dashboard should not fetch more than it already does for first-value ordering.
3. Trust-path work should prefer copy and component order changes over extra API calls.

### Specific calls

- Reuse existing dashboard queries. Do not add a launch-only aggregate endpoint.
- If data-health summary is surfaced on dashboard, derive from already fetched connection state where possible.
- Keep new analytics lightweight and client-side fire-and-forget.

## Execution Plan

### Sequence

#### Step 1. Lock launch narrative
- Update homepage copy and CTA order
- Update invite page copy
- Audit transparency/methodology links

#### Step 2. Tighten activation path
- Refactor onboarding into a founder-first wizard
- Clean redirect logic between invite, onboarding, connect, and dashboard
- Add explicit manual fallback path

#### Step 3. Reorder dashboard for first value
- Trust strip first
- Founder insight second
- profile/connect next step third
- trace path fourth

#### Step 4. Add trust and recovery polish
- unify continuity copy
- make empty/error states actionable
- ensure support path is always present

#### Step 5. Add launch-critical tests
- end-to-end founder funnel
- onboarding/connect flow
- dashboard trust flow
- regression tests for onboarding spec drift

#### Step 6. Launch ops
- run smoke suite
- verify env
- publish runbook
- invite first cohort

## Worktree Parallelization Strategy

### Dependency table

| Step | Modules touched | Depends on |
|------|-----------------|------------|
| Funnel alignment | `packages/web/src/app`, shared landing components | — |
| Activation path | `packages/web/src/app/onboarding`, `packages/web/src/app/connect`, dashboard wizard/shared flow helpers | Funnel alignment |
| Dashboard trust loop | `packages/web/src/app/dashboard`, dashboard shared components | Activation path |
| Test suite | `packages/web/tests`, selective API tests | Activation path, Dashboard trust loop |
| Launch docs/runbook | `docs/designs`, root docs | Funnel alignment |

### Parallel lanes

- Lane A: Funnel alignment -> launch docs
- Lane B: Activation path -> dashboard trust loop
- Lane C: Test suite after Lane B stabilizes

### Execution order

Launch Lane A and Lane B in parallel worktrees. Merge both. Then run Lane C for tests and smoke hardening.

### Conflict flags

- `packages/web/src/app` is shared between funnel and activation work. Keep homepage work in its own lane and onboarding/connect work in another to reduce conflicts.
- `packages/web/src/components/dashboard` is shared only inside the activation/dashboard lane. Keep sequential there.

## Recommended File Touch List

This is the likely minimal-diff touch set:

- `packages/web/src/app/page.tsx`
- `packages/web/src/app/invite/page.tsx`
- `packages/web/middleware.ts`
- `packages/web/src/app/onboarding/page.tsx`
- `packages/web/src/components/dashboard/MemoryWizard.tsx`
- `packages/web/src/app/connect/page.tsx`
- `packages/web/src/app/dashboard/page.tsx`
- `packages/web/src/components/dashboard/DataSourceStatusStrip.tsx`
- `packages/web/src/components/dashboard/DecisionTracePanel.tsx`
- `packages/web/tests/onboarding.spec.ts`
- `packages/web/tests/day0-founder-funnel.spec.ts`
- `packages/web/tests/day0-onboarding-connect.spec.ts`
- `packages/web/tests/day0-dashboard-trust.spec.ts`
- `docs/designs/day0-launch-readiness-plan.md`

## Launch Readiness Checklist

### Product

- Homepage is founder-first
- Invite flow is production-safe
- Onboarding is short and purposeful
- Connect path has manual recovery
- Dashboard surfaces one obvious first insight
- Trust states are visible and actionable

### Quality

- Web tests pass
- API tests pass
- Brokerage service tests pass
- Production build passes
- Day 0 smoke suite passes

### Ops

- Sentry on
- beta codes configured
- health checks verified
- support inbox monitored
- runbook published
- first cohort list ready

## Completion Summary

- Step 0: Scope Challenge — scope reduced per recommendation
- Architecture Review: 1 major issue found and resolved, founder-first funnel chosen
- Code Quality Review: 3 hotspots identified, all handled via minimal-diff plan
- Test Review: diagram produced, 16 gaps identified
- Performance Review: 0 major architectural issues, keep changes copy/order-first
- NOT in scope: written
- What already exists: written
- TODOS.md updates: none proposed, this plan should be implemented before expanding
- Failure modes: 2 critical gaps flagged
- Outside voice: skipped
- Parallelization: 3 lanes, 2 parallel / 1 sequential
- Lake Score: 1/1 recommendations chose complete option

## Unresolved Decisions That May Bite Later

- Whether private beta messaging remains founder-only or lightly includes HNW individuals on signed-in surfaces
- Whether manual fallback stays inside connect/dashboard flow or gets its own clearer route later
