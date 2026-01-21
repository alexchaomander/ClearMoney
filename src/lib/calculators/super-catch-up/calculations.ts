import type { CalculatorInputs, SuperCatchUpResults, YearProjection } from "./types";
import {
  ESTIMATED_MARGINAL_TAX_RATE,
  LIMITS_2026,
  MAX_PROJECTION_YEARS,
  REGULAR_CATCH_UP_AGE,
  SUPER_CATCH_UP_AGES,
} from "./constants";

function isEligibleForSuperCatchUp(age: number): boolean {
  return age >= 60 && age <= 63;
}

function getCatchUpLimit(age: number, mode: "super" | "regular" | "none"): number {
  if (mode === "none") {
    return 0;
  }
  if (age < REGULAR_CATCH_UP_AGE) {
    return 0;
  }
  if (mode === "super" && isEligibleForSuperCatchUp(age)) {
    return LIMITS_2026.superCatchUp;
  }
  return LIMITS_2026.regularCatchUp;
}

function mustUseRothForCatchUp(priorYearWages: number): boolean {
  return priorYearWages > LIMITS_2026.rothCatchUpThreshold;
}

function getAgeFromBirthDate(birthDate: string, currentYear: number): number | null {
  if (!birthDate) {
    return null;
  }
  const parsed = new Date(birthDate);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return currentYear - parsed.getFullYear();
}

function buildProjection(
  inputs: CalculatorInputs,
  mode: "super" | "regular" | "none",
  effectiveAge: number
): YearProjection[] {
  const projections: YearProjection[] = [];
  let balance = inputs.currentBalance;
  const currentYear = new Date().getFullYear();
  const totalYears = Math.min(
    inputs.retirementAge - effectiveAge + 1,
    MAX_PROJECTION_YEARS
  );

  for (let i = 0; i < totalYears; i += 1) {
    const year = currentYear + i;
    const age = effectiveAge + i;
    if (age > inputs.retirementAge) {
      break;
    }

    const catchUpLimit = getCatchUpLimit(age, mode);
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
      isSuperCatchUpYear: mode === "super" && isEligibleForSuperCatchUp(age),
      mustUseRoth: age >= REGULAR_CATCH_UP_AGE && mustUseRothForCatchUp(inputs.priorYearWages),
    });
  }

  return projections;
}

function calculateValueOfSuperCatchUp(
  inputs: CalculatorInputs,
  effectiveAge: number
): SuperCatchUpResults["valueOfSuperCatchUp"] {
  const extraPerYear = LIMITS_2026.superCatchUp - LIMITS_2026.regularCatchUp;
  const superCatchUpYears = SUPER_CATCH_UP_AGES.filter(
    (age) => age >= effectiveAge && age <= inputs.retirementAge
  ).length;
  const extraContributions = extraPerYear * superCatchUpYears;

  if (extraContributions <= 0) {
    return {
      extraContributionsOver4Years: 0,
      extraGrowthByRetirement: 0,
      totalExtraWealth: 0,
      monthlyRetirementIncomeIncrease: 0,
    };
  }

  const avgYearsToGrow = Math.max(0, inputs.retirementAge - 61.5);
  const extraGrowth =
    extraContributions *
    (Math.pow(1 + inputs.expectedReturn / 100, avgYearsToGrow) - 1);
  const totalExtraWealth = extraContributions + extraGrowth;
  const monthlyRetirementIncomeIncrease = (totalExtraWealth * 0.04) / 12;

  return {
    extraContributionsOver4Years: extraContributions,
    extraGrowthByRetirement: extraGrowth,
    totalExtraWealth,
    monthlyRetirementIncomeIncrease,
  };
}

export function calculate(inputs: CalculatorInputs): SuperCatchUpResults {
  const currentYear = new Date().getFullYear();
  const ageFromBirthDate = getAgeFromBirthDate(inputs.birthDate, currentYear);
  const effectiveAge = ageFromBirthDate ?? inputs.currentAge;

  const currentlyEligible = isEligibleForSuperCatchUp(effectiveAge);
  const yearsUntilEligible = effectiveAge < 60 ? 60 - effectiveAge : 0;
  const superCatchUpYears = SUPER_CATCH_UP_AGES.filter(
    (age) => age >= effectiveAge && age <= inputs.retirementAge
  );
  const missedYears = SUPER_CATCH_UP_AGES.filter((age) => age < effectiveAge);

  const superCatchUpProjection = buildProjection(inputs, "super", effectiveAge);
  const regularCatchUpProjection = buildProjection(inputs, "regular", effectiveAge);
  const noCatchUpProjection = buildProjection(inputs, "none", effectiveAge);

  const fourYearPlan = superCatchUpProjection.filter((projection) =>
    SUPER_CATCH_UP_AGES.includes(projection.age)
  );

  const valueOfSuperCatchUp = calculateValueOfSuperCatchUp(inputs, effectiveAge);

  const balanceWithSuper =
    superCatchUpProjection[superCatchUpProjection.length - 1]?.yearEndBalance ??
    inputs.currentBalance;
  const balanceWithRegular =
    regularCatchUpProjection[regularCatchUpProjection.length - 1]?.yearEndBalance ??
    inputs.currentBalance;
  const balanceWithNone =
    noCatchUpProjection[noCatchUpProjection.length - 1]?.yearEndBalance ??
    inputs.currentBalance;

  const rothRequired = mustUseRothForCatchUp(inputs.priorYearWages);
  const currentCatchUpLimit = getCatchUpLimit(effectiveAge, "super");

  const rothReason = rothRequired
    ? "Prior-year W-2 wages exceed $150,000, so catch-up contributions must be Roth starting in 2026."
    : "You can still choose Roth or Traditional catch-up contributions.";

  const cashFlowProjection = superCatchUpProjection[0];
  const monthlyEmployeeMax = cashFlowProjection
    ? cashFlowProjection.totalLimit / 12
    : 0;

  const recommendations: string[] = [];

  if (currentlyEligible) {
    recommendations.push(
      "You are in the super catch-up window now—prioritize maxing the enhanced limit each year."
    );
  } else if (yearsUntilEligible > 0) {
    recommendations.push(
      `You have ${yearsUntilEligible} year${yearsUntilEligible === 1 ? "" : "s"} until the super catch-up window opens—plan now for the jump.`
    );
  } else if (effectiveAge > 63) {
    recommendations.push(
      "The super catch-up window has passed, but regular catch-up contributions still apply after age 50."
    );
  }

  if (inputs.contributionRate < 10) {
    recommendations.push(
      "Consider increasing your contribution rate to take full advantage of the 401(k) limits."
    );
  }

  if (inputs.employerMatchPercent > 0) {
    recommendations.push(
      "Contribute at least enough to capture the full employer match—it's free money for retirement."
    );
  }

  if (rothRequired) {
    recommendations.push(
      "Budget for Roth catch-up contributions since high earners lose the tax deduction on catch-up dollars."
    );
  }

  return {
    eligibility: {
      currentlyEligible,
      yearsUntilEligible,
      superCatchUpYears,
      missedYears,
      effectiveAge,
    },
    fourYearPlan,
    projections: {
      superCatchUp: superCatchUpProjection,
      regularCatchUp: regularCatchUpProjection,
      noCatchUp: noCatchUpProjection,
    },
    valueOfSuperCatchUp,
    comparison: {
      withSuperCatchUp: {
        balanceAtRetirement: balanceWithSuper,
        monthlyIncome4Percent: (balanceWithSuper * 0.04) / 12,
      },
      withRegularCatchUp: {
        balanceAtRetirement: balanceWithRegular,
        monthlyIncome4Percent: (balanceWithRegular * 0.04) / 12,
      },
      withNoCatchUp: {
        balanceAtRetirement: balanceWithNone,
        monthlyIncome4Percent: (balanceWithNone * 0.04) / 12,
      },
    },
    rothRequirement: {
      required: rothRequired,
      reason: rothReason,
      // Tax impact is the lost deduction: catch-up limit * marginal tax rate
      taxImpact: rothRequired ? currentCatchUpLimit * ESTIMATED_MARGINAL_TAX_RATE : 0,
    },
    cashFlow: {
      monthlyEmployeeMax,
      employerMatchPerYear: cashFlowProjection?.employerMatch ?? 0,
    },
    recommendations,
  };
}
