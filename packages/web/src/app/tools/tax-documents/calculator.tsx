"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronRight,
  FileSearch,
  FileX2,
  Loader2,
  RefreshCw,
  SortAsc,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import NextLink from "next/link";
import { AppShell } from "@/components/shared/AppShell";
import { useStrataClient } from "@/lib/strata/client";
import type {
  TaxDocumentListResponse,
  TaxDocumentResponse,
  TaxDocumentStatus,
} from "@clearmoney/strata-sdk";
import { cn } from "@/lib/utils";

const DOC_TYPE_OPTIONS = [
  { value: "", label: "Auto-detect" },
  { value: "w2", label: "W-2" },
  { value: "1099-int", label: "1099-INT" },
  { value: "1099-div", label: "1099-DIV" },
  { value: "1099-b", label: "1099-B" },
  { value: "k-1", label: "K-1" },
  { value: "1040", label: "1040" },
];

const ACCEPTED_TYPES = "image/png,image/jpeg,application/pdf";

const STATUS_STYLES: Record<TaxDocumentStatus, { bg: string; text: string; label: string }> = {
  completed: { bg: "bg-emerald-500/20", text: "text-emerald-200", label: "Completed" },
  failed: { bg: "bg-rose-500/20", text: "text-rose-200", label: "Failed" },
  needs_review: { bg: "bg-amber-500/20", text: "text-amber-200", label: "Needs Review" },
  processing: { bg: "bg-sky-500/20", text: "text-sky-200", label: "Processing" },
  pending: { bg: "bg-yellow-500/20", text: "text-yellow-200", label: "Pending" },
};

const STATUS_FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "completed", label: "Completed" },
  { value: "needs_review", label: "Needs Review" },
  { value: "failed", label: "Failed" },
  { value: "processing", label: "Processing" },
];

type SortKey = "date" | "type" | "status";

function StatusBadge({ status }: { status: TaxDocumentStatus }) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.pending;
  return (
    <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", style.bg, style.text)}>
      {style.label}
    </span>
  );
}

function DocumentRow({
  doc,
  onScrollToUpload,
}: {
  doc: TaxDocumentListResponse;
  onScrollToUpload: () => void;
}) {
  const client = useStrataClient();
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState(false);
  const [showPrefillModal, setShowPrefillModal] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [prefillLabel, setPrefillLabel] = useState("Imported from document");

  const detailQuery = useQuery({
    queryKey: ["tax-documents", doc.id],
    queryFn: () => client.getTaxDocument(doc.id),
    enabled: expanded,
  });

  const plansQuery = useQuery({
    queryKey: ["tax-plan-workspace", "plans"],
    queryFn: () => client.listTaxPlans({ limit: 50 }),
    enabled: showPrefillModal,
  });

  const prefillMutation = useMutation({
    mutationFn: () =>
      client.prefillTaxPlan({
        document_ids: [doc.id],
        plan_id: selectedPlanId,
        label: prefillLabel.trim() || "Imported from document",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tax-plan-workspace"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => client.deleteTaxDocument(doc.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tax-documents"] });
    },
  });

  const detail = detailQuery.data;
  const canPrefill = doc.status === "completed" || doc.status === "needs_review";

  return (
    <div data-testid="document-row" className="rounded-2xl border border-neutral-800 bg-neutral-950">
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="flex w-full items-center gap-3 p-4 text-left"
      >
        {expanded ? (
          <ChevronDown className="h-4 w-4 shrink-0 text-neutral-400" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 text-neutral-400" />
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-white">{doc.original_filename}</p>
          <p className="mt-0.5 text-xs text-neutral-400">
            {doc.document_type?.toUpperCase() ?? "Unknown"} · {doc.tax_year ?? "—"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {doc.confidence_score != null && (
            <span className="text-xs text-neutral-400">
              {Math.round(doc.confidence_score * 100)}%
            </span>
          )}
          <StatusBadge status={doc.status} />
        </div>
      </button>

      {expanded && (
        <div className="border-t border-neutral-800 p-4">
          {detailQuery.isLoading && (
            <div className="flex items-center gap-2 text-neutral-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-xs">Loading details...</span>
            </div>
          )}

          {detail?.extracted_data && Object.keys(detail.extracted_data).length > 0 && (
            <div className="mb-4">
              <p className="mb-2 text-xs uppercase tracking-[0.12em] text-neutral-400">
                Extracted fields
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {Object.entries(detail.extracted_data).map(([key, value]) => (
                  <div
                    key={key}
                    className="rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2"
                  >
                    <p className="text-[11px] text-neutral-500">{key}</p>
                    <p className="text-sm text-white">{String(value)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {detail?.validation_errors && detail.validation_errors.length > 0 && (
            <div className="mb-4">
              <p className="mb-2 text-xs uppercase tracking-[0.12em] text-neutral-400">
                Validation issues
              </p>
              <div className="space-y-1">
                {detail.validation_errors.map((err, i) => (
                  <p
                    key={i}
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-xs",
                      err.severity === "error"
                        ? "bg-rose-500/10 text-rose-200"
                        : "bg-amber-500/10 text-amber-200"
                    )}
                  >
                    <span className="font-medium">{err.field}:</span> {err.message}
                  </p>
                ))}
              </div>
            </div>
          )}

          {detail?.error_message && (
            <p className="mb-4 rounded-lg bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
              {detail.error_message}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2">
            {doc.status === "failed" && (
              <button
                type="button"
                onClick={onScrollToUpload}
                className="inline-flex items-center gap-2 rounded-xl border border-amber-400/40 bg-amber-500/15 px-4 py-2 text-sm text-amber-100 hover:bg-amber-500/20"
              >
                <RefreshCw className="h-4 w-4" />
                Retry upload
              </button>
            )}

            {canPrefill && !showPrefillModal && (
              <button
                type="button"
                onClick={() => setShowPrefillModal(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-sky-400/40 bg-sky-500/15 px-4 py-2 text-sm text-sky-100 hover:bg-sky-500/20"
              >
                <ArrowRight className="h-4 w-4" />
                Send to Tax Plan
              </button>
            )}

            {!confirmingDelete ? (
              <button
                type="button"
                onClick={() => setConfirmingDelete(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-rose-400/40 bg-rose-500/15 px-4 py-2 text-sm text-rose-100 hover:bg-rose-500/20"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            ) : (
              <span className="inline-flex items-center gap-2">
                <span className="text-xs text-rose-200">Delete this document?</span>
                <button
                  type="button"
                  onClick={() => deleteMutation.mutate()}
                  disabled={deleteMutation.isPending}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-rose-500/30 px-3 py-1.5 text-xs font-medium text-rose-100 hover:bg-rose-500/40 disabled:opacity-60"
                >
                  {deleteMutation.isPending && <Loader2 className="h-3 w-3 animate-spin" />}
                  Confirm
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(false)}
                  className="rounded-lg px-3 py-1.5 text-xs text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
              </span>
            )}
          </div>

          {showPrefillModal && (
            <div className="mt-3 rounded-xl border border-sky-400/30 bg-sky-500/10 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-sky-100">Send to Tax Plan Workspace</p>
                <button
                  type="button"
                  onClick={() => setShowPrefillModal(false)}
                  className="text-neutral-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
                <select
                  value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                  className="rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white focus:border-sky-300/60 focus:outline-none"
                >
                  <option value="">Select a plan</option>
                  {(plansQuery.data ?? []).map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name}
                    </option>
                  ))}
                </select>
                <input
                  value={prefillLabel}
                  onChange={(e) => setPrefillLabel(e.target.value)}
                  placeholder="Version label"
                  className="rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:border-sky-300/60 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => prefillMutation.mutate()}
                  disabled={!selectedPlanId || prefillMutation.isPending}
                  className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/40 bg-emerald-500/15 px-4 py-2 text-sm text-emerald-100 hover:bg-emerald-500/20 disabled:opacity-60"
                >
                  {prefillMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  Import
                </button>
              </div>
              {prefillMutation.isSuccess && (
                <div className="mt-3 rounded-lg bg-emerald-500/10 p-3 text-xs text-emerald-200">
                  Populated {prefillMutation.data.fields_populated.length} field(s).{" "}
                  <NextLink
                    href="/tools/tax-plan-workspace"
                    className="underline hover:text-emerald-100"
                  >
                    Open workspace
                  </NextLink>
                </div>
              )}
              {prefillMutation.isError && (
                <p className="mt-3 text-xs text-rose-300">
                  Prefill failed. Please try again.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

type UploadEntry = {
  id: string;
  filename: string;
  status: "uploading" | "done" | "error";
};

let uploadCounter = 0;

export function DocumentManager() {
  const client = useStrataClient();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const uploadZoneRef = useRef<HTMLDivElement | null>(null);
  const [docTypeHint, setDocTypeHint] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploads, setUploads] = useState<UploadEntry[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("date");

  const documentsQuery = useQuery({
    queryKey: ["tax-documents"],
    queryFn: () => client.listTaxDocuments(100),
  });

  const startUpload = useCallback(
    (file: File) => {
      const entryId = `upload-${++uploadCounter}`;
      const hint = docTypeHint || undefined;

      setUploads((prev) => [
        ...prev,
        { id: entryId, filename: file.name, status: "uploading" },
      ]);

      client
        .uploadTaxDocument(file, file.name, hint)
        .then(() => {
          setUploads((prev) =>
            prev.map((e) => (e.id === entryId ? { ...e, status: "done" } : e))
          );
          queryClient.invalidateQueries({ queryKey: ["tax-documents"] });
        })
        .catch(() => {
          setUploads((prev) =>
            prev.map((e) => (e.id === entryId ? { ...e, status: "error" } : e))
          );
        });
    },
    [client, docTypeHint, queryClient]
  );

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      for (let i = 0; i < files.length; i++) {
        startUpload(files[i]);
      }
    },
    [startUpload]
  );

  const handleFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      handleFiles(e.target.files);
      e.target.value = "";
    },
    [handleFiles]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const scrollToUpload = useCallback(() => {
    uploadZoneRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  const documents = documentsQuery.data ?? [];

  // Batch upload summary
  const { uploadingCount, doneCount, totalUploads } = useMemo(() => ({
    uploadingCount: uploads.filter((e) => e.status === "uploading").length,
    doneCount: uploads.filter((e) => e.status === "done").length,
    totalUploads: uploads.length,
  }), [uploads]);

  // Filter and sort
  const filteredAndSorted = useMemo(() => {
    let filtered = documents;
    if (statusFilter !== "all") {
      filtered = filtered.filter((d) => d.status === statusFilter);
    }

    const sorted = [...filtered];
    switch (sortKey) {
      case "type":
        sorted.sort((a, b) => (a.document_type ?? "").localeCompare(b.document_type ?? ""));
        break;
      case "status":
        sorted.sort((a, b) => a.status.localeCompare(b.status));
        break;
      case "date":
      default:
        sorted.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
    }
    return sorted;
  }, [documents, statusFilter, sortKey]);

  return (
    <AppShell>
      <div
        className="min-h-screen"
        style={{
          background:
            "radial-gradient(1200px 600px at 10% -5%, rgba(14,165,233,0.18), transparent 55%), radial-gradient(1200px 700px at 90% 0%, rgba(16,185,129,0.15), transparent 60%), #0a0a0a",
        }}
      >
        {/* Hero */}
        <section className="px-4 pt-10 pb-8 sm:pt-14">
          <div className="mx-auto max-w-4xl">
            <div className="rounded-3xl border border-neutral-800 bg-neutral-950 p-6 sm:p-8 shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
              <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.22em] text-sky-300">
                <span className="inline-flex items-center gap-2 rounded-full border border-sky-300/30 bg-sky-300/10 px-3 py-1">
                  <FileSearch className="h-3.5 w-3.5" />
                  Document Pipeline
                </span>
                <span>AI Extraction</span>
              </div>
              <h1 className="mt-4 text-3xl font-semibold text-white sm:text-5xl">
                Tax Document Extractor
              </h1>
              <p className="mt-3 max-w-3xl text-neutral-300 sm:text-lg">
                Upload W-2s, 1099s, and K-1s. AI extracts every field, validates the data,
                and lets you send it directly to your Tax Plan Workspace.
              </p>

              {/* Upload zone */}
              <div className="mt-6" ref={uploadZoneRef} data-testid="upload-zone">
                <div className="mb-3 flex items-center gap-3">
                  <select
                    data-testid="doc-type-select"
                    value={docTypeHint}
                    onChange={(e) => setDocTypeHint(e.target.value)}
                    className="rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white focus:border-sky-300/60 focus:outline-none"
                  >
                    {DOC_TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <span className="text-xs text-neutral-500">Optional type hint</span>
                </div>

                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "relative cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition",
                    isDragOver
                      ? "border-sky-400 bg-sky-500/10"
                      : "border-neutral-700 hover:border-neutral-500 hover:bg-white/5"
                  )}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={ACCEPTED_TYPES}
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <Upload className="mx-auto h-8 w-8 text-neutral-500" />
                  <p className="mt-3 text-sm text-neutral-300">
                    Drag and drop or click to upload
                  </p>
                  <p className="mt-1 text-xs text-neutral-500">
                    PNG, JPEG, or PDF — up to 20 MB
                  </p>
                </div>

                {totalUploads > 0 && (
                  <div className="mt-3">
                    {totalUploads > 1 && (
                      <p className="mb-2 text-xs font-medium text-neutral-300">
                        {doneCount}/{totalUploads} complete
                        {uploadingCount > 0 && ` · ${uploadingCount} uploading`}
                      </p>
                    )}
                    <div className="space-y-2">
                      {uploads.map((entry) => (
                        <div key={entry.id} className="flex items-center gap-2 text-sm">
                          {entry.status === "uploading" && (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin text-sky-300" />
                              <span className="text-sky-300">Uploading {entry.filename}...</span>
                            </>
                          )}
                          {entry.status === "done" && (
                            <>
                              <Check className="h-4 w-4 text-emerald-300" />
                              <span className="text-emerald-300">{entry.filename} processed.</span>
                            </>
                          )}
                          {entry.status === "error" && (
                            <>
                              <X className="h-4 w-4 text-rose-300" />
                              <span className="text-rose-300">{entry.filename} failed.</span>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Documents list */}
        <section className="px-4 pb-20">
          <div className="mx-auto max-w-4xl">
            <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Your documents</h2>
                {documentsQuery.isLoading && (
                  <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
                )}
              </div>

              {/* Filter & sort controls */}
              {documents.length > 0 && (
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-1.5 text-xs text-white focus:border-sky-300/60 focus:outline-none"
                  >
                    {STATUS_FILTER_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                    <SortAsc className="h-3.5 w-3.5" />
                    <span>Sort:</span>
                    {(["date", "type", "status"] as SortKey[]).map((key) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setSortKey(key)}
                        className={cn(
                          "rounded-lg px-2 py-0.5 capitalize transition",
                          sortKey === key
                            ? "bg-neutral-700 text-white"
                            : "hover:bg-neutral-800 hover:text-neutral-200"
                        )}
                      >
                        {key}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty state */}
              {documents.length === 0 && !documentsQuery.isLoading && (
                <div className="mt-8 flex flex-col items-center py-12 text-center">
                  <div className="rounded-full bg-neutral-800 p-4">
                    <FileX2 className="h-8 w-8 text-neutral-500" />
                  </div>
                  <p className="mt-4 text-sm font-medium text-neutral-300">
                    No documents yet
                  </p>
                  <p className="mt-1 max-w-xs text-xs text-neutral-500">
                    Upload a W-2, 1099, or K-1 above and AI will extract every field automatically.
                  </p>
                  <button
                    type="button"
                    onClick={scrollToUpload}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl border border-sky-400/40 bg-sky-500/15 px-4 py-2 text-sm text-sky-100 hover:bg-sky-500/20"
                  >
                    <Upload className="h-4 w-4" />
                    Upload your first document
                  </button>
                </div>
              )}

              <div data-testid="document-list" className="mt-4 space-y-3">
                {filteredAndSorted.map((doc) => (
                  <DocumentRow
                    key={doc.id}
                    doc={doc}
                    onScrollToUpload={scrollToUpload}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
