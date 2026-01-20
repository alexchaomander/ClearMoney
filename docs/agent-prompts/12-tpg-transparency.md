# Agent Prompt: TPG Transparency Tool

## Your Mission

Build the TPG Transparency Tool for ClearMoney. This is our flagship "counter-positioning" tool that exposes how affiliate incentives might influence credit card recommendations, using The Points Guy as the primary example.

## Project Context

**Repository:** You are working in a Next.js 15+ project with React 19, TypeScript, and Tailwind CSS.
**Your app directory:** `/src/app/tools/tpg-transparency/`
**Your calculator logic:** `/src/lib/calculators/tpg-transparency/`
**Branch name:** `feature/app-tpg-transparency`

## Background Research

**The Points Guy Business Model:**
- Estimated $50M+ annual revenue from affiliate commissions
- $200-$500+ per approved credit card application
- Acquired by Red Ventures (Bankrate) for ~$100M - a $4B marketing company
- 150+ employees, 11M+ monthly visitors
- Point valuations potentially influence recommendations (conflict of interest)

**Key Criticisms (from US Credit Card Guide):**
> "Cents-per-point valuations compare non-cash metrics to cash"
> "If you'd never pay $8,000 for a first class ticket, you can't value points based on that redemption"
> "Valuations perpetuate lifestyle brand and make points appear more valuable to drive card applications"

**Affiliate Payout Estimates (approximate):**
| Card | Estimated Payout |
|------|------------------|
| Chase Sapphire Preferred | $150-200 |
| Chase Sapphire Reserve | $300-400 |
| Amex Gold | $150-200 |
| Amex Platinum | $400-500 |
| Capital One Venture X | $300-400 |
| Citi Premier | $150-200 |

**The Problem:**
- Higher annual fee cards = higher affiliate payouts
- Inflated point valuations make high-fee cards look better
- "Best card" lists often rank by affiliate payout, not user value
- No disclosure of how much sites earn from recommendations

**Our Approach:**
- Transparent methodology
- Conservative valuations based on actual redemption opportunities
- Show what users ACTUALLY get vs what's promoted
- No affiliate links (or clearly disclosed)

## Before You Start

1. Read shared patterns: `cat /docs/app-specs/shared-patterns.md`
2. Review existing calculator: `ls -la /src/app/tools/bilt-calculator/`
3. Check shared components: `cat /src/components/shared/index.ts`

## Design Requirements

- **Primary Color:** Green (#22c55e) - honesty, transparency, truth
- **Design Style:** Exposé, data-driven, journalism-inspired
- **Base:** Dark mode (bg-neutral-950)
- **Mobile-first:** Must work on 375px viewport

## User Inputs

### Card Selection
| Input | Label | Default |
|-------|-------|---------|
| selectedCard | Card to Analyze | "sapphire-preferred" |

### Your Spending (for personalized analysis)
| Input | Label | Default | Min | Max | Step |
|-------|-------|---------|-----|-----|------|
| dining | Monthly Dining | 400 | 0 | 3000 | 50 |
| travel | Monthly Travel | 200 | 0 | 3000 | 50 |
| groceries | Monthly Groceries | 500 | 0 | 3000 | 50 |
| other | Monthly Other | 1500 | 0 | 5000 | 100 |

### Point Redemption Style
| Option | Label | Description |
|--------|-------|-------------|
| cashBack | Cash Back | 1.0 cpp - baseline |
| portal | Travel Portal | 1.25-1.5 cpp - portal bookings |
| transfers | Transfer Partners | 1.5-2.0 cpp - requires expertise |

## Calculation Logic

```typescript
// src/lib/calculators/tpg-transparency/types.ts
export interface CreditCard {
  id: string;
  name: string;
  issuer: string;
  annualFee: number;
  signUpBonus: {
    points: number;
    spendRequired: number;
    timeframe: number; // months
  };
  earnRates: {
    dining: number;
    travel: number;
    groceries: number;
    other: number;
  };
  credits: {
    name: string;
    value: number;
    usability: number; // 0-100% realistic usage
  }[];
  valuations: {
    tpg: number;           // TPG's valuation (cpp)
    conservative: number;  // Our conservative (cpp)
    optimistic: number;    // Our optimistic (cpp)
  };
  estimatedAffiliatePayout: number;
  tpgRanking?: number;     // Where TPG ranks this card
}

export interface SpendingInputs {
  dining: number;
  travel: number;
  groceries: number;
  other: number;
}

export type RedemptionStyle = 'cashBack' | 'portal' | 'transfers';

export interface CalculatorInputs {
  selectedCard: string;
  spending: SpendingInputs;
  redemptionStyle: RedemptionStyle;
}

export interface ValueComparison {
  label: string;
  tpgValue: number;
  ourValue: number;
  difference: number;
  percentInflated: number;
}

export interface CalculatorResults {
  card: CreditCard;

  // Annual value calculations
  annualPointsEarned: number;

  // TPG's math
  tpgPointValue: number;
  tpgAnnualRewardsValue: number;
  tpgCreditsValue: number;
  tpgTotalValue: number;
  tpgNetValue: number;

  // Our math
  ourPointValue: number;
  ourAnnualRewardsValue: number;
  ourCreditsValue: number;
  ourTotalValue: number;
  ourNetValue: number;

  // The difference
  valueDifference: number;
  percentageInflation: number;

  // Affiliate context
  estimatedAffiliatePayout: number;
  affiliateAsPercentOfFee: number;

  // Key insights
  comparisons: ValueComparison[];
  redFlags: string[];
  considerations: string[];
}
```

```typescript
// src/lib/calculators/tpg-transparency/calculations.ts
import type { CalculatorInputs, CalculatorResults, CreditCard, ValueComparison } from "./types";

const CARDS: CreditCard[] = [
  {
    id: 'sapphire-preferred',
    name: 'Chase Sapphire Preferred',
    issuer: 'Chase',
    annualFee: 95,
    signUpBonus: { points: 60000, spendRequired: 4000, timeframe: 3 },
    earnRates: { dining: 3, travel: 2, groceries: 1, other: 1 },
    credits: [
      { name: '$50 Hotel Credit', value: 50, usability: 70 },
    ],
    valuations: { tpg: 2.0, conservative: 1.25, optimistic: 1.5 },
    estimatedAffiliatePayout: 175,
    tpgRanking: 1,
  },
  {
    id: 'sapphire-reserve',
    name: 'Chase Sapphire Reserve',
    issuer: 'Chase',
    annualFee: 550,
    signUpBonus: { points: 60000, spendRequired: 4000, timeframe: 3 },
    earnRates: { dining: 3, travel: 3, groceries: 1, other: 1 },
    credits: [
      { name: '$300 Travel Credit', value: 300, usability: 90 },
    ],
    valuations: { tpg: 2.0, conservative: 1.5, optimistic: 1.75 },
    estimatedAffiliatePayout: 350,
  },
  {
    id: 'amex-gold',
    name: 'American Express Gold',
    issuer: 'Amex',
    annualFee: 250,
    signUpBonus: { points: 60000, spendRequired: 6000, timeframe: 6 },
    earnRates: { dining: 4, travel: 3, groceries: 4, other: 1 },
    credits: [
      { name: '$120 Uber Credits', value: 120, usability: 80 },
      { name: '$120 Dining Credits', value: 120, usability: 70 },
    ],
    valuations: { tpg: 2.0, conservative: 1.1, optimistic: 1.5 },
    estimatedAffiliatePayout: 175,
  },
  {
    id: 'amex-platinum',
    name: 'American Express Platinum',
    issuer: 'Amex',
    annualFee: 695,
    signUpBonus: { points: 80000, spendRequired: 8000, timeframe: 6 },
    earnRates: { dining: 1, travel: 5, groceries: 1, other: 1 },
    credits: [
      { name: '$200 Airline Fee Credit', value: 200, usability: 50 },
      { name: '$200 Hotel Credit', value: 200, usability: 50 },
      { name: '$200 Uber Credits', value: 200, usability: 80 },
      { name: '$240 Entertainment', value: 240, usability: 60 },
      { name: '$100 Saks Credit', value: 100, usability: 30 },
    ],
    valuations: { tpg: 2.0, conservative: 1.1, optimistic: 1.5 },
    estimatedAffiliatePayout: 450,
  },
  {
    id: 'venture-x',
    name: 'Capital One Venture X',
    issuer: 'Capital One',
    annualFee: 395,
    signUpBonus: { points: 75000, spendRequired: 4000, timeframe: 3 },
    earnRates: { dining: 2, travel: 2, groceries: 2, other: 2 },
    credits: [
      { name: '$300 Travel Credit', value: 300, usability: 85 },
      { name: '10K Anniversary Bonus', value: 100, usability: 100 },
    ],
    valuations: { tpg: 1.85, conservative: 0.9, optimistic: 1.0 },
    estimatedAffiliatePayout: 350,
  },
  {
    id: 'citi-premier',
    name: 'Citi Premier',
    issuer: 'Citi',
    annualFee: 95,
    signUpBonus: { points: 60000, spendRequired: 4000, timeframe: 3 },
    earnRates: { dining: 3, travel: 3, groceries: 3, other: 1 },
    credits: [],
    valuations: { tpg: 1.7, conservative: 1.0, optimistic: 1.25 },
    estimatedAffiliatePayout: 150,
  },
];

export function getCards(): CreditCard[] {
  return CARDS;
}

export function calculate(inputs: CalculatorInputs): CalculatorResults {
  const { selectedCard, spending, redemptionStyle } = inputs;

  const card = CARDS.find(c => c.id === selectedCard);
  if (!card) {
    throw new Error(`Card not found: ${selectedCard}`);
  }

  // Calculate annual points earned
  const annualSpending = {
    dining: spending.dining * 12,
    travel: spending.travel * 12,
    groceries: spending.groceries * 12,
    other: spending.other * 12,
  };

  const annualPointsEarned =
    annualSpending.dining * card.earnRates.dining +
    annualSpending.travel * card.earnRates.travel +
    annualSpending.groceries * card.earnRates.groceries +
    annualSpending.other * card.earnRates.other;

  // TPG's math (always uses their inflated valuation)
  const tpgPointValue = card.valuations.tpg;
  const tpgAnnualRewardsValue = annualPointsEarned * tpgPointValue / 100;
  const tpgCreditsValue = card.credits.reduce((sum, c) => sum + c.value, 0);
  const tpgTotalValue = tpgAnnualRewardsValue + tpgCreditsValue;
  const tpgNetValue = tpgTotalValue - card.annualFee;

  // Our math (based on redemption style)
  let ourPointValue: number;
  switch (redemptionStyle) {
    case 'cashBack':
      ourPointValue = 1.0;
      break;
    case 'portal':
      ourPointValue = card.valuations.conservative;
      break;
    case 'transfers':
      ourPointValue = card.valuations.optimistic;
      break;
    default:
      ourPointValue = card.valuations.conservative;
  }

  const ourAnnualRewardsValue = annualPointsEarned * ourPointValue / 100;
  const ourCreditsValue = card.credits.reduce(
    (sum, c) => sum + (c.value * c.usability / 100),
    0
  );
  const ourTotalValue = ourAnnualRewardsValue + ourCreditsValue;
  const ourNetValue = ourTotalValue - card.annualFee;

  // The difference
  const valueDifference = tpgNetValue - ourNetValue;
  const percentageInflation = ourTotalValue > 0
    ? ((tpgTotalValue - ourTotalValue) / ourTotalValue) * 100
    : 0;

  // Affiliate context
  const affiliateAsPercentOfFee = card.annualFee > 0
    ? (card.estimatedAffiliatePayout / card.annualFee) * 100
    : 0;

  // Build comparisons
  const comparisons: ValueComparison[] = [
    {
      label: 'Point Valuation',
      tpgValue: tpgPointValue,
      ourValue: ourPointValue,
      difference: tpgPointValue - ourPointValue,
      percentInflated: ourPointValue > 0 ? ((tpgPointValue - ourPointValue) / ourPointValue) * 100 : 0,
    },
    {
      label: 'Annual Rewards Value',
      tpgValue: tpgAnnualRewardsValue,
      ourValue: ourAnnualRewardsValue,
      difference: tpgAnnualRewardsValue - ourAnnualRewardsValue,
      percentInflated: ourAnnualRewardsValue > 0 ? ((tpgAnnualRewardsValue - ourAnnualRewardsValue) / ourAnnualRewardsValue) * 100 : 0,
    },
    {
      label: 'Credits Value',
      tpgValue: tpgCreditsValue,
      ourValue: ourCreditsValue,
      difference: tpgCreditsValue - ourCreditsValue,
      percentInflated: ourCreditsValue > 0 ? ((tpgCreditsValue - ourCreditsValue) / ourCreditsValue) * 100 : 0,
    },
    {
      label: 'Net Annual Value',
      tpgValue: tpgNetValue,
      ourValue: ourNetValue,
      difference: valueDifference,
      percentInflated: ourNetValue !== 0 ? ((tpgNetValue - ourNetValue) / Math.abs(ourNetValue)) * 100 : 0,
    },
  ];

  // Generate red flags
  const redFlags: string[] = [];

  if (card.estimatedAffiliatePayout > 300) {
    redFlags.push(`High affiliate payout (~$${card.estimatedAffiliatePayout}) may influence recommendations`);
  }

  if (tpgPointValue >= 2.0) {
    redFlags.push(`TPG values ${card.issuer} points at ${tpgPointValue}cpp—most people get far less`);
  }

  if (percentageInflation > 50) {
    redFlags.push(`TPG's valuation is ${Math.round(percentageInflation)}% higher than conservative estimates`);
  }

  if (card.credits.length > 3) {
    redFlags.push('Many credits that may be hard to fully use');
  }

  const lowUsabilityCredits = card.credits.filter(c => c.usability < 60);
  if (lowUsabilityCredits.length > 0) {
    redFlags.push(`${lowUsabilityCredits.length} credit(s) with <60% usability for most people`);
  }

  // Generate considerations
  const considerations: string[] = [];

  if (ourNetValue < 0) {
    considerations.push(`Based on your spending, this card may cost you $${Math.round(-ourNetValue)}/year`);
  } else {
    considerations.push(`Realistic net value: $${Math.round(ourNetValue)}/year (vs TPG's $${Math.round(tpgNetValue)})`);
  }

  if (redemptionStyle === 'cashBack') {
    considerations.push("You're using cash back valuation—the safest baseline");
  } else if (redemptionStyle === 'transfers') {
    considerations.push('Transfer partner value requires research and flexibility');
  }

  considerations.push(`Estimated affiliate payout: $${card.estimatedAffiliatePayout} (${Math.round(affiliateAsPercentOfFee)}% of annual fee)`);

  return {
    card,
    annualPointsEarned,
    tpgPointValue,
    tpgAnnualRewardsValue,
    tpgCreditsValue,
    tpgTotalValue,
    tpgNetValue,
    ourPointValue,
    ourAnnualRewardsValue,
    ourCreditsValue,
    ourTotalValue,
    ourNetValue,
    valueDifference,
    percentageInflation,
    estimatedAffiliatePayout: card.estimatedAffiliatePayout,
    affiliateAsPercentOfFee,
    comparisons,
    redFlags,
    considerations,
  };
}
```

## UI Structure

### Layout

1. **Hero Section**
   - Title: "TPG Transparency Tool"
   - Subtitle: "What affiliate sites don't tell you about credit card recommendations"
   - Bold statement: "Follow the money."

2. **The Problem Section** (educational)
   - How affiliate marketing works in credit cards
   - Conflict of interest explanation
   - "The Points Guy earns an estimated $X per signup..."

3. **Card Selector**
   - Dropdown/cards to select which card to analyze
   - Show card image/logo

4. **Your Spending Section**
   - Monthly spending sliders
   - Redemption style selector (Cash Back / Portal / Transfers)

5. **Side-by-Side Comparison** (main feature)

   | Metric | TPG Says | Reality |
   |--------|----------|---------|
   | Point Value | 2.0 cpp | 1.25 cpp |
   | Annual Rewards | $X | $Y |
   | Credits Value | $X | $Y |
   | Net Value | $X | $Y |

6. **The Inflation Meter**
   - Visual showing how much TPG inflates the value
   - "TPG's valuation is X% higher than conservative estimates"

7. **Affiliate Context Section**
   - Estimated affiliate payout for this card
   - "As % of annual fee"
   - "This is what the recommender earns when you sign up"

8. **Red Flags Section**
   - Bulleted list of concerns
   - Visual warnings

9. **Our Methodology Section** (collapsible)
   - How we calculate conservative values
   - Why TPG valuations are inflated
   - Sources and research

10. **Disclaimer**
    - We're not saying TPG is wrong—just that their valuations serve their business model
    - Users should make their own decisions

## Files to Create

```
src/
├── app/tools/tpg-transparency/
│   ├── page.tsx
│   └── calculator.tsx
└── lib/calculators/tpg-transparency/
    ├── types.ts
    └── calculations.ts
```

## Registration

Add to `/src/lib/site-config.ts`:

```typescript
{
  id: "tpg-transparency",
  name: "TPG Transparency Tool",
  description: "See how affiliate incentives might influence credit card recommendations",
  href: "/tools/tpg-transparency",
  categoryId: "credit-cards",
  status: "live",
  primaryColor: "#22c55e",
  designStyle: "analytical",
  inspiredBy: ["US Credit Card Guide", "Accountable US"],
  featured: true,
}
```

## Testing Checklist

- [ ] `npm run build` passes
- [ ] `npm run lint` passes
- [ ] Mobile viewport (375px) works
- [ ] All 6 cards calculate correctly
- [ ] Redemption style changes valuations
- [ ] Comparisons show correct differences
- [ ] Percentage inflation calculated correctly
- [ ] Red flags appear when appropriate
- [ ] Affiliate payout context displays

## Git Workflow

```bash
git checkout -b feature/app-tpg-transparency
# ... build the app ...
git add .
git commit -m "Add TPG Transparency Tool"
git push -u origin feature/app-tpg-transparency
```

## Important Tone Guidelines

This tool exposes a conflict of interest, but should:
- **Be factual, not accusatory** - "may influence" not "is corrupt"
- **Acknowledge uncertainty** - "estimated" affiliate payouts
- **Let the data speak** - show numbers, let users decide
- **Be fair** - TPG provides value; we're adding transparency
- **Avoid legal issues** - no defamation, stick to facts

## Do NOT

- Modify shared components
- Make defamatory statements about TPG
- Claim exact affiliate payout amounts (always "estimated")
- Present our valuations as definitively "correct"
- Forget the disclaimer section
- Use aggressive or accusatory language
