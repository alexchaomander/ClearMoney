# TPG Transparency Tool

## Overview

**Slug:** `tpg-transparency`
**Category:** credit-cards
**Primary Color:** Emerald (#10b981)
**Design Style:** analytical

### One-Line Description
See what The Points Guy says vs. what the math actually says—side by side.

### Target User
Someone who has seen TPG credit card recommendations and wants to understand if the advice is genuinely best for them or influenced by affiliate commissions.

### Problem It Solves
TPG makes $50M+ annually from credit card affiliate commissions. Users deserve to know how that might influence recommendations. This tool shows TPG's pitch alongside unbiased math.

---

## Inspired By

### Influencer Connection
- **The Points Guy (Direct Counter):** This is our manifesto tool
- **Accountable.us Research:** TPG business model analysis
- See: `/docs/research/influencer-profiles/the-points-guy.md`

### What Existing Tools Get Wrong
- No one else is doing this
- Most sites have the same affiliate incentives

### Our Differentiated Approach
- Side-by-side comparison
- Show affiliate incentive structure
- Provide objective math
- Educational about media business models

---

## Content Structure

This tool combines data display with optional calculation.

### Cards to Feature

```typescript
interface CardComparison {
  cardName: string;
  issuer: string;
  annualFee: number;
  tpgRating: string;
  tpgValueClaim: string;
  tpgPointValue: number;
  estimatedCommission: string;
  realMath: {
    conservativeValue: number;
    realisticValue: number;
    breakEvenSpend: number;
    betterAlternative: string;
  };
}

const FEATURED_CARDS: CardComparison[] = [
  {
    cardName: "Chase Sapphire Reserve",
    issuer: "Chase",
    annualFee: 550,
    tpgRating: "Best Premium Travel Card",
    tpgValueClaim: "Points worth 2 cents each",
    tpgPointValue: 2.0,
    estimatedCommission: "$200-$500+",
    realMath: {
      conservativeValue: 1.0,
      realisticValue: 1.25,
      breakEvenSpend: 22000,
      betterAlternative: "Capital One Venture X ($395 fee, similar value)",
    },
  },
  {
    cardName: "Amex Platinum",
    issuer: "American Express",
    annualFee: 695,
    tpgRating: "Best Card for Frequent Travelers",
    tpgValueClaim: "$1,500+ in annual value",
    tpgPointValue: 2.0,
    estimatedCommission: "$300-$700+",
    realMath: {
      conservativeValue: 0.7,
      realisticValue: 1.0,
      breakEvenSpend: 50000,
      betterAlternative: "Capital One Venture X or simpler cash back",
    },
  },
  // ... more cards
];
```

---

## UI Structure

### Sections
1. **Hero:** "TPG Says vs. Math Says"
2. **How TPG Makes Money:**
   - Affiliate commission explanation
   - $50M+ annual revenue stat
   - Red Ventures ownership
3. **Card Comparisons:**
   For each card, show two columns:

   ```
   WHAT TPG SAYS              |  WHAT MATH SAYS
   ---------------------------|---------------------------
   ★★★★★ Best Premium Card    |  Net value: -$50/year
   "Points worth 2¢ each"     |  Realistic: 1-1.25¢ each
   "$1,500+ in annual value"  |  IF you use every credit
   [APPLY NOW button visual]  |  Break-even: $22,000 spend
   Commission: ~$400          |  Consider: 2% cash back
   ```

4. **Point Valuation Comparison:**
   - TPG valuations vs ClearMoney valuations
   - Explanation of why they differ
5. **Interactive Calculator:**
   - Pick a card TPG recommends
   - Enter your spending
   - See TPG's claimed value vs realistic value
6. **What To Do Instead:**
   - Questions to ask before applying
   - Simpler alternatives
   - When premium cards DO make sense
7. **Sources:**
   - Accountable.us research
   - Digiday reporting
   - Red Ventures disclosure

### Visual Design
- **Primary color usage:** Emerald for honesty/transparency
- **Personality:** Investigative, educational, empowering
- **Visualizations:**
  - Two-column comparison layout
  - "TPG says" vs "Math says" cards
  - Commission disclosure callouts

---

## Calculation Element

For any TPG-recommended card, calculate:

```typescript
interface TransparencyResult {
  card: string;
  tpgClaimedValue: number;
  tpgPointValue: number;
  realisticValue: {
    conservative: number;
    moderate: number;
    optimistic: number;
  };
  valuationGap: number;  // TPG claim - realistic
  estimatedCommission: string;
  verdict: string;
}
```

---

## Registration

```typescript
{
  id: "tpg-transparency",
  name: "TPG Transparency Tool",
  description: "See what TPG says vs what the math says",
  href: "/tools/tpg-transparency",
  categoryId: "credit-cards",
  status: "live",
  primaryColor: "#10b981",
  designStyle: "analytical",
  inspiredBy: ["The Points Guy (direct counter)"],
  featured: true,
}
```

---

## Agent Prompt

# Agent Prompt: TPG Transparency Tool

## Your Mission
Build the TPG Transparency Tool for ClearMoney. This is our flagship "manifesto" tool that shows users the difference between TPG's affiliate-driven recommendations and objective math.

## Key Features
1. "How TPG Makes Money" explainer
2. Side-by-side card comparisons (TPG Says vs Math Says)
3. Point valuation comparison
4. Optional calculator for user's specific spending
5. Better alternatives section
6. Full source citations

## Key Insight
This isn't about attacking TPG—it's about empowering users. Show the incentive structure, provide the math, let users decide.

## Tone
- Educational, not angry
- Factual, well-sourced
- Empowering, not fear-mongering
- "Here's the full picture so you can decide"

## Important
- Include disclaimer that TPG provides useful content
- Focus on the structural incentive problem, not personal attacks
- Cite sources for all claims about revenue, commissions

## Files to Create
1. `/src/app/tools/tpg-transparency/page.tsx`
2. `/src/app/tools/tpg-transparency/calculator.tsx`
3. `/src/lib/calculators/tpg-transparency/types.ts`
4. `/src/lib/calculators/tpg-transparency/constants.ts` (card data)
5. `/src/lib/calculators/tpg-transparency/calculations.ts`

## Branch: `feature/app-tpg-transparency`

---

## Legal Note
All claims about TPG's business model should be sourced from:
- Digiday reporting
- Accountable.us research
- Public financial disclosures
- Red Ventures announcements

Avoid speculation. State facts.
