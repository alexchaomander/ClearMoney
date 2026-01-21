import type { CreditScoreRange, RiskTolerance } from "./types";

export const DTI_THRESHOLDS: Record<
  RiskTolerance | "maxQM",
  { frontEnd: number; backEnd: number }
> = {
  conservative: { frontEnd: 0.25, backEnd: 0.3 },
  moderate: { frontEnd: 0.28, backEnd: 0.36 },
  aggressive: { frontEnd: 0.31, backEnd: 0.43 },
  maxQM: { frontEnd: 0.31, backEnd: 0.43 },
};

export const PMI_RATES: Record<
  "95+" | "90-95" | "85-90" | "80-85",
  Record<CreditScoreRange, number>
> = {
  "95+": { excellent: 0.0055, good: 0.0078, fair: 0.0105, poor: 0.015 },
  "90-95": { excellent: 0.0038, good: 0.0052, fair: 0.0078, poor: 0.012 },
  "85-90": { excellent: 0.0025, good: 0.0035, fair: 0.0052, poor: 0.0085 },
  "80-85": { excellent: 0.0019, good: 0.0026, fair: 0.0038, poor: 0.0065 },
};

export const CLOSING_COSTS_BY_STATE: Record<string, number> = {
  NY: 0.04,
  CA: 0.025,
  TX: 0.03,
  FL: 0.03,
  WA: 0.027,
  IL: 0.025,
  MA: 0.022,
  NJ: 0.035,
  PA: 0.03,
  default: 0.03,
};

export const DOWN_PAYMENT_OPTIONS = [3, 5, 10, 20];

export const CREDIT_SCORE_OPTIONS: Array<{
  label: string;
  value: CreditScoreRange;
}> = [
  { label: "Excellent (760+)", value: "excellent" },
  { label: "Good (700-759)", value: "good" },
  { label: "Fair (640-699)", value: "fair" },
  { label: "Poor (<640)", value: "poor" },
];

export const RISK_TOLERANCE_OPTIONS: Array<{
  label: string;
  value: RiskTolerance;
  description: string;
}> = [
  {
    label: "Conservative",
    value: "conservative",
    description: "25/30 DTI limits to keep payments very comfortable.",
  },
  {
    label: "Moderate",
    value: "moderate",
    description: "Classic 28/36 rule for balanced affordability.",
  },
  {
    label: "Aggressive",
    value: "aggressive",
    description: "Stretching toward lender max (31/43).",
  },
];

export const STATE_OPTIONS = [
  { label: "California", value: "CA" },
  { label: "Florida", value: "FL" },
  { label: "Illinois", value: "IL" },
  { label: "Massachusetts", value: "MA" },
  { label: "New Jersey", value: "NJ" },
  { label: "New York", value: "NY" },
  { label: "Pennsylvania", value: "PA" },
  { label: "Texas", value: "TX" },
  { label: "Washington", value: "WA" },
  { label: "Other", value: "default" },
];

export const ASSUMPTIONS = {
  loanTermYears: 30,
  insuranceRate: 0.005,
  maintenanceRate: 0.01,
  utilitiesRate: 0.004,
  estimatedPIRatio: 0.65,
  moveInCosts: 2500,
  appreciationRate: 0.03,
  rentGrowthRate: 0.03,
  principalPaydownFiveYears: 0.05,
  emergencyFundMonths: 3,
};
