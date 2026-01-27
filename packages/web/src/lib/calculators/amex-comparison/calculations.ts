import type { CalculatorInputs, CalculatorResults, CardAnalysis } from "./types";

const GOLD = {
  name: "Amex Gold",
  fee: 250,
  rates: { dining: 4, groceries: 4, flights: 3, hotels: 1, other: 1 },
  credits: {
    uber: { max: 120, monthly: true },
    dining: { max: 120, monthly: true },
  },
};

const PLATINUM = {
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

export function calculate(inputs: CalculatorInputs): CalculatorResults {
  const { spending, creditUsage, preferences } = inputs;
  const cpp = preferences.pointsValue / 100;

  const goldBreakdown = [
    {
      category: "Dining",
      spend: spending.dining * 12,
      multiplier: GOLD.rates.dining,
      points: 0,
    },
    {
      category: "Groceries",
      spend: spending.groceries * 12,
      multiplier: GOLD.rates.groceries,
      points: 0,
    },
    {
      category: "Flights",
      spend: spending.flights * 12,
      multiplier: GOLD.rates.flights,
      points: 0,
    },
    {
      category: "Hotels",
      spend: spending.hotels * 12,
      multiplier: GOLD.rates.hotels,
      points: 0,
    },
    {
      category: "Other",
      spend: spending.other * 12,
      multiplier: GOLD.rates.other,
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
      maxValue: 120,
      usage: creditUsage.uberCreditUsage,
      value: (120 * creditUsage.uberCreditUsage) / 100,
    },
    {
      credit: "Dining Credits",
      maxValue: 120,
      usage: creditUsage.diningCreditUsage,
      value: (120 * creditUsage.diningCreditUsage) / 100,
    },
  ];
  const goldCreditsValue = goldCredits.reduce(
    (sum, credit) => sum + credit.value,
    0
  );

  const gold: CardAnalysis = {
    cardName: GOLD.name,
    annualFee: GOLD.fee,
    pointsEarned: goldPoints,
    pointsValue: goldPoints * cpp,
    creditsValue: goldCreditsValue,
    perksValue: 0,
    totalValue: goldPoints * cpp + goldCreditsValue,
    netValue: goldPoints * cpp + goldCreditsValue - GOLD.fee,
    effectiveAnnualFee: GOLD.fee - goldCreditsValue,
    breakdown: goldBreakdown,
    creditsBreakdown: goldCredits,
  };

  const platBreakdown = [
    {
      category: "Dining",
      spend: spending.dining * 12,
      multiplier: PLATINUM.rates.dining,
      points: 0,
    },
    {
      category: "Groceries",
      spend: spending.groceries * 12,
      multiplier: PLATINUM.rates.groceries,
      points: 0,
    },
    {
      category: "Flights",
      spend: spending.flights * 12,
      multiplier: PLATINUM.rates.flights,
      points: 0,
    },
    {
      category: "Hotels",
      spend: spending.hotels * 12,
      multiplier: PLATINUM.rates.hotels,
      points: 0,
    },
    {
      category: "Other",
      spend: spending.other * 12,
      multiplier: PLATINUM.rates.other,
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
      maxValue: 200,
      usage: creditUsage.uberCreditUsage,
      value: (200 * creditUsage.uberCreditUsage) / 100,
    },
    {
      credit: "Airline Fee Credit",
      maxValue: 200,
      usage: creditUsage.airlineFeeUsage,
      value: (200 * creditUsage.airlineFeeUsage) / 100,
    },
    {
      credit: "Hotel Credit",
      maxValue: 200,
      usage: creditUsage.hotelCreditUsage,
      value: (200 * creditUsage.hotelCreditUsage) / 100,
    },
    {
      credit: "Entertainment",
      maxValue: 240,
      usage: creditUsage.entertainmentUsage,
      value: (240 * creditUsage.entertainmentUsage) / 100,
    },
    {
      credit: "Saks Credit",
      maxValue: 100,
      usage: creditUsage.saksUsage,
      value: (100 * creditUsage.saksUsage) / 100,
    },
  ];
  const platCreditsValue = platCredits.reduce(
    (sum, credit) => sum + credit.value,
    0
  );

  const loungeValue = preferences.valuesLoungeAccess
    ? preferences.flightsPerYear * PLATINUM.perks.loungeAccessValue
    : 0;

  const platinum: CardAnalysis = {
    cardName: PLATINUM.name,
    annualFee: PLATINUM.fee,
    pointsEarned: platPoints,
    pointsValue: platPoints * cpp,
    creditsValue: platCreditsValue,
    perksValue: loungeValue,
    totalValue: platPoints * cpp + platCreditsValue + loungeValue,
    netValue: platPoints * cpp + platCreditsValue + loungeValue - PLATINUM.fee,
    effectiveAnnualFee: PLATINUM.fee - platCreditsValue - loungeValue,
    breakdown: platBreakdown,
    creditsBreakdown: platCredits,
  };

  const difference = gold.netValue - platinum.netValue;
  let winner: "gold" | "platinum" | "tie";
  if (Math.abs(difference) < 50) {
    winner = "tie";
  } else if (difference > 0) {
    winner = "gold";
  } else {
    winner = "platinum";
  }

  let recommendation: string;
  const considerations: string[] = [];

  if (winner === "gold") {
    recommendation = `Gold wins by $${Math.round(difference)}/year for your spending patterns.`;
    considerations.push(
      "Gold earns 4x on dining and groceries—great for everyday spending"
    );
    considerations.push("Lower annual fee means less pressure to use credits");
  } else if (winner === "platinum") {
    recommendation = `Platinum wins by $${Math.round(
      -difference
    )}/year, but only if you use the credits.`;
    considerations.push(
      "Platinum is only worth it if you actively use the credits and perks"
    );
    considerations.push(
      "Lounge access adds significant value for frequent travelers"
    );
  } else {
    recommendation = "It's close! Consider which perks matter more to you.";
    considerations.push("Gold for earning points on everyday spending");
    considerations.push("Platinum for travel perks and premium experiences");
  }

  if (gold.effectiveAnnualFee < 0) {
    considerations.push(
      `Gold effectively pays you $${Math.round(
        -gold.effectiveAnnualFee
      )}/year after credits`
    );
  }

  if (!preferences.valuesLoungeAccess) {
    considerations.push(
      "You marked lounge access as not valuable—that's a big Platinum benefit you'd miss"
    );
  }

  return {
    gold,
    platinum,
    winner,
    difference,
    recommendation,
    considerations,
  };
}
