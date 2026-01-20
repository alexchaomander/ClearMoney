# Debt Destroyer

## Overview

**Slug:** `debt-destroyer`
**Category:** debt
**Primary Color:** Red/Orange (#ef4444)
**Design Style:** serious (with motivational elements)

### One-Line Description
Compare debt snowball vs. avalanche strategies side-by-side to find YOUR best path to debt freedom.

### Target User
Someone with multiple debts (credit cards, student loans, car loans) who wants to understand the trade-offs between paying smallest balance first (snowball) vs. highest interest first (avalanche).

### Problem It Solves
Most debt calculators force you to pick a method. Dave Ramsey pushes snowball only. Math people push avalanche only. Users need to see BOTH methods with the same data to make an informed choice.

---

## Inspired By

### Influencer Connection
- **Dave Ramsey:** Debt snowball philosophy—"personal finance is 80% behavior"
- **Counter-position:** Mathematical optimization with avalanche method
- See: `/docs/research/influencer-profiles/dave-ramsey.md`

### What Existing Tools Get Wrong
- Force users to choose a method before seeing results
- Don't quantify the "motivation cost" of snowball
- Don't show the timeline difference clearly
- Make it hard to compare side-by-side

### Our Differentiated Approach
- Show BOTH methods simultaneously
- Quantify the trade-off: "Snowball costs $X more but gives Y quick wins"
- Let users make an informed choice
- Visual timeline comparison

---

## User Inputs

### Debt Entry Form
Each debt has:
| Field | Type | Default | Min | Max |
|-------|------|---------|-----|-----|
| name | text | "Debt 1" | - | - |
| balance | number | 5000 | 0 | 500000 |
| interestRate | number | 18.0 | 0 | 30 |
| minimumPayment | number | 100 | 0 | 10000 |

### Global Inputs
| Input | Label | Type | Default | Min | Max | Step |
|-------|-------|------|---------|-----|-----|------|
| extraPayment | Extra Monthly Payment | slider | 200 | 0 | 2000 | 25 |

### Default Debts (pre-populated for demo)
```typescript
const DEFAULT_DEBTS = [
  { name: "Credit Card A", balance: 3500, interestRate: 22.99, minimumPayment: 70 },
  { name: "Credit Card B", balance: 8200, interestRate: 18.99, minimumPayment: 164 },
  { name: "Car Loan", balance: 12000, interestRate: 6.5, minimumPayment: 350 },
  { name: "Student Loan", balance: 25000, interestRate: 5.5, minimumPayment: 280 },
];
```

---

## Calculations

### Core Formulas

**Monthly Interest:**
```
monthlyInterest = balance × (annualRate / 100 / 12)
```

**Snowball Order:** Sort debts by balance (smallest first)
**Avalanche Order:** Sort debts by interest rate (highest first)

**Payoff Simulation:**
```
For each month until all debts paid:
  1. Calculate minimum payments for all debts
  2. Add extra payment to target debt (based on method)
  3. Apply payments to each debt:
     - Calculate interest for the month
     - Apply payment (minimum or minimum + extra)
     - If debt is paid off, roll payment to next target
  4. Track total interest paid
  5. Track months elapsed
  6. Record when each debt is paid off
```

### TypeScript Implementation

```typescript
// src/lib/calculators/debt-destroyer/types.ts
export interface Debt {
  id: string;
  name: string;
  balance: number;
  interestRate: number;
  minimumPayment: number;
}

export interface PayoffEvent {
  debtId: string;
  debtName: string;
  month: number;
}

export interface MethodResult {
  totalMonths: number;
  totalInterest: number;
  totalPaid: number;
  payoffOrder: PayoffEvent[];
  monthlyData: MonthlySnapshot[];
}

export interface MonthlySnapshot {
  month: number;
  totalBalance: number;
  debtsRemaining: number;
}

export interface CalculatorResults {
  snowball: MethodResult;
  avalanche: MethodResult;
  comparison: {
    timeDifferenceMonths: number;
    interestDifference: number;
    quickWinsDifference: number;  // Debts paid in first 12 months
    motivationCost: number;       // Extra interest for snowball's quick wins
  };
}
```

```typescript
// src/lib/calculators/debt-destroyer/calculations.ts
import type { Debt, MethodResult, CalculatorResults, PayoffEvent, MonthlySnapshot } from "./types";

function simulatePayoff(debts: Debt[], extraPayment: number, orderBy: 'balance' | 'rate'): MethodResult {
  // Deep copy debts to avoid mutation
  let remainingDebts = debts.map(d => ({ ...d, currentBalance: d.balance }));

  // Sort based on method
  if (orderBy === 'balance') {
    remainingDebts.sort((a, b) => a.currentBalance - b.currentBalance);
  } else {
    remainingDebts.sort((a, b) => b.interestRate - a.interestRate);
  }

  let month = 0;
  let totalInterest = 0;
  const payoffOrder: PayoffEvent[] = [];
  const monthlyData: MonthlySnapshot[] = [];
  let availableExtra = extraPayment;

  while (remainingDebts.some(d => d.currentBalance > 0) && month < 360) {
    month++;

    // Calculate interest for all debts
    for (const debt of remainingDebts) {
      if (debt.currentBalance > 0) {
        const monthlyInterest = debt.currentBalance * (debt.interestRate / 100 / 12);
        totalInterest += monthlyInterest;
        debt.currentBalance += monthlyInterest;
      }
    }

    // Apply payments
    let extraToApply = availableExtra;

    for (const debt of remainingDebts) {
      if (debt.currentBalance > 0) {
        // Apply minimum payment
        let payment = Math.min(debt.minimumPayment, debt.currentBalance);

        // Apply extra to first debt with balance
        if (extraToApply > 0) {
          const extraApplied = Math.min(extraToApply, debt.currentBalance - payment);
          payment += extraApplied;
          extraToApply -= extraApplied;
        }

        debt.currentBalance -= payment;

        // Check if debt is paid off
        if (debt.currentBalance <= 0.01) {
          debt.currentBalance = 0;
          payoffOrder.push({
            debtId: debt.id,
            debtName: debt.name,
            month,
          });
          // Add this debt's minimum to extra payment pool
          availableExtra += debt.minimumPayment;
        }
      }
    }

    // Record monthly snapshot
    const totalBalance = remainingDebts.reduce((sum, d) => sum + d.currentBalance, 0);
    const debtsRemaining = remainingDebts.filter(d => d.currentBalance > 0).length;
    monthlyData.push({ month, totalBalance, debtsRemaining });
  }

  const totalPaid = debts.reduce((sum, d) => sum + d.balance, 0) + totalInterest;

  return {
    totalMonths: month,
    totalInterest,
    totalPaid,
    payoffOrder,
    monthlyData,
  };
}

export function calculate(debts: Debt[], extraPayment: number): CalculatorResults {
  const snowball = simulatePayoff(debts, extraPayment, 'balance');
  const avalanche = simulatePayoff(debts, extraPayment, 'rate');

  // Count quick wins (debts paid in first 12 months)
  const snowballQuickWins = snowball.payoffOrder.filter(p => p.month <= 12).length;
  const avalancheQuickWins = avalanche.payoffOrder.filter(p => p.month <= 12).length;

  return {
    snowball,
    avalanche,
    comparison: {
      timeDifferenceMonths: snowball.totalMonths - avalanche.totalMonths,
      interestDifference: snowball.totalInterest - avalanche.totalInterest,
      quickWinsDifference: snowballQuickWins - avalancheQuickWins,
      motivationCost: Math.max(0, snowball.totalInterest - avalanche.totalInterest),
    },
  };
}
```

### Edge Cases
- **Single debt:** Both methods identical
- **Same balance:** Snowball falls back to rate order
- **Same rate:** Avalanche falls back to balance order
- **Zero extra payment:** Still shows comparison (longer timeline)
- **Very high rates:** Cap simulation at 360 months with warning

---

## UI Structure

### Sections (top to bottom)
1. **Hero:** "Destroy Your Debt" with motivational subtitle
2. **Debt Entry:**
   - List of debts with edit/delete
   - Add debt button
   - Pre-populated with example debts
3. **Extra Payment Slider:**
   - "How much extra can you pay monthly?"
   - Real-time results update
4. **Results: Side-by-Side Comparison**
   - Two columns: Snowball | Avalanche
   - Total time, total interest, payoff order
   - Highlighted winner for each metric
5. **The Trade-Off Card:**
   - "Snowball costs $X more but gives you Y quick wins"
   - "Is the motivation worth $Z per win?"
6. **Timeline Visualization:**
   - Dual line chart showing balance over time
   - Markers for each debt payoff
7. **Methodology:** How we calculate, links to Ramsey research

### Visual Design
- **Primary color usage:** Red/orange for urgency, green for progress
- **Personality:** Aggressive, motivational, progress-focused
- **Special visualizations:**
  - Dual-line balance chart
  - Payoff milestone markers
  - "Debt destroyed" celebration moments

---

## Files to Create

```
src/
├── app/
│   └── tools/
│       └── debt-destroyer/
│           ├── page.tsx           # Metadata + wrapper
│           └── calculator.tsx     # Main component
└── lib/
    └── calculators/
        └── debt-destroyer/
            ├── types.ts           # Interfaces
            └── calculations.ts    # Payoff simulation
```

---

## Registration

Add to `/src/lib/site-config.ts`:

```typescript
{
  id: "debt-destroyer",
  name: "Debt Destroyer",
  description: "Compare snowball vs avalanche debt payoff strategies",
  href: "/tools/debt-destroyer",
  categoryId: "debt",
  status: "live",
  primaryColor: "#ef4444",
  designStyle: "serious",
  inspiredBy: ["Dave Ramsey"],
  featured: true,
}
```

---

## Agent Prompt

# Agent Prompt: Debt Destroyer

## Your Mission
Build the Debt Destroyer calculator for ClearMoney. This tool compares debt snowball (smallest balance first) vs. avalanche (highest interest first) methods side-by-side, helping users make an informed choice.

## Context
- **Repository:** `/Users/alexchao/projects/clearmoney`
- **Your app directory:** `/src/app/tools/debt-destroyer/`
- **Your calculator logic:** `/src/lib/calculators/debt-destroyer/`
- **Tech stack:** Next.js 15+, React 19, TypeScript, Tailwind CSS

## Before You Start
1. Read `/docs/app-specs/shared-patterns.md` for required patterns
2. Review `/src/app/tools/bilt-calculator/` for existing patterns
3. Note: This app needs a debt entry form, not just sliders

## Design Requirements
- **Primary Color:** Red/Orange (#ef4444) - urgency and motivation
- **Personality:** Aggressive, motivational, progress-focused
- **Base:** Dark mode (bg-neutral-950)
- **Mobile-first:** Must work on 375px viewport

## What You're Building
A calculator that:
1. Lets users enter multiple debts (balance, rate, minimum payment)
2. Simulates both snowball and avalanche payoff strategies
3. Shows side-by-side comparison of total time, interest, and payoff order
4. Quantifies the "motivation cost" (extra interest paid for quicker wins)
5. Helps users choose based on full information, not ideology

Key insight: Dave Ramsey is right that behavior matters, but users deserve to know what that costs. We show both.

## User Inputs

### Debt Entry (multiple debts)
- Name (text, e.g., "Credit Card A")
- Balance ($0 - $500,000)
- Interest Rate (0% - 30%)
- Minimum Payment ($0 - $10,000)

### Global Setting
- Extra Monthly Payment: slider, $0-$2000, default $200, step $25

### Default Demo Debts
```typescript
[
  { name: "Credit Card A", balance: 3500, rate: 22.99, min: 70 },
  { name: "Credit Card B", balance: 8200, rate: 18.99, min: 164 },
  { name: "Car Loan", balance: 12000, rate: 6.5, min: 350 },
  { name: "Student Loan", balance: 25000, rate: 5.5, min: 280 },
]
```

## Calculation Logic

For each method (snowball/avalanche):
1. Sort debts (by balance for snowball, by rate for avalanche)
2. Simulate month-by-month:
   - Add monthly interest to each balance
   - Apply minimum payments to all debts
   - Apply extra payment to target debt (first in sorted order)
   - When debt hits $0, roll its minimum to extra pool
   - Record payoff events and monthly totals
3. Continue until all debts are $0 (max 360 months)

## Key Outputs
- Total months to debt-free
- Total interest paid
- Payoff order (which debts paid off when)
- Monthly balance over time (for chart)
- Comparison metrics (time difference, interest difference, quick wins)

## UI Structure

1. **Hero:** "Destroy Your Debt" + subtitle about informed choice

2. **Debt Entry Section:**
   - Card for each debt with editable fields
   - "Add Debt" button
   - "Reset to Example" button
   - Total debt summary

3. **Extra Payment Slider:**
   - SliderInput component
   - Shows monthly total payment

4. **Results Comparison (two columns):**
   ```
   SNOWBALL          |  AVALANCHE
   --------------------|--------------------
   X months           |  Y months
   $X,XXX interest    |  $Y,YYY interest
   First payoff: ...  |  First payoff: ...
   ```

5. **Trade-Off Card:**
   - "The snowball method costs $X more in interest"
   - "But you'll pay off Y debts in the first year"
   - "That's $Z per 'quick win'"

6. **Timeline Chart:**
   - Dual line chart (Recharts)
   - X-axis: months, Y-axis: total balance
   - Two lines: snowball (red) vs avalanche (blue)
   - Markers for each payoff event

7. **Methodology Section:**
   - How calculations work
   - Link to Dave Ramsey research

## Special UI Elements
- Debt card with inline editing
- Add/remove debt functionality
- Real-time calculation updates
- Winner highlighting (green border on better option per metric)
- "Motivation cost" callout

## Files to Create

1. `/src/app/tools/debt-destroyer/page.tsx` - Metadata
2. `/src/app/tools/debt-destroyer/calculator.tsx` - Main component
3. `/src/lib/calculators/debt-destroyer/types.ts` - Interfaces
4. `/src/lib/calculators/debt-destroyer/calculations.ts` - Simulation logic

## Testing Checklist
- [ ] `npm run build` passes
- [ ] `npm run lint` passes
- [ ] Mobile viewport (375px) works
- [ ] Single debt shows identical results for both methods
- [ ] Extra payment updates results in real-time
- [ ] Debt add/remove works correctly
- [ ] Chart displays correctly
- [ ] Very high interest rates don't break (cap at 360 months)
- [ ] Registered in site-config.ts

## Branch & PR
1. Create branch: `feature/app-debt-destroyer`
2. Complete all work
3. Add entry to site-config.ts
4. Create PR with desktop + mobile screenshots

## Do NOT
- Modify shared components
- Pick sides in snowball vs avalanche debate
- Hide the cost of snowball's quick wins
- Skip the comparison visualization
- Forget mobile testing

---

## Related Documentation

- Research: `/docs/research/influencer-profiles/dave-ramsey.md`
- Tool Opportunities: `/docs/research/tool-opportunities/debt-payoff.md`
- Shared Patterns: `/docs/app-specs/shared-patterns.md`
