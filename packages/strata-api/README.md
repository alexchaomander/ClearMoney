# Strata API

FastAPI-based backend for the Strata financial data platform. Provides investment account connectivity via SnapTrade, portfolio management, and data aggregation.

## Features

- **Investment Account Connectivity**: Connect brokerage accounts via SnapTrade
- **Portfolio Management**: Track holdings, balances, and allocations across accounts
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

### Portfolio
- `GET /api/v1/portfolio/summary` - Portfolio summary with allocations
- `GET /api/v1/portfolio/holdings` - All holdings across accounts

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

To add SnapTrade support, configure the environment variables and the provider will automatically handle:
- OAuth link session creation
- Account discovery and sync
- Holdings retrieval
- Credential management

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
│   └── portfolio.py     # Portfolio aggregation
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
│   ├── security.py
│   └── user.py
├── schemas/             # Pydantic schemas
│   ├── connection.py
│   ├── holding.py
│   ├── institution.py
│   ├── investment_account.py
│   ├── portfolio.py
│   └── security.py
├── services/
│   └── providers/       # Data provider adapters
│       ├── base.py      # Abstract base provider
│       └── snaptrade.py # SnapTrade implementation
└── main.py              # FastAPI application
```

## Authentication

The API expects a `x-clerk-user-id` header for authenticated endpoints. This should be set by your authentication middleware after validating the Clerk session.

```bash
curl -H "x-clerk-user-id: user_abc123" http://localhost:8000/api/v1/accounts
```
