# Insurance Data Access & APIs: Comprehensive Research Report

**Date:** January 2026
**Purpose:** Research insurance data aggregation and API access for ClearMoney Context Graph

---

## Executive Summary

The insurance data aggregation landscape is significantly less mature than banking/financial data aggregation (where Plaid dominates). While several promising players exist, particularly for P&C insurance verification, **life insurance cash value tracking and policy data aggregation remain significant gaps**. The industry is moving toward "open insurance" frameworks, but implementation lags behind open banking by several years.

---

## 1. Insurance Data Aggregators (Plaid-Like Solutions)

### Tier 1: Leading Aggregators

#### Canopy Connect
- **Position**: Often called "Plaid for Insurance" for P&C
- **Coverage**: 400+ carriers, 96% auto market, 91% homeowners market, 61% commercial multi-peril
- **Speed**: Policy data transfer in 5.6 seconds
- **Data Access**: Premiums, limits, deductibles, claims, driving records
- **Security**: SOC II Type 2 certified, AES-256 encryption
- **API**: RESTful API with SDK and white-label options
- **Website**: [usecanopy.com](https://www.usecanopy.com/)

#### Axle
- **Position**: "Plaid for Insurance" - Universal API for insurance data
- **Funding**: $4.5M total (Y Combinator, Gradient Ventures)
- **Founders**: Emory grads with Plaid founding team angels as investors
- **Features**: Consumer-permissioned, real-time carrier data, ongoing coverage monitoring
- **Coverage Types**: Auto, Home, Flood (recently added)
- **Website**: [axle.insure](https://www.axle.insure/)

#### MeasureOne
- **Position**: Consumer-permissioned data platform spanning multiple verticals
- **Insurance Coverage**: 95%+ of carriers, 100% of major carriers
- **Data Types**: Auto, home, and other insurance + income, employment, education
- **2025 Innovation**: Launched MCP Server for agentic AI data verification
- **Website**: [measureone.com](https://www.measureone.com)

### Tier 2: Regional/Specialized Players

#### Insurely (Europe)
- **Position**: Europe's leading open insurance provider
- **Coverage**: 95% of Swedish insurance market
- **Use Cases**: Policy switching, PFM apps integration
- **Funding**: EUR 19M Series A for UK/France expansion
- **Website**: [insurely.com](https://www.insurely.com/)

---

## 2. Major Carrier APIs

### Public Developer Portals

| Carrier | API Access | Notes |
|---------|-----------|-------|
| **State Farm** | Partner Gateway (developer.statefarm) | Partnership-based access |
| **Allstate** | Limited/Partnership only | No public developer portal found |
| **Progressive** | Telematics (Snapshot) | No public policy API |
| **GEICO** | No public API | Consumer apps only |

**Key Finding**: Major carriers do NOT offer public APIs for policy data access. Access is typically through:
1. Partnership agreements
2. Agent/broker portals
3. Consumer-permissioned aggregators (Canopy, Axle, MeasureOne)

---

## 3. Policy Types & Data Accessibility

### P&C Insurance (Auto, Home, Umbrella)

| Data Type | Accessibility | Primary Providers |
|-----------|--------------|-------------------|
| Policy status | High | Canopy, Axle, MeasureOne |
| Coverage limits | High | Canopy, Axle, MeasureOne |
| Deductibles | High | Canopy, Axle, MeasureOne |
| Premium amounts | High | Canopy, Axle, MeasureOne |
| Claims history | Medium | Canopy (with consent) |
| Driver records | Medium | Canopy, Fenris |
| Umbrella policies | Medium | Herald API, Canopy |

### Life Insurance

| Data Type | Accessibility | Notes |
|-----------|--------------|-------|
| Policy existence | Low | NAIC Locator (deceased only) |
| Death benefit amounts | Very Low | No public API |
| **Cash value (whole life)** | **Very Low** | **Major gap - no aggregators** |
| Premium payments | Low | Carrier portals only |
| Beneficiary info | Very Low | Carrier portals only |

### Commercial Insurance

| Data Type | Accessibility | Primary Providers |
|-----------|--------------|-------------------|
| Workers comp | Medium | Planck, Fenris |
| General liability | Medium | Planck, Fenris |
| BOP | Medium | Herald API |
| Commercial auto | Medium | Fenris, Canopy |

---

## 4. Life Insurance Cash Value Access

### Current State: **Major Gap in the Market**

**There is NO Plaid-equivalent for life insurance cash value tracking.** This represents one of the most significant gaps in insurance data aggregation.

### What Exists:
1. **Carrier Portals**: Policyholders can view cash value through insurer self-service portals
2. **Annual Statements**: Traditional paper/digital statements
3. **Agent Requests**: Manual requests through insurance agents

### Emerging Solutions:

#### Inclined Technologies
- **Product**: Revolving credit line secured by whole life insurance
- **Innovation**: Digitizing lending against whole life policies
- **Funding**: $31M total ($8M Series B in 2025)
- **Volume**: $1B+ credit originated on platform
- **Note**: Not a data aggregator, but demonstrates market interest in cash value access

### Why Cash Value Access Is Hard:
1. No standardized APIs from life insurers
2. Legacy systems (70% of insurers use 20-30 year old systems)
3. Complex product variations (whole life, universal life, variable life)
4. Regulatory complexity
5. Lower transaction frequency than P&C

---

## 5. ACORD Standards

### Role in Insurance Data Exchange
ACORD (Association for Cooperative Operations Research and Development) sets global standards for insurance data exchange.

### 2025 Developments:

#### GRLC Generation 2.0 (April 2025)
- Digital-first approach to reinsurance and large commercial data
- Enables straight-through processing across policy lifecycle
- Aligned with Next-Generation Digital Standards

#### Next-Generation Digital Standards (NGDS)
- JSON and YAML-based (vs. legacy XML)
- Optimized for microservices and RESTful APIs
- Technology-agnostic
- NGDS Object Model launched August 2025

#### ACORD Solutions Group (ADEPT Platform)
- Real-time data exchange, translation, transformation
- Partnership with mea Platform (June 2025)
- Enables automated underwriting and digital data exchange

### Practical Impact:
- Standards adoption is slow but accelerating
- Most relevant for carrier-to-carrier and carrier-to-MGA communication
- Less relevant for consumer-facing data aggregation

---

## 6. InsurTech Providers Deep Dive

### Data Enrichment & Prefill

#### Fenris Digital
- **Focus**: Insurance data prefill and risk assessment
- **Scale**: 1M+ API requests/month
- **Coverage**: 255M adults, 130M households, 35M small businesses
- **Products**: Auto prefill, driver records, business prefill, property hazards
- **Results**: 30% increase in policy conversions, 90% reduction in manual data gathering
- **Status**: Strategic partnership with ManageMy (September 2025)

#### Planck
- **Focus**: Commercial insurance underwriting AI
- **Method**: Collects public, proprietary, and third-party data
- **Coverage**: 50+ business segments
- **Input**: Business name + address only
- **Status**: Acquired by Applied Systems in 2024

### Agency-Carrier Connectivity

#### IVANS (Verisk)
- **Role**: Industry's largest agency-carrier data exchange network
- **Scale**: 1M+ available connections
- **Products**: Download, Transfer Manager, File Transfer API
- **Impact**: ~2 hours saved per employee per day

### Life Insurance APIs (Quoting/Issuance)

| Provider | Focus | Type |
|----------|-------|------|
| **Assurity** | Life & health quotes, underwriting | Carrier API |
| **Ladder Life** | Term life quotes & issuance | D2C Platform API |
| **Ethos** | Life insurance embedding | Embedded insurance API |
| **Hexure** | Life quotes | Quote aggregation |
| **COMPULIFE** | Quote comparison | Quote engine API |

---

## 7. Build vs. Buy Analysis

### Option 1: Use Existing Aggregators

**Best For**: Auto, home, and property insurance verification

| Provider | Pros | Cons |
|----------|------|------|
| **Canopy Connect** | Highest coverage, fastest, SOC2 | P&C only, no life insurance |
| **Axle** | Y Combinator backed, growing | Smaller carrier network |
| **MeasureOne** | Multi-vertical, MCP support | Insurance is one of many verticals |

**Recommendation**: For P&C verification, use Canopy Connect or Axle.

### Option 2: Manual Entry

**Best For**: Life insurance, especially cash value tracking

**Why Manual Entry May Be Necessary**:
1. No aggregators cover life insurance cash values
2. Carrier APIs don't exist for this data
3. Data changes infrequently (annually)
4. Users can upload statements or enter manually

**Implementation Approach**:
- Annual statement upload (PDF parsing)
- Manual entry fields for cash value, death benefit, premium
- OCR/AI extraction from policy documents

### Option 3: Hybrid Approach (Recommended)

| Insurance Type | Approach | Provider |
|----------------|----------|----------|
| Auto | Aggregator API | Canopy/Axle |
| Home | Aggregator API | Canopy/Axle |
| Umbrella | Aggregator API | Canopy |
| Life (term) | Manual entry | N/A |
| Life (whole/cash value) | Manual entry + statement upload | Build custom |
| Annuities | Manual entry | N/A |

---

## 8. Open Insurance Regulatory Landscape

### EU: FIDA (Financial Data Access Framework)
- **Status**: First trilogue April 2025
- **Implementation**: Expected 2027
- **Scope**: Banks, insurers, pensions - required to provide API access
- **Impact**: Will mandate standardized insurance data sharing

### US: No Equivalent Regulation
- No Open Insurance mandate
- Market-driven aggregation only
- State-by-state insurance regulation complicates standardization

### Other Markets
- **Brazil**: Open insurance framework operational
- **UK**: Open Finance expanding beyond banking
- **New Zealand**: CDR APIs for major banks by Dec 2025

---

## 9. Key InsurTech Startups to Watch

### Data & Verification

| Company | Focus | Funding |
|---------|-------|---------|
| Canopy Connect | P&C verification | Series B |
| Axle | Insurance data API | $4.5M |
| MeasureOne | Consumer data platform | Multi-round |
| Fenris Digital | Prefill & enrichment | Growth stage |
| Insurely | Open insurance (EU) | EUR 19M+ |

### Life Insurance Innovation

| Company | Focus | Funding |
|---------|-------|---------|
| Inclined | Whole life lending | $31M |
| Ladder | Term life API | $100M+ |
| Ethos | Embedded life | $400M+ |

### Insurtech Funding Context (2025)
- Global insurtech funding: ~$4.3B H1 2025
- AI-focused insurtechs: 74.8% of Q3 2025 funding
- Early-stage funding declining (down 35% YoY)

---

## 10. Recommendations for ClearMoney

### Immediate Actions

1. **P&C Insurance**: Integrate Canopy Connect or Axle for auto/home/umbrella verification
   - Both offer sandbox environments for testing
   - Consumer-permissioned model aligns with fintech best practices

2. **Life Insurance Cash Value**: Build manual entry system
   - Allow users to enter policy details manually
   - Implement PDF statement upload with AI extraction
   - Consider annual reminder workflow for updates

3. **Life Insurance (Term)**: Simple manual tracking
   - Policy number, carrier, death benefit, premium, term length
   - Less complex than cash value products

### Medium-Term Opportunities

1. **Monitor FIDA**: EU regulation will create standardization that may spread
2. **Watch Inclined**: Their whole life lending infrastructure may expand
3. **Explore Carrier Partnerships**: Some carriers offer partnership APIs (State Farm Partner Gateway)

### Data Model Suggestions

```python
# Life Insurance Policy (Manual Entry)
class LifeInsurancePolicy:
    carrier: str
    policy_number: str
    policy_type: Enum["term", "whole", "universal", "variable"]
    death_benefit: Decimal
    annual_premium: Decimal
    # For permanent policies
    cash_value: Optional[Decimal]
    cash_value_as_of: Optional[Date]
    loan_against_policy: Optional[Decimal]
    # Term-specific
    term_length_years: Optional[int]
    term_end_date: Optional[Date]

# P&C Policy (API-retrieved)
class PCInsurancePolicy:
    carrier: str
    policy_number: str
    policy_type: Enum["auto", "home", "umbrella", "renters"]
    premium: Decimal
    deductible: Decimal
    coverage_limits: Dict[str, Decimal]
    effective_date: Date
    expiration_date: Date
    # Source tracking
    data_source: Enum["canopy", "axle", "manual"]
    last_verified: DateTime
```

---

## Conclusion

The insurance data aggregation landscape is evolving rapidly but remains fragmented:

- **P&C Insurance**: Well-served by Canopy Connect, Axle, and MeasureOne
- **Life Insurance Cash Value**: **Major market gap** - manual entry is currently the only realistic option
- **Commercial Insurance**: Planck and Fenris lead in data enrichment
- **Standards**: ACORD NGDS and EU FIDA will drive future standardization

For a comprehensive personal finance application like ClearMoney, a hybrid approach combining API-based P&C verification with manual life insurance entry is the most practical path forward.

---

## Sources

### Insurance Aggregators
- [Canopy Connect](https://www.usecanopy.com/)
- [Canopy Connect API](https://www.usecanopy.com/api)
- [Axle Insurance](https://www.axle.insure/)
- [MeasureOne](https://www.measureone.com)
- [Insurely](https://www.insurely.com/)

### Insurance Technology Providers
- [Fenris Digital](https://fenrisd.com/)
- [Planck Data](https://www.planckdata.com/)
- [IVANS](https://www.ivans.com/)
- [Herald API Index](https://www.heraldapi.com/insurance-api-index)

### Life Insurance APIs
- [Assurity APIs](https://info.assurity.com/api)
- [Ladder Life API](https://www.ladderlife.com/api)
- [Ethos API](https://www.ethos.com/api/)

### Standards & Regulation
- [ACORD Data Standards](https://www.acord.org/standards-architecture/acord-data-standards)
- [ACORD NGDS](https://www.acord.org/standards-architecture/acord-data-standards/next-generation-digital-standards)
- [EIOPA Open Insurance](https://www.eiopa.europa.eu/browse/digitalisation-and-financial-innovation/open-insurance_en)
- [Insurely FIDA Overview](https://www.insurely.com/fida)

### Industry Reports & Funding
- [CB Insights Insurtech Q2 2025](https://www.cbinsights.com/research/report/insurtech-trends-q2-2025/)
- [Crunchbase - Inclined Funding](https://news.crunchbase.com/fintech-ecommerce/insuretech/inclined-technologies-whole-life-insurance-startup-funding/)

### Carrier Information
- [State Farm Partner Gateway](https://developer.statefarm/faq/)

### Policy Lookup
- [NAIC Life Insurance Policy Locator](https://content.naic.org/article/learn-how-use-naic-life-insurance-policy-locator)
