# Strata API

FastAPI-based backend for the ClearMoney financial platform. Provides investment account connectivity via SnapTrade, banking via Plaid, AI-powered financial advice, action intent lifecycle, and portfolio management.

## Quick Start

### Option A: Docker (Recommended)

From the **monorepo root**:

```bash
cp packages/strata-api/.env.example packages/strata-api/.env
docker compose up -d
```

This starts PostgreSQL, Redis, and the API. The API runs at `http://localhost:8000` with auto-reload. Migrations run automatically on startup.

### Option B: Manual Setup

```bash
cd packages/strata-api

# Create virtual environment
uv venv --python 3.11
source .venv/bin/activate

# Install dependencies
uv pip install -e ".[dev]"

# Copy environment file and configure
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
alembic upgrade head

# Start development server
uvicorn app.main:app --reload --port 8000
```

For production, the Dockerfile uses gunicorn with uvicorn workers:

```bash
docker build -t strata-api .
docker run -p 8000:8000 --env-file .env strata-api
```

## Environment Variables

### Required

| Variable | Description |
|----------|-------------|
| `STRATA_DATABASE_URL` | Database connection string (`postgresql+asyncpg://...` for production, `sqlite+aiosqlite:///strata.db` for dev) |
| `STRATA_CREDENTIALS_ENCRYPTION_KEY` | Fernet key for encrypting provider credentials. Generate with: `python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"` |

### Authentication (Clerk)

| Variable | Description |
|----------|-------------|
| `STRATA_CLERK_SECRET_KEY` | Clerk secret key for server-side API calls |
| `STRATA_CLERK_PEM_PUBLIC_KEY` | Clerk PEM public key for JWT validation. **When unset, the API falls back to trusting the `X-Clerk-User-Id` header** (dev/testing only). A startup warning is logged in non-debug mode. |

### Data Providers

| Variable | Description |
|----------|-------------|
| `STRATA_SNAPTRADE_CLIENT_ID` | SnapTrade API client ID (brokerage connections) |
| `STRATA_SNAPTRADE_CONSUMER_KEY` | SnapTrade API consumer key |
| `STRATA_PLAID_CLIENT_ID` | Plaid API client ID (banking connections) |
| `STRATA_PLAID_SECRET` | Plaid API secret |
| `STRATA_PLAID_ENVIRONMENT` | `sandbox`, `development`, or `production` (default: `sandbox`) |
| `STRATA_ANTHROPIC_API_KEY` | Anthropic API key for the AI advisor |

### Infrastructure (Optional)

| Variable | Description | Default |
|----------|-------------|---------|
| `STRATA_REDIS_URL` | Redis URL for SnapTrade session persistence. Falls back to in-memory store when unset. | _(empty)_ |
| `STRATA_SENTRY_DSN` | Sentry DSN for error tracking. Disabled when unset. | _(empty)_ |
| `STRATA_DEBUG` | Enable debug mode (suppresses PEM key warning, enables verbose logging) | `false` |
| `STRATA_DATABASE_ECHO` | Echo SQL queries to stdout | `false` |

### CORS

| Variable | Description | Default |
|----------|-------------|---------|
| `STRATA_CORS_ALLOW_ORIGINS` | Comma-separated allowed origins | `http://localhost:3000,http://127.0.0.1:3000` |
| `STRATA_CORS_ALLOW_METHODS` | Comma-separated allowed methods | `GET,POST,PUT,PATCH,DELETE,OPTIONS` |
| `STRATA_CORS_ALLOW_CREDENTIALS` | Enable credentials in CORS responses | `true` |

> When `STRATA_CORS_ALLOW_CREDENTIALS=true`, `STRATA_CORS_ALLOW_ORIGINS` must not contain `*`.

### Background Jobs

| Variable | Description | Default |
|----------|-------------|---------|
| `STRATA_ENABLE_BACKGROUND_JOBS` | Enable periodic sync and snapshot jobs | `true` |
| `STRATA_SYNC_INTERVAL_SECONDS` | Seconds between connection sync runs | `3600` |
| `STRATA_SYNC_STALE_MINUTES` | Minutes before a connection is considered stale | `60` |
| `STRATA_SNAPSHOT_INTERVAL_SECONDS` | Seconds between portfolio snapshot runs | `86400` |

## API Endpoints

All endpoints are prefixed with `/api/v1`. Full OpenAPI docs are available at `/docs` when running.

### Core

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Health check |

### Connections & Institutions

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/institutions` | Search supported financial institutions |
| `GET` | `/institutions/popular` | Get popular institutions |
| `POST` | `/connections/link` | Create SnapTrade link session |
| `POST` | `/connections/callback` | Handle OAuth callback |
| `GET` | `/connections` | List user's connections |
| `DELETE` | `/connections/{id}` | Delete a connection |
| `POST` | `/connections/{id}/sync` | Trigger manual sync |

### Accounts

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/accounts` | List all accounts (cash, debt, investment) |
| `GET` | `/accounts/investment` | List investment accounts |
| `GET` | `/accounts/investment/{id}` | Get account with holdings |
| `POST` | `/accounts/cash` | Create manual cash account |
| `POST` | `/accounts/debt` | Create manual debt account |

### Banking (Plaid)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/banking/link` | Create Plaid Link token |
| `POST` | `/banking/callback` | Handle Plaid Link completion |
| `GET` | `/banking/accounts` | List bank accounts |
| `GET` | `/banking/transactions` | List bank transactions (paginated, filterable) |
| `GET` | `/banking/spending-summary` | Spending breakdown by category |

### Portfolio

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/portfolio/summary` | Portfolio summary with allocations |
| `GET` | `/portfolio/holdings` | All holdings across accounts |
| `GET` | `/portfolio/history` | Historical net worth from snapshots |

### Financial Memory

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/memory` | Get user's financial profile |
| `PATCH` | `/memory` | Update financial profile |
| `GET` | `/memory/events` | Get change history |
| `POST` | `/memory/derive` | Auto-populate from accounts |

### AI Advisor

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/advisor/chat` | Send message to AI advisor |
| `GET` | `/advisor/sessions` | List chat sessions |
| `GET` | `/advisor/sessions/{id}` | Get session with messages |

### Agent & Action Intents

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/agent/context` | Get financial context for agent |
| `GET` | `/agent/decision-traces` | List decision traces |
| `GET` | `/agent/audit-summary` | Audit summary (trace stats) |
| `POST` | `/agent/recommendations/{id}/execute` | Execute a recommendation |
| `GET` | `/agent/action-policy` | Get user's action policies |
| `POST` | `/action-intents` | Create action intent |
| `GET` | `/action-intents` | List action intents |

### Notifications

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/notifications` | List notifications |
| `PATCH` | `/notifications/{id}/read` | Mark notification as read |

### Data Portability & Sharing

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/portability/export` | Export financial passport (FPP) |
| `POST` | `/portability/proof-of-funds` | Generate proof of funds attestation |
| `POST` | `/share-reports` | Create shareable report |
| `GET` | `/share-reports/{id}` | Get shared report (public) |

### Consent Management

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/consents` | List user's data consents |
| `POST` | `/consents` | Grant a consent scope |
| `DELETE` | `/consents/{id}` | Revoke a consent scope |

## Testing

```bash
source .venv/bin/activate

# Run all tests (155 tests)
python -m pytest tests/ -v

# Run with coverage
python -m pytest tests/ --cov=app --cov-report=html
```

## Deployment

### Railway

The repo includes `railway.toml` with a healthcheck configured at `/api/v1/health`. Required GitHub secrets: `RAILWAY_TOKEN`.

### Docker

```bash
docker build -t strata-api .
docker run -p 8000:8000 --env-file .env.production strata-api
```

The entrypoint runs `alembic upgrade head` before starting gunicorn.

## Authentication

**Production:** The API validates Clerk JWTs using `STRATA_CLERK_PEM_PUBLIC_KEY`. Tokens are passed as `Authorization: Bearer <token>`.

**Development:** When the PEM key is not set, the API falls back to trusting the `X-Clerk-User-Id` header directly. This is for local development only.

```bash
# Development
curl -H "x-clerk-user-id: user_abc123" http://localhost:8000/api/v1/accounts

# Production (with JWT)
curl -H "Authorization: Bearer eyJ..." http://localhost:8000/api/v1/accounts
```
