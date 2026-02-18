# ClearMoney Roadmap

*Last updated: February 2026*

---

## Vision

**Build the most transparent, actionable, and founder-aware financial operating system on the planet.**

ClearMoney is not another portfolio tracker. It is the institutional-grade financial intelligence layer that treats every number as auditable, every recommendation as traceable, and every action as executable -- with the user in full control.

We exist because the financial advisory industry has two failure modes:
1. **Black-box AI advisors** (CFO Silvia, Wealthfront, Betterment) that give you answers without showing the math
2. **Affiliate-driven content mills** (The Points Guy, NerdWallet, Bankrate) that optimize for ad revenue, not outcomes

ClearMoney rejects both. We show our work, prove our independence, and move from "here's what you should do" to "here's the paperwork, ready to sign."

---

## Competitive Positioning: ClearMoney vs. CFO Silvia

CFO Silvia (Pompliano / ProCap Financial) is our closest competitor. They launched May 2025, hit 10,000+ users and $30B+ tracked assets, and are being acquired to become a publicly traded "agentic finance" company. They have distribution (Pompliano's audience), a free price point, and multi-channel access (chat, call, email).

**We win by being better where it matters most, not by copying what they do.**

### Our Strategic Moats (Double Down)

| Moat | Why Silvia Can't Copy It Easily |
|------|--------------------------------|
| **Radical Transparency** | Their entire UX is a black-box chat. Retrofitting "show the math" traces into a conversational interface is an architecture rewrite. |
| **Founder Operating Room** | They serve general consumers. Building founder-specific tooling (runway, commingling, tax shields, entity separation) requires deep domain expertise and different data models. |
| **Action Execution (War Room)** | Silvia is read-only advisory. We draft ACATS paperwork, generate switch kits, and execute intents with biometric authorization. Going from "advice" to "execution" is a regulatory and engineering leap. |
| **Trust Protocol** | Our affiliate payout transparency, independence audits, and methodology audit logs create verifiable trust. Silvia's free model raises unanswered questions about monetization. |
| **Decision Traces** | Every ClearMoney recommendation writes a full logic tree (inputs, rules, assumptions, confidence). This is not a feature -- it's our data model. |

### Where We Must Close the Gap

| Silvia Advantage | Our Response | Priority |
|-----------------|-------------|----------|
| **Phone/SMS/Email access** | Build multi-channel AI (SMS via Twilio, voice via Vapi/Bland, email ingestion) | P0 |
| **Physical asset tracking** | Add real estate (Zillow API), vehicles (KBB/Edmunds), collectibles with depreciation/appreciation | P0 |
| **Completely free** | Free core tier with premium for execution, advanced modeling, and founder tools | P1 |
| **10,000+ users / $30B AUM** | Leverage founder niche, transparency story, and content engine for organic growth | P1 |
| **Native mobile apps** | Progressive Web App first, then React Native apps | P2 |
| **Push notifications / market alerts** | Real-time alert system via web push, SMS, and email | P1 |
| **Tax return upload** | PDF/image ingestion with AI extraction for tax optimization | P1 |
| **Web research in scenarios** | Agentic web search integrated into scenario analysis and advisor chat | P1 |

---

## Strategic Pillars

### Pillar 1: Radical Transparency (Existing Moat -- Deepen)

Every number on ClearMoney is auditable. This is not a feature; it is the product.

- **Metric Traces**: Hover any number to see raw inputs, formula, confidence score, data freshness
- **Decision Narratives**: Full logic trees for every AI recommendation
- **Affiliate Payout Disclosure**: Show what we earn and prove our rankings are independent
- **Methodology Audit Log**: Public changelog of every calculation change
- **Independence Reports**: Quarterly proof that recommendations != highest payout

### Pillar 2: Multi-Surface Intelligence (Close the Gap)

Meet users where they are, not just in a dashboard.

- **SMS/Text**: "What's my net worth?" via text message
- **Voice**: Call your ClearMoney advisor for complex questions
- **Email**: Forward financial documents, ask questions, get analysis
- **Web Dashboard**: Full institutional-grade experience
- **Mobile (PWA -> Native)**: On-the-go access to alerts and key metrics

### Pillar 3: Founder-First Financial OS (Niche Dominance)

No competitor serves founders. This is our beachhead.

- **Entity Separation**: Personal vs. business accounts with commingling alerts
- **Runway Intelligence**: Real-time burn rate, runway projections, fundraising triggers
- **Tax Shield Monitoring**: Quarterly estimates, safe harbor checks, deduction tracking
- **Subscription Audit**: SaaS spend analysis with ROI scoring
- **Cap Table Awareness**: Equity comp (RSUs, options, SAFEs) integrated into net worth

### Pillar 4: Action Execution (Our Biggest Moat)

Silvia tells you what to do. We do it.

- **Action Intents**: Structured primitives for every financial maneuver
- **Switch Kits**: Auto-generated ACATS/ACH transfer documents
- **War Room**: Queue, review, authorize, and execute with biometric approval
- **Ghost Navigation**: Step-by-step guides for legacy bank UIs
- **Agent Execution**: Autonomous rebalancing within user-defined guardrails

### Pillar 5: Comprehensive Wealth Picture (Parity + Beyond)

Track everything, not just financial accounts.

- **Financial Accounts**: Brokerage, retirement, banking, crypto via Plaid + SnapTrade
- **Real Estate**: Property values (Zillow), rental income, mortgage tracking, appreciation
- **Vehicles**: KBB/Edmunds valuations with depreciation curves
- **Alternative Assets**: Collectibles, art, jewelry, wine with manual + API valuations
- **Equity Compensation**: RSU vesting schedules, option exercise modeling, AMT impact
- **Debt Complete Picture**: Student loans, mortgages, auto loans, credit cards with payoff strategies
- **Tax Documents**: Upload W-2s, 1099s, K-1s, tax returns for comprehensive tax planning

### Pillar 6: Content & Trust Engine (Distribution Moat)

Original from our Anti-Points-Guy DNA. Silvia has zero content strategy.

- **Independent Research**: Unbiased analysis on credit cards, points, financial products
- **Blog with Methodology**: Every opinion backed by open math
- **Short-Form Education**: TikTok/Reels/YouTube Shorts for financial literacy
- **Newsletter**: Weekly intelligence briefing
- **Community**: Discord/forum for peer education and crowdsourced data

---

## Phased Roadmap

### Phase 0: Current State (Completed)

What we've already built:

- [x] Unified dashboard with net worth, allocation, and holdings
- [x] "Show the Math" decision traces on all metrics
- [x] Founder Operating Room (runway, commingling, tax shields, subscription audit)
- [x] AI Advisor with specialized financial skills (Claude-based)
- [x] War Room with action intent lifecycle and switch kit generation
- [x] Scenario Lab with Monte Carlo simulations
- [x] Command Center with prioritized actions
- [x] Decision Narrative with full audit trails
- [x] Trust Hub with payout transparency and independence audits
- [x] Vanish Mode, redacted sharing, ephemeral links
- [x] Financial Memory Wizard (conversational onboarding)
- [x] Plaid integration for account linking
- [x] Light/dark mode with Strata design system
- [x] Blog infrastructure with editorial content

---

### Phase 1: Competitive Parity + Multi-Channel (Months 1-3)

**Goal: Close every gap Silvia has on us. Launch multi-channel access.**

#### 1.1 Physical & Alternative Asset Tracking (P0)

| Task | Details |
|------|---------|
| Real estate integration | Zillow API for property valuations, manual entry for rental income, mortgage linking, appreciation tracking |
| Vehicle tracking | KBB/Edmunds API for current values, depreciation curves, insurance and maintenance cost tracking |
| Manual asset registry | Structured entry for jewelry, art, collectibles, wine, crypto hardware wallets with custom valuation methods |
| Net worth recalculation | Include all asset classes in net worth, allocation charts, and trace calculations |

#### 1.2 Multi-Channel AI Access (P0)

| Channel | Implementation | Priority |
|---------|---------------|----------|
| SMS/Text | Twilio integration, natural language processing, balance/metric queries, alert responses | P0 |
| Voice | Vapi or Bland.ai for inbound/outbound calls, complex financial conversations, hands-free access | P0 |
| Email | Inbound email parsing (SendGrid/Postmark), forward documents for analysis, receive weekly digests | P1 |
| Web Push | Browser push notifications for alerts, market events, action reminders | P0 |
| Mobile PWA | Service worker, app manifest, offline-capable dashboard, installable on iOS/Android | P1 |

#### 1.3 Proactive Alert System (P1)

| Alert Type | Trigger |
|------------|---------|
| Market events | FOMC decisions, major index movements (>2%), sector-specific alerts |
| Portfolio alerts | Concentration drift >5%, single position >20% of portfolio, cost basis opportunities |
| Account alerts | Unusual transactions, large deposits/withdrawals, fee charges |
| Tax alerts | Tax-loss harvesting opportunities, quarterly estimate due dates, wash sale warnings |
| Founder alerts | Runway below 6 months, commingling detected, burn rate spike |

#### 1.4 Tax Document Ingestion (P1)

| Feature | Details |
|---------|---------|
| Upload tax returns | PDF/image upload with AI extraction (OCR + Claude) |
| W-2/1099/K-1 parsing | Structured data extraction from tax documents |
| Tax optimization report | AI analysis comparing current strategy to optimal, with specific dollar amounts |
| YoY comparison | Track tax efficiency improvements across years |

#### 1.5 Web Research in Advisor (P1)

- Equip AI advisor with web search tool for real-time market data, news, and research
- Integrate financial data APIs (Alpha Vantage, Polygon, FRED) for live pricing and economic data
- Enable scenario analysis to pull real-world data (current rates, market conditions, inflation)

**Phase 1 Success Metrics:**
- All Silvia feature gaps closed
- SMS/voice channel live with <2s response time
- 5+ alternative asset types trackable
- Tax return upload processing 95%+ of common forms

---

### Phase 2: Niche Dominance + Premium Value (Months 3-6)

**Goal: Make ClearMoney indispensable for founders. Launch premium tier.**

#### 2.1 Founder Operating Room v2

| Feature | Details |
|---------|---------|
| Multi-entity support | Track multiple companies, SPVs, trusts with cross-entity reporting |
| Cap table integration | Carta/Pulley integration or manual entry for equity, SAFEs, convertible notes |
| Fundraising intelligence | Runway-to-raise triggers, dilution modeling, term sheet analysis |
| Board-ready reports | One-click generation of financial snapshots for board meetings |
| 409A integration | Track fair market value for stock option exercise decisions |
| Compensation benchmarking | Compare founder salary/equity against market data |

#### 2.2 Advanced Modeling Engine

| Feature | Details |
|---------|---------|
| Multi-scenario comparison | Side-by-side comparison of 3+ scenarios with diff highlighting |
| Stress testing | Model recession, market crash, job loss, medical emergency impacts |
| Goal-based planning | Backwards planning from goals (buy house, retire, exit) with required actions |
| Probabilistic forecasting | Confidence intervals on all projections, not just point estimates |
| Custom assumption sets | Save and share assumption profiles (optimistic, base case, conservative) |

#### 2.3 Premium Tier Launch

| Free Tier | Premium ($29/mo) | Founder Pro ($79/mo) |
|-----------|-----------------|---------------------|
| Dashboard + net worth tracking | Everything in Free | Everything in Premium |
| 3 connected accounts | Unlimited accounts | Multi-entity support |
| Basic AI advisor (5 queries/day) | Unlimited AI advisor | Cap table + equity comp |
| Show the Math traces | SMS/Voice/Email access | Board-ready reports |
| Basic scenario analysis | Advanced modeling + stress tests | Fundraising intelligence |
| Blog + educational content | Tax document ingestion | Dedicated founder advisor mode |
| Manual asset tracking | Push alerts + market monitoring | Priority support |
| | Action execution (War Room) | API access |
| | Full Monte Carlo simulations | Custom integrations |

#### 2.4 Integrations Expansion

| Integration | Purpose |
|-------------|---------|
| Coinbase / Kraken / Phantom | Direct crypto wallet and exchange connections |
| Carta / Pulley | Cap table and equity data |
| Stripe / Mercury | Business revenue and banking for founders |
| QuickBooks / Xero | Business accounting data |
| Zillow / Redfin | Real estate valuations |
| KBB / Edmunds | Vehicle valuations |

**Phase 2 Success Metrics:**
- 500+ founder users with Founder Pro subscriptions
- Premium conversion rate >8% of free users
- 3+ integrations live beyond Plaid
- NPS >60 among founder users

---

### Phase 3: Action Layer + Trust Protocol (Months 6-12)

**Goal: Execute financial actions, not just advise. Establish ClearMoney as a verifiable financial identity.**

#### 3.1 Action Execution Engine v2

| Feature | Details |
|---------|---------|
| One-click rollover | AI pre-fills ACATS transfer forms, e-signature integration (DocuSign/HelloSign) |
| Automated rebalancing drafts | Agent proposes rebalancing trades based on target allocation + tax awareness |
| Bill negotiation intents | Draft cancellation/negotiation scripts for subscriptions and services |
| Guided execution | Step-by-step overlays for completing actions on legacy bank websites |
| Action audit trail | Complete history of every action taken, with before/after snapshots |

#### 3.2 Strata Verification Protocol (SVP)

| Feature | Details |
|---------|---------|
| Proof of Funds | Cryptographically signed attestation of account balances without revealing exact amounts |
| Income Stability Proof | Verifiable claim of income consistency for landlords, lenders |
| Net Worth Attestation | Privacy-preserving proof for investment minimums, accredited investor status |
| Public verification portal | `/verify` endpoint for third parties to validate ClearMoney-signed claims |
| Privacy-preserving sharing | ZK-proof generation for financial claims |

#### 3.3 Content & Distribution Engine

| Initiative | Details |
|------------|---------|
| YouTube channel | Weekly 5-8 min videos: tool walkthroughs, market analysis, founder finance |
| Short-form content | TikTok/Reels: "60-second math" series, myth busting, industry callouts |
| Newsletter | Weekly intelligence briefing with 1 featured tool, 3 market takes, community highlights |
| Podcast | "Show the Math" podcast: interviews with founders about their financial operating systems |
| SEO content engine | Programmatic pages for card comparisons, investment product analysis |

#### 3.4 Community Platform

| Feature | Purpose |
|---------|---------|
| Discord server | Peer discussion, help, knowledge sharing |
| Data point submissions | Crowdsource approval odds, redemption values, bonus data |
| User reviews | Real experiences with financial products and strategies |
| Independence watchdog | Community holds us accountable to our transparency pledge |
| Open methodology | Community can suggest and vote on calculation improvements |

**Phase 3 Success Metrics:**
- First 100 financial actions executed through ClearMoney
- SVP attestations used by 50+ users for real-world verification
- 10,000+ newsletter subscribers
- YouTube channel at 5,000+ subscribers
- Community with 500+ active members

---

### Phase 4: The Agentic Ledger (Months 12-24)

**Goal: Autonomous financial operations within user-defined guardrails. ClearMoney becomes the system of record.**

#### 4.1 Smart Accounts

| Feature | Details |
|---------|---------|
| Agent-managed accounts | Integration with Safe (Gnosis) for programmable smart accounts |
| Programmable guardrails | User-defined rules: "Rebalance if drift >5%", "Max single trade $10k", "Never sell tax lots held <1yr" |
| Multi-sig authorization | High-value actions require multiple approval factors |
| Autonomous tax-loss harvesting | Agent continuously monitors and executes TLH within guardrails |
| Auto-rebalancing | Drift-based rebalancing with tax-aware lot selection |

#### 4.2 Agent Economy

| Feature | Details |
|---------|---------|
| Skyfire integration | Agent-to-agent payments for specialized financial services |
| L402 micropayments | Machine-to-machine payments for data and computation |
| Agentic API | Third-party financial agents can interact with user's ClearMoney context (with consent) |
| Agent marketplace | Specialized agents for tax, real estate, crypto, estate planning |

#### 4.3 Native Ledger

| Feature | Details |
|---------|---------|
| Internal double-entry ledger | Assets held directly within ClearMoney ecosystem |
| Instant settlement | Bypass ACH/ACATS delays for internal transfers |
| Context-native execution | Tax-loss harvesting, rebalancing, and transfers without leaving the platform |
| Financial Portability Protocol (FPP) | JSON-LD schema for exporting your entire financial context to any platform |

#### 4.4 Native Mobile Apps

| Platform | Details |
|----------|---------|
| iOS (React Native) | Full dashboard, biometric auth, push notifications, Siri integration |
| Android (React Native) | Full parity with iOS, widget support for net worth and alerts |
| Apple Watch / Wear OS | Quick glance at net worth, runway, and critical alerts |

**Phase 4 Success Metrics:**
- 80% of routine rebalancing executed autonomously
- Internal ledger processing $10M+ in managed assets
- FPP protocol adopted by 3+ third-party platforms
- Native apps with 4.5+ star ratings
- 50,000+ total users

---

## Monetization Strategy

### Revenue Model

| Stream | Phase | Details |
|--------|-------|---------|
| **Premium subscriptions** | Phase 2+ | $29/mo individual, $79/mo founder |
| **Ethical affiliate revenue** | Phase 1+ | Credit card and financial product recommendations with full payout disclosure |
| **Action execution fees** | Phase 3+ | Small fee for executed financial actions (ACATS, rebalancing) |
| **API access** | Phase 3+ | Third-party developers and agents consuming ClearMoney data |
| **Enterprise / Family Office** | Phase 4+ | White-label or dedicated instances for wealth managers |

### Independence Pledge

```
WE WILL NEVER:
1. Recommend a product because of its affiliate payout
2. Inflate valuations to make products look better
3. Suppress negative reviews of products that pay us
4. Accept editorial input from financial product issuers
5. Hide affiliate relationships from users
6. Prioritize revenue over user outcomes

WE WILL ALWAYS:
1. Show our math so users can verify our claims
2. Include non-affiliate options when they're better
3. Publish negative reviews even if it costs us revenue
4. Disclose exactly how we make money
5. Recommend AGAINST products when appropriate
6. Publish quarterly Independence Reports with full data
```

---

## Operating Principles

1. **Transparency is the product.** Every number is traceable. Every recommendation has a logic tree. If we can't show the math, we don't show the number.

2. **Execution path first.** To build the action layer, we must be in the decision loop. Read-only advisory is table stakes.

3. **Founders are our beachhead.** The founder niche is underserved, high-value, and word-of-mouth driven. Win founders, then expand.

4. **Meet users where they are.** Dashboard-only is a limitation. SMS, voice, email, and push are required channels.

5. **Data minimization + consent.** Users see, control, and revoke every data scope. Privacy is a feature, not a checkbox.

6. **Decision traces are the data model.** Every recommendation writes a trace that captures inputs, policy, rationale, and confidence. This is our moat and our audit trail.

7. **Earn trust through proof, not promises.** Independence reports, payout transparency, and open methodology. Trust is built with data, not marketing.

---

## Key Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Silvia/ProCap acquires distribution dominance | High | Focus on founder niche where distribution is word-of-mouth; transparency story creates organic press |
| Silvia copies our transparency features | Medium | Our traces are architectural (data model), not a UI layer. Retrofitting is hard. |
| Regulatory risk on action execution | High | Partner with licensed broker-dealers; implement robust compliance framework |
| User acquisition cost too high | Medium | Content engine + SEO + founder community creates organic growth |
| Plaid/SnapTrade reliability | Medium | Multi-provider strategy; graceful degradation; manual entry fallback |
| Free pricing pressure from Silvia | Medium | Premium value justifies cost; founders already pay for specialized tools |

---

## 5-Year North Star

**By 2031, ClearMoney is the financial operating system that:**

- Manages $100B+ in tracked assets across 100,000+ users
- Executes 80%+ of routine financial operations autonomously
- Is the standard for transparent, auditable financial AI
- Has forced the industry to adopt "show the math" as a baseline expectation
- Operates the Financial Portability Protocol used by 10+ platforms
- Is the default financial OS for startup founders
- Has saved users $100M+ through optimized decisions and avoided fees

**Success is not** maximizing our revenue. **Success is** people making measurably better financial decisions because every number they see is auditable, every recommendation is traceable, and every action is executable.

---

*This roadmap is a living document. Updated quarterly with progress and competitive intelligence.*
