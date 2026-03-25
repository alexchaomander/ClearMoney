"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { AlertTriangle, ArrowUpRight, CheckCircle2, FileWarning, Ban, RotateCcw, FastForward } from "lucide-react";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { ConsentGate } from "@/components/shared/ConsentGate";
import { ApiErrorState } from "@/components/shared/ApiErrorState";
import { DashboardLoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { useToast } from "@/components/shared/toast";
import {
  useConvertRecommendationReviewToCorrection,
  useRecommendationReviews,
  useResolveRecommendationReview,
  useReopenRecommendationReview,
} from "@/lib/strata/hooks";
import type { RecommendationReview, RecommendationReviewStatus } from "@clearmoney/strata-sdk";

type ReviewFilter = "all" | RecommendationReviewStatus;

function ReviewCard({
  review,
  onResolve,
  onConvert,
  onReopen,
  busy,
}: {
  review: RecommendationReview;
  onResolve: (review: RecommendationReview, status: RecommendationReviewStatus, supersededById?: string) => Promise<void>;
  onConvert: (review: RecommendationReview) => Promise<void>;
  onReopen: (review: RecommendationReview) => Promise<void>;
  busy: boolean;
}) {
  const [supersededById, setSupersededById] = useState("");
  const [showSupersedeInput, setShowSupersedeInput] = useState(false);
  const isOpen = review.status === "open";

  const statusColors = {
    open: "border-amber-200 text-amber-700 dark:border-amber-900 dark:text-amber-300",
    resolved: "border-emerald-200 text-emerald-700 dark:border-emerald-900 dark:text-emerald-300",
    dismissed: "border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-300",
    converted_to_correction: "border-blue-200 text-blue-700 dark:border-blue-900 dark:text-blue-300",
    superseded: "border-purple-200 text-purple-700 dark:border-purple-900 dark:text-purple-300",
    blocked: "border-red-200 text-red-700 dark:border-red-900 dark:text-red-300",
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/70 dark:shadow-none">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-slate-200 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500 dark:border-slate-700 dark:text-slate-400">
              {review.review_type}
            </span>
            <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] border ${statusColors[review.status] || ""}`}>
              {review.status}
            </span>
          </div>
          <p className="mt-3 text-base font-semibold text-slate-900 dark:text-white">
            Trace {review.decision_trace_id.slice(0, 8)}
          </p>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{review.opened_reason}</p>
        </div>
        <div className="text-right text-xs text-slate-500 dark:text-slate-400">
          <p>{format(new Date(review.created_at), "MMM d, yyyy")}</p>
          <p>{format(new Date(review.created_at), "h:mm a")}</p>
        </div>
      </div>

      {review.resolution ? (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200">
          <p className="font-medium">{review.resolution}</p>
          {review.resolution_notes ? <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{review.resolution_notes}</p> : null}
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Link
          href="/dashboard/decision-narrative"
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900/60"
        >
          Open traces
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
        {isOpen ? (
          <>
            <button
              onClick={() => void onResolve(review, "resolved")}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white disabled:opacity-50"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Resolve
            </button>
            <button
              onClick={() => void onResolve(review, "blocked")}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-2xl border border-red-200 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-red-700 disabled:opacity-50 dark:border-red-900 dark:text-red-300"
            >
              <Ban className="h-3.5 w-3.5" />
              Block
            </button>
            <button
              onClick={() => {
                if (showSupersedeInput && supersededById) {
                  void onResolve(review, "superseded", supersededById);
                  setShowSupersedeInput(false);
                } else {
                  setShowSupersedeInput(!showSupersedeInput);
                }
              }}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-2xl border border-purple-200 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-purple-700 disabled:opacity-50 dark:border-purple-900 dark:text-purple-300"
            >
              <FastForward className="h-3.5 w-3.5" />
              {showSupersedeInput ? "Confirm Supersede" : "Supersede"}
            </button>
            <button
              onClick={() => void onConvert(review)}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-2xl border border-amber-200 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-amber-700 disabled:opacity-50 dark:border-amber-900 dark:text-amber-300"
            >
              <FileWarning className="h-3.5 w-3.5" />
              Convert to correction
            </button>
          </>
        ) : (
          <button
            onClick={() => void onReopen(review)}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-700 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reopen
          </button>
        )}
      </div>
      {showSupersedeInput && (
        <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <label className="block">
            <span className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-slate-500">
              Superseding Recommendation ID
            </span>
            <input
              type="text"
              value={supersededById}
              onChange={(e) => setSupersededById(e.target.value)}
              placeholder="Paste the newer recommendation UUID here"
              className="w-full rounded-xl border border-purple-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-purple-900 dark:bg-slate-950 dark:text-white"
            />
          </label>
        </div>
      )}
    </div>
  );
}

export default function RecommendationReviewsPage() {
  const [filter, setFilter] = useState<ReviewFilter>("all");
  const { pushToast } = useToast();
  const enabled = true;
  const { data, isLoading, isError, error } = useRecommendationReviews(
    filter === "all" ? undefined : { status: filter },
    { enabled }
  );
  const resolveReview = useResolveRecommendationReview();
  const convertReview = useConvertRecommendationReviewToCorrection();
  const reopenReview = useReopenRecommendationReview();

  const reviews = useMemo(() => data ?? [], [data]);
  const openCount = reviews.filter((review) => review.status === "open").length;

  async function handleResolve(
    review: RecommendationReview,
    status: RecommendationReviewStatus,
    supersededById?: string
  ) {
    try {
      await resolveReview.mutateAsync({
        reviewId: review.id,
        data: {
          status,
          resolution: status === "resolved" ? "review_resolved" : status,
          resolution_notes: supersededById
            ? `Superseded by recommendation ${supersededById}.`
            : `Marked as ${status} from the recommendation review console.`,
          reviewer_label: "user_console",
          applied_changes: supersededById
            ? { superseded_by_recommendation_id: supersededById }
            : {},
        },
      });
      pushToast({ title: `Review marked as ${status}`, variant: "success" });
    } catch (mutationError) {
      const message = mutationError instanceof Error ? mutationError.message : "Could not update review";
      pushToast({ title: "Update failed", message, variant: "error" });
    }
  }

  async function handleReopen(review: RecommendationReview) {
    try {
      await reopenReview.mutateAsync({
        reviewId: review.id,
        notes: "Reopened from review console.",
      });
      pushToast({ title: "Review reopened", variant: "success" });
    } catch (mutationError) {
      const message = mutationError instanceof Error ? mutationError.message : "Could not reopen review";
      pushToast({ title: "Reopen failed", message, variant: "error" });
    }
  }

  async function handleConvert(review: RecommendationReview) {
    try {
      await convertReview.mutateAsync({
        reviewId: review.id,
        data: {
          reviewer_label: "user_console",
          resolution_notes: "Converted from recommendation review console.",
          correction: {
            metric_id: "recommendationReview",
            trace_id: review.decision_trace_id,
            correction_type: "wrong_assumption",
            target_field: "manual_review",
            summary: "Converted recommendation review",
            reason: review.opened_reason,
            proposed_value: { note: review.opened_reason },
            apply_immediately: false,
          },
        },
      });
      pushToast({ title: "Converted to correction", variant: "success" });
    } catch (mutationError) {
      const message = mutationError instanceof Error ? mutationError.message : "Could not convert review";
      pushToast({ title: "Conversion failed", message, variant: "error" });
    }
  }

  return (
    <ConsentGate
      scopes={["decision_traces:read", "portfolio:read"]}
      title="Recommendation reviews need decision-trace access"
      description="Grant trace access to inspect unresolved recommendation disputes and route them into corrections."
      purpose="Review and resolve recommendation disputes"
    >
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Recommendation Reviews", href: "/dashboard/recommendation-reviews" },
          ]}
        />
        <DashboardHeader />
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">
            Recommendation Reviews
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
            Resolve disputes before advice drifts
          </h1>
          <p className="max-w-3xl text-sm text-slate-600 dark:text-slate-400">
            Track stale guidance, missing context, and recommendation follow-up so the advisor stays continuous instead of repeating unresolved advice.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/70 dark:shadow-none">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Open reviews</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">{openCount}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/70 dark:shadow-none">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Total tracked</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">{reviews.length}</p>
          </div>
          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 shadow-sm dark:border-amber-900/50 dark:bg-amber-950/20 dark:shadow-none">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
              <AlertTriangle className="h-4 w-4" />
              <p className="text-xs font-bold uppercase tracking-[0.12em]">Continuity rule</p>
            </div>
            <p className="mt-3 text-sm text-amber-900 dark:text-amber-100">
              Open reviews now feed back into recommendation traces and caution future guidance until resolved.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {(["all", "open", "resolved", "converted_to_correction", "dismissed", "superseded", "blocked"] as const).map((option) => (
            <button
              key={option}
              onClick={() => setFilter(option)}
              className={`rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] ${
                filter === option
                  ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                  : "border border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300"
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        {isLoading ? (
          <DashboardLoadingSkeleton />
        ) : isError ? (
          <ApiErrorState message="Could not load recommendation reviews." error={error} />
        ) : reviews.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-950/70 dark:shadow-none">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-300">
              <FileWarning className="h-5 w-5" />
            </div>
            <p className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">No reviews yet</p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Open a decision trace and use the review action to capture disputes or stale advice.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                onResolve={handleResolve}
                onConvert={handleConvert}
                onReopen={handleReopen}
                busy={resolveReview.isPending || convertReview.isPending || reopenReview.isPending}
              />
            ))}
          </div>
        )}
      </div>
    </ConsentGate>
  );
}
