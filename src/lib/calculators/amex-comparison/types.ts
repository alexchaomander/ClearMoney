export interface SpendingInputs {
  dining: number;
  groceries: number;
  flights: number;
  hotels: number;
  other: number;
}

export interface CreditUsage {
  uberCreditUsage: number;
  diningCreditUsage: number;
  airlineFeeUsage: number;
  hotelCreditUsage: number;
  entertainmentUsage: number;
  saksUsage: number;
}

export interface Preferences {
  valuesLoungeAccess: boolean;
  flightsPerYear: number;
  pointsValue: number;
}

export interface CalculatorInputs {
  spending: SpendingInputs;
  creditUsage: CreditUsage;
  preferences: Preferences;
}

export interface CardAnalysis {
  cardName: string;
  annualFee: number;
  pointsEarned: number;
  pointsValue: number;
  creditsValue: number;
  perksValue: number;
  totalValue: number;
  netValue: number;
  effectiveAnnualFee: number;
  breakdown: {
    category: string;
    spend: number;
    multiplier: number;
    points: number;
  }[];
  creditsBreakdown: {
    credit: string;
    maxValue: number;
    usage: number;
    value: number;
  }[];
}

export interface CalculatorResults {
  gold: CardAnalysis;
  platinum: CardAnalysis;
  winner: "gold" | "platinum" | "tie";
  difference: number;
  recommendation: string;
  considerations: string[];
}
