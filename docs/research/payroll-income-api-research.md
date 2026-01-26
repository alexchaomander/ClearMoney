# Payroll and Income Verification APIs: Comprehensive Research Report

**Date:** January 2026
**Purpose:** Research payroll connectivity and income verification APIs for ClearMoney Context Graph

---

## Executive Summary

The payroll connectivity and income verification API market has matured significantly, with several major players offering consumer-permissioned access to payroll data. This report covers the major providers, their capabilities, pricing models, coverage, and use cases for fintech applications.

---

## 1. Major Providers Overview

### Consumer-Permissioned Payroll Aggregators

| Provider | Founded | Funding | Coverage | Key Differentiator |
|----------|---------|---------|----------|-------------------|
| **Argyle** | 2018 | $100M+ | 90% US workforce | Mortgage/lending focus, GSE integrations |
| **Pinwheel** | 2018 | $77M+ | 80-90% US workforce | 1,500+ payroll platforms, time & attendance |
| **Atomic** | 2019 | $68M+ | 75-90% US workforce | Financial connectivity focus |
| **Truv** | - | - | 96% US workforce | Highest claimed coverage, GSE certified |
| **Plaid Income** | - | - | ~85% US workforce | Part of broader Plaid ecosystem |
| **Truework** | - | - | Varies | Traditional verification + API hybrid |

### Traditional Verification Services

| Provider | Database Size | Model |
|----------|--------------|-------|
| **The Work Number (Equifax)** | 4.74M employers | Employer-contributed data |
| **Truework** | - | Hybrid (API + manual verification) |

### Universal HR/Payroll APIs (B2B)

| Provider | Integrations | Focus |
|----------|--------------|-------|
| **Finch** | 220+ systems | Employer-side integrations |
| **Merge** | Multiple systems | Unified API platform |

---

## 2. Detailed Provider Analysis

### Argyle

**Overview**: [Argyle](https://argyle.com/) provides the "most robust and comprehensive payroll connectivity API" with focus on income/employment verification and deposit switching.

**Data Available**:
- Real-time income and employment data
- Pay stubs and historical pay data
- W-2s and tax documents
- Employment history and status
- Gig platform income (30+ platforms)
- Asset verification

**Coverage**:
- 90% of the U.S. workforce
- 30+ gig platforms
- Hit rates 4-5x higher than other providers (per their claims)
- Coverage superior to three largest credit bureaus

**Pricing**:
- Pay-as-you-go model ("only pay for data you need")
- Claims 60-80% cost savings vs. The Work Number
- Zero re-verification costs
- Free trial available (no credit card required)
- Contact sales for specific pricing

**Key Features**:
- Doc VOI: Paystub and W-2 verification integrated with Freddie Mac's AIM Check API
- Real-time change notifications for income/employment status
- GSE integrations (Fannie Mae DU, Freddie Mac)
- Named Forbes America's Best Startup Employers 2025

**Sources**: [Argyle Main](https://argyle.com/), [Argyle API](https://argyle.com/platform-overview/api/), [Argyle Verification](https://argyle.com/use-cases/verification-income-and-employment/)

---

### Pinwheel

**Overview**: [Pinwheel](https://www.pinwheelapi.com/) offers payroll API for deposit switching, income verification, and earned wage access.

**Data Available**:
- Employment and income data
- Pay stubs and tax documents (W-2s)
- Shifts data from time & attendance platforms
- Direct deposit information
- Historical pay data

**Coverage**:
- 80-90% of U.S. workers
- 1,500+ payroll and income platforms (3x industry average)
- 97% of Fortune 1000 companies
- Top 20 time & attendance systems (25M hourly workers)
- 17,000+ deposit switch partners

**Pricing**:
- Usage-based pricing (verification requests, deposit switching volume)
- Tailored pricing upon request
- Contact sales for specifics

**Key Features**:
- Pinwheel Prime: 100% credential-less solution
- PreMatch: Proactively identifies users' payroll accounts (piloted with Varo, April 2025)
- FCRA-compliant Consumer Reporting Agency
- Partnership with Plaid for deposit switching referrals

**Major Customers**: Block (Cash App), Acorns, Varo

**Sources**: [Pinwheel](https://www.pinwheelapi.com/), [Pinwheel Deposit Switch](https://www.pinwheelapi.com/products/deposit-switch), [Pinwheel vs Competitors](https://www.pinwheelapi.com/blog-post/pinwheel-vs-atomic-vs-argyle)

---

### Atomic Financial

**Overview**: [Atomic](https://atomic.financial/) is a financial connectivity platform for deposit switching and income verification.

**Data Available**:
- Employer information
- Employment status
- Income data
- Start date
- Historical employment data
- Pay statements

**Coverage**:
- 75-90% of U.S. payroll providers
- Gig platforms and traditional employers

**Pricing**:
- Usage-based for income/employment verification
- SaaS-like model for direct deposit product
- Bundle options available
- Contact for specific pricing

**Key Features**:
- Instant data retrieval for loan approvals
- Direct integrations for tamper-proof data
- Verification in seconds without document uploads
- SOC 2 compliant

**Sources**: [Atomic](https://atomic.financial/), [Atomic Verify](https://atomic.financial/solutions/userlink/verify/), [Atomic Docs](https://docs.atomicfi.com/)

---

### Truv

**Overview**: [Truv](https://truv.com/) positions itself as having the highest coverage in the market with strong GSE certifications.

**Data Available**:
- Income and employment verification
- Bank income (verified transaction data)
- Tax documents
- Full-time, part-time, gig, self-employed, retirement income

**Coverage**:
- 96% of U.S. workforce (highest claimed)
- 2.3 million employers
- 98% of banking users
- 70%+ TurboTax users for tax data
- 14,000+ banks, credit unions, and fintechs

**Pricing**:
- Transparent, consistent pricing
- 60-80% savings vs. legacy verification solutions
- Subscription and/or transaction-based models
- Contact sales for specifics

**Key Features**:
- GSE certified (Fannie Mae DU, Freddie Mac LPA/AIM)
- 45-second verification
- Bank Income product with 65%+ conversion
- Partnership with Vesta for mortgage verification

**Sources**: [Truv](https://truv.com/), [Truv Coverage](https://truv.com/blog/truvs-deep-dive-into-coverage-and-conversion), [Truv Bank Income](https://truv.com/blog/introducing-truv-bank-income-turning-bank-transactions-into-verified-income)

---

### Plaid Income

**Overview**: [Plaid Income](https://plaid.com/products/income/) is part of Plaid's broader financial data platform, offering multiple verification methods.

**Data Available**:
- Payroll Income: Employment and gross income from payroll accounts
- Bank Income: Net income from bank transaction analysis
- Document Income: Pay stubs, W-2s, 1099s, bank statements
- Consumer Report Income: FCRA-compliant with 12+ categorized income streams

**Coverage**:
- ~85% of U.S. workforce via payroll providers
- 12,000+ data partners
- Document coverage for pay stubs, W-2, 1099s

**Pricing**:
- First 200 API calls free
- One-time, subscription, and per-request models available
- Volume discounts based on contract length/commitment
- Contact sales for Income product pricing

**Key Features**:
- 99.8% approval rate for Plaid-verified applicants (vs. 78% manual)
- Multiple verification methods (payroll, bank, document)
- Consumer Report Income (FCRA-compliant, recommended for new customers)
- December 2025 API updates for user creation

**Sources**: [Plaid Income](https://plaid.com/products/income/), [Plaid Income Docs](https://plaid.com/docs/income/), [Plaid Pricing](https://plaid.com/pricing/)

---

### Truework

**Overview**: [Truework](https://www.truework.com/) offers automated verification with traditional fallback options.

**Data Available**:
- Employment verification
- Income verification
- Historical employment data

**Pricing** (Published):
- **Employment report**: $54.95
- **Income and employment report**: $59.95
- **Re-verification**: $19.95
- Annual setup fee: $149.99
- Monthly account service fee: $19.99
- Monthly security monitoring fee: $9.99
- Custom subscription plans available

**Key Features**:
- 75% completion rate (industry-leading per their claims)
- 50% cost savings vs. traditional methods
- Hybrid approach: API + manual verification fallback
- Partnership with TransUnion for mortgage lenders

**Sources**: [Truework](https://www.truework.com/), [Truework Pricing](https://www.truework.com/pricing), [Truework Help](https://help.truework.com/hc/en-us/articles/360048743094-Verification-Pricing)

---

### The Work Number (Equifax)

**Overview**: [The Work Number](https://theworknumber.com/) is the largest employer-contributed payroll database.

**Database Size**:
- 4.74 million contributing employers
- 149 million verification requests in 2024

**Pricing**:
- Industry standard: $60-100 per request
- Historical costs have increased significantly (once $20, now much higher)
- Volume-based pricing for 250+ verifications/year
- Social service verification: $149.99 setup + $19.99-29.98/month

**Limitations**:
- Employer must contribute data (not consumer-permissioned)
- Higher costs than payroll API alternatives
- No real-time data for non-contributing employers

**Sources**: [The Work Number](https://theworknumber.com/), [TWN Pricing](https://theworknumber.com/verification-sign-up)

---

## 3. Direct Payroll System Integration (Build vs. Buy)

### ADP

**API Access**: [ADP Developer Portal](https://developers.adp.com/) and [ADP API Central](https://www.adp.com/what-we-offer/integrations/api-central.aspx)

**Requirements**:
- Must become ADP Marketplace partner (gated API)
- OAuth 2.0 + CSR certificate for authentication
- Developer registration code from HR/payroll admin

**Available APIs**:
- Employee Sync (job titles, demographics)
- Payroll Input (earnings, deductions, reimbursements)
- Payroll Output
- PTO/Time Off
- Time, Attendance and Schedules

**Challenges**:
- Scheduled synchronization (not always real-time)
- Complex onboarding process
- Partnership application required
- Multiple products with different APIs

**Sources**: [ADP Developers](https://developers.adp.com/), [ADP API Guide](https://www.getknit.dev/blog/adp-api-integration-in-depth)

---

### Workday

**API Access**: Available to customers and certified partners

**API Types**:
- SOAP API: Complex data, payroll/financial (XML)
- REST API: Modern, cloud apps (JSON)
- Report-as-a-Service (RaaS)

**Requirements**:
- Partnership agreement for non-customers
- Integration System User (ISU) credentials
- OAuth 2.0 authentication
- No direct database access (all via API)

**Challenges**:
- Bi-annual updates require maintenance
- Nested data structures
- GDPR/privacy compliance complexity
- Rate limiting
- Large enterprise focus

**September 2025 Updates**:
- Workday GO Global Payroll (multi-country payroll)
- Acquisition of Pipedream (3,000+ pre-built connectors)

**Sources**: [Workday API Guide](https://www.getknit.dev/blog/workday-api-integration-in-depth), [Workday Integration Challenges](https://www.azilen.com/blog/workday-api-integration/)

---

### Gusto Embedded

**Overview**: [Gusto Embedded](https://embedded.gusto.com/) allows embedding payroll functionality into your application.

**Integration Options**:
- Direct API access
- Pre-built UI components (iFrames)
- SDKs
- Webhooks

**Key Stats**:
- Public API since 2013
- 200+ integration partners
- 70M+ API calls/month
- Tens of thousands of payroll customers

**Security**:
- SOC 2 Type II certified
- TLS v1.2 encryption
- AES-256 key encryption
- OAuth2 authentication

**Use Cases**:
- Vertical SaaS platforms
- Time tracking platforms
- Accounting platforms
- POS platforms

**Sources**: [Gusto Embedded](https://embedded.gusto.com/), [Gusto Payroll API](https://embedded.gusto.com/product/payroll-api), [Gusto Docs](https://docs.gusto.com/)

---

### Finch (Universal API)

**Overview**: [Finch](https://www.tryfinch.com/) provides a universal API for accessing employer HR/payroll systems.

**Coverage**:
- 220+ HRIS and payroll systems
- 80% of U.S. employers
- Compatible with any recordkeeping/TPA software

**Key Features**:
- Standardized data across providers
- Free tier to start
- SOC 2 and HIPAA compliant
- Automated data refresh
- November 2024: Universal compatibility for retirement industry

**Use Case**: B2B applications needing employer-side payroll data (benefits administration, 401k, etc.)

**Sources**: [Finch](https://www.tryfinch.com/), [Finch API](https://www.tryfinch.com/finch-api)

---

## 4. Build vs. Buy Analysis

### When to Use Aggregators (Argyle, Pinwheel, Atomic, etc.)

**Advantages**:
- Immediate 75-96% workforce coverage
- Pre-built compliance (FCRA, security)
- Single integration vs. hundreds of payroll systems
- Consumer-permissioned (user logs into their own account)
- Ongoing maintenance handled by provider
- 60-80% cost savings vs. The Work Number

**Best For**:
- Consumer lending (mortgage, personal loans)
- Tenant screening
- Employment verification
- Deposit switching for neobanks
- Earned wage access

### When to Build Direct Integrations

**Advantages**:
- Full control over data and experience
- No per-transaction costs at scale
- Deeper integration with specific systems
- Custom data needs

**Challenges**:
- ADP/Workday require partnership agreements
- Each integration = separate development effort
- Ongoing maintenance for API changes
- Authentication complexity (OAuth, certificates)
- 8-10 weeks minimum for custom integrations

**Best For**:
- Large enterprises with specific payroll providers
- B2B applications with employer consent
- Internal HR systems integration

### Hybrid Approach: Finch + Aggregators

For B2B use cases, Finch provides employer-side integrations, while Argyle/Pinwheel/Atomic provide consumer-permissioned access. Some applications may benefit from both.

---

## 5. Use Cases

### Income Verification (VOI/VOE)
- **Mortgage lending**: Fannie Mae DU, Freddie Mac LPA integrations
- **Personal lending**: Underwriting without credit scores
- **Tenant screening**: Rental applications
- **Background checks**: Employment verification

### Direct Deposit Switching
- **Neobanks**: Acquiring primary banking relationships
- **Challenger banks**: One neobank grew deposits 20% in first month with Pinwheel

### Earned Wage Access (EWA)
- Requires time & attendance + payroll data
- Pinwheel covers top 20 T&A systems (25M hourly workers)
- Examples: U.S. Bank + Payactiv, PNC + DailyPay

### Paycheck-Linked Lending
- Automatic loan repayments tied to paycheck
- Perpay: 3x repayment rate improvement with Pinwheel
- Reduces default risk through "voluntary garnishment"

### Cash Flow Underwriting
- Real-time earnings data for credit decisions
- Better risk assessment than credit scores alone
- Expands credit access to thin-file consumers

---

## 6. Compliance Considerations

### FCRA Compliance
- Required for credit decisioning use cases
- Pinwheel operates as FCRA-compliant CRA
- Penalties: $100-$1,000 per violation (multi-million dollar penalties possible)
- Requirements: Consumer dispute process, accuracy obligations, permissible purpose

### Consumer-Permissioned Data
- User authorizes access by logging into their account
- Can revoke permission at any time
- CFPB supports "meaningful control" over data use
- Purpose limitations and data deletion requirements emerging

### Security Requirements
- SOC 2 Type II (industry standard)
- TLS encryption for data in transit
- AES-256 for data at rest
- OAuth 2.0 authentication

---

## 7. Pricing Summary

| Provider | Model | Estimated Cost Range | Notes |
|----------|-------|---------------------|-------|
| **Argyle** | Per-verification | 60-80% less than TWN | Contact for pricing |
| **Pinwheel** | Usage-based | Custom | Contact for pricing |
| **Atomic** | Usage + SaaS | Custom | Bundle options |
| **Truv** | Transaction/subscription | 60-80% less than legacy | Contact for pricing |
| **Plaid Income** | Per-request + subscription | First 200 free | Volume discounts |
| **Truework** | Per-verification | $54.95-$59.95 | Published pricing |
| **The Work Number** | Per-verification | $60-100+ | Industry benchmark |
| **Finch** | Usage-based | Free tier available | Contact for enterprise |

---

## 8. Recommendations for ClearMoney

### For Consumer Lending / Mortgage
- **Primary**: Argyle or Truv (GSE integrations, mortgage focus)
- **Alternative**: Plaid Income (existing Plaid relationship)
- **Fallback**: Truework (manual verification backup)

### For Neobanks / Deposit Switching
- **Primary**: Pinwheel (largest network, PreMatch technology)
- **Alternative**: Atomic or Argyle

### For Earned Wage Access
- **Primary**: Pinwheel (T&A integrations, EWA estimation model)
- **Alternative**: Atomic

### For B2B / Employer-Side Integration
- **Primary**: Finch (universal API)
- **Alternative**: Direct ADP/Workday integration (if single provider)

### For Embedded Payroll in SaaS
- **Primary**: Gusto Embedded

---

## Sources

**Provider Websites**:
- [Argyle](https://argyle.com/)
- [Pinwheel](https://www.pinwheelapi.com/)
- [Atomic Financial](https://atomic.financial/)
- [Truv](https://truv.com/)
- [Plaid Income](https://plaid.com/products/income/)
- [Truework](https://www.truework.com/)
- [The Work Number](https://theworknumber.com/)
- [Finch](https://www.tryfinch.com/)
- [Gusto Embedded](https://embedded.gusto.com/)
- [ADP Developer Portal](https://developers.adp.com/)

**Analysis & Comparisons**:
- [Pinwheel vs. Atomic vs. Argyle](https://www.pinwheelapi.com/blog-post/pinwheel-vs-atomic-vs-argyle)
- [Sacra: Direct Deposit Switching APIs](https://sacra.com/research/pinwheel-argyle-atomic-direct-deposit-switching/)
- [The Promise of Payroll APIs - a16z](https://a16z.com/the-promise-of-payroll-apis/)
- [Pinwheel: Power of Payroll APIs](https://www.pinwheelapi.com/blog-post/payroll-api)

**Technical Guides**:
- [ADP API Integration Guide](https://www.getknit.dev/blog/adp-api-integration-in-depth)
- [Workday API Integration Guide](https://www.getknit.dev/blog/workday-api-integration-in-depth)
- [Workday API Integration Challenges 2025](https://www.azilen.com/blog/workday-api-integration/)

**Compliance & Regulatory**:
- [Pinwheel FCRA Compliance](https://www.pinwheelapi.com/blog-post/announcing-pinwheels-fcra-compliance)
- [Consumer-Permissioned Data](https://www.pinwheelapi.com/blog-post/consumer-permissioned-data)
- [CFPB FCRA Resources](https://www.consumerfinance.gov/compliance/compliance-resources/other-applicable-requirements/fair-credit-reporting-act/)
