import type {
  CalculatorInputs,
  CalculatorResults,
  EligibilityResult,
  GrowthProjection,
  TaxSavingsAnalysis,
  ComparisonAnalysis,
} from "./types";

// 2025 HSA Limits
const HSA_LIMITS_2025 = {
  individual: 4300,
  family: 8550,
  catchUp: 1000,
  catchUpAge: 55,
  hdhdMinDeductibleIndividual: 1650,
  hdhdMinDeductibleFamily: 3300,
};

/**
 * Get the appropriate long-term capital gains rate based on marginal tax bracket.
 * 0% for 10-12% brackets, 15% for 22-35% brackets, 20% for 37%+ bracket.
 */
function getCapitalGainsRate(marginalTaxRate: number): number {
  if (marginalTaxRate <= 12) return 0;
  if (marginalTaxRate <= 35) return 0.15;
  return 0.20;
}

/**
 * Prorate contribution limit for partial-year HDHP coverage.
 * IRS requires prorating by month (1/12 of annual limit per month).
 */
function prorateContributionLimit(annualLimit: number, monthsOfCoverage: number): number {
  if (monthsOfCoverage >= 12) return annualLimit;
  return Math.round((annualLimit * monthsOfCoverage) / 12);
}

// State income tax rates (simplified)
const STATE_TAX_RATES: Record<string, number> = {
  AL: 0.05,
  AK: 0,
  AZ: 0.025,
  AR: 0.049,
  CA: 0.093,
  CO: 0.044,
  CT: 0.0699,
  DE: 0.066,
  FL: 0,
  GA: 0.0549,
  HI: 0.11,
  IA: 0.057,
  ID: 0.058,
  IL: 0.0495,
  IN: 0.0315,
  KS: 0.057,
  KY: 0.045,
  LA: 0.0425,
  MA: 0.05,
  MD: 0.0575,
  ME: 0.0715,
  MI: 0.0425,
  MN: 0.0985,
  MO: 0.0495,
  MS: 0.05,
  MT: 0.0675,
  NC: 0.045,
  ND: 0.029,
  NE: 0.0684,
  NH: 0,
  NJ: 0.0637,
  NM: 0.059,
  NV: 0,
  NY: 0.0685,
  OH: 0.0399,
  OK: 0.0475,
  OR: 0.099,
  PA: 0.0307,
  RI: 0.0599,
  SC: 0.064,
  SD: 0,
  TN: 0,
  TX: 0,
  UT: 0.0495,
  VA: 0.0575,
  VT: 0.0875,
  WA: 0,
  WI: 0.0765,
  WV: 0.065,
  WY: 0,
  DC: 0.085,
};

// Some states don't give HSA deduction (CA, NJ)
const STATES_NO_HSA_DEDUCTION = ["CA", "NJ"];

function checkEligibility(inputs: CalculatorInputs): EligibilityResult {
  const { eligibility, contribution } = inputs;
  const reasons: string[] = [];
  let isEligible = true;

  if (!eligibility.hasHDHP) {
    isEligible = false;
    reasons.push("HSA requires a High Deductible Health Plan (HDHP).");
  }

  if (eligibility.enrolledInMedicare) {
    isEligible = false;
    reasons.push("Cannot contribute to an HSA while enrolled in Medicare.");
  }

  const baseLimit = HSA_LIMITS_2025[eligibility.coverageType];
  const catchUpAmount =
    eligibility.age >= HSA_LIMITS_2025.catchUpAge ? HSA_LIMITS_2025.catchUp : 0;
  const maxContribution = baseLimit + catchUpAmount;

  // Apply partial-year proration if less than 12 months of coverage
  const monthsOfCoverage = eligibility.monthsOfCoverage ?? 12;
  const proratedMaxContribution = prorateContributionLimit(maxContribution, monthsOfCoverage);

  const totalPlannedContribution =
    contribution.currentContribution + contribution.employerContribution;
  const remainingContributionRoom = Math.max(
    0,
    proratedMaxContribution - totalPlannedContribution
  );

  if (isEligible && monthsOfCoverage < 12) {
    reasons.push(
      `With ${monthsOfCoverage} months of HDHP coverage, your limit is prorated to $${proratedMaxContribution.toLocaleString()}.`
    );
  }

  if (isEligible && remainingContributionRoom > 0) {
    reasons.push(
      `You have $${remainingContributionRoom.toLocaleString()} more contribution room available.`
    );
  }

  return {
    isEligible,
    contributionLimit: baseLimit,
    catchUpAmount,
    maxContribution,
    proratedMaxContribution,
    remainingContributionRoom,
    reasons,
  };
}

function calculateGrowthProjections(
  inputs: CalculatorInputs,
  eligibility: EligibilityResult
): GrowthProjection[] {
  const { contribution, investment, eligibility: eligInputs, medical } = inputs;

  const projections: GrowthProjection[] = [];
  let balance = contribution.currentHSABalance;
  let cumulativeContributions = 0;
  let receiptsPending = 0; // Medical expenses paid out of pocket, receipts saved
  const rate = investment.expectedReturn / 100;

  for (let year = 1; year <= investment.yearsToRetirement; year += 1) {
    const currentAge = eligInputs.age + year;

    // Contribution (stop at 65 due to Medicare)
    let yearContribution = 0;
    let yearEmployerContribution = 0;

    if (currentAge < 65 && eligibility.isEligible) {
      yearContribution = contribution.currentContribution;
      yearEmployerContribution = contribution.employerContribution;
    }

    cumulativeContributions += yearContribution + yearEmployerContribution;

    // Medical expenses (the "hack": pay out of pocket, save receipts)
    const medicalExpenses = medical.annualMedicalExpenses;
    const outOfPocketMedical = medicalExpenses; // Pay out of pocket
    receiptsPending += outOfPocketMedical; // Bank the receipts

    // Growth
    balance = (balance + yearContribution + yearEmployerContribution) * (1 + rate);

    projections.push({
      year,
      age: currentAge,
      contribution: yearContribution,
      employerContribution: yearEmployerContribution,
      medicalExpenses,
      outOfPocketMedical,
      receiptsPending,
      yearEndBalance: Math.round(balance),
      cumulativeContributions,
      cumulativeGrowth: Math.round(
        balance - cumulativeContributions - contribution.currentHSABalance
      ),
    });
  }

  return projections;
}

function calculateTaxSavings(
  inputs: CalculatorInputs,
  eligibility: EligibilityResult
): TaxSavingsAnalysis {
  const { contribution, investment, tax } = inputs;

  const stateRate = STATE_TAX_RATES[tax.stateCode] || 0;
  const getsStateDeduction = !STATES_NO_HSA_DEDUCTION.includes(tax.stateCode);

  const annualContribution = eligibility.isEligible
    ? contribution.currentContribution + contribution.employerContribution
    : 0;

  // Annual tax savings
  const federalTaxSaved = annualContribution * (tax.marginalTaxRate / 100);
  const stateTaxSaved = getsStateDeduction ? annualContribution * stateRate : 0;
  const ficaTaxSaved = annualContribution * 0.0765; // Employee only
  const totalAnnualTaxSaved = federalTaxSaved + stateTaxSaved + ficaTaxSaved;

  // Lifetime projections
  const yearsContributing = Math.max(
    0,
    Math.min(investment.yearsToRetirement, 65 - inputs.eligibility.age)
  );
  const lifetimeContributions = annualContribution * yearsContributing;
  const lifetimeTaxSavingsOnContributions = totalAnnualTaxSaved * yearsContributing;

  // Tax-free growth estimate
  const rate = investment.expectedReturn / 100;
  let futureValue = contribution.currentHSABalance;
  for (let year = 1; year <= yearsContributing; year += 1) {
    futureValue = (futureValue + annualContribution) * (1 + rate);
  }
  const taxFreeGrowth =
    futureValue - contribution.currentHSABalance - lifetimeContributions;

  // Tax-free withdrawals (medical expenses in retirement)
  const retirementMedical =
    inputs.medical.retirementMedicalExpenses * investment.yearsInRetirement;
  const taxFreeWithdrawals = Math.min(futureValue, retirementMedical);
  const withdrawalTaxSavings = taxFreeWithdrawals * (tax.retirementTaxRate / 100);

  // Use proper capital gains rate based on marginal bracket
  const capitalGainsRate = getCapitalGainsRate(tax.marginalTaxRate);
  const totalLifetimeTaxAdvantage =
    lifetimeTaxSavingsOnContributions + taxFreeGrowth * capitalGainsRate + withdrawalTaxSavings;

  return {
    annualContributionDeduction: annualContribution,
    federalTaxSaved,
    stateTaxSaved,
    ficaTaxSaved,
    totalAnnualTaxSaved,
    lifetimeContributions,
    lifetimeTaxSavingsOnContributions,
    taxFreeGrowth,
    taxFreeWithdrawals,
    totalLifetimeTaxAdvantage,
  };
}

function calculateComparison(
  inputs: CalculatorInputs,
  projections: GrowthProjection[]
): ComparisonAnalysis {
  const { contribution, investment, tax, medical, eligibility } = inputs;

  const annualContribution = eligibility.hasHDHP
    ? contribution.currentContribution + contribution.employerContribution
    : 0;
  const rate = investment.expectedReturn / 100;
  const years = investment.yearsToRetirement;

  // HSA Strategy (contribute, invest, don't touch)
  const hsaFinalBalance = projections[projections.length - 1]?.yearEndBalance || 0;
  const hsaContributions = projections.reduce(
    (sum, p) => sum + p.contribution + p.employerContribution,
    0
  );
  const hsaGrowth = hsaFinalBalance - hsaContributions - contribution.currentHSABalance;
  const hsaTaxesSaved =
    annualContribution * ((tax.marginalTaxRate / 100) + 0.0765) * years;

  // Taxable Account Strategy (same contributions, but taxed)
  // Note: FICA (7.65%) only applies to earned income contributions, not existing balance
  const afterTaxContribution =
    annualContribution * (1 - tax.marginalTaxRate / 100 - 0.0765);

  // Existing balance is already after-tax (no additional deduction)
  let taxableBalance = contribution.currentHSABalance;
  let taxesPaid = 0;

  // Use proper capital gains rate based on marginal bracket
  const capitalGainsRate = getCapitalGainsRate(tax.marginalTaxRate);

  for (let year = 1; year <= years; year += 1) {
    // Contribute after-tax
    taxableBalance += afterTaxContribution;
    // Grow
    const growth = taxableBalance * rate;
    // Pay tax on dividends/gains annually (simplified)
    // Use actual capital gains rate instead of hardcoded 20%
    const annualTax = growth * capitalGainsRate;
    taxesPaid += annualTax;
    taxableBalance = taxableBalance + growth - annualTax;
  }

  // Medical expenses in both scenarios
  const medicalCovered = medical.annualMedicalExpenses * years;

  return {
    hsaStrategy: {
      finalBalance: hsaFinalBalance,
      totalContributions: hsaContributions,
      totalGrowth: hsaGrowth,
      taxesSaved: hsaTaxesSaved,
      medicalCovered,
    },
    taxableAccountStrategy: {
      finalBalance: Math.round(taxableBalance),
      totalContributions: hsaContributions,
      totalGrowth: Math.round(taxableBalance - afterTaxContribution * years),
      taxesPaid: Math.round(
        taxesPaid + hsaContributions * (tax.marginalTaxRate / 100)
      ),
      medicalCovered,
    },
    hsaAdvantage: Math.round(hsaFinalBalance - taxableBalance + hsaTaxesSaved),
  };
}

export function calculate(inputs: CalculatorInputs): CalculatorResults {
  const eligibility = checkEligibility(inputs);
  const projections = calculateGrowthProjections(inputs, eligibility);
  const taxSavings = calculateTaxSavings(inputs, eligibility);
  const comparison = calculateComparison(inputs, projections);

  const retirementBalance = projections[projections.length - 1]?.yearEndBalance || 0;

  // Continue growth through retirement
  let endOfLifeBalance = retirementBalance;
  const retirementRate = (inputs.investment.expectedReturn / 100) * 0.7;
  for (let year = 1; year <= inputs.investment.yearsInRetirement; year += 1) {
    endOfLifeBalance =
      (endOfLifeBalance - inputs.medical.retirementMedicalExpenses) *
      (1 + retirementRate);
    if (endOfLifeBalance < 0) {
      endOfLifeBalance = 0;
      break;
    }
  }

  // The "HSA Hack" metrics
  const receiptsBanked = projections[projections.length - 1]?.receiptsPending || 0;
  const yearsOfMedicalCovered =
    inputs.medical.retirementMedicalExpenses > 0
      ? retirementBalance / inputs.medical.retirementMedicalExpenses
      : 0;

  // What if maxed?
  const maxAnnualContribution = eligibility.maxContribution;
  const currentContribution =
    inputs.contribution.currentContribution + inputs.contribution.employerContribution;
  const additionalIfMaxed = maxAnnualContribution - currentContribution;

  let maxContributionBenefit = 0;
  if (additionalIfMaxed > 0) {
    // Tax savings on each year's additional contribution
    const additionalTaxSavedPerYear =
      additionalIfMaxed * (inputs.tax.marginalTaxRate / 100 + 0.0765);

    // Calculate future value of additional contributions with proper compounding
    // Each year's contribution compounds for different periods
    const returnRate = inputs.investment.expectedReturn / 100;
    const yearsContributing = Math.max(
      0,
      Math.min(inputs.investment.yearsToRetirement, 65 - inputs.eligibility.age)
    );

    let futureValueOfContributions = 0;
    for (let year = 1; year <= yearsContributing; year += 1) {
      // Each contribution compounds for (yearsToRetirement - year + 1) years
      const yearsToCompound = inputs.investment.yearsToRetirement - year + 1;
      futureValueOfContributions += additionalIfMaxed * Math.pow(1 + returnRate, yearsToCompound);
    }

    // Total benefit = lifetime tax savings + future value of compounded contributions
    maxContributionBenefit =
      additionalTaxSavedPerYear * yearsContributing + futureValueOfContributions;
  }

  // Recommendations and warnings
  const recommendations: string[] = [];
  const warnings: string[] = [];

  if (!eligibility.isEligible) {
    warnings.push("You're not currently eligible for HSA contributions.");
    eligibility.reasons.forEach((reason) => warnings.push(reason));
  } else {
    if (eligibility.remainingContributionRoom > 0) {
      recommendations.push(
        `You can contribute $${eligibility.remainingContributionRoom.toLocaleString()} more to maximize your HSA.`
      );
    } else {
      recommendations.push("Great! You're maxing out your HSA contributions.");
    }
  }

  if (STATES_NO_HSA_DEDUCTION.includes(inputs.tax.stateCode)) {
    warnings.push(
      `Note: ${inputs.tax.stateCode} doesn't recognize HSA deductions for state taxes. You still get federal and FICA benefits.`
    );
  }

  recommendations.push(
    "Invest your HSA funds—don't let them sit in cash earning nothing."
  );
  recommendations.push(
    "Pay medical expenses out of pocket when possible, and save receipts. You can reimburse yourself tax-free anytime in the future."
  );

  if (inputs.eligibility.age >= 55) {
    recommendations.push(
      "You're eligible for the $1,000 catch-up contribution. Take advantage of it!"
    );
  }

  if (inputs.eligibility.age >= 63) {
    warnings.push(
      "You'll become Medicare-eligible at 65 and can no longer contribute to an HSA. Plan your final contributions."
    );
  }

  // Steps
  const steps: CalculatorResults["steps"] = [
    {
      step: 1,
      title: "Contribute the Maximum",
      description: `For 2025, that's $${eligibility.maxContribution.toLocaleString()} for ${inputs.eligibility.coverageType} coverage.`,
      impact: `Save $${Math.round(taxSavings.totalAnnualTaxSaved).toLocaleString()}/year in taxes`,
    },
    {
      step: 2,
      title: "Invest Your HSA",
      description:
        "Move funds beyond your emergency medical threshold into investments (index funds, target date funds).",
      impact: "Tax-free growth can add 6-8% annually",
    },
    {
      step: 3,
      title: "Pay Medical Expenses Out of Pocket",
      description:
        "Use your regular bank account for current medical expenses. Keep receipts!",
      impact: "Let HSA compound longer",
    },
    {
      step: 4,
      title: "Save All Medical Receipts",
      description:
        "There's no time limit. You can reimburse yourself for medical expenses from any year.",
      impact: `Bank $${inputs.medical.annualMedicalExpenses.toLocaleString()}/year in future tax-free withdrawals`,
    },
    {
      step: 5,
      title: "Reimburse Yourself in Retirement",
      description:
        "When you need the money, reimburse yourself for decades of saved receipts—completely tax-free.",
      impact: "Tax-free income in retirement",
    },
  ];

  return {
    eligibility,
    projections,
    retirementBalance,
    endOfLifeBalance: Math.round(endOfLifeBalance),
    taxSavings,
    comparison,
    receiptsBanked,
    medicalExpensesCoverable: retirementBalance,
    yearsOfMedicalCovered: Math.round(yearsOfMedicalCovered * 10) / 10,
    maxContributionBenefit: Math.round(maxContributionBenefit),
    additionalIfMaxed,
    recommendations,
    warnings,
    steps,
  };
}
