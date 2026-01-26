# Context Graph API — Investment-Focused MVP Implementation Prompt

**Date:** January 2026
**Purpose:** Implementation prompt for a coding agent to build the investment-focused MVP

---

**Role:** You are a backend engineer implementing the Context Graph API, a multi-tenant financial connectivity platform focused on **investment accounts** (brokerages, IRAs, 401ks).

**Strategic Context:** This MVP prioritizes investment data over banking data because:
1. Direct brokerage APIs are available (free) — banks don't offer this
2. Lower aggregator costs via SnapTrade (investment-specialized)
3. Higher-value use cases (tax optimization, asset allocation)
4. Less competitive market positioning

**Tech Stack (per project conventions in CLAUDE.md):**
- **Backend:** FastAPI (Python 3.11)
- **Database:** PostgreSQL 15+
- **Environment:** Use `uv` for virtual environment management
- **ORM:** SQLAlchemy with async support
- **Authentication:** JWT tokens + API keys
- **Deployment:** Docker-ready

---

## Reference Documentation (READ THESE FIRST)

| Document | Location | Purpose |
|----------|----------|---------|
| **OpenAPI Spec** | `docs/platform/openapi.yaml` | API contract (adapt for investments) |
| **Data Model** | `docs/platform/schema.sql` | Base schema (extend for investments) |
| **Provider Interface** | `docs/platform/provider-interface.md` | Abstraction pattern |
| **Provider Routing** | `docs/platform/provider-routing.md` | Multi-provider routing logic |
| **Consent & Vault** | `docs/platform/consent-and-vault.md` | Token encryption, consent ledger |
| **Decision Traces** | `docs/platform/context-graph-events.md` | Explainable recommendations |
| **PRD** | `docs/platform/PRD.md` | Product requirements |
| **Provider Research** | `docs/research/financial-data-providers-analysis.md` | Provider comparison |
| **Investment MVP Analysis** | `docs/research/investment-focused-mvp-analysis.md` | Investment strategy details |

---

## Implementation Scope: Investment-Focused MVP

**In Scope:**
1. **Direct brokerage integrations** — Schwab API (free), with stubs for IBKR/Alpaca
2. **SnapTrade integration** — For brokerages without direct APIs (Fidelity, Vanguard, etc.)
3. **Investment data model** — Accounts, holdings, positions, cost basis, tax lots
4. **Asset allocation analysis** — Category breakdown, concentration warnings
5. **Basic recommendations** — Rebalancing alerts, tax-loss harvesting candidates
6. **Decision trace system** — Explain why recommendations are made
7. **Provider routing** — Route to direct API when available, otherwise SnapTrade

**Out of Scope (Phase 2+):**
- Bank account transactions (add Plaid later)
- Trading execution (read-only for MVP)
- Real-time price updates (daily refresh is fine)
- Mobile SDKs

---

## Project Structure

```
platform/
├── app/
│   ├── main.py                 # FastAPI app entry point
│   ├── config.py               # Settings and environment config
│   ├── dependencies.py         # Dependency injection
│   │
│   ├── api/
│   │   ├── v1/
│   │   │   ├── apps.py         # App registration (admin)
│   │   │   ├── users.py        # User management
│   │   │   ├── connections.py  # Brokerage connections
│   │   │   ├── accounts.py     # Investment accounts
│   │   │   ├── holdings.py     # Current holdings/positions
│   │   │   ├── performance.py  # Portfolio performance
│   │   │   ├── allocation.py   # Asset allocation analysis
│   │   │   ├── tax.py          # Tax lots, cost basis, harvesting
│   │   │   ├── recommendations.py # Investment recommendations
│   │   │   ├── consents.py     # Consent management
│   │   │   ├── webhooks.py     # Webhook subscriptions
│   │   │   └── institutions.py # Supported brokerages
│   │   └── router.py
│   │
│   ├── models/
│   │   ├── database.py         # SQLAlchemy models
│   │   └── schemas.py          # Pydantic models
│   │
│   ├── services/
│   │   ├── providers/
│   │   │   ├── base.py         # Abstract provider interface
│   │   │   ├── schwab.py       # Direct Schwab API
│   │   │   ├── snaptrade.py    # SnapTrade aggregator
│   │   │   ├── mock.py         # Mock provider for testing
│   │   │   └── router.py       # Provider routing logic
│   │   ├── sync_service.py     # Data sync orchestration
│   │   ├── allocation_service.py   # Asset allocation calculations
│   │   ├── tax_service.py      # Tax-loss harvesting logic
│   │   ├── recommendation_engine.py # Investment recommendations
│   │   ├── consent_service.py  # Consent management
│   │   ├── token_vault.py      # Encrypted token storage
│   │   └── webhook_service.py  # Outbound webhooks
│   │
│   ├── core/
│   │   ├── auth.py             # API key + JWT validation
│   │   ├── security.py         # Encryption utilities
│   │   ├── exceptions.py       # Custom exceptions
│   │   └── logging.py          # Structured logging
│   │
│   └── workers/
│       ├── sync_worker.py      # Background sync jobs
│       └── webhook_worker.py   # Webhook delivery
│
├── migrations/
│   └── versions/
│
├── tests/
│   ├── conftest.py
│   ├── test_api/
│   ├── test_services/
│   └── test_integration/
│
├── scripts/
│   ├── seed_institutions.py    # Seed supported brokerages
│   └── generate_test_data.py   # Generate test portfolios
│
├── Dockerfile
├── docker-compose.yml
├── pyproject.toml
├── alembic.ini
└── README.md
```

---

## Data Model (Investment-Focused)

Create these tables in addition to the base schema:

```sql
-- Enums for investment accounts
CREATE TYPE investment_account_type AS ENUM (
    'brokerage',           -- Taxable brokerage
    'ira_traditional',     -- Traditional IRA
    'ira_roth',           -- Roth IRA
    'ira_sep',            -- SEP IRA
    'ira_simple',         -- SIMPLE IRA
    '401k',               -- Traditional 401k
    '401k_roth',          -- Roth 401k
    '403b',               -- 403b
    '457b',               -- 457b
    '529',                -- 529 education savings
    'hsa',                -- Health savings account
    'pension',            -- Pension
    'trust',              -- Trust account
    'custodial',          -- Custodial (UGMA/UTMA)
    'other'
);

CREATE TYPE asset_class AS ENUM (
    'us_equity',
    'international_equity',
    'emerging_markets',
    'fixed_income',
    'cash',
    'real_estate',
    'commodities',
    'crypto',
    'alternatives',
    'other'
);

CREATE TYPE tax_term AS ENUM ('short', 'long');

CREATE TYPE transaction_type AS ENUM (
    'buy',
    'sell',
    'dividend',
    'interest',
    'transfer_in',
    'transfer_out',
    'fee',
    'tax',
    'split',
    'merger',
    'spinoff',
    'other'
);

-- Investment accounts (extends base accounts table)
CREATE TABLE investment_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    investment_type investment_account_type NOT NULL,
    is_tax_advantaged BOOLEAN NOT NULL DEFAULT false,
    contribution_limit DECIMAL(12, 2),          -- Annual limit if applicable
    contribution_ytd DECIMAL(12, 2),            -- Year-to-date contributions
    employer_match_percent DECIMAL(5, 2),       -- For 401k
    vesting_percent DECIMAL(5, 2),              -- Vested percentage
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(account_id)
);

-- Holdings (current positions)
CREATE TABLE holdings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,

    -- Security identifiers (at least one required)
    symbol VARCHAR(20),                         -- Ticker symbol
    cusip VARCHAR(9),                           -- CUSIP
    isin VARCHAR(12),                           -- ISIN
    figi VARCHAR(12),                           -- OpenFIGI

    -- Security info
    name VARCHAR(255) NOT NULL,
    security_type VARCHAR(50),                  -- stock, etf, mutual_fund, bond, option, crypto
    asset_class asset_class,

    -- Position data
    quantity DECIMAL(20, 8) NOT NULL,
    price DECIMAL(20, 8),                       -- Current price per share
    price_as_of TIMESTAMP WITH TIME ZONE,      -- When price was fetched
    market_value DECIMAL(20, 2),               -- quantity * price
    cost_basis DECIMAL(20, 2),                 -- Total cost basis
    unrealized_gain_loss DECIMAL(20, 2),       -- market_value - cost_basis
    unrealized_gain_loss_percent DECIMAL(8, 4),

    -- Metadata
    currency VARCHAR(3) DEFAULT 'USD',
    is_cash_equivalent BOOLEAN DEFAULT false,

    -- Provider tracking
    provider_security_id VARCHAR(255),         -- Provider's internal ID

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Ensure at least one security identifier is present
    CONSTRAINT holdings_has_identifier CHECK (
        symbol IS NOT NULL OR cusip IS NOT NULL OR isin IS NOT NULL OR figi IS NOT NULL
    )
);

CREATE INDEX idx_holdings_account ON holdings(account_id);
CREATE INDEX idx_holdings_symbol ON holdings(symbol);

-- Tax lots (for cost basis tracking)
CREATE TABLE tax_lots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    holding_id UUID NOT NULL REFERENCES holdings(id) ON DELETE CASCADE,

    acquired_date DATE NOT NULL,
    quantity DECIMAL(20, 8) NOT NULL,
    cost_per_share DECIMAL(20, 8) NOT NULL,
    total_cost DECIMAL(20, 2) NOT NULL,

    -- Tax classification
    term tax_term,                              -- short or long term
    days_held INTEGER,

    -- Wash sale tracking
    wash_sale_disallowed DECIMAL(20, 2),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_tax_lots_holding ON tax_lots(holding_id);
CREATE INDEX idx_tax_lots_acquired ON tax_lots(acquired_date);

-- Investment transactions
CREATE TABLE investment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,

    -- Transaction details
    transaction_type transaction_type NOT NULL,
    transaction_date DATE NOT NULL,
    settlement_date DATE,

    -- Security (null for cash transactions)
    symbol VARCHAR(20),
    name VARCHAR(255),

    -- Amounts
    quantity DECIMAL(20, 8),
    price DECIMAL(20, 8),
    amount DECIMAL(20, 2) NOT NULL,            -- Total transaction amount
    fees DECIMAL(12, 2) DEFAULT 0,

    -- Provider tracking
    provider_transaction_id VARCHAR(255),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_inv_txn_account ON investment_transactions(account_id);
CREATE INDEX idx_inv_txn_date ON investment_transactions(transaction_date);
CREATE INDEX idx_inv_txn_symbol ON investment_transactions(symbol);

-- Portfolio snapshots (for performance tracking)
CREATE TABLE portfolio_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    snapshot_date DATE NOT NULL,

    total_value DECIMAL(20, 2) NOT NULL,
    total_cost_basis DECIMAL(20, 2),
    total_gain_loss DECIMAL(20, 2),

    -- Breakdown by account type
    taxable_value DECIMAL(20, 2),
    tax_advantaged_value DECIMAL(20, 2),

    -- Breakdown by asset class (JSON for flexibility)
    allocation_breakdown JSONB,                -- {"us_equity": 0.60, "fixed_income": 0.30, ...}

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, snapshot_date)
);

CREATE INDEX idx_portfolio_user_date ON portfolio_snapshots(user_id, snapshot_date);

-- Investment recommendations
CREATE TABLE investment_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    recommendation_type VARCHAR(50) NOT NULL,  -- rebalance, tax_loss_harvest, concentration, contribution
    priority VARCHAR(20) NOT NULL,             -- high, medium, low
    status VARCHAR(20) DEFAULT 'active',       -- active, dismissed, completed

    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,

    -- Quantified impact
    estimated_benefit DECIMAL(20, 2),          -- Dollar value if applicable
    estimated_tax_savings DECIMAL(20, 2),

    -- Related entities
    related_holdings JSONB,                    -- Array of holding IDs
    related_accounts JSONB,                    -- Array of account IDs

    -- Decision trace
    trace_id UUID REFERENCES context_graph_events(id),

    -- Timing
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_rec_user ON investment_recommendations(user_id);
CREATE INDEX idx_rec_status ON investment_recommendations(status);
```

---

## Provider Implementation

### Abstract Interface

```python
from abc import ABC, abstractmethod
from typing import List, Optional
from datetime import datetime, date
from pydantic import BaseModel

class InvestmentAccount(BaseModel):
    id: str  # Internal ID for the account
    provider_account_id: str
    name: str
    account_type: str  # brokerage, ira_traditional, 401k, etc.
    investment_type: str  # Maps to investment_account_type enum
    balance: float
    currency: str = "USD"
    is_tax_advantaged: bool = False

class Holding(BaseModel):
    id: str  # Internal ID for the holding
    account_id: str  # Reference to parent account
    symbol: Optional[str]
    cusip: Optional[str]
    name: str
    quantity: float
    price: Optional[float]
    market_value: Optional[float]
    cost_basis: Optional[float]
    unrealized_gain_loss: Optional[float]  # market_value - cost_basis
    asset_class: Optional[str]
    security_type: Optional[str]

class TaxLot(BaseModel):
    symbol: str
    acquired_date: date
    quantity: float
    cost_per_share: float
    total_cost: float
    term: Optional[str]  # short, long

class InvestmentTransaction(BaseModel):
    transaction_id: str
    transaction_type: str
    transaction_date: date
    symbol: Optional[str]
    quantity: Optional[float]
    price: Optional[float]
    amount: float
    fees: float = 0


class InvestmentProvider(ABC):
    """Abstract interface for investment data providers."""

    @property
    @abstractmethod
    def provider_name(self) -> str:
        """Return provider identifier."""
        pass

    @abstractmethod
    async def create_link_token(
        self,
        user_id: str,
        redirect_uri: str
    ) -> dict:
        """Create a token to initiate account linking."""
        pass

    @abstractmethod
    async def exchange_token(
        self,
        public_token: str,
        user_id: str
    ) -> dict:
        """Exchange public token for access credentials."""
        pass

    @abstractmethod
    async def get_accounts(
        self,
        connection_id: str
    ) -> List[InvestmentAccount]:
        """Get all investment accounts for a connection."""
        pass

    @abstractmethod
    async def get_holdings(
        self,
        connection_id: str,
        account_id: Optional[str] = None
    ) -> List[Holding]:
        """Get current holdings. Optionally filter by account."""
        pass

    @abstractmethod
    async def get_transactions(
        self,
        connection_id: str,
        start_date: date,
        end_date: date,
        account_id: Optional[str] = None
    ) -> List[InvestmentTransaction]:
        """Get investment transactions for date range."""
        pass

    @abstractmethod
    async def get_cost_basis(
        self,
        connection_id: str,
        account_id: Optional[str] = None
    ) -> List[TaxLot]:
        """Get cost basis / tax lot information."""
        pass

    @abstractmethod
    async def refresh(
        self,
        connection_id: str
    ) -> dict:
        """Trigger a data refresh for the connection."""
        pass
```

### Schwab Provider (Direct API)

```python
import httpx
from typing import List, Optional
from datetime import date

class SchwabProvider(InvestmentProvider):
    """Direct integration with Charles Schwab API.

    Docs: https://developer.schwab.com/

    This is FREE with any Schwab brokerage account.
    """

    BASE_URL = "https://api.schwabapi.com"

    def __init__(self, client_id: str, client_secret: str):
        self.client_id = client_id
        self.client_secret = client_secret

    @property
    def provider_name(self) -> str:
        return "schwab"

    async def create_link_token(
        self,
        user_id: str,
        redirect_uri: str
    ) -> dict:
        """Schwab uses OAuth2 - return authorization URL."""
        auth_url = (
            f"https://api.schwabapi.com/v1/oauth/authorize"
            f"?client_id={self.client_id}"
            f"&redirect_uri={redirect_uri}"
            f"&response_type=code"
            f"&scope=readonly"
        )
        return {
            "link_type": "oauth",
            "authorization_url": auth_url,
            "state": user_id,  # Use for CSRF protection
        }

    async def exchange_token(
        self,
        authorization_code: str,
        user_id: str
    ) -> dict:
        """Exchange OAuth code for access/refresh tokens."""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.BASE_URL}/v1/oauth/token",
                data={
                    "grant_type": "authorization_code",
                    "code": authorization_code,
                    "client_id": self.client_id,
                    "client_secret": self.client_secret,
                },
            )
            response.raise_for_status()
            tokens = response.json()

            return {
                "access_token": tokens["access_token"],
                "refresh_token": tokens["refresh_token"],
                "expires_in": tokens["expires_in"],
            }

    async def get_accounts(
        self,
        connection_id: str
    ) -> List[InvestmentAccount]:
        """Fetch accounts from Schwab."""
        # Implementation would use stored access token
        # GET /trader/v1/accounts
        pass

    async def get_holdings(
        self,
        connection_id: str,
        account_id: Optional[str] = None
    ) -> List[Holding]:
        """Fetch holdings from Schwab."""
        # GET /trader/v1/accounts/{accountNumber}/positions
        pass

    # ... implement remaining methods
```

### SnapTrade Provider (Aggregator)

```python
import time
import hmac
import hashlib

class SnapTradeProvider(InvestmentProvider):
    """SnapTrade aggregator for brokerages without direct APIs.

    Docs: https://docs.snaptrade.com/

    Covers: Fidelity, Vanguard, Robinhood, Webull, and 20+ others.
    """

    BASE_URL = "https://api.snaptrade.com/api/v1"

    def __init__(self, client_id: str, consumer_key: str):
        self.client_id = client_id
        self.consumer_key = consumer_key

    @property
    def provider_name(self) -> str:
        return "snaptrade"

    async def create_link_token(
        self,
        user_id: str,
        redirect_uri: str
    ) -> dict:
        """Create SnapTrade connection link."""
        async with httpx.AsyncClient() as client:
            # First, register user with SnapTrade if needed
            # POST /snapTrade/registerUser

            # Then get redirect URI
            # POST /snapTrade/login
            response = await client.post(
                f"{self.BASE_URL}/snapTrade/login",
                headers=self._get_headers(),
                json={
                    "userId": user_id,
                    "userSecret": self._get_user_secret(user_id),
                    "broker": None,  # Let user choose
                    "immediateRedirect": True,
                    "customRedirect": redirect_uri,
                },
            )
            response.raise_for_status()
            data = response.json()

            return {
                "link_type": "redirect",
                "redirect_url": data["redirectURI"],
            }

    async def get_holdings(
        self,
        connection_id: str,
        account_id: Optional[str] = None
    ) -> List[Holding]:
        """Fetch holdings via SnapTrade."""
        # GET /holdings
        # SnapTrade returns normalized data with ticker symbols
        pass

    # ... implement remaining methods

    def _get_headers(self) -> dict:
        """Generate authenticated headers.

        Note: In production, import time, hmac, and hashlib at the top of the file.
        """
        timestamp = str(int(time.time()))
        signature = hmac.new(
            self.consumer_key.encode(),
            f"{self.client_id}{timestamp}".encode(),
            hashlib.sha256
        ).hexdigest()

        return {
            "Signature": signature,
            "Timestamp": timestamp,
            "clientId": self.client_id,
        }
```

### Provider Router

```python
from typing import Dict, Type

class ProviderRouter:
    """Routes requests to the appropriate provider based on institution."""

    # Institutions with free direct APIs
    DIRECT_API_INSTITUTIONS: Dict[str, Type[InvestmentProvider]] = {
        "schwab": SchwabProvider,
        "charles_schwab": SchwabProvider,
        "td_ameritrade": SchwabProvider,  # Migrated to Schwab
        # Future:
        # "interactive_brokers": IBKRProvider,
        # "alpaca": AlpacaProvider,
    }

    def __init__(
        self,
        schwab_provider: SchwabProvider,
        snaptrade_provider: SnapTradeProvider,
    ):
        self.schwab = schwab_provider
        self.snaptrade = snaptrade_provider

    def get_provider(self, institution_id: str) -> InvestmentProvider:
        """Get the appropriate provider for an institution.

        Routing logic:
        1. If institution has direct API → use it (free)
        2. Otherwise → use SnapTrade (paid per connection)
        """
        institution_lower = institution_id.lower().replace(" ", "_")

        if institution_lower in self.DIRECT_API_INSTITUTIONS:
            if institution_lower in ("schwab", "charles_schwab", "td_ameritrade"):
                return self.schwab
            # Add other direct providers here

        # Default to SnapTrade for everything else
        return self.snaptrade

    def is_direct_connection(self, institution_id: str) -> bool:
        """Check if institution uses direct API (for cost tracking)."""
        return institution_id.lower().replace(" ", "_") in self.DIRECT_API_INSTITUTIONS
```

---

## Recommendation Engine

```python
from typing import List
from datetime import date, timedelta
from decimal import Decimal

class InvestmentRecommendationEngine:
    """Generate investment recommendations with decision traces."""

    # Target allocation (simplified - should be configurable per user)
    DEFAULT_TARGET_ALLOCATION = {
        "us_equity": Decimal("0.50"),
        "international_equity": Decimal("0.20"),
        "fixed_income": Decimal("0.25"),
        "cash": Decimal("0.05"),
    }

    CONCENTRATION_THRESHOLD = Decimal("0.10")  # 10% in single holding
    TAX_LOSS_THRESHOLD = Decimal("-1000")      # $1000 loss minimum

    async def generate_recommendations(
        self,
        user_id: str,
        holdings: List[Holding],
        accounts: List[InvestmentAccount],
    ) -> List[InvestmentRecommendation]:
        """Generate all applicable recommendations."""
        recommendations = []

        # 1. Check for concentration risk
        concentration_recs = await self._check_concentration(holdings)
        recommendations.extend(concentration_recs)

        # 2. Check asset allocation drift
        allocation_recs = await self._check_allocation_drift(holdings)
        recommendations.extend(allocation_recs)

        # 3. Check tax-loss harvesting opportunities (taxable accounts only)
        tax_recs = await self._check_tax_loss_harvesting(holdings, accounts)
        recommendations.extend(tax_recs)

        # 4. Check 401k contribution optimization
        contribution_recs = await self._check_contribution_optimization(accounts)
        recommendations.extend(contribution_recs)

        return recommendations

    async def _check_tax_loss_harvesting(
        self,
        holdings: List[Holding],
        accounts: List[InvestmentAccount],
    ) -> List[InvestmentRecommendation]:
        """Identify tax-loss harvesting candidates in taxable accounts."""
        recommendations = []

        # Filter to taxable accounts only
        taxable_account_ids = {
            a.id for a in accounts
            if a.investment_type == "brokerage"
        }

        for holding in holdings:
            if holding.account_id not in taxable_account_ids:
                continue

            if holding.unrealized_gain_loss and holding.unrealized_gain_loss < self.TAX_LOSS_THRESHOLD:
                # Create recommendation with decision trace
                rec = InvestmentRecommendation(
                    recommendation_type="tax_loss_harvest",
                    priority="medium",
                    title=f"Tax-loss harvesting opportunity: {holding.symbol}",
                    description=(
                        f"{holding.symbol} has an unrealized loss of "
                        f"${abs(holding.unrealized_gain_loss):,.2f}. "
                        f"Consider selling to realize the loss for tax purposes, "
                        f"then buying a similar (but not identical) security."
                    ),
                    estimated_tax_savings=abs(holding.unrealized_gain_loss) * Decimal("0.25"),
                    related_holdings=[holding.id],
                    # Decision trace captures the reasoning
                    trace_inputs={
                        "holding_symbol": holding.symbol,
                        "unrealized_loss": float(holding.unrealized_gain_loss),
                        "threshold": float(self.TAX_LOSS_THRESHOLD),
                        "account_type": "taxable",
                    },
                    trace_rules=["TAX_LOSS_HARVEST_THRESHOLD", "TAXABLE_ACCOUNT_ONLY"],
                )
                recommendations.append(rec)

        return recommendations

    # ... implement other recommendation checks
```

---

## Implementation Order

**Week 1-2: Foundation**
1. Set up project structure
2. Implement database models (investment-focused schema)
3. Create Alembic migrations
4. Implement authentication (API keys, JWT)
5. Build basic CRUD for apps and users

**Week 3-4: Provider Integration**
1. Implement abstract provider interface
2. Build mock provider for development
3. Implement SnapTrade integration
4. Implement Schwab direct API integration (OAuth flow)
5. Build provider router

**Week 5-6: Core Features**
1. Implement holdings sync and storage
2. Build asset allocation calculation service
3. Implement portfolio snapshot system
4. Build tax lot tracking
5. Create cost basis calculations

**Week 7-8: Recommendations & Polish**
1. Implement recommendation engine
2. Build decision trace storage
3. Create concentration/allocation alerts
4. Implement tax-loss harvesting detection
5. Write integration tests
6. Documentation

---

## Environment Variables

```bash
# Database
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/contextgraph

# Authentication
API_KEY_SECRET=<random-secret-for-hashing>
JWT_SECRET=<random-secret-for-jwt>
JWT_ALGORITHM=HS256

# Encryption (token vault)
ENCRYPTION_KEY=<32-byte-base64-encoded-key>

# Schwab (Direct API - FREE)
SCHWAB_CLIENT_ID=<from-developer.schwab.com>
SCHWAB_CLIENT_SECRET=<from-developer.schwab.com>

# SnapTrade (Aggregator)
SNAPTRADE_CLIENT_ID=<from-snaptrade>
SNAPTRADE_CONSUMER_KEY=<from-snaptrade>

# Webhooks
WEBHOOK_SIGNING_SECRET=<secret-for-signing-outbound-webhooks>
```

---

## Key Differences from Bank-Focused MVP

| Aspect | Bank-Focused | Investment-Focused |
|--------|--------------|-------------------|
| **Primary Data** | Transactions | Holdings & positions |
| **Provider** | Plaid | Schwab (direct) + SnapTrade |
| **Cost** | $30-65K/year | $15-30K/year (direct APIs free) |
| **Key Metrics** | Cash flow, spending | Net worth, allocation |
| **Recommendations** | Budgeting, debt payoff | Tax optimization, rebalancing |
| **Refresh Frequency** | Daily | Daily (real-time in Phase 2) |

---

## Testing Requirements

1. **Unit tests** for all services
2. **API tests** for all endpoints
3. **Integration tests:**
   - Full flow: App → User → Connection → Holdings → Recommendation
   - Provider routing: Verify direct vs aggregator selection
   - Tax calculations: Cost basis, wash sales, harvesting
4. **Mock providers** for all tests (no real API calls)

---

## Deliverables

1. Working FastAPI application with investment-focused endpoints
2. PostgreSQL schema with migrations
3. Mock provider + SnapTrade stub implementation
4. Schwab OAuth integration (documented, ready to enable)
5. Asset allocation and tax-loss harvesting logic
6. Decision trace system for recommendations
7. Comprehensive test suite
8. Docker Compose for local development
9. README with setup instructions

---

## Constraints

- **DO NOT** implement bank account/transaction features (Phase 2)
- **DO NOT** implement trading execution (read-only MVP)
- **DO** build the provider abstraction layer for future expansion
- **DO** implement Schwab OAuth flow (even if disabled initially)
- **DO** use SnapTrade mock/sandbox for development
- **DO** ensure all data is scoped by app_id (multi-tenancy)
- **DO** create decision traces for all recommendations
