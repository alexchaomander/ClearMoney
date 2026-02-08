"use client";

import { useMemo, useState, type ReactElement } from "react";
import Link from "next/link";
import { AppShell, MethodologySection } from "@/components/shared/AppShell";
import { LoadMyDataBanner } from "@/components/tools/LoadMyDataBanner";
import { formatCurrency } from "@/lib/shared/formatters";
import { calculate } from "@/lib/calculators/founder-coverage-planner/calculations";
import type { CalculatorInputs } from "@/lib/calculators/founder-coverage-planner/types";
import { buildFounderPrefillFromData } from "@/lib/calculators/founder-coverage-planner/prefill";
import {
  INFLOW_CATEGORIES,
  looksBusinessAccount,
  PERSONALISH_CATEGORIES,
} from "@/lib/calculators/founder-coverage-planner/bankingHeuristics";
import { buildActionPlan } from "@/lib/calculators/founder-coverage-planner/actionPlan";
import {
  encodeFounderCoverageSharePayload,
  stripCurrencyLikeText,
} from "@/lib/calculators/founder-coverage-planner/snapshotShare";
import {
  FOUNDER_COVERAGE_CHECKLIST_STORAGE_KEY,
  FOUNDER_COVERAGE_ONBOARDING_STORAGE_KEY,
} from "@/lib/calculators/founder-coverage-planner/storage";
import { useToolPreset } from "@/lib/strata/presets";
import {
  useBankAccounts,
  useBankTransactions,
  useConsentStatus,
  useFinancialMemory,
  useSpendingSummary,
  useUpdateMemory,
} from "@/lib/strata/hooks";
import { useStrataClient } from "@/lib/strata/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InputSection } from "./components/InputSection";
import { useActionPlan } from "./useActionPlan";

type Scenario = {
  id: string;
  label: string;
  values: Partial<CalculatorInputs>;
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function loadChecklistState(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(FOUNDER_COVERAGE_CHECKLIST_STORAGE_KEY);
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
    window.localStorage.setItem(
      FOUNDER_COVERAGE_CHECKLIST_STORAGE_KEY,
      JSON.stringify(state)
    );
  } catch {
    // ignore
  }
}

function clearChecklistState(): void {
  try {
    window.localStorage.removeItem(FOUNDER_COVERAGE_CHECKLIST_STORAGE_KEY);
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
  stateCode: "CA",
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

function loadOnboardingInputs(): Partial<CalculatorInputs> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(FOUNDER_COVERAGE_ONBOARDING_STORAGE_KEY);
    if (!raw) return null;
    window.sessionStorage.removeItem(FOUNDER_COVERAGE_ONBOARDING_STORAGE_KEY);
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return null;
    return parsed as Partial<CalculatorInputs>;
  } catch {
    return null;
  }
}

type ReimbursedTxMeta = { reimbursedAt: string; memo: string };

function loadInitialInputs(): CalculatorInputs {
  const onboarding = loadOnboardingInputs();
  if (!onboarding) return DEFAULT_INPUTS;
  return { ...DEFAULT_INPUTS, ...onboarding };
}

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
  const client = useStrataClient();
  const queryClient = useQueryClient();
  const [inputs, setInputs] = useState<CalculatorInputs>(() => loadInitialInputs());
  const [prefillApplied, setPrefillApplied] = useState(false);
  const [presetApplied, setPresetApplied] = useState(false);
  const [lastPrefillSummary, setLastPrefillSummary] = useState<string | null>(null);
  const [shareBusy, setShareBusy] = useState(false);
  const [reimbursementMemos, setReimbursementMemos] = useState<Record<string, string>>({});
  const [completed, setCompleted] = useState<Record<string, boolean>>(() =>
    loadChecklistState()
  );

  const { hasConsent: hasMemoryRead } = useConsentStatus(["memory:read"]);
  const { hasConsent: hasMemoryWrite } = useConsentStatus(["memory:read", "memory:write"]);
  const { hasConsent: hasAccountsRead } = useConsentStatus(["accounts:read"]);
  const { hasConsent: hasAccountsWrite } = useConsentStatus(["accounts:write"]);

  const { data: memory, isSuccess: memoryLoaded } = useFinancialMemory({ enabled: hasMemoryRead });
  const updateMemory = useUpdateMemory();
  const { preset } = useToolPreset<CalculatorInputs>("founder-coverage-planner");

  const { data: bankAccounts, isSuccess: bankLoaded } = useBankAccounts({ enabled: hasAccountsRead });
  const { data: spendingSummary, isSuccess: spendingLoaded } = useSpendingSummary(3, { enabled: hasAccountsRead });

  const now = useMemo(() => new Date(), []);
  const last30 = useMemo(() => buildLastNDaysRange(now, 30), [now]);
  const last90 = useMemo(() => buildLastNDaysRange(now, 90), [now]);

  const { data: bankTxPage } = useBankTransactions(
    { start_date: last30.start, end_date: last30.end, page: 1, page_size: 100 },
    { enabled: hasAccountsRead }
  );

  const { data: bankTx90Page } = useBankTransactions(
    { start_date: last90.start, end_date: last90.end, page: 1, page_size: 250 },
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

  const reimbursedTxById = useMemo<Record<string, ReimbursedTxMeta>>(() => {
    const tx = bankTx90Page?.transactions ?? [];
    const map: Record<string, ReimbursedTxMeta> = {};
    for (const t of tx) {
      if (!t.reimbursed_at) continue;
      map[t.id] = { reimbursedAt: t.reimbursed_at, memo: t.reimbursement_memo ?? "" };
    }
    return map;
  }, [bankTx90Page?.transactions]);

  const updateReimbursement = useMutation({
    mutationFn: (args: { transactionId: string; reimbursed: boolean; memo?: string | null }) => {
      return client.updateBankTransactionReimbursement(args.transactionId, {
        reimbursed: args.reimbursed,
        memo: args.memo ?? null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banking", "transactions"] });
    },
  });

  const comminglingInsight = useMemo(() => {
    if (!bankAccounts || bankAccounts.length === 0) return null;
    const tx = bankTx90Page?.transactions;
    if (!tx || tx.length === 0) return null;

    const businessAccounts = bankAccounts.filter(looksBusinessAccount);
    if (businessAccounts.length === 0) return null;

    const businessIds = new Set(businessAccounts.map((a) => a.id));
    const eligible: typeof tx = [];
    const commingling: typeof tx = [];

    for (const t of tx) {
      if (!businessIds.has(t.cash_account_id)) continue;
      if (!t.primary_category) continue;
      if (INFLOW_CATEGORIES.has(t.primary_category)) continue;
      eligible.push(t);
      if (PERSONALISH_CATEGORIES.has(t.primary_category) && !t.reimbursed_at) {
        commingling.push(t);
      }
    }

    if (eligible.length < 10) return null;

    const examples = new Map<
      string,
      { merchant: string; count: number; sample: string[] }
    >();

    for (const t of commingling) {
      const merchant = (t.merchant_name ?? t.name ?? "Unknown").trim();
      const key = merchant.toLowerCase();
      const row = examples.get(key) ?? { merchant, count: 0, sample: [] };
      row.count += 1;
      if (row.sample.length < 2) {
        row.sample.push(`${t.transaction_date}: ${t.name} (${formatCurrency(Math.abs(t.amount), 0)})`);
      }
      examples.set(key, row);
    }

    const top = [...examples.values()]
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    const flagged = commingling
      .slice()
      .sort((a, b) => b.transaction_date.localeCompare(a.transaction_date))
      .slice(0, 25)
      .map((t) => ({
        id: t.id,
        transactionDate: t.transaction_date,
        name: t.name,
        merchantName: t.merchant_name ?? null,
        amount: t.amount,
        primaryCategory: t.primary_category ?? null,
        reimbursedAt: t.reimbursed_at ?? null,
        memo: t.reimbursement_memo ?? "",
      }));

    return {
      startDate: last90.start,
      endDate: last90.end,
      businessAccountNames: businessAccounts.map((a) => a.name),
      eligibleCount: eligible.length,
      comminglingCount: commingling.length,
      comminglingRate: commingling.length / eligible.length,
      topExamples: top,
      flaggedTransactions: flagged,
    };
  }, [bankAccounts, bankTx90Page?.transactions, last90.end, last90.start]);

  const comminglingTrend = useMemo(() => {
    const notes = memory?.notes;
    if (!isPlainObject(notes)) return null;
    const founder = notes["founderCoveragePlanner"];
    if (!isPlainObject(founder)) return null;
    if (founder["version"] !== 2) return null;
    const snapshots = founder["snapshots"];
    if (!Array.isArray(snapshots)) return null;

    const rows: Array<{
      id: string;
      savedAt: string;
      rate: number | null;
      reimbursementPolicy: CalculatorInputs["reimbursementPolicy"] | null;
    }> = [];

    for (const s of snapshots) {
      if (!isPlainObject(s)) continue;
      const id = s["id"];
      const savedAt = s["savedAt"];
      const inputsRaw = s["inputs"];
      const insightsRaw = s["insights"];
      if (typeof id !== "string" || typeof savedAt !== "string") continue;

      let reimbursementPolicy: CalculatorInputs["reimbursementPolicy"] | null = null;
      if (isPlainObject(inputsRaw) && typeof inputsRaw["reimbursementPolicy"] === "string") {
        reimbursementPolicy = inputsRaw["reimbursementPolicy"] as CalculatorInputs["reimbursementPolicy"];
      }

      let rate: number | null = null;
      if (isPlainObject(insightsRaw)) {
        const comm = insightsRaw["commingling90d"];
        if (isPlainObject(comm) && typeof comm["rate"] === "number") {
          rate = comm["rate"];
        }
      }

      rows.push({ id, savedAt, rate, reimbursementPolicy });
    }

    const withRate = rows.filter((r) => r.rate != null).slice(0, 8);
    if (withRate.length < 2) return null;

    const newest = withRate[0] ?? null;
    const previous = withRate[1] ?? null;
    const improved =
      newest && previous && newest.rate != null && previous.rate != null
        ? newest.rate <= previous.rate - 0.05
        : false;

    return {
      points: withRate.reverse(), // oldest -> newest for rendering
      improved,
      newest,
      previous,
    };
  }, [memory?.notes]);

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

  const redactedPlan = useMemo(() => {
    return buildActionPlan({ inputs, results, redacted: true });
  }, [inputs, results]);

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

  function downloadSingleIcs(event: { date: string; title: string; description: string }): void {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(event.date)) return;

    const stampDate = new Date();
    const dtstamp = stampDate
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}Z$/, "Z");

    const date = event.date.replaceAll("-", "");
    const lines: string[] = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//ClearMoney//FounderCoveragePlanner//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `UID:${dtstamp}-single@clearmoney`,
      `DTSTAMP:${dtstamp}`,
      `DTSTART;VALUE=DATE:${date}`,
      `DTEND;VALUE=DATE:${date}`,
      `SUMMARY:${escapeIcsText(event.title)}`,
      `DESCRIPTION:${escapeIcsText(event.description)}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ];

    const blob = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `clearmoney-${event.date}-${event.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.ics`;
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

  function toggleReimbursed(txId: string): void {
    if (!hasAccountsWrite) return;
    const reimbursed = !!reimbursedTxById[txId];
    const memo = reimbursementMemos[txId] ?? reimbursedTxById[txId]?.memo ?? "";
    updateReimbursement.mutate({ transactionId: txId, reimbursed: !reimbursed, memo });
  }

  function updateReimbursementMemo(txId: string, memo: string): void {
    setReimbursementMemos((prev) => ({ ...prev, [txId]: memo }));
  }

  function commitReimbursementMemo(txId: string): void {
    if (!hasAccountsWrite) return;
    if (!reimbursedTxById[txId]) return;
    const memo = reimbursementMemos[txId] ?? reimbursedTxById[txId]?.memo ?? "";
    updateReimbursement.mutate({ transactionId: txId, reimbursed: true, memo });
  }

  function downloadReimbursementCsv(): void {
    if (!comminglingInsight) return;
    const rows = comminglingInsight.flaggedTransactions
      .filter((t) => !!t.reimbursedAt)
      .map((t) => ({
        tx_id: t.id,
        transaction_date: t.transactionDate,
        merchant: t.merchantName ?? "",
        description: t.name,
        amount: t.amount,
        primary_category: t.primaryCategory ?? "",
        reimbursed_at: t.reimbursedAt ?? "",
        memo: t.memo ?? "",
      }));

    const header = Object.keys(rows[0] ?? {
      tx_id: "",
      transaction_date: "",
      merchant: "",
      description: "",
      amount: "",
      primary_category: "",
      reimbursed_at: "",
      memo: "",
    });

    const lines = [header.join(",")];
    for (const row of rows) {
      lines.push(
        header
          .map((k) => {
            const raw = String((row as any)[k] ?? "");
            const escaped = raw.replace(/\"/g, "\"\"");
            return `"${escaped}"`;
          })
          .join(",")
      );
    }

    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "clearmoney-reimbursements.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
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

    const fieldList = prefill.filledFields.slice(0, 8).join(", ");
    const extraCount = Math.max(0, prefill.filledFields.length - 8);
    const suffix = extraCount > 0 ? ` +${extraCount} more` : "";

    const sources: string[] = [];
    if (prefill.sources.snapshot) sources.push("saved snapshot");
    if (!prefill.sources.snapshot) {
      if (prefill.sources.memory) sources.push("profile");
      if (prefill.sources.accounts) sources.push("linked accounts");
    }
    const from = sources.length > 0 ? sources.join(" + ") : "your data";

    setLastPrefillSummary(
      `Prefilled ${prefill.filledFields.length} fields from ${from}: ${fieldList}${suffix}`
    );
  }

  function applyScenario(values: Partial<CalculatorInputs>): void {
    setInputs((prev) => ({ ...prev, ...values }));
  }

  function saveSnapshotToProfile(): void {
    if (!hasMemoryWrite) return;
    const prevNotes = (memory?.notes && typeof memory.notes === "object") ? memory.notes : {};
    const snapshotId = crypto.randomUUID();
    const savedAt = new Date().toISOString();

    const existing = (prevNotes as Record<string, unknown>)["founderCoveragePlanner"];
    const existingObj = existing && typeof existing === "object" ? (existing as Record<string, unknown>) : null;
    const snapshotsRaw = existingObj ? existingObj["snapshots"] : null;
    const snapshots = Array.isArray(snapshotsRaw) ? snapshotsRaw.slice() : [];

    const commingling90d = comminglingInsight
      ? {
          startDate: comminglingInsight.startDate,
          endDate: comminglingInsight.endDate,
          rate: comminglingInsight.comminglingRate,
          comminglingCount: comminglingInsight.comminglingCount,
          eligibleCount: comminglingInsight.eligibleCount,
          topMerchants: comminglingInsight.topExamples.map((ex) => ex.merchant).slice(0, 5),
          reimbursedTxCount: Object.keys(reimbursedTxById).length,
        }
      : null;

    snapshots.unshift({
      id: snapshotId,
      savedAt,
      inputs,
      checklist: completed,
      insights: commingling90d ? { commingling90d } : undefined,
    });

    // Keep recent history only to avoid unbounded growth in notes.
    const trimmed = snapshots.slice(0, 10);

    const nextNotes = {
      ...(prevNotes as Record<string, unknown>),
      founderCoveragePlanner: {
        version: 2,
        latestSnapshotId: snapshotId,
        snapshots: trimmed,
      },
    };

    updateMemory.mutate({
      notes: nextNotes,
      source: "calculator",
      source_context: "founder-coverage-planner.save",
    });
  }

  const embeddedShareLink = useMemo(() => {
    if (typeof window === "undefined") return null;
    const payload = {
      version: 2 as const,
      mode: "full" as const,
      savedAt: new Date().toISOString(),
      inputs,
      checklist: completed,
    };

    const encoded = encodeFounderCoverageSharePayload(payload);
    const url = new URL(window.location.href);
    url.pathname = "/tools/founder-coverage-planner/report";
    url.search = "";
    url.searchParams.set("snapshot", encoded);
    return url.toString();
  }, [completed, inputs]);

  const embeddedRedactedShareLink = useMemo(() => {
    if (typeof window === "undefined") return null;

    const topMerchants =
      comminglingInsight?.topExamples.map((ex) => ex.merchant).slice(0, 3) ?? [];

    const payload = {
      version: 2 as const,
      mode: "redacted" as const,
      savedAt: new Date().toISOString(),
      inputs: {
        legalEntityType: inputs.legalEntityType,
        taxElection: inputs.taxElection,
        fundingPlan: inputs.fundingPlan,
        ownerRole: inputs.ownerRole,
        stateCode: inputs.stateCode,
        filingStatus: inputs.filingStatus,
        payrollCadence: inputs.payrollCadence,
        reimbursementPolicy: inputs.reimbursementPolicy,
      },
      checklist: completed,
      entity: {
        recommendedLegalEntity: results.entity.recommendedLegalEntity,
        recommendedTaxElection: results.entity.recommendedTaxElection,
        summary: results.entity.summary,
        reasons: results.entity.reasons,
      },
      actionItems: redactedPlan.actionItems.map((i) => ({
        key: i.key,
        title: i.title,
        detail: stripCurrencyLikeText(i.detail),
      })),
      actionEvents: redactedPlan.actionEvents,
      commingling90d: comminglingInsight
        ? {
            rate: comminglingInsight.comminglingRate,
            comminglingCount: comminglingInsight.comminglingCount,
            eligibleCount: comminglingInsight.eligibleCount,
            topMerchants,
          }
        : undefined,
    };

    const encoded = encodeFounderCoverageSharePayload(payload);
    const url = new URL(window.location.href);
    url.pathname = "/tools/founder-coverage-planner/report";
    url.search = "";
    url.searchParams.set("snapshot", encoded);
    return url.toString();
  }, [
    comminglingInsight,
    completed,
    inputs.filingStatus,
    inputs.fundingPlan,
    inputs.legalEntityType,
    inputs.ownerRole,
    inputs.payrollCadence,
    inputs.reimbursementPolicy,
    inputs.stateCode,
    inputs.taxElection,
    redactedPlan.actionEvents,
    redactedPlan.actionItems,
    results.entity.recommendedLegalEntity,
    results.entity.recommendedTaxElection,
    results.entity.reasons,
    results.entity.summary,
  ]);

  function buildServerShareUrl(id: string, token: string): string | null {
    if (typeof window === "undefined") return null;
    const currentUrl = new URL(window.location.href);
    const url = new URL(window.location.href);
    url.pathname = "/tools/founder-coverage-planner/report";
    url.search = "";
    if (currentUrl.searchParams.get("demo") === "true") {
      url.searchParams.set("demo", "true");
    }
    url.searchParams.set("rid", id);
    url.searchParams.set("rt", token);
    return url.toString();
  }

  async function copyShareLink(): Promise<void> {
    if (shareBusy) return;
    setShareBusy(true);
    try {
      const payload = {
        version: 2 as const,
        mode: "full" as const,
        savedAt: new Date().toISOString(),
        inputs,
        checklist: completed,
      };
      const created = await client.createShareReport({
        tool_id: "founder-coverage-planner",
        mode: "full",
        payload: payload as unknown as Record<string, unknown>,
        expires_in_days: 30,
      });

      const url = buildServerShareUrl(created.id, created.token);
      if (url) await navigator.clipboard?.writeText(url);
    } catch {
      if (embeddedShareLink) {
        await navigator.clipboard?.writeText(embeddedShareLink);
      }
    } finally {
      setShareBusy(false);
    }
  }

  function buildRedactedSharePayload(savedAt: string): Record<string, unknown> {
    const topMerchants =
      comminglingInsight?.topExamples.map((ex) => ex.merchant).slice(0, 3) ?? [];

    return {
      version: 2 as const,
      mode: "redacted" as const,
      savedAt,
      inputs: {
        legalEntityType: inputs.legalEntityType,
        taxElection: inputs.taxElection,
        fundingPlan: inputs.fundingPlan,
        ownerRole: inputs.ownerRole,
        stateCode: inputs.stateCode,
        filingStatus: inputs.filingStatus,
        payrollCadence: inputs.payrollCadence,
        reimbursementPolicy: inputs.reimbursementPolicy,
      },
      checklist: completed,
      entity: {
        recommendedLegalEntity: results.entity.recommendedLegalEntity,
        recommendedTaxElection: results.entity.recommendedTaxElection,
        summary: results.entity.summary,
        reasons: results.entity.reasons,
      },
      actionItems: redactedPlan.actionItems.map((i) => ({
        key: i.key,
        title: i.title,
        detail: stripCurrencyLikeText(i.detail),
      })),
      actionEvents: redactedPlan.actionEvents,
      commingling90d: comminglingInsight
        ? {
            rate: comminglingInsight.comminglingRate,
            comminglingCount: comminglingInsight.comminglingCount,
            eligibleCount: comminglingInsight.eligibleCount,
            topMerchants,
          }
        : undefined,
    };
  }

  async function copyRedactedLink(): Promise<void> {
    if (shareBusy) return;
    setShareBusy(true);
    try {
      const payload = buildRedactedSharePayload(new Date().toISOString());

      const created = await client.createShareReport({
        tool_id: "founder-coverage-planner",
        mode: "redacted",
        payload: payload as unknown as Record<string, unknown>,
        expires_in_days: 30,
      });

      const url = buildServerShareUrl(created.id, created.token);
      if (url) await navigator.clipboard?.writeText(url);
    } catch {
      if (embeddedRedactedShareLink) {
        await navigator.clipboard?.writeText(embeddedRedactedShareLink);
      }
    } finally {
      setShareBusy(false);
    }
  }

  async function openRedactedReport(): Promise<void> {
    if (shareBusy) return;
    setShareBusy(true);
    try {
      const payload = buildRedactedSharePayload(new Date().toISOString());

      const created = await client.createShareReport({
        tool_id: "founder-coverage-planner",
        mode: "redacted",
        payload: payload as unknown as Record<string, unknown>,
        expires_in_days: 30,
      });

      const url = buildServerShareUrl(created.id, created.token);
      if (url) window.open(url, "_blank", "noreferrer");
    } catch {
      if (embeddedRedactedShareLink) {
        window.open(embeddedRedactedShareLink, "_blank", "noreferrer");
      }
    } finally {
      setShareBusy(false);
    }
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
            <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
              <Link
                href="/tools/founder-coverage-planner/start"
                className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-semibold text-neutral-950 hover:bg-neutral-100 transition-colors"
              >
                Start 60-second setup
              </Link>
              <Link
                href="/tools/founder-coverage-planner/report"
                className="inline-flex items-center justify-center rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2 text-sm font-semibold text-neutral-200 hover:border-neutral-600 transition-colors"
              >
                Open report view
              </Link>
            </div>
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

              {lastPrefillSummary && (
                <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4">
                  <p className="text-sm font-semibold text-white">Data provenance</p>
                  <p className="mt-1 text-xs text-neutral-400">{lastPrefillSummary}</p>
                </div>
              )}

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
                    <button
                      type="button"
                      onClick={() => void copyShareLink()}
                      disabled={shareBusy}
                      className="rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs text-neutral-200 hover:border-neutral-600 transition-colors"
                    >
                      {shareBusy ? "Sharing..." : "Copy share link"}
                    </button>
                    <button
                      type="button"
                      onClick={() => void copyRedactedLink()}
                      disabled={shareBusy}
                      className="rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs text-neutral-200 hover:border-neutral-600 transition-colors"
                    >
                      {shareBusy ? "Sharing..." : "Copy redacted link"}
                    </button>
                    <button
                      type="button"
                      onClick={() => void openRedactedReport()}
                      disabled={shareBusy}
                      className="rounded-xl bg-emerald-300 px-3 py-2 text-xs font-semibold text-neutral-950 disabled:opacity-50"
                    >
                      {shareBusy ? "Sharing..." : "Open redacted report"}
                    </button>
                  </div>
                  {bankContextLine && (
                    <p className="mt-3 text-xs text-neutral-500">{bankContextLine}</p>
                  )}
                  <p className="mt-3 text-xs text-neutral-500">
                    Share links expire after 30 days by default. Redacted share links omit currency-like values.
                  </p>
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

              {actionEvents.filter((e) => /^\d{4}-\d{2}-\d{2}$/.test(e.date)).length > 0 && (
                <div className="mt-6 rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-4">
                  <p className="text-xs uppercase tracking-wide text-neutral-400">
                    Upcoming deadlines
                  </p>
                  <p className="mt-2 text-xs text-neutral-500">
                    Dates are educational defaults; verify weekends/holidays and state rules.
                  </p>
                  <ul className="mt-4 space-y-2">
                    {actionEvents
                      .filter((e) => /^\d{4}-\d{2}-\d{2}$/.test(e.date))
                      .slice()
                      .sort((a, b) => a.date.localeCompare(b.date))
                      .slice(0, 8)
                      .map((event) => (
                        <li
                          key={`${event.date}:${event.title}`}
                          className="flex flex-col gap-2 rounded-xl border border-neutral-800 bg-neutral-900/40 px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div>
                            <p className="text-sm font-semibold text-white">
                              {event.title}
                            </p>
                            <p className="text-xs text-neutral-400">
                              {event.date} · {event.description}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => downloadSingleIcs(event)}
                            className="inline-flex items-center justify-center rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs text-neutral-200 hover:border-neutral-600 transition-colors"
                          >
                            Add to calendar
                          </button>
                        </li>
                      ))}
                  </ul>
                </div>
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
              {comminglingTrend && (
                <div className="mt-5 rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-4">
                  <p className="text-xs uppercase tracking-wide text-neutral-400">
                    Commingling trend (saved snapshots)
                  </p>
                  <div className="mt-3 flex items-end gap-2 h-14">
                    {comminglingTrend.points.map((p) => {
                      const heightPx = p.rate != null ? Math.max(6, Math.round(p.rate * 48)) : 6;
                      const label = p.rate != null ? `${Math.round(p.rate * 100)}%` : "—";
                      return (
                        <div key={p.id} className="flex flex-col items-center gap-1">
                          <div
                            title={`${new Date(p.savedAt).toLocaleDateString()} · ${label}`}
                            className="w-6 rounded-md bg-sky-400/40 border border-sky-400/30"
                            style={{ height: `${heightPx}px` }}
                          />
                          <span className="text-[10px] text-neutral-500">{label}</span>
                        </div>
                      );
                    })}
                  </div>
                  {comminglingTrend.improved && (
                    <p className="mt-3 text-xs text-emerald-200/80">
                      Nice: commingling rate improved vs the prior snapshot.
                    </p>
                  )}
                  <p className="mt-2 text-xs text-neutral-500">
                    Tip: save a snapshot after you change reimbursement policy to track before/after.
                  </p>
                </div>
              )}
              {comminglingInsight && (
                <div className="mt-5 rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-4">
                  <p className="text-xs uppercase tracking-wide text-neutral-400">
                    Commingling signals (last 90 days)
                  </p>
                  <p className="mt-2 text-sm text-neutral-200">
                    {Math.round(comminglingInsight.comminglingRate * 100)}% of eligible business-account
                    transactions look personal ({comminglingInsight.comminglingCount} of{" "}
                    {comminglingInsight.eligibleCount}).
                  </p>
                  <p className="mt-2 text-xs text-neutral-500">
                    Accounts: {comminglingInsight.businessAccountNames.join(", ")}. Range:{" "}
                    {comminglingInsight.startDate} to {comminglingInsight.endDate}.
                  </p>
                  {inputs.reimbursementPolicy !== "accountable" && comminglingInsight.comminglingRate >= 0.08 && (
                    <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
                      <p className="text-sm font-semibold text-emerald-100">
                        Suggested remediation
                      </p>
                      <p className="mt-1 text-xs text-emerald-200/80">
                        Set an accountable reimbursement policy and route personal expenses through reimbursements,
                        not direct business spending.
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setInputs((prev) => ({ ...prev, reimbursementPolicy: "accountable" }))}
                          className="rounded-xl bg-emerald-300 px-3 py-2 text-xs font-semibold text-neutral-950"
                        >
                          Set accountable policy
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleCompleted("action.reimbursementPolicy")}
                          className="rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs text-neutral-200 hover:border-neutral-600 transition-colors"
                        >
                          Mark addressed
                        </button>
                      </div>
                    </div>
                  )}
                  {comminglingInsight.topExamples.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs text-neutral-400 mb-2">Examples</p>
                      <ul className="text-sm text-neutral-300 space-y-2">
                        {comminglingInsight.topExamples.map((ex) => (
                          <li key={ex.merchant} className="rounded-xl border border-neutral-800 bg-neutral-900/40 px-3 py-2">
                            <p className="text-neutral-100 font-semibold">
                              {ex.merchant} <span className="text-neutral-500 font-normal">({ex.count}x)</span>
                            </p>
                            {ex.sample.length > 0 && (
                              <ul className="mt-1 text-xs text-neutral-400 space-y-1">
                                {ex.sample.map((s) => (
                                  <li key={s}>• {s}</li>
                                ))}
                              </ul>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {comminglingInsight.flaggedTransactions.length > 0 && (
                    <div className="mt-5 rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-neutral-400">
                            Reimbursement ledger
                          </p>
                          <p className="mt-1 text-xs text-neutral-500">
                            Mark reimbursed transactions to remove them from commingling signals, then export a CSV for bookkeeping.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={downloadReimbursementCsv}
                          className="inline-flex items-center justify-center rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs text-neutral-200 hover:border-neutral-600 transition-colors"
                        >
                          Download CSV
                        </button>
                      </div>

                      <div className="mt-4 space-y-2">
                        {comminglingInsight.flaggedTransactions.map((t) => {
                          const reimbursed = !!t.reimbursedAt;
                          const merchant = t.merchantName ?? t.name;
                          return (
                            <div
                              key={t.id}
                              className="rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-3"
                            >
                              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                <div className="flex items-start gap-3">
                                  <button
                                    type="button"
                                    onClick={() => toggleReimbursed(t.id)}
                                    disabled={!hasAccountsWrite}
                                    className="mt-0.5 h-5 w-5 rounded border border-neutral-700 flex items-center justify-center disabled:opacity-50"
                                    aria-label="Toggle reimbursed"
                                  >
                                    {reimbursed && <span className="text-xs text-emerald-300">✓</span>}
                                  </button>
                                  <div>
                                    <p className="text-sm font-semibold text-white">
                                      {merchant}
                                      <span className="ml-2 text-xs font-normal text-neutral-500">
                                        {t.transactionDate}
                                      </span>
                                    </p>
                                    <p className="mt-1 text-xs text-neutral-400">
                                      {t.name} · {t.primaryCategory ?? "—"} · {formatCurrency(Math.abs(t.amount), 0)}
                                    </p>
                                  </div>
                                </div>
                                <div className="min-w-[220px]">
                                  <input
                                    className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs text-white disabled:opacity-50"
                                    placeholder="Memo (optional)"
                                    value={reimbursementMemos[t.id] ?? t.memo ?? ""}
                                    onChange={(e) => updateReimbursementMemo(t.id, e.target.value)}
                                    onBlur={() => commitReimbursementMemo(t.id)}
                                    disabled={!reimbursed || !hasAccountsWrite}
                                  />
                                  {reimbursed && (
                                    <p className="mt-1 text-[10px] text-neutral-500">
                                      Reimbursed at: {new Date(t.reimbursedAt ?? "").toLocaleString()}
                                    </p>
                                  )}
                                  {!hasAccountsWrite && (
                                    <p className="mt-1 text-[10px] text-neutral-500">
                                      Grant `accounts:write` to update reimbursements.
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
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
