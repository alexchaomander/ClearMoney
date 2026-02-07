"use client";

import { useMemo, useState, type ReactElement } from "react";
import { AppShell, MethodologySection } from "@/components/shared/AppShell";
import { LoadMyDataBanner } from "@/components/tools/LoadMyDataBanner";
import { formatCurrency } from "@/lib/shared/formatters";
import { calculate } from "@/lib/calculators/founder-coverage-planner/calculations";
import type { CalculatorInputs } from "@/lib/calculators/founder-coverage-planner/types";
import { buildFounderPrefillFromData } from "@/lib/calculators/founder-coverage-planner/prefill";
import { useToolPreset } from "@/lib/strata/presets";
import {
  useBankAccounts,
  useBankTransactions,
  useConsentStatus,
  useFinancialMemory,
  useSpendingSummary,
  useUpdateMemory,
} from "@/lib/strata/hooks";
import { InputSection } from "./components/InputSection";
import { useActionPlan } from "./useActionPlan";

const CHECKLIST_STORAGE_KEY = "founderCoveragePlanner.checklist.v1";

type Scenario = {
  id: string;
  label: string;
  values: Partial<CalculatorInputs>;
};

function loadChecklistState(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(CHECKLIST_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as Record<string, boolean>;
  } catch {
    return {};
  }
}

function persistChecklistState(state: Record<string, boolean>): void {
  try {
    window.localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

function clearChecklistState(): void {
  try {
    window.localStorage.removeItem(CHECKLIST_STORAGE_KEY);
  } catch {
    // ignore
  }
}

function toDateOnlyString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function escapeIcsText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function buildLastNDaysRange(now: Date, days: number): { start: string; end: string } {
  const end = new Date(now);
  const start = new Date(now);
  start.setDate(start.getDate() - days);
  return {
    start: toDateOnlyString(start),
    end: toDateOnlyString(end),
  };
}

const DEFAULT_INPUTS: CalculatorInputs = {
  annualNetIncome: 180000,
  ownersCount: 1,
  employeesCount: 0,
  legalEntityType: "llc",
  fundingPlan: "bootstrapped",
  ownerRole: "operator",
  marketSalary: 120000,
  plannedSalary: 90000,
  payrollAdminCosts: 2500,
  statePayrollTaxRate: 2.5,
  ssWageBase: 170000,
  filingStatus: "single",
  priorYearTax: 35000,
  projectedCurrentTax: 42000,
  federalWithholding: 6000,
  estimatedPayments: 9000,
  currentQuarter: 3,
  entityStartDate: "2025-01-01",
  taxYearStartDate: "2026-01-01",
  taxElection: "s_corp",
  payrollCadence: "biweekly",
  businessAccounts: 1,
  personalAccounts: 2,
  mixedTransactionsPerMonth: 2,
  reimbursementPolicy: "accountable",
  hasEquityGrants: true,
  equityGrantType: "options",
  daysSinceGrant: 18,
  vestingYears: 4,
  cliffMonths: 12,
  strikePrice: 1.25,
  fairMarketValue: 5,
  sharesGranted: 100000,
  exerciseWindowMonths: 90,
  isQualifiedBusiness: true,
  assetsAtIssuance: 12000000,
  expectedHoldingYears: 5,
};

const SCENARIOS: Scenario[] = [
  {
    id: "llc-s-corp",
    label: "LLC + S-Corp election",
    values: {
      legalEntityType: "llc",
      taxElection: "s_corp",
      fundingPlan: "bootstrapped",
      ownerRole: "operator",
      annualNetIncome: 240000,
      marketSalary: 160000,
      plannedSalary: 120000,
      payrollAdminCosts: 3200,
      statePayrollTaxRate: 2.5,
      hasEquityGrants: false,
    },
  },
  {
    id: "vc-c-corp",
    label: "VC-backed C-Corp + equity",
    values: {
      legalEntityType: "c_corp",
      taxElection: "none",
      fundingPlan: "vc",
      ownerRole: "operator",
      annualNetIncome: 0,
      marketSalary: 220000,
      plannedSalary: 180000,
      hasEquityGrants: true,
      equityGrantType: "restricted_stock",
      daysSinceGrant: 18,
      isQualifiedBusiness: true,
      assetsAtIssuance: 12000000,
      expectedHoldingYears: 5,
    },
  },
  {
    id: "agency-contractors",
    label: "Agency w/ contractors",
    values: {
      legalEntityType: "llc",
      taxElection: "s_corp",
      fundingPlan: "bootstrapped",
      ownerRole: "operator",
      annualNetIncome: 320000,
      ownersCount: 2,
      employeesCount: 4,
      payrollAdminCosts: 4200,
      businessAccounts: 1,
      personalAccounts: 2,
      mixedTransactionsPerMonth: 8,
      reimbursementPolicy: "manual",
      hasEquityGrants: false,
    },
  },
];

const METHODOLOGY_ITEMS = [
  "Entity recommendation reflects funding intent, owner role, and income thresholds; confirm with counsel.",
  "S-Corp savings compare self-employment tax vs payroll tax on a reasonable salary, minus admin costs.",
  "Election deadlines use the 2 months + 15 days IRS window from tax-year start or entity start date.",
  "Safe-harbor uses 100% (or 110% for high-income) of prior tax or 90% of projected current tax.",
  "Retirement plan limits use 2026 IRS contribution limits from the limits reference tool.",
  "Cashflow alerts flag commingling risk and missing reimbursement policies.",
  "All outputs are educational estimates and not tax or legal advice.",
];

export function Calculator(): ReactElement {
  const [inputs, setInputs] = useState<CalculatorInputs>(DEFAULT_INPUTS);
  const [prefillApplied, setPrefillApplied] = useState(false);
  const [presetApplied, setPresetApplied] = useState(false);
  const [completed, setCompleted] = useState<Record<string, boolean>>(() =>
    loadChecklistState()
  );

  const { hasConsent: hasMemoryRead } = useConsentStatus(["memory:read"]);
  const { hasConsent: hasMemoryWrite } = useConsentStatus(["memory:read", "memory:write"]);
  const { hasConsent: hasAccountsRead } = useConsentStatus(["accounts:read"]);

  const { data: memory, isSuccess: memoryLoaded } = useFinancialMemory({ enabled: hasMemoryRead });
  const updateMemory = useUpdateMemory();
  const { preset } = useToolPreset<CalculatorInputs>("founder-coverage-planner");

  const { data: bankAccounts, isSuccess: bankLoaded } = useBankAccounts({ enabled: hasAccountsRead });
  const { data: spendingSummary, isSuccess: spendingLoaded } = useSpendingSummary(3, { enabled: hasAccountsRead });

  const now = useMemo(() => new Date(), []);
  const last30 = useMemo(() => buildLastNDaysRange(now, 30), [now]);

  const { data: bankTxPage } = useBankTransactions(
    { start_date: last30.start, end_date: last30.end, page: 1, page_size: 100 },
    { enabled: hasAccountsRead }
  );

  const prefill = useMemo(
    () =>
      buildFounderPrefillFromData({
        memory,
        bankAccounts,
        bankTransactions: bankTxPage?.transactions ?? null,
        now,
      }),
    [memory, bankAccounts, bankTxPage, now]
  );

  const hasPrefillData = prefill.hasRealData && prefill.filledFields.length > 0;
  const prefillLoaded =
    (!hasMemoryRead || memoryLoaded) && (!hasAccountsRead || bankLoaded);

  const prefillDescription = useMemo(() => {
    if (!hasPrefillData) {
      return "Connect accounts and fill out your profile to unlock prefills.";
    }

    const parts: string[] = [];
    if (prefill.sources.snapshot) {
      parts.push("your saved founder snapshot");
    } else {
      if (prefill.sources.memory) parts.push("your profile");
      if (prefill.sources.accounts) parts.push("linked accounts");
    }

    const from = parts.length > 0 ? parts.join(" + ") : "your data";
    return `We can prefill ${prefill.filledFields.length} fields from ${from}.`;
  }, [hasPrefillData, prefill.filledFields.length, prefill.sources]);

  const bankContextLine = useMemo(() => {
    if (!spendingLoaded || !spendingSummary) return null;
    return `Spending summary: ${formatCurrency(spendingSummary.monthly_average, 0)}/mo average over ${spendingSummary.months_analyzed} months (${spendingSummary.start_date} to ${spendingSummary.end_date}).`;
  }, [spendingLoaded, spendingSummary]);

  const results = useMemo(() => calculate(inputs), [inputs]);
  const { showSCorp, actionItems, actionEvents } = useActionPlan({ inputs, results });

  function downloadIcs(): void {
    const stampDate = new Date();
    const dtstamp = stampDate
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}Z$/, "Z");

    const lines: string[] = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//ClearMoney//FounderCoveragePlanner//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
    ];

    let uidCounter = 1;
    for (const event of actionEvents) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(event.date)) continue; // Skip TBD.
      const date = event.date.replaceAll("-", "");
      lines.push("BEGIN:VEVENT");
      lines.push(`UID:${dtstamp}-${uidCounter++}@clearmoney`);
      lines.push(`DTSTAMP:${dtstamp}`);
      lines.push(`DTSTART;VALUE=DATE:${date}`);
      lines.push(`DTEND;VALUE=DATE:${date}`);
      lines.push(`SUMMARY:${escapeIcsText(event.title)}`);
      lines.push(`DESCRIPTION:${escapeIcsText(event.description)}`);
      lines.push("END:VEVENT");
    }

    lines.push("END:VCALENDAR");

    const blob = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "clearmoney-founder-coverage-reminders.ics";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function toggleCompleted(key: string): void {
    setCompleted((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      persistChecklistState(next);
      return next;
    });
  }

  function resetChecklist(): void {
    setCompleted(() => {
      clearChecklistState();
      return {};
    });
  }

  function applyPreset(): void {
    if (!preset) return;
    setInputs((prev) => ({ ...prev, ...preset }));
    setPresetApplied(true);
  }

  function applyMyData(): void {
    if (!hasPrefillData) return;
    setInputs((prev) => ({ ...prev, ...prefill.defaults }));
    setPrefillApplied(true);
  }

  function applyScenario(values: Partial<CalculatorInputs>): void {
    setInputs((prev) => ({ ...prev, ...values }));
  }

  function saveSnapshotToProfile(): void {
    if (!hasMemoryWrite) return;
    const prevNotes = (memory?.notes && typeof memory.notes === "object") ? memory.notes : {};
    const nextNotes = {
      ...(prevNotes as Record<string, unknown>),
      founderCoveragePlanner: {
        version: 1,
        savedAt: new Date().toISOString(),
        inputs,
      },
    };

    updateMemory.mutate({
      notes: nextNotes,
      source: "calculator",
      source_context: "founder-coverage-planner.save",
    });
  }

  return (
    <AppShell>
      <div className="min-h-screen bg-neutral-950">
        <section className="px-4 py-12 sm:py-16">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-sky-400 mb-3">
              Founder Coverage
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Founder Coverage Planner
            </h1>
            <p className="text-lg text-neutral-400">
              Evaluate entity choice, S-Corp savings, payroll planning, and compliance
              checkpoints with a single founder workflow.
            </p>
          </div>
        </section>

        <section className="px-4 pb-16">
          <div className="mx-auto max-w-4xl space-y-10">
            <div className="space-y-4">
              <LoadMyDataBanner
                isLoaded={prefillLoaded}
                hasData={hasPrefillData}
                isApplied={prefillApplied}
                onApply={applyMyData}
                description={prefillDescription}
              />

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4">
                  <p className="text-sm font-semibold text-white">Showcase scenarios</p>
                  <p className="text-xs text-neutral-400 mt-1">
                    One click to illustrate different founder paths.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {SCENARIOS.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => applyScenario(s.values)}
                        className="rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs text-neutral-200 hover:border-neutral-600 transition-colors"
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4">
                  <p className="text-sm font-semibold text-white">Demo prefill</p>
                  <p className="text-xs text-neutral-400 mt-1">
                    Apply a realistic default snapshot for this tool (from tool presets).
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={applyPreset}
                      disabled={!preset}
                      className="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-neutral-950 disabled:opacity-50"
                    >
                      {presetApplied ? "Re-apply preset" : "Apply preset"}
                    </button>
                    <button
                      type="button"
                      onClick={saveSnapshotToProfile}
                      disabled={!hasMemoryWrite}
                      className="rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs text-neutral-200 hover:border-neutral-600 transition-colors disabled:opacity-50"
                    >
                      Save snapshot to profile
                    </button>
                  </div>
                  {bankContextLine && (
                    <p className="mt-3 text-xs text-neutral-500">{bankContextLine}</p>
                  )}
                </div>
              </div>
            </div>

            <InputSection inputs={inputs} setInputs={setInputs} />

            <div className="rounded-2xl bg-neutral-900 p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white mb-1">
                    Action plan
                  </h2>
                  <p className="text-sm text-neutral-400">
                    A short, prioritized checklist. Educational only, verify deadlines.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={resetChecklist}
                    className="inline-flex items-center justify-center rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2 text-sm text-neutral-200 hover:border-neutral-600 transition-colors"
                  >
                    Reset checks
                  </button>
                  <button
                    type="button"
                    onClick={downloadIcs}
                    className="inline-flex items-center justify-center rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2 text-sm text-neutral-200 hover:border-neutral-600 transition-colors"
                  >
                    Download calendar (.ics)
                  </button>
                </div>
              </div>

              {actionItems.length === 0 ? (
                <p className="mt-4 text-sm text-neutral-400">
                  No urgent actions detected for this snapshot.
                </p>
              ) : (
                <ul className="mt-4 space-y-2 text-sm text-neutral-200">
                  {actionItems.map((item) => (
                    <li
                      key={item.key}
                      className="flex items-start gap-3 rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3"
                    >
                      <button
                        type="button"
                        onClick={() => toggleCompleted(item.key)}
                        className="mt-0.5 h-5 w-5 rounded border border-neutral-700 flex items-center justify-center"
                        aria-label="Mark complete"
                      >
                        {completed[item.key] && <span className="text-xs text-emerald-300">✓</span>}
                      </button>
                      <div className="flex-1">
                        <p className="font-semibold text-white">{item.title}</p>
                        <p className="text-neutral-400">{item.detail}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-2xl bg-neutral-900 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                Entity recommendation
              </h2>
              <p className="text-sm text-neutral-400 mb-4">
                {results.entity.summary}
              </p>
              <div className="flex flex-wrap gap-3">
                <div className="rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3">
                  <p className="text-xs text-neutral-400">Recommended entity</p>
                  <p className="text-lg text-white font-semibold capitalize">
                    {results.entity.recommendedLegalEntity.replace("_", " ")}
                  </p>
                </div>
                <div className="rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 flex-1">
                  <p className="text-xs text-neutral-400 mb-2">Why</p>
                  <ul className="text-sm text-neutral-200 space-y-1">
                    {results.entity.reasons.map((reason) => (
                      <li key={reason}>• {reason}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3">
                  <p className="text-xs text-neutral-400">Tax election</p>
                  <p className="text-lg text-white font-semibold">
                    {results.entity.recommendedTaxElection === "s_corp" ? "S-Corp election" : "None"}
                  </p>
                </div>
              </div>
            </div>

            {showSCorp && (
              <div className="rounded-2xl bg-neutral-900 p-6">
                <h2 className="text-xl font-semibold text-white mb-4">
                  {inputs.taxElection === "s_corp" ? "S-Corp savings" : "S-Corp scenario (what-if)"}
                </h2>
                {inputs.taxElection !== "s_corp" && (
                  <p className="text-sm text-neutral-400 mb-4">
                    You have not selected an S-Corp election. These numbers show a simplified
                    scenario for comparison.
                  </p>
                )}
                <div className="grid gap-4 md:grid-cols-3">
                  <StatCard
                    label="Recommended salary"
                    value={formatCurrency(results.sCorp.recommendedSalary, 0)}
                    helper={`Range ${formatCurrency(results.sCorp.salaryRange.min, 0)} - ${formatCurrency(results.sCorp.salaryRange.max, 0)}`}
                  />
                  <StatCard
                    label="Payroll tax estimate"
                    value={formatCurrency(results.sCorp.payrollTax, 0)}
                    helper="Includes employee + employer FICA + state payroll"
                  />
                  <StatCard
                    label="Estimated net savings"
                    value={formatCurrency(results.sCorp.estimatedSavings, 0)}
                    helper="After payroll admin costs"
                  />
                </div>
                {results.sCorp.warnings.length > 0 && (
                  <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
                    <p className="font-semibold mb-2">Watchouts</p>
                    <ul className="space-y-1">
                      {results.sCorp.warnings.map((warning) => (
                        <li key={warning}>• {warning}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {showSCorp && (
              <div className="rounded-2xl bg-neutral-900 p-6">
                <h2 className="text-xl font-semibold text-white mb-4">
                  S-Corp election checklist
                </h2>
                {results.electionChecklist.status === "not-applicable" ? (
                  <p className="text-sm text-neutral-400">
                    Select S-Corp election above to see a deadline countdown and checklist.
                  </p>
                ) : (
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                      <StatCard
                        label="Election deadline"
                        value={results.electionChecklist.deadlineDate}
                      />
                      <StatCard
                        label="Days remaining"
                        value={`${results.electionChecklist.daysRemaining} days`}
                      />
                      <StatCard
                        label="Status"
                        value={results.electionChecklist.status.replace("-", " ")}
                      />
                    </div>
                    <ul className="text-sm text-neutral-300 space-y-1">
                      {results.electionChecklist.items.map((item) => (
                        <li key={item}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="rounded-2xl bg-neutral-900 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                Payroll + distributions
              </h2>
              <div className="grid gap-4 md:grid-cols-3">
                <StatCard
                  label="Distribution estimate"
                  value={formatCurrency(
                    results.payrollPlan.distributionEstimate,
                    0
                  )}
                  helper="Net income minus W-2 salary"
                />
                <StatCard
                  label="Payroll tax"
                  value={formatCurrency(results.payrollPlan.payrollTax, 0)}
                  helper="Based on wage base + state payroll"
                />
                <StatCard
                  label="Recommended salary"
                  value={formatCurrency(results.payrollPlan.recommendedSalary, 0)}
                />
              </div>
              <ul className="mt-4 text-sm text-neutral-300 space-y-1">
                {results.payrollPlan.guidance.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl bg-neutral-900 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                Quarterly tax plan
              </h2>
              <div className="grid gap-4 md:grid-cols-3">
                <StatCard
                  label="Safe-harbor target"
                  value={formatCurrency(
                    results.quarterlyTaxes.safeHarborTarget,
                    0
                  )}
                  helper={`Based on ${results.quarterlyTaxes.safeHarborType.replace("-", " ")}`}
                />
                <StatCard
                  label="Remaining due"
                  value={formatCurrency(results.quarterlyTaxes.remainingNeeded, 0)}
                  helper={`${results.quarterlyTaxes.quartersRemaining} quarters left`}
                />
                <StatCard
                  label="Per-quarter payment"
                  value={formatCurrency(results.quarterlyTaxes.perQuarterAmount, 0)}
                />
              </div>
              <ul className="mt-4 text-sm text-neutral-300 space-y-1">
                {results.quarterlyTaxes.notes.map((note) => (
                  <li key={note}>• {note}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl bg-neutral-900 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                Retirement plan fit
              </h2>
              <div className="grid gap-4 md:grid-cols-3">
                <StatCard
                  label="Recommended plan"
                  value={results.retirement.recommendedPlan
                    .replace("_", " ")
                    .toUpperCase()}
                  helper="2026 IRS limits"
                />
                <StatCard
                  label="Employee deferral"
                  value={formatCurrency(
                    results.retirement.employeeDeferralLimit,
                    0
                  )}
                />
                <StatCard
                  label="Total limit"
                  value={formatCurrency(results.retirement.totalLimit, 0)}
                />
              </div>
              <ul className="mt-4 text-sm text-neutral-300 space-y-1">
                {results.retirement.notes.map((note) => (
                  <li key={note}>• {note}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl bg-neutral-900 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                Compliance checklist
              </h2>
              <ul className="text-sm text-neutral-300 space-y-2">
                {results.complianceChecklist.map((item) => {
                  const key = `compliance:${item}`;
                  return (
                    <li key={item} className="flex items-start gap-3">
                      <button
                        type="button"
                        onClick={() => toggleCompleted(key)}
                        className="mt-0.5 h-5 w-5 rounded border border-neutral-700 flex items-center justify-center"
                        aria-label="Mark complete"
                      >
                        {completed[key] && <span className="text-xs text-emerald-300">✓</span>}
                      </button>
                      <span>• {item}</span>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-4 rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-neutral-400 mb-2">
                  Document vault reminders
                </p>
                <ul className="text-sm text-neutral-300 space-y-2">
                  {results.complianceReminders.map((item) => {
                    const key = `vault:${item}`;
                    return (
                      <li key={item} className="flex items-start gap-3">
                        <button
                          type="button"
                          onClick={() => toggleCompleted(key)}
                          className="mt-0.5 h-5 w-5 rounded border border-neutral-700 flex items-center justify-center"
                          aria-label="Mark complete"
                        >
                          {completed[key] && <span className="text-xs text-emerald-300">✓</span>}
                        </button>
                        <span>• {item}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            <div className="rounded-2xl bg-neutral-900 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                Business vs personal cashflow
              </h2>
              <ul className="text-sm text-neutral-300 space-y-1">
                {results.cashflowSeparationTips.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
              {results.cashflowAlerts.length > 0 && (
                <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">
                  <p className="font-semibold mb-2">Commingling alerts</p>
                  <ul className="space-y-1">
                    {results.cashflowAlerts.map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="rounded-2xl bg-neutral-900 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                Founder equity
              </h2>
              <div className="grid gap-4 md:grid-cols-3">
                <StatCard
                  label="83(b) status"
                  value={results.equityChecklist.deadlineStatus.replace("-", " ")}
                />
                <StatCard
                  label="QSBS status"
                  value={results.equityChecklist.qsbsStatus}
                />
                <StatCard
                  label="Holding years"
                  value={`${inputs.expectedHoldingYears} yrs`}
                />
              </div>
              <ul className="mt-4 text-sm text-neutral-300 space-y-1">
                {results.equityChecklist.items.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>

            <MethodologySection title="Methodology">
              <ul className="text-sm text-neutral-400 space-y-2 list-disc pl-5">
                {METHODOLOGY_ITEMS.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </MethodologySection>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function StatCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper?: string;
}) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3">
      <p className="text-xs text-neutral-400">{label}</p>
      <p className="text-lg text-white font-semibold">{value}</p>
      {helper && <p className="text-xs text-neutral-500 mt-1">{helper}</p>}
    </div>
  );
}
