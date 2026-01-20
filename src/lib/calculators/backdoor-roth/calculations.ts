import type {
  CalculatorInputs,
  CalculatorResults,
  EligibilityResult,
  ProRataResult,
} from "./types";

// 2025 IRS Roth IRA MAGI phase-out limits
const ROTH_LIMITS = {
  single: { phaseOutStart: 150000, phaseOutEnd: 165000 },
  married: { phaseOutStart: 236000, phaseOutEnd: 246000 },
};

// 2025 IRS Traditional IRA deduction phase-out limits (with workplace retirement plan)
const TRADITIONAL_DEDUCTION_LIMITS = {
  single: { phaseOutStart: 79000, phaseOutEnd: 89000 },
  married: { phaseOutStart: 126000, phaseOutEnd: 146000 },
};

const CONTRIBUTION_LIMIT = 7000;
const CATCH_UP_LIMIT = 1000;
const CATCH_UP_AGE = 50;

export function calculate(inputs: CalculatorInputs): CalculatorResults {
  const {
    income,
    filingStatus,
    hasWorkplacePlan,
    traditionalIRABalance,
    sepIRABalance,
    simpleIRABalance,
    contributionAmount,
    age,
  } = inputs;

  const catchUpEligible = age >= CATCH_UP_AGE;
  const contributionLimit =
    CONTRIBUTION_LIMIT + (catchUpEligible ? CATCH_UP_LIMIT : 0);
  const actualContribution = Math.min(contributionAmount, contributionLimit);

  const rothLimits = ROTH_LIMITS[filingStatus];
  const canContributeDirectlyToRoth = income < rothLimits.phaseOutEnd;
  const needsBackdoor = income >= rothLimits.phaseOutStart;

  const tradLimits = TRADITIONAL_DEDUCTION_LIMITS[filingStatus];
  const canDeductTraditionalIRA =
    !hasWorkplacePlan || income < tradLimits.phaseOutStart;

  const eligibility: EligibilityResult = {
    canContributeDirectlyToRoth,
    rothPhaseOutStart: rothLimits.phaseOutStart,
    rothPhaseOutEnd: rothLimits.phaseOutEnd,
    needsBackdoor,
    canDeductTraditionalIRA,
  };

  const totalIRABalance =
    traditionalIRABalance + sepIRABalance + simpleIRABalance;
  const totalAfterContribution = totalIRABalance + actualContribution;

  let taxFreePercentage: number;
  let taxablePercentage: number;

  if (totalAfterContribution === 0) {
    taxFreePercentage = 100;
    taxablePercentage = 0;
  } else {
    taxFreePercentage = (actualContribution / totalAfterContribution) * 100;
    taxablePercentage = 100 - taxFreePercentage;
  }

  const taxFreeAmount = actualContribution * (taxFreePercentage / 100);
  const taxableAmount = actualContribution * (taxablePercentage / 100);
  const hasProRataIssue = totalIRABalance > 0;

  const proRata: ProRataResult = {
    totalIRABalance,
    nonDeductibleContribution: actualContribution,
    totalAfterContribution,
    taxFreePercentage,
    taxablePercentage,
    taxableAmount,
    taxFreeAmount,
    hasProRataIssue,
  };

  let recommendedAction: CalculatorResults["recommendedAction"];
  const steps: CalculatorResults["steps"] = [];
  const warnings: string[] = [];
  const tips: string[] = [];

  if (canContributeDirectlyToRoth && !needsBackdoor) {
    recommendedAction = "direct_roth";
    steps.push({
      step: 1,
      title: "Contribute Directly to Roth IRA",
      description: `Your income ($${income.toLocaleString()}) is below the Roth IRA limit. You can contribute directly—no backdoor needed!`,
    });
    tips.push(
      "Direct Roth is simpler. Only use backdoor if your income increases above the limit."
    );
  } else if (!hasProRataIssue) {
    recommendedAction = "backdoor_clean";
    steps.push(
      {
        step: 1,
        title: "Contribute to Traditional IRA",
        description: `Make a non-deductible contribution of $${actualContribution.toLocaleString()} to a Traditional IRA.`,
      },
      {
        step: 2,
        title: "Wait Briefly (Optional)",
        description:
          "Some people wait a day or two, others convert immediately. There's no required waiting period.",
      },
      {
        step: 3,
        title: "Convert to Roth IRA",
        description:
          "Request a Roth conversion of the entire Traditional IRA balance. Since it's all non-deductible, you'll owe minimal or no tax.",
      },
      {
        step: 4,
        title: "File Form 8606",
        description:
          "At tax time, file Form 8606 to track your non-deductible contribution. This is crucial!",
      }
    );
    tips.push(
      'You have no existing IRA balances—this is a "clean" backdoor Roth. Ideal situation!'
    );
    tips.push(
      "Consider doing this early in the year so your money has more time to grow tax-free."
    );
  } else if (taxablePercentage > 50) {
    recommendedAction = "fix_prorata_first";
    steps.push({
      step: 1,
      title: "Address Pro-Rata Issue First",
      description: `You have $${totalIRABalance.toLocaleString()} in Traditional/SEP/SIMPLE IRAs. This will make ${taxablePercentage.toFixed(0)}% of your conversion taxable.`,
      warning: "The backdoor Roth won't be tax-efficient until you address this.",
    });

    if (hasWorkplacePlan) {
      steps.push({
        step: 2,
        title: "Option A: Roll Into 401(k)",
        description:
          "If your 401(k) accepts rollovers, move your Traditional IRA into it. This removes the balance from pro-rata calculation.",
      });
    }

    steps.push({
      step: 3,
      title: "Option B: Convert Everything",
      description: `Convert your entire $${totalIRABalance.toLocaleString()} Traditional IRA to Roth. You'll pay tax now, but future backdoor conversions will be clean.`,
    });

    warnings.push(
      `Pro-rata rule: ${taxablePercentage.toFixed(0)}% of any conversion will be taxable.`
    );
    warnings.push(
      "Fix this before attempting backdoor Roth, or you'll owe significant taxes."
    );
  } else {
    recommendedAction = "backdoor_with_prorata";
    steps.push(
      {
        step: 1,
        title: "Understand the Tax Impact",
        description: `Due to pro-rata rule, $${taxableAmount.toFixed(0)} of your $${actualContribution.toLocaleString()} conversion will be taxable.`,
        warning:
          "This isn't ideal, but may still be worthwhile for long-term tax-free growth.",
      },
      {
        step: 2,
        title: "Contribute to Traditional IRA",
        description: `Make a non-deductible contribution of $${actualContribution.toLocaleString()}.`,
      },
      {
        step: 3,
        title: "Convert to Roth IRA",
        description:
          "Convert the contribution amount. Be prepared to pay tax on the taxable portion.",
      },
      {
        step: 4,
        title: "Consider Cleaning Up",
        description:
          "For future years, consider rolling your Traditional IRA into a 401(k) to eliminate the pro-rata issue.",
      }
    );

    warnings.push(
      `Pro-rata rule applies: $${taxableAmount.toFixed(0)} will be taxable this year.`
    );
    tips.push(
      "Long-term tax-free growth in Roth may still outweigh the upfront tax cost."
    );
  }

  const estimatedMarginalRate = 0.32;
  const taxImpact = taxableAmount * estimatedMarginalRate;

  return {
    eligibility,
    proRata,
    contributionLimit,
    catchUpEligible,
    recommendedAction,
    steps,
    taxImpact,
    warnings,
    tips,
  };
}
