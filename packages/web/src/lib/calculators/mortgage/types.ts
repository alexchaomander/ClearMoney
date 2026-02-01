export interface CalculatorInputs {
  homePrice: number;
  downPaymentPercent: number; // percentage, e.g. 20
  loanTermYears: number; // 15 or 30
  interestRate: number; // percentage, e.g. 6.5
  propertyTaxRate: number; // percentage, e.g. 1.2
  homeInsurance: number; // annual
  pmiRate: number; // percentage, e.g. 0.5 (only if <20% down)
}

export interface MonthlyBreakdown {
  principal: number;
  interest: number;
  propertyTax: number;
  insurance: number;
  pmi: number;
  total: number;
}

export interface AmortizationRow {
  year: number;
  principalPaid: number;
  interestPaid: number;
  remainingBalance: number;
}

export interface CalculatorResults {
  monthlyPayment: MonthlyBreakdown;
  loanAmount: number;
  downPayment: number;
  totalInterest: number;
  totalCost: number;
  amortization: AmortizationRow[];
  recommendation: string;
}
