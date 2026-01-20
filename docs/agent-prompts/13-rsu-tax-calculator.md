# Agent Prompt: RSU Tax Calculator

## Your Mission

Build the RSU Tax Calculator for ClearMoney. This tool helps tech workers understand exactly how their RSUs are taxed at vesting—solving the common problem of being surprised by withholding gaps and unexpected tax bills.

## Project Context

**Repository:** You are working in a Next.js 15+ project with React 19, TypeScript, and Tailwind CSS.
**Your app directory:** `/src/app/tools/rsu-tax-calculator/`
**Your calculator logic:** `/src/lib/calculators/rsu-tax-calculator/`
**Branch name:** `feature/app-rsu-tax-calculator`

## Background Research

**The Problem:**
- RSUs are taxed as ordinary income at vesting
- Companies typically withhold at "supplemental income" rate (22% federal)
- Actual tax rate for high earners is often 32-37% federal + state
- Result: Employees owe thousands at tax time and don't understand why

**How RSU Taxation Works:**
1. RSUs vest → shares become yours
2. Fair Market Value at vesting = ordinary income
3. Company withholds taxes (often insufficient)
4. You receive net shares after withholding
5. Future gains/losses are capital gains from new cost basis

**Key Tax Rates (2024-2025):**
- Federal supplemental withholding: 22% (up to $1M), 37% (over $1M)
- Actual federal brackets: 10%, 12%, 22%, 24%, 32%, 35%, 37%
- State taxes: 0% (TX, WA, FL) to 13.3% (CA)
- FICA: 6.2% Social Security (up to $168,600), 1.45% Medicare
- Additional Medicare: 0.9% over $200K single / $250K married

**Common Surprise:**
Engineer in California making $300K with $100K RSU vest:
- Company withholds: ~22% federal + ~10% CA = ~$32K
- Actual liability: ~35% federal + 13.3% CA = ~$48K
- **Surprise bill: ~$16K at tax time**

## Before You Start

1. Read shared patterns: `cat /docs/app-specs/shared-patterns.md`
2. Review existing calculator: `ls -la /src/app/tools/bilt-calculator/`
3. Check shared components: `cat /src/components/shared/index.ts`

## Design Requirements

- **Primary Color:** Indigo (#6366f1) - professional, tech-focused
- **Design Style:** Clear, educational, reassuring
- **Base:** Dark mode (bg-neutral-950)
- **Mobile-first:** Must work on 375px viewport

## User Inputs

### RSU Details
| Input | Label | Default | Min | Max | Step |
|-------|-------|---------|-----|-----|------|
| sharesVesting | Shares Vesting | 100 | 1 | 10000 | 1 |
| stockPrice | Stock Price at Vest | 150 | 1 | 5000 | 1 |

### Income & Filing Status
| Input | Label | Default | Options |
|-------|-------|---------|---------|
| filingStatus | Filing Status | single | single, married, head_of_household |
| annualSalary | Annual Base Salary | 200000 | 0 - 1000000 |
| otherIncome | Other Income (bonuses, etc.) | 0 | 0 - 500000 |

### Location
| Input | Label | Default |
|-------|-------|---------|
| state | State | CA |

### Withholding Method
| Input | Label | Default | Options |
|-------|-------|---------|---------|
| withholdingMethod | Withholding Method | sell_to_cover | sell_to_cover, net_settlement, cash |

## Calculation Logic

```typescript
// src/lib/calculators/rsu-tax-calculator/types.ts
export type FilingStatus = 'single' | 'married' | 'head_of_household';
export type WithholdingMethod = 'sell_to_cover' | 'net_settlement' | 'cash';

export interface CalculatorInputs {
  sharesVesting: number;
  stockPrice: number;
  filingStatus: FilingStatus;
  annualSalary: number;
  otherIncome: number;
  state: string;
  withholdingMethod: WithholdingMethod;
}

export interface TaxBreakdown {
  federalIncome: number;
  federalRate: number;
  stateIncome: number;
  stateRate: number;
  socialSecurity: number;
  medicare: number;
  additionalMedicare: number;
  total: number;
  effectiveRate: number;
}

export interface WithholdingBreakdown {
  federalWithheld: number;
  stateWithheld: number;
  ficaWithheld: number;
  totalWithheld: number;
  sharesWithheld: number;
  sharesReceived: number;
}

export interface CalculatorResults {
  // RSU Value
  grossValue: number;

  // What company withholds (often insufficient)
  withholding: WithholdingBreakdown;

  // Actual tax liability
  actualTax: TaxBreakdown;

  // The gap
  withholdingGap: number;
  isUnderwithheld: boolean;

  // What you actually receive
  netValue: number;
  netShares: number;

  // Educational
  effectiveTaxRate: number;
  marginalBracket: number;
  newCostBasis: number;

  // Recommendations
  recommendations: string[];
}
```

```typescript
// src/lib/calculators/rsu-tax-calculator/calculations.ts
import type { CalculatorInputs, CalculatorResults, TaxBreakdown, WithholdingBreakdown } from "./types";

// 2024 Federal Tax Brackets
const FEDERAL_BRACKETS = {
  single: [
    { min: 0, max: 11600, rate: 0.10 },
    { min: 11600, max: 47150, rate: 0.12 },
    { min: 47150, max: 100525, rate: 0.22 },
    { min: 100525, max: 191950, rate: 0.24 },
    { min: 191950, max: 243725, rate: 0.32 },
    { min: 243725, max: 609350, rate: 0.35 },
    { min: 609350, max: Infinity, rate: 0.37 },
  ],
  married: [
    { min: 0, max: 23200, rate: 0.10 },
    { min: 23200, max: 94300, rate: 0.12 },
    { min: 94300, max: 201050, rate: 0.22 },
    { min: 201050, max: 383900, rate: 0.24 },
    { min: 383900, max: 487450, rate: 0.32 },
    { min: 487450, max: 731200, rate: 0.35 },
    { min: 731200, max: Infinity, rate: 0.37 },
  ],
  head_of_household: [
    { min: 0, max: 16550, rate: 0.10 },
    { min: 16550, max: 63100, rate: 0.12 },
    { min: 63100, max: 100500, rate: 0.22 },
    { min: 100500, max: 191950, rate: 0.24 },
    { min: 191950, max: 243700, rate: 0.32 },
    { min: 243700, max: 609350, rate: 0.35 },
    { min: 609350, max: Infinity, rate: 0.37 },
  ],
};

// State tax rates (simplified - top marginal rate)
const STATE_RATES: Record<string, number> = {
  AL: 0.05, AK: 0, AZ: 0.025, AR: 0.047, CA: 0.133,
  CO: 0.044, CT: 0.0699, DE: 0.066, FL: 0, GA: 0.0549,
  HI: 0.11, ID: 0.058, IL: 0.0495, IN: 0.0315, IA: 0.06,
  KS: 0.057, KY: 0.04, LA: 0.0425, ME: 0.0715, MD: 0.0575,
  MA: 0.09, MI: 0.0425, MN: 0.0985, MS: 0.05, MO: 0.048,
  MT: 0.059, NE: 0.0664, NV: 0, NH: 0, NJ: 0.1075,
  NM: 0.059, NY: 0.109, NC: 0.0525, ND: 0.0250, OH: 0.0399,
  OK: 0.0475, OR: 0.099, PA: 0.0307, RI: 0.0599, SC: 0.064,
  SD: 0, TN: 0, TX: 0, UT: 0.0465, VT: 0.0875,
  VA: 0.0575, WA: 0, WV: 0.0512, WI: 0.0765, WY: 0,
  DC: 0.1075,
};

const SS_WAGE_BASE = 168600; // 2024
const SS_RATE = 0.062;
const MEDICARE_RATE = 0.0145;
const ADDITIONAL_MEDICARE_THRESHOLD_SINGLE = 200000;
const ADDITIONAL_MEDICARE_THRESHOLD_MARRIED = 250000;
const ADDITIONAL_MEDICARE_RATE = 0.009;

const SUPPLEMENTAL_WITHHOLDING_RATE = 0.22;
const SUPPLEMENTAL_WITHHOLDING_RATE_OVER_1M = 0.37;

function calculateFederalTax(income: number, filingStatus: string): { tax: number; marginalRate: number } {
  const brackets = FEDERAL_BRACKETS[filingStatus as keyof typeof FEDERAL_BRACKETS];
  let tax = 0;
  let marginalRate = 0;

  for (const bracket of brackets) {
    if (income > bracket.min) {
      const taxableInBracket = Math.min(income, bracket.max) - bracket.min;
      tax += taxableInBracket * bracket.rate;
      marginalRate = bracket.rate;
    }
  }

  return { tax, marginalRate };
}

function calculateMarginalRate(income: number, filingStatus: string): number {
  const brackets = FEDERAL_BRACKETS[filingStatus as keyof typeof FEDERAL_BRACKETS];
  for (const bracket of brackets) {
    if (income >= bracket.min && income < bracket.max) {
      return bracket.rate;
    }
  }
  return 0.37; // Top bracket
}

export function calculate(inputs: CalculatorInputs): CalculatorResults {
  const {
    sharesVesting,
    stockPrice,
    filingStatus,
    annualSalary,
    otherIncome,
    state,
    withholdingMethod,
  } = inputs;

  const grossValue = sharesVesting * stockPrice;
  const totalIncome = annualSalary + otherIncome + grossValue;
  const incomeBeforeRSU = annualSalary + otherIncome;

  // Calculate actual tax liability on RSU income (marginal)
  const taxWithRSU = calculateFederalTax(totalIncome, filingStatus);
  const taxWithoutRSU = calculateFederalTax(incomeBeforeRSU, filingStatus);
  const federalTaxOnRSU = taxWithRSU.tax - taxWithoutRSU.tax;
  const marginalRate = calculateMarginalRate(totalIncome, filingStatus);

  // State tax on RSU
  const stateRate = STATE_RATES[state] || 0;
  const stateTaxOnRSU = grossValue * stateRate;

  // Social Security (if under wage base)
  const ssWagesBeforeRSU = Math.min(incomeBeforeRSU, SS_WAGE_BASE);
  const ssWagesAfterRSU = Math.min(totalIncome, SS_WAGE_BASE);
  const socialSecurityOnRSU = (ssWagesAfterRSU - ssWagesBeforeRSU) * SS_RATE;

  // Medicare
  const medicareOnRSU = grossValue * MEDICARE_RATE;

  // Additional Medicare
  const additionalMedicareThreshold = filingStatus === 'married'
    ? ADDITIONAL_MEDICARE_THRESHOLD_MARRIED
    : ADDITIONAL_MEDICARE_THRESHOLD_SINGLE;

  let additionalMedicareOnRSU = 0;
  if (totalIncome > additionalMedicareThreshold) {
    const additionalMedicareIncome = Math.min(grossValue, totalIncome - additionalMedicareThreshold);
    additionalMedicareOnRSU = Math.max(0, additionalMedicareIncome) * ADDITIONAL_MEDICARE_RATE;
  }

  const actualTax: TaxBreakdown = {
    federalIncome: federalTaxOnRSU,
    federalRate: marginalRate,
    stateIncome: stateTaxOnRSU,
    stateRate: stateRate,
    socialSecurity: socialSecurityOnRSU,
    medicare: medicareOnRSU,
    additionalMedicare: additionalMedicareOnRSU,
    total: federalTaxOnRSU + stateTaxOnRSU + socialSecurityOnRSU + medicareOnRSU + additionalMedicareOnRSU,
    effectiveRate: (federalTaxOnRSU + stateTaxOnRSU + socialSecurityOnRSU + medicareOnRSU + additionalMedicareOnRSU) / grossValue,
  };

  // Calculate what company typically withholds
  const federalWithholdingRate = grossValue > 1000000 ? SUPPLEMENTAL_WITHHOLDING_RATE_OVER_1M : SUPPLEMENTAL_WITHHOLDING_RATE;
  const federalWithheld = grossValue * federalWithholdingRate;
  const stateWithheld = grossValue * stateRate; // Usually accurate
  const ficaWithheld = socialSecurityOnRSU + medicareOnRSU; // Usually accurate
  const totalWithheld = federalWithheld + stateWithheld + ficaWithheld;

  const sharesWithheld = withholdingMethod === 'sell_to_cover'
    ? Math.ceil(totalWithheld / stockPrice)
    : 0;
  const sharesReceived = sharesVesting - sharesWithheld;

  const withholding: WithholdingBreakdown = {
    federalWithheld,
    stateWithheld,
    ficaWithheld,
    totalWithheld,
    sharesWithheld,
    sharesReceived,
  };

  // The gap
  const withholdingGap = actualTax.total - totalWithheld;
  const isUnderwithheld = withholdingGap > 0;

  // Net value
  const netValue = grossValue - actualTax.total;
  const netShares = netValue / stockPrice;

  // Recommendations
  const recommendations: string[] = [];

  if (isUnderwithheld && withholdingGap > 1000) {
    recommendations.push(`Set aside ~$${Math.round(withholdingGap).toLocaleString()} for taxes. Your company's withholding is insufficient.`);
  }

  if (marginalRate >= 0.32) {
    recommendations.push('Consider increasing 401(k) contributions to reduce taxable income.');
  }

  if (stateRate > 0.10) {
    recommendations.push(`You're in a high-tax state (${(stateRate * 100).toFixed(1)}%). This significantly impacts your RSU value.`);
  }

  if (grossValue > 50000) {
    recommendations.push('Consider selling some shares to diversify. Concentration risk is real.');
  }

  recommendations.push(`Your new cost basis is $${stockPrice.toFixed(2)}/share. Future gains above this are capital gains.`);

  return {
    grossValue,
    withholding,
    actualTax,
    withholdingGap,
    isUnderwithheld,
    netValue,
    netShares,
    effectiveTaxRate: actualTax.effectiveRate,
    marginalBracket: marginalRate,
    newCostBasis: stockPrice,
    recommendations,
  };
}
```

## UI Structure

### Layout

1. **Hero Section**
   - Title: "RSU Tax Calculator"
   - Subtitle: "Understand exactly how your RSUs are taxed—no surprises at tax time"

2. **Input Section**
   - RSU details (shares, price)
   - Income & filing status
   - State selector (with visual indicator for high-tax states)
   - Withholding method explanation

3. **Results: The Big Picture**
   - Gross RSU Value: $XX,XXX
   - Total Taxes: $XX,XXX (XX%)
   - **Net Value: $XX,XXX**
   - Visual bar showing gross → taxes → net

4. **The Withholding Gap** (highlighted if underwithheld)
   - What company withholds: $XX,XXX
   - What you actually owe: $XX,XXX
   - **Gap: $XX,XXX** (big red number if positive)
   - "Set aside this amount for tax time"

5. **Tax Breakdown Table**
   | Tax Type | Amount | Rate |
   |----------|--------|------|
   | Federal Income | $X,XXX | XX% |
   | State Income | $X,XXX | XX% |
   | Social Security | $X,XXX | 6.2% |
   | Medicare | $X,XXX | 1.45% |
   | Add'l Medicare | $X,XXX | 0.9% |
   | **Total** | **$X,XXX** | **XX%** |

6. **Shares Breakdown** (for sell-to-cover)
   - Shares vesting: XXX
   - Shares sold for taxes: XX
   - **Shares you receive: XXX**

7. **Recommendations Section**
   - Personalized tips based on situation

8. **Educational Section** (collapsible)
   - "Why is withholding insufficient?"
   - "What is my new cost basis?"
   - "RSU vs Stock Options"

## Files to Create

```
src/
├── app/tools/rsu-tax-calculator/
│   ├── page.tsx
│   └── calculator.tsx
└── lib/calculators/rsu-tax-calculator/
    ├── types.ts
    └── calculations.ts
```

## Registration

Add to `/src/lib/site-config.ts`:

```typescript
{
  id: "rsu-tax-calculator",
  name: "RSU Tax Calculator",
  description: "Understand exactly how your RSUs are taxed at vesting",
  href: "/tools/rsu-tax-calculator",
  categoryId: "equity-compensation",
  status: "live",
  primaryColor: "#6366f1",
  designStyle: "analytical",
  inspiredBy: ["FAANG FIRE", "Secfi"],
  featured: true,
}
```

## Testing Checklist

- [ ] `npm run build` passes
- [ ] `npm run lint` passes
- [ ] Mobile viewport (375px) works
- [ ] High-income CA scenario shows significant withholding gap
- [ ] TX/WA/FL shows $0 state tax
- [ ] Marginal rate correctly identified
- [ ] Social Security caps at wage base
- [ ] Additional Medicare kicks in at threshold
- [ ] Recommendations are personalized

## Git Workflow

```bash
git checkout -b feature/app-rsu-tax-calculator
# ... build the app ...
git add .
git commit -m "Add RSU Tax Calculator"
git push -u origin feature/app-rsu-tax-calculator
```

## Do NOT

- Modify shared components
- Provide tax advice (this is educational)
- Forget the withholding gap highlight (key insight!)
- Ignore state tax differences
- Skip the cost basis explanation
