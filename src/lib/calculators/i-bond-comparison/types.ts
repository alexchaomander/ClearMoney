export interface CalculatorInputs {
  amount: number;
  years: number;
  hysaRate: number;
  federalBracket: number;
  stateRate: number;
  needsFullLiquidity: boolean;
  expectedInflation: number;
  iBondFixedRate: number;
  iBondInflationRate: number;
}

export type OptionId = "i-bond" | "hysa" | "tips" | "cd";

export interface InvestmentOption {
  id: OptionId;
  name: string;
  nominalRate: number;
  afterTaxRate: number;
  realReturn: number;
  valueAfterYears: number;
  taxPaid: number;
  netValue: number;
  liquidityScore: number;
  pros: string[];
  cons: string[];
}

export interface AllocationRecommendation {
  option: string;
  percent: number;
  reason: string;
}

export interface Recommendation {
  primary: string;
  allocation: AllocationRecommendation[];
}

export interface EmergencyFundStrategy {
  totalNeeded: number;
  inIBonds: number;
  inHYSA: number;
  reasoning: string;
}

export interface CalculatorResults {
  options: InvestmentOption[];
  bestOption: OptionId;
  recommendation: Recommendation;
  emergencyFundStrategy: EmergencyFundStrategy;
}
