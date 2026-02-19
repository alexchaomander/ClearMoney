# ClearMoney

ClearMoney is an institutional-grade financial lab and advisory platform designed for founders and individuals who demand radical transparency. It provides high-fidelity analysis, automated financial planning, and proactive intelligence driven by real-time data.

**Status:** Private Beta

## Key Features

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
*   **War Room**: Queue, review, authorize, and execute financial actions with biometric approval.
*   **Switch Kit Generation**: Auto-generated ACATS/ACH transfer documents as PDFs.
*   **Action Lab**: An interactive preview of the autonomous agentic economy.

### 7. Privacy-Preserving Proofs (SVP)
Securely prove your financial standing without revealing sensitive data:
*   **Proof of Funds**: Generate a cryptographically signed attestation that your liquid assets exceed a specific threshold.
*   **Verification Portal**: A public gateway for landlords and lenders to verify Strata-signed claims instantly.
*   **Data Minimization**: Share only the "Green Checkmark," never your account numbers or history.

---

## Technical Architecture

ClearMoney is built as a high-performance monorepo:

| Package | Stack | Description |
|---------|-------|-------------|
| **[Strata API](./packages/strata-api)** | FastAPI, Python 3.11, SQLAlchemy Async, Pydantic v2 | Backend API with Plaid + SnapTrade integrations |
| **[Strata SDK](./packages/strata-sdk)** | TypeScript | Client library for the ClearMoney API |
| **ClearMoney Web** | Next.js 16, React 19, Tailwind CSS 4, Framer Motion | Frontend dashboard and editorial landing page |

**Infrastructure:**
*   **Auth**: Clerk (JWT with PEM key validation in production, header bypass in dev)
*   **Database**: PostgreSQL (SQLite for local dev)
*   **Cache/Sessions**: Redis (optional; in-memory fallback for dev)
*   **Error Tracking**: Sentry (frontend + backend)
*   **CI/CD**: GitHub Actions (lint, test, build, deploy)
*   **Deployment**: Railway (API) + Vercel (Web)
*   **Containerization**: Docker + docker-compose for local dev

---

## Getting Started

### Prerequisites
*   Node.js (v20+)
*   Python 3.11
*   [`uv`](https://github.com/astral-sh/uv) for Python package management
*   [`pnpm`](https://pnpm.io/) for JavaScript package management
*   Docker (optional, for containerized local dev)

### Option A: Docker (Recommended)

Spin up PostgreSQL, Redis, and the API with one command:

```bash
# Copy env files
cp packages/strata-api/.env.example packages/strata-api/.env
cp packages/web/.env.example packages/web/.env.local

# Start backend services (PostgreSQL + Redis + API)
docker compose up -d

# Install frontend dependencies and start dev server
pnpm install
cd packages/web
pnpm dev
```

The API will be available at `http://localhost:8000` and the web app at `http://localhost:3000`.

### Option B: Manual Setup

```bash
# Install root dependencies
pnpm install

# Setup API environment
cd packages/strata-api
cp .env.example .env
uv venv --python 3.11
source .venv/bin/activate
uv pip install -e ".[dev]"
alembic upgrade head

# Setup Web environment
cd ../web
cp .env.example .env.local

# Start development (from monorepo root)
cd ../..
pnpm dev
```

### Beta Access

The app is gated behind an invite code. Set `NEXT_PUBLIC_BETA_CODES` in the web `.env.local` to a comma-separated list of codes, or use the default `CLEARMONEY2026` for local dev.

---

## Testing

```bash
# Backend (155 tests)
cd packages/strata-api
source .venv/bin/activate
python -m pytest tests/ -v

# Frontend lint
cd packages/web
pnpm lint

# Frontend build
pnpm build
```

## CI/CD

GitHub Actions runs on every push and PR:

| Job | What it does |
|-----|-------------|
| `web` | ESLint, TypeScript type-check, Next.js build |
| `api` | pytest (155 tests) |
| `deploy-api` | Deploy to Railway (main branch only) |
| `deploy-web` | Deploy to Vercel (main branch only) |

---

## Documentation
*   [Roadmap](./ROADMAP.md) — Strategic vision, competitive positioning, phased plan
*   [Implementation Plan](./IMPLEMENTATION_PLAN.md) — Engineering execution plan with task breakdowns
*   [Brand Guide](./BRANDING.md) — Voice, visual identity, messaging framework
*   [Design System](./DESIGN_IMPLEMENTATION.md) — Strata UI/UX patterns and components
*   [API Reference](./packages/strata-api/README.md) — Endpoints, models, environment variables
*   [Action Layer Vision](./docs/vision/the-action-layer.md)
*   [Action Layer Technical Spec](./docs/platform/strata-action-layer-spec.md)
*   [Financial Portability Protocol (FPP)](./docs/platform/financial-portability-protocol.md)
*   [Data Model](./docs/platform/data-model.md)

## License
Internal Use Only.
