import type {
  CalculatorInputs,
  CalculatorResults,
  ExerciseCost,
  SaleAnalysis,
  ScenarioComparison,
  AMTAnalysis,
} from "./types";

const FEDERAL_BRACKETS = {
  single: [
    { min: 0, max: 11600, rate: 0.1 },
    { min: 11600, max: 47150, rate: 0.12 },
    { min: 47150, max: 100525, rate: 0.22 },
    { min: 100525, max: 191950, rate: 0.24 },
    { min: 191950, max: 243725, rate: 0.32 },
    { min: 243725, max: 609350, rate: 0.35 },
    { min: 609350, max: Infinity, rate: 0.37 },
  ],
  married: [
    { min: 0, max: 23200, rate: 0.1 },
    { min: 23200, max: 94300, rate: 0.12 },
    { min: 94300, max: 201050, rate: 0.22 },
    { min: 201050, max: 383900, rate: 0.24 },
    { min: 383900, max: 487450, rate: 0.32 },
    { min: 487450, max: 731200, rate: 0.35 },
    { min: 731200, max: Infinity, rate: 0.37 },
  ],
  head_of_household: [
    { min: 0, max: 16550, rate: 0.1 },
    { min: 16550, max: 63100, rate: 0.12 },
    { min: 63100, max: 100500, rate: 0.22 },
    { min: 100500, max: 191950, rate: 0.24 },
    { min: 191950, max: 243700, rate: 0.32 },
    { min: 243700, max: 609350, rate: 0.35 },
    { min: 609350, max: Infinity, rate: 0.37 },
  ],
};

const LTCG_BRACKETS = {
  single: [
    { min: 0, max: 47025, rate: 0 },
    { min: 47025, max: 518900, rate: 0.15 },
    { min: 518900, max: Infinity, rate: 0.2 },
  ],
  married: [
    { min: 0, max: 94050, rate: 0 },
    { min: 94050, max: 583750, rate: 0.15 },
    { min: 583750, max: Infinity, rate: 0.2 },
  ],
  head_of_household: [
    { min: 0, max: 63000, rate: 0 },
    { min: 63000, max: 551350, rate: 0.15 },
    { min: 551350, max: Infinity, rate: 0.2 },
  ],
};

const AMT_EXEMPTION = {
  single: 85700,
  married: 133300,
  head_of_household: 85700,
};

const AMT_PHASEOUT_START = {
  single: 609350,
  married: 1218700,
  head_of_household: 609350,
};

const AMT_RATE_THRESHOLD = 220700;

const NIIT_THRESHOLD = {
  single: 200000,
  married: 250000,
  head_of_household: 200000,
};

// Additional Medicare Tax threshold (0.9% on wages above threshold)
const ADDITIONAL_MEDICARE_THRESHOLD = {
  single: 200000,
  married: 250000,
  head_of_household: 200000,
};

// 2024 Social Security wage base
const SS_WAGE_BASE_2024 = 168600;
const SS_TAX_RATE = 0.062;
const MEDICARE_TAX_RATE = 0.0145;
const ADDITIONAL_MEDICARE_RATE = 0.009;

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
  SC: 0.07,
  CT: 0.0699,
  ID: 0.058,
  MT: 0.0675,
  NE: 0.0684,
  DE: 0.066,
  WV: 0.065,
  GA: 0.055,
  MA: 0.05,
  VA: 0.0575,
  DC: 0.085,
  RI: 0.0599,
  NC: 0.0525,
  KY: 0.045,
  OK: 0.0475,
  MS: 0.05,
  AR: 0.047,
  MO: 0.048,
  KS: 0.057,
  LA: 0.0425,
  AL: 0.05,
  MI: 0.0425,
  AZ: 0.025,
  IN: 0.0305,
  PA: 0.0307,
  OH: 0.0399,
  ND: 0.0225,
  IL: 0.0495,
  UT: 0.0465,
  CO: 0.044,
  NM: 0.059,
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

function calculateFederalTax(income: number, filingStatus: string): number {
  const brackets = FEDERAL_BRACKETS[filingStatus as keyof typeof FEDERAL_BRACKETS];
  let tax = 0;
  let remainingIncome = income;

  for (const bracket of brackets) {
    if (remainingIncome <= 0) break;
    const taxableInBracket = Math.min(remainingIncome, bracket.max - bracket.min);
    tax += taxableInBracket * bracket.rate;
    remainingIncome -= taxableInBracket;
  }

  return tax;
}

function getMarginalRate(income: number, filingStatus: string): number {
  const brackets = FEDERAL_BRACKETS[filingStatus as keyof typeof FEDERAL_BRACKETS];
  for (const bracket of brackets) {
    if (income >= bracket.min && income < bracket.max) {
      return bracket.rate;
    }
  }
  return 0.37;
}

function calculateLTCGTax(
  gain: number,
  ordinaryIncome: number,
  filingStatus: string
): number {
  const brackets = LTCG_BRACKETS[filingStatus as keyof typeof LTCG_BRACKETS];
  const totalIncome = ordinaryIncome + gain;

  let tax = 0;
  let gainRemaining = gain;

  for (const bracket of brackets) {
    if (gainRemaining <= 0) break;

    const ordinaryInBracket = Math.max(
      0,
      Math.min(ordinaryIncome, bracket.max) - bracket.min
    );
    const bracketSize = bracket.max - bracket.min - ordinaryInBracket;

    if (totalIncome > bracket.min) {
      const taxableInBracket = Math.min(gainRemaining, bracketSize);
      tax += taxableInBracket * bracket.rate;
      gainRemaining -= taxableInBracket;
    }
  }

  return tax;
}

function calculateAMTBase(
  regularIncome: number,
  isoSpread: number,
  existingPreference: number,
  filingStatus: string
) {
  const exemption = AMT_EXEMPTION[filingStatus as keyof typeof AMT_EXEMPTION];
  const phaseoutStart =
    AMT_PHASEOUT_START[filingStatus as keyof typeof AMT_PHASEOUT_START];

  const amtIncome = regularIncome + isoSpread + existingPreference;

  let adjustedExemption = exemption;
  if (amtIncome > phaseoutStart) {
    const phaseout = (amtIncome - phaseoutStart) * 0.25;
    adjustedExemption = Math.max(0, exemption - phaseout);
  }

  const amtBase = Math.max(0, amtIncome - adjustedExemption);

  let tentativeMinimumTax = 0;
  if (amtBase <= AMT_RATE_THRESHOLD) {
    tentativeMinimumTax = amtBase * 0.26;
  } else {
    tentativeMinimumTax =
      AMT_RATE_THRESHOLD * 0.26 + (amtBase - AMT_RATE_THRESHOLD) * 0.28;
  }

  const regularTax = calculateFederalTax(regularIncome, filingStatus);
  const amtOwed = Math.max(0, tentativeMinimumTax - regularTax);

  return { regularTax, tentativeMinimumTax, amtOwed };
}

function calculateAMT(
  regularIncome: number,
  isoSpread: number,
  existingPreference: number,
  filingStatus: string
): AMTAnalysis {
  const { regularTax, tentativeMinimumTax, amtOwed } = calculateAMTBase(
    regularIncome,
    isoSpread,
    existingPreference,
    filingStatus
  );

  let breakEvenSpread = 0;
  if (amtOwed === 0) {
    let low = 0;
    let high = 10000000;
    while (high - low > 100) {
      const mid = (low + high) / 2;
      const testAMT = calculateAMTBase(
        regularIncome,
        mid,
        existingPreference,
        filingStatus
      );
      if (testAMT.amtOwed > 0) {
        high = mid;
      } else {
        low = mid;
      }
    }
    breakEvenSpread = high;
  }

  return {
    regularTax,
    tentativeMinimumTax,
    amtOwed,
    isInAMT: amtOwed > 0,
    amtCreditGenerated: amtOwed,
    effectiveAMTRate: isoSpread > 0 ? amtOwed / isoSpread : 0,
    breakEvenSpread,
  };
}

function calculateScenario(
  inputs: CalculatorInputs,
  strategy: "exercise_and_hold" | "exercise_and_sell" | "cashless"
): ScenarioComparison {
  const { option, tax, scenario } = inputs;
  const { optionsToExercise } = scenario;

  const bargainElement =
    (option.currentFMV - option.strikePrice) * optionsToExercise;
  const cashRequired = option.strikePrice * optionsToExercise;
  const intrinsicValue = option.currentFMV * optionsToExercise;

  const exerciseCost: ExerciseCost = {
    cashRequired: 0,
    isoAMTLiability: 0,
    nsoOrdinaryIncome: 0,
    nsoFederalTax: 0,
    nsoStateTax: 0,
    nsoFICATax: 0,
    totalOutOfPocket: 0,
  };

  const stateRate = STATE_TAX_RATES[tax.stateCode] || 0;

  if (option.optionType === "iso") {
    if (strategy === "exercise_and_hold") {
      exerciseCost.cashRequired = cashRequired;
      const amtAnalysis = calculateAMT(
        tax.annualIncome,
        bargainElement,
        tax.existingAMTPreference,
        tax.filingStatus
      );
      exerciseCost.isoAMTLiability = amtAnalysis.amtOwed;
      exerciseCost.totalOutOfPocket = cashRequired + amtAnalysis.amtOwed;
    } else {
      exerciseCost.nsoOrdinaryIncome = bargainElement;
      const marginalRate = getMarginalRate(
        tax.annualIncome + bargainElement,
        tax.filingStatus
      );
      exerciseCost.nsoFederalTax = bargainElement * marginalRate;
      exerciseCost.nsoStateTax = bargainElement * stateRate;
      exerciseCost.totalOutOfPocket = strategy === "cashless" ? 0 : cashRequired;
    }
  } else {
    exerciseCost.nsoOrdinaryIncome = bargainElement;
    const marginalRate = getMarginalRate(
      tax.annualIncome + bargainElement,
      tax.filingStatus
    );
    exerciseCost.nsoFederalTax = bargainElement * marginalRate;
    exerciseCost.nsoStateTax = bargainElement * stateRate;

    const ssIncome = Math.min(tax.annualIncome, SS_WAGE_BASE_2024);
    const remainingSS = Math.max(0, SS_WAGE_BASE_2024 - ssIncome);
    const ssOnSpread = Math.min(bargainElement, remainingSS) * SS_TAX_RATE;
    const medicareOnSpread = bargainElement * MEDICARE_TAX_RATE;
    const additionalMedicareThreshold =
      ADDITIONAL_MEDICARE_THRESHOLD[tax.filingStatus as keyof typeof ADDITIONAL_MEDICARE_THRESHOLD];
    // Additional Medicare Tax applies to wages over threshold (0.9%)
    const wagesOverThreshold = Math.max(0, tax.annualIncome + bargainElement - additionalMedicareThreshold);
    const additionalMedicare = Math.min(bargainElement, wagesOverThreshold) * ADDITIONAL_MEDICARE_RATE;
    exerciseCost.nsoFICATax = ssOnSpread + medicareOnSpread + additionalMedicare;

    exerciseCost.cashRequired = strategy === "cashless" ? 0 : cashRequired;
    exerciseCost.totalOutOfPocket =
      exerciseCost.cashRequired +
      exerciseCost.nsoFederalTax +
      exerciseCost.nsoStateTax +
      exerciseCost.nsoFICATax;
  }

  let saleAnalysis: SaleAnalysis;

  if (strategy === "exercise_and_hold") {
    const saleProceeds = scenario.expectedFMVAtSale * optionsToExercise;
    const totalGain = saleProceeds - cashRequired;

    const grantDate = new Date(option.grantDate);
    const exerciseDate = new Date(scenario.exerciseDate);
    const saleDate = new Date(exerciseDate);
    saleDate.setMonth(saleDate.getMonth() + scenario.holdingPeriod);

    const twoYearsFromGrant = new Date(grantDate);
    twoYearsFromGrant.setFullYear(twoYearsFromGrant.getFullYear() + 2);

    const oneYearFromExercise = new Date(exerciseDate);
    oneYearFromExercise.setFullYear(oneYearFromExercise.getFullYear() + 1);

    const qualifiesForLTCG =
      option.optionType === "nso"
        ? scenario.holdingPeriod >= 12
        : saleDate >= twoYearsFromGrant && saleDate >= oneYearFromExercise;

    const capitalGainType: "short_term" | "long_term" | "ordinary" =
      qualifiesForLTCG ? "long_term" : "short_term";

    const costBasis = option.optionType === "iso" ? cashRequired : intrinsicValue;
    const capitalGain = saleProceeds - costBasis;

    let federalTaxOnSale = 0;
    let stateTaxOnSale = 0;
    let niitTax = 0;

    if (capitalGainType === "long_term") {
      federalTaxOnSale = calculateLTCGTax(
        capitalGain,
        tax.annualIncome,
        tax.filingStatus
      );
    } else {
      federalTaxOnSale =
        capitalGain * getMarginalRate(tax.annualIncome + capitalGain, tax.filingStatus);
    }

    stateTaxOnSale = capitalGain * stateRate;

    const niitThreshold =
      NIIT_THRESHOLD[tax.filingStatus as keyof typeof NIIT_THRESHOLD];
    if (tax.annualIncome + capitalGain > niitThreshold) {
      const niitableIncome = Math.min(
        capitalGain,
        tax.annualIncome + capitalGain - niitThreshold
      );
      niitTax = niitableIncome * 0.038;
    }

    saleAnalysis = {
      saleProceeds,
      totalGain,
      qualifiesForLTCG,
      capitalGainType,
      federalTaxOnSale,
      stateTaxOnSale,
      niitTax,
      netProceeds: saleProceeds - federalTaxOnSale - stateTaxOnSale - niitTax,
    };
  } else {
    saleAnalysis = {
      saleProceeds: intrinsicValue,
      totalGain: bargainElement,
      qualifiesForLTCG: false,
      capitalGainType: option.optionType === "iso" ? "ordinary" : "short_term",
      federalTaxOnSale: 0,
      stateTaxOnSale: 0,
      niitTax: 0,
      netProceeds:
        intrinsicValue -
        exerciseCost.nsoFederalTax -
        exerciseCost.nsoStateTax -
        exerciseCost.nsoFICATax -
        exerciseCost.cashRequired,
    };
  }

  const totalTaxPaid =
    exerciseCost.isoAMTLiability +
    exerciseCost.nsoFederalTax +
    exerciseCost.nsoStateTax +
    exerciseCost.nsoFICATax +
    saleAnalysis.federalTaxOnSale +
    saleAnalysis.stateTaxOnSale +
    saleAnalysis.niitTax;

  // For exercise_and_hold, netProceeds doesn't include exercise cost, so subtract it
  // For exercise_and_sell and cashless, netProceeds already includes the cash cost
  const netProfit =
    strategy === "exercise_and_hold"
      ? saleAnalysis.netProceeds - exerciseCost.cashRequired
      : saleAnalysis.netProceeds;

  const effectiveTaxRate = bargainElement > 0 ? totalTaxPaid / bargainElement : 0;

  const cashFlowTimeline: ScenarioComparison["cashFlowTimeline"] = [];
  const exerciseDateStr = new Date(scenario.exerciseDate).toLocaleDateString();

  if (strategy === "exercise_and_hold") {
    cashFlowTimeline.push({
      date: exerciseDateStr,
      event: "Exercise options",
      amount: -exerciseCost.cashRequired,
      cumulative: -exerciseCost.cashRequired,
    });

    if (exerciseCost.isoAMTLiability > 0) {
      cashFlowTimeline.push({
        date: "April (Tax Day)",
        event: "AMT payment",
        amount: -exerciseCost.isoAMTLiability,
        cumulative: -exerciseCost.cashRequired - exerciseCost.isoAMTLiability,
      });
    }

    const saleDate = new Date(scenario.exerciseDate);
    saleDate.setMonth(saleDate.getMonth() + scenario.holdingPeriod);

    cashFlowTimeline.push({
      date: saleDate.toLocaleDateString(),
      event: "Sell shares",
      amount: saleAnalysis.saleProceeds,
      cumulative:
        saleAnalysis.netProceeds -
        exerciseCost.cashRequired -
        exerciseCost.isoAMTLiability,
    });
  } else {
    cashFlowTimeline.push({
      date: exerciseDateStr,
      event: strategy === "cashless" ? "Cashless exercise" : "Exercise + sell",
      amount: saleAnalysis.netProceeds,
      cumulative: saleAnalysis.netProceeds,
    });
  }

  return {
    strategy,
    exerciseCost,
    saleAnalysis,
    totalTaxPaid,
    netProfit,
    effectiveTaxRate,
    cashFlowTimeline,
  };
}

export function calculate(inputs: CalculatorInputs): CalculatorResults {
  const { option, tax, scenario } = inputs;

  const bargainElement =
    (option.currentFMV - option.strikePrice) * scenario.optionsToExercise;
  const exerciseCost = option.strikePrice * scenario.optionsToExercise;
  const intrinsicValue = option.currentFMV * scenario.optionsToExercise;

  const exerciseAndHold = calculateScenario(inputs, "exercise_and_hold");
  const exerciseAndSell = calculateScenario(inputs, "exercise_and_sell");
  const cashlessExercise = calculateScenario(inputs, "cashless");

  let amtAnalysis: AMTAnalysis | null = null;
  if (option.optionType === "iso") {
    amtAnalysis = calculateAMT(
      tax.annualIncome,
      bargainElement,
      tax.existingAMTPreference,
      tax.filingStatus
    );
  }

  let qualifyingDispositionDate: Date | null = null;
  let daysUntilQualifying: number | null = null;

  if (option.optionType === "iso") {
    const grantDate = new Date(option.grantDate);
    const exerciseDate = new Date(scenario.exerciseDate);

    const twoYearsFromGrant = new Date(grantDate);
    twoYearsFromGrant.setFullYear(twoYearsFromGrant.getFullYear() + 2);

    const oneYearFromExercise = new Date(exerciseDate);
    oneYearFromExercise.setFullYear(oneYearFromExercise.getFullYear() + 1);

    qualifyingDispositionDate =
      twoYearsFromGrant > oneYearFromExercise
        ? twoYearsFromGrant
        : oneYearFromExercise;

    const today = new Date();
    daysUntilQualifying = Math.max(
      0,
      Math.ceil(
        (qualifyingDispositionDate.getTime() - today.getTime()) /
          (1000 * 60 * 60 * 24)
      )
    );
  }

  const recommendations: string[] = [];
  const warnings: string[] = [];

  const strategies = [
    {
      strategy: "exercise_and_hold" as const,
      profit: exerciseAndHold.netProfit,
      taxRate: exerciseAndHold.effectiveTaxRate,
    },
    {
      strategy: "exercise_and_sell" as const,
      profit: exerciseAndSell.netProfit,
      taxRate: exerciseAndSell.effectiveTaxRate,
    },
    {
      strategy: "cashless" as const,
      profit: cashlessExercise.netProfit,
      taxRate: cashlessExercise.effectiveTaxRate,
    },
  ];

  const bestStrategy = strategies.reduce((best, current) =>
    current.profit > best.profit ? current : best
  );

  const recommendedStrategy: "exercise_and_hold" | "exercise_and_sell" | "cashless" =
    bestStrategy.strategy;

  if (option.optionType === "iso") {
    if (amtAnalysis && amtAnalysis.isInAMT) {
      warnings.push(
        `This exercise will trigger $${amtAnalysis.amtOwed.toLocaleString()} in AMT. You'll get an AMT credit to use in future years.`
      );
    }

    if (exerciseAndHold.exerciseCost.totalOutOfPocket > tax.annualIncome * 0.2) {
      warnings.push(
        `Exercise cost (${((exerciseAndHold.exerciseCost.totalOutOfPocket / tax.annualIncome) * 100).toFixed(0)}% of income) is significant. Ensure you have liquidity.`
      );
    }

    if (qualifyingDispositionDate && daysUntilQualifying && daysUntilQualifying > 0) {
      recommendations.push(
        `Hold until ${qualifyingDispositionDate.toLocaleDateString()} (${daysUntilQualifying} days) for long-term capital gains treatment.`
      );
    }

    if (amtAnalysis && !amtAnalysis.isInAMT && amtAnalysis.breakEvenSpread > 0) {
      recommendations.push(
        `You can exercise up to $${amtAnalysis.breakEvenSpread.toLocaleString()} in spread before triggering AMT.`
      );
    }
  } else {
    recommendations.push(
      "NSO spread is taxed as ordinary income at exercise. Consider timing exercise in a lower-income year."
    );

    if (exerciseAndHold.saleAnalysis.qualifiesForLTCG) {
      const ltcgSavings =
        exerciseAndSell.totalTaxPaid - exerciseAndHold.totalTaxPaid;
      if (ltcgSavings > 0) {
        recommendations.push(
          `Holding for ${scenario.holdingPeriod} months saves $${ltcgSavings.toLocaleString()} via LTCG rates.`
        );
      }
    }
  }

  if (intrinsicValue > tax.annualIncome * 0.5) {
    warnings.push(
      "This represents significant concentration in one stock. Consider diversification after exercise."
    );
  }

  return {
    exerciseAndHold,
    exerciseAndSell,
    cashlessExercise,
    amtAnalysis,
    bargainElement,
    exerciseCost,
    intrinsicValue,
    qualifyingDispositionDate,
    daysUntilQualifying,
    recommendedStrategy,
    recommendations,
    warnings,
  };
}
