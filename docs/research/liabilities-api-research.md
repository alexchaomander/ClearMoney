# Liabilities Data API Research Report

**Purpose**: Document the landscape for financial data APIs focused on liabilities (mortgages, student loans, auto loans, personal loans, credit card debt, BNPL), including providers, capabilities, pricing, and build vs. buy considerations.

**Date**: 2026-01-26
**Last Updated**: 2026-01-26

---

## Executive Summary

The liabilities data aggregation market is served by several providers with varying capabilities. **Plaid** offers the most mature liabilities-specific product, while newer entrants like **Method Financial** and **Spinwheel** provide compelling alternatives with payment initiation capabilities. However, significant gaps exist - notably **auto loans are not well-supported by traditional aggregators**, and direct integration with loan servicers is generally not feasible due to lack of public APIs.

### Key Findings

| Provider | Student Loans | Mortgages | Credit Cards | Auto Loans | BNPL | Payments | Pricing Model |
|----------|--------------|-----------|--------------|------------|------|----------|---------------|
| Plaid | Yes | Yes | Yes | No | No | No | Subscription per Item |
| Method Financial | Yes | Yes | Yes | Yes | No | Yes | Custom, usage-based |
| Spinwheel | Yes | Yes | Yes | Yes | Limited | Yes | Custom |
| Finicity | Partial | Yes | Yes | Partial | No | No | Usage-based, custom |
| MX | Yes | Yes | Yes | Limited | No | No | Subscription, custom |
| Yodlee | Yes | Yes | Yes | Yes | No | No | Custom enterprise |
| Akoya | Yes | Yes | Yes | Yes | No | No | Custom |

---

## Major Providers

### 1. Plaid Liabilities API

Plaid's Liabilities product is the most mature and well-documented option for liabilities data aggregation.

#### Supported Account Types
- **Credit cards** (including PayPal Credit accounts)
- **Private student loans**
- **Mortgages**
- **Geographic scope**: United States with limited Canada coverage
- **NOT supported**: Auto loans, personal loans

#### Data Fields Available

**Credit Cards:**
- Account balances and statement information
- APR details (purchase, balance transfer, cash advance, special rates)
- Payment information (last payment date/amount, minimum payment, next due date)
- Credit limit and utilization
- Overdraft status

**Student Loans:**
- Loan identification and servicer details
- Interest rates (fixed/variable indicator)
- Disbursement dates and original principal
- Repayment plan information and status
- PSLF (Public Service Loan Forgiveness) eligibility tracking
- Payment history and outstanding interest amounts
- Expected payoff dates
- Guarantor information

**Mortgages:**
- Loan number and terms
- Interest rate type (fixed vs. variable) and current rate
- Maturity date
- Principal and interest payment breakdowns
- Property address information
- Escrow balance
- PMI status and prepayment penalty information
- Late fees and past-due amounts
- Original loan amount and current balance

#### Student Loan Servicer Coverage
Plaid explicitly supports major US servicers including:
- Navient
- Nelnet
- FedLoan (now transitioned)
- Great Lakes (acquired by Nelnet)
- Firstmark
- Commonbond Firstmark Services
- Granite State
- Oklahoma Student Loan Authority

**Note**: Institution-specific quirks exist. For example, Great Lakes, Firstmark, and others show the same minimum payment amount across all loans in an account. Firstmark and Navient display $0 minimum when autopay is active.

#### Pricing

Plaid uses a **subscription billing model** for Liabilities:
- Exact pricing requires contacting sales or applying for Production access
- General Plaid pricing structure:
  - **Free tier**: 200 API calls per product (Limited Production)
  - **Pay as You Go**: No minimum commitment, standard rates
  - **Growth**: $100/month minimum, 12-month commitment, discounted rates
  - **Scale/Enterprise**: $500+/month, volume discounts, dedicated support

**Estimated costs based on industry reports:**
- Per-link costs: $0.50 - $2.00 (with volume discounts at 10K+ connections)
- Cost per active user at scale:
  - Early stage (5,000 users): ~$0.90/user/month
  - Growth stage (50,000 users): ~$0.60/user/month
  - Scale (200,000+ users): ~$0.40/user/month

#### Data Refresh
- Liabilities data refreshed approximately once per day
- Webhook notifications available for updates

**Sources:**
- [Plaid Liabilities Documentation](https://plaid.com/docs/liabilities/)
- [Plaid Liabilities API Reference](https://plaid.com/docs/api/products/liabilities/)
- [Plaid Pricing](https://plaid.com/pricing/)

---

### 2. Finicity (Mastercard)

Finicity, acquired by Mastercard in 2020, focuses heavily on lending verification use cases.

#### Capabilities
- **Account aggregation** across 15,000+ financial institutions
- **95% coverage** of US deposit accounts and wealth management
- **Income verification** (FCRA compliant)
- **Asset verification**
- **Cash flow analysis** for underwriting
- **24 months** of transaction history in single API call

#### Liabilities Data
Finicity provides liabilities data primarily through their **Lend** product suite:
- Access to loan accounts through aggregation
- Focus on verification for lending decisions rather than ongoing tracking
- Strong FCRA compliance for consumer reporting

#### Pricing
- **Usage-based pricing** with custom quotes
- Three product tiers: Pay, Manage, and Lend
- Volume discounts available
- No public pricing - requires sales consultation

#### Best For
- Lending and credit decisioning workflows
- Mortgage origination
- Income and employment verification
- Enterprise use cases with Mastercard integration needs

**Sources:**
- [Finicity Lending API](https://www.finicity.com/lend/)
- [Finicity Financial Data APIs](https://www.finicity.com/manage/)

---

### 3. MX Technologies

MX emphasizes data quality and enrichment over raw connectivity.

#### Capabilities
- **1,800+ direct partnerships** with financial institutions
- **75%+ OAuth/direct connections** (vs screen scraping)
- **48,000 total connections** routed
- FDX-aligned standards
- Strong data enrichment and categorization

#### Liabilities Support
- Supports loan accounts including mortgages and auto loans
- Dashboards consolidate external relationships across credit cards, mortgages, auto loans, and wealth accounts
- Focus on "External Relationships" view for borrower assessment

#### 2025 Updates
- Platform API version 20250224 aggregates data from multiple products in single call
- Consolidated "Opportunities" dashboards across loan types

#### Pricing
- **Subscription-based** with custom pricing
- Not publicly available
- Concept of "coterminus minimums" unique to MX
- Generally requires sales engagement

#### Best For
- Apps focused on data quality and AI-powered categorization
- Financial institutions wanting clean, enriched data
- Budgeting and PFM applications

**Sources:**
- [MX Account Aggregation](https://www.mx.com/products/account-aggregation/)
- [MX 2025 Release Notes](https://docs.mx.com/release-notes/2025/)

---

### 4. Yodlee (Envestnet)

Yodlee is a veteran aggregator with broad global coverage.

#### Capabilities
- **19,000+ data sources** globally
- **17,000 global connections** (banks, credit cards, investments, loans, insurance)
- Multiple account containers: Bank, Credit Card, Investment, Insurance, Loan, Other Assets, Other Liabilities, Real Estate, Reward

#### Liabilities Data
- Comprehensive view of assets and liabilities
- Supports full loan account types
- Basic Aggregation Data dataset useful for lending solutions
- Up to 24 months transaction history

#### Pricing
- **Custom enterprise pricing**
- Requires sales consultation
- Enterprise-oriented (slower evaluation process)

#### Best For
- Enterprise applications
- Wealth management and "held-away" asset aggregation
- Global coverage requirements

**Sources:**
- [Yodlee Data Aggregation](https://www.yodlee.com/data-aggregation)
- [Yodlee Developer Portal](https://developer.yodlee.com/)

---

### 5. Akoya

Akoya operates as a 100% API-connected network with pass-through architecture (does not store user data).

#### Capabilities
- **4,300+ financial institutions** connected
- **7,000+ apps** powered
- FDX-aligned, consumer-permissioned access
- Pass-through model emphasizing security and consent

#### Liabilities Data (Balances Product)
- Real-time balances across checking, savings, credit cards, investments, **loan accounts**, and insurance
- Available balance, payment amounts, due dates
- Credit card rewards details and limits
- Year-to-date interest data
- Up to **2 years of historical statements** for underwriting

#### Best For
- Apps wanting FDX-native access
- Applications that handle their own enrichment
- Compliance-focused organizations

**Sources:**
- [Akoya Overview](https://akoya.com/)
- [Akoya Balances Product](https://akoya.com/products/investments)
- [Akoya Lending Use Cases](https://akoya.com/use-cases/lending-and-credit-enhancement)

---

### 6. Method Financial

Method Financial is an emerging leader in liabilities connectivity with a unique value proposition: **read AND write access** to liability accounts.

#### Capabilities
- **15,000+ financial institution coverage** (95% of all outstanding consumer liabilities)
- **Frictionless authentication**: Uses full name + phone number (PII-based), no credentials required
- **Real-time data**: Balances, transactions, due dates, payoff quotes, credit limits, APR ranges
- **Payment initiation**: Can execute payments, balance transfers, and payoffs
- **Push notifications**: Balance changes, new accounts, delinquency, and 300+ other data points

#### Supported Account Types
- Student loans
- Credit cards
- Personal loans
- **Auto loans** (unique differentiator)
- Mortgages
- Common recurring bills

#### Key Features
- **Payoffs Endpoint**: Retrieves real-time payoff quotes from lender (currently auto loans and mortgages)
- **Balance Transfers**: Execute balance transfers programmatically
- **Bill Pay**: Manage payments on recurring bills

#### Authentication Method
Method leverages consumer credit access protections from the 2010 Dodd-Frank Act. By combining identity verification from credit bureaus and telecom companies with core banking system data, Method can aggregate debts and execute transactions on behalf of permissioned users.

#### Scale (as of January 2025)
- 30 million+ account connections
- 4 million+ users
- $500 million+ in liability transactions processed
- Clients include SoFi, Aven, Happy Money, Figure

#### Pricing
- Custom pricing, contact sales
- Usage-based model
- No public pricing available

**Sources:**
- [Method Financial](https://methodfi.com/)
- [Method API Documentation](https://docs.methodfi.com/reference/introduction)
- [TechCrunch: Method helping SoFi build repayment functionality](https://techcrunch.com/2025/01/23/method-is-helping-fintech-companies-like-sofi-build-repayment-functionality-into-their-apps/)

---

### 7. Spinwheel

Spinwheel is a newer entrant focusing on the consumer credit ecosystem with strong AI capabilities.

#### Capabilities
- **165 million credit and liability accounts** connected
- **$1.5 trillion+ in consumer debt** accessible
- **15 million+ users** supported
- Real-time data aggregation AND payment processing

#### Key Features
- **PII-based linking**: Date of birth + phone number to aggregate liabilities
- **AI-powered payments**: 50 million+ AI-powered payment transactions processed
- **Debt optimization**: Average $150/month savings for users on Spinwheel Optimize

#### 2025 Funding
- $30 million Series A (June 2025)
- Led by F-Prime, with QED Investors, Foundation Capital, Fika Ventures
- Revenue increased 760% over 18 months

#### Unique Value Proposition
Combines Plaid-like data aggregation with Stripe-like payment processing in a single platform.

#### Pricing
- Custom pricing, contact sales
- No public pricing available

**Sources:**
- [Spinwheel](https://spinwheel.io/)
- [Spinwheel Product](https://spinwheel.io/product/)
- [Spinwheel $30M Series A Announcement](https://www.prnewswire.com/news-releases/spinwheel-raises-30-million-series-a-to-transform-the-consumer-credit-ecosystem-with-real-time-data-and-agentic-ai-302487893.html)

---

## Gap Analysis: Auto Loans

**Critical Gap**: Auto loans are poorly supported across all major aggregators.

| Provider | Auto Loan Support | Notes |
|----------|------------------|-------|
| Plaid | Not supported | Liabilities product does not include auto loans |
| Finicity | Partial | Through general account aggregation, not specialized |
| MX | Limited | Mentioned in dashboards, coverage unclear |
| Yodlee | Yes | Via Loan container, coverage varies |
| Akoya | Yes | Via Balances product, institution-dependent |

### Auto Finance-Specific Platforms

For auto loan data specifically, consider these specialized providers:

1. **S&P Global AutoCreditInsight** (with TransUnion)
   - Vehicle registration and loan origination data
   - Usage-based, depersonalized loan information

2. **LoanPro**
   - Cloud-native lending platform
   - 600+ lenders, 30M+ loans
   - API-first architecture for auto, consumer, and business lending

3. **Fuse**
   - Cloud-based origination for auto lenders
   - 100+ data/tech partner integrations

4. **Upstart Credit Decision API**
   - Real-time decisions for auto and personal loans
   - 2,500+ variables for risk-based pricing

**Sources:**
- [S&P Global AutoCreditInsight](https://www.spglobal.com/mobility/en/products/autocreditinsight.html)
- [LoanPro](https://nortridge.com/blog/best-auto-finance-software/)

---

## BNPL (Buy Now, Pay Later) Tracking

### Provider Landscape

BNPL data aggregation presents unique challenges as the major providers have varying approaches to data sharing.

#### Affirm
- **Credit Bureau Reporting**: Affirm is the first major BNPL provider to share consumer data with Experian, Equifax, and TransUnion (since Spring 2025)
- **Developer API**: Available for merchants via [Affirm Developer Docs](https://docs.affirm.com/developers/reference/introduction)
- **Consumer Data Access**: No direct consumer-permissioned API for third-party apps
- **Open Banking Usage**: Affirm uses open banking for its own underwriting (real-time account balances and cash flow trends from linked bank accounts)

#### Klarna
- **Credit Bureau Reporting**: **NOT sharing** BNPL plan data with credit bureaus (as of 2025). Only shares data on longer-term interest-bearing loans.
- **Reason**: Waiting until they can ensure customers won't be unfairly penalized by credit models
- **Developer API**: Merchant-focused APIs for order management, payment capture, refunds
- **Consumer Data Access**: No consumer-permissioned data sharing API

#### Afterpay (Block/Square)
- **Credit Bureau Reporting**: **NOT sharing** BNPL data with credit bureaus (as of 2025)
- **Developer API**: Merchant integration only
- **Consumer Data Access**: None for third-party aggregation

### Data Access Strategy for BNPL

**Current Reality**: No major BNPL provider offers a consumer-permissioned API for third-party financial apps to access transaction/balance data.

**Alternative Approaches**:
1. **Transaction Detection**: Identify BNPL payments in bank transaction data via enrichment (Method, Plaid, etc.)
2. **Credit Report**: Pull credit report data where BNPL is reported (Affirm only currently)
3. **Manual Entry**: User-reported BNPL obligations
4. **Email/Document Parsing**: Extract BNPL obligations from email confirmations (privacy concerns)

**Sources:**
- [Klarna and Afterpay Keep BNPL Data From Credit Bureaus](https://www.pymnts.com/buy-now-pay-later/2025/klarna-afterpay-keep-bnpl-data-from-credit-bureaus/)
- [Affirm Developer Documentation](https://docs.affirm.com/developers/reference/introduction)
- [Google Pay BNPL Integration](https://developers.google.com/pay/api/web/guides/resources/bnpl)

---

## Student Loan Forgiveness Eligibility Data

### PSLF (Public Service Loan Forgiveness) Data

#### Current Status (2025-2026)
- **Plaid supports**: PSLF eligibility status tracking in student loan data
- **New PSLF regulations**: Published October 30, 2025, effective July 1, 2026
- **Denial rate**: 93.0% of PSLF applications denied in 2025 (26.1% due to incomplete paperwork)

#### Data Available via Aggregators
- PSLF enrollment status
- Qualifying payment counts (where servicer provides)
- Employer certification status

### IDR (Income-Driven Repayment) Forgiveness Data

#### Current Access Challenges
- Department of Education removed visual IDR tracker in 2025
- Direct API endpoint still available: `studentaid.gov/app/api/nslds/payment-counter/summary` (requires sign-in)
- IBR users can still see forgiveness counts; SAVE/PAYE/ICR users cannot

#### One-Time IDR Account Adjustment
- Final adjustments completed January 16, 2025
- Retroactive credit applied toward 20/25-year forgiveness mark

#### SAVE Plan Status
- Currently in forbearance due to litigation
- Settlement proposed December 2025
- Updated repayment calculations expected September 2025
- Updated payments resume December 2025 (if settlement approved)

#### Data Points for Forgiveness Eligibility
1. **Payment count toward forgiveness** (20-year or 25-year)
2. **Qualifying payment history**
3. **Repayment plan type** (IBR, ICR, PAYE, SAVE/REPAYE)
4. **Loan type** (Direct Loans eligible; FFEL may need consolidation)
5. **Employment certification status** (PSLF)

### Integration Considerations

**Recommendation**: Rely on aggregator student loan data supplemented by user-provided information:
- Plaid provides detailed student loan data including some forgiveness-related fields
- Direct access to studentaid.gov data is not feasible for third-party apps
- Users may need to manually confirm forgiveness program enrollment and payment counts

**Sources:**
- [StudentAid.gov IDR Account Adjustment](https://studentaid.gov/announcements-events/idr-account-adjustment/)
- [PSLF Federal Student Aid](https://studentaid.gov/manage-loans/forgiveness-cancellation/public-service)
- [Student Loan Forgiveness Statistics 2025](https://educationdata.org/student-loan-forgiveness-statistics)
- [IDR Forgiveness Payment Count Data](https://vinfoundation.org/idr-forgiveness-payment-count-data-available/)

---

## Refinance Opportunity Detection

### Data Requirements for Refinance Detection

To identify refinance opportunities, the system needs:

1. **Current Loan Data**:
   - Outstanding balance
   - Current interest rate
   - Remaining term
   - Monthly payment
   - Loan type (fixed vs. variable)

2. **Market Rate Data**:
   - Current refinance rates by loan type
   - Rate forecasts and trends
   - Credit score tiers

3. **User Profile Data**:
   - Credit score (or estimate)
   - Employment status
   - Income

### Rate Thresholds (2025 Guidance)

#### General Rule
Refinancing makes sense when there's at least **1 percentage point spread** between current rate and available refi rate.

#### Current Market Rates (as of late 2025)

**Mortgages**:
- Average 30-year fixed: ~6.25-6.50%
- Homeowners with 7%+ rates have refinance opportunities
- Savings example: $400K mortgage at 7% vs 6.25% = ~$198/month savings

**Auto Loans**:
- Average new car loan (Q3 2025): 6.56%
- Average used car loan (Q3 2025): 11.40%
- Loans from 2022-2024 at 7%+ are candidates for refinancing

**Student Loans**:
- Average fixed APR range (Nov 2025): 5.18% - 10.84%
- Average variable APR range: 5.93% - 10.77%
- Federal loan rates: 6.5%+ (for recent originations)

### Implementation Approach

**Using Aggregator Data**:
1. Retrieve current loan details (rate, balance, term) from Plaid/Method
2. Compare against market rates from rate APIs or scraped data
3. Calculate potential savings based on spread
4. Account for refinance costs (closing costs, fees)
5. Present opportunity only when net benefit exceeds threshold

**Rate Data Sources**:
- [Bankrate Auto Loan Rate Index](https://www.bankrate.com/data-center/auto-loan/)
- [Credible Student Loan Refinance Rates](https://www.credible.com/refinance-student-loans)
- [Freddie Mac Primary Mortgage Market Survey](http://www.freddiemac.com/pmms/)

### Important Caveats

**Student Loans**: Warn users that refinancing federal loans into private loans means losing:
- Income-driven repayment plans
- Deferment/forbearance options
- PSLF eligibility
- Potential future forgiveness programs

**Sources:**
- [Fed Rate Cut: When to Refinance](https://www.cnbc.com/2025/09/19/fed-rate-cut-when-to-refinance-a-mortgage-car-loan-student-loan.html)
- [Bankrate Student Loan Refinance Rates 2025](https://www.bankrate.com/loans/student-loans/refinance-rates/)
- [Experian Auto Loan Interest Rates by Credit Score](https://www.bankrate.com/loans/auto-loans/average-car-loan-interest-rates-by-credit-score/)

---

## Direct Lender/Servicer Integration: Build vs. Buy Analysis

### Student Loan Servicers

**Current Major Federal Servicers (as of 2025):**
1. Nelnet
2. MOHELA
3. Aidvantage (Maximus Education)
4. EdFinancial
5. Central Research, Inc.

**Recent Transitions:**
- Navient exited federal servicing (2021-2022)
- MOHELA received many transferred accounts (including from Navient in October 2024)
- Great Lakes acquired by Nelnet (2018)
- FedLoan Servicing (PHEAA) exited

**API Availability**: **None publicly available**

Research found no evidence of public APIs from any major student loan servicer. These servicers:
- Do not offer third-party developer APIs
- Rely on aggregators (Plaid, etc.) for third-party data access
- Focus on direct borrower portals (servicing.mohela.com, nelnet.studentaid.gov)

**Recommendation**: Use aggregator (Plaid preferred for student loans)

---

### Mortgage Servicers

**Major Servicers:**
- Mr. Cooper (now merged with Rocket Mortgage as of October 2025)
- Rocket Mortgage (formerly Quicken Loans)
- Wells Fargo
- Bank of America
- Chase

**API Availability**: **Very limited / none for consumer apps**

**Findings:**
- **Mr. Cooper/Rocket**: Third-party data access blocked or limited. ServiceMac (powering some Mr. Cooper accounts) explicitly states no compatibility with financial management apps. The Rocket Mortgage acquisition has caused integration instability.
- **Major Banks (Wells Fargo, BofA, Chase)**: Support OAuth-based access through aggregators like Plaid, but do not offer direct consumer-facing APIs
- **Business APIs exist** (e.g., Mr. Cooper's integration with Freddie Mac Resolve tool), but these are for servicer-to-GSE workflows, not consumer apps

**Key Challenge**: JPMorgan Chase has begun charging aggregators for data access (2025), signaling industry-wide fee pressure.

**2025 Industry Development: Rocket Mortgage + Mr. Cooper Merger**

On October 1, 2025, Rocket Companies completed a $14.2 billion acquisition of Mr. Cooper Group, combining:
- **Rocket Mortgage**: Nation's largest home loan originator
- **Mr. Cooper**: Nation's largest mortgage servicer
- **Combined**: Nearly 10 million homeowners served

**Impact on Data Access**:
- Post-merger integration has caused connectivity issues for aggregators
- mrcooper.com now redirects to auth.rocketaccount.com
- Aggregators (including Plaid) are working to update connections
- No ETA for full resolution of data access issues

**Technology Assets**: Combined entity has $500M investment in data and AI, 30 petabytes of data, 65 million client calls annually.

**Recommendation**: Use aggregator for mortgage data; direct integration not feasible. Monitor for post-merger connectivity improvements.

---

### Auto Loan Servicers

**Major Captive Finance Arms:**
- GM Financial
- Ford Credit
- Toyota Financial Services
- Honda Financial Services
- Ally Auto

**API Availability**: **None for consumer data aggregation**

These are captive finance operations focused on dealer relationships, not third-party integrations.

**Recommendation**: Auto loans require either:
1. Specialized auto finance platforms (LoanPro, Upstart)
2. General aggregators with limited coverage
3. Manual data entry / document upload flows

---

## Pricing Comparison Summary

| Provider | Pricing Model | Estimated Cost | Best For |
|----------|--------------|----------------|----------|
| Plaid | Subscription per Item | $0.40-0.90/user/month at scale | Comprehensive liabilities, wide adoption |
| Finicity | Usage-based, custom | Contact sales | Lending verification, enterprise |
| MX | Subscription, custom | Contact sales | Data quality, enrichment |
| Yodlee | Enterprise custom | Contact sales | Global coverage, wealth management |
| Akoya | Custom | Contact sales | FDX-native, compliance-focused |

### Industry Trends Affecting Pricing (2025-2026)

1. **Bank data monetization**: JPMorgan Chase sent pricing sheets to aggregators in 2025. Other major banks expected to follow.
2. **Aggregator margin pressure**: Fee increases from data providers may be passed to customers.
3. **CFPB Section 1033 uncertainty**: Rule stayed in July 2025; new rulemaking underway. Compliance timeline (previously April 2026 for large FIs) now uncertain.
4. **Plaid-Chase agreement** (September 2025): New data transfer agreement "includes a pricing structure" - specifics not public.

**Sources:**
- [JPMorgan fees warning](https://fortune.com/2025/07/16/jpmorgan-chase-fees-fintechs-plaid-finicity-crypto-wall-street-citigroup-bank-of-america-wells-fargo/)
- [CFPB Section 1033 updates](https://www.consumerfinance.gov/rules-policy/rules-under-development/personal-financial-data-rights-reconsideration/)

---

## CFPB Section 1033 Regulatory Update

### Background

The CFPB's Personal Financial Data Rights rule (Section 1033) was intended to establish open banking standards in the US.

### Timeline

- **October 2024**: Final rule issued
- **January 17, 2025**: Rule became effective
- **April 2026-2030**: Original compliance dates (phased by institution size)
- **May 30, 2025**: CFPB filed motion asking court to vacate the rule
- **July 29, 2025**: Court granted stay of proceedings
- **August 22, 2025**: CFPB released Advance Notice of Proposed Rulemaking for reconsideration

### Current Status (as of December 2025)

The Section 1033 rule is effectively **on hold**:
- Litigation ongoing (Forcht Bank et al. vs CFPB)
- CFPB has signaled potential interim final rules due to funding constraints
- Compliance timeline is uncertain

### Key Issues Under Reconsideration

1. **Fee allocation**: Who pays for data access (banks, aggregators, or consumers)?
2. **"Representative" definition**: Who can request data on behalf of consumers?
3. **Security requirements**: Cost-benefit analysis of compliance investments
4. **Privacy protections**: Threat picture for consumer data privacy

### Impact on Liabilities Data

- JPMorgan Chase has indicated they may charge aggregators for data access
- Other major banks expected to follow
- Fee increases may be passed through to fintech customers
- Uncertainty may slow investment in new data products

**Sources:**
- [CFPB Personal Financial Data Rights Reconsideration](https://www.consumerfinance.gov/rules-policy/rules-under-development/personal-financial-data-rights-reconsideration/)
- [Federal Register: PFDR Reconsideration](https://www.federalregister.gov/documents/2025/08/22/2025-16139/personal-financial-data-rights-reconsideration)
- [Section 1033 Rule Stayed](https://www.consumerfinancialserviceslawmonitor.com/2025/07/cfpb-section-1033-open-banking-rule-stayed-as-cfpb-initiates-new-rulemaking/)

---

## Build vs. Buy Recommendation

### Buy (Use Aggregators) - Recommended

**Reasons:**
1. **No servicer APIs exist**: Student loan servicers, mortgage servicers, and auto lenders do not offer public APIs for consumer data access
2. **Regulatory complexity**: FCRA compliance, data security, and consent management are handled by aggregators
3. **Coverage breadth**: Aggregators maintain thousands of connections that would be impossible to build/maintain
4. **Authentication handled**: OAuth flows, credential management, and MFA are managed by the provider
5. **Data normalization**: Consistent schema across institutions

**Recommended Approach:**
1. **Primary for Read-Only**: Plaid Liabilities for student loans, mortgages, and credit cards
2. **Primary for Read+Write**: Method Financial for comprehensive liabilities with payment capabilities
3. **Secondary/Fallback**: MX, Finicity, or Spinwheel for broader coverage
4. **Auto loans**: Method Financial (best coverage) or accept limited coverage with document upload flow
5. **BNPL**: Transaction detection via enrichment + manual entry (no direct APIs available)

### Build Considerations

**Only consider building if:**
1. You have direct partnership agreements with specific servicers
2. You're operating as a lender/servicer yourself (B2B use case)
3. You need data that aggregators don't provide

**Hybrid approach viable for:**
- Building a multi-provider orchestration layer (route to best provider per institution)
- Adding document-based verification for unsupported account types
- Implementing user-reported data with verification

---

## Recommendations for ClearMoney

### Short-term (MVP)

**Option A: Read-Only Focus (Plaid)**
1. **Integrate Plaid Liabilities** for:
   - Student loans (strong coverage, PSLF data)
   - Mortgages (good coverage, data-rich)
   - Credit cards (comprehensive)
2. **Accept auto loan gap** - implement manual entry with future aggregator support
3. **Budget**: Plan for $0.50-1.00 per active user/month for liabilities data

**Option B: Read+Write Focus (Method Financial)**
1. **Integrate Method Financial** for:
   - All liability types including auto loans
   - Payoff quote capabilities
   - Future payment initiation features
2. **Advantage**: Single integration covers more account types
3. **Budget**: Contact Method for custom pricing

**Recommended**: Start with **Plaid** for broader ecosystem compatibility and proven reliability, with **Method** as a secondary integration for auto loans and payment capabilities.

### Medium-term

1. **Add Method Financial** for:
   - Auto loan data (primary gap filler)
   - Payment initiation capabilities
   - Payoff quote functionality

2. **Build abstraction layer** to normalize data across Plaid + Method

3. **Implement refinance opportunity detection**:
   - Compare user rates to market rates
   - Calculate potential savings
   - Surface opportunities with appropriate warnings (especially for federal student loans)

4. **Add BNPL detection** via transaction enrichment

5. **Implement confidence scoring** - show users data freshness and coverage quality

### Long-term

1. **Monitor CFPB 1033 developments** - regulatory clarity may change economics
2. **Evaluate Spinwheel** as AI-powered alternative with strong growth trajectory
3. **Evaluate Akoya** as FDX matures for direct bank connections
4. **Build forgiveness tracking module**:
   - PSLF payment count tracking
   - IDR forgiveness timeline projections
   - Alert users approaching forgiveness milestones
5. **Consider auto finance partnerships** if auto loan data becomes critical

---

## Sources

### Primary Documentation
- [Plaid Liabilities API Docs](https://plaid.com/docs/api/products/liabilities/)
- [Plaid Liabilities Product](https://plaid.com/products/liabilities/)
- [Plaid Pricing](https://plaid.com/pricing/)
- [Method Financial](https://methodfi.com/)
- [Method API Documentation](https://docs.methodfi.com/reference/introduction)
- [Spinwheel](https://spinwheel.io/)
- [Spinwheel Product](https://spinwheel.io/product/)
- [Finicity Lending API](https://www.finicity.com/lend/)
- [Finicity Mortgage Solutions](https://www.finicity.com/mortgage/)
- [Mastercard Open Finance Documentation](https://docs.finicity.com/)
- [MX Account Aggregation](https://www.mx.com/products/account-aggregation/)
- [Yodlee Data Aggregation](https://www.yodlee.com/data-aggregation)
- [Akoya APIs](https://docs.akoya.com/)
- [Akoya FDX Documentation](https://docs.akoya.com/docs/intro-to-fdx)

### Industry Analysis
- [Plaid vs Finicity vs MX Comparison](https://www.fintegrationfs.com/post/plaid-vs-mx-vs-finicity-which-us-open-banking-api-should-you-integrate)
- [JPMorgan Fees Impact](https://fortune.com/2025/07/16/jpmorgan-chase-fees-fintechs-plaid-finicity-crypto-wall-street-citigroup-bank-of-america-wells-fargo/)
- [TechCrunch: Method helping SoFi](https://techcrunch.com/2025/01/23/method-is-helping-fintech-companies-like-sofi-build-repayment-functionality-into-their-apps/)
- [Spinwheel $30M Series A](https://www.prnewswire.com/news-releases/spinwheel-raises-30-million-series-a-to-transform-the-consumer-credit-ecosystem-with-real-time-data-and-agentic-ai-302487893.html)

### Regulatory
- [CFPB 1033 Rule Status](https://www.consumerfinance.gov/rules-policy/rules-under-development/personal-financial-data-rights-reconsideration/)
- [CFPB Section 1033 Stayed](https://www.consumerfinancialserviceslawmonitor.com/2025/07/cfpb-section-1033-open-banking-rule-stayed-as-cfpb-initiates-new-rulemaking/)
- [Federal Register: PFDR Reconsideration](https://www.federalregister.gov/documents/2025/08/22/2025-16139/personal-financial-data-rights-reconsideration)

### Student Loans & Forgiveness
- [Federal Student Loan Servicers](https://studentaid.gov/manage-loans/repayment/servicers)
- [PSLF Federal Student Aid](https://studentaid.gov/manage-loans/forgiveness-cancellation/public-service)
- [StudentAid.gov IDR Account Adjustment](https://studentaid.gov/announcements-events/idr-account-adjustment/)
- [Student Loan Forgiveness Statistics 2025](https://educationdata.org/student-loan-forgiveness-statistics)
- [MOHELA Servicing](https://servicing.mohela.com/)
- [Nelnet](https://nelnet.com/)

### BNPL
- [Klarna and Afterpay Keep BNPL Data From Credit Bureaus](https://www.pymnts.com/buy-now-pay-later/2025/klarna-afterpay-keep-bnpl-data-from-credit-bureaus/)
- [Affirm Developer Documentation](https://docs.affirm.com/developers/reference/introduction)
- [BNPL Global Report 2025](https://www.globenewswire.com/news-release/2025/02/24/3031214/0/en/Buy-Now-Pay-Later-Global-Business-Report-2025-BNPL-Payments-to-Grow-by-13-7-to-Surpass-560-Billion-this-Year-Driven-by-Klarna-Afterpay-PayPal-and-Affirm-Forecast-to-2030.html)

### Mortgage Industry
- [Rocket Companies Acquires Mr. Cooper](https://www.rocketcompanies.com/press-release/rocket-companies-closes-14-2-billion-acquisition-of-mr-cooper/)
- [Finicity Automated Asset Verification](https://blog.pultemortgage.com/index.php/2025/04/01/simplifying-asset-verification-how-finicity-automated-assets-verification-works/)

### Refinancing Data
- [Fed Rate Cut: When to Refinance](https://www.cnbc.com/2025/09/19/fed-rate-cut-when-to-refinance-a-mortgage-car-loan-student-loan.html)
- [Bankrate Student Loan Refinance Rates](https://www.bankrate.com/loans/student-loans/refinance-rates/)
- [Bankrate Auto Loan Rate Index](https://www.bankrate.com/data-center/auto-loan/)
- [Experian Auto Loan Debt Study](https://www.experian.com/blogs/ask-experian/research/auto-loan-debt-study/)
