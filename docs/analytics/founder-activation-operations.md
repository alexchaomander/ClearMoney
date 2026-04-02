# Founder Activation Operations Runbook

## Purpose

This runbook turns the founder activation instrumentation into an operating system the team can actually use every week.

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
6. Sanity-check one founder session end to end:
   - landing CTA
   - invite entry
   - onboarding
   - connect
   - dashboard arrival
7. Save a short dashboard description that says this is the weekly founder activation review surface.

## Naming Rules

- Keep saved insight names identical to the names in the dashboard doc.
- Keep the dashboard title singular: `Founder Activation`.
- Do not mix anonymous landing views into source-level conversion dashboards.
- Treat `founder_connect_setup_failed` as a pre-start reliability signal, not a true link-session failure.

## Weekly Monday Review

Bring these inputs into the meeting:

- The Founder Activation dashboard
- A 14-day view of saved insights
- The latest product/eng changelog touching landing, invite, onboarding, connect, or dashboard

Answer these questions in order:

1. Did the top-line founder funnel improve or regress week over week?
2. Which `source` produced the best CTA-to-dashboard conversion?
3. Did invite acceptance improve after the latest copy or beta-framing changes?
4. Did connect starts improve without causing more setup failures or exits?
5. Are dashboard arrivals becoming more real, measured by `has_accounts=true` and `using_demo_data=false`?
6. Are manual fallback paths climbing because of trust friction, reliability friction, or founder preference?

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
- If `founder_dashboard_arrived` is growing but `has_accounts=true` is flat, the funnel is producing shallow activation.
- If `founder_invite_code_started` rises but `founder_invite_accepted` does not, the beta framing or code-entry UX is leaking trust.

## Product Follow-Through

Use the dashboard to drive concrete work rather than reporting alone.

- Landing or invite drop: tighten promise clarity and founder qualification language.
- Onboarding drop: reduce steps or make skip paths clearer.
- Connect setup reliability drop: fix provider/bootstrap issues before revisiting surface copy.
- Connect start drop: strengthen trust proof, timing expectations, and manual fallback framing.
- Dashboard quality drop: make missing live data feel costly and make the upgrade path more obvious.

## Event Audit Checklist

Run this after any change to landing, invite, onboarding, connect, or dashboard routing.

1. Confirm `source` still survives across the funnel in `sessionStorage`.
2. Confirm connect starts still distinguish `bank_plaid` from `brokerage_oauth`.
3. Confirm dashboard arrival still fires once per session after required queries resolve.
4. Confirm new CTA buttons emit distinct events if they are intended to drive decisions.
5. Confirm new recovery states do not inflate canonical success/failure rates.
