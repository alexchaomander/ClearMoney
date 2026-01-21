import type { CalculatorInputs, CalculatorResults, MonthlyBreakdown } from "./types";
import { ASSUMPTIONS, CLOSING_COSTS_BY_STATE, DTI_THRESHOLDS, PMI_RATES } from "./constants";

const clampToZero = (value: number) => (Number.isFinite(value) ? Math.max(0, value) : 0);

const calculateMonthlyPayment = (
  principal: number,
  annualRate: number,
  years: number
): number => {
  if (principal <= 0) {
    return 0;
  }

  const monthlyRate = annualRate / 12;
  const numPayments = years * 12;

  if (monthlyRate === 0) {
    return principal / numPayments;
  }

  const factor = Math.pow(1 + monthlyRate, numPayments);
  return principal * ((monthlyRate * factor) / (factor - 1));
};

const paymentToLoanAmount = (
  monthlyPayment: number,
  annualRate: number,
  years: number
): number => {
  if (monthlyPayment <= 0) {
    return 0;
  }

  const monthlyRate = annualRate / 12;
  const numPayments = years * 12;

  if (monthlyRate === 0) {
    return monthlyPayment * numPayments;
  }

  const factor = Math.pow(1 + monthlyRate, numPayments);
  return (monthlyPayment * (factor - 1)) / (monthlyRate * factor);
};

const resolvePmiRate = (loanToValue: number, creditScore: CalculatorInputs["creditScore"]): number => {
  if (loanToValue >= 0.95) {
    return PMI_RATES["95+"][creditScore];
  }

  if (loanToValue >= 0.9) {
    return PMI_RATES["90-95"][creditScore];
  }

  if (loanToValue >= 0.85) {
    return PMI_RATES["85-90"][creditScore];
  }

  if (loanToValue >= 0.8) {
    return PMI_RATES["80-85"][creditScore];
  }

  return 0;
};

const calculateMonthlyBreakdown = (
  homePrice: number,
  downPaymentPercent: number,
  inputs: CalculatorInputs
): MonthlyBreakdown => {
  if (homePrice <= 0) {
    return {
      principal: 0,
      interest: 0,
      propertyTax: 0,
      homeInsurance: 0,
      pmi: 0,
      hoa: inputs.hoa,
      maintenance: 0,
      utilities: 0,
      totalMonthly: inputs.hoa,
    };
  }

  const downPayment = homePrice * downPaymentPercent;
  const loanAmount = homePrice - downPayment;
  const monthlyRate = inputs.mortgageRate / 100 / 12;
  const monthlyPI = calculateMonthlyPayment(
    loanAmount,
    inputs.mortgageRate / 100,
    ASSUMPTIONS.loanTermYears
  );
  const monthlyInterest = loanAmount * monthlyRate;
  const monthlyPrincipal = clampToZero(monthlyPI - monthlyInterest);
  const propertyTax = (homePrice * (inputs.propertyTaxRate / 100)) / 12;
  const homeInsurance = (homePrice * ASSUMPTIONS.insuranceRate) / 12;
  const maintenance = (homePrice * ASSUMPTIONS.maintenanceRate) / 12;
  const utilities = (homePrice * ASSUMPTIONS.utilitiesRate) / 12;
  const loanToValue = loanAmount / homePrice;
  const annualPmiRate = downPaymentPercent >= 0.2 ? 0 : resolvePmiRate(loanToValue, inputs.creditScore);
  const pmi = (loanAmount * annualPmiRate) / 12;

  const totalMonthly =
    monthlyPI + propertyTax + homeInsurance + pmi + inputs.hoa + maintenance + utilities;

  return {
    principal: monthlyPrincipal,
    interest: clampToZero(monthlyInterest),
    propertyTax: clampToZero(propertyTax),
    homeInsurance: clampToZero(homeInsurance),
    pmi: clampToZero(pmi),
    hoa: inputs.hoa,
    maintenance: clampToZero(maintenance),
    utilities: clampToZero(utilities),
    totalMonthly: clampToZero(totalMonthly),
  };
};

const calculateAffordableHomePrice = (
  inputs: CalculatorInputs,
  frontEnd: number,
  backEnd: number
): number => {
  const monthlyIncome = inputs.annualIncome / 12;
  const maxHousingPayment = monthlyIncome * frontEnd;
  const maxTotalDebt = monthlyIncome * backEnd;
  const maxHousingFromBackEnd = maxTotalDebt - inputs.monthlyDebt;
  const maxMonthlyHousing = Math.min(maxHousingPayment, maxHousingFromBackEnd);

  if (maxMonthlyHousing <= 0) {
    return 0;
  }

  const maxPI = maxMonthlyHousing * ASSUMPTIONS.estimatedPIRatio;
  const maxLoanAmount = paymentToLoanAmount(
    maxPI,
    inputs.mortgageRate / 100,
    ASSUMPTIONS.loanTermYears
  );

  const downPaymentPercent = inputs.targetDownPaymentPercent / 100;
  if (downPaymentPercent >= 1) {
    return 0;
  }

  return maxLoanAmount / (1 - downPaymentPercent);
};

const calculateRentVsBuy = (
  homePrice: number,
  downPayment: number,
  monthlyOwnership: number,
  monthlyRent: number,
  closingCostRate: number
): CalculatorResults["rentVsBuy"] => {
  const yearsToCompare = 5;
  const loanAmount = homePrice - downPayment;
  const closingCosts = homePrice * closingCostRate;

  let totalRent = 0;
  let rent = monthlyRent;
  for (let year = 0; year < yearsToCompare; year += 1) {
    totalRent += rent * 12;
    rent *= 1 + ASSUMPTIONS.rentGrowthRate;
  }

  const totalOwnership = monthlyOwnership * 12 * yearsToCompare;
  const futureValue = homePrice * Math.pow(1 + ASSUMPTIONS.appreciationRate, yearsToCompare);
  const equity = futureValue - loanAmount * (1 - ASSUMPTIONS.principalPaydownFiveYears);

  const monthlyDifference = monthlyOwnership - monthlyRent;
  const breakEvenYears =
    monthlyDifference > 0
      ? (closingCosts + downPayment * 0.05) / (monthlyDifference * 12)
      : closingCosts /
        (Math.abs(monthlyDifference) * 12 + homePrice * ASSUMPTIONS.appreciationRate);

  return {
    monthlyOwnership,
    monthlyRent,
    breakEvenYears: Number.isFinite(breakEvenYears)
      ? Math.round(breakEvenYears * 10) / 10
      : 0,
    fiveYearComparison: {
      buyingCost: totalOwnership + closingCosts,
      rentingCost: totalRent,
      equity,
    },
  };
};

export const calculate = (inputs: CalculatorInputs): CalculatorResults => {
  const monthlyIncome = inputs.annualIncome / 12;
  const targetDownPaymentPercent = inputs.targetDownPaymentPercent / 100;
  const cashLimitedPrice =
    targetDownPaymentPercent > 0
      ? inputs.downPaymentSaved / targetDownPaymentPercent
      : 0;

  const comfortableHomePrice = calculateAffordableHomePrice(
    inputs,
    DTI_THRESHOLDS[inputs.riskTolerance].frontEnd,
    DTI_THRESHOLDS[inputs.riskTolerance].backEnd
  );

  const maxApprovalPrice = calculateAffordableHomePrice(
    inputs,
    DTI_THRESHOLDS.aggressive.frontEnd,
    DTI_THRESHOLDS.aggressive.backEnd
  );

  const comfortableAmount = Math.min(comfortableHomePrice, cashLimitedPrice || comfortableHomePrice);
  const maxApprovalAmount = Math.min(maxApprovalPrice, cashLimitedPrice || maxApprovalPrice);
  const stretchAmount = Math.max(comfortableAmount, maxApprovalAmount * 0.9);

  const monthlyBreakdown = calculateMonthlyBreakdown(
    comfortableAmount,
    targetDownPaymentPercent,
    inputs
  );

  const frontEndDTI = monthlyIncome > 0 ? monthlyBreakdown.totalMonthly / monthlyIncome : 0;
  const backEndDTI =
    monthlyIncome > 0
      ? (monthlyBreakdown.totalMonthly + inputs.monthlyDebt) / monthlyIncome
      : 0;

  const dtiStatus =
    frontEndDTI <= DTI_THRESHOLDS[inputs.riskTolerance].frontEnd &&
    backEndDTI <= DTI_THRESHOLDS[inputs.riskTolerance].backEnd
      ? "comfortable"
      : frontEndDTI <= DTI_THRESHOLDS.aggressive.frontEnd &&
          backEndDTI <= DTI_THRESHOLDS.aggressive.backEnd
        ? "stretching"
        : "risky";

  const downPaymentHomePrice = cashLimitedPrice;
  const downPaymentBreakdown = calculateMonthlyBreakdown(
    downPaymentHomePrice,
    targetDownPaymentPercent,
    inputs
  );

  const twentyPercentHomePrice = inputs.downPaymentSaved / 0.2;
  const twentyPercentBreakdown = calculateMonthlyBreakdown(
    twentyPercentHomePrice,
    0.2,
    inputs
  );

  const closingCostRate =
    CLOSING_COSTS_BY_STATE[inputs.state] ?? CLOSING_COSTS_BY_STATE.default;

  const rentVsBuy = calculateRentVsBuy(
    comfortableAmount,
    comfortableAmount * targetDownPaymentPercent,
    monthlyBreakdown.totalMonthly,
    inputs.currentRent,
    closingCostRate
  );
  const closingCosts = comfortableAmount * closingCostRate;
  const firstYearMaintenance = comfortableAmount * ASSUMPTIONS.maintenanceRate;
  const emergencyFund = monthlyBreakdown.totalMonthly * ASSUMPTIONS.emergencyFundMonths;
  const hiddenCostsTotal =
    closingCosts + ASSUMPTIONS.moveInCosts + firstYearMaintenance + emergencyFund;

  const recommendations: string[] = [];
  const warnings: string[] = [];

  if (dtiStatus === "risky") {
    warnings.push(
      "Your debt-to-income ratios are above standard limits. Consider a lower price or higher down payment."
    );
  }

  if (monthlyBreakdown.pmi > 0) {
    recommendations.push(
      `Saving to 20% down could remove PMI and save about $${Math.round(
        monthlyBreakdown.pmi
      ).toLocaleString()} per month.`
    );
  }

  if (targetDownPaymentPercent < 0.05) {
    warnings.push(
      "Less than 5% down typically means higher PMI and fewer loan options."
    );
  }

  if (inputs.currentRent > 0 && monthlyBreakdown.totalMonthly > inputs.currentRent * 1.3) {
    warnings.push(
      "Ownership costs are more than 30% higher than your current rent. Make sure the trade-offs feel worth it."
    );
  }

  if (rentVsBuy.breakEvenYears > 7) {
    recommendations.push(
      "If you plan to move within ~7 years, renting may be cheaper than buying at this price."
    );
  }

  if (downPaymentHomePrice <= 0) {
    warnings.push(
      "Your current income and debt levels do not support a home payment under the 28/36 rule."
    );
  }

  if (inputs.downPaymentSaved < comfortableAmount * 0.1) {
    recommendations.push(
      "Building a larger down payment (10%+) can lower PMI and reduce monthly stress."
    );
  }

  if (dtiStatus === "comfortable") {
    recommendations.push(
      "Staying within the 28/36 rule helps keep your budget resilient to surprises."
    );
  }

  return {
    maxApprovalAmount,
    comfortableAmount,
    stretchAmount,
    monthlyBreakdown,
    dtiAnalysis: {
      frontEndDTI,
      backEndDTI,
      maxFrontEnd: DTI_THRESHOLDS[inputs.riskTolerance].frontEnd,
      maxBackEnd: DTI_THRESHOLDS[inputs.riskTolerance].backEnd,
      status: dtiStatus,
    },
    downPaymentAnalysis: {
      atTargetPercent: {
        homePrice: downPaymentHomePrice,
        pmi: downPaymentBreakdown.pmi,
        totalCost: downPaymentBreakdown.totalMonthly,
      },
      at20Percent: {
        homePrice: twentyPercentHomePrice,
        pmi: twentyPercentBreakdown.pmi,
        totalCost: twentyPercentBreakdown.totalMonthly,
      },
      pmiBreakeven: twentyPercentHomePrice,
    },
    rentVsBuy,
    hiddenCosts: {
      closingCosts,
      moveInCosts: ASSUMPTIONS.moveInCosts,
      firstYearMaintenance,
      emergencyFund,
      totalUpfront: hiddenCostsTotal,
    },
    recommendations,
    warnings,
  };
};
