import type {
  CalculatorInputs,
  CalculatorResults,
  CryptoLot,
  FilingStatus,
  TaxMethodResult,
  Wallet,
} from "./types";
import {
  FEDERAL_BRACKETS,
  LTCG_BRACKETS,
  METHOD_DETAILS,
  NIIT_RATE,
  NIIT_THRESHOLD,
  STATE_RATES,
} from "./constants";

const CURRENT_PRICE = 1;

const LOT_COST_MULTIPLIERS = {
  longTerm: [0.85, 1.15],
  shortTerm: [0.75, 1.25],
};

const LOT_MONTHS_AGO = {
  longTerm: [30, 18],
  shortTerm: [9, 4],
};

const WALLET_MULTIPLIERS = [0.9, 0.95, 1, 1.05, 1.12, 1.18];

const METHOD_KEYS = ["fifo", "lifo", "hifo", "specificId"] as const;

type MethodKey = (typeof METHOD_KEYS)[number];

function getDateMonthsAgo(months: number): Date {
  const date = new Date();
  date.setMonth(date.getMonth() - months);
  return date;
}

function getMarginalRate(income: number, filingStatus: FilingStatus): number {
  const brackets = FEDERAL_BRACKETS[filingStatus];
  let marginalRate = brackets[0]?.rate ?? 0;

  for (const bracket of brackets) {
    if (income > bracket.min) {
      marginalRate = bracket.rate;
    }
  }

  return marginalRate;
}

function getLtcgRate(income: number, filingStatus: FilingStatus): number {
  const brackets = LTCG_BRACKETS[filingStatus];
  let rate = brackets[0]?.rate ?? 0;

  for (const bracket of brackets) {
    if (income > bracket.min) {
      rate = bracket.rate;
    }
  }

  return rate;
}

function calculateTax(
  shortTermGain: number,
  longTermGain: number,
  ordinaryIncome: number,
  filingStatus: FilingStatus,
  state: string
): number {
  const marginalRate = getMarginalRate(ordinaryIncome, filingStatus);
  const ltcgRate = getLtcgRate(ordinaryIncome + longTermGain, filingStatus);
  const stateRate = STATE_RATES[state] ?? 0.05;

  const shortTermTax = shortTermGain * marginalRate;
  const longTermTax = longTermGain * ltcgRate;

  const totalIncome = ordinaryIncome + shortTermGain + longTermGain;
  const threshold = NIIT_THRESHOLD[filingStatus];
  let niitTax = 0;
  if (totalIncome > threshold) {
    const niitableGain = Math.min(
      shortTermGain + longTermGain,
      totalIncome - threshold
    );
    niitTax = niitableGain * NIIT_RATE;
  }

  const stateTax = (shortTermGain + longTermGain) * stateRate;

  return shortTermTax + longTermTax + niitTax + stateTax;
}

function calculateGains(lots: CryptoLot[]): {
  shortTerm: number;
  longTerm: number;
} {
  let shortTerm = 0;
  let longTerm = 0;
  const oneYearAgo = getDateMonthsAgo(12);

  for (const lot of lots) {
    const proceeds = lot.quantity * CURRENT_PRICE;
    const basis = lot.quantity * lot.costPerUnit;
    const gain = proceeds - basis;

    if (lot.purchaseDate <= oneYearAgo) {
      longTerm += gain;
    } else {
      shortTerm += gain;
    }
  }

  return { shortTerm, longTerm };
}

function applySelection(
  lots: CryptoLot[],
  amountToSell: number
): CryptoLot[] {
  const selected: CryptoLot[] = [];
  let remaining = amountToSell;

  for (const lot of lots) {
    if (remaining <= 0) break;
    const useQuantity = Math.min(lot.quantity, remaining);
    selected.push({ ...lot, quantity: useQuantity });
    remaining -= useQuantity;
  }

  return selected;
}

function selectLots(
  wallets: Wallet[],
  method: MethodKey,
  amountToSell: number,
  taxRates: { shortTermRate: number; longTermRate: number }
): CryptoLot[] {
  const allLots = wallets.flatMap((wallet) => wallet.lots);
  let sortedLots: CryptoLot[] = [];

  switch (method) {
    case "fifo":
      sortedLots = [...allLots].sort(
        (a, b) => a.purchaseDate.getTime() - b.purchaseDate.getTime()
      );
      break;
    case "lifo":
      sortedLots = [...allLots].sort(
        (a, b) => b.purchaseDate.getTime() - a.purchaseDate.getTime()
      );
      break;
    case "hifo":
      sortedLots = [...allLots].sort(
        (a, b) => b.costPerUnit - a.costPerUnit
      );
      break;
    case "specificId":
      sortedLots = [...allLots].sort((a, b) => {
        const aIsLongTerm = a.purchaseDate <= getDateMonthsAgo(12);
        const bIsLongTerm = b.purchaseDate <= getDateMonthsAgo(12);
        const aGainPerUnit = CURRENT_PRICE - a.costPerUnit;
        const bGainPerUnit = CURRENT_PRICE - b.costPerUnit;
        const aRate = aIsLongTerm
          ? taxRates.longTermRate
          : taxRates.shortTermRate;
        const bRate = bIsLongTerm
          ? taxRates.longTermRate
          : taxRates.shortTermRate;
        const aTaxPerUnit = aGainPerUnit * aRate;
        const bTaxPerUnit = bGainPerUnit * bRate;

        if (aTaxPerUnit === bTaxPerUnit) {
          return b.costPerUnit - a.costPerUnit;
        }

        return aTaxPerUnit - bTaxPerUnit;
      });
      break;
  }

  return applySelection(sortedLots, amountToSell);
}

function generateWallets(inputs: CalculatorInputs): Wallet[] {
  const {
    numberOfWallets,
    totalHoldings,
    totalCostBasis,
    holdingPeriodMix,
  } = inputs;
  const walletCount = Math.max(1, Math.floor(numberOfWallets));
  const normalizedMultipliers = Array.from({ length: walletCount }).map(
    (_, index) => WALLET_MULTIPLIERS[index % WALLET_MULTIPLIERS.length]
  );
  const multiplierSum = normalizedMultipliers.reduce(
    (sum, value) => sum + value,
    0
  );
  const longTermShare = Math.min(Math.max(holdingPeriodMix / 100, 0), 1);

  return normalizedMultipliers.map((multiplier, index) => {
    const walletValue = totalHoldings / walletCount;
    const walletCostBasis = (totalCostBasis * multiplier) / multiplierSum;
    const averageCostPerUnit = walletValue > 0 ? walletCostBasis / walletValue : 0;

    const longTermUnits = walletValue * longTermShare;
    const shortTermUnits = walletValue - longTermUnits;

    const lotUnits = [
      longTermUnits / 2,
      longTermUnits / 2,
      shortTermUnits / 2,
      shortTermUnits / 2,
    ];

    const baseCostPerUnit = [
      averageCostPerUnit * LOT_COST_MULTIPLIERS.longTerm[0],
      averageCostPerUnit * LOT_COST_MULTIPLIERS.longTerm[1],
      averageCostPerUnit * LOT_COST_MULTIPLIERS.shortTerm[0],
      averageCostPerUnit * LOT_COST_MULTIPLIERS.shortTerm[1],
    ];

    const unscaledBasis = baseCostPerUnit.reduce(
      (sum, cost, lotIndex) => sum + cost * lotUnits[lotIndex],
      0
    );
    const scale = unscaledBasis > 0 ? walletCostBasis / unscaledBasis : 1;

    const lots: CryptoLot[] = baseCostPerUnit.map((cost, lotIndex) => {
      const isLongTerm = lotIndex < 2;
      const monthsAgo = isLongTerm
        ? LOT_MONTHS_AGO.longTerm[lotIndex]
        : LOT_MONTHS_AGO.shortTerm[lotIndex - 2];

      return {
        id: `wallet-${index}-lot-${lotIndex}`,
        walletId: `wallet-${index}`,
        purchaseDate: getDateMonthsAgo(monthsAgo),
        quantity: lotUnits[lotIndex],
        costPerUnit: cost * scale,
      };
    });

    return {
      id: `wallet-${index}`,
      name: `Wallet ${index + 1}`,
      lots,
      totalValue: walletValue,
      totalCostBasis: walletCostBasis,
    };
  });
}

function calculateMethodResult(
  methodKey: MethodKey,
  wallets: Wallet[],
  amountToSell: number,
  inputs: CalculatorInputs
): TaxMethodResult {
  const shortTermRate = getMarginalRate(inputs.ordinaryIncome, inputs.filingStatus);
  const longTermRate = getLtcgRate(
    inputs.ordinaryIncome + Math.max(0, amountToSell),
    inputs.filingStatus
  );
  const lotsUsed = selectLots(wallets, methodKey, amountToSell, {
    shortTermRate,
    longTermRate,
  });
  const gains = calculateGains(lotsUsed);
  const estimatedTax = calculateTax(
    gains.shortTerm,
    gains.longTerm,
    inputs.ordinaryIncome,
    inputs.filingStatus,
    inputs.state
  );
  const totalGain = gains.shortTerm + gains.longTerm;
  const effectiveRate = totalGain > 0 ? estimatedTax / totalGain : 0;

  return {
    method: METHOD_DETAILS[methodKey].label,
    lotsUsed,
    shortTermGain: gains.shortTerm,
    longTermGain: gains.longTerm,
    totalGain,
    estimatedTax,
    effectiveRate,
  };
}

function calculateWalletByWalletImpact(
  wallets: Wallet[],
  amountToSell: number,
  inputs: CalculatorInputs
): { totalTax: number } {
  if (wallets.length === 1) {
    const methodResult = calculateMethodResult("fifo", wallets, amountToSell, inputs);
    return { totalTax: methodResult.estimatedTax };
  }

  const totalHoldings = wallets.reduce((sum, wallet) => sum + wallet.totalValue, 0);

  const walletTaxes = wallets.map((wallet) => {
    const walletShare = totalHoldings > 0 ? wallet.totalValue / totalHoldings : 0;
    const walletSaleAmount = amountToSell * walletShare;
    const result = calculateMethodResult(
      "fifo",
      [wallet],
      walletSaleAmount,
      inputs
    );
    return result.estimatedTax;
  });

  const totalTax = walletTaxes.reduce((sum, tax) => sum + tax, 0);

  return { totalTax };
}

export function calculate(inputs: CalculatorInputs): CalculatorResults {
  const wallets = generateWallets(inputs);
  const saleAmount = Math.min(inputs.plannedSaleAmount, inputs.totalHoldings);
  const totalCostBasis = inputs.totalCostBasis;
  const unrealizedGain = inputs.totalHoldings - totalCostBasis;

  const methodComparison = {
    fifo: calculateMethodResult("fifo", wallets, saleAmount, inputs),
    lifo: calculateMethodResult("lifo", wallets, saleAmount, inputs),
    hifo: calculateMethodResult("hifo", wallets, saleAmount, inputs),
    specificId: calculateMethodResult("specificId", wallets, saleAmount, inputs),
  };

  const methods = METHOD_KEYS.map((key) => ({ key, result: methodComparison[key] }));
  methods.sort((a, b) => a.result.estimatedTax - b.result.estimatedTax);
  const best = methods[0];
  const fifoTax = methodComparison.fifo.estimatedTax;
  const bestTax = best.result.estimatedTax;
  const taxSavingsVsFIFO = fifoTax - bestTax;

  const universal = methodComparison.fifo.estimatedTax;
  const walletByWallet = calculateWalletByWalletImpact(wallets, saleAmount, inputs);
  let walletByWalletTax = walletByWallet.totalTax;
  let difference = walletByWalletTax - universal;

  if (inputs.applyTransitionalRelief && Math.abs(difference) > 0) {
    const adjustedDifference = difference * 0.6;
    walletByWalletTax = universal + adjustedDifference;
    difference = adjustedDifference;
  }

  const walletByWalletImpact = {
    universalMethod: { totalTax: universal },
    walletByWallet: { totalTax: walletByWalletTax },
    difference,
    explanation: inputs.applyTransitionalRelief
      ? "Transitional relief lets you reallocate legacy basis once, narrowing wallet-by-wallet discrepancies."
      : "Wallet-by-wallet reporting can change which lots are sold, shifting your taxable gain compared with a universal method.",
  };

  const recommendations: string[] = [];
  const warnings: string[] = [];

  recommendations.push(
    `${METHOD_DETAILS[best.key].label} produces the lowest estimated tax based on your inputs.`
  );

  if (inputs.holdingPeriodMix >= 60) {
    recommendations.push(
      "Lean into long-term lots where possible to keep gains in the 0/15/20% brackets."
    );
  } else {
    recommendations.push(
      "Increase long-term holdings where possible to reduce ordinary income tax exposure."
    );
  }

  if (inputs.numberOfWallets > 1) {
    recommendations.push(
      "Consolidate lot records by wallet so you can document specific ID selections for 2025 reporting."
    );
  }

  if (inputs.applyTransitionalRelief) {
    recommendations.push(
      "Document your January 1, 2025 basis allocation to preserve transitional relief benefits."
    );
  }

  if (inputs.plannedSaleAmount > inputs.totalHoldings) {
    warnings.push(
      "Planned sale amount exceeds total holdings. We capped the sale to your total holdings."
    );
  }

  if (unrealizedGain < 0) {
    warnings.push(
      "Your portfolio shows an unrealized loss. Loss harvesting can offset other gains but may be subject to wash sale guidance."
    );
  }

  if (inputs.numberOfWallets > 1) {
    warnings.push(
      "Starting in 2025, brokers must report each wallet separately. FIFO is the IRS default if you do not elect a method."
    );
  }

  return {
    methodComparison,
    bestMethod: METHOD_DETAILS[best.key].label,
    taxSavingsVsFIFO,
    walletByWalletImpact,
    recommendations,
    warnings,
    unrealizedGain,
  };
}
