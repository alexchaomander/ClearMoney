# IMPLEMENTATION PLAN: Strata & ClearMoney Vision

This document tracks the evolution of Strata from a financial data aggregator into an **Autonomous Action Layer** for the agentic economy.

---

## Era 1: The Context Graph (Foundation)
**Goal:** Build the most comprehensive "Context Window" of a user's financial life with radical transparency.

### 1.1 Data Integrity & Transparency
- [x] **Feature:** Unified dashboard showing cross-provider net worth.
- [x] **Feature:** "Show the Math" - Traceable metrics showing raw data and formulas.
- [ ] **Enhancement:** ZK-Proof Generation for "Proof of Funds" without exposing raw history.
- [ ] **Enhancement:** Institutional-grade Monte Carlo simulations for retirement projections.

### 1.2 Multi-Surface Intelligence
- [x] **Feature:** Commingling detection for founders (Personal vs. Business spend).
- [x] **Feature:** Burn rate and runway optimization for early-stage companies.
- [x] **Feature:** Real-time quarterly estimated tax calculations.

---

## Era 2: The Drafting & Bridge Layer (The Intermediate Ground)
**Goal:** Remove "Cognitive Friction" by preparing actions for the user. Bridge the gap to legacy banks.

### 2.1 The Action Intent System (SAL)
- [x] **Backend:** Implement the `ActionIntent` model and lifecycle (DRAFT -> PENDING -> EXECUTED).
- [x] **Backend:** Add `capabilities` discovery to `BaseProvider` (e.g., "Supports ACATS", "API-Enabled").
- [x] **UI:** "Action Approval Room" - Integrate Action Lab with real backend intents.

### 2.2 Legacy Paperwork Automation (Switch Kits)
- [ ] **Feature:** "One-Click Rollover" - AI pre-fills ACATS transfer PDFs for 401k/IRA migrations.
- [ ] **Integration:** Integrate e-signature (DocuSign/HelloSign) for instant paperwork execution.
- [x] **Feature:** "Switch Kit" generator - PDF manifest engine for action intents.

### 2.3 Agent Intelligence (Action Awareness)
- [x] **Intelligence:** Empower Advisor to proactively draft intents via `draft_action_intent` tool.
- [ ] **UI:** "Guided Execution" sidebar in the web app for manual actions on legacy sites.
- [ ] **Tooling:** Browser-based agent to auto-fill fields on legacy bank transfer pages based on Strata Action Intents.

---

## Era 2.5: The Trust Protocol (SVP)
**Goal:** Transform Strata from a "data scraper" into a "Financial Identity Layer."

### 2.5.1 Verifiable Claim Engine
- [ ] **Backend:** Implement `SVPService` to generate cryptographically signed attestations.
- [ ] **Backend:** Support `THRESHOLD_PROOF_OF_FUNDS` and `INCOME_STABILITY` claims.
- [ ] **UI:** "Privacy Proofs" tab in the Action Lab for generating attestations.

### 2.5.2 Public Verification Portal
- [ ] **UI:** Build the `/verify` portal for 3rd-party validation of signed JSON-LD claims.
- [ ] **API:** Implement public verification endpoint for signature validation.

---

## Era 3: The Agentic Ledger (Long-Term Bet)
**Goal:** Establish Strata as the primary System of Record with programmable, autonomous accounts.

### 3.1 Smart Accounts for Agents
- [ ] **Integration:** Partner with **Safe (formerly Gnosis Safe)** to issue Smart Accounts for every Strata user.
- [ ] **Feature:** Programmable "Guardrails" - Set rules for what the agent can do without human intervention (e.g., "Rebalance if drift > 5%").
- [ ] **Feature:** Multi-sig authentication for high-value agent actions.

### 3.2 The Agent Economy
- [ ] **Integration:** **Skyfire** integration for agent-to-agent payments (paying for specialized financial advice/data).
- [ ] **Protocol:** Implement **L402** for machine-to-machine micropayments.
- [ ] **API:** "Agentic API" - Allowing 3rd-party financial agents to interact with a user's Strata context.

### 3.3 The Native System of Record
- [ ] **Backend:** Build the **Internal Double-Entry Ledger** for assets held directly within the Strata ecosystem.
- [ ] **Feature:** Instant settlement for internal transfers (bypassing ACH/ACATS delays).
- [ ] **Feature:** "Context-Native" tax-loss harvesting execution.

---

## The Portability Protocol (FPP)
**Goal:** Prevent vendor lock-in and establish Strata as the open standard for financial agents.

- [ ] **Spec:** Finalize the **Financial Portability Protocol (FPP)** JSON-LD schema.
- [ ] **Feature:** "One-Click Export" - Download a signed "Financial Passport" for use with other agents.
- [ ] **Feature:** "Agent Handshake" - Securely share sub-sections of context with 3rd-party tools without sharing bank credentials.

---

## Technical Roadmap & Gaps

### Gaps to Close (Short Term)
1.  **Action Intent API:** [x] Create endpoints for `POST /api/v1/actions/intent` and `GET /api/v1/actions/room`.
2.  **Capabilities Tagging:** [x] Audit current providers (SnapTrade, manual) and tag their action capabilities.
3.  **The Drafting UX:** Build the frontend "Intent Preview" component that shows the **Logic Trace** (why this action?).

### Tech Stack Evolution
- **Ledger:** Moving towards a hybrid model (PostgreSQL for context, Blockchain for verifiable actions).
- **Security:** Implementing **ZK-Proofs** for privacy-preserving data sharing.
- **Agent:** Transitioning from "Chat-based" advice to "Intent-based" execution.

---

## Success Metrics
- **Portability:** Time taken for a user to move a $100k account from a legacy bank to Strata-Native (Goal: < 5 minutes of human effort).
- **Autonomy:** % of rebalancing actions executed by the agent without manual drafting (Era 3 goal: > 80%).
- **Ecosystem:** Number of 3rd-party agents consuming the Strata FPP protocol.
