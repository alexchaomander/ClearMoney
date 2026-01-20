# Agent Prompt: Roth vs Traditional Calculator

## Your Mission

Build the Roth vs Traditional calculator for ClearMoney. This tool helps users understand whether to contribute to a Roth IRA/401k (pay taxes now) or Traditional IRA/401k (pay taxes later) based on their current and expected future tax rates.

## Project Context

**Repository:** You are working in a Next.js 15+ project with React 19, TypeScript, and Tailwind CSS.
**Your app directory:** `/src/app/tools/roth-vs-traditional/`
**Your calculator logic:** `/src/lib/calculators/roth-vs-traditional/`
**Branch name:** `feature/app-roth-vs-traditional`

## Background Research

**The Core Question:** Should you pay taxes now (Roth) or later (Traditional)?

**Traditional IRA/401k:**
- Contribute pre-tax dollars
- Money grows tax-deferred
- Pay income tax on withdrawals in retirement
- Benefit: Lower taxable income NOW

**Roth IRA/401k:**
- Contribute after-tax dollars
- Money grows tax-free
- NO tax on qualified withdrawals
- Benefit: Tax-free income in retirement

**The Key Insight:**
If tax rates are the SAME now and in retirement, both end up with identical after-tax values:
- Traditional: $10,000 grows → $76,123 → taxed at 22% = $59,376
- Roth: $7,800 (after 22% tax) grows → $59,376 (tax-free) = $59,376

The difference comes when tax rates DIFFER:
- If you expect HIGHER taxes in retirement → Roth wins (pay taxes now at lower rate)
- If you expect LOWER taxes in retirement → Traditional wins (defer taxes to lower rate)

## Before You Start

1. Read shared patterns: `cat /docs/app-specs/shared-patterns.md`
2. Review existing calculator: `ls -la /src/app/tools/bilt-calculator/`
3. Check shared components: `cat /src/components/shared/index.ts`

## Design Requirements

- **Primary Color:** Purple (#a855f7) - sophisticated, premium feel
- **Design Style:** Analytical with clear comparisons
- **Base:** Dark mode (bg-neutral-950)
- **Mobile-first:** Must work on 375px viewport

## User Inputs

| Input | Label | Default | Min | Max | Step |
|-------|-------|---------|-----|-----|------|
| annualContribution | Annual Contribution | 7000 | 0 | 23000 | 500 |
| currentTaxRate | Current Marginal Tax Rate | 22 | 0 | 37 | 1 |
| retirementTaxRate | Expected Retirement Tax Rate | 22 | 0 | 37 | 1 |
| yearsUntilRetirement | Years Until Retirement | 30 | 1 | 50 | 1 |
| expectedReturn | Expected Annual Return | 7 | 0 | 12 | 0.5 |

### Tax Bracket Reference (show as helper)
2024 Federal Tax Brackets (Single):
- 10%: $0 - $11,600
- 12%: $11,601 - $47,150
- 22%: $47,151 - $100,525
- 24%: $100,526 - $191,950
- 32%: $191,951 - $243,725
- 35%: $243,726 - $609,350
- 37%: Over $609,350

## Calculation Logic

```typescript
// src/lib/calculators/roth-vs-traditional/types.ts
export interface CalculatorInputs {
  annualContribution: number;
  currentTaxRate: number;        // as percentage (e.g., 22)
  retirementTaxRate: number;     // as percentage (e.g., 22)
  yearsUntilRetirement: number;
  expectedReturn: number;        // as percentage (e.g., 7)
}

export interface CalculatorResults {
  traditional: {
    contribution: number;        // pre-tax amount
    futureValue: number;         // before taxes
    afterTaxValue: number;       // what you actually get
    taxesPaid: number;
  };
  roth: {
    contribution: number;        // after-tax amount (less than traditional)
    futureValue: number;         // tax-free
    afterTaxValue: number;       // same as futureValue
    taxesPaidNow: number;
  };
  difference: number;            // positive = Roth better
  percentageDifference: number;
  winner: 'roth' | 'traditional' | 'tie';
  breakEvenTaxRate: number;      // retirement rate where they're equal
  recommendation: string;
  factors: string[];             // factors favoring each option
}
```

```typescript
// src/lib/calculators/roth-vs-traditional/calculations.ts
import type { CalculatorInputs, CalculatorResults } from "./types";

export function calculate(inputs: CalculatorInputs): CalculatorResults {
  const {
    annualContribution,
    currentTaxRate,
    retirementTaxRate,
    yearsUntilRetirement,
    expectedReturn,
  } = inputs;

  const currentRate = currentTaxRate / 100;
  const retirementRate = retirementTaxRate / 100;
  const returnRate = expectedReturn / 100;

  // Traditional: Contribute pre-tax, pay taxes in retirement
  const traditionalContribution = annualContribution;
  const traditionalFutureValue = calculateFutureValue(
    traditionalContribution,
    returnRate,
    yearsUntilRetirement
  );
  const traditionalAfterTax = traditionalFutureValue * (1 - retirementRate);
  const traditionalTaxesPaid = traditionalFutureValue * retirementRate;

  // Roth: Contribute after-tax, no taxes in retirement
  const rothTaxPaidNow = annualContribution * currentRate;
  const rothContribution = annualContribution * (1 - currentRate);
  const rothFutureValue = calculateFutureValue(
    rothContribution,
    returnRate,
    yearsUntilRetirement
  );
  const rothAfterTax = rothFutureValue; // No taxes!

  // Compare
  const difference = rothAfterTax - traditionalAfterTax;
  const percentageDifference = (difference / traditionalAfterTax) * 100;

  let winner: 'roth' | 'traditional' | 'tie';
  if (Math.abs(difference) < 100) {
    winner = 'tie';
  } else if (difference > 0) {
    winner = 'roth';
  } else {
    winner = 'traditional';
  }

  // Break-even: At what retirement tax rate are they equal?
  // Traditional after-tax = Roth after-tax
  // FV * (1 - retirementRate) = rothFV
  // Since rothFV = FV * (1 - currentRate), break-even is when retirementRate = currentRate
  const breakEvenTaxRate = currentTaxRate;

  // Generate recommendation
  let recommendation: string;
  const factors: string[] = [];

  if (winner === 'tie') {
    recommendation = "At these tax rates, both options are nearly identical. Choose based on other factors.";
  } else if (winner === 'roth') {
    recommendation = `Roth wins by ${formatCurrency(difference)}! You expect higher taxes in retirement.`;
    factors.push("You expect to be in a higher tax bracket in retirement");
    factors.push("Tax rates may increase in the future");
    factors.push("You value tax-free withdrawals for flexibility");
  } else {
    recommendation = `Traditional wins by ${formatCurrency(-difference)}! You expect lower taxes in retirement.`;
    factors.push("You expect to be in a lower tax bracket in retirement");
    factors.push("You need the tax deduction now to reduce current taxes");
    factors.push("Your income is currently high but will decrease");
  }

  // Add general factors
  if (yearsUntilRetirement > 20) {
    factors.push("Long time horizon favors Roth (more tax-free growth)");
  }

  return {
    traditional: {
      contribution: traditionalContribution,
      futureValue: traditionalFutureValue,
      afterTaxValue: traditionalAfterTax,
      taxesPaid: traditionalTaxesPaid,
    },
    roth: {
      contribution: rothContribution,
      futureValue: rothFutureValue,
      afterTaxValue: rothAfterTax,
      taxesPaidNow: rothTaxPaidNow,
    },
    difference,
    percentageDifference,
    winner,
    breakEvenTaxRate,
    recommendation,
    factors,
  };
}

function calculateFutureValue(
  annualContribution: number,
  rate: number,
  years: number
): number {
  // Future value of annuity formula
  if (rate === 0) return annualContribution * years;
  return annualContribution * ((Math.pow(1 + rate, years) - 1) / rate);
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Math.abs(value));
}
```

## UI Structure

### Layout

1. **Hero Section**
   - Title: "Roth vs Traditional Calculator"
   - Subtitle: "Should you pay taxes now or later? See which saves you more."

2. **Input Section**
   - Contribution slider (show IRA limit: $7,000, 401k limit: $23,000)
   - Current tax rate slider with bracket reference
   - Expected retirement tax rate slider (add "I don't know" link → explanation)
   - Years until retirement
   - Expected return (default 7% = inflation-adjusted historical average)

3. **Visual Comparison** (side-by-side)

   **Traditional Card (left):**
   - "Pay taxes LATER"
   - Contribute: $X (pre-tax)
   - Grows to: $X
   - After taxes: $X
   - Taxes paid in retirement: $X

   **Roth Card (right):**
   - "Pay taxes NOW"
   - Contribute: $X (after tax)
   - Grows to: $X (tax-free!)
   - After taxes: $X
   - Taxes paid now: $X

4. **Winner Banner**
   - Large display showing winner and difference
   - "Roth wins by $X" or "Traditional wins by $X" or "It's a tie!"

5. **Break-Even Analysis**
   - "At your current {X}% rate, they're equal if retirement rate is also {X}%"
   - Visual showing the break-even point

6. **Factors to Consider** (list)
   - Dynamic list based on inputs
   - Things like "Long time horizon favors Roth"

7. **Methodology Section** (collapsible)
   - Explain the math
   - Why this is simplified (doesn't account for state taxes, RMDs, etc.)
   - Link to more detailed resources

## Files to Create

```
src/
├── app/tools/roth-vs-traditional/
│   ├── page.tsx
│   └── calculator.tsx
└── lib/calculators/roth-vs-traditional/
    ├── types.ts
    └── calculations.ts
```

## Registration

Add to `/src/lib/site-config.ts`:

```typescript
{
  id: "roth-vs-traditional",
  name: "Roth vs Traditional Calculator",
  description: "Compare Roth vs Traditional IRA to see which saves you more in taxes",
  href: "/tools/roth-vs-traditional",
  categoryId: "investing",
  status: "live",
  primaryColor: "#a855f7",
  designStyle: "analytical",
  inspiredBy: ["FIRE Movement"],
  featured: true,
}
```

## Testing Checklist

- [ ] `npm run build` passes
- [ ] `npm run lint` passes
- [ ] Mobile viewport (375px) works
- [ ] Same tax rates → nearly identical results (tie)
- [ ] Current < Retirement → Roth wins
- [ ] Current > Retirement → Traditional wins
- [ ] Future value calculation is correct
- [ ] Break-even tax rate equals current tax rate
- [ ] Zero return rate doesn't break calculations

## Edge Cases

- Zero contribution: Show zeros, no winner
- Same tax rates: Should show "tie" with small difference due to rounding
- 0% return: Should still work (simple multiplication)
- Max years (50): Should handle large numbers gracefully

## Git Workflow

```bash
git checkout -b feature/app-roth-vs-traditional
# ... build the app ...
git add .
git commit -m "Add Roth vs Traditional calculator"
git push -u origin feature/app-roth-vs-traditional
```

## Do NOT

- Modify shared components
- Add complex tax calculations (state taxes, AMT, etc.)
- Provide specific tax advice (include disclaimer)
- Forget the disclaimer: "This is for educational purposes. Consult a tax professional."
