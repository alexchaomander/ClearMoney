# App Spec: One Big Beautiful Bill Tax Optimizer

## Overview
- **One-line description:** Calculate your tax savings from the new OBBB deductions (senior, tips, overtime, car loan interest, SALT)
- **Target user persona:** US taxpayers filing 2025-2028 taxes, especially seniors 65+, service workers, hourly workers with overtime, and high-SALT-state residents
- **Key problem it solves:** Most taxpayers don't know about the new temporary deductions from the One Big Beautiful Bill Act signed July 4, 2025

## Inspired By
- The One Big Beautiful Bill Act (H.R. 1) signed into law July 4, 2025
- TurboTax's "what's new this year" features
- The need for education on temporary tax provisions (2025-2028 only)

## Why This Matters Now
The OBBB introduced several NEW deductions that expire after 2028:
1. **Senior Deduction ($6,000)** - Additional deduction for those 65+, phases out at $75k/$150k MAGI
2. **Tips Deduction ($25,000 max)** - For workers in tipped occupations
3. **Overtime Deduction ($12,500/$25,000 max)** - Deduct pay exceeding regular rate
4. **Car Loan Interest ($10,000 max)** - Deduct interest on personal vehicle loans
5. **SALT Cap Increase ($40,000)** - Quadrupled from $10,000 for 2025-2028

## Core Features
- [ ] Input wizard to identify which deductions apply to you
- [ ] Calculate total tax savings from each applicable deduction
- [ ] Show phase-out calculations for income-limited deductions
- [ ] Compare standard deduction vs itemizing with new SALT cap
- [ ] Timeline showing these are temporary (2025-2028)
- [ ] Personalized action items (e.g., "keep car loan records")

## User Inputs

| Input | Type | Default | Min | Max | Step |
|-------|------|---------|-----|-----|------|
| Filing Status | select | single | - | - | - |
| Age | number | 40 | 18 | 100 | 1 |
| Spouse Age (if MFJ) | number | 40 | 18 | 100 | 1 |
| Modified AGI | slider | 75000 | 0 | 500000 | 1000 |
| Annual Tips Received | slider | 0 | 0 | 100000 | 500 |
| Annual Overtime Pay | slider | 0 | 0 | 100000 | 500 |
| Car Loan Interest Paid | slider | 0 | 0 | 15000 | 100 |
| State/Local Taxes Paid | slider | 10000 | 0 | 100000 | 500 |
| Other Itemized Deductions | slider | 0 | 0 | 50000 | 500 |
| Marginal Tax Bracket | select | 22% | - | - | - |

## Calculation Logic

```typescript
interface OBBBInputs {
  filingStatus: "single" | "married" | "head_of_household";
  age: number;
  spouseAge?: number;
  modifiedAGI: number;
  annualTips: number;
  annualOvertime: number;
  carLoanInterest: number;
  saltPaid: number;
  otherItemized: number;
  marginalRate: number;
}

interface OBBBResults {
  seniorDeduction: {
    eligible: boolean;
    amount: number;
    phaseOutApplied: number;
    taxSavings: number;
  };
  tipsDeduction: {
    eligible: boolean;
    amount: number;
    taxSavings: number;
  };
  overtimeDeduction: {
    eligible: boolean;
    amount: number;
    phaseOutApplied: number;
    taxSavings: number;
  };
  carLoanDeduction: {
    eligible: boolean;
    amount: number;
    phaseOutApplied: number;
    taxSavings: number;
  };
  saltBenefit: {
    oldCap: number;
    newCap: number;
    additionalDeduction: number;
    taxSavings: number;
  };
  totalNewDeductions: number;
  totalTaxSavings: number;
  standardVsItemized: {
    standardDeduction: number;
    itemizedWithNewSALT: number;
    recommendation: string;
  };
}

// Constants from OBBB Act
const SENIOR_DEDUCTION_AMOUNT = 6000;
const SENIOR_DEDUCTION_PHASEOUT_START = { single: 75000, married: 150000, head_of_household: 112500 };
const SENIOR_DEDUCTION_PHASEOUT_RANGE = 15000;

const TIPS_DEDUCTION_MAX = 25000;

const OVERTIME_DEDUCTION_MAX = { single: 12500, married: 25000, head_of_household: 12500 };
const OVERTIME_PHASEOUT_START = { single: 150000, married: 300000, head_of_household: 225000 };
const OVERTIME_PHASEOUT_RANGE = 25000;

const CAR_LOAN_DEDUCTION_MAX = 10000;
const CAR_LOAN_PHASEOUT_START = { single: 100000, married: 200000, head_of_household: 150000 };
const CAR_LOAN_PHASEOUT_RANGE = 25000;

const OLD_SALT_CAP = 10000;
const NEW_SALT_CAP = 40000;

const STANDARD_DEDUCTION_2025 = { single: 15000, married: 30000, head_of_household: 22500 };

function calculatePhaseOut(amount: number, magi: number, threshold: number, range: number): number {
  if (magi <= threshold) return amount;
  if (magi >= threshold + range) return 0;
  const reduction = ((magi - threshold) / range) * amount;
  return Math.max(0, amount - reduction);
}

function calculate(inputs: OBBBInputs): OBBBResults {
  const { filingStatus, age, spouseAge, modifiedAGI, annualTips, annualOvertime, carLoanInterest, saltPaid, otherItemized, marginalRate } = inputs;

  // Senior Deduction (65+)
  const seniorEligibleCount = (age >= 65 ? 1 : 0) + (spouseAge && spouseAge >= 65 ? 1 : 0);
  const seniorBaseAmount = seniorEligibleCount * SENIOR_DEDUCTION_AMOUNT;
  const seniorDeduction = calculatePhaseOut(
    seniorBaseAmount,
    modifiedAGI,
    SENIOR_DEDUCTION_PHASEOUT_START[filingStatus],
    SENIOR_DEDUCTION_PHASEOUT_RANGE
  );

  // Tips Deduction
  const tipsDeduction = Math.min(annualTips, TIPS_DEDUCTION_MAX);

  // Overtime Deduction
  const overtimeBase = Math.min(annualOvertime, OVERTIME_DEDUCTION_MAX[filingStatus]);
  const overtimeDeduction = calculatePhaseOut(
    overtimeBase,
    modifiedAGI,
    OVERTIME_PHASEOUT_START[filingStatus],
    OVERTIME_PHASEOUT_RANGE
  );

  // Car Loan Interest Deduction
  const carLoanBase = Math.min(carLoanInterest, CAR_LOAN_DEDUCTION_MAX);
  const carLoanDeduction = calculatePhaseOut(
    carLoanBase,
    modifiedAGI,
    CAR_LOAN_PHASEOUT_START[filingStatus],
    CAR_LOAN_PHASEOUT_RANGE
  );

  // SALT Benefit
  const saltUnderOldCap = Math.min(saltPaid, OLD_SALT_CAP);
  const saltUnderNewCap = Math.min(saltPaid, NEW_SALT_CAP);
  const additionalSALT = saltUnderNewCap - saltUnderOldCap;

  // Standard vs Itemized
  const standardDeduction = STANDARD_DEDUCTION_2025[filingStatus];
  const itemizedWithNewSALT = saltUnderNewCap + otherItemized;

  // Total new deductions (these are above-the-line or additional)
  const totalNewDeductions = seniorDeduction + tipsDeduction + overtimeDeduction + carLoanDeduction;
  const totalTaxSavings = (totalNewDeductions + (itemizedWithNewSALT > standardDeduction ? additionalSALT : 0)) * marginalRate;

  return {
    seniorDeduction: {
      eligible: seniorEligibleCount > 0,
      amount: seniorDeduction,
      phaseOutApplied: seniorBaseAmount - seniorDeduction,
      taxSavings: seniorDeduction * marginalRate,
    },
    tipsDeduction: {
      eligible: annualTips > 0,
      amount: tipsDeduction,
      taxSavings: tipsDeduction * marginalRate,
    },
    overtimeDeduction: {
      eligible: annualOvertime > 0,
      amount: overtimeDeduction,
      phaseOutApplied: overtimeBase - overtimeDeduction,
      taxSavings: overtimeDeduction * marginalRate,
    },
    carLoanDeduction: {
      eligible: carLoanInterest > 0,
      amount: carLoanDeduction,
      phaseOutApplied: carLoanBase - carLoanDeduction,
      taxSavings: carLoanDeduction * marginalRate,
    },
    saltBenefit: {
      oldCap: saltUnderOldCap,
      newCap: saltUnderNewCap,
      additionalDeduction: additionalSALT,
      taxSavings: additionalSALT * marginalRate,
    },
    totalNewDeductions,
    totalTaxSavings,
    standardVsItemized: {
      standardDeduction,
      itemizedWithNewSALT,
      recommendation: itemizedWithNewSALT > standardDeduction ? "Itemize" : "Standard Deduction",
    },
  };
}
```

## UI Components
- Filing status and age selection (top)
- Income section with MAGI slider
- Deduction inputs organized by category (senior, work-related, vehicle, SALT)
- Results cards showing each deduction amount and tax savings
- Prominent "Total Tax Savings" display
- Timeline graphic showing 2025-2028 availability
- Recommendations section with action items

## Design Direction
- **Primary Color:** `#10b981` (green - money saved)
- **Personality:** Informative, helpful, celebratory when showing savings
- **Style:** Clean cards for each deduction type, progress indicators for phase-outs
- **Visual emphasis:** Large total savings number, countdown to 2028 expiration

## Agent Prompt

```markdown
# Agent Prompt: One Big Beautiful Bill Tax Optimizer

## Context
You are building a tax calculator for ClearMoney that helps users understand and calculate their tax savings from the new One Big Beautiful Bill Act deductions signed into law July 4, 2025. These are TEMPORARY deductions (2025-2028 only).

## Project Location
- Repository: /Users/alexchao/projects/clearmoney
- Your app directory: /src/app/tools/obbb-tax-optimizer/
- Your calculator logic: /src/lib/calculators/obbb-tax-optimizer/

## Design Requirements
- Primary Color: #10b981 (green)
- Mobile-first, dark mode base (bg-neutral-950)
- Celebratory feel when showing savings
- Clear indication these are temporary deductions

## Key Tax Rules (From OBBB Act - July 2025)

### Senior Deduction
- $6,000 per person age 65+
- Phase-out starts at $75,000 (single) / $150,000 (MFJ)
- Phase-out range: $15,000
- Available 2025-2028

### Tips Deduction
- Deduct qualified tips up to $25,000
- Must be in occupation that customarily receives tips
- Cash or charged tips from customers
- Available 2025-2028

### Overtime Pay Deduction
- Deduct pay exceeding regular rate
- Max $12,500 (single) / $25,000 (MFJ)
- Phase-out starts at $150,000 (single) / $300,000 (MFJ)
- Available 2025-2028

### Car Loan Interest Deduction
- Deduct interest on personal vehicle loans (not leases)
- Max $10,000
- Phase-out starts at $100,000 (single) / $200,000 (MFJ)
- Available 2025-2028

### SALT Cap Increase
- Old cap: $10,000
- New cap: $40,000 (2025-2028)
- Increases by 1% annually through 2029
- Returns to $10,000 permanently after

## User Inputs
1. Filing status (single, married, head of household)
2. Age (and spouse age if MFJ)
3. Modified AGI
4. Annual tips received
5. Annual overtime pay
6. Car loan interest paid
7. State/local taxes paid
8. Other itemized deductions
9. Marginal tax bracket

## Output
- Eligibility and amount for each deduction
- Phase-out calculations where applicable
- Total tax savings in dollars
- Standard vs itemized recommendation
- Action items to maximize benefits

## Files to Create
1. `/src/app/tools/obbb-tax-optimizer/page.tsx`
2. `/src/app/tools/obbb-tax-optimizer/calculator.tsx`
3. `/src/lib/calculators/obbb-tax-optimizer/calculations.ts`
4. `/src/lib/calculators/obbb-tax-optimizer/constants.ts`
5. `/src/lib/calculators/obbb-tax-optimizer/types.ts`

## Registration
Add to `/src/lib/site-config.ts`:
```typescript
{
  id: "obbb-tax-optimizer",
  name: "OBBB Tax Savings Calculator",
  description: "Calculate your tax savings from the new 2025 deductions (senior, tips, overtime, car loan, SALT)",
  href: "/tools/obbb-tax-optimizer",
  categoryId: "taxes",
  status: "live",
  primaryColor: "#10b981",
  designStyle: "analytical",
  inspiredBy: ["One Big Beautiful Bill Act 2025"],
  featured: true,
}
```

## Testing Checklist
- [ ] Senior deduction calculates correctly at various ages
- [ ] Phase-outs work correctly at income thresholds
- [ ] MFJ handles two seniors ($12,000 max)
- [ ] SALT comparison shows old vs new cap benefit
- [ ] Mobile responsive
- [ ] Edge cases: zero income, max income, no eligible deductions
```

## Sources

### Primary Sources
1. **IRS: One Big Beautiful Bill Provisions**
   https://www.irs.gov/newsroom/one-big-beautiful-bill-provisions

2. **IRS: Tax Deductions for Working Americans and Seniors**
   https://www.irs.gov/newsroom/one-big-beautiful-bill-act-tax-deductions-for-working-americans-and-seniors

3. **IRS: 2026 Tax Inflation Adjustments (OBBB amendments)**
   https://www.irs.gov/newsroom/irs-releases-tax-inflation-adjustments-for-tax-year-2026-including-amendments-from-the-one-big-beautiful-bill

### Secondary Sources
4. **TurboTax: OBBB Tax Law Changes**
   https://turbotax.intuit.com/tax-tips/general/taxes-2021-7-upcoming-tax-law-changes/L3xFucBvV

5. **H&R Block: One Big Beautiful Bill Tax Changes**
   https://www.hrblock.com/tax-center/irs/tax-law-and-policy/one-big-beautiful-bill-taxes/

6. **CNBC: New $6,000 Senior Deduction**
   https://www.cnbc.com/2026/01/18/big-beautiful-bill-senior-deduction.html

7. **AARP: 2026 Tax Changes**
   https://www.aarp.org/money/taxes/2026-tax-changes/
