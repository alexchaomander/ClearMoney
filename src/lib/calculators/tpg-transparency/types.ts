export interface CreditCard {
  id: string;
  name: string;
  issuer: string;
  annualFee: number;
  signUpBonus: {
    points: number;
    spendRequired: number;
    timeframe: number;
  };
  earnRates: {
    dining: number;
    travel: number;
    groceries: number;
    other: number;
  };
  credits: {
    name: string;
    value: number;
    usability: number;
  }[];
  valuations: {
    tpg: number;
    conservative: number;
    optimistic: number;
  };
  estimatedAffiliatePayout: number;
  tpgRanking?: number;
}

export interface SpendingInputs {
  dining: number;
  travel: number;
  groceries: number;
  other: number;
}

export type RedemptionStyle = "cashBack" | "portal" | "transfers";

export interface CalculatorInputs {
  selectedCard: string;
  spending: SpendingInputs;
  redemptionStyle: RedemptionStyle;
}

export interface ValueComparison {
  label: string;
  tpgValue: number;
  ourValue: number;
  difference: number;
  percentInflated: number;
}

export interface CalculatorResults {
  card: CreditCard;
  annualPointsEarned: number;
  tpgPointValue: number;
  tpgAnnualRewardsValue: number;
  tpgCreditsValue: number;
  tpgTotalValue: number;
  tpgNetValue: number;
  ourPointValue: number;
  ourAnnualRewardsValue: number;
  ourCreditsValue: number;
  ourTotalValue: number;
  ourNetValue: number;
  valueDifference: number;
  percentageInflation: number;
  estimatedAffiliatePayout: number;
  affiliateAsPercentOfFee: number;
  comparisons: ValueComparison[];
  redFlags: string[];
  considerations: string[];
}
