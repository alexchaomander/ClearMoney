# FIRE Calculator

## Overview

**Slug:** `fire-calculator`
**Category:** investing
**Primary Color:** Amber (#f59e0b)
**Design Style:** analytical

### One-Line Description
Calculate when you can reach financial independence based on your savings rate and spending.

### Target User
Someone interested in early retirement (FIRE) who wants to understand how savings rate affects their timeline to financial independence.

### Problem It Solves
Most FIRE calculators are too complex or too simple. This provides the "shockingly simple math" from Mr. Money Mustache in a clean, visual format.

---

## Inspired By

### Influencer Connection
- **Mr. Money Mustache:** "The Shockingly Simple Math Behind Early Retirement"
- **Big ERN:** Safe withdrawal rate research
- See: `/docs/research/influencer-profiles/fire-movement.md`

### What Existing Tools Get Wrong
- Too many inputs (analysis paralysis)
- No visualization of savings rate impact
- Don't show Coast FIRE or Lean/Fat variations
- Outdated designs

### Our Differentiated Approach
- Simple inputs, powerful outputs
- Savings rate as primary driver
- Visual timeline with milestones
- Coast FIRE as a secondary view

---

## User Inputs

| Input | Label | Type | Default | Min | Max | Step |
|-------|-------|------|---------|-----|-----|------|
| annualIncome | Annual Income | slider | 75000 | 20000 | 500000 | 5000 |
| annualSpending | Annual Spending | slider | 45000 | 10000 | 300000 | 2500 |
| currentSavings | Current Investments | slider | 50000 | 0 | 2000000 | 10000 |
| expectedReturn | Expected Return | slider | 7 | 3 | 12 | 0.5 |
| withdrawalRate | Withdrawal Rate | slider | 4 | 3 | 5 | 0.25 |

### Calculated (from inputs)
- **Savings Rate:** (income - spending) / income
- **FIRE Number:** spending × (100 / withdrawalRate)
- **Annual Savings:** income - spending

---

## Calculations

### Core FIRE Math

**FIRE Number:** How much you need to retire
```
fireNumber = annualSpending × 25  // at 4% withdrawal rate
fireNumber = annualSpending × (100 / withdrawalRate)  // general
```

**Years to FIRE:**
```
// Solving for n in compound interest formula
// FV = PV(1+r)^n + PMT × ((1+r)^n - 1) / r

Using iterative approach or logarithmic solution
```

**Savings Rate Table (MMM):**
| Rate | Years |
|------|-------|
| 10% | 51 |
| 20% | 37 |
| 30% | 28 |
| 40% | 22 |
| 50% | 17 |
| 60% | 12.5 |
| 70% | 8.5 |
| 80% | 5.5 |

### TypeScript Implementation

```typescript
// src/lib/calculators/fire-calculator/types.ts
export interface CalculatorInputs {
  annualIncome: number;
  annualSpending: number;
  currentSavings: number;
  expectedReturn: number;
  withdrawalRate: number;
}

export interface Milestone {
  name: string;
  amount: number;
  yearsToReach: number;
  description: string;
}

export interface YearlyProjection {
  year: number;
  age?: number;
  balance: number;
  contributions: number;
  growth: number;
}

export interface CalculatorResults {
  savingsRate: number;
  annualSavings: number;
  fireNumber: number;
  yearsToFire: number;
  fireDate: Date;
  coastFireNumber: number;
  coastFireYears: number;
  leanFireNumber: number;
  leanFireYears: number;
  fatFireNumber: number;
  fatFireYears: number;
  projections: YearlyProjection[];
  milestones: Milestone[];
}
```

```typescript
// src/lib/calculators/fire-calculator/calculations.ts
import type { CalculatorInputs, CalculatorResults, YearlyProjection, Milestone } from "./types";

export function calculate(inputs: CalculatorInputs): CalculatorResults {
  const { annualIncome, annualSpending, currentSavings, expectedReturn, withdrawalRate } = inputs;

  const returnRate = expectedReturn / 100;
  const annualSavings = annualIncome - annualSpending;
  const savingsRate = annualSavings / annualIncome;

  // FIRE numbers
  const fireNumber = annualSpending * (100 / withdrawalRate);
  const leanFireNumber = (annualSpending * 0.7) * (100 / withdrawalRate);
  const fatFireNumber = (annualSpending * 1.5) * (100 / withdrawalRate);

  // Calculate years to FIRE (iterative approach)
  const yearsToFire = calculateYearsToTarget(currentSavings, annualSavings, returnRate, fireNumber);
  const leanFireYears = calculateYearsToTarget(currentSavings, annualSavings, returnRate, leanFireNumber);
  const fatFireYears = calculateYearsToTarget(currentSavings, annualSavings, returnRate, fatFireNumber);

  // Coast FIRE: How much do you need NOW so that growth alone gets you to FIRE at 65
  // Assuming 25 years to 65
  const yearsToTraditionalRetirement = 25;
  const coastFireNumber = fireNumber / Math.pow(1 + returnRate, yearsToTraditionalRetirement);
  const coastFireYears = calculateYearsToTarget(currentSavings, annualSavings, returnRate, coastFireNumber);

  // Generate projections
  const projections = generateProjections(currentSavings, annualSavings, returnRate, Math.max(yearsToFire, 40));

  // Create milestones
  const milestones: Milestone[] = [
    {
      name: "Lean FIRE",
      amount: leanFireNumber,
      yearsToReach: leanFireYears,
      description: "70% of current spending covered",
    },
    {
      name: "Coast FIRE",
      amount: coastFireNumber,
      yearsToReach: coastFireYears,
      description: "Can stop saving, growth covers retirement",
    },
    {
      name: "FIRE",
      amount: fireNumber,
      yearsToReach: yearsToFire,
      description: "100% of current spending covered",
    },
    {
      name: "Fat FIRE",
      amount: fatFireNumber,
      yearsToReach: fatFireYears,
      description: "150% of current spending covered",
    },
  ];

  // Calculate FIRE date
  const fireDate = new Date();
  fireDate.setFullYear(fireDate.getFullYear() + Math.ceil(yearsToFire));

  return {
    savingsRate,
    annualSavings,
    fireNumber,
    yearsToFire,
    fireDate,
    coastFireNumber,
    coastFireYears,
    leanFireNumber,
    leanFireYears,
    fatFireNumber,
    fatFireYears,
    projections,
    milestones,
  };
}

function calculateYearsToTarget(
  currentSavings: number,
  annualSavings: number,
  returnRate: number,
  target: number
): number {
  if (currentSavings >= target) return 0;
  if (annualSavings <= 0) return Infinity;

  let balance = currentSavings;
  let years = 0;

  while (balance < target && years < 100) {
    balance = balance * (1 + returnRate) + annualSavings;
    years++;
  }

  return years;
}

function generateProjections(
  currentSavings: number,
  annualSavings: number,
  returnRate: number,
  years: number
): YearlyProjection[] {
  const projections: YearlyProjection[] = [];
  let balance = currentSavings;
  let totalContributions = 0;

  for (let year = 0; year <= years; year++) {
    projections.push({
      year,
      balance,
      contributions: totalContributions,
      growth: balance - totalContributions - currentSavings,
    });

    const growth = balance * returnRate;
    balance += growth + annualSavings;
    totalContributions += annualSavings;
  }

  return projections;
}
```

---

## UI Structure

### Sections
1. **Hero:** "When Can You Retire?"
2. **Inputs:** Income, spending, current savings, assumptions
3. **Savings Rate Highlight:** Large display of calculated rate
4. **Results Card:**
   - Years to FIRE (primary)
   - FIRE Number (target)
   - FIRE Date
5. **Milestones:** Lean FIRE, Coast FIRE, FIRE, Fat FIRE with years
6. **Savings Rate Impact:** Show how changing rate affects timeline
7. **Projection Chart:** Balance over time with FIRE line
8. **Methodology:** 4% rule explanation

### Visual Design
- **Primary color usage:** Amber for aspirational/warm feel
- **Personality:** Aspirational, motivational, data-driven
- **Visualizations:**
  - Growth chart with milestone markers
  - Savings rate slider with instant feedback
  - Timeline to FIRE

---

## Registration

```typescript
{
  id: "fire-calculator",
  name: "FIRE Calculator",
  description: "Calculate when you can reach financial independence",
  href: "/tools/fire-calculator",
  categoryId: "investing",
  status: "live",
  primaryColor: "#f59e0b",
  designStyle: "analytical",
  inspiredBy: ["Mr. Money Mustache", "FIRE Movement"],
  featured: true,
}
```

---

## Agent Prompt

# Agent Prompt: FIRE Calculator

## Your Mission
Build the FIRE Calculator for ClearMoney. This tool shows users when they can reach financial independence based on savings rate.

## Key Features
1. Simple inputs (income, spending, savings)
2. Calculated savings rate prominently displayed
3. Years to FIRE as primary output
4. Multiple milestones (Lean, Coast, FIRE, Fat)
5. Projection chart over time
6. Savings rate impact visualization

## Key Insight
Savings rate is the single most important variable. Show how small changes compound.

## Files to Create
1. `/src/app/tools/fire-calculator/page.tsx`
2. `/src/app/tools/fire-calculator/calculator.tsx`
3. `/src/lib/calculators/fire-calculator/types.ts`
4. `/src/lib/calculators/fire-calculator/calculations.ts`

## Branch: `feature/app-fire-calculator`
