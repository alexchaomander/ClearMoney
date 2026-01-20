# Credit Score Simulator

## Overview

**Slug:** `credit-score-simulator`
**Category:** credit-building
**Primary Color:** Purple (#8b5cf6)
**Design Style:** analytical

### One-Line Description
Simulate how different actions might affect your credit score with our what-if calculator.

### Target User
Someone who wants to understand credit score mechanics and see how potential actions (opening a card, paying down debt, etc.) might impact their score.

### Problem It Solves
Credit scores feel like a black box. This simulator helps users understand the factors and estimate the impact of various actions—without requiring account creation or sharing personal data.

---

## Inspired By

### Influencer Connection
- **Humphrey Yang:** Credit education without the product push
- **Credit Karma (Counter):** We simulate without selling products
- See: `/docs/research/influencer-profiles/humphrey-yang.md`

### What Existing Tools Get Wrong
- Require account creation and data sharing
- Push credit products after simulation
- Don't explain the factors clearly
- Give false precision (exact point predictions)

### Our Differentiated Approach
- No account required
- Educational focus, not product sales
- Show ranges, not exact predictions
- Explain WHY factors matter

---

## User Inputs

### Current Credit Profile
| Input | Label | Type | Default | Min | Max |
|-------|-------|------|---------|-----|-----|
| estimatedScore | Current Score Estimate | slider | 700 | 300 | 850 |
| totalCreditLimit | Total Credit Limit | slider | 20000 | 0 | 100000 |
| currentBalance | Current Balances | slider | 3000 | 0 | 50000 |
| oldestAccountYears | Age of Oldest Account | slider | 5 | 0 | 30 |
| totalAccounts | Number of Accounts | slider | 4 | 1 | 20 |
| recentInquiries | Hard Inquiries (last 12mo) | slider | 1 | 0 | 10 |
| missedPayments | Missed Payments (ever) | slider | 0 | 0 | 10 |

### Actions to Simulate
| Action | Type | Options |
|--------|------|---------|
| payDownDebt | Pay down debt | Amount to pay |
| openNewCard | Open new card | Credit limit |
| closeOldCard | Close old account | Account age |
| missPayment | Miss a payment | - |
| becomeAuthorizedUser | Become AU | Card age/limit |

---

## Calculations

### Credit Score Factors

```typescript
const FACTORS = {
  paymentHistory: 0.35,    // 35%
  creditUtilization: 0.30, // 30%
  creditAge: 0.15,         // 15%
  newCredit: 0.10,         // 10%
  creditMix: 0.10,         // 10%
};
```

### Impact Estimates

```typescript
// These are ESTIMATES based on general credit scoring principles
const IMPACTS = {
  utilization: {
    // Moving utilization from one tier to another
    above30ToBelow10: { min: 20, max: 50 },
    above50ToBelow30: { min: 30, max: 60 },
  },
  newAccount: {
    // Opening a new card
    hardInquiry: { min: -5, max: -10 },
    newAccountEffect: { min: -5, max: -15 },
    lowerUtilization: { min: 0, max: 30 }, // If it lowers utilization
  },
  missedPayment: {
    first30Day: { min: -60, max: -110 },
    subsequent: { min: -40, max: -80 },
  },
  closingAccount: {
    highUtilizationImpact: { min: -10, max: -50 },
    ageImpact: { min: -5, max: -20 },
  },
  authorizedUser: {
    goodHistory: { min: 10, max: 40 },
    badHistory: { min: -20, max: -50 },
  },
};
```

### TypeScript Implementation

```typescript
// src/lib/calculators/credit-score-simulator/types.ts
export interface CreditProfile {
  estimatedScore: number;
  totalCreditLimit: number;
  currentBalance: number;
  oldestAccountYears: number;
  totalAccounts: number;
  recentInquiries: number;
  missedPayments: number;
}

export interface SimulationAction {
  type: 'payDownDebt' | 'openNewCard' | 'closeAccount' | 'missPayment' | 'authorizedUser';
  params: Record<string, number>;
}

export interface FactorAnalysis {
  name: string;
  weight: number;
  currentStatus: 'excellent' | 'good' | 'fair' | 'poor';
  description: string;
}

export interface SimulationResult {
  currentScore: number;
  estimatedNewScore: {
    min: number;
    max: number;
    likely: number;
  };
  change: {
    min: number;
    max: number;
    likely: number;
  };
  factors: FactorAnalysis[];
  warnings: string[];
  explanation: string;
}
```

```typescript
// src/lib/calculators/credit-score-simulator/calculations.ts
import type { CreditProfile, SimulationAction, SimulationResult, FactorAnalysis } from "./types";

export function analyzeProfile(profile: CreditProfile): FactorAnalysis[] {
  // Guard against division by zero when totalCreditLimit is 0
  const utilization = profile.totalCreditLimit > 0
    ? profile.currentBalance / profile.totalCreditLimit
    : 0;

  return [
    {
      name: "Payment History",
      weight: 35,
      currentStatus: profile.missedPayments === 0 ? 'excellent' :
                     profile.missedPayments <= 1 ? 'good' :
                     profile.missedPayments <= 3 ? 'fair' : 'poor',
      description: profile.missedPayments === 0 ?
        "Perfect payment history" :
        `${profile.missedPayments} missed payment(s) on record`,
    },
    {
      name: "Credit Utilization",
      weight: 30,
      currentStatus: utilization < 0.1 ? 'excellent' :
                     utilization < 0.3 ? 'good' :
                     utilization < 0.5 ? 'fair' : 'poor',
      description: `Currently using ${(utilization * 100).toFixed(0)}% of available credit`,
    },
    {
      name: "Credit Age",
      weight: 15,
      currentStatus: profile.oldestAccountYears >= 7 ? 'excellent' :
                     profile.oldestAccountYears >= 4 ? 'good' :
                     profile.oldestAccountYears >= 2 ? 'fair' : 'poor',
      description: `Oldest account is ${profile.oldestAccountYears} years old`,
    },
    {
      name: "New Credit",
      weight: 10,
      currentStatus: profile.recentInquiries === 0 ? 'excellent' :
                     profile.recentInquiries <= 2 ? 'good' :
                     profile.recentInquiries <= 4 ? 'fair' : 'poor',
      description: `${profile.recentInquiries} hard inquiry(s) in the last 12 months`,
    },
    {
      name: "Credit Mix",
      weight: 10,
      currentStatus: profile.totalAccounts >= 5 ? 'excellent' :
                     profile.totalAccounts >= 3 ? 'good' : 'fair',
      description: `${profile.totalAccounts} total accounts`,
    },
  ];
}

export function simulateAction(profile: CreditProfile, action: SimulationAction): SimulationResult {
  const factors = analyzeProfile(profile);
  const warnings: string[] = [];
  let minChange = 0;
  let maxChange = 0;
  let explanation = "";

  switch (action.type) {
    case 'payDownDebt': {
      const paymentAmount = action.params.amount || 0;
      const newBalance = Math.max(0, profile.currentBalance - paymentAmount);
      const oldUtil = profile.currentBalance / profile.totalCreditLimit;
      const newUtil = newBalance / profile.totalCreditLimit;

      if (oldUtil >= 0.3 && newUtil < 0.1) {
        minChange = 20;
        maxChange = 50;
        explanation = "Dropping utilization below 10% typically has a significant positive impact.";
      } else if (oldUtil >= 0.5 && newUtil < 0.3) {
        minChange = 30;
        maxChange = 60;
        explanation = "Moving from high to moderate utilization can substantially improve your score.";
      } else if (newUtil < oldUtil) {
        minChange = 5;
        maxChange = 20;
        explanation = "Any reduction in utilization generally helps, but the impact varies.";
      }
      break;
    }

    case 'openNewCard': {
      const newLimit = action.params.creditLimit || 5000;
      const newTotalLimit = profile.totalCreditLimit + newLimit;
      const newUtil = profile.currentBalance / newTotalLimit;

      minChange = -15; // Hard inquiry + new account
      maxChange = -5;

      // But if it lowers utilization significantly...
      if (profile.currentBalance / profile.totalCreditLimit > 0.3 && newUtil < 0.2) {
        minChange += 10;
        maxChange += 30;
        explanation = "The hard inquiry and new account will hurt short-term, but lower utilization may help medium-term.";
      } else {
        explanation = "New accounts temporarily lower your score due to hard inquiry and reduced average age.";
      }
      warnings.push("Impact is typically temporary (3-6 months for full recovery)");
      break;
    }

    case 'missPayment': {
      minChange = -60;
      maxChange = -110;
      explanation = "A missed payment is one of the most damaging things to your credit score.";
      warnings.push("This negative mark stays on your report for 7 years");
      break;
    }

    // ... other cases
  }

  const likelyChange = (minChange + maxChange) / 2;

  return {
    currentScore: profile.estimatedScore,
    estimatedNewScore: {
      min: Math.max(300, Math.min(850, profile.estimatedScore + minChange)),
      max: Math.max(300, Math.min(850, profile.estimatedScore + maxChange)),
      likely: Math.max(300, Math.min(850, profile.estimatedScore + likelyChange)),
    },
    change: { min: minChange, max: maxChange, likely: likelyChange },
    factors,
    warnings,
    explanation,
  };
}
```

---

## UI Structure

### Sections
1. **Hero:** "What Will Happen to Your Score?"
2. **Current Profile:** Input current credit situation
3. **Factor Analysis:** Visual breakdown of the 5 factors
4. **Action Selector:** Choose what-if scenario
5. **Simulation Result:**
   - Estimated range (NOT a single number)
   - Explanation of impact
   - Warnings/caveats
6. **Disclaimer:** This is educational, not predictive

### Visual Design
- **Primary color usage:** Purple for sophistication
- **Score dial:** Visual gauge showing current and estimated
- **Factor bars:** Horizontal bars showing status
- **Personality:** Educational, empowering, careful with precision

---

## Registration

```typescript
{
  id: "credit-score-simulator",
  name: "Credit Score Simulator",
  description: "Simulate how actions might affect your credit score",
  href: "/tools/credit-score-simulator",
  categoryId: "credit-building",
  status: "live",
  primaryColor: "#8b5cf6",
  designStyle: "analytical",
  inspiredBy: ["Humphrey Yang"],
  featured: true,
}
```

---

## Agent Prompt

# Agent Prompt: Credit Score Simulator

## Your Mission
Build the Credit Score Simulator for ClearMoney. This educational tool helps users understand how various actions might impact their credit score.

## Key Features
1. Input current credit profile (estimated)
2. Show current factor analysis (5 FICO factors)
3. Select action to simulate
4. Show estimated impact as a RANGE (not exact number)
5. Explain why the change happens
6. Include appropriate disclaimers

## CRITICAL: Do NOT give exact predictions
Credit scoring is proprietary. Show ranges and explain factors. Never claim "your score will be exactly X."

## Files to Create
1. `/src/app/tools/credit-score-simulator/page.tsx`
2. `/src/app/tools/credit-score-simulator/calculator.tsx`
3. `/src/lib/calculators/credit-score-simulator/types.ts`
4. `/src/lib/calculators/credit-score-simulator/calculations.ts`

## Branch: `feature/app-credit-score-simulator`
