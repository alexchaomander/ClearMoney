# Agent Prompt: Points Valuation Dashboard

## Your Mission

Build the Points Valuation Dashboard for ClearMoney. This tool provides transparent, methodology-backed valuations for major points currencies—countering inflated valuations from affiliate-driven sites like The Points Guy.

## Project Context

**Repository:** You are working in a Next.js 15+ project with React 19, TypeScript, and Tailwind CSS.
**Your app directory:** `/src/app/tools/points-valuation/`
**Your calculator logic:** `/src/lib/calculators/points-valuation/`
**Branch name:** `feature/app-points-valuation`

## Background Research

**The Problem with TPG Valuations:**
- TPG values Chase points at 2.0 cpp, Amex at 2.0 cpp
- These are based on premium redemptions most people don't make
- Inflated valuations make high-fee cards look better (more affiliate revenue)

**US Credit Card Guide Criticism:**
> "If you'd never pay $8,000 for a first class ticket, you can't value points based on that redemption"

**Our Methodology:**
1. **Cash baseline:** What's the cash-out value? (Usually ~1 cpp)
2. **Portal value:** What do you get through travel portals? (1.25-1.5 cpp for Chase/Amex)
3. **Realistic transfer value:** Average redemption for common routes (varies)
4. **Conservative estimate:** What most people ACTUALLY get

**Our Valuations vs TPG:**
| Currency | TPG | Our Conservative | Our Optimistic |
|----------|-----|------------------|----------------|
| Chase UR | 2.0 | 1.25 | 1.5 |
| Amex MR | 2.0 | 1.1 | 1.5 |
| Citi TY | 1.7 | 1.0 | 1.25 |
| Capital One | 1.85 | 0.85 | 1.0 |
| Marriott | 0.8 | 0.6 | 0.8 |
| Hilton | 0.5 | 0.4 | 0.5 |
| Hyatt | 1.7 | 1.5 | 1.9 |

## Before You Start

1. Read shared patterns: `cat /docs/app-specs/shared-patterns.md`
2. Review existing calculator: `ls -la /src/app/tools/bilt-calculator/`
3. Check shared components: `cat /src/components/shared/index.ts`

## Design Requirements

- **Primary Color:** Blue (#3b82f6) - trust, data, transparency
- **Design Style:** Data-forward, comparison tables, honest
- **Base:** Dark mode (bg-neutral-950)
- **Mobile-first:** Must work on 375px viewport

## User Inputs

### Points Holdings (optional)
Allow users to input their points balances to see total value:

| Input | Label | Default | Min | Max |
|-------|-------|---------|-----|-----|
| chaseUR | Chase Ultimate Rewards | 0 | 0 | 1000000 |
| amexMR | Amex Membership Rewards | 0 | 0 | 1000000 |
| citiTY | Citi ThankYou | 0 | 0 | 1000000 |
| capitalOne | Capital One Miles | 0 | 0 | 1000000 |
| marriott | Marriott Bonvoy | 0 | 0 | 1000000 |
| hilton | Hilton Honors | 0 | 0 | 1000000 |
| hyatt | World of Hyatt | 0 | 0 | 500000 |

### Redemption Style
| Option | Label | Description |
|--------|-------|-------------|
| conservative | Conservative | Cash/portal redemptions |
| moderate | Moderate | Mix of portal and transfers |
| optimistic | Optimistic | Focus on transfer partners |

## Calculation Logic

```typescript
// src/lib/calculators/points-valuation/types.ts
export interface PointsCurrency {
  id: string;
  name: string;
  shortName: string;
  logo?: string;
  valuations: {
    tpg: number;
    conservative: number;
    moderate: number;
    optimistic: number;
  };
  methodology: {
    cashOut: number;
    portalValue: number | null;
    transferValue: string;  // Description
  };
  bestUses: string[];
  worstUses: string[];
}

export interface UserHoldings {
  [currencyId: string]: number;
}

export type RedemptionStyle = 'conservative' | 'moderate' | 'optimistic';

export interface CalculatorInputs {
  holdings: UserHoldings;
  redemptionStyle: RedemptionStyle;
}

export interface HoldingValuation {
  currency: PointsCurrency;
  points: number;
  ourValue: number;
  tpgValue: number;
  difference: number;      // How much TPG overvalues
  percentDifference: number;
}

export interface CalculatorResults {
  holdings: HoldingValuation[];
  totals: {
    ourValue: number;
    tpgValue: number;
    overvaluation: number;
    percentOvervaluation: number;
  };
  currencies: PointsCurrency[];  // All currencies with valuations
}
```

```typescript
// src/lib/calculators/points-valuation/calculations.ts
import type { CalculatorInputs, CalculatorResults, PointsCurrency, HoldingValuation } from "./types";

export const CURRENCIES: PointsCurrency[] = [
  {
    id: 'chase-ur',
    name: 'Chase Ultimate Rewards',
    shortName: 'Chase UR',
    valuations: { tpg: 2.0, conservative: 1.25, moderate: 1.35, optimistic: 1.5 },
    methodology: {
      cashOut: 1.0,
      portalValue: 1.25, // CSP: 1.25, CSR: 1.5
      transferValue: 'Hyatt transfers often yield 1.5-2cpp',
    },
    bestUses: ['Hyatt transfers', 'Pay Yourself Back', 'Travel portal with CSR'],
    worstUses: ['Amazon checkout (0.8cpp)', 'Cash back without Sapphire'],
  },
  {
    id: 'amex-mr',
    name: 'Amex Membership Rewards',
    shortName: 'Amex MR',
    valuations: { tpg: 2.0, conservative: 1.1, moderate: 1.25, optimistic: 1.5 },
    methodology: {
      cashOut: 0.6, // Terrible cash out
      portalValue: 1.0, // Or statement credits
      transferValue: 'ANA/Virgin transfers can yield 1.5-2cpp',
    },
    bestUses: ['Transfer to ANA', 'Transfer to Virgin Atlantic', 'Schwab cash out (1.1cpp)'],
    worstUses: ['Statement credits', 'Amazon (0.7cpp)'],
  },
  {
    id: 'citi-ty',
    name: 'Citi ThankYou Points',
    shortName: 'Citi TY',
    valuations: { tpg: 1.7, conservative: 1.0, moderate: 1.1, optimistic: 1.25 },
    methodology: {
      cashOut: 1.0,
      portalValue: 1.0,
      transferValue: 'Limited transfer partners, JetBlue can be good',
    },
    bestUses: ['Cash back', 'JetBlue transfers', 'Travel portal'],
    worstUses: ['Gift cards', 'Merchandise'],
  },
  {
    id: 'capital-one',
    name: 'Capital One Miles',
    shortName: 'Cap One',
    valuations: { tpg: 1.85, conservative: 0.85, moderate: 0.9, optimistic: 1.0 },
    methodology: {
      cashOut: 0.5, // Via check
      portalValue: 1.0, // "Erase" purchases
      transferValue: 'Transfer ratios often unfavorable',
    },
    bestUses: ['Erase travel purchases', 'Some transfer partners at 1:1'],
    worstUses: ['Cash out', 'Gift cards'],
  },
  {
    id: 'marriott',
    name: 'Marriott Bonvoy',
    shortName: 'Marriott',
    valuations: { tpg: 0.8, conservative: 0.6, moderate: 0.7, optimistic: 0.8 },
    methodology: {
      cashOut: null,
      portalValue: null,
      transferValue: 'Transfer to airlines at 3:1 ratio',
    },
    bestUses: ['Off-peak hotel stays', '5th night free on 5-night stays'],
    worstUses: ['Peak pricing properties', 'Airline transfers (3:1 ratio)'],
  },
  {
    id: 'hilton',
    name: 'Hilton Honors',
    shortName: 'Hilton',
    valuations: { tpg: 0.5, conservative: 0.4, moderate: 0.45, optimistic: 0.5 },
    methodology: {
      cashOut: null,
      portalValue: null,
      transferValue: 'Devalued over time, 5th night free helps',
    },
    bestUses: ['Standard room redemptions', '5th night free'],
    worstUses: ['Premium properties', 'Points + Cash'],
  },
  {
    id: 'hyatt',
    name: 'World of Hyatt',
    shortName: 'Hyatt',
    valuations: { tpg: 1.7, conservative: 1.5, moderate: 1.7, optimistic: 1.9 },
    methodology: {
      cashOut: null,
      portalValue: null,
      transferValue: 'Best hotel currency, consistent value',
    },
    bestUses: ['Category 1-4 properties', 'Suite upgrades'],
    worstUses: ['All-inclusive resorts (lower cpp)'],
  },
];

export function calculate(inputs: CalculatorInputs): CalculatorResults {
  const { holdings, redemptionStyle } = inputs;

  const holdingValuations: HoldingValuation[] = [];

  for (const currency of CURRENCIES) {
    const points = holdings[currency.id] || 0;
    if (points > 0) {
      const ourCpp = currency.valuations[redemptionStyle];
      const tpgCpp = currency.valuations.tpg;
      const ourValue = points * ourCpp / 100;
      const tpgValue = points * tpgCpp / 100;
      const difference = tpgValue - ourValue;
      const percentDifference = ourValue > 0 ? (difference / ourValue) * 100 : 0;

      holdingValuations.push({
        currency,
        points,
        ourValue,
        tpgValue,
        difference,
        percentDifference,
      });
    }
  }

  // Calculate totals
  const totals = holdingValuations.reduce(
    (acc, h) => ({
      ourValue: acc.ourValue + h.ourValue,
      tpgValue: acc.tpgValue + h.tpgValue,
      overvaluation: acc.overvaluation + h.difference,
      percentOvervaluation: 0, // Calculate after
    }),
    { ourValue: 0, tpgValue: 0, overvaluation: 0, percentOvervaluation: 0 }
  );

  totals.percentOvervaluation = totals.ourValue > 0
    ? (totals.overvaluation / totals.ourValue) * 100
    : 0;

  return {
    holdings: holdingValuations,
    totals,
    currencies: CURRENCIES,
  };
}
```

## UI Structure

### Layout

1. **Hero Section**
   - Title: "Points Valuation Dashboard"
   - Subtitle: "Transparent, methodology-backed valuations. No affiliate bias."

2. **Methodology Selector**
   - Three tabs/buttons: Conservative | Moderate | Optimistic
   - Brief explanation of each

3. **Valuations Table** (main content)
   | Currency | Our Value | TPG Value | Difference | Methodology |
   |----------|-----------|-----------|------------|-------------|
   | Chase UR | 1.25¢ | 2.0¢ | +60% | ... |

   Each row expandable to show:
   - Best uses
   - Worst uses
   - Full methodology

4. **Your Portfolio Section** (optional)
   - Input fields for each currency
   - Shows: "Your points are worth $X (we say) vs $Y (TPG says)"
   - "TPG overvalues your portfolio by $Z (XX%)"

5. **Why Our Valuations Are Different**
   - Explanation of methodology
   - TPG's conflict of interest
   - "If you'd never pay $8,000 for first class..."

6. **Comparison Cards** (visual)
   - Side-by-side: TPG Valuation vs ClearMoney Valuation
   - Show the percentage difference

7. **Methodology Section** (collapsible per currency)
   - Cash out value
   - Portal value
   - Transfer partner value
   - How we arrived at our number

## Files to Create

```
src/
├── app/tools/points-valuation/
│   ├── page.tsx
│   └── calculator.tsx
└── lib/calculators/points-valuation/
    ├── types.ts
    └── calculations.ts
```

## Registration

Add to `/src/lib/site-config.ts`:

```typescript
{
  id: "points-valuation",
  name: "Points Valuation Dashboard",
  description: "Our transparent, methodology-backed valuations for major points currencies",
  href: "/tools/points-valuation",
  categoryId: "credit-cards",
  status: "live",
  primaryColor: "#3b82f6",
  designStyle: "analytical",
  inspiredBy: ["The Points Guy (counter)"],
  featured: false,
}
```

## Testing Checklist

- [ ] `npm run build` passes
- [ ] `npm run lint` passes
- [ ] Mobile viewport (375px) works
- [ ] All 7 currencies display correctly
- [ ] Redemption style changes valuations
- [ ] Portfolio calculator sums correctly
- [ ] TPG overvaluation percentage is correct
- [ ] Methodology expands/collapses

## Git Workflow

```bash
git checkout -b feature/app-points-valuation
# ... build the app ...
git add .
git commit -m "Add Points Valuation Dashboard"
git push -u origin feature/app-points-valuation
```

## Do NOT

- Modify shared components
- Use TPG's exact language (avoid copyright issues)
- Present our valuations as "correct" (they're our methodology)
- Forget to explain WHY we value differently
