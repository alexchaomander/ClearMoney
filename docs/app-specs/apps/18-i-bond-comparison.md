# App Spec: I Bond vs HYSA vs TIPS Comparison Tool

## Overview
- **One-line description:** Compare I Bonds, high-yield savings accounts, TIPS, and CDs to find the best place for your safe money
- **Target user persona:** Conservative savers looking for inflation protection, emergency fund optimization, or short-term savings
- **Key problem it solves:** Confusion about when I Bonds are better than HYSA, and how to evaluate the 1-year lockup trade-off

## Inspired By
- TIPSWatch analysis
- My Money Blog I Bond coverage
- The need to optimize safe, liquid savings

## Why This Matters Now
Current I Bond environment (2025-2026):
1. **4.03% Composite Rate** - Through April 2026 (0.90% fixed + 3.12% inflation)
2. **$10,000 Annual Limit** - Per Social Security number
3. **Paper I Bonds Ended** - January 1, 2025
4. **HYSA Rates Declining** - Fed rate cuts affecting yields
5. **Inflation Moderating** - Affects future I Bond variable rate

## Core Features
- [ ] Side-by-side comparison of I Bond vs HYSA vs TIPS vs CD
- [ ] After-tax yield comparison (I Bonds exempt from state tax)
- [ ] Liquidity analysis (1-year lockup, 3-month penalty)
- [ ] Optimal allocation calculator
- [ ] Rate forecast scenarios
- [ ] Emergency fund strategy recommendations

## User Inputs

| Input | Type | Default | Min | Max | Step |
|-------|------|---------|-----|-----|------|
| Amount to Invest | slider | 10000 | 1000 | 100000 | 1000 |
| Investment Timeline | slider | 3 | 1 | 10 | 0.5 |
| Current HYSA Rate | slider | 4.5 | 0 | 7 | 0.1 |
| Federal Tax Bracket | select | 22% | - | - | - |
| State Tax Rate | slider | 5 | 0 | 13 | 0.5 |
| Need Full Liquidity? | boolean | false | - | - | - |
| Expected Inflation | slider | 2.5 | 0 | 6 | 0.1 |
| Current I Bond Fixed Rate | number | 0.90 | - | - | - |
| Current I Bond Inflation Rate | number | 3.12 | - | - | - |

## Calculation Logic

```typescript
interface ComparisonInputs {
  amount: number;
  years: number;
  hysaRate: number;
  federalBracket: number;
  stateRate: number;
  needsFullLiquidity: boolean;
  expectedInflation: number;
  iBondFixedRate: number;
  iBondInflationRate: number;
}

interface InvestmentOption {
  name: string;
  nominalRate: number;
  afterTaxRate: number;
  realReturn: number;  // After inflation
  valueAfterYears: number;
  taxPaid: number;
  netValue: number;
  liquidityScore: number;  // 1-10
  pros: string[];
  cons: string[];
}

interface ComparisonResults {
  options: {
    iBond: InvestmentOption;
    hysa: InvestmentOption;
    tips5Year: InvestmentOption;
    treasuryBill: InvestmentOption;
    cd: InvestmentOption;
  };
  bestOption: string;
  recommendation: {
    primary: string;
    allocation: { option: string; percent: number; reason: string }[];
  };
  emergencyFundStrategy: {
    totalNeeded: number;
    inIBonds: number;
    inHYSA: number;
    reasoning: string;
  };
}

// Current rates (would be updated periodically)
const CURRENT_RATES = {
  iBond: {
    fixedRate: 0.009,  // 0.90%
    inflationRate: 0.0312,  // 3.12% (semi-annual)
    compositeRate: 0.0403,  // 4.03%
  },
  tips5Year: {
    realYield: 0.013,  // ~1.3% real yield
  },
  treasuryBill: {
    rate1Year: 0.037,  // ~3.7%
  },
};

const I_BOND_RULES = {
  annualLimit: 10000,
  minHoldingMonths: 12,
  penaltyMonths: 3,  // Forfeit 3 months interest if sold before 5 years
  penaltyExpiresYears: 5,
  stateTaxExempt: true,
  federalTaxDeferred: true,  // Until redemption or maturity
  deflationProtected: true,
};

function calculateIBondReturn(
  amount: number,
  years: number,
  fixedRate: number,
  inflationRate: number,
  federalBracket: number,
  stateRate: number
): InvestmentOption {
  // I Bond composite rate formula
  const compositeRate = fixedRate + (2 * inflationRate) + (fixedRate * inflationRate);

  // Compound semi-annually for the holding period
  const periods = years * 2;
  let value = amount;
  for (let i = 0; i < periods; i++) {
    value *= (1 + compositeRate / 2);
  }

  // Apply 3-month penalty if held less than 5 years
  if (years < 5) {
    const penaltyPeriods = 0.5; // 3 months = 0.5 semi-annual periods
    value = value / Math.pow(1 + compositeRate / 2, penaltyPeriods);
  }

  // Tax: Federal only (exempt from state)
  const gain = value - amount;
  const federalTax = gain * federalBracket;
  const netValue = value - federalTax;

  const effectiveRate = Math.pow(netValue / amount, 1 / years) - 1;

  return {
    name: "I Bonds",
    nominalRate: compositeRate,
    afterTaxRate: effectiveRate,
    realReturn: fixedRate, // The fixed rate IS the real return
    valueAfterYears: value,
    taxPaid: federalTax,
    netValue,
    liquidityScore: years >= 1 ? 6 : 0, // 0 first year, moderate after
    pros: [
      "Inflation protected",
      "State tax exempt",
      "Deflation floor (never lose principal)",
      "Tax-deferred growth",
    ],
    cons: [
      "1-year lockup",
      "3-month penalty if < 5 years",
      "$10,000 annual limit",
      "Rate changes every 6 months",
    ],
  };
}

function calculateHYSAReturn(
  amount: number,
  years: number,
  rate: number,
  federalBracket: number,
  stateRate: number,
  expectedInflation: number
): InvestmentOption {
  // HYSA compounds daily, taxed annually
  let value = amount;
  let totalTax = 0;

  for (let year = 0; year < years; year++) {
    const interest = value * rate;
    const tax = interest * (federalBracket + stateRate);
    totalTax += tax;
    value = value + interest - tax; // Reinvest after-tax
  }

  const effectiveRate = Math.pow(value / amount, 1 / years) - 1;
  const realReturn = effectiveRate - expectedInflation;

  return {
    name: "High-Yield Savings",
    nominalRate: rate,
    afterTaxRate: effectiveRate,
    realReturn,
    valueAfterYears: value + totalTax, // Pre-tax value
    taxPaid: totalTax,
    netValue: value,
    liquidityScore: 10, // Fully liquid
    pros: [
      "Fully liquid anytime",
      "FDIC insured",
      "No purchase limits",
      "Simple, no complexity",
    ],
    cons: [
      "Taxed at federal AND state rates",
      "Rates can drop quickly",
      "No inflation protection",
      "Interest taxed annually",
    ],
  };
}

function calculateOptimalAllocation(inputs: ComparisonInputs): ComparisonResults["recommendation"] {
  const { amount, years, needsFullLiquidity } = inputs;

  if (needsFullLiquidity) {
    return {
      primary: "HYSA",
      allocation: [{ option: "HYSA", percent: 100, reason: "You need full liquidity" }],
    };
  }

  if (years < 1) {
    return {
      primary: "HYSA",
      allocation: [{ option: "HYSA", percent: 100, reason: "I Bonds require 1-year minimum hold" }],
    };
  }

  // For longer horizons with no liquidity needs
  const iBondAllocation = Math.min(amount, 10000); // Max $10k
  const remainingInHYSA = amount - iBondAllocation;

  return {
    primary: "Split",
    allocation: [
      { option: "I Bonds", percent: (iBondAllocation / amount) * 100, reason: "Best after-tax, inflation-protected yield" },
      { option: "HYSA", percent: (remainingInHYSA / amount) * 100, reason: "Liquidity for amounts above I Bond limit" },
    ],
  };
}
```

## UI Components
- Investment amount and timeline inputs
- Rate input section (current HYSA, expected inflation)
- Side-by-side comparison cards for each option
- After-tax yield bar chart
- Liquidity comparison matrix
- Optimal allocation pie chart
- Recommendation card with reasoning

## Design Direction
- **Primary Color:** `#0ea5e9` (sky blue - safe, stable)
- **Personality:** Calm, analytical, trustworthy
- **Style:** Clean comparisons, simple charts
- **Visual emphasis:** After-tax returns, liquidity trade-offs

## Agent Prompt

```markdown
# Agent Prompt: I Bond Comparison Tool

## Context
You are building a savings comparison tool for ClearMoney that helps users decide between I Bonds, HYSA, TIPS, and CDs for their safe money.

## Project Location
- Repository: /Users/alexchao/projects/clearmoney
- Your app directory: /src/app/tools/i-bond-comparison/
- Your calculator logic: /src/lib/calculators/i-bond-comparison/

## Design Requirements
- Primary Color: #0ea5e9 (sky blue)
- Mobile-first, dark mode base
- Clean comparison layout
- Clear trade-off visualization

## Key I Bond Rules

### Current Rates (Nov 2025 - Apr 2026)
- Fixed rate: 0.90%
- Inflation rate: 3.12%
- Composite rate: 4.03%

### Purchase Rules
- $10,000 annual limit per SSN
- Paper I Bonds discontinued Jan 1, 2025
- Buy only at TreasuryDirect.gov

### Holding Rules
- MUST hold minimum 12 months
- Forfeit 3 months interest if sold before 5 years
- After 5 years: fully liquid, no penalty

### Tax Treatment
- Exempt from state/local tax
- Federal tax deferred until redemption
- Can be tax-free if used for education

### Inflation Protection
- Rate adjusts every 6 months based on CPI
- Cannot go below 0 (deflation protection)

## Files to Create
1. `/src/app/tools/i-bond-comparison/page.tsx`
2. `/src/app/tools/i-bond-comparison/calculator.tsx`
3. `/src/lib/calculators/i-bond-comparison/calculations.ts`
4. `/src/lib/calculators/i-bond-comparison/constants.ts`
5. `/src/lib/calculators/i-bond-comparison/types.ts`

## Registration
Add to `/src/lib/site-config.ts`:
```typescript
{
  id: "i-bond-comparison",
  name: "I Bond vs HYSA Comparison",
  description: "Compare I Bonds, high-yield savings, TIPS, and CDs for your safe money",
  href: "/tools/i-bond-comparison",
  categoryId: "banking",
  status: "live",
  primaryColor: "#0ea5e9",
  designStyle: "analytical",
  inspiredBy: ["TIPSWatch", "My Money Blog"],
  featured: true,
}
```

## Testing Checklist
- [ ] I Bond composite rate calculates correctly
- [ ] 3-month penalty applies for < 5 year holds
- [ ] State tax exemption factored in
- [ ] HYSA after-tax return includes state tax
- [ ] Allocation respects $10k I Bond limit
```

## Sources

### Primary Sources
1. **TreasuryDirect: I Bonds**
   https://www.treasurydirect.gov/savings-bonds/i-bonds/

2. **TreasuryDirect: I Bonds Interest Rates**
   https://www.treasurydirect.gov/savings-bonds/i-bonds/i-bonds-interest-rates/

3. **CNBC: I Bond Rate Through April 2026**
   https://www.cnbc.com/2025/10/31/treasury-i-bond-rate-through-april-2026.html

### Secondary Sources
4. **TIPSWatch: Tracking Inflation and I Bonds**
   https://tipswatch.com/tracking-inflation-and-i-bonds/

5. **TIPSWatch: Treasury Sets I Bond Fixed Rate**
   https://tipswatch.com/2025/10/31/treasury-sets-i-bond-fixed-rate-at-0-9-composite-rate-of-4-03/

6. **My Money Blog: I Bonds November 2025**
   https://www.mymoneyblog.com/savings-i-bonds-october-2025-interest-rate.html

7. **District Capital: I Bonds 2025 Guide**
   https://districtcapitalmanagement.com/i-bonds/

8. **TIPSWatch: Q&A on I Bonds**
   https://tipswatch.com/qa-on-i-bonds/
