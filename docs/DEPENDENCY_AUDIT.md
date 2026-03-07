# Dependency Audit — 2026-03-06

## Python (pip-audit)

| Package        | CVE              | Severity | Status                          |
|----------------|------------------|----------|---------------------------------|
| cryptography   | CVE-2024-12797   | High     | Blocked — `snaptrade-python-sdk` pins `cryptography<44.0.0`. Bumped floor to `>=43.0.3`. Upstream fix needed. |
| ecdsa (via python-jose) | CVE-2024-23342 | Medium | No fix version available. Consider migrating from `python-jose` to `PyJWT` long-term. |

## JavaScript (pnpm audit)

| Package    | Issue                      | Severity | Status                          |
|------------|----------------------------|----------|---------------------------------|
| minimatch  | ReDoS (via eslint)         | High     | Transitive dev dependency. No action — awaiting eslint upgrade. |
| rollup     | Arbitrary file write (via vitest>vite) | Medium | Transitive dev dependency. No action — awaiting vite upgrade. |

## Actions Taken

- Bumped `cryptography` floor from `>=43.0.0` to `>=43.0.3` (latest patch in the `<44` range).
- Confirmed `snaptrade-python-sdk==11.0.168` (latest) still requires `cryptography<44.0.0`.
- Both JS vulnerabilities are in transitive dev-only dependencies with no direct fix available.

## Recommended Follow-ups

1. Monitor `snaptrade-python-sdk` releases for `cryptography>=44` support.
2. Evaluate replacing `python-jose` with `PyJWT` to eliminate the `ecdsa` transitive dependency.
3. Update `eslint` and `vite`/`vitest` when new major versions resolve the transitive CVEs.
