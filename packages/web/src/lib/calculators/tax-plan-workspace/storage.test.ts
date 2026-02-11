import { beforeEach, describe, expect, test } from "vitest";
import {
  createSnapshot,
  deleteSnapshot,
  loadSnapshots,
  persistSnapshots,
  TAX_PLAN_WORKSPACE_STORAGE_KEY,
  upsertSnapshot,
} from "./storage";
import type { WorkspaceInputs } from "./types";

const INPUTS: WorkspaceInputs = {
  mode: "individual",
  clientName: "",
  filingStatus: "single",
  stateCode: "CA",
  wagesIncome: 150000,
  otherOrdinaryIncome: 10000,
  shortTermGains: 3000,
  longTermGains: 7000,
  currentWithholding: 30000,
  hsaRemainingRoom: 2000,
  pretax401kRemainingRoom: 5000,
  harvestableLosses: 2000,
  donationAmount: 1000,
  quarterlyPaymentsMade: 0,
  strategies: {
    hsa: true,
    pretax401k: true,
    lossHarvesting: true,
    donationBunching: false,
  },
};

describe("tax-plan-workspace.storage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  test("persists and reloads snapshots", () => {
    const snapshot = createSnapshot({
      label: "Draft A",
      inputs: INPUTS,
      now: new Date("2026-02-11T00:00:00.000Z"),
    });

    persistSnapshots([snapshot]);

    const loaded = loadSnapshots();
    expect(loaded).toHaveLength(1);
    expect(loaded[0]?.label).toBe("Draft A");
  });

  test("upsert and delete snapshot collection", () => {
    const a = createSnapshot({ label: "A", inputs: INPUTS });
    const b = createSnapshot({ label: "B", inputs: INPUTS });

    const withA = upsertSnapshot([], a);
    const withBoth = upsertSnapshot(withA, b);
    expect(withBoth).toHaveLength(2);

    const withoutA = deleteSnapshot(withBoth, a.id);
    expect(withoutA).toHaveLength(1);
    expect(withoutA[0]?.id).toBe(b.id);
  });

  test("invalid localStorage payload loads as empty", () => {
    window.localStorage.setItem(TAX_PLAN_WORKSPACE_STORAGE_KEY, "{bad json");
    expect(loadSnapshots()).toEqual([]);
  });
});
