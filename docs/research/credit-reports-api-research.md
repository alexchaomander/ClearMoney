# Credit Reports and Credit Scores API Research

**Research Date:** January 2026
**Focus:** Consumer-permissioned credit data, soft pull options, credit monitoring, and identity verification

---

## Executive Summary

This document provides comprehensive research on APIs for accessing credit bureau data, credit scores, and related financial information. The landscape has evolved significantly in 2025-2026 with major partnerships (FICO-Plaid, Experian-Plaid), new scoring models (VantageScore 4.0 for mortgages), and increasing focus on consumer-permissioned data access.

**Key Findings:**
- Direct bureau APIs require enterprise agreements and compliance certification
- Third-party aggregators (Array, iSoftpull, CRS) offer easier integration paths
- Soft pull APIs are widely available for consumer-facing monitoring apps
- Plaid's new LendScore and FICO partnership represent major innovations
- VantageScore 4.0 is now approved for Fannie Mae/Freddie Mac mortgages
- Pricing is opaque but typically ranges $0.50-$4.00 per pull through aggregators

---

## 1. Experian API

### Overview
Experian is one of the three major credit bureaus, offering developer access through their Connect API and Global Developer Portal.

### Key Products

| Product | Description | Use Case |
|---------|-------------|----------|
| Experian Connect API | FCRA-compliant credit check functionality | Credit monitoring, prequalification |
| RentBureau Consumer Profile | Rental payment history (40M+ profiles) | Tenant screening, thin-file consumers |
| VantageScore 4.0 | Free for mortgage lenders (2025 offer) | Mortgage underwriting |
| Identity Verification | KYC/fraud prevention | Account opening, compliance |

### Access Requirements
- Register at [developer.experian.com](https://developer.experian.com/)
- Obtain Client ID and Client Secret
- Must have FCRA-compliant permissible purpose
- Enterprise agreement required for production access

### Technical Details
- RESTful API with JSON/XML responses
- OAuth 2.0 authentication
- Real-time data processing
- Supports soft inquiries (no score impact)

### 2025 Updates
- **September 2025:** Added RentBureau Consumer Profile to Connect API, enabling access to rental payment history for ~40 million renters
- **October 2025:** Announced free VantageScore 4.0 for mortgage clients, with 50%+ discount if/when pricing applies

### Pricing
- Not publicly disclosed
- Contact Experian directly for enterprise pricing
- Third-party resellers offer access from ~$2.90-$3.99 per report

### Sources
- [Experian Connect API](https://www.experian.com/connect/api/)
- [Experian Global Developer Portal](https://developer.experian.com/)
- [Experian Rental History Announcement](https://www.experianplc.com/newsroom/press-releases/2025/experian-adds-rental-history-to-experian-connect-api--helping-mo)

---

## 2. Equifax API

### Overview
Equifax provides developer access through their API Developer Portal with access to 800+ million credit reports globally.

### Key Products

| Product | Description | Use Case |
|---------|-------------|----------|
| Consumer Engagement Suite | White-label credit monitoring | Consumer-facing apps |
| Credit Reports API | Single/multi-bureau reports | Lending decisions |
| Credit Report Monitoring API | Event-based alerts | Ongoing monitoring |
| Digital Identity Trust | Phone/email/address verification | KYC/fraud prevention |
| Identity Proofing | Single API for identity + fraud | Account opening |

### Consumer Engagement Suite Features
- Single and multi-bureau credit monitoring
- VantageScore and FICO score options
- Credit report summaries (utilization, account age, limits)
- "Flashback" historical comparison feature
- Alerts for new inquiries and account changes

### Access Requirements
- Register at [developer.equifax.com](https://developer.equifax.com/)
- Sandbox environment available for testing
- API keys and authentication management
- FCRA compliance required

### Technical Details
- RESTful APIs with JSON responses
- Scheduled recurring or on-demand delivery
- Historical credit report access
- Individual APIs for each credit file component

### 2025 Updates
- **October 2025:** Highlighted VantageScore 4.0 opportunities for lenders
- Addressing synthetic identity fraud (50-70% of credit fraud losses)

### Pricing
- Reports from ~$2.90-$3.99 via resellers
- Direct pricing requires enterprise agreement

### Sources
- [Equifax API Developer Portal](https://developer.equifax.com/)
- [Equifax Consumer Engagement Suite](https://www.equifax.com/business/product/credit-services-api/)
- [Equifax API Products](https://developer.equifax.com/products/apiproducts)

---

## 3. TransUnion API

### Overview
TransUnion offers TrueVision suite with trended data and technical services portal for developers.

### Key Products

| Product | Description | Use Case |
|---------|-------------|----------|
| TrueVision | Trended credit data (72 months history) | Behavioral insights |
| TU4.0/TU4.1 | Credit report processing | Traditional credit pulls |
| TrueVision Mortgage Score | UK mortgage-specific scoring | Mortgage underwriting |
| TruIQ Data Enrichment | Pseudonymized credit data | Analytics/modeling |

### TrueVision Features
- 2,000+ data attributes
- Up to 72 months account history
- Actual payment amounts (not just on-time/late)
- Balance trends and spending patterns
- Payment behavior analytics

### Access Requirements
- Technical services portal: [techservices.transunion.com](https://techservices.transunion.com/)
- Integration partners available (iSoftpull)
- XML feeds for batch processing
- Enterprise agreement required

### Technical Details
- TUXML code examples available
- TU4.0 and TU4.1 record processing
- Batch and real-time options
- Partner integrations (e.g., Percayso for insurance)

### 2025-2026 Updates
- **January 2026:** New mortgage pricing went live
- TruIQ offering unlimited pseudonymized credit data access in private environments

### Sources
- [TransUnion TrueVision](https://www.transunion.com/solution/truvision)
- [TransUnion Technical Services](https://techservices.transunion.com/doc-repository)
- [TransUnion TruIQ Announcement](https://newsroom.transunion.com/transunion-truiq-data-enrichment-first-to-offer-financial-institutions-with-unlimited-access-to-pseudonymized-credit-data-within-their-private-environments/)

---

## 4. Credit Karma / Intuit

### Overview
Credit Karma, acquired by Intuit in 2020, is primarily a B2C platform. B2B API access is limited and primarily through Intuit's Financial Data Platform.

### B2B Integration Options

| Integration | Description | Access |
|-------------|-------------|--------|
| Intuit Financial Data Platform | Bank feeds to QuickBooks, Quicken, Credit Karma | Partner program |
| Rutter Bank Feeds | Third-party integration to Intuit ecosystem | Via Rutter API |

### Consumer-Facing Features (Not B2B API)
- **Credit Spark:** Helps consumers build credit via rent/utility payments (TransUnion reporting)
- **Debt Assistant:** AI-powered debt paydown planning (2025)
- **Multi-bureau monitoring:** Free credit reports and scores

### Key Points
- No direct public API for credit data access
- 70,000+ data points per customer (internal use)
- Focus on consumer experiences, not B2B data sales
- Integration primarily through Intuit ecosystem partners

### 2025 Updates
- **November 2025:** Agentic AI integration across Credit Karma and TurboTax
- **December 2025:** Circle/USDC partnership for stablecoin integration

### Assessment for B2B Use
Credit Karma does NOT offer a traditional B2B credit data API. For credit bureau data access, use direct bureau APIs or third-party aggregators instead.

### Sources
- [Intuit Financial Data Platform](https://www.intuit.com/partners/fdp/implementation-support/direct-api/)
- [Rutter Bank Feeds](https://www.rutter.com/blog/introducing-bank-feeds-for-quickbooks-desktop-quicken-and-credit-karma)
- [Intuit Consumer Platform Announcement](https://www.cpapracticeadvisor.com/2025/11/06/intuit-unveils-consumer-platform-incorporates-agentic-ai-across-credit-karma-and-turbotax/172546/)

---

## 5. FICO Score APIs

### Overview
FICO scores are the industry standard for credit scoring. Programmatic access is available through bureau partnerships and third-party providers.

### Access Methods

| Method | Description | Availability |
|--------|-------------|--------------|
| Via Credit Bureaus | FICO scores bundled with bureau data | Through Experian/Equifax/TransUnion |
| iSoftpull | All three bureaus + FICO/VantageScore | Third-party aggregator |
| CRS Credit API | Unified platform | Third-party aggregator |
| UltraFICO (Coming) | Cash flow + credit data | Beta early 2026 |

### Major 2025 Development: FICO-Plaid Partnership

**Announced November 20, 2025:**
- Next-generation UltraFICO Score combining credit metrics with real-time cash flow data
- Uses FICO Scores 10T and 9T frameworks with trended data
- Plaid APIs deliver anonymized cash flow metrics (deposits, outflows, balances)
- Plaid connectivity to 12,000+ financial institutions

**Timeline:**
- Beta testing: Early 2026 with select lenders
- Full rollout: Mid-2026

### Technical Details
- REST API via bureau partnerships
- JSON responses
- Versioned API (breaking changes require major version change)
- Swagger UI documentation available

### Sources
- [FICO-Plaid Partnership](https://www.webpronews.com/fico-and-plaid-reshape-credit-scoring-with-real-time-cash-flow-revolution/)
- [iSoftpull FICO API](https://www.isoftpull.com/fico/api)
- [CRS Credit API](https://crscreditapi.com/)

---

## 6. VantageScore API

### Overview
VantageScore is a credit scoring model developed jointly by Experian, Equifax, and TransUnion. Access is through bureau partnerships, not direct API.

### Key Information

| Attribute | Value |
|-----------|-------|
| Current Version | VantageScore 4.0 |
| Score Range | 300-850 |
| Usage (2023) | 27 billion scores by 3,400+ institutions |
| Top 10 Banks | All use VantageScore in some capacity |

### 2025 Regulatory Milestone

**July 8, 2025 - FHFA Announcement:**
- VantageScore 4.0 now approved alongside Classic FICO for Fannie Mae/Freddie Mac loans
- Previously, only Classic FICO was permitted
- Lenders can now choose between the two models

### VantageScore 4.0 Attributes (New in 2025)
- Individual quantitative inputs now available to lenders
- First time a major scoring model has made attributes transparent
- Enables custom credit score model development

### Access Methods
1. Through credit bureaus (Experian, Equifax, TransUnion)
2. Experian's Ascend Analytical Sandbox (for mortgage lenders)
3. Third-party aggregators (iSoftpull, CRS)

### Sources
- [VantageScore Official](https://vantagescore.com/)
- [VantageScore 4.0 Attributes](https://vantagescore.com/resources/knowledge-center/lenders-start-2025-with-custom-credit-scoring-models-powered-by-vantagescore-4-0-model-attributes)
- [FHFA VantageScore 4.0 FAQ](https://www.fhfa.gov/document/vantagescore-4.0-implementation-faq)
- [Experian Free VantageScore Offer](https://www.experianplc.com/newsroom/press-releases/2025/experian-offers-free-vantagescore-4-0-to-lenders)

---

## 7. Soft Pull vs Hard Pull APIs

### Key Differences

| Attribute | Soft Pull | Hard Pull |
|-----------|-----------|-----------|
| Score Impact | None | May reduce score 5-10 points |
| Visibility | Only to consumer | Visible to other lenders |
| Use Case | Pre-qualification, monitoring | Formal credit applications |
| Consumer Consent | Required but can be verbal/checkbox | Written consent required |
| Duration on Report | N/A | 2 years |

### Soft Pull API Providers for Fintech Apps

| Provider | Features | Best For |
|----------|----------|----------|
| **Soft Pull Solutions** | Full-file soft pull reports, all 3 bureaus | Online lenders, pre-qualification |
| **iSoftpull** | CRM integration, automated underwriting | Dealerships, call centers |
| **CRS Credit API** | Unified soft/hard pull, fraud detection | Financial institutions |
| **Array** | Embedded credit tools, white-label | Digital banking, fintech |

### Soft Pull Use Cases
- Marketing pre-qualification
- Eligibility screens
- Preliminary pricing
- Credit monitoring apps
- Tenant screening
- Insurance underwriting

### Consumer Consent Requirements
- Must have "permissible purpose" under FCRA
- Can obtain consent via:
  - Phone authorization
  - Online checkbox acknowledgment
  - Written forms
- Must honor opt-out requests
- Data security compliance required (FCRA, GLBA, PCI)

### Alternative Data with Soft Pulls
Modern soft-pull APIs can integrate:
- Bank transaction histories
- Payment patterns
- Utility payment records
- Rental payment history

### Sources
- [Soft Pull Solutions](https://www.softpullsolutions.com/)
- [CRS Credit API Soft Pulls](https://crscreditapi.com/soft-pull-credit-apis-prequalification/)
- [iSoftpull](https://www.isoftpull.com/)

---

## 8. Plaid Credit Products

### Overview
Plaid has evolved from bank connectivity to offer significant credit-related products.

### Key Products

| Product | Description | Status |
|---------|-------------|--------|
| **Plaid LendScore** | Credit risk score (1-99) using cash flow data | Beta (October 2025) |
| **Consumer Report** | Transaction-based credit report (Plaid Check CRA) | Available |
| **Liabilities API** | Debt and loan data verification | Available |
| **UltraFICO Partnership** | Traditional credit + cash flow | Beta early 2026 |

### Plaid LendScore Details
- **Score Range:** 1 to 99
- **Data Source:** Real-time cash flow + Plaid Network connection insights
- **Performance:** 25% lift in predictive performance vs. traditional credit alone
- **Subprime Impact:** 20% relative risk reduction without reducing originations
- **API:** Consumer consents via Plaid Link, lender calls API for score + adverse action codes

### Consumer Report (Plaid Check CRA)
- Up to 2 years historical transaction data
- Coverage: 12,000+ financial institutions
- Insights include: rent payments, BNPL, cash advances, earned wage access
- **December 2025:** New user APIs (v1) required for new integrations

### Experian Partnership
- Experian processes Plaid cash flow data
- Returns Cashflow Score (300-850) or Cashflow Attributes
- Direct integration with Experian's credit analytics

### Sources
- [Plaid LendScore](https://plaid.com/blog/plaid-lendscore-credit-risk-scoring/)
- [Plaid Consumer Report](https://plaid.com/docs/check/)
- [Plaid Liabilities API](https://plaid.com/products/liabilities/)
- [Plaid December 2025 Updates](https://plaid.com/blog/product-updates-december-2025/)
- [Experian-Plaid Partnership](https://datos-insights.com/blog/experian-plaid-partnership-credit-risk-assessment-financial-services/)

---

## 9. Additional Credit Data Providers

### Array (Fintech Platform)

**Overview:** Financial innovation platform for embedded credit tools

| Feature | Description |
|---------|-------------|
| Credit & Debt Management | Credit score, 1B/3B reports, credit simulation |
| Identity Protection | Embeddable white-label products |
| Data Security | Tokenized, no monthly commitments |
| Valuation (2025) | $1.01B (April 2025) |

**2025 Updates:**
- October: Access Softek partnership for digital banking
- July: Acquired MoneyKit

**Sources:** [Array](https://thefinancialtechnologyreport.com/top-companies/array/), [Tracxn](https://tracxn.com/d/companies/array/__746WYVp-Qed53AuktijnqGlL057jud2ZB6r4fbLV4iA)

---

### Nova Credit (International/Alternative Data)

**Overview:** Consumer Reporting Agency for alternative credit data

| Product | Description |
|---------|-------------|
| Credit Passport | International credit data translation |
| Cash Atlas | Cash flow underwriting |
| Income Navigator | Income verification |

**Key Stats:**
- Series D: $35M (October 2025)
- Total funding: $124.4M
- Countries: 20+ bureau partnerships
- Clients: Chase, PayPal, HSBC, SoFi, Yardi
- Implementation: 9-12 months faster than in-house
- Conversion lift: Up to 80%

**Sources:** [Nova Credit](https://www.novacredit.com/), [Nova Credit Series D](https://www.morningstar.com/news/business-wire/20251014703778/nova-credit-raises-35m-series-d-to-accelerate-cash-flow-underwriting-revolution)

---

### Mastercard/Finicity (Open Banking)

**Overview:** Open banking platform acquired by Mastercard

| Feature | Description |
|---------|-------------|
| Financial Data APIs | Account aggregation |
| Credit Decisioning | UltraFICO Score support |
| Developer Portal | [developer.mastercard.com](https://developer.mastercard.com/open-banking-us/documentation/) |

**Key Partnerships:**
- Experian Boost integration
- Rocket Mortgage data access

**Sources:** [Finicity Open Banking](https://www.finicity.com/open-banking/), [Mastercard Open Finance](https://developer.mastercard.com/open-finance-us/documentation)

---

### MX Technologies (PFM Focus)

**Overview:** Financial data aggregation for personal finance management

| Feature | Description |
|---------|-------------|
| Account Aggregation | Connect all financial accounts |
| Data Enrichment | Transaction categorization |
| FDX Compliance | Built to Financial Data Exchange standards |
| 1033 Compliance | Ready for CFPB open banking rule |

**Note:** MX focuses on transaction data aggregation rather than direct credit bureau access. Best used alongside bureau APIs for comprehensive financial picture.

**Sources:** [MX APIs](https://www.mx.com/use-cases/open-finance/), [MX API Docs](https://docs.mx.com/api-reference/platform-api/overview/)

---

## 10. Credit Monitoring API Implementation

### Consumer-Facing Credit Monitoring Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Consumer Mobile/Web App                      │
├─────────────────────────────────────────────────────────────────┤
│  Credit Score Display │ Credit Factors │ Alerts │ History       │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Your Application Backend                      │
│  - User authentication    - Consent management                   │
│  - Webhook handlers       - Alert processing                     │
│  - Data storage           - Notification routing                 │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│              Credit API Provider (Array, Equifax, etc.)          │
│  - Credit pulls (soft)    - Score history                        │
│  - Alert webhooks         - Factor analysis                      │
│  - Identity verification  - Fraud detection                      │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│              Credit Bureaus (Experian, Equifax, TransUnion)      │
└─────────────────────────────────────────────────────────────────┘
```

### Key Implementation Components

1. **User Authorization & Consent**
   - FCRA-compliant consent collection
   - Clear disclosure of data usage
   - Opt-out mechanism

2. **Webhook Configuration**
   - Credit event alerts (new inquiries, account changes)
   - Score change notifications
   - Fraud alerts

3. **Data Points to Display**
   - Credit score (VantageScore or FICO)
   - Score factors (what's helping/hurting)
   - Credit utilization percentage
   - Payment history
   - Account age
   - Recent inquiries
   - Derogatory marks

4. **Historical Tracking**
   - Score history over time
   - Utilization trends
   - Account status changes

---

## 11. Pricing Summary

### Typical Costs (via Third-Party Aggregators)

| Service | Estimated Cost |
|---------|----------------|
| Single-bureau soft pull | $0.50 - $2.00 |
| Single-bureau report | $2.90 - $3.99 |
| Tri-merge report | $5.00 - $15.00 |
| Credit monitoring (monthly) | $0.50 - $2.00/user |
| Identity verification | $0.25 - $1.00 |

### Setup Costs

| Item | Estimated Range |
|------|-----------------|
| Initial setup fee | $5,000 - $50,000 |
| Monthly licensing | $500 - $2,000 |
| Integration development | Varies by complexity |

### Volume Discounts
- Typically available at 1,000+ pulls/month
- Significant discounts at 10,000+ pulls/month
- Enterprise custom pricing for 100,000+ pulls/month

### Notes
- Bureaus do not publish pricing publicly
- Costs negotiated based on volume, use case, and company profile
- Third-party aggregators often more accessible for startups

---

## 12. FCRA Compliance Requirements

### Permissible Purposes for Credit Access

1. **Credit transactions** - Evaluating creditworthiness
2. **Employment purposes** - With written consumer consent
3. **Insurance underwriting** - For policy decisions
4. **Legitimate business need** - Account review, collections
5. **Consumer-initiated** - Written instructions from consumer

### Key Compliance Requirements

| Requirement | Description |
|-------------|-------------|
| Consumer consent | Required for all access (written for employment) |
| Disclosure | Must notify when credit info is obtained |
| Adverse action | Must provide notice if credit denied |
| Data security | Encryption, access controls, audit logs |
| Opt-out | Must honor consumer opt-out requests |
| Dispute handling | Process for consumer disputes |

### 2025 Regulatory Updates

- **October 2025:** CFPB clarified FCRA broadly preempts state laws for credit reporting
- **May 2025:** CFPB withdrew proposed data broker FCRA expansion rule
- State-specific regulations may still apply in some cases

### Sources
- [CFPB FCRA Requirements](https://www.consumerfinance.gov/compliance/compliance-resources/other-applicable-requirements/fair-credit-reporting-act/)
- [FCRA Compliance Guide](https://thedataprivacylawyer.com/2025/12/05/fcra-compliance-for-financial-services-protecting-consumer-data-across-insurance-lending-and-credit-products/)

---

## 13. Recommendations for ClearMoney

### For Consumer-Permissioned Credit Monitoring

**Recommended Approach: Third-Party Aggregator**

| Provider | Pros | Cons |
|----------|------|------|
| **Array** | Embeddable UI, white-label, unicorn valuation | Premium pricing |
| **Equifax Consumer Engagement Suite** | Direct bureau, comprehensive features | Enterprise sales process |
| **CRS Credit API** | Unified all bureaus, fraud included | Less known brand |
| **iSoftpull** | Affordable per-pull, quick setup | Limited consumer-facing features |

### For Credit Score & Factors Display

1. **Soft pull** via Array or Equifax Consumer Engagement Suite
2. **VantageScore** (more inclusive, free from Experian for some uses)
3. Display credit factors and score history
4. Implement alert webhooks for credit changes

### For Cash Flow + Credit Integration

Consider **Plaid LendScore** or wait for **UltraFICO** (mid-2026) to combine:
- Traditional credit data
- Bank account cash flow insights
- Comprehensive financial picture

### Implementation Priority

1. **Phase 1:** Integrate with aggregator (Array or Equifax) for soft-pull credit monitoring
2. **Phase 2:** Add Plaid for cash flow insights (LendScore when available)
3. **Phase 3:** Consider direct bureau integrations if volume justifies

---

## 14. Summary Table

| Provider | Soft Pull | Hard Pull | Credit Monitoring | Identity Verification | Cash Flow | Direct API |
|----------|-----------|-----------|-------------------|----------------------|-----------|------------|
| Experian | Yes | Yes | Yes | Yes | Via Plaid | Yes |
| Equifax | Yes | Yes | Yes | Yes | No | Yes |
| TransUnion | Yes | Yes | Yes | Limited | No | Yes |
| Credit Karma | No B2B | No B2B | Consumer only | No | No | No |
| FICO | Via bureaus | Via bureaus | No | No | Via Plaid (2026) | No |
| VantageScore | Via bureaus | Via bureaus | No | No | No | No |
| Plaid | N/A | N/A | Consumer Report | No | Yes | Yes |
| Array | Yes | Yes | Yes | Yes | No | Yes |
| Nova Credit | Yes | Yes | Limited | Yes | Yes | Yes |
| Mastercard/Finicity | N/A | N/A | No | No | Yes | Yes |
| MX | N/A | N/A | No | No | Yes | Yes |

---

## Sources

### Credit Bureaus
- [Experian Connect API](https://www.experian.com/connect/api/)
- [Experian Developer Portal](https://developer.experian.com/)
- [Equifax Developer Portal](https://developer.equifax.com/)
- [Equifax Consumer Engagement Suite](https://www.equifax.com/business/product/credit-services-api/)
- [TransUnion TrueVision](https://www.transunion.com/solution/truvision)
- [TransUnion Technical Services](https://techservices.transunion.com/doc-repository)

### Scoring Models
- [VantageScore](https://vantagescore.com/)
- [FHFA VantageScore 4.0 FAQ](https://www.fhfa.gov/document/vantagescore-4.0-implementation-faq)
- [FICO-Plaid Partnership](https://www.webpronews.com/fico-and-plaid-reshape-credit-scoring-with-real-time-cash-flow-revolution/)

### Plaid
- [Plaid LendScore](https://plaid.com/blog/plaid-lendscore-credit-risk-scoring/)
- [Plaid Consumer Report](https://plaid.com/docs/check/)
- [Plaid Liabilities API](https://plaid.com/products/liabilities/)

### Third-Party Providers
- [Array](https://thefinancialtechnologyreport.com/top-companies/array/)
- [Nova Credit](https://www.novacredit.com/)
- [iSoftpull](https://www.isoftpull.com/)
- [CRS Credit API](https://crscreditapi.com/)
- [Soft Pull Solutions](https://www.softpullsolutions.com/)

### Regulatory
- [CFPB FCRA Requirements](https://www.consumerfinance.gov/compliance/compliance-resources/other-applicable-requirements/fair-credit-reporting-act/)
- [FCRA Compliance Guide](https://thedataprivacylawyer.com/2025/12/05/fcra-compliance-for-financial-services-protecting-consumer-data-across-insurance-lending-and-credit-products/)

### Open Banking
- [Mastercard Open Finance](https://developer.mastercard.com/open-finance-us/documentation)
- [MX Technologies](https://www.mx.com/use-cases/open-finance/)
- [Intuit Financial Data Platform](https://www.intuit.com/partners/fdp/implementation-support/direct-api/)
