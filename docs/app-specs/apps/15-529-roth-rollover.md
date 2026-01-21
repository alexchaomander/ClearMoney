# App Spec: 529-to-Roth IRA Rollover Planner

## Overview
- **One-line description:** Plan your 529-to-Roth IRA rollover strategy to maximize tax-free retirement savings
- **Target user persona:** Parents with leftover 529 funds, young adults who were 529 beneficiaries, financial planners
- **Key problem it solves:** Complex rules around the new SECURE 2.0 529-to-Roth rollover provision with 15-year, 5-year, and annual limits

## Inspired By
- SECURE 2.0 Act Section 126 (effective January 1, 2024)
- Kitces' deep dive on 529-to-Roth rollovers
- The unique opportunity to convert education savings to retirement savings tax-free

## Why This Matters Now
Starting January 1, 2024, SECURE 2.0 allows:
1. **$35,000 Lifetime Rollover** - Tax-free transfer from 529 to beneficiary's Roth IRA
2. **15-Year Account Requirement** - 529 must be open for 15+ years
3. **5-Year Contribution Seasoning** - Can only roll contributions made 5+ years ago
4. **Annual Limit = IRA Limit** - Max $7,500/year in 2026
5. **No Income Phase-Out** - Works even if income exceeds Roth limits!

## Core Features
- [ ] Eligibility checker (15-year rule, 5-year rule)
- [ ] Multi-year rollover schedule optimizer
- [ ] Calculate tax-free growth benefit over time
- [ ] Compare to other 529 exit strategies (qualified expenses, withdrawal with penalty)
- [ ] Handle beneficiary change scenarios
- [ ] Track progress toward $35,000 lifetime limit

## User Inputs

| Input | Type | Default | Min | Max | Step |
|-------|------|---------|-----|-----|------|
| 529 Account Balance | slider | 50000 | 0 | 500000 | 1000 |
| Account Open Date | date | - | - | - | - |
| Beneficiary Age | number | 22 | 0 | 65 | 1 |
| Beneficiary's Earned Income | slider | 40000 | 0 | 200000 | 1000 |
| Other IRA Contributions This Year | slider | 0 | 0 | 7500 | 100 |
| Contributions Made 5+ Years Ago | slider | 30000 | 0 | 500000 | 1000 |
| Prior 529-to-Roth Rollovers | slider | 0 | 0 | 35000 | 500 |
| Expected Investment Return | slider | 7 | 0 | 15 | 0.5 |
| Years Until Retirement | number | 40 | 5 | 50 | 1 |

## Calculation Logic

```typescript
interface RolloverInputs {
  accountBalance: number;
  accountOpenDate: Date;
  beneficiaryAge: number;
  earnedIncome: number;
  otherIRAContributions: number;
  contributionsMade5YearsAgo: number;
  priorRollovers: number;
  expectedReturn: number;
  yearsUntilRetirement: number;
}

interface RolloverResults {
  eligibility: {
    meetsAccountAgeRequirement: boolean;
    accountAgeYears: number;
    yearsUntilEligible: number;
    hasSeasonedContributions: boolean;
    seasonedAmount: number;
    hasEarnedIncome: boolean;
  };
  currentYearMax: {
    annualIRALimit: number;
    reducedByOtherContributions: number;
    limitedByEarnedIncome: number;
    limitedBySeasonedContributions: number;
    limitedByLifetimeRemaining: number;
    maxRolloverThisYear: number;
  };
  rolloverSchedule: {
    year: number;
    amount: number;
    cumulativeRolled: number;
    remainingLifetimeLimit: number;
  }[];
  projectedBenefit: {
    totalRolled: number;
    yearsOfGrowth: number;
    projectedValue: number;
    taxFreeGrowth: number;
  };
  alternativeComparison: {
    rolloverStrategy: { netValue: number; taxPaid: number };
    nonQualifiedWithdrawal: { netValue: number; taxPaid: number; penalty: number };
    keepFor529Expenses: { value: number; notes: string };
  };
}

// 2026 Limits
const IRA_CONTRIBUTION_LIMIT_2026 = 7500;
const IRA_CATCHUP_CONTRIBUTION_2026 = 1100; // Age 50+
const LIFETIME_529_TO_ROTH_LIMIT = 35000;
const ACCOUNT_AGE_REQUIREMENT_YEARS = 15;
const CONTRIBUTION_SEASONING_YEARS = 5;

function checkEligibility(inputs: RolloverInputs): RolloverResults["eligibility"] {
  const today = new Date();
  const accountAgeMs = today.getTime() - inputs.accountOpenDate.getTime();
  const accountAgeYears = accountAgeMs / (365.25 * 24 * 60 * 60 * 1000);

  const meetsAccountAgeRequirement = accountAgeYears >= ACCOUNT_AGE_REQUIREMENT_YEARS;
  const yearsUntilEligible = meetsAccountAgeRequirement
    ? 0
    : Math.ceil(ACCOUNT_AGE_REQUIREMENT_YEARS - accountAgeYears);

  return {
    meetsAccountAgeRequirement,
    accountAgeYears: Math.floor(accountAgeYears),
    yearsUntilEligible,
    hasSeasonedContributions: inputs.contributionsMade5YearsAgo > 0,
    seasonedAmount: inputs.contributionsMade5YearsAgo,
    hasEarnedIncome: inputs.earnedIncome > 0,
  };
}

function calculateMaxRollover(inputs: RolloverInputs): RolloverResults["currentYearMax"] {
  const annualLimit = inputs.beneficiaryAge >= 50
    ? IRA_CONTRIBUTION_LIMIT_2026 + IRA_CATCHUP_CONTRIBUTION_2026
    : IRA_CONTRIBUTION_LIMIT_2026;

  const reducedByOtherContributions = Math.max(0, annualLimit - inputs.otherIRAContributions);
  const limitedByEarnedIncome = Math.min(reducedByOtherContributions, inputs.earnedIncome);
  const limitedBySeasonedContributions = Math.min(limitedByEarnedIncome, inputs.contributionsMade5YearsAgo);
  const lifetimeRemaining = LIFETIME_529_TO_ROTH_LIMIT - inputs.priorRollovers;
  const limitedByLifetimeRemaining = Math.min(limitedBySeasonedContributions, lifetimeRemaining);

  return {
    annualIRALimit: annualLimit,
    reducedByOtherContributions,
    limitedByEarnedIncome,
    limitedBySeasonedContributions,
    limitedByLifetimeRemaining,
    maxRolloverThisYear: limitedByLifetimeRemaining,
  };
}

function generateRolloverSchedule(
  inputs: RolloverInputs,
  maxThisYear: number
): RolloverResults["rolloverSchedule"] {
  const schedule = [];
  let cumulativeRolled = inputs.priorRollovers;
  let remainingSeasonedFunds = inputs.contributionsMade5YearsAgo;
  const annualLimit = inputs.beneficiaryAge >= 50
    ? IRA_CONTRIBUTION_LIMIT_2026 + IRA_CATCHUP_CONTRIBUTION_2026
    : IRA_CONTRIBUTION_LIMIT_2026;

  const currentYear = new Date().getFullYear();

  for (let i = 0; i < 10 && cumulativeRolled < LIFETIME_529_TO_ROTH_LIMIT; i++) {
    const yearLimit = Math.min(
      annualLimit,
      remainingSeasonedFunds,
      LIFETIME_529_TO_ROTH_LIMIT - cumulativeRolled
    );

    if (yearLimit <= 0) break;

    schedule.push({
      year: currentYear + i,
      amount: yearLimit,
      cumulativeRolled: cumulativeRolled + yearLimit,
      remainingLifetimeLimit: LIFETIME_529_TO_ROTH_LIMIT - (cumulativeRolled + yearLimit),
    });

    cumulativeRolled += yearLimit;
    remainingSeasonedFunds -= yearLimit;
    // Note: This assumes more contributions become seasoned each year
    remainingSeasonedFunds += annualLimit; // Simplified
  }

  return schedule;
}

function projectGrowth(
  totalRolled: number,
  yearsOfGrowth: number,
  expectedReturn: number
): RolloverResults["projectedBenefit"] {
  const projectedValue = totalRolled * Math.pow(1 + expectedReturn / 100, yearsOfGrowth);
  const taxFreeGrowth = projectedValue - totalRolled;

  return {
    totalRolled,
    yearsOfGrowth,
    projectedValue,
    taxFreeGrowth,
  };
}
```

## UI Components
- Eligibility status card with clear pass/fail indicators
- Account age calculator with countdown to eligibility
- Contribution seasoning tracker
- Multi-year rollover schedule table
- Growth projection chart showing tax-free compounding
- Comparison cards: rollover vs withdrawal vs keep in 529
- Action checklist for executing rollover

## Design Direction
- **Primary Color:** `#8b5cf6` (purple - wealth building)
- **Personality:** Strategic, forward-looking, opportunity-focused
- **Style:** Timeline visualizations, progress trackers, growth charts
- **Visual emphasis:** $35,000 lifetime limit progress, compound growth projection

## Agent Prompt

```markdown
# Agent Prompt: 529-to-Roth IRA Rollover Planner

## Context
You are building a calculator for ClearMoney that helps users plan their 529-to-Roth IRA rollovers under the new SECURE 2.0 provision. This is a unique opportunity to convert education savings to retirement savings tax-free.

## Project Location
- Repository: /Users/alexchao/projects/clearmoney
- Your app directory: /src/app/tools/529-roth-rollover/
- Your calculator logic: /src/lib/calculators/529-roth-rollover/

## Design Requirements
- Primary Color: #8b5cf6 (purple)
- Mobile-first, dark mode base
- Progress trackers for limits
- Growth projection charts

## Key Rules (SECURE 2.0 Section 126)

### Eligibility Requirements
1. 529 account must be open for at least 15 years
2. Only contributions made 5+ years ago can be rolled
3. Beneficiary must have earned income
4. Roth IRA must be in beneficiary's name

### Limits
- Annual: IRA contribution limit ($7,500 in 2026)
- Reduced by other IRA contributions that year
- Cannot exceed earned income
- Lifetime: $35,000 per beneficiary

### Special Benefits
- NO income phase-out (works for high earners!)
- Tax-free transfer
- Tax-free growth in Roth forever

### Unclear Areas (Awaiting IRS Guidance)
- Does beneficiary change reset 15-year clock?
- Conservative approach: Don't change beneficiary within 15 years

## Files to Create
1. `/src/app/tools/529-roth-rollover/page.tsx`
2. `/src/app/tools/529-roth-rollover/calculator.tsx`
3. `/src/lib/calculators/529-roth-rollover/calculations.ts`
4. `/src/lib/calculators/529-roth-rollover/constants.ts`
5. `/src/lib/calculators/529-roth-rollover/types.ts`

## Registration
Add to `/src/lib/site-config.ts`:
```typescript
{
  id: "529-roth-rollover",
  name: "529-to-Roth Rollover Planner",
  description: "Plan your tax-free 529 to Roth IRA rollover strategy",
  href: "/tools/529-roth-rollover",
  categoryId: "investing",
  status: "live",
  primaryColor: "#8b5cf6",
  designStyle: "analytical",
  inspiredBy: ["SECURE 2.0 Act", "Kitces"],
  featured: true,
}
```

## Testing Checklist
- [ ] 15-year eligibility calculation correct
- [ ] 5-year contribution seasoning tracked
- [ ] Annual limits respect IRA contribution limits
- [ ] Lifetime $35,000 limit enforced
- [ ] Growth projections compound correctly
- [ ] Edge case: no earned income shows ineligible
```

## Sources

### Primary Sources
1. **Fidelity: Understanding 529 Rollovers to Roth IRA**
   https://www.fidelity.com/learning-center/personal-finance/529-rollover-to-roth

2. **Kitces: SECURE 2.0 529-to-Roth Rollover Rules**
   https://www.kitces.com/blog/529-to-roth-ira-rollover-retirement-saving-education-planning-secure-2-0-backdoor-roth/

3. **Saving for College: 529 to Roth IRA Guide**
   https://www.savingforcollege.com/article/roll-over-529-plan-funds-to-a-roth-ira

### Secondary Sources
4. **Landsberg Bennett: 529 to Roth Rules**
   https://landsbergbennett.com/blogs/insights/529-to-roth-ira-rollover-rules-limits-and-how-it-works-under-secure-2-0

5. **Washington 529: SECURE 2.0 and Your 529**
   https://529.wa.gov/blog/secure-20-and-your-529-account

6. **Invesco: Roth IRA Rollover Potential**
   https://www.invesco.com/us/en/solutions/collegebound529/insights/roth-ira-rollover-potential.html

7. **Saving for College: 529 Plan Rule Changes 2026**
   https://www.savingforcollege.com/article/529-plan-new-rules-changes
