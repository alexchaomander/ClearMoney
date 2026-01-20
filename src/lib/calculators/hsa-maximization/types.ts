export type CoverageType = "individual" | "family";

export interface EligibilityInputs {
  hasHDHP: boolean;
  coverageType: CoverageType;
  age: number;
  enrolledInMedicare: boolean;
  /** Number of months with HDHP coverage in the current year (1-12). Used to prorate contribution limits for partial-year coverage. */
  monthsOfCoverage: number;
}

export interface ContributionInputs {
  currentContribution: number;
  employerContribution: number;
  currentHSABalance: number;
}

export interface InvestmentInputs {
  expectedReturn: number;
  yearsToRetirement: number;
  yearsInRetirement: number;
}

export interface TaxInputs {
  marginalTaxRate: number;
  retirementTaxRate: number;
  stateCode: string;
}

export interface MedicalInputs {
  annualMedicalExpenses: number;
  retirementMedicalExpenses: number;
}

export interface CalculatorInputs {
  eligibility: EligibilityInputs;
  contribution: ContributionInputs;
  investment: InvestmentInputs;
  tax: TaxInputs;
  medical: MedicalInputs;
}

export interface EligibilityResult {
  isEligible: boolean;
  contributionLimit: number;
  catchUpAmount: number;
  maxContribution: number;
  /** Max contribution after applying partial-year proration */
  proratedMaxContribution: number;
  remainingContributionRoom: number;
  reasons: string[];
}

export interface GrowthProjection {
  year: number;
  age: number;
  contribution: number;
  employerContribution: number;
  medicalExpenses: number;
  outOfPocketMedical: number;
  receiptsPending: number;
  yearEndBalance: number;
  cumulativeContributions: number;
  cumulativeGrowth: number;
}

export interface TaxSavingsAnalysis {
  // Annual tax savings from contribution
  annualContributionDeduction: number;
  federalTaxSaved: number;
  stateTaxSaved: number;
  ficaTaxSaved: number;
  totalAnnualTaxSaved: number;

  // Lifetime tax advantages
  lifetimeContributions: number;
  lifetimeTaxSavingsOnContributions: number;
  taxFreeGrowth: number;
  taxFreeWithdrawals: number;
  totalLifetimeTaxAdvantage: number;
}

export interface ComparisonAnalysis {
  hsaStrategy: {
    finalBalance: number;
    totalContributions: number;
    totalGrowth: number;
    taxesSaved: number;
    medicalCovered: number;
  };
  taxableAccountStrategy: {
    finalBalance: number;
    totalContributions: number;
    totalGrowth: number;
    taxesPaid: number;
    medicalCovered: number;
  };
  hsaAdvantage: number;
}

export interface CalculatorResults {
  // Eligibility
  eligibility: EligibilityResult;

  // Growth Projections
  projections: GrowthProjection[];
  retirementBalance: number;
  endOfLifeBalance: number;

  // Tax Analysis
  taxSavings: TaxSavingsAnalysis;

  // Comparison
  comparison: ComparisonAnalysis;

  // The "HSA Hack" Analysis
  receiptsBanked: number;
  medicalExpensesCoverable: number;
  yearsOfMedicalCovered: number;

  // Optimization Metrics
  maxContributionBenefit: number;
  additionalIfMaxed: number;

  // Recommendations
  recommendations: string[];
  warnings: string[];

  // Steps
  steps: {
    step: number;
    title: string;
    description: string;
    impact?: string;
  }[];
}
