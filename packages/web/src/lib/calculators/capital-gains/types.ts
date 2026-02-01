export type FilingStatus = "single" | "married_filing_jointly" | "married_filing_separately" | "head_of_household";
export type HoldingPeriod = "short" | "long";

export interface CalculatorInputs {
  purchasePrice: number;
  salePrice: number;
  holdingPeriod: HoldingPeriod;
  filingStatus: FilingStatus;
  annualIncome: number;
  state: string;               // 2-letter code
}

export interface TaxBreakdown {
  capitalGain: number;
  federalRate: number;
  federalTax: number;
  stateTaxRate: number;
  stateTax: number;
  niitTax: number;             // Net Investment Income Tax (3.8%)
  totalTax: number;
  effectiveRate: number;
  netProceeds: number;
}

export interface CalculatorResults {
  shortTerm: TaxBreakdown;
  longTerm: TaxBreakdown;
  taxSavingsFromLongTerm: number;
  recommendation: string;
}
