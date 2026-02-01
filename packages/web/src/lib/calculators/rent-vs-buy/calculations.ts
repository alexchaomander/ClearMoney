import type { CalculatorInputs, CalculatorResults, YearComparison } from "./types";

/**
 * Calculate the monthly mortgage payment (P&I) using standard amortization.
 */
const calculateMonthlyPayment = (
  principal: number,
  annualRate: number,
  years: number
): number => {
  if (principal <= 0) return 0;

  const monthlyRate = annualRate / 12;
  const numPayments = years * 12;

  if (monthlyRate === 0) return principal / numPayments;

  const factor = Math.pow(1 + monthlyRate, numPayments);
  return principal * ((monthlyRate * factor) / (factor - 1));
};

/**
 * Calculate remaining mortgage balance after a given number of years.
 */
const remainingBalance = (
  principal: number,
  annualRate: number,
  loanTermYears: number,
  yearsElapsed: number
): number => {
  if (principal <= 0 || yearsElapsed >= loanTermYears) return 0;

  const monthlyRate = annualRate / 12;
  const totalPayments = loanTermYears * 12;
  const paymentsMade = yearsElapsed * 12;

  if (monthlyRate === 0) {
    return principal * (1 - paymentsMade / totalPayments);
  }

  const factor = Math.pow(1 + monthlyRate, totalPayments);
  const factorElapsed = Math.pow(1 + monthlyRate, paymentsMade);

  return principal * (factor - factorElapsed) / (factor - 1);
};

/**
 * Core rent-vs-buy calculation.
 *
 * Compares renting + investing the difference vs buying a home.
 * Accounts for appreciation, maintenance, property tax, mortgage interest,
 * and opportunity cost of the down payment and monthly savings.
 */
export const calculate = (inputs: CalculatorInputs): CalculatorResults => {
  const {
    monthlyRent,
    annualRentIncrease,
    homePrice,
    downPaymentPercent,
    mortgageRate,
    loanTermYears,
    propertyTaxRate,
    homeAppreciationRate,
    maintenanceRate,
    investmentReturnRate,
    timeHorizon,
  } = inputs;

  // Convert percentages to decimals
  const rentIncreaseRate = annualRentIncrease / 100;
  const downPaymentFraction = downPaymentPercent / 100;
  const mortgageRateDecimal = mortgageRate / 100;
  const propTaxRate = propertyTaxRate / 100;
  const appreciationRate = homeAppreciationRate / 100;
  const maintRate = maintenanceRate / 100;
  const investReturnRate = investmentReturnRate / 100;

  // Buying scenario fundamentals
  const downPayment = homePrice * downPaymentFraction;
  const loanAmount = homePrice - downPayment;
  const monthlyMortgage = calculateMonthlyPayment(
    loanAmount,
    mortgageRateDecimal,
    loanTermYears
  );

  // Monthly buying costs in year 1
  const monthlyPropertyTax = (homePrice * propTaxRate) / 12;
  const monthlyMaintenance = (homePrice * maintRate) / 12;
  const monthlyInsurance = (homePrice * 0.0035) / 12; // ~0.35% of home value
  const monthlyBuyCostYear1 =
    monthlyMortgage + monthlyPropertyTax + monthlyMaintenance + monthlyInsurance;

  // Monthly savings if renting (year 1): buying cost - rent, plus down payment opportunity cost
  const monthlySavingsIfRenting = Math.max(0, monthlyBuyCostYear1 - monthlyRent);

  // Build year-by-year comparison
  const timeline: YearComparison[] = [];
  let totalRentCost = 0;
  let totalBuyCost = downPayment; // include down payment as part of buy cost outlay
  let investmentBalance = downPayment; // renter invests the down payment upfront
  let currentRent = monthlyRent;
  let breakEvenYear: number | null = null;

  // Closing costs for buying (~3% of home price)
  const closingCosts = homePrice * 0.03;
  totalBuyCost += closingCosts;

  for (let year = 1; year <= timeHorizon; year++) {
    // --- Renting costs this year ---
    const annualRent = currentRent * 12;
    totalRentCost += annualRent;

    // --- Buying costs this year ---
    const currentHomeValue = homePrice * Math.pow(1 + appreciationRate, year);
    const annualPropertyTax = currentHomeValue * propTaxRate;
    const annualMaintenance = currentHomeValue * maintRate;
    const annualInsurance = currentHomeValue * 0.0035;
    const annualMortgage = monthlyMortgage * 12;
    const annualBuyCost =
      annualMortgage + annualPropertyTax + annualMaintenance + annualInsurance;
    totalBuyCost += annualBuyCost;

    // --- Renter's investment growth ---
    // Monthly savings = buy cost this year - rent this year (annualized)
    const monthlyBuyCostThisYear =
      monthlyMortgage +
      (currentHomeValue * propTaxRate) / 12 +
      (currentHomeValue * maintRate) / 12 +
      (currentHomeValue * 0.0035) / 12;
    const monthlySavings = Math.max(0, monthlyBuyCostThisYear - currentRent);

    // Grow existing balance and add monthly contributions
    investmentBalance =
      investmentBalance * (1 + investReturnRate) + monthlySavings * 12;

    // --- Buyer's equity ---
    const loanBalance = remainingBalance(
      loanAmount,
      mortgageRateDecimal,
      loanTermYears,
      year
    );
    const homeEquity = currentHomeValue - loanBalance;

    // --- Net worth comparison ---
    // Renter: investment balance (down payment + savings invested)
    const rentNetWorth = investmentBalance;
    // Buyer: home equity minus selling costs (~6% of home value for agent fees, etc.)
    const sellingCosts = currentHomeValue * 0.06;
    const buyNetWorth = homeEquity - sellingCosts - closingCosts;

    timeline.push({
      year,
      rentCost: annualRent,
      buyCost: annualBuyCost,
      homeEquity,
      investmentBalance,
      rentNetWorth,
      buyNetWorth,
    });

    // Detect break-even: when buying net worth first exceeds renting net worth
    if (breakEvenYear === null && buyNetWorth >= rentNetWorth) {
      breakEvenYear = year;
    }

    // Increase rent for next year
    currentRent *= 1 + rentIncreaseRate;
  }

  // Final values at end of time horizon
  const lastYear = timeline[timeline.length - 1];
  const finalHomeEquity = lastYear?.homeEquity ?? 0;
  const finalInvestmentBalance = lastYear?.investmentBalance ?? 0;
  const rentNetWorthAtEnd = lastYear?.rentNetWorth ?? 0;
  const buyNetWorthAtEnd = lastYear?.buyNetWorth ?? 0;

  // Determine winner
  const netWorthDiff = buyNetWorthAtEnd - rentNetWorthAtEnd;
  const threshold = Math.max(homePrice * 0.01, 5000); // ~1% of home price or $5k
  let winner: "rent" | "buy" | "tie";
  if (netWorthDiff > threshold) {
    winner = "buy";
  } else if (netWorthDiff < -threshold) {
    winner = "rent";
  } else {
    winner = "tie";
  }

  // Generate recommendation
  let recommendation: string;
  const advantage = formatDollars(Math.abs(netWorthDiff));

  if (winner === "buy") {
    recommendation = breakEvenYear
      ? `Buying comes out ahead by ${advantage} over ${timeHorizon} years. You break even around year ${breakEvenYear}, after which equity growth and appreciation outpace renting and investing the difference.`
      : `Buying comes out ahead by ${advantage} over ${timeHorizon} years. Home equity and appreciation more than offset the higher monthly costs of ownership.`;
  } else if (winner === "rent") {
    recommendation = `Renting and investing the difference comes out ahead by ${advantage} over ${timeHorizon} years. The returns from investing your down payment and monthly savings outpace home equity growth at these assumptions.`;
  } else {
    recommendation = `It is roughly a wash over ${timeHorizon} years. The decision comes down to lifestyle preferences, flexibility, and whether you value building equity in a home versus liquidity in investments.`;
  }

  return {
    breakEvenYear,
    totalRentCost,
    totalBuyCost,
    finalHomeEquity,
    finalInvestmentBalance,
    rentNetWorthAtEnd,
    buyNetWorthAtEnd,
    winner,
    monthlySavingsIfRenting,
    timeline,
    recommendation,
  };
};

/** Simple dollar formatting for recommendation strings. */
function formatDollars(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}
