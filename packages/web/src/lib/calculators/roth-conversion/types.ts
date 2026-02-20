export type FilingStatus = "single" | "married" | "married_separate" | "head_of_household";

export interface CalculatorInputs {
  currentAge: number;
  retirementAge: number;
  traditionalIraBalance: number;
  conversionAmount: number;
  currentTaxableIncome: number;
  filingStatus: FilingStatus;
  state: string;
  expectedReturnRate: number;
  currentTaxRate: number;
  retirementTaxRate: number;
}

export interface YearByYearEntry {
  age: number;
  year: number;
  traditionalBalance: number;
  rothBalance: number;
  cumulativeTaxSaved: number;
  isBreakEven: boolean;
}

export interface IRMAAImpact {
  magiBefore: number;
  magiAfter: number;
  crossesBracket: boolean;
  bracketBefore: string;
  bracketAfter: string;
  annualSurchargeBefore: number;
  annualSurchargeAfter: number;
  annualSurchargeDelta: number;
}

export interface CalculatorResults {
  conversionTaxCost: number;
  breakEvenAge: number | null;
  breakEvenYear: number | null;
  lifetimeNoConvert: number;
  lifetimeConvert: number;
  lifetimeSavings: number;
  irmaaImpact: IRMAAImpact;
  yearByYear: YearByYearEntry[];
  recommendation: string;
  factors: string[];
}
