# Agent Prompt: FIRE Calculator

## Your Mission

Build the FIRE (Financial Independence, Retire Early) Calculator for ClearMoney. This tool helps users calculate when they can reach financial independence based on their savings rate, using the 4% safe withdrawal rule.

## Project Context

**Repository:** You are working in a Next.js 15+ project with React 19, TypeScript, and Tailwind CSS.
**Your app directory:** `/src/app/tools/fire-calculator/`
**Your calculator logic:** `/src/lib/calculators/fire-calculator/`
**Branch name:** `feature/app-fire-calculator`

## Background Research

**The FIRE Movement:**
- Originated from Mr. Money Mustache, popularized in early 2010s
- Core idea: Save aggressively, invest, retire decades early
- Key metric: Savings rate determines years to retirement

**The 4% Rule (Trinity Study):**
- You can withdraw 4% of your portfolio annually with low risk of running out over 30 years
- Therefore, you need 25x your annual expenses to retire
- Example: $40,000/year expenses → need $1,000,000

**The Shockingly Simple Math (MMM):**
| Savings Rate | Years to FI |
|--------------|-------------|
| 10% | 51 years |
| 25% | 32 years |
| 50% | 17 years |
| 75% | 7 years |

**Variants of FIRE:**
- **FIRE:** Standard financial independence
- **Lean FIRE:** Minimal expenses, frugal lifestyle
- **Fat FIRE:** Higher spending, more cushion
- **Coast FIRE:** Save enough that compound growth handles retirement, then work less
- **Barista FIRE:** Part-time work to cover expenses while investments grow

## Before You Start

1. Read shared patterns: `cat /docs/app-specs/shared-patterns.md`
2. Review existing calculator: `ls -la /src/app/tools/bilt-calculator/`
3. Check shared components: `cat /src/components/shared/index.ts`

## Design Requirements

- **Primary Color:** Amber (#f59e0b) - aspirational, warm, hopeful
- **Design Style:** Motivational, visual timeline
- **Base:** Dark mode (bg-neutral-950)
- **Mobile-first:** Must work on 375px viewport

## User Inputs

| Input | Label | Default | Min | Max | Step |
|-------|-------|---------|-----|-----|------|
| annualIncome | Annual Income | 75000 | 0 | 500000 | 1000 |
| annualExpenses | Annual Expenses | 45000 | 0 | 300000 | 1000 |
| currentSavings | Current Investments | 50000 | 0 | 5000000 | 5000 |
| expectedReturn | Expected Return | 7 | 0 | 12 | 0.5 |
| withdrawalRate | Safe Withdrawal Rate | 4 | 3 | 5 | 0.25 |

## Calculation Logic

```typescript
// src/lib/calculators/fire-calculator/types.ts
export interface CalculatorInputs {
  annualIncome: number;
  annualExpenses: number;
  currentSavings: number;
  expectedReturn: number;      // percentage (e.g., 7)
  withdrawalRate: number;      // percentage (e.g., 4)
}

export interface YearlySnapshot {
  year: number;
  age?: number;
  savings: number;
  contribution: number;
  growth: number;
  totalSavings: number;
  progress: number;            // percentage toward FI
}

export interface CalculatorResults {
  // Core metrics
  savingsRate: number;
  annualSavings: number;
  fireNumber: number;          // 25x expenses (or based on withdrawal rate)
  yearsToFI: number;

  // Timeline
  timeline: YearlySnapshot[];

  // FIRE variants
  leanFireNumber: number;      // 20x expenses (frugal)
  fatFireNumber: number;       // 30x expenses (comfortable)
  coastFireNumber: number;     // Amount needed now to coast
  coastFireYears: number;      // Years until coast FI reached

  // Additional insights
  monthsOfRunway: number;      // How long current savings lasts
  percentToFI: number;         // Current progress
  recommendation: string;
}
```

```typescript
// src/lib/calculators/fire-calculator/calculations.ts
import type { CalculatorInputs, CalculatorResults, YearlySnapshot } from "./types";

export function calculate(inputs: CalculatorInputs): CalculatorResults {
  const {
    annualIncome,
    annualExpenses,
    currentSavings,
    expectedReturn,
    withdrawalRate,
  } = inputs;

  const returnRate = expectedReturn / 100;
  const withdrawRate = withdrawalRate / 100;

  // Core calculations
  const annualSavings = annualIncome - annualExpenses;
  const savingsRate = annualIncome > 0 ? (annualSavings / annualIncome) * 100 : 0;

  // FIRE number = expenses / withdrawal rate
  const fireNumber = annualExpenses / withdrawRate;
  const leanFireNumber = annualExpenses * 0.8 / withdrawRate; // 80% of expenses
  const fatFireNumber = annualExpenses * 1.2 / withdrawRate;  // 120% of expenses

  // Years to FI calculation using future value of annuity formula
  // FV = PV(1+r)^n + PMT × ((1+r)^n - 1) / r
  // Solve for n when FV = fireNumber
  const yearsToFI = calculateYearsToFI(currentSavings, annualSavings, returnRate, fireNumber);

  // Generate timeline
  const timeline = generateTimeline(currentSavings, annualSavings, returnRate, fireNumber, Math.ceil(yearsToFI) + 5);

  // Coast FIRE: How much do you need NOW so that it grows to fireNumber with no more contributions?
  // coastFireNumber × (1 + r)^years = fireNumber
  // We need to solve: what's the minimum coastFireNumber such that there exists a year where this is true
  const coastFireYears = 30; // Assume 30 years until traditional retirement
  const coastFireNumber = fireNumber / Math.pow(1 + returnRate, coastFireYears);

  // How many years until we reach coast FIRE?
  const yearsToCoastFI = calculateYearsToFI(currentSavings, annualSavings, returnRate, coastFireNumber);

  // Current progress
  const percentToFI = Math.min(100, (currentSavings / fireNumber) * 100);
  const monthsOfRunway = annualExpenses > 0 ? (currentSavings / annualExpenses) * 12 : Infinity;

  // Recommendation
  let recommendation: string;
  if (savingsRate >= 50) {
    recommendation = `Impressive ${savingsRate.toFixed(0)}% savings rate! You're on the fast track to FI in ${yearsToFI.toFixed(1)} years.`;
  } else if (savingsRate >= 25) {
    recommendation = `Solid ${savingsRate.toFixed(0)}% savings rate. FI in ${yearsToFI.toFixed(1)} years. Can you push it higher?`;
  } else if (savingsRate >= 10) {
    recommendation = `${savingsRate.toFixed(0)}% savings rate puts you on a traditional retirement path. Increasing it could dramatically accelerate your timeline.`;
  } else if (savingsRate > 0) {
    recommendation = `At ${savingsRate.toFixed(0)}% savings rate, focus on increasing income or reducing expenses to make real progress.`;
  } else {
    recommendation = `You're currently spending more than you earn. Focus on closing that gap before thinking about FI.`;
  }

  return {
    savingsRate,
    annualSavings,
    fireNumber,
    yearsToFI,
    timeline,
    leanFireNumber,
    fatFireNumber,
    coastFireNumber,
    coastFireYears: yearsToCoastFI,
    monthsOfRunway,
    percentToFI,
    recommendation,
  };
}

function calculateYearsToFI(
  currentSavings: number,
  annualSavings: number,
  returnRate: number,
  targetAmount: number
): number {
  if (currentSavings >= targetAmount) return 0;
  if (annualSavings <= 0 && currentSavings < targetAmount) return Infinity;

  // Iterative approach for accuracy
  let savings = currentSavings;
  let years = 0;
  const maxYears = 100;

  while (savings < targetAmount && years < maxYears) {
    savings = savings * (1 + returnRate) + annualSavings;
    years++;
  }

  // Interpolate for fractional year
  if (years > 0 && savings >= targetAmount) {
    const prevSavings = (savings - annualSavings) / (1 + returnRate);
    const overshoot = savings - targetAmount;
    const yearGrowth = savings - prevSavings;
    years -= overshoot / yearGrowth;
  }

  return Math.max(0, years);
}

function generateTimeline(
  currentSavings: number,
  annualSavings: number,
  returnRate: number,
  fireNumber: number,
  years: number
): YearlySnapshot[] {
  const timeline: YearlySnapshot[] = [];
  let savings = currentSavings;

  for (let year = 0; year <= years; year++) {
    const growth = year === 0 ? 0 : savings * returnRate;
    const contribution = year === 0 ? 0 : annualSavings;
    const totalSavings = savings + growth + contribution;

    timeline.push({
      year,
      savings: Math.round(savings),
      contribution: Math.round(contribution),
      growth: Math.round(growth),
      totalSavings: Math.round(totalSavings),
      progress: Math.min(100, (totalSavings / fireNumber) * 100),
    });

    savings = totalSavings;
  }

  return timeline;
}
```

## UI Structure

### Layout

1. **Hero Section**
   - Title: "FIRE Calculator"
   - Subtitle: "When can you reach Financial Independence? Let's find out."

2. **Input Section**
   - Income slider
   - Expenses slider
   - Current savings slider
   - Advanced toggle for: expected return, withdrawal rate

3. **Key Metrics Cards** (grid)
   - **Savings Rate:** X% (with color coding: red <10%, yellow 10-25%, green 25-50%, gold >50%)
   - **FIRE Number:** $X (25x expenses)
   - **Years to FI:** X years
   - **Current Progress:** X% (progress bar)

4. **Timeline Visualization**
   - Chart or visual showing savings growth over time
   - Mark the FI point
   - Show year-by-year if expanded

5. **FIRE Variants Section**
   - Lean FIRE: $X (X years)
   - Regular FIRE: $X (X years)
   - Fat FIRE: $X (X years)
   - Coast FIRE: Need $X now, then coast for X years

6. **Savings Rate Impact**
   - "If you increased your savings rate by 10%..."
   - Show how it affects years to FI

7. **Methodology Section** (collapsible)
   - Explain the 4% rule
   - Link to Trinity Study
   - Caveats and assumptions
   - Mr. Money Mustache reference

## Files to Create

```
src/
├── app/tools/fire-calculator/
│   ├── page.tsx
│   └── calculator.tsx
└── lib/calculators/fire-calculator/
    ├── types.ts
    └── calculations.ts
```

## Special UI Components

Create within calculator.tsx:

1. **SavingsRateGauge** - Visual gauge for savings rate
2. **TimelineChart** - Simple bar/line chart for growth (CSS-based, no library)
3. **FireVariantsCard** - Comparison of Lean/Regular/Fat/Coast FIRE

## Registration

Add to `/src/lib/site-config.ts`:

```typescript
{
  id: "fire-calculator",
  name: "FIRE Calculator",
  description: "Calculate when you can reach financial independence based on your savings rate",
  href: "/tools/fire-calculator",
  categoryId: "investing",
  status: "live",
  primaryColor: "#f59e0b",
  designStyle: "analytical",
  inspiredBy: ["Mr. Money Mustache", "FIRE Movement"],
  featured: true,
}
```

## Testing Checklist

- [ ] `npm run build` passes
- [ ] `npm run lint` passes
- [ ] Mobile viewport (375px) works
- [ ] 50% savings rate → ~17 years (verify against MMM math)
- [ ] Already at FIRE number → 0 years
- [ ] Negative savings → Infinity/warning
- [ ] Timeline shows correct progression
- [ ] Coast FIRE calculation is reasonable
- [ ] Edge case: 0 income handled gracefully
- [ ] Edge case: 0 expenses (FI immediately?)

## Test Scenarios

**Standard Example:**
- Income: $100,000
- Expenses: $50,000
- Savings: $50,000/year (50% rate)
- Current: $100,000 invested
- Return: 7%
- Expected: ~14-15 years to FI

**Already FI:**
- Income: $100,000
- Expenses: $40,000
- Current: $1,200,000 (30x expenses)
- Expected: 0 years, already at Fat FIRE

## Git Workflow

```bash
git checkout -b feature/app-fire-calculator
# ... build the app ...
git add .
git commit -m "Add FIRE Calculator"
git push -u origin feature/app-fire-calculator
```

## Do NOT

- Modify shared components
- Add complex charting libraries (use CSS/SVG)
- Make FI seem unrealistic or too easy
- Forget inflation considerations (7% is inflation-adjusted)
- Skip the caveats about 4% rule limitations
