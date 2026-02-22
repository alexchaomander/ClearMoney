"use client";

import Link from "next/link";
import { FileSearch } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useStrataClient } from "@/lib/strata/client";

const STATUS_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  completed: { bg: "bg-emerald-100 dark:bg-emerald-500/20", text: "text-emerald-700 dark:text-emerald-300", label: "Completed" },
  needs_review: { bg: "bg-amber-100 dark:bg-amber-500/20", text: "text-amber-700 dark:text-amber-300", label: "Needs Review" },
  failed: { bg: "bg-rose-100 dark:bg-rose-500/20", text: "text-rose-700 dark:text-rose-300", label: "Failed" },
  processing: { bg: "bg-sky-100 dark:bg-sky-500/20", text: "text-sky-700 dark:text-sky-300", label: "Processing" },
};

export function TaxDocumentsCard() {
  const client = useStrataClient();

  const { data: documents, isLoading } = useQuery({
    queryKey: ["tax-documents"],
    queryFn: () => client.listTaxDocuments(100),
  });

  if (isLoading || !documents || documents.length === 0) return null;

  const counts: Record<string, number> = {};
  for (const doc of documents) {
    counts[doc.status] = (counts[doc.status] ?? 0) + 1;
  }

  const latest = documents[0];

  return (
    <div
      data-testid="tax-documents-card"
      className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-serif text-xl text-slate-800 dark:text-slate-100">
          Tax Documents
        </h3>
        <Link
          href="/tools/tax-documents"
          className="text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 transition-colors"
        >
          View all
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        {Object.entries(STATUS_CONFIG).map(([status, config]) => {
          const count = counts[status] ?? 0;
          if (count === 0) return null;
          return (
            <div
              key={status}
              className={`rounded-lg px-3 py-2 ${config.bg}`}
            >
              <p className={`text-lg font-semibold ${config.text}`}>{count}</p>
              <p className={`text-xs ${config.text} opacity-80`}>{config.label}</p>
            </div>
          );
        })}
      </div>

      {latest && (
        <div className="text-sm text-slate-600 dark:text-slate-400">
          <p className="truncate">
            Latest: <span className="text-slate-800 dark:text-slate-200">{latest.original_filename}</span>
          </p>
          <p className="text-xs mt-0.5">
            {latest.document_type?.toUpperCase() ?? "Unknown"} · {latest.tax_year ?? "—"}
          </p>
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <Link
          href="/tools/tax-documents"
          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          <FileSearch className="h-3.5 w-3.5" />
          Upload docs
        </Link>
        <Link
          href="/tools/tax-plan-workspace"
          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          Tax workspace
        </Link>
      </div>
    </div>
  );
}
