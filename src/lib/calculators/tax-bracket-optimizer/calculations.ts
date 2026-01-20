import type {
  CalculatorInputs,
  CalculatorResults,
  TaxBracket,
  BracketVisualization,
  ThresholdAnalysis,
  OptimizationOpportunity,
  CapitalGainsAnalysis,
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
} as const;

const CAPITAL_GAINS_BRACKETS = {
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
} as const;

const STANDARD_DEDUCTION = {
  single: 14600,
  married: 29200,
  head_of_household: 21900,
} as const;

const NIIT_THRESHOLD = {
  single: 200000,
  married: 250000,
  head_of_household: 200000,
} as const;

const IRMAA_THRESHOLDS = {
  single: [103000, 129000, 161000, 193000, 500000],
  married: [206000, 258000, 322000, 386000, 750000],
  head_of_household: [103000, 129000, 161000, 193000, 500000],
} as const;

const IRMAA_MONTHLY_SURCHARGE = [0, 69.9, 174.7, 279.5, 384.3, 419.3];

function calculateBracketVisualization(
  income: number,
  brackets: { min: number; max: number; rate: number }[]
): BracketVisualization {
  const result: TaxBracket[] = [];
  let cumulativeTax = 0;
  let marginalRate = 0;

  for (const bracket of brackets) {
    const bracketSize = bracket.max === Infinity ? Infinity : bracket.max - bracket.min;
    const taxInBracket =
      bracket.max === Infinity ? 0 : bracketSize * bracket.rate;

    const yourIncomeInBracket = Math.max(
      0,
      Math.min(income - bracket.min, bracket.max - bracket.min)
    );
    const yourTaxInBracket = yourIncomeInBracket * bracket.rate;

    result.push({
      min: bracket.min,
      max: bracket.max,
      rate: bracket.rate,
      taxInBracket,
      cumulativeTax,
      yourIncomeInBracket,
      yourTaxInBracket,
    });

    cumulativeTax += taxInBracket;

    if (income > bracket.min && income <= bracket.max) {
      marginalRate = bracket.rate;
    } else if (income > bracket.max) {
      marginalRate = bracket.rate;
    }
  }

  let roomInCurrentBracket = 0;
  let nextBracketStarts = 0;

  for (const bracket of brackets) {
    if (income >= bracket.min && income < bracket.max) {
      roomInCurrentBracket = bracket.max - income;
      nextBracketStarts = bracket.max;
      break;
    }
  }

  const totalTax = result.reduce((sum, b) => sum + b.yourTaxInBracket, 0);
  const effectiveRate = income > 0 ? totalTax / income : 0;

  return {
    brackets: result,
    yourPosition: income,
    marginalRate,
    effectiveRate,
    roomInCurrentBracket,
    nextBracketStarts,
  };
}

function calculateCapitalGainsAnalysis(
  ordinaryTaxableIncome: number,
  ltcg: number,
  qualifiedDividends: number,
  filingStatus: CalculatorInputs["filingStatus"],
  magi: number
): CapitalGainsAnalysis {
  const qualifiedIncome = ltcg + qualifiedDividends;
  const brackets = CAPITAL_GAINS_BRACKETS[filingStatus];

  let capitalGainsTax = 0;
  let remainingGains = qualifiedIncome;
  let currentPosition = ordinaryTaxableIncome;

  for (const bracket of brackets) {
    if (remainingGains <= 0) break;

    const bracketStart = Math.max(bracket.min, currentPosition);
    const bracketEnd = bracket.max;

    if (currentPosition < bracketEnd) {
      const gainsInBracket = Math.min(
        remainingGains,
        bracketEnd - bracketStart
      );
      capitalGainsTax += gainsInBracket * bracket.rate;
      remainingGains -= gainsInBracket;
      currentPosition += gainsInBracket;
    }
  }

  let capitalGainsRate = 0;
  const totalIncome = ordinaryTaxableIncome + qualifiedIncome;
  for (const bracket of brackets) {
    if (totalIncome > bracket.min) {
      capitalGainsRate = bracket.rate;
    }
  }

  const niitThreshold = NIIT_THRESHOLD[filingStatus];
  const niitApplies = magi > niitThreshold;
  const niitAmount = niitApplies
    ? Math.min(qualifiedIncome, magi - niitThreshold) * 0.038
    : 0;

  return {
    qualifiedIncome,
    ordinaryIncome: ordinaryTaxableIncome,
    capitalGainsRate,
    capitalGainsTax,
    niitApplies,
    niitAmount,
  };
}

function analyzeThresholds(
  magi: number,
  filingStatus: CalculatorInputs["filingStatus"]
): ThresholdAnalysis[] {
  const thresholds: ThresholdAnalysis[] = [];

  const niitThreshold = NIIT_THRESHOLD[filingStatus];
  thresholds.push({
    threshold: "Net Investment Income Tax (3.8%)",
    amount: niitThreshold,
    yourDistance: niitThreshold - magi,
    impact: "3.8% additional tax on investment income",
    isOver: magi > niitThreshold,
  });

  const irmaaThresholds = IRMAA_THRESHOLDS[filingStatus];
  irmaaThresholds.forEach((threshold, index) => {
    if (index === 0 || magi > irmaaThresholds[index - 1] * 0.9) {
      thresholds.push({
        threshold: `Medicare IRMAA Tier ${index + 1}`,
        amount: threshold,
        yourDistance: threshold - magi,
        impact: `+$${IRMAA_MONTHLY_SURCHARGE[index + 1]}/month Medicare premium`,
        isOver: magi > threshold,
      });
    }
  });

  const brackets = FEDERAL_BRACKETS[filingStatus];
  const importantBrackets = brackets.filter((bracket) => bracket.rate >= 0.32);

  importantBrackets.forEach((bracket) => {
    if (bracket.min < Infinity) {
      thresholds.push({
        threshold: `${(bracket.rate * 100).toFixed(0)}% Tax Bracket`,
        amount: bracket.min,
        yourDistance: bracket.min - magi,
        impact: `Marginal rate increases to ${(bracket.rate * 100).toFixed(0)}%`,
        isOver: magi > bracket.min,
      });
    }
  });

  return thresholds.sort((a, b) => a.amount - b.amount);
}

function identifyOpportunities(
  inputs: CalculatorInputs,
  results: Partial<CalculatorResults>
): OptimizationOpportunity[] {
  const opportunities: OptimizationOpportunity[] = [];
  const { filingStatus, income, deductions } = inputs;

  if (results.ordinaryBrackets && results.ordinaryBrackets.roomInCurrentBracket > 10000) {
    const room = results.ordinaryBrackets.roomInCurrentBracket;
    const rate = results.ordinaryBrackets.marginalRate;
    const nextRate =
      FEDERAL_BRACKETS[filingStatus].find((bracket) => bracket.rate > rate)
        ?.rate || rate;

    if (nextRate > rate) {
      opportunities.push({
        strategy: "Roth Conversion",
        description: `Convert up to $${room.toLocaleString()} from Traditional to Roth IRA at ${(rate * 100).toFixed(0)}% instead of potentially ${(nextRate * 100).toFixed(0)}% later.`,
        potentialSavings: room * (nextRate - rate),
        action: "Consider Roth conversion before year-end",
      });
    }
  }

  const capGainsBrackets = CAPITAL_GAINS_BRACKETS[filingStatus];
  const zeroRateBracket = capGainsBrackets[0];
  if (results.ordinaryBrackets && results.ordinaryBrackets.yourPosition < zeroRateBracket.max) {
    const roomAtZero = zeroRateBracket.max - results.ordinaryBrackets.yourPosition;
    if (roomAtZero > 0 && income.longTermCapitalGains === 0) {
      opportunities.push({
        strategy: "Tax Gain Harvesting",
        description: `You can realize up to $${roomAtZero.toLocaleString()} in long-term capital gains at 0% federal tax rate.`,
        potentialSavings: roomAtZero * 0.15,
        action: "Consider selling appreciated assets to reset cost basis",
      });
    }
  }

  const hsaLimit = filingStatus === "single" ? 4150 : 8300;
  if (deductions.hsaContribution < hsaLimit) {
    const additionalHSA = hsaLimit - deductions.hsaContribution;
    const marginalRate = results.marginalOrdinaryRate || 0.24;
    opportunities.push({
      strategy: "HSA Maximization",
      description: `Contribute $${additionalHSA.toLocaleString()} more to HSA. Triple tax advantage: deduction now, tax-free growth, tax-free medical withdrawals.`,
      potentialSavings: additionalHSA * marginalRate,
      action: "Increase HSA contributions before year-end",
    });
  }

  if (deductions.charitableGiving > 0 && deductions.charitableGiving < 10000) {
    opportunities.push({
      strategy: "Charitable Bunching",
      description:
        "Your charitable giving is below the threshold to itemize. Consider \"bunching\" 2-3 years of giving into one year via a Donor-Advised Fund.",
      potentialSavings:
        deductions.charitableGiving * (results.marginalOrdinaryRate || 0.24),
      action: "Research Donor-Advised Funds (DAFs)",
    });
  }

  const niitThreshold = NIIT_THRESHOLD[filingStatus];
  const distanceToNIIT = niitThreshold - (results.adjustedGrossIncome || 0);
  if (distanceToNIIT > 0 && distanceToNIIT < 20000) {
    opportunities.push({
      strategy: "Stay Below NIIT Threshold",
      description: `You're $${distanceToNIIT.toLocaleString()} below the ${(niitThreshold / 1000).toFixed(0)}K NIIT threshold. Crossing it adds 3.8% tax on investment income.`,
      potentialSavings: income.longTermCapitalGains * 0.038,
      action: "Consider deferring income or increasing deductions",
    });
  }

  return opportunities;
}

function calculateTaxSummary(inputs: CalculatorInputs) {
  const { filingStatus, income, deductions, scenario } = inputs;

  const ordinaryIncome =
    income.wagesIncome +
    income.selfEmploymentIncome +
    income.shortTermCapitalGains +
    income.ordinaryDividends +
    income.interestIncome +
    income.rentalIncome +
    income.otherOrdinaryIncome +
    scenario.rothConversionAmount +
    scenario.additionalIncome;

  const qualifiedIncome =
    income.longTermCapitalGains + income.qualifiedDividends;

  const grossIncome = ordinaryIncome + qualifiedIncome;

  const aboveLineDeductions =
    deductions.retirement401k +
    deductions.traditionalIRA +
    deductions.hsaContribution +
    (income.selfEmploymentIncome > 0 ? income.selfEmploymentIncome * 0.0765 : 0);

  const adjustedGrossIncome = grossIncome - aboveLineDeductions;

  const saltCap = 10000;
  const itemizedDeductions =
    Math.min(deductions.stateLocalTaxes, saltCap) +
    deductions.mortgageInterest +
    deductions.charitableGiving +
    deductions.otherItemized +
    scenario.additionalDeduction;

  const standardDeduction = STANDARD_DEDUCTION[filingStatus];
  const actualDeduction =
    deductions.deductionType === "standard"
      ? standardDeduction
      : Math.max(itemizedDeductions, standardDeduction);

  const taxableOrdinaryIncome = Math.max(
    0,
    ordinaryIncome - aboveLineDeductions - actualDeduction
  );
  const taxableIncome = taxableOrdinaryIncome + qualifiedIncome;

  const ordinaryBrackets = calculateBracketVisualization(
    taxableOrdinaryIncome,
    FEDERAL_BRACKETS[filingStatus]
  );
  const ordinaryIncomeTax = ordinaryBrackets.brackets.reduce(
    (sum, bracket) => sum + bracket.yourTaxInBracket,
    0
  );

  const capitalGainsAnalysis = calculateCapitalGainsAnalysis(
    taxableOrdinaryIncome,
    income.longTermCapitalGains,
    income.qualifiedDividends,
    filingStatus,
    adjustedGrossIncome
  );

  const capitalGainsBrackets = calculateBracketVisualization(
    taxableOrdinaryIncome + qualifiedIncome,
    CAPITAL_GAINS_BRACKETS[filingStatus]
  );

  const seNetEarnings = income.selfEmploymentIncome * 0.9235;
  const ssTax = Math.min(seNetEarnings, 168600) * 0.124;
  const medicareTax = seNetEarnings * 0.029;
  const additionalMedicareTax = Math.max(0, seNetEarnings - 200000) * 0.009;
  const selfEmploymentTax =
    income.selfEmploymentIncome > 0
      ? ssTax + medicareTax + additionalMedicareTax
      : 0;

  const totalFederalTax =
    ordinaryIncomeTax +
    capitalGainsAnalysis.capitalGainsTax +
    capitalGainsAnalysis.niitAmount +
    selfEmploymentTax;

  const effectiveRate = grossIncome > 0 ? totalFederalTax / grossIncome : 0;

  const thresholds = analyzeThresholds(adjustedGrossIncome, filingStatus);

  return {
    grossIncome,
    adjustedGrossIncome,
    taxableIncome,
    ordinaryIncomeTax,
    capitalGainsTax: capitalGainsAnalysis.capitalGainsTax,
    niitTax: capitalGainsAnalysis.niitAmount,
    selfEmploymentTax,
    totalFederalTax,
    marginalOrdinaryRate: ordinaryBrackets.marginalRate,
    marginalCapGainsRate:
      capitalGainsAnalysis.capitalGainsRate +
      (capitalGainsAnalysis.niitApplies ? 0.038 : 0),
    effectiveRate,
    ordinaryBrackets,
    capitalGainsBrackets,
    capitalGainsAnalysis,
    thresholds,
  };
}

export function calculate(inputs: CalculatorInputs): CalculatorResults {
  const baselineInputs = {
    ...inputs,
    scenario: {
      rothConversionAmount: 0,
      additionalIncome: 0,
      additionalDeduction: 0,
    },
  };

  const baselineResults = calculateTaxSummary(baselineInputs);
  const modifiedResults = calculateTaxSummary(inputs);

  const results: CalculatorResults = {
    ...modifiedResults,
    opportunities: [],
    baselineScenario: {
      taxableIncome: baselineResults.taxableIncome,
      totalTax: baselineResults.totalFederalTax,
      effectiveRate:
        baselineResults.taxableIncome > 0
          ? baselineResults.totalFederalTax / baselineResults.taxableIncome
          : 0,
    },
    modifiedScenario: {
      taxableIncome: modifiedResults.taxableIncome,
      totalTax: modifiedResults.totalFederalTax,
      effectiveRate: modifiedResults.effectiveRate,
      difference: modifiedResults.totalFederalTax - baselineResults.totalFederalTax,
    },
  };

  results.opportunities = identifyOpportunities(inputs, results);

  return results;
}
