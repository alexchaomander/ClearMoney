export type FilingStatus = "single" | "married" | "head_of_household";
export type DeductionType = "standard" | "itemized";

export interface IncomeInputs {
  wagesIncome: number;
  selfEmploymentIncome: number;
  shortTermCapitalGains: number;
  longTermCapitalGains: number;
  qualifiedDividends: number;
  ordinaryDividends: number;
  interestIncome: number;
  rentalIncome: number;
  otherOrdinaryIncome: number;
}

export interface DeductionInputs {
  deductionType: DeductionType;
  stateLocalTaxes: number;
  mortgageInterest: number;
  charitableGiving: number;
  otherItemized: number;
  retirement401k: number;
  traditionalIRA: number;
  hsaContribution: number;
}

export interface ScenarioInputs {
  rothConversionAmount: number;
  additionalIncome: number;
  additionalDeduction: number;
}

export interface CalculatorInputs {
  filingStatus: FilingStatus;
  income: IncomeInputs;
  deductions: DeductionInputs;
  scenario: ScenarioInputs;
}

export interface TaxBracket {
  min: number;
  max: number;
  rate: number;
  taxInBracket: number;
  cumulativeTax: number;
  yourIncomeInBracket: number;
  yourTaxInBracket: number;
}

export interface BracketVisualization {
  brackets: TaxBracket[];
  yourPosition: number;
  marginalRate: number;
  effectiveRate: number;
  roomInCurrentBracket: number;
  nextBracketStarts: number;
}

export interface CapitalGainsAnalysis {
  qualifiedIncome: number;
  ordinaryIncome: number;
  capitalGainsRate: number;
  capitalGainsTax: number;
  niitApplies: boolean;
  niitAmount: number;
}

export interface ThresholdAnalysis {
  threshold: string;
  amount: number;
  yourDistance: number;
  impact: string;
  isOver: boolean;
}

export interface OptimizationOpportunity {
  strategy: string;
  description: string;
  potentialSavings: number;
  action: string;
}

export interface CalculatorResults {
  grossIncome: number;
  adjustedGrossIncome: number;
  taxableIncome: number;

  ordinaryIncomeTax: number;
  capitalGainsTax: number;
  niitTax: number;
  selfEmploymentTax: number;
  totalFederalTax: number;

  marginalOrdinaryRate: number;
  marginalCapGainsRate: number;
  effectiveRate: number;

  ordinaryBrackets: BracketVisualization;
  capitalGainsBrackets: BracketVisualization;
  capitalGainsAnalysis: CapitalGainsAnalysis;

  thresholds: ThresholdAnalysis[];

  opportunities: OptimizationOpportunity[];

  baselineScenario: {
    taxableIncome: number;
    totalTax: number;
    effectiveRate: number;
  };
  modifiedScenario: {
    taxableIncome: number;
    totalTax: number;
    effectiveRate: number;
    difference: number;
  };
}
