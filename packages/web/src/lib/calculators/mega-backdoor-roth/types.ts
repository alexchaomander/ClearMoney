export type ContributionType = "traditional" | "roth" | "mixed";

export interface PlanDetails {
  allowsAfterTax: boolean;
  allowsInPlanConversion: boolean;
  allowsInServiceDistribution: boolean;
  employeeContribution: number;
  employeeContributionType: ContributionType;
  employerMatch: number;
  afterTaxContributionLimit: number; // 0 means up to IRS max
}

export interface CalculatorInputs {
  age: number;
  annualIncome: number;
  plan: PlanDetails;
  currentRothBalance: number;
  yearsUntilRetirement: number;
  expectedReturn: number;
}

export interface EligibilityResult {
  canDoMegaBackdoor: boolean;
  missingRequirements: string[];
  conversionMethod: "in_plan" | "distribution" | "both" | "none";
  planGrade: "A" | "B" | "C" | "F"; // A = full mega backdoor, F = not possible
}

export interface ContributionSpace {
  // IRS Limits
  totalLimit: number; // $69,000 (or $76,500 if 50+)
  employeeLimit: number; // $23,000 (or $30,500 if 50+)
  catchUpLimit: number; // $7,500 if 50+

  // Your Usage
  employeeContribution: number;
  employerMatch: number;
  usedSpace: number;

  // Available for Mega Backdoor
  irsMaxAvailable: number; // Total limit - used
  planMaxAvailable: number; // Plan's after-tax limit (if any)
  megaBackdoorSpace: number; // Min of IRS and plan limit
}

export interface ProjectedGrowth {
  year: number;
  contribution: number;
  cumulativeContributions: number;
  balance: number;
  taxFreeSavings: number; // Compared to taxable account
}

export interface ComparisonAnalysis {
  // 10-year projection
  withMegaBackdoor: {
    totalContributions: number;
    finalBalance: number;
    taxFreeSavings: number;
  };
  withoutMegaBackdoor: {
    totalContributions: number;
    finalBalance: number;
    taxesPaid: number;
  };
  advantageAmount: number;
}

export interface CalculatorResults {
  eligibility: EligibilityResult;
  contributionSpace: ContributionSpace;
  maxMegaBackdoorAmount: number;

  // Growth projections
  projectedGrowth: ProjectedGrowth[];
  retirementBalance: number;
  totalContributed: number;
  totalGrowth: number;
  taxFreeSavings: number;

  // Comparison
  comparison: ComparisonAnalysis;

  // Steps to execute
  steps: {
    step: number;
    title: string;
    description: string;
    timing?: string;
  }[];

  // Recommendations
  recommendations: string[];
  warnings: string[];
}
