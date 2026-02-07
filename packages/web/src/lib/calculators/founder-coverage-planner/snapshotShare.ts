import type { CalculatorInputs } from "@/lib/calculators/founder-coverage-planner/types";

export type FounderCoverageSnapshotPayload = {
  version: 1;
  savedAt: string;
  inputs: CalculatorInputs;
  checklist?: Record<string, boolean>;
};

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

export function encodeFounderCoverageSnapshot(payload: FounderCoverageSnapshotPayload): string {
  const json = JSON.stringify(payload);
  const bytes = new TextEncoder().encode(json);
  return bytesToBase64Url(bytes);
}

export function decodeFounderCoverageSnapshot(encoded: string): FounderCoverageSnapshotPayload | null {
  try {
    const bytes = base64UrlToBytes(encoded);
    const json = new TextDecoder().decode(bytes);
    const parsed = JSON.parse(json) as unknown;
    if (!parsed || typeof parsed !== "object") return null;
    const obj = parsed as Record<string, unknown>;
    if (obj["version"] !== 1) return null;
    if (typeof obj["savedAt"] !== "string") return null;
    if (!obj["inputs"] || typeof obj["inputs"] !== "object") return null;
    return parsed as FounderCoverageSnapshotPayload;
  } catch {
    return null;
  }
}

