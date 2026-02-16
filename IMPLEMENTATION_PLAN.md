# IMPLEMENTATION PLAN: ClearMoney Vision Realization

This document outlines the roadmap to transform ClearMoney from a high-fidelity prototype into an institutional-grade, radically transparent financial operating system.

## Phase 1: Foundation & Personalization (The Admin Layer)
**Goal:** Transition from placeholders to a fully functional administrative and profile management system.

### 1.1 Persistent Financial Memory Management
- [x] **UI:** Implement `/profile` and `/settings` pages.
- [x] **Feature:** Manual editing of Financial Memory fields (Age, State, Filing Status, Dependents).
- [x] **Feature:** Risk Tolerance and Retirement Age sliders with real-time impact preview.
- [x] **Feature:** Preference management for "Seven Pillars" (e.g., set custom inflation or market return targets).

### 1.2 Security & Policy Configuration
- [x] **Feature:** UI for managing `ActionPolicy`. Allow users to define:
    - [x] Allowed action types (e.g., "Only Savings Transfers").
    - [x] Thresholds for manual confirmation (e.g., "Any action > $500").
    - [x] Multi-factor authentication (MFA) gating for high-value executions.

### 1.3 Proactive Alerting System
- [x] **Backend:** Implement an observation engine that triggers alerts based on "Decision Traces".
- [x] **UI:** Dashboard notification center.
- [x] **Notification Types:** 
    - [x] Low Emergency Fund (relative to memory target).
    - [x] Tax-loss harvesting opportunities.
    - [x] Sync failures or data stale warnings.

## Phase 2: Founder Operating Room (The Intelligence Layer)
**Goal:** Deliver specialized value for founders managing both business and personal surfaces.

### 2.1 Commingling Detection Engine
- [x] **Backend:** Implement categorization logic to flag "Cross-Boundary" transactions (personal spend on business cards).
- [x] **UI:** "Vulnerability Report" showing the strength of the corporate veil.
- [x] **Integration:** Automated reimbursement suggestions for the Financial Advisor.

### 2.2 Runway & Burn Visuals
- [x] **Feature:** "Personal Runway" chart (Current Liquid Cash / Average Monthly Burn).
- [x] **Feature:** "Entity Runway" for founders with connected business accounts.
- [x] **Intelligence:** "Burn Optimization" recommendations (e.g., identifying recurring SaaS subscriptions to cut).

### 2.3 Tax Shield Planning
- [x] **Feature:** Real-time monitoring of 1099/K-1 income streams.
- [x] **Logic:** Calculate quarterly estimated tax obligations based on current income and safe-harbor rules.
- [x] **Execution:** Generate recommendations to "Execute Estimated Tax Payment."

## Phase 3: The "Last Mile" (The Execution Layer)
**Goal:** Move beyond "Queued" status to actual money movement and trading.

### 3.1 Money Movement (Plaid Transfer)
- [x] **Integration:** Connect Plaid Transfer API for A2A (Account-to-Account) transfers.
- [x] **Execution Flow:** 
    - [x] User approves recommendation.
    - [x] ClearMoney initiates ACH transfer.
    - [x] Status updates from "Queued" -> "Processing" -> "Completed".

### 3.2 Brokerage Execution
- [x] **Integration:** Partner with Alpaca or DriveWealth for trade execution.
- [x] **Features:** 
    - [x] Automated rebalancing based on advisor drift analysis.
    - [x] Tax-loss harvesting (TLH) trade execution.

### 3.3 Deep Linking for Third-Party Actions
- [x] **Feature:** Generate intelligent referral links that pre-fill data on provider sites (e.g., credit card applications, high-yield savings account openings).

## Phase 4: Radical Transparency & Modeling (The Integrity Layer)
**Goal:** Fulfill the "Show the Math" promise with institutional-grade modeling.

### 4.1 "Show the Math" Dashboard Integration
- [x] **UI:** Add "Trace" icons to every calculated metric on the dashboard.
- [x] **Feature:** Clicking an icon opens a modal showing:
    - [x] The raw data points used.
    - [x] The specific formula/methodology applied.
    - [x] Confidence score for that metric.

### 4.2 Monte Carlo Simulations
- [x] **Logic:** Replace linear retirement projections with probabilistic Monte Carlo modeling.
- [x] **UI:** Visualize "Probability of Success" bands instead of a single line.

### 4.3 Real-time Affiliate Ingestion
- [x] **Backend:** Integrate with affiliate network APIs (e.g., CJ, Impact) to fetch *live* payout data. (Simulated with dynamic ingestion engine).
- [x] **Automation:** Automatically update the Payout Disclosure and Independence Audit tables.

## Phase 5: Trust & Privacy (The Trust Layer)
**Goal:** Provide secure sharing and data privacy controls.

### 5.1 Redacted Sharing Mode
- [x] **Feature:** Polished UI for "Share Report" that allows users to toggle visibility of:
    - [x] Exact balances (replace with ranges).
    - [x] Institution names.
    - [x] PII (Personal Identifiable Information).
- [x] **Use Case:** Sharing progress with investors or financial partners.

### 5.2 Data "Vanish" Mode
- [x] **Feature:** Session-specific privacy toggle that prevents the AI from persisting conversation data or using specific sensitive accounts in its context.

## Phase 6: Native Experience (The Accessibility Layer)
**Goal:** Bring ClearMoney to mobile for on-the-go decision making.

### 6.1 Progressive Web App (PWA)
- [x] **Implementation:** Add manifest and service workers for installability.
- [x] **Feature:** Biometric (FaceID/TouchID) gating for "Execute Action" confirmation (Gated by browser/OS capabilities).

### 6.2 Push Notifications
- [x] **Feature:** Real-time push alerts for high-priority transparency corrections or guardrail breaches (Implemented via browser Notification API).

## Phase 7: Deep Analysis & Intelligence (The "Insight" Layer)
**Goal:** Enhance the platform's analytical depth and turning data into actionable founder-first signals.

### 7.1 The "What-If" Engine
- [x] **UI:** Assumption toggle strip on the main Dashboard.
- [x] **Feature:** Real-time re-calculation of Net Worth projections and Monte Carlo success rates based on toggled assumptions (Inflation, Market Return).

### 7.2 Subscription Audit (Burn Optimization)
- [x] **Backend:** Logic to detect recurring transaction patterns (SaaS, Utilities, Subscriptions).
- [x] **UI:** "Burn Breakdown" in the Founder Operating Room flagging potential "leaky" subscriptions.

### 7.3 High-Fidelity Service Integration
- [x] **Feature:** "Bridge" UI for Deep Links that explains the referral intent and data privacy. (Integrated into ShareModal and Execution paths).
- [x] **Registry:** Implementation of a verified provider registry for HYSA, Insurance, and Tax services.

---

## Technical Requirements
- **Frontend:** Next.js 16.1 (App Router), React 19, Tailwind CSS 4, Framer Motion, TanStack Query.
- **Backend:** FastAPI (Python 3.11), SQLAlchemy (Async), Pydantic v2.
- **Data:** Plaid (Auth, Liab, Invest, Transfer), Anthropic (Claude 3.5 Sonnet).
- **Infrastructure:** Vercel (Frontend), Railway/Fly.io (API), Supabase/Neon (PostgreSQL).
