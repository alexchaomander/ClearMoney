import type {
  CalculatorInputs,
  CalculatorResults,
  EstateCalculation,
  PlanningOpportunity,
  StateEstateInfo,
  SunsetComparison,
} from "./types";

const FEDERAL_EXEMPTION_2025 = 13990000;
const FEDERAL_EXEMPTION_POST_SUNSET = 7000000;
const FEDERAL_TAX_RATE = 0.4;
const ANNUAL_GIFT_EXCLUSION = 19000;

const STATE_ESTATE_TAX: Record<
  string,
  { exemption: number; maxRate: number; notes: string }
> = {
  CT: { exemption: 13610000, maxRate: 0.12, notes: "Exemption tied to federal" },
  DC: { exemption: 4710800, maxRate: 0.16, notes: "Graduated rates" },
  HI: { exemption: 5490000, maxRate: 0.2, notes: "Graduated rates 10-20%" },
  IL: { exemption: 4000000, maxRate: 0.16, notes: "Graduated rates 0.8-16%" },
  ME: { exemption: 6800000, maxRate: 0.12, notes: "Graduated rates 8-12%" },
  MD: { exemption: 5000000, maxRate: 0.16, notes: "Also has inheritance tax" },
  MA: { exemption: 1000000, maxRate: 0.16, notes: "Low exemption, graduated rates" },
  MN: { exemption: 3000000, maxRate: 0.16, notes: "Graduated rates" },
  NY: { exemption: 6940000, maxRate: 0.16, notes: "Cliff: lose entire exemption if 5% over" },
  OR: { exemption: 1000000, maxRate: 0.16, notes: "Very low exemption" },
  RI: { exemption: 1774583, maxRate: 0.16, notes: "Indexed for inflation" },
  VT: { exemption: 5000000, maxRate: 0.16, notes: "Graduated rates" },
  WA: { exemption: 2193000, maxRate: 0.2, notes: "Highest state rate at 20%" },
};

function getFederalExemption(
  baseExemption: number,
  maritalStatus: "single" | "married"
) {
  return maritalStatus === "married" ? baseExemption * 2 : baseExemption;
}

function calculateFederalEstate(
  netEstate: number,
  lifetimeGifts: number,
  baseExemption: number,
  maritalStatus: "single" | "married"
): EstateCalculation {
  const exemption = getFederalExemption(baseExemption, maritalStatus);
  const taxableEstate = Math.max(0, netEstate) + lifetimeGifts;
  const exemptionUsed = Math.min(taxableEstate, exemption);
  const exemptionRemaining = Math.max(0, exemption - taxableEstate);
  const taxableAmount = Math.max(0, taxableEstate - exemption);
  const federalTaxDue = taxableAmount * FEDERAL_TAX_RATE;
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

  if (stateCode === "NY" && netEstate > stateInfo.exemption * 1.05) {
    stateTaxDue = netEstate * 0.16;
  } else {
    const avgRate = stateInfo.maxRate * 0.7;
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
  } else if (additionalTaxIfNoAction < 500000) {
    urgencyLevel = "low";
  } else if (additionalTaxIfNoAction < 2000000) {
    urgencyLevel = "moderate";
  } else if (additionalTaxIfNoAction < 5000000) {
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

function generateOpportunities(
  inputs: CalculatorInputs,
  results: Partial<CalculatorResults>
): PlanningOpportunity[] {
  const opportunities: PlanningOpportunity[] = [];
  const { assets, personal, lifetimeGiftsMade } = inputs;
  const annualGiftPotential =
    personal.maritalStatus === "married"
      ? ANNUAL_GIFT_EXCLUSION * 2
      : ANNUAL_GIFT_EXCLUSION;

  opportunities.push({
    strategy: "Annual Exclusion Gifts",
    description: `Gift up to $${annualGiftPotential.toLocaleString()} per recipient annually without using lifetime exemption.`,
    potentialSavings: annualGiftPotential * FEDERAL_TAX_RATE,
    timeframe: "Ongoing, annually",
    complexity: "simple",
  });

  if (assets.lifeInsurance > 0) {
    const iilitSavings = assets.lifeInsurance * FEDERAL_TAX_RATE;
    opportunities.push({
      strategy: "Irrevocable Life Insurance Trust (ILIT)",
      description: `Remove $${assets.lifeInsurance.toLocaleString()} in life insurance from your estate by transferring to an ILIT.`,
      potentialSavings: iilitSavings,
      timeframe: "3+ months to implement",
      complexity: "moderate",
    });
  }

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

  if (assets.businessInterests > 1000000 || assets.brokerageAccounts > 2000000) {
    opportunities.push({
      strategy: "Grantor Retained Annuity Trust (GRAT)",
      description:
        "Transfer appreciating assets while retaining an income stream. Growth passes tax-free to beneficiaries.",
      potentialSavings:
        (assets.businessInterests + assets.brokerageAccounts) * 0.05 * FEDERAL_TAX_RATE,
      timeframe: "2-10 year trust term",
      complexity: "complex",
    });
  }

  opportunities.push({
    strategy: "Charitable Giving",
    description: "Charitable bequests reduce your taxable estate dollar-for-dollar.",
    potentialSavings: 0,
    timeframe: "Update estate plan",
    complexity: "simple",
  });

  if (results.state && results.state.hasEstateTax && results.state.stateTaxDue > 100000) {
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

export function calculate(inputs: CalculatorInputs): CalculatorResults {
  const { assets, liabilities, personal, lifetimeGiftsMade } = inputs;

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

  const federal = calculateFederalEstate(
    netEstate,
    lifetimeGiftsMade,
    FEDERAL_EXEMPTION_2025,
    personal.maritalStatus
  );
  const state = calculateStateEstate(netEstate, personal.stateOfResidence);
  const totalEstateTax = federal.federalTaxDue + state.stateTaxDue;
  const totalTaxRate = netEstate > 0 ? totalEstateTax / netEstate : 0;
  const sunsetComparison = calculateSunsetComparison(
    netEstate,
    lifetimeGiftsMade,
    personal.maritalStatus
  );

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

  const lifeInsuranceWarning =
    assets.lifeInsurance > 0 &&
    assets.lifeInsurance >
      getFederalExemption(FEDERAL_EXEMPTION_2025, personal.maritalStatus) * 0.1;
  const stateExemptionWarning = state.hasEstateTax && netEstate > state.exemption;
  const sunsetWarning = sunsetComparison.additionalTaxIfNoAction > 500000;

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

  const opportunities = generateOpportunities(inputs, results);

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

  if (state.notes.includes("cliff") && netEstate > state.exemption * 0.9) {
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
