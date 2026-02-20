import type {
  CalculatorInputs,
  CalculatorResults,
  CategoryBreakdown,
  Recommendation,
  ScoredSubscription,
  UsageFrequency,
} from "./types";

const USAGE_WEIGHTS: Record<UsageFrequency, number> = {
  daily: 1.0,
  weekly: 0.8,
  monthly: 0.5,
  rarely: 0.2,
  never: 0.0,
};

// Approximate uses per month for cost-efficiency normalization
const USES_PER_MONTH: Record<UsageFrequency, number> = {
  daily: 30,
  weekly: 4,
  monthly: 1,
  rarely: 0.25,
  never: 0,
};

function getRecommendation(score: number): Recommendation {
  if (score >= 60) return "keep";
  if (score >= 30) return "review";
  return "cancel";
}

function getReason(score: number, usageFrequency: UsageFrequency, satisfaction: number): string {
  if (usageFrequency === "never") {
    return "You never use this — cancel and save immediately.";
  }
  if (score >= 60) {
    return satisfaction >= 4
      ? "High usage and high satisfaction — good value."
      : "Good usage frequency justifies the cost.";
  }
  if (score >= 30) {
    if (satisfaction <= 2) return "Low satisfaction despite some usage — consider alternatives.";
    return "Moderate value — evaluate if there's a cheaper alternative.";
  }
  if (usageFrequency === "rarely") {
    return "Rarely used — the cost likely outweighs the benefit.";
  }
  return "Low ROI score — strong cancel candidate.";
}

function scoreSubscription(
  name: string,
  monthlyCost: number,
  category: string,
  usageFrequency: UsageFrequency,
  satisfaction: number
): ScoredSubscription {
  const usageWeight = USAGE_WEIGHTS[usageFrequency];
  const usesPerMonth = USES_PER_MONTH[usageFrequency];

  // Cost efficiency: lower cost-per-use is better
  // Normalize: costPerUse approaches 0 for frequent cheap subs, high for expensive rarely-used
  let costEfficiencyFactor: number;
  if (usesPerMonth > 0 && monthlyCost > 0) {
    const costPerUse = monthlyCost / usesPerMonth;
    // Normalize: $1/use = 1.0, higher cost/use reduces score
    costEfficiencyFactor = Math.min(1, 1 / costPerUse);
  } else if (monthlyCost === 0) {
    costEfficiencyFactor = 1;
  } else {
    costEfficiencyFactor = 0;
  }

  const roiScore = Math.round(
    usageWeight * (satisfaction / 5) * costEfficiencyFactor * 100
  );

  const recommendation = getRecommendation(roiScore);
  const reason = getReason(roiScore, usageFrequency, satisfaction);

  return {
    name,
    monthlyCost,
    annualCost: monthlyCost * 12,
    category,
    usageFrequency,
    satisfaction,
    roiScore,
    recommendation,
    reason,
  };
}

export function calculate(inputs: CalculatorInputs): CalculatorResults {
  const { subscriptions, monthlyIncome } = inputs;

  if (subscriptions.length === 0) {
    return {
      totalMonthlySpend: 0,
      totalAnnualSpend: 0,
      percentOfIncome: 0,
      scoredSubscriptions: [],
      categoryBreakdown: [],
      annualSavingsIfCancelled: 0,
      overallHealthScore: 100,
      recommendation: "No subscriptions to audit. Add your subscriptions to get started.",
    };
  }

  const scoredSubscriptions = subscriptions.map((sub) =>
    scoreSubscription(
      sub.name,
      sub.monthlyCost,
      sub.category,
      sub.usageFrequency,
      sub.satisfaction
    )
  );

  const totalMonthlySpend = subscriptions.reduce((sum, s) => sum + s.monthlyCost, 0);
  const totalAnnualSpend = totalMonthlySpend * 12;
  const percentOfIncome = monthlyIncome > 0 ? (totalMonthlySpend / monthlyIncome) * 100 : 0;

  // Category breakdown
  const categoryMap = new Map<string, CategoryBreakdown>();
  for (const sub of scoredSubscriptions) {
    const existing = categoryMap.get(sub.category);
    if (existing) {
      existing.monthlyCost += sub.monthlyCost;
      existing.annualCost += sub.annualCost;
      existing.count += 1;
    } else {
      categoryMap.set(sub.category, {
        category: sub.category,
        monthlyCost: sub.monthlyCost,
        annualCost: sub.annualCost,
        count: 1,
      });
    }
  }
  const categoryBreakdown = Array.from(categoryMap.values()).sort(
    (a, b) => b.monthlyCost - a.monthlyCost
  );

  // Annual savings if all cancel-recommended subs are dropped
  const annualSavingsIfCancelled = scoredSubscriptions
    .filter((s) => s.recommendation === "cancel")
    .reduce((sum, s) => sum + s.annualCost, 0);

  // Overall health score: weighted average of ROI scores
  const totalCost = scoredSubscriptions.reduce((sum, s) => sum + s.monthlyCost, 0);
  const overallHealthScore =
    totalCost > 0
      ? Math.round(
          scoredSubscriptions.reduce(
            (sum, s) => sum + s.roiScore * s.monthlyCost,
            0
          ) / totalCost
        )
      : 100;

  // Recommendation text
  const cancelCount = scoredSubscriptions.filter((s) => s.recommendation === "cancel").length;
  const reviewCount = scoredSubscriptions.filter((s) => s.recommendation === "review").length;

  let recommendation: string;
  if (cancelCount === 0 && reviewCount === 0) {
    recommendation = "Your subscriptions look healthy! All are providing good value.";
  } else if (cancelCount > 0 && annualSavingsIfCancelled > 0) {
    recommendation = `Consider cancelling ${cancelCount} subscription${cancelCount > 1 ? "s" : ""} to save $${Math.round(annualSavingsIfCancelled).toLocaleString()}/year.`;
    if (reviewCount > 0) {
      recommendation += ` Also review ${reviewCount} subscription${reviewCount > 1 ? "s" : ""} for potential alternatives.`;
    }
  } else if (reviewCount > 0) {
    recommendation = `Review ${reviewCount} subscription${reviewCount > 1 ? "s" : ""} — there may be cheaper alternatives or you may not need them.`;
  } else {
    recommendation = "Your subscription portfolio looks reasonable.";
  }

  return {
    totalMonthlySpend,
    totalAnnualSpend,
    percentOfIncome,
    scoredSubscriptions,
    categoryBreakdown,
    annualSavingsIfCancelled,
    overallHealthScore,
    recommendation,
  };
}
