import { formatCurrency } from "@/lib/shared/formatters";
import type {
  CalculatorInputs,
  CalculatorResults,
} from "@/lib/calculators/founder-coverage-planner/types";

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

export function buildActionPlan(args: {
  inputs: CalculatorInputs;
  results: CalculatorResults;
}): ActionPlan {
  const { inputs, results } = args;

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
    actionItems.push({
      key: "action.estimatedTaxes",
      title: "Estimated taxes: set your next payment",
      detail: `Remaining to safe-harbor target: ${formatCurrency(results.quarterlyTaxes.remainingNeeded, 0)}. Suggested per-quarter: ${formatCurrency(results.quarterlyTaxes.perQuarterAmount, 0)}.`,
    });
  }

  for (const alert of results.cashflowAlerts.slice(0, 2)) {
    actionItems.push({
      key: `action.cashflow.${alert}`,
      title: "Cashflow hygiene",
      detail: alert,
    });
  }

  if (results.sCorp.warnings.length > 0) {
    actionItems.push({
      key: "action.salary",
      title: "Owner comp: sanity-check salary vs distributions",
      detail: `Recommended salary range: ${formatCurrency(results.sCorp.salaryRange.min, 0)} to ${formatCurrency(results.sCorp.salaryRange.max, 0)}.`,
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
    actionEvents.push({
      date: results.electionChecklist.deadlineDate,
      title: "S-Corp election: Form 2553 deadline",
      description:
        "Educational reminder: confirm deadline rules and signatures. Consider late-election relief if missed.",
    });
  }

  // Baseline quarterly due dates; actual dates can shift for weekends/holidays.
  const taxYear = Number((inputs.taxYearStartDate || "2026-01-01").slice(0, 4)) || 2026;
  const dueDates = [
    { date: `${taxYear}-04-15`, label: "Q1 estimated tax due" },
    { date: `${taxYear}-06-15`, label: "Q2 estimated tax due" },
    { date: `${taxYear}-09-15`, label: "Q3 estimated tax due" },
    { date: `${taxYear + 1}-01-15`, label: "Q4 estimated tax due" },
  ];

  for (const due of dueDates) {
    actionEvents.push({
      date: due.date,
      title: due.label,
      description: "Educational reminder: verify IRS due dates and state deadlines.",
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

