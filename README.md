# ClearMoney

ClearMoney is an institutional-grade financial lab and advisory platform designed for founders and individuals who demand radical transparency. It provides high-fidelity analysis, automated financial planning, and proactive intelligence driven by real-time data.

**Status:** Public Beta (v0.1.1.0)

## Key Features

### 1. Mini-Product Flywheel (Viral Tools)
Radically transparent, standalone calculators designed for immediate utility without a long onboarding process:
*   **Shot #1: Founder Runway**: Combines personal and company cash to find your true "Default Alive" date.
*   **Shot #3: AI Tax Shield Audit**: Instant document-upload audit to find missing tax shields before April 15.
*   **Public Decision Traces**: Every tool includes a sanitized "Show the Math" lineage, proving the deterministic logic behind every result.

### 2. The Financial Advisor (AI Agent)
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

### Option A: One-Click Local Setup (Recommended)

ClearMoney includes a `dev.sh` script that automates environment setup, dependency installation, and database migrations for a purely local (non-Docker) experience.

```bash
# Clone the repo and run the launch script
./dev.sh
```

This will:
- Check for prerequisites (`pnpm`, `uv`, `Python 3.11+`).
- Create `.env` and `.env.local` from examples if missing.
- Install JS and Python dependencies.
- Run migrations for a local SQLite database (`strata.db`).
- Start both the API and Web dev servers.

### Option B: Docker Setup

Useful if you prefer running PostgreSQL and Redis in containers:

```bash
# Start backend services (PostgreSQL + Redis + API)
docker compose up -d

# Start the frontend
pnpm dev
```

### Option C: Manual Setup

1.  **Install dependencies**: `pnpm install`
2.  **API Environment**: `cd packages/strata-api && cp .env.example .env && uv venv && uv pip install -e ".[dev]" && alembic upgrade head`
3.  **Web Environment**: `cd packages/web && cp .env.example .env.local`
4.  **Launch**: From root, run `pnpm dev`

### Beta Access

The app is gated behind an invite code. Set `NEXT_PUBLIC_BETA_CODES` in the web `.env.local` to a comma-separated list of codes, or use the default `CLEARMONEY2026` for local dev.

---

## Testing

### Backend
```bash
# Backend (229 tests)
cd packages/strata-api
uv run pytest
```

### Frontend (Vitest)
```bash
# Frontend Unit Tests (77 tests)
# Covers 11 core calculators: Debt Destroyer, FIRE, Emergency Fund, RSU Tax, 
# Roth vs Traditional, Total Comp, TPG Transparency, and more.
cd packages/web
pnpm test:run
```

### SDK
```bash
# SDK Unit Tests (46 tests)
cd packages/strata-sdk
pnpm test
```

---

## CI/CD

GitHub Actions runs on every push and PR:

| Job | What it does |
|-----|-------------|
| `web` | Vitest (77 tests), ESLint, Next.js build |
| `api` | pytest (229 tests) |
| `sdk` | Vitest (46 tests), SDK build |
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
