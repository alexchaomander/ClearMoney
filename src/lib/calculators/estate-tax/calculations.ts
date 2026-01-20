import type {
  CalculatorInputs,
  CalculatorResults,
  EstateCalculation,
  PlanningOpportunity,
  StateEstateInfo,
  SunsetComparison,
} from "./types";
import {
  FEDERAL_EXEMPTION_2025,
  FEDERAL_EXEMPTION_POST_SUNSET,
  FEDERAL_ESTATE_TAX_RATE,
  ANNUAL_GIFT_EXCLUSION_2025,
  STATE_ESTATE_TAX,
  NY_CLIFF_THRESHOLD,
  STATE_TAX_AVG_RATE_FACTOR,
  URGENCY_THRESHOLDS,
  GRAT_BUSINESS_THRESHOLD,
  GRAT_BROKERAGE_THRESHOLD,
  GRAT_APPRECIATION_ASSUMPTION,
  STATE_RELOCATION_THRESHOLD,
  LIFE_INSURANCE_WARNING_FACTOR,
  NY_CLIFF_WARNING_FACTOR,
} from "./constants";

/**
 * Calculate the federal estate tax exemption based on marital status.
 * Married couples can use portability to combine both spouses' exemptions.
 */
function getFederalExemption(
  baseExemption: number,
  maritalStatus: "single" | "married"
): number {
  return maritalStatus === "married" ? baseExemption * 2 : baseExemption;
}

/**
 * Calculate federal estate tax liability.
 *
 * IMPORTANT: Lifetime taxable gifts are added to the estate value to determine
 * total exemption usage. This is the correct IRS calculation per Form 706.
 *
 * The `lifetimeGifts` parameter represents gifts that ALREADY exceeded the
 * annual exclusion and used up part of the lifetime exemption. These gifts
 * are NOT being double-counted because:
 *
 * 1. The gross estate (netEstate) only includes assets currently owned at death
 * 2. Gifts made during life are no longer part of the gross estate
 * 3. We add lifetime gifts to determine how much of the unified credit was used
 * 4. Tax is only paid on amounts exceeding the total available exemption
 *
 * @param netEstate - Net value of estate at death (gross estate minus liabilities)
 * @param lifetimeGifts - Cumulative taxable gifts made during life (above annual exclusion)
 * @param baseExemption - The per-person federal exemption amount
 * @param maritalStatus - Single or married (affects exemption via portability)
 */
function calculateFederalEstate(
  netEstate: number,
  lifetimeGifts: number,
  baseExemption: number,
  maritalStatus: "single" | "married"
): EstateCalculation {
  const exemption = getFederalExemption(baseExemption, maritalStatus);

  // Per IRS Form 706: Taxable estate + adjusted taxable gifts = tentative tax base
  // This determines how much of the unified credit (exemption) has been used
  const taxableEstate = Math.max(0, netEstate) + lifetimeGifts;

  const exemptionUsed = Math.min(taxableEstate, exemption);
  const exemptionRemaining = Math.max(0, exemption - taxableEstate);
  const taxableAmount = Math.max(0, taxableEstate - exemption);
  const federalTaxDue = taxableAmount * FEDERAL_ESTATE_TAX_RATE;
  const effectiveRate = taxableEstate > 0 ? federalTaxDue / taxableEstate : 0;

  return {
    grossEstate: netEstate,
    deductions: 0,
    taxableEstate,
    exemptionUsed,
    exemptionRemaining,
    federalTaxDue,
    effectiveRate,
  };
}

/**
 * Calculate state estate tax liability.
 * Handles special cases like New York's cliff rule.
 */
function calculateStateEstate(netEstate: number, stateCode: string): StateEstateInfo {
  const stateInfo = STATE_ESTATE_TAX[stateCode];

  if (!stateInfo) {
    return {
      hasEstateTax: false,
      exemption: 0,
      maxRate: 0,
      stateTaxDue: 0,
      notes: "No state estate tax",
    };
  }

  const taxableAmount = Math.max(0, netEstate - stateInfo.exemption);
  let stateTaxDue = 0;

  // New York cliff rule: if estate exceeds exemption by more than 5%,
  // the entire exemption is lost and tax applies to the full estate value
  if (stateCode === "NY" && netEstate > stateInfo.exemption * NY_CLIFF_THRESHOLD) {
    stateTaxDue = netEstate * stateInfo.maxRate;
  } else {
    // Use average rate factor to approximate graduated state tax rates
    const avgRate = stateInfo.maxRate * STATE_TAX_AVG_RATE_FACTOR;
    stateTaxDue = taxableAmount * avgRate;
  }

  return {
    hasEstateTax: true,
    exemption: stateInfo.exemption,
    maxRate: stateInfo.maxRate,
    stateTaxDue,
    notes: stateInfo.notes,
  };
}

/**
 * Compare estate tax under current law vs. after the 2026 TCJA sunset.
 */
function calculateSunsetComparison(
  netEstate: number,
  lifetimeGifts: number,
  maritalStatus: "single" | "married"
): SunsetComparison {
  const currentLaw = calculateFederalEstate(
    netEstate,
    lifetimeGifts,
    FEDERAL_EXEMPTION_2025,
    maritalStatus
  );
  const postSunset = calculateFederalEstate(
    netEstate,
    lifetimeGifts,
    FEDERAL_EXEMPTION_POST_SUNSET,
    maritalStatus
  );

  const additionalTaxIfNoAction = postSunset.federalTaxDue - currentLaw.federalTaxDue;

  let urgencyLevel: SunsetComparison["urgencyLevel"];
  if (additionalTaxIfNoAction <= 0) {
    urgencyLevel = "none";
  } else if (additionalTaxIfNoAction < URGENCY_THRESHOLDS.LOW) {
    urgencyLevel = "low";
  } else if (additionalTaxIfNoAction < URGENCY_THRESHOLDS.MODERATE) {
    urgencyLevel = "moderate";
  } else if (additionalTaxIfNoAction < URGENCY_THRESHOLDS.HIGH) {
    urgencyLevel = "high";
  } else {
    urgencyLevel = "critical";
  }

  return {
    currentLaw,
    postSunset,
    additionalTaxIfNoAction,
    urgencyLevel,
  };
}

/**
 * Generate estate planning opportunity suggestions based on the user's situation.
 */
function generateOpportunities(
  inputs: CalculatorInputs,
  results: Partial<CalculatorResults>
): PlanningOpportunity[] {
  const opportunities: PlanningOpportunity[] = [];
  const { assets, personal, lifetimeGiftsMade } = inputs;

  // Annual gift exclusion opportunity
  const annualGiftPotential =
    personal.maritalStatus === "married"
      ? ANNUAL_GIFT_EXCLUSION_2025 * 2
      : ANNUAL_GIFT_EXCLUSION_2025;

  opportunities.push({
    strategy: "Annual Exclusion Gifts",
    description: `Gift up to $${annualGiftPotential.toLocaleString()} per recipient annually without using lifetime exemption.`,
    potentialSavings: annualGiftPotential * FEDERAL_ESTATE_TAX_RATE,
    timeframe: "Ongoing, annually",
    complexity: "simple",
  });

  // ILIT opportunity for life insurance
  if (assets.lifeInsurance > 0) {
    const iilitSavings = assets.lifeInsurance * FEDERAL_ESTATE_TAX_RATE;
    opportunities.push({
      strategy: "Irrevocable Life Insurance Trust (ILIT)",
      description: `Remove $${assets.lifeInsurance.toLocaleString()} in life insurance from your estate by transferring to an ILIT.`,
      potentialSavings: iilitSavings,
      timeframe: "3+ months to implement",
      complexity: "moderate",
    });
  }

  // Use exemption before 2026 sunset
  if (results.sunsetComparison && results.sunsetComparison.additionalTaxIfNoAction > 0) {
    const exemptionToUse =
      getFederalExemption(FEDERAL_EXEMPTION_2025, personal.maritalStatus) -
      getFederalExemption(FEDERAL_EXEMPTION_POST_SUNSET, personal.maritalStatus) -
      lifetimeGiftsMade;
    if (exemptionToUse > 0) {
      opportunities.push({
        strategy: "Use Lifetime Exemption Before 2026",
        description: `Transfer up to $${exemptionToUse.toLocaleString()} to irrevocable trusts before the exemption drops.`,
        potentialSavings: results.sunsetComparison.additionalTaxIfNoAction,
        timeframe: "Before December 31, 2025",
        complexity: "complex",
      });
    }
  }

  // GRAT opportunity for appreciating assets
  if (
    assets.businessInterests > GRAT_BUSINESS_THRESHOLD ||
    assets.brokerageAccounts > GRAT_BROKERAGE_THRESHOLD
  ) {
    opportunities.push({
      strategy: "Grantor Retained Annuity Trust (GRAT)",
      description:
        "Transfer appreciating assets while retaining an income stream. Growth passes tax-free to beneficiaries.",
      potentialSavings:
        (assets.businessInterests + assets.brokerageAccounts) *
        GRAT_APPRECIATION_ASSUMPTION *
        FEDERAL_ESTATE_TAX_RATE,
      timeframe: "2-10 year trust term",
      complexity: "complex",
    });
  }

  // Charitable giving is always an option
  opportunities.push({
    strategy: "Charitable Giving",
    description: "Charitable bequests reduce your taxable estate dollar-for-dollar.",
    potentialSavings: 0,
    timeframe: "Update estate plan",
    complexity: "simple",
  });

  // State domicile change for high state tax situations
  if (
    results.state &&
    results.state.hasEstateTax &&
    results.state.stateTaxDue > STATE_RELOCATION_THRESHOLD
  ) {
    opportunities.push({
      strategy: "Consider State Domicile",
      description: `Your state has a ${(results.state.maxRate * 100).toFixed(
        0
      )}% estate tax. Relocating to a no-tax state could save $${results.state.stateTaxDue.toLocaleString()}.`,
      potentialSavings: results.state.stateTaxDue,
      timeframe: "Major life decision",
      complexity: "complex",
    });
  }

  return opportunities;
}

/**
 * Main calculation function for estate tax exposure.
 */
export function calculate(inputs: CalculatorInputs): CalculatorResults {
  const { assets, liabilities, personal, lifetimeGiftsMade } = inputs;

  // Calculate gross estate (assets currently owned - NOT including lifetime gifts)
  const grossEstate =
    assets.bankAccounts +
    assets.brokerageAccounts +
    assets.retirementAccounts +
    assets.primaryResidence +
    assets.otherRealEstate +
    assets.lifeInsurance +
    assets.businessInterests +
    assets.otherAssets;

  const totalLiabilities = liabilities.mortgages + liabilities.otherDebts;
  const netEstate = Math.max(0, grossEstate - totalLiabilities);

  // Calculate federal and state taxes
  const federal = calculateFederalEstate(
    netEstate,
    lifetimeGiftsMade,
    FEDERAL_EXEMPTION_2025,
    personal.maritalStatus
  );
  const state = calculateStateEstate(netEstate, personal.stateOfResidence);
  const totalEstateTax = federal.federalTaxDue + state.stateTaxDue;
  const totalTaxRate = netEstate > 0 ? totalEstateTax / netEstate : 0;

  // Compare current law vs. post-sunset
  const sunsetComparison = calculateSunsetComparison(
    netEstate,
    lifetimeGiftsMade,
    personal.maritalStatus
  );

  // Calculate asset breakdown for visualization
  const safeTotal = grossEstate > 0 ? grossEstate : 1;
  const assetBreakdown = [
    { category: "Bank & Cash", value: assets.bankAccounts },
    { category: "Investments", value: assets.brokerageAccounts },
    { category: "Retirement", value: assets.retirementAccounts },
    { category: "Primary Home", value: assets.primaryResidence },
    { category: "Other Real Estate", value: assets.otherRealEstate },
    { category: "Life Insurance", value: assets.lifeInsurance },
    { category: "Business", value: assets.businessInterests },
    { category: "Other", value: assets.otherAssets },
  ]
    .filter((item) => item.value > 0)
    .map((item) => ({
      ...item,
      percentage: (item.value / safeTotal) * 100,
    }));

  // Determine warning conditions
  const lifeInsuranceWarning =
    assets.lifeInsurance > 0 &&
    assets.lifeInsurance >
      getFederalExemption(FEDERAL_EXEMPTION_2025, personal.maritalStatus) *
        LIFE_INSURANCE_WARNING_FACTOR;
  const stateExemptionWarning = state.hasEstateTax && netEstate > state.exemption;
  const sunsetWarning = sunsetComparison.additionalTaxIfNoAction > URGENCY_THRESHOLDS.LOW;

  const results: Partial<CalculatorResults> = {
    grossEstate,
    totalLiabilities,
    netEstate,
    federal,
    state,
    totalEstateTax,
    totalTaxRate,
    sunsetComparison,
    assetBreakdown,
    lifeInsuranceWarning,
    stateExemptionWarning,
    sunsetWarning,
  };

  // Generate planning opportunities
  const opportunities = generateOpportunities(inputs, results);

  // Build warnings and recommendations
  const recommendations: string[] = [];
  const warnings: string[] = [];

  if (federal.federalTaxDue > 0) {
    warnings.push(
      `Your estate exceeds the federal exemption. Estimated federal estate tax: $${federal.federalTaxDue.toLocaleString()}.`
    );
  } else {
    recommendations.push(
      `Your estate is currently under the federal exemption ($${getFederalExemption(
        FEDERAL_EXEMPTION_2025,
        personal.maritalStatus
      ).toLocaleString()}). No federal estate tax due.`
    );
  }

  if (sunsetWarning) {
    warnings.push(
      `URGENT: After the 2026 sunset, your estate tax could increase by $${sunsetComparison.additionalTaxIfNoAction.toLocaleString()}. Act before December 2025.`
    );
  }

  if (lifeInsuranceWarning) {
    warnings.push(
      `Your $${assets.lifeInsurance.toLocaleString()} life insurance counts toward your estate. Consider an ILIT to remove it.`
    );
  }

  if (stateExemptionWarning) {
    warnings.push(
      `Your state (${personal.stateOfResidence}) has an estate tax. You owe approximately $${state.stateTaxDue.toLocaleString()} in state estate tax.`
    );
  }

  if (
    state.notes.includes("cliff") &&
    netEstate > state.exemption * NY_CLIFF_WARNING_FACTOR
  ) {
    warnings.push(
      "New York has an estate tax cliff: if your estate exceeds the exemption by more than 5%, you lose the entire exemption."
    );
  }

  if (personal.maritalStatus === "married") {
    recommendations.push(
      "As a married couple, you can use portability to preserve any unused exemption when the first spouse dies."
    );
  }

  recommendations.push(
    "Consider meeting with an estate planning attorney, especially given the 2026 exemption sunset."
  );

  return {
    ...results,
    opportunities,
    recommendations,
    warnings,
  } as CalculatorResults;
}
