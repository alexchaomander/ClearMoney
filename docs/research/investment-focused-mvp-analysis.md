# Investment-Focused MVP: Strategic Analysis

**Date:** January 2026
**Purpose:** Evaluate building Context Graph with investment accounts (brokerages, 401ks) as MVP instead of bank accounts

---

## Executive Summary

An investment-focused MVP is a **compelling alternative** to the traditional bank-first approach. Key advantages:

1. **Direct APIs exist** — Schwab, Interactive Brokers, and Alpaca offer free retail APIs (banks don't)
2. **Lower costs** — Mix of free direct APIs + cheaper specialized aggregator (SnapTrade)
3. **Less competition** — Most fintech focuses on spending/transactions, not wealth
4. **Better alignment** — Fits the "advisor-grade recommendations" vision in the PRD
5. **Natural expansion** — Add banking later via Plaid when needed

**Recommended Strategy:** Hybrid approach using direct brokerage APIs (free) + SnapTrade (investment-specialized aggregator)

---

## Why Investment-First Makes Sense

### Comparison: Banking vs Investment MVP

| Factor | Banking MVP | Investment MVP |
|--------|-------------|----------------|
| **Direct APIs** | Almost none | Yes (Schwab, IBKR, Alpaca) |
| **Aggregator Dependency** | 100% | Partial (can mix direct + aggregator) |
| **Data Quality** | Varies widely | High (brokerages have clean data) |
| **Market Differentiation** | Commoditized (Mint, Copilot, etc.) | Less crowded |
| **Use Case Fit** | General PFM | Aligns with advisor-grade vision |
| **Regulatory Pressure** | FDX/1033 uncertainty | More stable |

### Use Cases Enabled by Investment Data

Investment-first enables the high-value "advisor-grade" recommendations from the PRD:

- ✅ Roth vs Traditional IRA analysis
- ✅ Asset allocation review and rebalancing alerts
- ✅ Tax-loss harvesting candidates
- ✅ Portfolio concentration warnings
- ✅ Retirement projections and gap analysis
- ✅ Fee analysis (expense ratios, advisory fees)
- ✅ 401k optimization (contribution limits, employer match)

These are higher-value than transaction categorization and spending insights.

---

## Direct Brokerage APIs (Free Access)

### Charles Schwab

**Portal:** [developer.schwab.com](https://developer.schwab.com/)

**Access:** Free with any Schwab brokerage account. No minimum balance required.

**Capabilities:**
- Account positions and balances
- Transaction history
- Trading (equities, options)
- Market data (some 15-min delayed)

**Coverage:** Massive — includes all former TD Ameritrade users after 2020 acquisition

**Limitations:**
- Manual re-authentication required every 7 days
- Some data feeds have 15-minute delay
- Account must be "Think or Swim enabled"

**Why This Matters:** Schwab is one of the largest retail brokerages. Free API access to their entire user base is significant.

### Interactive Brokers (IBKR)

**Portal:** [interactivebrokers.com/en/trading/ib-api.php](https://www.interactivebrokers.com/en/trading/ib-api.php)

**Access:** Free with IBKR account

**Capabilities:**
- Full trading capabilities
- Real-time market data
- Portfolio positions
- Account balances

**Coverage:** Popular with active traders, international investors

**Limitations:**
- More complex API than Schwab
- Some data fees for premium market data

### Alpaca

**Portal:** [alpaca.markets](https://alpaca.markets/)

**Access:** Free, commission-free trading

**Capabilities:**
- Trading (stocks, ETFs, crypto, options)
- Paper trading (free forever)
- Real-time positions
- 24/5 trading (as of 2025)

**Coverage:** Growing user base, popular with developers and algorithmic traders

**2025 Updates:**
- Achieved Nasdaq exchange membership
- Launched 24/5 US equity trading
- Full MCP (Model Context Protocol) support for AI trading

**Broker API:** Alpaca also offers a Broker API for building full brokerage experiences (white-label). This is a different product than their retail trading API.

### E*Trade

**Status:** Now part of Morgan Stanley. API access is available but documentation is less developer-friendly than Schwab.

### Summary: Direct API Coverage

| Brokerage | API Cost | Real-time Data | Trading | Dev Experience |
|-----------|----------|----------------|---------|----------------|
| Schwab | Free | Partial | Yes | ⭐⭐⭐⭐ |
| IBKR | Free | Yes (fees for some) | Yes | ⭐⭐⭐ |
| Alpaca | Free | Yes | Yes | ⭐⭐⭐⭐⭐ |
| E*Trade | Free | Yes | Yes | ⭐⭐ |

**Estimated Coverage:** 20-30% of US retail investment accounts with direct APIs alone.

---

## Retirement Account Access (401k, IRA, etc.)

### The Challenge

Unlike taxable brokerage accounts, retirement accounts don't have public retail APIs. The APIs that exist are for:
- Plan sponsors (employers)
- Registered investment advisors
- Institutional partners

Individual participants must go through aggregators.

### Major 401k Providers

#### Fidelity NetBenefits / WorkplaceXchange

**Developer Portal:** [workplacexchange.fidelity.com](https://workplacexchange.fidelity.com/)

**Available APIs:**
- WI Balances API (multi-product account balances)
- HRP Election & Loan API (benefit plan participation)
- HRP Participant API (personal info, work assignments)
- HRP Pay Statements API (payroll data)

**Access:** Plan sponsors and investment professionals only. Not available to build consumer apps for participants directly.

**Workaround:** Must use aggregator (Plaid, SnapTrade, Yodlee) for participant-level access.

#### Empower Retirement

**Developer Portal:** [developer.empower-retirement.com](https://developer.empower-retirement.com/)

**Available APIs:**
- Balance API (participant-level balance data, investments, loans, vesting)

**Access:** Requires application and approval. More accessible than Fidelity but still gatekept.

**Note:** Empower is one of the largest 401k recordkeepers after acquiring MassMutual's retirement business.

#### Vanguard

**Status:** No public developer API for retail users.

**Access:** Aggregator only (Plaid, SnapTrade).

#### Principal Financial

**2025 Update:** Principal tightened API access rules in summer 2025, blocking many third-party aggregators from syncing 401k data. This affected Mint, YNAB, Monarch Money, and others.

**Current Status:** Very limited access. Some aggregators have been cut off entirely.

### Retirement Account Access Summary

| Provider | Direct API | Aggregator Access | Notes |
|----------|-----------|-------------------|-------|
| Fidelity 401k | Plan sponsors only | Plaid, SnapTrade | No direct consumer access |
| Empower | Approval required | Plaid, SnapTrade | Balance API available |
| Vanguard | None | Plaid, SnapTrade | Aggregator only |
| Principal | Blocked in 2025 | Limited | Major disruption |
| T. Rowe Price | None | Plaid | Aggregator only |
| TIAA | None | Plaid, Yodlee | Aggregator only |

**Key Insight:** For 401k data, you need an aggregator. The question is which one.

---

## SnapTrade: Investment-Specialized Aggregator

### Overview

SnapTrade is a financial data aggregator built specifically for investment accounts. Unlike Plaid (which is banking-first), SnapTrade focuses on:
- Retail brokerage accounts
- Investment data normalization
- Trading capabilities

**Website:** [snaptrade.com](https://snaptrade.com/)
**Docs:** [docs.snaptrade.com](https://docs.snaptrade.com/)

### Supported Brokerages

SnapTrade supports 22+ brokerages including:

**US Brokerages:**
- Charles Schwab
- Fidelity (requires application)
- Vanguard
- E*Trade
- Robinhood
- Webull
- Public
- Tastytrade
- Alpaca
- Tradier
- TradeStation

**International:**
- Interactive Brokers
- Questrade (Canada)
- Wealthsimple (Canada)

**Crypto:**
- Coinbase
- Kraken

**Retirement:**
- Some 401k support (brokerage-dependent)
- Empower Retirement listed

### Key Differentiators from Plaid

| Feature | SnapTrade | Plaid |
|---------|-----------|-------|
| **Focus** | Investment accounts | Banking + some investments |
| **Data Normalization** | Pre-normalized (ticker symbols, etc.) | Requires interpretation |
| **Trading** | Yes, on supported brokers | No (read-only) |
| **Connection Success** | >95% | Varies |
| **Real-time Data** | Yes (paid tier) | Daily refresh |
| **Investment Coverage** | Deep | Broader but shallower |

### Pricing

**Free Tier:**
- Read-only access
- Daily data updates (not real-time)
- 5 brokerage connections
- Excludes some brokerages (Alpaca, Fidelity, Questrade, Tradestation, Tradier)

**Paid Tier:**
- All supported brokerages
- Trading API access
- Real-time holdings data
- Volume-based discounts
- Dedicated customer success manager
- Premium support (Slack channel)
- Integration support

**Pricing Model:** Volume-based, custom quotes. Expected to be cheaper than Plaid for investment-only use cases.

### Limitations

- Smaller company than Plaid (startup risk)
- Some brokerages require application (Fidelity)
- 401k coverage is brokerage-dependent
- Less banking coverage (that's not their focus)

---

## MVP Strategy Options

### Strategy A: Direct APIs Only

Build direct integrations with brokerages that have public APIs.

**Architecture:**
```
┌─────────────────────────────────┐
│     Context Graph Platform      │
└───────────────┬─────────────────┘
                │
    ┌───────────┼───────────┐
    │           │           │
┌───▼───┐   ┌───▼───┐   ┌───▼───┐
│Schwab │   │ IBKR  │   │Alpaca │
│  API  │   │  API  │   │  API  │
└───────┘   └───────┘   └───────┘
```

**Coverage:**
- ✅ Schwab (including former TD Ameritrade)
- ✅ Interactive Brokers
- ✅ Alpaca
- ❌ Fidelity brokerage
- ❌ Vanguard brokerage
- ❌ All 401k/retirement accounts
- ❌ Robinhood, Webull, etc.

**Cost:** $0 (engineering time only)

**Estimated Account Coverage:** 20-30% of US investment accounts

**Pros:**
- Zero aggregator fees
- Full control over data and UX
- Real-time data
- Trading capabilities if desired

**Cons:**
- Limited coverage
- Must build/maintain each integration
- No retirement account support
- Users without supported brokerages are blocked

**Best For:** Proof of concept, developer-focused audience

---

### Strategy B: SnapTrade Only

Use SnapTrade as the single aggregator for all investment accounts.

**Architecture:**
```
┌─────────────────────────────────┐
│     Context Graph Platform      │
└───────────────┬─────────────────┘
                │
        ┌───────▼───────┐
        │   SnapTrade   │
        │               │
        │ • Schwab      │
        │ • Fidelity    │
        │ • Vanguard    │
        │ • Robinhood   │
        │ • IBKR        │
        │ • 401k (some) │
        └───────────────┘
```

**Coverage:**
- ✅ Most major brokerages
- ✅ IRA accounts
- ⚠️ Some 401k accounts (provider-dependent)
- ❌ Banks (not their focus)

**Cost:**
- Free tier: 5 connections, read-only
- Paid: Volume-based, contact for quote
- Expected: Cheaper than Plaid for investment-only

**Estimated Account Coverage:** 60-70% of US investment accounts

**Pros:**
- Single integration point
- Pre-normalized investment data
- >95% connection success
- Trading capabilities
- Cheaper than Plaid for investments

**Cons:**
- Aggregator dependency (single vendor)
- Fidelity requires application approval
- Startup risk (smaller than Plaid)
- 401k coverage varies

**Best For:** Fast go-to-market with broad investment coverage

---

### Strategy C: Hybrid (Recommended)

Combine direct APIs (where free) with SnapTrade for the rest.

**Architecture:**
```
┌─────────────────────────────────────────────────────────┐
│              Context Graph Platform                      │
│           (Provider Abstraction Layer)                   │
└────────────────────────┬────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
 ┌───────▼───────┐ ┌─────▼─────┐ ┌───────▼───────┐
 │  Direct APIs  │ │ SnapTrade │ │ Future: Plaid │
 │               │ │           │ │               │
 │ • Schwab      │ │ • Fidelity│ │ • Bank txns   │
 │ • IBKR        │ │ • Vanguard│ │ • Credit cards│
 │ • Alpaca      │ │ • Robinhood│ │ • Checking   │
 │               │ │ • 401k    │ │               │
 └───────────────┘ └───────────┘ └───────────────┘
```

**Routing Logic:**
1. User selects brokerage
2. If brokerage has direct API → use it (free, real-time)
3. Otherwise → route to SnapTrade
4. Future: Add Plaid for banking when needed

**Coverage:**
- ✅ All major brokerages (direct or SnapTrade)
- ✅ IRA accounts
- ⚠️ 401k accounts (best-effort via SnapTrade)
- 🔮 Bank accounts (future via Plaid)

**Cost:**
- Direct APIs: $0
- SnapTrade: Paid tier for non-direct brokerages
- Estimated 50-70% cheaper than Plaid-only approach

**Estimated Account Coverage:** 70-80% of US investment accounts

**Pros:**
- Best cost efficiency (free where possible)
- No single-vendor lock-in
- Real-time data for direct connections
- Flexible expansion path
- Abstraction layer enables future providers

**Cons:**
- More complex implementation
- Two integration paths to maintain
- SnapTrade still needed for major brokerages (Fidelity, Vanguard)

**Best For:** Production platform with cost optimization

---

## Recommended: Strategy C Implementation

### Phase 1: MVP (Weeks 1-8)

**Scope:**
- Schwab direct API integration
- SnapTrade integration for other brokerages
- Core data model: accounts, holdings, positions
- Basic net worth calculation
- Simple asset allocation view

**Cost:** SnapTrade free tier (5 connections) for development

### Phase 2: Production (Weeks 9-16)

**Scope:**
- Add Interactive Brokers direct API
- Upgrade to SnapTrade paid tier
- Decision trace system for recommendations
- Asset allocation recommendations
- Tax-loss harvesting alerts

**Cost:** SnapTrade paid tier (volume-based)

### Phase 3: Expansion (Weeks 17-24)

**Scope:**
- Add Plaid for bank account transactions
- Cash flow analysis + investment recommendations
- Retirement projections
- Full advisor-grade recommendations

**Cost:** SnapTrade + Plaid (still cheaper than Plaid-only)

---

## Technical Implementation

### Provider Interface (Same as PRD)

```python
from abc import ABC, abstractmethod
from typing import List, Optional
from datetime import datetime

class InvestmentProvider(ABC):
    """Abstract interface for investment data providers."""

    @abstractmethod
    async def get_accounts(self, connection_id: str) -> List[InvestmentAccount]:
        """Get all investment accounts for a connection."""
        pass

    @abstractmethod
    async def get_holdings(self, account_id: str) -> List[Holding]:
        """Get current holdings for an account."""
        pass

    @abstractmethod
    async def get_transactions(
        self,
        account_id: str,
        start_date: datetime,
        end_date: datetime
    ) -> List[InvestmentTransaction]:
        """Get investment transactions for date range."""
        pass

    @abstractmethod
    async def get_cost_basis(self, account_id: str) -> List[TaxLot]:
        """Get cost basis / tax lot information."""
        pass


class SchwabProvider(InvestmentProvider):
    """Direct Schwab API implementation."""
    pass


class SnapTradeProvider(InvestmentProvider):
    """SnapTrade aggregator implementation."""
    pass
```

### Data Model Extensions

```sql
-- Investment-specific tables (extend existing schema)

CREATE TYPE investment_account_type AS ENUM (
    'brokerage',
    'ira_traditional',
    'ira_roth',
    'ira_sep',
    'ira_simple',
    '401k',
    '401k_roth',
    '403b',
    '457b',
    '529',
    'hsa',
    'pension',
    'trust',
    'custodial',
    'other'
);

CREATE TABLE holdings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    symbol VARCHAR(20),
    cusip VARCHAR(9),
    isin VARCHAR(12),
    name VARCHAR(255) NOT NULL,
    quantity DECIMAL(20, 8) NOT NULL,
    price DECIMAL(20, 8),
    market_value DECIMAL(20, 2),
    cost_basis DECIMAL(20, 2),
    currency VARCHAR(3) DEFAULT 'USD',
    asset_class VARCHAR(50),  -- equity, fixed_income, cash, etc.
    as_of_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE tax_lots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    holding_id UUID NOT NULL REFERENCES holdings(id) ON DELETE CASCADE,
    acquired_date DATE NOT NULL,
    quantity DECIMAL(20, 8) NOT NULL,
    cost_per_share DECIMAL(20, 8) NOT NULL,
    total_cost DECIMAL(20, 2) NOT NULL,
    term VARCHAR(10),  -- short, long
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Routing Logic

```python
class ProviderRouter:
    """Routes requests to appropriate provider based on institution."""

    DIRECT_API_INSTITUTIONS = {
        'schwab': SchwabProvider,
        'td_ameritrade': SchwabProvider,  # Now Schwab
        'interactive_brokers': IBKRProvider,
        'alpaca': AlpacaProvider,
    }

    def __init__(self, snaptrade_provider: SnapTradeProvider):
        self.snaptrade = snaptrade_provider
        self.direct_providers = {
            name: provider_class()
            for name, provider_class in self.DIRECT_API_INSTITUTIONS.items()
        }

    def get_provider(self, institution_id: str) -> InvestmentProvider:
        """Get the appropriate provider for an institution."""
        if institution_id in self.direct_providers:
            return self.direct_providers[institution_id]
        return self.snaptrade
```

---

## Cost Comparison

### Scenario: 10,000 Users with Investment Accounts

| Approach | Year 1 Cost | Notes |
|----------|-------------|-------|
| **Plaid Only** | $50K-$100K | Investments API + per-connection |
| **SnapTrade Only** | $20K-$40K | Estimated, volume-based |
| **Hybrid (Recommended)** | $15K-$30K | ~40% via free direct APIs |

### Cost Breakdown for Hybrid

Assuming 10,000 users:
- 40% use Schwab/IBKR/Alpaca → Free (4,000 users)
- 60% use other brokerages → SnapTrade (6,000 users)
- SnapTrade cost for 6,000 connections → ~$15K-$30K/year

**Savings vs Plaid-only:** 50-70%

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Schwab API deprecation | Low | High | Abstraction layer enables switch to SnapTrade |
| SnapTrade startup risk | Medium | Medium | Direct APIs provide fallback for major brokerages |
| 401k access restrictions (like Principal) | Medium | Medium | Clearly communicate coverage limitations |
| Fidelity/Vanguard block SnapTrade | Low | High | Monitor, have Plaid as backup |
| User expects bank account support | High | Low | Clear positioning as investment-focused |

---

## Conclusion

An investment-focused MVP is strategically sound:

1. **Differentiated** — Most fintech aggregation focuses on spending. Investment-first is less crowded.

2. **Cost-effective** — Direct APIs (free) + SnapTrade is 50-70% cheaper than Plaid.

3. **High-value use cases** — Advisor-grade recommendations (tax optimization, asset allocation) are more valuable than transaction categorization.

4. **Natural expansion** — Can add banking later via Plaid when the platform matures.

5. **Technical feasibility** — The abstraction layer in the PRD supports this approach with minimal changes.

**Recommendation:** Proceed with Strategy C (Hybrid) for the investment-focused MVP.

---

## Sources

### Brokerage APIs
- [Charles Schwab Developer Portal](https://developer.schwab.com/)
- [Interactive Brokers Trading API](https://www.interactivebrokers.com/en/trading/ib-api.php)
- [Alpaca Markets](https://alpaca.markets/)
- [Schwab API Guide - Medium](https://medium.com/@avetik.babayan/why-charles-schwab-api-choosing-the-right-trading-platform-for-automation-bot-6bf6a687bb83)

### Retirement Accounts
- [Fidelity WorkplaceXchange](https://workplacexchange.fidelity.com/)
- [Empower Retirement Developer Portal](https://developer.empower-retirement.com/)
- [Principal 401k Connectivity Issues 2025 - Beagle](https://meetbeagle.com/resources/articles/connecting-principal-401k-mint-ynab-monarch-finicity-changes-2025)

### SnapTrade
- [SnapTrade Official Site](https://snaptrade.com/)
- [SnapTrade Documentation](https://docs.snaptrade.com/)
- [SnapTrade Brokerage Integrations](https://snaptrade.com/brokerage-integrations)
- [SnapTrade Pricing - Capterra](https://www.capterra.com/p/10022190/SnapTrade/)
- [SnapTrade vs Plaid vs Yodlee](https://snaptrade.com/blogs/plaid-vs-yodlee)

### Market Analysis
- [Account Aggregation APIs for Wealthtech - Finexer](https://blog.finexer.com/account-aggregation-apis-wealthtech-platforms/)
- [Plaid vs Yodlee vs SnapTrade Comparison](https://snaptrade.com/blogs/flinks-vs-plaid)
- [Top Account Aggregators 2025 - HyperVerge](https://hyperverge.co/blog/best-account-aggregators/)

---

## Appendix: Contact Information

| Provider | Contact | Portal |
|----------|---------|--------|
| SnapTrade | snaptrade.com/contact | docs.snaptrade.com |
| Schwab | developer.schwab.com | developer.schwab.com |
| Alpaca | alpaca.markets/support | docs.alpaca.markets |
| IBKR | interactivebrokers.com | interactivebrokers.com/api |
