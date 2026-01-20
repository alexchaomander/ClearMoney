# Points Valuation Dashboard

## Overview

**Slug:** `points-valuation`
**Category:** credit-cards
**Primary Color:** Blue (#3b82f6)
**Design Style:** analytical

### One-Line Description
Our transparent, methodology-backed valuations for major points and miles currencies.

### Target User
Someone who wants to understand what their credit card points are actually worth, without the inflated valuations from affiliate-driven sites.

### Problem It Solves
TPG and similar sites publish point valuations that make points appear more valuable to drive credit card applications. We provide conservative, transparent valuations with clear methodology.

---

## Inspired By

### Influencer Connection
- **The Points Guy (Counter):** Transparent alternative to inflated valuations
- **US Credit Card Guide:** Philosophy of realistic redemption values
- See: `/docs/research/influencer-profiles/the-points-guy.md`

### What Existing Tools Get Wrong
- Use aspirational redemptions (first class flights) to set values
- Don't explain methodology
- Update infrequently
- Influenced by affiliate relationships

### Our Differentiated Approach
- Show conservative, moderate, and optimistic valuations
- Explain methodology for each currency
- Compare our values to TPG's
- Based on realistic redemption scenarios

---

## Content (Not Interactive Calculator)

This app is primarily informational, showing our valuations with interactive exploration.

### Currencies Covered

```typescript
interface CurrencyValuation {
  currency: string;
  issuer: string;
  conservativeValue: number;  // cents per point
  moderateValue: number;
  optimisticValue: number;
  tpgValue: number;           // for comparison
  methodology: string;
  bestRedemptions: string[];
  lastUpdated: Date;
}

const VALUATIONS: CurrencyValuation[] = [
  {
    currency: "Chase Ultimate Rewards",
    issuer: "Chase",
    conservativeValue: 1.0,
    moderateValue: 1.25,
    optimisticValue: 1.5,
    tpgValue: 2.0,
    methodology: "Conservative: Cash back via Pay Yourself Back. Moderate: Chase Travel Portal. Optimistic: Transfer partners for premium economy/business.",
    bestRedemptions: [
      "Hyatt transfers (often 2+ cpp)",
      "Chase Travel Portal (1.25-1.5x)",
      "Pay Yourself Back (1.0-1.25x)",
    ],
    lastUpdated: new Date("2026-01-01"),
  },
  {
    currency: "Amex Membership Rewards",
    issuer: "American Express",
    conservativeValue: 0.7,
    moderateValue: 1.0,
    optimisticValue: 1.5,
    tpgValue: 2.0,
    methodology: "Conservative: Statement credit. Moderate: Travel transfers for economy. Optimistic: Business/first class via ANA or Virgin.",
    bestRedemptions: [
      "ANA business class (2+ cpp)",
      "Virgin Atlantic Upper Class",
      "Schwab cash out (1.1 cpp)",
    ],
    lastUpdated: new Date("2026-01-01"),
  },
  {
    currency: "Capital One Miles",
    issuer: "Capital One",
    conservativeValue: 0.8,
    moderateValue: 1.0,
    optimisticValue: 1.25,
    tpgValue: 1.85,
    methodology: "Conservative: Portal bookings. Moderate: Transfer partners. Optimistic: Partner sweet spots.",
    bestRedemptions: [
      "Turkish Airlines transfers",
      "Portal bookings (1 cpp)",
      "Transfer partner sweet spots",
    ],
    lastUpdated: new Date("2026-01-01"),
  },
  // ... more currencies
];
```

---

## UI Structure

### Sections
1. **Hero:** "What Are Your Points Actually Worth?"
2. **Methodology Overview:** Our valuation philosophy
3. **Currency Cards:** Each currency with:
   - Our valuations (conservative/moderate/optimistic)
   - TPG's valuation for comparison
   - Best redemption options
   - Detailed methodology link
4. **Quick Calculator:** Enter points, see value range
5. **Why We're Different:** Explain affiliate bias
6. **Update Log:** When valuations were last reviewed

### Visual Design
- **Primary color usage:** Blue for trust/data
- **Personality:** Transparent, data-forward, trustworthy
- **Visualizations:**
  - Valuation comparison bars
  - Our value vs TPG value
  - Currency cards with color coding by issuer

---

## Interactive Element

### Points Value Calculator

```typescript
// Simple calculator
interface PointsInput {
  currency: string;
  amount: number;
  redemptionType: 'conservative' | 'moderate' | 'optimistic';
}

interface PointsResult {
  dollarValue: number;
  tpgValue: number;
  difference: number;
  percentDifference: number;
}
```

---

## Registration

```typescript
{
  id: "points-valuation",
  name: "Points Valuation Dashboard",
  description: "Our transparent valuations for major points currencies",
  href: "/tools/points-valuation",
  categoryId: "credit-cards",
  status: "live",
  primaryColor: "#3b82f6",
  designStyle: "analytical",
  inspiredBy: ["The Points Guy (counter)"],
  featured: false,
}
```

---

## Agent Prompt

# Agent Prompt: Points Valuation Dashboard

## Your Mission
Build the Points Valuation Dashboard for ClearMoney. This displays our transparent, methodology-backed valuations for major points currencies.

## Key Features
1. Currency cards showing our valuations (conservative/moderate/optimistic)
2. TPG comparison for each currency
3. Methodology explanation
4. Simple calculator: "X points = $Y"
5. Best redemption options for each currency

## Key Insight
This is our manifesto in calculator form. Show WHY TPG's valuations are inflated.

## Files to Create
1. `/src/app/tools/points-valuation/page.tsx`
2. `/src/app/tools/points-valuation/calculator.tsx`
3. `/src/lib/calculators/points-valuation/types.ts`
4. `/src/lib/calculators/points-valuation/constants.ts` (valuation data)
5. `/src/lib/calculators/points-valuation/calculations.ts`

## Branch: `feature/app-points-valuation`
