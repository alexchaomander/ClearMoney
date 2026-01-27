import {
  EXTENDED_PLAN,
  GRADUATED_PLAN,
  IDR_PLANS,
  KEY_DEADLINES,
  POVERTY_GUIDELINE_2026,
  RAP_AGI_BRACKETS,
  REFERENCE_YEAR,
  STANDARD_PLAN,
  STATE_TAX_RATES,
} from "./constants";
import type {
  CalculatorInputs,
  CalculatorResults,
  Recommendation,
  RepaymentPlan,
} from "./types";

const MONTHS_IN_YEAR = 12;

const toMonthlyRate = (annualRate: number) => annualRate / 100 / MONTHS_IN_YEAR;

const calculateStandardPayment = (balance: number, annualRate: number, termYears: number) => {
  if (balance <= 0) return 0;
  const monthlyRate = toMonthlyRate(annualRate);
  const months = termYears * MONTHS_IN_YEAR;
  if (monthlyRate === 0) {
    return balance / months;
  }
  return (balance * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
};

/**
 * Calculate discretionary income based on plan-specific poverty line multiplier
 * - IBR/PAYE: 150% of poverty line
 * - ICR: 100% of poverty line
 * - SAVE: 225% of poverty line (historical, plan is closed)
 */
const calculateDiscretionaryIncome = (
  income: number,
  familySize: number,
  povertyMultiplier: number = 1.5
) => {
  const adjustedFamilySize = Math.max(1, familySize);
  const povertyLine =
    POVERTY_GUIDELINE_2026.baseAmount +
    (adjustedFamilySize - 1) * POVERTY_GUIDELINE_2026.perPerson;
  const threshold = povertyLine * povertyMultiplier;
  return Math.max(0, income - threshold);
};

const calculateIDRPayment = (
  discretionaryIncome: number,
  paymentPercent: number,
  standardPayment: number
) => {
  const idrPayment = (discretionaryIncome * paymentPercent) / MONTHS_IN_YEAR;
  return Math.min(idrPayment, standardPayment);
};

/**
 * Calculate RAP payment based on AGI sliding scale (not discretionary income)
 * Payment = (AGI * applicable_percent) / 12 - ($50 * dependents)
 * Minimum payment is $10
 */
const calculateRAPPayment = (agi: number, dependents: number): number => {
  // Find the applicable percentage based on AGI bracket
  let applicablePercent = 0;
  for (const bracket of RAP_AGI_BRACKETS) {
    if (agi <= bracket.maxAGI) {
      applicablePercent = bracket.percent;
      break;
    }
  }

  // Calculate base payment from AGI
  const basePayment = (agi * applicablePercent) / MONTHS_IN_YEAR;

  // Subtract $50 per dependent (dependents = familySize - 1 for borrower)
  const dependentDeduction = dependents * IDR_PLANS.rap.dependentDeduction;
  const adjustedPayment = basePayment - dependentDeduction;

  // Minimum payment is $10
  return Math.max(IDR_PLANS.rap.minimumMonthlyPayment, adjustedPayment);
};

const projectLoanBalance = (
  balance: number,
  rate: number,
  monthlyPayment: number,
  months: number
) => {
  let currentBalance = balance;
  let totalPaid = 0;
  let totalInterest = 0;
  const monthlyRate = toMonthlyRate(rate);

  for (let i = 0; i < months; i += 1) {
    if (currentBalance <= 0) {
      break;
    }
    const interest = currentBalance * monthlyRate;
    totalInterest += interest;
    currentBalance += interest;

    const payment = Math.min(monthlyPayment, currentBalance);
    currentBalance -= payment;
    totalPaid += payment;
  }

  return { finalBalance: Math.max(0, currentBalance), totalPaid, totalInterest };
};

const projectVariablePayments = (
  balance: number,
  rate: number,
  monthlyPayments: number[]
) => {
  let currentBalance = balance;
  let totalPaid = 0;
  let totalInterest = 0;
  const monthlyRate = toMonthlyRate(rate);

  for (let i = 0; i < monthlyPayments.length; i += 1) {
    if (currentBalance <= 0) {
      break;
    }
    const interest = currentBalance * monthlyRate;
    totalInterest += interest;
    currentBalance += interest;

    const payment = Math.min(monthlyPayments[i], currentBalance);
    currentBalance -= payment;
    totalPaid += payment;
  }

  return { finalBalance: Math.max(0, currentBalance), totalPaid, totalInterest };
};

const calculateTaxOnForgiveness = (
  forgivenAmount: number,
  income: number,
  state: string
) => {
  if (forgivenAmount <= 0) return 0;
  const federalRate = income > 100000 ? 0.24 : income > 50000 ? 0.22 : 0.12;
  const stateRate = STATE_TAX_RATES[state] ?? 0.05;
  return forgivenAmount * (federalRate + stateRate);
};

const buildGraduatedPayments = (standardPayment: number, months: number) => {
  if (months <= 0) return [];
  const steps = Math.max(1, Math.ceil(months / GRADUATED_PLAN.stepMonths));
  const payments: number[] = [];
  for (let step = 0; step < steps; step += 1) {
    const weight = steps === 1 ? 0 : step / (steps - 1);
    const stepPayment =
      standardPayment *
      (GRADUATED_PLAN.startFactor +
        weight * (GRADUATED_PLAN.endFactor - GRADUATED_PLAN.startFactor));
    const monthsInStep =
      step === steps - 1
        ? months - GRADUATED_PLAN.stepMonths * step
        : GRADUATED_PLAN.stepMonths;
    for (let month = 0; month < monthsInStep; month += 1) {
      payments.push(stepPayment);
    }
  }
  return payments;
};

/**
 * Build RAP plan with proper AGI-based sliding scale calculation
 */
const buildRAPPlan = (inputs: CalculatorInputs): RepaymentPlan => {
  const plan = IDR_PLANS.rap;
  const forgivenessYears = plan.forgivenessYears;
  const monthsRemaining = Math.max(
    0,
    Math.round((forgivenessYears - inputs.yearsInRepayment) * MONTHS_IN_YEAR)
  );

  const monthlyPayments: number[] = [];
  let monthlyPaymentYear1 = 0;
  let monthlyPaymentFinal = 0;

  const totalYears = Math.ceil(monthsRemaining / MONTHS_IN_YEAR);
  // Dependents for RAP = familySize - 1 (the borrower is not counted as a dependent)
  const dependents = Math.max(0, inputs.familySize - 1);

  for (let year = 0; year < totalYears; year += 1) {
    const projectedIncome =
      inputs.annualIncome * Math.pow(1 + inputs.incomeGrowthRate / 100, year);

    // RAP uses AGI directly, not discretionary income
    const monthlyPayment = calculateRAPPayment(projectedIncome, dependents);

    if (year === 0) {
      monthlyPaymentYear1 = monthlyPayment;
    }
    monthlyPaymentFinal = monthlyPayment;

    const monthsThisYear = Math.min(
      MONTHS_IN_YEAR,
      monthsRemaining - year * MONTHS_IN_YEAR
    );

    for (let month = 0; month < monthsThisYear; month += 1) {
      monthlyPayments.push(monthlyPayment);
    }
  }

  const projection = projectVariablePayments(
    inputs.loanBalance,
    inputs.interestRate,
    monthlyPayments
  );

  const forgivenessAmount = projection.finalBalance;
  const forgivenessYear =
    monthsRemaining > 0
      ? REFERENCE_YEAR + Math.ceil(monthsRemaining / MONTHS_IN_YEAR)
      : REFERENCE_YEAR;
  const taxOnForgiveness = calculateTaxOnForgiveness(
    forgivenessAmount,
    inputs.annualIncome,
    inputs.state
  );

  return {
    name: plan.name,
    available: plan.available,
    availableUntil: undefined,
    availableFrom: plan.availableDate,
    monthlyPaymentYear1,
    monthlyPaymentFinal,
    totalPaid: projection.totalPaid,
    totalInterestPaid: projection.totalInterest,
    forgivenessAmount,
    forgivenessYear,
    taxOnForgiveness,
    netCost: projection.totalPaid + taxOnForgiveness,
    notes: [
      "RAP uses AGI-based sliding scale (1-10% of AGI), not discretionary income.",
      "$10 minimum monthly payment; $50 deduction per dependent.",
    ],
  };
};

const buildIdrPlan = (
  inputs: CalculatorInputs,
  planKey: keyof typeof IDR_PLANS,
  standardPayment: number
): RepaymentPlan => {
  // RAP is handled separately due to different calculation method
  if (planKey === "rap") {
    return buildRAPPlan(inputs);
  }

  const plan = IDR_PLANS[planKey];
  const forgivenessYears =
    planKey === "ibr" && inputs.yearsInRepayment === 0
      ? IDR_PLANS.ibr.forgivenessYearsNew
      : plan.forgivenessYears;
  const monthsRemaining = Math.max(
    0,
    Math.round((forgivenessYears - inputs.yearsInRepayment) * MONTHS_IN_YEAR)
  );

  const monthlyPayments: number[] = [];
  const paymentPercent =
    planKey === "ibr" && inputs.yearsInRepayment === 0
      ? IDR_PLANS.ibr.paymentPercentNew
      : plan.paymentPercent;

  // Use plan-specific poverty multiplier
  const povertyMultiplier = plan.povertyMultiplier;

  let monthlyPaymentYear1 = 0;
  let monthlyPaymentFinal = 0;

  const totalYears = Math.ceil(monthsRemaining / MONTHS_IN_YEAR);

  for (let year = 0; year < totalYears; year += 1) {
    const projectedIncome =
      inputs.annualIncome * Math.pow(1 + inputs.incomeGrowthRate / 100, year);
    const discretionaryIncome = calculateDiscretionaryIncome(
      projectedIncome,
      inputs.familySize,
      povertyMultiplier
    );
    const monthlyPayment = calculateIDRPayment(
      discretionaryIncome,
      paymentPercent,
      standardPayment
    );

    if (year === 0) {
      monthlyPaymentYear1 = monthlyPayment;
    }
    monthlyPaymentFinal = monthlyPayment;

    const monthsThisYear = Math.min(
      MONTHS_IN_YEAR,
      monthsRemaining - year * MONTHS_IN_YEAR
    );

    for (let month = 0; month < monthsThisYear; month += 1) {
      monthlyPayments.push(monthlyPayment);
    }
  }

  const projection = projectVariablePayments(
    inputs.loanBalance,
    inputs.interestRate,
    monthlyPayments
  );

  const forgivenessAmount = projection.finalBalance;
  const forgivenessYear =
    monthsRemaining > 0
      ? REFERENCE_YEAR + Math.ceil(monthsRemaining / MONTHS_IN_YEAR)
      : REFERENCE_YEAR;
  const taxOnForgiveness = calculateTaxOnForgiveness(
    forgivenessAmount,
    inputs.annualIncome,
    inputs.state
  );

  const available = plan.available;

  const availableUntil: string | undefined =
    "closingDate" in plan && plan.closingDate ? (plan.closingDate as string) : undefined;
  const availableFrom: string | undefined =
    "availableDate" in plan ? (plan.availableDate as string | undefined) : undefined;

  // Add notes for plan-specific details
  const notes: string[] = [];
  if (planKey === "icr") {
    notes.push("ICR uses 100% of poverty line (not 150%) for discretionary income calculation.");
  }
  if (planKey === "save") {
    notes.push("SAVE used 225% of poverty line. Plan is now closed.");
  }

  return {
    name: plan.name,
    available,
    availableUntil,
    availableFrom,
    monthlyPaymentYear1,
    monthlyPaymentFinal,
    totalPaid: projection.totalPaid,
    totalInterestPaid: projection.totalInterest,
    forgivenessAmount,
    forgivenessYear,
    taxOnForgiveness,
    netCost: projection.totalPaid + taxOnForgiveness,
    notes: notes.length > 0 ? notes : undefined,
  };
};

const buildStandardPlan = (
  inputs: CalculatorInputs,
  standardPayment: number
): RepaymentPlan => {
  const monthsRemaining = Math.max(
    0,
    Math.round((STANDARD_PLAN.termYears - inputs.yearsInRepayment) * MONTHS_IN_YEAR)
  );
  const projection =
    monthsRemaining === 0
      ? { finalBalance: 0, totalPaid: 0, totalInterest: 0 }
      : projectLoanBalance(
          inputs.loanBalance,
          inputs.interestRate,
          standardPayment,
          monthsRemaining
        );

  return {
    name: STANDARD_PLAN.name,
    available: true,
    monthlyPaymentYear1: standardPayment,
    monthlyPaymentFinal: standardPayment,
    totalPaid: projection.totalPaid,
    totalInterestPaid: projection.totalInterest,
    forgivenessAmount: 0,
    forgivenessYear: null,
    taxOnForgiveness: 0,
    netCost: projection.totalPaid,
  };
};

const buildGraduatedPlan = (
  inputs: CalculatorInputs,
  standardPayment: number
): RepaymentPlan => {
  const monthsRemaining = Math.max(
    0,
    Math.round((GRADUATED_PLAN.termYears - inputs.yearsInRepayment) * MONTHS_IN_YEAR)
  );
  const payments = buildGraduatedPayments(standardPayment, monthsRemaining);
  const projection =
    monthsRemaining === 0
      ? { finalBalance: 0, totalPaid: 0, totalInterest: 0 }
      : projectVariablePayments(
          inputs.loanBalance,
          inputs.interestRate,
          payments
        );

  return {
    name: GRADUATED_PLAN.name,
    available: true,
    monthlyPaymentYear1: payments[0] ?? 0,
    monthlyPaymentFinal: payments[payments.length - 1] ?? 0,
    totalPaid: projection.totalPaid,
    totalInterestPaid: projection.totalInterest,
    forgivenessAmount: projection.finalBalance,
    forgivenessYear: null,
    taxOnForgiveness: 0,
    netCost: projection.totalPaid,
    notes: ["Graduated payments may leave a remaining balance if income-based plans are better."],
  };
};

const buildExtendedPlan = (
  inputs: CalculatorInputs,
  extendedPayment: number
): RepaymentPlan => {
  const monthsRemaining = Math.max(
    0,
    Math.round((EXTENDED_PLAN.termYears - inputs.yearsInRepayment) * MONTHS_IN_YEAR)
  );
  const projection =
    monthsRemaining === 0
      ? { finalBalance: 0, totalPaid: 0, totalInterest: 0 }
      : projectLoanBalance(
          inputs.loanBalance,
          inputs.interestRate,
          extendedPayment,
          monthsRemaining
        );

  return {
    name: EXTENDED_PLAN.name,
    available: inputs.loanBalance >= EXTENDED_PLAN.minBalance,
    monthlyPaymentYear1: extendedPayment,
    monthlyPaymentFinal: extendedPayment,
    totalPaid: projection.totalPaid,
    totalInterestPaid: projection.totalInterest,
    forgivenessAmount: projection.finalBalance,
    forgivenessYear: null,
    taxOnForgiveness: 0,
    netCost: projection.totalPaid,
  };
};

const buildRecommendation = (
  plans: Record<string, RepaymentPlan>,
  inputs: CalculatorInputs
): Recommendation => {
  const availablePlans = Object.values(plans).filter((plan) => plan.available);
  const bestPlan = availablePlans.reduce((best, plan) =>
    plan.netCost < best.netCost ? plan : best
  );

  const warnings: string[] = [];
  if (inputs.hasParentPlus || inputs.loanType === "parent_plus") {
    warnings.push(
      "Parent PLUS loans are NOT eligible for RAP. Only ICR is available (via consolidation), and ICR closes July 2028."
    );
  }
  if (inputs.pslfEligible) {
    warnings.push(
      "PSLF forgiveness remains tax-free, but qualifying payments must come from eligible employment."
    );
  }
  warnings.push("IDR forgiveness becomes taxable starting in 2026.");

  const reasoning =
    inputs.pslfEligible && inputs.pslfPaymentsMade < 120
      ? "PSLF can deliver tax-free forgiveness after 120 qualifying payments. Keep payments low on an IDR plan while you finish the timeline."
      : `Based on total out-of-pocket cost, ${bestPlan.name} minimizes your projected net cost.`;

  return {
    bestPlan: inputs.pslfEligible ? "PSLF + IDR" : bestPlan.name,
    reasoning,
    keyDeadlines: KEY_DEADLINES,
    warnings,
  };
};

export const calculate = (inputs: CalculatorInputs): CalculatorResults => {
  const standardPayment = calculateStandardPayment(
    inputs.loanBalance,
    inputs.interestRate,
    STANDARD_PLAN.termYears
  );
  const extendedPayment = calculateStandardPayment(
    inputs.loanBalance,
    inputs.interestRate,
    EXTENDED_PLAN.termYears
  );

  const plans: Record<string, RepaymentPlan> = {
    standard: buildStandardPlan(inputs, standardPayment),
    graduated: buildGraduatedPlan(inputs, standardPayment),
    extended: buildExtendedPlan(inputs, extendedPayment),
    ibr: buildIdrPlan(inputs, "ibr", standardPayment),
    icr: buildIdrPlan(inputs, "icr", standardPayment),
    paye: buildIdrPlan(inputs, "paye", standardPayment),
    save: buildIdrPlan(inputs, "save", standardPayment),
    rap: buildIdrPlan(inputs, "rap", standardPayment),
  };

  if (inputs.loanType === "parent_plus") {
    plans.ibr.available = false;
    plans.paye.available = false;
    plans.save.available = false;
    plans.rap.available = false;
  }
  if (inputs.loanType === "perkins") {
    plans.paye.available = false;
  }

  const pslfAnalysis = inputs.pslfEligible
    ? (() => {
        const paymentsRemaining = Math.max(0, 120 - inputs.pslfPaymentsMade);
        const monthsRemaining = paymentsRemaining;
        const baselinePayment = plans.ibr.available
          ? plans.ibr.monthlyPaymentYear1
          : standardPayment;
        const projection = projectLoanBalance(
          inputs.loanBalance,
          inputs.interestRate,
          baselinePayment,
          monthsRemaining
        );
        // Use REFERENCE_YEAR instead of new Date() for consistent results
        const forgivenessDate = new Date(REFERENCE_YEAR, 0, 1);
        forgivenessDate.setMonth(forgivenessDate.getMonth() + monthsRemaining);
        return {
          eligible: true,
          paymentsRemaining,
          estimatedForgivenessDate: forgivenessDate,
          estimatedForgivenessAmount: projection.finalBalance,
          taxFree: true,
        };
      })()
    : undefined;

  const recommendation = buildRecommendation(plans, inputs);

  return {
    plans,
    pslfAnalysis,
    recommendation,
  };
};
