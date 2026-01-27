export type OptionType = "iso" | "nso";
export type FilingStatus = "single" | "married" | "head_of_household";
export type ExerciseStrategy =
  | "exercise_and_hold"
  | "exercise_and_sell"
  | "cashless";

export interface OptionGrant {
  optionType: OptionType;
  totalOptions: number;
  vestedOptions: number;
  strikePrice: number;
  currentFMV: number;
  grantDate: Date;
  vestStartDate: Date;
}

export interface TaxInfo {
  filingStatus: FilingStatus;
  annualIncome: number;
  stateCode: string;
  existingAMTPreference: number;
}

export interface ExerciseScenario {
  optionsToExercise: number;
  exerciseDate: Date;
  holdingPeriod: number;
  expectedFMVAtSale: number;
}

export interface CalculatorInputs {
  option: OptionGrant;
  tax: TaxInfo;
  scenario: ExerciseScenario;
}

export interface ExerciseCost {
  cashRequired: number;
  isoAMTLiability: number;
  nsoOrdinaryIncome: number;
  nsoFederalTax: number;
  nsoStateTax: number;
  nsoFICATax: number;
  totalOutOfPocket: number;
}

export interface SaleAnalysis {
  saleProceeds: number;
  totalGain: number;
  qualifiesForLTCG: boolean;
  capitalGainType: "short_term" | "long_term" | "ordinary";
  federalTaxOnSale: number;
  stateTaxOnSale: number;
  niitTax: number;
  netProceeds: number;
}

export interface ScenarioComparison {
  strategy: ExerciseStrategy;
  exerciseCost: ExerciseCost;
  saleAnalysis: SaleAnalysis;
  totalTaxPaid: number;
  netProfit: number;
  effectiveTaxRate: number;
  cashFlowTimeline: {
    date: string;
    event: string;
    amount: number;
    cumulative: number;
  }[];
}

export interface AMTAnalysis {
  regularTax: number;
  tentativeMinimumTax: number;
  amtOwed: number;
  isInAMT: boolean;
  amtCreditGenerated: number;
  effectiveAMTRate: number;
  breakEvenSpread: number;
}

export interface CalculatorResults {
  exerciseAndHold: ScenarioComparison;
  exerciseAndSell: ScenarioComparison;
  cashlessExercise: ScenarioComparison;
  amtAnalysis: AMTAnalysis | null;
  bargainElement: number;
  exerciseCost: number;
  intrinsicValue: number;
  qualifyingDispositionDate: Date | null;
  daysUntilQualifying: number | null;
  recommendedStrategy: ExerciseStrategy;
  recommendations: string[];
  warnings: string[];
}
