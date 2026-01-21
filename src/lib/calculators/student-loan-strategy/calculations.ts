import {
  EXTENDED_PLAN,
  GRADUATED_PLAN,
  IDR_PLANS,
  KEY_DEADLINES,
  POVERTY_GUIDELINE_2026,
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

const calculateDiscretionaryIncome = (income: number, familySize: number) => {
  const adjustedFamilySize = Math.max(1, familySize);
  const povertyLine =
    POVERTY_GUIDELINE_2026.baseAmount +
    (adjustedFamilySize - 1) * POVERTY_GUIDELINE_2026.perPerson;
  const threshold = povertyLine * 1.5;
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

const buildIdrPlan = (
  inputs: CalculatorInputs,
  planKey: keyof typeof IDR_PLANS,
  standardPayment: number
): RepaymentPlan => {
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

  let monthlyPaymentYear1 = 0;
  let monthlyPaymentFinal = 0;

  const totalYears = Math.ceil(monthsRemaining / MONTHS_IN_YEAR);

  for (let year = 0; year < totalYears; year += 1) {
    const projectedIncome =
      inputs.annualIncome * Math.pow(1 + inputs.incomeGrowthRate / 100, year);
    const discretionaryIncome = calculateDiscretionaryIncome(
      projectedIncome,
      inputs.familySize
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
      ? new Date().getFullYear() + Math.ceil(monthsRemaining / MONTHS_IN_YEAR)
      : new Date().getFullYear();
  const taxOnForgiveness = calculateTaxOnForgiveness(
    forgivenessAmount,
    inputs.annualIncome,
    inputs.state
  );

  const available = plan.available;

  const availableUntil =
    "closingDate" in plan && plan.closingDate ? plan.closingDate : undefined;
  const availableFrom = "availableDate" in plan ? plan.availableDate : undefined;

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
      "Parent PLUS loans typically require consolidation to access IDR plans beyond ICR."
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
        const forgivenessDate = new Date();
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
