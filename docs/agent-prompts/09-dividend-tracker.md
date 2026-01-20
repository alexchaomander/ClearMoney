# Agent Prompt: Dividend Income Tracker

## Your Mission

Build the Dividend Income Tracker for ClearMoney. This tool helps users visualize their dividend income and project when passive income covers their expenses—inspired by Andrei Jikh's transparency about dividend investing.

## Project Context

**Repository:** You are working in a Next.js 15+ project with React 19, TypeScript, and Tailwind CSS.
**Your app directory:** `/src/app/tools/dividend-tracker/`
**Your calculator logic:** `/src/lib/calculators/dividend-tracker/`
**Branch name:** `feature/app-dividend-tracker`

## Background Research

**Dividend Investing Philosophy (Andrei Jikh):**
- Transparency: Shows exact dividend income publicly
- Goal: Passive income to cover living expenses
- Focus: "Dividend snowball" - reinvesting dividends to compound
- Realistic: Takes years/decades to build meaningful income

**Key Metrics:**
- **Dividend Yield:** Annual dividend / Stock price (typically 2-4%)
- **Yield on Cost (YOC):** Annual dividend / Your purchase price (grows over time)
- **DRIP:** Dividend Reinvestment Plan - auto-reinvest dividends
- **Dividend Growth Rate:** How much companies increase dividends annually (typically 5-10%)

**Reality Check:**
- At 3% yield, $1M portfolio = $30,000/year ($2,500/month)
- Need $1.2M for $3,000/month passive income at 3% yield
- This takes most people decades to build

## Before You Start

1. Read shared patterns: `cat /docs/app-specs/shared-patterns.md`
2. Review existing calculator: `ls -la /src/app/tools/bilt-calculator/`
3. Check shared components: `cat /src/components/shared/index.ts`

## Design Requirements

- **Primary Color:** Green (#22c55e) - income, growth, money
- **Design Style:** Motivational, visual, transparent
- **Base:** Dark mode (bg-neutral-950)
- **Mobile-first:** Must work on 375px viewport

## User Inputs

| Input | Label | Default | Min | Max | Step |
|-------|-------|---------|-----|-----|------|
| portfolioValue | Current Portfolio Value | 50000 | 0 | 10000000 | 1000 |
| dividendYield | Average Dividend Yield | 3.0 | 0 | 10 | 0.1 |
| monthlyContribution | Monthly Contribution | 500 | 0 | 10000 | 100 |
| dividendGrowthRate | Dividend Growth Rate | 6 | 0 | 15 | 0.5 |
| reinvestDividends | Reinvest Dividends (DRIP) | true | - | - | - |
| monthlyExpenses | Monthly Expenses | 4000 | 0 | 30000 | 100 |
| yearsToProject | Years to Project | 20 | 1 | 50 | 1 |

## Calculation Logic

```typescript
// src/lib/calculators/dividend-tracker/types.ts
export interface CalculatorInputs {
  portfolioValue: number;
  dividendYield: number;        // percentage
  monthlyContribution: number;
  dividendGrowthRate: number;   // percentage
  reinvestDividends: boolean;
  monthlyExpenses: number;
  yearsToProject: number;
}

export interface YearlyProjection {
  year: number;
  portfolioValue: number;
  annualDividends: number;
  monthlyDividends: number;
  yieldOnCost: number;
  expensesCovered: number;      // percentage of expenses covered
}

export interface CalculatorResults {
  // Current state
  currentAnnualDividends: number;
  currentMonthlyDividends: number;
  currentYieldOnCost: number;
  expensesCoveredNow: number;

  // Projections
  projections: YearlyProjection[];
  yearsToFullCoverage: number | null;  // null if >50 years
  portfolioAtFullCoverage: number | null;

  // Fun metrics
  dailyCoffees: number;         // Monthly dividends / $5
  monthlyDinners: number;       // Monthly dividends / $50
  yearlyVacationBudget: number;

  // Milestones
  milestones: {
    year: number;
    description: string;
  }[];

  recommendation: string;
}
```

```typescript
// src/lib/calculators/dividend-tracker/calculations.ts
import type { CalculatorInputs, CalculatorResults, YearlyProjection } from "./types";

export function calculate(inputs: CalculatorInputs): CalculatorResults {
  const {
    portfolioValue,
    dividendYield,
    monthlyContribution,
    dividendGrowthRate,
    reinvestDividends,
    monthlyExpenses,
    yearsToProject,
  } = inputs;

  const yieldRate = dividendYield / 100;
  const growthRate = dividendGrowthRate / 100;
  const annualContribution = monthlyContribution * 12;
  const annualExpenses = monthlyExpenses * 12;

  // Current state
  const totalContributed = portfolioValue; // Assume all contributed for YOC baseline
  const currentAnnualDividends = portfolioValue * yieldRate;
  const currentMonthlyDividends = currentAnnualDividends / 12;
  const currentYieldOnCost = totalContributed > 0 ? (currentAnnualDividends / totalContributed) * 100 : 0;
  const expensesCoveredNow = annualExpenses > 0 ? (currentAnnualDividends / annualExpenses) * 100 : 0;

  // Generate projections
  const projections: YearlyProjection[] = [];
  let portfolio = portfolioValue;
  let contributed = portfolioValue;
  let currentYield = yieldRate;
  let yearsToFullCoverage: number | null = null;
  let portfolioAtFullCoverage: number | null = null;

  const milestones: { year: number; description: string }[] = [];
  let lastCoverageLevel = 0;

  for (let year = 0; year <= yearsToProject; year++) {
    const annualDividends = portfolio * currentYield;
    const monthlyDividends = annualDividends / 12;
    const yieldOnCost = contributed > 0 ? (annualDividends / contributed) * 100 : 0;
    const expensesCovered = annualExpenses > 0 ? (annualDividends / annualExpenses) * 100 : 0;

    projections.push({
      year,
      portfolioValue: Math.round(portfolio),
      annualDividends: Math.round(annualDividends),
      monthlyDividends: Math.round(monthlyDividends),
      yieldOnCost: Math.round(yieldOnCost * 10) / 10,
      expensesCovered: Math.round(expensesCovered * 10) / 10,
    });

    // Check for milestones
    if (expensesCovered >= 25 && lastCoverageLevel < 25) {
      milestones.push({ year, description: '25% of expenses covered by dividends!' });
    }
    if (expensesCovered >= 50 && lastCoverageLevel < 50) {
      milestones.push({ year, description: '50% of expenses covered - halfway there!' });
    }
    if (expensesCovered >= 75 && lastCoverageLevel < 75) {
      milestones.push({ year, description: '75% of expenses covered!' });
    }
    if (expensesCovered >= 100 && yearsToFullCoverage === null) {
      yearsToFullCoverage = year;
      portfolioAtFullCoverage = portfolio;
      milestones.push({ year, description: '100% - Financial Independence from dividends!' });
    }
    lastCoverageLevel = expensesCovered;

    // Project next year
    if (year < yearsToProject) {
      // Add contributions
      portfolio += annualContribution;
      contributed += annualContribution;

      // Add reinvested dividends (if enabled)
      if (reinvestDividends) {
        portfolio += annualDividends;
      }

      // Assume modest portfolio appreciation (let's say 5% on top of dividends)
      portfolio *= 1.05;

      // Dividend growth (companies increase dividends over time)
      currentYield *= (1 + growthRate);
    }
  }

  // Fun metrics
  const dailyCoffees = Math.floor(currentMonthlyDividends / 5);
  const monthlyDinners = Math.floor(currentMonthlyDividends / 50);
  const yearlyVacationBudget = Math.round(currentAnnualDividends);

  // Recommendation
  let recommendation: string;
  if (expensesCoveredNow >= 100) {
    recommendation = "Congratulations! Your dividends cover your expenses. You've achieved dividend independence!";
  } else if (yearsToFullCoverage !== null && yearsToFullCoverage <= 10) {
    recommendation = `You're on track! At this rate, dividends will cover expenses in ${yearsToFullCoverage} years.`;
  } else if (yearsToFullCoverage !== null) {
    recommendation = `${yearsToFullCoverage} years to full coverage. Consider increasing contributions to speed this up.`;
  } else {
    recommendation = "Building dividend income takes time. Focus on consistent contributions and let compounding work.";
  }

  return {
    currentAnnualDividends: Math.round(currentAnnualDividends),
    currentMonthlyDividends: Math.round(currentMonthlyDividends),
    currentYieldOnCost: Math.round(currentYieldOnCost * 10) / 10,
    expensesCoveredNow: Math.round(expensesCoveredNow * 10) / 10,
    projections,
    yearsToFullCoverage,
    portfolioAtFullCoverage: portfolioAtFullCoverage ? Math.round(portfolioAtFullCoverage) : null,
    dailyCoffees,
    monthlyDinners,
    yearlyVacationBudget,
    milestones,
    recommendation,
  };
}
```

## UI Structure

### Layout

1. **Hero Section**
   - Title: "Dividend Income Tracker"
   - Subtitle: "Watch your passive income grow"
   - Attribution: "Inspired by Andrei Jikh's transparency"

2. **Current State Cards** (grid)
   - Monthly Dividend Income: $XXX
   - Annual Dividend Income: $X,XXX
   - Expenses Covered: XX%
   - Progress bar toward 100%

3. **Input Section**
   - Portfolio value slider
   - Dividend yield slider (with note: "S&P 500 average ~1.5%, dividend stocks 2-4%")
   - Monthly contribution slider
   - DRIP toggle (reinvest dividends)
   - Monthly expenses (for coverage calculation)
   - Advanced: Dividend growth rate

4. **Fun Metrics Section** (playful cards)
   - "Your dividends buy X coffees per month ☕"
   - "Or X nice dinners 🍽️"
   - "That's $X/year for vacation 🏖️"

5. **Projection Chart**
   - Line chart showing dividend growth over time
   - Horizontal line showing expense target
   - Highlight when lines cross (FI point)

6. **Milestones Timeline**
   - Visual timeline showing 25%, 50%, 75%, 100% milestones
   - When each will be reached

7. **Yearly Breakdown Table** (collapsible)
   | Year | Portfolio | Annual Dividends | Monthly | % Covered |
   |------|-----------|------------------|---------|-----------|

8. **Methodology Section** (collapsible)
   - How dividend investing works
   - DRIP explained
   - Yield on Cost concept
   - Reality check: This takes time!

## Files to Create

```
src/
├── app/tools/dividend-tracker/
│   ├── page.tsx
│   └── calculator.tsx
└── lib/calculators/dividend-tracker/
    ├── types.ts
    └── calculations.ts
```

## Registration

Add to `/src/lib/site-config.ts`:

```typescript
{
  id: "dividend-tracker",
  name: "Dividend Income Tracker",
  description: "Visualize your dividend income and project when it covers your expenses",
  href: "/tools/dividend-tracker",
  categoryId: "investing",
  status: "live",
  primaryColor: "#22c55e",
  designStyle: "analytical",
  inspiredBy: ["Andrei Jikh"],
  featured: false,
}
```

## Testing Checklist

- [ ] `npm run build` passes
- [ ] `npm run lint` passes
- [ ] Mobile viewport (375px) works
- [ ] Projection calculations are correct
- [ ] DRIP toggle affects projections
- [ ] Milestones appear at correct years
- [ ] Fun metrics calculate correctly
- [ ] Zero expenses → 100% covered immediately
- [ ] Zero portfolio → $0 dividends

## Git Workflow

```bash
git checkout -b feature/app-dividend-tracker
# ... build the app ...
git add .
git commit -m "Add Dividend Income Tracker"
git push -u origin feature/app-dividend-tracker
```

## Do NOT

- Modify shared components
- Add complex charting libraries (use CSS/SVG)
- Overpromise returns (be realistic!)
- Forget the time reality check
