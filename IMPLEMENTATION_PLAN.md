# Implementation Plan: Strata Platform + ClearMoney (AI-Native Mint)

*Last updated: March 11, 2026*

This document outlines the strategic engineering execution plan to build **Strata** (the multi-tenant Action-Layer platform) and **ClearMoney** (the flagship AI-native successor to Mint).

---

## The Vision: Platform + Flagship

ClearMoney is the "Prime" application for the Strata platform. It demonstrates the generational leap from a **Read-Only Ledger** (Mint) to an **Autonomous Economic Agent**.

| Component | Focus |
| :--- | :--- |
| **Strata API** | Multi-tenant infrastructure, Unified Context Graph, Agentic Reasoning (Decision Traces), and the Action Gateway. |
| **ClearMoney** | Consumer UI/UX, Personal Finance Management (PFM), Equity Tracking, and "Smart" Financial Workflows. |

---

## Phase 0: The AI-Native Baseline (COMPLETED)

- [x] **OpenRouter Integration**: Refactored `AgentRuntime` to support OpenAI-compatible endpoints (OpenRouter) for superior reasoning (Claude 3.5 / Gemini 1.5).
- [x] **Platform Pivot**: Updated `PRD.md` to define Strata as the "Action-Layer" for agentic finance.
- [x] **Vision Alignment**: Established `the-ai-native-mint.md` as the north star for the ClearMoney consumer experience.
- [x] **Provider Abstraction**: Established the pattern of hiding aggregators (Plaid/SnapTrade) behind the Strata SDK.

---

## Phase 1: Context OS Foundation (Current)

**Goal:** Build a deterministic, trust-scored, resilient context layer that can support a true financial chief-of-staff experience.

### 1.1 Deterministic Financial Core

- [ ] **Computation Boundary Spec**:
    - Define which outputs are deterministic, inferred, speculative, or explanatory.
    - Require every metric and recommendation payload to declare that boundary.
- [ ] **Deterministic Services v1**:
    - Taxes and estimated payments
    - Runway and burn
    - Debt prioritization
    - Portfolio concentration and drift
    - Savings-rate and liquidity calculations
- [ ] **Trace Labeling**:
    - Extend traces to show deterministic vs inferred components in API and UI.

### 1.2 Canonical Context Graph

- [ ] **Graph Schema v1**:
    - People, households, entities, accounts, assets, liabilities, income, obligations, goals, documents, observations, recommendations, actions, corrections, reviews.
- [ ] **Node Metadata**:
    - `source`, `source_type`, `source_reliability_tier`, `collected_at`, `effective_at`, `freshness_sla`, `confidence`, `review_status`, `determinism_class`.
- [ ] **Context Continuity States**:
    - healthy, stale, degraded, revoked, partially_covered, manual_substitute, recovery_required.
- [ ] **Invalidation Rules**:
    - New syncs, document uploads, user edits, and reviewer actions trigger targeted recomputation.

### 1.3 Provenance and Live "Show the Math"

- [ ] **Provenance API**:
    - Build API endpoints for metric-level lineage.
- [ ] **Formula Versioning**:
    - Store formula IDs and versions for all key user-facing metrics.
- [ ] **Initial Metrics Migration**:
    - Net worth
    - Runway
    - Savings rate
    - Allocation drift
- [ ] **Confidence Decomposition**:
    - Explain confidence from freshness, coverage, source tier, conflict count, and inference depth.

### 1.4 Connectivity Resilience

- [ ] **Aggregator Failure Handling**:
    - Add connection-health modeling and degraded-confidence behavior.
- [ ] **Fallback Data Ingestion**:
    - Manual confirmation flows
    - Document-based recovery
    - Future screen-/portal-assisted recovery hooks
- [ ] **Continuity UX**:
    - The advisor should stay useful when one or more account connections fail.

### 1.5 Privacy, Trust, and Deployment Modes

- [ ] **Trust Mode Model**:
    - Hosted default
    - Hardened private workspace
    - Future local-first / personal vault
    - Ephemeral / vanish mode
- [ ] **Capability Isolation**:
    - Sandbox risky connectors and agent tasks.
- [ ] **Consent by Capability**:
    - Align scopes with actual product capabilities, not generic read/write buckets.

### 1.6 Behavioral and Preference Context

- [ ] **Behavior Profile v1**:
    - Risk style
    - Debt aversion
    - Liquidity preference
    - Speed of decision-making
    - Override patterns
- [ ] **Preference vs Error Distinction**:
    - Separate user preference signals from actual factual corrections.

### 1.7 The "Beyond Mint" Data Connectors (DIY)
Instead of waiting for aggregators, we build lightweight, high-value connectors for modern assets.

- [ ] **Equity Comp (RSUs/Options)**:
    - Implement Grant/Vest model in `app/models/financial_memory.py`.
    - Integrate **Alpha Vantage** or **Polygon.io** for real-time stock price lookups.
    - Build the "Vest Projection" logic (e.g., "You have $15k vesting in 30 days").
- [ ] **Public Crypto (DeFi)**:
    - Integrate **Alchemy** or **Moralis** SDKs.
    - Allow users to add public wallet addresses (ETH/SOL).
    - Auto-sync balances and token values without requiring private keys.
- [ ] **Manual "Alternative" Vault**:
    - Build UI for Private Equity, Angel Investments, and Collectibles.
    - Implement "Appraisal History" to track value over time.

### 1.8 The Unified Context Graph (Mapping)
- [ ] **Schema Normalization**: Ensure that data from Plaid (Banks), SnapTrade (Brokerages), and Alchemy (Crypto) all map to the unified `Strata` graph model.
- [ ] **Data Freshness Engine**: Implement a background worker to sync different providers at different cadences (e.g., Crypto: 5m, Banks: 6h).
- [ ] **Normalization Logic**: Map fragmented merchant strings from Plaid into clean, categorized entities using an LLM-based categorization service.

---

## Phase 2: Reasoning, Review, and Continuity

**Goal:** Build a persistent advisor experience where every recommendation is explainable, reviewable, and continuity-aware.

### 2.1 The Decision Engine v2
- [ ] **Trace Generation**: Update the `DecisionEngine` to produce a structured JSON "Trace" for every recommendation.
- [ ] **Math-to-Narrative Pipeline**: Use the OpenRouter integration to turn mathematical findings into human-readable stories.
- [ ] **Rule Expansion**:
    - "Cash Drag": Identifying excess checking balance vs. HYSA yields.
    - "Tax Drag": Identifying taxable vs. tax-advantaged allocation ratios.
    - "Concentration Risk": Identifying single-stock exposure > 20% of net worth.
- [ ] **Recommendation Readiness Gates**:
    - Do not produce strong recommendations when context quality is below threshold.
- [ ] **Source Tiering**:
    - External news, social, and alternative data must be marked contextual unless elevated by explicit policy.

### 2.2 The "Why This?" UI
- [ ] **Trace Viewer**: Build a specialized React component in the `strata-sdk` to render Decision Traces (inputs, rules, assumptions).
- [ ] **Interactive Assumptions**: Allow users to "Override" assumptions (e.g., "Actually, my monthly expenses are $4k, not $3k") and re-run the trace.
- [ ] **Live Provenance UI**:
    - Replace static methodology cards with live lineage for key metrics.
- [ ] **Source and Determinism Labels**:
    - Show whether claims are deterministic, inferred, or speculative.

### 2.3 Correction Engine

- [ ] **Correction Types**:
    - wrong_fact, stale_fact, wrong_categorization, wrong_assumption, wrong_recommendation, intentional_exception, source_mistrust, execution_mismatch.
- [ ] **Correction Workflow**:
    - report -> classify -> invalidate -> resolve -> recompute -> measure.
- [ ] **Reviewer Console**:
    - Internal tooling for triage and adjudication.

### 2.4 Advisor Continuity

- [ ] **Persistent Advisory State**:
    - Open questions, pending recommendations, recent context changes, blocked actions, and active goals.
- [ ] **Briefing Engine**:
    - Daily and weekly "what changed / what matters now" summaries.
- [ ] **Cross-Channel Continuity**:
    - SMS, voice, email, and dashboard should reflect one current advisory state.

---

## Phase 3: The Action Layer (Intents)

**Goal:** Transition from "Pretty Charts" to "Financial Action."

### 3.1 The Action Gateway
- [ ] **Intent Model**: Implement the `ActionIntent` lifecycle (DRAFT -> AUTHORIZED -> EXECUTING -> COMPLETE).
- [ ] **Drafting Service**: Build logic that "prepares" an action for the user (e.g., a drafted ACH transfer to an HYSA).
- [ ] **The Action Lab**: A UI where users review, modify, and authorize drafted intents.
- [ ] **Mandate Controls**:
    - observe_only, summarize_only, recommend_only, draft_only, approval_required, bounded_preauthorization.
- [ ] **Context Freeze**:
    - Snapshot exact context used for every action decision.

### 3.2 "Guided" Execution
- [ ] **The Switch Kit**: For actions that cannot be automated (legacy banks), generate a "Switch Kit" (pre-filled PDFs and step-by-step instructions).
- [ ] **Direct Execution (SnapTrade)**: Use SnapTrade's write-access to allow users to place rebalancing trades directly from ClearMoney.
- [ ] **Interaction Layer**:
    - Add architecture for guided and semi-automated flows across brittle portals and PDF-heavy workflows.
- [ ] **Post-Action Learning**:
    - Compare expected vs actual action outcomes and feed results back into trust scoring.

### 3.3 Compliance by Capability

- [ ] **Capability Matrix**:
    - Map every action class to advice, execution, privacy, custody, and liability requirements.
- [ ] **Risk-Class Rollout**:
    - Sequence launches by risk class rather than by feature excitement.

---

## Phase 4: Multi-Tenant Expansion (Platform)

**Goal:** Enable other developers to build their own "AI-Native Finance" apps on Strata.

### 4.1 The Strata SDK
- [ ] **React Hooks**: Standardize `useGraph()`, `useRecommendations()`, and `useActions()`.
- [ ] **Developer Console**: Build a simple UI for developers to generate API keys and manage their own "Apps" (tenants).
- [ ] **Sandbox Data**: Create a robust set of "Mock Financial Personalities" for developers to test against.
- [ ] **Trust-Scored Connectors**:
    - Expose connector trust metadata and continuity status.
- [ ] **Mandate APIs**:
    - Let third-party apps enforce observe/draft/act permission boundaries.
- [ ] **Portable Context Exports**:
    - Ship JSON-LD / FPP-aligned exports with provenance and correction history.

### 4.2 Regional Execution Strategy

- [ ] **Market Sequencing**:
    - U.S.: trust-heavy, draft-first rollout.
    - Brazil / stronger open-finance markets: evaluate earlier execution pathways.
    - EU/UK/AU: assess where open-banking rails make action easier.

---

## Technical Infrastructure Priorities

1.  **Security**: Implement AES-256 encryption for all provider tokens in the database.
2.  **Privacy**: Build "Vanish Mode" (client-side data obfuscation) into the SDK.
3.  **Observability**: Track LLM latency and "Trace Accuracy" (user feedback on why-this explanations).
4.  **Isolation**: Sandbox skills and sensitive execution paths with explicit filesystem/network boundaries.
5.  **Reliability**: Monitor aggregator breakage, degraded context rates, and continuity failures.
6.  **Deterministic Testing**: Build regression suites for calculators and recommendation-readiness logic.

---

## Immediate Next Steps (March 2026)

1.  **Context Graph Spec**: Write the canonical graph, metadata, and determinism-boundary spec.
2.  **Trace Schema v2**: Add provenance, source-tier, determinism-class, and policy-version fields.
3.  **Live Provenance Pilot**: Migrate net worth, runway, and savings rate from static methodology to live lineage.
4.  **Correction Engine v1**: Implement typed corrections for spending, debt classification, and recommendation rationale.
5.  **Connectivity Resilience**: Add degraded / revoked / partially-covered connection states and UI handling.
6.  **Advisor Continuity**: Implement persistent advisory state and first weekly briefing workflow.
7.  **Action Mandates**: Add observe / recommend / draft / approval-required modes before deeper automation.
