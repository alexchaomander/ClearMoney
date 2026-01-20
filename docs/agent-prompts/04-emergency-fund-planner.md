# Agent Prompt: Emergency Fund Planner

## Your Mission

Build the Emergency Fund Planner for ClearMoney. This tool helps users calculate a personalized emergency fund target based on their specific risk factors, not just the generic "3-6 months" advice.

## Project Context

**Repository:** You are working in a Next.js 15+ project with React 19, TypeScript, and Tailwind CSS.
**Your app directory:** `/src/app/tools/emergency-fund/`
**Your calculator logic:** `/src/lib/calculators/emergency-fund/`
**Branch name:** `feature/app-emergency-fund`

## Background Research

**Dave Ramsey's Baby Step 1:** $1,000 starter emergency fund (criticized as too small in 2024)
**Dave Ramsey's Baby Step 3:** 3-6 months of expenses

**The Problem with Generic Advice:**
- A government employee with tenure needs less than a freelancer
- Single income household needs more than dual income
- Someone with health issues needs more than someone healthy
- Homeowners face more unexpected expenses than renters

**Our Approach:** Calculate a personalized target based on:
1. Monthly expenses (baseline)
2. Job stability (multiplier)
3. Income sources (multiplier)
4. Dependents (multiplier)
5. Health considerations (multiplier)
6. Housing situation (multiplier)

## Before You Start

1. Read shared patterns: `cat /docs/app-specs/shared-patterns.md`
2. Review existing calculator: `ls -la /src/app/tools/bilt-calculator/`
3. Check shared components: `cat /src/components/shared/index.ts`

## Design Requirements

- **Primary Color:** Blue (#3b82f6) - represents safety, calm, security
- **Design Style:** Reassuring, calm, progress-focused
- **Base:** Dark mode (bg-neutral-950)
- **Mobile-first:** Must work on 375px viewport

## User Inputs

### Essential Monthly Expenses
| Input | Label | Default | Min | Max | Step |
|-------|-------|---------|-----|-----|------|
| monthlyExpenses | Essential Monthly Expenses | 4000 | 500 | 20000 | 100 |

### Risk Factors (select options)

**Job Stability:**
| Option | Label | Multiplier |
|--------|-------|------------|
| government | Government/Tenured | 0.8 |
| stable | Stable Corporate | 1.0 |
| variable | Variable/Commission | 1.3 |
| freelance | Freelance/Self-Employed | 1.5 |
| unstable | Uncertain/Layoff Risk | 1.7 |

**Income Sources:**
| Option | Label | Multiplier |
|--------|-------|------------|
| dual | Dual Income Household | 0.8 |
| single_stable | Single Income (Stable) | 1.0 |
| single_variable | Single Income (Variable) | 1.3 |

**Dependents:**
| Option | Label | Multiplier |
|--------|-------|------------|
| none | No Dependents | 0.9 |
| partner | Partner Only | 1.0 |
| children | Children | 1.2 |
| extended | Extended Family | 1.3 |

**Health Situation:**
| Option | Label | Multiplier |
|--------|-------|------------|
| excellent | Excellent Health + Good Insurance | 0.9 |
| good | Good Health | 1.0 |
| moderate | Some Health Concerns | 1.2 |
| significant | Significant Health Needs | 1.4 |

**Housing:**
| Option | Label | Multiplier |
|--------|-------|------------|
| rent_cheap | Renting (Low Cost) | 0.9 |
| rent_normal | Renting (Normal) | 1.0 |
| own_new | Homeowner (Newer Home) | 1.1 |
| own_old | Homeowner (Older Home) | 1.3 |

## Calculation Logic

```typescript
// src/lib/calculators/emergency-fund/types.ts
export type JobStability = 'government' | 'stable' | 'variable' | 'freelance' | 'unstable';
export type IncomeSource = 'dual' | 'single_stable' | 'single_variable';
export type Dependents = 'none' | 'partner' | 'children' | 'extended';
export type HealthSituation = 'excellent' | 'good' | 'moderate' | 'significant';
export type HousingSituation = 'rent_cheap' | 'rent_normal' | 'own_new' | 'own_old';

export interface CalculatorInputs {
  monthlyExpenses: number;
  jobStability: JobStability;
  incomeSource: IncomeSource;
  dependents: Dependents;
  healthSituation: HealthSituation;
  housingSituation: HousingSituation;
}

export interface RiskFactor {
  name: string;
  value: string;
  multiplier: number;
  impact: 'increases' | 'decreases' | 'neutral';
}

export interface CalculatorResults {
  baselineMonths: number;        // 3 months baseline
  adjustedMonths: number;        // after multipliers
  targetAmount: number;
  minimumAmount: number;         // floor: 3 months
  comfortAmount: number;         // ceiling: adjusted + 1 month buffer
  riskFactors: RiskFactor[];
  overallRisk: 'low' | 'moderate' | 'high' | 'very-high';
  recommendation: string;
}
```

```typescript
// src/lib/calculators/emergency-fund/calculations.ts
import type { CalculatorInputs, CalculatorResults, RiskFactor } from "./types";

const MULTIPLIERS = {
  jobStability: {
    government: { value: 0.8, label: 'Government/Tenured' },
    stable: { value: 1.0, label: 'Stable Corporate' },
    variable: { value: 1.3, label: 'Variable/Commission' },
    freelance: { value: 1.5, label: 'Freelance/Self-Employed' },
    unstable: { value: 1.7, label: 'Uncertain/Layoff Risk' },
  },
  incomeSource: {
    dual: { value: 0.8, label: 'Dual Income' },
    single_stable: { value: 1.0, label: 'Single Income (Stable)' },
    single_variable: { value: 1.3, label: 'Single Income (Variable)' },
  },
  dependents: {
    none: { value: 0.9, label: 'No Dependents' },
    partner: { value: 1.0, label: 'Partner Only' },
    children: { value: 1.2, label: 'Children' },
    extended: { value: 1.3, label: 'Extended Family' },
  },
  healthSituation: {
    excellent: { value: 0.9, label: 'Excellent + Good Insurance' },
    good: { value: 1.0, label: 'Good Health' },
    moderate: { value: 1.2, label: 'Some Health Concerns' },
    significant: { value: 1.4, label: 'Significant Health Needs' },
  },
  housingSituation: {
    rent_cheap: { value: 0.9, label: 'Renting (Low Cost)' },
    rent_normal: { value: 1.0, label: 'Renting (Normal)' },
    own_new: { value: 1.1, label: 'Homeowner (Newer Home)' },
    own_old: { value: 1.3, label: 'Homeowner (Older Home)' },
  },
};

export function calculate(inputs: CalculatorInputs): CalculatorResults {
  const {
    monthlyExpenses,
    jobStability,
    incomeSource,
    dependents,
    healthSituation,
    housingSituation,
  } = inputs;

  const baselineMonths = 3;

  // Gather risk factors
  const riskFactors: RiskFactor[] = [
    {
      name: 'Job Stability',
      value: MULTIPLIERS.jobStability[jobStability].label,
      multiplier: MULTIPLIERS.jobStability[jobStability].value,
      impact: MULTIPLIERS.jobStability[jobStability].value > 1 ? 'increases' :
              MULTIPLIERS.jobStability[jobStability].value < 1 ? 'decreases' : 'neutral',
    },
    {
      name: 'Income Sources',
      value: MULTIPLIERS.incomeSource[incomeSource].label,
      multiplier: MULTIPLIERS.incomeSource[incomeSource].value,
      impact: MULTIPLIERS.incomeSource[incomeSource].value > 1 ? 'increases' :
              MULTIPLIERS.incomeSource[incomeSource].value < 1 ? 'decreases' : 'neutral',
    },
    {
      name: 'Dependents',
      value: MULTIPLIERS.dependents[dependents].label,
      multiplier: MULTIPLIERS.dependents[dependents].value,
      impact: MULTIPLIERS.dependents[dependents].value > 1 ? 'increases' :
              MULTIPLIERS.dependents[dependents].value < 1 ? 'decreases' : 'neutral',
    },
    {
      name: 'Health Situation',
      value: MULTIPLIERS.healthSituation[healthSituation].label,
      multiplier: MULTIPLIERS.healthSituation[healthSituation].value,
      impact: MULTIPLIERS.healthSituation[healthSituation].value > 1 ? 'increases' :
              MULTIPLIERS.healthSituation[healthSituation].value < 1 ? 'decreases' : 'neutral',
    },
    {
      name: 'Housing',
      value: MULTIPLIERS.housingSituation[housingSituation].label,
      multiplier: MULTIPLIERS.housingSituation[housingSituation].value,
      impact: MULTIPLIERS.housingSituation[housingSituation].value > 1 ? 'increases' :
              MULTIPLIERS.housingSituation[housingSituation].value < 1 ? 'decreases' : 'neutral',
    },
  ];

  // Calculate combined multiplier
  const combinedMultiplier = riskFactors.reduce((acc, factor) => acc * factor.multiplier, 1);

  // Calculate adjusted months (minimum 3, maximum 12)
  const rawAdjustedMonths = baselineMonths * combinedMultiplier;
  const adjustedMonths = Math.min(12, Math.max(3, Math.round(rawAdjustedMonths * 10) / 10));

  // Calculate amounts
  const targetAmount = Math.round(monthlyExpenses * adjustedMonths);
  const minimumAmount = monthlyExpenses * 3;
  const comfortAmount = Math.round(monthlyExpenses * (adjustedMonths + 1));

  // Determine overall risk level
  let overallRisk: 'low' | 'moderate' | 'high' | 'very-high';
  if (combinedMultiplier < 0.95) {
    overallRisk = 'low';
  } else if (combinedMultiplier < 1.2) {
    overallRisk = 'moderate';
  } else if (combinedMultiplier < 1.6) {
    overallRisk = 'high';
  } else {
    overallRisk = 'very-high';
  }

  // Generate recommendation
  let recommendation: string;
  if (overallRisk === 'low') {
    recommendation = `Your risk profile is low. A ${adjustedMonths}-month fund should provide solid protection.`;
  } else if (overallRisk === 'moderate') {
    recommendation = `You have typical risk factors. Aim for ${adjustedMonths} months of expenses.`;
  } else if (overallRisk === 'high') {
    recommendation = `Your risk factors suggest a larger buffer. ${adjustedMonths} months provides good protection.`;
  } else {
    recommendation = `Multiple risk factors suggest prioritizing a robust ${adjustedMonths}-month emergency fund.`;
  }

  return {
    baselineMonths,
    adjustedMonths,
    targetAmount,
    minimumAmount,
    comfortAmount,
    riskFactors,
    overallRisk,
    recommendation,
  };
}
```

## UI Structure

### Layout

1. **Hero Section**
   - Title: "Emergency Fund Planner"
   - Subtitle: "Not everyone needs '3-6 months.' Calculate YOUR personalized target."

2. **Monthly Expenses Input**
   - Large slider for monthly expenses
   - Helper: "Include rent, utilities, food, insurance, minimum debt payments"

3. **Risk Factors Section** (styled as cards/toggles)
   - Job Stability (5 options as segmented control or radio cards)
   - Income Sources (3 options)
   - Dependents (4 options)
   - Health Situation (4 options)
   - Housing (4 options)

   Each should show visual indication of impact (↑ increases, ↓ decreases, — neutral)

4. **Results Section**

   **Primary Result Card:**
   - Large number: "Your Target: $XX,XXX"
   - Subtext: "X.X months of expenses"
   - Risk level badge (Low/Moderate/High/Very High)

   **Range Display:**
   - Visual bar showing: Minimum ($X) → Target ($X) → Comfort ($X)
   - "Minimum: 3 months | Target: X months | Comfort: X+1 months"

5. **Risk Breakdown** (list)
   - Each factor with its impact
   - Color coded: green (decreases), neutral (gray), red (increases)

6. **Progress Tracker** (optional nice-to-have)
   - Input: "Current savings: $____"
   - Shows progress bar to target
   - "You're X% there! $Y more to go."

7. **Methodology Section** (collapsible)
   - Explain the multiplier system
   - Why we go beyond "3-6 months"
   - Cite Dave Ramsey's baby steps

## Files to Create

```
src/
├── app/tools/emergency-fund/
│   ├── page.tsx
│   └── calculator.tsx
└── lib/calculators/emergency-fund/
    ├── types.ts
    └── calculations.ts
```

## Special UI Components

Create within calculator.tsx:

1. **RiskFactorSelector** - Radio card group for each risk factor
2. **RangeVisualization** - Min/Target/Comfort visual bar
3. **RiskBreakdown** - List showing each factor's impact

## Registration

Add to `/src/lib/site-config.ts`:

```typescript
{
  id: "emergency-fund",
  name: "Emergency Fund Planner",
  description: "Calculate your personalized emergency fund target based on your risk factors",
  href: "/tools/emergency-fund",
  categoryId: "budgeting",
  status: "live",
  primaryColor: "#3b82f6",
  designStyle: "minimal",
  inspiredBy: ["Dave Ramsey"],
  featured: true,
}
```

## Testing Checklist

- [ ] `npm run build` passes
- [ ] `npm run lint` passes
- [ ] Mobile viewport (375px) works
- [ ] Lowest risk combination: ~3 months
- [ ] Highest risk combination: ~12 months (capped)
- [ ] All option combinations work without errors
- [ ] Monthly expenses slider updates target correctly
- [ ] Risk factors show correct impact indicators

## Example Calculations

**Low Risk Profile:**
- Monthly: $4,000
- Government job (0.8) × Dual income (0.8) × No dependents (0.9) × Excellent health (0.9) × Renting cheap (0.9)
- Multiplier: 0.8 × 0.8 × 0.9 × 0.9 × 0.9 = 0.47
- Raw months: 3 × 0.47 = 1.4 → Floored to 3 months
- Target: $12,000

**High Risk Profile:**
- Monthly: $4,000
- Freelance (1.5) × Single variable (1.3) × Children (1.2) × Moderate health (1.2) × Old home (1.3)
- Multiplier: 1.5 × 1.3 × 1.2 × 1.2 × 1.3 = 3.65
- Raw months: 3 × 3.65 = 10.95 → Rounded to 11 months
- Target: $44,000

## Git Workflow

```bash
git checkout -b feature/app-emergency-fund
# ... build the app ...
git add .
git commit -m "Add Emergency Fund Planner"
git push -u origin feature/app-emergency-fund
```

## Do NOT

- Modify shared components
- Make the UI feel scary or alarmist
- Forget the floor (3 months) and ceiling (12 months)
- Skip the progress tracker input (it's motivating!)
