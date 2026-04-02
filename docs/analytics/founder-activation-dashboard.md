# Founder Activation Dashboard

## Purpose

This is the implementation companion to [`FOUNDER_FUNNEL_ANALYTICS.md`](../vision/FOUNDER_FUNNEL_ANALYTICS.md).

The vision doc defines what the funnel means. This doc defines exactly what to build in PostHog and what the team reviews every week.

## Build These Saved Insights

### 1. Founder Top-Line Funnel

Type: Funnel

Steps:
1. `founder_funnel_landing_viewed`
2. `founder_funnel_cta_clicked`
3. `founder_invite_accepted`
4. `founder_onboarding_viewed`
5. `founder_onboarding_completed`
6. `founder_connect_viewed`
7. `founder_connect_started`
8. `founder_dashboard_arrived`

Settings:
- Conversion window: 14 days
- Visualization: steps + conversion %
- Breakdown: none

Use this as the headline activation number.

### 2. Founder Activation by Source

Type: Funnel

Steps:
1. `founder_funnel_cta_clicked`
2. `founder_invite_accepted`
3. `founder_onboarding_completed`
4. `founder_connect_started`
5. `founder_dashboard_arrived`

Settings:
- Conversion window: 14 days
- Breakdown property: `source`

This is the operational funnel. It compares acquisition paths without polluting the analysis with anonymous landing impressions.

### 3. Founder CTA Quality

Type: Trends

Series:
- Event: `founder_funnel_cta_clicked`

Settings:
- Breakdown property: `cta`
- Interval: day
- Date range: last 14 days

Pair this with insight #2 to find CTAs that earn clicks but do not produce real activation.

### 4. Connect Method Starts

Type: Trends

Series:
- Event: `founder_connect_started`

Settings:
- Breakdown property: `connection_method`
- Filter property: `source` is set

This distinguishes `bank_plaid` from `brokerage_oauth`.

### 5. Connect Success vs Failure

Type: Trends

Series:
- Event: `founder_connect_succeeded`
- Event: `founder_connect_failed`
- Event: `founder_connect_exited`

Settings:
- Breakdown property: `connection_method`
- Interval: day

Use this to see whether friction is a trust problem, a provider problem, or a callback problem.

### 6. Dashboard Arrival Quality

Type: Trends

Series:
- Event: `founder_dashboard_arrived`

Settings:
- Breakdown properties:
  - `has_accounts`
  - `using_demo_data`
  - `connection_tone`
- Interval: day

This is the quality gate. If dashboard arrivals are mostly demo/manual or degraded, activation is shallow.

### 7. Manual Fallback Rate

Type: Trends

Series:
- Event: `founder_connect_continue_clicked`

Settings:
- Breakdown property: `path`
- Interval: day

Watch for `manual_fallback` and `callback_error_manual_fallback`. If those climb, the connect surface is not earning enough trust or reliability.

## Suggested Dashboard Layout

Top row:
- Founder Top-Line Funnel
- Founder Activation by Source

Second row:
- Founder CTA Quality
- Connect Method Starts

Third row:
- Connect Success vs Failure
- Dashboard Arrival Quality

Bottom row:
- Manual Fallback Rate
- HogQL table from the vision doc

## Weekly Review Cadence

Run this every Monday.

Owner:
- Product lead owns interpretation
- Engineering lead owns instrumentation gaps
- Growth or founder lead owns CTA/source changes

Meeting output:
- One paragraph on the biggest founder drop this week
- One decision on acquisition copy or CTA changes
- One decision on connect/onboarding friction changes
- One instrumentation fix if any question could not be answered cleanly

## Decision Rules

- If CTA clicks are up but invite acceptance is weak, change beta framing or invite UX before changing onboarding.
- If onboarding completion is weak, shorten the wizard or make the skip path more explicit.
- If connect starts are weak, improve trust proof and fallback messaging on `/connect`.
- If connect success is weak, debug provider or callback reliability before changing copy.
- If dashboard arrivals happen without accounts, improve the first-value loop so linking feels necessary rather than optional.

## Current Event Additions

The codebase now emits extra connect diagnostics in addition to the canonical funnel:

- `founder_connect_succeeded`
- `founder_connect_failed`
- `founder_connect_exited`
- `founder_invite_code_started`

These are not top-line funnel steps. They exist to explain where activation quality is leaking.
