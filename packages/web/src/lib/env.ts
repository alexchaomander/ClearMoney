/**
 * Runtime environment validation.
 *
 * Import this module early (e.g. in root layout or middleware) to surface
 * missing configuration at startup rather than at request time.
 */

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. Check .env.local or your deployment config.`
    );
  }
  return value;
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
