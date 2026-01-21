# App Spec: Student Loan Repayment Strategy Planner

## Overview
- **One-line description:** Compare IDR plans (SAVE, RAP, IBR, ICR) and find the optimal repayment strategy for your situation
- **Target user persona:** Federal student loan borrowers navigating the 2026 changes, especially those with $50k+ in loans considering IDR or PSLF
- **Key problem it solves:** Massive confusion around SAVE plan ending, new RAP plan launching, and which repayment plan is optimal

## Inspired By
- NPR's coverage of 2026 student loan changes
- Student Loan Planner's calculators
- The need for clarity amid regulatory chaos

## Why This Matters Now
Major changes happening in 2025-2026:
1. **SAVE Plan Ending** - December 2025 settlement will phase out SAVE
2. **RAP Plan Launching** - New Repayment Assistance Plan available July 1, 2026
3. **Forgiveness Now Taxable** - Starting 2026, IDR forgiveness counts as income
4. **IBR Changes** - No more partial financial hardship requirement
5. **PSLF Rule Changes** - "Substantial illegal purpose" employer exclusion
6. **Key Deadline** - Must consolidate Parent PLUS loans before July 1, 2026

## Core Features
- [ ] Compare monthly payments across all available IDR plans
- [ ] Calculate total amount paid over loan lifetime
- [ ] Show forgiveness timeline and taxable forgiveness amount
- [ ] PSLF eligibility checker and timeline
- [ ] Deadline tracker for key dates (July 2026, 2028 phase-outs)
- [ ] Tax bomb calculator for forgiveness scenarios
- [ ] Personalized recommendation engine

## User Inputs

| Input | Type | Default | Min | Max | Step |
|-------|------|---------|-----|-----|------|
| Total Federal Loan Balance | slider | 50000 | 0 | 500000 | 1000 |
| Weighted Average Interest Rate | slider | 6.5 | 0 | 12 | 0.1 |
| Loan Type | select | direct | - | - | - |
| Annual Gross Income | slider | 60000 | 0 | 500000 | 1000 |
| Expected Income Growth | slider | 3 | 0 | 10 | 0.5 |
| Filing Status | select | single | - | - | - |
| Family Size | number | 1 | 1 | 10 | 1 |
| State of Residence | select | - | - | - | - |
| Years in Repayment Already | number | 0 | 0 | 25 | 1 |
| PSLF-Eligible Employment | boolean | false | - | - | - |
| Qualifying PSLF Payments Made | number | 0 | 0 | 120 | 1 |
| Has Parent PLUS Loans | boolean | false | - | - | - |

## Calculation Logic

```typescript
interface StudentLoanInputs {
  loanBalance: number;
  interestRate: number;
  loanType: "direct" | "ffel" | "perkins" | "parent_plus";
  annualIncome: number;
  incomeGrowthRate: number;
  filingStatus: "single" | "married" | "head_of_household";
  familySize: number;
  state: string;
  yearsInRepayment: number;
  pslfEligible: boolean;
  pslfPaymentsMade: number;
  hasParentPlus: boolean;
}

interface RepaymentPlan {
  name: string;
  available: boolean;
  availableUntil?: string;
  monthlyPaymentYear1: number;
  monthlyPaymentFinal: number;
  totalPaid: number;
  totalInterestPaid: number;
  forgivenessAmount: number;
  forgivenessYear: number;
  taxOnForgiveness: number;
  netCost: number; // totalPaid + taxOnForgiveness
}

interface StudentLoanResults {
  plans: {
    standard: RepaymentPlan;
    graduated: RepaymentPlan;
    extended: RepaymentPlan;
    ibr: RepaymentPlan;
    icr: RepaymentPlan;
    paye: RepaymentPlan;
    save: RepaymentPlan;
    rap: RepaymentPlan;
  };
  pslfAnalysis?: {
    eligible: boolean;
    paymentsRemaining: number;
    estimatedForgivenessDate: Date;
    estimatedForgivenessAmount: number;
    taxFree: boolean;
  };
  recommendation: {
    bestPlan: string;
    reasoning: string;
    keyDeadlines: { date: string; action: string }[];
    warnings: string[];
  };
}

// 2026 Federal Poverty Guidelines (150% for IDR)
const POVERTY_GUIDELINE_2026 = {
  baseAmount: 15650,
  perPerson: 5520,
};

// IDR Plan Parameters
const IDR_PLANS = {
  ibr: {
    paymentPercent: 0.15, // 15% of discretionary income (old borrowers)
    paymentPercentNew: 0.10, // 10% for new borrowers after 2014
    forgivenessYears: 25, // 20 for new borrowers
    available: true,
    closingDate: null,
  },
  icr: {
    paymentPercent: 0.20, // 20% of discretionary or 12-year fixed adjusted
    forgivenessYears: 25,
    available: true,
    closingDate: "2028-07-01",
  },
  paye: {
    paymentPercent: 0.10,
    forgivenessYears: 20,
    available: true,
    closingDate: "2027-07-01",
  },
  save: {
    paymentPercent: 0.10, // 5% for undergrad only
    forgivenessYears: 20, // 10 for balances under $12k
    available: false, // Ending per Dec 2025 settlement
    closingDate: "2025-12-31",
  },
  rap: {
    paymentPercent: 0.15, // Estimated based on legislation
    forgivenessYears: 30,
    available: true,
    availableDate: "2026-07-01",
  },
};

function calculateDiscretionaryIncome(income: number, familySize: number): number {
  const povertyLine = POVERTY_GUIDELINE_2026.baseAmount +
    (familySize - 1) * POVERTY_GUIDELINE_2026.perPerson;
  const threshold = povertyLine * 1.5; // 150% of poverty
  return Math.max(0, income - threshold);
}

function calculateIDRPayment(
  discretionaryIncome: number,
  paymentPercent: number,
  standardPayment: number
): number {
  const idrPayment = (discretionaryIncome * paymentPercent) / 12;
  return Math.min(idrPayment, standardPayment); // Capped at standard payment
}

function projectLoanBalance(
  balance: number,
  rate: number,
  monthlyPayment: number,
  months: number
): { finalBalance: number; totalPaid: number; totalInterest: number } {
  let currentBalance = balance;
  let totalPaid = 0;
  let totalInterest = 0;
  const monthlyRate = rate / 12;

  for (let i = 0; i < months; i++) {
    const interest = currentBalance * monthlyRate;
    totalInterest += interest;
    currentBalance += interest;

    const payment = Math.min(monthlyPayment, currentBalance);
    currentBalance -= payment;
    totalPaid += payment;

    if (currentBalance <= 0) break;
  }

  return { finalBalance: Math.max(0, currentBalance), totalPaid, totalInterest };
}

function calculateTaxOnForgiveness(
  forgivenAmount: number,
  income: number,
  filingStatus: string,
  state: string
): number {
  // Federal tax on forgiveness (treated as ordinary income)
  // Simplified: use estimated marginal rate
  const federalRate = income > 100000 ? 0.24 : income > 50000 ? 0.22 : 0.12;
  const stateRate = STATE_TAX_RATES[state] || 0.05;

  return forgivenAmount * (federalRate + stateRate);
}
```

## UI Components
- Loan details input section
- Income and family information
- Employment status (PSLF eligibility)
- Plan comparison table with sortable columns
- Timeline visualization showing payment trajectory
- Tax bomb calculator for forgiveness
- Key deadlines alert section
- Personalized recommendation card

## Design Direction
- **Primary Color:** `#6366f1` (indigo - education/trust)
- **Personality:** Clear, reassuring, authoritative
- **Style:** Comparison tables, timeline charts, deadline alerts
- **Visual emphasis:** Monthly payment differences, total cost comparison, deadline countdown

## Agent Prompt

```markdown
# Agent Prompt: Student Loan Repayment Strategy Planner

## Context
You are building a student loan calculator for ClearMoney that helps borrowers navigate the massive 2026 changes to federal student loan repayment. The SAVE plan is ending, RAP is launching, and forgiveness becomes taxable.

## Project Location
- Repository: /Users/alexchao/projects/clearmoney
- Your app directory: /src/app/tools/student-loan-strategy/
- Your calculator logic: /src/lib/calculators/student-loan-strategy/

## Design Requirements
- Primary Color: #6366f1 (indigo)
- Mobile-first, dark mode base
- Clear comparison tables
- Prominent deadline warnings

## Key Rules (2025-2026 Changes)

### SAVE Plan (Ending)
- December 2025 settlement ends SAVE enrollment
- Existing SAVE borrowers moved to other plans
- Time in SAVE forbearance does NOT count toward forgiveness

### RAP Plan (New - July 2026)
- 30-year forgiveness timeline (vs 20-25 for other IDR)
- Payment based on income
- Available July 1, 2026

### IBR Changes
- Partial financial hardship requirement REMOVED
- Anyone can now use IBR
- Payment capped at 10-year standard payment

### Key Deadlines
- July 1, 2026: Must consolidate Parent PLUS before this date for IDR access
- July 2027: PAYE closes to new enrollees
- July 2028: ICR closes, borrowers must choose Standard/RAP/IBR

### Forgiveness Tax Treatment
- Starting 2026, IDR forgiveness is TAXABLE as ordinary income
- PSLF forgiveness remains tax-free
- Need to plan for "tax bomb"

### PSLF Changes
- 10 years / 120 payments requirement unchanged
- New "substantial illegal purpose" employer exclusion (July 2026)
- Qualifying payments NOT earned during SAVE forbearance

## Files to Create
1. `/src/app/tools/student-loan-strategy/page.tsx`
2. `/src/app/tools/student-loan-strategy/calculator.tsx`
3. `/src/lib/calculators/student-loan-strategy/calculations.ts`
4. `/src/lib/calculators/student-loan-strategy/constants.ts`
5. `/src/lib/calculators/student-loan-strategy/types.ts`

## Registration
Add to `/src/lib/site-config.ts`:
```typescript
{
  id: "student-loan-strategy",
  name: "Student Loan Repayment Planner",
  description: "Compare IDR plans and find the best strategy for the 2026 changes",
  href: "/tools/student-loan-strategy",
  categoryId: "debt",
  status: "live",
  primaryColor: "#6366f1",
  designStyle: "analytical",
  inspiredBy: ["Student Loan Planner", "SAVE/RAP Changes 2026"],
  featured: true,
}
```

## Testing Checklist
- [ ] All IDR plan payments calculate correctly
- [ ] Forgiveness timelines accurate for each plan
- [ ] Tax on forgiveness calculated correctly
- [ ] PSLF timeline shows correctly
- [ ] Deadline warnings display appropriately
- [ ] Parent PLUS special handling works
```

## Sources

### Primary Sources
1. **NPR: 2026 Federal Student Loan Changes**
   https://www.npr.org/2025/12/23/nx-s1-5630504/2026-federal-loans-student-changes-save-plan

2. **Federal Student Aid: IDR Court Actions**
   https://studentaid.gov/announcements-events/idr-court-actions

3. **Department of Education: SAVE Plan Settlement**
   https://www.ed.gov/about/news/press-release/us-department-of-education-announces-agreement-missouri-end-biden-administrations-illegal-save-plan

### Secondary Sources
4. **Tate Law: Should You Switch IDR Plans in 2026?**
   https://www.tateesq.com/learn/student-loan-repayment-save-switch-to-ibr

5. **TISLA: SAVE Litigation Updates**
   https://freestudentloanadvice.org/repayment-plan/save-litigation-updates-and-faq/

6. **Earnest: SAVE vs RAP 2026**
   https://www.earnest.com/blog/save-vs-rap-student-loan-repayment-2026

7. **Yahoo Finance: Future of Student Loans**
   https://finance.yahoo.com/personal-finance/student-loans/article/future-of-student-loans-220915529.html

8. **Student Loan Borrowers Assistance: SAVE Plan Ending**
   https://studentloanborrowerassistance.org/with-new-settlement-save-plan-may-be-ending-soon/
