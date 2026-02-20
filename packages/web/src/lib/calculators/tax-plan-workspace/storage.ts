import type { SavedTaxPlanSnapshot, WorkspaceInputs } from "./types";

export const TAX_PLAN_WORKSPACE_STORAGE_KEY = "taxPlanWorkspace.snapshots.v1";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function safeParseSnapshots(raw: string): SavedTaxPlanSnapshot[] {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    const snapshots: SavedTaxPlanSnapshot[] = [];

    for (const item of parsed) {
      if (!isObject(item)) continue;
      if (typeof item.id !== "string") continue;
      if (typeof item.savedAt !== "string") continue;
      if (typeof item.label !== "string") continue;
      if (!isObject(item.inputs)) continue;

      snapshots.push(item as unknown as SavedTaxPlanSnapshot);
    }

    return snapshots;
  } catch {
    return [];
  }
}

export function loadSnapshots(): SavedTaxPlanSnapshot[] {
  if (typeof window === "undefined") return [];

  const raw = window.localStorage.getItem(TAX_PLAN_WORKSPACE_STORAGE_KEY);
  if (!raw) return [];

  return safeParseSnapshots(raw)
    .sort((a, b) => b.savedAt.localeCompare(a.savedAt))
    .slice(0, 25);
}

export function persistSnapshots(snapshots: SavedTaxPlanSnapshot[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      TAX_PLAN_WORKSPACE_STORAGE_KEY,
      JSON.stringify(snapshots.slice(0, 25))
    );
  } catch {
    // ignore localStorage write failures
  }
}

export function createSnapshot(args: {
  label: string;
  inputs: WorkspaceInputs;
  now?: Date;
}): SavedTaxPlanSnapshot {
  const now = args.now ?? new Date();
  const id = `${now.getTime().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

  return {
    id,
    savedAt: now.toISOString(),
    label: args.label.trim() || "Untitled plan",
    inputs: JSON.parse(JSON.stringify(args.inputs)) as WorkspaceInputs,
  };
}

export function upsertSnapshot(
  existing: SavedTaxPlanSnapshot[],
  snapshot: SavedTaxPlanSnapshot
): SavedTaxPlanSnapshot[] {
  const withoutCurrent = existing.filter((item) => item.id !== snapshot.id);
  return [snapshot, ...withoutCurrent]
    .sort((a, b) => b.savedAt.localeCompare(a.savedAt))
    .slice(0, 25);
}

export function deleteSnapshot(
  existing: SavedTaxPlanSnapshot[],
  snapshotId: string
): SavedTaxPlanSnapshot[] {
  return existing.filter((item) => item.id !== snapshotId);
}
