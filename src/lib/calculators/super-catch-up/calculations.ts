import { ESTIMATED_MARGINAL_TAX_RATE, LIMITS_2026, SUPER_CATCH_UP_AGES } from "./constants";
import type {
  CalculatorInputs,
  CalculatorResults,
  ComparisonResult,
  EligibilityResults,
  YearProjection,
} from "./types";

function isEligibleForSuperCatchUp(age: number): boolean {
  return age >= 60 && age <= 63;
}

function getCatchUpLimit(age: number): number {
  if (age < 50) return 0;
  if (isEligibleForSuperCatchUp(age)) {
    return LIMITS_2026.superCatchUp;
  }
  return LIMITS_2026.regularCatchUp;
}

function mustUseRothForCatchUp(priorYearWages: number): boolean {
  return priorYearWages > LIMITS_2026.rothCatchUpThreshold;
}

function calculateFourYearPlan(inputs: CalculatorInputs): YearProjection[] {
  const projections: YearProjection[] = [];
  let balance = inputs.currentBalance;
  const currentYear = new Date().getFullYear();

  for (let i = 0; i < 10; i += 1) {
    const year = currentYear + i;
    const age = inputs.currentAge + i;

    if (age > inputs.retirementAge) break;

    const isSuperCatchUpYear = isEligibleForSuperCatchUp(age);
    const catchUpLimit = getCatchUpLimit(age);
    const totalLimit = LIMITS_2026.base401k + catchUpLimit;

    const salaryContribution = inputs.annualSalary * (inputs.contributionRate / 100);
    const yourContribution = Math.min(salaryContribution, totalLimit);

    const matchableContribution = Math.min(
      inputs.annualSalary * (inputs.employerMatchCap / 100),
      yourContribution
    );
    const employerMatch = matchableContribution * (inputs.employerMatchPercent / 100);

    const totalContribution = yourContribution + employerMatch;
    balance = balance * (1 + inputs.expectedReturn / 100) + totalContribution;

    projections.push({
      year,
      age,
      baseLimit: LIMITS_2026.base401k,
      catchUpLimit,
      totalLimit,
      yourContribution,
      employerMatch,
      totalContribution,
      yearEndBalance: balance,
      isSuperCatchUpYear,
      mustUseRoth: mustUseRothForCatchUp(inputs.priorYearWages),
    });
  }

  return projections;
}

function calculateEligibility(inputs: CalculatorInputs): EligibilityResults {
  const currentlyEligible = isEligibleForSuperCatchUp(inputs.currentAge);
  const yearsUntilEligible = inputs.currentAge < 60 ? 60 - inputs.currentAge : 0;
  const superCatchUpYears = SUPER_CATCH_UP_AGES.filter(
    (age) => age >= inputs.currentAge && age <= inputs.retirementAge
  );
  const missedYears = SUPER_CATCH_UP_AGES.filter(
    (age) => age < inputs.currentAge && age <= inputs.retirementAge
  );

  return {
    currentlyEligible,
    yearsUntilEligible,
    superCatchUpYears,
    missedYears,
  };
}

function calculateValueOfSuperCatchUp(inputs: CalculatorInputs): CalculatorResults["valueOfSuperCatchUp"] {
  const extraPerYear = LIMITS_2026.superCatchUp - LIMITS_2026.regularCatchUp;
  const eligibleYearCount = SUPER_CATCH_UP_AGES.filter(
    (age) => age >= inputs.currentAge && age <= inputs.retirementAge
  ).length;

  const extraContributions = extraPerYear * eligibleYearCount;
  const avgYearsToGrow = Math.max(0, inputs.retirementAge - 61.5);
  const growthFactor = Math.pow(1 + inputs.expectedReturn / 100, avgYearsToGrow) - 1;
  const extraGrowth = extraContributions * growthFactor;
  const totalExtraWealth = extraContributions + extraGrowth;
  const monthlyIncomeIncrease = (totalExtraWealth * 0.04) / 12;

  return {
    extraContributionsOver4Years: extraContributions,
    extraGrowthByRetirement: extraGrowth,
    totalExtraWealth,
    monthlyRetirementIncomeIncrease: monthlyIncomeIncrease,
  };
}

function calculateBalanceScenario(
  inputs: CalculatorInputs,
  getLimit: (age: number) => number
): ComparisonResult {
  let balance = inputs.currentBalance;

  for (let age = inputs.currentAge; age <= inputs.retirementAge; age += 1) {
    const catchUpLimit = getLimit(age);
    const totalLimit = LIMITS_2026.base401k + catchUpLimit;
    const salaryContribution = inputs.annualSalary * (inputs.contributionRate / 100);
    const yourContribution = Math.min(salaryContribution, totalLimit);

    const matchableContribution = Math.min(
      inputs.annualSalary * (inputs.employerMatchCap / 100),
      yourContribution
    );
    const employerMatch = matchableContribution * (inputs.employerMatchPercent / 100);
    const totalContribution = yourContribution + employerMatch;

    balance = balance * (1 + inputs.expectedReturn / 100) + totalContribution;
  }

  return {
    balanceAtRetirement: balance,
    monthlyIncome4Percent: (balance * 0.04) / 12,
  };
}

function buildRecommendations(inputs: CalculatorInputs, eligibility: EligibilityResults): string[] {
  const recommendations: string[] = [];
  const currentCatchUp = getCatchUpLimit(inputs.currentAge);
  const totalLimit = LIMITS_2026.base401k + currentCatchUp;
  const currentContribution = inputs.annualSalary * (inputs.contributionRate / 100);
  const neededRate = (totalLimit / inputs.annualSalary) * 100;

  if (!eligibility.currentlyEligible && inputs.currentAge < 60) {
    recommendations.push(
      `You become eligible for super catch-up in ${eligibility.yearsUntilEligible} year${
        eligibility.yearsUntilEligible === 1 ? "" : "s"
      }. Plan now so you can max the higher limit right away.`
    );
  }

  if (eligibility.superCatchUpYears.length > 0) {
    recommendations.push(
      `You have ${eligibility.superCatchUpYears.length} super catch-up year${
        eligibility.superCatchUpYears.length === 1 ? "" : "s"
      } remaining. Prioritize these years for maximum retirement impact.`
    );
  }

  if (currentContribution < totalLimit && neededRate <= 100) {
    recommendations.push(
      `Increase your contribution rate to about ${neededRate.toFixed(1)}% to hit the full limit of $${totalLimit.toLocaleString()}.`
    );
  }

  if (inputs.employerMatchPercent > 0 && inputs.contributionRate < inputs.employerMatchCap) {
    recommendations.push(
      `Contribute at least ${inputs.employerMatchCap}% to capture your full employer match.`
    );
  }

  if (mustUseRothForCatchUp(inputs.priorYearWages)) {
    recommendations.push(
      "Catch-up contributions must be Roth at your income level, so plan for the after-tax cash flow impact."
    );
  }

  if (inputs.retirementAge < 64 && inputs.currentAge <= 63) {
    recommendations.push(
      "Consider delaying retirement past age 63 if possible to capture all remaining super catch-up years."
    );
  }

  return recommendations;
}

export function calculate(inputs: CalculatorInputs): CalculatorResults {
  const eligibility = calculateEligibility(inputs);
  const fourYearPlan = calculateFourYearPlan(inputs);
  const valueOfSuperCatchUp = calculateValueOfSuperCatchUp(inputs);
  const comparison = {
    withSuperCatchUp: calculateBalanceScenario(inputs, getCatchUpLimit),
    withRegularCatchUp: calculateBalanceScenario(inputs, (age) =>
      age >= 50 ? LIMITS_2026.regularCatchUp : 0
    ),
    withNoCatchUp: calculateBalanceScenario(inputs, () => 0),
  };

  const rothRequired = mustUseRothForCatchUp(inputs.priorYearWages);
  const catchUpLimit = getCatchUpLimit(inputs.currentAge);
  const rothRequirement = {
    required: rothRequired,
    reason: rothRequired
      ? "Prior-year W-2 wages above $150,000 require Roth catch-up contributions starting in 2026."
      : "Catch-up contributions can still be pre-tax at your current income level.",
    taxImpact: rothRequired ? catchUpLimit * ESTIMATED_MARGINAL_TAX_RATE : 0,
  };

  return {
    eligibility,
    fourYearPlan,
    valueOfSuperCatchUp,
    comparison,
    rothRequirement,
    recommendations: buildRecommendations(inputs, eligibility),
  };
}
