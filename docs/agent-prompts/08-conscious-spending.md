# Agent Prompt: Conscious Spending Planner

## Your Mission

Build the Conscious Spending Planner for ClearMoney. Based on Ramit Sethi's framework, this tool helps users build a guilt-free spending plan by allocating money to what they love and cutting mercilessly on what they don't.

## Project Context

**Repository:** You are working in a Next.js 15+ project with React 19, TypeScript, and Tailwind CSS.
**Your app directory:** `/src/app/tools/conscious-spending/`
**Your calculator logic:** `/src/lib/calculators/conscious-spending/`
**Branch name:** `feature/app-conscious-spending`

## Background Research

**Ramit Sethi's Conscious Spending Plan:**

Unlike traditional budgets that focus on restriction, conscious spending focuses on intentionality:

| Category | Target % | Description |
|----------|----------|-------------|
| Fixed Costs | 50-60% | Rent, utilities, insurance, minimum debt payments |
| Investments | 10% | 401k, IRA, brokerage |
| Savings | 5-10% | Emergency fund, vacation, goals |
| Guilt-Free Spending | 20-35% | Whatever makes you happy! |

**Key Philosophy:**
- "Spend extravagantly on things you love, cut mercilessly on things you don't"
- Automate everything so you spend <1 hour/month on finances
- No judgment about what you spend guilt-free money on
- If the percentages don't work, increase income or decrease fixed costs

**Money Dials (10 categories people tend to "dial up"):**
1. Convenience
2. Travel
3. Health/Fitness
4. Experiences
5. Freedom
6. Relationships
7. Generosity
8. Luxury
9. Social Status
10. Self-improvement

## Before You Start

1. Read shared patterns: `cat /docs/app-specs/shared-patterns.md`
2. Review existing calculator: `ls -la /src/app/tools/bilt-calculator/`
3. Check shared components: `cat /src/components/shared/index.ts`

## Design Requirements

- **Primary Color:** Emerald (#10b981) - growth, positive, freedom
- **Design Style:** Playful, empowering, non-judgmental
- **Base:** Dark mode (bg-neutral-950)
- **Mobile-first:** Must work on 375px viewport

## User Inputs

### Income
| Input | Label | Default | Min | Max | Step |
|-------|-------|---------|-----|-----|------|
| monthlyIncome | Monthly Take-Home Pay | 5000 | 0 | 50000 | 100 |

### Current Spending (sliders)
| Input | Label | Default | Min | Max |
|-------|-------|---------|-----|-----|
| fixedCosts | Fixed Costs | 2500 | 0 | 30000 |
| investments | Investments | 500 | 0 | 10000 |
| savings | Savings Goals | 300 | 0 | 10000 |
| guiltFree | Guilt-Free Spending | 700 | 0 | 20000 |

### Money Dials (optional, for personalization)
Let users rank their top 3 money dials from the list of 10.

## Calculation Logic

```typescript
// src/lib/calculators/conscious-spending/types.ts
export interface CalculatorInputs {
  monthlyIncome: number;
  fixedCosts: number;
  investments: number;
  savings: number;
  guiltFree: number;
  moneyDials?: string[];  // Top 3 selected
}

export interface CategoryAnalysis {
  name: string;
  amount: number;
  percentage: number;
  targetMin: number;
  targetMax: number;
  status: 'under' | 'good' | 'over';
  recommendation: string;
}

export interface CalculatorResults {
  totalAllocated: number;
  unallocated: number;
  categories: CategoryAnalysis[];
  isBalanced: boolean;
  overallStatus: 'needs-work' | 'almost-there' | 'great';
  primaryIssue: string | null;
  suggestions: string[];
  guiltFreeDaily: number;
  guiltFreeWeekly: number;
}
```

```typescript
// src/lib/calculators/conscious-spending/calculations.ts
import type { CalculatorInputs, CalculatorResults, CategoryAnalysis } from "./types";

const TARGETS = {
  fixedCosts: { min: 50, max: 60, name: 'Fixed Costs' },
  investments: { min: 10, max: 15, name: 'Investments' },
  savings: { min: 5, max: 10, name: 'Savings Goals' },
  guiltFree: { min: 20, max: 35, name: 'Guilt-Free Spending' },
};

export function calculate(inputs: CalculatorInputs): CalculatorResults {
  const { monthlyIncome, fixedCosts, investments, savings, guiltFree, moneyDials } = inputs;

  const totalAllocated = fixedCosts + investments + savings + guiltFree;
  const unallocated = monthlyIncome - totalAllocated;

  const analyzeCategory = (
    key: keyof typeof TARGETS,
    amount: number
  ): CategoryAnalysis => {
    const target = TARGETS[key];
    const percentage = monthlyIncome > 0 ? (amount / monthlyIncome) * 100 : 0;

    let status: 'under' | 'good' | 'over';
    let recommendation: string;

    if (percentage < target.min) {
      status = 'under';
      if (key === 'investments') {
        recommendation = `Consider increasing to at least ${target.min}% (${formatCurrency(monthlyIncome * target.min / 100)})`;
      } else if (key === 'guiltFree') {
        recommendation = "You deserve more guilt-free spending! Life is for living.";
      } else {
        recommendation = `Below target. Aim for ${target.min}-${target.max}%`;
      }
    } else if (percentage > target.max) {
      status = 'over';
      if (key === 'fixedCosts') {
        recommendation = `High fixed costs limit flexibility. Can you reduce rent or bills?`;
      } else if (key === 'guiltFree') {
        recommendation = "Living large! Make sure investments and savings are covered first.";
      } else {
        recommendation = `Above ${target.max}%. Consider rebalancing.`;
      }
    } else {
      status = 'good';
      recommendation = "Looking good! Right in the target range.";
    }

    return {
      name: target.name,
      amount,
      percentage,
      targetMin: target.min,
      targetMax: target.max,
      status,
      recommendation,
    };
  };

  const categories: CategoryAnalysis[] = [
    analyzeCategory('fixedCosts', fixedCosts),
    analyzeCategory('investments', investments),
    analyzeCategory('savings', savings),
    analyzeCategory('guiltFree', guiltFree),
  ];

  // Determine overall status
  const overCategories = categories.filter(c => c.status === 'over');
  const underCategories = categories.filter(c => c.status === 'under');
  const isBalanced = overCategories.length === 0 && underCategories.length === 0;

  let overallStatus: 'needs-work' | 'almost-there' | 'great';
  let primaryIssue: string | null = null;

  if (isBalanced && Math.abs(unallocated) < monthlyIncome * 0.05) {
    overallStatus = 'great';
  } else if (overCategories.length <= 1 && underCategories.length <= 1) {
    overallStatus = 'almost-there';
    if (overCategories[0]) {
      primaryIssue = `${overCategories[0].name} is a bit high`;
    } else if (underCategories[0]) {
      primaryIssue = `${underCategories[0].name} could use more`;
    }
  } else {
    overallStatus = 'needs-work';
    primaryIssue = 'Multiple categories need adjustment';
  }

  // Generate suggestions
  const suggestions: string[] = [];

  if (categories[0].percentage > 60) {
    suggestions.push("Your fixed costs are eating into other categories. Can you find a cheaper living situation or reduce bills?");
  }

  if (categories[1].percentage < 10) {
    suggestions.push("Future-you will thank you for investing at least 10%. Start with your 401k match!");
  }

  if (unallocated > monthlyIncome * 0.1) {
    suggestions.push(`You have ${formatCurrency(unallocated)} unallocated. Give every dollar a job!`);
  }

  if (unallocated < 0) {
    suggestions.push(`You're ${formatCurrency(-unallocated)} over budget. Time to make some cuts or increase income.`);
  }

  if (moneyDials && moneyDials.length > 0) {
    suggestions.push(`Since you value ${moneyDials.join(', ')}, make sure your guilt-free spending reflects that!`);
  }

  // Calculate guilt-free breakdowns
  const guiltFreeDaily = guiltFree / 30;
  const guiltFreeWeekly = guiltFree / 4;

  return {
    totalAllocated,
    unallocated,
    categories,
    isBalanced,
    overallStatus,
    primaryIssue,
    suggestions,
    guiltFreeDaily,
    guiltFreeWeekly,
  };
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}
```

## UI Structure

### Layout

1. **Hero Section**
   - Title: "Conscious Spending Planner"
   - Subtitle: "Spend extravagantly on what you love. Cut mercilessly on what you don't."
   - Attribution: "Based on Ramit Sethi's framework"

2. **Income Input**
   - Large input for monthly take-home pay
   - "After taxes, what hits your bank account?"

3. **Spending Allocation** (visual pie/bar chart)
   - Four category sliders with real-time percentages
   - Visual bar showing allocation vs targets
   - Each category shows: Amount | Percentage | Target Range | Status

4. **Your Money Dials** (optional section)
   - "What do you want to spend extravagantly on?"
   - Grid of 10 dials to select top 3
   - Personalizes recommendations

5. **Results Section**
   - **Overall Status Badge** (Great/Almost There/Needs Work)
   - **Primary Issue** (if any)
   - **Guilt-Free Breakdown:**
     - "That's $X/day or $X/week to spend on whatever you want!"
   - **Category Cards** showing each analysis

6. **Suggestions Section**
   - Actionable recommendations
   - Ramit-style non-judgmental tone

7. **Methodology Section** (collapsible)
   - Explain the 50/30/20 alternative
   - Link to Ramit Sethi
   - The philosophy behind guilt-free spending

## Files to Create

```
src/
├── app/tools/conscious-spending/
│   ├── page.tsx
│   └── calculator.tsx
└── lib/calculators/conscious-spending/
    ├── types.ts
    └── calculations.ts
```

## Special UI Components

Create within calculator.tsx:

1. **AllocationBar** - Visual bar showing 4 categories as segments
2. **MoneyDialGrid** - Grid of 10 selectable money dials
3. **CategoryCard** - Card showing category analysis with status

## Registration

Add to `/src/lib/site-config.ts`:

```typescript
{
  id: "conscious-spending",
  name: "Conscious Spending Planner",
  description: "Build a guilt-free spending plan using Ramit Sethi's framework",
  href: "/tools/conscious-spending",
  categoryId: "budgeting",
  status: "live",
  primaryColor: "#10b981",
  designStyle: "playful",
  inspiredBy: ["Ramit Sethi"],
  featured: false,
}
```

## Testing Checklist

- [ ] `npm run build` passes
- [ ] `npm run lint` passes
- [ ] Mobile viewport (375px) works
- [ ] Percentages add up correctly
- [ ] Status indicators work (under/good/over)
- [ ] Unallocated amount shown when applicable
- [ ] Over-budget warning works
- [ ] Money dials selection works
- [ ] Guilt-free daily/weekly calculations correct

## Tone Guidelines

- **Empowering, not judgmental**
- **"You deserve..."** not "You should..."
- **Focus on what you CAN spend**, not restrictions
- **Acknowledge trade-offs** without being preachy

## Git Workflow

```bash
git checkout -b feature/app-conscious-spending
# ... build the app ...
git add .
git commit -m "Add Conscious Spending Planner"
git push -u origin feature/app-conscious-spending
```

## Do NOT

- Modify shared components
- Make the UI feel restrictive or judgmental
- Forget the playful, empowering tone
- Skip the guilt-free daily/weekly breakdown (it's motivating!)
