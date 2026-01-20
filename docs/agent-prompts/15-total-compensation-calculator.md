# Agent Prompt: Total Compensation Calculator

## Your Mission

Build the Total Compensation Calculator for ClearMoney. This tool helps tech workers understand their true total compensation by accounting for base salary, bonuses, RSUs with vesting schedules, and other benefits—essential for evaluating job offers and understanding current pay.

## Project Context

**Repository:** You are working in a Next.js 15+ project with React 19, TypeScript, and Tailwind CSS.
**Your app directory:** `/src/app/tools/total-compensation/`
**Your calculator logic:** `/src/lib/calculators/total-compensation/`
**Branch name:** `feature/app-total-compensation`

## Background Research

**The Problem:**
- Tech compensation is complex: base + bonus + RSUs + benefits
- RSU vesting schedules vary wildly (Amazon's backloaded vs standard 25%/year)
- Comparing job offers is nearly impossible without tools
- "Total comp" numbers thrown around often ignore vesting realities

**Common Vesting Schedules:**
- **Standard:** 25% per year over 4 years (Google, Meta, Microsoft)
- **Amazon:** 5% / 15% / 40% / 40% over 4 years (heavily backloaded)
- **Startup 1-year cliff:** 0% year 1, then monthly over remaining 3 years
- **Refresher grants:** Annual grants that stack on top

**Key Insights:**
- Year 1 compensation at Amazon is MUCH lower than "total comp" suggests
- Refresher grants are crucial for long-term comp at big tech
- Stock price changes affect RSU value dramatically
- Benefits (401k match, ESPP) add 5-15% to total comp

**What to Include:**
- Base salary
- Target bonus (and realistic bonus %)
- RSU grants with vesting schedules
- 401(k) match
- ESPP discount value
- Sign-on bonus (amortized)
- Other benefits (HSA contribution, etc.)

## Before You Start

1. Read shared patterns: `cat /docs/app-specs/shared-patterns.md`
2. Review existing calculator: `ls -la /src/app/tools/bilt-calculator/`
3. Check shared components: `cat /src/components/shared/index.ts`

## Design Requirements

- **Primary Color:** Blue (#3b82f6) - professional, trustworthy
- **Design Style:** Clean, comparative, data-forward
- **Base:** Dark mode (bg-neutral-950)
- **Mobile-first:** Must work on 375px viewport

## User Inputs

### Base Compensation
| Input | Label | Default | Min | Max | Step |
|-------|-------|---------|-----|-----|------|
| baseSalary | Base Salary | 180000 | 0 | 1000000 | 5000 |
| targetBonus | Target Bonus % | 15 | 0 | 100 | 5 |
| expectedBonusMultiplier | Expected Bonus Multiplier | 100 | 0 | 200 | 10 |

### RSU Grant
| Input | Label | Default | Min | Max | Step |
|-------|-------|---------|-----|-----|------|
| rsuGrantValue | Total RSU Grant Value | 200000 | 0 | 2000000 | 10000 |
| vestingSchedule | Vesting Schedule | standard | standard, amazon, cliff_monthly |
| vestingYears | Vesting Period (years) | 4 | 1 | 5 | 1 |
| currentStockPrice | Current Stock Price | 150 | 1 | 5000 | 1 |
| grantStockPrice | Grant Stock Price | 150 | 1 | 5000 | 1 |

### Additional Compensation
| Input | Label | Default | Min | Max |
|-------|-------|---------|-----|-----|
| signOnBonus | Sign-On Bonus | 0 | 0 | 500000 |
| signOnVestingYears | Sign-On Amortization Years | 1 | 1 | 4 |
| match401k | 401(k) Match % | 4 | 0 | 10 |
| match401kLimit | 401(k) Match Limit | 11600 | 0 | 50000 |
| esppDiscount | ESPP Discount % | 15 | 0 | 15 |
| esppContribution | Annual ESPP Contribution | 10000 | 0 | 25000 |
| hsaContribution | Employer HSA Contribution | 500 | 0 | 5000 |

### Refresher Grants (Optional)
| Input | Label | Default |
|-------|-------|---------|
| annualRefresher | Expected Annual Refresher | 50000 |
| refresherVestingYears | Refresher Vesting Years | 4 |

## Calculation Logic

```typescript
// src/lib/calculators/total-compensation/types.ts
export type VestingSchedule = 'standard' | 'amazon' | 'cliff_monthly';

export interface RSUGrant {
  totalValue: number;
  vestingSchedule: VestingSchedule;
  vestingYears: number;
  grantPrice: number;
  currentPrice: number;
}

export interface CalculatorInputs {
  baseSalary: number;
  targetBonus: number;
  expectedBonusMultiplier: number;
  rsuGrant: RSUGrant;
  signOnBonus: number;
  signOnVestingYears: number;
  match401k: number;
  match401kLimit: number;
  esppDiscount: number;
  esppContribution: number;
  hsaContribution: number;
  annualRefresher: number;
  refresherVestingYears: number;
}

export interface YearlyBreakdown {
  year: number;
  baseSalary: number;
  bonus: number;
  rsuValue: number;
  signOnPortion: number;
  match401k: number;
  esppBenefit: number;
  hsaContribution: number;
  refresherValue: number;
  totalCompensation: number;
}

export interface CalculatorResults {
  // Summary
  year1Total: number;
  year2Total: number;
  year3Total: number;
  year4Total: number;
  averageAnnual: number;

  // Breakdowns
  yearlyBreakdowns: YearlyBreakdown[];

  // Component totals (4-year)
  totalBase: number;
  totalBonus: number;
  totalRSU: number;
  totalSignOn: number;
  totalBenefits: number;

  // Insights
  rsuPercentOfComp: number;
  year1VsYear4Difference: number;
  effectiveHourlyRate: number;

  // Warnings
  warnings: string[];
}
```

```typescript
// src/lib/calculators/total-compensation/calculations.ts
import type { CalculatorInputs, CalculatorResults, YearlyBreakdown, VestingSchedule } from "./types";

const VESTING_PERCENTAGES: Record<VestingSchedule, number[]> = {
  standard: [25, 25, 25, 25],
  amazon: [5, 15, 40, 40],
  cliff_monthly: [0, 33.33, 33.33, 33.34], // Simplified: 1-year cliff then even
};

function getVestingPercentages(schedule: VestingSchedule, years: number): number[] {
  const base = VESTING_PERCENTAGES[schedule];
  if (years === 4) return base;

  // Adjust for different vesting periods
  if (years < 4) {
    const perYear = 100 / years;
    return Array(years).fill(perYear);
  }

  // For 5 years, spread evenly
  return Array(years).fill(100 / years);
}

export function calculate(inputs: CalculatorInputs): CalculatorResults {
  const {
    baseSalary,
    targetBonus,
    expectedBonusMultiplier,
    rsuGrant,
    signOnBonus,
    signOnVestingYears,
    match401k,
    match401kLimit,
    esppDiscount,
    esppContribution,
    hsaContribution,
    annualRefresher,
    refresherVestingYears,
  } = inputs;

  const vestingPercentages = getVestingPercentages(
    rsuGrant.vestingSchedule,
    rsuGrant.vestingYears
  );

  // Stock price adjustment
  const priceMultiplier = rsuGrant.currentPrice / rsuGrant.grantPrice;
  const adjustedRSUValue = rsuGrant.totalValue * priceMultiplier;

  // Calculate yearly breakdowns
  const yearlyBreakdowns: YearlyBreakdown[] = [];
  const years = Math.max(4, rsuGrant.vestingYears);

  for (let year = 1; year <= years; year++) {
    const yearIndex = year - 1;

    // RSU vesting for this year
    const vestingPercent = yearIndex < vestingPercentages.length
      ? vestingPercentages[yearIndex]
      : 0;
    const rsuValue = (adjustedRSUValue * vestingPercent) / 100;

    // Sign-on bonus amortization
    const signOnPortion = year <= signOnVestingYears
      ? signOnBonus / signOnVestingYears
      : 0;

    // Bonus
    const bonus = baseSalary * (targetBonus / 100) * (expectedBonusMultiplier / 100);

    // 401k match
    const matchAmount = Math.min(baseSalary * (match401k / 100), match401kLimit);

    // ESPP benefit (15% discount = ~17.6% gain if selling immediately)
    const esppBenefit = esppContribution * (esppDiscount / 100) / (1 - esppDiscount / 100);

    // Refresher grants (start vesting in year 2+)
    let refresherValue = 0;
    if (year >= 2 && annualRefresher > 0) {
      // Each year's refresher vests over refresherVestingYears
      // By year 4, you have multiple refreshers vesting
      const refreshersVesting = Math.min(year - 1, refresherVestingYears);
      refresherValue = (annualRefresher / refresherVestingYears) * refreshersVesting;
    }

    const totalCompensation =
      baseSalary +
      bonus +
      rsuValue +
      signOnPortion +
      matchAmount +
      esppBenefit +
      hsaContribution +
      refresherValue;

    yearlyBreakdowns.push({
      year,
      baseSalary,
      bonus,
      rsuValue,
      signOnPortion,
      match401k: matchAmount,
      esppBenefit,
      hsaContribution,
      refresherValue,
      totalCompensation,
    });
  }

  // Calculate totals
  const year1Total = yearlyBreakdowns[0]?.totalCompensation || 0;
  const year2Total = yearlyBreakdowns[1]?.totalCompensation || 0;
  const year3Total = yearlyBreakdowns[2]?.totalCompensation || 0;
  const year4Total = yearlyBreakdowns[3]?.totalCompensation || 0;

  const fourYearTotal = yearlyBreakdowns
    .slice(0, 4)
    .reduce((sum, y) => sum + y.totalCompensation, 0);
  const averageAnnual = fourYearTotal / 4;

  const totalBase = baseSalary * 4;
  const totalBonus = yearlyBreakdowns.slice(0, 4).reduce((sum, y) => sum + y.bonus, 0);
  const totalRSU = yearlyBreakdowns.slice(0, 4).reduce((sum, y) => sum + y.rsuValue, 0);
  const totalSignOn = signOnBonus;
  const totalBenefits = yearlyBreakdowns
    .slice(0, 4)
    .reduce((sum, y) => sum + y.match401k + y.esppBenefit + y.hsaContribution, 0);

  // Insights
  const rsuPercentOfComp = (totalRSU / fourYearTotal) * 100;
  const year1VsYear4Difference = year4Total - year1Total;
  const effectiveHourlyRate = averageAnnual / 2080; // Assuming 2080 work hours/year

  // Warnings
  const warnings: string[] = [];

  if (rsuGrant.vestingSchedule === 'amazon' && rsuGrant.vestingYears === 4) {
    warnings.push(`Amazon-style vesting: Year 1 is only $${Math.round(year1Total).toLocaleString()}, but Year 4 jumps to $${Math.round(year4Total).toLocaleString()}`);
  }

  if (rsuPercentOfComp > 40) {
    warnings.push(`${rsuPercentOfComp.toFixed(0)}% of your comp is in RSUs—significant stock price risk`);
  }

  if (priceMultiplier < 0.8) {
    warnings.push(`Stock is down ${((1 - priceMultiplier) * 100).toFixed(0)}% from grant price—your RSU value is reduced`);
  }

  if (priceMultiplier > 1.5) {
    warnings.push(`Stock is up ${((priceMultiplier - 1) * 100).toFixed(0)}% from grant price—your RSU value increased!`);
  }

  return {
    year1Total,
    year2Total,
    year3Total,
    year4Total,
    averageAnnual,
    yearlyBreakdowns,
    totalBase,
    totalBonus,
    totalRSU,
    totalSignOn,
    totalBenefits,
    rsuPercentOfComp,
    year1VsYear4Difference,
    effectiveHourlyRate,
    warnings,
  };
}
```

## UI Structure

### Layout

1. **Hero Section**
   - Title: "Total Compensation Calculator"
   - Subtitle: "Understand your true pay—base, bonus, RSUs, and everything else"

2. **Input Sections** (tabbed or accordion)
   - **Base Pay:** Salary, bonus, multiplier
   - **Equity:** RSU grant, vesting schedule, stock prices
   - **Sign-On:** Bonus amount, amortization
   - **Benefits:** 401k, ESPP, HSA
   - **Refreshers:** Annual grants (optional)

3. **Results: The Big Picture**
   - Large display: "Average Annual Comp: $XXX,XXX"
   - 4-year total: $X.XM

4. **Year-by-Year Visualization**
   - Bar chart showing Year 1 → Year 4
   - Clearly shows backloaded vesting (Amazon)
   - Hover/tap for breakdown

5. **Compensation Breakdown Table**
   | Component | Year 1 | Year 2 | Year 3 | Year 4 | Total |
   |-----------|--------|--------|--------|--------|-------|
   | Base | $180K | $180K | $180K | $180K | $720K |
   | Bonus | $27K | $27K | $27K | $27K | $108K |
   | RSUs | $10K | $30K | $80K | $80K | $200K |
   | ... | | | | | |

6. **Insights Cards**
   - RSU % of total comp (with risk warning if high)
   - Effective hourly rate
   - Year 1 vs Year 4 difference

7. **Compare Offers** (optional section)
   - Side-by-side comparison mode
   - "Add another offer" button

8. **Warnings Section**
   - Amazon backloading warning
   - Stock concentration risk
   - Price change impact

9. **Methodology Section** (collapsible)
   - How vesting schedules work
   - How we calculate ESPP benefit
   - Refresher grant assumptions

## Files to Create

```
src/
├── app/tools/total-compensation/
│   ├── page.tsx
│   └── calculator.tsx
└── lib/calculators/total-compensation/
    ├── types.ts
    └── calculations.ts
```

## Registration

Add to `/src/lib/site-config.ts`:

```typescript
{
  id: "total-compensation",
  name: "Total Compensation Calculator",
  description: "Understand your true total comp—base, bonus, RSUs, and benefits",
  href: "/tools/total-compensation",
  categoryId: "equity-compensation",
  status: "live",
  primaryColor: "#3b82f6",
  designStyle: "analytical",
  inspiredBy: ["FAANG FIRE", "levels.fyi"],
  featured: true,
}
```

## Testing Checklist

- [ ] `npm run build` passes
- [ ] `npm run lint` passes
- [ ] Mobile viewport (375px) works
- [ ] Standard vesting: 25% each year
- [ ] Amazon vesting: 5/15/40/40 correctly shown
- [ ] Stock price changes affect RSU value
- [ ] Sign-on amortized correctly
- [ ] 401k match capped properly
- [ ] ESPP benefit calculated correctly
- [ ] Refreshers accumulate over years
- [ ] Year-by-year chart renders properly

## Git Workflow

```bash
git checkout -b feature/app-total-compensation
# ... build the app ...
git add .
git commit -m "Add Total Compensation Calculator"
git push -u origin feature/app-total-compensation
```

## Do NOT

- Modify shared components
- Assume all vesting is standard 25%/year
- Ignore stock price changes
- Forget refresher grants (crucial for long-term comp)
- Skip the Amazon backloading warning
