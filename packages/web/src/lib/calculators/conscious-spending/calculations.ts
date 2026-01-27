import type {
  CalculatorInputs,
  CalculatorResults,
  CategoryAnalysis,
} from "./types";

const TARGETS = {
  fixedCosts: { min: 50, max: 60, name: "Fixed Costs" },
  investments: { min: 10, max: 15, name: "Investments" },
  savings: { min: 5, max: 10, name: "Savings Goals" },
  guiltFree: { min: 20, max: 35, name: "Guilt-Free Spending" },
};

export function calculate(inputs: CalculatorInputs): CalculatorResults {
  const { monthlyIncome, fixedCosts, investments, savings, guiltFree, moneyDials } =
    inputs;

  const totalAllocated = fixedCosts + investments + savings + guiltFree;
  const unallocated = monthlyIncome - totalAllocated;

  const analyzeCategory = (
    key: keyof typeof TARGETS,
    amount: number
  ): CategoryAnalysis => {
    const target = TARGETS[key];
    const percentage = monthlyIncome > 0 ? (amount / monthlyIncome) * 100 : 0;

    let status: "under" | "good" | "over";
    let recommendation: string;

    if (percentage < target.min) {
      status = "under";
      if (key === "investments") {
        recommendation = `Consider increasing to at least ${target.min}% (${formatCurrency(
          (monthlyIncome * target.min) / 100
        )})`;
      } else if (key === "guiltFree") {
        recommendation = "You deserve more guilt-free spending! Life is for living.";
      } else {
        recommendation = `Below target. Aim for ${target.min}-${target.max}%`;
      }
    } else if (percentage > target.max) {
      status = "over";
      if (key === "fixedCosts") {
        recommendation =
          "High fixed costs limit flexibility. Can you reduce rent or bills?";
      } else if (key === "guiltFree") {
        recommendation =
          "Living large! Make sure investments and savings are covered first.";
      } else {
        recommendation = `Above ${target.max}%. Consider rebalancing.`;
      }
    } else {
      status = "good";
      recommendation = "Looking good! Right in the target range.";
    }

    return {
      name: target.name,
      amount,
      percentage,
      targetMin: target.min,
      targetMax: target.max,
      status,
      recommendation,
    };
  };

  const categories: CategoryAnalysis[] = [
    analyzeCategory("fixedCosts", fixedCosts),
    analyzeCategory("investments", investments),
    analyzeCategory("savings", savings),
    analyzeCategory("guiltFree", guiltFree),
  ];

  const overCategories = categories.filter((category) => category.status === "over");
  const underCategories = categories.filter(
    (category) => category.status === "under"
  );
  const isBalanced = overCategories.length === 0 && underCategories.length === 0;

  let overallStatus: "needs-work" | "almost-there" | "great";
  let primaryIssue: string | null = null;

  if (isBalanced && Math.abs(unallocated) < monthlyIncome * 0.05) {
    overallStatus = "great";
  } else if (overCategories.length <= 1 && underCategories.length <= 1) {
    overallStatus = "almost-there";
    if (overCategories[0]) {
      primaryIssue = `${overCategories[0].name} is a bit high`;
    } else if (underCategories[0]) {
      primaryIssue = `${underCategories[0].name} could use more`;
    }
  } else {
    overallStatus = "needs-work";
    primaryIssue = "Multiple categories need adjustment";
  }

  const suggestions: string[] = [];

  if (categories[0].percentage > 60) {
    suggestions.push(
      "Your fixed costs are eating into other categories. Can you find a cheaper living situation or reduce bills?"
    );
  }

  if (categories[1].percentage < 10) {
    suggestions.push(
      "Future-you will thank you for investing at least 10%. Start with your 401k match!"
    );
  }

  if (unallocated > monthlyIncome * 0.1) {
    suggestions.push(
      `You have ${formatCurrency(unallocated)} unallocated. Give every dollar a job!`
    );
  }

  if (unallocated < 0) {
    suggestions.push(
      `You're ${formatCurrency(-unallocated)} over budget. Time to make some cuts or increase income.`
    );
  }

  if (moneyDials && moneyDials.length > 0) {
    suggestions.push(
      `Since you value ${moneyDials.join(", ")}, make sure your guilt-free spending reflects that!`
    );
  }

  const guiltFreeDaily = guiltFree / 30;
  const guiltFreeWeekly = guiltFree / 4;

  return {
    totalAllocated,
    unallocated,
    categories,
    isBalanced,
    overallStatus,
    primaryIssue,
    suggestions,
    guiltFreeDaily,
    guiltFreeWeekly,
  };
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}
