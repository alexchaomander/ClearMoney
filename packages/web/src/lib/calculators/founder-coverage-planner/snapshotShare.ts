import type { CalculatorInputs } from "@/lib/calculators/founder-coverage-planner/types";

export type FounderCoverageSnapshotPayloadV1 = {
  version: 1;
  savedAt: string;
  inputs: CalculatorInputs;
  checklist?: Record<string, boolean>;
};

type RedactedInputs = Pick<
  CalculatorInputs,
  | "legalEntityType"
  | "taxElection"
  | "fundingPlan"
  | "ownerRole"
  | "stateCode"
  | "filingStatus"
  | "payrollCadence"
  | "reimbursementPolicy"
>;

export type FounderCoverageSharePayloadV2 =
  | {
      version: 2;
      mode: "full";
      savedAt: string;
      inputs: CalculatorInputs;
      checklist?: Record<string, boolean>;
    }
  | {
      version: 2;
      mode: "redacted";
      savedAt: string;
      inputs: RedactedInputs;
      checklist?: Record<string, boolean>;
      entity: {
        recommendedLegalEntity: CalculatorInputs["legalEntityType"];
        recommendedTaxElection: CalculatorInputs["taxElection"];
        summary: string;
        reasons: string[];
      };
      actionItems: Array<{ key: string; title: string; detail: string }>;
      actionEvents: Array<{ date: string; title: string; description: string }>;
      commingling90d?: {
        rate: number;
        comminglingCount: number;
        eligibleCount: number;
        topMerchants: string[];
      };
    };

export type FounderCoverageSharePayload = FounderCoverageSnapshotPayloadV1 | FounderCoverageSharePayloadV2;

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i] ?? 0);
  }
  const base64 = btoa(binary);
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToBytes(base64Url: string): Uint8Array {
  const padded = base64Url
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(Math.ceil(base64Url.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export function encodeFounderCoverageSharePayload(payload: FounderCoverageSharePayload): string {
  const json = JSON.stringify(payload);
  const bytes = new TextEncoder().encode(json);
  return bytesToBase64Url(bytes);
}

export function decodeFounderCoverageSharePayload(encoded: string): FounderCoverageSharePayload | null {
  try {
    const bytes = base64UrlToBytes(encoded);
    const json = new TextDecoder().decode(bytes);
    const parsed = JSON.parse(json) as unknown;
    if (!parsed || typeof parsed !== "object") return null;

    const obj = parsed as Record<string, unknown>;
    const version = obj["version"];
    if (version !== 1 && version !== 2) return null;
    if (typeof obj["savedAt"] !== "string") return null;

    return parsed as FounderCoverageSharePayload;
  } catch {
    return null;
  }
}

export function stripCurrencyLikeText(text: string): string {
  // Remove common "$12,345" patterns (used only for redacted share output).
  return text.replace(/\$[0-9][0-9,]*(\.[0-9]{2})?/g, "[redacted]");
}

