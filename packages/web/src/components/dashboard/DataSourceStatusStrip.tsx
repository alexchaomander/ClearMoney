"use client";

import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  CircleAlert,
  CircleDashed,
  Clock3,
  RefreshCw,
} from "lucide-react";

export type DataSourceTone = "live" | "partial" | "warning" | "missing" | "error";

export interface DataSourceStatusItem {
  id: string;
  title: string;
  value: string;
  detail: string;
  tone: DataSourceTone;
  lastSyncedAt?: string | null;
  href?: string;
  actionLabel?: string;
}

interface DataSourceStatusStripProps {
  items: DataSourceStatusItem[];
  usingDemoData?: boolean;
  showIntegrationGuidance?: boolean;
}

type SyncFreshness = "fresh" | "aging" | "stale" | "missing";

const toneStyles: Record<DataSourceTone, { dot: string; badge: string; border: string }> = {
  live: {
    dot: "text-emerald-300",
    badge: "bg-emerald-900/30 text-emerald-200 border-emerald-700",
    border: "border-emerald-900/40",
  },
  partial: {
    dot: "text-amber-300",
    badge: "bg-amber-900/30 text-amber-200 border-amber-700",
    border: "border-amber-900/40",
  },
  warning: {
    dot: "text-amber-300",
    badge: "bg-amber-900/30 text-amber-200 border-amber-700",
    border: "border-amber-900/40",
  },
  missing: {
    dot: "text-rose-300",
    badge: "bg-rose-900/35 text-rose-200 border-rose-700",
    border: "border-rose-900/45",
  },
  error: {
    dot: "text-rose-400",
    badge: "bg-rose-900/35 text-rose-200 border-rose-700",
    border: "border-rose-900/45",
  },
};

const toneIcon: Record<DataSourceTone, typeof CheckCircle2> = {
  live: CheckCircle2,
  partial: CircleAlert,
  warning: CircleAlert,
  missing: CircleDashed,
  error: CircleDashed,
};

const syncStyles: Record<
  SyncFreshness,
  {
    dot: string;
    badge: string;
    text: string;
    label: string;
  }
> = {
  fresh: {
    dot: "text-emerald-300",
    badge: "bg-emerald-900/30 border-emerald-700 text-emerald-200",
    text: "text-emerald-300",
    label: "Fresh",
  },
  aging: {
    dot: "text-sky-300",
    badge: "bg-sky-900/30 border-sky-700 text-sky-200",
    text: "text-sky-300",
    label: "Aging",
  },
  stale: {
    dot: "text-amber-300",
    badge: "bg-amber-900/30 border-amber-700 text-amber-200",
    text: "text-amber-300",
    label: "Stale",
  },
  missing: {
    dot: "text-rose-300",
    badge: "bg-rose-900/35 border-rose-700 text-rose-200",
    text: "text-rose-300",
    label: "Unknown",
  },
};

const toneConfidenceScore: Record<DataSourceTone, number> = {
  live: 100,
  partial: 72,
  warning: 52,
  missing: 24,
  error: 12,
};

const syncConfidenceScore: Record<SyncFreshness, number> = {
  fresh: 100,
  aging: 78,
  stale: 54,
  missing: 20,
};

const readinessStyles: Record<
  "critical" | "building" | "solid" | "strong" | "high",
  {
    badge: string;
    bar: string;
    text: string;
    detail: string;
    label: string;
  }
> = {
  critical: {
    badge: "bg-rose-900/30 text-rose-200 border-rose-700",
    bar: "bg-rose-500",
    text: "text-rose-300",
    detail: "Needs more live inputs before recommendations are fully production-ready.",
    label: "Bootstrapping",
  },
  building: {
    badge: "bg-amber-900/30 text-amber-200 border-amber-700",
    bar: "bg-amber-500",
    text: "text-amber-300",
    detail: "Signal depth is growing. A few high-impact links will raise confidence quickly.",
    label: "Building signal",
  },
  solid: {
    badge: "bg-sky-900/30 text-sky-200 border-sky-700",
    bar: "bg-sky-500",
    text: "text-sky-300",
    detail: "You have enough context for advisory-grade workflows, with some refinements pending.",
    label: "Strong signal",
  },
  strong: {
    badge: "bg-emerald-900/30 text-emerald-200 border-emerald-700",
    bar: "bg-emerald-500",
    text: "text-emerald-300",
    detail: "Your data surface is rich and recommendation quality is high.",
    label: "High confidence",
  },
  high: {
    badge: "bg-emerald-900/30 text-emerald-200 border-emerald-700",
    bar: "bg-emerald-500",
    text: "text-emerald-300",
    detail: "Decision coverage is excellent. Outputs should be highly reliable.",
    label: "Advisor grade",
  },
};

function toneSeverity(tone: DataSourceTone): number {
  if (tone === "live") return 0;
  if (tone === "partial") return 1;
  if (tone === "warning") return 2;
  if (tone === "error") return 3;
  return 4;
}

function formatRelativeSync(dateString?: string | null): string | null {
  if (!dateString) return null;
  const parsed = Date.parse(dateString);
  if (Number.isNaN(parsed)) return null;

  const now = Date.now();
  const deltaSeconds = Math.max(0, Math.floor((now - parsed) / 1000));
  if (deltaSeconds < 45) {
    return "just now";
  }
  if (deltaSeconds < 90) {
    return "1 minute ago";
  }

  const minutes = Math.floor(deltaSeconds / 60);
  if (minutes < 60) {
    return `${minutes} minutes ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hours ago`;
  }

  const days = Math.floor(hours / 24);
  if (days < 14) {
    return `${days} days ago`;
  }

  return new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function getSyncFreshness(dateString?: string | null): SyncFreshness {
  if (!dateString) return "missing";

  const parsed = Date.parse(dateString);
  if (Number.isNaN(parsed)) return "missing";

  const ageHours = Math.max(0, (Date.now() - parsed) / (1000 * 60 * 60));

  if (ageHours <= 2) return "fresh";
  if (ageHours <= 12) return "aging";
  if (ageHours <= 72) return "stale";
  return "missing";
}

function scoreReadiness(items: DataSourceStatusItem[]): number {
  if (items.length === 0) return 0;

  const total = items.reduce((acc, item) => {
    const toneScore = toneConfidenceScore[item.tone];
    const syncScore = syncConfidenceScore[getSyncFreshness(item.lastSyncedAt)];
    return acc + toneScore * 0.72 + syncScore * 0.28;
  }, 0);

  return Math.round(total / items.length);
}

function getReadinessBand(score: number) {
  if (score >= 90) return "high" as const;
  if (score >= 75) return "strong" as const;
  if (score >= 60) return "solid" as const;
  if (score >= 40) return "building" as const;
  return "critical" as const;
}

function getUniqueActions(
  items: DataSourceStatusItem[],
): { href: string; actionLabel: string; title: string; tone: DataSourceTone }[] {
  const pendingActions = items.reduce<Record<string, { href: string; actionLabel: string; title: string; tone: DataSourceTone }>>(
    (acc, item) => {
      if (item.tone === "live" || !item.href || !item.actionLabel) {
        return acc;
      }

      const existing = acc[item.href];
      if (!existing || toneSeverity(item.tone) > toneSeverity(existing.tone)) {
        acc[item.href] = {
          href: item.href,
          actionLabel: item.actionLabel,
          title: item.title,
          tone: item.tone,
        };
      }
      return acc;
    },
    {},
  );

  return Object.values(pendingActions).sort((a, b) => toneSeverity(b.tone) - toneSeverity(a.tone));
}

function DataSourceStrip({ items, usingDemoData }: DataSourceStatusStripProps) {
  if (items.length === 0) return null;

  const connectedCount = items.filter((item) => item.tone === "live").length;
  const unresolved = items.filter((item) => item.tone !== "live");
  const completionRate = items.length === 0 ? 0 : Math.round((connectedCount / items.length) * 100);
  const readinessScore = scoreReadiness(items);
  const readinessBand = getReadinessBand(readinessScore);
  const readiness = readinessStyles[readinessBand];
  const uniquePendingActions = getUniqueActions(items);
  const criticalBlockers = unresolved
    .filter((item) => item.tone === "missing" || item.tone === "error" || item.tone === "warning")
    .slice(0, 2)
    .map((item) => item.title);
  const blockLabel =
    criticalBlockers.length > 0
      ? `Priority blocks: ${criticalBlockers.join(", ")}`
      : "No critical data blocks; remaining items are mostly quality-upgrade opportunities.";

  return (
    <section className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm uppercase tracking-[0.16em] text-neutral-400">Data sources</p>
            <Link 
              href="/data-health" 
              className="text-[10px] uppercase tracking-widest text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1.5"
            >
              <Activity className="w-3 h-3" />
              Full Health Report
            </Link>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            {connectedCount}/{items.length} live sources ({completionRate}% readiness)
          </p>
          <p className={`mt-2 text-xs ${readiness.text}`}>{blockLabel}</p>
          <div className="mt-2 h-2 rounded-full bg-neutral-800 overflow-hidden max-w-sm">
            <div className={`h-full ${readiness.bar}`} style={{ width: `${readinessScore}%` }} />
          </div>
          <span className={`inline-flex mt-2 items-center gap-2 rounded-full border px-3 py-1 text-[11px] ${readiness.badge}`}>
            Decision confidence: {readiness.label} ({readinessScore}%)
          </span>
        </div>
        <div className="flex items-center gap-2">
          {usingDemoData ? (
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-700 bg-amber-900/20 text-amber-200 text-xs px-3 py-1">
              <RefreshCw className="w-3 h-3" />
              Synthetic mode
            </span>
          ) : null}
          {!usingDemoData && unresolved.length === 0 ? (
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-700 bg-emerald-900/20 text-emerald-200 text-xs px-3 py-1">
              Live mode
            </span>
          ) : null}
          {!usingDemoData && unresolved.length > 0 ? (
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-700 bg-amber-900/20 text-amber-200 text-xs px-3 py-1">
              Partial live mode
            </span>
          ) : null}
        </div>
      </div>

      <div className="mt-4 grid md:grid-cols-2 xl:grid-cols-3 gap-3">
        {items.map((item) => {
          const Icon = toneIcon[item.tone];
          const styles = toneStyles[item.tone];
          const syncState = getSyncFreshness(item.lastSyncedAt);
          const syncStyle = syncStyles[syncState];
          const lastSyncedText = formatRelativeSync(item.lastSyncedAt);
          const syncText =
            syncState === "missing"
              ? "Sync timing unavailable"
              : `${syncStyle.label}${lastSyncedText ? ` · ${lastSyncedText}` : ""}`;

          return (
            <article key={item.id} className={`rounded-lg border ${styles.border} bg-neutral-950 p-3`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2">
                  <Icon className={`w-4 h-4 mt-0.5 ${styles.dot}`} />
                  <div className="space-y-1">
                    <p className="text-sm text-white">{item.title}</p>
                    <p className="text-xs text-neutral-400">{item.detail}</p>
                  </div>
                </div>
                <span
                  className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium ${styles.badge}`}
                >
                  {item.value}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <p className={`text-xs ${syncStyle.text}`}>
                  <Clock3 className={`w-3 h-3 inline mr-1 ${syncStyle.dot}`} />
                  {syncText}
                </p>
                {item.href ? (
                  <Link
                    href={item.href}
                    className="text-xs rounded-full border border-neutral-700 px-3 py-1 text-neutral-300 hover:border-neutral-500 hover:text-neutral-100 transition-colors"
                  >
                    {item.actionLabel ?? "Open"}
                  </Link>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>

      {usingDemoData || unresolved.length > 0 ? (
        <div className="mt-4 rounded-lg border border-neutral-800 bg-neutral-950 p-3">
          <p className="text-sm text-white">Strata integration next actions</p>
          {usingDemoData ? (
            <p className="text-xs text-neutral-400 mt-1">
              Connect these live pillars to move from synthetic data to your real financial graph.
            </p>
          ) : (
            <p className="text-xs text-neutral-400 mt-1">
              Your data stream is partially active. Completing these data sources increases decision confidence.
            </p>
          )}
          {uniquePendingActions.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {uniquePendingActions.map((action) => {
                const ActionIcon =
                  action.tone === "error" || action.tone === "warning" ? AlertTriangle : CheckCircle2;
                return (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="inline-flex items-center gap-2 rounded-full border border-neutral-700 bg-neutral-900 px-3 py-1 text-xs text-neutral-200 hover:border-emerald-500 transition-colors"
                  >
                    <ActionIcon className="w-3 h-3" />
                    {action.actionLabel}
                    {action.title ? ` · ${action.title}` : null}
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="mt-3 text-xs text-neutral-500">
              No additional actions are exposed for this surface. Review source details above.
            </p>
          )}
        </div>
      ) : null}
    </section>
  );
}

export function DataSourceStatusStrip({
  items,
  usingDemoData,
  showIntegrationGuidance = true,
}: DataSourceStatusStripProps) {
  if (items.length === 0) return null;

  if (!showIntegrationGuidance) {
    const connectedCount = items.filter((item) => item.tone === "live").length;
    const pending = items.filter((item) => item.tone !== "live").length;
    const completionRate = items.length === 0 ? 0 : Math.round((connectedCount / items.length) * 100);
    const readinessScore = scoreReadiness(items);
    const readinessBand = getReadinessBand(readinessScore);
    const readiness = readinessStyles[readinessBand];

    return (
      <section className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.16em] text-neutral-400">Data sources</p>
            <p className="text-xs text-neutral-500 mt-1">
              {connectedCount}/{items.length} sources currently live
            </p>
            <div className="mt-2 h-2 rounded-full bg-neutral-800 overflow-hidden max-w-sm">
              <div className={`h-full ${readiness.bar}`} style={{ width: `${readinessScore}%` }} />
            </div>
            <span className={`inline-flex mt-2 items-center gap-2 rounded-full border px-3 py-1 text-[11px] ${readiness.badge}`}>
              Decision confidence: {readiness.label} ({readinessScore}%)
            </span>
          </div>
          <div className="flex items-center gap-2">
            {usingDemoData ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-amber-700 bg-amber-900/20 text-amber-200 text-xs px-3 py-1">
                <RefreshCw className="w-3 h-3" />
                Synthetic mode
              </span>
            ) : (
              <span className="text-xs rounded-full border border-neutral-700 px-2 py-1 text-neutral-300">
                {pending === 0 ? "Live mode" : `${completionRate}% ready`}
              </span>
            )}
          </div>
        </div>
        <div className="mt-4 grid md:grid-cols-2 xl:grid-cols-3 gap-3">
          {items.map((item) => {
            const Icon = toneIcon[item.tone];
            const styles = toneStyles[item.tone];
            const syncState = getSyncFreshness(item.lastSyncedAt);
            const syncStyle = syncStyles[syncState];
            const lastSyncedText = formatRelativeSync(item.lastSyncedAt);
            const syncText =
              syncState === "missing"
                ? "Sync timing unavailable"
                : `${syncStyle.label}${lastSyncedText ? ` · ${lastSyncedText}` : ""}`;

            return (
              <article key={item.id} className={`rounded-lg border ${styles.border} bg-neutral-950 p-3`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2">
                    <Icon className={`w-4 h-4 mt-0.5 ${styles.dot}`} />
                    <div className="space-y-1">
                      <p className="text-sm text-white">{item.title}</p>
                      <p className="text-xs text-neutral-400">{item.detail}</p>
                    </div>
                  </div>
                  <span
                    className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium ${styles.badge}`}
                  >
                    {item.value}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <p className={`text-xs ${syncStyle.text}`}>
                    <Clock3 className={`w-3 h-3 inline mr-1 ${syncStyle.dot}`} />
                    {syncText}
                  </p>
                  {item.href ? (
                    <Link
                      href={item.href}
                      className="text-xs rounded-full border border-neutral-700 px-3 py-1 text-neutral-300 hover:border-neutral-500 hover:text-neutral-100 transition-colors"
                    >
                      {item.actionLabel ?? "Open"}
                    </Link>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    );
  }

  return <DataSourceStrip items={items} usingDemoData={usingDemoData} />;
}
