# ClearMoney: Mini-Product Flywheel Strategy

**Objective:** Generate "undeniable" hard signals for VCs by launching a series of high-utility, low-cost financial tools that capture High-Intent Data (AUM, Document Trust, Action Intent).

---

## 1. The "Hard Signals" Hierarchy
Email signups are vanity. We will optimize our launches to collect:

| Signal | Metric | VC Narrative |
| :--- | :--- | :--- |
| **AUM Potential** | Estimated Net Worth of waitlist | "We have $1B+ in potential AUM on the waitlist." |
| **Trust Velocity** | % of users who upload a tax doc | "Users trust our 'Show the Math' brand with their PII." |
| **Action Intent** | % of users clicking "Execute Move" | "We aren't just an advisor; we are an execution engine." |
| **Unit Economics** | Tier selection (Free vs $29 vs $79) | "60% of signups are selecting the Founder Pro tier." |
| **Organic Viral** | Referrals per signup (K-Factor) | "Our CAC is near zero because founders share this." |

---

## 2. The Three "Shots on Goal" (30-Day Sprint)

### Shot #1: The Founder Runway & Burn Tester
*   **The Hook:** "Is your personal burn killing your startup? See your total runway (Personal + Company)."
*   **Target:** YC/Founder Slacks, X/Twitter (#buildinpublic).
*   **Conversion:** Intake form asking for Role, Net Worth, and Startup Stage.

### Shot #2: The Honest Card Optimizer (Broad)
*   **The Hook:** "TPG earns $500 per approval. We earn $0. Calculate your true 2025 points yield based on real math."
*   **Target:** r/PersonalFinance, r/CreditCards, HNW professionals.
*   **Conversion:** "Action Intent" button for ACATS/Switch Kits.

### Shot #3: The AI Tax Shield Audit
*   **The Hook:** "Did you miss these 3 tax shields? Upload your 2024 return for an AI audit."
*   **Target:** Founders, 1099s, HNW.
*   **Conversion:** **Document Upload** (The ultimate trust signal).

---

## 3. The Unified Intake System (The "Capture Engine")
Every mini-app must route through a shared **`UnifiedIntakeForm`**.

### The Flow:
1.  **Tool Interaction:** User gets 80% of the value for free.
2.  **The Reveal:** To see the final "Decision Trace" or "Action Plan," they must enter their email.
3.  **The Profile:** Post-email, we ask 3 "one-click" questions:
    *   "What's your approximate Net Worth?"
    *   "Which tier interests you most? (Free, $29, $79)"
    *   "Would you like to automate this move?"
4.  **The Waitlist:** User is assigned a position and a referral link.

---

## 4. Implementation Priorities
1.  **Backend:** Create a `/waitlist` endpoint that stores Email + Profile Data (Net Worth, Intent).
2.  **Frontend:** Build a reusable `UnifiedIntakeForm` component in `packages/web`.
3.  **Analytics:** Track "Execute Move" clicks as a specific event in the DB.
4.  **Mini-App #1:** Port the existing "Founder Operating Room" logic into a standalone landing page.
