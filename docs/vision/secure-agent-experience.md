# Secure Personal Finance Agent Experience (NanoClaw-Inspired)

**Purpose:** Provide an end-to-end blueprint for how ClearMoney can deliver a NanoClaw-like experience: a small, understandable, secure-by-design personal finance agent tailored to individual users and grounded in ClearMoney’s Strata data model.

## 1) What We’re Borrowing from NanoClaw

NanoClaw’s core ideas map well to a ClearMoney agent experience:

- **Small enough to understand:** a deliberately minimal, auditable agent surface area.
- **Secure by isolation:** strong boundaries between the agent runtime and sensitive data.
- **Built for one user:** personalization over “one-size-fits-all” frameworks.
- **AI-native workflow:** users configure and evolve the agent through conversation.

The ClearMoney twist is that the agent is grounded in a complete personal finance graph (the Strata) with explainable recommendations and decision traces, not just chat.

## 2) ClearMoney Agent Experience (User Journey)

### A. “Personal Finance Operator” Onboarding

1. **Connect accounts (Strata intake):** link banks, investments, liabilities, income, and protection assets to build the complete picture across the seven pillars. The Strata is designed to unify assets, liabilities, income, and decision traces, which makes it the substrate for a safe, explainable agent. 【F:docs/vision/north-star-strata.md†L16-L132】
2. **Consent-first agent scope:** the user defines what the agent can access and for what purpose (e.g., “analyze cash flow,” “optimize debt,” “prepare tax checklist”). This aligns with a consent and vault model that is explicit about scopes and auditability. 【F:docs/platform/consent-and-vault.md†L13-L76】
3. **Agent persona + priorities:** a lightweight configuration session that sets tone, risk tolerance, financial goals, and action preferences (e.g., “only suggest, never execute”).

### B. Ongoing Agent Interactions (Daily + Scheduled)

- **Daily/weekly briefings:** net worth changes, cash flow anomalies, upcoming bills, and “decision-ready” moments (e.g., RSU vesting, interest rate changes).
- **Ask-anything conversations:** explain *why* a recommendation exists and *what would change* it, with decision traces anchored to Strata data. 【F:docs/vision/north-star-strata.md†L68-L109】
- **Scheduled tasks:** e.g., “every Friday summarize spending outliers,” “monthly debt payoff plan.”

### C. Safe Actions

- **Read-first by default:** start with analysis-only mode.
- **Optional action paths:** when a user opts in, the agent can trigger safe, bounded workflows (e.g., “prepare transfer instructions,” “queue bill pay draft,” “generate a to-do list”) without direct control of external accounts by default.

## 3) Security Model Tailored for Personal Finance

ClearMoney should go beyond NanoClaw’s container isolation by adding financial-grade controls:

1. **Consent-scoped access:** only request the minimum scopes required (balances, transactions, liabilities, etc.). Track and audit all consent changes. 【F:docs/platform/consent-and-vault.md†L13-L76】
2. **Token vault + encryption:** store provider tokens encrypted, keep audit logs of access, and enforce revocation on consent changes. 【F:docs/platform/consent-and-vault.md†L667-L756】
3. **Decision trace requirement:** all recommendations require transparent citations to source data and reasoning steps (Strata-native). 【F:docs/vision/north-star-strata.md†L68-L109】
4. **Freshness-aware advice:** only issue actionable recommendations when sync freshness meets confidence thresholds (or show warnings). The sync-and-freshness framework provides the states and health checks for this. 【F:docs/platform/sync-and-freshness.md†L27-L69】

## 4) Proposed Architecture (NanoClaw → ClearMoney)

| NanoClaw Concept | ClearMoney Equivalent | Notes |
| --- | --- | --- |
| Minimal codebase | Minimal agent surface area | Keep the agent runtime small; prefer “skills” and narrow flows to reduce risk. |
| Container isolation | Secure agent runtime sandbox | Isolate the agent runtime from production systems; only expose curated APIs. |
| Per-group memory | Per-user finance memory | Use Strata decision traces and user preferences as “memory.” 【F:docs/vision/north-star-strata.md†L68-L109】 |
| Scheduled tasks | Scheduled finance jobs | Hook into sync/freshness cycles for safe periodic insights. 【F:docs/platform/sync-and-freshness.md†L27-L69】 |
| One user | One-person financial OS | Tailor behavior per user; never “generic finance advice.” |

## 5) End-to-End Build Plan (Product + Platform)

This section translates the vision into an end-to-end build path: data ingestion → agent runtime → safety gates → user experience → operational readiness.

### 5.1 Core Components (System Map)

1. **Strata Ingestion + Graph Layer**
   - Normalize all data sources into the seven pillars of financial context, so the agent has a unified picture across assets, liabilities, income, credit, and protection. 【F:docs/vision/north-star-strata.md†L80-L132】
   - Persist a relationship graph (e.g., mortgage ↔ home, RSU vesting ↔ employer) to power contextual recommendations. 【F:docs/vision/north-star-strata.md†L68-L109】
2. **Consent + Token Vault**
   - Require explicit, scoped permissions for every agent capability (balances read, transactions read, liabilities read, etc.). 【F:docs/platform/consent-and-vault.md†L13-L76】
   - Encrypt provider tokens, log access, and revoke on consent change. 【F:docs/platform/consent-and-vault.md†L667-L756】
3. **Sync + Freshness Service**
   - Keep data freshness visible and gate recommendations based on confidence thresholds. 【F:docs/platform/sync-and-freshness.md†L27-L69】
   - Surface “partial” or “stale” data states to the agent for disclosure. 【F:docs/platform/sync-and-freshness.md†L289-L294】
4. **Agent Runtime (Isolated + Minimal)**
   - Run the agent in a sandbox with only curated API access (no direct DB access).
   - Prefer a minimal, auditable runtime surface area (NanoClaw ethos).
5. **Agent API Boundary**
   - Expose a narrow set of read-only endpoints (e.g., `/strata/summary`, `/strata/cashflow`, `/strata/liabilities`).
   - Enforce a “consent scope” check per endpoint. 【F:docs/platform/consent-and-vault.md†L13-L76】
6. **Decision Trace Service**
   - Persist every recommendation with inputs, logic steps, and outputs for auditability. 【F:docs/vision/north-star-strata.md†L68-L109】
7. **User Experience Layer**
   - Provide a conversational interface plus an explainability panel (“show your work”). 【F:docs/vision/north-star-strata.md†L68-L109】
   - Include freshness indicators and data confidence tags. 【F:docs/platform/sync-and-freshness.md†L562-L1094】

### 5.2 Data Flow (End-to-End)

1. **Account connection:** user connects accounts → consent recorded → tokens stored in vault. 【F:docs/platform/consent-and-vault.md†L13-L76】
2. **Sync pipeline:** providers sync → freshness service computes confidence scores. 【F:docs/platform/sync-and-freshness.md†L27-L69】
3. **Strata graph update:** normalized data + relationships are persisted. 【F:docs/vision/north-star-strata.md†L80-L132】
4. **Agent request:** user asks a question → agent hits read-only APIs.
5. **Safety gate:** check scopes + data freshness; if below threshold, respond with warning. 【F:docs/platform/sync-and-freshness.md†L562-L1094】
6. **Decision trace:** recommendation + reasoning stored for audit and user review. 【F:docs/vision/north-star-strata.md†L68-L109】

### 5.3 Phased Delivery (Milestones)

#### Phase 1 — Read-Only Safe Agent (MVP)
- **UX:** conversational insights, explainability, and decision traces.
- **Engineering:** Strata read APIs, consent enforcement, freshness gating, trace logging. 【F:docs/platform/consent-and-vault.md†L13-L76】【F:docs/platform/sync-and-freshness.md†L27-L69】
- **Safety:** no account actions, warnings on stale data. 【F:docs/platform/sync-and-freshness.md†L562-L1094】

#### Phase 2 — Guided Actions
- **UX:** “prepare action” flows (drafts, checklists, confirmations).
- **Engineering:** action intent APIs, explicit consent per action, audit logging.
- **Safety:** two-step confirmation and reversible/previewable outputs.

#### Phase 3 — Opt-In Autopilot
- **UX:** trusted, bounded automations for pre-approved tasks.
- **Engineering:** action execution via secure providers; transaction limits and anomaly detection.
- **Safety:** auto-pause on anomalies, re-auth every N days.

## 6) Experience Design: Trust + Clarity

### Key UX Principles

- **“Show your work” by default:** every response is a traceable decision, not a black box. 【F:docs/vision/north-star-strata.md†L68-L109】
- **Minimal permissions:** consent controls are transparent and revocable at any time. 【F:docs/platform/consent-and-vault.md†L398-L521】
- **Freshness indicators:** show when advice is based on stale or partial data. 【F:docs/platform/sync-and-freshness.md†L562-L1094】

### Example Agent Flow

1. **User:** “Should I pay down my credit card or invest?”
2. **Agent:** Uses Strata to analyze interest rates, cash flow, and contribution limits.
3. **Agent:** Presents a recommendation *with a decision trace* and the exact data used.
4. **Agent:** Offers actions: “Create a payoff plan draft” and “Set a savings target.”

## 7) Concrete Work Items (Engineering Backlog)

1. **Agent API boundary:** define a strict API surface that the agent can call (no direct DB access).
2. **Decision trace schema:** integrate a standardized schema for every agent response. 【F:docs/vision/north-star-strata.md†L68-L109】
3. **Consent UI/UX:** make scope configuration and revocation simple and obvious. 【F:docs/platform/consent-and-vault.md†L398-L521】
4. **Freshness gating:** integrate sync confidence checks into the agent response pipeline. 【F:docs/platform/sync-and-freshness.md†L562-L1094】
5. **Security review:** threat model the agent runtime and data access patterns.
6. **Agent evaluation harness:** replay known scenarios with golden outputs to verify safe/consistent advice.
7. **Audit dashboard:** internal review tool for decision traces, freshness warnings, and consent logs.

---

## Appendix: Why This Is Safe + Differentiated

The ClearMoney agent can be uniquely safe because it is:

- Grounded in a unified, explainable Strata data model (not just chat). 【F:docs/vision/north-star-strata.md†L16-L109】
- Governed by explicit consent, token vaulting, and audit trails. 【F:docs/platform/consent-and-vault.md†L13-L76】
- Aware of data freshness and sync reliability before making suggestions. 【F:docs/platform/sync-and-freshness.md†L27-L69】

This creates a credible “personal finance operator” experience that mirrors NanoClaw’s small, secure ethos while meeting the higher bar required for financial trust.
