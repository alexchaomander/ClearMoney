# Agent Prompt: Chase Trifecta Calculator

## Your Mission

Build the Chase Trifecta Calculator for ClearMoney. This tool helps users optimize their Chase card combination (Sapphire + Freedom cards) to maximize Ultimate Rewards points on every purchase.

## Project Context

**Repository:** You are working in a Next.js 15+ project with React 19, TypeScript, and Tailwind CSS.
**Your app directory:** `/src/app/tools/chase-trifecta/`
**Your calculator logic:** `/src/lib/calculators/chase-trifecta/`
**Branch name:** `feature/app-chase-trifecta`

## Background Research

**The Chase Trifecta:**
Three cards that work together in the Chase Ultimate Rewards ecosystem:

1. **Chase Sapphire Reserve (CSR)** - $550 AF
   - 3x on travel and dining
   - 1x on everything else
   - $300 travel credit
   - 1.5x point multiplier when booking through Chase portal
   - Points transfer to airline/hotel partners

2. **Chase Sapphire Preferred (CSP)** - $95 AF (alternative to CSR)
   - 3x on dining, streaming, online groceries
   - 2x on travel
   - 1x on everything else
   - 1.25x point multiplier through Chase portal

3. **Chase Freedom Flex (CFF)** - $0 AF
   - 5x on rotating quarterly categories (activate required)
   - 3x on dining and drugstores
   - 1x on everything else

4. **Chase Freedom Unlimited (CFU)** - $0 AF
   - 1.5x on everything
   - 3x on dining and drugstores

**The Strategy:** Use the right card for each category, then transfer all points to Sapphire for maximum redemption value.

## Before You Start

1. Read shared patterns: `cat /docs/app-specs/shared-patterns.md`
2. Review existing calculator: `ls -la /src/app/tools/bilt-calculator/`
3. Check shared components: `cat /src/components/shared/index.ts`

## Design Requirements

- **Primary Color:** Chase Blue (#005EB8)
- **Design Style:** Analytical, card-focused
- **Base:** Dark mode (bg-neutral-950)
- **Mobile-first:** Must work on 375px viewport

## User Inputs

### Points Value
| Input | Label | Default | Min | Max | Step |
|-------|-------|---------|-----|-----|------|
| pointsValue | Points Value (cpp) | 1.25 | 0.5 | 2.0 | 0.05 |

### Monthly Spending by Category
| Input | Label | Default | Min | Max | Step |
|-------|-------|---------|-----|-----|------|
| dining | Dining & Restaurants | 400 | 0 | 2000 | 25 |
| groceries | Groceries | 600 | 0 | 2000 | 50 |
| gas | Gas Stations | 150 | 0 | 500 | 25 |
| travel | Travel (Flights, Hotels) | 200 | 0 | 2000 | 50 |
| streaming | Streaming Services | 50 | 0 | 200 | 10 |
| drugstores | Drugstores | 50 | 0 | 200 | 10 |
| other | Everything Else | 1500 | 0 | 5000 | 100 |

### Cards Owned (toggles)
| Card | Default |
|------|---------|
| hasSapphirePreferred | false |
| hasSapphireReserve | true |
| hasFreedomFlex | true |
| hasFreedomUnlimited | true |

Note: User can only have ONE Sapphire card (CSP or CSR, not both)

## Calculation Logic

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
  pointsValue: number;
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
  cardUsage: { card: string; categories: string[]; annualPoints: number }[];
  recommendation: {
    isWorthIt: boolean;
    message: string;
  };
}
```

```typescript
// src/lib/calculators/chase-trifecta/calculations.ts
import type { CalculatorInputs, CalculatorResults, CategoryResult } from "./types";

const CARD_DATA = {
  sapphireReserve: {
    name: 'Sapphire Reserve',
    annualFee: 550,
    travelCredit: 300,
    rates: { dining: 3, travel: 3, streaming: 3, other: 1 },
  },
  sapphirePreferred: {
    name: 'Sapphire Preferred',
    annualFee: 95,
    travelCredit: 0,
    rates: { dining: 3, travel: 2, streaming: 3, groceries: 3, other: 1 },
  },
  freedomFlex: {
    name: 'Freedom Flex',
    annualFee: 0,
    rates: { dining: 3, drugstores: 3, other: 1 },
    // Note: 5x rotating categories not included (unpredictable)
  },
  freedomUnlimited: {
    name: 'Freedom Unlimited',
    annualFee: 0,
    rates: { dining: 3, drugstores: 3, other: 1.5 },
  },
};

export function calculate(inputs: CalculatorInputs): CalculatorResults {
  const { pointsValue, spending, cards } = inputs;
  const cpp = pointsValue;

  // Determine which Sapphire card
  const sapphireCard = cards.hasSapphireReserve ? 'reserve' :
                       cards.hasSapphirePreferred ? 'preferred' : null;

  const categories: CategoryResult[] = [];
  const cardUsageMap: Record<string, { categories: string[], points: number }> = {};

  // Helper to find best card for a category
  function getBestCard(category: string, monthlySpend: number): CategoryResult {
    let bestRate = 0;
    let bestCard = 'Freedom Unlimited'; // Default fallback

    // Check each owned card
    if (cards.hasFreedomUnlimited) {
      const rate = category === 'dining' || category === 'drugstores' ? 3 : 1.5;
      if (rate > bestRate) { bestRate = rate; bestCard = 'Freedom Unlimited'; }
    }

    if (cards.hasFreedomFlex) {
      const rate = category === 'dining' || category === 'drugstores' ? 3 : 1;
      if (rate > bestRate) { bestRate = rate; bestCard = 'Freedom Flex'; }
    }

    if (sapphireCard === 'preferred') {
      const rates: Record<string, number> = { dining: 3, travel: 2, streaming: 3, groceries: 3 };
      const rate = rates[category] || 1;
      if (rate > bestRate) { bestRate = rate; bestCard = 'Sapphire Preferred'; }
    }

    if (sapphireCard === 'reserve') {
      const rates: Record<string, number> = { dining: 3, travel: 3, streaming: 3 };
      const rate = rates[category] || 1;
      if (rate > bestRate) { bestRate = rate; bestCard = 'Sapphire Reserve'; }
    }

    const annualPoints = monthlySpend * 12 * bestRate;
    const annualValue = annualPoints * (cpp / 100);

    // Track card usage
    if (!cardUsageMap[bestCard]) {
      cardUsageMap[bestCard] = { categories: [], points: 0 };
    }
    cardUsageMap[bestCard].categories.push(category);
    cardUsageMap[bestCard].points += annualPoints;

    return {
      category: formatCategoryName(category),
      monthlySpend,
      bestCard,
      earnRate: bestRate,
      annualPoints,
      annualValue,
    };
  }

  // Calculate for each spending category
  categories.push(getBestCard('dining', spending.dining));
  categories.push(getBestCard('groceries', spending.groceries));
  categories.push(getBestCard('gas', spending.gas));
  categories.push(getBestCard('travel', spending.travel));
  categories.push(getBestCard('streaming', spending.streaming));
  categories.push(getBestCard('drugstores', spending.drugstores));
  categories.push(getBestCard('other', spending.other));

  // Calculate totals
  const annualSpending = Object.values(spending).reduce((sum, val) => sum + val * 12, 0);
  const annualPoints = categories.reduce((sum, c) => sum + c.annualPoints, 0);
  const annualValue = categories.reduce((sum, c) => sum + c.annualValue, 0);

  // Calculate fees and credits
  let annualFees = 0;
  let annualCredits = 0;

  if (cards.hasSapphireReserve) {
    annualFees += 550;
    annualCredits += 300; // Travel credit
  }
  if (cards.hasSapphirePreferred) {
    annualFees += 95;
  }
  // Freedom cards are free

  const netValue = annualValue + annualCredits - annualFees;
  const cashBackEquivalent = annualSpending * 0.02;
  const advantageVsCashBack = netValue - cashBackEquivalent;
  const effectiveRate = annualSpending > 0 ? (netValue / annualSpending) * 100 : 0;

  // Card usage summary
  const cardUsage = Object.entries(cardUsageMap).map(([card, data]) => ({
    card,
    categories: data.categories,
    annualPoints: data.points,
  }));

  // Recommendation
  const isWorthIt = advantageVsCashBack > 0;
  let message: string;

  if (advantageVsCashBack > 500) {
    message = `Great fit! You're earning ${effectiveRate.toFixed(1)}% effective return—well above 2% cash back.`;
  } else if (advantageVsCashBack > 0) {
    message = `Marginally better than 2% cash back. Consider if the complexity is worth $${Math.round(advantageVsCashBack)}/year.`;
  } else {
    message = `At your spending levels, a simple 2% cash back card might be better.`;
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
    cardUsage,
    recommendation: { isWorthIt, message },
  };
}

function formatCategoryName(category: string): string {
  const names: Record<string, string> = {
    dining: 'Dining & Restaurants',
    groceries: 'Groceries',
    gas: 'Gas Stations',
    travel: 'Travel',
    streaming: 'Streaming',
    drugstores: 'Drugstores',
    other: 'Everything Else',
  };
  return names[category] || category;
}
```

## UI Structure

### Layout

1. **Hero Section**
   - Title: "Chase Trifecta Calculator"
   - Subtitle: "Optimize your Chase cards to maximize every swipe"

2. **Card Selection Section**
   - Card toggles with card images/icons
   - Show: "You can only have one Sapphire card" warning if both selected
   - Auto-deselect CSP if CSR is selected and vice versa

3. **Points Value Slider**
   - With presets: "Cash (1¢)", "Portal (1.25-1.5¢)", "Transfers (1.5-2¢)"
   - Helper: "How do you typically redeem? Conservative = 1.25¢"

4. **Spending Inputs** (grid layout)
   - Category sliders with icons
   - Show monthly amounts

5. **Results Section**

   **Which Card to Use** (table or cards):
   | Category | Use This Card | Earn Rate | Annual Points | Annual Value |
   |----------|---------------|-----------|---------------|--------------|
   | Dining   | Freedom Flex  | 3x        | 14,400        | $180         |
   | ...      | ...           | ...       | ...           | ...          |

6. **Totals Card**
   - Total annual points
   - Total annual value
   - Annual fees
   - Credits (travel credit)
   - **Net Value** (large)
   - Effective return rate
   - vs 2% cash back comparison

7. **Card Usage Summary**
   - Visual showing which card to use for what
   - "Your Freedom Unlimited: Gas, Other → 45,000 pts"

8. **Recommendation Banner**
   - Is it worth it? Yes/No with explanation

9. **Methodology Section** (collapsible)
   - Explain the earn rates
   - Why we use conservative cpp
   - Note about rotating 5x categories (not included—unpredictable)

## Files to Create

```
src/
├── app/tools/chase-trifecta/
│   ├── page.tsx
│   └── calculator.tsx
└── lib/calculators/chase-trifecta/
    ├── types.ts
    └── calculations.ts
```

## Registration

Add to `/src/lib/site-config.ts`:

```typescript
{
  id: "chase-trifecta",
  name: "Chase Trifecta Calculator",
  description: "Optimize your Chase card combination for maximum rewards",
  href: "/tools/chase-trifecta",
  categoryId: "credit-cards",
  status: "live",
  primaryColor: "#005EB8",
  designStyle: "analytical",
  inspiredBy: ["Humphrey Yang"],
  featured: true,
}
```

## Testing Checklist

- [ ] `npm run build` passes
- [ ] `npm run lint` passes
- [ ] Mobile viewport (375px) works
- [ ] Can't select both CSP and CSR
- [ ] No Sapphire card → only Freedom cards used
- [ ] Effective rate calculation is correct
- [ ] Net value accounts for fees and credits
- [ ] Category recommendations make sense
- [ ] Zero spending in a category handled gracefully

## Test Scenarios

**Standard Trifecta (CSR + CFF + CFU):**
- Dining $400/mo → Freedom Flex (3x) or CSR (3x)
- Groceries $600/mo → Freedom Unlimited (1.5x)
- Gas $150/mo → Freedom Unlimited (1.5x)*
- Travel $200/mo → Sapphire Reserve (3x)

*Note: Gas could be 5x on Freedom Flex during rotating quarters, but we use conservative 1.5x

## Git Workflow

```bash
git checkout -b feature/app-chase-trifecta
# ... build the app ...
git add .
git commit -m "Add Chase Trifecta Calculator"
git push -u origin feature/app-chase-trifecta
```

## Do NOT

- Modify shared components
- Include rotating 5x categories (too unpredictable)
- Allow selecting both CSP and CSR
- Forget the $300 travel credit for CSR
- Use inflated point valuations (keep 1.25 cpp default)
