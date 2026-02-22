"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import {
  ArrowRight,
  Check,
  Copy,
  Download,
  FileSearch,
  FolderOpen,
  Link,
  Loader2,
  MessageSquare,
  Save,
  Server,
  Sparkles,
  Trash2,
  Upload,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import NextLink from "next/link";
import { AppShell, MethodologySection } from "@/components/shared/AppShell";
import { ResultCard } from "@/components/shared/ResultCard";
import { SliderInput } from "@/components/shared/SliderInput";
import { useStrataClient } from "@/lib/strata/client";
import type { TaxPlanCollaboratorRole } from "@clearmoney/strata-sdk";
import { calculate } from "@/lib/calculators/tax-plan-workspace/calculations";
import { buildTaxPlanPacket } from "@/lib/calculators/tax-plan-workspace/packet";
import {
  createSnapshot,
  deleteSnapshot,
  isObject,
  loadSnapshots,
  persistSnapshots,
  upsertSnapshot,
} from "@/lib/calculators/tax-plan-workspace/storage";
import type {
  FilingStatus,
  SavedTaxPlanSnapshot,
  WorkspaceInputs,
  WorkspaceMode,
} from "@/lib/calculators/tax-plan-workspace/types";
import {
  formatCurrency,
  formatPercent,
  formatWithSign,
} from "@/lib/shared/formatters";
import { useMemoryPreFill } from "@/hooks/useMemoryPreFill";
import { LoadMyDataBanner } from "@/components/tools/LoadMyDataBanner";
import { cn } from "@/lib/utils";

const DEFAULT_INPUTS: WorkspaceInputs = {
  mode: "individual",
  clientName: "",
  filingStatus: "single",
  stateCode: "CA",
  wagesIncome: 185000,
  otherOrdinaryIncome: 12000,
  shortTermGains: 8000,
  longTermGains: 15000,
  currentWithholding: 42000,
  hsaRemainingRoom: 2500,
  pretax401kRemainingRoom: 7000,
  harvestableLosses: 6000,
  donationAmount: 5000,
  quarterlyPaymentsMade: 0,
  strategies: {
    hsa: true,
    pretax401k: true,
    lossHarvesting: true,
    donationBunching: false,
  },
};

const TAX_PLAN_TOOL_ID = "tax-plan-workspace";

type ServerSnapshotPayload = {
  version: 1;
  savedAt: string;
  label: string;
  inputs: WorkspaceInputs;
};

type VersionOption = {
  key: string;
  source: "local" | "server";
  label: string;
  savedAt: string;
  inputs: WorkspaceInputs;
  reportId?: string;
  revokedAt?: string | null;
};

const FILING_STATUS_OPTIONS: Array<{ value: FilingStatus; label: string }> = [
  { value: "single", label: "Single" },
  { value: "married", label: "Married Filing Jointly" },
  { value: "head_of_household", label: "Head of Household" },
];

const MODE_OPTIONS: Array<{ value: WorkspaceMode; label: string; detail: string }> = [
  {
    value: "individual",
    label: "Individual",
    detail: "Build your own tax action plan with plain-language guidance.",
  },
  {
    value: "advisor",
    label: "Advisor / AI Advisor",
    detail: "Generate client-ready strategy recommendations and handoff notes.",
  },
];

const STATE_OPTIONS = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DC", "DE", "FL",
  "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME",
  "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH",
  "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI",
  "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI",
  "WY",
];

const STRATEGY_LABELS: Array<{
  key: keyof WorkspaceInputs["strategies"];
  label: string;
  detail: string;
}> = [
  {
    key: "hsa",
    label: "Max HSA room",
    detail: "Add remaining HSA dollars for immediate tax reduction.",
  },
  {
    key: "pretax401k",
    label: "Increase pre-tax deferrals",
    detail: "Route more payroll to pre-tax 401(k)/403(b) accounts.",
  },
  {
    key: "lossHarvesting",
    label: "Harvest losses",
    detail: "Use realized losses to offset gains and ordinary income limits.",
  },
  {
    key: "donationBunching",
    label: "Bunch charitable donations",
    detail: "Group donation years for better itemization efficiency.",
  },
];

function downloadTextFile(filename: string, text: string): void {
  const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function formatSavedAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
}

function parsePayload(payload: unknown): ServerSnapshotPayload | null {
  if (!payload || typeof payload !== "object") return null;
  const row = payload as Record<string, unknown>;
  if (row.version !== 1) return null;
  if (typeof row.savedAt !== "string") return null;
  if (typeof row.label !== "string") return null;

  const inputs = hydrateWorkspaceInputs(row.inputs);
  if (!inputs) return null;

  return {
    version: 1,
    savedAt: row.savedAt,
    label: row.label,
    inputs,
  };
}

function createServerPayload(label: string, inputs: WorkspaceInputs): ServerSnapshotPayload {
  return {
    version: 1,
    savedAt: new Date().toISOString(),
    label,
    inputs: JSON.parse(JSON.stringify(inputs)) as WorkspaceInputs,
  };
}

function parseNumber(value: unknown, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const cleaned = value.replace(/[$,%\s,]/g, "");
    const parsed = Number(cleaned);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function parseBoolean(value: unknown, fallback: boolean): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["1", "true", "yes", "y", "on"].includes(normalized)) return true;
    if (["0", "false", "no", "n", "off"].includes(normalized)) return false;
  }
  return fallback;
}

function hydrateWorkspaceInputs(raw: unknown): WorkspaceInputs | null {
  if (!isObject(raw)) return null;
  const strategies = isObject(raw.strategies) ? raw.strategies : {};

  return {
    ...DEFAULT_INPUTS,
    mode: raw.mode === "advisor" ? "advisor" : "individual",
    clientName:
      typeof raw.clientName === "string" ? raw.clientName : DEFAULT_INPUTS.clientName,
    filingStatus:
      raw.filingStatus === "married" || raw.filingStatus === "head_of_household"
        ? raw.filingStatus
        : "single",
    stateCode:
      typeof raw.stateCode === "string" &&
      STATE_OPTIONS.includes(raw.stateCode.toUpperCase().trim().slice(0, 2))
        ? raw.stateCode.toUpperCase().trim().slice(0, 2)
        : DEFAULT_INPUTS.stateCode,
    wagesIncome: parseNumber(raw.wagesIncome, DEFAULT_INPUTS.wagesIncome),
    otherOrdinaryIncome: parseNumber(
      raw.otherOrdinaryIncome,
      DEFAULT_INPUTS.otherOrdinaryIncome
    ),
    shortTermGains: parseNumber(raw.shortTermGains, DEFAULT_INPUTS.shortTermGains),
    longTermGains: parseNumber(raw.longTermGains, DEFAULT_INPUTS.longTermGains),
    currentWithholding: parseNumber(
      raw.currentWithholding,
      DEFAULT_INPUTS.currentWithholding
    ),
    hsaRemainingRoom: parseNumber(raw.hsaRemainingRoom, DEFAULT_INPUTS.hsaRemainingRoom),
    pretax401kRemainingRoom: parseNumber(
      raw.pretax401kRemainingRoom,
      DEFAULT_INPUTS.pretax401kRemainingRoom
    ),
    harvestableLosses: parseNumber(
      raw.harvestableLosses,
      DEFAULT_INPUTS.harvestableLosses
    ),
    donationAmount: parseNumber(raw.donationAmount, DEFAULT_INPUTS.donationAmount),
    quarterlyPaymentsMade: parseNumber(
      raw.quarterlyPaymentsMade,
      DEFAULT_INPUTS.quarterlyPaymentsMade
    ),
    strategies: {
      hsa: parseBoolean(strategies.hsa, DEFAULT_INPUTS.strategies.hsa),
      pretax401k: parseBoolean(
        strategies.pretax401k,
        DEFAULT_INPUTS.strategies.pretax401k
      ),
      lossHarvesting: parseBoolean(
        strategies.lossHarvesting,
        DEFAULT_INPUTS.strategies.lossHarvesting
      ),
      donationBunching: parseBoolean(
        strategies.donationBunching,
        DEFAULT_INPUTS.strategies.donationBunching
      ),
    },
  };
}

function normalizeCsvHeader(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^\w]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (char === "," && !inQuotes) {
      cells.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }

  cells.push(current.trim());
  return cells;
}

function mapCsvToInputs(csvText: string): WorkspaceInputs | null {
  const lines = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  if (lines.length < 2) return null;

  const headers = parseCsvLine(lines[0]).map(normalizeCsvHeader);
  const values = parseCsvLine(lines[1]);
  const row: Record<string, string> = {};
  headers.forEach((header, index) => {
    if (header) row[header] = values[index] ?? "";
  });

  const next = hydrateWorkspaceInputs({
    mode: row.mode,
    clientName: row.client_name || row.client || row.household_name,
    filingStatus: row.filing_status,
    stateCode: row.state_code || row.state,
    wagesIncome: row.wages_income || row.salary_income || row.w2_income,
    otherOrdinaryIncome: row.other_ordinary_income || row.other_income,
    shortTermGains: row.short_term_gains || row.st_gains,
    longTermGains: row.long_term_gains || row.lt_gains,
    currentWithholding: row.current_withholding || row.withholding,
    hsaRemainingRoom: row.hsa_remaining_room || row.hsa_room,
    pretax401kRemainingRoom:
      row.pretax_401k_remaining_room || row.pretax_retirement_room,
    harvestableLosses: row.harvestable_losses || row.tax_losses,
    donationAmount: row.donation_amount || row.donations,
    quarterlyPaymentsMade:
      row.quarterly_payments_made || row.estimated_payments_made,
    strategies: {
      hsa: row.strategy_hsa ?? row.hsa_enabled,
      pretax401k: row.strategy_pretax_401k ?? row.pretax_401k_enabled,
      lossHarvesting: row.strategy_loss_harvesting ?? row.loss_harvesting_enabled,
      donationBunching: row.strategy_donation_bunching ?? row.donation_bunching_enabled,
    },
  });

  return next;
}

import type { TaxDocumentListResponse } from "@clearmoney/strata-sdk";

function DocImportList({
  documents,
  isSuccess,
  selectedDocIds,
  setSelectedDocIds,
  activePlanId,
  isPending,
  onImport,
}: {
  documents: TaxDocumentListResponse[];
  isSuccess: boolean;
  selectedDocIds: Set<string>;
  setSelectedDocIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  activePlanId: string;
  isPending: boolean;
  onImport: () => void;
}) {
  const importableDocs = documents.filter(
    (d) => d.status === "completed" || d.status === "needs_review"
  );

  if (isSuccess && importableDocs.length === 0) {
    return (
      <div className="mt-3 text-xs text-neutral-400">
        No completed documents found.{" "}
        <NextLink
          href="/tools/tax-documents"
          className="text-sky-300 underline hover:text-sky-200"
        >
          Upload documents
        </NextLink>
      </div>
    );
  }

  return (
    <>
      <div className="mt-3 max-h-48 space-y-2 overflow-y-auto pr-1">
        {importableDocs.map((doc) => (
          <label
            key={doc.id}
            className={cn(
              "flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition",
              selectedDocIds.has(doc.id)
                ? "border-sky-400/40 bg-sky-500/15"
                : "border-neutral-800 bg-neutral-950"
            )}
          >
            <input
              type="checkbox"
              checked={selectedDocIds.has(doc.id)}
              onChange={(e) => {
                setSelectedDocIds((prev) => {
                  const next = new Set(prev);
                  if (e.target.checked) {
                    next.add(doc.id);
                  } else {
                    next.delete(doc.id);
                  }
                  return next;
                });
              }}
              className="h-4 w-4 rounded border-neutral-700 bg-neutral-800"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-white">
                {doc.original_filename}
              </p>
              <p className="text-[11px] text-neutral-400">
                {doc.document_type?.toUpperCase() ?? "Unknown"} · {doc.tax_year ?? "—"}
                {doc.confidence_score != null &&
                  ` · ${Math.round(doc.confidence_score * 100)}%`}
              </p>
            </div>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-medium",
                doc.status === "completed"
                  ? "bg-emerald-500/20 text-emerald-200"
                  : "bg-amber-500/20 text-amber-200"
              )}
            >
              {doc.status === "completed" ? "Completed" : "Needs Review"}
            </span>
          </label>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={onImport}
          disabled={!activePlanId || selectedDocIds.size === 0 || isPending}
          className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/40 bg-emerald-500/15 px-4 py-2 text-sm text-emerald-100 hover:bg-emerald-500/20 disabled:opacity-60"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowRight className="h-4 w-4" />
          )}
          Import {selectedDocIds.size || ""} document{selectedDocIds.size !== 1 ? "s" : ""}
        </button>
        {!activePlanId && (
          <span className="text-xs text-amber-300">
            Create or select a plan first
          </span>
        )}
      </div>
    </>
  );
}

export function Calculator() {
  const client = useStrataClient();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const csvFileInputRef = useRef<HTMLInputElement | null>(null);
  const comparedPairRef = useRef<string>("");

  const [inputs, setInputs] = useState<WorkspaceInputs>(DEFAULT_INPUTS);
  const initialSnapshotsRef = useRef<SavedTaxPlanSnapshot[] | null>(null);
  if (initialSnapshotsRef.current === null) {
    initialSnapshotsRef.current = loadSnapshots();
  }
  const [localSnapshots, setLocalSnapshots] = useState<SavedTaxPlanSnapshot[]>(
    () => initialSnapshotsRef.current!
  );
  const [snapshotLabel, setSnapshotLabel] = useState("Q1 Draft Plan");
  const [compareA, setCompareA] = useState(() => {
    const first = initialSnapshotsRef.current![0];
    return first ? `local:${first.id}` : "";
  });
  const [compareB, setCompareB] = useState(() => {
    const second = initialSnapshotsRef.current![1];
    return second ? `local:${second.id}` : "";
  });
  const [briefCopied, setBriefCopied] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [shareLinkCopied, setShareLinkCopied] = useState(false);
  const [activePlanId, setActivePlanId] = useState<string>("");
  const [planName, setPlanName] = useState("Primary Tax Plan");
  const [householdName, setHouseholdName] = useState("");
  const [commentBody, setCommentBody] = useState("");
  const [commentVersionId, setCommentVersionId] = useState<string>("");
  const [collaboratorEmail, setCollaboratorEmail] = useState("");
  const [collaboratorRole, setCollaboratorRole] =
    useState<TaxPlanCollaboratorRole>("viewer");
  const [csvImportStatus, setCsvImportStatus] = useState<string | null>(null);
  const [showDocImport, setShowDocImport] = useState(false);
  const [docImportStatus, setDocImportStatus] = useState<string | null>(null);
  const [selectedDocIds, setSelectedDocIds] = useState<Set<string>>(new Set());

  const {
    preFilledFields,
    isLoaded: memoryLoaded,
    hasDefaults: memoryHasDefaults,
    applyTo: applyMemoryDefaults,
  } = useMemoryPreFill<WorkspaceInputs>({
    wagesIncome: "annual_income",
    filingStatus: "filing_status",
    stateCode: "state",
  });

  const handleLoadData = useCallback(
    () => applyMemoryDefaults(setInputs),
    [applyMemoryDefaults]
  );

  const sharedReportId = searchParams.get("reportId");
  const sharedToken = searchParams.get("token");

  const plansQuery = useQuery({
    queryKey: ["tax-plan-workspace", "plans"],
    queryFn: () => client.listTaxPlans({ limit: 50 }),
  });

  const versionsQuery = useQuery({
    queryKey: ["tax-plan-workspace", "versions", activePlanId],
    queryFn: () => client.listTaxPlanVersions(activePlanId, { limit: 200 }),
    enabled: Boolean(activePlanId),
  });

  const commentsQuery = useQuery({
    queryKey: ["tax-plan-workspace", "comments", activePlanId],
    queryFn: () => client.listTaxPlanComments(activePlanId, { limit: 200 }),
    enabled: Boolean(activePlanId),
  });

  const collaboratorsQuery = useQuery({
    queryKey: ["tax-plan-workspace", "collaborators", activePlanId],
    queryFn: () => client.listTaxPlanCollaborators(activePlanId),
    enabled: Boolean(activePlanId),
  });

  const eventsQuery = useQuery({
    queryKey: ["tax-plan-workspace", "events", activePlanId],
    queryFn: () => client.listTaxPlanEvents(activePlanId, { limit: 300 }),
    enabled: Boolean(activePlanId),
  });

  const serverHistoryQuery = useQuery({
    queryKey: ["tax-plan-workspace", "server-history"],
    queryFn: () =>
      client.listShareReports({
        toolId: TAX_PLAN_TOOL_ID,
        limit: 100,
        includePayload: true,
      }),
  });

  const sharedImportQuery = useQuery({
    queryKey: ["tax-plan-workspace", "shared-import", sharedReportId, sharedToken],
    queryFn: () => client.getShareReport(sharedReportId!, sharedToken!),
    enabled: Boolean(sharedReportId && sharedToken),
  });

  const saveServerSnapshot = useMutation({
    mutationFn: (payload: ServerSnapshotPayload) =>
      client.createShareReport({
        tool_id: TAX_PLAN_TOOL_ID,
        mode: "full",
        payload: payload as unknown as Record<string, unknown>,
        expires_in_days: null,
        max_views: null,
      }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tax-plan-workspace", "server-history"] });
    },
  });

  const createPlanMutation = useMutation({
    mutationFn: (data: { name: string; household_name?: string | null }) =>
      client.createTaxPlan(data),
    onSuccess: (created) => {
      setActivePlanId(created.id);
      queryClient.invalidateQueries({ queryKey: ["tax-plan-workspace", "plans"] });
    },
  });

  const saveServerVersion = useMutation({
    mutationFn: (payload: {
      planId: string;
      label: string;
      inputs: WorkspaceInputs;
      results: ReturnType<typeof calculate>;
      source?: string;
    }) =>
      client.createTaxPlanVersion(payload.planId, {
        label: payload.label,
        inputs: payload.inputs as unknown as Record<string, unknown>,
        results: payload.results as unknown as Record<string, unknown>,
        source: payload.source ?? "workspace",
      }),
    onSuccess: (_version, payload) => {
      queryClient.invalidateQueries({
        queryKey: ["tax-plan-workspace", "versions", payload.planId],
      });
      queryClient.invalidateQueries({ queryKey: ["tax-plan-workspace", "plans"] });
    },
  });

  const approveVersionMutation = useMutation({
    mutationFn: (payload: { planId: string; versionId: string }) =>
      client.approveTaxPlanVersion(payload.planId, payload.versionId),
    onSuccess: (_version, payload) => {
      queryClient.invalidateQueries({
        queryKey: ["tax-plan-workspace", "versions", payload.planId],
      });
      queryClient.invalidateQueries({ queryKey: ["tax-plan-workspace", "plans"] });
      queryClient.invalidateQueries({ queryKey: ["tax-plan-workspace", "events", payload.planId] });
    },
  });

  const createCommentMutation = useMutation({
    mutationFn: (payload: { planId: string; versionId?: string | null; body: string }) =>
      client.createTaxPlanComment(payload.planId, {
        version_id: payload.versionId ?? null,
        body: payload.body,
      }),
    onSuccess: (_comment, payload) => {
      queryClient.invalidateQueries({
        queryKey: ["tax-plan-workspace", "comments", payload.planId],
      });
      queryClient.invalidateQueries({ queryKey: ["tax-plan-workspace", "events", payload.planId] });
    },
  });

  const addCollaboratorMutation = useMutation({
    mutationFn: (payload: {
      planId: string;
      email: string;
      role: TaxPlanCollaboratorRole;
    }) => client.addTaxPlanCollaborator(payload.planId, { email: payload.email, role: payload.role }),
    onSuccess: (_collaborator, payload) => {
      queryClient.invalidateQueries({
        queryKey: ["tax-plan-workspace", "collaborators", payload.planId],
      });
      queryClient.invalidateQueries({ queryKey: ["tax-plan-workspace", "events", payload.planId] });
    },
  });

  const revokeCollaboratorMutation = useMutation({
    mutationFn: (payload: { planId: string; collaboratorId: string }) =>
      client.revokeTaxPlanCollaborator(payload.planId, payload.collaboratorId),
    onSuccess: (_response, payload) => {
      queryClient.invalidateQueries({
        queryKey: ["tax-plan-workspace", "collaborators", payload.planId],
      });
      queryClient.invalidateQueries({ queryKey: ["tax-plan-workspace", "events", payload.planId] });
    },
  });

  const createShareLink = useMutation({
    mutationFn: (payload: ServerSnapshotPayload) =>
      client.createShareReport({
        tool_id: TAX_PLAN_TOOL_ID,
        mode: "full",
        payload: payload as unknown as Record<string, unknown>,
        expires_in_days: 30,
        max_views: null,
      }),
    onSuccess: (response) => {
      if (typeof window === "undefined") return;
      const url = new URL(window.location.href);
      url.search = "";
      url.searchParams.set("reportId", response.id);
      url.searchParams.set("token", response.token);
      setShareLink(url.toString());
      queryClient.invalidateQueries({ queryKey: ["tax-plan-workspace", "server-history"] });
    },
  });

  const revokeServerSnapshot = useMutation({
    mutationFn: (reportId: string) => client.revokeShareReport(reportId),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tax-plan-workspace", "server-history"] });
    },
  });

  const taxDocumentsQuery = useQuery({
    queryKey: ["tax-documents"],
    queryFn: () => client.listTaxDocuments(100),
    enabled: showDocImport,
  });

  const prefillFromDocsMutation = useMutation({
    mutationFn: (payload: { planId: string; docIds: string[]; label: string }) =>
      client.prefillTaxPlan({
        document_ids: payload.docIds,
        plan_id: payload.planId,
        label: payload.label,
      }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tax-plan-workspace"] });
      setDocImportStatus(
        `Imported ${data.fields_populated.length} field(s). New version available in history.`
      );
      setSelectedDocIds(new Set());
      if (activePlanId) {
        queuePlanEvent(activePlanId, "doc_import", {
          document_count: variables.docIds.length,
          fields_populated: data.fields_populated,
        });
      }
    },
    onError: () => {
      setDocImportStatus("Import failed. Please try again.");
    },
  });

  const serverSnapshots = useMemo<VersionOption[]>(() => {
    const rows = serverHistoryQuery.data ?? [];
    const versions: VersionOption[] = [];
    for (const row of rows) {
      const payload = parsePayload(row.payload ?? null);
      if (!payload) continue;
      versions.push({
        key: `server:${row.id}`,
        source: "server",
        label: payload.label,
        savedAt: payload.savedAt,
        inputs: payload.inputs,
        reportId: row.id,
        revokedAt: row.revoked_at,
      });
    }
    return versions.sort((a, b) => b.savedAt.localeCompare(a.savedAt));
  }, [serverHistoryQuery.data]);

  const localVersionOptions = useMemo<VersionOption[]>(() => {
    return localSnapshots.map((snapshot) => ({
      key: `local:${snapshot.id}`,
      source: "local",
      label: snapshot.label,
      savedAt: snapshot.savedAt,
      inputs: snapshot.inputs,
    }));
  }, [localSnapshots]);

  const serverPlanVersions = useMemo<VersionOption[]>(() => {
    const rows = versionsQuery.data ?? [];
    const options: VersionOption[] = [];
    for (const row of rows) {
      const hydrated = hydrateWorkspaceInputs(row.inputs);
      if (!hydrated) continue;
      options.push({
        key: `server-version:${row.id}`,
        source: "server",
        label: row.label,
        savedAt: row.created_at,
        inputs: hydrated,
        reportId: row.id,
        revokedAt: row.is_approved ? "approved" : null,
      });
    }
    return options.sort((a, b) => b.savedAt.localeCompare(a.savedAt));
  }, [versionsQuery.data]);

  const allVersionOptions = useMemo<VersionOption[]>(() => {
    return [...localVersionOptions, ...serverPlanVersions, ...serverSnapshots]
      .sort((a, b) => b.savedAt.localeCompare(a.savedAt))
      .slice(0, 120);
  }, [localVersionOptions, serverPlanVersions, serverSnapshots]);

  const compareOptionA = useMemo(
    () => allVersionOptions.find((option) => option.key === compareA) ?? null,
    [allVersionOptions, compareA]
  );
  const compareOptionB = useMemo(
    () => allVersionOptions.find((option) => option.key === compareB) ?? null,
    [allVersionOptions, compareB]
  );

  const compareResultsA = useMemo(
    () => (compareOptionA ? calculate(compareOptionA.inputs) : null),
    [compareOptionA]
  );
  const compareResultsB = useMemo(
    () => (compareOptionB ? calculate(compareOptionB.inputs) : null),
    [compareOptionB]
  );

  const results = useMemo(() => calculate(inputs), [inputs]);

  const sharedPayload = useMemo(() => {
    const payload = sharedImportQuery.data?.payload;
    return parsePayload(payload ?? null);
  }, [sharedImportQuery.data?.payload]);

  const activePlan = useMemo(
    () => (plansQuery.data ?? []).find((plan) => plan.id === activePlanId) ?? null,
    [plansQuery.data, activePlanId]
  );

  useEffect(() => {
    if (activePlanId || !(plansQuery.data ?? []).length) return;
    const first = plansQuery.data?.[0];
    if (first) {
      setActivePlanId(first.id);
      setPlanName(first.name);
      setHouseholdName(first.household_name ?? "");
    }
  }, [plansQuery.data, activePlanId]);

  useEffect(() => {
    if (!activePlan) return;
    setPlanName(activePlan.name);
    setHouseholdName(activePlan.household_name ?? "");
  }, [activePlan]);

  const queuePlanEvent = useCallback(
    (
      planId: string,
      eventType: string,
      eventMetadata: Record<string, unknown> = {},
      versionId?: string
    ) => {
      void client
        .createTaxPlanEvent(planId, {
          version_id: versionId ?? null,
          event_type: eventType,
          event_metadata: eventMetadata,
        })
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ["tax-plan-workspace", "events", planId] });
        })
        .catch(() => undefined);
    },
    [client, queryClient]
  );

  useEffect(() => {
    if (!activePlanId || !compareA || !compareB) return;
    const pair = [compareA, compareB].sort().join("|");
    if (pair === comparedPairRef.current) return;
    comparedPairRef.current = pair;
    queuePlanEvent(activePlanId, "comparison_used", {
      compare_a: compareA,
      compare_b: compareB,
    });
  }, [activePlanId, compareA, compareB, queuePlanEvent]);

  const estimatedRate =
    inputs.wagesIncome + inputs.otherOrdinaryIncome + inputs.shortTermGains > 0
      ? results.baselineTax /
        Math.max(
          1,
          inputs.wagesIncome +
            inputs.otherOrdinaryIncome +
            inputs.shortTermGains +
            inputs.longTermGains
        )
      : 0;

  function updateInput<K extends keyof WorkspaceInputs>(key: K, value: WorkspaceInputs[K]) {
    setInputs((prev) => ({ ...prev, [key]: value }));
  }

  function updateStrategy(key: keyof WorkspaceInputs["strategies"], value: boolean) {
    setInputs((prev) => ({
      ...prev,
      strategies: {
        ...prev.strategies,
        [key]: value,
      },
    }));
  }

  const briefTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const shareLinkTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    return () => {
      clearTimeout(briefTimerRef.current);
      clearTimeout(shareLinkTimerRef.current);
    };
  }, []);

  async function copyBrief() {
    try {
      await navigator.clipboard.writeText(results.advisorBrief);
      setBriefCopied(true);
      clearTimeout(briefTimerRef.current);
      briefTimerRef.current = setTimeout(() => setBriefCopied(false), 1500);
    } catch {
      setBriefCopied(false);
    }
  }

  async function copyShareLink() {
    if (!shareLink) return;
    try {
      await navigator.clipboard.writeText(shareLink);
      setShareLinkCopied(true);
      clearTimeout(shareLinkTimerRef.current);
      shareLinkTimerRef.current = setTimeout(() => setShareLinkCopied(false), 1500);
    } catch {
      setShareLinkCopied(false);
    }
  }

  async function handleSaveSnapshot() {
    const label = snapshotLabel.trim() || "Tax plan snapshot";
    const snapshot = createSnapshot({ label, inputs });
    const latestResults = calculate(inputs);

    setLocalSnapshots((prev) => {
      const next = upsertSnapshot(prev, snapshot);
      persistSnapshots(next);
      return next;
    });

    const payload = createServerPayload(label, inputs);
    saveServerSnapshot.mutate(payload);

    setCompareA((prev) => prev || `local:${snapshot.id}`);
    setCompareB((prev) => prev || `local:${snapshot.id}`);

    try {
      let planId = activePlanId;
      if (!planId) {
        const created = await createPlanMutation.mutateAsync({
          name: planName.trim() || "Primary Tax Plan",
          household_name: householdName.trim() || inputs.clientName.trim() || null,
        });
        planId = created.id;
        setActivePlanId(created.id);
        queuePlanEvent(created.id, "plan_created", {
          name: created.name,
          household_name: created.household_name,
        });
      }

      const version = await saveServerVersion.mutateAsync({
        planId,
        label,
        inputs,
        results: latestResults,
      });
      setCompareA((prev) => prev || `server-version:${version.id}`);
      setCommentVersionId(version.id);
      queuePlanEvent(planId, "version_saved", { label }, version.id);
    } catch {
      // keep local-first save behavior even if backend persistence fails
    }
  }

  function handleCreateShareLink() {
    const label = snapshotLabel.trim() || "Shared tax plan";
    const payload = createServerPayload(label, inputs);
    createShareLink.mutate(payload);
    if (activePlanId) {
      queuePlanEvent(activePlanId, "share_link_created", { label });
    }
  }

  function handleLoadOption(option: VersionOption) {
    setInputs(option.inputs);
    setSnapshotLabel(option.label);
  }

  function handleDeleteLocalSnapshot(localKey: string) {
    setLocalSnapshots((prev) => {
      const next = deleteSnapshot(prev, localKey);
      persistSnapshots(next);
      return next;
    });

    if (compareA === `local:${localKey}`) setCompareA("");
    if (compareB === `local:${localKey}`) setCompareB("");
  }

  function handleRevokeServerSnapshot(reportId: string) {
    revokeServerSnapshot.mutate(reportId);
    if (compareA === `server:${reportId}`) setCompareA("");
    if (compareB === `server:${reportId}`) setCompareB("");
  }

  function handleDownloadPacket() {
    const { filename, markdown } = buildTaxPlanPacket({
      inputs,
      snapshotLabel: snapshotLabel.trim() || undefined,
    });
    downloadTextFile(filename, markdown);
    if (activePlanId) {
      queuePlanEvent(activePlanId, "packet_exported", { scope: "active_workspace" });
    }
  }

  function handleDownloadOptionPacket(option: VersionOption) {
    const { filename, markdown } = buildTaxPlanPacket({
      inputs: option.inputs,
      snapshotLabel: option.label,
      now: new Date(option.savedAt),
    });
    downloadTextFile(filename, markdown);
    if (activePlanId) {
      queuePlanEvent(activePlanId, "packet_exported", {
        scope: "saved_version",
        version_key: option.key,
      });
    }
  }

  function handleLoadSharedImport() {
    if (!sharedPayload) return;
    setInputs(sharedPayload.inputs);
    setSnapshotLabel(sharedPayload.label);
    if (activePlanId) {
      queuePlanEvent(activePlanId, "shared_import_loaded", { label: sharedPayload.label });
    }
  }

  async function handleCreatePlan() {
    const name = planName.trim() || "Primary Tax Plan";
    const household = householdName.trim() || inputs.clientName.trim() || null;
    const created = await createPlanMutation.mutateAsync({
      name,
      household_name: household,
    });
    setActivePlanId(created.id);
    queuePlanEvent(created.id, "plan_created", { name: created.name, household_name: household });
  }

  function handleApproveVersion(versionId: string) {
    if (!activePlanId) return;
    approveVersionMutation.mutate(
      { planId: activePlanId, versionId },
      {
        onSuccess: () => {
          queuePlanEvent(activePlanId, "version_approved", { version_id: versionId }, versionId);
        },
      }
    );
  }

  function handleCreateComment() {
    if (!activePlanId) return;
    const body = commentBody.trim();
    if (!body) return;
    createCommentMutation.mutate(
      { planId: activePlanId, versionId: commentVersionId || null, body },
      {
        onSuccess: () => {
          setCommentBody("");
          queuePlanEvent(
            activePlanId,
            "comment_created",
            { version_id: commentVersionId || null },
            commentVersionId || undefined
          );
        },
      }
    );
  }

  function handleAddCollaborator() {
    if (!activePlanId) return;
    const email = collaboratorEmail.trim().toLowerCase();
    if (!email) return;
    addCollaboratorMutation.mutate(
      { planId: activePlanId, email, role: collaboratorRole },
      {
        onSuccess: () => {
          setCollaboratorEmail("");
          queuePlanEvent(activePlanId, "collaborator_added", { email, role: collaboratorRole });
        },
      }
    );
  }

  function handleRevokeCollaborator(collaboratorId: string, email: string) {
    if (!activePlanId) return;
    revokeCollaboratorMutation.mutate(
      { planId: activePlanId, collaboratorId },
      {
        onSuccess: () => {
          queuePlanEvent(activePlanId, "collaborator_revoked", { email });
        },
      }
    );
  }

  async function handleCsvFileSelected(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 1_000_000) {
      setCsvImportStatus("File too large. CSV must be under 1 MB.");
      event.target.value = "";
      return;
    }
    try {
      const text = await file.text();
      const mapped = mapCsvToInputs(text);
      if (!mapped) {
        setCsvImportStatus("Could not parse CSV. Expected header row plus one data row.");
        return;
      }
      setInputs(mapped);
      setSnapshotLabel("Imported CSV Plan");
      setCsvImportStatus(`Imported data from ${file.name}`);
      if (activePlanId) {
        queuePlanEvent(activePlanId, "csv_imported", { filename: file.name });
      }
    } catch {
      setCsvImportStatus("CSV import failed. Please try another file.");
    } finally {
      event.target.value = "";
    }
  }

  const localStatusMessage = saveServerSnapshot.isPending
    ? "Saving snapshot to server history..."
    : saveServerSnapshot.isError
      ? "Server save failed; snapshot kept locally."
      : activePlan
        ? `Active plan: ${activePlan.name}`
        : "Local + server-backed version history enabled.";

  return (
    <AppShell>
      <div
        className="min-h-screen"
        style={{
          background:
            "radial-gradient(1200px 600px at 10% -5%, rgba(16,185,129,0.18), transparent 55%), radial-gradient(1200px 700px at 90% 0%, rgba(14,165,233,0.2), transparent 60%), #0a0a0a",
        }}
      >
        <section className="px-4 pt-10 pb-8 sm:pt-14">
          <div className="mx-auto max-w-6xl">
            <div className="rounded-3xl border border-neutral-800 bg-neutral-950 p-6 sm:p-8 shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
              <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.22em] text-emerald-300">
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/30 bg-emerald-300/10 px-3 py-1">
                  <Sparkles className="h-3.5 w-3.5" />
                  New Workspace
                </span>
                <span>Individuals + Advisors</span>
              </div>
              <h1 className="mt-4 text-3xl font-semibold text-white sm:text-5xl">
                Tax Plan Workspace
              </h1>
              <p className="mt-3 max-w-3xl text-neutral-300 sm:text-lg">
                Build one clear tax plan with transparent math, scenario-based savings,
                and advisor-ready packets you can save, compare, and share.
              </p>

              <LoadMyDataBanner
                isLoaded={memoryLoaded}
                hasData={memoryHasDefaults}
                isApplied={preFilledFields.size > 0}
                onApply={handleLoadData}
              />

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {MODE_OPTIONS.map((option) => {
                  const isActive = inputs.mode === option.value;
                  const Icon = option.value === "advisor" ? UsersRound : UserRound;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => updateInput("mode", option.value)}
                      className={cn(
                        "rounded-2xl border p-4 text-left transition",
                        isActive
                          ? "border-sky-400/60 bg-sky-500/15"
                          : "border-neutral-800 bg-neutral-950 hover:border-neutral-600"
                      )}
                    >
                      <div className="flex items-center gap-2 text-white">
                        <Icon className="h-4 w-4" />
                        <p className="font-medium">{option.label}</p>
                      </div>
                      <p className="mt-2 text-sm text-neutral-300">{option.detail}</p>
                    </button>
                  );
                })}
              </div>

              <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-sky-300/30 bg-sky-500/10 px-3 py-1 text-xs text-sky-100">
                <Server className="h-3.5 w-3.5" />
                {localStatusMessage}
              </p>
            </div>
          </div>
        </section>

        <section className="px-4 pb-16">
          <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-6">
              <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6 backdrop-blur-sm">
                <h2 className="text-xl font-semibold text-white">1. Profile & tax context</h2>
                <p className="mt-1 text-sm text-neutral-400">
                  Enter baseline data once. The workspace handles scenario math and keeps version history.
                </p>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm text-neutral-300">Client / household name (optional)</label>
                    <input
                      value={inputs.clientName}
                      onChange={(event) => updateInput("clientName", event.target.value)}
                      placeholder="e.g., Morgan Household"
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2.5 text-white placeholder:text-neutral-500 focus:border-sky-300/60 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-neutral-300">Filing status</label>
                    <select
                      value={inputs.filingStatus}
                      onChange={(event) => updateInput("filingStatus", event.target.value as FilingStatus)}
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2.5 text-white focus:border-sky-300/60 focus:outline-none"
                    >
                      {FILING_STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-neutral-300">Primary state</label>
                    <select
                      value={inputs.stateCode}
                      onChange={(event) => updateInput("stateCode", event.target.value)}
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2.5 text-white focus:border-sky-300/60 focus:outline-none"
                    >
                      {STATE_OPTIONS.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-5 space-y-5">
                  <SliderInput
                    label="W-2 / salary income"
                    value={inputs.wagesIncome}
                    onChange={(value) => updateInput("wagesIncome", value)}
                    min={0}
                    max={700000}
                    step={1000}
                    format="currency"
                  />
                  <SliderInput
                    label="Other ordinary income"
                    value={inputs.otherOrdinaryIncome}
                    onChange={(value) => updateInput("otherOrdinaryIncome", value)}
                    min={0}
                    max={300000}
                    step={500}
                    format="currency"
                  />
                  <SliderInput
                    label="Short-term gains"
                    value={inputs.shortTermGains}
                    onChange={(value) => updateInput("shortTermGains", value)}
                    min={0}
                    max={300000}
                    step={500}
                    format="currency"
                  />
                  <SliderInput
                    label="Long-term gains"
                    value={inputs.longTermGains}
                    onChange={(value) => updateInput("longTermGains", value)}
                    min={0}
                    max={500000}
                    step={1000}
                    format="currency"
                  />
                </div>
              </div>

              <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6 backdrop-blur-sm">
                <h2 className="text-xl font-semibold text-white">2. Strategy opportunities</h2>
                <p className="mt-1 text-sm text-neutral-400">
                  Toggle strategies and set realistic capacity for each one.
                </p>

                <div className="mt-5 space-y-4">
                  {STRATEGY_LABELS.map((strategy) => (
                    <label
                      key={strategy.key}
                      className={cn(
                        "flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition",
                        inputs.strategies[strategy.key]
                          ? "border-emerald-400/40 bg-emerald-500/10"
                          : "border-neutral-800 bg-neutral-950"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={inputs.strategies[strategy.key]}
                        onChange={(event) => updateStrategy(strategy.key, event.target.checked)}
                        className="mt-1 h-4 w-4 rounded border-neutral-700 bg-neutral-800"
                      />
                      <div>
                        <p className="text-sm font-medium text-white">{strategy.label}</p>
                        <p className="text-xs text-neutral-400">{strategy.detail}</p>
                      </div>
                    </label>
                  ))}
                </div>

                <div className="mt-5 space-y-5">
                  <SliderInput
                    label="Remaining HSA room"
                    value={inputs.hsaRemainingRoom}
                    onChange={(value) => updateInput("hsaRemainingRoom", value)}
                    min={0}
                    max={10000}
                    step={100}
                    format="currency"
                  />
                  <SliderInput
                    label="Remaining pre-tax retirement room"
                    value={inputs.pretax401kRemainingRoom}
                    onChange={(value) => updateInput("pretax401kRemainingRoom", value)}
                    min={0}
                    max={35000}
                    step={500}
                    format="currency"
                  />
                  <SliderInput
                    label="Harvestable tax losses"
                    value={inputs.harvestableLosses}
                    onChange={(value) => updateInput("harvestableLosses", value)}
                    min={0}
                    max={150000}
                    step={500}
                    format="currency"
                  />
                  <SliderInput
                    label="Planned donations"
                    value={inputs.donationAmount}
                    onChange={(value) => updateInput("donationAmount", value)}
                    min={0}
                    max={100000}
                    step={500}
                    format="currency"
                  />
                  <SliderInput
                    label="Quarterly estimated payments made"
                    value={inputs.quarterlyPaymentsMade}
                    onChange={(value) => updateInput("quarterlyPaymentsMade", value)}
                    min={0}
                    max={100000}
                    step={500}
                    format="currency"
                  />
                  <SliderInput
                    label="Current withholding"
                    value={inputs.currentWithholding}
                    onChange={(value) => updateInput("currentWithholding", value)}
                    min={0}
                    max={150000}
                    step={500}
                    format="currency"
                  />
                </div>
              </div>

              <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6 backdrop-blur-sm">
                <h2 className="text-xl font-semibold text-white">3. Version history, compare, and sharing</h2>
                <p className="mt-1 text-sm text-neutral-400">
                  Save local snapshots plus server-backed versions. Compare any two and share with a secure link.
                </p>

                <div className="mt-4 grid gap-3 rounded-2xl border border-neutral-800 bg-neutral-950 p-4 sm:grid-cols-[1fr_1fr_auto]">
                  <div>
                    <label className="mb-2 block text-xs uppercase tracking-[0.1em] text-neutral-400">Workspace plan</label>
                    <select
                      value={activePlanId}
                      onChange={(event) => setActivePlanId(event.target.value)}
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2.5 text-sm text-white focus:border-sky-300/60 focus:outline-none"
                    >
                      <option value="">No plan selected</option>
                      {(plansQuery.data ?? []).map((plan) => (
                        <option key={plan.id} value={plan.id}>
                          {plan.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 sm:col-span-2">
                    <input
                      value={planName}
                      onChange={(event) => setPlanName(event.target.value)}
                      placeholder="Plan name"
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2.5 text-sm text-white placeholder:text-neutral-500 focus:border-sky-300/60 focus:outline-none"
                    />
                    <input
                      value={householdName}
                      onChange={(event) => setHouseholdName(event.target.value)}
                      placeholder="Household name"
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2.5 text-sm text-white placeholder:text-neutral-500 focus:border-sky-300/60 focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleCreatePlan}
                    disabled={createPlanMutation.isPending}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-sky-400/40 bg-sky-500/15 px-4 py-2.5 text-sm text-sky-100 hover:bg-sky-500/20 disabled:opacity-60"
                  >
                    <Server className="h-4 w-4" />
                    {createPlanMutation.isPending ? "Creating..." : "Create plan"}
                  </button>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <input
                    ref={csvFileInputRef}
                    type="file"
                    accept=".csv,text/csv"
                    className="hidden"
                    onChange={handleCsvFileSelected}
                  />
                  <button
                    type="button"
                    onClick={() => csvFileInputRef.current?.click()}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-700 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10"
                  >
                    <Upload className="h-4 w-4" />
                    Import CSV profile
                  </button>
                  {csvImportStatus && (
                    <p className="inline-flex items-center rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs text-neutral-300">
                      {csvImportStatus}
                    </p>
                  )}
                  <button
                    type="button"
                    data-testid="import-from-docs-btn"
                    onClick={() => setShowDocImport((prev) => !prev)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-700 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10"
                  >
                    <FileSearch className="h-4 w-4" />
                    Import from Documents
                  </button>
                </div>

                {showDocImport && (
                  <div data-testid="doc-import-panel" className="mt-3 rounded-2xl border border-sky-400/30 bg-sky-500/10 p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-sky-100">Import from Tax Documents</p>
                      <button
                        type="button"
                        onClick={() => {
                          setShowDocImport(false);
                          setDocImportStatus(null);
                        }}
                        className="text-neutral-400 hover:text-white"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    {taxDocumentsQuery.isLoading && (
                      <div className="mt-3 flex items-center gap-2 text-neutral-400">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-xs">Loading documents...</span>
                      </div>
                    )}

                    <DocImportList
                      documents={taxDocumentsQuery.data ?? []}
                      isSuccess={taxDocumentsQuery.isSuccess}
                      selectedDocIds={selectedDocIds}
                      setSelectedDocIds={setSelectedDocIds}
                      activePlanId={activePlanId}
                      isPending={prefillFromDocsMutation.isPending}
                      onImport={() => {
                        if (!activePlanId || selectedDocIds.size === 0) return;
                        prefillFromDocsMutation.mutate({
                          planId: activePlanId,
                          docIds: Array.from(selectedDocIds),
                          label: `Imported from ${selectedDocIds.size} document(s)`,
                        });
                      }}
                    />

                    {docImportStatus && (
                      <p className="mt-3 rounded-lg bg-neutral-900 px-3 py-2 text-xs text-neutral-200">
                        {docImportStatus}
                      </p>
                    )}
                  </div>
                )}

                <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
                  <input
                    value={snapshotLabel}
                    onChange={(event) => setSnapshotLabel(event.target.value)}
                    placeholder="Snapshot label"
                    className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2.5 text-sm text-white placeholder:text-neutral-500 focus:border-sky-300/60 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleSaveSnapshot}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-400/40 bg-emerald-500/15 px-4 py-2.5 text-sm font-medium text-emerald-100 hover:bg-emerald-500/20"
                  >
                    <Save className="h-4 w-4" />
                    Save snapshot
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputs(DEFAULT_INPUTS)}
                    className="rounded-xl border border-neutral-700 bg-white/5 px-4 py-2.5 text-sm text-white hover:bg-white/10"
                  >
                    Reset defaults
                  </button>
                </div>

                <div className="mt-3 grid gap-2 sm:grid-cols-[auto_auto_1fr]">
                  <button
                    type="button"
                    onClick={handleCreateShareLink}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-sky-400/40 bg-sky-500/15 px-4 py-2 text-sm text-sky-100 hover:bg-sky-500/20"
                  >
                    <Link className="h-4 w-4" />
                    Generate share link
                  </button>
                  {shareLink && (
                    <button
                      type="button"
                      onClick={copyShareLink}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-700 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10"
                    >
                      {shareLinkCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      {shareLinkCopied ? "Copied" : "Copy link"}
                    </button>
                  )}
                  {shareLink && (
                    <input
                      value={shareLink}
                      readOnly
                      className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs text-neutral-300"
                    />
                  )}
                </div>

                {sharedImportQuery.isSuccess && sharedPayload && (
                  <div className="mt-3 rounded-xl border border-emerald-400/40 bg-emerald-500/10 p-3 text-sm text-emerald-100">
                    Shared report detected: <span className="font-semibold">{sharedPayload.label}</span>
                    <button
                      type="button"
                      onClick={handleLoadSharedImport}
                      className="ml-3 rounded-lg border border-emerald-300/40 bg-emerald-400/20 px-2.5 py-1 text-xs"
                    >
                      Load into workspace
                    </button>
                  </div>
                )}

                {sharedImportQuery.isError && (
                  <p className="mt-3 text-xs text-rose-300">
                    Shared report could not be loaded. The link may be expired, revoked, or invalid.
                  </p>
                )}

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs uppercase tracking-[0.1em] text-neutral-400">Compare A</label>
                    <select
                      value={compareA}
                      onChange={(event) => setCompareA(event.target.value)}
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2.5 text-sm text-white focus:border-sky-300/60 focus:outline-none"
                    >
                      <option value="">Select version</option>
                      {allVersionOptions.map((option) => (
                        <option key={option.key} value={option.key}>
                          [{option.source}] {option.label} · {formatSavedAt(option.savedAt)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-xs uppercase tracking-[0.1em] text-neutral-400">Compare B</label>
                    <select
                      value={compareB}
                      onChange={(event) => setCompareB(event.target.value)}
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2.5 text-sm text-white focus:border-sky-300/60 focus:outline-none"
                    >
                      <option value="">Select version</option>
                      {allVersionOptions.map((option) => (
                        <option key={option.key} value={option.key}>
                          [{option.source}] {option.label} · {formatSavedAt(option.savedAt)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-4 overflow-x-auto rounded-2xl border border-neutral-800">
                  <table className="min-w-full divide-y divide-white/10 text-sm">
                    <thead className="bg-neutral-950">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs uppercase tracking-[0.12em] text-neutral-400">Version</th>
                        <th className="px-3 py-2 text-left text-xs uppercase tracking-[0.12em] text-neutral-400">Saved</th>
                        <th className="px-3 py-2 text-left text-xs uppercase tracking-[0.12em] text-neutral-400">Source</th>
                        <th className="px-3 py-2 text-right text-xs uppercase tracking-[0.12em] text-neutral-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {allVersionOptions.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-3 py-4 text-center text-neutral-500">
                            No versions yet.
                          </td>
                        </tr>
                      ) : (
                        allVersionOptions.map((option) => (
                          <tr key={option.key}>
                            <td className="px-3 py-3 text-white">
                              {option.label}
                              {option.revokedAt === "approved" ? (
                                <span className="ml-2 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-200">
                                  approved
                                </span>
                              ) : option.revokedAt ? (
                                <span className="ml-2 rounded-full bg-rose-500/20 px-2 py-0.5 text-[10px] text-rose-200">
                                  revoked
                                </span>
                              ) : null}
                            </td>
                            <td className="px-3 py-3 text-neutral-400">{formatSavedAt(option.savedAt)}</td>
                            <td className="px-3 py-3 text-neutral-300">{option.source}</td>
                            <td className="px-3 py-3">
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleLoadOption(option)}
                                  className="inline-flex items-center gap-1 rounded-lg border border-neutral-700 bg-white/5 px-2.5 py-1.5 text-xs text-white hover:bg-white/10"
                                >
                                  <FolderOpen className="h-3.5 w-3.5" />
                                  Load
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDownloadOptionPacket(option)}
                                  className="inline-flex items-center gap-1 rounded-lg border border-neutral-700 bg-white/5 px-2.5 py-1.5 text-xs text-white hover:bg-white/10"
                                >
                                  <Download className="h-3.5 w-3.5" />
                                  Packet
                                </button>
                                {option.source === "local" ? (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteLocalSnapshot(option.key.replace("local:", ""))}
                                    className="inline-flex items-center gap-1 rounded-lg border border-rose-400/40 bg-rose-500/10 px-2.5 py-1.5 text-xs text-rose-200 hover:bg-rose-500/20"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    Delete
                                  </button>
                                ) : option.key.startsWith("server-version:") && activePlanId ? (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleApproveVersion(
                                        option.key.replace("server-version:", "")
                                      )
                                    }
                                    className="inline-flex items-center gap-1 rounded-lg border border-emerald-400/40 bg-emerald-500/10 px-2.5 py-1.5 text-xs text-emerald-200 hover:bg-emerald-500/20"
                                  >
                                    <Check className="h-3.5 w-3.5" />
                                    Approve
                                  </button>
                                ) : option.reportId ? (
                                  <button
                                    type="button"
                                    onClick={() => handleRevokeServerSnapshot(option.reportId!)}
                                    className="inline-flex items-center gap-1 rounded-lg border border-rose-400/40 bg-rose-500/10 px-2.5 py-1.5 text-xs text-rose-200 hover:bg-rose-500/20"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    Revoke
                                  </button>
                                ) : null}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {compareResultsA && compareResultsB ? (
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
                      <p className="text-xs uppercase tracking-[0.1em] text-neutral-400">Scenario A</p>
                      <p className="mt-1 text-sm font-medium text-white">{compareOptionA?.label}</p>
                      <p className="mt-3 text-xs text-neutral-400">Estimated savings</p>
                      <p className="text-xl font-semibold text-emerald-300">
                        {formatCurrency(compareResultsA.estimatedSavings, 0)}
                      </p>
                      <p className="mt-2 text-xs text-neutral-400">Safe-harbor gap</p>
                      <p className="text-sm text-white">{formatCurrency(compareResultsA.safeHarborGap, 0)}</p>
                    </div>
                    <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
                      <p className="text-xs uppercase tracking-[0.1em] text-neutral-400">Scenario B</p>
                      <p className="mt-1 text-sm font-medium text-white">{compareOptionB?.label}</p>
                      <p className="mt-3 text-xs text-neutral-400">Estimated savings</p>
                      <p className="text-xl font-semibold text-emerald-300">
                        {formatCurrency(compareResultsB.estimatedSavings, 0)}
                      </p>
                      <p className="mt-2 text-xs text-neutral-400">Safe-harbor gap</p>
                      <p className="text-sm text-white">{formatCurrency(compareResultsB.safeHarborGap, 0)}</p>
                    </div>
                    <div className="sm:col-span-2 rounded-2xl border border-sky-400/30 bg-sky-500/10 p-4 text-sm text-sky-100">
                      Savings delta (B - A): {formatWithSign(compareResultsB.estimatedSavings - compareResultsA.estimatedSavings)}
                      {" · "}
                      Projected tax delta (B - A): {formatWithSign(compareResultsB.projectedTax - compareResultsA.projectedTax)}
                    </div>
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-neutral-500">
                    Select two saved versions to view scenario comparison.
                  </p>
                )}

                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
                    <div className="flex items-center gap-2 text-white">
                      <MessageSquare className="h-4 w-4" />
                      <h3 className="text-sm font-semibold">Comments</h3>
                    </div>
                    <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]">
                      <select
                        value={commentVersionId}
                        onChange={(event) => setCommentVersionId(event.target.value)}
                        className="rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2 text-xs text-white focus:border-sky-300/60 focus:outline-none"
                      >
                        <option value="">General comment</option>
                        {(versionsQuery.data ?? []).map((version) => (
                          <option key={version.id} value={version.id}>
                            {version.label}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={handleCreateComment}
                        disabled={!activePlanId || createCommentMutation.isPending}
                        className="rounded-xl border border-sky-400/40 bg-sky-500/15 px-3 py-2 text-xs text-sky-100 hover:bg-sky-500/20 disabled:opacity-60"
                      >
                        Add comment
                      </button>
                    </div>
                    <textarea
                      value={commentBody}
                      onChange={(event) => setCommentBody(event.target.value)}
                      placeholder="Add implementation notes for the client, advisor, or AI copilot..."
                      className="mt-2 h-20 w-full resize-none rounded-xl border border-neutral-700 bg-neutral-900 p-3 text-xs text-white placeholder:text-neutral-500 focus:border-sky-300/60 focus:outline-none"
                    />
                    <div className="mt-3 max-h-40 space-y-2 overflow-y-auto pr-1">
                      {(commentsQuery.data ?? []).slice(0, 6).map((comment) => (
                        <div key={comment.id} className="rounded-xl border border-neutral-800 bg-neutral-800 p-2.5">
                          <p className="text-xs text-neutral-200">{comment.body}</p>
                          <p className="mt-1 text-[11px] text-neutral-500">{formatSavedAt(comment.created_at)}</p>
                        </div>
                      ))}
                      {(commentsQuery.data ?? []).length === 0 && (
                        <p className="text-xs text-neutral-500">No comments yet.</p>
                      )}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
                    <div className="flex items-center gap-2 text-white">
                      <UsersRound className="h-4 w-4" />
                      <h3 className="text-sm font-semibold">Collaborators</h3>
                    </div>
                    <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto_auto]">
                      <input
                        value={collaboratorEmail}
                        onChange={(event) => setCollaboratorEmail(event.target.value)}
                        placeholder="advisor@example.com"
                        className="rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2 text-xs text-white placeholder:text-neutral-500 focus:border-sky-300/60 focus:outline-none"
                      />
                      <select
                        value={collaboratorRole}
                        onChange={(event) => setCollaboratorRole(event.target.value as TaxPlanCollaboratorRole)}
                        className="rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2 text-xs text-white focus:border-sky-300/60 focus:outline-none"
                      >
                        <option value="viewer">Viewer</option>
                        <option value="editor">Editor</option>
                        <option value="owner">Owner</option>
                      </select>
                      <button
                        type="button"
                        onClick={handleAddCollaborator}
                        disabled={!activePlanId || addCollaboratorMutation.isPending}
                        className="rounded-xl border border-sky-400/40 bg-sky-500/15 px-3 py-2 text-xs text-sky-100 hover:bg-sky-500/20 disabled:opacity-60"
                      >
                        Invite
                      </button>
                    </div>
                    <div className="mt-3 max-h-40 space-y-2 overflow-y-auto pr-1">
                      {(collaboratorsQuery.data ?? []).map((collaborator) => (
                        <div key={collaborator.id} className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-800 p-2.5">
                          <div>
                            <p className="text-xs text-neutral-200">{collaborator.email}</p>
                            <p className="text-[11px] text-neutral-500">{collaborator.role}</p>
                          </div>
                          {!collaborator.revoked_at && (
                            <button
                              type="button"
                              onClick={() =>
                                handleRevokeCollaborator(collaborator.id, collaborator.email)
                              }
                              className="rounded-lg border border-rose-400/40 bg-rose-500/10 px-2 py-1 text-[11px] text-rose-200 hover:bg-rose-500/20"
                            >
                              Revoke
                            </button>
                          )}
                        </div>
                      ))}
                      {(collaboratorsQuery.data ?? []).length === 0 && (
                        <p className="text-xs text-neutral-500">No collaborators yet.</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
                  <h3 className="text-sm font-semibold text-white">Audit timeline</h3>
                  <div className="mt-3 max-h-48 space-y-2 overflow-y-auto pr-1">
                    {(eventsQuery.data ?? []).slice(0, 14).map((event) => (
                      <div key={event.id} className="rounded-xl border border-neutral-800 bg-neutral-800 p-2.5">
                        <p className="text-xs font-medium text-neutral-200">{event.event_type}</p>
                        <p className="mt-1 text-[11px] text-neutral-500">{formatSavedAt(event.created_at)}</p>
                      </div>
                    ))}
                    {(eventsQuery.data ?? []).length === 0 && (
                      <p className="text-xs text-neutral-500">
                        Timeline will populate after plan events (save, compare, share, comment).
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6 backdrop-blur-sm">
                <h2 className="text-xl font-semibold text-white">4. Prioritized action plan</h2>
                <div className="mt-4 space-y-3">
                  {results.topActions.map((action, index) => (
                    <div
                      key={action.key}
                      className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-white">
                          {index + 1}. {action.title}
                        </p>
                        <span
                          className={cn(
                            "rounded-full px-2.5 py-1 text-xs font-medium",
                            action.priority === "High"
                              ? "bg-rose-500/20 text-rose-200"
                              : "bg-amber-500/20 text-amber-200"
                          )}
                        >
                          {action.priority}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-neutral-300">Owner: {action.owner}</p>
                      <p className="mt-2 text-sm text-neutral-400">{action.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6 lg:sticky lg:top-20 lg:h-fit">
              <ResultCard
                title="Workspace output"
                primaryValue={formatCurrency(results.estimatedSavings, 0)}
                primaryLabel="Estimated annual tax savings"
                variant="emerald"
                items={[
                  {
                    label: "Baseline tax",
                    value: formatCurrency(results.baselineTax, 0),
                  },
                  {
                    label: "Projected tax",
                    value: formatCurrency(results.projectedTax, 0),
                  },
                  {
                    label: "Effective tax rate",
                    value: formatPercent(estimatedRate, 1),
                  },
                  {
                    label: "Withholding gap",
                    value: formatWithSign(results.withholdingGap),
                    highlight: results.withholdingGap > 0,
                  },
                  {
                    label: "Safe-harbor gap",
                    value: formatCurrency(results.safeHarborGap, 0),
                    highlight: results.safeHarborGap > 0,
                  },
                ]}
                footer={
                  <button
                    type="button"
                    onClick={handleDownloadPacket}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-sky-400/40 bg-sky-500/15 px-3 py-2 text-sm font-medium text-sky-100 hover:bg-sky-500/20"
                  >
                    <Download className="h-4 w-4" />
                    Download Plan Packet (.md)
                  </button>
                }
              />

              <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-neutral-300">Plan confidence</p>
                    <p className="text-2xl font-semibold text-white">
                      {results.confidenceScore}
                      <span className="text-base font-normal text-neutral-400"> / 100</span>
                    </p>
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-semibold",
                      results.confidenceLabel === "High"
                        ? "bg-emerald-500/20 text-emerald-200"
                        : results.confidenceLabel === "Medium"
                          ? "bg-amber-500/20 text-amber-200"
                          : "bg-rose-500/20 text-rose-200"
                    )}
                  >
                    {results.confidenceLabel}
                  </span>
                </div>

                <div className="mt-4 space-y-2">
                  {results.strategyImpacts.map((impact) => (
                    <div key={impact.id} className="rounded-xl border border-neutral-800 bg-neutral-950 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm text-white">{impact.title}</p>
                        <p className="text-sm font-semibold text-emerald-300">
                          {formatCurrency(impact.savings, 0)}
                        </p>
                      </div>
                      <p className="mt-1 text-xs text-neutral-400">{impact.detail}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-sky-200">
                    Advisor-ready brief
                  </h3>
                  <button
                    type="button"
                    onClick={copyBrief}
                    className="inline-flex items-center gap-2 rounded-lg border border-neutral-700 bg-white/5 px-3 py-1.5 text-xs text-white hover:bg-white/10"
                  >
                    {briefCopied ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
                <textarea
                  value={results.advisorBrief}
                  readOnly
                  className="mt-3 h-56 w-full resize-none rounded-xl border border-neutral-800 bg-neutral-900 p-3 text-xs leading-relaxed text-neutral-200 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 pb-20">
          <div className="mx-auto max-w-6xl">
            <MethodologySection title="Methodology & guardrails">
              <p>
                This MVP uses deterministic, educational estimates to compare baseline tax versus
                a strategy-adjusted scenario. It is intentionally transparent and tunable.
              </p>
              <ul className="list-disc space-y-2 pl-5 text-sm">
                <li>Ordinary tax uses simplified blended federal + state rates based on taxable ordinary income.</li>
                <li>Capital gains tax uses simplified long-term federal bands plus state treatment.</li>
                <li>Strategy estimates apply conservative caps and confidence ratings per strategy.</li>
                <li>Safe-harbor gap approximates 90% current-year target versus withholding + estimates paid.</li>
                <li>Snapshots are saved locally and mirrored to server history when API access is available.</li>
                <li>Educational only and not tax, legal, or investment advice.</li>
              </ul>
            </MethodologySection>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
