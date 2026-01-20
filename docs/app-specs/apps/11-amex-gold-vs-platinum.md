# Amex Gold vs Platinum Comparison

## Overview

**Slug:** `amex-comparison`
**Category:** credit-cards
**Primary Color:** Gold (#d4a017)
**Design Style:** analytical

### One-Line Description
Compare Amex Gold vs Platinum to see which premium card is better for YOUR spending.

### Target User
Someone considering a premium Amex card who wants to understand if the Platinum's higher fee is worth it compared to the Gold.

### Problem It Solves
This is one of the most searched credit card comparisons. Most results are affiliate-driven. We provide honest math based on actual spending patterns and credit usage.

---

## Inspired By

### Influencer Connection
- **The Points Guy (Counter):** High-traffic comparison done honestly
- **Humphrey Yang:** Visual comparison approach
- See: `/docs/research/influencer-profiles/the-points-guy.md`

### What Existing Tools Get Wrong
- Assume users will use ALL credits
- Inflate point valuations
- Push the higher-fee Platinum (higher commission)
- Don't personalize to spending patterns

### Our Differentiated Approach
- Ask about actual credit usage
- Conservative point valuations
- Side-by-side personalized comparison
- Include "Neither—use cash back instead" as valid option

---

## User Inputs

| Input | Label | Type | Default | Min | Max | Step |
|-------|-------|------|---------|-----|-----|------|
| monthlyDining | Dining (Restaurants) | slider | 500 | 0 | 2000 | 50 |
| monthlyGroceries | U.S. Groceries | slider | 600 | 0 | 2000 | 50 |
| monthlyTravel | Travel (Flights booked direct) | slider | 200 | 0 | 2000 | 50 |
| otherSpending | Other Spending | slider | 1000 | 0 | 5000 | 100 |
| uberUsage | Use Uber Credits? | slider | 80 | 0 | 100 | 10 |
| diningCreditUsage | Use Dining Credits? | slider | 80 | 0 | 100 | 10 |
| saksUsage | Use Saks Credits? | slider | 20 | 0 | 100 | 10 |
| airlineUsage | Use Airline Fee Credits? | slider | 30 | 0 | 100 | 10 |
| clearUsage | Use CLEAR Credit? | toggle | false | - | - | - |
| loungeVisits | Lounge Visits/Year | slider | 5 | 0 | 30 | 1 |
| loungeValue | Value Per Lounge Visit | slider | 30 | 0 | 75 | 5 |
| pointsValue | Point Value (cpp) | slider | 1.0 | 0.5 | 2.0 | 0.1 |

---

## Card Details

### Amex Gold ($250/year)
- **Dining:** 4x points
- **U.S. Supermarkets:** 4x points (up to $25k/year)
- **Flights (direct):** 3x points
- **Other:** 1x points
- **Credits:**
  - $120 Uber credit ($10/month)
  - $120 dining credit ($10/month at select restaurants)

### Amex Platinum ($695/year)
- **Flights (direct):** 5x points
- **Hotels (via Amex Travel):** 5x points
- **Other:** 1x points
- **Credits:**
  - $200 airline fee credit
  - $200 Uber credit ($15/month + $20 December)
  - $100 Saks credit ($50 semi-annual)
  - $100 hotel credit (via FHR)
  - $189 CLEAR credit
  - Plus Centurion Lounge access, other perks

---

## Calculations

### Core Formula

```typescript
// For each card:
annualRewards = sum of (category spend × earn rate × point value)
effectiveCredits = sum of (credit value × usage rate)
annualFee = card.annualFee
loungeValue = loungeVisits × valuePerVisit × hasLoungeAccess

netValue = annualRewards + effectiveCredits + loungeValue - annualFee
```

### TypeScript Implementation

```typescript
// src/lib/calculators/amex-comparison/types.ts
export interface CalculatorInputs {
  monthlyDining: number;
  monthlyGroceries: number;
  monthlyTravel: number;
  otherSpending: number;
  uberUsage: number;
  diningCreditUsage: number;
  saksUsage: number;
  airlineUsage: number;
  clearUsage: boolean;
  loungeVisits: number;
  loungeValue: number;
  pointsValue: number;
}

export interface CardResult {
  cardName: string;
  annualFee: number;
  annualRewards: number;
  effectiveCredits: number;
  loungeValue: number;
  totalBenefits: number;
  netValue: number;
  cashBackEquivalent: number;  // vs 2% cash back
  breakdown: {
    category: string;
    spend: number;
    earnRate: number;
    points: number;
    value: number;
  }[];
  creditBreakdown: {
    credit: string;
    maxValue: number;
    usagePercent: number;
    effectiveValue: number;
  }[];
}

export interface CalculatorResults {
  gold: CardResult;
  platinum: CardResult;
  winner: 'gold' | 'platinum' | 'neither';
  advantage: number;
  recommendation: string;
  breakEvenLoungeVisits: number | null;
}
```

```typescript
// src/lib/calculators/amex-comparison/calculations.ts
import type { CalculatorInputs, CalculatorResults, CardResult } from "./types";

export function calculate(inputs: CalculatorInputs): CalculatorResults {
  const cpp = inputs.pointsValue / 100;

  // Gold calculations
  const goldRewards = calculateGoldRewards(inputs, cpp);
  const goldCredits = calculateGoldCredits(inputs);
  const gold: CardResult = {
    cardName: "Amex Gold",
    annualFee: 250,
    annualRewards: goldRewards.total,
    effectiveCredits: goldCredits.total,
    loungeValue: 0,
    totalBenefits: goldRewards.total + goldCredits.total,
    netValue: goldRewards.total + goldCredits.total - 250,
    cashBackEquivalent: calculateCashBack(inputs),
    breakdown: goldRewards.breakdown,
    creditBreakdown: goldCredits.breakdown,
  };

  // Platinum calculations
  const platRewards = calculatePlatRewards(inputs, cpp);
  const platCredits = calculatePlatCredits(inputs);
  const platLoungeValue = inputs.loungeVisits * inputs.loungeValue;
  const platinum: CardResult = {
    cardName: "Amex Platinum",
    annualFee: 695,
    annualRewards: platRewards.total,
    effectiveCredits: platCredits.total,
    loungeValue: platLoungeValue,
    totalBenefits: platRewards.total + platCredits.total + platLoungeValue,
    netValue: platRewards.total + platCredits.total + platLoungeValue - 695,
    cashBackEquivalent: calculateCashBack(inputs),
    breakdown: platRewards.breakdown,
    creditBreakdown: platCredits.breakdown,
  };

  // Determine winner
  const goldNet = gold.netValue;
  const platNet = platinum.netValue;
  const cashBackNet = gold.cashBackEquivalent; // 2% cash back, no fee

  let winner: 'gold' | 'platinum' | 'neither';
  let advantage: number;
  let recommendation: string;

  if (goldNet > platNet && goldNet > cashBackNet) {
    winner = 'gold';
    advantage = goldNet - Math.max(platNet, cashBackNet);
    recommendation = "Amex Gold is your best choice based on your spending.";
  } else if (platNet > goldNet && platNet > cashBackNet) {
    winner = 'platinum';
    advantage = platNet - Math.max(goldNet, cashBackNet);
    recommendation = "Amex Platinum edges ahead, especially with lounge access.";
  } else {
    winner = 'neither';
    advantage = cashBackNet - Math.max(goldNet, platNet);
    recommendation = "A simple 2% cash back card beats both for your spending pattern.";
  }

  // Break-even lounge visits for Platinum to beat Gold
  const platAdvantageNoLounge = (platRewards.total + platCredits.total - 695) - goldNet;
  const breakEvenLoungeVisits = platAdvantageNoLounge < 0 ?
    Math.ceil(-platAdvantageNoLounge / inputs.loungeValue) : 0;

  return {
    gold,
    platinum,
    winner,
    advantage,
    recommendation,
    breakEvenLoungeVisits,
  };
}

function calculateGoldRewards(inputs: CalculatorInputs, cpp: number) {
  const breakdown = [
    { category: "Dining", spend: inputs.monthlyDining * 12, earnRate: 4, points: 0, value: 0 },
    { category: "U.S. Groceries", spend: Math.min(inputs.monthlyGroceries * 12, 25000), earnRate: 4, points: 0, value: 0 },
    { category: "Flights", spend: inputs.monthlyTravel * 12, earnRate: 3, points: 0, value: 0 },
    { category: "Other", spend: inputs.otherSpending * 12, earnRate: 1, points: 0, value: 0 },
  ];

  breakdown.forEach(item => {
    item.points = item.spend * item.earnRate;
    item.value = item.points * cpp;
  });

  return {
    total: breakdown.reduce((sum, item) => sum + item.value, 0),
    breakdown,
  };
}

// ... similar functions for platinum, credits, etc.
```

---

## UI Structure

### Sections
1. **Hero:** "Amex Gold vs Platinum: Which Is Right for You?"
2. **Spending Inputs:** Monthly spending by category
3. **Credit Usage:** How much of each credit you'll actually use
4. **Platinum Extras:** Lounge visits, CLEAR
5. **Point Value:** Conservative default
6. **Results: Side-by-Side**
   - Gold vs Platinum columns
   - Each showing rewards, credits, fees, net value
7. **Winner Card:**
   - Clear winner (or "neither")
   - Dollar advantage
   - Recommendation
8. **Break-Even Analysis:**
   - "Platinum needs X lounge visits to beat Gold"
9. **Honest Note:** "Neither beats 2% cash back? Consider simplifying."
10. **Methodology**

### Visual Design
- **Primary color usage:** Gold/Platinum card colors
- **Personality:** Premium but honest
- **Visualizations:**
  - Side-by-side card comparison
  - Value breakdown bars
  - Winner highlighting

---

## Registration

```typescript
{
  id: "amex-comparison",
  name: "Amex Gold vs Platinum",
  description: "Compare Amex Gold vs Platinum for your spending",
  href: "/tools/amex-comparison",
  categoryId: "credit-cards",
  status: "live",
  primaryColor: "#d4a017",
  designStyle: "analytical",
  inspiredBy: ["The Points Guy (counter)"],
  featured: true,
}
```

---

## Agent Prompt

# Agent Prompt: Amex Gold vs Platinum Comparison

## Your Mission
Build the Amex Gold vs Platinum comparison for ClearMoney. This is a high-traffic comparison done with honest math.

## Key Features
1. Spending inputs by category
2. Credit usage percentage sliders (be honest!)
3. Lounge value for Platinum
4. Side-by-side comparison
5. Include "Neither—use 2% cash back" as valid outcome

## Key Insight
Most comparisons push Platinum. We show when Gold is better, when neither is worth it.

## Files to Create
1. `/src/app/tools/amex-comparison/page.tsx`
2. `/src/app/tools/amex-comparison/calculator.tsx`
3. `/src/lib/calculators/amex-comparison/types.ts`
4. `/src/lib/calculators/amex-comparison/calculations.ts`

## Branch: `feature/app-amex-comparison`
