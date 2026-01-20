export interface PointsCurrency {
  id: string;
  name: string;
  shortName: string;
  logo?: string;
  valuations: {
    tpg: number;
    conservative: number;
    moderate: number;
    optimistic: number;
  };
  methodology: {
    cashOut: number | null;
    portalValue: number | null;
    transferValue: string;
  };
  bestUses: string[];
  worstUses: string[];
}

export interface UserHoldings {
  [currencyId: string]: number;
}

export type RedemptionStyle = "conservative" | "moderate" | "optimistic";

export interface CalculatorInputs {
  holdings: UserHoldings;
  redemptionStyle: RedemptionStyle;
}

export interface HoldingValuation {
  currency: PointsCurrency;
  points: number;
  ourValue: number;
  tpgValue: number;
  difference: number;
  percentDifference: number;
}

export interface CalculatorResults {
  holdings: HoldingValuation[];
  totals: {
    ourValue: number;
    tpgValue: number;
    overvaluation: number;
    percentOvervaluation: number;
  };
  currencies: PointsCurrency[];
}
