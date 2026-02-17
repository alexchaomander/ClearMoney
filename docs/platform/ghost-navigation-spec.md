# Ghost Navigation Technical Spec (Era 2)

Version: 0.1.0
Last Updated: 2026-02-16

## 1. Overview
**Ghost Navigation** is the Strata Action Layer's bridge for legacy financial institutions that do not yet support "Write" APIs. It provides a side-by-side "Copilot" experience, guiding the user through manual execution on 3rd-party websites while providing real-time data context and tracking.

---

## 2. Core Concepts

### 2.1 The Execution Manifest
Every `ActionIntent` targeting a legacy provider must include an **Execution Manifest**. This is an ordered list of steps required to complete the action.

### 2.2 Deep-Link Registry (DLR)
A centralized mapping of `institution_id` to specific workflow URLs (e.g., direct links to "ACH Transfer," "ACATS Rollover," or "Wire Instructions" pages).

### 2.3 Context Snippets
Interactive UI components in the sidebar that allow users to one-click copy the specific data points (Account #, Routing #, exact amounts) required for the legacy form.

---

## 3. Data Models

### 3.1 The Step Schema (JSON)
Each step in the manifest follows this structure:

```json
{
  "order": 1,
  "type": "NAVIGATION | COPY_DATA | VERIFICATION",
  "label": "Login & Navigate",
  "url": "https://digital.fidelity.com/ftgw/digital/transfer/",
  "instruction": "Open Fidelity and navigate to the 'Transfer' tab.",
  "snippets": [
    {
      "label": "Source Account",
      "value": "Fidelity Brokerage (*4592)",
      "copy_value": "123456789"
    }
  ]
}
```

---

## 4. The Ghost Lifecycle

1.  **Drafting:** The AI Agent identifies an optimization and creates an `ActionIntent` with an `ActionIntentType` (e.g., `ACH_TRANSFER`).
2.  **Manifest Generation:** The `GhostService` looks up the `source_institution_id` in the DLR and generates the appropriate steps.
3.  **Copilot Activation:** The user clicks "Guided Execution" in the Action Lab. The **Ghost Sidebar** slides out.
4.  **Guided Workflow:**
    *   User clicks deep links (opening bank sites in new tabs).
    *   User copies snippets from the sidebar into the bank forms.
    *   User marks each step as "Done."
5.  **Completion & Sync:** Once the user completes the final step, Strata triggers an immediate "Verification Sync" to confirm the balance or transaction change at the source and destination.

---

## 5. Deep-Link Registry (v0.1 Initial Audit)

| Institution | Action Type | Deep Link URL (Example) |
|-------------|-------------|-------------------------|
| **Fidelity** | ACATS / Rollover | `https://digital.fidelity.com/ftgw/digital/transfer/` |
| **Vanguard** | Move Money | `https://holdings.vanguard.com/move-money/transfer` |
| **Chase** | ACH Transfer | `https://secure05ea.chase.com/web/auth/dashboard#/dashboard/transfer/index` |
| **Mercury** | Internal Transfer | `https://app.mercury.com/transfer` |
| **BoA** | Pay Bill / Transfer | `https://secure.bankofamerica.com/login/auth/login.go` |

---

## 6. Frontend: The Ghost Sidebar Component

### Visual Design:
*   **Persistent:** Stays visible even if the user navigates away from the Action Lab.
*   **Minimized Mode:** A small floating "Ghost" icon that can be expanded.
*   **Progress Tracking:** Visual indicator of % completion.

### Interaction Logic:
*   **Smart Copy:** Automatically format numbers (remove commas/currency symbols) when copying to clipboard for forms.
*   **Window Management:** Provide a "Focus Mode" that dims the rest of the app to emphasize the sidebar and the target link.

---

## 7. Security & Privacy

*   **No Password Storage:** Strata never asks for or stores the user's legacy bank password. The user authenticates directly with the institution.
*   **Clipboard Safety:** Snippets are cleared from the clipboard after a short timeout (e.g., 60 seconds) to prevent accidental leakage.
*   **Audit Trail:** Every step the user marks as "Done" is logged in the `ActionIntent` history for future debugging.

---

## 8. Implementation Roadmap

1.  **Sprint 1:** Backend `ExecutionManifest` generation logic + DLR v0.1.
2.  **Sprint 2:** Frontend `GhostSidebar` UI + Snippet component.
3.  **Sprint 3:** Verification loop (Sync-on-Done) and status transitions.
