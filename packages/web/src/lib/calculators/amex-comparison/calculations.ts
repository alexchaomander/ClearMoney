import type { CalculatorInputs, CalculatorResults, CardAnalysis } from "./types";

export type CardProfile = {
  name: string;
  fee: number;
  rates: Record<string, number>;
  credits: Record<
    string,
    { max: number; monthly?: boolean; annual?: boolean; semiannual?: boolean }
  >;
  perks?: { loungeAccessValue?: number };
};

export const DEFAULT_GOLD: CardProfile = {
  name: "Amex Gold",
  fee: 250,
  rates: { dining: 4, groceries: 4, flights: 3, hotels: 1, other: 1 },
  credits: {
    uber: { max: 120, monthly: true },
    dining: { max: 120, monthly: true },
  },
};

export const DEFAULT_PLATINUM: CardProfile = {
  name: "Amex Platinum",
  fee: 695,
  rates: { dining: 1, groceries: 1, flights: 5, hotels: 5, other: 1 },
  credits: {
    uber: { max: 200, monthly: true },
    airline: { max: 200, annual: true },
    hotel: { max: 200, annual: true },
    entertainment: { max: 240, monthly: true },
    saks: { max: 100, semiannual: true },
  },
  perks: {
    loungeAccessValue: 50,
  },
};

export function calculate(
  inputs: CalculatorInputs,
  gold: CardProfile = DEFAULT_GOLD,
  platinum: CardProfile = DEFAULT_PLATINUM
): CalculatorResults {
  const { spending, creditUsage, preferences } = inputs;
  const cpp = preferences.pointsValue / 100;

  const goldBreakdown = [
    {
      category: "Dining",
      spend: spending.dining * 12,
      multiplier: gold.rates.dining ?? 1,
      points: 0,
    },
    {
      category: "Groceries",
      spend: spending.groceries * 12,
      multiplier: gold.rates.groceries ?? 1,
      points: 0,
    },
    {
      category: "Flights",
      spend: spending.flights * 12,
      multiplier: gold.rates.flights ?? 1,
      points: 0,
    },
    {
      category: "Hotels",
      spend: spending.hotels * 12,
      multiplier: gold.rates.hotels ?? 1,
      points: 0,
    },
    {
      category: "Other",
      spend: spending.other * 12,
      multiplier: gold.rates.other ?? 1,
      points: 0,
    },
  ];
  goldBreakdown.forEach((breakdown) => {
    breakdown.points = breakdown.spend * breakdown.multiplier;
  });
  const goldPoints = goldBreakdown.reduce(
    (sum, breakdown) => sum + breakdown.points,
    0
  );

  const goldCredits = [
    {
      credit: "Uber Credits",
      maxValue: gold.credits.uber?.max ?? 120,
      usage: creditUsage.uberCreditUsage,
      value:
        ((gold.credits.uber?.max ?? 120) * creditUsage.uberCreditUsage) / 100,
    },
    {
      credit: "Dining Credits",
      maxValue: gold.credits.dining?.max ?? 120,
      usage: creditUsage.diningCreditUsage,
      value:
        ((gold.credits.dining?.max ?? 120) * creditUsage.diningCreditUsage) / 100,
    },
  ];
  const goldCreditsValue = goldCredits.reduce(
    (sum, credit) => sum + credit.value,
    0
  );

  const goldResult: CardAnalysis = {
    cardName: gold.name,
    annualFee: gold.fee,
    pointsEarned: goldPoints,
    pointsValue: goldPoints * cpp,
    creditsValue: goldCreditsValue,
    perksValue: 0,
    totalValue: goldPoints * cpp + goldCreditsValue,
    netValue: goldPoints * cpp + goldCreditsValue - gold.fee,
    effectiveAnnualFee: gold.fee - goldCreditsValue,
    breakdown: goldBreakdown,
    creditsBreakdown: goldCredits,
  };

  const platBreakdown = [
    {
      category: "Dining",
      spend: spending.dining * 12,
      multiplier: platinum.rates.dining ?? 1,
      points: 0,
    },
    {
      category: "Groceries",
      spend: spending.groceries * 12,
      multiplier: platinum.rates.groceries ?? 1,
      points: 0,
    },
    {
      category: "Flights",
      spend: spending.flights * 12,
      multiplier: platinum.rates.flights ?? 1,
      points: 0,
    },
    {
      category: "Hotels",
      spend: spending.hotels * 12,
      multiplier: platinum.rates.hotels ?? 1,
      points: 0,
    },
    {
      category: "Other",
      spend: spending.other * 12,
      multiplier: platinum.rates.other ?? 1,
      points: 0,
    },
  ];
  platBreakdown.forEach((breakdown) => {
    breakdown.points = breakdown.spend * breakdown.multiplier;
  });
  const platPoints = platBreakdown.reduce(
    (sum, breakdown) => sum + breakdown.points,
    0
  );

  const platCredits = [
    {
      credit: "Uber Credits",
      maxValue: platinum.credits.uber?.max ?? 200,
      usage: creditUsage.uberCreditUsage,
      value:
        ((platinum.credits.uber?.max ?? 200) * creditUsage.uberCreditUsage) /
        100,
    },
    {
      credit: "Airline Fee Credit",
      maxValue: platinum.credits.airline?.max ?? 200,
      usage: creditUsage.airlineFeeUsage,
      value:
        ((platinum.credits.airline?.max ?? 200) *
          creditUsage.airlineFeeUsage) /
        100,
    },
    {
      credit: "Hotel Credit",
      maxValue: platinum.credits.hotel?.max ?? 200,
      usage: creditUsage.hotelCreditUsage,
      value:
        ((platinum.credits.hotel?.max ?? 200) *
          creditUsage.hotelCreditUsage) /
        100,
    },
    {
      credit: "Entertainment",
      maxValue: platinum.credits.entertainment?.max ?? 240,
      usage: creditUsage.entertainmentUsage,
      value:
        ((platinum.credits.entertainment?.max ?? 240) *
          creditUsage.entertainmentUsage) /
        100,
    },
    {
      credit: "Saks Credit",
      maxValue: platinum.credits.saks?.max ?? 100,
      usage: creditUsage.saksUsage,
      value:
        ((platinum.credits.saks?.max ?? 100) * creditUsage.saksUsage) /
        100,
    },
  ];
  const platCreditsValue = platCredits.reduce(
    (sum, credit) => sum + credit.value,
    0
  );

  const perksValue = platinum.perks?.loungeAccessValue || 0;

  const platinumResult: CardAnalysis = {
    cardName: platinum.name,
    annualFee: platinum.fee,
    pointsEarned: platPoints,
    pointsValue: platPoints * cpp,
    creditsValue: platCreditsValue,
    perksValue,
    totalValue: platPoints * cpp + platCreditsValue + perksValue,
    netValue: platPoints * cpp + platCreditsValue + perksValue - platinum.fee,
    effectiveAnnualFee: platinum.fee - platCreditsValue,
    breakdown: platBreakdown,
    creditsBreakdown: platCredits,
  };

  const difference = goldResult.netValue - platinumResult.netValue;
  const winner =
    difference > 0 ? "gold" : difference < 0 ? "platinum" : "tie";
  const recommendation =
    winner === "tie"
      ? "Both cards deliver similar net value based on your inputs."
      : `Based on your inputs, the ${winner === "gold" ? "Gold" : "Platinum"} card wins.`;
  const considerations: string[] = [];
  if (winner === "platinum" && !creditUsage.airlineFeeUsage) {
    considerations.push("Platinum benefits depend on using the airline fee credit.");
  }
  if (winner === "gold" && creditUsage.diningCreditUsage < 50) {
    considerations.push("Gold value improves if you use more of the dining credits.");
  }

  return {
    gold: goldResult,
    platinum: platinumResult,
    winner,
    difference: Math.abs(difference),
    recommendation,
    considerations,
  };
}
