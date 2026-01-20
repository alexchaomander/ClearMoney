# Agent Prompt: Amex Gold vs Platinum Comparison

## Your Mission

Build the Amex Gold vs Platinum Comparison tool for ClearMoney. This is one of the most searched credit card comparisons—help users make an honest decision based on their actual spending, not affiliate-driven recommendations.

## Project Context

**Repository:** You are working in a Next.js 15+ project with React 19, TypeScript, and Tailwind CSS.
**Your app directory:** `/src/app/tools/amex-comparison/`
**Your calculator logic:** `/src/lib/calculators/amex-comparison/`
**Branch name:** `feature/app-amex-comparison`

## Background Research

**Amex Gold Card:**
- Annual Fee: $250
- 4x on dining worldwide
- 4x on groceries (up to $25k/year)
- 3x on flights booked directly
- 1x on everything else
- Credits: $120 Uber ($10/mo), $120 dining credits ($10/mo)
- No lounge access

**Amex Platinum Card:**
- Annual Fee: $695
- 5x on flights booked directly or via Amex Travel
- 5x on prepaid hotels via Amex Travel
- 1x on everything else (terrible for daily spending!)
- Credits: $200 airline fee, $200 hotel, $240 digital entertainment, $200 Uber, $100 Saks, more
- Centurion Lounge access
- Hotel status (Marriott Gold, Hilton Gold)

**The Key Insight:**
- Gold is better for EARNING points (4x dining/groceries)
- Platinum is better for USING points and TRAVEL PERKS
- Most comparison sites push Platinum (higher affiliate payout)
- Gold is often the better value for most people

**Common Misconception:**
People think Platinum is the "upgrade" from Gold. They're actually complementary—many enthusiasts have both.

## Before You Start

1. Read shared patterns: `cat /docs/app-specs/shared-patterns.md`
2. Review existing calculator: `ls -la /src/app/tools/bilt-calculator/`
3. Check shared components: `cat /src/components/shared/index.ts`

## Design Requirements

- **Primary Color:** Gold (#d4a017) - premium, luxurious
- **Design Style:** Premium comparison, head-to-head
- **Base:** Dark mode (bg-neutral-950)
- **Mobile-first:** Must work on 375px viewport

## User Inputs

### Monthly Spending
| Input | Label | Default | Min | Max | Step |
|-------|-------|---------|-----|-----|------|
| dining | Dining | 500 | 0 | 3000 | 50 |
| groceries | Groceries | 600 | 0 | 3000 | 50 |
| flights | Flights | 200 | 0 | 2000 | 50 |
| hotels | Hotels | 100 | 0 | 2000 | 50 |
| other | Other Spending | 1000 | 0 | 5000 | 100 |

### Credit Usage
| Input | Label | Default | Min | Max |
|-------|-------|---------|-----|-----|
| uberCreditUsage | Uber Credit Usage | 80 | 0 | 100 |
| diningCreditUsage | Dining Credit Usage (Gold) | 70 | 0 | 100 |
| airlineFeeUsage | Airline Fee Credit Usage | 50 | 0 | 100 |
| hotelCreditUsage | Hotel Credit Usage | 50 | 0 | 100 |
| entertainmentUsage | Digital Entertainment Usage | 60 | 0 | 100 |
| saksUsage | Saks Credit Usage | 30 | 0 | 100 |

### Travel Preferences
| Input | Label | Default |
|-------|-------|---------|
| valuesLoungeAccess | Values Lounge Access | false |
| flightsPerYear | Flights Per Year | 6 |
| pointsValue | Points Value (cpp) | 1.2 |

## Calculation Logic

```typescript
// src/lib/calculators/amex-comparison/types.ts
export interface SpendingInputs {
  dining: number;
  groceries: number;
  flights: number;
  hotels: number;
  other: number;
}

export interface CreditUsage {
  uberCreditUsage: number;       // Both cards
  diningCreditUsage: number;     // Gold only
  airlineFeeUsage: number;       // Platinum only
  hotelCreditUsage: number;      // Platinum only
  entertainmentUsage: number;    // Platinum only
  saksUsage: number;             // Platinum only
}

export interface Preferences {
  valuesLoungeAccess: boolean;
  flightsPerYear: number;
  pointsValue: number;
}

export interface CalculatorInputs {
  spending: SpendingInputs;
  creditUsage: CreditUsage;
  preferences: Preferences;
}

export interface CardAnalysis {
  cardName: string;
  annualFee: number;
  pointsEarned: number;
  pointsValue: number;
  creditsValue: number;
  perksValue: number;
  totalValue: number;
  netValue: number;           // Value - Fee
  effectiveAnnualFee: number; // Fee - Credits
  breakdown: {
    category: string;
    spend: number;
    multiplier: number;
    points: number;
  }[];
  creditsBreakdown: {
    credit: string;
    maxValue: number;
    usage: number;
    value: number;
  }[];
}

export interface CalculatorResults {
  gold: CardAnalysis;
  platinum: CardAnalysis;
  winner: 'gold' | 'platinum' | 'tie';
  difference: number;
  recommendation: string;
  considerations: string[];
}
```

```typescript
// src/lib/calculators/amex-comparison/calculations.ts
import type { CalculatorInputs, CalculatorResults, CardAnalysis } from "./types";

const GOLD = {
  name: 'Amex Gold',
  fee: 250,
  rates: { dining: 4, groceries: 4, flights: 3, hotels: 1, other: 1 },
  credits: {
    uber: { max: 120, monthly: true },
    dining: { max: 120, monthly: true },
  },
};

const PLATINUM = {
  name: 'Amex Platinum',
  fee: 695,
  rates: { dining: 1, groceries: 1, flights: 5, hotels: 5, other: 1 },
  credits: {
    uber: { max: 200, monthly: true },
    airline: { max: 200, annual: true },
    hotel: { max: 200, annual: true },
    entertainment: { max: 240, monthly: true },
    saks: { max: 100, semiannual: true },
  },
  perks: {
    loungeAccessValue: 50, // Per visit estimate
  },
};

export function calculate(inputs: CalculatorInputs): CalculatorResults {
  const { spending, creditUsage, preferences } = inputs;
  const cpp = preferences.pointsValue / 100;

  // Calculate Gold
  const goldBreakdown = [
    { category: 'Dining', spend: spending.dining * 12, multiplier: GOLD.rates.dining, points: 0 },
    { category: 'Groceries', spend: spending.groceries * 12, multiplier: GOLD.rates.groceries, points: 0 },
    { category: 'Flights', spend: spending.flights * 12, multiplier: GOLD.rates.flights, points: 0 },
    { category: 'Hotels', spend: spending.hotels * 12, multiplier: GOLD.rates.hotels, points: 0 },
    { category: 'Other', spend: spending.other * 12, multiplier: GOLD.rates.other, points: 0 },
  ];
  goldBreakdown.forEach(b => b.points = b.spend * b.multiplier);
  const goldPoints = goldBreakdown.reduce((sum, b) => sum + b.points, 0);

  const goldCredits = [
    { credit: 'Uber Credits', maxValue: 120, usage: creditUsage.uberCreditUsage, value: 120 * creditUsage.uberCreditUsage / 100 },
    { credit: 'Dining Credits', maxValue: 120, usage: creditUsage.diningCreditUsage, value: 120 * creditUsage.diningCreditUsage / 100 },
  ];
  const goldCreditsValue = goldCredits.reduce((sum, c) => sum + c.value, 0);

  const gold: CardAnalysis = {
    cardName: GOLD.name,
    annualFee: GOLD.fee,
    pointsEarned: goldPoints,
    pointsValue: goldPoints * cpp,
    creditsValue: goldCreditsValue,
    perksValue: 0,
    totalValue: goldPoints * cpp + goldCreditsValue,
    netValue: goldPoints * cpp + goldCreditsValue - GOLD.fee,
    effectiveAnnualFee: GOLD.fee - goldCreditsValue,
    breakdown: goldBreakdown,
    creditsBreakdown: goldCredits,
  };

  // Calculate Platinum
  const platBreakdown = [
    { category: 'Dining', spend: spending.dining * 12, multiplier: PLATINUM.rates.dining, points: 0 },
    { category: 'Groceries', spend: spending.groceries * 12, multiplier: PLATINUM.rates.groceries, points: 0 },
    { category: 'Flights', spend: spending.flights * 12, multiplier: PLATINUM.rates.flights, points: 0 },
    { category: 'Hotels', spend: spending.hotels * 12, multiplier: PLATINUM.rates.hotels, points: 0 },
    { category: 'Other', spend: spending.other * 12, multiplier: PLATINUM.rates.other, points: 0 },
  ];
  platBreakdown.forEach(b => b.points = b.spend * b.multiplier);
  const platPoints = platBreakdown.reduce((sum, b) => sum + b.points, 0);

  const platCredits = [
    { credit: 'Uber Credits', maxValue: 200, usage: creditUsage.uberCreditUsage, value: 200 * creditUsage.uberCreditUsage / 100 },
    { credit: 'Airline Fee Credit', maxValue: 200, usage: creditUsage.airlineFeeUsage, value: 200 * creditUsage.airlineFeeUsage / 100 },
    { credit: 'Hotel Credit', maxValue: 200, usage: creditUsage.hotelCreditUsage, value: 200 * creditUsage.hotelCreditUsage / 100 },
    { credit: 'Entertainment', maxValue: 240, usage: creditUsage.entertainmentUsage, value: 240 * creditUsage.entertainmentUsage / 100 },
    { credit: 'Saks Credit', maxValue: 100, usage: creditUsage.saksUsage, value: 100 * creditUsage.saksUsage / 100 },
  ];
  const platCreditsValue = platCredits.reduce((sum, c) => sum + c.value, 0);

  // Lounge value
  const loungeValue = preferences.valuesLoungeAccess
    ? preferences.flightsPerYear * PLATINUM.perks.loungeAccessValue
    : 0;

  const platinum: CardAnalysis = {
    cardName: PLATINUM.name,
    annualFee: PLATINUM.fee,
    pointsEarned: platPoints,
    pointsValue: platPoints * cpp,
    creditsValue: platCreditsValue,
    perksValue: loungeValue,
    totalValue: platPoints * cpp + platCreditsValue + loungeValue,
    netValue: platPoints * cpp + platCreditsValue + loungeValue - PLATINUM.fee,
    effectiveAnnualFee: PLATINUM.fee - platCreditsValue - loungeValue,
    breakdown: platBreakdown,
    creditsBreakdown: platCredits,
  };

  // Determine winner
  const difference = gold.netValue - platinum.netValue;
  let winner: 'gold' | 'platinum' | 'tie';
  if (Math.abs(difference) < 50) {
    winner = 'tie';
  } else if (difference > 0) {
    winner = 'gold';
  } else {
    winner = 'platinum';
  }

  // Generate recommendation
  let recommendation: string;
  const considerations: string[] = [];

  if (winner === 'gold') {
    recommendation = `Gold wins by $${Math.round(difference)}/year for your spending patterns.`;
    considerations.push('Gold earns 4x on dining and groceries—great for everyday spending');
    considerations.push('Lower annual fee means less pressure to use credits');
  } else if (winner === 'platinum') {
    recommendation = `Platinum wins by $${Math.round(-difference)}/year, but only if you use the credits.`;
    considerations.push('Platinum is only worth it if you actively use the credits and perks');
    considerations.push('Lounge access adds significant value for frequent travelers');
  } else {
    recommendation = "It's close! Consider which perks matter more to you.";
    considerations.push('Gold for earning points on everyday spending');
    considerations.push('Platinum for travel perks and premium experiences');
  }

  // Add general considerations
  if (gold.effectiveAnnualFee < 0) {
    considerations.push(`Gold effectively pays you $${Math.round(-gold.effectiveAnnualFee)}/year after credits`);
  }

  if (!preferences.valuesLoungeAccess) {
    considerations.push("You marked lounge access as not valuable—that's a big Platinum benefit you'd miss");
  }

  return {
    gold,
    platinum,
    winner,
    difference,
    recommendation,
    considerations,
  };
}
```

## UI Structure

### Layout

1. **Hero Section**
   - Title: "Amex Gold vs Platinum"
   - Subtitle: "Which premium Amex is right for you? Honest comparison."

2. **Card Comparison Header** (visual)
   - Gold card image/icon | VS | Platinum card image/icon
   - Fee: $250 vs $695

3. **Spending Inputs**
   - Monthly spending sliders by category
   - Shows annual totals

4. **Credit Usage Section**
   - "Be honest—what % of these credits will you actually use?"
   - Sliders for each credit type
   - Show which credits apply to which card

5. **Travel Preferences**
   - "Do you value airport lounge access?" toggle
   - "Flights per year" slider
   - Points value slider

6. **Results: Head-to-Head Comparison**

   | | Gold | Platinum |
   |---|------|----------|
   | Annual Fee | $250 | $695 |
   | Points Earned | X | Y |
   | Points Value | $X | $Y |
   | Credits Value | $X | $Y |
   | Perks Value | $0 | $X |
   | **Net Value** | **$X** | **$Y** |
   | Effective Fee | $X | $Y |

7. **Winner Banner**
   - Large display: "Gold wins by $X/year" or similar
   - Visual celebration for winner

8. **Considerations Section**
   - Bullet points of things to think about
   - Personalized based on inputs

9. **Points Earning Breakdown** (expandable)
   - Show category-by-category earning comparison

10. **Methodology Section** (collapsible)
    - How we calculate value
    - Why we don't use inflated cpp
    - Both cards can make sense for different people

## Files to Create

```
src/
├── app/tools/amex-comparison/
│   ├── page.tsx
│   └── calculator.tsx
└── lib/calculators/amex-comparison/
    ├── types.ts
    └── calculations.ts
```

## Registration

Add to `/src/lib/site-config.ts`:

```typescript
{
  id: "amex-comparison",
  name: "Amex Gold vs Platinum",
  description: "Compare Amex Gold vs Platinum to see which is right for you",
  href: "/tools/amex-comparison",
  categoryId: "credit-cards",
  status: "live",
  primaryColor: "#d4a017",
  designStyle: "analytical",
  inspiredBy: ["The Points Guy (counter)"],
  featured: true,
}
```

## Testing Checklist

- [ ] `npm run build` passes
- [ ] `npm run lint` passes
- [ ] Mobile viewport (375px) works
- [ ] High dining/grocery spend → Gold wins
- [ ] High travel spend + lounge value → Platinum wins
- [ ] Low credit usage → Gold wins (lower fee)
- [ ] Effective fee calculations are correct
- [ ] Points calculations match expected values

## Git Workflow

```bash
git checkout -b feature/app-amex-comparison
# ... build the app ...
git add .
git commit -m "Add Amex Gold vs Platinum comparison"
git push -u origin feature/app-amex-comparison
```

## Do NOT

- Modify shared components
- Automatically recommend Platinum (affiliate bias)
- Forget credit usage percentages (key to honest comparison)
- Use inflated point valuations
