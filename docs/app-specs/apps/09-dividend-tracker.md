# Dividend Income Tracker

## Overview

**Slug:** `dividend-tracker`
**Category:** investing
**Primary Color:** Green (#22c55e)
**Design Style:** analytical

### One-Line Description
Visualize your dividend income and project when it will cover your monthly expenses.

### Target User
Someone building passive income through dividend investing who wants to visualize their progress and set tangible goals.

### Problem It Solves
Dividend investing is a long game, and progress can feel abstract. This tool makes passive income tangible by showing what your dividends can already cover and projecting future income.

---

## Inspired By

### Influencer Connection
- **Andrei Jikh:** "Coffee money" framing, radical transparency
- **Graham Stephan:** "Invest to pay for things you want"
- See: `/docs/research/influencer-profiles/andrei-jikh.md`

### What Existing Tools Get Wrong
- Focus on portfolio value, not income
- Don't make dividends tangible
- No goal visualization
- Complex interfaces requiring account linking

### Our Differentiated Approach
- Income-first visualization
- "What does it cover?" framing
- Milestone celebrations
- No account linking required

---

## User Inputs

| Input | Label | Type | Default | Min | Max | Step |
|-------|-------|------|---------|-----|-----|------|
| portfolioValue | Current Portfolio Value | slider | 50000 | 0 | 2000000 | 1000 |
| dividendYield | Average Dividend Yield | slider | 3.0 | 0 | 10 | 0.1 |
| monthlyContribution | Monthly Contribution | slider | 500 | 0 | 5000 | 50 |
| dividendGrowthRate | Dividend Growth Rate | slider | 5 | 0 | 15 | 0.5 |
| reinvestDividends | Reinvest Dividends (DRIP) | toggle | true | - | - | - |

---

## Calculations

### Core Formulas

```typescript
// Annual dividend income
annualDividends = portfolioValue * (dividendYield / 100);
monthlyDividends = annualDividends / 12;

// With DRIP, project future growth
// Year N portfolio = Year N-1 × (1 + return) + contributions + dividends reinvested
// Year N dividends = Year N portfolio × yield × (1 + dividendGrowth)^N
```

### TypeScript Implementation

```typescript
// src/lib/calculators/dividend-tracker/types.ts
export interface CalculatorInputs {
  portfolioValue: number;
  dividendYield: number;
  monthlyContribution: number;
  dividendGrowthRate: number;
  reinvestDividends: boolean;
}

export interface ExpenseMilestone {
  name: string;
  monthlyAmount: number;
  yearsToReach: number | null;
  currentlyCovered: boolean;
  percentCovered: number;
}

export interface YearlyProjection {
  year: number;
  portfolioValue: number;
  annualDividends: number;
  monthlyDividends: number;
  cumulativeDividends: number;
}

export interface CalculatorResults {
  current: {
    annualDividends: number;
    monthlyDividends: number;
    dailyDividends: number;
    effectiveHourlyRate: number;  // Dividends / 2080 work hours
  };
  milestones: ExpenseMilestone[];
  projections: YearlyProjection[];
  yearsToGoal: number | null;  // Years to cover a user-set goal
}
```

```typescript
// src/lib/calculators/dividend-tracker/calculations.ts
import type { CalculatorInputs, CalculatorResults, ExpenseMilestone, YearlyProjection } from "./types";

const COMMON_EXPENSES: Array<{ name: string; amount: number }> = [
  { name: "Daily coffee", amount: 150 },
  { name: "Netflix subscription", amount: 15 },
  { name: "Phone bill", amount: 80 },
  { name: "Streaming services", amount: 50 },
  { name: "Gym membership", amount: 50 },
  { name: "Car insurance", amount: 150 },
  { name: "Groceries", amount: 500 },
  { name: "Utilities", amount: 200 },
  { name: "Rent/Mortgage", amount: 2000 },
];

export function calculate(inputs: CalculatorInputs): CalculatorResults {
  const { portfolioValue, dividendYield, monthlyContribution, dividendGrowthRate, reinvestDividends } = inputs;

  const yieldRate = dividendYield / 100;
  const growthRate = dividendGrowthRate / 100;

  // Current dividends
  const annualDividends = portfolioValue * yieldRate;
  const monthlyDividends = annualDividends / 12;
  const dailyDividends = annualDividends / 365;
  const effectiveHourlyRate = annualDividends / 2080;

  // Generate projections
  const projections: YearlyProjection[] = [];
  let currentPortfolio = portfolioValue;
  let currentYield = yieldRate;
  let cumulativeDividends = 0;
  const capitalGrowthRate = 0.05; // Assume 5% capital appreciation

  for (let year = 0; year <= 30; year++) {
    const yearDividends = currentPortfolio * currentYield;
    cumulativeDividends += yearDividends;

    projections.push({
      year,
      portfolioValue: currentPortfolio,
      annualDividends: yearDividends,
      monthlyDividends: yearDividends / 12,
      cumulativeDividends,
    });

    // Next year projections
    const capitalGrowth = currentPortfolio * capitalGrowthRate;
    const contributions = monthlyContribution * 12;
    const reinvestedDividends = reinvestDividends ? yearDividends : 0;

    currentPortfolio = currentPortfolio + capitalGrowth + contributions + reinvestedDividends;
    currentYield = yieldRate * Math.pow(1 + growthRate, year + 1);
  }

  // Calculate milestones
  const milestones: ExpenseMilestone[] = COMMON_EXPENSES.map(expense => {
    const currentlyCovered = monthlyDividends >= expense.amount;
    const percentCovered = Math.min(100, (monthlyDividends / expense.amount) * 100);

    // Find year when covered
    let yearsToReach: number | null = null;
    if (!currentlyCovered) {
      const yearCovered = projections.find(p => p.monthlyDividends >= expense.amount);
      yearsToReach = yearCovered ? yearCovered.year : null;
    } else {
      yearsToReach = 0;
    }

    return {
      name: expense.name,
      monthlyAmount: expense.amount,
      yearsToReach,
      currentlyCovered,
      percentCovered,
    };
  });

  return {
    current: {
      annualDividends,
      monthlyDividends,
      dailyDividends,
      effectiveHourlyRate,
    },
    milestones,
    projections,
    yearsToGoal: null, // Can be calculated if user sets custom goal
  };
}
```

---

## UI Structure

### Sections
1. **Hero:** "Your Dividend Income"
2. **Portfolio Inputs:** Value, yield, contributions, growth, DRIP toggle
3. **Current Income Card:**
   - Monthly dividends (primary)
   - Annual, daily, hourly equivalents
4. **"What It Covers" Section:**
   - Progress bars for common expenses
   - Checkmarks for covered items
5. **Projections Chart:**
   - Dividend income over time
   - Portfolio value growth
6. **Milestone Timeline:**
   - When you'll cover phone, streaming, groceries, rent
7. **Methodology:** DRIP and growth assumptions

### Visual Design
- **Primary color usage:** Green for income/growth
- **Personality:** Motivational, progress-focused
- **Visualizations:**
  - Dividend income chart over time
  - Progress bars for expense coverage
  - Milestone markers

---

## Registration

```typescript
{
  id: "dividend-tracker",
  name: "Dividend Income Tracker",
  description: "Visualize your dividend income and what it covers",
  href: "/tools/dividend-tracker",
  categoryId: "investing",
  status: "live",
  primaryColor: "#22c55e",
  designStyle: "analytical",
  inspiredBy: ["Andrei Jikh"],
  featured: false,
}
```

---

## Agent Prompt

# Agent Prompt: Dividend Income Tracker

## Your Mission
Build the Dividend Income Tracker for ClearMoney. This tool visualizes passive dividend income and shows what it can cover.

## Key Features
1. Portfolio and yield inputs
2. Current income display (monthly, annual, daily, hourly)
3. "What it covers" section with common expenses
4. Growth projections with DRIP
5. Milestone timeline (when you'll cover rent, etc.)

## Key Insight
Make dividends TANGIBLE. "$150/month" means less than "covers your Netflix AND phone bill."

## Files to Create
1. `/src/app/tools/dividend-tracker/page.tsx`
2. `/src/app/tools/dividend-tracker/calculator.tsx`
3. `/src/lib/calculators/dividend-tracker/types.ts`
4. `/src/lib/calculators/dividend-tracker/calculations.ts`

## Branch: `feature/app-dividend-tracker`
