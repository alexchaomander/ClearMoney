import type {
  CalculatorInputs,
  CalculatorResults,
  RiskFactor,
} from "./types";

const MULTIPLIERS = {
  jobStability: {
    government: { value: 0.8, label: "Government/Tenured" },
    stable: { value: 1.0, label: "Stable Corporate" },
    variable: { value: 1.3, label: "Variable/Commission" },
    freelance: { value: 1.5, label: "Freelance/Self-Employed" },
    unstable: { value: 1.7, label: "Uncertain/Layoff Risk" },
  },
  incomeSource: {
    dual: { value: 0.8, label: "Dual Income" },
    single_stable: { value: 1.0, label: "Single Income (Stable)" },
    single_variable: { value: 1.3, label: "Single Income (Variable)" },
  },
  dependents: {
    none: { value: 0.9, label: "No Dependents" },
    partner: { value: 1.0, label: "Partner Only" },
    children: { value: 1.2, label: "Children" },
    extended: { value: 1.3, label: "Extended Family" },
  },
  healthSituation: {
    excellent: { value: 0.9, label: "Excellent + Good Insurance" },
    good: { value: 1.0, label: "Good Health" },
    moderate: { value: 1.2, label: "Some Health Concerns" },
    significant: { value: 1.4, label: "Significant Health Needs" },
  },
  housingSituation: {
    rent_cheap: { value: 0.9, label: "Renting (Low Cost)" },
    rent_normal: { value: 1.0, label: "Renting (Normal)" },
    own_new: { value: 1.1, label: "Homeowner (Newer Home)" },
    own_old: { value: 1.3, label: "Homeowner (Older Home)" },
  },
};

export function calculate(inputs: CalculatorInputs): CalculatorResults {
  const {
    monthlyExpenses,
    jobStability,
    incomeSource,
    dependents,
    healthSituation,
    housingSituation,
  } = inputs;

  const baselineMonths = 3;

  const riskFactors: RiskFactor[] = [
    {
      name: "Job Stability",
      value: MULTIPLIERS.jobStability[jobStability].label,
      multiplier: MULTIPLIERS.jobStability[jobStability].value,
      impact:
        MULTIPLIERS.jobStability[jobStability].value > 1
          ? "increases"
          : MULTIPLIERS.jobStability[jobStability].value < 1
            ? "decreases"
            : "neutral",
    },
    {
      name: "Income Sources",
      value: MULTIPLIERS.incomeSource[incomeSource].label,
      multiplier: MULTIPLIERS.incomeSource[incomeSource].value,
      impact:
        MULTIPLIERS.incomeSource[incomeSource].value > 1
          ? "increases"
          : MULTIPLIERS.incomeSource[incomeSource].value < 1
            ? "decreases"
            : "neutral",
    },
    {
      name: "Dependents",
      value: MULTIPLIERS.dependents[dependents].label,
      multiplier: MULTIPLIERS.dependents[dependents].value,
      impact:
        MULTIPLIERS.dependents[dependents].value > 1
          ? "increases"
          : MULTIPLIERS.dependents[dependents].value < 1
            ? "decreases"
            : "neutral",
    },
    {
      name: "Health Situation",
      value: MULTIPLIERS.healthSituation[healthSituation].label,
      multiplier: MULTIPLIERS.healthSituation[healthSituation].value,
      impact:
        MULTIPLIERS.healthSituation[healthSituation].value > 1
          ? "increases"
          : MULTIPLIERS.healthSituation[healthSituation].value < 1
            ? "decreases"
            : "neutral",
    },
    {
      name: "Housing",
      value: MULTIPLIERS.housingSituation[housingSituation].label,
      multiplier: MULTIPLIERS.housingSituation[housingSituation].value,
      impact:
        MULTIPLIERS.housingSituation[housingSituation].value > 1
          ? "increases"
          : MULTIPLIERS.housingSituation[housingSituation].value < 1
            ? "decreases"
            : "neutral",
    },
  ];

  const combinedMultiplier = riskFactors.reduce(
    (acc, factor) => acc * factor.multiplier,
    1
  );

  const rawAdjustedMonths = baselineMonths * combinedMultiplier;
  const adjustedMonths = Math.min(
    12,
    Math.max(3, Math.round(rawAdjustedMonths * 10) / 10)
  );

  const targetAmount = Math.round(monthlyExpenses * adjustedMonths);
  const minimumAmount = monthlyExpenses * 3;
  const comfortAmount = Math.round(monthlyExpenses * (adjustedMonths + 1));

  let overallRisk: "low" | "moderate" | "high" | "very-high";
  if (combinedMultiplier < 0.95) {
    overallRisk = "low";
  } else if (combinedMultiplier < 1.2) {
    overallRisk = "moderate";
  } else if (combinedMultiplier < 1.6) {
    overallRisk = "high";
  } else {
    overallRisk = "very-high";
  }

  let recommendation: string;
  if (overallRisk === "low") {
    recommendation = `Your risk profile is low. A ${adjustedMonths}-month fund should provide solid protection.`;
  } else if (overallRisk === "moderate") {
    recommendation = `You have typical risk factors. Aim for ${adjustedMonths} months of expenses.`;
  } else if (overallRisk === "high") {
    recommendation = `Your risk factors suggest a larger buffer. ${adjustedMonths} months provides good protection.`;
  } else {
    recommendation = `Multiple risk factors suggest prioritizing a robust ${adjustedMonths}-month emergency fund.`;
  }

  return {
    baselineMonths,
    adjustedMonths,
    targetAmount,
    minimumAmount,
    comfortAmount,
    riskFactors,
    overallRisk,
    recommendation,
  };
}

export const riskMultipliers = MULTIPLIERS;
