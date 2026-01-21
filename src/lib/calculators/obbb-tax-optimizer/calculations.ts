import type { CalculatorInputs, CalculatorResults } from "./types";
import {
  CAR_LOAN_DEDUCTION_MAX,
  CAR_LOAN_PHASEOUT_RANGE,
  CAR_LOAN_PHASEOUT_START,
  NEW_SALT_CAP,
  OLD_SALT_CAP,
  OVERTIME_DEDUCTION_MAX,
  OVERTIME_PHASEOUT_RANGE,
  OVERTIME_PHASEOUT_START,
  SENIOR_DEDUCTION_AMOUNT,
  SENIOR_DEDUCTION_PHASEOUT_RANGE,
  SENIOR_DEDUCTION_PHASEOUT_START,
  STANDARD_DEDUCTION_2025,
  TIPS_DEDUCTION_MAX,
} from "./constants";

function calculatePhaseOut(
  amount: number,
  magi: number,
  threshold: number,
  range: number
): number {
  if (magi <= threshold) return amount;
  if (magi >= threshold + range) return 0;
  const reduction = ((magi - threshold) / range) * amount;
  return Math.max(0, amount - reduction);
}

export function calculate(inputs: CalculatorInputs): CalculatorResults {
  const {
    filingStatus,
    age,
    spouseAge,
    modifiedAGI,
    annualTips,
    annualOvertime,
    carLoanInterest,
    saltPaid,
    otherItemized,
    marginalRate,
  } = inputs;

  const seniorEligibleCount =
    (age >= 65 ? 1 : 0) +
    (filingStatus === "married" && spouseAge && spouseAge >= 65 ? 1 : 0);
  const seniorBaseAmount = seniorEligibleCount * SENIOR_DEDUCTION_AMOUNT;
  const seniorDeduction = calculatePhaseOut(
    seniorBaseAmount,
    modifiedAGI,
    SENIOR_DEDUCTION_PHASEOUT_START[filingStatus],
    SENIOR_DEDUCTION_PHASEOUT_RANGE
  );

  const tipsDeduction = Math.min(annualTips, TIPS_DEDUCTION_MAX);

  const overtimeBase = Math.min(
    annualOvertime,
    OVERTIME_DEDUCTION_MAX[filingStatus]
  );
  const overtimeDeduction = calculatePhaseOut(
    overtimeBase,
    modifiedAGI,
    OVERTIME_PHASEOUT_START[filingStatus],
    OVERTIME_PHASEOUT_RANGE
  );

  const carLoanBase = Math.min(carLoanInterest, CAR_LOAN_DEDUCTION_MAX);
  const carLoanDeduction = calculatePhaseOut(
    carLoanBase,
    modifiedAGI,
    CAR_LOAN_PHASEOUT_START[filingStatus],
    CAR_LOAN_PHASEOUT_RANGE
  );

  const saltUnderOldCap = Math.min(saltPaid, OLD_SALT_CAP);
  const saltUnderNewCap = Math.min(saltPaid, NEW_SALT_CAP);
  const additionalSALT = Math.max(0, saltUnderNewCap - saltUnderOldCap);

  const standardDeduction = STANDARD_DEDUCTION_2025[filingStatus];
  const itemizedWithNewSALT = saltUnderNewCap + otherItemized;

  const totalNewDeductions =
    seniorDeduction + tipsDeduction + overtimeDeduction + carLoanDeduction;
  const saltSavings =
    itemizedWithNewSALT > standardDeduction ? additionalSALT : 0;
  const totalTaxSavings = (totalNewDeductions + saltSavings) * marginalRate;

  return {
    seniorDeduction: {
      eligible: seniorEligibleCount > 0,
      amount: seniorDeduction,
      phaseOutApplied: seniorBaseAmount - seniorDeduction,
      taxSavings: seniorDeduction * marginalRate,
    },
    tipsDeduction: {
      eligible: annualTips > 0,
      amount: tipsDeduction,
      taxSavings: tipsDeduction * marginalRate,
    },
    overtimeDeduction: {
      eligible: annualOvertime > 0,
      amount: overtimeDeduction,
      phaseOutApplied: overtimeBase - overtimeDeduction,
      taxSavings: overtimeDeduction * marginalRate,
    },
    carLoanDeduction: {
      eligible: carLoanInterest > 0,
      amount: carLoanDeduction,
      phaseOutApplied: carLoanBase - carLoanDeduction,
      taxSavings: carLoanDeduction * marginalRate,
    },
    saltBenefit: {
      oldCap: saltUnderOldCap,
      newCap: saltUnderNewCap,
      additionalDeduction: additionalSALT,
      taxSavings: additionalSALT * marginalRate,
    },
    totalNewDeductions,
    totalTaxSavings,
    standardVsItemized: {
      standardDeduction,
      itemizedWithNewSALT,
      recommendation:
        itemizedWithNewSALT > standardDeduction
          ? "Itemize"
          : "Standard Deduction",
    },
  };
}
