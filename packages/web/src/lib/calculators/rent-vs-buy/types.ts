export interface CalculatorInputs {
  monthlyRent: number;
  annualRentIncrease: number; // percentage, e.g. 3
  homePrice: number;
  downPaymentPercent: number; // percentage
  mortgageRate: number; // percentage
  loanTermYears: number;
  propertyTaxRate: number; // percentage
  homeAppreciationRate: number; // percentage
  maintenanceRate: number; // percentage of home value
  investmentReturnRate: number; // percentage - what you'd earn investing instead
  timeHorizon: number; // years
}

export interface YearComparison {
  year: number;
  rentCost: number;
  buyCost: number;
  homeEquity: number;
  investmentBalance: number; // if renting & investing the difference
  rentNetWorth: number;
  buyNetWorth: number;
}

export interface CalculatorResults {
  breakEvenYear: number | null;
  totalRentCost: number;
  totalBuyCost: number;
  finalHomeEquity: number;
  finalInvestmentBalance: number;
  rentNetWorthAtEnd: number;
  buyNetWorthAtEnd: number;
  winner: "rent" | "buy" | "tie";
  monthlySavingsIfRenting: number;
  timeline: YearComparison[];
  recommendation: string;
}
