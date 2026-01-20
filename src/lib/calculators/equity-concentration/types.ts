export interface EquityHoldings {
  currentSharesValue: number;
  vestedOptionsValue: number;
  unvestedEquityValue: number;
  costBasis: number;
}

export interface OtherAssets {
  cashSavings: number;
  retirementAccounts: number;
  otherInvestments: number;
  realEstate: number;
  otherAssets: number;
}

export interface IncomeInfo {
  annualSalary: number;
  annualEquityGrant: number;
  yearsAtCompany: number;
}

export interface TaxInfo {
  filingStatus: "single" | "married";
  marginalTaxRate: number;
  stateCode: string;
}

export interface CalculatorInputs {
  equity: EquityHoldings;
  assets: OtherAssets;
  income: IncomeInfo;
  tax: TaxInfo;
}

export interface ConcentrationMetrics {
  totalNetWorth: number;
  employerEquityTotal: number;
  vestedEquityOnly: number;

  concentrationPercent: number;
  vestedConcentrationPercent: number;

  riskLevel: "low" | "moderate" | "high" | "extreme";
  riskScore: number;

  humanCapitalValue: number;
  totalExposure: number;
}

export interface ScenarioAnalysis {
  scenario: string;
  stockDropPercent: number;
  newEmployerEquityValue: number;
  newNetWorth: number;
  percentNetWorthLost: number;
  yearsOfSalaryLost: number;
  description: string;
}

export interface DiversificationStrategy {
  strategy: string;
  description: string;
  timeframe: string;
  taxImpact: number;
  sharesOrValueToSell: number;
  targetConcentration: number;
}

export interface HistoricalExample {
  company: string;
  event: string;
  dropPercent: number;
  yourImpact: number;
  description: string;
}

export interface CalculatorResults {
  metrics: ConcentrationMetrics;
  unrealizedGain: number;
  taxOnFullSale: number;
  afterTaxValue: number;

  scenarios: ScenarioAnalysis[];
  historicalExamples: HistoricalExample[];
  strategies: DiversificationStrategy[];

  amountToReach10Percent: number;
  amountToReach5Percent: number;

  recommendations: string[];
  warnings: string[];

  diversifiedPortfolioRisk: number;
  concentratedPortfolioRisk: number;
  excessRiskMultiplier: number;
}
