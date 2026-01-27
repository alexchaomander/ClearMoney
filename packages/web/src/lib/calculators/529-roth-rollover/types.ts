export interface CalculatorInputs {
  accountBalance: number;
  accountOpenDate: Date;
  beneficiaryAge: number;
  earnedIncome: number;
  otherIRAContributions: number;
  contributionsMade5YearsAgo: number;
  priorRollovers: number;
  expectedReturn: number;
  yearsUntilRetirement: number;
}

export interface EligibilityDetails {
  meetsAccountAgeRequirement: boolean;
  accountAgeYears: number;
  yearsUntilEligible: number;
  hasSeasonedContributions: boolean;
  seasonedAmount: number;
  hasEarnedIncome: boolean;
}

export interface CurrentYearMax {
  annualIRALimit: number;
  reducedByOtherContributions: number;
  limitedByEarnedIncome: number;
  limitedBySeasonedContributions: number;
  limitedByLifetimeRemaining: number;
  maxRolloverThisYear: number;
}

export interface RolloverScheduleItem {
  year: number;
  amount: number;
  cumulativeRolled: number;
  remainingLifetimeLimit: number;
}

export interface ProjectedBenefit {
  totalRolled: number;
  yearsOfGrowth: number;
  projectedValue: number;
  taxFreeGrowth: number;
}

export interface AlternativeComparison {
  rolloverStrategy: { netValue: number; taxPaid: number };
  nonQualifiedWithdrawal: { netValue: number; taxPaid: number; penalty: number };
  keepFor529Expenses: { value: number; notes: string };
}

export interface CalculatorResults {
  eligibility: EligibilityDetails;
  currentYearMax: CurrentYearMax;
  rolloverSchedule: RolloverScheduleItem[];
  projectedBenefit: ProjectedBenefit;
  alternativeComparison: AlternativeComparison;
}
