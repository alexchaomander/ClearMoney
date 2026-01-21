# App Spec: Home Affordability Reality Check Calculator

## Overview
- **One-line description:** An honest home affordability calculator that shows what you can ACTUALLY afford, not what a lender will approve
- **Target user persona:** First-time homebuyers, renters considering buying, anyone house shopping in 2025-2026
- **Key problem it solves:** Most calculators show max approval amount, not a sustainable budget; hidden costs are often ignored

## Inspired By
- The 28/36 rule (housing/total DTI)
- Anti-predatory lending education
- The post-2008 housing crisis lessons
- Mortgage rates declining but still elevated

## Why This Matters Now
2025-2026 housing environment:
1. **Mortgage Rates Declining** - Projected 5.9% by end of 2026 (down from 7%+ peaks)
2. **Affordability Still Stretched** - Home prices remain elevated
3. **First-Time Buyer Programs** - 3% down options, down payment assistance
4. **FOMO vs Reality** - Many buyers overextending

## Core Features
- [ ] Calculate true monthly cost (PITI + HOA + maintenance + utilities)
- [ ] Show comfortable vs max approval amounts
- [ ] Rent vs buy break-even analysis
- [ ] Down payment scenarios (3%, 5%, 10%, 20%)
- [ ] PMI impact calculator
- [ ] Hidden costs breakdown (closing, maintenance, repairs)
- [ ] First-time buyer program eligibility

## User Inputs

| Input | Type | Default | Min | Max | Step |
|-------|------|---------|-----|-----|------|
| Annual Gross Income | slider | 100000 | 20000 | 500000 | 5000 |
| Monthly Debt Payments | slider | 500 | 0 | 10000 | 50 |
| Down Payment Saved | slider | 50000 | 0 | 500000 | 5000 |
| Target Down Payment % | select | 20% | - | - | - |
| Credit Score Range | select | 740-799 | - | - | - |
| State/Location | select | - | - | - | - |
| Current Monthly Rent | slider | 2000 | 0 | 10000 | 100 |
| Mortgage Rate | slider | 6.0 | 3 | 10 | 0.125 |
| Property Tax Rate | slider | 1.2 | 0 | 3 | 0.1 |
| HOA (if applicable) | slider | 0 | 0 | 1000 | 25 |
| Risk Tolerance | select | moderate | - | - | - |

## Calculation Logic

```typescript
interface AffordabilityInputs {
  annualIncome: number;
  monthlyDebt: number;
  downPaymentSaved: number;
  targetDownPaymentPercent: number;
  creditScore: "excellent" | "good" | "fair" | "poor";
  state: string;
  currentRent: number;
  mortgageRate: number;
  propertyTaxRate: number;
  hoa: number;
  riskTolerance: "conservative" | "moderate" | "aggressive";
}

interface AffordabilityResults {
  maxApprovalAmount: number;
  comfortableAmount: number;
  stretchAmount: number;
  monthlyBreakdown: {
    principal: number;
    interest: number;
    propertyTax: number;
    homeInsurance: number;
    pmi: number;
    hoa: number;
    maintenance: number;
    utilities: number;
    totalMonthly: number;
  };
  dtiAnalysis: {
    frontEndDTI: number;  // Housing costs / income
    backEndDTI: number;   // All debt / income
    maxFrontEnd: number;
    maxBackEnd: number;
    status: "comfortable" | "stretching" | "risky";
  };
  downPaymentAnalysis: {
    atTargetPercent: { homePrice: number; pmi: number; totalCost: number };
    at20Percent: { homePrice: number; pmi: number; totalCost: number };
    pmiBreakeven: number;
  };
  rentVsBuy: {
    monthlyOwnership: number;
    monthlyRent: number;
    breakEvenYears: number;
    fiveYearComparison: { buyingCost: number; rentingCost: number; equity: number };
  };
  hiddenCosts: {
    closingCosts: number;
    moveInCosts: number;
    firstYearMaintenance: number;
    emergencyFund: number;
    totalUpfront: number;
  };
  recommendations: string[];
  warnings: string[];
}

// DTI Thresholds
const DTI_THRESHOLDS = {
  conservative: { frontEnd: 0.25, backEnd: 0.30 },
  moderate: { frontEnd: 0.28, backEnd: 0.36 },
  aggressive: { frontEnd: 0.31, backEnd: 0.43 },
  maxQM: { frontEnd: 0.31, backEnd: 0.43 },  // Qualified Mortgage limit
};

// PMI rates by LTV and credit score
const PMI_RATES = {
  "95+": { excellent: 0.0055, good: 0.0078, fair: 0.0105, poor: 0.0150 },
  "90-95": { excellent: 0.0038, good: 0.0052, fair: 0.0078, poor: 0.0120 },
  "85-90": { excellent: 0.0025, good: 0.0035, fair: 0.0052, poor: 0.0085 },
  "80-85": { excellent: 0.0019, good: 0.0026, fair: 0.0038, poor: 0.0065 },
};

// Closing costs by state (approximate percentage)
const CLOSING_COSTS_BY_STATE: Record<string, number> = {
  NY: 0.04, CA: 0.025, TX: 0.03, FL: 0.03, // etc.
  default: 0.03,
};

function calculateMonthlyPayment(principal: number, rate: number, years: number): number {
  const monthlyRate = rate / 12;
  const numPayments = years * 12;
  return principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
    (Math.pow(1 + monthlyRate, numPayments) - 1);
}

function calculateMaxHomePrice(inputs: AffordabilityInputs): AffordabilityResults {
  const { annualIncome, monthlyDebt, downPaymentSaved, targetDownPaymentPercent,
          creditScore, mortgageRate, propertyTaxRate, hoa, riskTolerance } = inputs;

  const monthlyIncome = annualIncome / 12;
  const thresholds = DTI_THRESHOLDS[riskTolerance];

  // Max housing payment based on front-end DTI
  const maxHousingPayment = monthlyIncome * thresholds.frontEnd;

  // Max total debt based on back-end DTI
  const maxTotalDebt = monthlyIncome * thresholds.backEnd;
  const maxHousingFromBackEnd = maxTotalDebt - monthlyDebt;

  // Use the lower of the two
  const maxMonthlyPITI = Math.min(maxHousingPayment, maxHousingFromBackEnd);

  // Estimate non-P&I costs (tax, insurance, PMI, HOA)
  // These are roughly 30-40% of PITI for typical properties
  const estimatedPIRatio = 0.65; // P&I is ~65% of total housing cost
  const maxPI = maxMonthlyPITI * estimatedPIRatio;

  // Solve for home price given max P&I payment
  const monthlyRate = mortgageRate / 100 / 12;
  const numPayments = 30 * 12;
  const loanFactor = (Math.pow(1 + monthlyRate, numPayments) - 1) /
    (monthlyRate * Math.pow(1 + monthlyRate, numPayments));

  const maxLoanAmount = maxPI * loanFactor;
  const comfortableHomePrice = maxLoanAmount / (1 - targetDownPaymentPercent / 100);

  // Max approval (aggressive DTI)
  const aggressiveThresholds = DTI_THRESHOLDS.aggressive;
  const maxApprovalPayment = Math.min(
    monthlyIncome * aggressiveThresholds.frontEnd,
    monthlyIncome * aggressiveThresholds.backEnd - monthlyDebt
  ) * estimatedPIRatio;
  const maxApprovalLoan = maxApprovalPayment * loanFactor;
  const maxApprovalPrice = maxApprovalLoan / (1 - targetDownPaymentPercent / 100);

  return {
    maxApprovalAmount: maxApprovalPrice,
    comfortableAmount: comfortableHomePrice,
    stretchAmount: maxApprovalPrice * 0.9,
    // ... rest of calculations
  };
}

function calculateRentVsBuy(
  homePrice: number,
  downPayment: number,
  monthlyRent: number,
  mortgageRate: number,
  yearsToCompare: number = 5
): AffordabilityResults["rentVsBuy"] {
  const loanAmount = homePrice - downPayment;
  const monthlyPI = calculateMonthlyPayment(loanAmount, mortgageRate / 100, 30);

  // Estimate total monthly ownership cost
  const propertyTax = (homePrice * 0.012) / 12;
  const insurance = (homePrice * 0.005) / 12;
  const maintenance = (homePrice * 0.01) / 12;
  const monthlyOwnership = monthlyPI + propertyTax + insurance + maintenance;

  // Rent with 3% annual increase
  let totalRent = 0;
  let currentRent = monthlyRent;
  for (let year = 0; year < yearsToCompare; year++) {
    totalRent += currentRent * 12;
    currentRent *= 1.03;
  }

  // Total ownership cost over period
  const totalOwnership = monthlyOwnership * 12 * yearsToCompare;

  // Equity after 5 years (simplified)
  const appreciationRate = 0.03; // 3% annual
  const futureValue = homePrice * Math.pow(1 + appreciationRate, yearsToCompare);
  const equity = futureValue - loanAmount * 0.95; // ~5% principal paid in 5 years

  // Break-even calculation
  const monthlyDifference = monthlyOwnership - monthlyRent;
  const closingCosts = homePrice * 0.03;
  const breakEvenYears = monthlyDifference > 0
    ? (closingCosts + downPayment * 0.05) / (monthlyDifference * 12) // Never if owning costs more
    : closingCosts / (Math.abs(monthlyDifference) * 12 + homePrice * appreciationRate);

  return {
    monthlyOwnership,
    monthlyRent,
    breakEvenYears: Math.round(breakEvenYears * 10) / 10,
    fiveYearComparison: {
      buyingCost: totalOwnership + closingCosts,
      rentingCost: totalRent,
      equity,
    },
  };
}
```

## UI Components
- Income and debt input section
- Down payment slider with scenario comparison
- "What you can afford" gauge (comfortable → stretch → max)
- Monthly cost breakdown pie chart
- DTI ratio visualization (28/36 rule)
- Rent vs buy comparison table
- Hidden costs checklist
- Warning banners for risky scenarios

## Design Direction
- **Primary Color:** `#14b8a6` (teal - balanced, calm)
- **Personality:** Honest, protective, educational
- **Style:** Gauges, warning indicators, clear breakdowns
- **Visual emphasis:** Comfortable vs max amounts, hidden costs

## Agent Prompt

```markdown
# Agent Prompt: Home Affordability Reality Check

## Context
You are building an HONEST home affordability calculator for ClearMoney. Unlike bank calculators that show max approval, this shows what people can actually COMFORTABLY afford.

## Project Location
- Repository: /Users/alexchao/projects/clearmoney
- Your app directory: /src/app/tools/home-affordability/
- Your calculator logic: /src/lib/calculators/home-affordability/

## Design Requirements
- Primary Color: #14b8a6 (teal)
- Mobile-first, dark mode base
- Clear warning indicators
- Honest, not sales-focused

## Key Principles

### The 28/36 Rule
- Front-end DTI: Housing costs ≤ 28% of gross income
- Back-end DTI: All debt ≤ 36% of gross income
- These are MAXIMUMS, not targets

### True Monthly Cost Includes:
- Principal & Interest
- Property taxes (~1-2% of home value annually)
- Homeowners insurance (~0.5% annually)
- PMI (if < 20% down)
- HOA fees
- Maintenance (~1% of home value annually)
- Utilities (higher than renting)

### Hidden Upfront Costs:
- Closing costs (2-5% of home price)
- Inspection, appraisal fees
- Moving costs
- Immediate repairs/updates
- Furniture for larger space
- 3-6 month emergency fund for home

### Down Payment Options:
- 3% (Conventional, FHA requires 3.5%)
- 5% (Standard minimum)
- 10% (Lower PMI)
- 20% (No PMI)

## Files to Create
1. `/src/app/tools/home-affordability/page.tsx`
2. `/src/app/tools/home-affordability/calculator.tsx`
3. `/src/lib/calculators/home-affordability/calculations.ts`
4. `/src/lib/calculators/home-affordability/constants.ts`
5. `/src/lib/calculators/home-affordability/types.ts`

## Registration
Add to `/src/lib/site-config.ts`:
```typescript
{
  id: "home-affordability",
  name: "Home Affordability Reality Check",
  description: "See what you can ACTUALLY afford, not just what a bank will approve",
  href: "/tools/home-affordability",
  categoryId: "budgeting",
  status: "live",
  primaryColor: "#14b8a6",
  designStyle: "analytical",
  inspiredBy: ["28/36 Rule", "Anti-Predatory Lending"],
  featured: true,
}
```

## Testing Checklist
- [ ] DTI calculations match 28/36 rule
- [ ] PMI calculates correctly based on LTV and credit
- [ ] Rent vs buy break-even is reasonable
- [ ] Hidden costs are comprehensive
- [ ] Warnings trigger for risky scenarios
```

## Sources

### Primary Sources
1. **Fannie Mae: Mortgage Affordability Calculator**
   https://yourhome.fanniemae.com/calculators-tools/mortgage-affordability-calculator

2. **NerdWallet: How Much House Can I Afford**
   https://www.nerdwallet.com/mortgages/calculators/how-much-house-can-i-afford

3. **Bankrate: House Affordability Calculator**
   https://www.bankrate.com/real-estate/new-house-calculator/

### Secondary Sources
4. **Rocket Mortgage: Home Affordability Calculator**
   https://www.rocketmortgage.com/calculators/home-affordability-calculator

5. **Zillow: Affordability Calculator**
   https://www.zillow.com/mortgage-calculator/house-affordability/

6. **Fidelity: 2026 Money Trends (Mortgage Rate Projections)**
   https://www.fidelity.com/learning-center/personal-finance/2026-money-trends

7. **Wells Fargo: Home Affordability Calculator**
   https://www.wellsfargo.com/mortgage/calculators/home-affordability-calculator/
