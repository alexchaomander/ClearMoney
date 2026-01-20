# Chase Trifecta Calculator

## Overview

**Slug:** `chase-trifecta`
**Category:** credit-cards
**Primary Color:** Chase Blue (#005EB8)
**Design Style:** analytical

### One-Line Description
Optimize your Chase card combination to maximize Ultimate Rewards points on every purchase.

### Target User
Someone who has or is considering Chase's "trifecta" (Sapphire + Freedom Flex + Freedom Unlimited) and wants to know which card to use for each spending category.

### Problem It Solves
The Chase ecosystem is powerful but complex. With three cards earning different rates in different categories, users need help knowing which card to swipe for each purchase to maximize rewards.

---

## Inspired By

### Influencer Connection
- **The Points Guy (Counter):** TPG covers this with inflated valuations
- **Humphrey Yang:** Visual credit card education
- See: `/docs/research/influencer-profiles/humphrey-yang.md`

### What Existing Tools Get Wrong
- Use inflated point valuations (2+ cpp)
- Don't compare against simpler alternatives
- Assume all spending categories apply equally
- Don't show the actual dollar benefit

### Our Differentiated Approach
- Conservative point valuations (1.0-1.5 cpp)
- Compare vs. 2% cash back baseline
- Let users input THEIR spending categories
- Show annual dollar value, not just points

---

## User Inputs

| Input | Label | Type | Default | Min | Max | Step |
|-------|-------|------|---------|-----|-----|------|
| pointsValue | Points Value (cpp) | slider | 1.25 | 0.5 | 2.0 | 0.05 |
| dining | Dining & Restaurants | slider | 400 | 0 | 2000 | 25 |
| groceries | Groceries | slider | 600 | 0 | 2000 | 50 |
| gas | Gas Stations | slider | 150 | 0 | 500 | 25 |
| travel | Travel (Flights, Hotels) | slider | 200 | 0 | 2000 | 50 |
| streaming | Streaming Services | slider | 50 | 0 | 200 | 10 |
| drugstores | Drugstores | slider | 50 | 0 | 200 | 10 |
| other | Everything Else | slider | 1500 | 0 | 5000 | 100 |

### Card Selection
| Card | Type | Default |
|------|------|---------|
| hasSapphirePreferred | toggle | false |
| hasSapphireReserve | toggle | true |
| hasFreedomFlex | toggle | true |
| hasFreedomUnlimited | toggle | true |

---

## Calculations

### Card Earn Rates

```typescript
const CARD_RATES = {
  sapphirePreferred: {
    travel: 2,
    dining: 3,
    streaming: 3,
    groceries: 3,
    other: 1,
    annualFee: 95,
    portalBonus: 1.25,
  },
  sapphireReserve: {
    travel: 3, // or 5 via portal
    dining: 3,
    streaming: 3,
    groceries: 1,
    other: 1,
    annualFee: 550,
    travelCredit: 300,
    portalBonus: 1.5,
  },
  freedomFlex: {
    rotating: 5, // Quarterly 5x categories
    dining: 3,
    drugstores: 3,
    travel: 5, // Via portal only
    other: 1,
    annualFee: 0,
  },
  freedomUnlimited: {
    everything: 1.5,
    dining: 3,
    drugstores: 3,
    travel: 5, // Via portal only
    annualFee: 0,
  },
};
```

### Core Formula

For each spending category:
1. Find the best card (highest earn rate)
2. Calculate points earned
3. Convert to dollar value using user's cpp

```
categoryValue = monthlySpend × 12 × earnRate × (pointsValue / 100)
totalValue = sum of all category values
netValue = totalValue - totalAnnualFees + credits
vsBaseline = netValue - (totalSpending × 0.02)
```

### TypeScript Implementation

```typescript
// src/lib/calculators/chase-trifecta/types.ts
export interface SpendingInputs {
  dining: number;
  groceries: number;
  gas: number;
  travel: number;
  streaming: number;
  drugstores: number;
  other: number;
}

export interface CardSelection {
  hasSapphirePreferred: boolean;
  hasSapphireReserve: boolean;
  hasFreedomFlex: boolean;
  hasFreedomUnlimited: boolean;
}

export interface CalculatorInputs {
  pointsValue: number;  // cents per point
  spending: SpendingInputs;
  cards: CardSelection;
}

export interface CategoryResult {
  category: string;
  monthlySpend: number;
  bestCard: string;
  earnRate: number;
  annualPoints: number;
  annualValue: number;
}

export interface CalculatorResults {
  categories: CategoryResult[];
  totals: {
    annualSpending: number;
    annualPoints: number;
    annualValue: number;
    annualFees: number;
    annualCredits: number;
    netValue: number;
    cashBackEquivalent: number;
    advantageVsCashBack: number;
    effectiveRate: number;
  };
  recommendation: {
    isWorthIt: boolean;
    message: string;
  };
}
```

```typescript
// src/lib/calculators/chase-trifecta/calculations.ts
import type { CalculatorInputs, CalculatorResults, CategoryResult } from "./types";

export function calculate(inputs: CalculatorInputs): CalculatorResults {
  const { pointsValue, spending, cards } = inputs;
  const cpp = pointsValue / 100;

  // Determine which Sapphire card (can only have one)
  const sapphireCard = cards.hasSapphireReserve ? 'reserve' :
                       cards.hasSapphirePreferred ? 'preferred' : null;

  const categories: CategoryResult[] = [];

  // For each category, find the best card
  // Dining: FF=3x, FU=3x, Sapphire=3x (all tied)
  categories.push(calculateCategory('Dining', spending.dining, 3, 'Freedom Flex / Sapphire', cpp));

  // Groceries: CSP=3x, else FU=1.5x
  const groceryRate = sapphireCard === 'preferred' ? 3 : 1.5;
  const groceryCard = sapphireCard === 'preferred' ? 'Sapphire Preferred' : 'Freedom Unlimited';
  categories.push(calculateCategory('Groceries', spending.groceries, groceryRate, groceryCard, cpp));

  // Gas: Rotating 5x or FU 1.5x
  categories.push(calculateCategory('Gas', spending.gas, 1.5, 'Freedom Unlimited*', cpp));

  // Travel: CSR=3x, CSP=2x, FU=1.5x
  const travelRate = sapphireCard === 'reserve' ? 3 : sapphireCard === 'preferred' ? 2 : 1.5;
  const travelCard = sapphireCard === 'reserve' ? 'Sapphire Reserve' :
                     sapphireCard === 'preferred' ? 'Sapphire Preferred' : 'Freedom Unlimited';
  categories.push(calculateCategory('Travel', spending.travel, travelRate, travelCard, cpp));

  // Streaming: CSP/CSR=3x, FU=1.5x
  const streamRate = sapphireCard ? 3 : 1.5;
  const streamCard = sapphireCard ? 'Sapphire' : 'Freedom Unlimited';
  categories.push(calculateCategory('Streaming', spending.streaming, streamRate, streamCard, cpp));

  // Drugstores: FF=3x, FU=3x
  categories.push(calculateCategory('Drugstores', spending.drugstores, 3, 'Freedom Flex / Unlimited', cpp));

  // Everything else: FU=1.5x
  categories.push(calculateCategory('Everything Else', spending.other, 1.5, 'Freedom Unlimited', cpp));

  // Calculate totals
  const annualSpending = Object.values(spending).reduce((a, b) => a + b, 0) * 12;
  const annualPoints = categories.reduce((sum, c) => sum + c.annualPoints, 0);
  const annualValue = categories.reduce((sum, c) => sum + c.annualValue, 0);

  // Fees and credits
  let annualFees = 0;
  let annualCredits = 0;

  if (cards.hasSapphireReserve) {
    annualFees += 550;
    annualCredits += 300; // Travel credit
  } else if (cards.hasSapphirePreferred) {
    annualFees += 95;
  }
  // FF and FU have no annual fee

  const netValue = annualValue - annualFees + annualCredits;
  const cashBackEquivalent = annualSpending * 0.02;
  const advantageVsCashBack = netValue - cashBackEquivalent;
  const effectiveRate = annualSpending > 0 ? (netValue / annualSpending) * 100 : 0;

  // Recommendation
  const isWorthIt = advantageVsCashBack > 0;
  let message = '';
  if (advantageVsCashBack > 200) {
    message = "Strong value! The Chase Trifecta is working well for your spending.";
  } else if (advantageVsCashBack > 0) {
    message = "Slight advantage over 2% cash back. Make sure you use your points wisely.";
  } else {
    message = "A simple 2% cash back card might be better for your spending pattern.";
  }

  return {
    categories,
    totals: {
      annualSpending,
      annualPoints,
      annualValue,
      annualFees,
      annualCredits,
      netValue,
      cashBackEquivalent,
      advantageVsCashBack,
      effectiveRate,
    },
    recommendation: { isWorthIt, message },
  };
}

function calculateCategory(name: string, monthlySpend: number, rate: number, card: string, cpp: number): CategoryResult {
  const annualSpend = monthlySpend * 12;
  const annualPoints = annualSpend * rate;
  const annualValue = annualPoints * cpp;

  return {
    category: name,
    monthlySpend,
    bestCard: card,
    earnRate: rate,
    annualPoints,
    annualValue,
  };
}
```

---

## UI Structure

### Sections
1. **Hero:** "Optimize Your Chase Trifecta"
2. **Card Selection:** Which Chase cards do you have?
3. **Points Value Slider:** How you value Chase points
4. **Spending Inputs:** Monthly spending by category
5. **Results: Card Routing Table**
   - Which card for each category
   - Points earned per category
6. **Totals Card:**
   - Annual points, value, fees
   - Comparison vs. 2% cash back
7. **Methodology:** Earn rates and assumptions

### Visual Design
- **Primary color usage:** Chase blue (#005EB8)
- **Card visuals:** Miniature card representations
- **Personality:** Clean, organized, data-forward

---

## Agent Prompt

# Agent Prompt: Chase Trifecta Calculator

## Your Mission
Build the Chase Trifecta Calculator for ClearMoney. This tool helps users optimize spending across Chase's card ecosystem.

## Key Features
1. Card selection (which Chase cards user has)
2. Spending input by category
3. Points value slider (conservative default: 1.25 cpp)
4. Card routing table (which card for each category)
5. Total value vs 2% cash back comparison

## Files to Create
1. `/src/app/tools/chase-trifecta/page.tsx`
2. `/src/app/tools/chase-trifecta/calculator.tsx`
3. `/src/lib/calculators/chase-trifecta/types.ts`
4. `/src/lib/calculators/chase-trifecta/calculations.ts`

## Branch: `feature/app-chase-trifecta`

See full spec for calculation details and UI structure.
