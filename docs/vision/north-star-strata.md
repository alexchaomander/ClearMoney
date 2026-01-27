# The Strata for Personal Finance: North Star Vision

**Version:** 1.0
**Date:** January 2026
**Status:** Aspirational Vision

---

## I. The Vision

### What We're Building

ClearMoney is building the **Strata for Personal Finance** — a comprehensive, unified data layer that connects every aspect of a person's financial life and transforms that data into personalized, explainable, advisor-grade guidance.

This is not another budgeting app. This is not another net worth tracker. This is the **operating system for financial decision-making**.

### The Core Insight

Today, financial advice exists in silos:
- Your investment advisor sees your portfolio but not your debt
- Your mortgage broker sees your income but not your tax situation
- Your tax accountant sees last year's returns but not your current investments
- Your budgeting app sees your spending but not your equity compensation

**No single system sees your complete financial picture.**

The Strata changes this. By connecting every financial account, asset, liability, income source, and obligation into a single, unified graph, we can provide recommendations that were previously only available to the ultra-wealthy with teams of advisors.

### The Promise

For the first time, a regular person will be able to receive advice like:

> "Based on your $180K income, $45K in high-interest debt, $120K in your 401k, $50K in RSUs vesting next month, and your goal to buy a house in 2 years, here's your optimal financial strategy:
>
> 1. Increase 401k contribution by 3% to maximize your employer match ($4,500/year free money)
> 2. Sell $30K of vesting RSUs to pay off your credit card debt (saving $6,800/year in interest)
> 3. Open a Roth IRA and contribute $7,000 (you're in a lower tax bracket now than you will be)
> 4. Start saving $2,000/month toward your house down payment in a high-yield savings account
>
> Here's exactly why I'm recommending this, and here's what would change if your situation changes."

This level of integrated, personalized, explainable advice has never been available to consumers at scale.

---

## II. The Strata Architecture

### What is a Strata?

A Strata is more than a database of financial accounts. It is:

1. **A unified data model** that normalizes information from dozens of sources into a coherent structure
2. **A relationship graph** that understands how different financial elements connect (your mortgage is tied to your home, your 401k is tied to your employer, your RSUs vest on a schedule)
3. **A temporal record** that tracks how your finances evolve over time
4. **A decision trace system** that captures what data was used, what rules were applied, and why each recommendation was made

### The Data Model

```
                              ┌─────────────────┐
                              │      USER       │
                              │                 │
                              │ Goals, Profile, │
                              │   Preferences   │
                              └────────┬────────┘
                                       │
         ┌─────────────────────────────┼─────────────────────────────┐
         │                             │                             │
         ▼                             ▼                             ▼
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│     ASSETS      │         │   LIABILITIES   │         │     INCOME      │
│                 │         │                 │         │                 │
│ • Investments   │         │ • Mortgages     │         │ • Salary        │
│ • Bank accounts │         │ • Student loans │         │ • Equity comp   │
│ • Real estate   │         │ • Auto loans    │         │ • Side income   │
│ • Crypto        │         │ • Credit cards  │         │ • Investments   │
│ • Equity comp   │         │ • Personal loans│         │ • Rental income │
│ • Insurance CV  │         │ • BNPL          │         │                 │
│ • Alternatives  │         │ • Medical debt  │         │                 │
└─────────────────┘         └─────────────────┘         └─────────────────┘
         │                             │                             │
         └─────────────────────────────┼─────────────────────────────┘
                                       │
                                       ▼
                          ┌─────────────────────┐
                          │   STRATA     │
                          │                     │
                          │  Relationships,     │
                          │  Time series,       │
                          │  Decision traces    │
                          └──────────┬──────────┘
                                     │
                                     ▼
                          ┌─────────────────────┐
                          │  RECOMMENDATION     │
                          │      ENGINE         │
                          │                     │
                          │  Rules, ML models,  │
                          │  Explainability     │
                          └─────────────────────┘
```

### The Seven Pillars of Financial Context

To achieve advisor-grade recommendations, we must capture data across seven pillars:

| Pillar | What It Contains | Why It Matters |
|--------|-----------------|----------------|
| **1. Liquid Assets** | Bank accounts, money market, CDs | Cash flow, emergency fund, short-term goals |
| **2. Investments** | Brokerage, retirement accounts, equity comp | Wealth building, tax optimization, retirement |
| **3. Real Assets** | Real estate, vehicles, collectibles | Net worth, leverage, insurance needs |
| **4. Liabilities** | All debt: mortgage, student, auto, credit | Debt strategy, refinancing, cash flow |
| **5. Income** | Salary, equity, side income, benefits | Budgeting, tax planning, contribution limits |
| **6. Credit** | Credit reports, scores, utilization | Rate optimization, borrowing capacity |
| **7. Protection** | Insurance, estate documents, beneficiaries | Risk management, family protection |

---

## III. The Complete Data Universe

### Pillar 1: Liquid Assets

**Definition:** Cash and cash-equivalent accounts that provide liquidity and fund day-to-day life.

**Account Types:**
- Checking accounts
- Savings accounts (including HYSA)
- Money market accounts
- Certificates of deposit (CDs)
- Prepaid debit cards

**Data Points Captured:**
- Current balance
- Available balance
- Interest rate (APY)
- Transaction history
- Recurring transactions (income, bills)
- Categorized spending

**Key Insights Enabled:**
- Emergency fund adequacy (3-6 months expenses)
- Cash flow forecasting
- Spending pattern analysis
- Bill payment optimization
- Idle cash detection (money earning 0% that could earn 4%+)

**Recommendations:**
- "You have $45K sitting in a 0.01% APY checking account. Moving $40K to a 4.5% HYSA would earn you $1,800/year."
- "Your emergency fund covers 2.3 months of expenses. Aim for 6 months ($24,000) before aggressive investing."
- "You spend $847/month on subscriptions. Here are 3 you haven't used in 90 days."

---

### Pillar 2: Investments

**Definition:** Assets held for long-term growth, including retirement accounts and taxable investments.

**Account Types:**

*Taxable Accounts:*
- Individual brokerage
- Joint brokerage
- Trust accounts
- Custodial accounts (UGMA/UTMA)

*Tax-Advantaged Retirement:*
- 401(k) / 403(b) / 457(b)
- Traditional IRA
- Roth IRA
- SEP IRA / SIMPLE IRA
- Pension plans
- Thrift Savings Plan (TSP)

*Other Tax-Advantaged:*
- 529 education savings
- Health Savings Account (HSA)
- Coverdell ESA

*Equity Compensation:*
- Restricted Stock Units (RSUs)
- Incentive Stock Options (ISOs)
- Non-Qualified Stock Options (NQSOs)
- Employee Stock Purchase Plan (ESPP)

*Alternative Investments:*
- Private equity / venture capital
- Hedge funds
- Real estate syndications
- Crowdfunding (Fundrise, Yieldstreet)
- Collectibles (art, wine, cars)

**Data Points Captured:**
- Holdings (ticker, quantity, cost basis)
- Asset allocation (by class, sector, geography)
- Tax lots (for tax-loss harvesting)
- Vesting schedules (equity comp)
- Contribution limits and utilization
- Beneficiary designations
- Performance history

**Key Insights Enabled:**
- True asset allocation across ALL accounts
- Tax-location optimization (which assets in which accounts)
- Concentration risk detection
- Tax-loss harvesting opportunities
- Vesting schedule planning
- Retirement readiness projection

**Recommendations:**
- "Your portfolio is 78% US equities. Consider adding international exposure to reduce concentration."
- "You have $12,000 in unrealized losses in your taxable account. Harvesting these losses could save $3,000 in taxes."
- "You've contributed $15,500 to your 401k this year. You can contribute $7,500 more to maximize tax savings."
- "Your company stock is 35% of your net worth. Consider selling vested RSUs to diversify."
- "Your 83(b) election deadline for your ISO grant is in 12 days."

---

### Pillar 3: Real Assets

**Definition:** Physical assets that have tangible value and often require maintenance, insurance, and financing.

**Asset Types:**

*Real Estate:*
- Primary residence
- Vacation home
- Rental properties
- Land
- Commercial property

*Vehicles:*
- Automobiles
- Motorcycles
- Boats
- RVs

*Collectibles & Alternatives:*
- Art
- Jewelry
- Wine collections
- Classic cars
- Precious metals (physical)

**Data Points Captured:**
- Estimated current value
- Original purchase price
- Associated debt (mortgage, auto loan)
- Equity position
- Property details (sq ft, beds, baths, year built)
- Insurance coverage
- Maintenance costs
- Rental income (if applicable)

**Key Insights Enabled:**
- True net worth (assets - liabilities)
- Home equity position
- Loan-to-value (LTV) ratio
- PMI elimination eligibility
- HELOC/refinance opportunities
- Rental yield analysis
- Insurance adequacy

**Recommendations:**
- "Your home has appreciated $120K since purchase. Your LTV is now 72% — you can remove PMI and save $180/month."
- "Current mortgage rates are 1.2% lower than your rate. Refinancing could save $340/month."
- "You have $85K in home equity. A HELOC at 7% could consolidate your 22% credit card debt."
- "Your car has depreciated to $18K but you owe $22K. You're $4K underwater on this loan."

---

### Pillar 4: Liabilities

**Definition:** All debts and financial obligations that reduce net worth and require regular payments.

**Liability Types:**

*Secured Debt:*
- Mortgage (primary, secondary, HELOC)
- Auto loans
- Boat/RV loans
- Secured personal loans

*Unsecured Debt:*
- Credit cards
- Personal loans
- Medical debt
- Buy Now Pay Later (Affirm, Klarna, Afterpay)

*Student Debt:*
- Federal student loans (Direct, PLUS, Perkins)
- Private student loans
- Parent PLUS loans

*Other:*
- Tax debt (IRS payment plans)
- Legal judgments
- Alimony/child support obligations

**Data Points Captured:**
- Outstanding balance
- Interest rate (fixed vs variable)
- Minimum payment
- Monthly payment
- Original loan amount
- Loan term / payoff date
- Payment history
- Servicer information
- Forgiveness eligibility (student loans)

**Key Insights Enabled:**
- Total debt burden
- Debt-to-income ratio
- Optimal payoff strategy (avalanche vs snowball)
- Refinancing opportunities
- Consolidation analysis
- Student loan forgiveness eligibility
- Interest cost projections

**Recommendations:**
- "You're paying $847/month in interest across your debts. Here's a plan to be debt-free in 3.2 years."
- "Your highest-rate debt is your credit card at 24.99%. Paying an extra $200/month saves $4,200 in interest."
- "You may qualify for Public Service Loan Forgiveness. You've made 67 of 120 qualifying payments."
- "Refinancing your student loans from 6.8% to 4.5% would save $12,000 over the loan term."
- "You have 3 BNPL payments totaling $890 due in the next 30 days. Don't forget these aren't on your credit report but are real debt."

---

### Pillar 5: Income

**Definition:** All sources of money coming in, including employment, investments, and other sources.

**Income Types:**

*Employment Income:*
- Salary/wages (gross and net)
- Bonuses
- Commissions
- Overtime
- Tips

*Equity Compensation:*
- RSU vesting value
- Option exercises
- ESPP discount value
- Carried interest

*Investment Income:*
- Dividends
- Interest
- Capital gains distributions
- Rental income

*Other Income:*
- Side business / freelance
- Gig economy (Uber, DoorDash, etc.)
- Social Security
- Pension payments
- Alimony received
- Royalties

**Data Points Captured:**
- Gross income (by source)
- Net income (after taxes and deductions)
- Pay frequency
- Tax withholdings (federal, state, local, FICA)
- Pre-tax deductions (401k, health insurance, HSA, FSA)
- Post-tax deductions
- Employer information
- Employment history
- Vesting schedules

**Key Insights Enabled:**
- Total compensation analysis
- Tax bracket awareness
- Withholding optimization
- Contribution limit eligibility (IRA, 401k based on income)
- Cash flow forecasting
- Income verification for lending
- Employer benefit optimization

**Recommendations:**
- "Your W-4 is set to withhold $8,400 more than you'll owe. Adjust to increase your monthly take-home by $700."
- "You're in the 24% tax bracket. A $10,000 Traditional IRA contribution would save $2,400 in taxes."
- "Your employer matches 50% of 401k contributions up to 6%. You're only contributing 4% — you're leaving $1,800/year on the table."
- "Your RSUs vest in 3 weeks. At current prices, that's $45,000 of income. Set aside $15,000 for taxes."
- "Your ESPP offers a 15% discount. Maxing this out is a guaranteed 15% return — consider increasing your contribution."

---

### Pillar 6: Credit

**Definition:** Credit history, scores, and utilization that determine borrowing capacity and interest rates.

**Data Types:**

*Credit Reports:*
- Account history (open and closed)
- Payment history
- Credit inquiries (hard and soft)
- Public records (bankruptcies, liens, judgments)
- Collections accounts

*Credit Scores:*
- FICO Score (multiple versions)
- VantageScore
- Industry-specific scores (auto, mortgage)

*Credit Utilization:*
- Per-card utilization
- Overall utilization
- Available credit

**Data Points Captured:**
- Credit scores (with history)
- Number of accounts
- Average account age
- Credit utilization (per account and total)
- Recent inquiries
- Negative marks
- Credit limit per account
- Payment history (on-time %)

**Key Insights Enabled:**
- Score improvement opportunities
- Rate qualification estimation
- Identity theft detection
- Credit building strategy
- Optimal card usage for utilization
- Inquiry timing strategy

**Recommendations:**
- "Your credit utilization is 34%. Paying down $2,000 would drop it to 25% and likely boost your score 20-30 points."
- "You have 4 hard inquiries in the last 6 months. Wait 2 months before applying for new credit."
- "Your average account age is 2.3 years. Don't close your oldest card — it would drop to 1.1 years."
- "With your 760 score, you qualify for the best mortgage rates. Here's what you'd pay at current rates."
- "There's a new collection account on your report for $340. Paying this could improve your score significantly."

---

### Pillar 7: Protection

**Definition:** Insurance, estate planning, and other mechanisms that protect wealth and family.

**Protection Types:**

*Insurance:*
- Life insurance (term, whole, universal)
- Health insurance (including HSA eligibility)
- Disability insurance (short-term and long-term)
- Homeowners / renters insurance
- Auto insurance
- Umbrella liability insurance
- Long-term care insurance

*Estate Planning:*
- Will
- Trusts (revocable, irrevocable, etc.)
- Power of attorney
- Healthcare directive
- Beneficiary designations (on accounts)

**Data Points Captured:**
- Policy types and coverage amounts
- Premium costs
- Cash value (permanent life insurance)
- Beneficiaries
- Coverage gaps
- Policy expiration dates

**Key Insights Enabled:**
- Insurance adequacy analysis
- Coverage gap identification
- Premium optimization
- Beneficiary consistency check
- Estate planning completeness

**Recommendations:**
- "Your term life insurance covers 5x your income ($400K). With a mortgage and 2 kids, consider increasing to 10-12x."
- "Your 401k beneficiary is still your ex-spouse. Update this immediately."
- "You have no umbrella policy but $800K in assets. A $1M umbrella costs ~$300/year and protects everything."
- "Your whole life policy has $67K cash value. This should be included in your net worth and emergency fund calculations."
- "You don't have a will. With children, this is critical — here's how to get started."

---

## IV. The Recommendation Engine

### Philosophy: Explainable, Actionable, Personalized

Every recommendation must be:

1. **Explainable** — User can see exactly what data and rules produced the recommendation
2. **Actionable** — Clear next steps, not vague advice
3. **Personalized** — Based on their actual numbers, not generic rules
4. **Prioritized** — Ranked by impact and urgency
5. **Honest** — Will tell users when NOT to do something

### Decision Trace System

Every recommendation includes a complete decision trace:

```json
{
  "recommendation_id": "rec_123",
  "type": "tax_loss_harvest",
  "title": "Tax-loss harvesting opportunity: VTI",
  "description": "Sell VTI position to realize $8,400 loss...",
  "estimated_benefit": 2100,
  "priority": "high",
  "decision_trace": {
    "inputs": {
      "holding": "VTI",
      "unrealized_loss": -8400,
      "account_type": "taxable_brokerage",
      "tax_bracket": 0.24,
      "days_held": 245,
      "wash_sale_risk": false
    },
    "rules_applied": [
      "LOSS_EXCEEDS_THRESHOLD ($1000)",
      "TAXABLE_ACCOUNT_ONLY",
      "NO_WASH_SALE_CONFLICT",
      "SHORT_TERM_LOSS (higher value)"
    ],
    "calculation": {
      "tax_savings": "$8,400 × 24% = $2,016",
      "rounded_estimate": "$2,100"
    },
    "confidence": 0.95,
    "caveats": [
      "Assumes no wash sale in next 30 days",
      "Based on current tax bracket"
    ]
  }
}
```

### Recommendation Categories

| Category | Examples | Data Required |
|----------|----------|---------------|
| **Debt Optimization** | Payoff strategy, refinancing, consolidation | Liabilities, Income, Credit |
| **Tax Optimization** | Tax-loss harvesting, Roth conversion, withholding | Investments, Income |
| **Retirement** | Contribution optimization, allocation, projections | Investments, Income, Goals |
| **Cash Management** | Emergency fund, idle cash, HYSA | Liquid Assets, Income |
| **Risk Management** | Insurance gaps, concentration, diversification | All Pillars |
| **Credit Building** | Utilization, account strategy, inquiry timing | Credit, Liabilities |
| **Major Purchases** | House affordability, car buying, timing | All Pillars, Goals |
| **Equity Compensation** | Exercise timing, 83(b), diversification | Investments, Income, Tax |

---

## V. The User Experience Vision

### The Dashboard

When a user opens ClearMoney, they see:

**1. Net Worth Summary**
```
Total Net Worth: $487,230
├── Assets: $612,450
│   ├── Investments: $389,000
│   ├── Real Estate: $185,000 (equity)
│   ├── Cash: $38,450
│   └── Other: $0
└── Liabilities: $125,220
    ├── Mortgage: $115,000
    ├── Student Loans: $8,200
    └── Credit Cards: $2,020

Change: +$12,430 this month (+2.6%)
```

**2. Action Items (Prioritized)**
```
🔴 HIGH PRIORITY
1. Your 401k beneficiary is outdated → Update now
2. RSUs vesting in 14 days ($45K) → Plan for taxes

🟡 MEDIUM PRIORITY
3. Tax-loss harvest opportunity: $2,100 savings → Review
4. Credit utilization at 34% → Pay down $2K

🟢 OPPORTUNITIES
5. Refinance mortgage: Save $340/month → Explore
6. Idle cash earning 0.01% → Move to HYSA
```

**3. Financial Health Score**
```
Overall Score: 78/100 (Good)

├── Cash Flow: 85/100 ✓
├── Debt Management: 72/100
├── Investments: 81/100 ✓
├── Protection: 65/100 ⚠️
└── Credit: 88/100 ✓

Top improvement: Add life insurance (+8 points)
```

### The "Why This?" Drawer

Every recommendation can be expanded to show:

1. **The Data** — What accounts/numbers were used
2. **The Logic** — What rules and calculations were applied
3. **The Alternatives** — What other options were considered
4. **The Caveats** — What assumptions were made
5. **Learn More** — Educational content about the concept

This transparency builds trust and helps users learn.

### The Scenario Planner

Users can ask "what if" questions:

- "What if I pay an extra $500/month toward my mortgage?"
- "What if I max out my 401k?"
- "What if I buy a house for $600K?"
- "What if I take this new job offer?"

The system recalculates recommendations based on the hypothetical scenario.

---

## VI. Privacy, Security, and Trust

### Data Principles

1. **User Ownership** — Users own their data. They can export or delete it at any time.
2. **Minimal Collection** — We only collect data needed for recommendations.
3. **Encryption** — All data encrypted at rest and in transit.
4. **No Selling** — We never sell user data to third parties.
5. **Transparency** — Users can see exactly what data we have and how it's used.

### Consent Model

Every data connection requires explicit consent:

```
ClearMoney would like to connect to your Fidelity account.

This will allow us to:
✓ See your account balances
✓ See your holdings and positions
✓ See your transaction history
✓ See your cost basis for tax analysis

We will NOT be able to:
✗ Move money
✗ Place trades
✗ Change your account settings

You can disconnect at any time.

[Connect Fidelity] [Learn More]
```

### Security Architecture

- SOC 2 Type II certified
- Bank-grade encryption (AES-256)
- OAuth 2.0 for all connections (no credential storage where possible)
- Regular security audits
- Bug bounty program

---

## VII. Business Model

### How We Make Money (Transparently)

**1. Subscription ($12/month or $99/year)**
- Full access to all features
- Unlimited account connections
- Advanced recommendations
- Scenario planning

**2. Premium Features (Future)**
- Tax document preparation
- Advisor consultations
- Family accounts

**3. Affiliate Revenue (With Integrity)**
- When we recommend financial products (credit cards, savings accounts, etc.)
- Always disclosed
- Only recommend what's actually best for the user
- Show non-affiliate alternatives when they're better

**What We Don't Do:**
- Sell user data
- Show ads
- Take kickbacks that influence recommendations
- Charge for basic net worth tracking

---

## VIII. Technical Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   Web App   │  │  iOS App    │  │ Android App │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API GATEWAY                                 │
│              Authentication, Rate Limiting, Routing              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    STRATA API                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   Accounts  │  │  Holdings   │  │    Sync     │              │
│  │   Service   │  │   Service   │  │   Service   │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │    Recs     │  │   Traces    │  │  Webhooks   │              │
│  │   Engine    │  │   Service   │  │   Service   │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   PROVIDER ABSTRACTION                           │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │ Schwab  │ │SnapTrade│ │  Plaid  │ │ Argyle  │ │  Zillow │   │
│  │ Direct  │ │  Invest │ │  Bank   │ │ Payroll │ │  Realty │   │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘   │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │  Carta  │ │ Credit  │ │ Zerion  │ │ Manual  │ │  ...    │   │
│  │ Equity  │ │ Bureaus │ │ Crypto  │ │ Entry   │ │         │   │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATA LAYER                                  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   PostgreSQL    │  │   TimescaleDB   │  │     Redis       │  │
│  │   (Core Data)   │  │   (Time Series) │  │    (Cache)      │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Provider Strategy

| Data Type | Primary Provider | Secondary | Direct API Option |
|-----------|-----------------|-----------|-------------------|
| Investments | SnapTrade | Plaid | Schwab, IBKR |
| Bank Accounts | Plaid | MX | — |
| Liabilities | Plaid | Finicity | — |
| Payroll/Income | Argyle | Pinwheel | — |
| Equity Comp | Carta | Manual | — |
| Credit | Experian | TransUnion | — |
| Real Estate | Zillow | Manual | — |
| Crypto | Zerion | On-chain | — |

---

## IX. Roadmap

### Phase 1: Foundation (Months 1-3)
**Goal:** Investment-focused MVP

- ✅ Investment account connectivity (Schwab direct + SnapTrade)
- ✅ Holdings, positions, cost basis
- ✅ Asset allocation analysis
- ✅ Tax-loss harvesting recommendations
- ✅ Decision trace system
- ✅ Basic web interface

### Phase 2: Complete Net Worth (Months 4-6)
**Goal:** Full asset and liability picture

- Bank account connectivity (Plaid)
- Liability tracking (mortgages, student loans, auto)
- Real estate integration (Zillow)
- Net worth dashboard
- Debt payoff recommendations
- Cash flow analysis

### Phase 3: Income & Tax (Months 7-9)
**Goal:** Income-aware recommendations

- Payroll connectivity (Argyle)
- Equity compensation tracking (Carta)
- Tax bracket awareness
- Withholding optimization
- 401k contribution optimization
- Roth conversion analysis

### Phase 4: Credit & Protection (Months 10-12)
**Goal:** Complete financial picture

- Credit report integration
- Credit score tracking
- Insurance tracking (manual + limited API)
- Beneficiary audit
- Financial health score
- Mobile apps (iOS, Android)

### Phase 5: Advanced Features (Year 2)
**Goal:** Advisor-grade capabilities

- Scenario planning
- Retirement projections
- Tax document integration
- Family accounts
- Advisor collaboration mode
- API for third-party apps

---

## X. Success Metrics

### North Star Metric
**Percentage of users who take action on a recommendation within 30 days**

Target: >40%

### Supporting Metrics

| Metric | Target | Why It Matters |
|--------|--------|----------------|
| Accounts connected per user | >5 | More data = better recommendations |
| Recommendation engagement | >60% | Users trust and read our advice |
| Action completion rate | >40% | Users act on recommendations |
| Net worth accuracy | >95% | Users trust our data |
| Monthly active users | Growing | Product-market fit |
| NPS | >50 | Users love and recommend us |
| Churn rate | <3%/month | Users find ongoing value |

### Impact Metrics (What We're Really Measuring)

- Dollars saved per user (interest, fees, taxes)
- Retirement readiness improvement
- Debt reduction velocity
- Emergency fund adequacy
- Financial stress reduction (survey)

---

## XI. The Competitive Landscape

### Why We Win

| Competitor | Their Focus | Our Advantage |
|------------|-------------|---------------|
| **Mint** | Budgeting, spending | We focus on wealth building, not tracking |
| **Personal Capital** | Investment tracking | We include liabilities, income, full picture |
| **YNAB** | Budgeting methodology | We're automated, not manual |
| **Copilot** | Modern budgeting | We have deeper recommendations |
| **Wealthfront/Betterment** | Robo-advisory | We work with existing accounts |
| **Financial Advisors** | Personalized advice | We're accessible to everyone |

### Our Moat

1. **Data Breadth** — No one else connects all seven pillars
2. **Explainability** — Decision traces build trust others can't match
3. **Provider Abstraction** — We can add new data sources faster
4. **Strata** — Relationships between data enable unique insights
5. **User Trust** — Transparency and integrity create loyalty

---

## XII. The Team We Need

### Core Roles

| Role | Responsibility |
|------|----------------|
| **Backend Engineers** | Provider integrations, data pipeline, API |
| **Frontend Engineers** | Web and mobile apps, data visualization |
| **Data Engineers** | ETL, data quality, normalization |
| **ML Engineers** | Recommendation models, anomaly detection |
| **Security Engineers** | Encryption, compliance, audits |
| **Product Managers** | Roadmap, user research, prioritization |
| **Designers** | UX/UI, information architecture |
| **Financial Experts** | Domain knowledge, recommendation rules |
| **Compliance** | Privacy, regulatory, SOC 2 |

---

## XIII. Closing Thoughts

### Why This Matters

Financial stress affects 73% of Americans. Most people don't have access to good financial advice. The existing tools are either too simple (tracking only) or too expensive (human advisors).

The Strata for Personal Finance changes this equation. By connecting all the data and making recommendations transparent, we can democratize access to advisor-grade financial guidance.

### The Opportunity

- 150M+ US households
- $100B+ in annual financial advisory fees
- Massive gap between "tools" and "advisors"
- We sit in the middle: automated, comprehensive, affordable

### The Vision

In 5 years, asking "how should I manage my money?" without ClearMoney will feel like asking "how do I get to the airport?" without Google Maps.

We're not building an app. We're building the infrastructure for financial decision-making.

---

*This document represents the aspirational vision for ClearMoney. It will evolve as we learn from users and the market.*

---

**Document Control**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | January 2026 | Product Team | Initial vision document |
