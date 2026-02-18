# Design Implementation Plan: Strata & ClearMoney

This document outlines the comprehensive plan to elevate the ClearMoney UI/UX to an institutional-grade "Financial Operating System." It focuses on the **Strata Design System**, radical transparency, and agentic interaction patterns.

**Status Legend:**
- [ ] Not Started
- [/] In Progress
- [x] Completed

---

## 1. The Strata Design System (Foundation)
**Goal:** Establish a shared visual language that balances high-density financial data with approachable, agent-first interactions.

### 1.1 Typography & Type Scale
- [x] **Selection:** Select a high-contrast **Serif** (e.g., *Publico*, *Fraunces*, or *Newsreader*) for headers to signal authority.
- [x] **Data Font:** Select a highly-legible **Monospace** (e.g., *JetBrains Mono*, *Geist Mono*) for data points, traces, and financial tables.
- [x] **Implementation:** Update `tailwind.config.ts` with new font families and a revised type scale for high-density dashboards.

### 1.2 Color Palette ("Sovereign Finance")
- [x] **Definition:** Define semantic color tokens:
    -   **Financial Emerald:** Growth, positive cash flow, verified proofs.
    -   **Audit Amber:** Warnings, drifts, "needs attention" states.
    -   **Sovereign Slate:** Deep background tones for the UI canvas (replacing pure black/gray).
    -   **Trace Blue:** Interactive elements indicating "clickable logic" (Metric Traces).
- [x] **Tailwind Config:** Implement colors using Tailwind 4's CSS variable support for dynamic theming.

### 1.3 Data Density Controls
- [x] **Compact Mode Toggle:** Create a global preference to switch between "Comfort" (standard) and "Terminal" (high-density) views.
- [x] **Component Audit:** Update `DataSourceStatusStrip`, `MetricTrace`, and Tables to respect the density setting. (MetricCard and TraceModal updated)

---

## 2. Radical Transparency UI (Metric Traces)
**Goal:** Make "Show the Math" a first-class citizen, building trust through explainable data.

### 2.1 The Logic Tree Component
- [x] **Design:** Move beyond simple tooltips. Design a popover/drawer that visualizes the formula dependency graph (e.g., `(Cash + Investments) / Monthly Burn = Runway`).
- [x] **Implementation:** Build a reusable `MetricLogicTree` component that takes a `TraceId` and renders the graph. (Implemented in TraceModal directly)
- [x] **Source Linking:** Ensure every node in the tree links back to its source (e.g., specific transaction, account balance).

### 2.2 Confidence Heatmaps
- [x] **Visual Language:** Design subtle background indicators (gradients, borders) that represent data confidence/freshness.
    -   *Solid/Bright:* < 5 mins old (Real-time).
    -   *Faded/Ghostly:* > 24 hours old (Stale).
- [x] **Integration:** Apply these styles to all top-level metrics in the Founder Operating Room. (Via MetricCard)

### 2.3 Traceability in Chat
- [x] **Context Awareness:** When the Advisor references a number, the UI should highlight the corresponding widget on the dashboard. (Implemented via HighlightContext and AdvisorMessage)
- [x] **Hover Interactions:** Hovering over a metric in the chat stream should trigger the Logic Tree on the dashboard. (Implemented via mouse enter/leave on Metric references in chat)

---

## 3. Agentic Interaction Design (UX for the AI Era)
**Goal:** Shift from "Chat" to "Intent-based" workflows. The Agent drafts; the User approves.

### 3.1 Draft Action Cards
- [x] **Component:** Create `ActionIntentCard` for the dashboard stream.
    -   *States:* Draft, Analyzing, Ready for Review, Executing, Done.
- [x] **Animation:** Implement "Slide-in" animations for when the Agent proposes a new action during a session. (Included in ActionIntentCard)

### 3.2 Biometric / One-Touch Approvals
- [x] **UI Integration:** Design the "Approve" flow to visually mimic a biometric challenge (fingerprint/FaceID glyph).
- [x] **Feedback:** Provide immediate, satisfying tactile/visual feedback upon approval (haptics simulation). (Implemented in BiometricOverlay)

### 3.3 Contextual Sidebars
- [x] **Adaptive Layout:** The Advisor sidebar should change context based on the current page (e.g., showing Tax Skills when on the Tax Shield page).
- [x] **Skill Suggestions:** Context-aware "chips" to prompt the user with relevant questions (`/skills/tax_optimization`). (Implemented in AdvisorSidebar)

---

## 4. Reducing Onboarding Friction
**Goal:** Lower the barrier to entry while maintaining high-fidelity data requirements.

### 4.1 Progressive Discovery
- [x] **Flow Redesign:** Allow users to access the dashboard with just *one* linked account (Demo Mode + 1 Real Source).
- [x] **Unlock Mechanisms:** visually "unlock" advanced features (e.g., Tax Shield) only after the necessary data (Business Account) is connected. (Implemented via FeatureLock component)

### 4.2 Connection Health Dashboard
- [x] **Visual Status:** A dedicated "System Status" widget showing the health of all Plaid/SnapTrade connections. (Implemented via SystemStatus component)
- [x] **Healing Flows:** One-click "Fix Connection" buttons that launch the re-auth flow directly, without navigating to settings. (Included in SystemStatus)

### 4.3 Financial Memory Wizard
- [x] **Conversational Intake:** Replace static forms with a chat-like interface for gathering manual data (e.g., "Do you have any unvested equity?"). (Implemented via MemoryWizard)
- [x] **Inference Engine:** UI to confirm "guesses" made by the system (e.g., "Is this $4,000 deposit your monthly salary?"). (Implemented via InferenceConfirm)

---

## 5. Motion & Feedback
**Goal:** Make the system feel "alive," responsive, and processing in real-time.

### 5.1 The "Agent Pulse"
- [x] **Ambient Animation:** A subtle, rhythmic glow or pulse in the UI chrome that indicates the Agent is active/monitoring. (Implemented in AdvisorSidebar FAB)
- [x] **Processing States:** Micro-interactions for "Thinking" and "Calculating" that replace generic spinners. (Implemented in AdvisorSidebar and ActionIntentCard)

### 5.2 Layout Transitions
- [x] **Framer Motion:** Implement `layout` prop transitions for dashboard widgets when filtering or changing views. (Implemented in MetricCard and ActionIntentCard)
- [x] **Trace Expansion:** Smoothly animate the expansion of Metric Traces from their source numbers. (Implemented in TraceModal)

### 5.3 Skeleton States
- [x] **High-Fidelity Loading:** Replace generic gray blocks with skeletons that match the specific layout of charts and data tables. (Implemented via MetricCardSkeleton)
- [x] **Progressive Loading:** Reveal data as it arrives (streaming) rather than waiting for the entire page query to finish. (Implemented via StreamingMetric component)

---

## 6. Advanced Modeling & Governance (Phase 6)
**Goal:** Provide institutional-grade stress testing and agent control.

### 6.1 Scenario Lab
- [x] **Interactive Sliders:** Controls for "Burn Rate," "Market Correction," and "Revenue Growth."
- [x] **Real-time Ripples:** Animate `MetricCard` values (Runway, Net Worth) instantly as sliders move.
- [x] **Integration:** Connect slider state to `MonteCarloService` or a client-side approximation engine. (Implemented in ScenarioLab component)

### 6.2 Agent Policy Engine (Guardrails)
- [x] **Policy Dashboard:** UI to set limits (e.g., "Max Transfer $5k", "Require Approval").
- [x] **Visual Blockers:** Show which policy blocked a specific Action Intent in the stream. (Implemented via GuardrailDashboard)

### 6.3 Redacted Share Sheets
- [x] **Privacy Toggles:** Controls for "Redact Balances," "Hide Institution Names," "Strip PII."
- [x] **Preview Mode:** A "View as Recipient" mode to verify redaction before sharing.
- [x] **Ephemeral UI:** Countdown timer for link expiration. (Implemented via ShareSheetPreview)

### 6.4 The Trust Hub
- [x] **Payout Disclosure:** A transparent table showing affiliate potential vs. actual recommendation logic.
- [x] **Audit Log:** A stream of "Math Updates" or corrections to the platform's methodology. (Implemented via PayoutDisclosure and MethodologyAuditLog in TransparencyPage)

---

## 7. Action Execution Hub (The War Room)
**Goal:** A centralized "Inbox" for authorizing financial maneuvers and generating switch kits.

### 7.1 Queue Management
- [x] **Page Implementation:** Create `/dashboard/war-room` to manage all pending intents.
- [x] **Filter Logic:** Support filtering by "Ready," "Draft," and "Executed" history.

### 7.2 Authorization Workflow
- [x] **Logic Review:** Seamless integration with `TraceModal` to verify AI reasoning before execution.
- [x] **Biometric Authorization:** High-fidelity `BiometricOverlay` for authorizing maneuvers.

### 7.3 Switch Kit Integration
- [x] **PDF Manifests:** Specialized PDF templates for ACATS and ACH transfers.
- [x] **Download UX:** Direct "Switch Kit" download button from the Action Intent Card.

---

## Execution Strategy

1.  **Phase 1-7:** Completed.
