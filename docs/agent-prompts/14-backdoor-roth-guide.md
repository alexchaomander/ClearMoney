# Agent Prompt: Backdoor Roth IRA Guide & Calculator

## Your Mission

Build the Backdoor Roth IRA Guide & Calculator for ClearMoney. This tool helps high earners who are above Roth IRA income limits understand and execute the "backdoor" strategy—a legal way to get money into a Roth IRA regardless of income.

## Project Context

**Repository:** You are working in a Next.js 15+ project with React 19, TypeScript, and Tailwind CSS.
**Your app directory:** `/src/app/tools/backdoor-roth/`
**Your calculator logic:** `/src/lib/calculators/backdoor-roth/`
**Branch name:** `feature/app-backdoor-roth`

## Background Research

**The Problem:**
- Roth IRA income limits: $161K single, $240K married (2024)
- High earners are "locked out" of direct Roth contributions
- Most don't know the backdoor method exists
- Those who do fear the "pro-rata rule"

**The Backdoor Roth Strategy:**
1. Contribute to Traditional IRA (non-deductible, since you have workplace plan)
2. Convert Traditional IRA to Roth IRA (immediately or shortly after)
3. Pay tax only on any gains between contribution and conversion
4. Money is now in Roth, growing tax-free forever

**Why It Works:**
- No income limit on Traditional IRA contributions (just deductibility)
- No income limit on Roth conversions
- Combining these = backdoor into Roth

**The Pro-Rata Rule (Key Complexity):**
If you have existing Traditional IRA balances, conversions are taxed proportionally:
- $6,000 new contribution + $54,000 existing Traditional = $60,000 total
- Convert $6,000 → only 10% is tax-free ($600), 90% is taxable ($5,400)
- This ruins the strategy!

**Solutions to Pro-Rata:**
1. Roll existing Traditional IRA into 401(k) (if plan allows)
2. Convert entire Traditional IRA to Roth (pay taxes now)
3. Don't do backdoor if you have large Traditional balances

**Important:** SEP-IRAs and SIMPLE IRAs count toward pro-rata calculation.

## Before You Start

1. Read shared patterns: `cat /docs/app-specs/shared-patterns.md`
2. Review existing calculator: `ls -la /src/app/tools/bilt-calculator/`
3. Check shared components: `cat /src/components/shared/index.ts`

## Design Requirements

- **Primary Color:** Emerald (#10b981) - growth, money, positive
- **Design Style:** Step-by-step guide, educational, reassuring
- **Base:** Dark mode (bg-neutral-950)
- **Mobile-first:** Must work on 375px viewport

## User Inputs

### Eligibility Check
| Input | Label | Default | Options |
|-------|-------|---------|---------|
| income | Annual Income (MAGI) | 200000 | 0 - 1000000 |
| filingStatus | Filing Status | single | single, married |
| hasWorkplacePlan | Has Workplace Retirement Plan | true | true, false |

### Current IRA Balances (for Pro-Rata)
| Input | Label | Default | Min | Max |
|-------|-------|---------|-----|-----|
| traditionalIRABalance | Traditional IRA Balance | 0 | 0 | 1000000 |
| sepIRABalance | SEP-IRA Balance | 0 | 0 | 1000000 |
| simpleIRABalance | SIMPLE IRA Balance | 0 | 0 | 500000 |

### Contribution Details
| Input | Label | Default | Min | Max |
|-------|-------|---------|-----|-----|
| contributionAmount | Contribution Amount | 7000 | 0 | 8000 |
| age | Age | 35 | 18 | 100 |

## Calculation Logic

```typescript
// src/lib/calculators/backdoor-roth/types.ts
export type FilingStatus = 'single' | 'married';

export interface CalculatorInputs {
  income: number;
  filingStatus: FilingStatus;
  hasWorkplacePlan: boolean;
  traditionalIRABalance: number;
  sepIRABalance: number;
  simpleIRABalance: number;
  contributionAmount: number;
  age: number;
}

export interface EligibilityResult {
  canContributeDirectlyToRoth: boolean;
  rothPhaseOutStart: number;
  rothPhaseOutEnd: number;
  needsBackdoor: boolean;
  canDeductTraditionalIRA: boolean;
}

export interface ProRataResult {
  totalIRABalance: number;
  nonDeductibleContribution: number;
  totalAfterContribution: number;
  taxFreePercentage: number;
  taxablePercentage: number;
  taxableAmount: number;
  taxFreeAmount: number;
  hasProRataIssue: boolean;
}

export interface CalculatorResults {
  eligibility: EligibilityResult;
  proRata: ProRataResult;
  contributionLimit: number;
  catchUpEligible: boolean;
  recommendedAction: 'direct_roth' | 'backdoor_clean' | 'backdoor_with_prorata' | 'fix_prorata_first' | 'not_eligible';
  steps: {
    step: number;
    title: string;
    description: string;
    warning?: string;
  }[];
  taxImpact: number;
  warnings: string[];
  tips: string[];
}
```

```typescript
// src/lib/calculators/backdoor-roth/calculations.ts
import type { CalculatorInputs, CalculatorResults, EligibilityResult, ProRataResult } from "./types";

// 2024 Limits
const ROTH_LIMITS = {
  single: { phaseOutStart: 146000, phaseOutEnd: 161000 },
  married: { phaseOutStart: 230000, phaseOutEnd: 240000 },
};

const TRADITIONAL_DEDUCTION_LIMITS = {
  single: { phaseOutStart: 77000, phaseOutEnd: 87000 },
  married: { phaseOutStart: 123000, phaseOutEnd: 143000 },
};

const CONTRIBUTION_LIMIT = 7000;
const CATCH_UP_LIMIT = 1000;
const CATCH_UP_AGE = 50;

export function calculate(inputs: CalculatorInputs): CalculatorResults {
  const {
    income,
    filingStatus,
    hasWorkplacePlan,
    traditionalIRABalance,
    sepIRABalance,
    simpleIRABalance,
    contributionAmount,
    age,
  } = inputs;

  // Determine contribution limit
  const catchUpEligible = age >= CATCH_UP_AGE;
  const contributionLimit = CONTRIBUTION_LIMIT + (catchUpEligible ? CATCH_UP_LIMIT : 0);
  const actualContribution = Math.min(contributionAmount, contributionLimit);

  // Check eligibility
  const rothLimits = ROTH_LIMITS[filingStatus];
  const canContributeDirectlyToRoth = income < rothLimits.phaseOutEnd;
  const needsBackdoor = income >= rothLimits.phaseOutStart;

  const tradLimits = TRADITIONAL_DEDUCTION_LIMITS[filingStatus];
  const canDeductTraditionalIRA = !hasWorkplacePlan || income < tradLimits.phaseOutStart;

  const eligibility: EligibilityResult = {
    canContributeDirectlyToRoth,
    rothPhaseOutStart: rothLimits.phaseOutStart,
    rothPhaseOutEnd: rothLimits.phaseOutEnd,
    needsBackdoor,
    canDeductTraditionalIRA,
  };

  // Calculate pro-rata
  const totalIRABalance = traditionalIRABalance + sepIRABalance + simpleIRABalance;
  const totalAfterContribution = totalIRABalance + actualContribution;

  let taxFreePercentage: number;
  let taxablePercentage: number;

  if (totalAfterContribution === 0) {
    taxFreePercentage = 100;
    taxablePercentage = 0;
  } else {
    taxFreePercentage = (actualContribution / totalAfterContribution) * 100;
    taxablePercentage = 100 - taxFreePercentage;
  }

  const taxFreeAmount = actualContribution * (taxFreePercentage / 100);
  const taxableAmount = actualContribution * (taxablePercentage / 100);
  const hasProRataIssue = totalIRABalance > 0;

  const proRata: ProRataResult = {
    totalIRABalance,
    nonDeductibleContribution: actualContribution,
    totalAfterContribution,
    taxFreePercentage,
    taxablePercentage,
    taxableAmount,
    taxFreeAmount,
    hasProRataIssue,
  };

  // Determine recommended action
  let recommendedAction: CalculatorResults['recommendedAction'];
  const steps: CalculatorResults['steps'] = [];
  const warnings: string[] = [];
  const tips: string[] = [];

  if (canContributeDirectlyToRoth && !needsBackdoor) {
    recommendedAction = 'direct_roth';
    steps.push({
      step: 1,
      title: 'Contribute Directly to Roth IRA',
      description: `Your income ($${income.toLocaleString()}) is below the Roth IRA limit. You can contribute directly—no backdoor needed!`,
    });
    tips.push('Direct Roth is simpler. Only use backdoor if your income increases above the limit.');
  } else if (!hasProRataIssue) {
    recommendedAction = 'backdoor_clean';
    steps.push(
      {
        step: 1,
        title: 'Contribute to Traditional IRA',
        description: `Make a non-deductible contribution of $${actualContribution.toLocaleString()} to a Traditional IRA.`,
      },
      {
        step: 2,
        title: 'Wait Briefly (Optional)',
        description: 'Some people wait a day or two, others convert immediately. There\'s no required waiting period.',
      },
      {
        step: 3,
        title: 'Convert to Roth IRA',
        description: 'Request a Roth conversion of the entire Traditional IRA balance. Since it\'s all non-deductible, you\'ll owe minimal or no tax.',
      },
      {
        step: 4,
        title: 'File Form 8606',
        description: 'At tax time, file Form 8606 to track your non-deductible contribution. This is crucial!',
      }
    );
    tips.push('You have no existing IRA balances—this is a "clean" backdoor Roth. Ideal situation!');
    tips.push('Consider doing this early in the year so your money has more time to grow tax-free.');
  } else if (taxablePercentage > 50) {
    recommendedAction = 'fix_prorata_first';
    steps.push({
      step: 1,
      title: 'Address Pro-Rata Issue First',
      description: `You have $${totalIRABalance.toLocaleString()} in Traditional/SEP/SIMPLE IRAs. This will make ${taxablePercentage.toFixed(0)}% of your conversion taxable.`,
      warning: 'The backdoor Roth won\'t be tax-efficient until you address this.',
    });

    if (hasWorkplacePlan) {
      steps.push({
        step: 2,
        title: 'Option A: Roll Into 401(k)',
        description: 'If your 401(k) accepts rollovers, move your Traditional IRA into it. This removes the balance from pro-rata calculation.',
      });
    }

    steps.push({
      step: 3,
      title: 'Option B: Convert Everything',
      description: `Convert your entire $${totalIRABalance.toLocaleString()} Traditional IRA to Roth. You'll pay tax now, but future backdoor conversions will be clean.`,
    });

    warnings.push(`Pro-rata rule: ${taxablePercentage.toFixed(0)}% of any conversion will be taxable.`);
    warnings.push('Fix this before attempting backdoor Roth, or you\'ll owe significant taxes.');
  } else {
    recommendedAction = 'backdoor_with_prorata';
    steps.push(
      {
        step: 1,
        title: 'Understand the Tax Impact',
        description: `Due to pro-rata rule, $${taxableAmount.toFixed(0)} of your $${actualContribution.toLocaleString()} conversion will be taxable.`,
        warning: 'This isn\'t ideal, but may still be worthwhile for long-term tax-free growth.',
      },
      {
        step: 2,
        title: 'Contribute to Traditional IRA',
        description: `Make a non-deductible contribution of $${actualContribution.toLocaleString()}.`,
      },
      {
        step: 3,
        title: 'Convert to Roth IRA',
        description: 'Convert the contribution amount. Be prepared to pay tax on the taxable portion.',
      },
      {
        step: 4,
        title: 'Consider Cleaning Up',
        description: 'For future years, consider rolling your Traditional IRA into a 401(k) to eliminate the pro-rata issue.',
      }
    );

    warnings.push(`Pro-rata rule applies: $${taxableAmount.toFixed(0)} will be taxable this year.`);
    tips.push('Long-term tax-free growth in Roth may still outweigh the upfront tax cost.');
  }

  // Estimate tax impact (assuming 32% marginal rate for high earners)
  const estimatedMarginalRate = 0.32;
  const taxImpact = taxableAmount * estimatedMarginalRate;

  return {
    eligibility,
    proRata,
    contributionLimit,
    catchUpEligible,
    recommendedAction,
    steps,
    taxImpact,
    warnings,
    tips,
  };
}
```

## UI Structure

### Layout

1. **Hero Section**
   - Title: "Backdoor Roth IRA Guide"
   - Subtitle: "High income? You can still contribute to a Roth IRA. Here's how."

2. **Eligibility Check**
   - Income input with visual threshold indicator
   - Filing status selector
   - Clear "You need the backdoor" or "You can contribute directly" message

3. **Pro-Rata Calculator** (if applicable)
   - Input existing IRA balances
   - Visual showing pro-rata split
   - Clear warning if pro-rata is problematic
   - Solutions offered

4. **Step-by-Step Instructions**
   - Numbered steps with clear actions
   - Warnings highlighted in context
   - Expandable details for each step

5. **Tax Impact Summary**
   - How much will be taxable
   - Estimated tax cost
   - Long-term benefit comparison

6. **Action Items Checklist**
   - [ ] Open Traditional IRA (if needed)
   - [ ] Make contribution by deadline
   - [ ] Request conversion
   - [ ] Track for Form 8606

7. **FAQ Section** (collapsible)
   - "Is the backdoor Roth legal?"
   - "What if I have a SEP-IRA?"
   - "Can I do this every year?"
   - "What about the step transaction doctrine?"

8. **Methodology Section** (collapsible)
   - IRS rules cited
   - Pro-rata formula explained
   - Form 8606 requirements

## Files to Create

```
src/
├── app/tools/backdoor-roth/
│   ├── page.tsx
│   └── calculator.tsx
└── lib/calculators/backdoor-roth/
    ├── types.ts
    └── calculations.ts
```

## Registration

Add to `/src/lib/site-config.ts`:

```typescript
{
  id: "backdoor-roth",
  name: "Backdoor Roth IRA Guide",
  description: "Step-by-step guide to the backdoor Roth strategy for high earners",
  href: "/tools/backdoor-roth",
  categoryId: "tax-planning",
  status: "live",
  primaryColor: "#10b981",
  designStyle: "educational",
  inspiredBy: ["Mad Fientist", "White Coat Investor"],
  featured: true,
}
```

## Testing Checklist

- [ ] `npm run build` passes
- [ ] `npm run lint` passes
- [ ] Mobile viewport (375px) works
- [ ] Income below limit → "Direct Roth" recommendation
- [ ] Income above limit, no IRA balance → "Clean backdoor" path
- [ ] Income above limit, with IRA balance → Pro-rata warning
- [ ] Catch-up contribution for age 50+
- [ ] SEP and SIMPLE IRAs included in pro-rata
- [ ] Steps are clear and actionable

## Git Workflow

```bash
git checkout -b feature/app-backdoor-roth
# ... build the app ...
git add .
git commit -m "Add Backdoor Roth IRA Guide"
git push -u origin feature/app-backdoor-roth
```

## Do NOT

- Modify shared components
- Provide tax advice (educational only)
- Ignore the pro-rata rule (it's the key complexity)
- Forget Form 8606 requirement
- Skip the "is this legal?" FAQ (people worry about it)
