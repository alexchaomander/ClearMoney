# Implementation Plan: ClearMoney

*Last updated: February 2026*

This document is the engineering execution plan for the [ROADMAP.md](./ROADMAP.md). Every phase maps to a roadmap phase with concrete tasks, technical decisions, dependencies, and acceptance criteria.

---

## Current State Summary

### What's Built

**Frontend (Next.js 16 / React 19 / TypeScript / Tailwind 4):**
- Unified dashboard (net worth, allocation, holdings, portfolio history)
- Founder Operating Room (runway, commingling, tax shields, subscription audit)
- AI Advisor with specialized financial skills (Claude-based)
- War Room with action intent lifecycle and switch kit PDF generation
- Scenario Lab with Monte Carlo simulations
- Command Center with prioritized actions
- Decision Narrative with full audit trails
- Trust Hub (payout transparency, independence audits)
- Vanish Mode, redacted sharing, ephemeral links
- Financial Memory Wizard
- Blog infrastructure
- Light/dark mode (Strata design system)

**Backend (FastAPI / Python 3.11 / SQLAlchemy Async / Pydantic v2):**
- Plaid integration for account linking
- SnapTrade integration for brokerage data
- Action Intent model and lifecycle (DRAFT -> PENDING -> EXECUTED)
- Advisor API with Claude tool execution
- Switch Kit PDF generation engine
- Financial memory and profile storage

### What's Missing (Competitive Gaps vs. Silvia)

- No multi-channel access (SMS, voice, email)
- No physical/alternative asset tracking
- No proactive push alerts
- No tax document ingestion
- No web research in advisor
- No native mobile apps
- No real estate or vehicle valuations
- No pricing/monetization infrastructure

---

## Phase 1: Competitive Parity + Multi-Channel (Months 1-3)

### 1.1 Physical & Alternative Asset Tracking

**Goal:** Track real estate, vehicles, and manual assets with automated valuations.

#### 1.1.1 Data Model Extensions

```python
# New models in app/models/
class RealEstateAsset(BaseModel):
    id: UUID
    user_id: UUID
    address: str
    property_type: Literal["primary_residence", "investment", "vacation"]
    purchase_price: Decimal
    purchase_date: date
    current_value: Decimal          # From Zillow or manual
    valuation_source: Literal["zillow", "redfin", "manual"]
    valuation_date: datetime
    mortgage_account_id: Optional[UUID]  # Link to debt account
    monthly_rental_income: Optional[Decimal]
    monthly_expenses: Optional[Decimal]  # HOA, insurance, taxes, maintenance
    square_footage: Optional[int]

class VehicleAsset(BaseModel):
    id: UUID
    user_id: UUID
    year: int
    make: str
    model: str
    trim: Optional[str]
    mileage: int
    condition: Literal["excellent", "good", "fair", "poor"]
    purchase_price: Decimal
    purchase_date: date
    current_value: Decimal
    valuation_source: Literal["kbb", "edmunds", "manual"]
    valuation_date: datetime
    loan_account_id: Optional[UUID]

class ManualAsset(BaseModel):
    id: UUID
    user_id: UUID
    name: str
    category: Literal["jewelry", "art", "collectibles", "wine", "crypto_hardware", "other"]
    purchase_price: Decimal
    purchase_date: date
    current_value: Decimal
    valuation_method: str           # User-described method
    valuation_date: datetime
    notes: Optional[str]
    depreciation_rate: Optional[Decimal]  # Annual % if applicable
```

#### 1.1.2 Valuation Service Integrations

| Service | Purpose | API | Priority |
|---------|---------|-----|----------|
| Zillow Bridge API | Property Zestimates | REST, requires partner access | P0 |
| Redfin (fallback) | Property estimates | Official data partner or API (no scraping -- ToS and maintenance risk) | P1 |
| KBB API | Vehicle valuations | REST | P0 |
| Edmunds (fallback) | Vehicle valuations | REST | P1 |

**Implementation:**
```
app/services/
├── valuations/
│   ├── zillow.py          # Zillow Bridge API client
│   ├── kbb.py             # KBB API client
│   ├── valuation_service.py  # Unified valuation orchestrator
│   └── refresh_scheduler.py  # Periodic re-valuation (weekly for real estate, monthly for vehicles)
```

#### 1.1.3 Frontend Components

| Component | Location | Details |
|-----------|----------|---------|
| `AssetRegistry` | `components/dashboard/AssetRegistry.tsx` | Master list of all non-financial assets with add/edit/delete |
| `RealEstateCard` | `components/dashboard/RealEstateCard.tsx` | Property summary with value, equity, rental yield, appreciation |
| `VehicleCard` | `components/dashboard/VehicleCard.tsx` | Vehicle summary with value, depreciation curve |
| `ManualAssetForm` | `components/dashboard/ManualAssetForm.tsx` | Structured form for adding any manual asset |

#### 1.1.4 Net Worth Integration

- Update `net_worth_service.py` to include all asset classes
- Update allocation chart to show real estate, vehicles, alternatives as categories
- Add traces for physical asset valuations (source, date, confidence)

**Acceptance Criteria:**
- [ ] User can add real estate with auto-valuation from Zillow
- [ ] User can add vehicles with auto-valuation from KBB
- [ ] User can add manual assets with custom valuation
- [ ] Net worth includes all asset classes with proper traces
- [ ] Allocation chart reflects full wealth picture

---

### 1.2 Multi-Channel AI Access

**Goal:** Users can interact with ClearMoney via SMS, voice, and email -- not just the web dashboard.

#### 1.2.1 Architecture

```
                    ┌─────────────┐
                    │   Unified   │
                    │  Message    │
                    │  Router     │
                    └──────┬──────┘
                           │
            ┌──────────────┼──────────────┐
            │              │              │
     ┌──────▼──────┐ ┌────▼────┐ ┌───────▼───────┐
     │   Twilio    │ │  Vapi   │ │   SendGrid    │
     │  SMS/MMS    │ │  Voice  │ │   Email       │
     │  Webhook    │ │  Agent  │ │   Inbound     │
     └──────┬──────┘ └────┬────┘ └───────┬───────┘
            │              │              │
            └──────────────┼──────────────┘
                           │
                    ┌──────▼──────┐
                    │  Advisor    │
                    │  Service    │
                    │  (Claude)   │
                    └─────────────┘
```

#### 1.2.2 SMS Channel (Twilio)

**New files:**
```
app/api/channels/
├── sms.py              # Twilio webhook handler
├── voice.py            # Vapi webhook handler
├── email.py            # SendGrid inbound parse handler
└── router.py           # Unified message router
```

**Implementation steps:**
1. Set up Twilio account and provision phone number
2. Create `POST /api/v1/channels/sms/webhook` endpoint
3. Implement message router that authenticates user by phone number
4. Route to existing advisor service with channel-specific formatting
5. Handle response length limits (SMS: 1600 chars, split if needed)
6. Store conversation in existing chat history with `channel: "sms"` tag

**Key decisions:**
- User links phone number in Settings (verified via OTP)
- **Authentication:** Phone number alone is not trusted for identity. Each SMS session requires an OTP challenge on first message (or within a session timeout). Sensitive actions (balances, transfers) require re-authentication. Caller ID is never trusted as sole auth factor.
- SMS responses are concise (summary + "reply MORE for details")
- Financial data in SMS is optionally redacted (user preference)

#### 1.2.3 Voice Channel (Vapi)

**Implementation steps:**
1. Integrate Vapi for voice AI agent
2. Create `POST /api/v1/channels/voice/webhook` endpoint
3. Configure Vapi agent with ClearMoney system prompt and tools
4. Voice agent has read-only access to user's financial context
5. Complex actions (execute trades, transfers) require dashboard confirmation
6. Call transcripts stored in conversation history

**Key decisions:**
- Inbound calls only initially (user calls ClearMoney number)
- **Authentication:** Voice sessions require a user-configured secret PIN spoken at the start of the call. Caller ID is used as a secondary signal only, never as sole authentication. Sensitive actions (transfers, trades) always redirect to the dashboard for biometric confirmation.
- Agent can quote metrics but cannot execute actions via voice

#### 1.2.4 Email Channel (SendGrid)

**Implementation steps:**
1. Configure SendGrid Inbound Parse for `advisor@clearmoney.com`
2. Create `POST /api/v1/channels/email/webhook` endpoint
3. Parse email body, extract question, identify user by sender address
4. Process attachments (tax docs, statements) via document ingestion pipeline
5. Respond with formatted HTML email including charts/tables
6. Support weekly digest emails (opt-in)

#### 1.2.5 Web Push Notifications

**Implementation steps:**
1. Add service worker registration to Next.js app
2. Implement `POST /api/v1/notifications/subscribe` for push subscription storage
3. Create notification dispatch service with priority levels
4. Integrate with alert system (see 1.3)

**Acceptance Criteria:**
- [ ] User can text their ClearMoney number and get a financial answer in <5s
- [ ] User can call and have a voice conversation about their finances
- [ ] User can email questions and receive formatted responses
- [ ] All channels authenticated and linked to user account
- [ ] Conversation history unified across all channels

---

### 1.3 Proactive Alert System

**Goal:** ClearMoney proactively notifies users of important financial events.

#### 1.3.1 Alert Engine

**New files:**
```
app/services/alerts/
├── engine.py           # Core alert evaluation engine
├── rules.py            # Alert rule definitions
├── dispatcher.py       # Multi-channel dispatch (push, SMS, email)
└── scheduler.py        # Periodic evaluation (hourly, daily, weekly)
```

#### 1.3.2 Alert Rules

| Category | Rule | Trigger | Channels |
|----------|------|---------|----------|
| **Market** | Major index move | S&P 500, NASDAQ, or BTC moves >2% in a day | Push, SMS |
| **Market** | FOMC decision | Fed rate decision published | Push, Email |
| **Portfolio** | Concentration drift | Any position >20% of portfolio | Push, Email |
| **Portfolio** | Tax-loss harvest opportunity | Position down >10% with harvestable losses | Push, Email |
| **Portfolio** | Wash sale warning | Recent sale + potential repurchase within 30 days | Push |
| **Account** | Large transaction | Transaction >$5,000 (configurable) | Push, SMS |
| **Account** | Fee detected | New fee charge on any account | Push |
| **Founder** | Runway critical | Runway drops below 6 months | Push, SMS, Email |
| **Founder** | Commingling detected | Personal spend on business account | Push, SMS |
| **Founder** | Burn rate spike | Monthly burn >20% above 3-month average | Push, Email |
| **Founder** | Quarterly taxes due | 15 days before estimated tax deadline | Push, Email |
| **Tax** | Tax-loss harvest window | December deadline approaching with harvestable losses | Push, Email |

#### 1.3.3 User Preferences

- Per-alert toggle (on/off)
- Per-channel preference (push only, SMS + push, all channels)
- Quiet hours (no SMS/push between 10pm-7am)
- Threshold customization (e.g., "alert me if any position >15%" instead of 20%)

**Acceptance Criteria:**
- [ ] Alert engine evaluates rules on schedule (hourly for market, daily for portfolio)
- [ ] Users receive alerts via their preferred channels
- [ ] Alert preferences configurable in Settings
- [ ] Each alert links back to relevant dashboard section

---

### 1.4 Tax Document Ingestion

**Goal:** Users upload tax returns and documents for AI-powered tax optimization analysis.

#### 1.4.1 Document Pipeline

```
Upload (PDF/image) → OCR/Extraction → Structured Data → Tax Analysis → Recommendations
```

**Implementation:**
```
app/services/tax/
├── ingestion.py        # File upload handler + type detection
├── extraction.py       # Document parsing (abstracted provider interface)
├── providers/
│   ├── base.py         # Abstract extraction provider interface
│   ├── claude_vision.py  # Claude Vision implementation (primary)
│   ├── textract.py     # Amazon Textract implementation (fallback)
│   └── document_ai.py  # Google Document AI implementation (fallback)
├── schema.py           # Structured tax data models (W-2, 1099, K-1, 1040)
├── analysis.py         # Tax optimization analysis engine
└── strategies.py       # Tax strategy library (Roth conversion, TLH, etc.)
```

**Note:** The extraction service uses an abstraction layer (`BaseExtractionProvider`) so the underlying OCR/extraction engine can be swapped without code changes. This guards against pricing, availability, or performance changes in any single provider.

#### 1.4.2 Supported Documents

| Document | Data Extracted |
|----------|---------------|
| Form 1040 | AGI, taxable income, deductions, credits, effective rate |
| W-2 | Wages, withholding, employer contributions |
| 1099-DIV | Dividends, qualified vs ordinary, capital gain distributions |
| 1099-INT | Interest income |
| 1099-B | Capital gains/losses, cost basis, holding periods |
| K-1 | Partnership/S-corp income, deductions, credits |
| Schedule C | Self-employment income and expenses |

#### 1.4.3 Tax Analysis Output

- Current effective tax rate vs. potential optimized rate
- Specific strategies with estimated dollar savings:
  - Roth conversion ladder opportunities
  - Tax-loss harvesting potential
  - Retirement contribution optimization (401k, IRA, HSA, mega backdoor)
  - Charitable giving strategies (donor-advised funds, QCDs)
  - Entity structure optimization (for founders)
  - State tax optimization
- YoY comparison when multiple years uploaded
- All recommendations include full decision traces

**Acceptance Criteria:**
- [ ] Users can upload PDF/image tax documents
- [ ] AI extracts structured data from 1040, W-2, 1099s with >90% accuracy
- [ ] Tax optimization report generated with specific dollar-amount strategies
- [ ] All strategies include full traces (inputs, assumptions, calculations)

---

### 1.5 Web Research in Advisor

**Goal:** AI advisor can pull real-time data from the web and financial APIs.

#### 1.5.1 New Advisor Tools

| Tool | Purpose | Data Source |
|------|---------|-------------|
| `search_web` | General financial research | Tavily or Brave Search API |
| `get_stock_quote` | Real-time stock/ETF pricing | Polygon.io or Alpha Vantage |
| `get_economic_data` | Fed rates, inflation, GDP, unemployment | FRED API |
| `get_news` | Financial news for specific tickers or topics | Polygon news or NewsAPI |
| `get_mortgage_rates` | Current mortgage rates | Freddie Mac or Bankrate API |

#### 1.5.2 Implementation

- Add tools to advisor's tool registry in `app/services/advisor/tools.py`
- Each tool returns structured data with source attribution
- Results cached with TTL (quotes: 15min, economic data: 1hr, news: 30min)
- Scenario Lab can invoke these tools for real-world assumptions

**Acceptance Criteria:**
- [ ] Advisor can answer "What's the current fed rate?" with live data
- [ ] Advisor can research a stock/ETF and provide current analysis
- [ ] Scenario Lab can pull real mortgage rates, inflation data into projections
- [ ] All web-sourced data includes source attribution in traces

---

## Phase 2: Niche Dominance + Premium (Months 3-6)

### 2.1 Founder Operating Room v2

#### 2.1.1 Multi-Entity Support

**Data model changes:**
```python
class Entity(BaseModel):
    id: UUID
    user_id: UUID
    name: str
    type: Literal["personal", "llc", "s_corp", "c_corp", "trust", "spv"]
    ein: Optional[str]
    state_of_formation: Optional[str]
    accounts: List[UUID]  # Linked financial accounts

class CrossEntityReport(BaseModel):
    entities: List[Entity]
    consolidated_net_worth: Decimal
    inter_entity_transfers: List[Transfer]
    commingling_alerts: List[Alert]
    tax_implications: List[TaxEvent]
```

**Frontend:**
- Entity switcher in dashboard header
- Consolidated view showing all entities
- Cross-entity flow visualization (Sankey diagram)

#### 2.1.2 Cap Table Integration

| Feature | Details |
|---------|---------|
| Carta API integration | Pull equity grants, vesting schedules, 409A valuations |
| Pulley API integration | Alternative cap table provider |
| Manual entry fallback | Enter grants, options, SAFEs, convertible notes manually |
| Equity in net worth | Vested equity at FMV included in net worth with appropriate discounts |
| Exercise modeling | "What if I exercise my options?" with AMT impact analysis |
| Dilution scenarios | Model future rounds and their impact on founder ownership |

#### 2.1.3 Fundraising Intelligence

| Feature | Details |
|---------|---------|
| Runway-to-raise trigger | Alert when runway drops below raise timeline (e.g., <9 months) |
| Fundraising timeline model | Estimate months to close based on stage and market conditions |
| Term sheet analyzer | Upload term sheet, AI extracts and explains key terms |
| Dilution calculator | Model pre/post money, option pool, and founder dilution |
| Investor data room prep | Generate financial summary package from ClearMoney data |

#### 2.1.4 Board-Ready Reports

- One-click PDF/HTML generation with:
  - Cash position and runway
  - Burn rate trends (3, 6, 12 month)
  - Revenue metrics (if Stripe/Mercury connected)
  - Key financial ratios
  - Forward projections
- Redacted mode for sensitive data
- Shareable ephemeral link

**Acceptance Criteria:**
- [ ] Users can create and manage multiple entities
- [ ] Cap table data (manual or Carta) integrated into net worth
- [ ] Fundraising intelligence alerts working
- [ ] Board report generated in <10 seconds
- [ ] Cross-entity commingling detection working

---

### 2.2 Advanced Modeling Engine

#### 2.2.1 Multi-Scenario Comparison

- Side-by-side comparison of up to 4 scenarios
- Diff highlighting showing where scenarios diverge
- Shareable scenario links (with redaction options)

#### 2.2.2 Stress Testing

| Scenario Template | Parameters |
|-------------------|------------|
| Market crash | -20% to -50% equity decline, recovery timeline |
| Recession | Job loss probability, income reduction, increased expenses |
| Medical emergency | $50k-$500k unexpected expense, insurance coverage |
| Startup failure | Zero revenue, personal liability, severance timeline |
| Interest rate shock | +200bps to +500bps on variable rate debt |
| Inflation spike | 6-12% sustained inflation impact on real returns |

#### 2.2.3 Goal-Based Planning

- Define goals: buy house ($X by date Y), retire at age Z, fund education
- Backwards calculation: required savings rate, return assumptions, timeline
- Gap analysis: "You're $X short, here are 3 ways to close the gap"
- Progress tracking: % to goal with trend visualization

**Acceptance Criteria:**
- [ ] Users can compare 4 scenarios side-by-side
- [ ] 6+ stress test templates available
- [ ] Goal-based planning with backwards calculation
- [ ] All models include confidence intervals and full traces

---

### 2.3 Premium Tier Infrastructure

#### 2.3.1 Billing System

| Component | Implementation |
|-----------|---------------|
| Payment processor | Stripe Billing |
| Subscription tiers | Free, Premium ($29/mo), Founder Pro ($79/mo) |
| Usage tracking | Query counts, account limits, feature gates |
| Trial | 14-day free trial of Premium for new users |
| Annual discount | 20% off annual billing |

#### 2.3.2 Feature Gating

**All feature gating must be enforced on the backend.** The backend is the ultimate authority on whether a user can access a feature. The frontend only queries the backend to determine which UI elements to show -- it never makes access decisions itself.

```python
# Backend: app/middleware/feature_gate.py
# All gating logic lives server-side. Frontend mirrors this for UI hints only.
TIER_FEATURES = {
    "free": {
        "max_accounts": 3,
        "advisor_queries_per_day": 5,
        "channels": ["web"],
        "scenarios": 1,
        "monte_carlo": False,
        "war_room": False,
        "tax_ingestion": False,
    },
    "premium": {
        "max_accounts": None,  # Unlimited
        "advisor_queries_per_day": None,
        "channels": ["web", "sms", "voice", "email"],
        "scenarios": None,
        "monte_carlo": True,
        "war_room": True,
        "tax_ingestion": True,
    },
    "founder_pro": {
        # Everything in premium plus:
        "multi_entity": True,
        "cap_table": True,
        "board_reports": True,
        "fundraising_intel": True,
        "api_access": True,
        "priority_support": True,
    },
}

async def require_feature(feature: str, user: User = Depends(get_current_user)):
    """FastAPI dependency that blocks access if user's tier lacks the feature."""
    tier = await get_user_tier(user.id)
    if not has_feature(tier, feature):
        raise HTTPException(403, f"Feature '{feature}' requires a higher tier")
```

The frontend fetches the user's tier from `GET /api/v1/user/tier` and uses it for UI display only (e.g., showing upgrade prompts). It never trusts client-side tier checks for access control.

**Acceptance Criteria:**
- [ ] Stripe Billing integrated with 3 tiers
- [ ] Feature gating working across all features
- [ ] Upgrade/downgrade flow smooth
- [ ] 14-day trial with email nurture sequence

---

### 2.4 Integration Expansion

| Integration | API | Backend Service | Priority |
|-------------|-----|-----------------|----------|
| Coinbase | OAuth + REST | `app/services/providers/coinbase.py` | P0 |
| Carta | REST API | `app/services/providers/carta.py` | P0 |
| Mercury | REST API | `app/services/providers/mercury.py` | P1 |
| Stripe | REST API | `app/services/providers/stripe_revenue.py` | P1 |
| QuickBooks | OAuth + REST | `app/services/providers/quickbooks.py` | P2 |

**Acceptance Criteria:**
- [ ] Coinbase integration live (balances, transactions, holdings)
- [ ] Carta integration live (grants, vesting, 409A)
- [ ] Mercury integration live (business banking for founders)

---

## Phase 3: Action Layer + Trust Protocol (Months 6-12)

### 3.1 Action Execution Engine v2

#### 3.1.1 E-Signature Integration

| Feature | Implementation |
|---------|---------------|
| DocuSign integration | Embedded signing for ACATS, rollover, and transfer forms |
| Template library | Pre-built templates for common financial actions |
| Audit trail | Complete signature trail with timestamps and IP addresses |

#### 3.1.2 Automated Rebalancing Drafts

| Feature | Implementation |
|---------|---------------|
| Target allocation model | User sets target allocation (e.g., 60/40, 70/30) per account |
| Drift detection | Continuous monitoring of allocation drift |
| Tax-aware lot selection | Prefer long-term gains, harvest losses, avoid wash sales |
| Rebalancing proposal | Agent drafts trades with full rationale, user approves in War Room |
| Execution via broker API | SnapTrade or direct broker integration for trade execution |

#### 3.1.3 Guided Execution

- Step-by-step instructions with screenshots for legacy bank actions
- Clipboard integration (copy account numbers, amounts)
- Checklist tracking (mark steps complete)
- Fallback when API execution isn't available

**Acceptance Criteria:**
- [ ] E-signature flow working for ACATS transfers
- [ ] Rebalancing proposals generated with tax-aware lot selection
- [ ] Guided execution flows for top 5 brokerages
- [ ] Complete audit trail for all executed actions

---

### 3.2 Strata Verification Protocol (SVP)

#### 3.2.1 Attestation Engine

```python
class Attestation(BaseModel):
    id: UUID
    user_id: UUID
    claim_type: Literal[
        "proof_of_funds",
        "income_stability",
        "net_worth_threshold",
        "accredited_investor",
    ]
    claim_data: dict        # Structured claim (e.g., {"threshold": 100000, "meets": True})
    evidence_hash: str      # HMAC-SHA256 of underlying data with per-user key (prevents rainbow table attacks)
    signature: str          # ClearMoney's cryptographic signature
    issued_at: datetime
    expires_at: datetime
    verification_url: str   # Public URL for verification
```

#### 3.2.2 Verification Portal

- Public `/verify/{attestation_id}` page
- Displays claim type, issued date, expiry, and validity
- Does NOT reveal underlying financial data
- QR code for easy sharing

**Acceptance Criteria:**
- [ ] Users can generate proof-of-funds attestation
- [ ] Users can generate accredited investor attestation
- [ ] Third parties can verify attestations via public URL
- [ ] No underlying financial data exposed in attestation

---

### 3.3 ClearMoney Publication (Full Launch)

The publication arm is ClearMoney's primary organic distribution channel. It operates as editorially independent content under the ClearMoney brand, covering the full spectrum of personal finance with the same "show the math" standard as the product.

#### 3.3.1 Content Verticals & Pipeline

| Vertical | Content Type | Frequency | Purpose |
|----------|-------------|-----------|---------|
| **Credit Cards & Rewards** | Card reviews, points valuations, rewards math, industry criticism | 2x/week | High-traffic SEO, broad consumer reach, top-of-funnel |
| **Portfolio & Tax Strategy** | TLH explainers, allocation frameworks, fee analysis, tax optimization | 1x/week | Mid-funnel, targets investors and HNW |
| **Founder Finance** | Runway planning, equity comp, 409A, fundraising math | 1x/week | Direct pipeline to Founder Pro tier |
| **Industry Accountability** | Affiliate conflicts, black-box AI criticism, devaluation tracking | 1x/month | Brand differentiation, PR, trust building |
| **Tool Explainers** | Calculator walkthroughs, methodology deep-dives, feature tutorials | As needed | Product adoption, retention |

| Channel | Format | Cadence |
|---------|--------|---------|
| Blog (clearmoney.com/blog) | Long-form analysis (800-1,200 words) | 2-3x/week |
| Newsletter ("Show the Math") | Weekly digest | Weekly |
| YouTube | 5-8 min videos: tool walkthroughs, market analysis, industry criticism | 1x/week |
| TikTok / Reels / Shorts | "60-second math" series, myth busting, hot takes | 3x/week |
| Podcast ("Show the Math") | Long-form founder interviews | 2x/month |
| Twitter/X | Quick takes, data drops, threads | Daily |

#### 3.3.2 Credit Card & Rewards Vertical (Specific)

This is our highest-traffic content vertical. The credit card review space is dominated by affiliate-compromised content. ClearMoney's publication is the honest alternative.

**Key content types:**
- **Card comparison calculators** embedded in blog posts (use YOUR spending, not inflated valuations)
- **"Is it worth it?" verdicts** that take clear stances, including "no" for popular high-fee cards
- **Open points valuation methodology** (conservative, defensible, updated quarterly)
- **Devaluation tracker** with real dollar-impact analysis
- **Affiliate payout disclosure** on every recommendation page
- **"Best cards" lists** ordered by math, not by commission -- with payout data shown alongside

**Launch content (6 articles):**
1. "Our Points Valuation Methodology (Open Source)"
2. "The Amex Platinum Is a Bad Card for Most People -- Here's the Math"
3. "Is Your Annual Fee Worth It? (Calculator)"
4. "How The Points Guy Makes Money (And Why It Matters)"
5. "The Only 3 Credit Cards Most People Need"
6. "Why We Show Our Affiliate Payouts (And Why Others Don't)"

#### 3.3.3 SEO Infrastructure

- Programmatic card comparison pages (`/compare/amex-gold-vs-chase-sapphire`)
- Tool-focused landing pages with schema markup (structured data for calculators)
- Blog with proper OpenGraph, Twitter cards, JSON-LD
- Internal linking: every blog post links to relevant ClearMoney tools
- Conversion path: blog reader -> free tool user -> free account -> premium upgrade

#### 3.3.4 Community (Discord)

- Channels: #general, #credit-cards, #founders, #portfolio-strategy, #tax, #feature-requests
- Bot integration: ClearMoney bot for quick metric lookups and card comparisons
- Community moderation guidelines
- Monthly AMA with ClearMoney team
- Crowdsourced data: card approval data points, redemption values, bonus offers

**Acceptance Criteria:**
- [ ] 6 launch articles published (credit card vertical)
- [ ] Content calendar established and executing across all verticals
- [ ] 50+ programmatic comparison pages indexed
- [ ] Newsletter launched with 1,000+ subscribers
- [ ] Discord server launched with 100+ members
- [ ] YouTube channel live with 10+ videos

---

## Phase 4: The Agentic Ledger (Months 12-24)

### 4.1 Smart Accounts

#### 4.1.1 Programmable Guardrails

```python
class GuardrailPolicy(BaseModel):
    id: UUID
    user_id: UUID
    name: str
    rules: List[GuardrailRule]
    enabled: bool

class GuardrailRule(BaseModel):
    type: Literal[
        "max_single_trade",
        "max_daily_trades",
        "min_holding_period",
        "max_concentration",
        "rebalance_drift_threshold",
        "restricted_assets",
        "require_approval_above",
    ]
    parameters: dict  # e.g., {"amount": 10000, "currency": "USD"}
    action: Literal["block", "require_approval", "notify"]
```

#### 4.1.2 Autonomous Operations

| Operation | Guardrail Required | Human Approval |
|-----------|-------------------|----------------|
| Tax-loss harvesting | Max daily harvest amount | No (within guardrails) |
| Rebalancing | Drift threshold + max trade size | No (within guardrails) |
| Cash sweep | Min/max cash balance | No (within guardrails) |
| Large transfers | Always | Yes |
| New positions | Concentration limits | Configurable |
| Account closure | Always | Yes |

### 4.2 Agent Economy

| Milestone | Details |
|-----------|---------|
| Skyfire integration | Agent-to-agent payments for specialized services |
| L402 micropayments | Machine-to-machine payments for data access |
| Agentic API (v1) | Third-party agents can read user context (with consent) |
| Agent marketplace | Curated specialized agents (tax, estate, crypto) |

### 4.3 Native Ledger

| Milestone | Details |
|-----------|---------|
| Double-entry ledger | PostgreSQL-based ledger for internally managed assets |
| Instant settlement | Internal transfers bypass ACH delays |
| Tax-lot tracking | Native cost basis and lot management |
| FPP export | JSON-LD financial passport for portability |

### 4.4 Native Mobile Apps

| Milestone | Details |
|-----------|---------|
| React Native setup | Shared component library with web |
| iOS app | Full dashboard, biometric auth, push notifications |
| Android app | Feature parity with iOS |
| Wearable support | Apple Watch / Wear OS for key metrics |

**Acceptance Criteria:**
- [ ] Autonomous TLH executing within guardrails
- [ ] 80%+ routine rebalancing handled by agent
- [ ] Agentic API serving third-party consumers
- [ ] iOS and Android apps in app stores
- [ ] FPP export generating valid financial passports

---

## Technical Infrastructure (Cross-Cutting)

### Testing Strategy

| Layer | Framework | Coverage Target |
|-------|-----------|----------------|
| Backend unit tests | pytest + pytest-asyncio | >85% on core services |
| Backend integration tests | httpx + test database | All API endpoints |
| Frontend unit tests | Jest + React Testing Library | >80% on components |
| E2E tests | Playwright | Critical user flows |
| Financial calculation tests | pytest (property-based) | 100% on all financial math |

### CI/CD Pipeline

```
PR → Lint (ruff + eslint) → Type Check (mypy + tsc) → Unit Tests → Build → E2E Tests → Deploy Preview → Main Merge → Staging → Production
```

### Monitoring & Observability

| Concern | Tool |
|---------|------|
| Error tracking | Sentry (frontend + backend) |
| Performance | Web Vitals + API response time dashboards |
| Uptime | UptimeRobot or Better Uptime |
| Logging | Structlog → structured JSON → log aggregator |
| Analytics | Plausible (privacy-first) |
| Financial data freshness | Custom dashboard showing last sync per provider |

### Security Checklist

- [ ] HTTPS/HSTS everywhere
- [ ] CORS allowlist (production domains only)
- [ ] Rate limiting on all public endpoints
- [ ] JWT with short expiry + refresh token rotation
- [ ] Secrets in environment variables (never in code)
- [ ] Enforce least privilege: read-only access by default, explicit user consent for write capabilities. Never store raw user credentials.
- [ ] Encryption at rest for all financial data
- [ ] Audit log for all data access and actions
- [ ] Annual penetration testing
- [ ] SOC 2 Type II preparation (Phase 3)

---

## Dependency Map

```
Phase 1.1 (Assets)     ──┐
Phase 1.2 (Channels)   ──┼── All independent, can parallelize
Phase 1.3 (Alerts)     ──┤   Alerts depend on channels for dispatch
Phase 1.4 (Tax Docs)   ──┤
Phase 1.5 (Web Research)─┘

Phase 2.1 (Founder v2) ── Depends on 1.1 (multi-entity needs asset model)
Phase 2.2 (Modeling)   ── Depends on 1.5 (web research for real-world data)
Phase 2.3 (Premium)    ── Independent (billing infrastructure)
Phase 2.4 (Integrations)─ Independent (API work)

Phase 3.1 (Execution)  ── Depends on 2.3 (premium feature)
Phase 3.2 (SVP)        ── Depends on 1.1 (needs full asset picture)
Phase 3.3 (Publication) ── Independent (can start anytime)
Phase 3.4 (Community)  ── Independent

Phase 4.x (Agentic)   ── Depends on 3.1 (needs execution engine)
```

---

## Immediate Next Steps (Next 2 Weeks)

1. **Set up Zillow Bridge API access** and implement real estate asset model + basic valuation
2. **Provision Twilio number** and implement SMS webhook + advisor routing
3. **Design alert rules engine** schema and implement first 5 alert rules
4. **Build asset registry UI** component for adding non-financial assets
5. **Implement web search tool** for advisor (Tavily API)
6. **Spike on Vapi** for voice channel feasibility and latency testing

---

*This plan is a living document. Updated bi-weekly with progress and adjustments.*
