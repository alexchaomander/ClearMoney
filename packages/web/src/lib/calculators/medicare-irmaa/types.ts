export type FilingStatus = "single" | "married" | "married_separate";

export type LifeChangingEvent =
  | "none"
  | "marriage"
  | "divorce"
  | "death_of_spouse"
  | "work_stoppage"
  | "work_reduction"
  | "loss_of_pension";

export interface CalculatorInputs {
  filingStatus: FilingStatus;
  currentAge: number;
  magi2024: number;
  magi2025: number;
  socialSecurityIncome: number;
  pensionIncome: number;
  traditionalBalance: number;
  plannedRothConversion: number;
  taxExemptInterest: number;
  lifeChangingEvent: LifeChangingEvent;
}

export interface IRMAABracketRaw {
  min: number;
  max: number;
  partBSurcharge: number;
  partDSurcharge: number;
}

export interface IRMAABracket {
  minIncome: number;
  maxIncome: number;
  partBPremium: number;
  partBSurcharge: number;
  partDSurcharge: number;
  totalMonthlySurcharge: number;
  annualSurcharge: number;
}

export interface IRMAACurrentProjection {
  bracket: IRMAABracket;
  magi: number;
  monthlyPartB: number;
  monthlyPartD: number;
  totalMonthlyCost: number;
  annualCost: number;
  surchargeAmount: number;
}

export interface RothConversionImpact {
  withoutConversion: { magi: number; annualIRMAA: number };
  withConversion: { magi: number; annualIRMAA: number };
  additionalCost: number;
  recommendation: string;
}

export interface BracketCliffAnalysis {
  currentBracket: IRMAABracket;
  nextBracket: IRMAABracket;
  incomeUntilNextBracket: number;
  costOfCrossingBracket: number;
}

export interface LifeChangingEventEligibility {
  eligible: boolean;
  eventType: string;
  potentialSavings: number;
  howToAppeal: string;
}

export interface FiveYearProjectionEntry {
  year: number;
  projectedMAGI: number;
  projectedIRMAA: number;
}

export interface CalculatorResults {
  current2026: IRMAACurrentProjection;
  projected2027: IRMAACurrentProjection;
  rothConversionImpact: RothConversionImpact;
  bracketCliffAnalysis: BracketCliffAnalysis;
  lifeChangingEventEligibility: LifeChangingEventEligibility;
  strategies: string[];
  fiveYearProjection: FiveYearProjectionEntry[];
}
