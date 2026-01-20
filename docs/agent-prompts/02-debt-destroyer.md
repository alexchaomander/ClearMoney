# Agent Prompt: Debt Destroyer

## Your Mission

Build the Debt Destroyer calculator for ClearMoney. This tool helps users compare the debt snowball vs. avalanche payoff methods side-by-side, showing both the emotional wins and the mathematical reality.

## Project Context

**Repository:** You are working in a Next.js 15+ project with React 19, TypeScript, and Tailwind CSS.
**Your app directory:** `/src/app/tools/debt-destroyer/`
**Your calculator logic:** `/src/lib/calculators/debt-destroyer/`
**Branch name:** `feature/app-debt-destroyer`

## Background Research

**Dave Ramsey's Debt Snowball:**
- Pay minimums on all debts, put extra toward the SMALLEST balance first
- Rationale: Quick wins create motivation and behavioral momentum
- Criticism: Ignores interest rates, can cost more in total interest

**Debt Avalanche (Mathematically Optimal):**
- Pay minimums on all debts, put extra toward the HIGHEST INTEREST RATE first
- Rationale: Minimizes total interest paid
- Criticism: May take longer to see progress, can feel discouraging

**Our approach:** Show BOTH methods side-by-side so users can see the tradeoff between psychological wins and mathematical optimization.

## Before You Start

1. Read the shared patterns: `cat /docs/app-specs/shared-patterns.md`
2. Review existing calculator for patterns: `ls -la /src/app/tools/bilt-calculator/`
3. Check shared components: `cat /src/components/shared/index.ts`

## Design Requirements

- **Primary Color:** Red/Orange (#ef4444) - represents urgency and motivation
- **Design Style:** Serious but motivational, progress-focused
- **Base:** Dark mode (bg-neutral-950)
- **Mobile-first:** Must work on 375px viewport

## User Inputs

### Debt Entry (allow 2-10 debts)
| Field | Type | Validation |
|-------|------|------------|
| name | text | Required, max 30 chars |
| balance | currency | Min $1, Max $500,000 |
| interestRate | percent | Min 0%, Max 30% |
| minimumPayment | currency | Min $10 |

### Monthly Budget
| Input | Label | Default | Min | Max |
|-------|-------|---------|-----|-----|
| extraPayment | Extra Monthly Payment | 500 | 0 | 5000 |

## Calculation Logic

```typescript
// src/lib/calculators/debt-destroyer/types.ts
export interface Debt {
  id: string;
  name: string;
  balance: number;
  interestRate: number;  // as percentage (e.g., 18.99)
  minimumPayment: number;
}

export interface CalculatorInputs {
  debts: Debt[];
  extraPayment: number;
}

export interface PayoffEvent {
  month: number;
  debtName: string;
  totalPaidToDate: number;
}

export interface MethodResult {
  totalMonths: number;
  totalInterest: number;
  totalPaid: number;
  payoffOrder: PayoffEvent[];
  monthlySchedule: MonthlySnapshot[];
}

export interface MonthlySnapshot {
  month: number;
  debts: { id: string; balance: number; payment: number }[];
  totalBalance: number;
}

export interface CalculatorResults {
  snowball: MethodResult;
  avalanche: MethodResult;
  interestSaved: number;        // avalanche saves this much
  monthsDifference: number;     // positive = snowball faster to first payoff
  firstPayoffSnowball: PayoffEvent;
  firstPayoffAvalanche: PayoffEvent;
  recommendation: string;
}
```

```typescript
// src/lib/calculators/debt-destroyer/calculations.ts
import type { Debt, CalculatorInputs, CalculatorResults, MethodResult, PayoffEvent, MonthlySnapshot } from "./types";

function simulatePayoff(debts: Debt[], extraPayment: number, sortFn: (a: Debt, b: Debt) => number): MethodResult {
  // Deep clone debts and sort by strategy
  let remaining = debts.map(d => ({ ...d })).sort(sortFn);

  const payoffOrder: PayoffEvent[] = [];
  const monthlySchedule: MonthlySnapshot[] = [];
  let month = 0;
  let totalInterest = 0;
  let totalPaid = 0;

  while (remaining.length > 0 && month < 360) { // Cap at 30 years
    month++;

    // Calculate total minimum payments
    const totalMinimums = remaining.reduce((sum, d) => sum + d.minimumPayment, 0);
    let availableExtra = extraPayment;

    const monthSnapshot: MonthlySnapshot = {
      month,
      debts: [],
      totalBalance: 0,
    };

    // Apply interest and payments to each debt
    for (let i = 0; i < remaining.length; i++) {
      const debt = remaining[i];

      // Apply monthly interest
      const monthlyRate = debt.interestRate / 100 / 12;
      const interestCharge = debt.balance * monthlyRate;
      debt.balance += interestCharge;
      totalInterest += interestCharge;

      // Apply payment (minimum + extra for first debt in sorted order)
      let payment = debt.minimumPayment;
      if (i === 0 && availableExtra > 0) {
        payment += availableExtra;
      }

      // Don't overpay
      payment = Math.min(payment, debt.balance);
      debt.balance -= payment;
      totalPaid += payment;

      monthSnapshot.debts.push({
        id: debt.id,
        balance: Math.max(0, debt.balance),
        payment,
      });
    }

    // Check for payoffs
    remaining = remaining.filter(debt => {
      if (debt.balance <= 0.01) { // Account for floating point
        payoffOrder.push({
          month,
          debtName: debt.name,
          totalPaidToDate: totalPaid,
        });
        return false;
      }
      return true;
    });

    // Re-sort remaining debts (balances changed)
    remaining.sort(sortFn);

    monthSnapshot.totalBalance = remaining.reduce((sum, d) => sum + d.balance, 0);
    monthlySchedule.push(monthSnapshot);
  }

  return {
    totalMonths: month,
    totalInterest: Math.round(totalInterest * 100) / 100,
    totalPaid: Math.round(totalPaid * 100) / 100,
    payoffOrder,
    monthlySchedule,
  };
}

export function calculate(inputs: CalculatorInputs): CalculatorResults {
  const { debts, extraPayment } = inputs;

  if (debts.length === 0) {
    return {
      snowball: { totalMonths: 0, totalInterest: 0, totalPaid: 0, payoffOrder: [], monthlySchedule: [] },
      avalanche: { totalMonths: 0, totalInterest: 0, totalPaid: 0, payoffOrder: [], monthlySchedule: [] },
      interestSaved: 0,
      monthsDifference: 0,
      firstPayoffSnowball: { month: 0, debtName: '', totalPaidToDate: 0 },
      firstPayoffAvalanche: { month: 0, debtName: '', totalPaidToDate: 0 },
      recommendation: 'Add some debts to get started',
    };
  }

  // Snowball: smallest balance first
  const snowball = simulatePayoff(debts, extraPayment, (a, b) => a.balance - b.balance);

  // Avalanche: highest interest first
  const avalanche = simulatePayoff(debts, extraPayment, (a, b) => b.interestRate - a.interestRate);

  const interestSaved = snowball.totalInterest - avalanche.totalInterest;

  const firstPayoffSnowball = snowball.payoffOrder[0] || { month: 0, debtName: '', totalPaidToDate: 0 };
  const firstPayoffAvalanche = avalanche.payoffOrder[0] || { month: 0, debtName: '', totalPaidToDate: 0 };
  const monthsDifference = firstPayoffAvalanche.month - firstPayoffSnowball.month;

  let recommendation: string;
  if (interestSaved < 100) {
    recommendation = "Either method works—choose what keeps you motivated!";
  } else if (interestSaved < 500) {
    recommendation = `Avalanche saves ${formatCurrency(interestSaved)}, but snowball gives faster wins. Your call!`;
  } else {
    recommendation = `Avalanche saves ${formatCurrency(interestSaved)}—that's significant! Consider the math.`;
  }

  return {
    snowball,
    avalanche,
    interestSaved,
    monthsDifference,
    firstPayoffSnowball,
    firstPayoffAvalanche,
    recommendation,
  };
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}
```

## UI Structure

### Layout (top to bottom)

1. **Hero Section**
   - Title: "Debt Destroyer"
   - Subtitle: "Snowball vs Avalanche—see which strategy wins for YOUR debts"

2. **Debt Entry Section**
   - "Add Debt" button
   - List of debt cards with editable fields
   - Each card shows: name, balance, rate, minimum
   - Delete button on each card
   - Default: Start with 2 example debts

3. **Extra Payment Slider**
   - Label: "Extra Monthly Payment"
   - Show: "Total monthly payment: ${minimums + extra}"

4. **Comparison Results** (side-by-side cards on desktop, stacked on mobile)

   **Snowball Card (left):**
   - Title with snowball icon
   - "Debt-free in X months"
   - "Total interest: $X"
   - "First win: [debt name] in X months"
   - Progress visualization

   **Avalanche Card (right):**
   - Title with avalanche/mountain icon
   - "Debt-free in X months"
   - "Total interest: $X"
   - "First win: [debt name] in X months"
   - Progress visualization

5. **Comparison Summary**
   - "Avalanche saves $X in interest"
   - "Snowball gives you a win X months sooner"
   - Recommendation text

6. **Payoff Timeline** (optional visualization)
   - Show when each debt gets paid off in both methods
   - Color-coded bars or timeline

7. **Methodology Section** (collapsible)
   - Explain both methods
   - Dave Ramsey's rationale for snowball
   - Why avalanche is mathematically optimal
   - "Personal finance is 80% behavior"—both are valid

## Files to Create

```
src/
├── app/tools/debt-destroyer/
│   ├── page.tsx
│   └── calculator.tsx
└── lib/calculators/debt-destroyer/
    ├── types.ts
    └── calculations.ts
```

## Special UI Components Needed

Create within your calculator.tsx (not as shared components):

1. **DebtCard** - Editable card for each debt entry
2. **ComparisonCard** - Side-by-side method comparison
3. **PayoffTimeline** - Visual timeline of payoff order (optional but nice)

## Registration

Add to `/src/lib/site-config.ts`:

```typescript
{
  id: "debt-destroyer",
  name: "Debt Destroyer",
  description: "Compare snowball vs avalanche debt payoff strategies side-by-side",
  href: "/tools/debt-destroyer",
  categoryId: "debt",
  status: "live",
  primaryColor: "#ef4444",
  designStyle: "serious",
  inspiredBy: ["Dave Ramsey"],
  featured: true,
}
```

## Testing Checklist

- [ ] `npm run build` passes
- [ ] `npm run lint` passes
- [ ] Mobile viewport (375px) works
- [ ] Can add/remove debts (min 1, max 10)
- [ ] Calculations match manual verification
- [ ] Snowball and avalanche give different results when rates differ
- [ ] Edge case: All same interest rate (both methods identical)
- [ ] Edge case: Single debt (both methods identical)
- [ ] Edge case: Zero extra payment still works
- [ ] Payoff order is correct for each method

## Example Test Data

```typescript
const testDebts = [
  { id: '1', name: 'Credit Card', balance: 5000, interestRate: 22.99, minimumPayment: 100 },
  { id: '2', name: 'Car Loan', balance: 12000, interestRate: 6.5, minimumPayment: 250 },
  { id: '3', name: 'Student Loan', balance: 8000, interestRate: 5.0, minimumPayment: 150 },
];
// With $500 extra:
// Snowball order: Credit Card (smallest) → Student Loan → Car Loan
// Avalanche order: Credit Card (highest rate) → Car Loan → Student Loan
```

## Git Workflow

```bash
git checkout -b feature/app-debt-destroyer
# ... build the app ...
git add .
git commit -m "Add Debt Destroyer calculator"
git push -u origin feature/app-debt-destroyer
```

## Do NOT

- Modify shared components
- Add charting libraries (use CSS/SVG for visualizations)
- Make the comparison feel judgmental—both methods are valid
- Forget to handle the edge case of no debts entered
