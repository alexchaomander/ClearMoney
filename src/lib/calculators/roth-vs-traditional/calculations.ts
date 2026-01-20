import type { CalculatorInputs, CalculatorResults } from "./types";

export function calculate(inputs: CalculatorInputs): CalculatorResults {
  const {
    annualContribution,
    currentTaxRate,
    retirementTaxRate,
    yearsUntilRetirement,
    expectedReturn,
  } = inputs;

  const currentRate = currentTaxRate / 100;
  const retirementRate = retirementTaxRate / 100;
  const returnRate = expectedReturn / 100;

  const traditionalContribution = annualContribution;
  const traditionalFutureValue = calculateFutureValue(
    traditionalContribution,
    returnRate,
    yearsUntilRetirement
  );
  const traditionalAfterTax = traditionalFutureValue * (1 - retirementRate);
  const traditionalTaxesPaid = traditionalFutureValue * retirementRate;

  const rothTaxPaidNow = annualContribution * currentRate;
  const rothContribution = annualContribution * (1 - currentRate);
  const rothFutureValue = calculateFutureValue(
    rothContribution,
    returnRate,
    yearsUntilRetirement
  );
  const rothAfterTax = rothFutureValue;

  const difference = rothAfterTax - traditionalAfterTax;
  const percentageDifference =
    traditionalAfterTax === 0 ? 0 : (difference / traditionalAfterTax) * 100;

  let winner: "roth" | "traditional" | "tie";
  if (Math.abs(difference) < 100) {
    winner = "tie";
  } else if (difference > 0) {
    winner = "roth";
  } else {
    winner = "traditional";
  }

  const breakEvenTaxRate = currentTaxRate;

  let recommendation: string;
  const factors: string[] = [];

  if (annualContribution <= 0) {
    recommendation =
      "Enter a contribution amount to see which account type wins.";
  } else if (winner === "tie") {
    recommendation =
      "At these tax rates, both options are nearly identical. Choose based on other factors.";
  } else if (winner === "roth") {
    recommendation = `Roth wins by ${formatCurrency(
      difference
    )}! You expect higher taxes in retirement.`;
    factors.push("You expect to be in a higher tax bracket in retirement");
    factors.push("Tax rates may increase in the future");
    factors.push("You value tax-free withdrawals for flexibility");
  } else {
    recommendation = `Traditional wins by ${formatCurrency(
      -difference
    )}! You expect lower taxes in retirement.`;
    factors.push("You expect to be in a lower tax bracket in retirement");
    factors.push("You need the tax deduction now to reduce current taxes");
    factors.push("Your income is currently high but will decrease");
  }

  if (annualContribution > 0 && yearsUntilRetirement > 20) {
    factors.push("Long time horizon favors Roth (more tax-free growth)");
  }

  return {
    traditional: {
      contribution: traditionalContribution,
      futureValue: traditionalFutureValue,
      afterTaxValue: traditionalAfterTax,
      taxesPaid: traditionalTaxesPaid,
    },
    roth: {
      contribution: rothContribution,
      futureValue: rothFutureValue,
      afterTaxValue: rothAfterTax,
      taxesPaidNow: rothTaxPaidNow,
    },
    difference,
    percentageDifference,
    winner,
    breakEvenTaxRate,
    recommendation,
    factors,
  };
}

function calculateFutureValue(
  annualContribution: number,
  rate: number,
  years: number
): number {
  if (rate === 0) return annualContribution * years;
  return annualContribution * ((Math.pow(1 + rate, years) - 1) / rate);
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Math.abs(value));
}
