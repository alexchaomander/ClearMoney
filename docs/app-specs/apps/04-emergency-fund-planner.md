# Emergency Fund Planner

## Overview

**Slug:** `emergency-fund`
**Category:** budgeting
**Primary Color:** Blue (#3b82f6)
**Design Style:** minimal

### One-Line Description
Calculate your personalized emergency fund target based on your actual risk factors, not generic "3-6 months" advice.

### Target User
Someone building (or evaluating) their emergency fund who wants a personalized target that accounts for their job stability, dependents, and income sources.

### Problem It Solves
Generic advice says "save 3-6 months of expenses." But a freelancer with one income source needs more than a tenured government employee with dual income. This calculator personalizes the target.

---

## Inspired By

### Influencer Connection
- **Dave Ramsey:** Emergency fund as Baby Step 3 (3-6 months)
- **Nuance:** One size doesn't fit all
- See: `/docs/research/influencer-profiles/dave-ramsey.md`

### What Existing Tools Get Wrong
- Just ask "3 or 6 months?" without context
- Don't account for job stability or income volatility
- Don't consider dependents or existing safety nets
- Make users guess their risk level

### Our Differentiated Approach
- Quiz-based risk assessment
- Personalized target range
- Explains WHY each factor matters
- Progress tracker toward goal

---

## User Inputs

| Input | Label | Type | Default | Options/Range |
|-------|-------|------|---------|---------------|
| monthlyExpenses | Monthly Essential Expenses | slider | 4000 | 0-20000, step 100 |
| employmentType | Employment Type | select | "w2-full" | See options below |
| industryStability | Industry Stability | select | "stable" | See options below |
| incomeSources | Number of Income Sources | select | "one" | See options below |
| dependents | Number of Dependents | slider | 0 | 0-5, step 1 |
| healthInsurance | Health Insurance Status | select | "employer" | See options below |
| hasPartner | Partner Income? | toggle | false | true/false |
| familySupport | Family Support Available? | toggle | false | true/false |

### Select Options

**Employment Type:**
- `w2-full`: Full-time W-2 employee
- `w2-part`: Part-time W-2 employee
- `contractor`: Independent contractor
- `freelance`: Freelancer/self-employed
- `gig`: Gig economy
- `business`: Business owner

**Industry Stability:**
- `very-stable`: Very stable (government, healthcare, utilities)
- `stable`: Stable (tech, finance, established industries)
- `moderate`: Moderate (retail, hospitality, cyclical)
- `volatile`: Volatile (startups, seasonal, at-risk)

**Income Sources:**
- `one`: Single income source
- `two`: Two income sources
- `multiple`: Three or more

**Health Insurance:**
- `employer`: Employer-provided
- `marketplace`: ACA marketplace
- `spouse`: Through spouse
- `none`: Uninsured

---

## Calculations

### Risk Factor Weights

```typescript
// Employment type adds months
const employmentMonths = {
  'w2-full': 0,
  'w2-part': 1,
  'contractor': 2,
  'freelance': 3,
  'gig': 3,
  'business': 2,
};

// Industry stability adds months
const industryMonths = {
  'very-stable': 0,
  'stable': 1,
  'moderate': 2,
  'volatile': 3,
};

// Income sources reduces months
const incomeSourceReduction = {
  'one': 0,
  'two': -1,
  'multiple': -2,
};

// Each dependent adds 0.5 months
const dependentFactor = 0.5;

// Health insurance adds risk
const healthMonths = {
  'employer': 0,
  'marketplace': 0.5,
  'spouse': 0,
  'none': 1.5,
};

// Safety nets reduce months
const partnerReduction = -1;
const familySupportReduction = -0.5;
```

### Core Formula

```
Base: 3 months

+ Employment type modifier
+ Industry stability modifier
+ Income sources modifier (negative)
+ (Dependents × 0.5)
+ Health insurance modifier
+ Partner income modifier (negative)
+ Family support modifier (negative)

= Recommended months

Range: Recommended ± 1 month
Minimum: 3 months
Maximum: 12 months
```

### TypeScript Implementation

```typescript
// src/lib/calculators/emergency-fund/types.ts
export type EmploymentType = 'w2-full' | 'w2-part' | 'contractor' | 'freelance' | 'gig' | 'business';
export type IndustryStability = 'very-stable' | 'stable' | 'moderate' | 'volatile';
export type IncomeSources = 'one' | 'two' | 'multiple';
export type HealthInsurance = 'employer' | 'marketplace' | 'spouse' | 'none';

export interface CalculatorInputs {
  monthlyExpenses: number;
  employmentType: EmploymentType;
  industryStability: IndustryStability;
  incomeSources: IncomeSources;
  dependents: number;
  healthInsurance: HealthInsurance;
  hasPartner: boolean;
  familySupport: boolean;
}

export interface RiskFactor {
  name: string;
  impact: number;
  description: string;
}

export interface CalculatorResults {
  recommendedMonths: number;
  rangeMin: number;
  rangeMax: number;
  targetAmount: number;
  rangeMinAmount: number;
  rangeMaxAmount: number;
  riskScore: 'low' | 'moderate' | 'high' | 'very-high';
  factors: RiskFactor[];
}
```

```typescript
// src/lib/calculators/emergency-fund/calculations.ts
import type { CalculatorInputs, CalculatorResults, RiskFactor } from "./types";

const EMPLOYMENT_MONTHS: Record<string, number> = {
  'w2-full': 0,
  'w2-part': 1,
  'contractor': 2,
  'freelance': 3,
  'gig': 3,
  'business': 2,
};

const INDUSTRY_MONTHS: Record<string, number> = {
  'very-stable': 0,
  'stable': 1,
  'moderate': 2,
  'volatile': 3,
};

const INCOME_REDUCTION: Record<string, number> = {
  'one': 0,
  'two': -1,
  'multiple': -2,
};

const HEALTH_MONTHS: Record<string, number> = {
  'employer': 0,
  'marketplace': 0.5,
  'spouse': 0,
  'none': 1.5,
};

export function calculate(inputs: CalculatorInputs): CalculatorResults {
  const factors: RiskFactor[] = [];
  let totalMonths = 3; // Base

  // Employment type
  const empImpact = EMPLOYMENT_MONTHS[inputs.employmentType];
  if (empImpact !== 0) {
    factors.push({
      name: "Employment Type",
      impact: empImpact,
      description: empImpact > 0 ? "Less stable employment increases risk" : "Stable employment",
    });
  }
  totalMonths += empImpact;

  // Industry stability
  const indImpact = INDUSTRY_MONTHS[inputs.industryStability];
  if (indImpact !== 0) {
    factors.push({
      name: "Industry Stability",
      impact: indImpact,
      description: "Industry-specific job market risk",
    });
  }
  totalMonths += indImpact;

  // Income sources
  const incImpact = INCOME_REDUCTION[inputs.incomeSources];
  if (incImpact !== 0) {
    factors.push({
      name: "Multiple Income Sources",
      impact: incImpact,
      description: "Diversified income reduces risk",
    });
  }
  totalMonths += incImpact;

  // Dependents
  const depImpact = inputs.dependents * 0.5;
  if (depImpact > 0) {
    factors.push({
      name: "Dependents",
      impact: depImpact,
      description: `${inputs.dependents} dependent(s) increase financial needs`,
    });
  }
  totalMonths += depImpact;

  // Health insurance
  const healthImpact = HEALTH_MONTHS[inputs.healthInsurance];
  if (healthImpact !== 0) {
    factors.push({
      name: "Health Insurance",
      impact: healthImpact,
      description: "Healthcare costs without employer coverage",
    });
  }
  totalMonths += healthImpact;

  // Partner income
  if (inputs.hasPartner) {
    factors.push({
      name: "Partner Income",
      impact: -1,
      description: "Second income provides backup",
    });
    totalMonths -= 1;
  }

  // Family support
  if (inputs.familySupport) {
    factors.push({
      name: "Family Support",
      impact: -0.5,
      description: "Safety net from family",
    });
    totalMonths -= 0.5;
  }

  // Clamp to valid range
  const recommendedMonths = Math.max(3, Math.min(12, Math.round(totalMonths * 2) / 2));
  const rangeMin = Math.max(3, recommendedMonths - 1);
  const rangeMax = Math.min(12, recommendedMonths + 1);

  // Determine risk score
  let riskScore: 'low' | 'moderate' | 'high' | 'very-high';
  if (recommendedMonths <= 4) riskScore = 'low';
  else if (recommendedMonths <= 6) riskScore = 'moderate';
  else if (recommendedMonths <= 9) riskScore = 'high';
  else riskScore = 'very-high';

  return {
    recommendedMonths,
    rangeMin,
    rangeMax,
    targetAmount: inputs.monthlyExpenses * recommendedMonths,
    rangeMinAmount: inputs.monthlyExpenses * rangeMin,
    rangeMaxAmount: inputs.monthlyExpenses * rangeMax,
    riskScore,
    factors: factors.filter(f => f.impact !== 0),
  };
}
```

### Edge Cases
- **All low-risk factors:** Cap at 3 months minimum
- **All high-risk factors:** Cap at 12 months maximum
- **Zero expenses:** Return $0 target (with note)
- **Many dependents:** Cap dependent impact at reasonable level

---

## UI Structure

### Sections (top to bottom)
1. **Hero:** "How Much Emergency Fund Do You Need?"
2. **Expenses Input:** Monthly essential expenses slider
3. **Risk Assessment Quiz:**
   - Employment type
   - Industry stability
   - Income sources
   - Dependents
   - Health insurance
   - Partner income toggle
   - Family support toggle
4. **Results Card:**
   - Recommended target (primary)
   - Range (min to max)
   - Risk level badge
5. **Risk Factors Breakdown:**
   - List each factor and its impact
   - Shows what's increasing/decreasing your target
6. **Progress Tracker (optional):**
   - Input current savings
   - Show progress bar to goal
7. **Methodology:** How we calculate the target

### Visual Design
- **Primary color usage:** Blue for safety/security feeling
- **Personality:** Calm, reassuring, supportive
- **Special visualizations:**
  - Risk factor impact bars
  - Progress circle or bar
  - Target range visualization

---

## Files to Create

```
src/
├── app/
│   └── tools/
│       └── emergency-fund/
│           ├── page.tsx
│           └── calculator.tsx
└── lib/
    └── calculators/
        └── emergency-fund/
            ├── types.ts
            └── calculations.ts
```

---

## Registration

Add to `/src/lib/site-config.ts`:

```typescript
{
  id: "emergency-fund",
  name: "Emergency Fund Planner",
  description: "Calculate your personalized emergency fund target",
  href: "/tools/emergency-fund",
  categoryId: "budgeting",
  status: "live",
  primaryColor: "#3b82f6",
  designStyle: "minimal",
  inspiredBy: ["Dave Ramsey"],
  featured: true,
}
```

---

## Agent Prompt

# Agent Prompt: Emergency Fund Planner

## Your Mission
Build the Emergency Fund Planner for ClearMoney. This tool calculates a personalized emergency fund target based on individual risk factors, going beyond generic "3-6 months" advice.

## Context
- **Repository:** `/Users/alexchao/projects/clearmoney`
- **Your app directory:** `/src/app/tools/emergency-fund/`
- **Your calculator logic:** `/src/lib/calculators/emergency-fund/`
- **Tech stack:** Next.js 15+, React 19, TypeScript, Tailwind CSS

## Before You Start
1. Read `/docs/app-specs/shared-patterns.md` for required patterns
2. Note: This app needs select dropdowns and toggles, not just sliders

## Design Requirements
- **Primary Color:** Blue (#3b82f6) - calm, secure, reassuring
- **Personality:** Supportive, not scary; reassuring, not alarming
- **Base:** Dark mode (bg-neutral-950)
- **Mobile-first:** Must work on 375px viewport

## What You're Building
A calculator that:
1. Asks about employment, industry, income sources, dependents, insurance
2. Calculates a personalized emergency fund target
3. Shows which factors increase/decrease the recommendation
4. Provides a range (not just one number)
5. Optionally tracks progress toward the goal

Key insight: A freelancer with no health insurance needs WAY more than 3 months. A W-2 employee with dual income might be fine with 3.

## User Inputs

| Input | Type | Default | Options |
|-------|------|---------|---------|
| Monthly Expenses | slider | $4,000 | $0-$20,000 |
| Employment Type | select | W-2 Full-time | W-2 Full, W-2 Part, Contractor, Freelance, Gig, Business |
| Industry Stability | select | Stable | Very Stable, Stable, Moderate, Volatile |
| Income Sources | select | One | One, Two, Three+ |
| Dependents | slider | 0 | 0-5 |
| Health Insurance | select | Employer | Employer, Marketplace, Spouse, None |
| Partner Income | toggle | false | Has working partner |
| Family Support | toggle | false | Family could help |

## Calculation Logic

Base: 3 months

**Adds months:**
- Employment risk (0-3)
- Industry volatility (0-3)
- Dependents (0.5 per)
- No health insurance (+1.5)

**Subtracts months:**
- Multiple income sources (up to -2)
- Partner income (-1)
- Family support (-0.5)

Final: Clamped to 3-12 months

## Key Outputs
- Recommended months (rounded to 0.5)
- Target amount ($)
- Range (recommended ± 1 month)
- Risk level (low/moderate/high/very-high)
- Factors list with impact

## UI Structure

1. **Hero:** "How Much Emergency Fund Do You Need?"

2. **Monthly Expenses:**
   - Slider for essential monthly expenses
   - Note: "Include rent, food, insurance, minimums on debt"

3. **Risk Assessment:**
   - Employment type dropdown
   - Industry stability dropdown
   - Income sources dropdown
   - Dependents slider
   - Health insurance dropdown
   - Partner income toggle
   - Family support toggle

4. **Results Card:**
   - Big number: "6 months" (recommended)
   - Dollar amount: "$24,000"
   - Range: "$20,000 - $28,000"
   - Risk badge: "Moderate Risk"

5. **Factors Breakdown:**
   ```
   Factor              Impact
   Freelance work      +3 months
   Moderate industry   +2 months
   No dependents       No impact
   Partner income      -1 month
   ─────────────────────────────
   Recommendation      6 months
   ```

6. **Optional Progress Section:**
   - "How much do you have saved?"
   - Progress bar to goal
   - "You're X% there!"

7. **Methodology:** Explain the risk factors

## Special UI Elements
- Dropdown/select components (may need to build simple ones)
- Toggle switches
- Risk level badge with color coding
- Factor impact visualization

## Files to Create

1. `/src/app/tools/emergency-fund/page.tsx` - Metadata
2. `/src/app/tools/emergency-fund/calculator.tsx` - Main component
3. `/src/lib/calculators/emergency-fund/types.ts` - Interfaces
4. `/src/lib/calculators/emergency-fund/calculations.ts` - Risk calculation

## Testing Checklist
- [ ] `npm run build` passes
- [ ] `npm run lint` passes
- [ ] Mobile viewport (375px) works
- [ ] Low-risk profile shows ~3-4 months
- [ ] High-risk profile shows 9-12 months
- [ ] All select options work
- [ ] Toggles update calculations
- [ ] Factors display correctly
- [ ] Registered in site-config.ts

## Branch & PR
1. Create branch: `feature/app-emergency-fund`
2. Complete all work
3. Add entry to site-config.ts
4. Create PR with desktop + mobile screenshots

## Do NOT
- Modify shared components
- Make it scary or alarmist
- Ignore the minimum (3 months)
- Skip the factors breakdown
- Forget mobile testing

---

## Related Documentation

- Research: `/docs/research/influencer-profiles/dave-ramsey.md`
- Tool Opportunities: `/docs/research/tool-opportunities/budgeting.md`
- Shared Patterns: `/docs/app-specs/shared-patterns.md`
