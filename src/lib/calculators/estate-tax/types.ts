export type MaritalStatus = "single" | "married";

export interface Assets {
  bankAccounts: number;
  brokerageAccounts: number;
  retirementAccounts: number;
  primaryResidence: number;
  otherRealEstate: number;
  lifeInsurance: number;
  businessInterests: number;
  otherAssets: number;
}

export interface Liabilities {
  mortgages: number;
  otherDebts: number;
}

export interface PersonalInfo {
  maritalStatus: MaritalStatus;
  stateOfResidence: string;
  age: number;
  spouseAge?: number;
}

export interface CalculatorInputs {
  assets: Assets;
  liabilities: Liabilities;
  personal: PersonalInfo;
  lifetimeGiftsMade: number;
}

export interface EstateCalculation {
  grossEstate: number;
  deductions: number;
  taxableEstate: number;
  exemptionUsed: number;
  exemptionRemaining: number;
  federalTaxDue: number;
  effectiveRate: number;
}

export interface StateEstateInfo {
  hasEstateTax: boolean;
  exemption: number;
  maxRate: number;
  stateTaxDue: number;
  notes: string;
}

export interface SunsetComparison {
  currentLaw: EstateCalculation;
  postSunset: EstateCalculation;
  additionalTaxIfNoAction: number;
  urgencyLevel: "none" | "low" | "moderate" | "high" | "critical";
}

export interface PlanningOpportunity {
  strategy: string;
  description: string;
  potentialSavings: number;
  timeframe: string;
  complexity: "simple" | "moderate" | "complex";
}

export interface CalculatorResults {
  grossEstate: number;
  totalLiabilities: number;
  netEstate: number;
  federal: EstateCalculation;
  state: StateEstateInfo;
  totalEstateTax: number;
  totalTaxRate: number;
  sunsetComparison: SunsetComparison;
  assetBreakdown: {
    category: string;
    value: number;
    percentage: number;
  }[];
  lifeInsuranceWarning: boolean;
  stateExemptionWarning: boolean;
  sunsetWarning: boolean;
  opportunities: PlanningOpportunity[];
  recommendations: string[];
  warnings: string[];
}
