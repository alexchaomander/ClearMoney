export type JobStability =
  | "government"
  | "stable"
  | "variable"
  | "freelance"
  | "unstable";
export type IncomeSource = "dual" | "single_stable" | "single_variable";
export type Dependents = "none" | "partner" | "children" | "extended";
export type HealthSituation =
  | "excellent"
  | "good"
  | "moderate"
  | "significant";
export type HousingSituation =
  | "rent_cheap"
  | "rent_normal"
  | "own_new"
  | "own_old";

export interface CalculatorInputs {
  monthlyExpenses: number;
  jobStability: JobStability;
  incomeSource: IncomeSource;
  dependents: Dependents;
  healthSituation: HealthSituation;
  housingSituation: HousingSituation;
}

export interface RiskFactor {
  name: string;
  value: string;
  multiplier: number;
  impact: "increases" | "decreases" | "neutral";
}

export interface CalculatorResults {
  baselineMonths: number;
  adjustedMonths: number;
  targetAmount: number;
  minimumAmount: number;
  comfortAmount: number;
  riskFactors: RiskFactor[];
  overallRisk: "low" | "moderate" | "high" | "very-high";
  recommendation: string;
}
