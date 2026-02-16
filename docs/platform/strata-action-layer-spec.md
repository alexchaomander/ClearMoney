# Strata Action Layer (SAL) Technical Spec

Version: 0.1.0
Last Updated: 2026-02-16

## Overview
The **Strata Action Layer (SAL)** is the intermediate infrastructure that bridges the gap between "Read-Only" data and "Autonomous" money movement. Its core goal is to provide a standardized interface for **Financial Intents**.

---

## 1. Core Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                           The User Agent (AI)                            │
│           (Analyzes Graph, identifies opportunities, creates Intent)     │
└────────────────────────────────────┬─────────────────────────────────────┘
                                     │
                                     ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                        Strata Action Router (SAR)                        │
│         (Validates Intent against Consent Ledger & Provider capabilities) │
└─────────────┬──────────────────────┬──────────────────────┬──────────────┘
              │                      │                      │
              ▼                      ▼                      ▼
    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
    │  Direct Action  │    │  Draft Action   │    │  Guided Action  │
    │  (API-driven)   │    │  (Paperwork)    │    │ (Instructions)  │
    └─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## 2. The Action Intent Object

An **Action Intent** is a cryptographically signed request to modify the user's financial state. It is always accompanied by a **Trace ID** that links it back to the recommendation.

```json
{
  "id": "intent_12345",
  "type": "ACCOUNT_TRANSFER_ACATS",
  "status": "DRAFT",
  "trace_id": "rec_high_fee_brokerage_99",
  "source": {
    "provider": "snaptrade",
    "account_id": "acc_fidelity_ira_456",
    "assets": ["ALL"]
  },
  "destination": {
    "provider": "clearmoney_ledger",
    "account_type": "ROTH_IRA"
  },
  "manifest": {
    "generated_pdf_id": "doc_acats_prefilled_987",
    "signing_required": true
  },
  "logic_trace": {
    "reason": "Excessive management fees (1.2%) at Fidelity vs 0.1% at ClearMoney.",
    "estimated_annual_saving": 450.00
  }
}
```

---

## 3. Provider Capability Discovery

We extend the `BaseProvider` to include capability discovery. This allows the UI to show "One-Click" buttons only when supported.

```python
class ActionCapability(Enum):
    ACH_TRANSFER = "ach_transfer"
    ACATS_TRANSFER = "acats_transfer"
    INTERNAL_REBALANCE = "internal_rebalance"
    KYC_EXPORT = "kyc_export"
    PDF_GENERATION = "pdf_generation"

class BaseProvider(ABC):
    # Existing Read methods ...

    @abstractmethod
    async def get_capabilities(self) -> list[ActionCapability]:
        """Return list of supported actions for this provider."""
        pass

    @abstractmethod
    async def prepare_action(self, intent: ActionIntent) -> ActionManifest:
        """Generate the necessary tokens, URLs, or PDFs for the action."""
        pass

    @abstractmethod
    async def execute_action(self, intent: ActionIntent) -> ActionStatus:
        """Execute the action directly via API (if supported)."""
        pass
```

---

## 4. The "Ghost" Action Flow (The Intermediate Ground)

For most legacy providers (Fidelity, Vanguard, etc.), we cannot move money via API. We use the **Ghost Flow**:

1.  **Detection:** The AI identifies a $5,000 cash balance in a 0.01% checking account.
2.  **Intent Creation:** The AI creates an `ActionIntent` to move it to a 4.5% HYSA.
3.  **Ghost Navigation:**
    *   The Strata SDK provides a **"Guided Execution"** component.
    *   It gives the user a sidebar that says: *"Step 1: Click 'Transfers' in your Bank X app. Step 2: Use these pre-filled details for the ACH transfer."*
    *   **Automation Upgrade:** If the user is on the web, a browser extension or specialized agent can auto-fill these fields.
4.  **Verification:** Strata polls the source account. Once the balance drops and the destination balance rises, it marks the `ActionIntent` as **COMPLETED**.

---

## 5. Security & Safety

1.  **Consent Narrowing:** Action intents require a separate "Write" scope in the **Consent Ledger**.
2.  **The "Kill Switch":** Users can revoke all pending Action Intents with a single tap.
3.  **Human-in-the-Loop (HITL):** No money movement happens without an explicit biometric (FaceID/TouchID) or physical confirmation from the user.

---

## 6. Implementation Roadmap

### Phase 1: The Paperwork Agent (Q1 2026)
*   Support generating pre-filled ACATS and ACH authorization PDFs.
*   Integrate with an e-signature provider (e.g., DocuSign or HelloSign).
*   Add "Action Detection" to the `DecisionEngine`.

### Phase 2: The guided Execution (Q2 2026)
*   Build the "Ghost Navigation" SDK component.
*   Implement manual "Mark as Done" tracking for user actions.

### Phase 3: Direct API Execution (Q3 2026+)
*   Partner with "Write-enabled" providers (e.g., modern brokerages like Alpaca or modern banks like Mercury/Novo).
*   Implement full ACATS automation via specialized clearing partners.
