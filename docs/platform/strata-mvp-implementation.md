# Strata Platform + ClearMoney MVP Implementation Spec

**Version:** 1.0
**Date:** January 2026
**Purpose:** Complete implementation specification for YC Demo Day MVP

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Architecture Overview](#2-architecture-overview)
3. [Monorepo Structure](#3-monorepo-structure)
4. [Strata API](#4-strata-api)
5. [Strata SDK](#5-strata-sdk)
6. [ClearMoney Web App](#6-clearmoney-web-app)
7. [Database Schema](#7-database-schema)
8. [API Contracts](#8-api-contracts)
9. [UI/UX Specifications](#9-uiux-specifications)
10. [Demo Script](#10-demo-script)
11. [Implementation Phases](#11-implementation-phases)

---

## 1. Executive Summary

### What We're Building

**Strata** is an independent financial data platform that:
- Connects to brokerage accounts (via SnapTrade)
- Accepts manual entry for banking, debts, income
- Builds a unified "context graph" of a user's financial life
- Generates actionable recommendations with explainable decision traces

**ClearMoney** is a consumer app built on Strata that:
- Provides a dashboard showing complete financial context
- Offers "smart" calculators that auto-populate from connected data
- Displays AI-powered recommendations with full transparency

### The Demo Day "Wow" Moment

> "Watch this calculator transform from dumb to intelligent when we connect it to Strata."

Before: Manual entry, isolated tool
After: Auto-populated, cross-domain insights, explainable recommendations

### MVP Scope

| Component | What's Included | What's Deferred |
|-----------|-----------------|-----------------|
| **Integrations** | SnapTrade (investments) | Plaid (banking), other providers |
| **Manual Entry** | Cash, debts, income | Real estate, insurance |
| **Recommendations** | 5 rule-based templates + LLM | Full ML pipeline |
| **Smart Tools** | 3 enhanced calculators | All 30+ tools |
| **Auth** | Simple session-based | Full OAuth, multi-tenant |

---

## 2. Architecture Overview

### System Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLEARMONEY WEB                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │  Dashboard  │  │   Connect   │  │   Insights  │  │ Smart Tools │ │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘ │
│         │                │                │                │         │
│         └────────────────┴────────────────┴────────────────┘         │
│                                   │                                   │
│                    ┌──────────────┴──────────────┐                   │
│                    │    Strata SDK        │                   │
│                    │  (React hooks, API client)  │                   │
│                    └──────────────┬──────────────┘                   │
└───────────────────────────────────┼───────────────────────────────────┘
                                    │ HTTPS
                                    ▼
┌───────────────────────────────────────────────────────────────────────┐
│                       STRATA API                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │
│  │ Connections │  │  Accounts   │  │    Graph    │  │   Recomm.   │  │
│  │   Router    │  │   Router    │  │   Router    │  │   Router    │  │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  │
│         │                │                │                │          │
│         └────────────────┴────────────────┴────────────────┘          │
│                                   │                                    │
│         ┌─────────────────────────┼─────────────────────────┐         │
│         ▼                         ▼                         ▼         │
│  ┌─────────────┐          ┌─────────────┐          ┌─────────────┐   │
│  │  Provider   │          │   Graph     │          │  Decision   │   │
│  │  Adapters   │          │  Builder    │          │   Engine    │   │
│  │ (SnapTrade) │          │             │          │             │   │
│  └─────────────┘          └─────────────┘          └─────────────┘   │
│                                   │                                    │
└───────────────────────────────────┼────────────────────────────────────┘
                                    │
                                    ▼
                            ┌─────────────┐
                            │  PostgreSQL │
                            └─────────────┘
```

### Key Design Principles

1. **Platform Independence**: Strata API knows nothing about ClearMoney
2. **Provider Abstraction**: SnapTrade today, Plaid tomorrow - same interface
3. **Explainability First**: Every recommendation includes a decision trace
4. **SDK-First**: Web app uses the SDK, proving the developer experience

---

## 3. Monorepo Structure

### Directory Layout

```
clearmoney/
├── packages/
│   ├── strata-api/           # Python/FastAPI backend
│   │   ├── app/
│   │   │   ├── __init__.py
│   │   │   ├── main.py              # FastAPI app entry
│   │   │   ├── config.py            # Settings & env vars
│   │   │   ├── dependencies.py      # Dependency injection
│   │   │   │
│   │   │   ├── routers/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── connections.py   # POST /connections, OAuth callbacks
│   │   │   │   ├── accounts.py      # CRUD for all account types
│   │   │   │   ├── graph.py         # GET /graph (unified context)
│   │   │   │   └── recommendations.py
│   │   │   │
│   │   │   ├── services/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── providers/
│   │   │   │   │   ├── __init__.py
│   │   │   │   │   ├── base.py      # Abstract provider interface
│   │   │   │   │   └── snaptrade.py # SnapTrade implementation
│   │   │   │   ├── graph_builder.py # Builds unified context
│   │   │   │   ├── decision_engine.py
│   │   │   │   └── llm_service.py   # Claude API integration
│   │   │   │
│   │   │   ├── models/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── database.py      # SQLAlchemy models
│   │   │   │   ├── schemas.py       # Pydantic request/response
│   │   │   │   └── graph.py         # Context graph models
│   │   │   │
│   │   │   └── db/
│   │   │       ├── __init__.py
│   │   │       ├── session.py       # Database session
│   │   │       └── migrations/      # Alembic migrations
│   │   │
│   │   ├── tests/
│   │   │   ├── __init__.py
│   │   │   ├── conftest.py
│   │   │   ├── test_connections.py
│   │   │   ├── test_accounts.py
│   │   │   ├── test_graph.py
│   │   │   └── test_recommendations.py
│   │   │
│   │   ├── pyproject.toml
│   │   ├── alembic.ini
│   │   └── Dockerfile
│   │
│   ├── strata-sdk/           # TypeScript SDK
│   │   ├── src/
│   │   │   ├── index.ts             # Main exports
│   │   │   ├── client.ts            # StrataClient class
│   │   │   ├── types.ts             # TypeScript interfaces
│   │   │   ├── errors.ts            # Custom error types
│   │   │   │
│   │   │   └── react/
│   │   │       ├── index.ts
│   │   │       ├── provider.tsx     # <StrataProvider>
│   │   │       ├── hooks.ts         # useGraph, useRecommendations, etc.
│   │   │       └── components.tsx   # <ConnectButton>, <DecisionTrace>
│   │   │
│   │   ├── tests/
│   │   │   ├── client.test.ts
│   │   │   └── hooks.test.tsx
│   │   │
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── tsup.config.ts           # Build config
│   │
│   └── web/                         # ClearMoney Next.js app
│       ├── src/
│       │   ├── app/
│       │   │   ├── (marketing)/     # Public pages (landing, about)
│       │   │   │   ├── layout.tsx
│       │   │   │   ├── page.tsx     # Landing page
│       │   │   │   ├── about/
│       │   │   │   └── blog/
│       │   │   │
│       │   │   ├── (app)/           # Authenticated app
│       │   │   │   ├── layout.tsx   # App shell with sidebar
│       │   │   │   ├── page.tsx     # Dashboard
│       │   │   │   ├── connect/
│       │   │   │   │   ├── page.tsx # Connection wizard
│       │   │   │   │   └── callback/
│       │   │   │   │       └── page.tsx # OAuth callback
│       │   │   │   ├── insights/
│       │   │   │   │   └── page.tsx # Recommendations
│       │   │   │   └── tools/
│       │   │   │       ├── page.tsx # Tools listing
│       │   │   │       ├── emergency-fund/
│       │   │   │       ├── debt-payoff/
│       │   │   │       └── portfolio-checkup/
│       │   │   │
│       │   │   ├── api/             # Next.js API routes (auth)
│       │   │   │   └── auth/
│       │   │   │
│       │   │   ├── globals.css
│       │   │   └── layout.tsx       # Root layout
│       │   │
│       │   ├── components/
│       │   │   ├── ui/              # shadcn/ui components
│       │   │   ├── layout/
│       │   │   │   ├── Sidebar.tsx
│       │   │   │   ├── Header.tsx
│       │   │   │   └── AppShell.tsx
│       │   │   ├── dashboard/
│       │   │   │   ├── NetWorthCard.tsx
│       │   │   │   ├── StrataViz.tsx
│       │   │   │   └── QuickInsights.tsx
│       │   │   ├── connect/
│       │   │   │   ├── ProviderCard.tsx
│       │   │   │   └── ManualEntryForm.tsx
│       │   │   ├── insights/
│       │   │   │   ├── RecommendationCard.tsx
│       │   │   │   └── DecisionTrace.tsx
│       │   │   └── tools/
│       │   │       └── SmartCalculator.tsx
│       │   │
│       │   ├── lib/
│       │   │   ├── strata.ts  # SDK instance
│       │   │   └── utils.ts
│       │   │
│       │   └── hooks/
│       │       └── use-user.ts
│       │
│       ├── public/
│       ├── package.json
│       ├── next.config.ts
│       ├── tailwind.config.ts
│       └── tsconfig.json
│
├── docs/                            # Documentation (existing)
│   ├── platform/
│   ├── research/
│   └── vision/
│
├── docker-compose.yml               # Local dev environment
├── turbo.json                       # Turborepo config
├── package.json                     # Workspace root
├── pnpm-workspace.yaml              # pnpm workspaces
└── README.md
```

### Workspace Configuration

**pnpm-workspace.yaml:**
```yaml
packages:
  - "packages/*"
```

**turbo.json:**
```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["build"]
    },
    "lint": {}
  }
}
```

**Root package.json:**
```json
{
  "name": "clearmoney",
  "private": true,
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "test": "turbo test",
    "lint": "turbo lint",
    "dev:api": "cd packages/strata-api && uvicorn app.main:app --reload --port 8000",
    "dev:web": "cd packages/web && pnpm dev",
    "db:migrate": "cd packages/strata-api && alembic upgrade head"
  },
  "devDependencies": {
    "turbo": "^2.0.0"
  },
  "packageManager": "pnpm@8.15.0"
}
```

---

## 4. Strata API

### 4.1 Configuration

**app/config.py:**
```python
from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    # App
    app_name: str = "Strata API"
    debug: bool = False
    api_version: str = "v1"

    # Database
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/strata"

    # SnapTrade
    snaptrade_client_id: str
    snaptrade_consumer_key: str

    # Claude API
    anthropic_api_key: str

    # Security
    secret_key: str
    cors_origins: list[str] = ["http://localhost:3000"]

    class Config:
        env_file = ".env"

@lru_cache()
def get_settings() -> Settings:
    return Settings()
```

### 4.2 Main Application

**app/main.py:**
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import get_settings
from app.db.session import engine
from app.models.database import Base
from app.routers import connections, accounts, graph, recommendations

settings = get_settings()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables (dev only, use migrations in prod)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    # Shutdown
    await engine.dispose()

app = FastAPI(
    title=settings.app_name,
    version=settings.api_version,
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(connections.router, prefix="/api/v1/connections", tags=["connections"])
app.include_router(accounts.router, prefix="/api/v1/accounts", tags=["accounts"])
app.include_router(graph.router, prefix="/api/v1/graph", tags=["graph"])
app.include_router(recommendations.router, prefix="/api/v1/recommendations", tags=["recommendations"])

@app.get("/health")
async def health():
    return {"status": "healthy"}
```

### 4.3 Provider Abstraction

**app/services/providers/base.py:**
```python
from abc import ABC, abstractmethod
from typing import Optional
from app.models.schemas import (
    InvestmentAccount,
    Holding,
    Transaction,
    ConnectionStatus,
)

class BaseProvider(ABC):
    """Abstract base class for financial data providers."""

    provider_name: str

    @abstractmethod
    async def create_connection(self, user_id: str) -> dict:
        """Initialize OAuth flow, return redirect URL."""
        pass

    @abstractmethod
    async def handle_callback(self, user_id: str, auth_code: str) -> ConnectionStatus:
        """Complete OAuth flow, store credentials."""
        pass

    @abstractmethod
    async def get_accounts(self, user_id: str) -> list[InvestmentAccount]:
        """Fetch all accounts for user."""
        pass

    @abstractmethod
    async def get_holdings(self, user_id: str, account_id: str) -> list[Holding]:
        """Fetch holdings for an account."""
        pass

    @abstractmethod
    async def get_transactions(
        self,
        user_id: str,
        account_id: str,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
    ) -> list[Transaction]:
        """Fetch transactions for an account."""
        pass

    @abstractmethod
    async def refresh_connection(self, user_id: str) -> ConnectionStatus:
        """Refresh connection if needed."""
        pass

    @abstractmethod
    async def delete_connection(self, user_id: str) -> bool:
        """Remove connection and credentials."""
        pass
```

**app/services/providers/snaptrade.py:**
```python
from typing import Optional
import httpx
from snaptrade_client import SnapTrade

from app.config import get_settings
from app.services.providers.base import BaseProvider
from app.models.schemas import (
    InvestmentAccount,
    Holding,
    Transaction,
    ConnectionStatus,
)

settings = get_settings()

class SnapTradeProvider(BaseProvider):
    """SnapTrade implementation of the provider interface."""

    provider_name = "snaptrade"

    def __init__(self):
        self.client = SnapTrade(
            consumer_key=settings.snaptrade_consumer_key,
            client_id=settings.snaptrade_client_id,
        )

    async def create_connection(self, user_id: str) -> dict:
        """Register user with SnapTrade and get connection portal URL."""
        # Register user if not exists
        try:
            response = self.client.authentication.register_snap_trade_user(
                user_id=user_id,
            )
            user_secret = response.user_secret
        except Exception:
            # User already exists, get existing secret
            # In production, store user_secret in database
            pass

        # Get redirect URI for connection portal
        redirect_response = self.client.authentication.login_snap_trade_user(
            user_id=user_id,
            user_secret=user_secret,
            redirect_uri="http://localhost:3000/connect/callback",
        )

        return {
            "redirect_url": redirect_response.redirect_uri,
            "user_secret": user_secret,  # Store this securely
        }

    async def handle_callback(self, user_id: str, auth_code: str) -> ConnectionStatus:
        """Process callback after user connects brokerage."""
        # SnapTrade handles this via webhook or polling
        # For MVP, we poll for new connections
        return ConnectionStatus(
            provider="snaptrade",
            status="connected",
            connected_at=datetime.utcnow(),
        )

    async def get_accounts(self, user_id: str, user_secret: str) -> list[InvestmentAccount]:
        """Fetch all investment accounts."""
        response = self.client.account_information.get_all_user_holdings(
            user_id=user_id,
            user_secret=user_secret,
        )

        accounts = []
        for account_data in response:
            account = InvestmentAccount(
                id=str(account_data.account.id),
                provider_account_id=str(account_data.account.id),
                provider="snaptrade",
                name=account_data.account.name,
                account_type=self._map_account_type(account_data.account.type),
                institution_name=account_data.account.institution_name,
                balance=float(account_data.account.balance.total.amount or 0),
                currency=account_data.account.balance.total.currency or "USD",
                is_tax_advantaged=self._is_tax_advantaged(account_data.account.type),
            )
            accounts.append(account)

        return accounts

    async def get_holdings(self, user_id: str, user_secret: str, account_id: str) -> list[Holding]:
        """Fetch holdings for a specific account."""
        response = self.client.account_information.get_user_account_positions(
            user_id=user_id,
            user_secret=user_secret,
            account_id=account_id,
        )

        holdings = []
        for position in response:
            holding = Holding(
                id=f"{account_id}_{position.symbol.id}",
                account_id=account_id,
                symbol=position.symbol.symbol,
                name=position.symbol.description,
                quantity=float(position.units),
                price=float(position.price) if position.price else None,
                market_value=float(position.units * position.price) if position.price else None,
                cost_basis=float(position.average_purchase_price * position.units) if position.average_purchase_price else None,
                unrealized_gain_loss=None,  # Calculate from market_value - cost_basis
                asset_class=self._map_asset_class(position.symbol.type),
                security_type=position.symbol.type,
            )
            if holding.market_value and holding.cost_basis:
                holding.unrealized_gain_loss = holding.market_value - holding.cost_basis
            holdings.append(holding)

        return holdings

    async def get_transactions(
        self,
        user_id: str,
        user_secret: str,
        account_id: str,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
    ) -> list[Transaction]:
        """Fetch transactions for an account."""
        response = self.client.transactions_and_reporting.get_activities(
            user_id=user_id,
            user_secret=user_secret,
            account_id=account_id,
            start_date=start_date,
            end_date=end_date,
        )

        transactions = []
        for activity in response:
            tx = Transaction(
                id=str(activity.id),
                account_id=account_id,
                type=self._map_transaction_type(activity.type),
                symbol=activity.symbol.symbol if activity.symbol else None,
                quantity=float(activity.units) if activity.units else None,
                price=float(activity.price) if activity.price else None,
                amount=float(activity.amount) if activity.amount else 0,
                currency=activity.currency or "USD",
                date=activity.trade_date,
                description=activity.description,
            )
            transactions.append(tx)

        return transactions

    async def refresh_connection(self, user_id: str) -> ConnectionStatus:
        """Check and refresh connection status."""
        # SnapTrade handles token refresh automatically
        return ConnectionStatus(
            provider="snaptrade",
            status="connected",
        )

    async def delete_connection(self, user_id: str, user_secret: str) -> bool:
        """Delete user and all connections."""
        try:
            self.client.authentication.delete_snap_trade_user(
                user_id=user_id,
                user_secret=user_secret,
            )
            return True
        except Exception:
            return False

    # Helper methods
    def _map_account_type(self, snaptrade_type: str) -> str:
        mapping = {
            "TFSA": "tax_advantaged",
            "RRSP": "retirement",
            "401K": "retirement_401k",
            "IRA": "retirement_ira",
            "ROTH_IRA": "retirement_roth_ira",
            "MARGIN": "brokerage",
            "CASH": "brokerage",
        }
        return mapping.get(snaptrade_type, "brokerage")

    def _is_tax_advantaged(self, account_type: str) -> bool:
        tax_advantaged_types = {"TFSA", "RRSP", "401K", "IRA", "ROTH_IRA", "403B", "HSA"}
        return account_type in tax_advantaged_types

    def _map_asset_class(self, security_type: str) -> str:
        mapping = {
            "equity": "stocks",
            "etf": "etf",
            "mutual_fund": "mutual_fund",
            "bond": "bonds",
            "option": "options",
            "cryptocurrency": "crypto",
        }
        return mapping.get(security_type.lower(), "other")

    def _map_transaction_type(self, activity_type: str) -> str:
        mapping = {
            "BUY": "buy",
            "SELL": "sell",
            "DIVIDEND": "dividend",
            "INTEREST": "interest",
            "TRANSFER": "transfer_in",
            "FEE": "fee",
        }
        return mapping.get(activity_type, "other")
```

### 4.4 Graph Builder Service

**app/services/graph_builder.py:**
```python
from typing import Optional
from decimal import Decimal
from datetime import datetime

from app.models.graph import (
    Strata,
    FinancialContext,
    AssetsSummary,
    LiabilitiesSummary,
    IncomeSummary,
    Metrics,
    RiskIndicators,
)
from app.models.schemas import (
    InvestmentAccount,
    CashAccount,
    DebtAccount,
    IncomeSource,
)

class GraphBuilder:
    """Builds a unified context graph from disparate financial data."""

    def build(
        self,
        user_id: str,
        investment_accounts: list[InvestmentAccount],
        cash_accounts: list[CashAccount],
        debt_accounts: list[DebtAccount],
        income_sources: list[IncomeSource],
        holdings: dict[str, list],  # account_id -> holdings
    ) -> Strata:
        """Build complete context graph."""

        # Calculate summaries
        assets = self._build_assets_summary(investment_accounts, cash_accounts, holdings)
        liabilities = self._build_liabilities_summary(debt_accounts)
        income = self._build_income_summary(income_sources)

        # Calculate metrics
        metrics = self._calculate_metrics(assets, liabilities, income)

        # Assess risks
        risk_indicators = self._assess_risks(
            assets, liabilities, income, metrics, holdings
        )

        # Build context
        context = FinancialContext(
            assets=assets,
            liabilities=liabilities,
            income=income,
            metrics=metrics,
            risk_indicators=risk_indicators,
        )

        return Strata(
            user_id=user_id,
            context=context,
            investment_accounts=investment_accounts,
            cash_accounts=cash_accounts,
            debt_accounts=debt_accounts,
            income_sources=income_sources,
            generated_at=datetime.utcnow(),
        )

    def _build_assets_summary(
        self,
        investment_accounts: list[InvestmentAccount],
        cash_accounts: list[CashAccount],
        holdings: dict[str, list],
    ) -> AssetsSummary:
        """Summarize all assets."""

        # Investment totals
        total_investments = sum(acc.balance for acc in investment_accounts)
        tax_advantaged = sum(
            acc.balance for acc in investment_accounts if acc.is_tax_advantaged
        )
        taxable = total_investments - tax_advantaged

        # Cash totals
        total_cash = sum(acc.balance for acc in cash_accounts)
        checking = sum(
            acc.balance for acc in cash_accounts if acc.account_type == "checking"
        )
        savings = sum(
            acc.balance for acc in cash_accounts if acc.account_type in ["savings", "hysa"]
        )

        # Allocation by asset class
        all_holdings = [h for account_holdings in holdings.values() for h in account_holdings]
        allocation = self._calculate_allocation(all_holdings)

        return AssetsSummary(
            total=total_investments + total_cash,
            investments=total_investments,
            investments_tax_advantaged=tax_advantaged,
            investments_taxable=taxable,
            cash=total_cash,
            cash_checking=checking,
            cash_savings=savings,
            allocation_by_asset_class=allocation,
        )

    def _build_liabilities_summary(
        self,
        debt_accounts: list[DebtAccount],
    ) -> LiabilitiesSummary:
        """Summarize all liabilities."""

        total = sum(acc.balance for acc in debt_accounts)

        by_type = {}
        for acc in debt_accounts:
            debt_type = acc.debt_type
            if debt_type not in by_type:
                by_type[debt_type] = 0
            by_type[debt_type] += acc.balance

        # Weighted average interest rate
        if total > 0:
            weighted_rate = sum(
                acc.balance * acc.interest_rate for acc in debt_accounts
            ) / total
        else:
            weighted_rate = 0

        # High interest debt (> 7%)
        high_interest = sum(
            acc.balance for acc in debt_accounts if acc.interest_rate > 7.0
        )

        return LiabilitiesSummary(
            total=total,
            by_type=by_type,
            weighted_average_rate=weighted_rate,
            high_interest_debt=high_interest,
            monthly_minimum_payments=sum(
                acc.minimum_payment or 0 for acc in debt_accounts
            ),
        )

    def _build_income_summary(
        self,
        income_sources: list[IncomeSource],
    ) -> IncomeSummary:
        """Summarize income."""

        # Normalize to monthly
        monthly_amounts = []
        for source in income_sources:
            if source.frequency == "annual":
                monthly_amounts.append(source.amount / 12)
            elif source.frequency == "monthly":
                monthly_amounts.append(source.amount)
            elif source.frequency == "biweekly":
                monthly_amounts.append(source.amount * 26 / 12)
            elif source.frequency == "weekly":
                monthly_amounts.append(source.amount * 52 / 12)

        gross_monthly = sum(monthly_amounts)

        # Estimate net (simplified - use 70% of gross as rough estimate)
        # In production, would use actual tax calculations
        estimated_net_monthly = gross_monthly * 0.70

        return IncomeSummary(
            gross_annual=gross_monthly * 12,
            gross_monthly=gross_monthly,
            estimated_net_monthly=estimated_net_monthly,
            sources_count=len(income_sources),
            is_variable=any(s.is_variable for s in income_sources),
        )

    def _calculate_metrics(
        self,
        assets: AssetsSummary,
        liabilities: LiabilitiesSummary,
        income: IncomeSummary,
    ) -> Metrics:
        """Calculate key financial metrics."""

        net_worth = assets.total - liabilities.total

        # Emergency fund months (cash / monthly expenses estimate)
        # Estimate monthly expenses as 60% of net income
        estimated_monthly_expenses = income.estimated_net_monthly * 0.60
        if estimated_monthly_expenses > 0:
            emergency_fund_months = assets.cash / estimated_monthly_expenses
        else:
            emergency_fund_months = 0

        # Debt to income
        if income.gross_annual > 0:
            debt_to_income = liabilities.total / income.gross_annual
        else:
            debt_to_income = 0

        # Savings rate (simplified - would need expense data)
        # Placeholder: assume 20% target
        savings_rate = 0.20

        return Metrics(
            net_worth=net_worth,
            emergency_fund_months=emergency_fund_months,
            debt_to_income_ratio=debt_to_income,
            savings_rate=savings_rate,
            investment_to_net_worth_ratio=(
                assets.investments / net_worth if net_worth > 0 else 0
            ),
        )

    def _assess_risks(
        self,
        assets: AssetsSummary,
        liabilities: LiabilitiesSummary,
        income: IncomeSummary,
        metrics: Metrics,
        holdings: dict[str, list],
    ) -> RiskIndicators:
        """Identify financial risks."""

        risks = []

        # Emergency fund risk
        if metrics.emergency_fund_months < 3:
            risks.append({
                "type": "emergency_fund_low",
                "severity": "high" if metrics.emergency_fund_months < 1 else "medium",
                "message": f"Emergency fund covers only {metrics.emergency_fund_months:.1f} months",
            })

        # High interest debt
        if liabilities.high_interest_debt > 0:
            risks.append({
                "type": "high_interest_debt",
                "severity": "high",
                "message": f"${liabilities.high_interest_debt:,.0f} in high-interest debt (>7%)",
            })

        # Concentration risk
        all_holdings = [h for hl in holdings.values() for h in hl]
        concentration = self._check_concentration(all_holdings, assets.investments)
        if concentration:
            risks.append(concentration)

        # Cash drag (too much in low-yield)
        if assets.cash > income.gross_monthly * 12:  # More than 12 months in cash
            risks.append({
                "type": "cash_drag",
                "severity": "low",
                "message": f"${assets.cash:,.0f} in cash may be underperforming",
            })

        return RiskIndicators(
            risks=risks,
            overall_risk_level=self._calculate_overall_risk(risks),
        )

    def _calculate_allocation(self, holdings: list) -> dict[str, float]:
        """Calculate portfolio allocation by asset class."""
        total_value = sum(h.market_value or 0 for h in holdings)
        if total_value == 0:
            return {}

        allocation = {}
        for holding in holdings:
            asset_class = holding.asset_class or "other"
            if asset_class not in allocation:
                allocation[asset_class] = 0
            allocation[asset_class] += (holding.market_value or 0) / total_value

        return allocation

    def _check_concentration(self, holdings: list, total_investments: float) -> Optional[dict]:
        """Check for concentration risk."""
        if total_investments == 0:
            return None

        # Check single stock concentration
        for holding in holdings:
            if holding.market_value and holding.market_value / total_investments > 0.20:
                return {
                    "type": "single_stock_concentration",
                    "severity": "high",
                    "message": f"{holding.symbol} represents {holding.market_value/total_investments*100:.0f}% of portfolio",
                    "symbol": holding.symbol,
                }

        # Check sector concentration (simplified - by asset class)
        allocation = self._calculate_allocation(holdings)
        for asset_class, pct in allocation.items():
            if pct > 0.60 and asset_class == "stocks":
                return {
                    "type": "asset_class_concentration",
                    "severity": "medium",
                    "message": f"{pct*100:.0f}% in stocks - consider diversification",
                }

        return None

    def _calculate_overall_risk(self, risks: list) -> str:
        """Calculate overall risk level."""
        if any(r["severity"] == "high" for r in risks):
            return "high"
        if any(r["severity"] == "medium" for r in risks):
            return "medium"
        if risks:
            return "low"
        return "healthy"
```

### 4.5 Decision Engine

**app/services/decision_engine.py:**
```python
from typing import Optional
from datetime import datetime
import anthropic

from app.config import get_settings
from app.models.graph import Strata
from app.models.schemas import (
    Recommendation,
    DecisionTrace,
    TraceStep,
)

settings = get_settings()

class DecisionEngine:
    """Generates recommendations with explainable decision traces."""

    def __init__(self):
        self.claude = anthropic.Anthropic(api_key=settings.anthropic_api_key)
        self.rules = [
            self._rule_emergency_fund,
            self._rule_high_interest_debt,
            self._rule_cash_optimization,
            self._rule_portfolio_rebalance,
            self._rule_tax_optimization,
        ]

    async def generate_recommendations(
        self,
        graph: Strata,
        max_recommendations: int = 5,
    ) -> list[Recommendation]:
        """Generate prioritized recommendations with traces."""

        recommendations = []

        # Run rule-based recommendations
        for rule in self.rules:
            rec = rule(graph)
            if rec:
                recommendations.append(rec)

        # Sort by priority and impact
        recommendations.sort(
            key=lambda r: (r.priority, -r.estimated_annual_impact),
        )

        # Enhance top recommendations with LLM explanation
        for rec in recommendations[:max_recommendations]:
            rec.narrative = await self._generate_narrative(rec, graph)

        return recommendations[:max_recommendations]

    def _rule_emergency_fund(self, graph: Strata) -> Optional[Recommendation]:
        """Check emergency fund adequacy."""

        months = graph.context.metrics.emergency_fund_months
        target_months = 6 if not graph.context.income.is_variable else 9

        trace = DecisionTrace(
            rule_id="emergency_fund",
            rule_name="Emergency Fund Assessment",
            steps=[],
            inputs_used={},
            conclusion="",
        )

        # Step 1: Check current emergency fund
        trace.steps.append(TraceStep(
            step_number=1,
            description="Calculate current emergency fund coverage",
            data_used={
                "cash_balance": graph.context.assets.cash,
                "estimated_monthly_expenses": graph.context.income.estimated_net_monthly * 0.6,
            },
            calculation=f"${graph.context.assets.cash:,.0f} / ${graph.context.income.estimated_net_monthly * 0.6:,.0f} = {months:.1f} months",
            result=f"{months:.1f} months coverage",
        ))

        # Step 2: Determine target
        trace.steps.append(TraceStep(
            step_number=2,
            description="Determine target based on income stability",
            data_used={
                "income_is_variable": graph.context.income.is_variable,
            },
            calculation=f"Variable income: {graph.context.income.is_variable} → Target: {target_months} months",
            result=f"Target: {target_months} months",
        ))

        # Step 3: Compare
        gap = target_months - months
        trace.steps.append(TraceStep(
            step_number=3,
            description="Compare current vs target",
            data_used={
                "current_months": months,
                "target_months": target_months,
            },
            calculation=f"{target_months} - {months:.1f} = {gap:.1f} months gap",
            result="Gap exists" if gap > 0 else "Target met",
        ))

        if gap <= 0:
            return None

        # Calculate recommendation
        gap_amount = gap * graph.context.income.estimated_net_monthly * 0.6

        trace.inputs_used = {
            "cash_balance": graph.context.assets.cash,
            "monthly_expenses_estimate": graph.context.income.estimated_net_monthly * 0.6,
            "income_stability": "variable" if graph.context.income.is_variable else "stable",
        }
        trace.conclusion = f"Recommend building ${gap_amount:,.0f} additional emergency fund"

        return Recommendation(
            id="rec_emergency_fund",
            type="emergency_fund",
            priority=1 if months < 3 else 2,
            title="Build Emergency Fund",
            summary=f"Increase emergency fund by ${gap_amount:,.0f} to reach {target_months} months coverage",
            action=f"Transfer ${gap_amount/6:,.0f}/month to savings for 6 months",
            estimated_annual_impact=0,  # Risk reduction, not financial gain
            confidence=0.95,
            trace=trace,
        )

    def _rule_high_interest_debt(self, graph: Strata) -> Optional[Recommendation]:
        """Prioritize high-interest debt payoff."""

        high_interest_debts = [
            acc for acc in graph.debt_accounts
            if acc.interest_rate > 7.0
        ]

        if not high_interest_debts:
            return None

        trace = DecisionTrace(
            rule_id="high_interest_debt",
            rule_name="High Interest Debt Analysis",
            steps=[],
            inputs_used={},
            conclusion="",
        )

        # Find highest rate debt
        worst_debt = max(high_interest_debts, key=lambda d: d.interest_rate)

        trace.steps.append(TraceStep(
            step_number=1,
            description="Identify high-interest debts (>7% APR)",
            data_used={
                "debts": [
                    {"name": d.name, "balance": d.balance, "rate": d.interest_rate}
                    for d in high_interest_debts
                ],
            },
            calculation=f"Found {len(high_interest_debts)} debts above 7% threshold",
            result=f"Highest rate: {worst_debt.name} at {worst_debt.interest_rate}%",
        ))

        # Compare to investment returns
        expected_market_return = 7.0  # Conservative long-term estimate

        trace.steps.append(TraceStep(
            step_number=2,
            description="Compare debt rate to expected investment returns",
            data_used={
                "debt_rate": worst_debt.interest_rate,
                "expected_market_return": expected_market_return,
            },
            calculation=f"{worst_debt.interest_rate}% debt vs {expected_market_return}% expected return",
            result=f"Paying debt = guaranteed {worst_debt.interest_rate}% return",
        ))

        # Calculate impact
        annual_interest_saved = worst_debt.balance * (worst_debt.interest_rate / 100)

        trace.steps.append(TraceStep(
            step_number=3,
            description="Calculate annual interest savings",
            data_used={
                "balance": worst_debt.balance,
                "rate": worst_debt.interest_rate,
            },
            calculation=f"${worst_debt.balance:,.0f} × {worst_debt.interest_rate}% = ${annual_interest_saved:,.0f}/year",
            result=f"${annual_interest_saved:,.0f} annual interest",
        ))

        trace.inputs_used = {
            "high_interest_debts": len(high_interest_debts),
            "total_high_interest_balance": sum(d.balance for d in high_interest_debts),
            "highest_rate": worst_debt.interest_rate,
        }
        trace.conclusion = f"Prioritize paying off {worst_debt.name} - guaranteed {worst_debt.interest_rate}% return"

        return Recommendation(
            id="rec_high_interest_debt",
            type="debt_payoff",
            priority=1,
            title=f"Pay Off {worst_debt.name}",
            summary=f"Focus extra payments on {worst_debt.name} ({worst_debt.interest_rate}% APR) - save ${annual_interest_saved:,.0f}/year in interest",
            action=f"Pay extra ${worst_debt.balance/12:,.0f}/month to eliminate in 12 months",
            estimated_annual_impact=annual_interest_saved,
            confidence=0.98,  # Math is certain
            trace=trace,
        )

    def _rule_cash_optimization(self, graph: Strata) -> Optional[Recommendation]:
        """Optimize low-yield cash holdings."""

        checking_balance = graph.context.assets.cash_checking
        emergency_fund_needed = graph.context.income.estimated_net_monthly * 0.6 * 2  # 2 months in checking

        excess_checking = checking_balance - emergency_fund_needed

        if excess_checking < 5000:  # Not worth optimizing small amounts
            return None

        trace = DecisionTrace(
            rule_id="cash_optimization",
            rule_name="Cash Yield Optimization",
            steps=[],
            inputs_used={},
            conclusion="",
        )

        trace.steps.append(TraceStep(
            step_number=1,
            description="Identify excess cash in checking",
            data_used={
                "checking_balance": checking_balance,
                "emergency_buffer": emergency_fund_needed,
            },
            calculation=f"${checking_balance:,.0f} - ${emergency_fund_needed:,.0f} = ${excess_checking:,.0f} excess",
            result=f"${excess_checking:,.0f} earning ~0.01% APY",
        ))

        # HYSA rates
        hysa_rate = 4.5  # Current competitive HYSA rate
        checking_rate = 0.01

        annual_gain = excess_checking * (hysa_rate - checking_rate) / 100

        trace.steps.append(TraceStep(
            step_number=2,
            description="Calculate yield improvement",
            data_used={
                "excess_cash": excess_checking,
                "current_rate": checking_rate,
                "hysa_rate": hysa_rate,
            },
            calculation=f"${excess_checking:,.0f} × ({hysa_rate}% - {checking_rate}%) = ${annual_gain:,.0f}/year",
            result=f"${annual_gain:,.0f} additional annual interest",
        ))

        trace.inputs_used = {
            "checking_balance": checking_balance,
            "excess_amount": excess_checking,
            "current_yield": checking_rate,
            "target_yield": hysa_rate,
        }
        trace.conclusion = f"Move ${excess_checking:,.0f} to HYSA for ${annual_gain:,.0f}/year risk-free gain"

        return Recommendation(
            id="rec_cash_optimization",
            type="cash_optimization",
            priority=3,
            title="Optimize Cash Holdings",
            summary=f"Move ${excess_checking:,.0f} from checking to high-yield savings - earn ${annual_gain:,.0f}/year",
            action=f"Open HYSA (Wealthfront, Marcus, Ally) and transfer ${excess_checking:,.0f}",
            estimated_annual_impact=annual_gain,
            confidence=0.95,
            trace=trace,
        )

    def _rule_portfolio_rebalance(self, graph: Strata) -> Optional[Recommendation]:
        """Check for portfolio rebalancing needs."""

        allocation = graph.context.assets.allocation_by_asset_class

        if not allocation:
            return None

        # Simple target: 80/20 stocks/bonds for growth
        # In production, would be based on age/risk profile
        stocks_pct = allocation.get("stocks", 0) + allocation.get("etf", 0)
        bonds_pct = allocation.get("bonds", 0)

        # Check if significantly overweight stocks
        if stocks_pct < 0.85:  # Not overweight
            return None

        trace = DecisionTrace(
            rule_id="portfolio_rebalance",
            rule_name="Portfolio Balance Check",
            steps=[],
            inputs_used={},
            conclusion="",
        )

        trace.steps.append(TraceStep(
            step_number=1,
            description="Analyze current allocation",
            data_used={"allocation": allocation},
            calculation=f"Stocks: {stocks_pct*100:.0f}%, Bonds: {bonds_pct*100:.0f}%",
            result=f"Portfolio is {stocks_pct*100:.0f}% equities",
        ))

        # Cross-reference with emergency fund
        ef_months = graph.context.metrics.emergency_fund_months

        trace.steps.append(TraceStep(
            step_number=2,
            description="Cross-reference with emergency fund",
            data_used={
                "stocks_allocation": stocks_pct,
                "emergency_fund_months": ef_months,
            },
            calculation=f"High equity ({stocks_pct*100:.0f}%) + low emergency fund ({ef_months:.1f}mo) = elevated risk",
            result="Risk concentration detected" if ef_months < 6 else "Acceptable with adequate emergency fund",
        ))

        trace.inputs_used = {
            "current_stocks_allocation": stocks_pct,
            "current_bonds_allocation": bonds_pct,
            "emergency_fund_months": ef_months,
        }
        trace.conclusion = f"Consider reducing equity exposure from {stocks_pct*100:.0f}% to 80%"

        return Recommendation(
            id="rec_portfolio_rebalance",
            type="portfolio_rebalance",
            priority=2,
            title="Rebalance Portfolio",
            summary=f"Portfolio is {stocks_pct*100:.0f}% stocks - consider diversifying to reduce volatility",
            action="Gradually shift 5-10% from stocks to bonds or bond ETFs (BND, AGG)",
            estimated_annual_impact=0,  # Risk reduction
            confidence=0.80,
            trace=trace,
        )

    def _rule_tax_optimization(self, graph: Strata) -> Optional[Recommendation]:
        """Check for tax optimization opportunities."""

        tax_advantaged = graph.context.assets.investments_tax_advantaged
        taxable = graph.context.assets.investments_taxable
        total = tax_advantaged + taxable

        if total == 0:
            return None

        tax_advantaged_pct = tax_advantaged / total

        # If less than 50% in tax-advantaged, there may be opportunity
        if tax_advantaged_pct > 0.5:
            return None

        trace = DecisionTrace(
            rule_id="tax_optimization",
            rule_name="Tax-Advantaged Account Analysis",
            steps=[],
            inputs_used={},
            conclusion="",
        )

        trace.steps.append(TraceStep(
            step_number=1,
            description="Calculate tax-advantaged utilization",
            data_used={
                "tax_advantaged": tax_advantaged,
                "taxable": taxable,
            },
            calculation=f"${tax_advantaged:,.0f} / ${total:,.0f} = {tax_advantaged_pct*100:.0f}%",
            result=f"Only {tax_advantaged_pct*100:.0f}% in tax-advantaged accounts",
        ))

        # Estimate tax drag
        assumed_dividend_yield = 0.02
        assumed_tax_rate = 0.22
        tax_drag = taxable * assumed_dividend_yield * assumed_tax_rate

        trace.steps.append(TraceStep(
            step_number=2,
            description="Estimate annual tax drag on taxable accounts",
            data_used={
                "taxable_balance": taxable,
                "dividend_yield": assumed_dividend_yield,
                "tax_rate": assumed_tax_rate,
            },
            calculation=f"${taxable:,.0f} × 2% dividends × 22% tax = ${tax_drag:,.0f}/year",
            result=f"~${tax_drag:,.0f} annual tax drag",
        ))

        trace.inputs_used = {
            "tax_advantaged_balance": tax_advantaged,
            "taxable_balance": taxable,
            "tax_advantaged_percentage": tax_advantaged_pct,
        }
        trace.conclusion = "Maximize 401k/IRA contributions before taxable investing"

        return Recommendation(
            id="rec_tax_optimization",
            type="tax_optimization",
            priority=2,
            title="Maximize Tax-Advantaged Accounts",
            summary=f"Only {tax_advantaged_pct*100:.0f}% is tax-advantaged - maximize 401k/IRA to reduce ~${tax_drag:,.0f}/year tax drag",
            action="Increase 401k contribution to max ($23,000/year for 2024) before taxable investing",
            estimated_annual_impact=tax_drag,
            confidence=0.85,
            trace=trace,
        )

    async def _generate_narrative(
        self,
        recommendation: Recommendation,
        graph: Strata,
    ) -> str:
        """Use Claude to generate a personalized narrative explanation."""

        prompt = f"""You are a financial advisor explaining a recommendation to a client.

Based on this decision trace:
{recommendation.trace.model_dump_json(indent=2)}

And this financial context:
- Net worth: ${graph.context.metrics.net_worth:,.0f}
- Emergency fund: {graph.context.metrics.emergency_fund_months:.1f} months
- Total debt: ${graph.context.liabilities.total:,.0f}
- Monthly income: ${graph.context.income.gross_monthly:,.0f}

Write a 2-3 sentence personalized explanation of why this recommendation makes sense for this specific person. Be conversational but professional. Don't use jargon. Focus on the "why" and the specific numbers from their situation."""

        response = self.claude.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=200,
            messages=[{"role": "user", "content": prompt}],
        )

        return response.content[0].text
```

### 4.6 API Routers

**app/routers/connections.py:**
```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.services.providers.snaptrade import SnapTradeProvider
from app.models.schemas import ConnectionRequest, ConnectionResponse, ConnectionStatus

router = APIRouter()
provider = SnapTradeProvider()

@router.post("/", response_model=ConnectionResponse)
async def create_connection(
    request: ConnectionRequest,
    db: AsyncSession = Depends(get_db),
):
    """Initialize OAuth flow for connecting a brokerage."""
    try:
        result = await provider.create_connection(request.user_id)
        return ConnectionResponse(
            redirect_url=result["redirect_url"],
            provider="snaptrade",
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{user_id}/status", response_model=ConnectionStatus)
async def get_connection_status(
    user_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Check connection status for a user."""
    status = await provider.refresh_connection(user_id)
    return status

@router.delete("/{user_id}")
async def delete_connection(
    user_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Remove all connections for a user."""
    success = await provider.delete_connection(user_id)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to delete connection")
    return {"status": "deleted"}
```

**app/routers/graph.py:**
```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.services.providers.snaptrade import SnapTradeProvider
from app.services.graph_builder import GraphBuilder
from app.models.graph import Strata
from app.models import crud

router = APIRouter()
provider = SnapTradeProvider()
graph_builder = GraphBuilder()

@router.get("/{user_id}", response_model=Strata)
async def get_strata(
    user_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Build and return the complete context graph for a user."""

    # Fetch from provider (investments)
    user_secret = await crud.get_user_secret(db, user_id)
    if not user_secret:
        raise HTTPException(status_code=404, detail="User not connected")

    investment_accounts = await provider.get_accounts(user_id, user_secret)

    # Fetch holdings for each account
    holdings = {}
    for account in investment_accounts:
        account_holdings = await provider.get_holdings(
            user_id, user_secret, account.id
        )
        holdings[account.id] = account_holdings

    # Fetch manual entries from database
    cash_accounts = await crud.get_cash_accounts(db, user_id)
    debt_accounts = await crud.get_debt_accounts(db, user_id)
    income_sources = await crud.get_income_sources(db, user_id)

    # Build unified graph
    graph = graph_builder.build(
        user_id=user_id,
        investment_accounts=investment_accounts,
        cash_accounts=cash_accounts,
        debt_accounts=debt_accounts,
        income_sources=income_sources,
        holdings=holdings,
    )

    return graph
```

**app/routers/recommendations.py:**
```python
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.routers.graph import get_strata
from app.services.decision_engine import DecisionEngine
from app.models.schemas import RecommendationsResponse

router = APIRouter()
engine = DecisionEngine()

@router.get("/{user_id}", response_model=RecommendationsResponse)
async def get_recommendations(
    user_id: str,
    max_results: int = 5,
    db: AsyncSession = Depends(get_db),
):
    """Generate personalized recommendations with decision traces."""

    # Get context graph first
    graph = await get_strata(user_id, db)

    # Generate recommendations
    recommendations = await engine.generate_recommendations(
        graph=graph,
        max_recommendations=max_results,
    )

    return RecommendationsResponse(
        user_id=user_id,
        recommendations=recommendations,
        generated_at=graph.generated_at,
    )
```

---

## 5. Strata SDK

### 5.1 Package Configuration

**packages/strata-sdk/package.json:**
```json
{
  "name": "@clearmoney/strata-sdk",
  "version": "0.1.0",
  "description": "TypeScript SDK for Strata API",
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    },
    "./react": {
      "import": "./dist/react/index.mjs",
      "require": "./dist/react/index.js",
      "types": "./dist/react/index.d.ts"
    }
  },
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "test": "vitest",
    "lint": "eslint src/",
    "typecheck": "tsc --noEmit"
  },
  "peerDependencies": {
    "react": "^18.0.0"
  },
  "peerDependenciesMeta": {
    "react": {
      "optional": true
    }
  },
  "dependencies": {
    "ky": "^1.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "react": "^18.2.0",
    "tsup": "^8.0.0",
    "typescript": "^5.3.0",
    "vitest": "^1.2.0"
  }
}
```

### 5.2 TypeScript Types

**packages/strata-sdk/src/types.ts:**
```typescript
// ============ Core Types ============

export interface StrataConfig {
  baseUrl: string;
  userId: string;
  onError?: (error: StrataError) => void;
}

export interface StrataError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// ============ Account Types ============

export interface InvestmentAccount {
  id: string;
  provider_account_id: string;
  provider: string;
  name: string;
  account_type: string;
  institution_name: string;
  balance: number;
  currency: string;
  is_tax_advantaged: boolean;
}

export interface CashAccount {
  id: string;
  name: string;
  account_type: 'checking' | 'savings' | 'hysa' | 'money_market';
  balance: number;
  apy: number;
  institution_name?: string;
}

export interface DebtAccount {
  id: string;
  name: string;
  debt_type: 'credit_card' | 'student_loan' | 'auto_loan' | 'mortgage' | 'personal_loan' | 'other';
  balance: number;
  interest_rate: number;
  minimum_payment?: number;
}

export interface IncomeSource {
  id: string;
  name: string;
  source_type: 'salary' | 'freelance' | 'investment' | 'rental' | 'other';
  amount: number;
  frequency: 'weekly' | 'biweekly' | 'monthly' | 'annual';
  is_variable: boolean;
}

export interface Holding {
  id: string;
  account_id: string;
  symbol?: string;
  name: string;
  quantity: number;
  price?: number;
  market_value?: number;
  cost_basis?: number;
  unrealized_gain_loss?: number;
  asset_class?: string;
  security_type?: string;
}

// ============ Graph Types ============

export interface Strata {
  user_id: string;
  context: FinancialContext;
  investment_accounts: InvestmentAccount[];
  cash_accounts: CashAccount[];
  debt_accounts: DebtAccount[];
  income_sources: IncomeSource[];
  generated_at: string;
}

export interface FinancialContext {
  assets: AssetsSummary;
  liabilities: LiabilitiesSummary;
  income: IncomeSummary;
  metrics: Metrics;
  risk_indicators: RiskIndicators;
}

export interface AssetsSummary {
  total: number;
  investments: number;
  investments_tax_advantaged: number;
  investments_taxable: number;
  cash: number;
  cash_checking: number;
  cash_savings: number;
  allocation_by_asset_class: Record<string, number>;
}

export interface LiabilitiesSummary {
  total: number;
  by_type: Record<string, number>;
  weighted_average_rate: number;
  high_interest_debt: number;
  monthly_minimum_payments: number;
}

export interface IncomeSummary {
  gross_annual: number;
  gross_monthly: number;
  estimated_net_monthly: number;
  sources_count: number;
  is_variable: boolean;
}

export interface Metrics {
  net_worth: number;
  emergency_fund_months: number;
  debt_to_income_ratio: number;
  savings_rate: number;
  investment_to_net_worth_ratio: number;
}

export interface RiskIndicators {
  risks: RiskItem[];
  overall_risk_level: 'healthy' | 'low' | 'medium' | 'high';
}

export interface RiskItem {
  type: string;
  severity: 'low' | 'medium' | 'high';
  message: string;
  symbol?: string;
}

// ============ Recommendation Types ============

export interface Recommendation {
  id: string;
  type: string;
  priority: number;
  title: string;
  summary: string;
  action: string;
  estimated_annual_impact: number;
  confidence: number;
  trace: DecisionTrace;
  narrative?: string;
}

export interface DecisionTrace {
  rule_id: string;
  rule_name: string;
  steps: TraceStep[];
  inputs_used: Record<string, unknown>;
  conclusion: string;
}

export interface TraceStep {
  step_number: number;
  description: string;
  data_used: Record<string, unknown>;
  calculation: string;
  result: string;
}

export interface RecommendationsResponse {
  user_id: string;
  recommendations: Recommendation[];
  generated_at: string;
}

// ============ Connection Types ============

export interface ConnectionResponse {
  redirect_url: string;
  provider: string;
}

export interface ConnectionStatus {
  provider: string;
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  connected_at?: string;
  error_message?: string;
}
```

### 5.3 API Client

**packages/strata-sdk/src/client.ts:**
```typescript
import ky, { type KyInstance } from 'ky';
import type {
  StrataConfig,
  Strata,
  RecommendationsResponse,
  ConnectionResponse,
  ConnectionStatus,
  CashAccount,
  DebtAccount,
  IncomeSource,
} from './types';

export class StrataClient {
  private client: KyInstance;
  private userId: string;
  private onError?: (error: Error) => void;

  constructor(config: StrataConfig) {
    this.userId = config.userId;
    this.onError = config.onError;

    this.client = ky.create({
      prefixUrl: config.baseUrl,
      timeout: 30000,
      hooks: {
        beforeError: [
          (error) => {
            this.onError?.(error);
            return error;
          },
        ],
      },
    });
  }

  // ============ Connection Methods ============

  async createConnection(): Promise<ConnectionResponse> {
    return this.client
      .post('api/v1/connections', {
        json: { user_id: this.userId },
      })
      .json<ConnectionResponse>();
  }

  async getConnectionStatus(): Promise<ConnectionStatus> {
    return this.client
      .get(`api/v1/connections/${this.userId}/status`)
      .json<ConnectionStatus>();
  }

  async deleteConnection(): Promise<void> {
    await this.client.delete(`api/v1/connections/${this.userId}`);
  }

  // ============ Graph Methods ============

  async getGraph(): Promise<Strata> {
    return this.client
      .get(`api/v1/graph/${this.userId}`)
      .json<Strata>();
  }

  // ============ Recommendations Methods ============

  async getRecommendations(maxResults = 5): Promise<RecommendationsResponse> {
    return this.client
      .get(`api/v1/recommendations/${this.userId}`, {
        searchParams: { max_results: maxResults },
      })
      .json<RecommendationsResponse>();
  }

  // ============ Manual Entry Methods ============

  async addCashAccount(account: Omit<CashAccount, 'id'>): Promise<CashAccount> {
    return this.client
      .post(`api/v1/accounts/${this.userId}/cash`, {
        json: account,
      })
      .json<CashAccount>();
  }

  async updateCashAccount(id: string, account: Partial<CashAccount>): Promise<CashAccount> {
    return this.client
      .patch(`api/v1/accounts/${this.userId}/cash/${id}`, {
        json: account,
      })
      .json<CashAccount>();
  }

  async deleteCashAccount(id: string): Promise<void> {
    await this.client.delete(`api/v1/accounts/${this.userId}/cash/${id}`);
  }

  async addDebtAccount(account: Omit<DebtAccount, 'id'>): Promise<DebtAccount> {
    return this.client
      .post(`api/v1/accounts/${this.userId}/debt`, {
        json: account,
      })
      .json<DebtAccount>();
  }

  async updateDebtAccount(id: string, account: Partial<DebtAccount>): Promise<DebtAccount> {
    return this.client
      .patch(`api/v1/accounts/${this.userId}/debt/${id}`, {
        json: account,
      })
      .json<DebtAccount>();
  }

  async deleteDebtAccount(id: string): Promise<void> {
    await this.client.delete(`api/v1/accounts/${this.userId}/debt/${id}`);
  }

  async addIncomeSource(source: Omit<IncomeSource, 'id'>): Promise<IncomeSource> {
    return this.client
      .post(`api/v1/accounts/${this.userId}/income`, {
        json: source,
      })
      .json<IncomeSource>();
  }

  async updateIncomeSource(id: string, source: Partial<IncomeSource>): Promise<IncomeSource> {
    return this.client
      .patch(`api/v1/accounts/${this.userId}/income/${id}`, {
        json: source,
      })
      .json<IncomeSource>();
  }

  async deleteIncomeSource(id: string): Promise<void> {
    await this.client.delete(`api/v1/accounts/${this.userId}/income/${id}`);
  }
}

export function createStrataClient(config: StrataConfig): StrataClient {
  return new StrataClient(config);
}
```

### 5.4 React Integration

**packages/strata-sdk/src/react/provider.tsx:**
```typescript
import React, { createContext, useContext, useMemo, type ReactNode } from 'react';
import { StrataClient, createStrataClient } from '../client';
import type { StrataConfig } from '../types';

interface StrataContextValue {
  client: StrataClient;
  userId: string;
}

const StrataContext = createContext<StrataContextValue | null>(null);

interface StrataProviderProps {
  config: StrataConfig;
  children: ReactNode;
}

export function StrataProvider({ config, children }: StrataProviderProps) {
  const value = useMemo(
    () => ({
      client: createStrataClient(config),
      userId: config.userId,
    }),
    [config.baseUrl, config.userId]
  );

  return (
    <StrataContext.Provider value={value}>
      {children}
    </StrataContext.Provider>
  );
}

export function useStrataClient(): StrataClient {
  const context = useContext(StrataContext);
  if (!context) {
    throw new Error('useStrataClient must be used within a StrataProvider');
  }
  return context.client;
}

export function useUserId(): string {
  const context = useContext(StrataContext);
  if (!context) {
    throw new Error('useUserId must be used within a StrataProvider');
  }
  return context.userId;
}
```

**packages/strata-sdk/src/react/hooks.ts:**
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useStrataClient } from './provider';
import type {
  Strata,
  RecommendationsResponse,
  ConnectionStatus,
  CashAccount,
  DebtAccount,
  IncomeSource,
} from '../types';

// ============ Query Keys ============

export const strataKeys = {
  all: ['strata'] as const,
  graph: () => [...strataKeys.all, 'graph'] as const,
  recommendations: () => [...strataKeys.all, 'recommendations'] as const,
  connection: () => [...strataKeys.all, 'connection'] as const,
};

// ============ Graph Hooks ============

export function useGraph() {
  const client = useStrataClient();

  return useQuery<Strata>({
    queryKey: strataKeys.graph(),
    queryFn: () => client.getGraph(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useRecommendations(maxResults = 5) {
  const client = useStrataClient();

  return useQuery<RecommendationsResponse>({
    queryKey: [...strataKeys.recommendations(), maxResults],
    queryFn: () => client.getRecommendations(maxResults),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

// ============ Connection Hooks ============

export function useConnectionStatus() {
  const client = useStrataClient();

  return useQuery<ConnectionStatus>({
    queryKey: strataKeys.connection(),
    queryFn: () => client.getConnectionStatus(),
    staleTime: 1000 * 60, // 1 minute
  });
}

export function useCreateConnection() {
  const client = useStrataClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => client.createConnection(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: strataKeys.connection() });
    },
  });
}

export function useDeleteConnection() {
  const client = useStrataClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => client.deleteConnection(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: strataKeys.all });
    },
  });
}

// ============ Manual Entry Hooks ============

export function useAddCashAccount() {
  const client = useStrataClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (account: Omit<CashAccount, 'id'>) => client.addCashAccount(account),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: strataKeys.graph() });
    },
  });
}

export function useUpdateCashAccount() {
  const client = useStrataClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...account }: Partial<CashAccount> & { id: string }) =>
      client.updateCashAccount(id, account),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: strataKeys.graph() });
    },
  });
}

export function useDeleteCashAccount() {
  const client = useStrataClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => client.deleteCashAccount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: strataKeys.graph() });
    },
  });
}

export function useAddDebtAccount() {
  const client = useStrataClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (account: Omit<DebtAccount, 'id'>) => client.addDebtAccount(account),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: strataKeys.graph() });
    },
  });
}

export function useUpdateDebtAccount() {
  const client = useStrataClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...account }: Partial<DebtAccount> & { id: string }) =>
      client.updateDebtAccount(id, account),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: strataKeys.graph() });
    },
  });
}

export function useDeleteDebtAccount() {
  const client = useStrataClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => client.deleteDebtAccount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: strataKeys.graph() });
    },
  });
}

export function useAddIncomeSource() {
  const client = useStrataClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (source: Omit<IncomeSource, 'id'>) => client.addIncomeSource(source),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: strataKeys.graph() });
    },
  });
}

// ============ Derived Data Hooks ============

export function useNetWorth() {
  const { data: graph, ...rest } = useGraph();
  return {
    ...rest,
    data: graph?.context.metrics.net_worth,
  };
}

export function useEmergencyFundMonths() {
  const { data: graph, ...rest } = useGraph();
  return {
    ...rest,
    data: graph?.context.metrics.emergency_fund_months,
  };
}

export function useRiskLevel() {
  const { data: graph, ...rest } = useGraph();
  return {
    ...rest,
    data: graph?.context.risk_indicators.overall_risk_level,
  };
}
```

**packages/strata-sdk/src/react/index.ts:**
```typescript
export { StrataProvider, useStrataClient, useUserId } from './provider';
export {
  strataKeys,
  useGraph,
  useRecommendations,
  useConnectionStatus,
  useCreateConnection,
  useDeleteConnection,
  useAddCashAccount,
  useUpdateCashAccount,
  useDeleteCashAccount,
  useAddDebtAccount,
  useUpdateDebtAccount,
  useDeleteDebtAccount,
  useAddIncomeSource,
  useNetWorth,
  useEmergencyFundMonths,
  useRiskLevel,
} from './hooks';
```

**packages/strata-sdk/src/index.ts:**
```typescript
export { StrataClient, createStrataClient } from './client';
export * from './types';
```

---

## 6. ClearMoney Web App

### 6.1 App Structure

The web app uses Next.js 15 with the App Router. Key architectural decisions:

- **(marketing)** route group: Public pages (landing, about, blog)
- **(app)** route group: Authenticated app experience
- SDK integration via React Query + Strata hooks

### 6.2 Root Layout

**packages/web/src/app/layout.tsx:**
```typescript
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ClearMoney - Financial Clarity, Engineered',
  description: 'Decision tools that explain the tradeoffs. No affiliate bias. No corporate influence.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

**packages/web/src/app/providers.tsx:**
```typescript
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrataProvider } from '@clearmoney/strata-sdk/react';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
          },
        },
      })
  );

  // In production, get userId from auth session
  const userId = 'demo-user-123';

  return (
    <QueryClientProvider client={queryClient}>
      <StrataProvider
        config={{
          baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
          userId,
        }}
      >
        {children}
      </StrataProvider>
    </QueryClientProvider>
  );
}
```

### 6.3 App Shell (Authenticated Layout)

**packages/web/src/app/(app)/layout.tsx:**
```typescript
import { AppShell } from '@/components/layout/AppShell';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
```

**packages/web/src/components/layout/AppShell.tsx:**
```typescript
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Link as LinkIcon,
  Lightbulb,
  Calculator,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Connect', href: '/connect', icon: LinkIcon },
  { name: 'Insights', href: '/insights', icon: Lightbulb },
  { name: 'Tools', href: '/tools', icon: Calculator },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200">
        <div className="flex h-16 items-center px-6 border-b border-slate-200">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">CM</span>
            </div>
            <span className="font-semibold text-slate-900">ClearMoney</span>
          </Link>
        </div>

        <nav className="p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main content */}
      <main className="pl-64">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
```

### 6.4 Dashboard Page

**packages/web/src/app/(app)/page.tsx:**
```typescript
'use client';

import { useGraph, useRecommendations } from '@clearmoney/strata-sdk/react';
import { NetWorthCard } from '@/components/dashboard/NetWorthCard';
import { ContextSummary } from '@/components/dashboard/ContextSummary';
import { QuickInsights } from '@/components/dashboard/QuickInsights';
import { TopRecommendation } from '@/components/dashboard/TopRecommendation';
import { RiskIndicator } from '@/components/dashboard/RiskIndicator';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const { data: graph, isLoading: graphLoading, error: graphError } = useGraph();
  const { data: recs, isLoading: recsLoading } = useRecommendations(3);

  if (graphError) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-slate-900">Connect Your Accounts</h2>
        <p className="mt-2 text-slate-600">
          Link your financial accounts to see your complete picture.
        </p>
        <a
          href="/connect"
          className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium"
        >
          Get Started
        </a>
      </div>
    );
  }

  if (graphLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Your Financial Context</h1>
        <p className="mt-1 text-slate-600">
          Last updated: {new Date(graph!.generated_at).toLocaleString()}
        </p>
      </div>

      {/* Top row: Net Worth + Risk */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <NetWorthCard
            netWorth={graph!.context.metrics.net_worth}
            assets={graph!.context.assets.total}
            liabilities={graph!.context.liabilities.total}
          />
        </div>
        <RiskIndicator
          level={graph!.context.risk_indicators.overall_risk_level}
          risks={graph!.context.risk_indicators.risks}
        />
      </div>

      {/* Context Summary */}
      <ContextSummary context={graph!.context} />

      {/* Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Top Recommendation</h2>
          {recsLoading ? (
            <Skeleton className="h-48" />
          ) : recs?.recommendations[0] ? (
            <TopRecommendation recommendation={recs.recommendations[0]} />
          ) : (
            <p className="text-slate-600">No recommendations at this time.</p>
          )}
        </div>
        <QuickInsights metrics={graph!.context.metrics} />
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-8 w-64" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="lg:col-span-2 h-48" />
        <Skeleton className="h-48" />
      </div>
      <Skeleton className="h-64" />
    </div>
  );
}
```

### 6.5 Key Dashboard Components

**packages/web/src/components/dashboard/NetWorthCard.tsx:**
```typescript
import { TrendingUp, TrendingDown } from 'lucide-react';

interface NetWorthCardProps {
  netWorth: number;
  assets: number;
  liabilities: number;
}

export function NetWorthCard({ netWorth, assets, liabilities }: NetWorthCardProps) {
  const isPositive = netWorth >= 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide">
          Net Worth
        </h3>
        {isPositive ? (
          <TrendingUp className="h-5 w-5 text-emerald-500" />
        ) : (
          <TrendingDown className="h-5 w-5 text-red-500" />
        )}
      </div>

      <p className={`mt-2 text-4xl font-bold ${isPositive ? 'text-slate-900' : 'text-red-600'}`}>
        ${Math.abs(netWorth).toLocaleString()}
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-slate-500">Total Assets</p>
          <p className="text-lg font-semibold text-emerald-600">
            ${assets.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-sm text-slate-500">Total Liabilities</p>
          <p className="text-lg font-semibold text-red-600">
            ${liabilities.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
```

**packages/web/src/components/dashboard/TopRecommendation.tsx:**
```typescript
'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import type { Recommendation } from '@clearmoney/strata-sdk';
import { DecisionTrace } from '@/components/insights/DecisionTrace';

interface TopRecommendationProps {
  recommendation: Recommendation;
}

export function TopRecommendation({ recommendation }: TopRecommendationProps) {
  const [showTrace, setShowTrace] = useState(false);

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-6">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Sparkles className="h-5 w-5 text-blue-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-slate-900">{recommendation.title}</h3>
          <p className="mt-1 text-sm text-slate-600">{recommendation.summary}</p>

          {recommendation.estimated_annual_impact > 0 && (
            <p className="mt-2 text-sm font-medium text-emerald-600">
              Potential impact: ${recommendation.estimated_annual_impact.toLocaleString()}/year
            </p>
          )}

          <div className="mt-4 p-3 bg-white/60 rounded-lg">
            <p className="text-sm font-medium text-slate-700">Recommended Action</p>
            <p className="mt-1 text-sm text-slate-600">{recommendation.action}</p>
          </div>

          {/* Decision Trace Toggle */}
          <button
            onClick={() => setShowTrace(!showTrace)}
            className="mt-4 flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            {showTrace ? (
              <>
                <ChevronUp className="h-4 w-4" />
                Hide reasoning
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                Show why we recommend this
              </>
            )}
          </button>

          {showTrace && (
            <div className="mt-4">
              <DecisionTrace trace={recommendation.trace} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

### 6.6 Decision Trace Component

**packages/web/src/components/insights/DecisionTrace.tsx:**
```typescript
import type { DecisionTrace as DecisionTraceType } from '@clearmoney/strata-sdk';
import { CheckCircle, Database, Calculator } from 'lucide-react';

interface DecisionTraceProps {
  trace: DecisionTraceType;
}

export function DecisionTrace({ trace }: DecisionTraceProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 bg-slate-100 rounded-lg">
          <Calculator className="h-4 w-4 text-slate-600" />
        </div>
        <h4 className="font-medium text-slate-900">{trace.rule_name}</h4>
      </div>

      {/* Steps */}
      <div className="space-y-4">
        {trace.steps.map((step, index) => (
          <div key={index} className="relative pl-6">
            {/* Connector line */}
            {index < trace.steps.length - 1 && (
              <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-slate-200" />
            )}

            {/* Step indicator */}
            <div className="absolute left-0 top-1 h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-xs font-medium text-blue-700">{step.step_number}</span>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-900">{step.description}</p>

              {/* Data used */}
              <div className="mt-2 flex items-start gap-2">
                <Database className="h-4 w-4 text-slate-400 mt-0.5" />
                <div className="text-xs text-slate-500">
                  {Object.entries(step.data_used).map(([key, value]) => (
                    <span key={key} className="inline-block mr-2">
                      <span className="font-medium">{key}:</span>{' '}
                      {typeof value === 'number' ? value.toLocaleString() : String(value)}
                    </span>
                  ))}
                </div>
              </div>

              {/* Calculation */}
              <div className="mt-2 p-2 bg-slate-50 rounded-lg">
                <code className="text-xs text-slate-700">{step.calculation}</code>
              </div>

              {/* Result */}
              <div className="mt-2 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                <span className="text-sm text-slate-600">{step.result}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Conclusion */}
      <div className="mt-4 pt-4 border-t border-slate-200">
        <p className="text-sm font-medium text-slate-900">Conclusion</p>
        <p className="mt-1 text-sm text-slate-600">{trace.conclusion}</p>
      </div>
    </div>
  );
}
```

### 6.7 Connect Page

**packages/web/src/app/(app)/connect/page.tsx:**
```typescript
'use client';

import { useState } from 'react';
import {
  useConnectionStatus,
  useCreateConnection,
  useGraph,
} from '@clearmoney/strata-sdk/react';
import { ProviderCard } from '@/components/connect/ProviderCard';
import { ManualEntrySection } from '@/components/connect/ManualEntrySection';
import { CheckCircle, AlertCircle } from 'lucide-react';

const brokerages = [
  { id: 'schwab', name: 'Charles Schwab', logo: '/logos/schwab.svg' },
  { id: 'fidelity', name: 'Fidelity', logo: '/logos/fidelity.svg' },
  { id: 'robinhood', name: 'Robinhood', logo: '/logos/robinhood.svg' },
  { id: 'vanguard', name: 'Vanguard', logo: '/logos/vanguard.svg' },
];

export default function ConnectPage() {
  const { data: status, isLoading: statusLoading } = useConnectionStatus();
  const { data: graph } = useGraph();
  const createConnection = useCreateConnection();
  const [connecting, setConnecting] = useState(false);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const result = await createConnection.mutateAsync();
      // Redirect to SnapTrade portal
      window.location.href = result.redirect_url;
    } catch (error) {
      console.error('Failed to connect:', error);
      setConnecting(false);
    }
  };

  const isConnected = status?.status === 'connected';

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Connect Your Finances</h1>
        <p className="mt-1 text-slate-600">
          Link your accounts to unlock personalized insights and recommendations.
        </p>
      </div>

      {/* Connection Status */}
      {isConnected && (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
          <CheckCircle className="h-5 w-5 text-emerald-600" />
          <div>
            <p className="font-medium text-emerald-800">Investments Connected</p>
            <p className="text-sm text-emerald-600">
              {graph?.investment_accounts.length || 0} accounts synced
            </p>
          </div>
        </div>
      )}

      {/* Brokerage Connection */}
      <section>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Investment Accounts</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {brokerages.map((broker) => (
            <ProviderCard
              key={broker.id}
              name={broker.name}
              logo={broker.logo}
              connected={isConnected}
              onConnect={handleConnect}
              loading={connecting}
            />
          ))}
        </div>
        <p className="mt-3 text-sm text-slate-500">
          We use SnapTrade for secure, read-only access. We never see your credentials.
        </p>
      </section>

      {/* Manual Entry */}
      <ManualEntrySection />
    </div>
  );
}
```

**packages/web/src/components/connect/ManualEntrySection.tsx:**
```typescript
'use client';

import { useState } from 'react';
import {
  useGraph,
  useAddCashAccount,
  useAddDebtAccount,
  useAddIncomeSource,
} from '@clearmoney/strata-sdk/react';
import { Plus, Building2, CreditCard, DollarSign } from 'lucide-react';

export function ManualEntrySection() {
  const { data: graph } = useGraph();
  const addCash = useAddCashAccount();
  const addDebt = useAddDebtAccount();
  const addIncome = useAddIncomeSource();

  const [activeForm, setActiveForm] = useState<'cash' | 'debt' | 'income' | null>(null);

  return (
    <section className="space-y-6">
      <h2 className="text-lg font-semibold text-slate-900">Manual Entry</h2>
      <p className="text-sm text-slate-600">
        Add your cash accounts, debts, and income for a complete picture.
      </p>

      {/* Quick add buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => setActiveForm('cash')}
          className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-colors"
        >
          <div className="p-2 bg-emerald-100 rounded-lg">
            <Building2 className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="text-left">
            <p className="font-medium text-slate-900">Cash Account</p>
            <p className="text-sm text-slate-500">
              {graph?.cash_accounts.length || 0} added
            </p>
          </div>
          <Plus className="h-5 w-5 text-slate-400 ml-auto" />
        </button>

        <button
          onClick={() => setActiveForm('debt')}
          className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-colors"
        >
          <div className="p-2 bg-red-100 rounded-lg">
            <CreditCard className="h-5 w-5 text-red-600" />
          </div>
          <div className="text-left">
            <p className="font-medium text-slate-900">Debt</p>
            <p className="text-sm text-slate-500">
              {graph?.debt_accounts.length || 0} added
            </p>
          </div>
          <Plus className="h-5 w-5 text-slate-400 ml-auto" />
        </button>

        <button
          onClick={() => setActiveForm('income')}
          className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-colors"
        >
          <div className="p-2 bg-blue-100 rounded-lg">
            <DollarSign className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-left">
            <p className="font-medium text-slate-900">Income</p>
            <p className="text-sm text-slate-500">
              {graph?.income_sources.length || 0} added
            </p>
          </div>
          <Plus className="h-5 w-5 text-slate-400 ml-auto" />
        </button>
      </div>

      {/* Forms (simplified for MVP) */}
      {activeForm === 'cash' && (
        <CashAccountForm
          onSubmit={async (data) => {
            await addCash.mutateAsync(data);
            setActiveForm(null);
          }}
          onCancel={() => setActiveForm(null)}
        />
      )}
      {activeForm === 'debt' && (
        <DebtAccountForm
          onSubmit={async (data) => {
            await addDebt.mutateAsync(data);
            setActiveForm(null);
          }}
          onCancel={() => setActiveForm(null)}
        />
      )}
      {activeForm === 'income' && (
        <IncomeSourceForm
          onSubmit={async (data) => {
            await addIncome.mutateAsync(data);
            setActiveForm(null);
          }}
          onCancel={() => setActiveForm(null)}
        />
      )}
    </section>
  );
}

// Form components (simplified for MVP)
function CashAccountForm({ onSubmit, onCancel }: { onSubmit: (data: any) => void; onCancel: () => void }) {
  const [name, setName] = useState('');
  const [type, setType] = useState<'checking' | 'savings' | 'hysa'>('checking');
  const [balance, setBalance] = useState('');
  const [apy, setApy] = useState('0.01');

  return (
    <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-4">
      <h3 className="font-medium">Add Cash Account</h3>
      <input
        type="text"
        placeholder="Account name (e.g., Chase Checking)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full p-2 border border-slate-200 rounded-lg"
      />
      <select
        value={type}
        onChange={(e) => setType(e.target.value as any)}
        className="w-full p-2 border border-slate-200 rounded-lg"
      >
        <option value="checking">Checking</option>
        <option value="savings">Savings</option>
        <option value="hysa">High-Yield Savings</option>
      </select>
      <input
        type="number"
        placeholder="Balance"
        value={balance}
        onChange={(e) => setBalance(e.target.value)}
        className="w-full p-2 border border-slate-200 rounded-lg"
      />
      <input
        type="number"
        placeholder="APY %"
        step="0.01"
        value={apy}
        onChange={(e) => setApy(e.target.value)}
        className="w-full p-2 border border-slate-200 rounded-lg"
      />
      <div className="flex gap-2">
        <button
          onClick={() => onSubmit({ name, account_type: type, balance: parseFloat(balance), apy: parseFloat(apy) })}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Add
        </button>
        <button onClick={onCancel} className="px-4 py-2 border border-slate-200 rounded-lg">
          Cancel
        </button>
      </div>
    </div>
  );
}

// Similar forms for DebtAccountForm and IncomeSourceForm...
function DebtAccountForm({ onSubmit, onCancel }: { onSubmit: (data: any) => void; onCancel: () => void }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('credit_card');
  const [balance, setBalance] = useState('');
  const [rate, setRate] = useState('');
  const [minimum, setMinimum] = useState('');

  return (
    <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-4">
      <h3 className="font-medium">Add Debt</h3>
      <input
        type="text"
        placeholder="Debt name (e.g., Chase Sapphire)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full p-2 border border-slate-200 rounded-lg"
      />
      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="w-full p-2 border border-slate-200 rounded-lg"
      >
        <option value="credit_card">Credit Card</option>
        <option value="student_loan">Student Loan</option>
        <option value="auto_loan">Auto Loan</option>
        <option value="mortgage">Mortgage</option>
        <option value="personal_loan">Personal Loan</option>
      </select>
      <input
        type="number"
        placeholder="Balance"
        value={balance}
        onChange={(e) => setBalance(e.target.value)}
        className="w-full p-2 border border-slate-200 rounded-lg"
      />
      <input
        type="number"
        placeholder="Interest Rate %"
        step="0.1"
        value={rate}
        onChange={(e) => setRate(e.target.value)}
        className="w-full p-2 border border-slate-200 rounded-lg"
      />
      <input
        type="number"
        placeholder="Minimum Payment"
        value={minimum}
        onChange={(e) => setMinimum(e.target.value)}
        className="w-full p-2 border border-slate-200 rounded-lg"
      />
      <div className="flex gap-2">
        <button
          onClick={() => onSubmit({
            name,
            debt_type: type,
            balance: parseFloat(balance),
            interest_rate: parseFloat(rate),
            minimum_payment: minimum ? parseFloat(minimum) : undefined,
          })}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Add
        </button>
        <button onClick={onCancel} className="px-4 py-2 border border-slate-200 rounded-lg">
          Cancel
        </button>
      </div>
    </div>
  );
}

function IncomeSourceForm({ onSubmit, onCancel }: { onSubmit: (data: any) => void; onCancel: () => void }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('salary');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState('monthly');

  return (
    <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-4">
      <h3 className="font-medium">Add Income Source</h3>
      <input
        type="text"
        placeholder="Income name (e.g., Day Job)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full p-2 border border-slate-200 rounded-lg"
      />
      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="w-full p-2 border border-slate-200 rounded-lg"
      >
        <option value="salary">Salary</option>
        <option value="freelance">Freelance</option>
        <option value="investment">Investment Income</option>
        <option value="rental">Rental Income</option>
        <option value="other">Other</option>
      </select>
      <input
        type="number"
        placeholder="Amount (gross)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full p-2 border border-slate-200 rounded-lg"
      />
      <select
        value={frequency}
        onChange={(e) => setFrequency(e.target.value)}
        className="w-full p-2 border border-slate-200 rounded-lg"
      >
        <option value="weekly">Weekly</option>
        <option value="biweekly">Bi-weekly</option>
        <option value="monthly">Monthly</option>
        <option value="annual">Annual</option>
      </select>
      <div className="flex gap-2">
        <button
          onClick={() => onSubmit({
            name,
            source_type: type,
            amount: parseFloat(amount),
            frequency,
            is_variable: false,
          })}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Add
        </button>
        <button onClick={onCancel} className="px-4 py-2 border border-slate-200 rounded-lg">
          Cancel
        </button>
      </div>
    </div>
  );
}
```

---

## 7. Database Schema

### 7.1 SQLAlchemy Models

**packages/strata-api/app/models/database.py:**
```python
from datetime import datetime
from typing import Optional
from sqlalchemy import (
    Column,
    String,
    Float,
    Boolean,
    DateTime,
    ForeignKey,
    Enum as SQLEnum,
    Text,
)
from sqlalchemy.orm import declarative_base, relationship
import enum

Base = declarative_base()

# ============ Enums ============

class AccountType(enum.Enum):
    checking = "checking"
    savings = "savings"
    hysa = "hysa"
    money_market = "money_market"

class DebtType(enum.Enum):
    credit_card = "credit_card"
    student_loan = "student_loan"
    auto_loan = "auto_loan"
    mortgage = "mortgage"
    personal_loan = "personal_loan"
    other = "other"

class IncomeFrequency(enum.Enum):
    weekly = "weekly"
    biweekly = "biweekly"
    monthly = "monthly"
    annual = "annual"

class IncomeType(enum.Enum):
    salary = "salary"
    freelance = "freelance"
    investment = "investment"
    rental = "rental"
    other = "other"

# ============ Models ============

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True)
    email = Column(String, unique=True, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    connections = relationship("Connection", back_populates="user", cascade="all, delete-orphan")
    cash_accounts = relationship("CashAccount", back_populates="user", cascade="all, delete-orphan")
    debt_accounts = relationship("DebtAccount", back_populates="user", cascade="all, delete-orphan")
    income_sources = relationship("IncomeSource", back_populates="user", cascade="all, delete-orphan")


class Connection(Base):
    """Stores provider connection credentials."""
    __tablename__ = "connections"

    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    provider = Column(String, nullable=False)  # "snaptrade", "plaid", etc.
    provider_user_id = Column(String, nullable=True)  # Provider's user ID
    user_secret = Column(String, nullable=True)  # Encrypted secret
    status = Column(String, default="pending")  # pending, connected, error
    connected_at = Column(DateTime, nullable=True)
    last_synced_at = Column(DateTime, nullable=True)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="connections")


class CashAccount(Base):
    """Manually entered cash accounts."""
    __tablename__ = "cash_accounts"

    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    account_type = Column(SQLEnum(AccountType), nullable=False)
    balance = Column(Float, nullable=False)
    apy = Column(Float, default=0.0)
    institution_name = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="cash_accounts")


class DebtAccount(Base):
    """Manually entered debt accounts."""
    __tablename__ = "debt_accounts"

    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    debt_type = Column(SQLEnum(DebtType), nullable=False)
    balance = Column(Float, nullable=False)
    interest_rate = Column(Float, nullable=False)
    minimum_payment = Column(Float, nullable=True)
    institution_name = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="debt_accounts")


class IncomeSource(Base):
    """Manually entered income sources."""
    __tablename__ = "income_sources"

    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    source_type = Column(SQLEnum(IncomeType), nullable=False)
    amount = Column(Float, nullable=False)
    frequency = Column(SQLEnum(IncomeFrequency), nullable=False)
    is_variable = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="income_sources")
```

### 7.2 PostgreSQL Migration

**Initial migration (Alembic):**
```sql
-- Users table
CREATE TABLE users (
    id VARCHAR PRIMARY KEY,
    email VARCHAR UNIQUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Connections table
CREATE TABLE connections (
    id VARCHAR PRIMARY KEY,
    user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR NOT NULL,
    provider_user_id VARCHAR,
    user_secret VARCHAR,
    status VARCHAR DEFAULT 'pending',
    connected_at TIMESTAMP,
    last_synced_at TIMESTAMP,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_connections_user_id ON connections(user_id);

-- Cash accounts table
CREATE TYPE account_type AS ENUM ('checking', 'savings', 'hysa', 'money_market');

CREATE TABLE cash_accounts (
    id VARCHAR PRIMARY KEY,
    user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR NOT NULL,
    account_type account_type NOT NULL,
    balance FLOAT NOT NULL,
    apy FLOAT DEFAULT 0.0,
    institution_name VARCHAR,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_cash_accounts_user_id ON cash_accounts(user_id);

-- Debt accounts table
CREATE TYPE debt_type AS ENUM (
    'credit_card', 'student_loan', 'auto_loan',
    'mortgage', 'personal_loan', 'other'
);

CREATE TABLE debt_accounts (
    id VARCHAR PRIMARY KEY,
    user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR NOT NULL,
    debt_type debt_type NOT NULL,
    balance FLOAT NOT NULL,
    interest_rate FLOAT NOT NULL,
    minimum_payment FLOAT,
    institution_name VARCHAR,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_debt_accounts_user_id ON debt_accounts(user_id);

-- Income sources table
CREATE TYPE income_type AS ENUM ('salary', 'freelance', 'investment', 'rental', 'other');
CREATE TYPE income_frequency AS ENUM ('weekly', 'biweekly', 'monthly', 'annual');

CREATE TABLE income_sources (
    id VARCHAR PRIMARY KEY,
    user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR NOT NULL,
    source_type income_type NOT NULL,
    amount FLOAT NOT NULL,
    frequency income_frequency NOT NULL,
    is_variable BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_income_sources_user_id ON income_sources(user_id);
```

---

## 8. API Contracts

### 8.1 OpenAPI Specification (Key Endpoints)

```yaml
openapi: 3.0.3
info:
  title: Strata API
  version: 1.0.0
  description: Financial context aggregation and recommendation engine

paths:
  /api/v1/connections:
    post:
      summary: Initialize brokerage connection
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                user_id:
                  type: string
              required:
                - user_id
      responses:
        '200':
          description: Connection initiated
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ConnectionResponse'

  /api/v1/connections/{user_id}/status:
    get:
      summary: Get connection status
      parameters:
        - name: user_id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Connection status
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ConnectionStatus'

  /api/v1/graph/{user_id}:
    get:
      summary: Get complete context graph
      parameters:
        - name: user_id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Context graph
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Strata'

  /api/v1/recommendations/{user_id}:
    get:
      summary: Get personalized recommendations
      parameters:
        - name: user_id
          in: path
          required: true
          schema:
            type: string
        - name: max_results
          in: query
          schema:
            type: integer
            default: 5
      responses:
        '200':
          description: Recommendations with decision traces
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/RecommendationsResponse'

  /api/v1/accounts/{user_id}/cash:
    post:
      summary: Add cash account
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CashAccountCreate'
      responses:
        '201':
          description: Account created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/CashAccount'

components:
  schemas:
    ConnectionResponse:
      type: object
      properties:
        redirect_url:
          type: string
        provider:
          type: string

    ConnectionStatus:
      type: object
      properties:
        provider:
          type: string
        status:
          type: string
          enum: [connected, disconnected, pending, error]
        connected_at:
          type: string
          format: date-time

    Strata:
      type: object
      properties:
        user_id:
          type: string
        context:
          $ref: '#/components/schemas/FinancialContext'
        investment_accounts:
          type: array
          items:
            $ref: '#/components/schemas/InvestmentAccount'
        cash_accounts:
          type: array
          items:
            $ref: '#/components/schemas/CashAccount'
        debt_accounts:
          type: array
          items:
            $ref: '#/components/schemas/DebtAccount'
        income_sources:
          type: array
          items:
            $ref: '#/components/schemas/IncomeSource'
        generated_at:
          type: string
          format: date-time

    FinancialContext:
      type: object
      properties:
        assets:
          $ref: '#/components/schemas/AssetsSummary'
        liabilities:
          $ref: '#/components/schemas/LiabilitiesSummary'
        income:
          $ref: '#/components/schemas/IncomeSummary'
        metrics:
          $ref: '#/components/schemas/Metrics'
        risk_indicators:
          $ref: '#/components/schemas/RiskIndicators'

    Recommendation:
      type: object
      properties:
        id:
          type: string
        type:
          type: string
        priority:
          type: integer
        title:
          type: string
        summary:
          type: string
        action:
          type: string
        estimated_annual_impact:
          type: number
        confidence:
          type: number
        trace:
          $ref: '#/components/schemas/DecisionTrace'
        narrative:
          type: string

    DecisionTrace:
      type: object
      properties:
        rule_id:
          type: string
        rule_name:
          type: string
        steps:
          type: array
          items:
            $ref: '#/components/schemas/TraceStep'
        inputs_used:
          type: object
        conclusion:
          type: string

    TraceStep:
      type: object
      properties:
        step_number:
          type: integer
        description:
          type: string
        data_used:
          type: object
        calculation:
          type: string
        result:
          type: string
```

---

## 9. UI/UX Specifications

### 9.1 Design System

The ClearMoney UI follows these principles:

**Colors:**
```css
/* Primary palette */
--blue-600: #2563eb;    /* Primary actions */
--blue-50: #eff6ff;     /* Primary backgrounds */

/* Semantic colors */
--emerald-500: #10b981; /* Positive/success */
--red-500: #ef4444;     /* Negative/danger */
--amber-500: #f59e0b;   /* Warning */

/* Neutrals */
--slate-900: #0f172a;   /* Primary text */
--slate-600: #475569;   /* Secondary text */
--slate-200: #e2e8f0;   /* Borders */
--slate-50: #f8fafc;    /* Backgrounds */
```

**Typography:**
- Font: Inter (system fallback: -apple-system, BlinkMacSystemFont)
- Headings: font-semibold or font-bold
- Body: font-normal
- Small/labels: text-sm or text-xs with uppercase tracking

**Spacing:**
- Use Tailwind's spacing scale (4, 6, 8, 12, 16, 24, 32)
- Section padding: p-6 or p-8
- Component padding: p-4
- Gap between items: gap-4 or gap-6

**Components:**
- Cards: rounded-2xl border border-slate-200 bg-white
- Buttons (primary): bg-blue-600 text-white rounded-lg
- Buttons (secondary): border border-slate-200 rounded-lg
- Inputs: border border-slate-200 rounded-lg p-2

### 9.2 Key Screens

**Dashboard:**
```
┌────────────────────────────────────────────────────────────┐
│ [Logo] ClearMoney                          [User Menu]     │
├──────────┬─────────────────────────────────────────────────┤
│          │                                                 │
│ Dashboard│  Your Financial Context                         │
│ Connect  │  Last updated: Jan 26, 2026 3:45 PM            │
│ Insights │                                                 │
│ Tools    │  ┌─────────────────────────┐ ┌───────────────┐ │
│          │  │ NET WORTH               │ │ RISK LEVEL    │ │
│          │  │ $245,680                │ │ 🟡 Medium     │ │
│          │  │ Assets: $312,000        │ │ 2 items       │ │
│          │  │ Debts:  $66,320         │ │ need attention│ │
│          │  └─────────────────────────┘ └───────────────┘ │
│          │                                                 │
│          │  ┌─────────────────────────────────────────────┐│
│          │  │ CONTEXT SUMMARY                             ││
│          │  │ ┌─────────┐ ┌─────────┐ ┌─────────┐        ││
│          │  │ │Cash     │ │Invested │ │Debt     │        ││
│          │  │ │$45,000  │ │$267,000 │ │$66,320  │        ││
│          │  │ └─────────┘ └─────────┘ └─────────┘        ││
│          │  └─────────────────────────────────────────────┘│
│          │                                                 │
│          │  ┌──────────────────────┐ ┌────────────────────┐│
│          │  │ TOP RECOMMENDATION   │ │ QUICK INSIGHTS     ││
│          │  │ ✨ Pay Off Credit Card│ │ • EF: 7.2 months  ││
│          │  │ Save $2,340/year     │ │ • DTI: 24%        ││
│          │  │ [Show reasoning ▼]   │ │ • Savings: 18%    ││
│          │  └──────────────────────┘ └────────────────────┘│
└──────────┴─────────────────────────────────────────────────┘
```

**Decision Trace (expanded):**
```
┌─────────────────────────────────────────────────────────────┐
│ 🧮 High Interest Debt Analysis                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ① Identify high-interest debts (>7% APR)                   │
│   📊 Data: Chase Sapphire $8,500 @ 24.99%                  │
│   ┌────────────────────────────────────────────────────┐   │
│   │ Found 1 debt above 7% threshold                    │   │
│   │ Highest rate: Chase Sapphire at 24.99%             │   │
│   └────────────────────────────────────────────────────┘   │
│   ✓ Result: Highest rate: Chase Sapphire at 24.99%         │
│   │                                                         │
│   ▼                                                         │
│ ② Compare debt rate to expected investment returns          │
│   📊 Data: debt_rate=24.99%, expected_market=7%            │
│   ┌────────────────────────────────────────────────────┐   │
│   │ 24.99% debt vs 7% expected return                  │   │
│   └────────────────────────────────────────────────────┘   │
│   ✓ Paying debt = guaranteed 24.99% return                 │
│   │                                                         │
│   ▼                                                         │
│ ③ Calculate annual interest savings                         │
│   📊 Data: balance=$8,500, rate=24.99%                     │
│   ┌────────────────────────────────────────────────────┐   │
│   │ $8,500 × 24.99% = $2,124/year                      │   │
│   └────────────────────────────────────────────────────┘   │
│   ✓ $2,124 annual interest                                 │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ Conclusion                                                  │
│ Prioritize paying off Chase Sapphire - guaranteed 24.99%   │
│ return beats any expected market performance.               │
└─────────────────────────────────────────────────────────────┘
```

---

## 10. Demo Script

### 10.1 YC Demo Day Script (2:30)

**[0:00-0:20] THE PROBLEM**

> "Every year, Americans lose $150 billion to bad financial decisions - not because they're dumb, but because their financial tools are.
>
> Current apps show you data in silos. Your brokerage shows your stocks. Your bank shows your cash. Your credit card shows your debt. None of them talk to each other, and none of them tell you what to actually DO.
>
> We're building Strata - the infrastructure that connects all your financial data and turns it into actionable, explainable recommendations."

**[0:20-0:35] THE DEMO SETUP**

> "Let me show you what this looks like. Here's a typical ClearMoney user who just connected their accounts..."

*[Show dashboard with real data: $245K net worth, accounts connected]*

**[0:35-1:15] THE MAGIC MOMENT**

> "Watch what happens. The system sees that this user has $45,000 sitting in a checking account earning 0.01%, $8,500 in credit card debt at 24.99%, and a portfolio that's 85% tech stocks.
>
> Here's the first recommendation: Pay off that credit card. That's a guaranteed 24.99% return.
>
> But here's what makes Strata different. Click 'show reasoning'..."

*[Expand decision trace]*

> "You see exactly how we got there. Step 1: we identified the high-interest debt. Step 2: we compared it to expected market returns. Step 3: we calculated the savings - $2,124 per year.
>
> This isn't a black box. Every recommendation shows its work, like a financial advisor would."

**[1:15-1:45] THE PLATFORM PLAY**

> "Now, Strata isn't just an app - it's infrastructure.
>
> Here's our SDK. Any fintech can plug into Strata and instantly make their tools smarter."

*[Show SDK code snippet]*

```typescript
const { data } = useGraph();
const efMonths = data.context.metrics.emergency_fund_months;
// Calculator auto-populates with real data
```

> "Today we're powering ClearMoney. Tomorrow, this could power every financial app on the market."

**[1:45-2:10] THE VISION + TRACTION**

> "We started with investments and basic banking. Our roadmap includes:
> - Real estate valuations
> - Equity compensation
> - Tax optimization
> - Insurance analysis
>
> The full picture of your financial life, with recommendations you can actually trust.
>
> We're live today with [X] users managing [$Y] in assets."

**[2:10-2:30] THE ASK**

> "We're raising $2M to:
> - Expand provider integrations
> - Build out the recommendation engine
> - Grow to 10,000 users
>
> Strata: The financial intelligence layer for the next generation of money apps.
>
> Thank you."

### 10.2 Demo Data Setup

For the demo, prepare a realistic user profile:

```json
{
  "user_id": "demo-yc-2026",
  "investment_accounts": [
    {
      "name": "Schwab Brokerage",
      "balance": 187000,
      "holdings": [
        { "symbol": "VTI", "value": 45000 },
        { "symbol": "AAPL", "value": 52000 },
        { "symbol": "NVDA", "value": 48000 },
        { "symbol": "MSFT", "value": 42000 }
      ]
    },
    {
      "name": "Fidelity 401k",
      "balance": 80000,
      "is_tax_advantaged": true
    }
  ],
  "cash_accounts": [
    { "name": "Chase Checking", "balance": 45000, "apy": 0.01 },
    { "name": "Marcus Savings", "balance": 12000, "apy": 4.5 }
  ],
  "debt_accounts": [
    { "name": "Chase Sapphire", "balance": 8500, "rate": 24.99 },
    { "name": "Student Loans", "balance": 28000, "rate": 5.5 }
  ],
  "income_sources": [
    { "name": "Software Engineer", "amount": 185000, "frequency": "annual" }
  ]
}
```

This creates a compelling demo that shows:
- Significant assets ($312K+ in investments + cash)
- Obvious optimization opportunities (checking account yield, credit card debt)
- Portfolio concentration risk (85% tech)
- Cross-domain insights (emergency fund + portfolio risk correlation)

---

## 11. Implementation Phases

### Phase 1: Foundation (Week 1)

**Goal:** Monorepo setup + basic API + database

| Task | Owner | Deliverable |
|------|-------|-------------|
| Set up Turborepo monorepo | Backend | `turbo.json`, workspace configs |
| Create FastAPI project skeleton | Backend | Basic endpoints, health check |
| Set up PostgreSQL + Alembic | Backend | Migrations, models |
| Create SDK package skeleton | Frontend | TypeScript types, client stub |
| Set up Next.js app structure | Frontend | Route groups, layouts |

**Milestone:** `npm run dev` starts all services

### Phase 2: Core Integration (Week 2)

**Goal:** SnapTrade working + manual entry

| Task | Owner | Deliverable |
|------|-------|-------------|
| Implement SnapTrade provider | Backend | OAuth flow, account fetching |
| Build provider abstraction | Backend | `BaseProvider` interface |
| Implement manual entry CRUD | Backend | Cash, debt, income endpoints |
| Build SDK React hooks | Frontend | `useGraph`, mutations |
| Create Connect page | Frontend | Provider cards, forms |

**Milestone:** Can connect brokerage and enter manual data

### Phase 3: Intelligence Layer (Week 3)

**Goal:** Graph builder + recommendations

| Task | Owner | Deliverable |
|------|-------|-------------|
| Build GraphBuilder service | Backend | Unified context model |
| Implement 5 recommendation rules | Backend | With decision traces |
| Add Claude narrative generation | Backend | LLM-enhanced explanations |
| Build Dashboard page | Frontend | Net worth, metrics, summary |
| Build Decision Trace component | Frontend | Expandable reasoning UI |

**Milestone:** Dashboard shows recommendations with traces

### Phase 4: Polish + Demo (Week 4)

**Goal:** Demo-ready product

| Task | Owner | Deliverable |
|------|-------|-------------|
| Add risk indicators | Backend | Concentration, emergency fund alerts |
| Create Insights page | Frontend | Full recommendations list |
| Build 1 "smart" calculator | Frontend | Emergency fund with auto-populate |
| Demo data seeding | Both | Realistic demo user |
| Bug fixes + polish | Both | Smooth demo flow |
| Deploy to staging | DevOps | Vercel + Railway/Fly |

**Milestone:** 2-minute demo runs smoothly

### Tech Stack Summary

| Layer | Technology |
|-------|------------|
| **Monorepo** | Turborepo + pnpm workspaces |
| **Backend** | FastAPI, SQLAlchemy, Alembic |
| **Database** | PostgreSQL |
| **SDK** | TypeScript, React Query |
| **Frontend** | Next.js 15, Tailwind CSS, shadcn/ui |
| **AI** | Claude API (Anthropic) |
| **Brokerage** | SnapTrade |
| **Deployment** | Vercel (web) + Railway (API) |

### Environment Variables

```bash
# API (.env)
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/strata
SNAPTRADE_CLIENT_ID=your_client_id
SNAPTRADE_CONSUMER_KEY=your_consumer_key
ANTHROPIC_API_KEY=sk-ant-...
SECRET_KEY=random_secret_for_sessions
CORS_ORIGINS=["http://localhost:3000"]

# Web (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Appendix: Quick Start Commands

```bash
# Clone and install
git clone <repo>
cd clearmoney
pnpm install

# Start database
docker-compose up -d postgres

# Run migrations
pnpm run db:migrate

# Start development
pnpm run dev

# This starts:
# - API at http://localhost:8000
# - Web at http://localhost:3000
# - SDK in watch mode
```

---

*End of Implementation Specification*
