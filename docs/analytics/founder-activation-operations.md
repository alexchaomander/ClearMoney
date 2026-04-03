# Founder Activation Operations Runbook

## Purpose

This runbook turns the founder activation instrumentation into a weekly operating loop the team can actually use.

Use it together with:

- [`founder-activation-dashboard.md`](./founder-activation-dashboard.md)
- [`FOUNDER_FUNNEL_ANALYTICS.md`](../vision/FOUNDER_FUNNEL_ANALYTICS.md)

## Launch Checklist

Complete this once per PostHog project or environment.

1. Create a PostHog dashboard called `Founder Activation`.
2. Build the seven core saved insights from [`founder-activation-dashboard.md`](./founder-activation-dashboard.md).
3. Add the extra setup-reliability trend for `founder_connect_setup_failed` so the dashboard has eight panels total.
4. Pin the 14-day HogQL source snapshot from the vision doc under the saved insights.
5. Confirm these event properties are visible in PostHog event samples:
   - `source`
   - `cta`
   - `connection_method`
   - `path`
   - `using_demo_data`
   - `has_accounts`
   - `connection_tone`
   - `stage`
   - `entry_point`
   - `category`
   - `selected_tab`
6. Sanity-check one founder session end to end:
   - landing CTA
   - invite entry
   - onboarding
   - connect
   - dashboard arrival
   - founder manual fallback, if used
7. Save a short dashboard description that says this is the weekly founder activation review surface.

## Naming Rules

- Keep saved insight names identical to the names in the dashboard doc.
- Keep the dashboard title singular: `Founder Activation`.
- Do not mix anonymous landing views into source-level conversion dashboards.
- Treat `founder_connect_setup_failed` as a pre-start reliability signal, not a true link-session failure.
- Treat `linked_accounts` in `founder_connect_continue_clicked` as any live source, not just brokerage connectivity.
- Treat `founder_dashboard_upgrade_clicked` as primary upgrade intent only, not generic navigation.

## Weekly Monday Review

Bring these inputs into the meeting:

- The Founder Activation dashboard
- A 14-day view of saved insights
- The latest product or engineering changelog touching landing, invite, onboarding, connect, or dashboard

Answer these questions in order:

1. Did the top-line founder funnel improve or regress week over week?
2. Which `source` produced the best CTA-to-dashboard conversion?
3. Did invite acceptance improve after the latest copy or beta-framing changes?
4. Did connect starts improve without causing more setup failures or exits?
5. Are dashboard arrivals becoming more real, measured by `has_accounts=true` and `using_demo_data=false`?
6. Are manual fallback paths climbing because of trust friction, reliability friction, or founder preference?
7. When founders open guided manual fallback, are they actually submitting context or abandoning the flow?

## Required Output From The Review

Record four things every week:

1. The biggest founder drop in one paragraph.
2. One acquisition or CTA decision.
3. One onboarding or connect-friction decision.
4. One instrumentation or taxonomy fix if the dashboard still cannot answer a basic funnel question cleanly.

## Alert Thresholds

These are operating defaults until the team has a stronger baseline.

- If `founder_connect_setup_failed` rises above 5% of `founder_connect_started` plus `founder_connect_setup_failed`, inspect Plaid/bootstrap health before changing copy.
- If `manual_fallback` plus `callback_error_manual_fallback` grows for two straight weeks, review connect trust proof and recovery messaging before changing onboarding.
- If manual-context opens climb but submit rate stays weak, the founder fallback UX is leaking effort rather than preserving momentum.
- If `founder_dashboard_arrived` is growing but `has_accounts=true` is flat, the funnel is producing shallow activation.
- If `founder_invite_code_started` rises but `founder_invite_accepted` does not, the beta framing or code-entry UX is leaking trust.

## Event Audit Checklist

Run this after any change to landing, invite, onboarding, connect, or dashboard routing.

1. Confirm `source` still survives across the funnel in `sessionStorage`.
2. Confirm connect starts still distinguish `bank_plaid` from `brokerage_oauth`.
3. Confirm dashboard arrival still fires once per session after required queries resolve.
4. Confirm the founder-priority card only emits `founder_dashboard_upgrade_clicked` for the primary CTA on non-ready states.
5. Confirm manual fallback emits open, category, submit, and close events with `stage` and `entry_point`.
6. Confirm new recovery states do not inflate canonical success/failure rates.
