import { formatCurrency, formatPercent, formatWithSign } from "@/lib/shared/formatters";
import { calculate } from "./calculations";
import type { TaxPlanResults, WorkspaceInputs } from "./types";

function toDateStamp(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function buildSummaryRows(results: TaxPlanResults): string {
  return [
    `- Baseline tax: ${formatCurrency(results.baselineTax, 0)}`,
    `- Projected tax: ${formatCurrency(results.projectedTax, 0)}`,
    `- Estimated savings: ${formatCurrency(results.estimatedSavings, 0)}`,
    `- Withholding gap: ${formatWithSign(results.withholdingGap)}`,
    `- Safe-harbor gap: ${formatCurrency(results.safeHarborGap, 0)}`,
    `- Confidence: ${results.confidenceLabel} (${results.confidenceScore}/100)`,
  ].join("\n");
}

function buildStrategyRows(results: TaxPlanResults): string {
  if (results.strategyImpacts.length === 0) {
    return "- No strategies enabled.";
  }

  return results.strategyImpacts
    .map((impact) => {
      const assumptions = impact.assumptions.map((line) => `  - ${line}`).join("\n");
      return `- ${impact.title}: ${formatCurrency(impact.savings, 0)} (${impact.confidence} confidence)\n  - ${impact.detail}\n${assumptions}`;
    })
    .join("\n");
}

function buildActionRows(results: TaxPlanResults): string {
  return results.topActions
    .map(
      (action, index) =>
        `${index + 1}. [${action.priority}] ${action.title} (${action.owner})\n   - ${action.detail}`
    )
    .join("\n");
}

function buildInputRows(inputs: WorkspaceInputs): string {
  return [
    `- Mode: ${inputs.mode}`,
    `- Filing status: ${inputs.filingStatus}`,
    `- State: ${inputs.stateCode}`,
    `- Wages income: ${formatCurrency(inputs.wagesIncome, 0)}`,
    `- Other ordinary income: ${formatCurrency(inputs.otherOrdinaryIncome, 0)}`,
    `- Short-term gains: ${formatCurrency(inputs.shortTermGains, 0)}`,
    `- Long-term gains: ${formatCurrency(inputs.longTermGains, 0)}`,
    `- Current withholding: ${formatCurrency(inputs.currentWithholding, 0)}`,
    `- Quarterly payments made: ${formatCurrency(inputs.quarterlyPaymentsMade, 0)}`,
    `- HSA remaining room: ${formatCurrency(inputs.hsaRemainingRoom, 0)}`,
    `- Pre-tax retirement room: ${formatCurrency(inputs.pretax401kRemainingRoom, 0)}`,
    `- Harvestable losses: ${formatCurrency(inputs.harvestableLosses, 0)}`,
    `- Planned donations: ${formatCurrency(inputs.donationAmount, 0)}`,
    `- Strategy toggles: hsa=${inputs.strategies.hsa}, pretax401k=${inputs.strategies.pretax401k}, lossHarvesting=${inputs.strategies.lossHarvesting}, donationBunching=${inputs.strategies.donationBunching}`,
  ].join("\n");
}

export function buildTaxPlanPacket(args: {
  inputs: WorkspaceInputs;
  snapshotLabel?: string;
  now?: Date;
}): { filename: string; markdown: string } {
  const now = args.now ?? new Date();
  const results = calculate(args.inputs);
  const dateStamp = toDateStamp(now);
  const titleLabel = args.snapshotLabel?.trim() || "Current Workspace";

  const effectiveTaxRateBase =
    args.inputs.wagesIncome +
      args.inputs.otherOrdinaryIncome +
      args.inputs.shortTermGains +
      args.inputs.longTermGains >
    0
      ? results.baselineTax /
        Math.max(
          1,
          args.inputs.wagesIncome +
            args.inputs.otherOrdinaryIncome +
            args.inputs.shortTermGains +
            args.inputs.longTermGains
        )
      : 0;

  const markdown = `# ClearMoney Tax Plan Packet\n\n## Plan\n- Label: ${titleLabel}\n- Generated: ${dateStamp}\n- Household: ${args.inputs.clientName.trim() || "Unnamed household"}\n\n## Tax Summary\n${buildSummaryRows(results)}\n- Effective baseline tax rate: ${formatPercent(effectiveTaxRateBase, 1)}\n\n## Inputs\n${buildInputRows(args.inputs)}\n\n## Strategy Impact\n${buildStrategyRows(results)}\n\n## Action Plan\n${buildActionRows(results)}\n\n## Advisor Brief\n\`\`\`text\n${results.advisorBrief}\n\`\`\`\n\n## Methodology\n- Deterministic estimate using simplified ordinary and long-term gains bands.\n- Includes strategy-level savings assumptions and confidence flags.\n- Educational planning output only; verify with tax professionals before implementation.\n`;

  const filename = `clearmoney-tax-plan-packet-${dateStamp}.md`;
  return { filename, markdown };
}
