# Financial Portability Protocol (FPP)

Version: 0.1.0
Last Updated: 2026-02-16

## The Problem
Financial data is currently siloed behind proprietary APIs (Plaid, MX) or locked in walled gardens (Bank of America, Fidelity). When a user wants to use a new AI agent (e.g., a "Tax Optimization Agent" or a "Real Estate Strategy Agent"), they have to re-authenticate and re-sync all their data, or worse, manually upload CSVs.

**FPP is a standardized, agent-readable format for financial context.**

---

## 1. The Financial Data Passport

An FPP "Passport" is a signed JSON-LD document that contains a user's unified financial graph. It is intended to be the "Standard Context Window" for any financial AI.

### Core Schema (Simplified)

```json
{
  "@context": "https://strata.platform/schemas/fpp/v1",
  "id": "urn:uuid:550e8400-e29b-41d4-a716-446655440000",
  "issued_at": "2026-02-16T10:00:00Z",
  "expires_at": "2026-02-16T11:00:00Z",
  "issuer": "strata_platform_v1",
  "claims": {
    "net_worth": {
      "value": 1250000.50,
      "currency": "USD"
    },
    "asset_allocation": [
      { "class": "equities", "percentage": 0.72 },
      { "class": "fixed_income", "percentage": 0.18 },
      { "class": "cash", "percentage": 0.10 }
    ],
    "risk_profile": "MODERATE_AGGRESSIVE",
    "liabilities": [
      { "type": "mortgage", "balance": 450000.00, "rate": 0.0325 }
    ]
  },
  "signature": "..."
}
```

---

## 2. Agent-to-Agent Handshake

Strata provides a secure "Handshake" mechanism to share data with other agents without sharing bank credentials.

1.  **Request:** External Agent (e.g., "TaxGPT") requests access to `claims.investments.transactions` and `claims.income`.
2.  **Consent:** Strata prompts the user: *"TaxGPT wants to see your 2025 transactions to find write-offs. Allow?"*
3.  **Token Issuance:** Strata issues a short-lived, scoped **FPP Token**.
4.  **Ingestion:** TaxGPT fetches the signed JSON-LD graph. It now has the full "Financial Context" needed to work, without ever knowing the user's bank password.

---

## 3. "One-Click" Data Portability

Strata implements the **"Right to Portability"** as a core feature.

*   **Export:** Users can click "Download Financial Passport" to get a portable file of their entire Strata history (including manual notes, categorizations, and decision traces).
*   **Import:** A user coming from another platform (e.g., Monarch or a legacy bank) can "Import Passport." Strata maps the incoming data into our Context Graph instantly.

---

## 4. The Verifiable Credential (VC) Layer

For high-trust actions (like applying for a mortgage), Strata can issue a **Verifiable Credential for Proof of Funds**.

*   **The Old Way:** Send 3 months of PDF bank statements to a lender.
*   **The Strata Way:** Generate a ZK-Proof (Zero-Knowledge Proof) that says: *"I have at least $50,000 in liquid cash across my linked accounts."*
*   The lender verifies the signature without ever seeing the individual transactions or account numbers.

---

## 5. Roadmap

1.  **v0.1:** Define the JSON-LD schema for the Financial Context Graph.
2.  **v0.2:** Implement "Download my Data" as a signed package.
3.  **v0.3:** Open the "Strata Connect for Agents" API, allowing 3rd-party agents to request FPP tokens.
4.  **v0.4:** Integrate with Decentralized Identity (DID) standards for truly sovereign data.
