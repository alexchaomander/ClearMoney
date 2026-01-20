# Agent Prompt: Appreciated Stock Donation Calculator

## Your Mission

Build the Appreciated Stock Donation Calculator for ClearMoney. This tool helps users understand the significant tax advantages of donating appreciated stock instead of cash to charity—often saving thousands in capital gains taxes while achieving the same charitable impact.

## Project Context

**Repository:** You are working in a Next.js 15+ project with React 19, TypeScript, and Tailwind CSS.
**Your app directory:** `/src/app/tools/appreciated-stock-donation/`
**Your calculator logic:** `/src/lib/calculators/appreciated-stock-donation/`
**Branch name:** `feature/app-appreciated-stock-donation`

## Background Research

**The Problem:**
- Most people donate cash when appreciated stock is more tax-efficient
- Donating appreciated stock: full FMV deduction + avoid capital gains
- This "double benefit" can save 20-30%+ of the donation amount
- Yet most donors don't realize this option exists

**How It Works:**

**Option A: Sell Stock, Donate Cash**
1. Sell $10,000 of stock (cost basis $2,000)
2. Pay ~$1,500 capital gains tax on $8,000 gain
3. Donate remaining $8,500 to charity
4. Get $8,500 charitable deduction
5. **Net benefit:** $8,500 deduction - $1,500 tax = reduced by taxes

**Option B: Donate Stock Directly**
1. Donate $10,000 of stock directly to charity
2. Pay $0 capital gains tax
3. Get full $10,000 charitable deduction
4. **Net benefit:** Full $10,000 deduction + $0 tax = maximum benefit

**Key Requirements:**
- Stock must be held > 1 year for long-term capital gains treatment
- Donation is FMV, not cost basis
- Charity must accept stock donations (most large charities do)
- Can "replenish" by buying same stock immediately (no wash sale rule for donations)

**AGI Limits:**
- Cash donations: 60% of AGI
- Appreciated property: 30% of AGI (or 50% at cost basis)
- Excess carries forward 5 years

**2025-2026 Changes:**
- 2026 introduces 0.5% AGI floor on deductions
- 35% cap on deduction value for top earners
- 2025 is strategically good year to maximize giving

## Before You Start

1. Read shared patterns: `cat /docs/app-specs/shared-patterns.md`
2. Review existing calculator: `ls -la /src/app/tools/bilt-calculator/`
3. Check shared components: `cat /src/components/shared/index.ts`

## Design Requirements

- **Primary Color:** Green (#22c55e) - charitable, growth, positive
- **Design Style:** Comparison-focused, clear savings display
- **Base:** Dark mode (bg-neutral-950)
- **Mobile-first:** Must work on 375px viewport

## User Inputs

### Stock Information
| Input | Label | Default | Min | Max | Step |
|-------|-------|---------|-----|-----|------|
| stockValue | Current Market Value | 10000 | 100 | 1000000 | 100 |
| costBasis | Cost Basis | 2000 | 0 | 1000000 | 100 |
| holdingPeriod | Holding Period (months) | 24 | 0 | 360 | 1 |

### Tax Information
| Input | Label | Default | Min | Max | Step |
|-------|-------|---------|-----|-----|------|
| filingStatus | Filing Status | single | single, married, head_of_household |
| adjustedGrossIncome | Adjusted Gross Income | 200000 | 0 | 5000000 | 10000 |
| marginalTaxRate | Marginal Federal Rate % | 32 | 10 | 37 | 1 |
| stateCode | State | CA | (all states) |
| itemizesDeductions | Itemizes Deductions | true | true, false |

### Donation Details
| Input | Label | Default | Min | Max |
|-------|-------|---------|-----|-----|
| donationAmount | Amount to Donate | 10000 | 100 | 1000000 |
| donationType | Donation Recipient | public_charity | public_charity, private_foundation, daf |

## Calculation Logic

```typescript
// src/lib/calculators/appreciated-stock-donation/types.ts
export type FilingStatus = 'single' | 'married' | 'head_of_household';
export type DonationType = 'public_charity' | 'private_foundation' | 'daf';

export interface StockInfo {
  stockValue: number;
  costBasis: number;
  holdingPeriod: number; // months
}

export interface TaxInfo {
  filingStatus: FilingStatus;
  adjustedGrossIncome: number;
  marginalTaxRate: number;
  stateCode: string;
  itemizesDeductions: boolean;
}

export interface DonationInfo {
  donationAmount: number;
  donationType: DonationType;
}

export interface CalculatorInputs {
  stock: StockInfo;
  tax: TaxInfo;
  donation: DonationInfo;
}

export interface CashDonationScenario {
  stockSaleProceeds: number;
  capitalGain: number;
  federalCapGainsTax: number;
  stateCapGainsTax: number;
  niitTax: number;
  totalCapGainsTax: number;
  amountAvailableToDonate: number;
  charitableDeduction: number;
  taxSavingsFromDeduction: number;
  netCostOfDonation: number;
}

export interface StockDonationScenario {
  stockValue: number;
  capitalGainAvoided: number;
  taxAvoided: number;
  charitableDeduction: number;
  taxSavingsFromDeduction: number;
  netCostOfDonation: number;
  agiLimitPercent: number;
  deductibleThisYear: number;
  carryForward: number;
}

export interface ComparisonResult {
  stockAdvantage: number;
  percentageSavings: number;
  effectiveCostCashDonation: number;
  effectiveCostStockDonation: number;
  additionalCharitableImpact: number;
}

export interface CalculatorResults {
  // Scenarios
  cashScenario: CashDonationScenario;
  stockScenario: StockDonationScenario;

  // Comparison
  comparison: ComparisonResult;

  // Eligibility
  isLongTermHolding: boolean;
  qualifiesForFMVDeduction: boolean;

  // AGI Limits
  cashAGILimit: number;
  stockAGILimit: number;
  currentCashDonationsRoom: number;
  currentStockDonationsRoom: number;

  // Recommendations
  recommendations: string[];
  warnings: string[];

  // Action steps
  steps: {
    step: number;
    title: string;
    description: string;
  }[];
}
```

```typescript
// src/lib/calculators/appreciated-stock-donation/calculations.ts
import type { CalculatorInputs, CalculatorResults, CashDonationScenario, StockDonationScenario, ComparisonResult } from "./types";

// Capital gains rates
const FEDERAL_LTCG_RATES = {
  single: [
    { max: 47025, rate: 0 },
    { max: 518900, rate: 0.15 },
    { max: Infinity, rate: 0.20 },
  ],
  married: [
    { max: 94050, rate: 0 },
    { max: 583750, rate: 0.15 },
    { max: Infinity, rate: 0.20 },
  ],
  head_of_household: [
    { max: 63000, rate: 0 },
    { max: 551350, rate: 0.15 },
    { max: Infinity, rate: 0.20 },
  ],
};

// NIIT thresholds
const NIIT_THRESHOLD = {
  single: 200000,
  married: 250000,
  head_of_household: 200000,
};

// State tax rates (simplified - capital gains rates)
const STATE_TAX_RATES: Record<string, number> = {
  CA: 0.133, NY: 0.109, NJ: 0.1075, OR: 0.099, MN: 0.0985,
  HI: 0.11, VT: 0.0875, IA: 0.085, WI: 0.0765, ME: 0.0715,
  WA: 0, TX: 0, FL: 0, NV: 0, SD: 0, WY: 0, AK: 0, TN: 0, NH: 0,
  // Add more as needed
};

// AGI limits for charitable deductions
const AGI_LIMITS = {
  cash_public_charity: 0.60,
  cash_private_foundation: 0.30,
  cash_daf: 0.60, // DAFs are public charities
  property_public_charity: 0.30,
  property_private_foundation: 0.20,
  property_daf: 0.30,
};

function getFederalCapGainsRate(income: number, filingStatus: FilingStatus): number {
  const brackets = FEDERAL_LTCG_RATES[filingStatus];
  for (const bracket of brackets) {
    if (income <= bracket.max) {
      return bracket.rate;
    }
  }
  return 0.20;
}

function calculateCashScenario(inputs: CalculatorInputs): CashDonationScenario {
  const { stock, tax, donation } = inputs;

  // Calculate gain per dollar of stock
  const gainRatio = stock.stockValue > 0
    ? (stock.stockValue - stock.costBasis) / stock.stockValue
    : 0;

  // For donation amount, calculate proportional gain
  const stockToSell = donation.donationAmount;
  const capitalGain = stockToSell * gainRatio;
  const costBasisPortion = stockToSell - capitalGain;

  // Federal capital gains tax
  const isLongTerm = stock.holdingPeriod >= 12;
  const federalRate = isLongTerm
    ? getFederalCapGainsRate(tax.adjustedGrossIncome, tax.filingStatus)
    : tax.marginalTaxRate / 100;
  const federalCapGainsTax = capitalGain * federalRate;

  // State capital gains tax
  const stateRate = STATE_TAX_RATES[tax.stateCode] || 0;
  const stateCapGainsTax = capitalGain * stateRate;

  // NIIT (3.8% on investment income over threshold)
  const niitThreshold = NIIT_THRESHOLD[tax.filingStatus];
  let niitTax = 0;
  if (tax.adjustedGrossIncome > niitThreshold) {
    niitTax = capitalGain * 0.038;
  }

  const totalCapGainsTax = federalCapGainsTax + stateCapGainsTax + niitTax;
  const amountAvailableToDonate = stockToSell - totalCapGainsTax;

  // Charitable deduction (if itemizing)
  const charitableDeduction = tax.itemizesDeductions ? amountAvailableToDonate : 0;
  const combinedMarginalRate = (tax.marginalTaxRate / 100) + stateRate;
  const taxSavingsFromDeduction = charitableDeduction * combinedMarginalRate;

  // Net cost = money out of pocket - tax savings
  const netCostOfDonation = stockToSell - taxSavingsFromDeduction;

  return {
    stockSaleProceeds: stockToSell,
    capitalGain,
    federalCapGainsTax,
    stateCapGainsTax,
    niitTax,
    totalCapGainsTax,
    amountAvailableToDonate,
    charitableDeduction,
    taxSavingsFromDeduction,
    netCostOfDonation,
  };
}

function calculateStockScenario(inputs: CalculatorInputs): StockDonationScenario {
  const { stock, tax, donation } = inputs;

  const isLongTerm = stock.holdingPeriod >= 12;

  // Calculate gain that would be avoided
  const gainRatio = stock.stockValue > 0
    ? (stock.stockValue - stock.costBasis) / stock.stockValue
    : 0;
  const capitalGainAvoided = donation.donationAmount * gainRatio;

  // Tax that would have been paid on sale
  const federalRate = isLongTerm
    ? getFederalCapGainsRate(tax.adjustedGrossIncome, tax.filingStatus)
    : tax.marginalTaxRate / 100;
  const stateRate = STATE_TAX_RATES[tax.stateCode] || 0;
  const niitThreshold = NIIT_THRESHOLD[tax.filingStatus];
  const niitRate = tax.adjustedGrossIncome > niitThreshold ? 0.038 : 0;

  const taxAvoided = capitalGainAvoided * (federalRate + stateRate + niitRate);

  // AGI limit for stock donations
  let agiLimitPercent: number;
  if (donation.donationType === 'private_foundation') {
    agiLimitPercent = 0.20;
  } else {
    agiLimitPercent = 0.30; // Public charity or DAF
  }

  const maxDeductionThisYear = tax.adjustedGrossIncome * agiLimitPercent;
  const deductibleThisYear = Math.min(donation.donationAmount, maxDeductionThisYear);
  const carryForward = Math.max(0, donation.donationAmount - deductibleThisYear);

  // Charitable deduction (if long-term, FMV; if short-term, cost basis)
  const charitableDeduction = tax.itemizesDeductions
    ? (isLongTerm ? deductibleThisYear : Math.min(deductibleThisYear, stock.costBasis * (donation.donationAmount / stock.stockValue)))
    : 0;

  const combinedMarginalRate = (tax.marginalTaxRate / 100) + stateRate;
  const taxSavingsFromDeduction = charitableDeduction * combinedMarginalRate;

  // Net cost = value given away - tax avoided - tax savings from deduction
  // But since we're comparing to getting nothing in return, net cost is:
  const netCostOfDonation = donation.donationAmount - taxAvoided - taxSavingsFromDeduction;

  return {
    stockValue: donation.donationAmount,
    capitalGainAvoided,
    taxAvoided,
    charitableDeduction,
    taxSavingsFromDeduction,
    netCostOfDonation,
    agiLimitPercent: agiLimitPercent * 100,
    deductibleThisYear,
    carryForward,
  };
}

export function calculate(inputs: CalculatorInputs): CalculatorResults {
  const { stock, tax, donation } = inputs;

  const cashScenario = calculateCashScenario(inputs);
  const stockScenario = calculateStockScenario(inputs);

  // Comparison
  const stockAdvantage = cashScenario.netCostOfDonation - stockScenario.netCostOfDonation;
  const percentageSavings = cashScenario.netCostOfDonation > 0
    ? (stockAdvantage / cashScenario.netCostOfDonation) * 100
    : 0;

  // With cash donation: charity receives (stock - cap gains tax)
  // With stock donation: charity receives full stock value
  const additionalCharitableImpact = stockScenario.stockValue - cashScenario.amountAvailableToDonate;

  const comparison: ComparisonResult = {
    stockAdvantage,
    percentageSavings,
    effectiveCostCashDonation: cashScenario.netCostOfDonation,
    effectiveCostStockDonation: stockScenario.netCostOfDonation,
    additionalCharitableImpact,
  };

  // Eligibility checks
  const isLongTermHolding = stock.holdingPeriod >= 12;
  const qualifiesForFMVDeduction = isLongTermHolding;

  // AGI limits
  const stateRate = STATE_TAX_RATES[tax.stateCode] || 0;
  const cashAGILimit = tax.adjustedGrossIncome * 0.60;
  const stockAGILimit = tax.adjustedGrossIncome * 0.30;
  const currentCashDonationsRoom = cashAGILimit; // Simplified
  const currentStockDonationsRoom = stockAGILimit;

  // Recommendations
  const recommendations: string[] = [];
  const warnings: string[] = [];

  if (stockAdvantage > 0) {
    recommendations.push(`Donating stock saves you $${stockAdvantage.toLocaleString()} compared to selling and donating cash.`);
  }

  if (additionalCharitableImpact > 0) {
    recommendations.push(`The charity receives $${additionalCharitableImpact.toLocaleString()} more when you donate stock directly.`);
  }

  if (!isLongTermHolding) {
    warnings.push(`You've held this stock for only ${stock.holdingPeriod} months. Hold for 12+ months to qualify for full FMV deduction.`);
    recommendations.push("Consider waiting until you've held the stock for at least 12 months.");
  }

  if (stockScenario.carryForward > 0) {
    warnings.push(`Your donation exceeds the ${stockScenario.agiLimitPercent}% AGI limit. $${stockScenario.carryForward.toLocaleString()} will carry forward to future years.`);
  }

  if (!tax.itemizesDeductions) {
    warnings.push("You're not itemizing deductions. You won't receive a tax benefit from the charitable deduction. Consider bunching donations to exceed the standard deduction.");
  }

  if (stock.costBasis === 0) {
    recommendations.push("With a $0 cost basis (100% gain), donating stock is especially advantageous—you avoid maximum capital gains.");
  }

  // Steps
  const steps: CalculatorResults['steps'] = [
    {
      step: 1,
      title: "Verify Charity Accepts Stock",
      description: "Contact the charity or check their website. Most large charities and all Donor-Advised Funds accept stock donations.",
    },
    {
      step: 2,
      title: "Get Stock Transfer Instructions",
      description: "The charity will provide their brokerage account details (DTC number, account number). Request these in writing.",
    },
    {
      step: 3,
      title: "Initiate Transfer from Your Broker",
      description: "Contact your broker (or use their website) to initiate a stock transfer. You'll need the charity's brokerage info.",
    },
    {
      step: 4,
      title: "Document the Donation",
      description: "Get written acknowledgment from the charity. For donations over $500, you'll need Form 8283. Over $5,000 requires appraisal.",
    },
    {
      step: 5,
      title: "(Optional) Replenish Your Position",
      description: "Buy the same stock back immediately with cash. No wash sale rule applies to donations! This resets your cost basis higher.",
    },
  ];

  return {
    cashScenario,
    stockScenario,
    comparison,
    isLongTermHolding,
    qualifiesForFMVDeduction,
    cashAGILimit,
    stockAGILimit,
    currentCashDonationsRoom,
    currentStockDonationsRoom,
    recommendations,
    warnings,
    steps,
  };
}
```

## UI Structure

### Layout

1. **Hero Section**
   - Title: "Appreciated Stock Donation Calculator"
   - Subtitle: "Maximize your charitable impact while minimizing taxes"

2. **Stock & Donation Input Section**
   - Current value input
   - Cost basis input
   - Holding period input
   - Donation amount slider

3. **The Big Comparison** (hero result)
   - Side-by-side cards:
     - **Sell & Donate Cash:** Net cost $X,XXX
     - **Donate Stock:** Net cost $X,XXX
   - Large "You Save $X,XXX" callout
   - Percentage savings displayed

4. **Detailed Breakdown Table**
   | | Sell & Donate Cash | Donate Stock |
   |---|---|---|
   | Starting Value | $10,000 | $10,000 |
   | Capital Gains Tax | -$1,500 | $0 |
   | Amount to Charity | $8,500 | $10,000 |
   | Tax Deduction | $8,500 | $10,000 |
   | Tax Savings | $2,720 | $3,200 |
   | **Net Cost to You** | **$5,780** | **$4,500** |

5. **Visual: Where the Money Goes**
   - Flow diagram showing:
     - Cash path: Stock → IRS (cap gains) → Charity
     - Stock path: Stock → Charity (direct)

6. **Charity Impact Section**
   - "With cash, charity receives: $X"
   - "With stock, charity receives: $X"
   - "Additional impact: $X"

7. **AGI Limits Tracker**
   - Progress bar showing usage vs 30%/60% limits
   - Carryforward explanation if applicable

8. **Steps to Donate Stock** (numbered cards)
   - Clear, actionable steps
   - Broker-specific tips

9. **Replenish Strategy** (optional section)
   - Explain buying back immediately
   - Cost basis reset benefit

10. **Warnings & Recommendations Panel**
    - Holding period warning if < 12 months
    - AGI limit warnings
    - Itemization advice

11. **Methodology Section** (collapsible)
    - How deduction is calculated
    - AGI limits explained
    - IRS rules cited

## Files to Create

```
src/
├── app/tools/appreciated-stock-donation/
│   ├── page.tsx
│   └── calculator.tsx
└── lib/calculators/appreciated-stock-donation/
    ├── types.ts
    └── calculations.ts
```

## Registration

Add to `/src/lib/site-config.ts`:

```typescript
{
  id: "appreciated-stock-donation",
  name: "Appreciated Stock Donation Calculator",
  description: "See how much you save by donating appreciated stock instead of cash",
  href: "/tools/appreciated-stock-donation",
  categoryId: "charitable-giving",
  status: "live",
  primaryColor: "#22c55e",
  designStyle: "comparison",
  inspiredBy: ["Fidelity Charitable", "DAFgiving360"],
  featured: true,
}
```

## Testing Checklist

- [ ] `npm run build` passes
- [ ] `npm run lint` passes
- [ ] Mobile viewport (375px) works
- [ ] Capital gains calculated correctly for different holding periods
- [ ] NIIT applied when over threshold
- [ ] State taxes included
- [ ] 30% AGI limit for stock, 60% for cash
- [ ] Carryforward calculated correctly
- [ ] Short-term holding triggers warning
- [ ] Comparison shows correct advantage

## Git Workflow

```bash
git checkout -b feature/app-appreciated-stock-donation
# ... build the app ...
git add .
git commit -m "Add Appreciated Stock Donation Calculator"
git push -u origin feature/app-appreciated-stock-donation
```

## Do NOT

- Modify shared components
- Provide tax advice (educational only)
- Forget the 12-month holding period requirement
- Ignore AGI limits (30% for appreciated property)
- Skip the "replenish" strategy explanation
- Forget to explain carryforward rules
