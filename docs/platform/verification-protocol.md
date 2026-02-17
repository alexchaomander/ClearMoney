# Strata Verification Protocol (SVP)

Version: 0.1.0
Last Updated: 2026-02-16

## 1. Overview
The **Strata Verification Protocol (SVP)** is a privacy-first framework for financial attestation. It enables users to prove specific financial facts (e.g., "I have at least $50,000 in liquid assets") to third parties without revealing their account numbers, transaction history, or exact balances.

By leveraging the **Financial Portability Protocol (FPP)**, SVP transforms Strata from a data aggregator into a **Financial Identity Layer**.

---

## 2. The Trust Triangle

SVP operates on a three-party architecture:

1.  **The Issuer (Strata Platform):**
    *   Authenticates with legacy banks (via Plaid/SnapTrade).
    *   Validates the data surface (balances, history, income).
    *   Issues a cryptographically signed **Financial Attestation**.
2.  **The Holder (The User):**
    *   Owns the context graph.
    *   Selects the specific claim they wish to prove (e.g., a "Proof of Funds" claim).
    *   Decides with whom to share the attestation.
3.  **The Verifier (Landlord, Lender, Vendor):**
    *   Receives the attestation.
    *   Verifies the cryptographic signature against Strata’s public key.
    *   Receives a binary "PASS/FAIL" result for the specific claim.

---

## 3. Privacy-Preserving Claims (SVP-1)

SVP prioritizes **Data Minimization**. Instead of sharing a raw balance, the protocol supports "Z-Claims" (Zero-disclosure claims):

### Standard Claim Types:
*   **Threshold Proof:** "Liquid assets exceed $X."
*   **Income Stability:** "Average monthly distributions exceed $Y for the last 6 months."
*   **Asset Coverage:** "Asset-to-Debt ratio is greater than Z."
*   **Runway Proof:** "Liquid cash covers $N months of average expenses."

### Selective Disclosure:
The Holder can choose to "redact" specific institutions or account types from the calculation before the attestation is signed.

---

## 4. The SVP Attestation Schema

An SVP attestation is a signed JSON-LD sub-set of the user's Financial Passport.

```json
{
  "@context": "https://strata.platform/schemas/svp/v1",
  "type": "FinancialAttestation",
  "id": "urn:uuid:770e8400-e29b-41d4-a716-446655440000",
  "issued_at": "2026-02-16T14:30:00Z",
  "expires_at": "2026-02-17T14:30:00Z",
  "issuer": "strata_platform_v1",
  "credential": {
    "claim_type": "THRESHOLD_PROOF_OF_FUNDS",
    "statement": "Liquid assets are greater than or equal to $50,000.00 USD",
    "verification_status": "VERIFIED",
    "as_of": "2026-02-16T10:00:00Z",
    "data_freshness_hours": 4
  },
  "signature": {
    "type": "Ed25519Signature2020",
    "proof_value": "..."
  }
}
```

---

## 5. Verification Mechanics

### v0.1: The Public Verification Portal
1.  Holder sends the JSON attestation (or a link to it) to the Verifier.
2.  Verifier uploads the file to `clearmoney.com/verify`.
3.  Strata validates the signature and the `expires_at` timestamp.
4.  The portal displays a **Green Checkmark** with the claim statement.

### v0.2: API-to-API Verification
1.  Verifier integrates the Strata SDK.
2.  Verifier calls `Strata.verify(attestation_payload)`.
3.  The SDK returns a cryptographically verified result instantly.

---

## 6. Security and Trust

### Anti-Tamper Measures:
*   **Canonical Serialization:** Claims are hashed using JCS (JSON Canonicalization Scheme) before signing.
*   **Short TTL:** Attestations are typically issued with a 24-hour expiration to ensure data reflects current market reality.
*   **Revocation Registry:** If a user revokes their bank link, all associated active attestations are invalidated in real-time.

### Fraud Prevention:
Strata includes **"Liveness Metadata"** in every attestation, indicating how recently the underlying bank APIs were successfully queried.

---

## 7. Evolution: Toward True Zero-Knowledge

*   **Current (SVP-1):** Strata sees the data and signs a "Trusted Claim." (The user trusts Strata, the Verifier trusts Strata).
*   **Future (SVP-2):** Use **zk-SNARKs** to generate a proof on the user's device (using the Financial Passport as a private input). 
    *   In this Era, Strata signs the *data* (the passport), and the user generates the *proof* (the claim). 
    *   **Result:** Even if Strata's servers are compromised, the user's specific claim logic remains sovereign and private.

---

## 8. Strategic Value
By standardizing financial verification, Strata becomes the "Source of Truth" for the digital economy. We replace the 100-year-old "Bank Statement" with a 1-second "Digital Handshake."
