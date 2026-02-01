import type {
  CalculatorInputs,
  CalculatorResults,
  AmortizationRow,
  MonthlyBreakdown,
} from "./types";

const clampToZero = (value: number) => (Number.isFinite(value) ? Math.max(0, value) : 0);

/**
 * Standard mortgage amortization formula.
 * M = P * [r(1+r)^n] / [(1+r)^n - 1]
 */
const calculateMonthlyPI = (
  principal: number,
  annualRate: number,
  years: number
): number => {
  if (principal <= 0) return 0;

  const monthlyRate = annualRate / 12;
  const numPayments = years * 12;

  if (monthlyRate === 0) {
    return principal / numPayments;
  }

  const factor = Math.pow(1 + monthlyRate, numPayments);
  return principal * ((monthlyRate * factor) / (factor - 1));
};

/**
 * Build a yearly amortization schedule showing principal paid,
 * interest paid, and remaining balance for each year.
 */
const buildAmortizationSchedule = (
  loanAmount: number,
  annualRate: number,
  years: number
): AmortizationRow[] => {
  const monthlyRate = annualRate / 12;
  const monthlyPayment = calculateMonthlyPI(loanAmount, annualRate, years);
  const schedule: AmortizationRow[] = [];

  let remainingBalance = loanAmount;

  for (let year = 1; year <= years; year += 1) {
    let yearPrincipal = 0;
    let yearInterest = 0;

    for (let month = 0; month < 12; month += 1) {
      if (remainingBalance <= 0) break;

      const interestPayment = remainingBalance * monthlyRate;
      const principalPayment = Math.min(
        monthlyPayment - interestPayment,
        remainingBalance
      );

      yearInterest += interestPayment;
      yearPrincipal += principalPayment;
      remainingBalance -= principalPayment;
    }

    schedule.push({
      year,
      principalPaid: clampToZero(yearPrincipal),
      interestPaid: clampToZero(yearInterest),
      remainingBalance: clampToZero(remainingBalance),
    });
  }

  return schedule;
};

/**
 * Generate a plain-language recommendation based on the mortgage inputs.
 */
const generateRecommendation = (
  inputs: CalculatorInputs,
  monthlyTotal: number,
  totalInterest: number,
  loanAmount: number
): string => {
  const parts: string[] = [];

  if (inputs.downPaymentPercent < 20) {
    const pmiMonthly = (loanAmount * (inputs.pmiRate / 100)) / 12;
    parts.push(
      `Your down payment is below 20%, adding ~${formatUSD(pmiMonthly)}/mo in PMI. ` +
        `Reaching 20% down would eliminate PMI and lower your payment.`
    );
  }

  if (inputs.loanTermYears === 30) {
    const shortTermPI = calculateMonthlyPI(loanAmount, inputs.interestRate / 100, 15);
    const longTermPI = calculateMonthlyPI(loanAmount, inputs.interestRate / 100, 30);
    const monthlySavings = longTermPI - shortTermPI;
    if (monthlySavings > 0) {
      parts.push(
        `A 15-year term would cost ~${formatUSD(Math.abs(monthlySavings))}/mo more but save significantly on total interest.`
      );
    }
  }

  const interestRatio = totalInterest / loanAmount;
  if (interestRatio > 1) {
    parts.push(
      `You will pay more in interest than the loan itself. Consider extra principal payments to reduce total cost.`
    );
  } else if (interestRatio > 0.6) {
    parts.push(
      `Interest accounts for a large share of your total cost. Even small extra monthly payments can meaningfully reduce that.`
    );
  }

  if (parts.length === 0) {
    parts.push(
      `Your mortgage is well-structured. At ${formatUSD(monthlyTotal)}/mo total, make sure housing stays under 28% of gross income.`
    );
  }

  return parts.join(" ");
};

/** Quick currency helper for recommendation strings. */
const formatUSD = (value: number): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

/**
 * Main calculation entry point.
 */
export const calculate = (inputs: CalculatorInputs): CalculatorResults => {
  const downPayment = inputs.homePrice * (inputs.downPaymentPercent / 100);
  const loanAmount = clampToZero(inputs.homePrice - downPayment);
  const annualRate = inputs.interestRate / 100;

  // Monthly principal & interest
  const monthlyPI = calculateMonthlyPI(loanAmount, annualRate, inputs.loanTermYears);

  // First-month split (for the breakdown display)
  const monthlyRate = annualRate / 12;
  const firstMonthInterest = loanAmount * monthlyRate;
  const firstMonthPrincipal = clampToZero(monthlyPI - firstMonthInterest);

  // Property tax (annual rate on home price, divided by 12)
  const monthlyPropertyTax = clampToZero(
    (inputs.homePrice * (inputs.propertyTaxRate / 100)) / 12
  );

  // Home insurance (annual amount divided by 12)
  const monthlyInsurance = clampToZero(inputs.homeInsurance / 12);

  // PMI: only applies if down payment is less than 20%
  const monthlyPMI =
    inputs.downPaymentPercent < 20
      ? clampToZero((loanAmount * (inputs.pmiRate / 100)) / 12)
      : 0;

  const monthlyTotal =
    monthlyPI + monthlyPropertyTax + monthlyInsurance + monthlyPMI;

  const monthlyPayment: MonthlyBreakdown = {
    principal: firstMonthPrincipal,
    interest: clampToZero(firstMonthInterest),
    propertyTax: monthlyPropertyTax,
    insurance: monthlyInsurance,
    pmi: monthlyPMI,
    total: clampToZero(monthlyTotal),
  };

  // Amortization schedule
  const amortization = buildAmortizationSchedule(
    loanAmount,
    annualRate,
    inputs.loanTermYears
  );

  // Totals over the life of the loan
  const totalInterest = amortization.reduce(
    (sum, row) => sum + row.interestPaid,
    0
  );
  const totalPI = monthlyPI * inputs.loanTermYears * 12;
  const totalTaxInsurance =
    (monthlyPropertyTax + monthlyInsurance + monthlyPMI) *
    inputs.loanTermYears *
    12;
  const totalCost = clampToZero(totalPI + totalTaxInsurance);

  const recommendation = generateRecommendation(
    inputs,
    monthlyTotal,
    totalInterest,
    loanAmount
  );

  return {
    monthlyPayment,
    loanAmount,
    downPayment,
    totalInterest,
    totalCost,
    amortization,
    recommendation,
  };
};
