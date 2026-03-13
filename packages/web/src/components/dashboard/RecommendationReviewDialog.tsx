"use client";

import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useCreateRecommendationReview } from "@/lib/strata/hooks";
import { useToast } from "@/components/shared/toast";
import type { DecisionTraceReviewSummary } from "@clearmoney/strata-sdk";

interface RecommendationReviewDialogProps {
  decisionTraceId: string;
  recommendationId?: string | null;
  reviewSummary?: DecisionTraceReviewSummary | null;
}

const REVIEW_OPTIONS = [
  { value: "user_dispute", label: "I disagree with this guidance" },
  { value: "outdated", label: "This recommendation is outdated" },
  { value: "factual_followup", label: "Important facts are missing" },
  { value: "human_review", label: "I want a human review" },
  { value: "context_block", label: "Data quality is too weak" },
] as const;

export function RecommendationReviewDialog({
  decisionTraceId,
  recommendationId,
  reviewSummary,
}: RecommendationReviewDialogProps) {
  const [open, setOpen] = useState(false);
  const [reviewType, setReviewType] = useState<(typeof REVIEW_OPTIONS)[number]["value"]>("user_dispute");
  const [reason, setReason] = useState("");
  const createReview = useCreateRecommendationReview();
  const { pushToast } = useToast();

  useEffect(() => {
    if (!open) {
      setReviewType("user_dispute");
      setReason("");
    }
  }, [open]);

  async function handleSubmit() {
    if (!reason.trim()) {
      return;
    }

    try {
      await createReview.mutateAsync({
        decision_trace_id: decisionTraceId,
        recommendation_id: recommendationId ?? null,
        review_type: reviewType,
        opened_reason: reason.trim(),
      });
      pushToast({
        title: reviewSummary?.open_review_count ? "Another review added" : "Review opened",
        message: "This recommendation is now tracked in your review queue.",
        variant: "success",
      });
      setOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not create review";
      pushToast({ title: "Review failed", message, variant: "error" });
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className="rounded-2xl border border-amber-200 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-amber-700 transition hover:border-amber-300 hover:bg-amber-50 dark:border-amber-900/60 dark:text-amber-300 dark:hover:bg-amber-950/30">
          Request review
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[110] bg-slate-950/60 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[111] w-[92vw] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="text-lg font-semibold text-slate-900 dark:text-white">
                Open recommendation review
              </Dialog.Title>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Capture why this guidance should be reviewed, updated, or converted into a correction.
              </p>
            </div>
            <Dialog.Close asChild>
              <button className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          {reviewSummary?.open_review_count ? (
            <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-amber-200">
              {reviewSummary.open_review_count} open review{reviewSummary.open_review_count === 1 ? "" : "s"} already exist for this trace.
            </div>
          ) : null}

          <div className="space-y-4">
            <label className="block">
              <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Review type</span>
              <select
                value={reviewType}
                onChange={(event) => setReviewType(event.target.value as (typeof REVIEW_OPTIONS)[number]["value"])}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              >
                {REVIEW_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">What needs review</span>
              <textarea
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                rows={5}
                placeholder="Describe what is wrong, stale, risky, or missing."
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </label>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <Dialog.Close asChild>
              <button className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 dark:border-slate-700 dark:text-slate-200">
                Cancel
              </button>
            </Dialog.Close>
            <button
              onClick={handleSubmit}
              disabled={createReview.isPending || !reason.trim()}
              className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {createReview.isPending ? "Opening..." : "Open review"}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
