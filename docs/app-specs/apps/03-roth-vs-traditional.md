# Roth vs Traditional Calculator

## Overview

**Slug:** `roth-vs-traditional`
**Category:** investing
**Primary Color:** Purple (#a855f7)
**Design Style:** analytical

### One-Line Description
Compare Roth vs. Traditional IRA/401k to see which saves you more in taxes over your lifetime.

### Target User
Someone deciding how to allocate retirement contributions who wants to understand the tax implications of Roth (pay taxes now) vs. Traditional (pay taxes later).

### Problem It Solves
The Roth vs. Traditional decision depends on current vs. future tax rates, which no one knows for certain. This calculator helps users understand the break-even point and make an informed choice.

---

## Inspired By

### Influencer Connection
- **General Financial Literacy:** This is a universal question in personal finance
- **FIRE Movement:** Tax optimization is crucial for early retirement
- See: `/docs/research/influencer-profiles/fire-movement.md`

### What Existing Tools Get Wrong
- Oversimplify by showing only one scenario
- Don't explain the underlying tax math
- Don't help users think about future tax rates
- Assume everyone has the same situation

### Our Differentiated Approach
- Show results across multiple future tax rate scenarios
- Visualize the break-even tax rate
- Explain the factors that affect the decision
- Help users think about their specific situation

---

## User Inputs

| Input | Label | Type | Default | Min | Max | Step |
|-------|-------|------|---------|-----|-----|------|
| annualContribution | Annual Contribution | slider | 7000 | 0 | 23000 | 500 |
| currentTaxRate | Current Marginal Tax Rate | slider | 22 | 0 | 37 | 1 |
| retirementTaxRate | Expected Retirement Tax Rate | slider | 22 | 0 | 37 | 1 |
| yearsUntilRetirement | Years Until Retirement | slider | 30 | 1 | 50 | 1 |
| expectedReturn | Expected Annual Return | slider | 7 | 0 | 12 | 0.5 |

### Input Explanations
- **Annual Contribution:** Pre-tax amount available to contribute (same amount goes in Traditional; Roth uses after-tax equivalent)
- **Current Marginal Tax Rate:** Your current federal tax bracket (not effective rate)
- **Expected Retirement Tax Rate:** Your expected tax bracket in retirement
- **Years Until Retirement:** How long the money will grow
- **Expected Annual Return:** Investment growth assumption (7% is inflation-adjusted historical average)

---

## Calculations

### Core Concepts

**Traditional IRA:**
- Contribute pre-tax dollars (e.g., $7,000)
- Money grows tax-deferred
- Pay income tax on withdrawals

**Roth IRA:**
- Contribute after-tax dollars (e.g., $7,000 - taxes = $5,460 at 22%)
- Money grows tax-free
- No tax on qualified withdrawals

**Key Insight:**
If tax rates are the SAME now and in retirement, both end up identical:
- Traditional: $7,000 × growth × (1 - tax rate)
- Roth: ($7,000 × (1 - tax rate)) × growth

The difference comes when tax rates differ.

### Core Formula

```
Traditional Final Value (after tax):
traditionalFinal = contribution × (1 + return)^years × (1 - retirementTaxRate)

Roth Final Value:
rothFinal = contribution × (1 - currentTaxRate) × (1 + return)^years

Break-Even Tax Rate:
If current rate < retirement rate → Traditional wins
If current rate > retirement rate → Roth wins
If rates equal → Same result
```

### TypeScript Implementation

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
    contribution: number;         // Pre-tax amount
    futureValuePreTax: number;    // Before retirement taxes
    taxOnWithdrawal: number;
    futureValueAfterTax: number;  // What you actually get
  };
  roth: {
    contribution: number;         // After-tax amount invested
    taxPaidUpfront: number;
    futureValue: number;          // Tax-free
  };
  comparison: {
    winner: 'traditional' | 'roth' | 'tie';
    advantage: number;            // Dollars better
    breakEvenTaxRate: number;     // Retirement rate where they're equal
    percentageDifference: number;
  };
  scenarios: TaxScenario[];
}

export interface TaxScenario {
  retirementRate: number;
  traditionalValue: number;
  rothValue: number;
  winner: 'traditional' | 'roth' | 'tie';
}
```

```typescript
// src/lib/calculators/roth-vs-traditional/calculations.ts
import type { CalculatorInputs, CalculatorResults, TaxScenario } from "./types";

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

  // Traditional calculation
  // Full pre-tax amount goes in, grows, then taxed on withdrawal
  const traditionalContribution = annualContribution;
  const growthFactor = Math.pow(1 + returnRate, yearsUntilRetirement);
  const traditionalPreTax = traditionalContribution * growthFactor;
  const traditionalTax = traditionalPreTax * retirementRate;
  const traditionalAfterTax = traditionalPreTax - traditionalTax;

  // Roth calculation
  // After-tax amount goes in, grows tax-free
  const rothTaxPaid = annualContribution * currentRate;
  const rothContribution = annualContribution - rothTaxPaid;
  const rothFinal = rothContribution * growthFactor;

  // Comparison
  const difference = rothFinal - traditionalAfterTax;
  let winner: 'traditional' | 'roth' | 'tie';
  if (Math.abs(difference) < 1) {
    winner = 'tie';
  } else if (difference > 0) {
    winner = 'roth';
  } else {
    winner = 'traditional';
  }

  // Break-even retirement tax rate
  // Roth = Traditional (after tax)
  // contribution × (1 - currentRate) × growth = contribution × growth × (1 - breakEvenRate)
  // (1 - currentRate) = (1 - breakEvenRate)
  // breakEvenRate = currentRate (when rates equal, they're equal!)
  const breakEvenTaxRate = currentTaxRate;

  // Generate scenarios at different retirement tax rates
  const scenarios: TaxScenario[] = [10, 12, 22, 24, 32, 35, 37].map(rate => {
    const scenarioRate = rate / 100;
    const tradValue = traditionalPreTax * (1 - scenarioRate);
    const scenarioWinner = rothFinal > tradValue ? 'roth' :
                          rothFinal < tradValue ? 'traditional' : 'tie';
    return {
      retirementRate: rate,
      traditionalValue: tradValue,
      rothValue: rothFinal,
      winner: scenarioWinner,
    };
  });

  return {
    traditional: {
      contribution: traditionalContribution,
      futureValuePreTax: traditionalPreTax,
      taxOnWithdrawal: traditionalTax,
      futureValueAfterTax: traditionalAfterTax,
    },
    roth: {
      contribution: rothContribution,
      taxPaidUpfront: rothTaxPaid,
      futureValue: rothFinal,
    },
    comparison: {
      winner,
      advantage: Math.abs(difference),
      breakEvenTaxRate,
      percentageDifference: (Math.abs(difference) / Math.min(rothFinal, traditionalAfterTax)) * 100,
    },
    scenarios,
  };
}
```

### Edge Cases
- **Same tax rates:** Show as tie, explain rates must differ for one to win
- **Zero contribution:** Show $0 for both
- **Very long timeline:** Large numbers, use compact formatting
- **0% tax rate:** Handle edge case in math

---

## UI Structure

### Sections (top to bottom)
1. **Hero:** "Roth vs. Traditional: Which Saves You More?"
2. **Inputs Card:**
   - Contribution amount
   - Current tax rate (with bracket guidance)
   - Retirement tax rate (with "this is a guess" note)
   - Years until retirement
   - Expected return
3. **Results: Head-to-Head**
   - Two columns showing Traditional | Roth
   - Contribution, growth, taxes, final amount
   - Clear winner indicator
4. **Break-Even Analysis:**
   - "Your break-even retirement rate is X%"
   - If retirement rate > X%, Roth wins
   - If retirement rate < X%, Traditional wins
5. **Scenario Table:**
   - Show both values at various retirement tax rates
   - Highlight current selection
6. **Key Factors Card:**
   - When Traditional is better
   - When Roth is better
   - Other considerations (state taxes, Roth conversion, etc.)
7. **Methodology:** Tax math explained

### Visual Design
- **Primary color usage:** Purple for premium/sophisticated feel
- **Personality:** Analytical, educational, thoughtful
- **Special visualizations:**
  - Side-by-side comparison cards
  - Scenario comparison table
  - Break-even indicator

---

## Files to Create

```
src/
├── app/
│   └── tools/
│       └── roth-vs-traditional/
│           ├── page.tsx
│           └── calculator.tsx
└── lib/
    └── calculators/
        └── roth-vs-traditional/
            ├── types.ts
            └── calculations.ts
```

---

## Registration

Add to `/src/lib/site-config.ts`:

```typescript
{
  id: "roth-vs-traditional",
  name: "Roth vs Traditional Calculator",
  description: "Compare Roth vs Traditional IRA to see which saves you more",
  href: "/tools/roth-vs-traditional",
  categoryId: "investing",
  status: "live",
  primaryColor: "#a855f7",
  designStyle: "analytical",
  inspiredBy: ["FIRE Movement"],
  featured: true,
}
```

---

## Agent Prompt

# Agent Prompt: Roth vs Traditional Calculator

## Your Mission
Build the Roth vs Traditional calculator for ClearMoney. This tool helps users understand which retirement account type saves them more money based on current vs. future tax rates.

## Context
- **Repository:** `/Users/alexchao/projects/clearmoney`
- **Your app directory:** `/src/app/tools/roth-vs-traditional/`
- **Your calculator logic:** `/src/lib/calculators/roth-vs-traditional/`
- **Tech stack:** Next.js 15+, React 19, TypeScript, Tailwind CSS

## Before You Start
1. Read `/docs/app-specs/shared-patterns.md` for required patterns
2. Review `/src/app/tools/bilt-calculator/` for existing patterns

## Design Requirements
- **Primary Color:** Purple (#a855f7) - sophisticated, premium
- **Personality:** Analytical, educational, thoughtful
- **Base:** Dark mode (bg-neutral-950)
- **Mobile-first:** Must work on 375px viewport

## What You're Building
A calculator that compares Roth (pay taxes now, withdraw tax-free) vs. Traditional (defer taxes, pay on withdrawal) retirement accounts. The key insight: if tax rates are the same, both are equal. The decision hinges on whether your tax rate will be higher or lower in retirement.

## User Inputs

| Input | Default | Min | Max | Step |
|-------|---------|-----|-----|------|
| Annual Contribution | $7,000 | $0 | $23,000 | $500 |
| Current Tax Rate | 22% | 0% | 37% | 1% |
| Retirement Tax Rate | 22% | 0% | 37% | 1% |
| Years Until Retirement | 30 | 1 | 50 | 1 |
| Expected Return | 7% | 0% | 12% | 0.5% |

## Calculation Logic

**Traditional:**
```
Goes in pre-tax → Grows tax-deferred → Taxed at withdrawal
Final = contribution × (1 + return)^years × (1 - retirementTaxRate)
```

**Roth:**
```
Taxed now → Goes in after-tax → Grows tax-free
Final = contribution × (1 - currentTaxRate) × (1 + return)^years
```

**Break-even:** When current rate = retirement rate, they're equal.

## Key Outputs
- Traditional: pre-tax contribution, growth, taxes paid, final amount
- Roth: taxes paid upfront, contribution, growth, final amount (tax-free)
- Winner (or tie)
- Advantage amount
- Break-even retirement tax rate
- Scenario table at various retirement rates

## UI Structure

1. **Hero:** "Roth vs Traditional: Which Saves You More?"

2. **Inputs Section:**
   - Contribution slider
   - Current tax rate (with bracket hint: "22% = $44,726-$95,375")
   - Retirement tax rate (with note: "This is your best guess")
   - Years slider
   - Return rate slider

3. **Results Comparison:**
   ```
   TRADITIONAL          |  ROTH
   ---------------------|---------------------
   $7,000 contributed   |  $5,460 contributed
   Grows to $53,267     |  Grows to $41,548
   Tax: $11,719         |  Tax: $1,540 (paid)
   YOU GET: $41,548     |  YOU GET: $41,548
   ```

4. **Winner Card:**
   - "ROTH wins by $X" or "TRADITIONAL wins by $X" or "TIE"
   - Percentage difference
   - Brief explanation

5. **Break-Even Analysis:**
   - "If your retirement tax rate is above X%, Roth wins"
   - Visual indicator of where the break-even is

6. **Scenario Table:**
   ```
   Retirement Rate | Traditional | Roth | Winner
   10%            | $47,940     | $41,548 | Traditional
   22%            | $41,548     | $41,548 | Tie
   35%            | $34,624     | $41,548 | Roth
   ```

7. **Considerations Section:**
   - When Traditional tends to be better
   - When Roth tends to be better
   - Other factors (state taxes, conversion ladder, etc.)

8. **Methodology:** Tax math explained clearly

## Files to Create

1. `/src/app/tools/roth-vs-traditional/page.tsx` - Metadata
2. `/src/app/tools/roth-vs-traditional/calculator.tsx` - Main component
3. `/src/lib/calculators/roth-vs-traditional/types.ts` - Interfaces
4. `/src/lib/calculators/roth-vs-traditional/calculations.ts` - Tax math

## Testing Checklist
- [ ] `npm run build` passes
- [ ] `npm run lint` passes
- [ ] Mobile viewport (375px) works
- [ ] Same tax rates show tie
- [ ] Higher future rate shows Roth winning
- [ ] Lower future rate shows Traditional winning
- [ ] Scenario table updates correctly
- [ ] Edge cases (0% rates, max contributions) work
- [ ] Registered in site-config.ts

## Branch & PR
1. Create branch: `feature/app-roth-vs-traditional`
2. Complete all work
3. Add entry to site-config.ts
4. Create PR with desktop + mobile screenshots

## Do NOT
- Modify shared components
- Give specific tax advice
- Forget state taxes exist (note in considerations)
- Skip the scenario table
- Make assumptions about user's situation

---

## Related Documentation

- Research: `/docs/research/influencer-profiles/fire-movement.md`
- Tool Opportunities: `/docs/research/tool-opportunities/investing.md`
- Shared Patterns: `/docs/app-specs/shared-patterns.md`
