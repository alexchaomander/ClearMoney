import { formatCurrency } from "@/lib/shared/formatters";
import type {
  CalculatorInputs,
  CalculatorResults,
} from "@/lib/calculators/founder-coverage-planner/types";
import { nextBusinessDayDateOnlyUtc, type DateOnly, isDateOnly } from "./dateUtils";
import { stripCurrencyLikeText } from "./snapshotShare";
import { getStateEstimatedTaxRule } from "./stateEstimatedTaxes";

export type ActionItem = {
  title: string;
  detail: string;
  key: string;
};

export type CalendarEvent = {
  date: string;
  title: string;
  description: string;
};

export type ActionPlan = {
  showSCorp: boolean;
  actionItems: ActionItem[];
  actionEvents: CalendarEvent[];
};

const STATES_WITH_NO_INCOME_TAX = new Set([
  "AK",
  "FL",
  "NV",
  "SD",
  "TN",
  "TX",
  "WA",
  "WY",
]);

function getFederalEstimatedTaxDueDates(taxYear: number): Array<{ date: DateOnly; label: string }> {
  const q1 = nextBusinessDayDateOnlyUtc(`${taxYear}-04-15`);
  const q2 = nextBusinessDayDateOnlyUtc(`${taxYear}-06-15`);
  const q3 = nextBusinessDayDateOnlyUtc(`${taxYear}-09-15`);
  const q4 = nextBusinessDayDateOnlyUtc(`${taxYear + 1}-01-15`);
  return [
    { date: q1, label: "Federal Q1 estimated tax due" },
    { date: q2, label: "Federal Q2 estimated tax due" },
    { date: q3, label: "Federal Q3 estimated tax due" },
    { date: q4, label: "Federal Q4 estimated tax due" },
  ];
}

function getStateEstimatedTaxDueDates(args: {
  stateCode: string;
  taxYear: number;
}): Array<{ date: DateOnly; label: string }> {
  const { stateCode, taxYear } = args;
  const normalized = stateCode.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(normalized)) return [];
  if (STATES_WITH_NO_INCOME_TAX.has(normalized)) return [];

  const rule = getStateEstimatedTaxRule(normalized);
  if (rule) {
    return rule.dueDates(taxYear).map((d) => ({ date: d.date, label: d.label }));
  }

  // Fallback: show a generic state reminder aligned with federal dates.
  return getFederalEstimatedTaxDueDates(taxYear).map((d) => ({
    date: d.date,
    label: `${normalized} estimated tax due`,
  }));
}

export function buildActionPlan(args: {
  inputs: CalculatorInputs;
  results: CalculatorResults;
  redacted?: boolean;
}): ActionPlan {
  const { inputs, results, redacted = false } = args;

  const showSCorp =
    inputs.taxElection === "s_corp" ||
    results.entity.recommendedTaxElection === "s_corp";

  const actionItems: ActionItem[] = [];

  const electionStatus = results.electionChecklist.status;
  if (electionStatus === "urgent" || electionStatus === "missed") {
    const titleSuffix = electionStatus === "missed" ? "missed deadline" : "file this week";
    const detail =
      electionStatus === "missed"
        ? `Deadline was ${results.electionChecklist.deadlineDate}. Check late-election relief with a CPA.`
        : `Deadline: ${results.electionChecklist.deadlineDate} (${results.electionChecklist.daysRemaining} days left).`;

    actionItems.push({
      key: "action.2553",
      title: `Form 2553: ${titleSuffix}`,
      detail,
    });
  }

  if (results.quarterlyTaxes.remainingNeeded > 0) {
    const detail = `Remaining to safe-harbor target: ${formatCurrency(results.quarterlyTaxes.remainingNeeded, 0)}. Suggested per-quarter: ${formatCurrency(results.quarterlyTaxes.perQuarterAmount, 0)}.`;
    actionItems.push({
      key: "action.estimatedTaxes",
      title: "Estimated taxes: set your next payment",
      detail: redacted ? stripCurrencyLikeText(detail) : detail,
    });
  }

  for (const alert of results.cashflowAlerts.slice(0, 2)) {
    actionItems.push({
      key: `action.cashflow.${alert}`,
      title: "Cashflow hygiene",
      detail: alert,
    });
  }

  if (inputs.mixedTransactionsPerMonth >= 4 && inputs.reimbursementPolicy !== "accountable") {
    actionItems.push({
      key: "action.reimbursementPolicy",
      title: "Commingling: set a reimbursement policy",
      detail:
        "If you have personal-ish spending on business accounts, an accountable plan helps track reimbursements and keep the books clean.",
    });
  }

  if (results.sCorp.warnings.length > 0) {
    const detail = `Recommended salary range: ${formatCurrency(results.sCorp.salaryRange.min, 0)} to ${formatCurrency(results.sCorp.salaryRange.max, 0)}.`;
    actionItems.push({
      key: "action.salary",
      title: "Owner comp: sanity-check salary vs distributions",
      detail: redacted ? stripCurrencyLikeText(detail) : detail,
    });
  }

  const equityStatus = results.equityChecklist.deadlineStatus;
  if (equityStatus === "urgent" || equityStatus === "missed") {
    actionItems.push({
      key: "action.83b",
      title: `83(b): ${equityStatus === "missed" ? "deadline passed" : "deadline approaching"}`,
      detail: results.equityChecklist.items[0] ?? "Review 83(b) timing with counsel.",
    });
  }

  const actionEvents: CalendarEvent[] = [];

  if (
    results.electionChecklist.status !== "not-applicable" &&
    results.electionChecklist.deadlineDate
  ) {
    const deadline = isDateOnly(results.electionChecklist.deadlineDate)
      ? nextBusinessDayDateOnlyUtc(results.electionChecklist.deadlineDate)
      : results.electionChecklist.deadlineDate;
    actionEvents.push({
      date: deadline,
      title: "S-Corp election: Form 2553 deadline",
      description:
        "Educational reminder: confirm deadline rules and signatures. Consider late-election relief if missed.",
    });
  }

  // Baseline quarterly due dates adjusted for weekends and common federal holidays.
  const taxYear = Number((inputs.taxYearStartDate || "2026-01-01").slice(0, 4)) || 2026;
  for (const due of getFederalEstimatedTaxDueDates(taxYear)) {
    actionEvents.push({
      date: due.date,
      title: due.label,
      description: "Educational reminder: verify IRS due dates and payment methods.",
    });
  }

  const stateCode = inputs.stateCode;
  for (const due of getStateEstimatedTaxDueDates({ stateCode, taxYear })) {
    actionEvents.push({
      date: due.date,
      title: due.label,
      description: `Educational reminder: confirm ${stateCode.toUpperCase()} due dates and state-specific rules.`,
    });
  }

  if (
    results.equityChecklist.deadlineStatus !== "not-applicable" &&
    inputs.equityGrantType === "restricted_stock"
  ) {
    const daysRemaining = Math.max(0, 30 - inputs.daysSinceGrant);
    actionEvents.push({
      date: "TBD",
      title: "83(b) election deadline (approx)",
      description: `Based on ${inputs.daysSinceGrant} days since grant, ~${daysRemaining} days remaining. Verify actual grant/exercise date.`,
    });
  }

  return {
    showSCorp,
    actionItems: actionItems.slice(0, 5),
    actionEvents,
  };
}
