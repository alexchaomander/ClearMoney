import type { CalculatorInputs, CalculatorResults, CategoryResult } from "./types";

const CARD_DATA = {
  sapphireReserve: {
    name: "Sapphire Reserve",
    annualFee: 550,
    travelCredit: 300,
  },
  sapphirePreferred: {
    name: "Sapphire Preferred",
    annualFee: 95,
    travelCredit: 0,
  },
  freedomFlex: {
    name: "Freedom Flex",
    annualFee: 0,
    travelCredit: 0,
  },
  freedomUnlimited: {
    name: "Freedom Unlimited",
    annualFee: 0,
    travelCredit: 0,
  },
};

export function calculate(inputs: CalculatorInputs): CalculatorResults {
  const { pointsValue, spending, cards } = inputs;
  const cpp = pointsValue;

  const sapphireCard = cards.hasSapphireReserve
    ? "reserve"
    : cards.hasSapphirePreferred
      ? "preferred"
      : null;

  const categories: CategoryResult[] = [];
  const cardUsageMap: Record<string, { categories: string[]; points: number }> = {};

  function getBestCard(category: keyof typeof spending, monthlySpend: number): CategoryResult {
    let bestRate = 0;
    let bestCard = "No eligible card";

    if (cards.hasFreedomUnlimited) {
      const rate = category === "dining" || category === "drugstores" ? 3 : 1.5;
      if (rate > bestRate) {
        bestRate = rate;
        bestCard = CARD_DATA.freedomUnlimited.name;
      }
    }

    if (cards.hasFreedomFlex) {
      const rate = category === "dining" || category === "drugstores" ? 3 : 1;
      if (rate > bestRate) {
        bestRate = rate;
        bestCard = CARD_DATA.freedomFlex.name;
      }
    }

    if (sapphireCard === "preferred") {
      const rates: Record<string, number> = {
        dining: 3,
        travel: 2,
        streaming: 3,
        groceries: 3,
      };
      const rate = rates[category] || 1;
      if (rate > bestRate) {
        bestRate = rate;
        bestCard = CARD_DATA.sapphirePreferred.name;
      }
    }

    if (sapphireCard === "reserve") {
      const rates: Record<string, number> = {
        dining: 3,
        travel: 3,
        streaming: 3,
      };
      const rate = rates[category] || 1;
      if (rate > bestRate) {
        bestRate = rate;
        bestCard = CARD_DATA.sapphireReserve.name;
      }
    }

    const annualPoints = monthlySpend * 12 * bestRate;
    const annualValue = annualPoints * (cpp / 100);

    if (bestRate > 0) {
      if (!cardUsageMap[bestCard]) {
        cardUsageMap[bestCard] = { categories: [], points: 0 };
      }
      cardUsageMap[bestCard].categories.push(category);
      cardUsageMap[bestCard].points += annualPoints;
    }

    return {
      category: formatCategoryName(category),
      monthlySpend,
      bestCard,
      earnRate: bestRate,
      annualPoints,
      annualValue,
    };
  }

  categories.push(getBestCard("dining", spending.dining));
  categories.push(getBestCard("groceries", spending.groceries));
  categories.push(getBestCard("gas", spending.gas));
  categories.push(getBestCard("travel", spending.travel));
  categories.push(getBestCard("streaming", spending.streaming));
  categories.push(getBestCard("drugstores", spending.drugstores));
  categories.push(getBestCard("other", spending.other));

  const annualSpending = Object.values(spending).reduce(
    (sum, val) => sum + val * 12,
    0,
  );
  const annualPoints = categories.reduce((sum, c) => sum + c.annualPoints, 0);
  const annualValue = categories.reduce((sum, c) => sum + c.annualValue, 0);

  let annualFees = 0;
  let annualCredits = 0;

  if (cards.hasSapphireReserve) {
    annualFees += CARD_DATA.sapphireReserve.annualFee;
    annualCredits += CARD_DATA.sapphireReserve.travelCredit;
  }
  if (cards.hasSapphirePreferred) {
    annualFees += CARD_DATA.sapphirePreferred.annualFee;
  }

  const netValue = annualValue + annualCredits - annualFees;
  const cashBackEquivalent = annualSpending * 0.02;
  const advantageVsCashBack = netValue - cashBackEquivalent;
  const effectiveRate = annualSpending > 0 ? (netValue / annualSpending) * 100 : 0;

  const cardUsage = Object.entries(cardUsageMap).map(([card, data]) => ({
    card,
    categories: data.categories.map((category) => formatCategoryName(category)),
    annualPoints: data.points,
  }));

  const isWorthIt = advantageVsCashBack > 0;
  let message: string;

  if (advantageVsCashBack > 500) {
    message = `Great fit! You're earning ${effectiveRate.toFixed(1)}% effective return—well above 2% cash back.`;
  } else if (advantageVsCashBack > 0) {
    message = `Marginally better than 2% cash back. Consider if the complexity is worth $${Math.round(advantageVsCashBack)}/year.`;
  } else {
    message = "At your spending levels, a simple 2% cash back card might be better.";
  }

  return {
    categories,
    totals: {
      annualSpending,
      annualPoints,
      annualValue,
      annualFees,
      annualCredits,
      netValue,
      cashBackEquivalent,
      advantageVsCashBack,
      effectiveRate,
    },
    cardUsage,
    recommendation: { isWorthIt, message },
  };
}

function formatCategoryName(category: string): string {
  const names: Record<string, string> = {
    dining: "Dining & Restaurants",
    groceries: "Groceries",
    gas: "Gas Stations",
    travel: "Travel",
    streaming: "Streaming",
    drugstores: "Drugstores",
    other: "Everything Else",
  };
  return names[category] || category;
}
