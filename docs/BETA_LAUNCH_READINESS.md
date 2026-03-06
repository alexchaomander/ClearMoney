# ClearMoney Public Beta Launch Readiness Assessment

**Date:** 2026-03-06
**Status:** Private Beta → Public Beta evaluation

---

## Executive Summary

ClearMoney is a well-architected financial advisory platform with a strong foundation for public beta. The monorepo (Next.js 16 frontend + FastAPI backend + TypeScript SDK) has solid CI/CD, Sentry error tracking, Clerk authentication, security headers, rate limiting, and a comprehensive test suite. Several areas need attention before public exposure — most critically around production auth hardening, test coverage gaps, and observability maturity.

**Overall Readiness: 7/10 — Launch-ready with caveats**

---

## 1. Architecture & Tech Stack — STRONG

| Layer | Technology | Status |
|-------|-----------|--------|
| Frontend | Next.js 16, React 19, Tailwind CSS 4, Framer Motion | Current, well-maintained |
| Backend | FastAPI, Python 3.12, SQLAlchemy Async, Pydantic v2 | Production-grade |
| SDK | TypeScript (internal) | Minimal — no tests |
| Auth | Clerk (JWT w/ PEM validation) | Properly gated |
| Database | PostgreSQL (prod), SQLite (dev) | Good separation |
| Cache | Redis (prod), in-memory (dev) | Graceful fallback |
| Error Tracking | Sentry (frontend + backend) | Configured |
| Analytics | PostHog (optional) | Wired up |
| CI/CD | GitHub Actions → Railway (API) + Vercel (Web) | Automated |
| Monorepo | Turborepo + pnpm workspaces | Clean |

**Surface area is significant** — ~100+ pages/routes on the frontend, 30+ API routers, 50+ services, and 30 Alembic migrations. This is a large app for beta.

---

## 2. Security — GOOD, with items to harden

### What's in place
- **Authentication**: Clerk middleware protects `/dashboard`, `/connect`, `/profile`, `/settings`, `/advisor`, `/onboarding` routes. Backend validates JWT via PEM public key in production.
- **Beta gate**: Cookie-based invite code (`cm_beta_access`) required for all protected routes.
- **CORS**: Properly configured with explicit origins; wildcard `*` rejected when credentials are enabled (validated at config time).
- **Content Security Policy**: Comprehensive CSP with `frame-ancestors 'none'`, `object-src 'none'`, `base-uri 'self'`.
- **Security headers**: HSTS (2-year max-age, preload), X-Frame-Options DENY, X-Content-Type-Options nosniff, strict Referrer-Policy, Permissions-Policy.
- **Rate limiting**: `slowapi` at 60 requests/minute default, backed by Redis.
- **Credentials encryption**: Encryption key for stored credentials (e.g., SnapTrade/Plaid tokens).
- **Step-up authentication**: Secondary token for high-risk agent actions.
- **Consent system**: Scope-based consent grants for data access.
- **Data freshness guardrails**: AI advisor warns users when account data is stale.

### Items to address before public beta

| Priority | Issue | Detail |
|----------|-------|--------|
| **P0** | Auth header bypass in dev | When `STRATA_CLERK_PEM_PUBLIC_KEY` is unset, anyone can pass `X-Clerk-User-Id` header to impersonate any user. Ensure PEM key is always set in production/staging. The config validator logs a warning, but does **not** block startup. |
| **P0** | `auto_consent_on_missing` flag | If accidentally set to `true` in production, auto-grants all consent scopes. Must be `false` in production config. |
| **P1** | CSP allows `unsafe-inline` + `unsafe-eval` for scripts | Necessary for Next.js hydration, but consider nonce-based CSP when Next.js supports it. |
| **P1** | No CSRF protection beyond SameSite cookies | Clerk handles session tokens, but custom API calls should validate origin. |
| **P2** | Dependency audit | Run `pnpm audit` and `pip audit` before launch. No evidence of regular vulnerability scanning. |
| **P2** | No secrets scanning in CI | Consider adding `gitleaks` or GitHub Advanced Security. |

---

## 3. Testing — GOOD coverage, some gaps

### Current state
- **Backend**: 23 test files, 155+ tests (pytest, async), in-memory SQLite fixtures
- **Frontend unit**: 19 test files (Vitest + jsdom + Testing Library)
- **Frontend E2E**: 8 Playwright specs (landing page, onboarding, demo flow, SEO, blog, tax docs, founder coverage)
- **CI pipeline**: 3 jobs (web lint/type-check/test/build, E2E w/ Playwright, API pytest)

### Gaps

| Priority | Issue | Impact |
|----------|-------|--------|
| **P1** | No test coverage measurement or thresholds | Can't track regressions; no coverage gates in CI |
| **P1** | SDK package has zero tests | Internal, but any bug here cascades to the frontend |
| **P2** | No API integration tests against real DB | All tests use SQLite; Postgres-specific behavior untested |
| **P2** | No load/stress testing | Unknown how the app performs under concurrent beta users |
| **P3** | No pre-commit hooks | Developers can push unlinted/untested code locally |

---

## 4. Error Handling & Observability — GOOD foundation

### What's in place
- **Sentry**: Configured on both frontend (client, server, edge configs) and backend. Traces sample rate at 20%.
- **Next.js error boundaries**: `error.tsx` files in `/app`, `/dashboard`, `/blog`, `/connect`, `/profile`, `/tools`, `/settings`. Root error boundary reports to Sentry.
- **Health check endpoint**: `GET /api/v1/health` — checks database connectivity.
- **Graceful shutdown**: Lifespan manager cancels background tasks, closes Redis/DB/HTTP sessions.
- **Structured logging**: Python `logging` module used throughout the backend.
- **PostHog analytics**: Optional product analytics integration ready.

### Gaps

| Priority | Issue | Impact |
|----------|-------|--------|
| **P1** | Health check doesn't verify Redis | Only checks DB; Redis failure would silently degrade sessions/rate-limiting |
| **P1** | No alerting pipeline documented | Sentry is configured but unclear if PagerDuty/Slack/email alerts are wired |
| **P2** | Frontend uses ~10 `console.log/warn/error` statements | Should be Sentry breadcrumbs instead of raw console |
| **P2** | No request tracing (correlation IDs) | Hard to trace user issues across frontend → API |
| **P2** | No database backup/restore procedure documented | Critical for a financial data app |
| **P3** | No uptime monitoring (external) | Consider Checkly, Uptime Robot, or similar |

---

## 5. Deployment & Infrastructure — SOLID

### What's in place
- **CI/CD**: GitHub Actions auto-deploys to Railway (API) + Vercel (Web) on `main` push.
- **Docker Compose**: Local dev with PostgreSQL + Redis + API, health checks on all services.
- **Alembic migrations**: 30 managed migrations for schema evolution.
- **Environment management**: `.env.example` files with clear documentation for both packages.
- **Lockfiles**: `pnpm-lock.yaml` committed. Python deps managed via `uv`.
- **Turborepo**: Proper task orchestration with caching.

### Gaps

| Priority | Issue | Impact |
|----------|-------|--------|
| **P1** | No staging environment documented | Unclear if changes are tested in staging before production |
| **P1** | No rollback strategy documented | Railway/Vercel both support rollbacks, but no runbook exists |
| **P2** | No database migration pre-flight checks | Alembic migrations should be tested against a staging DB |
| **P2** | No feature flags | No way to gradually roll out features or kill-switch a broken feature |
| **P3** | No container image for web | Only API has a Dockerfile; web relies on Vercel's build |

---

## 6. Product Completeness — VERY AMBITIOUS scope

The app has an extensive feature set for a beta:

- **100+ frontend pages/routes** including ~40 financial calculator tools
- **AI Financial Advisor** with Claude integration, skill registry, and guardrails
- **Founder Operating Room** (runway, burn, commingling detection, subscription audit)
- **Action Layer** (intents, approvals, policy engine, war room)
- **Plaid + SnapTrade integrations** for real banking/brokerage data
- **Document extraction** (multi-provider: Claude, OpenAI, DeepSeek, Tesseract)
- **Privacy features** (vanish mode, redacted sharing, SVP proofs)
- **Blog/editorial content** system with MDX
- **Monte Carlo simulations**, what-if analysis

### Recommendation
For a public beta, consider **feature-flagging experimental features** (Action Layer, SVP Proofs, autonomous agent actions) and clearly marking them as "Labs" or "Experimental" in the UI. The core dashboard + advisor + tools are the beta-safe surface.

---

## 7. Data Privacy & Compliance

### What's in place
- Privacy policy page exists (`/privacy`)
- Terms of service page exists (`/terms`)
- Consent-based data access model (scope grants)
- Credential encryption at rest
- Redacted sharing feature
- Data minimization in verification proofs

### Gaps

| Priority | Issue | Impact |
|----------|-------|--------|
| **P1** | No data deletion / account export flow | Users in public beta will expect data portability |
| **P1** | No cookie consent banner | Required in many jurisdictions (PostHog, Clerk, Sentry all set cookies) |
| **P2** | No audit log for data access | Financial data app should log who accessed what |
| **P2** | No data retention policy | How long are transactions, AI conversations, and account data kept? |

---

## 8. Performance & Scalability

### What's in place
- React Query for client-side data caching
- Redis for session/rate-limit storage
- Background jobs for account syncing (configurable intervals)
- Async SQLAlchemy for non-blocking DB access
- Next.js automatic code splitting

### Gaps

| Priority | Issue | Impact |
|----------|-------|--------|
| **P1** | No load testing results | Unknown capacity for concurrent users |
| **P2** | No CDN caching headers for static assets | Vercel handles this, but worth verifying |
| **P2** | No database connection pooling config documented | Critical at scale |
| **P3** | Large page count (~100+) may slow build times | Monitor Vercel build duration |

---

## Launch Readiness Checklist

### Must-have (P0) — Block launch
- [ ] Verify `STRATA_CLERK_PEM_PUBLIC_KEY` is set in production; consider failing startup if missing in non-debug mode
- [ ] Verify `auto_consent_on_missing` is `false` in production
- [ ] Run `pnpm audit` and `pip audit` — fix critical/high vulnerabilities
- [ ] Verify beta invite code system works end-to-end in production

### Should-have (P1) — Launch with plan to fix within 2 weeks
- [ ] Add Redis check to health endpoint
- [ ] Wire Sentry alerts to Slack/PagerDuty/email
- [ ] Set up a staging environment for pre-production validation
- [ ] Document rollback procedures for both Railway and Vercel
- [ ] Add test coverage measurement to CI (Istanbul/c8 for web, coverage.py for API)
- [ ] Add cookie consent banner
- [ ] Build account deletion / data export flow
- [ ] Run basic load test (k6 or locust) against staging

### Nice-to-have (P2) — Address during beta
- [ ] Add correlation IDs (request tracing) across frontend and API
- [ ] Replace `console.log` statements with Sentry breadcrumbs
- [ ] Add `gitleaks` or secret scanning to CI
- [ ] Implement feature flags for experimental features
- [ ] Add database backup documentation/runbook
- [ ] Set up external uptime monitoring
- [ ] Add pre-commit hooks (Husky + lint-staged)
- [ ] Write tests for strata-sdk package
- [ ] Document data retention policy

---

## Conclusion

ClearMoney has impressive engineering maturity for its stage: proper auth, security headers, Sentry integration, CI/CD pipelines, and a substantial test suite. The **P0 items are small and quick to fix** — they're mostly configuration verification rather than architectural gaps.

The biggest risks for public beta are:
1. **Large attack surface** — 100+ routes and 30+ API endpoints mean more places for bugs to hide
2. **Financial data sensitivity** — any data leak is brand-destroying
3. **AI advisor liability** — financial recommendations carry regulatory implications

**Recommendation:** Fix P0 items, then launch the public beta with experimental features gated behind a "Labs" flag. Monitor Sentry closely in the first 48 hours. Have the rollback procedure documented and tested before go-live.
