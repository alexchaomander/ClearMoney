import type {
  CalculatorInputs,
  CalculatorResults,
  IRMAAImpact,
  YearByYearEntry,
} from "./types";
import { getIRMAABrackets, PROJECTION_END_AGE } from "./constants";
import type { IRMAABracketRaw } from "../medicare-irmaa/types";

function findIRMAABracket(
  magi: number,
  brackets: IRMAABracketRaw[]
): { bracket: IRMAABracketRaw; label: string } {
  for (let i = brackets.length - 1; i >= 0; i--) {
    if (magi >= brackets[i].min) {
      return {
        bracket: brackets[i],
        label: `$${brackets[i].min.toLocaleString()}–${
          brackets[i].max === Infinity ? "+" : `$${brackets[i].max.toLocaleString()}`
        }`,
      };
    }
  }
  return { bracket: brackets[0], label: "Base" };
}

function annualSurcharge(bracket: IRMAABracketRaw): number {
  return (bracket.partBSurcharge + bracket.partDSurcharge) * 12;
}

function computeIRMAAImpact(inputs: CalculatorInputs): IRMAAImpact {
  const brackets = getIRMAABrackets(inputs.filingStatus);
  const magiBefore = inputs.currentTaxableIncome;
  const magiAfter = inputs.currentTaxableIncome + inputs.conversionAmount;

  const before = findIRMAABracket(magiBefore, brackets);
  const after = findIRMAABracket(magiAfter, brackets);

  const annualBefore = annualSurcharge(before.bracket);
  const annualAfter = annualSurcharge(after.bracket);

  return {
    magiBefore,
    magiAfter,
    crossesBracket: before.bracket.min !== after.bracket.min,
    bracketBefore: before.label,
    bracketAfter: after.label,
    annualSurchargeBefore: annualBefore,
    annualSurchargeAfter: annualAfter,
    annualSurchargeDelta: annualAfter - annualBefore,
  };
}

export function calculate(inputs: CalculatorInputs): CalculatorResults {
  const {
    currentAge,
    conversionAmount,
    traditionalIraBalance,
    expectedReturnRate,
    currentTaxRate,
    retirementTaxRate,
  } = inputs;

  const returnRate = expectedReturnRate / 100;
  const currentRate = currentTaxRate / 100;
  const retirementRate = retirementTaxRate / 100;

  // Tax cost of converting now
  const conversionTaxCost = conversionAmount * currentRate;

  // Scenario A: No conversion — entire balance grows, taxed at retirement rate
  // Scenario B: Convert — pay tax now, remaining grows tax-free in Roth
  const projectionYears = PROJECTION_END_AGE - currentAge + 1;
  const currentYear = new Date().getFullYear();

  const yearByYear: YearByYearEntry[] = [];
  let breakEvenAge: number | null = null;
  let breakEvenYear: number | null = null;

  // Track balances
  // No-convert: full traditional balance grows, withdrawals taxed at retirement rate
  // Convert: traditional balance minus conversion grows (taxed at retirement),
  //          conversion minus tax grows tax-free in Roth
  const traditionalAfterConversion = traditionalIraBalance - conversionAmount;
  const rothAfterConversion = conversionAmount - conversionTaxCost;

  let traditionalBal = traditionalIraBalance; // no-convert scenario
  let traditionalRemaining = traditionalAfterConversion; // convert scenario: traditional portion
  let rothBal = rothAfterConversion; // convert scenario: roth portion

  for (let i = 0; i < projectionYears; i++) {
    const age = currentAge + i;
    const year = currentYear + i;

    // After-tax values at this point
    const noConvertAfterTax = traditionalBal * (1 - retirementRate);
    const convertAfterTax = traditionalRemaining * (1 - retirementRate) + rothBal;

    const advantage = convertAfterTax - noConvertAfterTax;

    const isBreakEven =
      breakEvenAge === null && i > 0 && advantage >= 0 && conversionAmount > 0;

    if (isBreakEven) {
      breakEvenAge = age;
      breakEvenYear = year;
    }

    yearByYear.push({
      age,
      year,
      traditionalBalance: Math.round(noConvertAfterTax),
      rothBalance: Math.round(convertAfterTax),
      cumulativeTaxSaved: Math.round(advantage),
      isBreakEven,
    });

    // Grow all balances for next year
    traditionalBal *= 1 + returnRate;
    traditionalRemaining *= 1 + returnRate;
    rothBal *= 1 + returnRate;
  }

  // Lifetime values at age 90
  const lastEntry = yearByYear[yearByYear.length - 1];
  const lifetimeNoConvert = lastEntry?.traditionalBalance ?? 0;
  const lifetimeConvert = lastEntry?.rothBalance ?? 0;
  const lifetimeSavings = lifetimeConvert - lifetimeNoConvert;

  // IRMAA impact
  const irmaaImpact = computeIRMAAImpact(inputs);

  // Build recommendation and factors
  const factors: string[] = [];
  if (currentRate > retirementRate) {
    factors.push("Your current tax rate is higher than your expected retirement rate, which reduces the conversion benefit.");
  } else if (currentRate < retirementRate) {
    factors.push("Your expected retirement tax rate is higher than your current rate, making conversion more attractive.");
  } else {
    factors.push("Your current and retirement tax rates are equal, so the conversion benefit comes primarily from tax-free growth.");
  }

  if (irmaaImpact.crossesBracket) {
    factors.push(
      `Converting pushes your MAGI into a higher IRMAA bracket, adding ~$${Math.round(irmaaImpact.annualSurchargeDelta).toLocaleString()}/year in Medicare surcharges.`
    );
  }

  if (breakEvenAge !== null) {
    factors.push(`Break-even age is ${breakEvenAge}, meaning the Roth conversion pays off if you live past this age.`);
  } else if (conversionAmount > 0) {
    factors.push("No break-even point found within the projection period — the conversion may not be beneficial under these assumptions.");
  }

  if (conversionAmount === 0) {
    factors.push("No conversion amount entered. Adjust the conversion amount to see the analysis.");
  }

  let recommendation: string;
  if (conversionAmount === 0) {
    recommendation = "Enter a conversion amount to see the Roth conversion analysis.";
  } else if (lifetimeSavings > 0 && breakEvenAge !== null) {
    recommendation = `Converting $${conversionAmount.toLocaleString()} could save you $${Math.round(lifetimeSavings).toLocaleString()} in after-tax wealth by age 90. The conversion breaks even at age ${breakEvenAge}.`;
  } else if (lifetimeSavings > 0) {
    recommendation = `Converting $${conversionAmount.toLocaleString()} shows a net positive outcome by age 90, saving $${Math.round(lifetimeSavings).toLocaleString()} in after-tax wealth.`;
  } else {
    recommendation = `Under these assumptions, converting $${conversionAmount.toLocaleString()} would reduce your after-tax wealth by $${Math.round(Math.abs(lifetimeSavings)).toLocaleString()} by age 90. Consider a smaller conversion or revisit your tax rate assumptions.`;
  }

  return {
    conversionTaxCost,
    breakEvenAge,
    breakEvenYear,
    lifetimeNoConvert,
    lifetimeConvert,
    lifetimeSavings,
    irmaaImpact,
    yearByYear,
    recommendation,
    factors,
  };
}
