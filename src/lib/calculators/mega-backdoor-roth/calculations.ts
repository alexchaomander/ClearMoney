import type {
  CalculatorInputs,
  CalculatorResults,
  EligibilityResult,
  ContributionSpace,
  ProjectedGrowth,
  ComparisonAnalysis,
} from "./types";

// 2024 IRS Limits
const TOTAL_401K_LIMIT = 69000;
const TOTAL_401K_LIMIT_50_PLUS = 76500;
const EMPLOYEE_LIMIT = 23000;
const EMPLOYEE_LIMIT_50_PLUS = 30500;
const CATCH_UP_LIMIT = 7500;
const CATCH_UP_AGE = 50;

// Tax assumptions for comparison
const CAPITAL_GAINS_RATE = 0.15;
const DIVIDEND_RATE = 0.15;
const DIVIDEND_YIELD = 0.02; // 2% average dividend yield

function checkEligibility(plan: CalculatorInputs["plan"]): EligibilityResult {
  const missingRequirements: string[] = [];

  if (!plan.allowsAfterTax) {
    missingRequirements.push(
      "Plan must allow after-tax (non-Roth) contributions"
    );
  }

  if (!plan.allowsInPlanConversion && !plan.allowsInServiceDistribution) {
    missingRequirements.push(
      "Plan must allow either in-plan Roth conversion OR in-service distribution to IRA"
    );
  }

  const canDoMegaBackdoor = missingRequirements.length === 0;

  let conversionMethod: EligibilityResult["conversionMethod"] = "none";
  if (canDoMegaBackdoor) {
    if (plan.allowsInPlanConversion && plan.allowsInServiceDistribution) {
      conversionMethod = "both";
    } else if (plan.allowsInPlanConversion) {
      conversionMethod = "in_plan";
    } else if (plan.allowsInServiceDistribution) {
      conversionMethod = "distribution";
    }
  }

  // Grade the plan
  let planGrade: EligibilityResult["planGrade"];
  if (canDoMegaBackdoor && conversionMethod === "both") {
    planGrade = "A";
  } else if (canDoMegaBackdoor) {
    planGrade = "B";
  } else if (plan.allowsAfterTax) {
    planGrade = "C"; // Has after-tax but no conversion option
  } else {
    planGrade = "F";
  }

  return {
    canDoMegaBackdoor,
    missingRequirements,
    conversionMethod,
    planGrade,
  };
}

function calculateContributionSpace(
  inputs: CalculatorInputs
): ContributionSpace {
  const { age, plan } = inputs;

  const isCatchUpEligible = age >= CATCH_UP_AGE;

  const totalLimit = isCatchUpEligible
    ? TOTAL_401K_LIMIT_50_PLUS
    : TOTAL_401K_LIMIT;
  const employeeLimit = isCatchUpEligible
    ? EMPLOYEE_LIMIT_50_PLUS
    : EMPLOYEE_LIMIT;
  const catchUpLimit = isCatchUpEligible ? CATCH_UP_LIMIT : 0;

  const usedSpace = plan.employeeContribution + plan.employerMatch;
  const irsMaxAvailable = Math.max(0, totalLimit - usedSpace);

  // Plan may have its own after-tax limit
  const planMaxAvailable =
    plan.afterTaxContributionLimit > 0
      ? plan.afterTaxContributionLimit
      : irsMaxAvailable;

  const megaBackdoorSpace = Math.min(irsMaxAvailable, planMaxAvailable);

  return {
    totalLimit,
    employeeLimit,
    catchUpLimit,
    employeeContribution: plan.employeeContribution,
    employerMatch: plan.employerMatch,
    usedSpace,
    irsMaxAvailable,
    planMaxAvailable,
    megaBackdoorSpace,
  };
}

function calculateProjectedGrowth(
  annualContribution: number,
  currentBalance: number,
  years: number,
  expectedReturn: number
): ProjectedGrowth[] {
  const projections: ProjectedGrowth[] = [];
  let balance = currentBalance;
  let cumulativeContributions = 0;

  for (let year = 1; year <= years; year++) {
    cumulativeContributions += annualContribution;
    balance = (balance + annualContribution) * (1 + expectedReturn / 100);

    // Tax-free savings = what you'd pay in a taxable account
    const growthThisYear = balance - cumulativeContributions - currentBalance;
    const taxOnGrowth = growthThisYear * CAPITAL_GAINS_RATE;
    const dividendTax = balance * DIVIDEND_YIELD * DIVIDEND_RATE * year;

    projections.push({
      year,
      contribution: annualContribution,
      cumulativeContributions,
      balance: Math.round(balance),
      taxFreeSavings: Math.round(taxOnGrowth + dividendTax),
    });
  }

  return projections;
}

function calculateComparison(
  megaBackdoorAmount: number,
  years: number,
  expectedReturn: number
): ComparisonAnalysis {
  const rate = expectedReturn / 100;

  // With mega backdoor (tax-free growth)
  let rothBalance = 0;
  for (let i = 0; i < years; i++) {
    rothBalance = (rothBalance + megaBackdoorAmount) * (1 + rate);
  }

  // Without mega backdoor (taxable account)
  let taxableBalance = 0;
  let taxesPaid = 0;
  for (let i = 0; i < years; i++) {
    taxableBalance = (taxableBalance + megaBackdoorAmount) * (1 + rate);
    // Pay dividend taxes annually
    const dividendTax = taxableBalance * DIVIDEND_YIELD * DIVIDEND_RATE;
    taxesPaid += dividendTax;
    taxableBalance -= dividendTax;
  }

  // Pay capital gains at the end
  const totalContributions = megaBackdoorAmount * years;
  const capitalGain = taxableBalance - totalContributions;
  const capitalGainsTax = capitalGain * CAPITAL_GAINS_RATE;
  taxesPaid += capitalGainsTax;
  const afterTaxBalance = taxableBalance - capitalGainsTax;

  return {
    withMegaBackdoor: {
      totalContributions,
      finalBalance: Math.round(rothBalance),
      taxFreeSavings: Math.round(rothBalance - afterTaxBalance),
    },
    withoutMegaBackdoor: {
      totalContributions,
      finalBalance: Math.round(afterTaxBalance),
      taxesPaid: Math.round(taxesPaid),
    },
    advantageAmount: Math.round(rothBalance - afterTaxBalance),
  };
}

export function calculate(inputs: CalculatorInputs): CalculatorResults {
  const eligibility = checkEligibility(inputs.plan);
  const contributionSpace = calculateContributionSpace(inputs);
  const maxMegaBackdoorAmount = eligibility.canDoMegaBackdoor
    ? contributionSpace.megaBackdoorSpace
    : 0;

  const projectedGrowth = calculateProjectedGrowth(
    maxMegaBackdoorAmount,
    inputs.currentRothBalance,
    inputs.yearsUntilRetirement,
    inputs.expectedReturn
  );

  const lastProjection = projectedGrowth[projectedGrowth.length - 1];
  const retirementBalance = lastProjection?.balance || inputs.currentRothBalance;
  const totalContributed = lastProjection?.cumulativeContributions || 0;
  const totalGrowth =
    retirementBalance - totalContributed - inputs.currentRothBalance;
  const taxFreeSavings = lastProjection?.taxFreeSavings || 0;

  const comparison = calculateComparison(
    maxMegaBackdoorAmount,
    Math.min(10, inputs.yearsUntilRetirement),
    inputs.expectedReturn
  );

  // Generate steps
  const steps: CalculatorResults["steps"] = [];

  if (eligibility.canDoMegaBackdoor) {
    steps.push({
      step: 1,
      title: "Verify Your Plan Allows It",
      description:
        "Contact HR or review your Summary Plan Description (SPD) to confirm after-tax contributions and conversion options.",
      timing: "One-time setup",
    });

    steps.push({
      step: 2,
      title: "Set Up After-Tax Contributions",
      description: `Elect to contribute after-tax dollars. Target $${maxMegaBackdoorAmount.toLocaleString()}/year, which is $${Math.round(maxMegaBackdoorAmount / 12).toLocaleString()}/month.`,
      timing: "Update elections",
    });

    if (
      eligibility.conversionMethod === "in_plan" ||
      eligibility.conversionMethod === "both"
    ) {
      steps.push({
        step: 3,
        title: "Convert to Roth 401(k)",
        description:
          "Request in-plan conversion of after-tax funds to Roth 401(k). Some plans do this automatically; others require manual requests.",
        timing: "After each contribution or periodically",
      });
    }

    if (
      eligibility.conversionMethod === "distribution" ||
      eligibility.conversionMethod === "both"
    ) {
      steps.push({
        step: eligibility.conversionMethod === "both" ? 4 : 3,
        title: "Alternatively: Roll to Roth IRA",
        description:
          "Request an in-service distribution of after-tax funds to your Roth IRA. This moves money out of your employer's plan.",
        timing: "Periodically (quarterly is common)",
      });
    }

    steps.push({
      step: steps.length + 1,
      title: "Convert Quickly to Minimize Gains",
      description:
        "Convert soon after contributing. Any gains between contribution and conversion are taxable.",
      timing: "Ongoing",
    });
  } else {
    steps.push({
      step: 1,
      title: "Check Your Plan Features",
      description:
        "Your current plan doesn't support mega backdoor Roth. Ask HR if they can add these features.",
    });

    steps.push({
      step: 2,
      title: "Use Regular Backdoor Roth Instead",
      description:
        "You can still contribute $7,000/year via the regular backdoor Roth IRA strategy.",
    });
  }

  // Recommendations and warnings
  const recommendations: string[] = [];
  const warnings: string[] = [];

  if (eligibility.canDoMegaBackdoor) {
    recommendations.push(
      `You can contribute up to $${maxMegaBackdoorAmount.toLocaleString()}/year via mega backdoor Roth.`
    );

    if (eligibility.conversionMethod === "in_plan") {
      recommendations.push(
        "In-plan conversion keeps money in your 401(k) with potentially better funds/fees than an IRA."
      );
    } else if (eligibility.conversionMethod === "distribution") {
      recommendations.push(
        "Rollover to Roth IRA gives you more investment options and flexibility."
      );
    } else if (eligibility.conversionMethod === "both") {
      recommendations.push(
        "You have both options—in-plan conversion is simpler; IRA rollover offers more flexibility."
      );
    }

    if (comparison.advantageAmount > 100000) {
      recommendations.push(
        `Over 10 years, mega backdoor Roth could provide $${comparison.advantageAmount.toLocaleString()} in tax-free growth advantage.`
      );
    }
  } else {
    recommendations.push(
      "Consider asking HR to add after-tax contribution and conversion features to your 401(k) plan."
    );
    recommendations.push(
      "In the meantime, maximize backdoor Roth IRA ($7,000/year) and standard 401(k) contributions."
    );
  }

  if (
    inputs.plan.employeeContribution <
    (inputs.age >= 50 ? EMPLOYEE_LIMIT_50_PLUS : EMPLOYEE_LIMIT)
  ) {
    warnings.push(
      "You're not maxing out your standard 401(k) contribution. Consider doing that first before mega backdoor."
    );
  }

  if (maxMegaBackdoorAmount > 0 && maxMegaBackdoorAmount < 10000) {
    warnings.push(
      "Your mega backdoor space is limited due to high employer match. Still valuable, but less impactful."
    );
  }

  if (
    inputs.plan.allowsAfterTax &&
    !inputs.plan.allowsInPlanConversion &&
    !inputs.plan.allowsInServiceDistribution
  ) {
    warnings.push(
      "Warning: Your plan allows after-tax contributions but NO conversion option. Gains will be taxed as ordinary income—this is suboptimal."
    );
  }

  return {
    eligibility,
    contributionSpace,
    maxMegaBackdoorAmount,
    projectedGrowth,
    retirementBalance,
    totalContributed,
    totalGrowth,
    taxFreeSavings,
    comparison,
    steps,
    recommendations,
    warnings,
  };
}
