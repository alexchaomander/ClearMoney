"use client";

import { useMemo, type ReactElement } from "react";
import Link from "next/link";
import { useSearchParams, type ReadonlyURLSearchParams } from "next/navigation";
import { AppShell } from "@/components/shared/AppShell";
import { buildActionPlan } from "@/lib/calculators/founder-coverage-planner/actionPlan";
import { calculate } from "@/lib/calculators/founder-coverage-planner/calculations";
import {
  decodeFounderCoverageSharePayload,
  encodeFounderCoverageSharePayload,
  type FounderCoverageSharePayload,
  stripCurrencyLikeText,
} from "@/lib/calculators/founder-coverage-planner/snapshotShare";
import type { CalculatorInputs } from "@/lib/calculators/founder-coverage-planner/types";
import { formatCurrency } from "@/lib/shared/formatters";
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

function buildReportUrl(args: { demoQuery: string; snapshot?: string; id?: string; a?: string; b?: string }): string {
  const { demoQuery, snapshot, id, a, b } = args;
  const url = new URL(window.location.href);
  url.pathname = "/tools/founder-coverage-planner/report";
  url.search = demoQuery || "";
  if (snapshot) url.searchParams.set("snapshot", snapshot);
  if (id) url.searchParams.set("id", id);
  if (a) url.searchParams.set("a", a);
  if (b) url.searchParams.set("b", b);
  return url.toString();
}

export default function FounderCoveragePlannerReportPage(): ReactElement {
  const searchParams = useSearchParams();
  const demoQuery = useMemo(() => toDemoQuery(searchParams), [searchParams]);
  const encodedSnapshot = searchParams.get("snapshot");
  const selectedId = searchParams.get("id");
  const compareA = searchParams.get("a");
  const compareB = searchParams.get("b");

  const { hasConsent: hasMemoryRead } = useConsentStatus(["memory:read"]);
  const { data: memory, isSuccess: memoryLoaded } = useFinancialMemory({ enabled: hasMemoryRead });

  const memoryIndex = useMemo(() => {
    return readSnapshotIndex(memory?.notes ?? null);
  }, [memory?.notes]);

  const sharePayload = useMemo<FounderCoverageSharePayload | null>(() => {
    if (!encodedSnapshot) return null;
    return decodeFounderCoverageSharePayload(encodedSnapshot);
  }, [encodedSnapshot]);

  const isRedactedShare = !!(sharePayload && (sharePayload as any).version === 2 && (sharePayload as any).mode === "redacted");
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

  const shareLink = useMemo(() => {
    if (typeof window === "undefined") return null;

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
  }, [demoQuery, encodedSnapshot, isShareMode, snapshot]);

  type DisplayActionEvent = { date: string; title: string; description: string };
  type DisplayActionItem = { key: string; title: string; detail: string };

  const actionEvents: DisplayActionEvent[] =
    computed?.plan.actionEvents ??
    (isRedactedShare ? ((sharePayload as any).actionEvents as DisplayActionEvent[] | undefined) ?? [] : []);

  const actionItems: DisplayActionItem[] =
    computed?.plan.actionItems ??
    (isRedactedShare ? ((sharePayload as any).actionItems as DisplayActionItem[] | undefined) ?? [] : []);
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
    if (!shareLink) return;
    void navigator.clipboard?.writeText(shareLink);
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
                  disabled={!shareLink}
                  className="inline-flex items-center justify-center rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2 text-sm font-semibold text-neutral-200 hover:border-neutral-600 transition-colors disabled:opacity-50"
                >
                  Copy share link
                </button>
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

            {hasMemoryRead && memoryLoaded && !snapshot && !isShareMode && (
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
