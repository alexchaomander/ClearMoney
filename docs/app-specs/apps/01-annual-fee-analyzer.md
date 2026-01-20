# Annual Fee Analyzer

## Overview

**Slug:** `annual-fee-analyzer`
**Category:** credit-cards
**Primary Color:** Green (#22c55e)
**Design Style:** analytical

### One-Line Description
Calculate whether any annual fee credit card is actually worth it for YOUR spending patterns.

### Target User
Someone considering a premium credit card (Chase Sapphire Reserve, Amex Platinum, etc.) who wants to know if the annual fee is justified by the benefits they'll actually use.

### Problem It Solves
TPG and other sites push high annual fee cards because they pay higher commissions. Users need an honest calculator that shows the real break-even math based on their actual behavior, not aspirational redemptions.

---

## Inspired By

### Influencer Connection
- **The Points Guy (Counter-position):** We're building what TPG should but can't due to conflicts of interest
- **Graham Stephan:** Frugality mindset—is this expense really worth it?
- See: `/docs/research/influencer-profiles/the-points-guy.md`

### What Existing Tools Get Wrong
- Use inflated point valuations (1.5-2 cents per point when reality is often 1 cent)
- Assume users will use ALL credits (most don't)
- Don't compare against simple cash back alternatives
- Push users toward cards that pay higher commissions

### Our Differentiated Approach
- Conservative point valuations by default
- Explicit "credit usage" percentage (be honest—will you really use the Saks credit?)
- Always compare against a 2% cash back baseline
- Show the spending required to break even

---

## User Inputs

| Input | Label | Type | Default | Min | Max | Step | Format |
|-------|-------|------|---------|-----|-----|------|--------|
| annualFee | Annual Fee | slider | 550 | 0 | 700 | 5 | currency |
| annualSpending | Annual Spending | slider | 30000 | 0 | 200000 | 1000 | currency |
| rewardsRate | Effective Rewards Rate | slider | 2.0 | 0.5 | 5 | 0.1 | percent |
| totalCredits | Annual Credits Value | slider | 300 | 0 | 1000 | 25 | currency |
| creditUtilization | Credit Utilization Rate | slider | 50 | 0 | 100 | 5 | percent |
| pointsValueCpp | Your Points Value | slider | 1.0 | 0.5 | 2.0 | 0.1 | number |

### Input Explanations
- **Annual Fee:** The card's annual fee (e.g., $550 for Chase Sapphire Reserve)
- **Annual Spending:** How much you put on credit cards per year total
- **Effective Rewards Rate:** The card's average earn rate (e.g., 2x = 2%)
- **Total Credits Value:** Sum of annual credits (dining credits, airline credits, etc.)
- **Credit Utilization Rate:** What % of credits will you realistically use? (Be honest!)
- **Points Value:** How you actually redeem—1.0 cpp for cash back, higher for travel

---

## Calculations

### Core Formula
```
Net Annual Value = (Rewards Earned × Points Value) + (Credits × Utilization) - Annual Fee

Rewards Earned = Annual Spending × (Rewards Rate / 100)
Effective Credits = Total Credits × (Credit Utilization / 100)

Comparison Value = Annual Spending × 0.02 (2% cash back baseline)

Break-Even Spending = (Annual Fee - Effective Credits) / ((Rewards Rate - 2) / 100 × Points Value)
```

### TypeScript Implementation

```typescript
// src/lib/calculators/annual-fee-analyzer/types.ts
export interface CalculatorInputs {
  annualFee: number;
  annualSpending: number;
  rewardsRate: number;           // as percentage (e.g., 2.0 for 2%)
  totalCredits: number;
  creditUtilization: number;     // as percentage (e.g., 50 for 50%)
  pointsValueCpp: number;        // cents per point (e.g., 1.0)
}

export interface CalculatorResults {
  netAnnualValue: number;
  rewardsEarned: number;
  effectiveCredits: number;
  totalBenefits: number;
  cashBackComparison: number;
  advantageVsCashBack: number;
  breakEvenSpending: number | null;  // null if impossible
  isWorthIt: boolean;
  verdict: string;
}
```

```typescript
// src/lib/calculators/annual-fee-analyzer/calculations.ts
import type { CalculatorInputs, CalculatorResults } from "./types";

export function calculate(inputs: CalculatorInputs): CalculatorResults {
  const {
    annualFee,
    annualSpending,
    rewardsRate,
    totalCredits,
    creditUtilization,
    pointsValueCpp,
  } = inputs;

  // Calculate rewards earned (in points)
  const pointsEarned = annualSpending * (rewardsRate / 100);

  // Convert points to dollar value
  const rewardsEarned = pointsEarned * (pointsValueCpp / 100);

  // Calculate effective credits (what you'll actually use)
  const effectiveCredits = totalCredits * (creditUtilization / 100);

  // Total benefits before fee
  const totalBenefits = rewardsEarned + effectiveCredits;

  // Net value after fee
  const netAnnualValue = totalBenefits - annualFee;

  // Cash back comparison (2% baseline)
  const cashBackComparison = annualSpending * 0.02;

  // Advantage vs just using 2% cash back
  const advantageVsCashBack = netAnnualValue - cashBackComparison;

  // Break-even spending calculation
  // Only calculate if rewards rate > 2% (otherwise impossible to break even)
  const effectiveRateAdvantage = (rewardsRate * pointsValueCpp / 100) - 0.02;
  let breakEvenSpending: number | null = null;

  if (effectiveRateAdvantage > 0) {
    const netFee = annualFee - effectiveCredits;
    if (netFee > 0) {
      breakEvenSpending = netFee / effectiveRateAdvantage;
    } else {
      breakEvenSpending = 0; // Credits alone cover the fee
    }
  }

  // Determine verdict
  const isWorthIt = advantageVsCashBack > 0;
  let verdict: string;

  if (advantageVsCashBack > 200) {
    verdict = "Strong value for your spending";
  } else if (advantageVsCashBack > 0) {
    verdict = "Marginally worth it";
  } else if (advantageVsCashBack > -100) {
    verdict = "Not quite worth it—consider 2% cash back";
  } else {
    verdict = "Significantly overpaying—switch to cash back";
  }

  return {
    netAnnualValue,
    rewardsEarned,
    effectiveCredits,
    totalBenefits,
    cashBackComparison,
    advantageVsCashBack,
    breakEvenSpending,
    isWorthIt,
    verdict,
  };
}
```

### Edge Cases
- **Zero spending:** Return negative net value equal to -(annual fee - credits)
- **Very high credit utilization:** Cap at 100%
- **Low rewards rate:** Break-even may be null (impossible)
- **Credits exceed fee:** Net value positive even with zero spending

---

## UI Structure

### Sections (top to bottom)
1. **Hero:** "Is That Annual Fee Worth It?" with subtitle about honest math
2. **Inputs Card:**
   - Card info section (fee, rewards rate)
   - Spending section
   - Credits section with "Be honest!" note
   - Points value with presets (1.0 cpp cash, 1.25 cpp Chase, 1.5 cpp optimistic)
3. **Results Card:**
   - Net annual value (primary, large)
   - Breakdown: rewards earned, credits used, fee paid
   - Comparison vs 2% cash back
   - Clear verdict
4. **Break-Even Section:**
   - "You need to spend $X per year to break even"
   - Or "This card can't beat 2% cash back for your redemption style"
5. **Methodology:** Expandable section explaining calculations

### Visual Design
- **Primary color usage:** Green for positive values, neutral for negative
- **Personality:** Honest, transparent, analytical
- **Special visualizations:**
  - Value breakdown bar chart
  - Break-even threshold indicator
  - Verdict badge with color coding

---

## Files to Create

```
src/
├── app/
│   └── tools/
│       └── annual-fee-analyzer/
│           ├── page.tsx           # Metadata + wrapper
│           └── calculator.tsx     # Main component
└── lib/
    └── calculators/
        └── annual-fee-analyzer/
            ├── types.ts           # Interfaces
            └── calculations.ts    # Pure calculation functions
```

---

## Registration

Add to `/src/lib/site-config.ts`:

```typescript
{
  id: "annual-fee-analyzer",
  name: "Annual Fee Analyzer",
  description: "Calculate if any annual fee card is worth it for your spending",
  href: "/tools/annual-fee-analyzer",
  categoryId: "credit-cards",
  status: "live",
  primaryColor: "#22c55e",
  designStyle: "analytical",
  inspiredBy: ["The Points Guy (counter)"],
  featured: true,
}
```

---

## Agent Prompt

# Agent Prompt: Annual Fee Analyzer

## Your Mission
Build the Annual Fee Analyzer calculator for ClearMoney. This tool helps users determine if a credit card's annual fee is justified based on their actual spending and redemption behavior.

## Context
- **Repository:** `/Users/alexchao/projects/clearmoney`
- **Your app directory:** `/src/app/tools/annual-fee-analyzer/`
- **Your calculator logic:** `/src/lib/calculators/annual-fee-analyzer/`
- **Tech stack:** Next.js 15+, React 19, TypeScript, Tailwind CSS

## Before You Start
1. Read `/docs/app-specs/shared-patterns.md` for required patterns
2. Review `/src/app/tools/bilt-calculator/` for existing patterns
3. Ensure shared components exist at `/src/components/shared/`

## Design Requirements
- **Primary Color:** Green (#22c55e) - represents honesty/transparency
- **Personality:** Analytical, honest, no-BS
- **Base:** Dark mode (bg-neutral-950)
- **Mobile-first:** Must work on 375px viewport

## What You're Building
A calculator that takes a credit card's annual fee, rewards rate, and credits, along with the user's spending patterns and redemption preferences, and determines:
1. The net annual value of the card
2. How it compares to a simple 2% cash back card
3. Whether it's worth keeping
4. How much spending is needed to break even

The key insight: Be honest about credit utilization (most people don't use all their credits) and point valuations (most people redeem at ~1 cpp, not 1.5-2 cpp).

## User Inputs

| Input | Label | Default | Min | Max | Step | Format |
|-------|-------|---------|-----|-----|------|--------|
| annualFee | Annual Fee | 550 | 0 | 700 | 5 | currency |
| annualSpending | Annual Spending | 30000 | 0 | 200000 | 1000 | currency |
| rewardsRate | Effective Rewards Rate | 2.0 | 0.5 | 5 | 0.1 | percent |
| totalCredits | Annual Credits Value | 300 | 0 | 1000 | 25 | currency |
| creditUtilization | Credit Utilization Rate | 50 | 0 | 100 | 5 | percent |
| pointsValueCpp | Your Points Value | 1.0 | 0.5 | 2.0 | 0.1 | cpp |

## Calculation Logic

```typescript
// Net value calculation
rewardsEarned = annualSpending × (rewardsRate / 100) × (pointsValueCpp / 100)
effectiveCredits = totalCredits × (creditUtilization / 100)
netAnnualValue = rewardsEarned + effectiveCredits - annualFee

// Cash back comparison (2% baseline)
cashBackValue = annualSpending × 0.02
advantageVsCashBack = netAnnualValue - cashBackValue

// Break-even spending
effectiveRateAdvantage = (rewardsRate × pointsValueCpp / 100) - 0.02
breakEvenSpending = (annualFee - effectiveCredits) / effectiveRateAdvantage
```

## UI Structure
1. **Hero:** "Is That Annual Fee Worth It?" + honest math subtitle
2. **Inputs:** Card details, spending, credits (with "be honest" note), point value
3. **Results:** Net value, breakdown, comparison, verdict
4. **Break-Even:** Spending threshold to justify the card
5. **Methodology:** Expandable calculation explanation

## Special UI Elements
- Point value presets: "Cash Back (1.0¢)", "Chase Portal (1.25¢)", "Travel (1.5¢)"
- Credit utilization with honest guidance: "Most people use 30-50% of available credits"
- Color-coded verdict: Green (worth it), Yellow (marginal), Red (not worth it)

## Files to Create

1. `/src/app/tools/annual-fee-analyzer/page.tsx`
```tsx
import { Metadata } from "next";
import { Calculator } from "./calculator";

export const metadata: Metadata = {
  title: "Annual Fee Analyzer | ClearMoney",
  description: "Calculate if any credit card annual fee is worth it for your actual spending patterns",
};

export default function Page() {
  return <Calculator />;
}
```

2. `/src/app/tools/annual-fee-analyzer/calculator.tsx` - Main client component

3. `/src/lib/calculators/annual-fee-analyzer/types.ts` - TypeScript interfaces

4. `/src/lib/calculators/annual-fee-analyzer/calculations.ts` - Pure calculation functions

## Testing Checklist
- [ ] `npm run build` passes
- [ ] `npm run lint` passes
- [ ] Mobile viewport (375px) works
- [ ] Zero spending shows negative value
- [ ] High credits with low spending shows positive value
- [ ] Break-even calculation handles edge cases
- [ ] Verdict changes appropriately with inputs
- [ ] Registered in site-config.ts

## Branch & PR
1. Create branch: `feature/app-annual-fee-analyzer`
2. Complete all work
3. Add entry to site-config.ts
4. Create PR with desktop + mobile screenshots

## Do NOT
- Modify shared components
- Add new dependencies
- Change other apps or global styles
- Skip mobile testing
- Use inflated point valuations as defaults

---

## Related Documentation

- Research: `/docs/research/influencer-profiles/the-points-guy.md`
- Tool Opportunities: `/docs/research/tool-opportunities/credit-cards.md`
- Shared Patterns: `/docs/app-specs/shared-patterns.md`
