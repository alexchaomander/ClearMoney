# Strata API

FastAPI-based backend for the Strata financial data platform. Provides investment account connectivity via SnapTrade, portfolio management, and data aggregation.

## Features

- **Investment Account Connectivity**: Connect brokerage accounts via SnapTrade
- **Portfolio Management**: Track holdings, balances, and allocations across accounts
- **Transaction History**: Investment transaction tracking with pagination and filtering
- **Portfolio Snapshots**: Daily net worth snapshots for historical tracking
- **Background Jobs**: Automatic connection syncing and snapshot creation
- **Multi-Provider Architecture**: Extensible provider system for future integrations
- **Async PostgreSQL**: High-performance async database operations with SQLAlchemy 2.0

## Quick Start

### Prerequisites

- Python 3.11+
- PostgreSQL (or SQLite for development)
- [uv](https://github.com/astral-sh/uv) for dependency management

### Setup

```bash
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

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `STRATA_DATABASE_URL` | PostgreSQL connection string | Yes |
| `STRATA_CREDENTIALS_ENCRYPTION_KEY` | Fernet key for encrypting credentials | Yes |
| `STRATA_SNAPTRADE_CLIENT_ID` | SnapTrade API client ID | For SnapTrade |
| `STRATA_SNAPTRADE_CONSUMER_KEY` | SnapTrade API consumer key | For SnapTrade |
| `STRATA_ENABLE_BACKGROUND_JOBS` | Enable background sync/snapshot jobs (default: `true`) | No |
| `STRATA_SYNC_INTERVAL_SECONDS` | Seconds between connection sync runs (default: `3600`) | No |
| `STRATA_SYNC_STALE_MINUTES` | Minutes before a connection is considered stale (default: `60`) | No |
| `STRATA_SNAPSHOT_INTERVAL_SECONDS` | Seconds between snapshot runs (default: `86400`) | No |

Generate an encryption key:
```bash
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

## API Endpoints

### Health
- `GET /api/v1/health` - Health check

### Institutions
- `GET /api/v1/institutions` - Search supported financial institutions
- `GET /api/v1/institutions/popular` - Get popular institutions

### Connections
- `POST /api/v1/connections/link` - Create SnapTrade link session
- `POST /api/v1/connections/callback` - Handle OAuth callback
- `GET /api/v1/connections` - List user's connections
- `DELETE /api/v1/connections/{id}` - Delete a connection
- `POST /api/v1/connections/{id}/sync` - Trigger manual sync

### Accounts
- `GET /api/v1/accounts` - List all accounts (cash, debt, investment)
- `GET /api/v1/accounts/investment` - List investment accounts
- `GET /api/v1/accounts/investment/{id}` - Get account with holdings

### Transactions
- `GET /api/v1/transactions` - List investment transactions (paginated)
  - Query params: `account_id`, `start_date`, `end_date`, `limit` (1-500, default 100), `offset` (default 0)

### Portfolio
- `GET /api/v1/portfolio/summary` - Portfolio summary with allocations
- `GET /api/v1/portfolio/holdings` - All holdings across accounts
- `GET /api/v1/portfolio/history` - Historical net worth from snapshots
  - Query params: `range` (`1M`, `3M`, `6M`, `1Y`, `ALL`; default `3M`)

## Data Models

### Core Models

| Model | Description |
|-------|-------------|
| `User` | User identity (linked to Clerk) |
| `Connection` | Provider connection with encrypted credentials |
| `Institution` | Financial institution (brokerage, bank) |
| `InvestmentAccount` | Investment account (401k, IRA, brokerage, etc.) |
| `Security` | Security/asset (stock, ETF, bond, crypto) |
| `Holding` | Position in a security within an account |
| `Transaction` | Investment transaction (buy, sell, dividend, etc.) |
| `PortfolioSnapshot` | Daily point-in-time net worth snapshot |
| `CashAccount` | Manual cash/checking/savings account |
| `DebtAccount` | Manual debt account (credit card, loan) |

### Account Types

- `brokerage` - Taxable brokerage account
- `ira` - Traditional IRA
- `roth_ira` - Roth IRA
- `401k` - 401(k) retirement account
- `403b` - 403(b) retirement account
- `hsa` - Health Savings Account
- `sep_ira` - SEP IRA
- `simple_ira` - SIMPLE IRA
- `pension` - Pension account
- `trust` - Trust account
- `other` - Other account type

### Security Types

- `stock` - Individual stock
- `etf` - Exchange-traded fund
- `mutual_fund` - Mutual fund
- `bond` - Bond
- `crypto` - Cryptocurrency
- `cash` - Cash or money market
- `option` - Options contract
- `other` - Other security type

### Transaction Types

- `buy` - Purchase of a security
- `sell` - Sale of a security
- `dividend` - Dividend payment
- `interest` - Interest payment
- `fee` - Fee charge
- `transfer` - Transfer between accounts
- `other` - Other transaction type

## Background Jobs

The API runs periodic background jobs when `STRATA_ENABLE_BACKGROUND_JOBS` is `true` (the default). Jobs are managed via the FastAPI lifespan and use `asyncio` tasks.

| Job | Default Interval | Description |
|-----|-----------------|-------------|
| `connection_sync` | Every 60 minutes | Syncs account data for connections that haven't been updated within `STRATA_SYNC_STALE_MINUTES` |
| `portfolio_snapshots` | Every 24 hours | Creates one `PortfolioSnapshot` per user per day recording net worth, investment, cash, and debt totals |

Each connection is synced in an isolated database session so that a failure for one connection does not affect others. Errors are recorded on the connection (`error_code`, `error_message`) and the connection status is set to `error`.

Set `STRATA_ENABLE_BACKGROUND_JOBS=false` to disable all background jobs (useful for testing or when running multiple instances).

## Provider Integration

The API uses an extensible provider system. Currently supported:

### SnapTrade

SnapTrade provides connectivity to 100+ brokerages including:
- Fidelity
- Charles Schwab
- Vanguard
- TD Ameritrade
- E*TRADE
- Robinhood
- Interactive Brokers

To add SnapTrade support, set `STRATA_SNAPTRADE_CLIENT_ID` and `STRATA_SNAPTRADE_CONSUMER_KEY` in your environment. The provider automatically handles:
- OAuth link session creation and callback
- Account discovery and sync
- Holdings and transaction retrieval
- Credential management (encrypted at rest)
- Transaction normalization (SnapTrade types mapped to standard `TransactionType` enum)

## Testing

```bash
# Run all tests
python -m pytest tests/ -v

# Run specific test file
python -m pytest tests/test_investment_models.py -v

# Run with coverage
python -m pytest tests/ --cov=app --cov-report=html
```

## Project Structure

```
app/
├── api/                 # API route handlers
│   ├── accounts.py      # Account endpoints
│   ├── connections.py   # Connection management
│   ├── deps.py          # Dependency injection
│   ├── health.py        # Health check
│   ├── institutions.py  # Institution search
│   ├── portfolio.py     # Portfolio aggregation & history
│   └── transactions.py  # Transaction listing with pagination
├── core/
│   └── config.py        # Settings management
├── db/
│   ├── base.py          # SQLAlchemy base
│   ├── session.py       # Database session
│   └── types.py         # Custom column types
├── models/              # SQLAlchemy models
│   ├── connection.py
│   ├── holding.py
│   ├── institution.py
│   ├── investment_account.py
│   ├── portfolio_snapshot.py
│   ├── security.py
│   ├── transaction.py
│   └── user.py
├── schemas/             # Pydantic schemas
│   ├── connection.py
│   ├── holding.py
│   ├── institution.py
│   ├── investment_account.py
│   ├── portfolio.py
│   ├── security.py
│   └── transaction.py
├── services/
│   ├── connection_sync.py      # Account/holdings/transaction sync
│   ├── portfolio_metrics.py    # Shared portfolio calculation helpers
│   ├── portfolio_snapshots.py  # Daily snapshot creation
│   ├── jobs/
│   │   └── background.py       # Periodic background job runner
│   └── providers/              # Data provider adapters
│       ├── base.py             # Abstract base provider
│       └── snaptrade.py        # SnapTrade implementation
└── main.py              # FastAPI application
```

## Authentication

The API expects a `x-clerk-user-id` header for authenticated endpoints. This should be set by your authentication middleware after validating the Clerk session.

```bash
curl -H "x-clerk-user-id: user_abc123" http://localhost:8000/api/v1/accounts
```
