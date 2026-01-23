export type TiltType = "Value" | "Quality" | "Momentum" | "Small Cap";

export interface CalculatorInputs {
  baseReturn: number;
  baseVolatility: number;
  tiltType: TiltType;
  factorPremium: number;
  addedVolatility: number;
  timeHorizon: number;
}

export interface ReturnRange {
  low: number;
  high: number;
}

export interface CalculatorResults {
  baseReturn: number;
  tiltedReturn: number;
  baseVolatility: number;
  tiltedVolatility: number;
  baseRange: ReturnRange;
  tiltedRange: ReturnRange;
  summary: string;
}

function calculateRange(returnRate: number, volatility: number, years: number): ReturnRange {
  const horizon = Math.max(1, years);
  const band = volatility / Math.sqrt(horizon);
  return {
    low: returnRate - band,
    high: returnRate + band,
  };
}

function buildSummary(tiltType: TiltType, years: number): string {
  if (years <= 3) {
    return `${tiltType} tilts add uncertainty in shorter windows. Expect wider swings and a higher chance of underperformance.`;
  }
  if (years <= 7) {
    return `${tiltType} tilts can help over medium horizons, but patience is required to ride out factor cycles.`;
  }
  return `${tiltType} tilts tend to matter most over long horizons, where the premium has time to show up.`;
}

export function calculate(inputs: CalculatorInputs): CalculatorResults {
  const tiltedReturn = inputs.baseReturn + inputs.factorPremium;
  const tiltedVolatility = inputs.baseVolatility + inputs.addedVolatility;

  return {
    baseReturn: inputs.baseReturn,
    tiltedReturn,
    baseVolatility: inputs.baseVolatility,
    tiltedVolatility,
    baseRange: calculateRange(inputs.baseReturn, inputs.baseVolatility, inputs.timeHorizon),
    tiltedRange: calculateRange(tiltedReturn, tiltedVolatility, inputs.timeHorizon),
    summary: buildSummary(inputs.tiltType, inputs.timeHorizon),
  };
}
