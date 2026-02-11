import { describe, expect, test } from "vitest";
import { buildTaxPlanPacket } from "./packet";
import type { WorkspaceInputs } from "./types";

const INPUTS: WorkspaceInputs = {
  mode: "advisor",
  clientName: "Nguyen Family",
  filingStatus: "married",
  stateCode: "CA",
  wagesIncome: 250000,
  otherOrdinaryIncome: 20000,
  shortTermGains: 5000,
  longTermGains: 12000,
  currentWithholding: 45000,
  hsaRemainingRoom: 3000,
  pretax401kRemainingRoom: 8000,
  harvestableLosses: 4500,
  donationAmount: 7000,
  quarterlyPaymentsMade: 5000,
  strategies: {
    hsa: true,
    pretax401k: true,
    lossHarvesting: true,
    donationBunching: false,
  },
};

describe("tax-plan-workspace.packet", () => {
  test("builds markdown packet with summary and brief", () => {
    const { filename, markdown } = buildTaxPlanPacket({
      inputs: INPUTS,
      snapshotLabel: "Q1 Plan",
      now: new Date("2026-02-11T00:00:00.000Z"),
    });

    expect(filename).toBe("clearmoney-tax-plan-packet-2026-02-11.md");
    expect(markdown).toContain("# ClearMoney Tax Plan Packet");
    expect(markdown).toContain("## Tax Summary");
    expect(markdown).toContain("## Advisor Brief");
    expect(markdown).toContain("Q1 Plan");
  });
});
