# Real Estate Valuation & Property Data APIs Research

*Research Date: January 2026 (Updated)*

This document provides comprehensive research on APIs and data sources for real estate valuation and property data, including home value APIs, AVM providers, property data sources, pricing, coverage, and build vs. buy considerations.

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Home Value APIs](#home-value-apis)
   - [Zillow](#zillow)
   - [Redfin](#redfin)
   - [Realtor.com](#realtorcom)
   - [Homes.com](#homescom)
3. [AVM Providers](#avm-providers-automated-valuation-models)
   - [CoreLogic](#corelogic)
   - [Black Knight / ICE Mortgage](#black-knight--ice-mortgage)
   - [ATTOM](#attom)
   - [HouseCanary](#housecanary)
4. [Property Data Providers](#property-data-providers)
   - [ATTOM Data](#attom-data)
   - [BatchData](#batchdata)
   - [RentCast](#rentcast)
   - [Estated (Now ATTOM)](#estated-now-attom)
5. [Public Records & County Assessor Data](#public-records--county-assessor-data)
6. [Rental Property & Investment Analysis APIs](#rental-property--investment-analysis-apis)
7. [Comparable Sales Data APIs](#comparable-sales-data-apis)
8. [Home Equity Calculation](#home-equity-calculation)
9. [Pricing Comparison](#pricing-comparison)
10. [Coverage Analysis](#coverage-analysis)
11. [Build vs. Buy Analysis](#build-vs-buy-analysis)
12. [Recommendations](#recommendations)
13. [Sources](#sources)

---

## Executive Summary

The real estate data API landscape in 2025-2026 is dominated by a few major players (ATTOM, CoreLogic, Zillow) with varying levels of accessibility. Key findings:

| Factor | Finding |
|--------|---------|
| **Most Accessible** | BatchData, RentCast, Homesage.ai (developer-friendly, transparent pricing) |
| **Most Comprehensive** | ATTOM (158M+ properties, 9,000+ attributes), CoreLogic (99.9% coverage) |
| **Most Restrictive** | Zillow (complex approval, invite-only for commercial use) |
| **Best for AVMs** | HouseCanary (highest accuracy ratings), CoreLogic (Total Home ValueX) |
| **Best Value** | BatchData (pay-as-you-go), RentCast (free tier with 50 calls/month) |
| **Enterprise-Only** | CoreLogic, Black Knight/ICE (custom pricing, no public tiers) |
| **Best for Rental Analysis** | Mashvisor (STR + LTR), AirDNA (short-term rentals) |

**Key Insight**: Building a custom AVM is technically feasible but requires significant investment in data licensing (MLS, public records), infrastructure, and ML expertise. For most use cases, purchasing from an established provider is more cost-effective.

### 2025-2026 Market Trends

- **Zillow** has become increasingly restrictive, now primarily invite-only for commercial API access
- **CoreLogic** launched Total Home ValueX, a new unified AVM eliminating the need for multiple models
- **Black Knight** is now fully integrated under **ICE Mortgage Technology** following the $13.1B acquisition
- **ATTOM** continues to dominate the developer-accessible market with 158M+ properties
- **Redfin** still offers no official public API; third-party solutions remain the only option
- Q2 2025 data shows mortgage-holding homeowners hold an average **$213,000 in tappable home equity**

---

## Home Value APIs

### Zillow

**Overview**: Zillow provides the Zestimate, the most widely recognized consumer-facing home valuation estimate, covering approximately 100 million U.S. properties.

**API Access**:
- **Zestimate API**: Retrieves current Property, Rental, and Foreclosure Zestimates
- **Bridge Public Records API**: Parcel, assessment, and transactional county data (15+ years history)
- **MLS Listings API**: Access to MLS listing data via RESTful API (RESO data dictionary standard)

**Access Requirements**:
- Commercial use cases primarily
- Complex approval process (weeks to months)
- Extensive documentation and business verification required
- Currently **invite-only** for many APIs

**Pricing Estimates (2025-2026)**:
| Plan | Cost | API Calls | Best For |
|------|------|-----------|----------|
| Free | $0 | 1,000-5,000/day | Developers, testing, small projects |
| Premium | $200-$500/month | Higher request limits | Small-medium businesses |
| Enterprise | $1,000-$3,000+/month | Custom solutions | Large-scale applications |

**Daily Call Limits**:
- Default: 1,000 calls/day to Home Valuations API and Property Details API
- Higher limits available after Zillow audit and review

**Key Restrictions (2025-2026)**:
- **Cannot store information locally** - display only
- Cannot use for direct marketing or telemarketing lists
- Cannot separate address information from Zestimate valuation
- Cannot extract and provide data elements to third parties
- No STR data, no rental comps
- No investment metrics, tax/assessment history
- No transaction history via API
- **Complex approval process** - can take weeks to months
- Extensive business verification required
- Many APIs now **invite-only** for commercial use

**Technical Details**:
- REST architecture
- JSON and XML response formats
- Newer APIs use OAuth 2.0
- Older APIs use ZWSID authentication

**Alternative Access**: Third-party scrapers (e.g., Apify) offer $5 free credits/month, allowing ~2,500 Zillow results. Pay-per-result pricing: $2 per 1,000 search results.

**Source**: [Zillow Group Developers](https://www.zillowgroup.com/developers/), [Zillow API Terms](https://www.zillowgroup.com/developers/terms/)

---

### Redfin

**Overview**: Redfin does not offer an official public API. However, data can be accessed through internal/hidden APIs or third-party solutions.

**Access Methods**:

1. **Internal/Hidden APIs** (Unofficial)
   - Property listings and pricing data
   - JSON responses with comprehensive real estate information
   - Does not require JavaScript rendering

2. **Third-Party Solutions**:
   - **PropAPIS**: Redfin Estimates, agent reviews, tour scheduling, market statistics
   - **HasData Redfin Scraper API**: Real-time data extraction, structured JSON
   - **RapidAPI Collections**: Various Redfin data endpoints

**Available Data Points**:
- Property lists
- Walk scores
- Main property info
- Mortgage rates
- Agent details
- Auto-complete suggestions

**Compliance Considerations**:
- Must comply with Redfin's Terms of Service
- Collecting publicly available data is legal if following robots.txt rules
- Gray area for commercial use

**Data Partnerships**:
- Redfin partners with Constellation Data Labs for MLS data delivery
- Powers Redfin's brokerage, website, and apps

**Source**: [PromptCloud Redfin API Guide](https://www.promptcloud.com/blog/redfin-api-for-real-estate-data/)

---

### Realtor.com

**Overview**: Realtor.com API provides access to millions of listings with rich property data including images, descriptions, and pricing.

**Access Options**:

1. **Official Realtor API**:
   - Comprehensive MLS data
   - Agent information
   - Professional real estate applications

2. **Unofficial API (RapidAPI)**:
   - Property listings nationwide
   - Neighborhoods, schools data
   - Images, descriptions, pricing

**Realtors Property Resource (RPR)**:
- Free for NAR (National Association of Realtors) members
- 160+ million properties coverage
- Supports XML and SOAP requests
- Exclusive to NAR members

**Source**: [RealEstateAPI Documentation](https://developer.realestateapi.com/)

---

### Homes.com

**Overview**: Homes.com does not offer an official public developer API. Data access is available through third-party scraping services.

**Third-Party API Solutions**:

1. **Web Data Crawler**
   - Homes.com API for property data extraction
   - Accurate property listings, pricing trends, location details
   - Structured data in JSON format
   - Minimal code integration

2. **Scrapehero Cloud**
   - Input property URL, get detailed property information
   - Returns: price, location, size, amenities
   - Quick and accurate property details

**Available Data Points**:
- Property listings
- Pricing trends
- Location details
- Market insights
- Property size and amenities

**Compliance Note**: No official API means relying on web scraping, which may violate Terms of Service. Use with caution for commercial applications.

**Source**: [Web Data Crawler Homes.com API](https://www.webdatacrawler.com/homescom-real-estate-data-api.php)

---

## AVM Providers (Automated Valuation Models)

### CoreLogic

**Overview**: CoreLogic is the industry leader for enterprise-grade AVMs, with the new **Total Home ValueX** model eliminating the need for multiple AVMs.

**Key Product: Total Home ValueX (Launched 2025)**
- **NEW**: Single model methodology eliminates need for multiple AVMs
- Dramatically increases home value accuracy and hit rate
- High accuracy across all business use cases
- Daily data refreshes
- Cloud computing and machine learning powered
- Available on Databricks Marketplace

**Data Sources**:
- Property records covering 99.9%+ of U.S. properties
- 50+ years of historical data
- MLS data integration
- Non-traditional data sources not traditionally used in AVMs
- Real-time updates for timely business decisions

**API Technical Specifications**:
- Standard HTTP protocols
- REST principles
- JSON for data exchange
- OAuth 2.0 for secure authentication
- Compatible with web, desktop, and mobile platforms
- Real-time property insights from 200+ sources
- AI-powered analytics

**Coverage**:
- Full U.S. residential housing stock
- Supports: Mortgage, real estate, ReTech, FinTech, PropTech, government, insurance, consumers

**Use Cases**:
- Loan underwriting and origination
- Prequalification
- Appraisal quality control
- Account management
- Consumer home value estimates

**AVM Limitations** (industry-wide):
- Does not consider actual property condition
- No income/rental agreements
- No recent remodeling unless in public record
- No personal property or landscape features

**Pricing**: Enterprise-only, custom quotes required

**2026 Developments**: CoreLogic has scheduled webinars addressing "Collateral risk: UAD 3.6 and 2026 view" indicating ongoing valuation modernization efforts.

**Source**: [CoreLogic Total Home Value](https://marketplace.databricks.com/details/93872840-9472-41e9-940d-58a9746cc2a9/CoreLogic_Total-Home-Value-Automated-Valuation-Model), [CoreLogic Valuation Modernization](https://www.corelogic.com/mortgage/origination-solutions/valuation-modernization/)

---

### Black Knight / ICE Mortgage

**Overview**: Black Knight was acquired by Intercontinental Exchange (ICE) in 2023 for $13.1 billion. Now fully operates under ICE Mortgage Technology, providing integrated technology, services, data, and analytics for the mortgage and real estate industries.

**Developer Portal**:
- One-stop storefront for API access
- Central catalog of APIs across the mortgage life cycle
- Third-party providers and developers can access APIs
- Rapid embedding of functionality into applications

**Property Data Coverage**:
- **99.9% of U.S. population** coverage
- Data collected directly from county assessors' offices nationwide
- Verified and updated by Black Knight team for accuracy

**Key Data Elements Available via API**:
- Property address
- Borrower information
- Lender information
- Loan information
- Home equity data

**Rapid Analytics Platform (RAP)**:
- Customizable dashboards
- Market trend modeling
- Geographic insights
- SQL, Python, R, Scala support
- Daily dataset refreshes
- Spark-powered distributed processing

**Data Reports**:
- Loan-level residential mortgage data
- Tens of millions of loans across credit products
- 160+ million historical records

**2026 Events**: ICE Experience 2026 at Wynn Las Vegas (March 16-18, 2026) will feature mortgage technology updates.

**Access**: Enterprise-only, no public API pricing. Contact through Developer Portal.

**Competitive Differentiation**: Black Knight focuses specifically on mortgage and real estate analytics, while CoreLogic offers broader data services across sectors.

**Source**: [ICE Mortgage Technology](https://mortgagetech.ice.com/products/property-data/residential), [Black Knight Developer Portal](https://www.prnewswire.com/news-releases/black-knight-announces-the-developer-portal-a-comprehensive-catalog-of-apis-to-enhance-integration-and-efficiency-for-clients-301719297.html)

---

### ATTOM

**Overview**: ATTOM provides one of the most comprehensive property data APIs with AVM capabilities. They are one of the most developer-accessible enterprise property data providers.

**ATTOM AVM Features**:
- `/attomavm` endpoint for automated valuations
- Works without property characteristics (affects confidence score)
- Assessed values
- Home equity estimates
- Valuation data for decision-making

**Database Stats**:
| Metric | Value |
|--------|-------|
| U.S. Properties | 159M+ |
| Population Coverage | 99% |
| Data Rows | 70 billion |
| Attributes per Property | 9,000 |
| Counties Covered | 3,000+ |

**Property API Data Portfolio**:
- Property addresses and characteristics
- Building permits
- Current ownership details
- Transaction records (deeds, mortgages, sales trends)
- School district and individual school profiles
- Assessed values
- Automated valuation models (AVM)
- Home equity estimates

**Pricing Model (2025-2026)**:
- **Yearly License** pricing model
- Priced based on number of **API Reports produced**, not calls made
- Example: $1,000/month for 100,000 API Reports = $0.10 per report
- Overage charged at same per-report rate
- Estimated $500+/month for basic plans
- **Free trial available** on ATTOM Developer Platform
- Custom enterprise pricing for bulk downloads

**Recent Publications**: ATTOM published Q4 2025 U.S. Home Affordability Reports with 2026 housing market forecasts.

**Source**: [ATTOM Property Data API](https://www.attomdata.com/solutions/property-data-api/), [ATTOM API Documentation](https://api.developer.attomdata.com/docs)

---

### HouseCanary

**Overview**: HouseCanary is known for having the highest accuracy ratings in independent third-party testing for AVMs. Recognized alongside CoreLogic and ATTOM as a provider of professional-grade Automated Valuation Models.

**Key Features**:
- 136M+ properties with data, valuations, and analytics
- 114M+ residential property coverage
- 19K+ ZIP codes
- 35 years of historical data
- 50-state brokerage status for MLS access
- Monthly AVM model refreshes
- Rigorously tested by independent third parties
- Image recognition technology for data enhancement

**Data Points Available**:
- Land Value
- Loan-to-Value (LTV) details with itemized liens
- LTV Origination
- Value Analysis with confidence scores
- Value by 6 Conditions (different condition levels)
- Value Distribution (block-level summaries)
- Census data
- Property Details (beds, baths, sq ft, lot size)
- Property Details Enhanced
- 3-year property value forecasts (proprietary model)

**Data Explorer API Endpoints**:
- Dozens of endpoints available
- Property, block, block group, ZIP, MSA, state-level details
- Risk and opportunity areas
- Rental reports and comparable properties
- Forecasted rental values

**Pricing Tiers (2025-2026)**:
| Tier | Best For | Billing |
|------|----------|---------|
| Basic | Individuals with basic needs | Yearly (auto-renewal) |
| Professional | Pros needing industry-leading tools | Yearly |
| Team | Small-medium teams | Yearly |
| Custom | Sophisticated real estate players | Contact sales |

**Note**: HouseCanary offers a **price match guarantee** and monthly billing options. Pricing is not publicly listed; contact sales for quotes. Generally more expensive than basic CRM tools.

**Delivery Options**:
- API access (programmatic, integrates with risk/trading systems)
- Bulk data (monthly CSV, nationwide or by state)
- AWS & Snowflake integration

**Source**: [HouseCanary Pricing](https://www.housecanary.com/pricing), [HouseCanary Data Explorer](https://www.housecanary.com/products/data-explorer)

---

## Property Data Providers

### ATTOM Data

**Assessor Data Includes**:
- Property identification and addresses
- Current and past ownership
- Legal descriptions
- Property features
- Values and taxes

**Data Delivery**:
- API
- Bulk download
- Cloud delivery

**Source**: [ATTOM Assessor Data](https://www.attomdata.com/data/property-data/assessor-data/)

---

### BatchData

**Overview**: Developer-friendly platform with transparent pay-as-you-go pricing.

**Coverage**:
- 155M+ U.S. property parcels
- 99.8% U.S. coverage
- 700+ data points per property
- 600M+ phone numbers
- 260M+ email addresses

**Key Features**:
- Property Search API
- Property Lookup
- Address Auto-Complete
- Skip Tracing / Contact Enrichment
- Market Analytics
- Real-time listing data (updated daily/near real-time)

**Data Sets**:
- Core Property (Tax Assessor): 240+ data points
- Mortgage Transaction & Open Liens: 140+ data points
- Pre-Foreclosure: 20+ data points
- Quick Lists: 30+ data points

**Pricing Model**: Pay-as-you-go (no subscriptions)

| Plan | Monthly Records | Pricing |
|------|-----------------|---------|
| Starter | 20,000 | Pay-as-you-go |
| Growth | 75,000 | Pay-as-you-go |
| Scale | 750,000 | Pay-as-you-go |
| Enterprise | Custom | Contact sales |

**Source**: [BatchData Pricing](https://batchdata.io/pricing)

---

### RentCast

**Overview**: Excellent option for rental and property data with a free tier.

**Coverage**:
- 140+ million property records
- Nationwide U.S. coverage
- Residential and commercial properties

**Pricing**:
| Tier | API Calls/Month | Cost |
|------|-----------------|------|
| Free | 50 | $0 |
| Starter | Scales up | Paid |
| Growth | Higher volume | Paid |

**Source**: [RentCast API](https://www.rentcast.io/api)

---

### Estated (Now ATTOM)

**Note**: Estated was acquired by ATTOM Data Solutions.

**Historical Features**:
- 140+ million property listings
- 150+ data points per property
- Standard JSON format
- Quick property data lookup

**Current Status**: Access through ATTOM, pricing via custom quote.

**Source**: [Estated (ATTOM)](https://estated.com/)

---

## Public Records & County Assessor Data

### Commercial Aggregators

| Provider | Properties | Features |
|----------|------------|----------|
| ATTOM | 159M+ | 3,000+ counties, API/Bulk/Cloud |
| Zillow Bridge | 15+ years | Parcel, assessment, transactional data (invite-only) |
| TaxNetUSA | State/County | Appraisal data, tax collector data, GIS |
| Pubrec (PropMix) | 151M+ | 3,100+ counties, pre-foreclosures |
| First American | Nationwide | Property reports, AVM, document images |

### ATTOM Assessor Data

ATTOM offers the most accessible county assessor data via API:

**Data Collected from County Assessors**:
- Property identification and addresses
- Current and past property ownership
- Legal descriptions
- Property features (sq ft, beds, baths, lot size)
- Assessed values and taxes
- 3,000+ counties covered

**Source**: [ATTOM Assessor Data](https://www.attomdata.com/data/property-data/assessor-data/)

### TaxNetUSA Property Tax API

- Property owner/taxpayer information in standardized format
- Square footage, year built
- Improvement sketches
- Delinquent tax bills
- Appraisal data by state or county
- Collector data (delinquent property tax)
- GIS parcel data
- Available on-demand via API

**Source**: [TaxNetUSA Property Tax API](https://www.taxnetusa.com/data/web-service-api/)

### Pubrec (PropMix)

Public Record APIs for nationwide US real estate:
- 151M+ U.S. properties
- 3,100+ counties
- Property details, taxes, ownership, assessments
- Mortgages and foreclosure info

**Source**: [Pubrec PropMix](https://pubrec.propmix.io/)

### County-Level Direct Access

Many counties provide free direct access to assessor records:

| County | Access Type | Data Available | Cost |
|--------|-------------|----------------|------|
| Sacramento County, CA | NextRequest portal | Secured/unsecured rolls, APN, owner name, address, assessed values, exemptions, zoning, parcel maps, property characteristics | Free |
| Douglas County, CO | Text file downloads | Complete assessor database | Free |
| Routt County, CO | Spatialest website | Real property data (2025 reassessment year) | Free |
| San Bernardino County, CA | Parcel Access app | Interactive map, property information | Free |
| Los Angeles County, CA | Public portal | Assessment information | Free |

**Third-Party Vendors for County Data**:
- Parcel Quest Lite
- Avenu
- CoreLogic
- DataTree
- Property Insight

These vendors aggregate county data and provide bulk reports for a fee.

**Source**: [Sacramento County Assessor Records](https://assessor.saccounty.gov/us/en/maps-property-data-and-records/assessor-records.html)

---

## Rental Property & Investment Analysis APIs

### Mashvisor Data API

**Overview**: Considered the best real estate data API in 2025 for investors due to its combination of STR accuracy, LTR coverage, property intelligence, and investment analytics.

**Key Features**:
- Short-term rental (STR) and long-term rental (LTR) analysis
- Cash flow projections
- Cap rate calculations
- Cash-on-Cash (CoC) return estimates
- Rental income forecasts
- Comparable sales and rental comps
- Monthly rental income forecasting
- Occupancy rate predictions

**API Capabilities**:
- Property-level intelligence
- Structural data, tax history, assessments
- Transaction records
- Nearby comps
- High-resolution property images
- Multiple valuation models
- REST endpoints for scalable integration

**Best For**: Investment analysis, PropTech developers, real estate investors

**Source**: [Mashvisor Data API](https://www.mashvisor.com/data-api)

### AirDNA

**Overview**: Global leader in short-term rental data and analytics.

**Coverage**:
- 10+ million properties
- 120,000+ markets worldwide
- CBRE-validated data

**Data Sources**: Airbnb, Vrbo, and other vacation rental platforms

**Best For**: Short-term rental investors, Airbnb hosts, vacation rental analysis

**Source**: [Best Real Estate Data API Comparison - Mashvisor](https://www.mashvisor.com/blog/best-real-estate-data-api-comparison/)

### RentCast API

**Overview**: Comprehensive property and rental data with investment portfolio management features.

**Key Features**:
- 140+ million property records
- Instant home value and rent estimates (AVM)
- Property-specific valuations based on characteristics
- Nearby comparable listings analysis
- Historical price and rent trends
- Sale and rental market averages
- Listing and composition statistics by ZIP code
- Zapier integration for 6,000+ CRMs and apps

**Pricing**:
| Tier | API Calls/Month | Cost |
|------|-----------------|------|
| Free | 50 | $0 |
| Starter | Scales up | Paid |
| Growth | Higher volume | Paid |

**Source**: [RentCast API](https://www.rentcast.io/api)

---

## Comparable Sales Data APIs

### Best APIs for Comps (2025-2026)

| Provider | Comps Features | Best For |
|----------|----------------|----------|
| **Mashvisor** | Full property-level comps, sales history, nearby comparable properties | Investment analysis |
| **RealEstateAPI** | Searchable comps API, mortgages, valuations, MLS data, sales history | Developer integration |
| **ATTOM** | 158M+ properties, 70B data rows, transaction records | Enterprise applications |
| **RentCast** | Home value + rent estimates based on nearby comps | Rental analysis |
| **CompStak** | 60k+ monthly comps, lease-level data, starting rent, concessions | Commercial real estate |
| **Homesage.ai** | Comparative market analysis, recent sales, features, neighborhood | Quick valuations |

### RealEstateAPI (GitHub)

**Features**:
- Searchable API for list building
- Advanced property filtering
- Implement custom comparables API
- Property analytics capabilities
- Comps, mortgages, valuations
- MLS data integration
- Foreclosure information
- Mailing addresses
- Property sales history

**Source**: [RealEstateAPI GitHub](https://github.com/realestateapi)

### CompStak (Commercial Real Estate)

**Features**:
- Recent lease comps similar to subject space
- Deal details: starting rent, lease concessions, lease term
- 60k+ monthly comps nationwide
- Granular lease-level and sales transaction data

**Best For**: Commercial real estate professionals

**Source**: [CompStak API](https://compstak.com/data-api)

### CASAFARI (International Markets)

**Features**:
- Residential comparable sales and pricing data
- AI-powered data integration
- Clean residential transaction history
- Comp selection by location and property attributes
- 20+ countries worldwide

**Best For**: International real estate analysis

**Source**: [CASAFARI Property Data API](https://www.casafari.com/products/property-data-api/)

---

## Home Equity Calculation

### Formula

**Home Equity = Current Home Value - Outstanding Mortgage Balance**

Example: $350,000 home value - $200,000 mortgage = $150,000 equity

### Key Metrics

**Loan-to-Value (LTV) Ratio**:
- LTV = (Mortgage Principal Balance / Home Appraised Value) x 100
- Lenders typically want LTV of 80% or less (20%+ equity)
- Most allow borrowing up to 80% of home value total

**Combined Loan-to-Value (CLTV) Ratio**:
- CLTV = (All Home Loans Combined / Home Value) x 100
- Used when considering HELOC or second mortgage

### Market Data (Q2 2025)

- Average tappable home equity: **$213,000** per mortgage-holding homeowner
- Tappable equity = Amount that can be borrowed while maintaining 20% stake
- Source: ICE Mortgage Technology August 2025 Mortgage Monitor

### APIs for Equity Calculation

| Component | API Sources |
|-----------|-------------|
| **Home Value (AVM)** | HouseCanary, CoreLogic, ATTOM, Zillow |
| **Mortgage Balance** | Plaid (mortgage account connections), user input |
| **Property Details** | ATTOM, BatchData, RentCast |
| **LTV/Equity Analysis** | HouseCanary (LTV details with itemized liens) |

### HouseCanary Equity Data Points

- Loan-to-Value (LTV) details with itemized liens
- LTV Origination data
- Value Analysis with confidence scores
- Land Value separate from improvements

**Source**: [HouseCanary Data Explorer](https://www.housecanary.com/products/data-explorer)

---

## Rental Data APIs (Traditional)

### Rentometer

**Overview**: Hyperlocal rent data API for investment property analysis.

**Endpoints**:
| Endpoint | Cost | Output |
|----------|------|--------|
| QuickView | 1 credit | Summary rent analysis |
| Pro Report | Higher | Full rent report PDF |
| Nearby Comp | Higher | Detailed rent comps |

**Data Provided**:
- Average and median rent
- 25th and 75th percentile rents
- Historical trends
- Comps
- Public record data

**Features**:
- Batch Processor (up to 500 properties at once)
- GPR Calculator (Gross Potential Rent)
- Zapier integration

**Pricing**: API access included with Pro plan, additional credits purchasable

**Investment Use Case**: Use 1% rule with Rentometer data
- 1% Rule: Monthly rent >= 1% of all-in property cost
- Example: $100K property requires $1,000/month rent minimum

**Source**: [Rentometer API](https://www.rentometer.com/rentometer-api)

### Alternative Rental Data APIs

| Provider | Focus | Features |
|----------|-------|----------|
| RentCast | Comprehensive | Property data + rent estimates |
| HelloData | Multifamily | Unit pricing, operating expense benchmarks |
| AirDNA | Short-term rentals | Airbnb analytics, vacation rentals |
| Mashvisor | Investment | Rental comps, investment metrics |

---

## Pricing Comparison

### Pricing Tiers Overview

| Tier | Typical Cost | API Calls | Best For |
|------|--------------|-----------|----------|
| Free | $0 | 1,000-10,000 requests | Testing |
| Starter | $49-$199/month | 100K-1M requests | Small businesses |
| Professional | $299-$999/month | 1M-10M requests | Medium businesses |
| Enterprise | $1,000+/month | Unlimited | Large enterprises |

### Provider-Specific Pricing

| Provider | Model | Entry Cost | Enterprise |
|----------|-------|------------|------------|
| **Zillow** | Monthly subscription | ~$500/month | $2,000-$5,000/month |
| **ATTOM** | Custom/Enterprise | ~$500+/month | Contact sales |
| **HouseCanary** | Tiered plans | Contact sales | Custom |
| **CoreLogic** | Enterprise-only | N/A | Contact sales |
| **Black Knight/ICE** | Enterprise-only | N/A | Contact sales |
| **BatchData** | Pay-as-you-go | Per call | Custom volumes |
| **RentCast** | Tiered | Free (50 calls) | Volume-based |
| **Rentometer** | Credit-based | With Pro plan | Additional credits |
| **WalkScore** | Per call | Free trial | $0.10/call |

### Pricing Factors

- Request volume
- Data types (basic vs. comprehensive)
- Geographic coverage
- Support level
- Commercial licensing requirements

---

## Coverage Analysis

### Geographic Coverage

| Provider | Properties | Population | Geography |
|----------|------------|------------|-----------|
| ATTOM | 158M+ | 99% U.S. | 3,000+ counties |
| CoreLogic | 99.9%+ properties | Full U.S. | 50+ years history |
| HouseCanary | 157M+ | 19K+ ZIP codes | Full U.S. |
| BatchData | 155M+ | 99.8% U.S. | Nationwide |
| RentCast | 140M+ | Nationwide | Residential + Commercial |
| Zillow | 100M | Major markets | U.S. only |

### Property Types

| Type | ATTOM | CoreLogic | HouseCanary | BatchData |
|------|-------|-----------|-------------|-----------|
| Single Family | Yes | Yes | Yes | Yes |
| Multi-Family | Yes | Yes | Yes | Yes |
| Condos | Yes | Yes | Yes | Yes |
| Commercial | Yes | Yes | Limited | Yes |
| Land | Yes | Yes | Yes | Yes |

### Data Freshness

| Provider | Update Frequency |
|----------|------------------|
| CoreLogic | Daily |
| ATTOM | Daily |
| HouseCanary | Monthly (AVM), Daily (property) |
| BatchData | Daily/Near real-time (listings) |
| RentCast | Regular updates |

---

## Build vs. Buy Analysis

### Building Your Own AVM

**Required Components**:

1. **Data Sources**
   - MLS data (licensing required, varies by market)
   - Public records (assessor, deed, tax)
   - Sales transaction history
   - Property characteristics

2. **Data Costs (Estimated)**
   - MLS data licensing: Varies significantly by market
   - Public records aggregation: $500-$5,000+/month
   - Ongoing maintenance and updates

3. **Technical Requirements**
   - Machine learning infrastructure
   - Data engineering pipeline
   - Model training and validation
   - Geographic data processing

4. **AVM Model Types**
   | Type | Description | Complexity |
   |------|-------------|------------|
   | Hedonic | Property as bundle of characteristics | Medium |
   | Indexed | Based on area sales trends | Lower |
   | Blended | Combines hedonic + indexed | Higher |

**Advantages of Building**:
- Full control over methodology
- Customization for specific use cases
- No per-call API costs at scale
- Proprietary competitive advantage

**Disadvantages of Building**:
- High initial development cost ($100K-$500K+)
- Ongoing data licensing costs
- Model accuracy challenges
- Compliance and liability concerns
- Time to market (6-18 months)

### Buying from Established Providers

**Advantages**:
- Immediate access
- Established accuracy benchmarks
- Compliance handled by provider
- Regular updates and improvements
- Support and documentation

**Disadvantages**:
- Per-call costs at scale
- Limited customization
- Dependency on third party
- May not meet specific needs

### Recommendation Matrix

| Scenario | Recommendation |
|----------|----------------|
| MVP/Startup | **Buy** - Use BatchData or RentCast |
| Small-Medium Business | **Buy** - HouseCanary or ATTOM |
| Enterprise with specific needs | **Consider Build** or **Custom Enterprise** deal |
| Investment property analysis | **Buy** - Rentometer + property API |
| Mortgage/Lending | **Buy** - CoreLogic or HouseCanary |

### Hybrid Approach

Many companies use a hybrid approach:
1. **Buy** property data from aggregator (ATTOM, BatchData)
2. **Build** custom valuation layer on top
3. **Enhance** with proprietary data sources

**MLS Data Access for AVMs**:
Since 2014, NAR policy requires MLSs to license data to subscribers for creating AVMs. Access options:
- Direct MLS partnerships
- Bridge Listing Output (normalized to RESO standard)
- Aggregators like ATTOM, CoreLogic

---

## Recommendations

### For a Personal Finance App (ClearMoney)

**Recommended Stack**:

1. **Property Data**: BatchData or RentCast
   - Transparent pricing
   - Developer-friendly APIs
   - Good coverage

2. **Home Valuations**: HouseCanary or Zillow (if approved)
   - HouseCanary for accuracy
   - Zillow for consumer familiarity

3. **Rental Estimates**: Rentometer or RentCast
   - Investment property analysis
   - 1% rule calculations

4. **Free Tier for MVP**:
   - RentCast (50 free calls/month)
   - Homesage.ai (500 free sandbox credits)

### Implementation Priorities

1. **Phase 1 (MVP)**
   - Basic property lookup (BatchData or RentCast free tier)
   - Simple rent estimates
   - Manual entry fallback

2. **Phase 2 (Growth)**
   - AVM integration (HouseCanary)
   - Investment property analysis
   - Rental comps

3. **Phase 3 (Scale)**
   - Custom valuation model layer
   - Multi-provider redundancy
   - Enhanced accuracy for edge cases

### Cost Projections

| Phase | Monthly API Cost | Users Supported |
|-------|------------------|-----------------|
| MVP | $0-$200 | 0-1,000 |
| Growth | $500-$2,000 | 1,000-10,000 |
| Scale | $2,000-$10,000+ | 10,000+ |

---

## Sources

### Primary Sources - Home Value APIs

- [Zillow Group Developers](https://www.zillowgroup.com/developers/)
- [Zillow API Terms of Use](https://www.zillowgroup.com/developers/terms/)
- [Zillow API Cost Breakdown 2025](https://brisktechsol.com/zillow-api-cost/)
- [Zillow API Pricing 2025](https://indiit.com/zillow-api-cost-2025/)
- [Redfin Data Center](https://www.redfin.com/news/data-center/)
- [Redfin API Guide - PromptCloud](https://www.promptcloud.com/blog/redfin-api-for-real-estate-data/)
- [Realtor.com Connections Plus API](https://rollout.com/integration-guides/realtor-com/)
- [Homes.com API - Web Data Crawler](https://www.webdatacrawler.com/homescom-real-estate-data-api.php)

### AVM Providers

- [CoreLogic Total Home ValueX](https://www.corelogic.com/mortgage/origination-solutions/total-home-value-x/)
- [CoreLogic Valuation Modernization](https://www.corelogic.com/mortgage/origination-solutions/valuation-modernization/)
- [CoreLogic AVM on Databricks](https://marketplace.databricks.com/details/93872840-9472-41e9-940d-58a9746cc2a9/CoreLogic_Total-Home-Value-Automated-Valuation-Model)
- [HouseCanary Pricing](https://www.housecanary.com/pricing)
- [HouseCanary Data Explorer](https://www.housecanary.com/products/data-explorer)
- [HouseCanary AVM](https://www.housecanary.com/resources/our-avm)
- [ATTOM Property Data API](https://www.attomdata.com/solutions/property-data-api/)
- [ATTOM API Documentation](https://api.developer.attomdata.com/docs)
- [Black Knight Developer Portal](https://www.prnewswire.com/news-releases/black-knight-announces-the-developer-portal-a-comprehensive-catalog-of-apis-to-enhance-integration-and-efficiency-for-clients-301719297.html)
- [ICE Mortgage Technology](https://mortgagetech.ice.com/products/property-data/residential)

### Property Data Providers

- [BatchData Pricing](https://batchdata.io/pricing)
- [BatchData vs Black Knight 2025](https://batchdata.io/black-knight-vs-batchdata)
- [RentCast API](https://www.rentcast.io/api)
- [RealEstateAPI GitHub](https://github.com/realestateapi)

### County Assessor & Public Records

- [ATTOM Assessor Data](https://www.attomdata.com/data/property-data/assessor-data/)
- [Pubrec PropMix](https://pubrec.propmix.io/)
- [TaxNetUSA Property Tax API](https://www.taxnetusa.com/data/web-service-api/)
- [Sacramento County Assessor Records](https://assessor.saccounty.gov/us/en/maps-property-data-and-records/assessor-records.html)
- [Douglas County CO Data Downloads](https://www.douglas.co.us/assessor/data-downloads/)

### Rental & Investment Analysis

- [Mashvisor Data API](https://www.mashvisor.com/data-api)
- [Mashvisor API Comparison 2025](https://www.mashvisor.com/blog/best-real-estate-data-api-comparison/)
- [Rentometer API](https://www.rentometer.com/rentometer-api)
- [CompStak Commercial API](https://compstak.com/data-api)
- [CASAFARI Property Data API](https://www.casafari.com/products/property-data-api/)

### Industry Analysis & Comparisons

- [Top Real Estate APIs in 2025 - BatchData](https://batchdata.io/blog/top-real-estate-apis-in-2025)
- [Ultimate Guide to Real Estate APIs 2025 - BatchData](https://batchdata.io/blog/ultimate-guide-to-real-estate-apis)
- [10 Best Real Estate APIs in 2025 - ATTOM](https://www.attomdata.com/news/attom-insights/best-apis-real-estate/)
- [Best Real Estate APIs 2026 - ScrapingBee](https://www.scrapingbee.com/blog/best-real-estate-apis-for-developers/)
- [5 Best Real Estate APIs 2025 - Homesage.ai](https://homesage.ai/5-best-real-estate-apis-for-2025/)
- [3 Best Free Real Estate Data Providers 2026 - Homesage.ai](https://homesage.ai/3-best-free-real-estate-data-providers-for-2026/)
- [8 Best Property Evaluation APIs 2026 - Homesage.ai](https://homesage.ai/8-best-property-evaluation-apis-in-2026/)
- [13 Best Real Estate APIs - APIDog](https://apidog.com/blog/best-real-estate-apis/)
- [Real Estate APIs - Evolving List (GitHub Gist)](https://gist.github.com/patpohler/36c731113fd113418c0806f62cbb9e30)

### Technical Resources

- [Using MLS Data to Generate an AVM - Data Advocate Blog](https://thedataadvocateblog.com/using-mls-data-to-generate-an-avm/)
- [How to Combine AVM, MLS, and Land Parcel Data - Warren Group](https://www.thewarrengroup.com/blog/how-to-combine-avm-mls-and-land-parcel-data-for-ai-powered-property-valuation/)
- [RealEstateAPI Developer Documentation](https://developer.realestateapi.com/)
- [Realtors Property Resource (RPR)](https://www.narrpr.com/)

### Home Equity Data

- [ICE Mortgage Technology Mortgage Monitor](https://www.icemortgagetechnology.com/resources/mortgage-monitor)
- [Freddie Mac Home Equity Calculator](https://myhome.freddiemac.com/resources/calculators/home-equity-calculator)
- [Bankrate Home Equity Calculator](https://www.bankrate.com/home-equity/home-equity-calculator/)

---

*Last Updated: January 2026*
