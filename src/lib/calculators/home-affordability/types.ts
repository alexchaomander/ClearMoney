export type CreditScoreRange = "excellent" | "good" | "fair" | "poor";
export type RiskTolerance = "conservative" | "moderate" | "aggressive";

export interface CalculatorInputs {
  annualIncome: number;
  monthlyDebt: number;
  downPaymentSaved: number;
  targetDownPaymentPercent: number;
  creditScore: CreditScoreRange;
  state: string;
  currentRent: number;
  mortgageRate: number;
  propertyTaxRate: number;
  hoa: number;
  riskTolerance: RiskTolerance;
}

export interface MonthlyBreakdown {
  principal: number;
  interest: number;
  propertyTax: number;
  homeInsurance: number;
  pmi: number;
  hoa: number;
  maintenance: number;
  utilities: number;
  totalMonthly: number;
}

export interface DownPaymentScenario {
  homePrice: number;
  pmi: number;
  totalCost: number;
}

export interface CalculatorResults {
  maxApprovalAmount: number;
  comfortableAmount: number;
  stretchAmount: number;
  monthlyBreakdown: MonthlyBreakdown;
  dtiAnalysis: {
    frontEndDTI: number;
    backEndDTI: number;
    maxFrontEnd: number;
    maxBackEnd: number;
    status: "comfortable" | "stretching" | "risky";
  };
  downPaymentAnalysis: {
    atTargetPercent: DownPaymentScenario;
    at20Percent: DownPaymentScenario;
    pmiBreakeven: number;
  };
  rentVsBuy: {
    monthlyOwnership: number;
    monthlyRent: number;
    breakEvenYears: number;
    fiveYearComparison: { buyingCost: number; rentingCost: number; equity: number };
  };
  hiddenCosts: {
    closingCosts: number;
    moveInCosts: number;
    firstYearMaintenance: number;
    emergencyFund: number;
    totalUpfront: number;
  };
  recommendations: string[];
  warnings: string[];
}
