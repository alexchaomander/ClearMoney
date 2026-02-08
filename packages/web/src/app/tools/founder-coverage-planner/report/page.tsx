"use client";

import { useEffect, useMemo, useState, type ReactElement } from "react";
import Link from "next/link";
import { useSearchParams, type ReadonlyURLSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/shared/AppShell";
import { buildActionPlan } from "@/lib/calculators/founder-coverage-planner/actionPlan";
import { calculate } from "@/lib/calculators/founder-coverage-planner/calculations";
import {
  getStateEstimatedTaxRule,
  isNoStateIncomeTaxState,
  type StateEstimatedTaxRule,
} from "@/lib/calculators/founder-coverage-planner/stateEstimatedTaxes";
import {
  decodeFounderCoverageSharePayload,
  encodeFounderCoverageSharePayload,
  type FounderCoverageSharePayload,
  stripCurrencyLikeText,
} from "@/lib/calculators/founder-coverage-planner/snapshotShare";
import type { CalculatorInputs } from "@/lib/calculators/founder-coverage-planner/types";
import { formatCurrency } from "@/lib/shared/formatters";
import { useStrataClient } from "@/lib/strata/client";
import { useDemoMode } from "@/lib/strata/demo-context";
import { useConsentStatus, useFinancialMemory } from "@/lib/strata/hooks";

type MemorySnapshot = {
  id: string;
  savedAt: string;
  inputs: CalculatorInputs;
  checklist?: Record<string, boolean>;
  insights?: {
    commingling90d?: {
      startDate: string;
      endDate: string;
      rate: number;
      comminglingCount: number;
      eligibleCount: number;
      topMerchants?: string[];
    };
  };
};

type SnapshotIndex = {
  latestSnapshotId: string;
  snapshots: MemorySnapshot[];
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function escapeIcsText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function parseMemorySnapshot(value: unknown): MemorySnapshot | null {
  if (!isPlainObject(value)) return null;
  const id = value["id"];
  const savedAt = value["savedAt"];
  const inputs = value["inputs"];
  const checklist = value["checklist"];
  const insights = value["insights"];

  if (typeof id !== "string") return null;
  if (typeof savedAt !== "string") return null;
  if (!isPlainObject(inputs)) return null;

  return {
    id,
    savedAt,
    inputs: inputs as unknown as CalculatorInputs,
    checklist: isPlainObject(checklist) ? (checklist as Record<string, boolean>) : undefined,
    insights: isPlainObject(insights) ? (insights as MemorySnapshot["insights"]) : undefined,
  };
}

function readSnapshotIndex(memoryNotes: unknown): SnapshotIndex | null {
  if (!isPlainObject(memoryNotes)) return null;
  const founder = memoryNotes["founderCoveragePlanner"];
  if (!isPlainObject(founder)) return null;

  const version = founder["version"];
  if (version === 2) {
    const latestId = founder["latestSnapshotId"];
    const snapshots = founder["snapshots"];
    if (typeof latestId !== "string") return null;
    if (!Array.isArray(snapshots)) return null;

    const parsed = snapshots
      .map((s) => parseMemorySnapshot(s))
      .filter((s): s is MemorySnapshot => !!s);

    if (parsed.length === 0) return null;
    return { latestSnapshotId: latestId, snapshots: parsed };
  }

  // Back-compat for older snapshots (v1).
  const savedAt = founder["savedAt"];
  const inputs = founder["inputs"];
  const checklist = founder["checklist"];
  if (typeof savedAt !== "string") return null;
  if (!isPlainObject(inputs)) return null;
  const snap: MemorySnapshot = {
    id: "latest",
    savedAt,
    inputs: inputs as unknown as CalculatorInputs,
    checklist: isPlainObject(checklist) ? (checklist as Record<string, boolean>) : undefined,
  };
  return { latestSnapshotId: "latest", snapshots: [snap] };
}

function toDemoQuery(searchParams: ReadonlyURLSearchParams): string {
  const demo = searchParams.get("demo");
  return demo === "true" ? "?demo=true" : "";
}

function buildReportUrl(args: {
  demoQuery: string;
  snapshot?: string;
  id?: string;
  a?: string;
  b?: string;
  rid?: string;
  rt?: string;
}): string {
  const { demoQuery, snapshot, id, a, b, rid, rt } = args;
  const url = new URL(window.location.href);
  url.pathname = "/tools/founder-coverage-planner/report";
  url.search = demoQuery || "";
  if (snapshot) url.searchParams.set("snapshot", snapshot);
  if (id) url.searchParams.set("id", id);
  if (a) url.searchParams.set("a", a);
  if (b) url.searchParams.set("b", b);
  if (rid) url.searchParams.set("rid", rid);
  if (rt) url.searchParams.set("rt", rt);
  return url.toString();
}

const SHARE_TOKENS_STORAGE_KEY = "clearmoney-share-report-tokens.v1";

type StoredShareTokens = Record<string, string>;

function readStoredShareTokens(): StoredShareTokens {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(SHARE_TOKENS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as StoredShareTokens;
  } catch {
    return {};
  }
}

function writeStoredShareTokens(tokens: StoredShareTokens): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SHARE_TOKENS_STORAGE_KEY, JSON.stringify(tokens));
  } catch {
    // ignore
  }
}

export default function FounderCoveragePlannerReportPage(): ReactElement {
  const searchParams = useSearchParams();
  const demoQuery = useMemo(() => toDemoQuery(searchParams), [searchParams]);
  const encodedSnapshot = searchParams.get("snapshot");
  const selectedId = searchParams.get("id");
  const compareA = searchParams.get("a");
  const compareB = searchParams.get("b");
  const reportId = searchParams.get("rid");
  const reportToken = searchParams.get("rt");
  const isServerShare = !!(reportId && reportToken);

  const client = useStrataClient();
  const queryClient = useQueryClient();
  const isDemo = useDemoMode();

  const { hasConsent: hasMemoryRead } = useConsentStatus(["memory:read"]);
  const { data: memory, isSuccess: memoryLoaded } = useFinancialMemory({ enabled: hasMemoryRead });
  const [revoked, setRevoked] = useState(false);
  const [revokeBusy, setRevokeBusy] = useState(false);
  const [shareBusy, setShareBusy] = useState(false);
  const [storedTokens, setStoredTokens] = useState<StoredShareTokens>({});

  useEffect(() => {
    setStoredTokens(readStoredShareTokens());
  }, []);

  const serverShare = useQuery({
    queryKey: ["shareReport", reportId ?? "", reportToken ?? ""],
    queryFn: () => client.getShareReport(reportId!, reportToken!),
    enabled: !!reportId && !!reportToken,
    staleTime: 30_000,
  });

  const memoryIndex = useMemo(() => {
    return readSnapshotIndex(memory?.notes ?? null);
  }, [memory?.notes]);

  const sharePayload = useMemo<FounderCoverageSharePayload | null>(() => {
    if (serverShare.data?.payload) {
      return serverShare.data.payload as unknown as FounderCoverageSharePayload;
    }
    if (!encodedSnapshot) return null;
    return decodeFounderCoverageSharePayload(encodedSnapshot);
  }, [encodedSnapshot, serverShare.data?.payload]);

  const isRedactedShare = useMemo(() => {
    if (isServerShare && serverShare.data?.mode === "redacted") return true;
    return !!(
      sharePayload &&
      (sharePayload as any).version === 2 &&
      (sharePayload as any).mode === "redacted"
    );
  }, [isServerShare, serverShare.data?.mode, sharePayload]);
  const isShareMode = !!sharePayload;

  const shareFullSnapshot = useMemo<MemorySnapshot | null>(() => {
    if (!sharePayload) return null;
    if ((sharePayload as any).version === 1) {
      const p = sharePayload as any;
      return {
        id: "shared",
        savedAt: String(p.savedAt),
        inputs: p.inputs as CalculatorInputs,
        checklist: p.checklist as Record<string, boolean> | undefined,
      };
    }
    if ((sharePayload as any).version === 2 && (sharePayload as any).mode === "full") {
      const p = sharePayload as any;
      return {
        id: "shared",
        savedAt: String(p.savedAt),
        inputs: p.inputs as CalculatorInputs,
        checklist: p.checklist as Record<string, boolean> | undefined,
      };
    }
    return null;
  }, [sharePayload]);

  const snapshot = useMemo<MemorySnapshot | null>(() => {
    if (isShareMode) return null;
    if (!memoryIndex) return null;

    if (compareA && compareB) return null;

    const id = selectedId ?? memoryIndex.latestSnapshotId;
    return memoryIndex.snapshots.find((s) => s.id === id) ?? null;
  }, [compareA, compareB, isShareMode, memoryIndex, selectedId]);

  const compareSnapshots = useMemo(() => {
    if (isShareMode) return null;
    if (!memoryIndex) return null;
    if (!compareA || !compareB) return null;
    const a = memoryIndex.snapshots.find((s) => s.id === compareA) ?? null;
    const b = memoryIndex.snapshots.find((s) => s.id === compareB) ?? null;
    if (!a || !b) return null;
    return { a, b };
  }, [compareA, compareB, isShareMode, memoryIndex]);

  const computed = useMemo(() => {
    const active = snapshot ?? shareFullSnapshot;
    if (!active) return null;
    const results = calculate(active.inputs);
    const plan = buildActionPlan({ inputs: active.inputs, results });
    return { results, plan };
  }, [shareFullSnapshot, snapshot]);

  const computedCompare = useMemo(() => {
    if (!compareSnapshots) return null;
    const resA = calculate(compareSnapshots.a.inputs);
    const resB = calculate(compareSnapshots.b.inputs);
    const planA = buildActionPlan({ inputs: compareSnapshots.a.inputs, results: resA });
    const planB = buildActionPlan({ inputs: compareSnapshots.b.inputs, results: resB });
    return { resA, resB, planA, planB };
  }, [compareSnapshots]);

  const activeSnapshot = snapshot ?? shareFullSnapshot;

  const canManageShareLinks = isDemo || hasMemoryRead;
  const shareReports = useQuery({
    queryKey: ["shareReports", "founder-coverage-planner"],
    queryFn: () => client.listShareReports({ toolId: "founder-coverage-planner", limit: 25 }),
    enabled: canManageShareLinks,
    staleTime: 15_000,
  });

  const shareLink = useMemo(() => {
    if (typeof window === "undefined") return null;

    if (reportId && reportToken) {
      return buildReportUrl({ demoQuery, rid: reportId, rt: reportToken });
    }

    if (isShareMode) {
      return buildReportUrl({ demoQuery, snapshot: encodedSnapshot ?? undefined });
    }

    if (!snapshot) return null;
    const payload: FounderCoverageSharePayload = {
      version: 2,
      mode: "full",
      savedAt: snapshot.savedAt,
      inputs: snapshot.inputs,
      checklist: snapshot.checklist,
    };
    const encoded = encodeFounderCoverageSharePayload(payload);
    return buildReportUrl({ demoQuery, snapshot: encoded });
  }, [demoQuery, encodedSnapshot, isShareMode, reportId, reportToken, snapshot]);

  type DisplayActionEvent = { date: string; title: string; description: string };
  type DisplayActionItem = { key: string; title: string; detail: string };

  const actionEvents: DisplayActionEvent[] =
    computed?.plan.actionEvents ??
    (isRedactedShare ? ((sharePayload as any).actionEvents as DisplayActionEvent[] | undefined) ?? [] : []);

  const actionItems: DisplayActionItem[] =
    computed?.plan.actionItems ??
    (isRedactedShare ? ((sharePayload as any).actionItems as DisplayActionItem[] | undefined) ?? [] : []);

  type StateEstimatedTaxInfo =
    | { kind: "mapped"; rule: StateEstimatedTaxRule }
    | { kind: "fallback"; stateCode: string }
    | { kind: "no_income_tax"; stateCode: string };

  const stateEstimatedTaxInfo = useMemo<StateEstimatedTaxInfo | null>(() => {
    const stateCodeCandidate =
      activeSnapshot?.inputs.stateCode ??
      (isRedactedShare ? String((sharePayload as any)?.inputs?.stateCode ?? "") : "");

    const normalized = stateCodeCandidate.trim().toUpperCase();
    if (!/^[A-Z]{2}$/.test(normalized)) return null;

    if (isNoStateIncomeTaxState(normalized)) {
      return { kind: "no_income_tax", stateCode: normalized };
    }

    const rule = getStateEstimatedTaxRule(normalized);
    if (rule) {
      return { kind: "mapped", rule };
    }

    return { kind: "fallback", stateCode: normalized };
  }, [activeSnapshot?.inputs.stateCode, isRedactedShare, sharePayload]);

  const sortedEvents = useMemo(() => {
    const scored = actionEvents.map((event) => {
      const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(event.date);
      const score = isDateOnly ? Date.parse(`${event.date}T00:00:00Z`) : Number.POSITIVE_INFINITY;
      return { event, score };
    });

    scored.sort((a, b) => a.score - b.score);
    return scored.map((row) => row.event);
  }, [actionEvents]);
  const savedAt = isShareMode ? sharePayload?.savedAt ?? null : snapshot?.savedAt ?? null;

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
      if (!/^\d{4}-\d{2}-\d{2}$/.test(event.date)) continue;
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

  function printReport(): void {
    window.print();
  }

  function copyShareLink(): void {
    void copyServerShareLink("full");
  }

  async function copyRedactedShareLink(): Promise<void> {
    await copyServerShareLink("redacted");
  }

  function rememberShareToken(reportId: string, token: string): void {
    const next = { ...storedTokens, [reportId]: token };
    setStoredTokens(next);
    writeStoredShareTokens(next);
  }

  function buildFullSharePayload(active: MemorySnapshot): Record<string, unknown> {
    return {
      version: 2,
      mode: "full",
      savedAt: active.savedAt,
      inputs: active.inputs,
      checklist: active.checklist,
    };
  }

  function buildRedactedSharePayload(active: MemorySnapshot): Record<string, unknown> {
    const results = computed?.results;
    const plan = computed?.plan;
    const topMerchants = active.insights?.commingling90d?.topMerchants?.slice(0, 3) ?? [];
    return {
      version: 2,
      mode: "redacted",
      savedAt: active.savedAt,
      inputs: {
        legalEntityType: active.inputs.legalEntityType,
        taxElection: active.inputs.taxElection,
        fundingPlan: active.inputs.fundingPlan,
        ownerRole: active.inputs.ownerRole,
        stateCode: active.inputs.stateCode,
        filingStatus: active.inputs.filingStatus,
        payrollCadence: active.inputs.payrollCadence,
        reimbursementPolicy: active.inputs.reimbursementPolicy,
      },
      checklist: active.checklist,
      entity: results
        ? {
            recommendedLegalEntity: results.entity.recommendedLegalEntity,
            recommendedTaxElection: results.entity.recommendedTaxElection,
            summary: results.entity.summary,
            reasons: results.entity.reasons,
          }
        : undefined,
      actionItems: (plan?.actionItems ?? []).map((i) => ({
        key: i.key,
        title: i.title,
        detail: stripCurrencyLikeText(i.detail),
      })),
      actionEvents: plan?.actionEvents ?? [],
      commingling90d: active.insights?.commingling90d
        ? {
            rate: active.insights.commingling90d.rate,
            comminglingCount: active.insights.commingling90d.comminglingCount,
            eligibleCount: active.insights.commingling90d.eligibleCount,
            topMerchants,
          }
        : undefined,
    };
  }

  async function copyServerShareLink(mode: "full" | "redacted"): Promise<void> {
    if (shareBusy) return;
    setShareBusy(true);
    try {
      if (reportId && reportToken) {
        const url = buildReportUrl({ demoQuery, rid: reportId, rt: reportToken });
        await navigator.clipboard?.writeText(url);
        return;
      }

      if (!activeSnapshot) throw new Error("No snapshot to share");

      const payload = mode === "redacted" ? buildRedactedSharePayload(activeSnapshot) : buildFullSharePayload(activeSnapshot);
      const created = await client.createShareReport({
        tool_id: "founder-coverage-planner",
        mode,
        payload,
        expires_in_days: 30,
      });

      rememberShareToken(created.id, created.token);
      const url = buildReportUrl({ demoQuery, rid: created.id, rt: created.token });
      await navigator.clipboard?.writeText(url);
      await queryClient.invalidateQueries({ queryKey: ["shareReports", "founder-coverage-planner"] });
    } catch {
      if (shareLink) {
        await navigator.clipboard?.writeText(shareLink);
      }
    } finally {
      setShareBusy(false);
    }
  }

  async function revokeLink(): Promise<void> {
    if (!reportId || revokeBusy) return;
    setRevokeBusy(true);
    try {
      await client.revokeShareReport(reportId);
      setRevoked(true);
    } catch {
      // ignore
    } finally {
      setRevokeBusy(false);
    }
  }

  async function revokeShareReportById(id: string): Promise<void> {
    try {
      await client.revokeShareReport(id);
      await queryClient.invalidateQueries({ queryKey: ["shareReports", "founder-coverage-planner"] });
    } catch {
      // ignore
    }
  }

  function clearStoredTokens(): void {
    setStoredTokens({});
    writeStoredShareTokens({});
  }

  function renderStateEstimatedTaxScheduleHint(): ReactElement | null {
    if (!stateEstimatedTaxInfo) return null;

    if (stateEstimatedTaxInfo.kind === "mapped") {
      return (
        <div className="mt-4 rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3">
          <p className="text-xs font-semibold text-white">State estimated tax schedule</p>
          <p className="mt-1 text-xs text-neutral-400">
            {stateEstimatedTaxInfo.rule.label} ({stateEstimatedTaxInfo.rule.stateCode}) last verified{" "}
            {stateEstimatedTaxInfo.rule.lastVerified}.
          </p>
          <p className="mt-2 text-[11px] text-neutral-500">
            Sources: {stateEstimatedTaxInfo.rule.sources.join(" ")}
          </p>
        </div>
      );
    }

    if (stateEstimatedTaxInfo.kind === "fallback") {
      return (
        <div className="mt-4 rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3">
          <p className="text-xs font-semibold text-white">State estimated tax schedule</p>
          <p className="mt-1 text-xs text-neutral-400">
            {stateEstimatedTaxInfo.stateCode} is not mapped yet; state reminders align to the federal due dates.
          </p>
        </div>
      );
    }

    return (
      <div className="mt-4 rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3">
        <p className="text-xs font-semibold text-white">State estimated tax schedule</p>
        <p className="mt-1 text-xs text-neutral-400">
          No state estimated income tax reminders for {stateEstimatedTaxInfo.stateCode} (as modeled).
        </p>
      </div>
    );
  }

  return (
    <AppShell>
      <div className="min-h-screen bg-neutral-950">
        <section className="px-4 py-12 sm:py-16">
          <div className="mx-auto max-w-4xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-sky-400 mb-2">
                  Report view
                </p>
                <h1 className="text-3xl sm:text-4xl font-bold text-white">
                  Founder Coverage
                </h1>
                <p className="mt-3 text-sm text-neutral-400">
                  A read-only snapshot you can share, print, or review after you save.
                </p>
                {savedAt && (
                  <p className="mt-2 text-xs text-neutral-500">
                    Saved: {new Date(savedAt).toLocaleString()}
                  </p>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Link
                  href={`/tools/founder-coverage-planner${demoQuery}`}
                  className="inline-flex items-center justify-center rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2 text-sm font-semibold text-neutral-200 hover:border-neutral-600 transition-colors"
                >
                  Open planner
                </Link>
                <button
                  type="button"
                  onClick={printReport}
                  className="inline-flex items-center justify-center rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2 text-sm font-semibold text-neutral-200 hover:border-neutral-600 transition-colors"
                >
                  Print
                </button>
                <button
                  type="button"
                  onClick={copyShareLink}
                  disabled={!shareLink && !activeSnapshot}
                  className="inline-flex items-center justify-center rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2 text-sm font-semibold text-neutral-200 hover:border-neutral-600 transition-colors disabled:opacity-50"
                >
                  {shareBusy ? "Sharing..." : "Copy share link"}
                </button>
                <button
                  type="button"
                  onClick={() => void copyRedactedShareLink()}
                  disabled={shareBusy || !computed || !activeSnapshot || !!compareSnapshots}
                  className="inline-flex items-center justify-center rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2 text-sm font-semibold text-neutral-200 hover:border-neutral-600 transition-colors disabled:opacity-50"
                >
                  Copy redacted link
                </button>
                {reportId && hasMemoryRead && (
                  <button
                    type="button"
                    onClick={() => void revokeLink()}
                    disabled={revokeBusy || revoked}
                    className="inline-flex items-center justify-center rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-100 hover:border-rose-500/70 transition-colors disabled:opacity-50"
                  >
                    {revoked ? "Link revoked" : (revokeBusy ? "Revoking..." : "Revoke link")}
                  </button>
                )}
                <button
                  type="button"
                  onClick={downloadIcs}
                  disabled={!computed || isRedactedShare}
                  className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-semibold text-neutral-950 disabled:opacity-50"
                >
                  Download calendar (.ics)
                </button>
              </div>
            </div>

            {encodedSnapshot && (
              <div className="mt-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
                <p className="text-sm font-semibold text-amber-100">Shared report link</p>
                <p className="mt-2 text-xs text-amber-200/80">
                  This page is rendering from a snapshot embedded in the URL. Treat shared links as sensitive.
                </p>
                {isRedactedShare && (
                  <p className="mt-2 text-xs text-amber-200/80">
                    Redacted mode: currency-like values are removed.
                  </p>
                )}
              </div>
            )}

            {reportId && reportToken && (
              <div className="mt-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
                <p className="text-sm font-semibold text-amber-100">Shared report link</p>
                <p className="mt-2 text-xs text-amber-200/80">
                  This page is rendering from a server-backed share link. Treat shared links as sensitive.
                </p>
                {isRedactedShare && (
                  <p className="mt-2 text-xs text-amber-200/80">
                    Redacted mode: currency-like values are removed.
                  </p>
                )}
              </div>
            )}

            {canManageShareLinks && (
              <div className="mt-8 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">Share links</p>
                    <p className="mt-1 text-xs text-neutral-500">
                      Create revocable links. Tokens are only shown at creation time; we store them locally on this device so you can reopen/copy later.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => void copyServerShareLink("full")}
                      disabled={shareBusy || !activeSnapshot || !!compareSnapshots}
                      className="inline-flex items-center justify-center rounded-xl bg-white px-3 py-2 text-xs font-semibold text-neutral-950 disabled:opacity-50"
                    >
                      {shareBusy ? "Creating..." : "Create full link"}
                    </button>
                    <button
                      type="button"
                      onClick={() => void copyServerShareLink("redacted")}
                      disabled={shareBusy || !computed || !activeSnapshot || !!compareSnapshots}
                      className="inline-flex items-center justify-center rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs font-semibold text-neutral-200 hover:border-neutral-600 transition-colors disabled:opacity-50"
                    >
                      Create redacted link
                    </button>
                    <button
                      type="button"
                      onClick={clearStoredTokens}
                      className="inline-flex items-center justify-center rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs font-semibold text-neutral-200 hover:border-neutral-600 transition-colors"
                    >
                      Clear stored tokens
                    </button>
                  </div>
                </div>

                <div className="mt-4">
                  {shareReports.isLoading && (
                    <p className="text-xs text-neutral-400">Loading share links…</p>
                  )}
                  {shareReports.isError && (
                    <p className="text-xs text-neutral-400">Could not load share links.</p>
                  )}
                  {shareReports.data && shareReports.data.length === 0 && (
                    <p className="text-xs text-neutral-400">No share links created yet.</p>
                  )}

                  {shareReports.data && shareReports.data.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {shareReports.data.slice(0, 10).map((r) => {
                        const token = storedTokens[r.id];
                        const url = token ? buildReportUrl({ demoQuery, rid: r.id, rt: token }) : null;
                        return (
                          <div key={r.id} className="flex flex-col gap-2 rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-white">
                                {r.mode === "redacted" ? "Redacted" : "Full"} link
                              </p>
                              <p className="mt-1 text-xs text-neutral-500">
                                Created: {new Date(r.created_at).toLocaleString()}
                                {r.expires_at ? ` · Expires: ${new Date(r.expires_at).toLocaleString()}` : ""}
                                {r.revoked_at ? " · Revoked" : ""}
                              </p>
                              {!token && (
                                <p className="mt-1 text-[11px] text-neutral-600">
                                  Token not available on this device (only returned at creation time).
                                </p>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                disabled={!url}
                                onClick={() => url && window.open(url, "_blank", "noreferrer")}
                                className="inline-flex items-center justify-center rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs font-semibold text-neutral-200 hover:border-neutral-600 transition-colors disabled:opacity-50"
                              >
                                Open
                              </button>
                              <button
                                type="button"
                                disabled={!url}
                                onClick={() => url && void navigator.clipboard?.writeText(url)}
                                className="inline-flex items-center justify-center rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs font-semibold text-neutral-200 hover:border-neutral-600 transition-colors disabled:opacity-50"
                              >
                                Copy
                              </button>
                              {!r.revoked_at && (
                                <button
                                  type="button"
                                  onClick={() => void revokeShareReportById(r.id)}
                                  className="inline-flex items-center justify-center rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-100 hover:border-rose-500/70 transition-colors"
                                >
                                  Revoke
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {reportId && reportToken && serverShare.isLoading && (
              <div className="mt-8 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6">
                <p className="text-sm font-semibold text-white">Loading shared report…</p>
                <p className="mt-2 text-sm text-neutral-400">
                  Fetching a server-backed share link.
                </p>
              </div>
            )}

            {reportId && reportToken && serverShare.isError && (
              <div className="mt-8 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6">
                <p className="text-sm font-semibold text-white">Shared report not found</p>
                <p className="mt-2 text-sm text-neutral-400">
                  This link may be expired or revoked.
                </p>
              </div>
            )}

            {!hasMemoryRead && (
              <div className="mt-8 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6">
                <p className="text-sm font-semibold text-white">Connect your profile</p>
                <p className="mt-2 text-sm text-neutral-400">
                  This report view loads your most recently saved planner snapshot from your
                  profile memory.
                </p>
                <p className="mt-3 text-xs text-neutral-500">
                  Grant `memory:read` to see this report.
                </p>
              </div>
            )}

            {hasMemoryRead && !memoryLoaded && (
              <div className="mt-8 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6">
                <p className="text-sm text-neutral-200">Loading your saved snapshot…</p>
              </div>
            )}

            {hasMemoryRead && memoryLoaded && !snapshot && !isShareMode && !serverShare.isLoading && !serverShare.isError && (
              <div className="mt-8 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6">
                <p className="text-sm font-semibold text-white">No snapshot saved yet</p>
                <p className="mt-2 text-sm text-neutral-400">
                  Open the planner and click “Save snapshot to profile” to generate this
                  report.
                </p>
                <div className="mt-4">
                  <Link
                    href={`/tools/founder-coverage-planner${demoQuery}`}
                    className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-semibold text-neutral-950"
                  >
                    Open planner
                  </Link>
                </div>
              </div>
            )}

            {memoryIndex && !isShareMode && (
              <div className="mt-8 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6">
                <p className="text-sm font-semibold text-white">Snapshots</p>
                <p className="mt-1 text-xs text-neutral-500">
                  Pick a saved snapshot or compare two.
                </p>
                <div className="mt-4 flex flex-col gap-2">
                  {memoryIndex.snapshots.slice(0, 6).map((s) => (
                    <div key={s.id} className="flex flex-col gap-2 rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {new Date(s.savedAt).toLocaleString()}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {s.inputs.legalEntityType.replace("_", " ")} · {s.inputs.taxElection === "s_corp" ? "S-Corp" : "No S-Corp"} · {s.inputs.stateCode}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/tools/founder-coverage-planner/report?id=${encodeURIComponent(s.id)}${demoQuery ? `&demo=true` : ""}`}
                          className="inline-flex items-center justify-center rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs font-semibold text-neutral-200 hover:border-neutral-600 transition-colors"
                        >
                          View
                        </Link>
                        <Link
                          href={`/tools/founder-coverage-planner/report?a=${encodeURIComponent(s.id)}&b=${encodeURIComponent(memoryIndex.latestSnapshotId)}${demoQuery ? `&demo=true` : ""}`}
                          className="inline-flex items-center justify-center rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs font-semibold text-neutral-200 hover:border-neutral-600 transition-colors"
                        >
                          Compare to latest
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {compareSnapshots && computedCompare && (
              <div className="mt-10 space-y-8">
                <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6">
                  <h2 className="text-lg font-semibold text-white">Compare snapshots</h2>
                  <p className="mt-2 text-sm text-neutral-400">
                    Left: {new Date(compareSnapshots.a.savedAt).toLocaleString()} · Right: {new Date(compareSnapshots.b.savedAt).toLocaleString()}
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <CompareCard
                    title="Entity recommendation"
                    left={`${computedCompare.resA.entity.recommendedLegalEntity.replace("_", " ")} / ${computedCompare.resA.entity.recommendedTaxElection === "s_corp" ? "S-Corp" : "None"}`}
                    right={`${computedCompare.resB.entity.recommendedLegalEntity.replace("_", " ")} / ${computedCompare.resB.entity.recommendedTaxElection === "s_corp" ? "S-Corp" : "None"}`}
                  />
                  <CompareCard
                    title="Reimbursement policy"
                    left={compareSnapshots.a.inputs.reimbursementPolicy}
                    right={compareSnapshots.b.inputs.reimbursementPolicy}
                  />
                  <CompareCard
                    title="Commingling rate (90d)"
                    left={compareSnapshots.a.insights?.commingling90d?.rate != null ? `${Math.round(compareSnapshots.a.insights.commingling90d.rate * 100)}%` : "—"}
                    right={compareSnapshots.b.insights?.commingling90d?.rate != null ? `${Math.round(compareSnapshots.b.insights.commingling90d.rate * 100)}%` : "—"}
                    helper="Only shown if saved with insights."
                  />
                  <CompareCard
                    title="Estimated taxes action"
                    left={computedCompare.planA.actionItems.find((i) => i.key === "action.estimatedTaxes")?.detail ?? "—"}
                    right={computedCompare.planB.actionItems.find((i) => i.key === "action.estimatedTaxes")?.detail ?? "—"}
                  />
                </div>

                {renderInputDiffs(compareSnapshots.a.inputs, compareSnapshots.b.inputs).length > 0 && (
                  <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6">
                    <h3 className="text-sm font-semibold text-white">What changed</h3>
                    <ul className="mt-4 space-y-2 text-sm text-neutral-200">
                      {renderInputDiffs(compareSnapshots.a.inputs, compareSnapshots.b.inputs).map((d) => (
                        <li key={d.label} className="rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3">
                          <p className="text-xs text-neutral-400">{d.label}</p>
                          <p className="mt-1 text-sm text-white">
                            {d.left} → {d.right}
                            {d.delta && (
                              <span className="ml-2 text-xs text-neutral-500">
                                ({d.delta})
                              </span>
                            )}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {isShareMode && isRedactedShare && sharePayload && (
              <div className="mt-10 space-y-8">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5">
                    <p className="text-xs text-neutral-400">Recommended entity</p>
                    <p className="mt-1 text-lg font-semibold text-white capitalize">
                      {(sharePayload as any).entity.recommendedLegalEntity.replace("_", " ")}
                    </p>
                    <p className="mt-3 text-xs text-neutral-500">
                      Tax election:{" "}
                      {(sharePayload as any).entity.recommendedTaxElection === "s_corp"
                        ? "S-Corp election"
                        : "None"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 md:col-span-2">
                    <p className="text-xs text-neutral-400">Summary</p>
                    <p className="mt-2 text-sm text-neutral-200">{(sharePayload as any).entity.summary}</p>
                    <ul className="mt-3 text-sm text-neutral-300 space-y-1">
                      {(sharePayload as any).entity.reasons.slice(0, 4).map((reason: string) => (
                        <li key={reason}>• {reason}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {(sharePayload as any).commingling90d && (
                  <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6">
                    <h2 className="text-lg font-semibold text-white">Commingling (redacted)</h2>
                    <p className="mt-2 text-sm text-neutral-300">
                      {Math.round((sharePayload as any).commingling90d.rate * 100)}% flagged personal-ish
                      ({(sharePayload as any).commingling90d.comminglingCount} of {(sharePayload as any).commingling90d.eligibleCount}).
                    </p>
                    <p className="mt-2 text-xs text-neutral-500">
                      Top merchants: {(sharePayload as any).commingling90d.topMerchants.join(", ")}
                    </p>
                  </div>
                )}

                <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6">
                  <h2 className="text-lg font-semibold text-white">Action plan</h2>
                  <ul className="mt-4 space-y-2 text-sm text-neutral-200">
                    {((sharePayload as any).actionItems ?? []).map((item: any) => (
                      <li key={item.key} className="rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3">
                        <p className="font-semibold text-white">{item.title}</p>
                        <p className="text-neutral-400">{stripCurrencyLikeText(String(item.detail ?? ""))}</p>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6">
                  <h2 className="text-lg font-semibold text-white">Calendar reminders</h2>
                  <p className="mt-1 text-sm text-neutral-400">
                    These events are included in the shared snapshot. Calendar export is disabled in redacted mode.
                  </p>
                  <ul className="mt-4 space-y-2 text-sm text-neutral-200">
                    {sortedEvents.slice(0, 10).map((event) => (
                      <li key={`${event.date}-${event.title}`} className="rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3">
                        <p className="text-xs text-neutral-400">{event.date}</p>
                        <p className="mt-1 text-sm font-semibold text-white">{event.title}</p>
                        <p className="mt-1 text-xs text-neutral-400">{event.description}</p>
                      </li>
                    ))}
                  </ul>
                  {renderStateEstimatedTaxScheduleHint()}
                </div>
              </div>
            )}

            {activeSnapshot && computed && !isRedactedShare && !compareSnapshots && (
              <div className="mt-10 space-y-8">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5">
                    <p className="text-xs text-neutral-400">Recommended entity</p>
                    <p className="mt-1 text-lg font-semibold text-white capitalize">
                      {computed.results.entity.recommendedLegalEntity.replace("_", " ")}
                    </p>
                    <p className="mt-3 text-xs text-neutral-500">
                      Tax election:{" "}
                      {computed.results.entity.recommendedTaxElection === "s_corp"
                        ? "S-Corp election"
                        : "None"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 md:col-span-2">
                    <p className="text-xs text-neutral-400">Summary</p>
                    <p className="mt-2 text-sm text-neutral-200">{computed.results.entity.summary}</p>
                    <ul className="mt-3 text-sm text-neutral-300 space-y-1">
                      {computed.results.entity.reasons.slice(0, 4).map((reason) => (
                        <li key={reason}>• {reason}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-white">Action plan</h2>
                      <p className="mt-1 text-sm text-neutral-400">
                        Educational only. Confirm with your CPA and counsel.
                      </p>
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
                          className="rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3"
                        >
                          <p className="font-semibold text-white">{item.title}</p>
                          <p className="text-neutral-400">{item.detail}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6">
                  <h2 className="text-lg font-semibold text-white">Calendar reminders</h2>
                  <p className="mt-1 text-sm text-neutral-400">
                    Download an .ics file with these reminders using the button at the top of this page.
                  </p>
                  <ul className="mt-4 space-y-2 text-sm text-neutral-200">
                    {sortedEvents.slice(0, 10).map((event) => (
                      <li key={`${event.date}-${event.title}`} className="rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3">
                        <p className="text-xs text-neutral-400">{event.date}</p>
                        <p className="mt-1 text-sm font-semibold text-white">{event.title}</p>
                        <p className="mt-1 text-xs text-neutral-400">{event.description}</p>
                      </li>
                    ))}
                  </ul>
                  {renderStateEstimatedTaxScheduleHint()}
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <StatCard
                    label="Safe-harbor target"
                    value={formatCurrency(computed.results.quarterlyTaxes.safeHarborTarget, 0)}
                  />
                  <StatCard
                    label="Remaining due"
                    value={formatCurrency(computed.results.quarterlyTaxes.remainingNeeded, 0)}
                  />
                  <StatCard
                    label="Per-quarter payment"
                    value={formatCurrency(computed.results.quarterlyTaxes.perQuarterAmount, 0)}
                  />
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function StatCard({ label, value }: { label: string; value: string }): ReactElement {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5">
      <p className="text-xs text-neutral-400">{label}</p>
      <p className="mt-1 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}

function CompareCard(args: { title: string; left: string; right: string; helper?: string }): ReactElement {
  const { title, left, right, helper } = args;
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5">
      <p className="text-xs text-neutral-400">{title}</p>
      <div className="mt-2 grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2">
          <p className="text-[10px] uppercase tracking-wide text-neutral-500">A</p>
          <p className="text-sm text-white">{left}</p>
        </div>
        <div className="rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2">
          <p className="text-[10px] uppercase tracking-wide text-neutral-500">B</p>
          <p className="text-sm text-white">{right}</p>
        </div>
      </div>
      {helper && <p className="mt-2 text-xs text-neutral-500">{helper}</p>}
    </div>
  );
}

function formatDeltaNumber(next: number, prev: number): string {
  const delta = next - prev;
  if (!Number.isFinite(delta) || delta === 0) return "0";
  const sign = delta > 0 ? "+" : "";
  return `${sign}${delta.toLocaleString()}`;
}

function renderInputDiffs(a: CalculatorInputs, b: CalculatorInputs): Array<{ label: string; left: string; right: string; delta?: string }> {
  const diffs: Array<{ label: string; left: string; right: string; delta?: string }> = [];

  if (a.reimbursementPolicy !== b.reimbursementPolicy) {
    diffs.push({ label: "Reimbursement policy", left: a.reimbursementPolicy, right: b.reimbursementPolicy });
  }
  if (a.mixedTransactionsPerMonth !== b.mixedTransactionsPerMonth) {
    diffs.push({
      label: "Mixed transactions / mo",
      left: String(a.mixedTransactionsPerMonth),
      right: String(b.mixedTransactionsPerMonth),
      delta: formatDeltaNumber(b.mixedTransactionsPerMonth, a.mixedTransactionsPerMonth),
    });
  }
  if (a.annualNetIncome !== b.annualNetIncome) {
    diffs.push({
      label: "Annual net income",
      left: formatCurrency(a.annualNetIncome, 0),
      right: formatCurrency(b.annualNetIncome, 0),
      delta: stripCurrencyLikeText(formatDeltaNumber(b.annualNetIncome, a.annualNetIncome)),
    });
  }
  if (a.plannedSalary !== b.plannedSalary) {
    diffs.push({
      label: "Planned salary",
      left: formatCurrency(a.plannedSalary, 0),
      right: formatCurrency(b.plannedSalary, 0),
      delta: stripCurrencyLikeText(formatDeltaNumber(b.plannedSalary, a.plannedSalary)),
    });
  }
  if (a.stateCode !== b.stateCode) {
    diffs.push({ label: "State", left: a.stateCode, right: b.stateCode });
  }

  return diffs.slice(0, 8);
}
