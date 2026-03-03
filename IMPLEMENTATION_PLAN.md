# Implementation Plan: Strata Platform + ClearMoney (AI-Native Mint)

*Last updated: March 2026*

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

## Phase 1: The Context Graph & "Beyond Mint" (Current)

**Goal:** Build the most comprehensive "Digital Twin" of a user's financial life, including assets Mint ignored.

### 1.1 The "Beyond Mint" Data Connectors (DIY)
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

### 1.2 The Unified Context Graph (Mapping)
- [ ] **Schema Normalization**: Ensure that data from Plaid (Banks), SnapTrade (Brokerages), and Alchemy (Crypto) all map to the unified `Strata` graph model.
- [ ] **Data Freshness Engine**: Implement a background worker to sync different providers at different cadences (e.g., Crypto: 5m, Banks: 6h).
- [ ] **Normalization Logic**: Map fragmented merchant strings from Plaid into clean, categorized entities using an LLM-based categorization service.

---

## Phase 2: The Reasoning Layer (Decision Traces)

**Goal:** Build user trust through radical transparency. Every piece of advice must be explainable.

### 2.1 The Decision Engine v2
- [ ] **Trace Generation**: Update the `DecisionEngine` to produce a structured JSON "Trace" for every recommendation.
- [ ] **Math-to-Narrative Pipeline**: Use the OpenRouter integration to turn mathematical findings into human-readable stories.
- [ ] **Rule Expansion**:
    - "Cash Drag": Identifying excess checking balance vs. HYSA yields.
    - "Tax Drag": Identifying taxable vs. tax-advantaged allocation ratios.
    - "Concentration Risk": Identifying single-stock exposure > 20% of net worth.

### 2.2 The "Why This?" UI
- [ ] **Trace Viewer**: Build a specialized React component in the `strata-sdk` to render Decision Traces (inputs, rules, assumptions).
- [ ] **Interactive Assumptions**: Allow users to "Override" assumptions (e.g., "Actually, my monthly expenses are $4k, not $3k") and re-run the trace.

---

## Phase 3: The Action Layer (Intents)

**Goal:** Transition from "Pretty Charts" to "Financial Action."

### 3.1 The Action Gateway
- [ ] **Intent Model**: Implement the `ActionIntent` lifecycle (DRAFT -> AUTHORIZED -> EXECUTING -> COMPLETE).
- [ ] **Drafting Service**: Build logic that "prepares" an action for the user (e.g., a drafted ACH transfer to an HYSA).
- [ ] **The Action Lab**: A UI where users review, modify, and authorize drafted intents.

### 3.2 "Guided" Execution
- [ ] **The Switch Kit**: For actions that cannot be automated (legacy banks), generate a "Switch Kit" (pre-filled PDFs and step-by-step instructions).
- [ ] **Direct Execution (SnapTrade)**: Use SnapTrade's write-access to allow users to place rebalancing trades directly from ClearMoney.

---

## Phase 4: Multi-Tenant Expansion (Platform)

**Goal:** Enable other developers to build their own "AI-Native Finance" apps on Strata.

### 4.1 The Strata SDK
- [ ] **React Hooks**: Standardize `useGraph()`, `useRecommendations()`, and `useActions()`.
- [ ] **Developer Console**: Build a simple UI for developers to generate API keys and manage their own "Apps" (tenants).
- [ ] **Sandbox Data**: Create a robust set of "Mock Financial Personalities" for developers to test against.

---

## Technical Infrastructure Priorities

1.  **Security**: Implement AES-256 encryption for all provider tokens in the database.
2.  **Privacy**: Build "Vanish Mode" (client-side data obfuscation) into the SDK.
3.  **Observability**: Track LLM latency and "Trace Accuracy" (user feedback on why-this explanations).

---

## Immediate Next Steps (March 2026)

1.  **Founder Operating Room (Multi-Entity):** Implement `LegalEntity` schema to support isolation between personal and business finances. Refactor runway, commingling, and tax-shield services to utilize this structure. Connect to ActionIntents for automated tax withholding. (✅ Completed)
2.  **Equity Model**: Implement the RSU/Options model in the backend and connect it to a stock price API. (✅ Completed)
3.  **Dashboard "Beyond Mint"**: Update the web dashboard to show a "Coming Soon: Equity Tracking" section powered by the new model. (✅ Completed)
4.  **Action Intents**: Fully implement the ActionIntent execution layer (the "War Room") to allow users to review and approve drafted actions. (In Progress)
