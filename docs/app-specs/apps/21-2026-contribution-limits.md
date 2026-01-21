# App Spec: 2026 Retirement & Benefits Contribution Limits Dashboard

## Overview
- **One-line description:** A comprehensive, interactive dashboard showing all 2026 contribution limits for retirement accounts, HSAs, FSAs, and education accounts with personalized maximization strategies
- **Target user persona:** HR professionals, financial advisors, employees optimizing benefits, personal finance enthusiasts
- **Key problem it solves:** Contribution limits change every year and are scattered across multiple IRS publications; this consolidates everything with personalized guidance

## Inspired By
- Annual IRS announcement fatigue
- The need for a single source of truth
- Personalized "max out everything" calculators

## Why This Matters Now
2026 brings significant limit increases and new rules:
1. **401(k) Base Limit: $24,500** - Up from $23,500 in 2025
2. **IRA Limit: $7,500** - Up from $7,000 in 2025
3. **HSA Family Limit: $8,750** - Up from $8,550 in 2025
4. **Super Catch-Up: $11,250** - First full year of enhanced catch-up for ages 60-63
5. **Mandatory Roth Catch-Up** - Takes effect for high earners
6. **SIMPLE IRA: $17,600** - Up from $16,500

## Core Features
- [ ] All 2026 limits in one place with year-over-year comparison
- [ ] Age-based limit calculator (catch-up eligibility)
- [ ] Personal "max out everything" calculator
- [ ] Monthly contribution amounts to hit limits
- [ ] Income-based limit adjustments (IRA phase-outs, etc.)
- [ ] Calendar with key dates (HSA deadline, IRA deadline, etc.)
- [ ] Export/print for reference
- [ ] Employer benefit optimization suggestions

## User Inputs

| Input | Type | Default | Min | Max | Step |
|-------|------|---------|-----|-----|------|
| Current Age | number | 35 | 18 | 80 | 1 |
| Filing Status | select | single | - | - | - |
| Annual Income | slider | 100000 | 0 | 1000000 | 5000 |
| Has 401(k)? | boolean | true | - | - | - |
| Has Traditional IRA? | boolean | true | - | - | - |
| Has Roth IRA? | boolean | true | - | - | - |
| Has HSA? | boolean | true | - | - | - |
| HSA Coverage Type | select | family | - | - | - |
| Has FSA? | boolean | false | - | - | - |
| Has SIMPLE IRA? | boolean | false | - | - | - |
| Has 403(b)? | boolean | false | - | - | - |
| Has 457(b)? | boolean | false | - | - | - |
| Has Solo 401(k)? | boolean | false | - | - | - |
| Has SEP IRA? | boolean | false | - | - | - |

## Calculation Logic

```typescript
interface LimitsInputs {
  age: number;
  filingStatus: "single" | "married" | "head_of_household";
  annualIncome: number;
  accounts: {
    has401k: boolean;
    hasTraditionalIRA: boolean;
    hasRothIRA: boolean;
    hasHSA: boolean;
    hsaCoverageType: "self" | "family";
    hasFSA: boolean;
    hasSimpleIRA: boolean;
    has403b: boolean;
    has457b: boolean;
    hasSolo401k: boolean;
    hasSepIRA: boolean;
  };
}

interface ContributionLimit {
  accountType: string;
  baseLimit: number;
  catchUpLimit: number;
  totalLimit: number;
  yourLimit: number;  // Based on age and income
  monthlyToMax: number;
  notes: string[];
  incomePhaseOut?: {
    startPhaseOut: number;
    completePhaseOut: number;
    yourStatus: "full" | "reduced" | "none";
  };
}

interface LimitsResults {
  limits: {
    retirement: ContributionLimit[];
    health: ContributionLimit[];
    education: ContributionLimit[];
  };
  totalMaxContributions: number;
  monthlyToMaxAll: number;
  keyDates: { date: string; description: string }[];
  yearOverYear: {
    accountType: string;
    limit2025: number;
    limit2026: number;
    change: number;
    percentChange: number;
  }[];
  personalizedStrategy: string[];
}

// 2026 Contribution Limits
const LIMITS_2026 = {
  // 401(k), 403(b), most 457 plans
  deferral401k: 24500,
  catchUp50Plus: 8000,
  catchUp60to63: 11250,  // Super catch-up
  total415Limit: 73500,  // Annual additions limit (employee + employer)

  // IRA
  iraLimit: 7500,
  iraCatchUp50Plus: 1100,

  // HSA
  hsaSelf: 4400,
  hsaFamily: 8750,
  hsaCatchUp55Plus: 1000,

  // FSA
  healthFSA: 3350,
  dependentCareFSA: 5000,  // or 2500 if married filing separately
  limitedPurposeFSA: 3350,

  // SIMPLE IRA
  simpleIRA: 17600,
  simpleCatchUp50Plus: 3850,
  simpleCatchUp60to63: 5350,

  // SEP IRA
  sepIRA: 73500,  // or 25% of compensation, whichever is less

  // Solo 401(k)
  solo401kEmployee: 24500,
  solo401kTotal: 73500,

  // Education
  coverdell: 2000,
  // 529: No federal limit, state-specific

  // Other
  aflataxLimit: 3300,  // AfterTax 401k employee limit for mega backdoor
};

// IRA Income Phase-Outs 2026 (estimated based on inflation adjustments)
const IRA_PHASEOUTS_2026 = {
  traditional: {
    single: { start: 83000, end: 93000 },       // Covered by workplace plan
    married: { start: 136000, end: 156000 },    // Covered by workplace plan
    spouseNotCovered: { start: 236000, end: 246000 },
  },
  roth: {
    single: { start: 161000, end: 176000 },
    married: { start: 240000, end: 255000 },
  },
};

function getCatchUpLimit(age: number, accountType: string): number {
  if (age < 50) return 0;

  switch (accountType) {
    case "401k":
    case "403b":
    case "457":
      if (age >= 60 && age <= 63) return LIMITS_2026.catchUp60to63;
      return LIMITS_2026.catchUp50Plus;
    case "IRA":
      return LIMITS_2026.iraCatchUp50Plus;
    case "HSA":
      if (age >= 55) return LIMITS_2026.hsaCatchUp55Plus;
      return 0;
    case "SIMPLE":
      if (age >= 60 && age <= 63) return LIMITS_2026.simpleCatchUp60to63;
      return LIMITS_2026.simpleCatchUp50Plus;
    default:
      return 0;
  }
}

function calculateIRALimit(
  income: number,
  filingStatus: string,
  age: number,
  accountType: "traditional" | "roth",
  coveredByWorkplacePlan: boolean
): ContributionLimit {
  const baseLimit = LIMITS_2026.iraLimit;
  const catchUp = age >= 50 ? LIMITS_2026.iraCatchUp50Plus : 0;
  const fullLimit = baseLimit + catchUp;

  // Get phase-out thresholds
  let phaseOut;
  if (accountType === "roth") {
    phaseOut = IRA_PHASEOUTS_2026.roth[filingStatus as keyof typeof IRA_PHASEOUTS_2026.roth];
  } else {
    if (!coveredByWorkplacePlan) {
      // No phase-out if not covered by workplace plan
      return {
        accountType: "Traditional IRA",
        baseLimit,
        catchUpLimit: catchUp,
        totalLimit: fullLimit,
        yourLimit: fullLimit,
        monthlyToMax: fullLimit / 12,
        notes: ["Full deduction available (not covered by workplace plan)"],
      };
    }
    phaseOut = IRA_PHASEOUTS_2026.traditional[filingStatus as keyof typeof IRA_PHASEOUTS_2026.traditional];
  }

  // Calculate phase-out
  if (income <= phaseOut.start) {
    return {
      accountType: accountType === "roth" ? "Roth IRA" : "Traditional IRA",
      baseLimit,
      catchUpLimit: catchUp,
      totalLimit: fullLimit,
      yourLimit: fullLimit,
      monthlyToMax: fullLimit / 12,
      notes: ["Full contribution allowed"],
      incomePhaseOut: {
        startPhaseOut: phaseOut.start,
        completePhaseOut: phaseOut.end,
        yourStatus: "full",
      },
    };
  } else if (income >= phaseOut.end) {
    return {
      accountType: accountType === "roth" ? "Roth IRA" : "Traditional IRA",
      baseLimit,
      catchUpLimit: catchUp,
      totalLimit: fullLimit,
      yourLimit: 0,
      monthlyToMax: 0,
      notes: accountType === "roth"
        ? ["Income too high for direct Roth contribution", "Consider Backdoor Roth IRA strategy"]
        : ["Contribution not deductible", "Consider non-deductible contribution + conversion"],
      incomePhaseOut: {
        startPhaseOut: phaseOut.start,
        completePhaseOut: phaseOut.end,
        yourStatus: "none",
      },
    };
  } else {
    // Partial phase-out
    const phaseOutRange = phaseOut.end - phaseOut.start;
    const incomeOverStart = income - phaseOut.start;
    const reductionRatio = incomeOverStart / phaseOutRange;
    const reducedLimit = Math.round(fullLimit * (1 - reductionRatio) / 10) * 10; // Round to nearest $10

    return {
      accountType: accountType === "roth" ? "Roth IRA" : "Traditional IRA",
      baseLimit,
      catchUpLimit: catchUp,
      totalLimit: fullLimit,
      yourLimit: reducedLimit,
      monthlyToMax: reducedLimit / 12,
      notes: ["Partial contribution due to income phase-out"],
      incomePhaseOut: {
        startPhaseOut: phaseOut.start,
        completePhaseOut: phaseOut.end,
        yourStatus: "reduced",
      },
    };
  }
}

function getKeyDates(): { date: string; description: string }[] {
  return [
    { date: "January 1, 2026", description: "New contribution limits take effect" },
    { date: "April 15, 2026", description: "Deadline for 2025 IRA contributions" },
    { date: "April 15, 2026", description: "Deadline for 2025 HSA contributions" },
    { date: "October 15, 2026", description: "Extended IRA recharacterization deadline" },
    { date: "December 31, 2026", description: "Deadline for 2026 401(k) contributions" },
    { date: "December 31, 2026", description: "Deadline for 2026 FSA spending (may have grace period)" },
  ];
}
```

## UI Components
- Limits summary cards by category (Retirement, Health, Education)
- Year-over-year comparison table
- Personal "max out" calculator
- Monthly contribution breakdown
- Age-based catch-up eligibility indicators
- Income phase-out visualizers for IRAs
- Key dates calendar
- Downloadable/printable reference sheet

## Design Direction
- **Primary Color:** `#6366f1` (indigo - authoritative, informational)
- **Personality:** Reference-quality, comprehensive, trustworthy
- **Style:** Data tables, cards, clean organization
- **Visual emphasis:** Your limits vs max limits, year-over-year changes

## Agent Prompt

```markdown
# Agent Prompt: 2026 Contribution Limits Dashboard

## Context
You are building a comprehensive contribution limits reference tool for ClearMoney. This should be THE go-to resource for all 2026 retirement and benefits contribution limits.

## Project Location
- Repository: /Users/alexchao/projects/clearmoney
- Your app directory: /src/app/tools/2026-limits/
- Your calculator logic: /src/lib/calculators/2026-limits/

## Design Requirements
- Primary Color: #6366f1 (indigo)
- Mobile-first, dark mode base
- Clean data tables and cards
- Reference-quality design

## All 2026 Limits

### Retirement Plans
| Account | Base Limit | Catch-Up (50+) | Catch-Up (60-63) |
|---------|-----------|----------------|------------------|
| 401(k) | $24,500 | +$8,000 | +$11,250 |
| 403(b) | $24,500 | +$8,000 | +$11,250 |
| 457(b) | $24,500 | +$8,000 | +$11,250 |
| Traditional IRA | $7,500 | +$1,100 | N/A |
| Roth IRA | $7,500 | +$1,100 | N/A |
| SIMPLE IRA | $17,600 | +$3,850 | +$5,350 |
| SEP IRA | $73,500 or 25% comp | N/A | N/A |
| Solo 401(k) Employee | $24,500 | +$8,000 | +$11,250 |
| Total 415(c) Limit | $73,500 | - | - |

### Health Accounts
| Account | Self-Only | Family | Catch-Up (55+) |
|---------|-----------|--------|----------------|
| HSA | $4,400 | $8,750 | +$1,000 |
| Health FSA | $3,350 | - | N/A |
| Dependent Care FSA | - | $5,000 | N/A |

### Education Accounts
| Account | Limit |
|---------|-------|
| Coverdell ESA | $2,000/beneficiary |
| 529 Plan | State-specific (no federal limit) |

### IRA Income Phase-Outs (Single)
| Account | Phase-Out Start | Phase-Out End |
|---------|-----------------|---------------|
| Traditional (covered by plan) | $83,000 | $93,000 |
| Roth | $161,000 | $176,000 |

### IRA Income Phase-Outs (Married Filing Jointly)
| Account | Phase-Out Start | Phase-Out End |
|---------|-----------------|---------------|
| Traditional (covered by plan) | $136,000 | $156,000 |
| Roth | $240,000 | $255,000 |

## New for 2026
- Super catch-up ($11,250) for ages 60-63 in 401k/403b/457/SIMPLE
- Mandatory Roth catch-up for earners >$150k
- Increased base limits across all accounts
- SIMPLE IRA super catch-up ($5,350) for ages 60-63

## Files to Create
1. `/src/app/tools/2026-limits/page.tsx`
2. `/src/app/tools/2026-limits/calculator.tsx`
3. `/src/lib/calculators/2026-limits/constants.ts` (ALL limits here)
4. `/src/lib/calculators/2026-limits/calculations.ts`
5. `/src/lib/calculators/2026-limits/types.ts`

## Registration
Add to `/src/lib/site-config.ts`:
```typescript
{
  id: "2026-limits",
  name: "2026 Contribution Limits",
  description: "All retirement, HSA, and FSA limits for 2026 in one place",
  href: "/tools/2026-limits",
  categoryId: "investing",
  status: "live",
  primaryColor: "#6366f1",
  designStyle: "analytical",
  inspiredBy: ["IRS Publications"],
  featured: true,
}
```

## Testing Checklist
- [ ] All 2026 limits are accurate per IRS
- [ ] Catch-up calculations work for all age groups
- [ ] IRA phase-outs calculate correctly
- [ ] Year-over-year comparison accurate
- [ ] Monthly contribution math is correct
```

## Sources

### Primary Sources
1. **IRS: 401(k) Limit Increases for 2026**
   https://www.irs.gov/newsroom/401k-limit-increases-to-24500-for-2026-ira-limit-increases-to-7500

2. **IRS: HSA Contribution Limits 2026**
   https://www.irs.gov/newsroom/irs-releases-health-savings-account-limits-for-2026

3. **IRS: Publication 590-A (IRA Contributions)**
   https://www.irs.gov/publications/p590a

### Secondary Sources
4. **Fidelity: 2026 Contribution Limits**
   https://www.fidelity.com/learning-center/smart-money/contribution-limits

5. **Vanguard: IRA Contribution Limits**
   https://investor.vanguard.com/ira/ira-contribution-limits

6. **SHRM: 2026 Benefit Plan Limits**
   https://www.shrm.org/topics-tools/news/benefits-compensation/2026-benefit-plan-limits

7. **Charles Schwab: Retirement Plan Limits 2026**
   https://www.schwab.com/learn/story/retirement-plan-contribution-limits

8. **Kiplinger: 2026 Retirement Contribution Limits**
   https://www.kiplinger.com/retirement/retirement-plans/401k-403b-contribution-limits

9. **IRS: SIMPLE IRA Contribution Limits**
   https://www.irs.gov/retirement-plans/simple-ira-contribution-limits
