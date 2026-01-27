export type FilingStatus = "single" | "married" | "head_of_household";

export interface CalculatorInputs {
  numberOfWallets: number;
  totalHoldings: number;
  totalCostBasis: number;
  plannedSaleAmount: number;
  holdingPeriodMix: number;
  ordinaryIncome: number;
  filingStatus: FilingStatus;
  state: string;
  applyTransitionalRelief: boolean;
}

export interface CryptoLot {
  id: string;
  walletId: string;
  purchaseDate: Date;
  quantity: number;
  costPerUnit: number;
}

export interface Wallet {
  id: string;
  name: string;
  lots: CryptoLot[];
  totalValue: number;
  totalCostBasis: number;
}

export interface TaxMethodResult {
  method: string;
  lotsUsed: CryptoLot[];
  shortTermGain: number;
  longTermGain: number;
  totalGain: number;
  estimatedTax: number;
  effectiveRate: number;
}

export interface WalletImpactResult {
  universalMethod: { totalTax: number };
  walletByWallet: { totalTax: number };
  difference: number;
  explanation: string;
}

export interface CalculatorResults {
  methodComparison: {
    fifo: TaxMethodResult;
    lifo: TaxMethodResult;
    hifo: TaxMethodResult;
    specificId: TaxMethodResult;
  };
  bestMethod: string;
  taxSavingsVsFIFO: number;
  walletByWalletImpact: WalletImpactResult;
  recommendations: string[];
  warnings: string[];
  unrealizedGain: number;
}
