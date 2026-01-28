export type Level = "low" | "med" | "high";

export type RiskTolerance = "Conservative" | "Moderate" | "Aggressive";
export type TimeHorizon = "1-3 years" | "3-7 years" | "7-15 years" | "15+ years";
export type Sensitivity = "Low" | "Medium" | "High";
export type Stability = "Low" | "Medium" | "High";

export interface CalculatorInputs {
  riskTolerance: RiskTolerance;
  timeHorizon: TimeHorizon;
  taxSensitivity: Sensitivity;
  incomeStability: Stability;
  drawdownTolerance: Stability;
}

export interface StrategyArchetype {
  id: string;
  name: string;
  shortDescription: string;
  riskProfile: Level;
  turnover: Level;
  taxEfficiency: Level;
  volatility: Level;
  complexity: Level;
  bestFor: string[];
  tradeoffs: string[];
}

export interface ScoredStrategy {
  archetype: StrategyArchetype;
  score: number;
}

export interface CalculatorResults {
  strategies: ScoredStrategy[];
  topStrategies: ScoredStrategy[];
  fitSummary: string;
}

export const ARCHETYPES: StrategyArchetype[] = [
  {
    id: "core-index-cash",
    name: "Core Index + Cash",
    shortDescription:
      "Low-cost core index exposure with a cash buffer to reduce volatility.",
    riskProfile: "low",
    turnover: "low",
    taxEfficiency: "high",
    volatility: "low",
    complexity: "low",
    bestFor: [
      "Shorter horizons",
      "High tax sensitivity",
      "Low drawdown tolerance",
    ],
    tradeoffs: [
      "Lower long-term growth potential",
      "Cash drag in strong markets",
      "Limited upside capture",
    ],
  },
  {
    id: "balanced-60-40",
    name: "Balanced 60/40",
    shortDescription:
      "Classic balanced mix of growth and stability with modest turnover.",
    riskProfile: "med",
    turnover: "low",
    taxEfficiency: "med",
    volatility: "med",
    complexity: "low",
    bestFor: ["Balanced risk seekers", "Steady income profiles", "Long-term savers"],
    tradeoffs: [
      "Bond drag in rising rate cycles",
      "Moderate equity drawdowns",
      "Less upside than equity-heavy mixes",
    ],
  },
  {
    id: "factor-tilt-quality-value",
    name: "Factor Tilt (Quality/Value)",
    shortDescription:
      "Tilts toward quality and value factors with patient rebalancing.",
    riskProfile: "med",
    turnover: "med",
    taxEfficiency: "med",
    volatility: "med",
    complexity: "med",
    bestFor: ["Investors seeking factor exposure", "Longer horizons", "Moderate taxes"],
    tradeoffs: [
      "Periods of underperformance vs broad indexes",
      "Requires discipline during factor cycles",
      "Slightly higher complexity",
    ],
  },
  {
    id: "momentum-tilt",
    name: "Momentum Tilt",
    shortDescription:
      "Chases recent winners with higher turnover and sharper drawdowns.",
    riskProfile: "high",
    turnover: "high",
    taxEfficiency: "low",
    volatility: "high",
    complexity: "high",
    bestFor: ["High risk tolerance", "Long horizons", "Low tax sensitivity"],
    tradeoffs: [
      "Tax inefficiency from turnover",
      "Rapid drawdowns during reversals",
      "Behavioral discipline required",
    ],
  },
  {
    id: "dividend-focus",
    name: "Dividend Focus",
    shortDescription:
      "Emphasizes dividend-paying companies with moderate risk exposure.",
    riskProfile: "med",
    turnover: "med",
    taxEfficiency: "med",
    volatility: "med",
    complexity: "low",
    bestFor: ["Income-focused investors", "Moderate risk profiles", "Stable income"],
    tradeoffs: [
      "Sector concentration risk",
      "Taxable dividend income",
      "Potentially slower growth",
    ],
  },
  {
    id: "all-weather-risk-parity",
    name: "All-Weather Risk Parity",
    shortDescription:
      "Diversifies across assets with leverage and risk balancing rules.",
    riskProfile: "med",
    turnover: "med",
    taxEfficiency: "med",
    volatility: "med",
    complexity: "high",
    bestFor: ["Diversification seekers", "Process-driven investors", "Long horizons"],
    tradeoffs: [
      "Higher complexity and monitoring",
      "May lag equity rallies",
      "Requires understanding of leverage",
    ],
  },
  {
    id: "aggressive-growth",
    name: "Aggressive Growth",
    shortDescription:
      "Equity-heavy growth focus with high volatility and wide swings.",
    riskProfile: "high",
    turnover: "high",
    taxEfficiency: "low",
    volatility: "high",
    complexity: "med",
    bestFor: ["Aggressive risk seekers", "Long horizons", "High drawdown tolerance"],
    tradeoffs: [
      "Large drawdowns are likely",
      "Tax drag in taxable accounts",
      "Requires staying invested through volatility",
    ],
  },
];

export const SCORE_WEIGHTS = {
  riskTolerance: 0.22,
  drawdownTolerance: 0.2,
  timeHorizon: 0.16,
  taxEfficiency: 0.18,
  turnover: 0.1,
  complexity: 0.14,
};

const LEVEL_MAP: Record<Level, number> = {
  low: 1,
  med: 2,
  high: 3,
};

const INPUT_TO_LEVEL: Record<RiskTolerance | Sensitivity | Stability, Level> = {
  Conservative: "low",
  Moderate: "med",
  Aggressive: "high",
  Low: "low",
  Medium: "med",
  High: "high",
};

const HORIZON_TO_RISK: Record<TimeHorizon, Level> = {
  "1-3 years": "low",
  "3-7 years": "med",
  "7-15 years": "high",
  "15+ years": "high",
};

const TAX_TO_TURNOVER: Record<Sensitivity, Level> = {
  Low: "high",
  Medium: "med",
  High: "low",
};

function matchScore(target: Level, actual: Level): number {
  const diff = Math.abs(LEVEL_MAP[target] - LEVEL_MAP[actual]);
  if (diff === 0) return 1;
  if (diff === 1) return 0.6;
  return 0.2;
}

export function calculate(inputs: CalculatorInputs): CalculatorResults {
  const riskTarget = INPUT_TO_LEVEL[inputs.riskTolerance];
  const drawdownTarget = INPUT_TO_LEVEL[inputs.drawdownTolerance];
  const horizonTarget = HORIZON_TO_RISK[inputs.timeHorizon];
  const taxTarget = INPUT_TO_LEVEL[inputs.taxSensitivity];
  const turnoverTarget = TAX_TO_TURNOVER[inputs.taxSensitivity];
  const complexityTarget = INPUT_TO_LEVEL[inputs.incomeStability];

  const strategies: ScoredStrategy[] = ARCHETYPES.map((archetype) => {
    const score =
      matchScore(riskTarget, archetype.riskProfile) * SCORE_WEIGHTS.riskTolerance +
      matchScore(drawdownTarget, archetype.volatility) *
        SCORE_WEIGHTS.drawdownTolerance +
      matchScore(horizonTarget, archetype.riskProfile) * SCORE_WEIGHTS.timeHorizon +
      matchScore(taxTarget, archetype.taxEfficiency) * SCORE_WEIGHTS.taxEfficiency +
      matchScore(turnoverTarget, archetype.turnover) * SCORE_WEIGHTS.turnover +
      matchScore(complexityTarget, archetype.complexity) * SCORE_WEIGHTS.complexity;

    return {
      archetype,
      score: Math.round(score * 1000) / 10,
    };
  }).sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.archetype.id.localeCompare(b.archetype.id);
  });

  const topStrategies = strategies.slice(0, 3);
  const top = topStrategies[0];
  const summary = top
    ? `Based on a ${inputs.riskTolerance.toLowerCase()} risk tolerance, ${inputs.timeHorizon} horizon, and ${inputs.taxSensitivity.toLowerCase()} tax sensitivity, ${top.archetype.name} ranks as the closest overall fit.`
    : "Adjust your inputs to see the best-matching strategies.";

  return {
    strategies,
    topStrategies,
    fitSummary: summary,
  };
}
