# Parallel Agent Prompts (Detailed)

Purpose: A single document containing detailed, step-by-step prompts to run multiple coding agents in parallel. Each prompt is self-contained and safe to run independently.

Date: 2026-01-24

**Important**: This platform is designed as **standalone infrastructure** — a multi-tenant "Context Graph for Finance" that can serve multiple consumer apps. ClearMoney is the first customer, but the platform must be app-agnostic. Do NOT hardcode ClearMoney references in the platform layer (Prompts 1–7, 9). Only Prompt 8 (UI scaffolding) is ClearMoney-specific.

---

## Prompt 1 — Platform API (OpenAPI 3.1) ✅ COMPLETED

> **Status:** Completed and merged. See `docs/platform/openapi.yaml` for the implemented spec.

Role:
You are a systems API designer. Produce a complete OpenAPI 3.1 spec for a **multi-tenant, provider-agnostic financial connectivity platform** called the "Context Graph API".

Scope:
- Define the external API only.
- Do NOT implement code.
- Keep it provider-agnostic (no Plaid/MX-specific fields).
- Design for **multi-tenancy**: multiple apps can use this platform, each with isolated user data.

Requirements:

### Platform naming:
- API title: "Context Graph API" (NOT ClearMoney)
- Server URL: `https://api.contextgraph.example.com` (generic placeholder)
- Description: "A multi-tenant financial connectivity platform providing normalized access to financial data across providers."

### Multi-tenancy model:
- **Apps** are the tenants (e.g., ClearMoney is one app)
- **Users** are scoped to apps (`app_id` + `external_user_id` = unique)
- API keys are issued per-app
- All user data is isolated by app

### Endpoints to include (with HTTP methods):

| Resource | Endpoints |
|----------|-----------|
| Apps (admin) | `POST /v1/apps` (register new app), `GET /v1/apps` (list all), `GET /v1/apps/{app_id}`, `PATCH /v1/apps/{app_id}`, `DELETE /v1/apps/{app_id}`, `POST /v1/apps/{app_id}/rotate-key` |
| Users | `POST /v1/users`, `GET /v1/users/{user_id}`, `PATCH /v1/users/{user_id}`, `DELETE /v1/users/{user_id}` |
| Consents | `POST /v1/users/{user_id}/consents`, `GET /v1/users/{user_id}/consents`, `GET /v1/consents/{consent_id}`, `PATCH /v1/consents/{consent_id}` (revoke), `DELETE /v1/consents/{consent_id}` |
| Link Tokens | `POST /v1/link/token/create` (returns a one-time-use link token for client SDK) |
| Connections | `POST /v1/connections` (exchange public token for connection), `GET /v1/users/{user_id}/connections`, `GET /v1/connections/{connection_id}`, `POST /v1/connections/{connection_id}/refresh`, `DELETE /v1/connections/{connection_id}` |
| Institutions | `GET /v1/institutions`, `GET /v1/institutions/{institution_id}`, `GET /v1/institutions/search?query=` |
| Accounts | `GET /v1/connections/{connection_id}/accounts`, `GET /v1/accounts/{account_id}` |
| Balances | `GET /v1/accounts/{account_id}/balances`, `GET /v1/connections/{connection_id}/balances` |
| Transactions | `GET /v1/accounts/{account_id}/transactions`, `GET /v1/connections/{connection_id}/transactions` |
| Holdings | `GET /v1/accounts/{account_id}/holdings`, `GET /v1/connections/{connection_id}/holdings` |
| Securities | `GET /v1/securities`, `GET /v1/securities/{security_id}` |
| Liabilities | `GET /v1/accounts/{account_id}/liabilities`, `GET /v1/connections/{connection_id}/liabilities` |
| Sync Status | `GET /v1/connections/{connection_id}/sync-status`, `GET /v1/coverage` (platform-wide data freshness) |
| Webhooks (inbound) | `POST /v1/webhooks/provider` (internal: receives from aggregators) |
| Webhooks (outbound) | `POST /v1/webhook-subscriptions`, `GET /v1/webhook-subscriptions`, `DELETE /v1/webhook-subscriptions/{webhook_subscription_id}` |

### App registration schema:
```yaml
App:
  type: object
  required: [id, name, created_at]
  properties:
    id:
      type: string
      description: Unique app identifier (e.g., "app_acme")
    name:
      type: string
      description: Display name (e.g., "Acme Finance")
    webhook_url:
      type: string
      format: uri
      nullable: true
      description: Default webhook endpoint for this app
    created_at:
      type: string
      format: date-time

AppWithApiKey:
  allOf:
    - $ref: '#/components/schemas/App'
    - type: object
      required: [api_key]
      properties:
        api_key:
          type: string
          description: The API key for this app (only returned on creation)
```

### User schema (multi-tenant):
- `id`: Platform-generated UUID
- `app_id`: The app this user belongs to (implicit from API key, not in request body)
- `external_user_id`: The app's own user identifier
- Unique constraint: (`app_id`, `external_user_id`)

### Security:
- **App API key** via `X-API-Key` header — identifies the app, scopes all requests to that app's data
- **Admin API key** via `X-Admin-API-Key` header — for app management endpoints only
- Bearer token (JWT) authentication via `Authorization: Bearer <token>` for user-context calls (optional, for client-side SDKs)
- Define all security schemes in the spec's `securitySchemes` section.

### Pagination:
- Use cursor-based pagination for list endpoints.
- Response includes: `data` (array), `next_cursor` (string | null), `has_more` (boolean).
- Request accepts: `cursor` (string, optional), `limit` (integer, default 50, max 200).

### Filtering and sorting:
- Transactions: filter by `start_date`, `end_date`, `account_id`, `category`; sort by `date` (default desc).
- Accounts: filter by `type` (checking, savings, investment, credit, loan).
- Holdings: filter by `security_type`.

### Standard error response schema:
```yaml
Error:
  type: object
  required: [error]
  properties:
    error:
      type: object
      required: [code, message, type]
      properties:
        code:
          type: integer
          example: 404
        message:
          type: string
          example: "Connection not found"
        type:
          type: string
          enum: [invalid_request, authentication_error, rate_limit, api_error, provider_error]
        request_id:
          type: string
          format: uuid
```

### Provenance fields (include on all data objects):
- `provider` (string): e.g., "plaid", "mx", "finicity", "fdx"
- `provider_item_id` (string): provider's internal ID for the connection/item
- `provider_account_id` (string): provider's internal ID for the account
- `last_refreshed_at` (string, ISO 8601 datetime)
- `confidence` (number, 0.0–1.0): data quality/freshness score
- `sync_status` (string enum): "synced", "syncing", "stale", "error"

### Webhook payload schemas to define:
- `connection.created`, `connection.updated`, `connection.error`, `connection.removed`
- `transactions.sync_completed`, `transactions.new`, `transactions.updated`, `transactions.removed`
- `accounts.sync_completed`
- `holdings.sync_completed`
- `liabilities.sync_completed`

Output:
- Write to `docs/platform/openapi.yaml`.

Deliverable checklist:
- [x] API titled "Context Graph API" (NOT ClearMoney)
- [x] Multi-tenant: App schema and `/v1/apps` endpoints defined
- [x] User schema includes `app_id` scoping (implicit from API key)
- [x] All data endpoints present with correct HTTP methods
- [x] Security schemes defined (App API key, Admin API key, Bearer JWT)
- [x] Schemas defined for all resources (App, User, Consent, Connection, Institution, Account, Balance, Transaction, Holding, Security, Liability)
- [x] Cursor-based pagination defined with `next_cursor`, `has_more`
- [x] Error response schema defined with `type` enum
- [x] Webhook payload schemas defined for all event types
- [x] Provenance fields on all data objects
- [x] At least one example request/response per major endpoint
- [x] No "ClearMoney" references in the spec (use generic app examples like "app_acme")

Execution instructions:
- Create or overwrite `docs/platform/openapi.yaml`.
- Do not modify any other files.
- Use consistent schema names: App, Account, Transaction, Holding, Security, Liability, Institution, Connection, Consent, User, Balance.
- Use `$ref` for reusable schemas.
- Use generic example app names (e.g., "Acme Finance", "app_acme") — NOT ClearMoney.

Parallelization:
- Can run in parallel with Prompts 2–9.
- No dependencies on other prompts.

---

## Prompt 2 — Data Model + SQL Schema ✅ COMPLETED

> **Status:** Completed. See `docs/platform/schema.sql` and `docs/platform/data-model.md`.
>
> **Reference:** The OpenAPI spec is complete at `docs/platform/openapi.yaml`. Entity names and field names are aligned.

Role:
You are a data architect. Define a normalized PostgreSQL schema for a **multi-tenant** financial connectivity platform (the "Context Graph").

Scope:
- SQL schema (PostgreSQL 15+) + a human-readable data model doc.
- Do NOT implement application code.
- Design for **multi-tenancy**: apps are tenants, users are scoped to apps.

Requirements:

### Multi-tenancy model:
- `apps` table holds registered client applications (tenants)
- `users` are scoped to apps via `app_id` foreign key
- Unique constraint: `(app_id, external_user_id)` — same external ID can exist in different apps
- All queries should be scoped by app to ensure data isolation

### Tables to define:

| Table | Description | Key Fields |
|-------|-------------|------------|
| `apps` | **Registered client applications (tenants)** | `id` (UUID, PK), `name`, `webhook_url`, `created_at`, `updated_at`, `deleted_at` |
| `api_keys` | App API key management | `id`, `app_id` (FK to apps), `key_hash`, `key_prefix` (first 8 chars for identification), `name`, `last_used_at`, `created_at`, `revoked_at` |
| `users` | Platform users (apps' end-users) | `id` (UUID, PK), `app_id` (FK to apps), `external_user_id` (app's user ID), `created_at`, `updated_at`, `deleted_at`. **Unique constraint: (app_id, external_user_id)** |
| `consents` | User consent records with granular scopes | `id`, `user_id` (FK), `scopes` (JSONB array), `granted_at`, `revoked_at`, `expires_at`, `status` |
| `connections` | Links between users and institutions | `id`, `user_id` (FK), `institution_id` (FK), `provider`, `provider_item_id`, `status`, `error_code`, `last_synced_at`, `created_at`, `deleted_at` |
| `institutions` | Financial institutions master list (shared across apps) | `id`, `name`, `logo_url`, `primary_color`, `routing_numbers` (array), `supported_products` (JSONB), `providers` (JSONB: which providers support this FI) |
| `accounts` | Bank/investment/credit accounts | `id`, `connection_id` (FK), `provider_account_id`, `type`, `subtype`, `name`, `mask`, `currency`, `is_closed`, `created_at`, `updated_at` |
| `balances` | Point-in-time balance snapshots | `id`, `account_id` (FK), `current`, `available`, `limit`, `currency`, `as_of` (timestamp), `created_at` |
| `transactions` | Transaction records | `id`, `account_id` (FK), `provider_transaction_id`, `amount`, `currency`, `date`, `name`, `merchant_name`, `category` (array), `pending`, `created_at`, `updated_at` |
| `holdings` | Investment holdings | `id`, `account_id` (FK), `security_id` (FK), `quantity`, `cost_basis`, `value`, `currency`, `as_of`, `created_at`, `updated_at` |
| `securities` | Security master (stocks, funds, etc.) — shared across apps | `id`, `provider_security_id`, `ticker`, `name`, `type`, `cusip`, `isin`, `close_price`, `close_price_as_of` |
| `liabilities` | Loans, credit cards, mortgages | `id`, `account_id` (FK), `type`, `interest_rate_percentage`, `interest_rate_type`, `origination_date`, `next_payment_due_date`, `next_payment_amount`, `ytd_interest_paid` |
| `sync_jobs` | Background sync job tracking | `id`, `connection_id` (FK), `type` (full, incremental, refresh), `status` (pending, running, completed, failed), `started_at`, `completed_at`, `error_message`, `items_synced` |
| `webhook_events` | Inbound and outbound webhook log | `id`, `app_id` (FK, for outbound), `direction` (inbound, outbound), `event_type`, `payload` (JSONB), `status`, `attempts`, `last_attempt_at`, `created_at` |
| `decision_traces` | Context graph events | `id`, `user_id` (FK), `trace_id`, `parent_trace_id`, `event_type`, `input_data` (JSONB), `rules_applied` (JSONB), `result` (JSONB), `confidence`, `created_at` |

### Enum types to define:
```sql
CREATE TYPE connection_status AS ENUM ('pending', 'active', 'degraded', 'error', 'disconnected', 'revoked');
CREATE TYPE account_type AS ENUM ('checking', 'savings', 'money_market', 'cd', 'investment', 'brokerage', '401k', 'ira', 'credit', 'loan', 'mortgage', 'other');
CREATE TYPE sync_job_status AS ENUM ('pending', 'running', 'completed', 'failed', 'cancelled');
CREATE TYPE consent_status AS ENUM ('active', 'revoked', 'expired');
CREATE TYPE liability_type AS ENUM ('credit_card', 'student_loan', 'mortgage', 'auto_loan', 'personal_loan', 'heloc', 'other');
```

### Provenance fields (include on all data tables):
- `provider` (text): aggregator that sourced the data
- `provider_id` or `provider_*_id` (text): provider's internal identifier
- `last_refreshed_at` (timestamptz): when data was last fetched from provider
- `data_quality_score` (numeric 0.0–1.0, nullable): computed confidence

### Soft delete pattern:
- Include `deleted_at` (timestamptz, nullable) on: users, connections, accounts.
- Create partial indexes excluding deleted records: `WHERE deleted_at IS NULL`.

### Required indexes:
```sql
-- Multi-tenancy indexes
CREATE UNIQUE INDEX idx_users_app_external ON users(app_id, external_user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_app_id ON users(app_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_api_keys_app_id ON api_keys(app_id) WHERE revoked_at IS NULL;
CREATE INDEX idx_api_keys_key_prefix ON api_keys(key_prefix) WHERE revoked_at IS NULL;

-- Hot path queries
CREATE INDEX idx_connections_user_id ON connections(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_accounts_connection_id ON accounts(connection_id);
CREATE INDEX idx_transactions_account_id_date ON transactions(account_id, date DESC);
CREATE INDEX idx_transactions_date ON transactions(date DESC);
CREATE INDEX idx_holdings_account_id ON holdings(account_id);
CREATE INDEX idx_balances_account_id_as_of ON balances(account_id, as_of DESC);
CREATE INDEX idx_sync_jobs_connection_id_status ON sync_jobs(connection_id, status);
CREATE INDEX idx_decision_traces_user_id ON decision_traces(user_id);
CREATE INDEX idx_decision_traces_trace_id ON decision_traces(trace_id);
CREATE INDEX idx_webhook_events_app_id ON webhook_events(app_id, created_at DESC) WHERE direction = 'outbound';
```

### Audit columns:
All tables should include:
- `created_at` (timestamptz, default `now()`)
- `updated_at` (timestamptz, default `now()`, updated via trigger)

Output:
- `docs/platform/schema.sql` (DDL only, PostgreSQL 15+ syntax).
- `docs/platform/data-model.md` (entity descriptions, relationships, and cardinality in text + diagrams using Mermaid).

Deliverable checklist:
- [x] `apps` table defined as the tenant table
- [x] `users` table has `app_id` FK with unique constraint on `(app_id, external_user_id)`
- [x] All tables defined with appropriate column types
- [x] Primary keys (UUIDs) on all tables
- [x] Foreign keys with appropriate ON DELETE behavior (CASCADE vs RESTRICT)
- [x] Enum types defined
- [x] Multi-tenancy indexes (users by app, api_keys by app)
- [x] Indexes for all hot-path queries
- [x] Soft delete pattern implemented with partial indexes
- [x] Audit columns (created_at, updated_at) on all tables
- [x] `data-model.md` includes Mermaid ER diagram showing multi-tenant relationships
- [x] No "ClearMoney" references — use generic examples

Execution instructions:
- Create or overwrite `docs/platform/schema.sql`.
- Create or overwrite `docs/platform/data-model.md`.
- Do not modify any other files.
- **Reference `docs/platform/openapi.yaml` for entity names and field names** (Prompt 1 is complete).
- Include comments in SQL explaining design decisions.
- Document the multi-tenancy model clearly in `data-model.md`.

Parallelization:
- Can run in parallel with Prompts 3–9.
- **Dependency:** Reference the completed OpenAPI spec (`docs/platform/openapi.yaml`) for consistency.

---

## Prompt 3 — Provider Abstraction Interface ✅ COMPLETED

> **Status:** Completed. See `docs/platform/provider-interface.md` for the full interface design including TypeScript interfaces, normalization mappings, error handling, rate limiting, and observability patterns.

Role:
You are designing the internal provider abstraction layer for multi-provider routing.

Scope:
- Define interface methods, normalization contracts, and error handling.
- Do NOT implement code. This is a design document.

Requirements:

### Interface methods to define:

| Method | Input | Output | Description |
|--------|-------|--------|-------------|
| `createLinkToken(userId, options)` | `userId: string`, `options: { products: string[], institutionId?: string, redirectUri: string }` | `{ linkToken: string, expiration: ISO8601 }` | Create a one-time-use token for client SDK initialization |
| `exchangeToken(publicToken, userId)` | `publicToken: string`, `userId: string` | `{ connectionId: string, accounts: Account[] }` | Exchange client-provided token for persistent connection |
| `syncAccounts(connectionId)` | `connectionId: string` | `{ accounts: NormalizedAccount[], syncedAt: ISO8601 }` | Fetch all accounts for a connection |
| `syncBalances(connectionId)` | `connectionId: string` | `{ balances: NormalizedBalance[], syncedAt: ISO8601 }` | Fetch current balances for all accounts |
| `syncTransactions(connectionId, options)` | `connectionId: string`, `options: { startDate?: ISO8601, endDate?: ISO8601, cursor?: string }` | `{ added: Transaction[], modified: Transaction[], removed: string[], nextCursor?: string }` | Incremental transaction sync |
| `syncHoldings(connectionId)` | `connectionId: string` | `{ holdings: NormalizedHolding[], securities: NormalizedSecurity[], syncedAt: ISO8601 }` | Fetch investment holdings |
| `syncLiabilities(connectionId)` | `connectionId: string` | `{ liabilities: NormalizedLiability[], syncedAt: ISO8601 }` | Fetch loan/credit liabilities |
| `verifyWebhook(headers, body)` | `headers: Record<string, string>`, `body: string` | `{ valid: boolean, eventType?: string, payload?: object }` | Verify inbound webhook signature |
| `refreshItem(connectionId)` | `connectionId: string` | `{ status: 'refreshing' \| 'complete', estimatedCompletion?: ISO8601 }` | Trigger manual refresh |
| `getItemStatus(connectionId)` | `connectionId: string` | `{ status: ConnectionStatus, lastSyncedAt: ISO8601, errorCode?: string }` | Check connection health |

### Normalization mapping tables:

Define field-by-field mapping from each provider's format to the platform's canonical format:

**Accounts normalization:**
| Platform Field | Plaid | MX | Finicity | FDX |
|----------------|-------|----|---------|----|
| `id` | Generated UUID | Generated UUID | Generated UUID | Generated UUID |
| `provider_account_id` | `account_id` | `guid` | `id` | `accountId` |
| `type` | `type` (lowercase) | `account_type` (mapped) | `type` (mapped) | `accountType` (mapped) |
| `subtype` | `subtype` | `account_subtype` | `accountType` | `accountSubType` |
| `name` | `name` | `name` | `name` | `displayName` |
| `mask` | `mask` | `account_number` (last 4) | `accountNumber` (last 4) | `maskedAccountNumber` |
| `currency` | `iso_currency_code` or `unofficial_currency_code` | `currency_code` | `currency` | `currencyCode` |

**Transactions normalization:**
| Platform Field | Plaid | MX | Finicity | FDX |
|----------------|-------|----|---------|----|
| `id` | Generated UUID | Generated UUID | Generated UUID | Generated UUID |
| `provider_transaction_id` | `transaction_id` | `guid` | `id` | `transactionId` |
| `amount` | `amount` (negate for debits) | `amount` | `amount` | `amount` (check sign convention) |
| `date` | `date` | `transacted_at` (parse) | `postedDate` | `postedTimestamp` (parse) |
| `name` | `name` | `description` | `description` | `description` |
| `merchant_name` | `merchant_name` | `merchant.name` | `merchant.name` | `merchant.name` |
| `category` | `category` | `category` (mapped) | `category` (mapped) | `category` (mapped) |
| `pending` | `pending` | `status == 'pending'` | `status == 'pending'` | `status == 'PENDING'` |

(Include similar tables for Holdings, Securities, Liabilities)

### Error mapping table:

| Provider Error | Platform Error Code | Platform Error Type | Retry? |
|----------------|--------------------|--------------------|--------|
| Plaid `ITEM_LOGIN_REQUIRED` | `REAUTHENTICATION_REQUIRED` | `provider_error` | No (user action needed) |
| Plaid `INSTITUTION_NOT_RESPONDING` | `PROVIDER_UNAVAILABLE` | `provider_error` | Yes (exponential backoff) |
| Plaid `RATE_LIMIT_EXCEEDED` | `RATE_LIMITED` | `rate_limit` | Yes (respect Retry-After) |
| MX `401 Unauthorized` | `INVALID_CREDENTIALS` | `authentication_error` | No |
| MX `503 Service Unavailable` | `PROVIDER_UNAVAILABLE` | `provider_error` | Yes |
| Finicity `timeout` | `PROVIDER_TIMEOUT` | `provider_error` | Yes (3 attempts max) |
| FDX `403 Consent Expired` | `CONSENT_EXPIRED` | `provider_error` | No (user action needed) |
| Any unknown error | `UNKNOWN_PROVIDER_ERROR` | `api_error` | Yes (1 attempt) |

### Rate limiting:
- Track per-provider rate limits in memory or Redis.
- Implement token bucket algorithm with provider-specific limits.
- Respect provider's `Retry-After` headers.
- Default limits if unknown: 100 req/min per connection.

### Circuit breaker pattern:
- Track failure rate per provider over 5-minute windows.
- Open circuit after 50% failure rate with 10+ requests.
- Half-open after 30 seconds; close after 3 consecutive successes.
- When circuit is open, fail fast with `PROVIDER_UNAVAILABLE`.

### Timeouts:
| Operation | Timeout | Notes |
|-----------|---------|-------|
| `createLinkToken` | 10s | Fast, token generation only |
| `exchangeToken` | 30s | May involve credential verification |
| `syncAccounts` | 30s | Usually fast |
| `syncTransactions` | 120s | Can be slow for large histories |
| `syncHoldings` | 60s | Moderate |
| `syncLiabilities` | 60s | Moderate |
| `refreshItem` | 5s | Just triggers async refresh |

### Observability hooks:
- Emit metrics on every provider call:
  - `provider_request_duration_seconds{provider, method, status}`
  - `provider_request_total{provider, method, status_code}`
  - `provider_circuit_breaker_state{provider, state}`
- Log structured events: `{ provider, method, connectionId, durationMs, statusCode, errorCode }`.
- Trace ID propagation for distributed tracing.

Output:
- `docs/platform/provider-interface.md`.

Deliverable checklist:
- [ ] All interface methods defined with TypeScript-style signatures
- [ ] Normalization mapping tables for Accounts, Transactions, Holdings, Liabilities
- [ ] Error mapping table with retry guidance
- [ ] Rate limiting strategy documented
- [ ] Circuit breaker rules documented
- [ ] Timeout values per operation
- [ ] Observability metrics and logging defined

Execution instructions:
- Create or overwrite `docs/platform/provider-interface.md`.
- Do not modify any other files.
- Keep terminology consistent with Prompt 1/2 schemas.
- Use code blocks for type definitions.

Parallelization:
- Can run in parallel with Prompts 1, 2, 4–9.
- No hard dependencies.

---

## Prompt 4 — Provider Routing Strategy ✅ COMPLETED

> **Status:** Completed. See `docs/platform/provider-routing.md` for the full routing strategy including provider hierarchy, health scoring, failover logic, and observability.

Role:
You are the reliability engineer for a multi-provider system.

Scope:
- Routing rules, provider precedence, fallback logic, and observability.

Requirements:

### Provider hierarchy (default precedence):
1. **FDX (Direct API)** — Preferred when institution supports it. Highest data quality, real-time, no intermediary.
2. **Primary Aggregator (Plaid)** — Broadest coverage, good reliability.
3. **Secondary Aggregator (MX)** — Better for certain credit unions, alternative routing.
4. **Tertiary Aggregator (Finicity)** — Fallback for edge cases, required by some lenders.

### Routing decision algorithm:

```
function selectProvider(institutionId, dataTypes, userContext):
  1. Get institution's provider support list
  2. Filter by dataTypes required (not all providers support all data)
  3. Apply institution-level overrides (see below)
  4. Score remaining providers by health
  5. Select highest-scoring available provider
  6. If selected provider fails, retry with next in list
```

### Institution-level routing overrides:

| Institution Pattern | Override Rule | Reason |
|--------------------|---------------|--------|
| `fidelity*` | Prefer Finicity | Better 401(k) data extraction |
| `chase*` | Prefer Plaid | Most stable connection |
| `*credit_union*` | Prefer MX | Better CU coverage |
| FDX-enabled | Always try FDX first | Direct API, best quality |
| `vanguard*` | Prefer direct (FDX) → Plaid | FDX supported, Plaid fallback |

Store overrides in a configuration table: `institution_routing_overrides (institution_pattern, provider_order JSONB, reason, created_at, updated_at)`.

### Provider health scoring model:

Calculate a health score (0–100) per provider, updated every minute:

```
healthScore = (
  0.4 * successRate +        // % of requests returning 2xx in last 15 min
  0.3 * latencyScore +       // Inverse of p95 latency (100 if <500ms, 0 if >5s)
  0.2 * freshnessScore +     // % of connections synced in last 24h
  0.1 * errorDiversityScore  // Penalty for multiple distinct error types
)
```

Thresholds:
- **Healthy (80–100)**: Normal routing
- **Degraded (50–79)**: Log warnings, consider alternatives
- **Unhealthy (<50)**: Skip provider unless only option

### Failover and retry policy:

| Scenario | Action |
|----------|--------|
| Provider returns 5xx | Retry once after 1s, then failover to next provider |
| Provider returns 429 | Respect `Retry-After`, failover if >60s wait |
| Provider returns 4xx (auth) | No retry, return error to app (user action needed) |
| Provider timeout | Failover immediately to next provider |
| All providers fail | Return `PROVIDER_UNAVAILABLE` with last error details |

Max retry attempts across all providers: 3 total.

### Data type routing:
Some providers have better support for specific data types:

| Data Type | Primary | Secondary | Notes |
|-----------|---------|-----------|-------|
| Transactions | Plaid | MX | Both reliable |
| Holdings | Finicity | Plaid | Finicity better for retirement accounts |
| Liabilities | Plaid | MX | Plaid more complete |
| Identity | Plaid | — | Only Plaid supported initially |

### Routing decision logging:

Log every routing decision for debugging and analytics:

```json
{
  "event": "provider_routing_decision",
  "timestamp": "2026-01-24T10:30:00Z",
  "connection_id": "conn_abc123",
  "institution_id": "ins_fidelity",
  "data_types": ["accounts", "holdings"],
  "candidates": [
    { "provider": "fdx", "health": 92, "supported": false },
    { "provider": "finicity", "health": 88, "supported": true },
    { "provider": "plaid", "health": 95, "supported": true }
  ],
  "selected": "finicity",
  "reason": "institution_override",
  "fallback_chain": ["plaid"]
}
```

### Exposing routing to apps:

Apps can query routing decisions via:
- `GET /v1/connections/{id}/routing-info` — Returns selected provider, health, fallback chain.
- Include `x-provider` header in API responses for transparency.
- Webhook events include `provider` field.

### Configuration management:

Routing rules should be:
- Stored in database, not hardcoded
- Editable via admin API (with audit logging)
- Cached in memory with 5-minute TTL
- Support for gradual rollout (% traffic to new provider)

Output:
- `docs/platform/provider-routing.md`.

Deliverable checklist:
- [ ] Provider hierarchy with clear precedence
- [ ] Routing decision algorithm (pseudocode)
- [ ] Institution-level override table with examples
- [ ] Health scoring formula with thresholds
- [ ] Failover policy table
- [ ] Data type routing matrix
- [ ] Routing decision log schema
- [ ] App-facing routing visibility (endpoint + headers)

Execution instructions:
- Create or overwrite `docs/platform/provider-routing.md`.
- Do not modify any other files.
- Use generic provider names (Provider A/B/C) OR real names (Plaid/MX/Finicity) consistently throughout.

Parallelization:
- Can run in parallel with Prompts 1–3 and 5–9.
- No dependencies.

---

## Prompt 5 — Consent Ledger + Token Vault ✅ COMPLETED

> **Status:** Completed. See `docs/platform/consent-and-vault.md` for the full consent management and token vault design including scope model, consent lifecycle, data deletion flow, encryption, and audit logging.

Role:
You are a security/privacy architect designing for a **multi-tenant** financial data platform.

Scope:
- Design consent ledger, token vault, audit controls, and data lifecycle.
- Ensure all designs support **multi-tenancy** (consents and tokens are scoped per app).

Requirements:

### Granular scope model:

Define hierarchical scopes that users can grant or revoke independently:

| Scope | Description | Includes |
|-------|-------------|----------|
| `accounts:read` | View account names, types, masks | Account list only |
| `balances:read` | View current/available balances | Requires `accounts:read` |
| `transactions:read` | View transaction history | Requires `accounts:read` |
| `transactions:read:90d` | Limited to last 90 days | Subset of `transactions:read` |
| `investments:read` | View holdings, securities, cost basis | Requires `accounts:read` |
| `liabilities:read` | View loan details, rates, payments | Requires `accounts:read` |
| `identity:read` | View name, email, phone, address | Separate from account data |

Scope inheritance: `investments:read` implies `accounts:read` access for investment accounts only.

### Consent ledger schema:

Note: Consents are implicitly scoped to apps via the `user_id` FK (users belong to apps). The `app_id` is denormalized for query efficiency.

```sql
CREATE TABLE consent_records (
  id UUID PRIMARY KEY,
  app_id UUID NOT NULL REFERENCES apps(id),  -- Denormalized for efficient queries
  user_id UUID NOT NULL REFERENCES users(id),
  connection_id UUID REFERENCES connections(id),  -- NULL for pre-connection consent
  scopes TEXT[] NOT NULL,  -- Array of granted scopes
  purpose TEXT NOT NULL,   -- Human-readable purpose ("Personal finance tracking")
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,  -- NULL = no expiration
  revoked_at TIMESTAMPTZ,
  revocation_reason TEXT,
  ip_address INET,
  user_agent TEXT,
  consent_version INTEGER NOT NULL DEFAULT 1,  -- For terms versioning
  CONSTRAINT valid_scopes CHECK (scopes <@ ARRAY['accounts:read', 'balances:read', ...])
);

-- Index for app-scoped queries
CREATE INDEX idx_consent_app_user ON consent_records(app_id, user_id)
  WHERE revoked_at IS NULL AND (expires_at IS NULL OR expires_at > now());
```

### Consent lifecycle:

1. **Grant**: User approves scopes in link flow → create `consent_records` entry
2. **Query**: App checks `GET /v1/users/{id}/consents` before accessing data
3. **Narrow**: User can reduce scopes via `PATCH /v1/consents/{id}` (never expand without re-auth)
4. **Revoke**: User revokes via `DELETE /v1/consents/{id}` → triggers data deletion flow
5. **Expire**: Background job marks expired consents, notifies app

### Revocation + data deletion flow:

When consent is revoked:

1. Mark `consent_records.revoked_at = now()`
2. Enqueue `DataDeletionJob(connection_id, scopes_revoked)`
3. Delete data based on revoked scopes:
   - `transactions:read` revoked → delete all transactions for connection
   - `investments:read` revoked → delete holdings, keep account shells
   - Full revocation → delete all data, revoke provider tokens
4. Log deletion in audit trail
5. Send webhook to app: `consent.revoked`
6. Notify provider to revoke access (if FDX, call revocation endpoint)

Data deletion timeline: Complete within 24 hours of revocation request.

### Token vault design:

Store provider access/refresh tokens securely.

**Architecture:**
- Tokens encrypted at rest using AES-256-GCM
- Encryption keys stored in AWS KMS (or HashiCorp Vault)
- Token vault is a separate table with restricted access

```sql
CREATE TABLE token_vault (
  id UUID PRIMARY KEY,
  connection_id UUID NOT NULL REFERENCES connections(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  access_token_encrypted BYTEA NOT NULL,
  refresh_token_encrypted BYTEA,
  access_token_expires_at TIMESTAMPTZ,
  key_id TEXT NOT NULL,  -- KMS key ID used for encryption
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- No indexes on encrypted columns
-- Restrict SELECT to token-service role only
REVOKE SELECT ON token_vault FROM public;
GRANT SELECT ON token_vault TO token_service_role;
```

**Key rotation:**
- Rotate KMS keys every 90 days
- Re-encrypt tokens on next refresh after key rotation
- Old keys remain valid for decryption (never delete)

**Access controls:**
- Only the `TokenService` microservice can read/write token vault
- API servers never see raw tokens—TokenService proxies provider calls
- All token access logged with request ID, caller service, purpose

### Encryption specification:

| Data Type | Encryption | Key Management |
|-----------|------------|----------------|
| Provider tokens | AES-256-GCM | AWS KMS (per-environment keys) |
| Consent records | Not encrypted (not sensitive) | — |
| Transaction data | Encrypted at rest (database-level TDE) | AWS RDS encryption |
| PII (name, email) | Column-level encryption (optional) | Application-managed keys |

### Audit log schema:

```sql
CREATE TABLE consent_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id UUID NOT NULL REFERENCES apps(id),  -- For multi-tenant queries
  event_type TEXT NOT NULL,  -- 'consent_granted', 'consent_revoked', 'scope_narrowed', 'token_accessed', 'data_deleted'
  user_id UUID,
  connection_id UUID,
  consent_id UUID,
  actor_type TEXT NOT NULL,  -- 'user', 'system', 'admin', 'app'
  actor_id TEXT,
  scopes_affected TEXT[],
  metadata JSONB,  -- Additional context
  ip_address INET,
  user_agent TEXT,
  request_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_app_id ON consent_audit_log(app_id, created_at DESC);
CREATE INDEX idx_audit_user_id ON consent_audit_log(user_id, created_at DESC);
CREATE INDEX idx_audit_connection_id ON consent_audit_log(connection_id, created_at DESC);
```

**Retention policy:**
- Audit logs retained for 7 years (regulatory requirement)
- After 1 year, move to cold storage (S3 Glacier)
- Never delete audit logs unless legally required

### API endpoints for consent management:

| Endpoint | Description |
|----------|-------------|
| `GET /v1/users/{user_id}/consents` | List active consents with scopes |
| `GET /v1/consents/{consent_id}` | Get consent details |
| `PATCH /v1/consents/{consent_id}` | Narrow scopes (body: `{ "scopes": [...] }`) |
| `DELETE /v1/consents/{consent_id}` | Revoke consent, trigger data deletion |
| `GET /v1/users/{user_id}/consents/audit` | View consent change history |

Output:
- `docs/platform/consent-and-vault.md`.

Deliverable checklist:
- [ ] Scope model with hierarchy and examples
- [ ] Consent ledger schema with all fields
- [ ] Consent lifecycle (grant → revoke) documented
- [ ] Data deletion flow with timeline
- [ ] Token vault schema with encryption details
- [ ] Key rotation strategy
- [ ] Access control model (who can access what)
- [ ] Audit log schema with retention policy
- [ ] API endpoints for consent management

Execution instructions:
- Create or overwrite `docs/platform/consent-and-vault.md`.
- Do not modify any other files.
- Include SQL for schema definitions.
- Specify encryption algorithms and key management approach.

Parallelization:
- Can run in parallel with Prompts 1–4 and 6–9.
- No dependencies.

---

## Prompt 6 — Context Graph / Decision Trace Model ✅ COMPLETED

> **Status:** Completed. See `docs/platform/context-graph-events.md` for the full decision trace model including event types, schemas, causal linking, replay semantics, and query patterns.

Role:
You are a product + data engineer designing the "decision trace" model for explainable financial recommendations in a **multi-tenant** platform.

Scope:
- Define the event model, lifecycle, storage, and query patterns.
- Ensure all events are **scoped per app** (apps are tenants, users belong to apps).

Requirements:

### Event types and their purposes:

| Event Type | When Emitted | Purpose |
|------------|--------------|---------|
| `recommendation.created` | System generates a new recommendation | Record inputs, rules, and reasoning |
| `recommendation.viewed` | User sees recommendation in UI | Track engagement |
| `recommendation.accepted` | User clicks "Do this" or similar | Track conversion |
| `recommendation.dismissed` | User dismisses/ignores | Track rejection for learning |
| `recommendation.snoozed` | User defers to later | Track deferral |
| `action.started` | User begins acting on recommendation | Track follow-through |
| `action.completed` | User completes the action | Track completion |
| `action.abandoned` | User abandons mid-action | Track drop-off |
| `outcome.measured` | System measures result (e.g., 30 days later) | Track actual impact |
| `context.snapshot` | Periodic capture of user's financial state | Enable replay |

### Event schema (base fields for all events):

```typescript
interface DecisionTraceEvent {
  // Identity
  id: string;                    // UUID
  trace_id: string;              // Groups related events (e.g., same recommendation)
  parent_event_id?: string;      // Causal link to triggering event

  // Classification
  event_type: string;            // From enum above
  event_version: string;         // Schema version, e.g., "1.2.0"

  // Multi-tenancy context
  app_id: string;                // The app (tenant) this event belongs to
  user_id: string;               // User within the app
  recommendation_id?: string;    // Links to specific recommendation

  // Timing
  timestamp: string;             // ISO 8601

  // Event-specific payload
  payload: EventPayload;         // Varies by event_type
}
```

Note: `app_id` is required on all events to ensure proper data isolation. Users are scoped to apps, and all queries must be filtered by `app_id`.

### Required fields in `recommendation.created` payload:

```typescript
interface RecommendationCreatedPayload {
  // What was recommended
  recommendation_type: string;   // e.g., "emergency_fund_gap", "debt_payoff", "roth_vs_traditional"
  title: string;                 // Human-readable title
  description: string;           // Explanation shown to user

  // Inputs used
  input_set: {
    accounts_snapshot: AccountSnapshot[];   // Balances at decision time
    income: number;
    expenses: number;
    goals: Goal[];
    risk_tolerance: string;
    tax_bracket?: number;
    // ... other relevant inputs
  };

  // Rules/logic applied
  rules_applied: {
    rule_id: string;             // e.g., "emergency_fund_3_months"
    rule_version: string;
    parameters: Record<string, any>;
    condition_results: { condition: string; passed: boolean }[];
  }[];

  // Assumptions made
  assumptions: {
    key: string;                 // e.g., "inflation_rate"
    value: any;                  // e.g., 0.03
    source: string;              // "user_input" | "default" | "calculated"
  }[];

  // Result
  result: {
    action: string;              // What user should do
    projected_impact: {
      metric: string;            // e.g., "net_worth_1yr"
      current: number;
      projected: number;
      delta: number;
    }[];
    confidence: number;          // 0.0 - 1.0
    priority: "high" | "medium" | "low";
  };

  // Provenance
  provenance: {
    data_freshness: {
      source: string;            // e.g., "plaid_connection_abc"
      last_synced_at: string;
    }[];
    model_version?: string;      // If ML model used
  };
}
```

### Causal linking:

Events form a directed acyclic graph (DAG):

```
context.snapshot ──┐
                   ├──► recommendation.created ──► recommendation.viewed ──► recommendation.accepted
context.snapshot ──┘                                                                │
                                                                                    ▼
                                                              action.started ──► action.completed
                                                                                    │
                                                                                    ▼
                                                                            outcome.measured
```

Use `trace_id` to group all events for one recommendation. Use `parent_event_id` for direct causation.

### Replay semantics:

To reproduce a decision, store enough to re-run the logic:

1. **Snapshot the input state** — All account balances, user profile, goals at decision time
2. **Record rule versions** — Exact rule IDs and versions used
3. **Record assumptions** — All defaults and calculated values
4. **Store random seeds** — If any stochastic elements (e.g., Monte Carlo)

Replay test: `replay(recommendation.created.input_set, recommendation.created.rules_applied) == recommendation.created.result` should always pass.

### Sample payloads:

**1. Emergency Fund Gap:**

```json
{
  "id": "evt_001",
  "trace_id": "trace_efund_001",
  "event_type": "recommendation.created",
  "event_version": "1.0.0",
  "app_id": "app_acme",
  "user_id": "user_sarah_123",
  "timestamp": "2026-01-24T10:00:00Z",
  "payload": {
    "recommendation_type": "emergency_fund_gap",
    "title": "Build your emergency fund",
    "description": "You're at 1.7 months of expenses. We recommend building to 3 months.",
    "input_set": {
      "accounts_snapshot": [
        { "id": "acc_chase_savings", "name": "Chase Savings", "balance": 8500 }
      ],
      "monthly_expenses": 5000,
      "goals": [{ "type": "emergency_fund", "target_months": 3 }]
    },
    "rules_applied": [
      {
        "rule_id": "emergency_fund_3_months",
        "rule_version": "1.0",
        "parameters": { "target_months": 3 },
        "condition_results": [
          { "condition": "current_months < target_months", "passed": true }
        ]
      }
    ],
    "assumptions": [
      { "key": "monthly_expenses", "value": 5000, "source": "calculated_from_transactions" }
    ],
    "result": {
      "action": "Save an additional $6,500 to reach 3 months of expenses",
      "projected_impact": [
        { "metric": "emergency_fund_months", "current": 1.7, "projected": 3.0, "delta": 1.3 }
      ],
      "confidence": 0.92,
      "priority": "high"
    },
    "provenance": {
      "data_freshness": [
        { "source": "chase_connection", "last_synced_at": "2026-01-24T09:55:00Z" }
      ]
    }
  }
}
```

**2. High-Interest Debt Payoff:**

```json
{
  "id": "evt_002",
  "trace_id": "trace_debt_001",
  "event_type": "recommendation.created",
  "event_version": "1.0.0",
  "app_id": "app_acme",
  "user_id": "user_sarah_123",
  "timestamp": "2026-01-24T10:01:00Z",
  "payload": {
    "recommendation_type": "high_interest_debt_payoff",
    "title": "Pay off high-interest credit card",
    "description": "Your Amex card at 22% APR costs you $110/month in interest.",
    "input_set": {
      "accounts_snapshot": [
        { "id": "acc_amex_cc", "name": "Amex Gold", "balance": -6000, "interest_rate": 0.22 },
        { "id": "acc_chase_savings", "name": "Chase Savings", "balance": 8500 }
      ],
      "monthly_income": 12500
    },
    "rules_applied": [
      {
        "rule_id": "high_interest_debt_priority",
        "rule_version": "1.1",
        "parameters": { "threshold_apr": 0.10 },
        "condition_results": [
          { "condition": "debt_apr > threshold_apr", "passed": true },
          { "condition": "has_liquid_savings", "passed": true }
        ]
      }
    ],
    "assumptions": [
      { "key": "interest_rate_annual", "value": 0.22, "source": "provider_data" },
      { "key": "minimum_payment", "value": 150, "source": "calculated" }
    ],
    "result": {
      "action": "Pay off $6,000 Amex balance to eliminate $1,320/year in interest",
      "projected_impact": [
        { "metric": "annual_interest_paid", "current": 1320, "projected": 0, "delta": -1320 },
        { "metric": "net_worth_1yr", "current": 2500, "projected": 3820, "delta": 1320 }
      ],
      "confidence": 0.95,
      "priority": "high"
    },
    "provenance": {
      "data_freshness": [
        { "source": "amex_connection", "last_synced_at": "2026-01-24T09:50:00Z" }
      ]
    }
  }
}
```

**3. Roth vs Traditional:**

```json
{
  "id": "evt_003",
  "trace_id": "trace_roth_001",
  "event_type": "recommendation.created",
  "event_version": "1.0.0",
  "app_id": "app_acme",
  "user_id": "user_sarah_123",
  "timestamp": "2026-01-24T10:02:00Z",
  "payload": {
    "recommendation_type": "roth_vs_traditional",
    "title": "Consider Roth 401(k) contributions",
    "description": "At your income level and expected retirement tax bracket, Roth may save $47K over 30 years.",
    "input_set": {
      "income": 150000,
      "current_401k_type": "traditional",
      "current_contribution": 15600,
      "age": 32,
      "retirement_age": 62,
      "state": "CA",
      "filing_status": "single"
    },
    "rules_applied": [
      {
        "rule_id": "roth_vs_traditional_optimizer",
        "rule_version": "2.0",
        "parameters": {
          "growth_rate": 0.07,
          "inflation_rate": 0.03,
          "current_tax_bracket": 0.32,
          "projected_retirement_bracket": 0.24
        },
        "condition_results": [
          { "condition": "roth_npv > traditional_npv", "passed": true }
        ]
      }
    ],
    "assumptions": [
      { "key": "growth_rate", "value": 0.07, "source": "default" },
      { "key": "inflation_rate", "value": 0.03, "source": "default" },
      { "key": "retirement_spending", "value": 80000, "source": "user_input" },
      { "key": "retirement_tax_bracket", "value": 0.24, "source": "calculated" }
    ],
    "result": {
      "action": "Switch 401(k) contributions from Traditional to Roth",
      "projected_impact": [
        { "metric": "lifetime_tax_savings", "current": 0, "projected": 47000, "delta": 47000 },
        { "metric": "retirement_after_tax_value", "current": 1200000, "projected": 1247000, "delta": 47000 }
      ],
      "confidence": 0.78,
      "priority": "medium"
    },
    "provenance": {
      "data_freshness": [
        { "source": "fidelity_connection", "last_synced_at": "2026-01-24T09:45:00Z" }
      ],
      "model_version": "roth_optimizer_v2.0"
    }
  }
}
```

### Schema versioning strategy:

- Use semantic versioning: `MAJOR.MINOR.PATCH`
- `MAJOR`: Breaking changes (field removal, type changes)
- `MINOR`: Additive changes (new optional fields)
- `PATCH`: Bug fixes, documentation
- Store `event_version` on every event
- Maintain backward-compatible readers for last 3 major versions
- Publish schema changelog in `docs/platform/event-schema-changelog.md`

### Query patterns to support:

1. **Trace reconstruction**: Get all events for a `trace_id`, ordered by timestamp
2. **User history**: Get all recommendations for a user, with outcome status
3. **Conversion funnel**: Count events by type for funnel analysis
4. **Rule effectiveness**: Join `recommendation.created` with `outcome.measured` by `trace_id`

Indexes needed:
- `(trace_id, timestamp)`
- `(user_id, event_type, timestamp DESC)`
- `(recommendation_type, timestamp)` for analytics

Output:
- `docs/platform/context-graph-events.md`.

Deliverable checklist:
- [ ] Event type enum with descriptions
- [ ] Base event schema (TypeScript interface)
- [ ] Full `recommendation.created` payload schema
- [ ] Causal linking explanation with diagram
- [ ] Replay semantics requirements
- [ ] 3 complete sample payloads (emergency fund, debt, Roth vs Traditional)
- [ ] Schema versioning strategy
- [ ] Query patterns with suggested indexes

Execution instructions:
- Create or overwrite `docs/platform/context-graph-events.md`.
- Do not modify any other files.
- Use TypeScript interfaces for schema definitions.
- Include Mermaid diagram for event flow.

Parallelization:
- Can run in parallel with Prompts 1–5 and 7–9.
- No dependencies.

---

## Prompt 7 — Sync + Freshness Spec ✅ COMPLETED

> **Status:** Completed. See `docs/platform/sync-and-freshness.md` for the full sync cadence, freshness scoring, confidence model, and job lifecycle specification.

Role:
You are designing the data freshness and sync system for real-time financial data.

Scope:
- Write a spec for sync cadence, freshness scoring, and data quality.

Requirements:

### Sync cadence by data type:

| Data Type | Default Cadence | Rationale |
|-----------|----------------|-----------|
| Balances | Every 4 hours | Changes frequently, impacts recommendations |
| Transactions | Daily at 6 AM user's timezone | New transactions appear overnight |
| Holdings | Daily at 7 AM user's timezone | Market close + settlement |
| Liabilities | Weekly (Sundays) | Changes infrequently |
| Account metadata | On connection, then weekly | Rarely changes |
| Institution status | Every 15 minutes (platform-wide) | Detect outages quickly |

### On-demand refresh flow:

1. User/app triggers `POST /v1/connections/{id}/refresh`
2. System enqueues `SyncJob` with `type: 'on_demand'`
3. Return `202 Accepted` with `{ job_id, estimated_completion }`
4. Process job (may take 10–60 seconds)
5. Send webhook `sync.completed` when done
6. App can poll `GET /v1/sync-jobs/{job_id}` for status

Rate limit: Max 10 on-demand refreshes per connection per hour.

### Sync job states and transitions:

```
                    ┌─────────────┐
                    │   PENDING   │
                    └──────┬──────┘
                           │ worker picks up
                           ▼
                    ┌─────────────┐
         ┌─────────│   RUNNING   │─────────┐
         │         └──────┬──────┘         │
         │ timeout        │ success        │ provider error
         ▼                ▼                ▼
  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
  │   TIMEOUT   │  │  COMPLETED  │  │   FAILED    │
  └─────────────┘  └─────────────┘  └──────┬──────┘
                                          │ retry?
                                          ▼
                                   ┌─────────────┐
                                   │   RETRYING  │──► RUNNING
                                   └─────────────┘
```

### Backoff and retry rules:

| Failure Type | Max Retries | Backoff Strategy | Notes |
|--------------|-------------|------------------|-------|
| Network timeout | 3 | Exponential (1s, 2s, 4s) | Then mark FAILED |
| Provider 5xx | 3 | Exponential (5s, 10s, 20s) | Respect Retry-After |
| Provider 429 | 2 | Use Retry-After header | Min 60s wait |
| Provider 4xx (auth) | 0 | No retry | Mark connection as `needs_reauth` |
| Parsing error | 1 | Immediate | Log for investigation |

### Staleness thresholds per data type:

| Data Type | Fresh | Stale | Expired |
|-----------|-------|-------|---------|
| Balances | < 4 hours | 4–24 hours | > 24 hours |
| Transactions | < 24 hours | 1–3 days | > 3 days |
| Holdings | < 24 hours | 1–3 days | > 3 days |
| Liabilities | < 7 days | 7–14 days | > 14 days |

States:
- **Fresh**: Data is current, high confidence
- **Stale**: Data may be outdated, show warning in UI
- **Expired**: Data is unreliable, block certain recommendations

### Confidence score formula:

Calculate per-connection and per-account:

```
confidence = (
  0.40 * freshness_score +       // Based on last_synced_at vs staleness thresholds
  0.30 * coverage_score +        // % of requested data types successfully synced
  0.20 * provider_health_score + // Current provider reliability
  0.10 * consistency_score       // No anomalies detected (e.g., missing transactions)
)
```

**Freshness score:**
```
if data_age < fresh_threshold: 1.0
elif data_age < stale_threshold: 0.7 - (0.2 * (data_age - fresh) / (stale - fresh))
elif data_age < expired_threshold: 0.5 - (0.3 * (data_age - stale) / (expired - stale))
else: 0.2
```

**Coverage score:**
```
coverage = synced_data_types / requested_data_types
// e.g., user consented to balances + transactions, both synced = 1.0
// e.g., user consented to balances + transactions + holdings, only 2 synced = 0.67
```

### API exposure:

**Connection-level freshness:**
```json
GET /v1/connections/{id}

{
  "id": "conn_123",
  "status": "active",
  "sync_status": {
    "overall": "fresh",
    "last_synced_at": "2026-01-24T10:00:00Z",
    "confidence": 0.92,
    "by_data_type": {
      "balances": { "status": "fresh", "last_synced_at": "2026-01-24T10:00:00Z" },
      "transactions": { "status": "fresh", "last_synced_at": "2026-01-24T06:00:00Z" },
      "holdings": { "status": "stale", "last_synced_at": "2026-01-22T07:00:00Z" }
    }
  }
}
```

**Account-level freshness:**
```json
GET /v1/accounts/{id}

{
  "id": "acc_456",
  "balance": { "current": 8500, "available": 8200 },
  "data_quality": {
    "freshness": "fresh",
    "last_updated_at": "2026-01-24T10:00:00Z",
    "confidence": 0.95
  }
}
```

**Platform coverage endpoint:**
```json
GET /v1/coverage

{
  "institutions_covered": 12000,
  "providers": {
    "plaid": { "status": "healthy", "latency_p95_ms": 450 },
    "mx": { "status": "degraded", "latency_p95_ms": 1200 },
    "finicity": { "status": "healthy", "latency_p95_ms": 600 }
  },
  "overall_sync_success_rate_24h": 0.97
}
```

### UI exposure:

Display freshness indicators in the UI:

| Freshness | Badge | Color | Tooltip |
|-----------|-------|-------|---------|
| Fresh | ✓ Live | Green | "Updated 10 minutes ago" |
| Stale | ⚠ Updating... | Yellow | "Last updated 2 days ago. Refreshing..." |
| Expired | ⚠ Outdated | Red | "Data is 5 days old. Please reconnect." |
| Error | ✕ Error | Red | "Connection issue. Please reconnect." |

### Sync job record schema:

```sql
CREATE TABLE sync_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID NOT NULL REFERENCES connections(id),
  type TEXT NOT NULL,  -- 'scheduled', 'on_demand', 'webhook_triggered'
  data_types TEXT[] NOT NULL,  -- ['balances', 'transactions', ...]
  status TEXT NOT NULL DEFAULT 'pending',
  priority INTEGER DEFAULT 5,  -- 1 = highest, 10 = lowest
  attempt_number INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,

  -- Timing
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  next_retry_at TIMESTAMPTZ,

  -- Results
  items_synced JSONB,  -- { "transactions": 150, "accounts": 3 }
  error_code TEXT,
  error_message TEXT,

  -- Metadata
  triggered_by TEXT,  -- 'scheduler', 'user', 'webhook', 'admin'
  request_id UUID
);

CREATE INDEX idx_sync_jobs_pending ON sync_jobs(priority, created_at)
  WHERE status IN ('pending', 'retrying');
CREATE INDEX idx_sync_jobs_connection ON sync_jobs(connection_id, created_at DESC);
```

### Error states:

| Error State | User Impact | Auto-Recovery? |
|-------------|-------------|----------------|
| `sync_failed_transient` | Retry scheduled | Yes, within hours |
| `sync_failed_auth` | Must reconnect | No, user action required |
| `sync_failed_provider` | Provider outage | Yes, when provider recovers |
| `sync_partial` | Some data types failed | Partial, retry for failed types |

Output:
- `docs/platform/sync-and-freshness.md`.

Deliverable checklist:
- [ ] Sync cadence table by data type
- [ ] On-demand refresh flow diagram
- [ ] Sync job state machine diagram
- [ ] Backoff and retry rules table
- [ ] Staleness thresholds table
- [ ] Confidence score formula with examples
- [ ] API response examples showing freshness
- [ ] UI indicator mapping table
- [ ] Sync job schema (SQL)
- [ ] Error states with recovery info

Execution instructions:
- Create or overwrite `docs/platform/sync-and-freshness.md`.
- Do not modify any other files.
- Include Mermaid diagrams for state machines.
- Provide concrete numbers for all thresholds.

Parallelization:
- Can run in parallel with Prompts 1–6 and 8–9.
- No dependencies.

---

## Prompt 8 — ClearMoney UI Scaffolding (Mocked)

**Note:** This is the ONLY prompt that is ClearMoney-specific. ClearMoney is the first app consuming the Context Graph platform. Prompts 1–7 and 9 define the platform itself, which is app-agnostic.

Role:
You are a frontend engineer working on the ClearMoney Next.js application (the first consumer of the Context Graph API).

Scope:
- Add UI scaffolding for connectivity platform features using mocked data.
- Build components that demonstrate the platform's value proposition.
- This is the **client app** layer — it consumes the Context Graph API (defined in Prompts 1–7).

Requirements:

### Existing codebase context:

**Design system location:** `src/app/designs/design-11-autonomous/shared.tsx`

This file exports:
- `colors` object with: `bg`, `bgAlt`, `text`, `textMuted`, `textLight`, `accent`, `accentLight`, `border`, `success`, `warning`, `blob1`–`blob5`
- `GradientBlob` component for background effects
- `NoiseTexture` component for texture overlay
- `GlobalStyles` component for fonts and animations
- `AppNavigation` component for header navigation
- `mockUser` object with sample user data

**Dashboard location:** `src/app/designs/design-11-autonomous/dashboard/page.tsx`

The dashboard already includes:
- `FinancialHealthScore` component
- `NetWorthCard` component
- `KeyMetrics` component
- `ConnectedAccountsSection` component (basic version exists—enhance it)
- `DataDrivenInsights` component
- `RecommendationsCard` component
- `GoalsProgress` component

### Components to create:

Create these components in `src/app/designs/design-11-autonomous/components/`:

**1. `DataFreshnessWidget.tsx`**

Purpose: Show users how fresh their connected data is.

Props:
```typescript
interface DataFreshnessWidgetProps {
  connections: {
    id: string;
    institutionName: string;
    logo: string;
    lastSyncedAt: string;      // ISO 8601
    syncStatus: 'fresh' | 'stale' | 'expired' | 'error';
    dataTypes: {
      type: 'balances' | 'transactions' | 'holdings' | 'liabilities';
      status: 'fresh' | 'stale' | 'expired';
      lastUpdated: string;
    }[];
    confidence: number;        // 0.0 - 1.0
  }[];
  onRefresh?: (connectionId: string) => void;
}
```

Display:
- Overall freshness status with color-coded badge (green/yellow/red)
- Per-connection breakdown with institution logos
- "Refresh" button per connection
- Confidence score as progress bar
- Tooltip showing last sync time

**2. `DecisionTraceDrawer.tsx`**

Purpose: "Why this recommendation?" explainer drawer.

Props:
```typescript
interface DecisionTraceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  recommendation: {
    title: string;
    inputsUsed: {
      label: string;           // e.g., "Current savings balance"
      value: string;           // e.g., "$8,500"
      source: string;          // e.g., "Chase Savings"
      lastUpdated: string;
    }[];
    rulesApplied: {
      name: string;            // e.g., "Emergency fund = 3 months expenses"
      passed: boolean;
    }[];
    assumptions: {
      label: string;           // e.g., "Monthly expenses"
      value: string;           // e.g., "$5,000"
      source: 'calculated' | 'user_input' | 'default';
    }[];
    confidence: number;
    calculationBreakdown?: string;  // Markdown explanation
  };
}
```

Display:
- Slide-in drawer from right (or modal on mobile)
- Sections: "Data Used", "Rules Applied", "Assumptions", "Confidence"
- Checkmarks for passed rules, X for failed
- Source attribution with freshness indicator
- "Learn more" link to methodology

**3. `ConnectionStatusCard.tsx`**

Purpose: Enhanced connection status with actionable CTAs.

Props:
```typescript
interface ConnectionStatusCardProps {
  connections: {
    id: string;
    institutionName: string;
    institutionLogo: string;
    institutionColor: string;
    status: 'active' | 'degraded' | 'error' | 'needs_reauth';
    accountCount: number;
    lastSyncedAt: string;
    errorMessage?: string;
  }[];
  insightAccuracy: number;      // 0-100
  onAddConnection: () => void;
  onReconnect: (connectionId: string) => void;
  onRemove: (connectionId: string) => void;
}
```

Display:
- Grid of connected institution tiles with status indicators
- Pulsing green dot for active connections
- Warning/error states with "Reconnect" CTA
- "Add account" button with dashed border
- Insight accuracy meter showing how complete the picture is

**4. `CoverageGapsCard.tsx`**

Purpose: Show what data is missing and why it matters.

Props:
```typescript
interface CoverageGapsCardProps {
  gaps: {
    type: 'missing_account_type' | 'stale_data' | 'incomplete_history';
    title: string;             // e.g., "No mortgage connected"
    impact: string;            // e.g., "Home equity not reflected in net worth"
    severity: 'low' | 'medium' | 'high';
    cta: {
      label: string;           // e.g., "Connect mortgage"
      action: () => void;
    };
  }[];
}
```

Display:
- List of gaps with severity-colored icons
- Clear explanation of impact on recommendations
- Single CTA button per gap
- "All caught up!" state when no gaps

### Mock data file:

Create `src/app/designs/design-11-autonomous/mocks/platform-mocks.ts`:

```typescript
export const mockConnections = [
  {
    id: 'conn_chase',
    institutionName: 'Chase',
    institutionLogo: 'C',
    institutionColor: '#1a73e8',
    status: 'active' as const,
    accountCount: 2,
    lastSyncedAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(), // 10 min ago
    dataTypes: [
      { type: 'balances' as const, status: 'fresh' as const, lastUpdated: '...' },
      { type: 'transactions' as const, status: 'fresh' as const, lastUpdated: '...' },
    ],
    confidence: 0.95,
  },
  // ... more connections
];

export const mockDecisionTrace = {
  title: 'Build your emergency fund',
  inputsUsed: [
    { label: 'Current savings', value: '$8,500', source: 'Chase Savings', lastUpdated: '10 min ago' },
    { label: 'Monthly expenses', value: '$5,000', source: 'Calculated from transactions', lastUpdated: '1 day ago' },
  ],
  rulesApplied: [
    { name: 'Target: 3 months of expenses', passed: false },
    { name: 'Current coverage: 1.7 months', passed: true },
  ],
  assumptions: [
    { label: 'Target months', value: '3', source: 'default' as const },
    { label: 'Monthly expenses', value: '$5,000', source: 'calculated' as const },
  ],
  confidence: 0.92,
};

export const mockCoverageGaps = [
  {
    type: 'missing_account_type' as const,
    title: 'No mortgage connected',
    impact: 'Home equity not reflected in net worth calculation',
    severity: 'medium' as const,
    cta: { label: 'Connect mortgage', action: () => {} },
  },
  // ... more gaps
];
```

### Integration points:

Update `src/app/designs/design-11-autonomous/dashboard/page.tsx`:

1. Import new components from `./components/`
2. Import mock data from `./mocks/platform-mocks`
3. Add `DataFreshnessWidget` below the `ConnectedAccountsSection`
4. Add `CoverageGapsCard` in a new row
5. Add "Why this?" button to each recommendation card that opens `DecisionTraceDrawer`

### Styling requirements:

- Use `colors` from `shared.tsx` exclusively—no hardcoded colors
- Match existing card styles: `rounded-3xl`, `p-6` or `p-8`, border `1px solid ${colors.border}`
- Use `lucide-react` icons (already installed)
- Transitions: `transition-all duration-200`
- Hover states: `hover:shadow-lg hover:-translate-y-0.5` for interactive cards
- Mobile-first: stack on small screens, grid on `lg:`

Output:
- `src/app/designs/design-11-autonomous/components/DataFreshnessWidget.tsx`
- `src/app/designs/design-11-autonomous/components/DecisionTraceDrawer.tsx`
- `src/app/designs/design-11-autonomous/components/ConnectionStatusCard.tsx`
- `src/app/designs/design-11-autonomous/components/CoverageGapsCard.tsx`
- `src/app/designs/design-11-autonomous/mocks/platform-mocks.ts`
- Updated `src/app/designs/design-11-autonomous/dashboard/page.tsx`

Deliverable checklist:
- [ ] All 4 components created with TypeScript interfaces
- [ ] Mock data file with realistic sample data
- [ ] Components render without errors
- [ ] No external API calls or provider SDKs
- [ ] Styling matches existing design-11-autonomous aesthetic
- [ ] "Why this?" drawer wired to at least one recommendation
- [ ] Mobile-responsive layouts
- [ ] Proper TypeScript types (no `any`)

Execution instructions:
- Create the `components/` directory if it doesn't exist
- Create the `mocks/` directory if it doesn't exist
- Import `colors`, `GradientBlob`, etc. from `../shared`
- Use `"use client"` directive on all component files
- Do NOT modify `shared.tsx`
- Do NOT modify calculator pages or other designs
- Test that the dashboard renders without errors by checking browser console

Parallelization:
- Can run in parallel with Prompts 1–7 and 9.
- No dependencies on other prompts.

---

## Prompt 9 — Platform PRD

Role:
You are a product manager writing a comprehensive PRD for a **multi-tenant** financial connectivity platform (the "Context Graph API").

Scope:
- Write a complete PRD that could be handed to an engineering team for implementation.
- Frame this as **infrastructure** that can serve multiple consumer apps (ClearMoney is the first customer, but not the only one).
- Do NOT frame this as a ClearMoney feature — frame it as a standalone platform.

Requirements:

### Document structure:

```markdown
# Context Graph API — Platform PRD

## 1. Executive Summary
- One-paragraph vision
- Key value propositions (3-5 bullets)

## 2. Problem Statement
- What problem are we solving?
- Who experiences this problem?
- What's the cost of not solving it?

## 3. Goals and Non-Goals

### Goals (in priority order)
1. [Goal 1 with measurable outcome]
2. [Goal 2 with measurable outcome]
...

### Non-Goals (explicitly out of scope)
- [Non-goal 1 and why]
- [Non-goal 2 and why]

## 4. User Personas

### Persona 1: [Name] - [Role]
- Background: ...
- Goals: ...
- Pain points: ...
- How we help: ...

(Include 3-4 personas: end user, app developer, compliance officer, etc.)

## 5. Use Cases

### UC1: [Use Case Name]
- Actor: ...
- Precondition: ...
- Flow: (numbered steps)
- Postcondition: ...
- Success criteria: ...

(Include 5-6 core use cases)

## 6. User Stories

Format: As a [persona], I want [capability] so that [benefit].

Group by epic:
- Account Connection
- Data Sync
- Recommendations
- Consent Management
- Developer Experience

## 7. Requirements

### Functional Requirements
- FR1: [Requirement] - Priority: P0/P1/P2
- FR2: ...

### Non-Functional Requirements
- NFR1: Latency: p95 < 500ms for read operations
- NFR2: Availability: 99.9% uptime
- ...

## 8. API Boundaries

### What the platform provides:
- ...

### What the platform does NOT provide:
- ...

### Integration patterns:
- Sync vs. async
- Webhook vs. polling
- SDK vs. REST API

## 9. Privacy and Security Posture

### Data handling principles
- Principle 1: ...
- Principle 2: ...

### Compliance requirements
- SOC 2 Type II
- GDPR (if applicable)
- CCPA (if applicable)

### User rights
- Right to access
- Right to delete
- Right to export

## 10. Phased Rollout Plan

### Phase 1: MVP (Weeks 1-8)
- Scope: ...
- Success criteria: ...
- Team size: ...

### Phase 2: Multi-Provider (Weeks 9-16)
- Scope: ...
- Success criteria: ...

### Phase 3: Advisor-Grade (Weeks 17-24)
- Scope: ...
- Success criteria: ...

## 11. Success Metrics

### North Star Metric
- [Metric]: [Target]

### Supporting Metrics
| Metric | Current | Target | Timeline |
|--------|---------|--------|----------|
| ... | ... | ... | ... |

### Guardrail Metrics (things we don't want to hurt)
- ...

## 12. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Provider API changes | Medium | High | Abstraction layer, version pinning |
| ... | ... | ... | ... |

## 13. Open Questions
- [ ] Question 1
- [ ] Question 2

## 14. Appendix
- Glossary
- Related documents
- Competitive analysis summary
```

### Content requirements:

**Frame this as a multi-tenant platform:**
- The platform serves multiple consumer apps (apps are tenants)
- ClearMoney is the first customer, but others will follow
- Data isolation between apps is critical
- Self-service app registration (future) vs. manual onboarding (MVP)

**Goals should include:**
- Provide a unified API for financial data that any app can consume
- Enable multi-tenant data isolation with per-app API keys
- Improve recommendation accuracy by having real data vs. user estimates
- Reduce onboarding friction for apps (< 1 day to integrate)
- Enable personalized, data-driven financial guidance for end users
- Build trust through transparency (show your work)

**Non-goals should include:**
- Building a competing aggregator (we use existing providers)
- Storing raw transaction descriptions (normalize/categorize only)
- Supporting non-US institutions in MVP
- Real-time trading or payment initiation
- Building consumer-facing UI (that's the app's job, not the platform's)

**Personas should include:**
1. **App Developer** (integrating the platform) — wants simple, reliable API with good docs
2. **End User** (of a consumer app like ClearMoney) — wants personalized advice
3. **Compliance Officer** (at app company) — ensures data handling meets regulations
4. **Platform Admin** — onboards new apps, monitors health, manages providers
5. **Product Manager** (at app company) — measures feature impact

**Use cases should include:**
1. App registration and API key generation
2. First-time account connection (end user via app)
3. Viewing synced financial data (app queries platform)
4. Receiving data-driven recommendation
5. Exploring "Why this recommendation?" (decision trace)
6. Revoking consent and deleting data
7. Handling connection errors / re-authentication

**Success metrics should include:**
- Connection success rate: >90%
- Time to first insight: <5 minutes
- Data freshness SLA: 95% of connections synced within 24h
- User trust score (survey): >4.0/5.0
- Recommendation engagement rate: >30%

**Risks should include:**
- Provider API deprecation or pricing changes
- User privacy concerns limiting adoption
- Connection reliability issues damaging trust
- Regulatory changes (open banking mandates)
- Competitor launching similar offering

Output:
- `docs/platform/PRD.md`.

Deliverable checklist:
- [ ] All 14 sections completed
- [ ] 3-4 personas with realistic details
- [ ] 5-6 detailed use cases with flows
- [ ] Clear MVP scope vs. future phases
- [ ] Measurable success metrics with targets
- [ ] Risk matrix with mitigations
- [ ] Non-goals explicitly stated
- [ ] Privacy posture section covers user rights

Execution instructions:
- Create or overwrite `docs/platform/PRD.md`.
- Do not modify any other files.
- Use markdown formatting with clear hierarchy.
- Be specific with numbers (targets, timelines, team sizes).
- Include realistic estimates, not aspirational ones.

Parallelization:
- Can run in parallel with Prompts 1–8.
- No dependencies.
