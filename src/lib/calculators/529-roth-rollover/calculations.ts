import {
  ACCOUNT_AGE_REQUIREMENT_YEARS,
  DAYS_PER_YEAR,
  DEFAULT_TAX_RATE,
  IRA_CATCHUP_CONTRIBUTION_2026,
  IRA_CONTRIBUTION_LIMIT_2026,
  LIFETIME_529_TO_ROTH_LIMIT,
  MAX_SCHEDULE_YEARS,
  NON_QUALIFIED_PENALTY_RATE,
} from "./constants";
import type {
  AlternativeComparison,
  CalculatorInputs,
  CalculatorResults,
  CurrentYearMax,
  EligibilityDetails,
  ProjectedBenefit,
  RolloverScheduleItem,
} from "./types";

const MS_PER_YEAR = DAYS_PER_YEAR * 24 * 60 * 60 * 1000;

function getAnnualLimit(beneficiaryAge: number): number {
  return beneficiaryAge >= 50
    ? IRA_CONTRIBUTION_LIMIT_2026 + IRA_CATCHUP_CONTRIBUTION_2026
    : IRA_CONTRIBUTION_LIMIT_2026;
}

function getSeasonedAmount(inputs: CalculatorInputs): number {
  return Math.min(inputs.contributionsMade5YearsAgo, inputs.accountBalance);
}

export function checkEligibility(inputs: CalculatorInputs): EligibilityDetails {
  const today = new Date();
  const accountAgeMs = today.getTime() - inputs.accountOpenDate.getTime();
  const accountAgeYears = accountAgeMs / MS_PER_YEAR;
  const meetsAccountAgeRequirement =
    accountAgeYears >= ACCOUNT_AGE_REQUIREMENT_YEARS;
  const yearsUntilEligible = meetsAccountAgeRequirement
    ? 0
    : Math.ceil(ACCOUNT_AGE_REQUIREMENT_YEARS - accountAgeYears);

  const seasonedAmount = getSeasonedAmount(inputs);

  return {
    meetsAccountAgeRequirement,
    accountAgeYears: Math.max(0, Math.floor(accountAgeYears)),
    yearsUntilEligible: Math.max(0, yearsUntilEligible),
    hasSeasonedContributions: seasonedAmount > 0,
    seasonedAmount,
    hasEarnedIncome: inputs.earnedIncome > 0,
  };
}

export function calculateMaxRollover(inputs: CalculatorInputs): CurrentYearMax {
  const annualLimit = getAnnualLimit(inputs.beneficiaryAge);
  const reducedByOtherContributions = Math.max(
    0,
    annualLimit - inputs.otherIRAContributions
  );
  const limitedByEarnedIncome = Math.min(
    reducedByOtherContributions,
    inputs.earnedIncome
  );
  const seasonedAmount = getSeasonedAmount(inputs);
  const limitedBySeasonedContributions = Math.min(
    limitedByEarnedIncome,
    seasonedAmount
  );
  const lifetimeRemaining = Math.max(
    0,
    LIFETIME_529_TO_ROTH_LIMIT - inputs.priorRollovers
  );
  const limitedByLifetimeRemaining = Math.min(
    limitedBySeasonedContributions,
    lifetimeRemaining
  );

  return {
    annualIRALimit: annualLimit,
    reducedByOtherContributions,
    limitedByEarnedIncome,
    limitedBySeasonedContributions,
    limitedByLifetimeRemaining,
    maxRolloverThisYear: limitedByLifetimeRemaining,
  };
}

export function generateRolloverSchedule(
  inputs: CalculatorInputs
): RolloverScheduleItem[] {
  const schedule: RolloverScheduleItem[] = [];
  const annualLimit = getAnnualLimit(inputs.beneficiaryAge);
  const currentYear = new Date().getFullYear();

  let cumulativeRolled = Math.min(
    inputs.priorRollovers,
    LIFETIME_529_TO_ROTH_LIMIT
  );
  let remainingSeasonedFunds = getSeasonedAmount(inputs);
  let remainingBalance = inputs.accountBalance;

  for (
    let yearOffset = 0;
    yearOffset < MAX_SCHEDULE_YEARS &&
    cumulativeRolled < LIFETIME_529_TO_ROTH_LIMIT;
    yearOffset += 1
  ) {
    const yearLimit = Math.min(
      annualLimit,
      remainingSeasonedFunds,
      LIFETIME_529_TO_ROTH_LIMIT - cumulativeRolled,
      remainingBalance
    );

    if (yearLimit <= 0) break;

    cumulativeRolled += yearLimit;
    remainingSeasonedFunds -= yearLimit;
    remainingBalance -= yearLimit;

    schedule.push({
      year: currentYear + yearOffset,
      amount: yearLimit,
      cumulativeRolled,
      remainingLifetimeLimit: LIFETIME_529_TO_ROTH_LIMIT - cumulativeRolled,
    });

    remainingSeasonedFunds = Math.min(
      remainingSeasonedFunds + annualLimit,
      remainingBalance
    );
  }

  return schedule;
}

export function projectGrowth(
  totalRolled: number,
  yearsOfGrowth: number,
  expectedReturn: number
): ProjectedBenefit {
  const projectedValue =
    totalRolled * Math.pow(1 + expectedReturn / 100, yearsOfGrowth);
  const taxFreeGrowth = projectedValue - totalRolled;

  return {
    totalRolled,
    yearsOfGrowth,
    projectedValue,
    taxFreeGrowth,
  };
}

function calculateAlternativeComparison(
  inputs: CalculatorInputs,
  projectedValue: number
): AlternativeComparison {
  // For non-qualified withdrawals, only EARNINGS are taxed and penalized.
  // We estimate basis as accountBalance minus estimated earnings.
  // Since we don't have exact total contributions, we use seasoned contributions
  // as a proxy. In practice, total contributions >= seasoned contributions,
  // so this may slightly overestimate taxes/penalties.
  const estimatedBasis = Math.min(
    inputs.contributionsMade5YearsAgo,
    inputs.accountBalance
  );
  const estimatedEarnings = Math.max(0, inputs.accountBalance - estimatedBasis);
  const taxPaid = estimatedEarnings * DEFAULT_TAX_RATE;
  const penalty = estimatedEarnings * NON_QUALIFIED_PENALTY_RATE;
  const nonQualifiedNet = inputs.accountBalance - taxPaid - penalty;
  const keepValue =
    inputs.accountBalance *
    Math.pow(1 + inputs.expectedReturn / 100, inputs.yearsUntilRetirement);

  return {
    rolloverStrategy: {
      netValue: projectedValue,
      taxPaid: 0,
    },
    nonQualifiedWithdrawal: {
      netValue: Math.max(0, nonQualifiedNet),
      taxPaid,
      penalty,
    },
    keepFor529Expenses: {
      value: keepValue,
      notes: "Assumes future qualified education expenses with tax-free growth.",
    },
  };
}

export function calculate(inputs: CalculatorInputs): CalculatorResults {
  const eligibility = checkEligibility(inputs);
  const currentYearMax = calculateMaxRollover(inputs);
  const eligibleThisYear =
    eligibility.meetsAccountAgeRequirement &&
    eligibility.hasSeasonedContributions &&
    eligibility.hasEarnedIncome;

  const rolloverSchedule = eligibleThisYear
    ? generateRolloverSchedule(inputs)
    : [];

  const totalRolled = rolloverSchedule.reduce(
    (total, item) => total + item.amount,
    0
  );
  const projectedBenefit = projectGrowth(
    totalRolled,
    inputs.yearsUntilRetirement,
    inputs.expectedReturn
  );

  const alternativeComparison = calculateAlternativeComparison(
    inputs,
    projectedBenefit.projectedValue
  );

  return {
    eligibility,
    currentYearMax: {
      ...currentYearMax,
      maxRolloverThisYear: eligibleThisYear
        ? currentYearMax.maxRolloverThisYear
        : 0,
    },
    rolloverSchedule,
    projectedBenefit,
    alternativeComparison,
  };
}
