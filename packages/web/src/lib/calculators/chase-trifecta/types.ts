export interface SpendingInputs {
  dining: number;
  groceries: number;
  gas: number;
  travel: number;
  streaming: number;
  drugstores: number;
  other: number;
}

export interface CardSelection {
  hasSapphirePreferred: boolean;
  hasSapphireReserve: boolean;
  hasFreedomFlex: boolean;
  hasFreedomUnlimited: boolean;
}

export interface CalculatorInputs {
  pointsValue: number;
  spending: SpendingInputs;
  cards: CardSelection;
}

export interface CategoryResult {
  category: string;
  monthlySpend: number;
  bestCard: string;
  earnRate: number;
  annualPoints: number;
  annualValue: number;
}

export interface CalculatorResults {
  categories: CategoryResult[];
  totals: {
    annualSpending: number;
    annualPoints: number;
    annualValue: number;
    annualFees: number;
    annualCredits: number;
    netValue: number;
    cashBackEquivalent: number;
    advantageVsCashBack: number;
    effectiveRate: number;
  };
  cardUsage: { card: string; categories: string[]; annualPoints: number }[];
  recommendation: {
    isWorthIt: boolean;
    message: string;
  };
}
