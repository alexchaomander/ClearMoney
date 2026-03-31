# Dependency Audit — 2026-03-31

## Python (pip-audit)

| Package        | CVE              | Severity | Status                          |
|----------------|------------------|----------|---------------------------------|
| cryptography   | CVE-2024-12797   | High     | Resolved in `packages/strata-api` after isolating SnapTrade into `packages/brokerage-service`. The remaining exposure is limited to the brokerage service runtime because `snaptrade-python-sdk 11.0.172` still pins `cryptography<44.0.0`. |
| ecdsa (via python-jose) | CVE-2024-23342 | Medium | No fix version available. Consider migrating from `python-jose` to `PyJWT` long-term. |

## JavaScript (pnpm audit)

| Package    | Issue                      | Severity | Status                          |
|------------|----------------------------|----------|---------------------------------|
| minimatch  | ReDoS (via eslint)         | High     | Transitive dev dependency. No action — awaiting eslint upgrade. |
| rollup     | Arbitrary file write (via vitest>vite) | Medium | Transitive dev dependency. No action — awaiting vite upgrade. |

## Actions Taken

- Removed `snaptrade-python-sdk` from `packages/strata-api` and isolated it into `packages/brokerage-service`.
- Bumped `packages/strata-api` to `cryptography>=46.0.6,<47.0.0`.
- Confirmed `snaptrade-python-sdk==11.0.172` (latest as of March 31, 2026) still requires `cryptography<44.0.0`, so the remaining exception is service-scoped.
- Both JS vulnerabilities are in transitive dev-only dependencies with no direct fix available.

## Recommended Follow-ups

1. Monitor `snaptrade-python-sdk` releases for `cryptography>=44` support.
2. Keep `packages/brokerage-service` on its own deployment target and environment.
3. Evaluate replacing `python-jose` with `PyJWT` to eliminate the `ecdsa` transitive dependency.
4. Update `eslint` and `vite`/`vitest` when new major versions resolve the transitive CVEs.
