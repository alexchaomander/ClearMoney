export type FilingStatus = "single" | "married" | "head_of_household";

export interface CalculatorInputs {
  currentAge: number;
  birthDate: string;
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

export interface BreakdownItem {
  label: string;
  value: number;
}

export interface SuperCatchUpResults {
  eligibility: {
    currentlyEligible: boolean;
    yearsUntilEligible: number;
    superCatchUpYears: number[];
    missedYears: number[];
    effectiveAge: number;
  };
  fourYearPlan: YearProjection[];
  projections: {
    superCatchUp: YearProjection[];
    regularCatchUp: YearProjection[];
    noCatchUp: YearProjection[];
  };
  valueOfSuperCatchUp: {
    extraContributionsOver4Years: number;
    extraGrowthByRetirement: number;
    totalExtraWealth: number;
    monthlyRetirementIncomeIncrease: number;
  };
  comparison: {
    withSuperCatchUp: {
      balanceAtRetirement: number;
      monthlyIncome4Percent: number;
    };
    withRegularCatchUp: {
      balanceAtRetirement: number;
      monthlyIncome4Percent: number;
    };
    withNoCatchUp: {
      balanceAtRetirement: number;
      monthlyIncome4Percent: number;
    };
  };
  rothRequirement: {
    required: boolean;
    reason: string;
    taxImpact: number;
  };
  cashFlow: {
    monthlyEmployeeMax: number;
    employerMatchPerYear: number;
  };
  recommendations: string[];
}
