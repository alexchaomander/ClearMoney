export type VolatilityLevel = "Low" | "Medium" | "High";

export interface CalculatorInputs {
  targetStocks: number;
  currentStocks: number;
  driftThreshold: number;
  taxRate: number;
  transactionCost: number;
  volatility: VolatilityLevel;
}

export interface CalculatorResults {
  driftPercent: number;
  taxDrag: number;
  transactionCostAmount: number;
  riskDrag: number;
  totalCostNow: number;
  recommendation: "Rebalance now" | "Wait";
  confidence: "Low" | "Medium" | "High";
}

const PORTFOLIO_VALUE = 100000;

const VOLATILITY_COEFFICIENT: Record<VolatilityLevel, number> = {
  Low: 0.4,
  Medium: 0.7,
  High: 1.0,
};

export function calculate(inputs: CalculatorInputs): CalculatorResults {
  const targetBonds = 100 - inputs.targetStocks;
  const currentBonds = 100 - inputs.currentStocks;

  const driftStocks = Math.abs(inputs.currentStocks - inputs.targetStocks);
  const driftBonds = Math.abs(currentBonds - targetBonds);
  const driftPercent = Math.max(driftStocks, driftBonds);

  const driftRate = driftPercent / 100;
  const taxDrag = PORTFOLIO_VALUE * driftRate * (inputs.taxRate / 100);
  const transactionCostAmount =
    PORTFOLIO_VALUE * driftRate * (inputs.transactionCost / 100);
  const riskDrag =
    PORTFOLIO_VALUE * driftRate * VOLATILITY_COEFFICIENT[inputs.volatility];
  const totalCostNow = taxDrag + transactionCostAmount;

  const shouldRebalance =
    driftPercent >= inputs.driftThreshold && riskDrag > totalCostNow;

  const margin = Math.abs(riskDrag - totalCostNow);
  let confidence: "Low" | "Medium" | "High" = "Low";
  if (margin > 2500) {
    confidence = "High";
  } else if (margin > 1000) {
    confidence = "Medium";
  }

  return {
    driftPercent,
    taxDrag,
    transactionCostAmount,
    riskDrag,
    totalCostNow,
    recommendation: shouldRebalance ? "Rebalance now" : "Wait",
    confidence,
  };
}
