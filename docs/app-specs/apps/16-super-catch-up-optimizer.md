# App Spec: Super Catch-Up Contribution Optimizer (Ages 60-63)

## Overview
- **One-line description:** Maximize the 4-year window for super catch-up 401(k) contributions available only to ages 60-63
- **Target user persona:** Workers aged 57-63 planning their final push to retirement savings
- **Key problem it solves:** Most people don't know about the enhanced catch-up limit for ages 60-63, and it's only a 4-year window

## Inspired By
- SECURE 2.0 Act super catch-up provision
- The urgency of a limited 4-year window
- Retirement planning optimization for late-career savers

## Why This Matters Now
Starting in 2025, SECURE 2.0 introduced:
1. **$11,250 Super Catch-Up** - For ages 60-63 only (vs $8,000 for regular 50+ catch-up)
2. **Total 401(k) Limit: $35,750** - Base $24,500 + $11,250 super catch-up in 2026
3. **Only 4 Years** - Must be age 60, 61, 62, or 63 at end of calendar year
4. **Use It or Lose It** - At 64, drops back to regular catch-up

## Core Features
- [ ] Age-based eligibility calculator with countdown
- [ ] 4-year contribution optimization schedule
- [ ] Compare super catch-up vs regular catch-up value
- [ ] Project retirement balance impact
- [ ] Employer match optimization
- [ ] Roth vs Traditional decision for high earners ($150k+ must use Roth)
- [ ] Cash flow planning for max contributions

## User Inputs

| Input | Type | Default | Min | Max | Step |
|-------|------|---------|-----|-----|------|
| Current Age | number | 58 | 50 | 70 | 1 |
| Birth Date | date | - | - | - | - |
| Current 401(k) Balance | slider | 500000 | 0 | 5000000 | 10000 |
| Annual Salary | slider | 150000 | 0 | 1000000 | 5000 |
| Current Contribution Rate | slider | 15 | 0 | 100 | 1 |
| Employer Match % | slider | 4 | 0 | 10 | 0.5 |
| Employer Match Cap | slider | 6 | 0 | 100 | 1 |
| Expected Return | slider | 7 | 0 | 15 | 0.5 |
| Planned Retirement Age | number | 65 | 55 | 75 | 1 |
| Prior Year W-2 Wages | slider | 150000 | 0 | 1000000 | 5000 |
| Filing Status | select | single | - | - | - |

## Calculation Logic

```typescript
interface SuperCatchUpInputs {
  currentAge: number;
  birthDate: Date;
  currentBalance: number;
  annualSalary: number;
  contributionRate: number;
  employerMatchPercent: number;
  employerMatchCap: number;
  expectedReturn: number;
  retirementAge: number;
  priorYearWages: number;
  filingStatus: "single" | "married" | "head_of_household";
}

interface YearProjection {
  year: number;
  age: number;
  baseLimit: number;
  catchUpLimit: number;
  totalLimit: number;
  yourContribution: number;
  employerMatch: number;
  totalContribution: number;
  yearEndBalance: number;
  isSuperCatchUpYear: boolean;
  mustUseRoth: boolean;
}

interface SuperCatchUpResults {
  eligibility: {
    currentlyEligible: boolean;
    yearsUntilEligible: number;
    superCatchUpYears: number[];
    missedYears: number[];
  };
  fourYearPlan: YearProjection[];
  valueOfSuperCatchUp: {
    extraContributionsOver4Years: number;
    extraGrowthByRetirement: number;
    totalExtraWealth: number;
    monthlyRetirementIncomeIncrease: number;
  };
  comparison: {
    withSuperCatchUp: { balanceAtRetirement: number; monthlyIncome4Percent: number };
    withRegularCatchUp: { balanceAtRetirement: number; monthlyIncome4Percent: number };
    withNoCatchUp: { balanceAtRetirement: number; monthlyIncome4Percent: number };
  };
  rothRequirement: {
    required: boolean;
    reason: string;
    taxImpact: number;
  };
  recommendations: string[];
}

// 2026 Limits
const LIMITS_2026 = {
  base401k: 24500,
  regularCatchUp: 8000,  // Age 50+
  superCatchUp: 11250,   // Age 60-63 only
  totalWithSuperCatchUp: 35750,
  rothCatchUpThreshold: 150000,  // Prior year wages threshold
};

function isEligibleForSuperCatchUp(age: number): boolean {
  return age >= 60 && age <= 63;
}

function getCatchUpLimit(age: number): number {
  if (age < 50) return 0;
  if (age >= 60 && age <= 63) return LIMITS_2026.superCatchUp;
  return LIMITS_2026.regularCatchUp;
}

function mustUseRothForCatchUp(priorYearWages: number): boolean {
  return priorYearWages > LIMITS_2026.rothCatchUpThreshold;
}

function calculateFourYearPlan(inputs: SuperCatchUpInputs): YearProjection[] {
  const projections: YearProjection[] = [];
  let balance = inputs.currentBalance;
  const currentYear = new Date().getFullYear();

  for (let i = 0; i < 10; i++) {
    const year = currentYear + i;
    const age = inputs.currentAge + i;

    if (age > inputs.retirementAge) break;

    const isSuperCatchUpYear = isEligibleForSuperCatchUp(age);
    const catchUpLimit = getCatchUpLimit(age);
    const totalLimit = LIMITS_2026.base401k + catchUpLimit;

    // Calculate contributions
    const salaryContribution = inputs.annualSalary * (inputs.contributionRate / 100);
    const yourContribution = Math.min(salaryContribution, totalLimit);

    // Employer match (on salary contribution, not catch-up)
    const matchableContribution = Math.min(
      inputs.annualSalary * (inputs.employerMatchCap / 100),
      yourContribution
    );
    const employerMatch = matchableContribution * (inputs.employerMatchPercent / 100);

    // Growth
    const totalContribution = yourContribution + employerMatch;
    balance = balance * (1 + inputs.expectedReturn / 100) + totalContribution;

    projections.push({
      year,
      age,
      baseLimit: LIMITS_2026.base401k,
      catchUpLimit,
      totalLimit,
      yourContribution,
      employerMatch,
      totalContribution,
      yearEndBalance: balance,
      isSuperCatchUpYear,
      mustUseRoth: mustUseRothForCatchUp(inputs.priorYearWages),
    });
  }

  return projections;
}

function calculateValueOfSuperCatchUp(inputs: SuperCatchUpInputs): SuperCatchUpResults["valueOfSuperCatchUp"] {
  // Extra contribution per super catch-up year
  const extraPerYear = LIMITS_2026.superCatchUp - LIMITS_2026.regularCatchUp; // $3,250
  const superCatchUpYears = [60, 61, 62, 63].filter(
    age => age >= inputs.currentAge && age <= inputs.retirementAge
  ).length;

  const extraContributions = extraPerYear * superCatchUpYears;

  // Calculate growth of extra contributions
  const avgYearsToGrow = inputs.retirementAge - 61.5; // Midpoint of 60-63
  const extraGrowth = extraContributions * (Math.pow(1 + inputs.expectedReturn / 100, avgYearsToGrow) - 1);

  const totalExtraWealth = extraContributions + extraGrowth;
  const monthlyIncomeIncrease = (totalExtraWealth * 0.04) / 12; // 4% rule

  return {
    extraContributionsOver4Years: extraContributions,
    extraGrowthByRetirement: extraGrowth,
    totalExtraWealth,
    monthlyRetirementIncomeIncrease: monthlyIncomeIncrease,
  };
}
```

## UI Components
- Age eligibility banner with countdown/status
- 4-year contribution calendar visualization
- Contribution limit comparison chart (regular vs super catch-up)
- Balance projection graph showing impact
- Roth requirement alert for high earners
- Cash flow calculator (monthly contribution needed)
- Action checklist by year

## Design Direction
- **Primary Color:** `#f59e0b` (amber - urgency, wealth)
- **Personality:** Urgent, motivating, opportunity-focused
- **Style:** Countdown timers, calendar views, growth charts
- **Visual emphasis:** 4-year window countdown, extra wealth generated

## Agent Prompt

```markdown
# Agent Prompt: Super Catch-Up Contribution Optimizer

## Context
You are building a calculator for ClearMoney that helps workers aged 57-63 understand and maximize the SECURE 2.0 super catch-up contribution window. This is a LIMITED 4-year opportunity (ages 60-63 only).

## Project Location
- Repository: /Users/alexchao/projects/clearmoney
- Your app directory: /src/app/tools/super-catch-up/
- Your calculator logic: /src/lib/calculators/super-catch-up/

## Design Requirements
- Primary Color: #f59e0b (amber)
- Mobile-first, dark mode base
- Urgency-focused design (countdown timers)
- Clear year-by-year planning

## Key Rules (SECURE 2.0)

### Super Catch-Up Limits (2026)
- Base 401(k): $24,500
- Regular catch-up (50+): $8,000
- Super catch-up (60-63): $11,250
- Total max for ages 60-63: $35,750

### Eligibility
- Must be age 60, 61, 62, or 63 at END of calendar year
- At age 64, drops back to regular $8,000 catch-up
- Only 4 years to take advantage!

### Roth Requirement for High Earners
- If prior year W-2 wages > $150,000
- ALL catch-up contributions must be Roth
- Applies starting 2026
- Higher earners = no tax deduction on catch-up

### Key Insight
- Extra $3,250/year over regular catch-up
- Over 4 years = $13,000 extra contributions
- With growth, could mean $20,000+ extra at retirement

## Files to Create
1. `/src/app/tools/super-catch-up/page.tsx`
2. `/src/app/tools/super-catch-up/calculator.tsx`
3. `/src/lib/calculators/super-catch-up/calculations.ts`
4. `/src/lib/calculators/super-catch-up/constants.ts`
5. `/src/lib/calculators/super-catch-up/types.ts`

## Registration
Add to `/src/lib/site-config.ts`:
```typescript
{
  id: "super-catch-up",
  name: "Super Catch-Up Optimizer (Ages 60-63)",
  description: "Maximize your 4-year window for enhanced 401(k) contributions",
  href: "/tools/super-catch-up",
  categoryId: "investing",
  status: "live",
  primaryColor: "#f59e0b",
  designStyle: "analytical",
  inspiredBy: ["SECURE 2.0 Act"],
  featured: true,
}
```

## Testing Checklist
- [ ] Age 60-63 gets super catch-up limit
- [ ] Age 59 and 64 get regular catch-up
- [ ] Roth requirement triggers at $150k+
- [ ] 4-year projection calculates correctly
- [ ] Value comparison shows extra wealth
```

## Sources

### Primary Sources
1. **IRS: 401(k) Limit Increases for 2026**
   https://www.irs.gov/newsroom/401k-limit-increases-to-24500-for-2026-ira-limit-increases-to-7500

2. **Kiplinger: SECURE 2.0 Act Summary**
   https://www.kiplinger.com/retirement/bipartisan-retirement-savings-package-in-massive-budget-bill

3. **Fidelity: SECURE 2.0 Act Guide**
   https://www.fidelity.com/learning-center/personal-finance/secure-act-2

### Secondary Sources
4. **IRS: Roth Catch-Up Rule Final Regulations**
   https://www.irs.gov/newsroom/treasury-irs-issue-final-regulations-on-new-roth-catch-up-rule-other-secure-2point0-act-provisions

5. **Quarles Law: Roth Catch-Up Contributions 2026**
   https://www.quarles.com/newsroom/publications/secure-2-0-act-retirement-plan-update-roth-catch-up-contributions-in-2026

6. **AARP: Retirement Changes 2026**
   https://www.aarp.org/money/retirement/biggest-changes-2026/

7. **Yahoo Finance: What's Changing for Retirement Savers 2026**
   https://finance.yahoo.com/news/whats-changing-for-retirement-savers-and-retirees-in-2026-143051554.html
