# Conscious Spending Planner

## Overview

**Slug:** `conscious-spending`
**Category:** budgeting
**Primary Color:** Emerald (#10b981)
**Design Style:** playful

### One-Line Description
Build a guilt-free spending plan using Ramit Sethi's Conscious Spending framework.

### Target User
Someone who hates traditional budgets but wants a simple framework for allocating their income that includes room for spending on things they love.

### Problem It Solves
Traditional budgets feel restrictive and guilt-inducing. Ramit's Conscious Spending Plan flips the script: automate the important stuff, then spend guilt-free on what's left.

---

## Inspired By

### Influencer Connection
- **Ramit Sethi:** Conscious Spending Plan from "I Will Teach You To Be Rich"
- See: `/docs/research/influencer-profiles/ramit-sethi.md`

### What Existing Tools Get Wrong
- Focus on restriction, not permission
- Require tracking every penny
- Make users feel guilty about spending
- Too many categories

### Our Differentiated Approach
- Four simple categories
- Emphasis on guilt-free spending
- Visual percentage-based allocation
- Automation-focused output

---

## User Inputs

| Input | Label | Type | Default | Min | Max | Step |
|-------|-------|------|---------|-----|-----|------|
| monthlyIncome | Monthly After-Tax Income | slider | 5000 | 1000 | 30000 | 100 |
| fixedCostsPercent | Fixed Costs | slider | 55 | 40 | 70 | 1 |
| investmentsPercent | Investments | slider | 10 | 5 | 30 | 1 |
| savingsPercent | Savings | slider | 10 | 0 | 25 | 1 |

**Guilt-Free Spending** is calculated as: 100% - fixed - investments - savings

### Category Explanations
- **Fixed Costs (50-60%):** Rent, utilities, insurance, debt minimums, subscriptions
- **Investments (10%):** 401k, IRA, taxable brokerage
- **Savings (5-10%):** Emergency fund, vacation fund, big purchases
- **Guilt-Free (20-35%):** Whatever you want. No judgment. No tracking.

---

## Calculations

### Core Formula

```typescript
guiltFreePercent = 100 - fixedCostsPercent - investmentsPercent - savingsPercent;

// Monthly amounts
fixedCostsAmount = monthlyIncome * (fixedCostsPercent / 100);
investmentsAmount = monthlyIncome * (investmentsPercent / 100);
savingsAmount = monthlyIncome * (savingsPercent / 100);
guiltFreeAmount = monthlyIncome * (guiltFreePercent / 100);

// Validations
isValidPlan = guiltFreePercent >= 10;  // Should have some fun money
hasWarning = fixedCostsPercent > 60;    // May be too constrained
```

### TypeScript Implementation

```typescript
// src/lib/calculators/conscious-spending/types.ts
export interface CalculatorInputs {
  monthlyIncome: number;
  fixedCostsPercent: number;
  investmentsPercent: number;
  savingsPercent: number;
}

export interface CategoryBreakdown {
  name: string;
  percent: number;
  amount: number;
  color: string;
  description: string;
}

export interface CalculatorResults {
  categories: CategoryBreakdown[];
  guiltFreePercent: number;
  isValidPlan: boolean;
  warnings: string[];
  automationChecklist: AutomationItem[];
}

export interface AutomationItem {
  action: string;
  amount: number;
  frequency: string;
  destination: string;
}
```

```typescript
// src/lib/calculators/conscious-spending/calculations.ts
import type { CalculatorInputs, CalculatorResults, CategoryBreakdown, AutomationItem } from "./types";

export function calculate(inputs: CalculatorInputs): CalculatorResults {
  const { monthlyIncome, fixedCostsPercent, investmentsPercent, savingsPercent } = inputs;

  const guiltFreePercent = 100 - fixedCostsPercent - investmentsPercent - savingsPercent;

  const categories: CategoryBreakdown[] = [
    {
      name: "Fixed Costs",
      percent: fixedCostsPercent,
      amount: monthlyIncome * (fixedCostsPercent / 100),
      color: "#6b7280", // gray
      description: "Rent, utilities, insurance, minimums",
    },
    {
      name: "Investments",
      percent: investmentsPercent,
      amount: monthlyIncome * (investmentsPercent / 100),
      color: "#8b5cf6", // purple
      description: "401k, IRA, brokerage",
    },
    {
      name: "Savings",
      percent: savingsPercent,
      amount: monthlyIncome * (savingsPercent / 100),
      color: "#3b82f6", // blue
      description: "Emergency fund, goals",
    },
    {
      name: "Guilt-Free Spending",
      percent: guiltFreePercent,
      amount: monthlyIncome * (guiltFreePercent / 100),
      color: "#10b981", // emerald
      description: "Whatever you want!",
    },
  ];

  const warnings: string[] = [];
  if (fixedCostsPercent > 60) {
    warnings.push("Fixed costs above 60% may leave you feeling constrained. Consider reducing housing or debt.");
  }
  if (guiltFreePercent < 10) {
    warnings.push("Less than 10% for guilt-free spending is very tight. Make sure this is sustainable.");
  }
  if (guiltFreePercent < 0) {
    warnings.push("Your percentages exceed 100%. Adjust your categories.");
  }
  if (investmentsPercent < 10) {
    warnings.push("Ramit recommends at least 10% for investments. Consider increasing if possible.");
  }

  const automationChecklist: AutomationItem[] = [
    {
      action: "Auto-transfer to high-yield savings",
      amount: categories[2].amount,
      frequency: "On payday",
      destination: "Savings account",
    },
    {
      action: "Auto-invest to brokerage",
      amount: categories[1].amount * 0.4, // Estimate for taxable
      frequency: "On payday",
      destination: "Investment account",
    },
    {
      action: "401k contribution",
      amount: categories[1].amount * 0.6, // Estimate for 401k
      frequency: "Per paycheck",
      destination: "401k",
    },
  ];

  return {
    categories,
    guiltFreePercent,
    isValidPlan: guiltFreePercent >= 0,
    warnings,
    automationChecklist,
  };
}
```

---

## UI Structure

### Sections
1. **Hero:** "Build Your Conscious Spending Plan"
2. **Income Input:** Monthly after-tax income
3. **Category Sliders:** Three sliders (guilt-free is calculated)
4. **Visual Breakdown:**
   - Pie chart or stacked bar
   - Each category with dollar amount
5. **Guilt-Free Spotlight:**
   - Large display: "You have $X/month for guilt-free spending"
   - Permission: "Spend it on whatever makes you happy. No tracking required."
6. **Warnings:** If plan is unbalanced
7. **Automation Checklist:** How to set this up
8. **Methodology:** Ramit's framework explained

### Visual Design
- **Primary color usage:** Emerald for guilt-free, positive feel
- **Personality:** Playful, permissive, celebratory
- **Visualizations:**
  - Colorful pie/donut chart
  - Category cards with amounts
  - Automation checklist with checkboxes

---

## Registration

```typescript
{
  id: "conscious-spending",
  name: "Conscious Spending Planner",
  description: "Build a guilt-free spending plan using Ramit's framework",
  href: "/tools/conscious-spending",
  categoryId: "budgeting",
  status: "live",
  primaryColor: "#10b981",
  designStyle: "playful",
  inspiredBy: ["Ramit Sethi"],
  featured: true,
}
```

---

## Agent Prompt

# Agent Prompt: Conscious Spending Planner

## Your Mission
Build the Conscious Spending Planner for ClearMoney. This tool helps users create a simple, guilt-free budget using Ramit Sethi's framework.

## Key Features
1. Income input
2. Three category sliders (fixed, investments, savings)
3. Fourth category (guilt-free) auto-calculated
4. Visual breakdown (pie chart or similar)
5. Large guilt-free spending callout ("You have $X to spend freely!")
6. Automation checklist

## Key Insight
The point is PERMISSION, not restriction. Celebrate the guilt-free spending amount.

## Files to Create
1. `/src/app/tools/conscious-spending/page.tsx`
2. `/src/app/tools/conscious-spending/calculator.tsx`
3. `/src/lib/calculators/conscious-spending/types.ts`
4. `/src/lib/calculators/conscious-spending/calculations.ts`

## Branch: `feature/app-conscious-spending`
