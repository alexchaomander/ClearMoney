"use client";

import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useCreateCorrection } from "@/lib/strata/hooks";

interface CorrectionTarget {
  field: string;
  label: string;
  inputType: string;
}

interface MetricCorrectionDialogProps {
  metricId: string;
  targets: CorrectionTarget[];
}

export function MetricCorrectionDialog({ metricId, targets }: MetricCorrectionDialogProps) {
  const createCorrection = useCreateCorrection();
  const [open, setOpen] = useState(false);
  const [targetField, setTargetField] = useState(targets[0]?.field ?? "");
  const [value, setValue] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    setTargetField(targets[0]?.field ?? "");
  }, [targets]);

  useEffect(() => {
    setValue("");
  }, [targetField]);

  if (!targets.length) {
    return null;
  }

  const selectedTarget = targets.find((target) => target.field === targetField) ?? targets[0];
  const requiresValue = selectedTarget?.field !== "manual_review";
  const parsedNumericValue = selectedTarget?.inputType === "currency" ? Number(value) : null;
  const hasValidValue = requiresValue
    ? selectedTarget?.inputType === "currency"
      ? value.trim().length > 0 && Number.isFinite(parsedNumericValue)
      : value.trim().length > 0
    : true;

  async function handleSubmit() {
    if (!selectedTarget || !reason.trim() || !hasValidValue) {
      return;
    }

    const proposedValue =
      selectedTarget.inputType === "currency"
        ? { value: parsedNumericValue ?? 0 }
        : selectedTarget.field === "manual_review"
          ? { note: value || reason }
          : { value };

    await createCorrection.mutateAsync({
      metric_id: metricId,
      correction_type: selectedTarget.field === "manual_review" ? "wrong_assumption" : "wrong_fact",
      target_field: selectedTarget.field,
      summary: `Correction for ${metricId}`,
      reason,
      proposed_value: proposedValue,
      apply_immediately: selectedTarget.field !== "manual_review",
    });

    setOpen(false);
    setValue("");
    setReason("");
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className="text-xs text-amber-700 dark:text-amber-300 hover:text-amber-600 font-black uppercase tracking-[0.1em] transition-colors">
          Report correction
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[110] bg-slate-950/50 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[111] w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <Dialog.Title className="text-lg font-semibold text-slate-900 dark:text-white">
                Correct this metric
              </Dialog.Title>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Apply a deterministic correction to improve future traces.
              </p>
            </div>
            <Dialog.Close asChild>
              <button className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          <div className="space-y-4">
            <label className="block">
              <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Input</span>
              <select
                value={targetField}
                onChange={(event) => setTargetField(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              >
                {targets.map((target) => (
                  <option key={target.field} value={target.field}>
                    {target.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Correct value</span>
              <input
                type={selectedTarget?.inputType === "currency" ? "number" : "text"}
                value={value}
                onChange={(event) => setValue(event.target.value)}
                placeholder={selectedTarget?.inputType === "currency" ? "0.00" : "Describe the issue"}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Reason</span>
              <textarea
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                rows={4}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                placeholder="Explain what is wrong so ClearMoney can correct future recommendations."
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
              disabled={createCorrection.isPending || !reason.trim() || !hasValidValue}
              className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {createCorrection.isPending ? "Applying..." : "Submit correction"}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
