# App Spec: Roth Catch-Up Requirement Planner (High Earners)

## Overview
- **One-line description:** Navigate the new mandatory Roth catch-up rule for employees earning $150k+ and plan your retirement contributions accordingly
- **Target user persona:** High-earning employees (>$150k W-2 wages) aged 50+, HR professionals, financial planners
- **Key problem it solves:** Starting 2026, catch-up contributions for high earners MUST be Roth - no more tax-deferred option; this changes retirement planning significantly

## Inspired By
- SECURE 2.0 Act Section 603
- IRS final regulations TD 10029 (August 2025)
- The significant tax planning implications for high earners

## Why This Matters Now
Starting January 1, 2026, SECURE 2.0 mandates:
1. **$150,000 Threshold** - Based on PRIOR YEAR W-2 wages from current employer
2. **Mandatory Roth** - ALL catch-up contributions must be Roth (no traditional option)
3. **Age 50+ Catch-Up** - $8,000 in 2026 (or $11,250 for ages 60-63)
4. **Employer Plan Requirement** - Plan must offer Roth option or lose catch-up entirely
5. **Transition Relief Extended** - IRS extended transition period through 2025

## Core Features
- [ ] Determine if you're subject to mandatory Roth catch-up
- [ ] Calculate tax impact: Roth now vs Traditional deferred
- [ ] Project long-term Roth vs Traditional outcomes
- [ ] Compare super catch-up (60-63) impact when forced Roth
- [ ] Employer plan readiness checker
- [ ] Multi-year tax planning strategies
- [ ] Break-even analysis for Roth conversion

## User Inputs

| Input | Type | Default | Min | Max | Step |
|-------|------|---------|-----|-----|------|
| Prior Year W-2 Wages | slider | 175000 | 0 | 1000000 | 5000 |
| Current Age | number | 55 | 50 | 70 | 1 |
| Current 401(k) Balance | slider | 500000 | 0 | 5000000 | 10000 |
| Current Marginal Tax Rate | select | 32% | - | - | - |
| Expected Retirement Tax Rate | select | 24% | - | - | - |
| Years Until Retirement | slider | 10 | 1 | 25 | 1 |
| Expected Return | slider | 7 | 0 | 15 | 0.5 |
| State Tax Rate | slider | 5 | 0 | 13 | 0.5 |
| Does Employer Offer Roth 401k? | boolean | true | - | - | - |
| Filing Status | select | single | - | - | - |

## Calculation Logic

```typescript
interface RothCatchUpInputs {
  priorYearW2Wages: number;
  currentAge: number;
  currentBalance: number;
  currentMarginalRate: number;
  retirementTaxRate: number;
  yearsUntilRetirement: number;
  expectedReturn: number;
  stateTaxRate: number;
  employerOffersRoth: boolean;
  filingStatus: "single" | "married" | "head_of_household";
}

interface RothCatchUpResults {
  subjectToMandatoryRoth: boolean;
  catchUpAmount: number;
  isSuperCatchUp: boolean;
  taxImpact: {
    rothCatchUpTaxCost: number;  // Tax paid NOW on catch-up
    traditionalTaxSavings: number;  // Tax you would have saved
    netImmediateCost: number;
  };
  longTermComparison: {
    rothPath: {
      totalContributions: number;
      taxPaidUpfront: number;
      projectedValue: number;
      taxAtWithdrawal: number;
      netRetirementValue: number;
    };
    traditionalPath: {
      totalContributions: number;
      taxSavingsNow: number;
      projectedValue: number;
      taxAtWithdrawal: number;
      netRetirementValue: number;
    };
    rothAdvantage: number;
  };
  breakEvenAnalysis: {
    breakEvenTaxRate: number;
    breakEvenYears: number;
    explanation: string;
  };
  planReadiness: {
    employerReady: boolean;
    canMakeCatchUp: boolean;
    alternativeStrategies: string[];
  };
  recommendations: string[];
}

// 2026 Limits
const LIMITS_2026 = {
  catchUpThreshold: 150000,  // Prior year W-2 wages
  regularCatchUp: 8000,      // Age 50+
  superCatchUp: 11250,       // Age 60-63
  base401k: 24500,
};

function isSubjectToMandatoryRoth(priorYearW2Wages: number): boolean {
  return priorYearW2Wages > LIMITS_2026.catchUpThreshold;
}

function getCatchUpAmount(age: number): { amount: number; isSuperCatchUp: boolean } {
  if (age < 50) return { amount: 0, isSuperCatchUp: false };
  if (age >= 60 && age <= 63) {
    return { amount: LIMITS_2026.superCatchUp, isSuperCatchUp: true };
  }
  return { amount: LIMITS_2026.regularCatchUp, isSuperCatchUp: false };
}

function calculateTaxImpact(
  catchUpAmount: number,
  currentMarginalRate: number,
  stateTaxRate: number
): RothCatchUpResults["taxImpact"] {
  const totalCurrentRate = currentMarginalRate + stateTaxRate;

  // With Roth: You pay tax now on the catch-up amount
  const rothCatchUpTaxCost = catchUpAmount * totalCurrentRate;

  // With Traditional: You would have saved this in taxes
  const traditionalTaxSavings = catchUpAmount * totalCurrentRate;

  return {
    rothCatchUpTaxCost,
    traditionalTaxSavings,
    netImmediateCost: rothCatchUpTaxCost, // Same as savings lost
  };
}

function compareLongTerm(
  inputs: RothCatchUpInputs,
  catchUpAmount: number
): RothCatchUpResults["longTermComparison"] {
  const { yearsUntilRetirement, expectedReturn, currentMarginalRate,
          retirementTaxRate, stateTaxRate } = inputs;

  const totalCurrentRate = currentMarginalRate + stateTaxRate;
  const totalRetirementRate = retirementTaxRate + stateTaxRate;
  const yearsOfCatchUp = Math.min(yearsUntilRetirement, 15); // Max years contributing

  // Roth Path: Pay tax now, grow tax-free
  const rothContributions = catchUpAmount * yearsOfCatchUp;
  const rothTaxPaid = rothContributions * totalCurrentRate;

  // Calculate Roth future value (compound each year's contribution)
  let rothFV = 0;
  for (let y = 0; y < yearsOfCatchUp; y++) {
    const yearsToGrow = yearsUntilRetirement - y;
    rothFV += catchUpAmount * Math.pow(1 + expectedReturn / 100, yearsToGrow);
  }

  // Traditional Path: Tax savings now, pay tax later
  const tradContributions = catchUpAmount * yearsOfCatchUp;
  const tradTaxSavings = tradContributions * totalCurrentRate;

  // Calculate Traditional future value
  let tradFV = 0;
  for (let y = 0; y < yearsOfCatchUp; y++) {
    const yearsToGrow = yearsUntilRetirement - y;
    tradFV += catchUpAmount * Math.pow(1 + expectedReturn / 100, yearsToGrow);
  }
  const tradTaxAtWithdrawal = tradFV * totalRetirementRate;

  return {
    rothPath: {
      totalContributions: rothContributions,
      taxPaidUpfront: rothTaxPaid,
      projectedValue: rothFV,
      taxAtWithdrawal: 0,
      netRetirementValue: rothFV,
    },
    traditionalPath: {
      totalContributions: tradContributions,
      taxSavingsNow: tradTaxSavings,
      projectedValue: tradFV,
      taxAtWithdrawal: tradTaxAtWithdrawal,
      netRetirementValue: tradFV - tradTaxAtWithdrawal,
    },
    rothAdvantage: rothFV - (tradFV - tradTaxAtWithdrawal),
  };
}

function calculateBreakEven(
  currentRate: number,
  yearsUntilRetirement: number,
  expectedReturn: number
): RothCatchUpResults["breakEvenAnalysis"] {
  // Break-even retirement rate where Roth = Traditional
  // Roth wins if retirement rate > current rate (simplified)
  // More complex: factor in growth and time value

  const growthFactor = Math.pow(1 + expectedReturn / 100, yearsUntilRetirement);
  const breakEvenRate = currentRate; // Simplified - in reality slightly different

  return {
    breakEvenTaxRate: breakEvenRate,
    breakEvenYears: yearsUntilRetirement,
    explanation: currentRate > 0.30
      ? "With your high current tax rate, Roth may not be optimal. But you have no choice if over $150k."
      : "Roth could benefit you if your retirement tax rate ends up higher than expected.",
  };
}
```

## UI Components
- Mandatory Roth eligibility banner (clear yes/no based on $150k)
- Prior year income input with threshold indicator
- Tax impact comparison (now vs retirement)
- Side-by-side Roth vs Traditional projection
- Super catch-up indicator for ages 60-63
- Employer plan readiness checker
- Break-even visualization
- Multi-year contribution schedule

## Design Direction
- **Primary Color:** `#ec4899` (pink - stands out, attention-grabbing)
- **Personality:** Clear, direct, action-oriented
- **Style:** Comparison tables, threshold indicators, clear warnings
- **Visual emphasis:** $150k threshold line, tax impact comparison

## Agent Prompt

```markdown
# Agent Prompt: Roth Catch-Up Requirement Planner

## Context
You are building a calculator for ClearMoney that helps high-earning employees (>$150k) understand and plan for the new mandatory Roth catch-up rule starting in 2026.

## Project Location
- Repository: /Users/alexchao/projects/clearmoney
- Your app directory: /src/app/tools/roth-catch-up/
- Your calculator logic: /src/lib/calculators/roth-catch-up/

## Design Requirements
- Primary Color: #ec4899 (pink)
- Mobile-first, dark mode base
- Clear threshold visualization
- Comparison-focused layout

## Key Rules (SECURE 2.0 Section 603)

### The $150,000 Rule
- Based on PRIOR YEAR W-2 wages from SAME employer
- Not total income, not AGI - specifically W-2 wages
- If over $150k, ALL catch-up contributions MUST be Roth
- No option to make traditional catch-up contributions

### Catch-Up Amounts (2026)
- Regular catch-up (age 50+): $8,000
- Super catch-up (age 60-63): $11,250
- All of this must be Roth if over threshold

### Employer Requirements
- Plan MUST offer Roth option for catch-up
- If plan doesn't offer Roth: NO catch-up allowed at all
- This is a plan compliance issue, not employee choice

### Key Dates
- Effective: January 1, 2026
- Based on: 2025 W-2 wages (prior year)
- Extended transition relief through 2025

### Impact Scenarios
1. **Under $150k**: Choice remains - Traditional or Roth catch-up
2. **Over $150k, employer has Roth**: Must use Roth for catch-up
3. **Over $150k, no Roth option**: Cannot make catch-up at all
4. **Just over $150k**: Consider strategies to stay under

## Files to Create
1. `/src/app/tools/roth-catch-up/page.tsx`
2. `/src/app/tools/roth-catch-up/calculator.tsx`
3. `/src/lib/calculators/roth-catch-up/calculations.ts`
4. `/src/lib/calculators/roth-catch-up/constants.ts`
5. `/src/lib/calculators/roth-catch-up/types.ts`

## Registration
Add to `/src/lib/site-config.ts`:
```typescript
{
  id: "roth-catch-up",
  name: "Roth Catch-Up Planner",
  description: "Navigate the mandatory Roth catch-up rule for high earners ($150k+)",
  href: "/tools/roth-catch-up",
  categoryId: "investing",
  status: "live",
  primaryColor: "#ec4899",
  designStyle: "analytical",
  inspiredBy: ["SECURE 2.0 Act"],
  featured: true,
}
```

## Testing Checklist
- [ ] $150k threshold works correctly (based on prior year)
- [ ] Super catch-up applies for ages 60-63
- [ ] Tax calculations include state tax
- [ ] Roth vs Traditional comparison accurate
- [ ] Employer readiness logic correct
```

## Sources

### Primary Sources
1. **IRS: Treasury Issues Final Regulations on Roth Catch-Up Rule**
   https://www.irs.gov/newsroom/treasury-irs-issue-final-regulations-on-new-roth-catch-up-rule-other-secure-2point0-act-provisions

2. **IRS: SECURE 2.0 Guidance TD 10029**
   https://www.irs.gov/pub/irs-drop/td-10029.pdf

3. **SHRM: Mandatory Roth Catch-Up Takes Effect 2026**
   https://www.shrm.org/topics-tools/news/benefits-compensation/mandatory-roth-catch-contributions-2026

### Secondary Sources
4. **Quarles Law: Roth Catch-Up Contributions 2026**
   https://www.quarles.com/newsroom/publications/secure-2-0-act-retirement-plan-update-roth-catch-up-contributions-in-2026

5. **Fidelity: SECURE 2.0 Act Updates**
   https://www.fidelity.com/learning-center/personal-finance/secure-act-2

6. **Investopedia: Roth Catch-Up Rules SECURE 2.0**
   https://www.investopedia.com/roth-catch-up-contributions-secure-2-0-7504451

7. **AARP: Retirement Changes 2026**
   https://www.aarp.org/money/retirement/biggest-changes-2026/

8. **PLANSPONSOR: IRS Finalizes SECURE 2.0 Roth Catch-Up Rules**
   https://www.plansponsor.com/irs-finalizes-secure-2-0-roth-catch-up-rules/
