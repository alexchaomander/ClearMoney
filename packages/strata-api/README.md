# Strata API

FastAPI-based backend for the Strata financial data platform. Provides investment account connectivity via SnapTrade, portfolio management, and data aggregation.

## Features

- **Investment Account Connectivity**: Connect brokerage accounts via SnapTrade
- **Banking Connectivity**: Connect bank accounts via Plaid for transaction data and spending analysis
- **Portfolio Management**: Track holdings, balances, and allocations across accounts
- **Transaction History**: Investment and bank transaction tracking with pagination and filtering
- **Spending Analysis**: Automatic spending categorization and monthly breakdowns from linked bank data
- **Portfolio Snapshots**: Daily net worth snapshots for historical tracking
- **Financial Advisor**: AI-powered financial advice with memory and personalized context
- **Background Jobs**: Automatic connection syncing and snapshot creation
- **Multi-Provider Architecture**: Extensible provider system for investments (SnapTrade) and banking (Plaid)
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
| `STRATA_PLAID_CLIENT_ID` | Plaid API client ID | For Plaid |
| `STRATA_PLAID_SECRET` | Plaid API secret | For Plaid |
| `STRATA_PLAID_ENVIRONMENT` | Plaid environment: `sandbox`, `development`, or `production` (default: `sandbox`) | No |
| `STRATA_ENABLE_BACKGROUND_JOBS` | Enable background sync/snapshot jobs (default: `true`) | No |
| `STRATA_SYNC_INTERVAL_SECONDS` | Seconds between connection sync runs (default: `3600`) | No |
| `STRATA_SYNC_STALE_MINUTES` | Minutes before a connection is considered stale (default: `60`) | No |
| `STRATA_SNAPSHOT_INTERVAL_SECONDS` | Seconds between snapshot runs (default: `86400`) | No |
| `STRATA_BANKING_HISTORY_DAYS` | Days of transaction history to fetch on initial bank sync (default: `730`) | No |
| `STRATA_CORS_ALLOW_ORIGINS` | Comma-separated list of allowed CORS origins (default: `http://localhost:3000,http://127.0.0.1:3000`) | No |
| `STRATA_CORS_ALLOW_METHODS` | Comma-separated allowed CORS methods (default: `GET,POST,PUT,PATCH,DELETE,OPTIONS`) | No |
| `STRATA_CORS_ALLOW_HEADERS` | Comma-separated allowed CORS headers | No |
| `STRATA_CORS_ALLOW_CREDENTIALS` | Enable credentials in CORS responses (default: `true`) | No |

> Note: when `STRATA_CORS_ALLOW_CREDENTIALS=true`, `STRATA_CORS_ALLOW_ORIGINS` must not contain `*`.

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

### Financial Memory
- `GET /api/v1/memory` - Get user's financial profile
- `PATCH /api/v1/memory` - Update financial profile
- `GET /api/v1/memory/events` - Get change history
- `POST /api/v1/memory/derive` - Auto-populate from accounts

### Portfolio
- `GET /api/v1/portfolio/summary` - Portfolio summary with allocations
- `GET /api/v1/portfolio/holdings` - All holdings across accounts
- `GET /api/v1/portfolio/history` - Historical net worth from snapshots
  - Query params: `range` (`1M`, `3M`, `6M`, `1Y`, `ALL`; default `3M`)

### Banking (Plaid)
- `POST /api/v1/banking/link` - Create Plaid Link token for initializing Plaid Link
- `POST /api/v1/banking/callback` - Handle Plaid Link completion (exchange public_token)
- `GET /api/v1/banking/accounts` - List bank accounts (linked and manual)
  - Query params: `include_manual` (default `true`)
- `GET /api/v1/banking/transactions` - List bank transactions with filtering
  - Query params: `account_id`, `start_date`, `end_date`, `category`, `page` (default 1), `page_size` (1-500, default 50)
- `GET /api/v1/banking/spending-summary` - Get spending breakdown by category
  - Query params: `months` (1-24, default 3)
- `POST /api/v1/banking/{connection_id}/sync` - Trigger manual sync for a banking connection
- `DELETE /api/v1/banking/{connection_id}` - Delete a banking connection and all associated data

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
| `FinancialMemory` | User financial profile and goals (long-term memory) |
| `MemoryEvent` | Audit log of changes to financial memory |
| `CashAccount` | Cash/checking/savings account (manual or linked via Plaid) |
| `DebtAccount` | Manual debt account (credit card, loan) |
| `BankTransaction` | Bank transaction from linked Plaid accounts |

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

### Plaid (Banking)

Plaid provides connectivity to 12,000+ financial institutions for banking data including:
- Checking and savings accounts
- Transaction history with automatic categorization
- Real-time balance information

To add Plaid support, set `STRATA_PLAID_CLIENT_ID` and `STRATA_PLAID_SECRET` in your environment. The provider automatically handles:
- Plaid Link token creation for secure client-side authentication
- Public token exchange after user authorization
- Account discovery and balance sync
- Transaction sync with Plaid's automatic categorization
- Spending derivation to populate `FinancialMemory.spending_categories_monthly`
- Credential management (encrypted at rest)

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
│   ├── banking.py       # Banking/Plaid endpoints
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
│   ├── bank_transaction.py
│   ├── cash_account.py
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
│   ├── banking_sync.py         # Bank account/transaction sync
│   ├── connection_sync.py      # Investment account/holdings/transaction sync
│   ├── portfolio_metrics.py    # Shared portfolio calculation helpers
│   ├── portfolio_snapshots.py  # Daily snapshot creation
│   ├── spending_derivation.py  # Derive spending categories from transactions
│   ├── jobs/
│   │   └── background.py       # Periodic background job runner
│   └── providers/              # Data provider adapters
│       ├── base.py             # Abstract base provider (investments)
│       ├── base_banking.py     # Abstract base provider (banking)
│       ├── plaid.py            # Plaid implementation (banking)
│       └── snaptrade.py        # SnapTrade implementation (investments)
└── main.py              # FastAPI application
```

## Authentication

The API expects a `x-clerk-user-id` header for authenticated endpoints. This should be set by your authentication middleware after validating the Clerk session.

```bash
curl -H "x-clerk-user-id: user_abc123" http://localhost:8000/api/v1/accounts
```
