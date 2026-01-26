# Equity Compensation APIs and Data Access Research

**Research Date:** January 2026
**Purpose:** Evaluate API availability, data access options, and integration feasibility for equity compensation platforms (RSUs, stock options, ESPP)

---

## Executive Summary

Equity compensation data integration remains one of the most challenging areas in personal finance technology. Unlike banking and brokerage data aggregation (where Plaid and similar services have achieved widespread connectivity), equity compensation platforms operate in a more fragmented, enterprise-focused ecosystem with limited third-party API access.

**Key Findings:**
- Most equity compensation platforms offer APIs, but primarily for **enterprise/employer clients**, not individual employees or third-party consumer apps
- **No major aggregator** (Plaid, Yodlee, SnapTrade, Finicity) currently provides comprehensive equity compensation plan coverage
- Data portability is largely limited to **manual CSV exports** with no standardized format
- Private company equity tracking has better API options (Carta, Pulley) than public company stock plan services

---

## 1. Major Platform Analysis

### 1.1 Carta

**Platform Type:** Cap table management, private company equity
**Target Users:** Private companies, startups, investors

**API Availability:**
- Yes - Carta offers a comprehensive [API Platform](https://carta.com/api/) with four API suites:
  - **Issuer API:** Company data for HRIS, law firm portals, financial services
  - **Portfolio API:** Personal wealth management, estate planning
  - **Investor API:** Cap table and holdings data for investment monitoring
  - **Launch API:** Account creation and setup

**API Access:**
- Currently in **beta phase** with limited partners
- Contact: developers@carta.com for developer account requests
- [Waitlist form](https://carta.com/api/) available for API partner access
- Rate limit: 1,000 requests per minute

**Data Available via API:**
- Cap table data
- Equity grants and holdings
- Real-time ownership updates
- Vesting schedules (planned expansion to RSU, RSA, and certificates)

**Integrations:**
- Deel, Remote Equity (Draft Option API for syncing option grants)
- Aeqium (compensation planning)
- Secfi (equity planning and wealth management)
- Wilson Sonsini Neuron (law firm integration)

**Pricing:**
- Platform pricing: $280/year (Launch) to $112,000+/year (Scale for 500+ security holders)
- API access pricing: Not publicly disclosed; appears to be partnership-based
- Hidden costs: 409A valuations ($3,000-$8,000/quarter), migrations ($15,000-$25,000)

**Sources:**
- [Carta API Platform](https://carta.com/api/)
- [Carta Pricing - Vendr](https://www.vendr.com/marketplace/carta)
- [Carta Pricing - Spendflo](https://www.spendflo.com/blog/how-much-does-carta-cost-a-breakdown-of-plans-and-pricing)

---

### 1.2 Shareworks (Morgan Stanley at Work)

**Platform Type:** Equity compensation administration (public and private companies)
**Target Users:** Corporate stock plan administrators, enterprises

**API Availability:**
- Yes - API documentation available at [downloads.shareworks.com/api](https://downloads.shareworks.com/api/index.html)
- Access levels: Read-Only and Read-Write API clients
- Authentication: JWT-based

**API Access:**
- Enterprise clients only (not available to individual participants)
- Requires administrator configuration
- Contact through [Morgan Stanley Developer Portal](https://developer.morganstanley.com/)

**Data Available via API:**
- Grant data (grant date, number of options, strike price)
- Vesting schedules (vestingScheduleId accessible via API)
- Vested options count
- Company and participant information

**Notable Integrations:**
- Wilson Sonsini Goodrich & Rosati (real-time cap table updates)
- Pave (compensation benchmarking)
- KPMG, Deloitte/GAIN, Ernst & Young
- Workday (file imports)

**Pricing:**
- API access is part of enterprise contracts
- No public pricing for API access

**Sources:**
- [Shareworks API Documentation](https://downloads.shareworks.com/api/index.html)
- [Morgan Stanley at Work - Wilson Sonsini Integration](https://www.morganstanley.com/press-releases/morgan-stanley-at-work-and-wilson-sonsini-launch-api-integration)
- [Morgan Stanley at Work - Pave Integration](https://www.morganstanley.com/press-releases/morgan-stanley-at-work-and-pave-announce-api-integration)

---

### 1.3 E*Trade Equity Edge Online

**Platform Type:** Corporate equity compensation administration
**Target Users:** Corporate stock plan administrators, HRIS/payroll integrators

**API Availability:**
- Yes - [Equity Edge Online Developer Platform](https://developer.etrade.com/corporate-services)
- REST API with Swagger documentation
- Documentation: [equityedgeonline.etrade.com/devportal](https://equityedgeonline.etrade.com/devportal/output/general/apidocumentation.html)

**API Access:**
- Available to E*Trade Corporate Services clients and developers
- OAuth authentication required
- Consumer key needed (sandbox available in days, production shortly after)
- **Free for developers** - E*Trade earns from trading fees

**Data Available via API:**
- Participant data
- Grant information
- Payroll/tax data
- Transactional data
- HRIS/Payroll integration capabilities

**Capabilities:**
- Submit or retrieve participant and grant data
- Payroll integration
- Transaction processing
- JSON or XML response formats

**Sources:**
- [E*Trade Equity Edge API Documentation](https://equityedgeonline.etrade.com/devportal/output/general/get-started.html)
- [E*Trade Developer Portal - Corporate Services](https://developer.etrade.com/corporate-services)
- [E*Trade Corporate Services API Launch](https://www.businesswire.com/news/home/20200713005316/en/ETRADE-Corporate-Services-Launches-Industry-First-API-Developer-Platform)

---

### 1.4 Fidelity Stock Plan Services

**Platform Type:** Stock plan administration (public companies)
**Target Users:** Corporate employers, plan participants

**API Availability:**
- **Fidelity WorkplaceXchange** - New API marketplace for employers and third-party vendors
  - API Catalog: [workplacexchange.fidelity.com/public/wpx/api-catalog](https://workplacexchange.fidelity.com/public/wpx/api-catalog)
- **Fidelity Access** - Data sharing API for third parties (launched recently)
  - Uses Durable Data API standard
  - Shares account balances, securities holdings, transactions
  - Available on fidelity.com, netbenefits.com, wealthscapeinvestor.com

**API Access Requirements:**
- Strict security standards compliance
- Agreement to destroy previously acquired user credentials
- Assumption of responsibility for data
- No publicly documented developer self-service process

**Data Available:**
- RSUs, RSAs, ESPP data (through participant portal)
- Account balances
- Securities holdings
- Transactions

**Unofficial Options:**
- `fidelity-api` Python package (Playwright-based, unofficial, use at own risk)

**Sources:**
- [Fidelity WorkplaceXchange API](https://www.fidelityworkplace.com/s/api)
- [Fidelity Access Launch - American Banker](https://www.americanbanker.com/news/fidelity-latest-financial-firm-to-roll-out-customer-data-api)
- [Fidelity Stock Plan Services Overview](https://www.fidelity.com/stock-plan-services/overview)

---

### 1.5 Schwab Stock Plan Services

**Platform Type:** Equity compensation administration (public and private companies)
**Target Users:** Corporate employers, plan participants, advisors

**API Availability:**
- **Schwab Developer Portal:** [developer.schwab.com](https://developer.schwab.com/)
- **Schwab EquiView Platform:** Integration with various systems
- **Schwab OpenView Gateway:** API integration for RIA technology

**Recent Developments (2025):**
- Launched **Schwab Private Issuer Equity Services** for private companies
- Features: cap table automation, configurable dashboards, third-party system integrations

**API Capabilities:**
- Continuous data updates for participant equity awards
- Online grant acceptance
- ESPP enrollment and events
- Performance awards and cash instruments

**Access Requirements:**
- Developer account and registered app required
- App key and secret provided after registration
- Trading integration available through Charles Schwab & Co., Inc.

**Sources:**
- [Schwab Developer Portal](https://developer.schwab.com/)
- [Schwab Private Issuer Equity Services Launch](https://pressroom.aboutschwab.com/press-releases/press-release/2025/Schwab-Stock-Plan-Services-Launches-Schwab-Private-Issuer-Equity-Services/default.aspx)
- [Schwab Stock Plan Services](https://www.schwabworkplaceservices.com/stock-plans)

---

## 2. Aggregator Coverage Analysis

### 2.1 Plaid

**Equity Compensation Support:**
- Plaid's Investments API supports a **"stock plan"** account subtype
- Connects to banks, brokerages, retirement plans, crypto exchanges
- Coverage: 24 months of investment transaction data

**Limitations:**
- Stock plan support appears limited to the **brokerage account side** (where vested shares are held), not the equity administration platform itself
- Grant details, vesting schedules, unvested shares likely NOT accessible
- No direct integration with Carta, Shareworks, E*Trade Equity Edge, or Fidelity Stock Plan Services administration systems

**What IS Available:**
- Vested shares held in brokerage accounts
- Transaction history (sales, dividends)
- Account balances

**What's NOT Available:**
- Unvested grants
- Vesting schedules
- Strike prices for unexercised options
- ESPP enrollment details
- Tax lot information for grants

**Sources:**
- [Plaid Investments API Documentation](https://plaid.com/docs/api/products/investments/)
- [Plaid Investment Product Page](https://plaid.com/products/investments/)

---

### 2.2 Yodlee

**Coverage:** 16,000+ global data sources
**Investment Support:** Yes, includes investment container

**Equity Compensation Support:**
- Like Plaid, focused on **data aggregation** from investment accounts
- No evidence of direct equity compensation platform integration
- Primarily retail banking, credit cards, investment accounts

**Recent News:** Sold to Symphony Technology Group in 2025

**Sources:**
- [Yodlee Financial API](https://www.yodlee.com/financial-api)
- [Yodlee Developer Portal](https://developer.yodlee.com/)

---

### 2.3 SnapTrade

**Coverage:** 20+ retail brokerages, 125M+ accounts
**Supported Brokerages:** Robinhood, TradeStation, Fidelity (retail), E*Trade (retail), Schwab

**Equity Compensation Support:**
- **No specific equity compensation coverage found**
- Focused on retail brokerage integration for trading and portfolio tracking
- Does NOT appear to support stock plan services or equity administration platforms

**Sources:**
- [SnapTrade Homepage](https://snaptrade.com/)
- [SnapTrade Brokerage Integrations](https://snaptrade.com/brokerage-integrations)

---

### 2.4 Finicity (Mastercard)

**Focus:** Lending/credit workflows, income verification
**Coverage:** Personal, business, investment banking

**Equity Compensation Support:**
- No specific equity compensation coverage found
- Primarily used for mortgage lending, auto financing, personal loans
- Cash flow analytics and income verification focus

**Sources:**
- [Finicity API Review - Coveros](https://www.coveros.com/finicity-api-review/)

---

### 2.5 MX

**Focus:** Data aggregation + enhancement/analytics
**Features:** Personalized financial experiences, categorized transaction data

**Equity Compensation Support:**
- No specific equity compensation coverage found
- Focused on general financial data aggregation and enhancement

---

## 3. Data Availability by Platform

| Platform | Grants | Vesting | Exercise History | Tax Lots | FMV | CSV Export | API Access |
|----------|--------|---------|------------------|----------|-----|------------|------------|
| **Carta** | Yes | Yes | Yes | Yes | Yes | Yes | Partnership-based |
| **Shareworks** | Yes | Yes | Yes | Yes | Yes | Yes | Enterprise only |
| **E*Trade Equity Edge** | Yes | Yes | Yes | Yes | Yes | Yes | Corporate clients |
| **Fidelity Stock Plan** | Yes | Yes | Yes | Yes | Yes | Yes | Limited |
| **Schwab Stock Plan** | Yes | Yes | Yes | Yes | Yes | Yes | Developer portal |
| **Plaid** | No* | No | Partial** | No | No | N/A | Yes |
| **Yodlee** | No | No | Partial** | No | No | N/A | Yes |

*Only vested shares in brokerage accounts
**Sales transactions only after shares are in brokerage account

---

## 4. Integration Challenges

### 4.1 Technical Obstacles

1. **No Standardized Data Format**
   - Each platform has proprietary data structures
   - No industry-standard for equity compensation data exchange
   - Open Cap Table Format (OCF) emerging for cap tables, but limited adoption

2. **Enterprise-Only APIs**
   - Most platforms only offer APIs to corporate administrators
   - Individual employees/participants cannot authorize third-party access
   - No consumer-facing OAuth flows like banking aggregators

3. **Authentication Complexity**
   - JWT-based auth requiring enterprise credentials
   - No "Link" or "Connect" flow for consumer apps
   - SSO often tied to corporate identity systems

4. **Data Fragmentation**
   - Equity admin platforms separate from brokerage accounts
   - Pre-vest data (grants, vesting schedules) in admin system
   - Post-vest data (shares, transactions) in brokerage

### 4.2 Business Obstacles

1. **Security & Compliance Concerns**
   - Equity data is highly sensitive (material non-public information risk)
   - Platforms reluctant to expose data to third parties
   - Insider trading compliance requirements

2. **Limited Market for Individual Access**
   - B2B focus - platforms serve corporate clients, not individuals
   - No commercial incentive to build consumer-facing APIs
   - Revenue tied to enterprise contracts, not individual users

3. **Competitive Positioning**
   - Data lock-in as competitive moat
   - Limited interoperability by design

### 4.3 2025 Macro Challenges

- **JPMorgan charging aggregators:** In June 2025, JPMorgan recorded 1.89 billion API requests from aggregators, leading to new fees for high-frequency access
- **Infrastructure strain:** Rising API volumes causing system stability concerns
- **Fraud risk:** Banks citing security concerns for limiting third-party access

**Sources:**
- [JPMorgan to Charge Fintech Aggregators - FinTech Weekly](https://www.fintechweekly.com/magazine/articles/jpmorgan-to-charge-fintech-data-access-api-2025)
- [Top 10 Equity Compensation Issues 2025 - Equity Methods](https://www.equitymethods.com/articles/top-10-equity-compensation-issues-for-2025/)

---

## 5. Manual Import Options

### 5.1 CSV Export Capabilities

**Available from most platforms:**
- Shareworks: Portfolio > RSUs, Stock Options, & Awards
- Schwab Equity Awards: Export to CSV with Vest Date, Shares Granted, Award Date
- E*Trade: Download grant and transaction history
- Fidelity NetBenefits: Activity and holdings exports

**Common CSV Fields:**
- Grant/Award Date
- Vest Date
- Shares Granted
- Shares Vested
- Strike/Exercise Price
- Grant Type (ISO, NSO, RSU, RSA)
- Fair Market Value at vest

**Challenges:**
- No standardized format across platforms
- Date formats vary
- Field names inconsistent
- Manual reformatting often required

### 5.2 PDF Parsing

**Current State:**
- No robust automated PDF parsing solutions found
- Grant agreements, confirmation letters typically PDF
- Would require custom OCR/parsing development
- Limited commercial tools available

**Tools in Adjacent Space:**
- myStockOptions.com myRecords: Manual data entry with wizards
- Excel import/export for personal tracking
- No automated document extraction identified

**Sources:**
- [myStockOptions myTools](https://www.mystockoptions.com/mytools/)

---

## 6. Private Company Equity Tracking

### 6.1 Carta (Market Leader)

- 50,000+ private companies using platform
- Best API availability for private equity
- Partnership ecosystem (Secfi, Aeqium, Deel, etc.)
- 409A valuation services included

### 6.2 Pulley

**API & Integration:**
- API available (GraphQL, OpenAPI support)
- Open Cap Table Format (OCF) support
- Integration with HRIS: Gusto, Bamboo, Workday, Rippling
- Gunderson Dettmer integration (automatic cap table population)

**Pricing:** Starting at $1,200/year

**Sources:**
- [Pulley Homepage](https://pulley.com/)
- [Pulley API - API Tracker](https://apitracker.io/a/pulley)
- [Gunderson Dettmer Partnership](https://www.gunder.com/en/news-insights/firm-news/gunderson-dettmer-announces-cap-table-integration-partnership-with-vc-backed-pulley)

### 6.3 Other Options

- **Qapita:** Cap table + employee stock plans, 160+ country tax support
- **Eqvista:** Cap table management with compliance features
- **Cake Equity:** Free for <5 stakeholders, employee/investor portals
- **EQ Astrella:** Ownership tracking, secondary liquidity

---

## 7. Specialized Fintech Players

### 7.1 Secfi

**Focus:** Equity planning and stock option financing for tech professionals

**Services:**
- Personalized equity plans
- Stock option financing (non-recourse)
- Secondary market transactions
- Wealth management

**Carta Integration:** Direct API integration announced for equity planning

**Scale:** 40,000+ startup employees served, ~$45B in equity value

**Sources:**
- [Secfi Homepage](https://secfi.com/)
- [Secfi-Carta Partnership](https://secfi.com/learn/secfi-partnership-carta-equity-planning-startup-community)

### 7.2 Other Players

- **Vested:** Stock option funding for startup employees
- **Equitybee:** Funding platform for stock option exercise
- **Forge Global:** Secondary market for private shares
- **EquityZen:** Private company stock marketplace

---

## 8. Build vs Buy Analysis

### 8.1 Direct Integration Approach

**Pros:**
- Deep data access if partnerships secured
- Custom data models for specific needs
- No aggregator dependency

**Cons:**
- Each platform requires separate integration
- Enterprise partnerships difficult to obtain
- Ongoing maintenance for 5+ platforms
- No consumer-facing auth flows exist

**Estimated Effort:**
- 6-12 months per platform partnership negotiation
- $50,000-$200,000+ in development per integration
- Ongoing maintenance: 10-20% of build cost annually

### 8.2 Aggregator Approach

**Current Reality:**
- **No aggregator covers equity compensation comprehensively**
- Plaid/Yodlee only provide post-vest brokerage data
- SnapTrade/Finicity have no equity comp coverage

**If Aggregator Coverage Existed:**
- Single integration point
- Standardized data format
- OAuth consumer flows
- Cost: Typically $0.10-$2.00 per connection/month

### 8.3 Hybrid/Manual Approach

**Most Practical Current Option:**

1. **Plaid for Brokerage Data**
   - Vested shares, transaction history
   - Real-time balance updates
   - $0.10-$1.00 per connection

2. **Manual CSV/PDF Import**
   - User uploads from equity admin portals
   - Parse common CSV formats
   - Store grant/vesting data locally

3. **Partner with Specialized Players**
   - Secfi (if serving similar market)
   - Carta API (for private company data)

**Estimated Cost:**
- Plaid integration: $5,000-$20,000 + ongoing API fees
- CSV parser development: $10,000-$30,000
- Maintenance: $2,000-$5,000/month

### 8.4 Recommendation

For a personal finance app targeting equity compensation:

1. **Short-term (0-6 months):**
   - Integrate Plaid for brokerage-side data
   - Build robust CSV import with templates for major platforms
   - Manual data entry for grants/vesting schedules

2. **Medium-term (6-18 months):**
   - Explore Carta API partnership for private company data
   - Monitor Fidelity WorkplaceXchange/Schwab developer portal evolution
   - Build community templates for CSV formats

3. **Long-term (18+ months):**
   - Advocate for/monitor industry standardization (Open Cap Table Coalition)
   - Explore enterprise partnerships as user base grows
   - Consider B2B2C model partnering with employers

---

## 9. Summary Table

| Platform | API Available | Access Type | Individual Access | Aggregator Coverage |
|----------|--------------|-------------|-------------------|---------------------|
| Carta | Yes | Partnership | No (company admin only) | No |
| Shareworks | Yes | Enterprise | No | No |
| E*Trade Equity Edge | Yes | Corporate | No | No |
| Fidelity Stock Plan | Limited | Enterprise | Partial (Fidelity Access) | Partial (Plaid brokerage) |
| Schwab Stock Plan | Yes | Developer Portal | No | Partial (Plaid brokerage) |
| Plaid | N/A | N/A | Yes | Self |
| SnapTrade | N/A | N/A | Yes | Self |

---

## 10. Key Sources

### Platform Documentation
- [Carta API Platform](https://carta.com/api/)
- [Shareworks API Documentation](https://downloads.shareworks.com/api/index.html)
- [E*Trade Equity Edge Developer Portal](https://developer.etrade.com/corporate-services)
- [Fidelity WorkplaceXchange](https://workplacexchange.fidelity.com/public/wpx/api-catalog)
- [Schwab Developer Portal](https://developer.schwab.com/)
- [Morgan Stanley Developer Portal](https://developer.morganstanley.com/)

### Aggregator Documentation
- [Plaid Investments API](https://plaid.com/docs/api/products/investments/)
- [Yodlee Developer Portal](https://developer.yodlee.com/)
- [SnapTrade](https://snaptrade.com/)

### Industry Analysis
- [Top 10 Equity Compensation Issues for 2025 - Equity Methods](https://www.equitymethods.com/articles/top-10-equity-compensation-issues-for-2025/)
- [Best Equity Management Software 2025 - Pulley](https://pulley.com/guides/best-equity-management-software)
- [Compensation Planning Software Trends 2025 - Aeqium](https://www.aeqium.com/post/compensation-planning-software-trends-2025)

### Pricing References
- [Carta Pricing - Vendr](https://www.vendr.com/marketplace/carta)
- [Carta Pricing - Spendflo](https://www.spendflo.com/blog/how-much-does-carta-cost-a-breakdown-of-plans-and-pricing)
- [E*Trade Pricing - Vendr](https://www.vendr.com/buyer-guides/etrade)

---

*This research document was compiled in January 2026 and reflects information available at that time. API availability and features may change.*
