import type {
  BreakEvenAnalysis,
  CalculatorInputs,
  CalculatorResults,
  ContributionScheduleItem,
  LongTermComparison,
  TaxImpactSummary,
} from "./types";
import {
  ALTERNATIVE_STRATEGIES,
  LIMITS_2026,
  MAX_CATCH_UP_YEARS,
  THRESHOLD_MARGIN,
} from "./constants";

const toDecimal = (rate: number): number => rate / 100;

function isSubjectToMandatoryRoth(priorYearW2Wages: number): boolean {
  return priorYearW2Wages > LIMITS_2026.catchUpThreshold;
}

function getCatchUpAmount(age: number): { amount: number; isSuperCatchUp: boolean } {
  if (age < 50) {
    return { amount: 0, isSuperCatchUp: false };
  }
  if (age >= 60 && age <= 63) {
    return { amount: LIMITS_2026.superCatchUp, isSuperCatchUp: true };
  }
  return { amount: LIMITS_2026.regularCatchUp, isSuperCatchUp: false };
}

function calculateTaxImpact(
  catchUpAmount: number,
  currentMarginalRate: number,
  stateTaxRate: number
): TaxImpactSummary {
  const totalCurrentRate = toDecimal(currentMarginalRate + stateTaxRate);
  const rothCatchUpTaxCost = catchUpAmount * totalCurrentRate;
  const traditionalTaxSavings = catchUpAmount * totalCurrentRate;

  return {
    rothCatchUpTaxCost,
    traditionalTaxSavings,
    netImmediateCost: rothCatchUpTaxCost,
  };
}

function compareLongTerm(
  inputs: CalculatorInputs,
  catchUpAmount: number
): LongTermComparison {
  const {
    yearsUntilRetirement,
    expectedReturn,
    currentMarginalRate,
    retirementTaxRate,
    stateTaxRate,
  } = inputs;

  const totalCurrentRate = toDecimal(currentMarginalRate + stateTaxRate);
  const totalRetirementRate = toDecimal(retirementTaxRate + stateTaxRate);
  const yearsOfCatchUp = Math.min(yearsUntilRetirement, MAX_CATCH_UP_YEARS);

  const rothContributions = catchUpAmount * yearsOfCatchUp;
  const rothTaxPaid = rothContributions * totalCurrentRate;

  let rothFutureValue = 0;
  for (let year = 0; year < yearsOfCatchUp; year += 1) {
    const yearsToGrow = yearsUntilRetirement - year;
    rothFutureValue +=
      catchUpAmount * Math.pow(1 + expectedReturn / 100, yearsToGrow);
  }

  const traditionalContributions = catchUpAmount * yearsOfCatchUp;
  const traditionalTaxSavings = traditionalContributions * totalCurrentRate;

  let traditionalFutureValue = 0;
  for (let year = 0; year < yearsOfCatchUp; year += 1) {
    const yearsToGrow = yearsUntilRetirement - year;
    traditionalFutureValue +=
      catchUpAmount * Math.pow(1 + expectedReturn / 100, yearsToGrow);
  }
  const traditionalTaxAtWithdrawal = traditionalFutureValue * totalRetirementRate;

  return {
    rothPath: {
      totalContributions: rothContributions,
      taxPaidUpfront: rothTaxPaid,
      projectedValue: rothFutureValue,
      taxAtWithdrawal: 0,
      netRetirementValue: rothFutureValue,
    },
    traditionalPath: {
      totalContributions: traditionalContributions,
      taxSavingsNow: traditionalTaxSavings,
      projectedValue: traditionalFutureValue,
      taxAtWithdrawal: traditionalTaxAtWithdrawal,
      netRetirementValue: traditionalFutureValue - traditionalTaxAtWithdrawal,
    },
    rothAdvantage:
      rothFutureValue - (traditionalFutureValue - traditionalTaxAtWithdrawal),
  };
}

function calculateBreakEven(
  currentRate: number,
  yearsUntilRetirement: number
): BreakEvenAnalysis {
  return {
    breakEvenTaxRate: currentRate,
    breakEvenYears: yearsUntilRetirement,
    explanation:
      currentRate / 100 > 0.3
        ? "With a high current tax rate, Traditional would normally be attractive, but the rule forces Roth above $150k."
        : "Roth tends to win if your retirement tax rate ends up higher than your current rate.",
  };
}

function buildContributionSchedule(
  inputs: CalculatorInputs,
  catchUpAmount: number,
  yearsOfCatchUp: number
): ContributionScheduleItem[] {
  const schedule: ContributionScheduleItem[] = [];
  for (let year = 0; year < yearsOfCatchUp; year += 1) {
    const yearsToGrow = inputs.yearsUntilRetirement - year;
    schedule.push({
      year: year + 1,
      age: inputs.currentAge + year,
      contribution: catchUpAmount,
      projectedValue:
        catchUpAmount * Math.pow(1 + inputs.expectedReturn / 100, yearsToGrow),
    });
  }
  return schedule;
}

export function calculate(inputs: CalculatorInputs): CalculatorResults {
  const subjectToMandatoryRoth = isSubjectToMandatoryRoth(
    inputs.priorYearW2Wages
  );
  const { amount: baseCatchUpAmount, isSuperCatchUp } = getCatchUpAmount(
    inputs.currentAge
  );
  const eligibleForCatchUp = baseCatchUpAmount > 0;
  const canMakeCatchUp =
    eligibleForCatchUp && (!subjectToMandatoryRoth || inputs.employerOffersRoth);
  const appliedCatchUpAmount = canMakeCatchUp ? baseCatchUpAmount : 0;
  const yearsOfCatchUp = appliedCatchUpAmount
    ? Math.min(inputs.yearsUntilRetirement, MAX_CATCH_UP_YEARS)
    : 0;

  const taxImpact = calculateTaxImpact(
    appliedCatchUpAmount,
    inputs.currentMarginalRate,
    inputs.stateTaxRate
  );

  const longTermComparison = compareLongTerm(inputs, appliedCatchUpAmount);

  const breakEvenAnalysis = calculateBreakEven(
    inputs.currentMarginalRate + inputs.stateTaxRate,
    inputs.yearsUntilRetirement
  );

  const projectedCurrentBalance =
    inputs.currentBalance *
    Math.pow(1 + inputs.expectedReturn / 100, inputs.yearsUntilRetirement);

  const contributionSchedule = buildContributionSchedule(
    inputs,
    appliedCatchUpAmount,
    yearsOfCatchUp
  );

  const recommendations: string[] = [];
  if (!eligibleForCatchUp) {
    recommendations.push("Catch-up contributions start at age 50.");
  }
  if (subjectToMandatoryRoth) {
    recommendations.push(
      "Expect catch-up dollars to be Roth-only starting in 2026 based on prior-year wages."
    );
  }
  if (subjectToMandatoryRoth && !inputs.employerOffersRoth) {
    recommendations.push(
      "Your plan must add a Roth option, or catch-up contributions will be prohibited."
    );
  }
  if (!subjectToMandatoryRoth) {
    recommendations.push(
      "You still have a choice between Roth and Traditional catch-up contributions."
    );
  }
  if (isSuperCatchUp) {
    recommendations.push(
      "Ages 60-63 qualify for the $11,250 super catch-up limit in 2026."
    );
  }
  if (
    inputs.priorYearW2Wages > LIMITS_2026.catchUpThreshold &&
    inputs.priorYearW2Wages <= LIMITS_2026.catchUpThreshold + THRESHOLD_MARGIN
  ) {
    recommendations.push(
      "You are just above the $150k threshold. Consider timing bonuses to stay under it."
    );
  }
  if (inputs.retirementTaxRate > inputs.currentMarginalRate) {
    recommendations.push(
      "Higher expected retirement tax rates make Roth contributions more attractive long-term."
    );
  }

  return {
    subjectToMandatoryRoth,
    catchUpAmount: baseCatchUpAmount,
    isSuperCatchUp,
    eligibleForCatchUp,
    yearsOfCatchUp,
    taxImpact,
    longTermComparison,
    breakEvenAnalysis,
    planReadiness: {
      employerReady: inputs.employerOffersRoth,
      canMakeCatchUp,
      alternativeStrategies: canMakeCatchUp
        ? subjectToMandatoryRoth
          ? []
          : ALTERNATIVE_STRATEGIES.underThreshold
        : ALTERNATIVE_STRATEGIES.noRothOption,
    },
    recommendations,
    projectedCurrentBalance,
    contributionSchedule,
  };
}
