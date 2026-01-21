export type FilingStatus = "single" | "married" | "head_of_household";

export interface CalculatorInputs {
  currentAge: number;
  birthDate: Date;
  currentBalance: number;
  annualSalary: number;
  contributionRate: number;
  employerMatchPercent: number;
  employerMatchCap: number;
  expectedReturn: number;
  retirementAge: number;
  priorYearWages: number;
  filingStatus: FilingStatus;
}

export interface YearProjection {
  year: number;
  age: number;
  baseLimit: number;
  catchUpLimit: number;
  totalLimit: number;
  yourContribution: number;
  employerMatch: number;
  totalContribution: number;
  yearEndBalance: number;
  isSuperCatchUpYear: boolean;
  mustUseRoth: boolean;
}

export interface EligibilityResults {
  currentlyEligible: boolean;
  yearsUntilEligible: number;
  superCatchUpYears: number[];
  missedYears: number[];
}

export interface ValueOfSuperCatchUp {
  extraContributionsOver4Years: number;
  extraGrowthByRetirement: number;
  totalExtraWealth: number;
  monthlyRetirementIncomeIncrease: number;
}

export interface ComparisonResult {
  balanceAtRetirement: number;
  monthlyIncome4Percent: number;
}

export interface RothRequirement {
  required: boolean;
  reason: string;
  taxImpact: number;
}

export interface CalculatorResults {
  eligibility: EligibilityResults;
  fourYearPlan: YearProjection[];
  valueOfSuperCatchUp: ValueOfSuperCatchUp;
  comparison: {
    withSuperCatchUp: ComparisonResult;
    withRegularCatchUp: ComparisonResult;
    withNoCatchUp: ComparisonResult;
  };
  rothRequirement: RothRequirement;
  recommendations: string[];
}
