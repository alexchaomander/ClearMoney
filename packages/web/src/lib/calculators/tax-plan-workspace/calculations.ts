import type {
  FilingStatus,
  StrategyImpact,
  TaxPlanResults,
  WorkspaceInputs,
} from "./types";

const STANDARD_DEDUCTION: Record<FilingStatus, number> = {
  single: 14600,
  married: 29200,
  head_of_household: 21900,
};

const DEFAULT_STATE_RATE = 0.05;

const NO_INCOME_TAX_STATES = new Set([
  "AK",
  "FL",
  "NV",
  "NH",
  "SD",
  "TN",
  "TX",
  "WA",
  "WY",
]);

function normalizeMoney(value: number): number {
  if (!Number.isFinite(value) || value < 0) return 0;
  return value;
}

function federalOrdinaryRate(ordinaryIncome: number): number {
  if (ordinaryIncome < 50000) return 0.12;
  if (ordinaryIncome < 110000) return 0.22;
  if (ordinaryIncome < 210000) return 0.24;
  if (ordinaryIncome < 350000) return 0.32;
  return 0.35;
}

function federalCapitalGainsRate(taxableOrdinaryIncome: number): number {
  if (taxableOrdinaryIncome < 47000) return 0;
  if (taxableOrdinaryIncome < 518000) return 0.15;
  return 0.2;
}

function stateRate(stateCode: string): number {
  const normalized = stateCode.trim().toUpperCase();
  return NO_INCOME_TAX_STATES.has(normalized) ? 0 : DEFAULT_STATE_RATE;
}

function buildAdvisorBrief(
  inputs: WorkspaceInputs,
  results: TaxPlanResults,
  federalRate: number,
  stRate: number
): string {
  const householdName = inputs.clientName.trim() || "Client household";
  const lines: string[] = [];

  lines.push(`${householdName} - Tax Plan Workspace Summary`);
  lines.push(`Mode: ${inputs.mode === "advisor" ? "Advisor" : "Individual"}`);
  lines.push(
    `Baseline tax: $${Math.round(results.baselineTax).toLocaleString()} | Projected tax: $${Math.round(results.projectedTax).toLocaleString()}`
  );
  lines.push(
    `Estimated savings: $${Math.round(results.estimatedSavings).toLocaleString()} | Confidence: ${results.confidenceLabel} (${results.confidenceScore}/100)`
  );
  lines.push(
    `Rates used: ${Math.round(federalRate * 100)}% federal ordinary, ${Math.round(stRate * 100)}% state`
  );

  if (results.strategyImpacts.length > 0) {
    lines.push("Top strategy impacts:");
    for (const impact of results.strategyImpacts.slice(0, 3)) {
      lines.push(
        `- ${impact.title}: +$${Math.round(impact.savings).toLocaleString()} estimated savings (${impact.confidence} confidence)`
      );
    }
  }

  lines.push("Action plan:");
  for (const action of results.topActions.slice(0, 4)) {
    lines.push(`- [${action.priority}] ${action.title} (${action.owner}) - ${action.detail}`);
  }

  lines.push("Educational estimate only. Confirm implementation with a tax professional.");
  return lines.join("\n");
}

export function calculate(inputs: WorkspaceInputs): TaxPlanResults {
  const wages = normalizeMoney(inputs.wagesIncome);
  const otherIncome = normalizeMoney(inputs.otherOrdinaryIncome);
  const shortTermGains = normalizeMoney(inputs.shortTermGains);
  const longTermGains = normalizeMoney(inputs.longTermGains);
  const withholding = normalizeMoney(inputs.currentWithholding);
  const quarterlyPayments = normalizeMoney(inputs.quarterlyPaymentsMade);

  const grossOrdinary = wages + otherIncome + shortTermGains;
  const taxableOrdinary = Math.max(
    0,
    grossOrdinary - STANDARD_DEDUCTION[inputs.filingStatus]
  );

  const fedOrdRate = federalOrdinaryRate(taxableOrdinary);
  const fedCapRate = federalCapitalGainsRate(taxableOrdinary);
  const stRate = stateRate(inputs.stateCode);

  const ordinaryTax = taxableOrdinary * (fedOrdRate + stRate);
  const capitalTax = longTermGains * (fedCapRate + stRate);
  const baselineTax = ordinaryTax + capitalTax;

  const strategyImpacts: StrategyImpact[] = [];

  if (inputs.strategies.hsa) {
    const maxHsa = Math.min(normalizeMoney(inputs.hsaRemainingRoom), 10000);
    const savings = maxHsa * (fedOrdRate + stRate + 0.0765);
    strategyImpacts.push({
      id: "hsa",
      title: "Max remaining HSA contributions",
      savings,
      confidence: maxHsa > 0 ? "high" : "low",
      detail:
        maxHsa > 0
          ? `Contribute up to $${Math.round(maxHsa).toLocaleString()} pre-tax while eligible.`
          : "No remaining HSA room entered.",
      assumptions: [
        "Assumes HDHP eligibility for contributions.",
        "Includes federal, state (if applicable), and employee FICA savings.",
      ],
    });
  }

  if (inputs.strategies.pretax401k) {
    const room = Math.min(normalizeMoney(inputs.pretax401kRemainingRoom), 50000);
    const savings = room * (fedOrdRate + stRate);
    strategyImpacts.push({
      id: "pretax401k",
      title: "Increase pre-tax retirement deferrals",
      savings,
      confidence: room > 0 ? "high" : "low",
      detail:
        room > 0
          ? `Shift up to $${Math.round(room).toLocaleString()} from taxable pay into pre-tax accounts.`
          : "No remaining pre-tax contribution room entered.",
      assumptions: [
        "Assumes additional deferrals are feasible from payroll/cash flow.",
        "Savings shown as current-year tax deferral.",
      ],
    });
  }

  if (inputs.strategies.lossHarvesting) {
    const harvestableLosses = Math.min(
      normalizeMoney(inputs.harvestableLosses),
      longTermGains + shortTermGains + 3000
    );
    const blendedRate = (fedOrdRate + stRate) * 0.65 + (fedCapRate + stRate) * 0.35;
    const savings = harvestableLosses * blendedRate;
    strategyImpacts.push({
      id: "lossHarvesting",
      title: "Harvest available investment losses",
      savings,
      confidence: harvestableLosses > 0 ? "medium" : "low",
      detail:
        harvestableLosses > 0
          ? `Use up to $${Math.round(harvestableLosses).toLocaleString()} in losses against gains and ordinary income limits.`
          : "No harvestable losses or taxable gains entered.",
      assumptions: [
        "Assumes losses can be realized without violating wash-sale rules.",
        "Uses blended effective tax rate across gain types.",
      ],
    });
  }

  if (inputs.strategies.donationBunching) {
    const donation = Math.min(normalizeMoney(inputs.donationAmount), 500000);
    const savings = donation * (fedOrdRate + stRate) * 0.8;
    strategyImpacts.push({
      id: "donationBunching",
      title: "Bunch charitable giving into itemized years",
      savings,
      confidence: donation > 0 ? "medium" : "low",
      detail:
        donation > 0
          ? `Bunch around $${Math.round(donation).toLocaleString()} of donations for higher deduction efficiency.`
          : "No donation amount entered.",
      assumptions: [
        "Assumes donation timing can be shifted into one tax year.",
        "Applies a haircut for deduction limits and non-itemized years.",
      ],
    });
  }

  const estimatedSavings = strategyImpacts.reduce((sum, item) => sum + item.savings, 0);
  const projectedTax = Math.max(0, baselineTax - estimatedSavings);

  const totalPaidSoFar = withholding + quarterlyPayments;
  const withholdingGap = projectedTax - totalPaidSoFar;

  const safeHarborTarget = Math.min(baselineTax, projectedTax * 0.9);
  const safeHarborGap = Math.max(0, safeHarborTarget - totalPaidSoFar);

  const highConfidenceCount = strategyImpacts.filter((s) => s.confidence === "high").length;
  const mediumConfidenceCount = strategyImpacts.filter((s) => s.confidence === "medium").length;
  const hasCoreInputs = wages > 0 && inputs.filingStatus.length > 0;
  const confidenceScore = Math.max(
    35,
    Math.min(
      96,
      (hasCoreInputs ? 52 : 35) + highConfidenceCount * 12 + mediumConfidenceCount * 7
    )
  );

  const confidenceLabel: TaxPlanResults["confidenceLabel"] =
    confidenceScore >= 80 ? "High" : confidenceScore >= 62 ? "Medium" : "Low";

  const topActions: TaxPlanResults["topActions"] = [];

  for (const impact of strategyImpacts
    .filter((impact) => impact.savings > 0)
    .sort((a, b) => b.savings - a.savings)
    .slice(0, 3)) {
    topActions.push({
      key: `strategy-${impact.id}`,
      title: impact.title,
      priority: impact.savings > 2000 ? "High" : "Medium",
      owner: inputs.mode === "advisor" ? "Advisor" : "Client",
      detail: impact.detail,
    });
  }

  if (withholdingGap > 500) {
    topActions.push({
      key: "withholding-gap",
      title: "Increase withholding / estimated tax payments",
      priority: "High",
      owner: inputs.mode === "advisor" ? "Advisor" : "Client",
      detail: `Projected shortfall is about $${Math.round(withholdingGap).toLocaleString()}. Adjust payroll or next quarterly payment.`,
    });
  }

  if (safeHarborGap > 0) {
    topActions.push({
      key: "safe-harbor",
      title: "Close safe-harbor gap",
      priority: safeHarborGap > 2000 ? "High" : "Medium",
      owner: inputs.mode === "advisor" ? "Advisor" : "Client",
      detail: `Need about $${Math.round(safeHarborGap).toLocaleString()} more to meet safe-harbor target.`,
    });
  }

  if (topActions.length === 0) {
    topActions.push({
      key: "monitor",
      title: "Monitor quarterly and refresh inputs",
      priority: "Medium",
      owner: inputs.mode === "advisor" ? "Advisor" : "Client",
      detail: "Current inputs indicate no immediate tax gap. Re-run after income or gains change.",
    });
  }

  const sortedImpacts = [...strategyImpacts].sort((a, b) => b.savings - a.savings);

  const partialResults: Omit<TaxPlanResults, "advisorBrief"> = {
    baselineTax,
    projectedTax,
    estimatedSavings,
    withholdingGap,
    safeHarborTarget,
    safeHarborGap,
    confidenceScore,
    confidenceLabel,
    strategyImpacts: sortedImpacts,
    topActions,
  };

  const advisorBrief = buildAdvisorBrief(
    inputs,
    { ...partialResults, advisorBrief: "" },
    fedOrdRate,
    stRate
  );

  return {
    ...partialResults,
    advisorBrief,
  };
}
