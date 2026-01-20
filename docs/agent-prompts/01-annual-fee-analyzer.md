# Agent Prompt: Annual Fee Analyzer

## Your Mission

Build the Annual Fee Analyzer calculator for ClearMoney. This tool helps users determine if a credit card's annual fee is justified based on their actual spending and redemption behavior.

## Project Context

**Repository:** You are working in a Next.js 15+ project with React 19, TypeScript, and Tailwind CSS.
**Your app directory:** `/src/app/tools/annual-fee-analyzer/`
**Your calculator logic:** `/src/lib/calculators/annual-fee-analyzer/`
**Branch name:** `feature/app-annual-fee-analyzer`

## Background Research

This tool counters The Points Guy (TPG) and similar affiliate-driven sites that:
- Use inflated point valuations (1.5-2 cpp when reality is often 1 cpp)
- Assume users will use ALL credits (most don't)
- Push high-fee cards because they pay higher commissions ($200-500+ per approval)

Our approach is honest: conservative valuations, realistic credit usage, and comparison against a simple 2% cash back baseline.

## Before You Start

1. Read the shared patterns: `cat /docs/app-specs/shared-patterns.md`
2. Review existing calculator for patterns: `ls -la /src/app/tools/bilt-calculator/`
3. Check shared components: `cat /src/components/shared/index.ts`

## Design Requirements

- **Primary Color:** Green (#22c55e) - represents honesty/transparency
- **Design Style:** Analytical, honest, no-BS
- **Base:** Dark mode (bg-neutral-950)
- **Mobile-first:** Must work on 375px viewport

## User Inputs

| Input | Label | Default | Min | Max | Step | Format |
|-------|-------|---------|-----|-----|------|--------|
| annualFee | Annual Fee | 550 | 0 | 700 | 5 | currency |
| annualSpending | Annual Spending | 30000 | 0 | 200000 | 1000 | currency |
| rewardsRate | Effective Rewards Rate | 2.0 | 0.5 | 5 | 0.1 | percent |
| totalCredits | Annual Credits Value | 300 | 0 | 1000 | 25 | currency |
| creditUtilization | Credit Utilization Rate | 50 | 0 | 100 | 5 | percent |
| pointsValueCpp | Your Points Value | 1.0 | 0.5 | 2.0 | 0.1 | multiplier |

### Input Explanations (show as helper text)
- **Annual Fee:** The card's annual fee (e.g., $550 for Chase Sapphire Reserve)
- **Annual Spending:** How much you put on credit cards per year total
- **Effective Rewards Rate:** The card's average earn rate (e.g., 2x = 2%)
- **Total Credits Value:** Sum of annual credits (dining credits, airline credits, etc.)
- **Credit Utilization Rate:** What % of credits will you realistically use? (Be honest!)
- **Points Value:** How you actually redeem—1.0 for cash back, 1.25-1.5 for travel transfers

## Calculation Logic

```typescript
// src/lib/calculators/annual-fee-analyzer/types.ts
export interface CalculatorInputs {
  annualFee: number;
  annualSpending: number;
  rewardsRate: number;           // as percentage (e.g., 2.0 for 2%)
  totalCredits: number;
  creditUtilization: number;     // as percentage (e.g., 50 for 50%)
  pointsValueCpp: number;        // value multiplier (1.0 = 1cpp baseline, 1.5 = 1.5cpp)
}

export interface CalculatorResults {
  netAnnualValue: number;
  rewardsEarned: number;
  effectiveCredits: number;
  totalBenefits: number;
  cashBackComparison: number;
  advantageVsCashBack: number;
  breakEvenSpending: number | null;  // null if impossible to break even
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

  // Calculate base rewards value (at 1cpp baseline)
  const baseRewards = annualSpending * (rewardsRate / 100);

  // Adjust for actual point value (pointsValueCpp is a multiplier: 1.0 = 1cpp, 1.5 = 1.5cpp)
  const rewardsEarned = baseRewards * pointsValueCpp;

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

## UI Structure

### Layout (top to bottom)
1. **Hero Section**
   - Title: "Is That Annual Fee Worth It?"
   - Subtitle: "Honest math. No affiliate bias. See if your card pays for itself."

2. **Input Card** (rounded-2xl bg-neutral-900 p-6)
   - Section: "Card Details" - annualFee, rewardsRate, totalCredits
   - Section: "Your Usage" - annualSpending, creditUtilization
   - Section: "Point Value" - pointsValueCpp with preset buttons:
     - "Cash Back (1.0¢)"
     - "Chase Portal (1.25¢)"
     - "Travel Transfers (1.5¢)"
   - Add helper text: "Most people use 30-50% of available credits. Be honest!"

3. **Results Card** (use ResultCard component)
   - Primary: Net Annual Value (large, colored based on positive/negative)
   - Breakdown items:
     - "Rewards Earned" → rewardsEarned
     - "Credits Used" → effectiveCredits
     - "Annual Fee" → -annualFee
     - "vs 2% Cash Back" → advantageVsCashBack
   - Verdict badge with color coding

4. **Break-Even Section**
   - If breakEvenSpending exists: "You need to spend ${breakEvenSpending}/year to break even"
   - If null: "At your redemption value, this card can't beat 2% cash back"
   - If 0: "The credits alone cover the annual fee!"

5. **Methodology Section** (collapsible)
   - Explain the calculation
   - Why we use conservative valuations
   - Link to TPG criticism

## Files to Create

```
src/
├── app/tools/annual-fee-analyzer/
│   ├── page.tsx           # Metadata + wrapper
│   └── calculator.tsx     # Main client component
└── lib/calculators/annual-fee-analyzer/
    ├── types.ts           # TypeScript interfaces
    └── calculations.ts    # Pure calculation functions
```

### page.tsx template:
```tsx
import { Metadata } from "next";
import { Calculator } from "./calculator";

export const metadata: Metadata = {
  title: "Annual Fee Analyzer | ClearMoney",
  description: "Calculate if any credit card annual fee is worth it for your actual spending patterns. Honest math, no affiliate bias.",
};

export default function Page() {
  return <Calculator />;
}
```

## Shared Components to Use

```typescript
import { SliderInput } from "@/components/shared/SliderInput";
import { ResultCard } from "@/components/shared/ResultCard";
import { AppShell, MethodologySection, VerdictCard } from "@/components/shared/AppShell";
import { formatCurrency, formatPercent } from "@/lib/shared/formatters";
```

## Registration

Add to `/src/lib/site-config.ts` in the tools array:

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

## Testing Checklist

- [ ] `npm run build` passes
- [ ] `npm run lint` passes
- [ ] Mobile viewport (375px) works correctly
- [ ] Zero spending shows negative net value equal to -(fee - credits)
- [ ] High credits with low spending shows positive value
- [ ] Break-even shows null when rewards rate <= 2% at 1cpp
- [ ] Verdict changes appropriately with different inputs
- [ ] Point value presets update the slider correctly
- [ ] All numbers format correctly (currency, percentages)

## Git Workflow

```bash
git checkout -b feature/app-annual-fee-analyzer
# ... build the app ...
git add .
git commit -m "Add Annual Fee Analyzer calculator"
git push -u origin feature/app-annual-fee-analyzer
# Create PR to main
```

## Do NOT

- Modify shared components in `/src/components/shared/`
- Add new npm dependencies without justification
- Change other apps or global styles
- Skip mobile testing
- Use inflated point valuations as defaults (keep 1.0 cpp default)
