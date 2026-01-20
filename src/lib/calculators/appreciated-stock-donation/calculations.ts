import type {
  CalculatorInputs,
  CalculatorResults,
  CashDonationScenario,
  FilingStatus,
  StockDonationScenario,
  ComparisonResult,
} from "./types";

const FEDERAL_LTCG_RATES: Record<
  FilingStatus,
  { max: number; rate: number }[]
> = {
  single: [
    { max: 47025, rate: 0 },
    { max: 518900, rate: 0.15 },
    { max: Infinity, rate: 0.2 },
  ],
  married: [
    { max: 94050, rate: 0 },
    { max: 583750, rate: 0.15 },
    { max: Infinity, rate: 0.2 },
  ],
  head_of_household: [
    { max: 63000, rate: 0 },
    { max: 551350, rate: 0.15 },
    { max: Infinity, rate: 0.2 },
  ],
};

const NIIT_THRESHOLD: Record<FilingStatus, number> = {
  single: 200000,
  married: 250000,
  head_of_household: 200000,
};

const STATE_TAX_RATES: Record<string, number> = {
  CA: 0.133,
  NY: 0.109,
  NJ: 0.1075,
  OR: 0.099,
  MN: 0.0985,
  HI: 0.11,
  VT: 0.0875,
  IA: 0.085,
  WI: 0.0765,
  ME: 0.0715,
  WA: 0,
  TX: 0,
  FL: 0,
  NV: 0,
  SD: 0,
  WY: 0,
  AK: 0,
  TN: 0,
  NH: 0,
};

const AGI_LIMITS = {
  cash_public_charity: 0.6,
  cash_private_foundation: 0.3,
  cash_daf: 0.6,
  property_public_charity: 0.3,
  property_private_foundation: 0.2,
  property_daf: 0.3,
};

function getFederalCapGainsRate(
  income: number,
  filingStatus: FilingStatus,
): number {
  const brackets = FEDERAL_LTCG_RATES[filingStatus];
  for (const bracket of brackets) {
    if (income <= bracket.max) {
      return bracket.rate;
    }
  }
  return 0.2;
}

function calculateCashScenario(inputs: CalculatorInputs): CashDonationScenario {
  const { stock, tax, donation } = inputs;

  const gainRatio =
    stock.stockValue > 0
      ? (stock.stockValue - stock.costBasis) / stock.stockValue
      : 0;

  const stockToSell = donation.donationAmount;
  const capitalGain = stockToSell * gainRatio;

  const isLongTerm = stock.holdingPeriod >= 12;
  const federalRate = isLongTerm
    ? getFederalCapGainsRate(tax.adjustedGrossIncome, tax.filingStatus)
    : tax.marginalTaxRate / 100;
  const federalCapGainsTax = capitalGain * federalRate;

  const stateRate = STATE_TAX_RATES[tax.stateCode] || 0;
  const stateCapGainsTax = capitalGain * stateRate;

  const niitThreshold = NIIT_THRESHOLD[tax.filingStatus];
  const niitTax = tax.adjustedGrossIncome > niitThreshold ? capitalGain * 0.038 : 0;

  const totalCapGainsTax = federalCapGainsTax + stateCapGainsTax + niitTax;
  const amountAvailableToDonate = Math.max(stockToSell - totalCapGainsTax, 0);

  const charitableDeduction = tax.itemizesDeductions ? amountAvailableToDonate : 0;
  const combinedMarginalRate = tax.marginalTaxRate / 100 + stateRate;
  const taxSavingsFromDeduction = charitableDeduction * combinedMarginalRate;

  const netCostOfDonation = stockToSell - taxSavingsFromDeduction;

  return {
    stockSaleProceeds: stockToSell,
    capitalGain,
    federalCapGainsTax,
    stateCapGainsTax,
    niitTax,
    totalCapGainsTax,
    amountAvailableToDonate,
    charitableDeduction,
    taxSavingsFromDeduction,
    netCostOfDonation,
  };
}

function calculateStockScenario(inputs: CalculatorInputs): StockDonationScenario {
  const { stock, tax, donation } = inputs;

  const isLongTerm = stock.holdingPeriod >= 12;

  const gainRatio =
    stock.stockValue > 0
      ? (stock.stockValue - stock.costBasis) / stock.stockValue
      : 0;
  const capitalGainAvoided = donation.donationAmount * gainRatio;

  const federalRate = isLongTerm
    ? getFederalCapGainsRate(tax.adjustedGrossIncome, tax.filingStatus)
    : tax.marginalTaxRate / 100;
  const stateRate = STATE_TAX_RATES[tax.stateCode] || 0;
  const niitThreshold = NIIT_THRESHOLD[tax.filingStatus];
  const niitRate = tax.adjustedGrossIncome > niitThreshold ? 0.038 : 0;

  const taxAvoided = capitalGainAvoided * (federalRate + stateRate + niitRate);

  const agiLimitPercent =
    donation.donationType === "private_foundation" ? 0.2 : 0.3;

  const maxDeductionThisYear = tax.adjustedGrossIncome * agiLimitPercent;
  const deductibleThisYear = Math.min(donation.donationAmount, maxDeductionThisYear);
  const carryForward = Math.max(0, donation.donationAmount - deductibleThisYear);

  const charitableDeduction = tax.itemizesDeductions
    ? isLongTerm
      ? deductibleThisYear
      : Math.min(
          deductibleThisYear,
          stock.costBasis * (donation.donationAmount / stock.stockValue || 0),
        )
    : 0;

  const combinedMarginalRate = tax.marginalTaxRate / 100 + stateRate;
  const taxSavingsFromDeduction = charitableDeduction * combinedMarginalRate;

  const netCostOfDonation =
    donation.donationAmount - taxAvoided - taxSavingsFromDeduction;

  return {
    stockValue: donation.donationAmount,
    capitalGainAvoided,
    taxAvoided,
    charitableDeduction,
    taxSavingsFromDeduction,
    netCostOfDonation,
    agiLimitPercent: agiLimitPercent * 100,
    deductibleThisYear,
    carryForward,
  };
}

export function calculate(inputs: CalculatorInputs): CalculatorResults {
  const { stock, tax } = inputs;

  const cashScenario = calculateCashScenario(inputs);
  const stockScenario = calculateStockScenario(inputs);

  const stockAdvantage =
    cashScenario.netCostOfDonation - stockScenario.netCostOfDonation;
  const percentageSavings =
    cashScenario.netCostOfDonation > 0
      ? (stockAdvantage / cashScenario.netCostOfDonation) * 100
      : 0;

  const additionalCharitableImpact =
    stockScenario.stockValue - cashScenario.amountAvailableToDonate;

  const comparison: ComparisonResult = {
    stockAdvantage,
    percentageSavings,
    effectiveCostCashDonation: cashScenario.netCostOfDonation,
    effectiveCostStockDonation: stockScenario.netCostOfDonation,
    additionalCharitableImpact,
  };

  const isLongTermHolding = stock.holdingPeriod >= 12;
  const qualifiesForFMVDeduction = isLongTermHolding;

  const cashAGILimit = tax.adjustedGrossIncome * 0.6;
  const stockAGILimit = tax.adjustedGrossIncome * 0.3;
  const currentCashDonationsRoom = cashAGILimit;
  const currentStockDonationsRoom = stockAGILimit;

  const recommendations: string[] = [];
  const warnings: string[] = [];

  if (stockAdvantage > 0) {
    recommendations.push(
      `Donating stock saves you $${stockAdvantage.toLocaleString()} compared to selling and donating cash.`,
    );
  }

  if (additionalCharitableImpact > 0) {
    recommendations.push(
      `The charity receives $${additionalCharitableImpact.toLocaleString()} more when you donate stock directly.`,
    );
  }

  if (!isLongTermHolding) {
    warnings.push(
      `You've held this stock for only ${stock.holdingPeriod} months. Hold for 12+ months to qualify for full FMV deduction.`,
    );
    recommendations.push(
      "Consider waiting until you've held the stock for at least 12 months.",
    );
  }

  if (stockScenario.carryForward > 0) {
    warnings.push(
      `Your donation exceeds the ${stockScenario.agiLimitPercent}% AGI limit. $${stockScenario.carryForward.toLocaleString()} will carry forward to future years.`,
    );
  }

  if (!tax.itemizesDeductions) {
    warnings.push(
      "You're not itemizing deductions. You won't receive a tax benefit from the charitable deduction. Consider bunching donations to exceed the standard deduction.",
    );
  }

  if (stock.costBasis === 0) {
    recommendations.push(
      "With a $0 cost basis (100% gain), donating stock is especially advantageous—you avoid maximum capital gains.",
    );
  }

  const steps: CalculatorResults["steps"] = [
    {
      step: 1,
      title: "Verify Charity Accepts Stock",
      description:
        "Contact the charity or check their website. Most large charities and all Donor-Advised Funds accept stock donations.",
    },
    {
      step: 2,
      title: "Get Stock Transfer Instructions",
      description:
        "The charity will provide their brokerage account details (DTC number, account number). Request these in writing.",
    },
    {
      step: 3,
      title: "Initiate Transfer from Your Broker",
      description:
        "Contact your broker (or use their website) to initiate a stock transfer. You'll need the charity's brokerage info.",
    },
    {
      step: 4,
      title: "Document the Donation",
      description:
        "Get written acknowledgment from the charity. For donations over $500, you'll need Form 8283. Over $5,000 requires appraisal.",
    },
    {
      step: 5,
      title: "(Optional) Replenish Your Position",
      description:
        "Buy the same stock back immediately with cash. No wash sale rule applies to donations! This resets your cost basis higher.",
    },
  ];

  return {
    cashScenario,
    stockScenario,
    comparison,
    isLongTermHolding,
    qualifiesForFMVDeduction,
    cashAGILimit,
    stockAGILimit,
    currentCashDonationsRoom,
    currentStockDonationsRoom,
    recommendations,
    warnings,
    steps,
  };
}

export { AGI_LIMITS, STATE_TAX_RATES };
