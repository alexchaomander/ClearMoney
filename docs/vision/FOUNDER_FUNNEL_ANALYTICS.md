# Founder Funnel Analytics

## Purpose

ClearMoney now emits founder-funnel events across the landing page, invite gate, onboarding, connect flow, and first dashboard arrival. This document turns those raw events into a repeatable operating view so product decisions can be made weekly without re-reading the code.

The goal is simple:

1. See where founders drop.
2. See which traffic sources convert.
3. See whether connected-data setup is actually happening before dashboard arrival.

## Event Contract

These events are the current founder-funnel backbone in the web app:

| Step | Event | Where it fires | Key properties |
| --- | --- | --- | --- |
| Landing impression | `founder_funnel_landing_viewed` | Founder-first landing page load | `primary_persona`, `founder_tool_href` |
| Landing CTA | `founder_funnel_cta_clicked` | Founder CTA click on landing page | `cta`, `destination`, `active_persona` |
| Invite view | `founder_invite_viewed` | Invite page load | `invite_configured` |
| Invite accepted | `founder_invite_accepted` | Valid invite code submit | `destination` |
| Invite rejected | `founder_invite_rejected` | Invalid invite code submit | `reason` |
| Invite blocked | `founder_invite_submit_blocked` | Invite system not configured | `reason` |
| Onboarding view | `founder_onboarding_viewed` | Onboarding page load | `role`, `source` |
| Wizard start | `founder_onboarding_wizard_started` | Founder starts the memory wizard | `role`, `source` |
| Onboarding complete | `founder_onboarding_completed` | Founder finishes the wizard | `role`, `source` |
| Skip to connect | `founder_onboarding_skipped_to_connect` | Founder bypasses the wizard | `source` |
| Connect view | `founder_connect_viewed` | Connect page load | `source`, `onboarding_complete` |
| Connect start | `founder_connect_started` | Founder starts a link session | `institution_id`, `source` |
| Connect continue | `founder_connect_continue_clicked` | Founder continues from connect to dashboard | `source`, `connected_accounts` |
| Dashboard arrival | `founder_dashboard_arrived` | First dashboard arrival per session | `source`, `using_demo_data`, `has_accounts`, `has_founder_baseline`, `has_decision_traces`, `connection_tone` |

## Canonical Funnel

Use this exact funnel in PostHog:

1. `founder_funnel_landing_viewed`
2. `founder_funnel_cta_clicked`
3. `founder_invite_accepted`
4. `founder_onboarding_viewed`
5. `founder_onboarding_completed`
6. `founder_connect_viewed`
7. `founder_connect_started`
8. `founder_dashboard_arrived`

Why this sequence:

- It maps to the real founder acquisition path.
- It separates “interest” from “commitment.”
- It makes the biggest product bottleneck visible: founders who reach connect but never arrive on the dashboard with real data.

## Required Breakdown Views

Create these saved insights in PostHog.

### 1. Founder Funnel by Source

Break down the canonical funnel by `source`.

Use this to answer:

- Which acquisition source gets founders to dashboard arrival?
- Which source gets landing clicks but dies at invite or onboarding?

### 2. Founder Funnel by CTA

Break down `founder_funnel_cta_clicked` by `cta`.

Use this to answer:

- Which landing CTA earns clicks?
- Which CTA path produces the best downstream dashboard-arrival rate?

### 3. Connect Completion Quality

Trend `founder_dashboard_arrived` and break down by:

- `has_accounts`
- `using_demo_data`
- `connection_tone`

Use this to answer:

- Are founders arriving with real connected context or just demo/manual state?
- Are stale or degraded connections dragging activation quality down?

### 4. Onboarding Friction

Compare:

- `founder_onboarding_wizard_started`
- `founder_onboarding_completed`
- `founder_onboarding_skipped_to_connect`

Break down by `source`.

Use this to answer:

- Is the wizard helping or slowing founders down?
- Which sources prefer skipping straight to connect?

## Weekly Review Questions

Every week, answer these in writing:

1. What percent of founder landing viewers reached dashboard arrival?
2. What percent of dashboard arrivals had `has_accounts=true`?
3. Which `source` has the best landing-to-dashboard conversion?
4. Which CTA has the highest click-through but lowest downstream conversion?
5. What percent of dashboard arrivals still show `using_demo_data=true`?
6. Are founders dropping more in invite, onboarding, or connect?

If the team cannot answer those six quickly, the analytics setup is still too abstract.

## Copy-Paste HogQL

This query gives a compact founder-funnel quality snapshot by `source` over the last 14 days.

```sql
SELECT
  COALESCE(properties.source, 'unknown') AS source,
  countIf(event = 'founder_funnel_landing_viewed') AS landing_views,
  countIf(event = 'founder_funnel_cta_clicked') AS cta_clicks,
  countIf(event = 'founder_invite_accepted') AS invite_accepts,
  countIf(event = 'founder_onboarding_completed') AS onboarding_completed,
  countIf(event = 'founder_connect_started') AS connect_started,
  countIf(event = 'founder_dashboard_arrived') AS dashboard_arrivals,
  countIf(event = 'founder_dashboard_arrived' AND JSONExtractBool(properties, 'has_accounts')) AS dashboard_with_accounts,
  countIf(event = 'founder_dashboard_arrived' AND JSONExtractBool(properties, 'using_demo_data')) AS dashboard_using_demo
FROM events
WHERE
  event IN (
    'founder_funnel_landing_viewed',
    'founder_funnel_cta_clicked',
    'founder_invite_accepted',
    'founder_onboarding_completed',
    'founder_connect_started',
    'founder_dashboard_arrived'
  )
  AND timestamp >= now() - INTERVAL 14 DAY
GROUP BY source
ORDER BY dashboard_arrivals DESC, landing_views DESC
```

## Implementation Notes

- Founder source is persisted client-side via `rememberFounderFunnelSource(...)` in [`analytics.ts`](/Users/alexchao/projects/clearmoney/packages/web/src/lib/analytics.ts).
- Dashboard arrival is intentionally fired once per session after founder memory and decision-trace queries have resolved, so the quality flags are not default-false noise.
- Analytics stay consent-gated through the existing PostHog consent provider.

## What To Change Next If Data Looks Bad

- High landing clicks, low invite acceptance: simplify beta framing and code-entry UX.
- High onboarding views, low onboarding completion: shorten the wizard or make skip paths more explicit.
- High connect views, low connect starts: reduce trust friction on the connect page.
- High dashboard arrivals, low `has_accounts`: the flow is activating curiosity, not real product value yet.
