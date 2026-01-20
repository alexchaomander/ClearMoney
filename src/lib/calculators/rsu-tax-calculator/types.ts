export type FilingStatus = "single" | "married" | "head_of_household";
export type WithholdingMethod = "sell_to_cover" | "net_settlement" | "cash";

export interface CalculatorInputs {
  sharesVesting: number;
  stockPrice: number;
  filingStatus: FilingStatus;
  annualSalary: number;
  otherIncome: number;
  state: string;
  withholdingMethod: WithholdingMethod;
}

export interface TaxBreakdown {
  federalIncome: number;
  federalRate: number;
  stateIncome: number;
  stateRate: number;
  socialSecurity: number;
  medicare: number;
  additionalMedicare: number;
  total: number;
  effectiveRate: number;
}

export interface WithholdingBreakdown {
  federalWithheld: number;
  stateWithheld: number;
  ficaWithheld: number;
  totalWithheld: number;
  sharesWithheld: number;
  sharesReceived: number;
}

export interface CalculatorResults {
  grossValue: number;
  withholding: WithholdingBreakdown;
  actualTax: TaxBreakdown;
  withholdingGap: number;
  isUnderwithheld: boolean;
  netValue: number;
  netShares: number;
  effectiveTaxRate: number;
  marginalBracket: number;
  newCostBasis: number;
  recommendations: string[];
}
