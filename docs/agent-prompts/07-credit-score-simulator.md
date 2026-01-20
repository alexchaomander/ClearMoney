# Agent Prompt: Credit Score Simulator

## Your Mission

Build the Credit Score Simulator for ClearMoney. This tool helps users understand how different actions might affect their credit score—without requiring account creation or sharing personal data.

## Project Context

**Repository:** You are working in a Next.js 15+ project with React 19, TypeScript, and Tailwind CSS.
**Your app directory:** `/src/app/tools/credit-score-simulator/`
**Your calculator logic:** `/src/lib/calculators/credit-score-simulator/`
**Branch name:** `feature/app-credit-score-simulator`

## Background Research

**FICO Score Factors:**
| Factor | Weight | Description |
|--------|--------|-------------|
| Payment History | 35% | On-time payments, delinquencies |
| Credit Utilization | 30% | Balances vs. limits |
| Credit Age | 15% | Average age of accounts |
| Credit Mix | 10% | Types of credit (cards, loans, mortgage) |
| New Credit | 10% | Recent inquiries and new accounts |

**Key Insights:**
- Utilization under 30% is good, under 10% is excellent
- Each hard inquiry can drop score 5-10 points
- Missing a payment can drop score 60-110 points
- Closing old accounts hurts average age
- Becoming an authorized user can help (if good account)

**Why This Beats Credit Karma:**
- No account required
- No data sharing
- No product pushing
- Educational focus with ranges, not false precision

## Before You Start

1. Read shared patterns: `cat /docs/app-specs/shared-patterns.md`
2. Review existing calculator: `ls -la /src/app/tools/bilt-calculator/`
3. Check shared components: `cat /src/components/shared/index.ts`

## Design Requirements

- **Primary Color:** Purple (#8b5cf6) - sophisticated, premium
- **Design Style:** Educational, analytical
- **Base:** Dark mode (bg-neutral-950)
- **Mobile-first:** Must work on 375px viewport

## User Inputs

### Current Credit Profile
| Input | Label | Default | Min | Max |
|-------|-------|---------|-----|-----|
| estimatedScore | Current Score Estimate | 700 | 300 | 850 |
| totalCreditLimit | Total Credit Limit | 20000 | 0 | 200000 |
| currentBalance | Current Total Balances | 3000 | 0 | 100000 |
| oldestAccountYears | Age of Oldest Account (years) | 5 | 0 | 40 |
| totalAccounts | Number of Accounts | 4 | 1 | 30 |
| recentInquiries | Hard Inquiries (last 12 months) | 1 | 0 | 10 |
| missedPayments | Missed Payments (ever) | 0 | 0 | 20 |

### Actions to Simulate (checkboxes/toggles)
| Action | Parameters |
|--------|------------|
| payDownDebt | Amount to pay down |
| openNewCard | New card credit limit |
| closeAccount | Account age (years) |
| missPayment | (no params) |
| becomeAuthorizedUser | Card age, credit limit |

## Calculation Logic

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
  params: {
    amount?: number;
    creditLimit?: number;
    accountAge?: number;
  };
}

export interface FactorStatus {
  name: string;
  weight: number;
  status: 'excellent' | 'good' | 'fair' | 'poor';
  currentValue: string;
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
  factors: FactorStatus[];
  actionImpacts: {
    action: string;
    impact: { min: number; max: number };
    explanation: string;
  }[];
  warnings: string[];
  recommendation: string;
}
```

```typescript
// src/lib/calculators/credit-score-simulator/calculations.ts
import type { CreditProfile, SimulationAction, SimulationResult, FactorStatus } from "./types";

const IMPACT_RANGES = {
  utilization: {
    above50ToBelow30: { min: 20, max: 50 },
    above30ToBelow10: { min: 10, max: 30 },
    above10ToBelow1: { min: 5, max: 15 },
  },
  newAccount: {
    hardInquiry: { min: -5, max: -10 },
    newAccountAgeImpact: { min: -5, max: -15 },
    utilizationBenefit: { min: 0, max: 30 }, // If it lowers utilization
  },
  missedPayment: {
    first: { min: -60, max: -110 },
    subsequent: { min: -40, max: -80 },
  },
  closingAccount: {
    utilizationImpact: { min: -10, max: -50 }, // If it raises utilization
    ageImpact: { min: -5, max: -20 },
  },
  authorizedUser: {
    goodAccount: { min: 10, max: 40 },
    badAccount: { min: -20, max: -50 },
  },
};

export function analyzeProfile(profile: CreditProfile): FactorStatus[] {
  // Guard against division by zero
  const utilization = profile.totalCreditLimit > 0
    ? profile.currentBalance / profile.totalCreditLimit
    : 0;

  const factors: FactorStatus[] = [
    {
      name: 'Payment History',
      weight: 35,
      status: profile.missedPayments === 0 ? 'excellent' :
              profile.missedPayments <= 1 ? 'good' :
              profile.missedPayments <= 3 ? 'fair' : 'poor',
      currentValue: profile.missedPayments === 0 ? 'Perfect' : `${profile.missedPayments} missed`,
      description: profile.missedPayments === 0
        ? 'Perfect payment history—keep it up!'
        : 'Missed payments hurt your score significantly.',
    },
    {
      name: 'Credit Utilization',
      weight: 30,
      status: utilization < 0.1 ? 'excellent' :
              utilization < 0.3 ? 'good' :
              utilization < 0.5 ? 'fair' : 'poor',
      currentValue: `${(utilization * 100).toFixed(0)}%`,
      description: utilization < 0.1
        ? 'Excellent! Under 10% utilization.'
        : utilization < 0.3
          ? 'Good. Aim for under 10% for best scores.'
          : 'High utilization hurts your score. Pay down balances.',
    },
    {
      name: 'Credit Age',
      weight: 15,
      status: profile.oldestAccountYears >= 10 ? 'excellent' :
              profile.oldestAccountYears >= 5 ? 'good' :
              profile.oldestAccountYears >= 2 ? 'fair' : 'poor',
      currentValue: `${profile.oldestAccountYears} years`,
      description: profile.oldestAccountYears >= 7
        ? 'Established credit history.'
        : 'Newer credit history. Time helps this factor.',
    },
    {
      name: 'Credit Mix',
      weight: 10,
      status: profile.totalAccounts >= 5 ? 'excellent' :
              profile.totalAccounts >= 3 ? 'good' :
              profile.totalAccounts >= 2 ? 'fair' : 'poor',
      currentValue: `${profile.totalAccounts} accounts`,
      description: profile.totalAccounts >= 3
        ? 'Good variety of accounts.'
        : 'Consider diversifying your credit mix over time.',
    },
    {
      name: 'New Credit',
      weight: 10,
      status: profile.recentInquiries === 0 ? 'excellent' :
              profile.recentInquiries <= 2 ? 'good' :
              profile.recentInquiries <= 4 ? 'fair' : 'poor',
      currentValue: `${profile.recentInquiries} inquiries`,
      description: profile.recentInquiries <= 2
        ? 'Low inquiry count is good.'
        : 'Many recent inquiries can lower your score temporarily.',
    },
  ];

  return factors;
}

export function simulate(
  profile: CreditProfile,
  actions: SimulationAction[]
): SimulationResult {
  const factors = analyzeProfile(profile);
  const currentUtilization = profile.totalCreditLimit > 0
    ? profile.currentBalance / profile.totalCreditLimit
    : 0;

  let totalMinChange = 0;
  let totalMaxChange = 0;
  const actionImpacts: SimulationResult['actionImpacts'] = [];
  const warnings: string[] = [];

  // Process each action
  for (const action of actions) {
    let impact = { min: 0, max: 0 };
    let explanation = '';

    switch (action.type) {
      case 'payDownDebt': {
        const payAmount = action.params.amount || 0;
        const newBalance = Math.max(0, profile.currentBalance - payAmount);
        const newUtilization = profile.totalCreditLimit > 0
          ? newBalance / profile.totalCreditLimit
          : 0;

        if (currentUtilization > 0.5 && newUtilization < 0.3) {
          impact = IMPACT_RANGES.utilization.above50ToBelow30;
          explanation = 'Dropping from 50%+ to under 30% utilization has significant positive impact.';
        } else if (currentUtilization > 0.3 && newUtilization < 0.1) {
          impact = IMPACT_RANGES.utilization.above30ToBelow10;
          explanation = 'Getting under 10% utilization is excellent for your score.';
        } else if (newUtilization < currentUtilization) {
          impact = { min: 5, max: 20 };
          explanation = 'Lower utilization generally helps your score.';
        }
        break;
      }

      case 'openNewCard': {
        const newLimit = action.params.creditLimit || 5000;
        // Hard inquiry
        impact.min += IMPACT_RANGES.newAccount.hardInquiry.max;
        impact.max += IMPACT_RANGES.newAccount.hardInquiry.min;

        // New account age impact
        impact.min += IMPACT_RANGES.newAccount.newAccountAgeImpact.max;
        impact.max += IMPACT_RANGES.newAccount.newAccountAgeImpact.min;

        // But might help utilization
        const newTotalLimit = profile.totalCreditLimit + newLimit;
        const newUtilization = newTotalLimit > 0 ? profile.currentBalance / newTotalLimit : 0;
        if (newUtilization < currentUtilization - 0.1) {
          impact.min += 10;
          impact.max += 30;
          explanation = 'Short-term drop from inquiry, but lower utilization may help.';
        } else {
          explanation = 'Expect a temporary drop from the hard inquiry and new account.';
        }

        warnings.push('New cards temporarily lower your score but can help long-term.');
        break;
      }

      case 'closeAccount': {
        const accountAge = action.params.accountAge || 3;

        // Utilization impact (if you have balance)
        if (profile.currentBalance > 0) {
          impact.min += IMPACT_RANGES.closingAccount.utilizationImpact.max;
          impact.max += IMPACT_RANGES.closingAccount.utilizationImpact.min;
        }

        // Age impact (especially if it's your oldest)
        if (accountAge >= profile.oldestAccountYears) {
          impact.min += -20;
          impact.max += -5;
          warnings.push('Closing your oldest account can significantly hurt your credit age.');
          explanation = 'Closing old accounts hurts your average credit age.';
        } else {
          impact.min += -10;
          impact.max += -3;
          explanation = 'Closing accounts can raise utilization and lower average age.';
        }
        break;
      }

      case 'missPayment': {
        if (profile.missedPayments === 0) {
          impact = IMPACT_RANGES.missedPayment.first;
          explanation = 'First missed payment has the biggest impact.';
        } else {
          impact = IMPACT_RANGES.missedPayment.subsequent;
          explanation = 'Additional missed payments continue to hurt.';
        }
        warnings.push('Missing payments is the most damaging action for your credit.');
        break;
      }

      case 'authorizedUser': {
        const auAge = action.params.accountAge || 5;
        if (auAge >= 5) {
          impact = IMPACT_RANGES.authorizedUser.goodAccount;
          explanation = 'Becoming AU on an old, well-managed account can help.';
        } else {
          impact = { min: 5, max: 20 };
          explanation = 'Newer authorized user accounts have modest positive impact.';
        }
        break;
      }
    }

    actionImpacts.push({
      action: formatActionName(action.type),
      impact,
      explanation,
    });

    totalMinChange += impact.min;
    totalMaxChange += impact.max;
  }

  // Calculate new score range
  const likelyChange = (totalMinChange + totalMaxChange) / 2;
  const estimatedNewScore = {
    min: Math.max(300, Math.min(850, profile.estimatedScore + totalMinChange)),
    max: Math.max(300, Math.min(850, profile.estimatedScore + totalMaxChange)),
    likely: Math.max(300, Math.min(850, profile.estimatedScore + likelyChange)),
  };

  // Generate recommendation
  let recommendation: string;
  if (likelyChange > 20) {
    recommendation = 'These actions could significantly improve your score!';
  } else if (likelyChange > 0) {
    recommendation = 'These actions should have a modest positive effect.';
  } else if (likelyChange > -20) {
    recommendation = 'These actions may have a small negative effect short-term.';
  } else {
    recommendation = 'Caution: These actions could notably lower your score.';
  }

  return {
    currentScore: profile.estimatedScore,
    estimatedNewScore,
    change: {
      min: totalMinChange,
      max: totalMaxChange,
      likely: Math.round(likelyChange),
    },
    factors,
    actionImpacts,
    warnings,
    recommendation,
  };
}

function formatActionName(type: string): string {
  const names: Record<string, string> = {
    payDownDebt: 'Pay Down Debt',
    openNewCard: 'Open New Card',
    closeAccount: 'Close Account',
    missPayment: 'Miss Payment',
    authorizedUser: 'Become Authorized User',
  };
  return names[type] || type;
}
```

## UI Structure

### Layout

1. **Hero Section**
   - Title: "Credit Score Simulator"
   - Subtitle: "See how actions might affect your score—no account required"

2. **Current Profile Section**
   - Score dial/gauge showing current estimate
   - Factor breakdown cards (5 factors with status indicators)
   - Sliders for profile inputs

3. **Actions Section**
   - "What-If Scenarios" heading
   - Toggle cards for each action:
     - Pay Down Debt (with amount slider if enabled)
     - Open New Card (with limit slider if enabled)
     - Close Account (with age slider if enabled)
     - Miss a Payment
     - Become Authorized User (with age/limit sliders if enabled)

4. **Results Section** (shows when actions selected)
   - **Score Change Visualization**
     - Current: 700
     - Estimated: 680 - 720 (likely: 695)
     - Visual bar showing range

   - **Action Breakdown**
     - Each action with its impact range
     - Explanation for each

   - **Warnings** (if any)
     - Red alert boxes for risky actions

5. **Educational Section**
   - Credit Score Factors explained
   - Tips for improving score
   - Disclaimer about estimates

## Files to Create

```
src/
├── app/tools/credit-score-simulator/
│   ├── page.tsx
│   └── calculator.tsx
└── lib/calculators/credit-score-simulator/
    ├── types.ts
    └── calculations.ts
```

## Special UI Components

Create within calculator.tsx:

1. **ScoreGauge** - Semi-circular gauge showing score
2. **FactorCard** - Card showing factor status (excellent/good/fair/poor)
3. **ActionToggle** - Toggle card with optional parameter inputs
4. **ImpactRange** - Visual showing min/max impact

## Registration

Add to `/src/lib/site-config.ts`:

```typescript
{
  id: "credit-score-simulator",
  name: "Credit Score Simulator",
  description: "Simulate how different actions might affect your credit score",
  href: "/tools/credit-score-simulator",
  categoryId: "credit-building",
  status: "live",
  primaryColor: "#8b5cf6",
  designStyle: "analytical",
  inspiredBy: ["Humphrey Yang"],
  featured: true,
}
```

## Testing Checklist

- [ ] `npm run build` passes
- [ ] `npm run lint` passes
- [ ] Mobile viewport (375px) works
- [ ] Division by zero handled (0 credit limit)
- [ ] Score stays within 300-850 range
- [ ] Missing payment shows severe impact
- [ ] Paying down debt shows positive impact
- [ ] Multiple actions combine correctly
- [ ] Warnings appear for risky actions

## Important Disclaimer

Add this to the UI:
> "This simulator provides estimates based on general credit scoring principles. Actual score changes vary based on your complete credit history. This is for educational purposes only."

## Git Workflow

```bash
git checkout -b feature/app-credit-score-simulator
# ... build the app ...
git add .
git commit -m "Add Credit Score Simulator"
git push -u origin feature/app-credit-score-simulator
```

## Do NOT

- Modify shared components
- Claim exact point predictions (always show ranges)
- Forget the educational disclaimer
- Make it feel like an official credit tool
- Skip the division-by-zero guard
