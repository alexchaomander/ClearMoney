export interface CalculatorInputs {
  annualContribution: number;
  currentTaxRate: number;
  retirementTaxRate: number;
  yearsUntilRetirement: number;
  expectedReturn: number;
}

export interface CalculatorResults {
  traditional: {
    contribution: number;
    futureValue: number;
    afterTaxValue: number;
    taxesPaid: number;
  };
  roth: {
    contribution: number;
    futureValue: number;
    afterTaxValue: number;
    taxesPaidNow: number;
  };
  difference: number;
  percentageDifference: number;
  winner: "roth" | "traditional" | "tie";
  breakEvenTaxRate: number;
  recommendation: string;
  factors: string[];
}
