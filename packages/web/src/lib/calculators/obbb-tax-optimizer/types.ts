export type FilingStatus = "single" | "married" | "head_of_household";

export interface CalculatorInputs {
  filingStatus: FilingStatus;
  age: number;
  spouseAge?: number;
  modifiedAGI: number;
  annualTips: number;
  annualOvertime: number;
  carLoanInterest: number;
  saltPaid: number;
  otherItemized: number;
  marginalRate: number;
}

export interface DeductionDetail {
  eligible: boolean;
  amount: number;
  phaseOutApplied?: number;
  taxSavings: number;
}

export interface SaltBenefit {
  oldCap: number;
  newCap: number;
  additionalDeduction: number;
  taxSavings: number;
}

export interface StandardVsItemized {
  standardDeduction: number;
  itemizedWithNewSALT: number;
  recommendation: string;
}

export interface CalculatorResults {
  seniorDeduction: DeductionDetail;
  tipsDeduction: DeductionDetail;
  overtimeDeduction: DeductionDetail;
  carLoanDeduction: DeductionDetail;
  saltBenefit: SaltBenefit;
  totalNewDeductions: number;
  totalTaxSavings: number;
  standardVsItemized: StandardVsItemized;
}

export interface BreakdownItem {
  label: string;
  value: number;
}
