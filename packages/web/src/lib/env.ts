/**
 * Runtime environment validation.
 *
 * Import this module early (e.g. in root layout or middleware) to surface
 * missing configuration at startup rather than at request time.
 *
 * During `next build` (including static exports) env vars may not be present,
 * so we only enforce at request time in a running server.
 */

const isBuildPhase =
  process.env.NEXT_PHASE === "phase-production-build" ||
  process.env.STATIC_EXPORT === "true";

function required(name: string): string {
  const value = process.env[name];
  if (!value && !isBuildPhase) {
    throw new Error(
      `Missing required environment variable: ${name}. Check .env.local or your deployment config.`
    );
  }
  return value ?? "";
}

function optional(name: string, fallback: string): string {
  return process.env[name] || fallback;
}

export const env = {
  /** Clerk publishable key — required for auth */
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: required(
    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
  ),

  /** Strata API base URL */
  NEXT_PUBLIC_STRATA_API_URL: optional(
    "NEXT_PUBLIC_STRATA_API_URL",
    "http://localhost:8006"
  ),

  /** Sentry DSN — optional, enables error tracking when set */
  NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN || "",
} as const;
