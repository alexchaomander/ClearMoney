# ClearMoney

ClearMoney is an institutional-grade financial lab and advisory platform designed for founders and individuals who demand radical transparency. It provides high-fidelity analysis, automated financial planning, and proactive intelligence driven by real-time data.

## 🚀 Key Features

### 1. The Financial Advisor (AI Agent)
A context-aware AI powered by Claude that uses your live balances, holdings, and transactions to provide personalized, educational guidance across specialized skills:
*   **Retirement & Tax**: Probabilistic modeling and tax-loss harvesting alerts.
*   **Debt & Savings**: Automated snowball/avalanche planning and emergency fund monitoring.
*   **Security Gated**: All AI-suggested actions are filtered through a configurable policy engine.

### 2. Founder Operating Room
A specialized intelligence layer for startup founders:
*   **Commingling Detection**: Automatically flags personal spend on business accounts to protect the corporate veil.
*   **Runway & Burn**: Real-time visuals for both Personal and Entity (Business) runway.
*   **Subscription Audit**: Identifies recurring SaaS and service burn.
*   **Tax Shield**: Monitors 1099/K-1 income and estimates quarterly tax obligations.

### 3. Radical Transparency ("Show the Math")
*   **Metric Traces**: Every calculated number on the dashboard includes a "Trace" icon showing the raw data, formula, and confidence score.
*   **Independence Audits**: We prove our recommendations are unbiased by auditing them against affiliate payout data.
*   **Live Payout Disclosure**: Estimated affiliate network payouts for recommended products are disclosed upfront.

### 4. Advanced Financial Modeling
*   **Monte Carlo Simulations**: Probabilistic retirement success modeling using 1,000 market iterations.
*   **What-If Analysis**: Real-time override of assumptions (inflation, market return) to see ripples across your entire financial graph.

### 5. Privacy & Trust
*   **Vanish Mode**: Chat with the advisor in private sessions where no data is persisted.
*   **Redacted Sharing**: Securely share financial reports with PII, institutions, and exact balances redacted.

### 6. Strata Action Layer (Experimental)
The foundation for autonomous personal finance:
*   **Action Intents**: Standardized primitives for drafting financial actions (ACATS rollovers, ACH transfers).
*   **Capabilities Discovery**: Intelligent provider tagging to identify "Action-Ready" accounts.
*   **Action Lab**: An interactive preview of the autonomous agentic economy.

### 7. Privacy-Preserving Proofs (SVP)
Securely prove your financial standing without revealing sensitive data:
*   **Proof of Funds**: Generate a cryptographically signed attestation that your liquid assets exceed a specific threshold.
*   **Verification Portal**: A public gateway for landlords and lenders to verify Strata-signed claims instantly.
*   **Data Minimization**: Share only the "Green Checkmark," never your account numbers or history.

---

## 🛠 Technical Architecture

ClearMoney is built as a high-performance monorepo:

*   **[Strata API](./packages/strata-api)**: FastAPI (Python 3.11) backend with SQLAlchemy Async and Pydantic v2.
*   **[Strata SDK](./packages/strata-sdk)**: TypeScript client library for interacting with the ClearMoney ecosystem.
*   **ClearMoney Web**: Next.js 16.1 (React 19) frontend using Tailwind CSS 4, Framer Motion, and TanStack Query.

---

## 🚦 Getting Started

### Prerequisites
*   Node.js (v20+)
*   Python 3.11
*   `uv` for Python package management
*   `pnpm` for JavaScript package management

### Installation
```bash
# Install root dependencies
pnpm install

# Setup API environment
cd packages/strata-api
cp .env.example .env
uv venv
source .venv/bin/activate
uv pip install -r requirements.txt

# Setup Web environment
cd ../web
cp .env.example .env.local
```

### Development
```bash
# Start all packages in parallel
pnpm dev
```

---

## 📜 Documentation
*   [The Action Layer Vision](./docs/vision/the-action-layer.md)
*   [Action Layer Technical Spec](./docs/platform/strata-action-layer-spec.md)
*   [Financial Portability Protocol (FPP)](./docs/platform/financial-portability-protocol.md)
*   [Implementation Roadmap](./IMPLEMENTATION_PLAN.md)
*   [Agent Guardrails](./docs/platform/PRD.md)
*   [Data Model](./docs/platform/data-model.md)

## 🛡 License
Internal Use Only.
