import type {
  CalculatorInputs,
  CalculatorResults,
  YearlyBreakdown,
  VestingSchedule,
} from "./types";

const VESTING_PERCENTAGES: Record<VestingSchedule, number[]> = {
  standard: [25, 25, 25, 25],
  amazon: [5, 15, 40, 40],
  cliff_monthly: [0, 33.33, 33.33, 33.34],
};

function getVestingPercentages(
  schedule: VestingSchedule,
  years: number
): number[] {
  const base = VESTING_PERCENTAGES[schedule];
  if (years === 4) return base;

  // Handle cliff_monthly schedule: 0% in year 1, remainder distributed evenly
  if (schedule === "cliff_monthly") {
    if (years === 1) {
      // Edge case: 1-year cliff means nothing vests
      return [0];
    }
    const perYearAfterCliff = 100 / (years - 1);
    return [0, ...Array(years - 1).fill(perYearAfterCliff)];
  }

  // Handle amazon schedule: preserve backloaded pattern scaled to period
  if (schedule === "amazon") {
    if (years < 4) {
      // For shorter periods, use heavier backloading
      const weights = base.slice(0, years);
      const totalWeight = weights.reduce((sum, w) => sum + w, 0);
      return weights.map((w) => (w / totalWeight) * 100);
    }
    // For longer periods (5+ years), extend with even distribution after year 2
    const remainingPercent = 80; // 100 - 5 - 15 = 80
    const remainingYears = years - 2;
    const perYear = remainingPercent / remainingYears;
    return [5, 15, ...Array(remainingYears).fill(perYear)];
  }

  // Standard schedule: even distribution
  return Array(years).fill(100 / years);
}

export function calculate(inputs: CalculatorInputs): CalculatorResults {
  const {
    baseSalary,
    targetBonus,
    expectedBonusMultiplier,
    rsuGrant,
    signOnBonus,
    signOnVestingYears,
    match401k,
    match401kLimit,
    esppDiscount,
    esppContribution,
    hsaContribution,
    annualRefresher,
    refresherVestingYears,
  } = inputs;

  const vestingPercentages = getVestingPercentages(
    rsuGrant.vestingSchedule,
    rsuGrant.vestingYears
  );

  const priceMultiplier = rsuGrant.currentPrice / rsuGrant.grantPrice;
  const adjustedRSUValue = rsuGrant.totalValue * priceMultiplier;

  const yearlyBreakdowns: YearlyBreakdown[] = [];
  const years = Math.max(4, rsuGrant.vestingYears);

  for (let year = 1; year <= years; year += 1) {
    const yearIndex = year - 1;

    const vestingPercent =
      yearIndex < vestingPercentages.length
        ? vestingPercentages[yearIndex]
        : 0;
    const rsuValue = (adjustedRSUValue * vestingPercent) / 100;

    const signOnPortion =
      year <= signOnVestingYears ? signOnBonus / signOnVestingYears : 0;

    const bonus =
      baseSalary * (targetBonus / 100) * (expectedBonusMultiplier / 100);

    const matchAmount = Math.min(baseSalary * (match401k / 100), match401kLimit);

    // ESPP benefit calculation: discount / (1 - discount) gives the gain percentage
    // For 15% discount: 0.15 / 0.85 = 17.6% gain
    // Handle edge case where discount is 100% (denominator would be 0)
    const discountFraction = esppDiscount / 100;
    const denominator = 1 - discountFraction;
    const esppBenefit =
      denominator > 0
        ? esppContribution * discountFraction / denominator
        : 0;

    let refresherValue = 0;
    if (year >= 2 && annualRefresher > 0) {
      const refreshersVesting = Math.min(year - 1, refresherVestingYears);
      refresherValue =
        (annualRefresher / refresherVestingYears) * refreshersVesting;
    }

    const totalCompensation =
      baseSalary +
      bonus +
      rsuValue +
      signOnPortion +
      matchAmount +
      esppBenefit +
      hsaContribution +
      refresherValue;

    yearlyBreakdowns.push({
      year,
      baseSalary,
      bonus,
      rsuValue,
      signOnPortion,
      match401k: matchAmount,
      esppBenefit,
      hsaContribution,
      refresherValue,
      totalCompensation,
    });
  }

  const year1Total = yearlyBreakdowns[0]?.totalCompensation || 0;
  const year2Total = yearlyBreakdowns[1]?.totalCompensation || 0;
  const year3Total = yearlyBreakdowns[2]?.totalCompensation || 0;
  const year4Total = yearlyBreakdowns[3]?.totalCompensation || 0;

  const fourYearTotal = yearlyBreakdowns
    .slice(0, 4)
    .reduce((sum, year) => sum + year.totalCompensation, 0);
  const averageAnnual = fourYearTotal / 4;

  const totalBase = baseSalary * 4;
  const totalBonus = yearlyBreakdowns
    .slice(0, 4)
    .reduce((sum, year) => sum + year.bonus, 0);
  const totalRSU = yearlyBreakdowns
    .slice(0, 4)
    .reduce((sum, year) => sum + year.rsuValue, 0);
  const totalSignOn = signOnBonus;
  const totalBenefits = yearlyBreakdowns
    .slice(0, 4)
    .reduce(
      (sum, year) => sum + year.match401k + year.esppBenefit + year.hsaContribution,
      0
    );

  const rsuPercentOfComp = fourYearTotal > 0 ? (totalRSU / fourYearTotal) * 100 : 0;
  const year1VsYear4Difference = year4Total - year1Total;
  const effectiveHourlyRate = averageAnnual / 2080;

  const warnings: string[] = [];

  if (rsuGrant.vestingSchedule === "amazon" && rsuGrant.vestingYears === 4) {
    warnings.push(
      `Amazon-style vesting: Year 1 is only $${Math.round(year1Total).toLocaleString()}, but Year 4 jumps to $${Math.round(year4Total).toLocaleString()}`
    );
  }

  if (rsuPercentOfComp > 40) {
    warnings.push(
      `${rsuPercentOfComp.toFixed(0)}% of your comp is in RSUs—significant stock price risk`
    );
  }

  if (priceMultiplier < 0.8) {
    warnings.push(
      `Stock is down ${((1 - priceMultiplier) * 100).toFixed(0)}% from grant price—your RSU value is reduced`
    );
  }

  if (priceMultiplier > 1.5) {
    warnings.push(
      `Stock is up ${((priceMultiplier - 1) * 100).toFixed(0)}% from grant price—your RSU value increased!`
    );
  }

  return {
    year1Total,
    year2Total,
    year3Total,
    year4Total,
    averageAnnual,
    yearlyBreakdowns,
    totalBase,
    totalBonus,
    totalRSU,
    totalSignOn,
    totalBenefits,
    rsuPercentOfComp,
    year1VsYear4Difference,
    effectiveHourlyRate,
    warnings,
  };
}
