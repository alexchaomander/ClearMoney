export type FilingStatus = "single" | "married" | "head_of_household";

export interface CalculatorInputs {
  priorYearW2Wages: number;
  currentAge: number;
  currentBalance: number;
  currentMarginalRate: number;
  retirementTaxRate: number;
  yearsUntilRetirement: number;
  expectedReturn: number;
  stateTaxRate: number;
  employerOffersRoth: boolean;
  filingStatus: FilingStatus;
}

export interface BreakdownItem {
  label: string;
  value: number;
}

export interface TaxImpactSummary {
  rothCatchUpTaxCost: number;
  traditionalTaxSavings: number;
  netImmediateCost: number;
}

export interface LongTermPath {
  totalContributions: number;
  taxPaidUpfront?: number;
  taxSavingsNow?: number;
  projectedValue: number;
  taxAtWithdrawal: number;
  netRetirementValue: number;
}

export interface LongTermComparison {
  rothPath: LongTermPath;
  traditionalPath: LongTermPath;
  rothAdvantage: number;
}

export interface BreakEvenAnalysis {
  breakEvenTaxRate: number;
  breakEvenYears: number;
  explanation: string;
}

export interface PlanReadiness {
  employerReady: boolean;
  canMakeCatchUp: boolean;
  alternativeStrategies: string[];
}

export interface ContributionScheduleItem {
  year: number;
  age: number;
  contribution: number;
  projectedValue: number;
}

export interface CalculatorResults {
  subjectToMandatoryRoth: boolean;
  catchUpAmount: number;
  isSuperCatchUp: boolean;
  eligibleForCatchUp: boolean;
  yearsOfCatchUp: number;
  taxImpact: TaxImpactSummary;
  longTermComparison: LongTermComparison;
  breakEvenAnalysis: BreakEvenAnalysis;
  planReadiness: PlanReadiness;
  recommendations: string[];
  projectedCurrentBalance: number;
  contributionSchedule: ContributionScheduleItem[];
}
