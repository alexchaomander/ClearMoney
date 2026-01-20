export type FilingStatus = "single" | "married" | "head_of_household";
export type DonationType = "public_charity" | "private_foundation" | "daf";

export interface StockInfo {
  stockValue: number;
  costBasis: number;
  holdingPeriod: number;
}

export interface TaxInfo {
  filingStatus: FilingStatus;
  adjustedGrossIncome: number;
  marginalTaxRate: number;
  stateCode: string;
  itemizesDeductions: boolean;
}

export interface DonationInfo {
  donationAmount: number;
  donationType: DonationType;
}

export interface CalculatorInputs {
  stock: StockInfo;
  tax: TaxInfo;
  donation: DonationInfo;
}

export interface CashDonationScenario {
  stockSaleProceeds: number;
  capitalGain: number;
  federalCapGainsTax: number;
  stateCapGainsTax: number;
  niitTax: number;
  totalCapGainsTax: number;
  amountAvailableToDonate: number;
  charitableDeduction: number;
  taxSavingsFromDeduction: number;
  netCostOfDonation: number;
}

export interface StockDonationScenario {
  stockValue: number;
  capitalGainAvoided: number;
  taxAvoided: number;
  charitableDeduction: number;
  taxSavingsFromDeduction: number;
  netCostOfDonation: number;
  agiLimitPercent: number;
  deductibleThisYear: number;
  carryForward: number;
}

export interface ComparisonResult {
  stockAdvantage: number;
  percentageSavings: number;
  effectiveCostCashDonation: number;
  effectiveCostStockDonation: number;
  additionalCharitableImpact: number;
}

export interface CalculatorResults {
  cashScenario: CashDonationScenario;
  stockScenario: StockDonationScenario;
  comparison: ComparisonResult;
  isLongTermHolding: boolean;
  qualifiesForFMVDeduction: boolean;
  cashAGILimit: number;
  stockAGILimit: number;
  currentCashDonationsRoom: number;
  currentStockDonationsRoom: number;
  recommendations: string[];
  warnings: string[];
  steps: {
    step: number;
    title: string;
    description: string;
  }[];
}
