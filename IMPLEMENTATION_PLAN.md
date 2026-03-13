# Implementation Plan: Strata Platform + ClearMoney (AI-Native Mint)

*Last updated: March 12, 2026*

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

### Recently Completed (March 12, 2026)

- [x] **Typed Context Contracts**:
    - Added typed response models for assembled financial context payloads.
    - Aligned SDK types with richer context structures.
- [x] **Live Provenance Pilot**:
    - Replaced static methodology with live metric trace APIs for:
        - Net worth
        - Total assets
        - Savings rate
        - Personal runway
- [x] **Trace Schema v2 (Metrics)**:
    - Added `formula_id`, `formula_version`, `determinism_class`, `source_tier`, `continuity_status`, `recommendation_readiness`, `confidence_factors`, and correction targets to metric traces.
- [x] **Formula Registry v1**:
    - Registered versioned formulas for the initial core metrics.
- [x] **Correction Engine v1**:
    - Added first-class corrections with deterministic application for monthly income, monthly expenses, and transaction category fixes.
    - Added recomputation impact summaries for corrected metrics.
- [x] **Context Quality / Continuity v1**:
    - Added context-quality evaluation and API surface with continuity states and recommendation readiness.
- [x] **Advisor Trace Upgrade v1**:
    - Added context-quality metadata and readiness gating to advisor-created traces and recommendation generation.

### Next Build Slice: Recommendation-Trace Convergence (Completed)

**Objective:** Move ClearMoney from explainable metrics to explainable advisory behavior by putting analysis and recommendation traces onto the same trust contract.

**Deliverables**
- [x] **Shared Decision Trace v2 Contract**:
    - Typed payload for advisor `analysis` and `recommendation` traces.
    - Required fields:
        - `trace_version`
        - `trace_kind`
        - `rules_applied`
        - `insights`
        - `assumptions`
        - `confidence_score`
        - `confidence_factors`
        - `determinism_class`
        - `source_tier`
        - `continuity_status`
        - `recommendation_readiness`
        - `coverage_status`
        - `policy_version`
        - `freshness`
        - `context_quality`
        - `warnings`
        - `remediation_actions`
        - `correction_targets`
- [x] **Recommendation Remediation UX**:
    - The UI should explain why a recommendation is `cautious` or `blocked`.
    - It should point users to reconnect accounts, refresh stale data, or fill missing profile inputs.
- [x] **Decision Trace UI Migration**:
    - Replace raw JSON-heavy trace viewers with structured rendering of rules, insights, assumptions, confidence, and remediation.
- [x] **Backward Compatibility**:
    - Existing traces should still render via fallback parsing while new traces emit the typed v2 shape.

**Delivered**
- Shared `DecisionTracePayload` is now live across advisor traces, API serialization, SDK types, and dashboard rendering.
- Recommendation traces now carry remediation actions, correction targets, and review summaries.
- User-facing review entry points and a recommendation review queue are implemented.

**Execution Sequence**
1. Add `DecisionTracePayload` and response parsing in the API/schema layer.
2. Build a shared decision-trace payload builder in the advisor backend.
3. Update advisor-created traces to use the shared builder.
4. Expose parsed `trace_payload` from `/api/v1/agent/decision-traces`.
5. Update SDK types and frontend trace rendering.
6. Add regression tests for stored traces, API serialization, and readiness/remediation display.

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

- [x] **Provenance API**:
    - Built API endpoints for metric-level lineage.
- [x] **Formula Versioning**:
    - Store formula IDs and versions for key user-facing metrics in the registry-backed trace contract.
- [x] **Initial Metrics Migration**:
    - Net worth
    - Personal runway
    - Savings rate
    - Total assets
- [x] **Confidence Decomposition**:
    - Confidence is now decomposed into freshness, coverage, and metric-specific factors.
- [ ] **Recommendation Trace Convergence**:
    - Migrate recommendation traces fully onto the same provenance v2 contract used by metrics.
    - Status: in progress via shared `DecisionTracePayload` and UI remediation rendering.
- [ ] **Allocation Drift Provenance**:
    - Extend the registry + trace stack to allocation drift and concentration metrics.

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

- [x] **Correction Types**:
    - wrong_fact, stale_fact, wrong_categorization, wrong_assumption, wrong_recommendation, intentional_exception, source_mistrust, execution_mismatch.
- [x] **Correction Workflow**:
    - report -> classify -> apply when deterministic -> recompute impacted traces.
- [x] **Recommendation Review Queue v1**:
    - Dashboard queue for recommendation disputes, stale guidance, and correction conversion.
- [x] **Recommendation Correction Handling v1**:
    - Recommendation reviews can be converted into correction objects and fed back into continuity state.

### 2.3.1 Detailed Next Program: Recommendation Review and Correction Loop

**Objective:** Turn recommendation traces into a governed workflow where weak, disputed, or high-risk recommendations are routed through correction, review, and continuity state updates instead of silently degrading trust.

**Primary Product Outcomes**
- Users can tell ClearMoney not just "this number is wrong," but:
    - "this recommendation is based on a wrong assumption"
    - "this recommendation is directionally wrong for my situation"
    - "this recommendation is blocked because my context is incomplete"
- Internal reviewers can adjudicate disputes, apply overrides, and update trace status without mutating raw financial history manually.
- Future advisor sessions inherit the outcome of prior corrections and reviews.

**Scope v1**
- Recommendation traces created by advisor `analysis` and `recommendation` flows
- Manual-review corrections and recommendation-rationale disputes
- Reviewer decisioning for:
    - approve current recommendation
    - dismiss user dispute
    - mark recommendation stale
    - convert dispute into factual correction
    - mark recommendation blocked pending context recovery

**Non-Goals v1**
- Full policy engine for every action type
- Multi-reviewer approval chains
- External-facing support tooling
- Automated model retraining

**Data Model Additions**
- [x] **Recommendation Review Entity**
    - `id`
    - `user_id`
    - `decision_trace_id`
    - `recommendation_id`
    - `review_type`
    - `status`
    - `opened_reason`
    - `resolution`
    - `resolution_notes`
    - `applied_changes`
    - `reviewer_id` or `reviewer_label`
    - `created_at`, `updated_at`, `resolved_at`
- [ ] **Recommendation Status Extensions**
    - Add trace-/recommendation-level states such as:
        - `active`
        - `cautious`
        - `blocked`
        - `superseded`
        - `needs_review`
        - `resolved`
- [x] **Continuity Carry-Forward v1**
    - Open review items and unresolved recommendation disputes now flow into trace review summaries and continuity warnings.

**Backend Workstreams**
1. **Recommendation Review Schema + Migration**
   - Add `recommendation_reviews` table.
   - Add indexes on `user_id`, `decision_trace_id`, `recommendation_id`, and `status`.
   - Ensure downgrade paths clean up enum/types correctly.
2. **Review Service**
   - Create service methods for:
       - open review
       - list reviews
       - resolve review
       - convert review into correction
       - mark recommendation superseded
   - Guarantee every resolution writes an audit trail.
3. **Decision Trace Status Projection**
   - Extend `DecisionTracePayload` with optional review summary:
       - `review_status`
       - `open_review_count`
       - `latest_resolution`
       - `superseded_by_trace_id`
   - Ensure `/agent/decision-traces` returns current review state without clients reconstructing it.
4. **Advisor Continuity Hooks**
   - When an advisor session starts, inject:
       - open recommendation disputes
       - unresolved review items
       - recommendations blocked by stale or partial context
   - Prevent the advisor from re-issuing identical recommendations while a review is unresolved.

**Frontend Workstreams**
1. **Decision Trace Review Surface**
   - Add actions in the trace UI:
       - `Report recommendation issue`
       - `Mark as outdated`
       - `Request human review`
   - Render current review state with visible badges.
2. **Recommendation Review Queue v1**
   - Build a review page with:
       - queue filters by `status`, `severity`, `trace_kind`, and `continuity_status`
       - trace summary card
       - linked recommendation, linked corrections, linked context quality
       - resolution actions
   - Keep room for future internal-only escalation controls.
3. **Continuity and Remediation UX**
   - Show when a recommendation is blocked because context needs repair.
   - Route users to the right remediation action:
       - reconnect accounts
       - refresh data
       - update profile
       - resolve open review

**API Surface**
- [x] `POST /api/v1/recommendation-reviews`
- [x] `GET /api/v1/recommendation-reviews`
- [x] `POST /api/v1/recommendation-reviews/{id}/resolve`
- [x] `POST /api/v1/recommendation-reviews/{id}/convert-to-correction`
- [x] Extend `GET /api/v1/agent/decision-traces` with review summary fields

**Execution Order**
1. Build review model + migration: completed
2. Build review service + API: completed
3. Extend decision trace payload with review summary: completed
4. Add recommendation review queue: completed in v1
5. Add user-facing recommendation dispute actions: completed
6. Feed open review state into advisor continuity and recommendation suppression: completed in v1

**Acceptance Criteria**
- Every disputed recommendation can be tracked without mutating raw trace payloads by hand.
- Review resolution is visible in the trace UI and retrievable by API.
- A resolved recommendation dispute can either:
    - update recommendation state, or
    - create downstream factual corrections.
- Advisor sessions surface unresolved reviews and avoid repeating identical guidance under active review.
- Review queue can process the full loop from open -> resolve/convert -> audit.

**Rollout Plan**
- Stage 1: Internal-only reviewer APIs and console
- Stage 2: User-facing "request review" on recommendation traces
- Stage 3: Advisor continuity integration
- Stage 4: Recommendation suppression / supersession logic

**Suggested Sprint Breakdown**
- **Sprint A**
    - migration
    - backend review models
    - base review APIs
    - tests for open/list/resolve
- **Sprint B**
    - trace payload review summary
    - reviewer console
    - audit trail + links to corrections
- **Sprint C**
    - user-facing dispute entry point
    - continuity injection into advisor
    - recommendation suppression and supersession behavior

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

## Immediate Next Steps (Post-March 12, 2026)

1.  **Recommendation Trace Convergence**:
    - Move recommendation traces onto the same v2 provenance contract as metric traces.
    - Add determinism/source-tier labels directly to the decision narrative UI.
2.  **Connectivity Resilience UX**:
    - Surface continuity states (`healthy`, `stale`, `degraded`, `revoked`, `manual_substitute`) in dashboard experiences.
    - Add explicit recovery paths when readiness is blocked.
3.  **Correction Expansion**:
    - Add debt-balance, allocation, and recommendation-rationale correction flows.
    - Introduce reviewer resolution states and audit tooling.
4.  **Formula Registry Expansion**:
    - Cover allocation drift, concentration risk, debt load, and advisor-readiness metrics.
5.  **Canonical Context Graph Spec**:
    - Formalize stable node/edge IDs and metadata ownership for durable context nodes.
6.  **Advisor Continuity**:
    - Persist open questions, blocked actions, and "what changed" summaries as first-class advisory state.
7.  **Action Mandates**:
    - Tie recommendation readiness and context quality directly into observe/recommend/draft/approval-required execution boundaries.
