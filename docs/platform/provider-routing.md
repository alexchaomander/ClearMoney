# Provider Routing Strategy

Version: 1.0.0
Last Updated: 2026-01-24

## Overview

This document defines the provider routing strategy for the Context Graph API. The routing layer intelligently selects which financial data provider (Plaid, MX, Finicity, or FDX) to use for each request based on:

- **Provider hierarchy** — Default precedence order
- **Institution overrides** — Per-institution routing rules
- **Provider health** — Real-time health scoring
- **Data type support** — Provider capabilities for specific data types
- **Failover logic** — Automatic fallback when providers fail

---

## Provider Hierarchy

### Default Precedence Order

When no institution-specific override applies, providers are evaluated in this order:

| Priority | Provider | Description | Strengths |
|----------|----------|-------------|-----------|
| 1 | **FDX (Direct API)** | Direct bank API connections via Financial Data Exchange | Highest data quality, real-time, no intermediary, user-controlled consent |
| 2 | **Plaid** | Primary aggregator | Broadest institution coverage (~12,000), good reliability, strong transaction categorization |
| 3 | **MX** | Secondary aggregator | Better credit union coverage, strong data enrichment, good for regional banks |
| 4 | **Finicity** | Tertiary aggregator | Best for retirement/401(k) accounts, required by some mortgage lenders (Fannie Mae) |

### Provider Selection Rationale

```
FDX > Plaid > MX > Finicity

FDX is preferred because:
- Direct API connection (no screen scraping)
- Real-time data (not batched)
- User controls consent directly with their bank
- Highest data fidelity

Plaid is secondary because:
- Largest institution coverage
- Most mature API and SDKs
- Reliable transaction data

MX is tertiary because:
- Excellent credit union support
- Strong data enrichment
- Good alternative when Plaid has issues

Finicity is fallback because:
- Specialized (401k, mortgages)
- Required for certain compliance use cases
- Smaller general coverage
```

---

## Routing Decision Algorithm

### Core Algorithm

```typescript
interface RoutingContext {
  institutionId: string;
  dataTypes: DataType[];
  userId: string;
  appId: string;
  existingConnectionProvider?: ProviderType;  // Prefer existing if healthy
}

interface RoutingDecision {
  selectedProvider: ProviderType;
  reason: RoutingReason;
  fallbackChain: ProviderType[];
  candidates: ProviderCandidate[];
  decisionId: string;
}

interface ProviderCandidate {
  provider: ProviderType;
  healthScore: number;
  supported: boolean;
  supportsAllDataTypes: boolean;
  disqualificationReason?: string;
}

type RoutingReason =
  | 'default_precedence'      // No override, used default order
  | 'institution_override'    // Institution-specific rule applied
  | 'data_type_preference'    // Provider better for requested data types
  | 'existing_connection'     // Reusing existing healthy connection
  | 'health_based'            // Selected based on health scores
  | 'only_option';            // Only one provider available

type DataType = 'accounts' | 'balances' | 'transactions' | 'holdings' | 'liabilities' | 'identity';

async function selectProvider(context: RoutingContext): Promise<RoutingDecision> {
  const decisionId = generateDecisionId();
  const startTime = Date.now();

  // Step 1: Get institution's provider support
  const institution = await getInstitution(context.institutionId);
  const supportedProviders = institution.supportedProviders;

  // Step 2: Check for existing healthy connection (prefer continuity)
  if (context.existingConnectionProvider) {
    const existingHealth = await getProviderHealth(context.existingConnectionProvider);
    if (existingHealth.score >= 70 && supportedProviders.includes(context.existingConnectionProvider)) {
      return buildDecision({
        selected: context.existingConnectionProvider,
        reason: 'existing_connection',
        candidates: await evaluateCandidates(supportedProviders, context),
        decisionId,
      });
    }
  }

  // Step 3: Check for institution-level overrides
  const override = await getInstitutionOverride(context.institutionId);
  if (override) {
    const overrideProvider = findFirstHealthyProvider(override.providerOrder, supportedProviders);
    if (overrideProvider) {
      return buildDecision({
        selected: overrideProvider,
        reason: 'institution_override',
        candidates: await evaluateCandidates(supportedProviders, context),
        decisionId,
      });
    }
  }

  // Step 4: Filter by data type support
  const dataTypeCapable = filterByDataTypeSupport(supportedProviders, context.dataTypes);

  // Step 5: Check for data type preferences
  const dataTypePreferred = getDataTypePreferredProvider(context.dataTypes);
  if (dataTypePreferred && dataTypeCapable.includes(dataTypePreferred)) {
    const health = await getProviderHealth(dataTypePreferred);
    if (health.status !== 'unhealthy') {
      return buildDecision({
        selected: dataTypePreferred,
        reason: 'data_type_preference',
        candidates: await evaluateCandidates(supportedProviders, context),
        decisionId,
      });
    }
  }

  // Step 6: Score remaining providers by health
  const candidates = await evaluateCandidates(dataTypeCapable, context);
  const healthySorted = candidates
    .filter(c => c.supported && c.supportsAllDataTypes)
    .sort((a, b) => {
      // First sort by default precedence
      const precedenceA = DEFAULT_PRECEDENCE.indexOf(a.provider);
      const precedenceB = DEFAULT_PRECEDENCE.indexOf(b.provider);

      // If health scores differ significantly (>10 points), prefer healthier
      if (Math.abs(a.healthScore - b.healthScore) > 10) {
        return b.healthScore - a.healthScore;
      }

      // Otherwise use default precedence
      return precedenceA - precedenceB;
    });

  // Step 7: Select highest-scoring provider
  if (healthySorted.length === 0) {
    throw new RoutingError('NO_AVAILABLE_PROVIDERS', 'No providers available for this institution');
  }

  const selected = healthySorted[0].provider;
  const fallbackChain = healthySorted.slice(1).map(c => c.provider);

  return buildDecision({
    selected,
    reason: healthySorted.length === 1 ? 'only_option' : 'default_precedence',
    candidates,
    fallbackChain,
    decisionId,
  });
}

const DEFAULT_PRECEDENCE: ProviderType[] = ['fdx', 'plaid', 'mx', 'finicity'];
```

### Fallback Execution

```typescript
interface ProviderRequest<T> {
  execute: (provider: ProviderType) => Promise<T>;
}

async function executeWithFallback<T>(
  decision: RoutingDecision,
  request: ProviderRequest<T>,
  context: RoutingContext
): Promise<T> {
  const providers = [decision.selectedProvider, ...decision.fallbackChain];
  let lastError: Error | null = null;
  let attemptCount = 0;
  const maxTotalAttempts = 3;

  for (const provider of providers) {
    if (attemptCount >= maxTotalAttempts) {
      break;
    }

    try {
      attemptCount++;
      const result = await request.execute(provider);

      // Log successful routing
      await logRoutingOutcome({
        decisionId: decision.decisionId,
        provider,
        success: true,
        attemptNumber: attemptCount,
      });

      return result;
    } catch (error) {
      lastError = error;

      // Log failed attempt
      await logRoutingOutcome({
        decisionId: decision.decisionId,
        provider,
        success: false,
        error: error.code,
        attemptNumber: attemptCount,
      });

      // Check if error is retryable
      if (!isRetryableError(error)) {
        throw error;  // Non-retryable (e.g., auth errors)
      }

      // Handle rate limiting
      if (error.code === 'RATE_LIMITED' && error.retryAfter > 60) {
        continue;  // Skip to next provider if wait is too long
      }

      // For 5xx errors, retry once with same provider
      if (is5xxError(error) && attemptCount < maxTotalAttempts) {
        await sleep(1000);  // 1 second delay
        try {
          attemptCount++;
          return await request.execute(provider);
        } catch (retryError) {
          lastError = retryError;
          // Continue to next provider
        }
      }
    }
  }

  // All providers failed
  throw new ProviderUnavailableError(
    'All providers failed',
    lastError,
    decision.decisionId
  );
}
```

---

## Institution-Level Routing Overrides

### Override Table Schema

```sql
CREATE TABLE institution_routing_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Pattern matching (supports wildcards)
  institution_pattern TEXT NOT NULL,        -- e.g., 'ins_fidelity%', '%credit_union%'

  -- Routing configuration
  provider_order JSONB NOT NULL,            -- e.g., ["finicity", "plaid", "mx"]

  -- Metadata
  reason TEXT NOT NULL,                     -- Human-readable explanation
  enabled BOOLEAN NOT NULL DEFAULT true,
  priority INTEGER NOT NULL DEFAULT 0,      -- Higher = evaluated first

  -- Audit fields
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by TEXT,                          -- Admin user ID

  -- Constraints
  CONSTRAINT valid_provider_order CHECK (jsonb_typeof(provider_order) = 'array')
);

-- Index for pattern matching
CREATE INDEX idx_routing_overrides_pattern ON institution_routing_overrides
  USING btree (institution_pattern text_pattern_ops)
  WHERE enabled = true;

-- Index for priority ordering
CREATE INDEX idx_routing_overrides_priority ON institution_routing_overrides (priority DESC)
  WHERE enabled = true;
```

### Default Override Rules

| Institution Pattern | Provider Order | Priority | Reason |
|---------------------|----------------|----------|--------|
| `ins_fidelity%` | `["finicity", "plaid", "mx"]` | 100 | Finicity has superior 401(k) and retirement account data extraction |
| `ins_vanguard%` | `["fdx", "plaid", "finicity"]` | 100 | Vanguard supports FDX; excellent direct API quality |
| `ins_chase%` | `["plaid", "mx", "finicity"]` | 90 | Plaid has most stable Chase connection, fewer MFA issues |
| `ins_wellsfargo%` | `["plaid", "mx", "finicity"]` | 90 | Plaid preferred for Wells Fargo stability |
| `%credit_union%` | `["mx", "plaid", "finicity"]` | 80 | MX has better credit union coverage and relationships |
| `ins_schwab%` | `["fdx", "finicity", "plaid"]` | 85 | Schwab FDX supported; Finicity good for brokerage data |
| `ins_usaa%` | `["plaid", "finicity"]` | 70 | USAA works best with Plaid; MX has connectivity issues |

### Override Matching Logic

```typescript
async function getInstitutionOverride(institutionId: string): Promise<RoutingOverride | null> {
  // Query overrides ordered by priority (highest first)
  const overrides = await db.query(`
    SELECT institution_pattern, provider_order, reason
    FROM institution_routing_overrides
    WHERE enabled = true
    ORDER BY priority DESC
  `);

  // Find first matching pattern
  for (const override of overrides) {
    if (matchesPattern(institutionId, override.institution_pattern)) {
      return {
        providerOrder: override.provider_order as ProviderType[],
        reason: override.reason,
      };
    }
  }

  return null;
}

function matchesPattern(institutionId: string, pattern: string): boolean {
  // Convert SQL LIKE pattern to regex
  const regex = new RegExp(
    '^' + pattern
      .replace(/%/g, '.*')
      .replace(/_/g, '.')
    + '$'
  );
  return regex.test(institutionId);
}
```

### Admin API for Override Management

```yaml
# Add to OpenAPI spec
paths:
  /v1/admin/routing-overrides:
    get:
      summary: List all routing overrides
      security:
        - AdminApiKey: []
      responses:
        '200':
          description: List of routing overrides
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/RoutingOverride'

    post:
      summary: Create a routing override
      security:
        - AdminApiKey: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/RoutingOverrideCreate'
      responses:
        '201':
          description: Override created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/RoutingOverride'

  /v1/admin/routing-overrides/{override_id}:
    patch:
      summary: Update a routing override
      security:
        - AdminApiKey: []
      parameters:
        - name: override_id
          in: path
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/RoutingOverrideUpdate'
      responses:
        '200':
          description: Override updated

    delete:
      summary: Delete a routing override
      security:
        - AdminApiKey: []
      parameters:
        - name: override_id
          in: path
          required: true
          schema:
            type: string
      responses:
        '204':
          description: Override deleted
```

---

## Provider Health Scoring

### Health Score Formula

Each provider's health is scored from 0-100 based on recent performance metrics:

```typescript
interface HealthMetrics {
  successRate: number;          // 0-100: % of 2xx responses in window
  p95LatencyMs: number;         // p95 latency in milliseconds
  syncFreshnessRate: number;    // 0-100: % of connections synced in 24h
  distinctErrorTypes: number;   // Count of unique error codes in window
}

interface HealthScore {
  provider: ProviderType;
  score: number;                // 0-100
  status: 'healthy' | 'degraded' | 'unhealthy';
  metrics: HealthMetrics;
  calculatedAt: string;
}

function calculateHealthScore(metrics: HealthMetrics): number {
  // Success rate: 40% weight
  const successComponent = metrics.successRate * 0.4;

  // Latency score: 30% weight
  // 100 if p95 < 500ms, linear decrease to 0 at 5000ms
  const latencyScore = Math.max(0, Math.min(100,
    100 - ((metrics.p95LatencyMs - 500) / 45)
  ));
  const latencyComponent = latencyScore * 0.3;

  // Freshness score: 20% weight
  const freshnessComponent = metrics.syncFreshnessRate * 0.2;

  // Error diversity penalty: 10% weight
  // Penalize providers with many different error types (indicates instability)
  // 0 errors = 100, each error type reduces by 15, min 0
  const errorDiversityScore = Math.max(0, 100 - (metrics.distinctErrorTypes * 15));
  const errorComponent = errorDiversityScore * 0.1;

  return Math.round(successComponent + latencyComponent + freshnessComponent + errorComponent);
}
```

### Health Status Thresholds

| Score Range | Status | Routing Behavior |
|-------------|--------|------------------|
| 80-100 | **Healthy** | Normal routing, preferred in selection |
| 50-79 | **Degraded** | Log warnings, consider alternatives if available |
| 0-49 | **Unhealthy** | Skip unless only option, trigger alerts |

### Health Metrics Collection

```typescript
// Metrics are collected in sliding windows
interface HealthWindow {
  windowDuration: number;       // Window size in minutes
  sampleInterval: number;       // How often to sample (minutes)
}

const HEALTH_CONFIG = {
  // Success rate: 15-minute rolling window
  successRate: {
    windowDuration: 15,
    sampleInterval: 1,
  },

  // Latency: 5-minute rolling window (more responsive)
  latency: {
    windowDuration: 5,
    sampleInterval: 1,
  },

  // Freshness: 24-hour window
  freshness: {
    windowDuration: 1440,  // 24 hours
    sampleInterval: 60,    // hourly
  },

  // Error diversity: 15-minute window
  errorDiversity: {
    windowDuration: 15,
    sampleInterval: 1,
  },

  // How often to recalculate health scores
  recalculationInterval: 60,  // 1 minute
};

// Health score cache (in-memory with Redis backing)
class ProviderHealthCache {
  private cache: Map<ProviderType, HealthScore> = new Map();
  private readonly TTL_SECONDS = 60;

  async getHealth(provider: ProviderType): Promise<HealthScore> {
    const cached = this.cache.get(provider);
    if (cached && !this.isExpired(cached)) {
      return cached;
    }

    const metrics = await this.collectMetrics(provider);
    const score = calculateHealthScore(metrics);
    const health: HealthScore = {
      provider,
      score,
      status: this.scoreToStatus(score),
      metrics,
      calculatedAt: new Date().toISOString(),
    };

    this.cache.set(provider, health);
    await this.persistToRedis(provider, health);

    return health;
  }

  private scoreToStatus(score: number): 'healthy' | 'degraded' | 'unhealthy' {
    if (score >= 80) return 'healthy';
    if (score >= 50) return 'degraded';
    return 'unhealthy';
  }
}
```

### Health Monitoring Alerts

```typescript
// Alert thresholds
const ALERT_CONFIG = {
  // Alert when provider becomes unhealthy
  unhealthyThreshold: 50,

  // Alert when provider drops more than N points in 5 minutes
  rapidDeclineThreshold: 20,

  // Alert when all providers for an institution are degraded
  allDegradedAlert: true,

  // Minimum requests before alerting (avoid false positives)
  minRequestsForAlert: 100,
};

interface HealthAlert {
  type: 'provider_unhealthy' | 'rapid_decline' | 'all_providers_degraded';
  provider?: ProviderType;
  institutionId?: string;
  currentScore: number;
  previousScore?: number;
  timestamp: string;
}
```

---

## Failover and Retry Policy

### Failover Decision Matrix

| Error Type | HTTP Status | Platform Error Code | Action | Retry Same Provider? | Failover? |
|------------|-------------|---------------------|--------|---------------------|-----------|
| Server Error | 5xx | `PROVIDER_UNAVAILABLE` | Retry once, then failover | Yes (1x after 1s) | Yes |
| Rate Limited | 429 | `RATE_LIMITED` | Check Retry-After | If wait ≤60s | If wait >60s |
| Timeout | — | `PROVIDER_TIMEOUT` | Immediate failover | No | Yes |
| Auth Error | 401/403 | `REAUTHENTICATION_REQUIRED` | Return to app | No | No |
| Not Found | 404 | `ACCOUNT_NOT_FOUND` | Return to app | No | No |
| Bad Request | 400 | Varies | Return to app | No | No |
| Institution Down | 503 | `INSTITUTION_DOWN` | Exponential backoff | Yes (2x) | Yes |

### Retry Configuration

```typescript
interface FailoverConfig {
  // Maximum total attempts across all providers
  maxTotalAttempts: number;

  // Delay between retries to same provider
  sameProviderRetryDelayMs: number;

  // Maximum wait time for rate limit before failover
  maxRateLimitWaitSeconds: number;

  // Timeout for considering a request failed
  requestTimeoutMs: number;

  // Errors that should NOT trigger failover (user action required)
  nonFailoverErrors: PlatformErrorCode[];
}

const DEFAULT_FAILOVER_CONFIG: FailoverConfig = {
  maxTotalAttempts: 3,
  sameProviderRetryDelayMs: 1000,
  maxRateLimitWaitSeconds: 60,
  requestTimeoutMs: 30000,
  nonFailoverErrors: [
    'REAUTHENTICATION_REQUIRED',
    'INVALID_CREDENTIALS',
    'MFA_REQUIRED',
    'UNSUPPORTED_MFA',
    'CONSENT_EXPIRED',
    'CONSENT_REVOKED',
    'ACCOUNT_NOT_FOUND',
    'NO_ACCOUNTS',
  ],
};
```

### Failover State Machine

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Request Initiated                            │
└─────────────────────────────────┬───────────────────────────────────┘
                                  │
                                  ▼
                    ┌─────────────────────────┐
                    │   Select Provider (P1)  │
                    └─────────────┬───────────┘
                                  │
                                  ▼
                    ┌─────────────────────────┐
               ┌────│    Execute Request      │────┐
               │    └─────────────────────────┘    │
               │                                   │
          Success                              Failure
               │                                   │
               ▼                                   ▼
        ┌──────────┐                  ┌─────────────────────┐
        │  Return  │                  │  Is Error Retryable?│
        │  Result  │                  └──────────┬──────────┘
        └──────────┘                             │
                                    ┌────────────┴────────────┐
                                   Yes                        No
                                    │                         │
                                    ▼                         ▼
                      ┌─────────────────────────┐    ┌──────────────┐
                      │  Attempts < Max (3)?    │    │ Return Error │
                      └──────────┬──────────────┘    │  (User Action│
                                 │                   │   Required)  │
                    ┌────────────┴────────────┐      └──────────────┘
                   Yes                        No
                    │                         │
                    ▼                         ▼
         ┌────────────────────┐     ┌──────────────────┐
         │ Is 5xx? Retry same │     │ Return Error     │
         │ provider after 1s  │     │ (All Providers   │
         └─────────┬──────────┘     │ Exhausted)       │
                   │                └──────────────────┘
          ┌────────┴────────┐
         Yes               No/Fail
          │                 │
          ▼                 ▼
    ┌──────────┐   ┌─────────────────────┐
    │ Retry P1 │   │ Failover to Next    │
    └──────────┘   │ Provider (P2, P3..) │
                   └─────────────────────┘
```

---

## Data Type Routing Matrix

### Provider Capabilities by Data Type

| Data Type | Plaid | MX | Finicity | FDX | Notes |
|-----------|-------|-----|----------|-----|-------|
| **accounts** | ✅ Full | ✅ Full | ✅ Full | ✅ Full | All providers support |
| **balances** | ✅ Full | ✅ Full | ✅ Full | ✅ Real-time | FDX provides real-time balances |
| **transactions** | ✅ Full | ✅ Full | ✅ Full | ✅ Full | All providers reliable |
| **holdings** | ✅ Good | ✅ Good | ✅ Best | ✅ Full | Finicity excels at retirement accounts |
| **liabilities** | ✅ Best | ✅ Good | ✅ Basic | ⚠️ Partial | Plaid most complete |
| **identity** | ✅ Full | ⚠️ Limited | ⚠️ Limited | ✅ Full | Plaid or FDX preferred |

### Data Type Preference Rules

```typescript
// When a specific data type is requested, prefer these providers
const DATA_TYPE_PREFERENCES: Record<DataType, ProviderType[]> = {
  accounts: ['fdx', 'plaid', 'mx', 'finicity'],      // Default order
  balances: ['fdx', 'plaid', 'mx', 'finicity'],      // FDX has real-time
  transactions: ['plaid', 'mx', 'fdx', 'finicity'],  // Plaid best categorization
  holdings: ['finicity', 'fdx', 'plaid', 'mx'],      // Finicity best for 401k
  liabilities: ['plaid', 'mx', 'finicity'],          // Plaid most complete (no FDX)
  identity: ['plaid', 'fdx'],                        // Limited provider support
};

function getDataTypePreferredProvider(dataTypes: DataType[]): ProviderType | null {
  if (dataTypes.length === 0) return null;

  // For multiple data types, find a provider that's good for all
  // Score each provider by how well it handles all requested types
  const providerScores = new Map<ProviderType, number>();

  for (const dataType of dataTypes) {
    const preferences = DATA_TYPE_PREFERENCES[dataType];
    preferences.forEach((provider, index) => {
      const score = preferences.length - index;  // Higher = better
      providerScores.set(provider, (providerScores.get(provider) || 0) + score);
    });
  }

  // Return provider with highest total score
  let bestProvider: ProviderType | null = null;
  let bestScore = 0;

  for (const [provider, score] of providerScores) {
    if (score > bestScore) {
      bestScore = score;
      bestProvider = provider;
    }
  }

  return bestProvider;
}
```

### Data Type Support Filtering

```typescript
// Filter providers that support ALL requested data types
function filterByDataTypeSupport(
  providers: ProviderType[],
  requiredDataTypes: DataType[]
): ProviderType[] {
  return providers.filter(provider => {
    return requiredDataTypes.every(dataType => {
      const supportedProviders = DATA_TYPE_PREFERENCES[dataType];
      return supportedProviders.includes(provider);
    });
  });
}
```

---

## Routing Decision Logging

### Log Schema

Every routing decision is logged for debugging, analytics, and audit purposes:

```typescript
interface RoutingDecisionLog {
  // Identifiers
  id: string;                              // Unique decision ID (UUID)
  timestamp: string;                       // ISO 8601

  // Request context
  appId: string;                           // Requesting app
  userId: string;                          // User ID
  connectionId?: string;                   // Connection ID (if existing)
  institutionId: string;                   // Target institution
  dataTypes: DataType[];                   // Requested data types

  // Decision details
  candidates: ProviderCandidate[];         // All evaluated providers
  selectedProvider: ProviderType;          // Chosen provider
  reason: RoutingReason;                   // Why this provider was selected
  fallbackChain: ProviderType[];           // Backup providers in order

  // Override info (if applicable)
  overrideApplied?: {
    pattern: string;                       // Matching pattern
    overrideId: string;                    // Override rule ID
  };

  // Performance
  decisionTimeMs: number;                  // Time to make routing decision
}

interface RoutingOutcomeLog {
  // Link to decision
  decisionId: string;

  // Outcome
  provider: ProviderType;                  // Provider that was used
  attemptNumber: number;                   // 1, 2, or 3
  success: boolean;

  // Error info (if failed)
  errorCode?: PlatformErrorCode;
  errorMessage?: string;

  // Performance
  requestDurationMs: number;

  timestamp: string;
}
```

### Example Log Entry

```json
{
  "event": "routing_decision",
  "id": "rd_abc123def456",
  "timestamp": "2026-01-24T10:30:00.123Z",
  "appId": "app_clearmoney",
  "userId": "usr_12345",
  "connectionId": null,
  "institutionId": "ins_fidelity_investments",
  "dataTypes": ["accounts", "holdings"],
  "candidates": [
    {
      "provider": "fdx",
      "healthScore": 92,
      "supported": false,
      "supportsAllDataTypes": false,
      "disqualificationReason": "institution_not_fdx_enabled"
    },
    {
      "provider": "finicity",
      "healthScore": 88,
      "supported": true,
      "supportsAllDataTypes": true
    },
    {
      "provider": "plaid",
      "healthScore": 95,
      "supported": true,
      "supportsAllDataTypes": true
    },
    {
      "provider": "mx",
      "healthScore": 85,
      "supported": true,
      "supportsAllDataTypes": true
    }
  ],
  "selectedProvider": "finicity",
  "reason": "institution_override",
  "fallbackChain": ["plaid", "mx"],
  "overrideApplied": {
    "pattern": "ins_fidelity%",
    "overrideId": "ovr_fidelity_finicity"
  },
  "decisionTimeMs": 12
}
```

### Outcome Log Entry

```json
{
  "event": "routing_outcome",
  "decisionId": "rd_abc123def456",
  "provider": "finicity",
  "attemptNumber": 1,
  "success": true,
  "requestDurationMs": 1234,
  "timestamp": "2026-01-24T10:30:01.357Z"
}
```

### Log Storage

```sql
-- Routing decision log table (partitioned by month)
CREATE TABLE routing_decision_logs (
  id TEXT PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL,
  app_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  connection_id TEXT,
  institution_id TEXT NOT NULL,
  data_types JSONB NOT NULL,
  candidates JSONB NOT NULL,
  selected_provider TEXT NOT NULL,
  reason TEXT NOT NULL,
  fallback_chain JSONB NOT NULL,
  override_applied JSONB,
  decision_time_ms INTEGER NOT NULL
) PARTITION BY RANGE (timestamp);

-- Routing outcome log table
CREATE TABLE routing_outcome_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id TEXT NOT NULL REFERENCES routing_decision_logs(id),
  provider TEXT NOT NULL,
  attempt_number INTEGER NOT NULL,
  success BOOLEAN NOT NULL,
  error_code TEXT,
  error_message TEXT,
  request_duration_ms INTEGER NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for analytics queries
CREATE INDEX idx_routing_decisions_app ON routing_decision_logs(app_id, timestamp);
CREATE INDEX idx_routing_decisions_institution ON routing_decision_logs(institution_id, timestamp);
CREATE INDEX idx_routing_decisions_provider ON routing_decision_logs(selected_provider, timestamp);
CREATE INDEX idx_routing_outcomes_decision ON routing_outcome_logs(decision_id);
CREATE INDEX idx_routing_outcomes_provider ON routing_outcome_logs(provider, success, timestamp);
```

---

## App-Facing Routing Visibility

### Routing Info Endpoint

Apps can query routing information for transparency:

```yaml
paths:
  /v1/connections/{connection_id}/routing-info:
    get:
      summary: Get routing information for a connection
      description: |
        Returns details about which provider is used for this connection,
        the current health status, and available fallback options.
      security:
        - ApiKey: []
      parameters:
        - name: connection_id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Routing information
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ConnectionRoutingInfo'

components:
  schemas:
    ConnectionRoutingInfo:
      type: object
      required:
        - connection_id
        - provider
        - provider_status
        - institution_id
      properties:
        connection_id:
          type: string
          description: Connection identifier
        provider:
          type: string
          enum: [plaid, mx, finicity, fdx]
          description: Current provider for this connection
        provider_status:
          type: string
          enum: [healthy, degraded, unhealthy]
          description: Current health status of the provider
        provider_health_score:
          type: integer
          minimum: 0
          maximum: 100
          description: Provider health score (0-100)
        institution_id:
          type: string
          description: Institution identifier
        fallback_providers:
          type: array
          items:
            type: string
          description: Available fallback providers in priority order
        routing_reason:
          type: string
          description: Why this provider was selected
        last_routing_decision_id:
          type: string
          description: ID of the last routing decision for debugging
```

### Response Headers

All API responses include routing transparency headers:

| Header | Description | Example |
|--------|-------------|---------|
| `X-Provider` | Provider used for this request | `plaid` |
| `X-Provider-Request-Id` | Provider's request ID for debugging | `req_abc123` |
| `X-Routing-Decision-Id` | Platform's routing decision ID | `rd_xyz789` |

```typescript
// Middleware to add routing headers
function addRoutingHeaders(response: Response, context: RequestContext): void {
  response.setHeader('X-Provider', context.provider);

  if (context.providerRequestId) {
    response.setHeader('X-Provider-Request-Id', context.providerRequestId);
  }

  if (context.routingDecisionId) {
    response.setHeader('X-Routing-Decision-Id', context.routingDecisionId);
  }
}
```

### Webhook Events

Webhook payloads include routing information:

```json
{
  "event": "connection.synced",
  "timestamp": "2026-01-24T10:30:00Z",
  "data": {
    "connection_id": "conn_abc123",
    "user_id": "usr_12345",
    "institution_id": "ins_chase",
    "sync_type": "transactions",
    "provider": "plaid",
    "provider_status": "healthy",
    "items_synced": 47
  }
}
```

---

## Configuration Management

### Runtime Configuration

Routing rules are stored in the database and cached in memory:

```typescript
interface RoutingConfig {
  // Default provider precedence
  defaultPrecedence: ProviderType[];

  // Health score thresholds
  healthThresholds: {
    healthy: number;     // Default: 80
    degraded: number;    // Default: 50
  };

  // Failover settings
  failover: FailoverConfig;

  // Cache settings
  cache: {
    healthScoreTtlSeconds: number;      // Default: 60
    overridesTtlSeconds: number;        // Default: 300
    institutionSupportTtlSeconds: number; // Default: 3600
  };

  // Feature flags
  features: {
    enableFdxRouting: boolean;          // Default: true
    enableHealthBasedRouting: boolean;  // Default: true
    enableGradualRollout: boolean;      // Default: false
  };
}

// Configuration cache with auto-refresh
class RoutingConfigManager {
  private config: RoutingConfig;
  private readonly REFRESH_INTERVAL_MS = 300_000;  // 5 minutes

  async initialize(): Promise<void> {
    await this.loadConfig();
    setInterval(() => this.loadConfig(), this.REFRESH_INTERVAL_MS);
  }

  private async loadConfig(): Promise<void> {
    const dbConfig = await db.query('SELECT * FROM routing_config WHERE active = true');
    this.config = this.parseConfig(dbConfig);

    // Also refresh overrides
    await this.refreshOverridesCache();
  }

  getConfig(): RoutingConfig {
    return this.config;
  }
}
```

### Gradual Rollout Support

For testing new routing rules or providers:

```typescript
interface GradualRollout {
  id: string;
  name: string;

  // Traffic allocation
  percentageEnabled: number;           // 0-100

  // Targeting
  targetInstitutions?: string[];       // Limit to specific institutions
  targetApps?: string[];               // Limit to specific apps

  // Configuration change
  configOverride: Partial<RoutingConfig>;

  // Rollout status
  status: 'active' | 'paused' | 'completed';
  startedAt: string;
  completedAt?: string;
}

function shouldApplyRollout(rollout: GradualRollout, context: RoutingContext): boolean {
  // Check targeting
  if (rollout.targetInstitutions && !rollout.targetInstitutions.includes(context.institutionId)) {
    return false;
  }
  if (rollout.targetApps && !rollout.targetApps.includes(context.appId)) {
    return false;
  }

  // Deterministic percentage check based on user ID
  const hash = hashString(context.userId + rollout.id);
  const bucket = hash % 100;
  return bucket < rollout.percentageEnabled;
}
```

### Audit Logging for Config Changes

```typescript
interface ConfigAuditLog {
  id: string;
  timestamp: string;
  adminUserId: string;
  action: 'create' | 'update' | 'delete';
  resourceType: 'routing_override' | 'routing_config' | 'gradual_rollout';
  resourceId: string;
  previousValue: any;
  newValue: any;
  reason?: string;
}

// All config changes are logged
async function updateRoutingOverride(
  overrideId: string,
  update: RoutingOverrideUpdate,
  adminUser: AdminUser
): Promise<RoutingOverride> {
  const previous = await getOverride(overrideId);
  const updated = await db.update('institution_routing_overrides', overrideId, update);

  await logConfigChange({
    adminUserId: adminUser.id,
    action: 'update',
    resourceType: 'routing_override',
    resourceId: overrideId,
    previousValue: previous,
    newValue: updated,
    reason: update.changeReason,
  });

  // Invalidate cache
  await invalidateOverridesCache();

  return updated;
}
```

---

## Observability

### Prometheus Metrics

```typescript
// Routing decision metrics
const routingDecisionCounter = new Counter({
  name: 'routing_decisions_total',
  help: 'Total routing decisions made',
  labelNames: ['provider', 'reason', 'institution'],
});

const routingDecisionDuration = new Histogram({
  name: 'routing_decision_duration_ms',
  help: 'Time to make routing decision',
  buckets: [1, 5, 10, 25, 50, 100],
});

// Failover metrics
const failoverCounter = new Counter({
  name: 'routing_failovers_total',
  help: 'Total failovers from one provider to another',
  labelNames: ['from_provider', 'to_provider', 'error_code'],
});

// Provider health metrics
const providerHealthGauge = new Gauge({
  name: 'provider_health_score',
  help: 'Current health score by provider',
  labelNames: ['provider'],
});

// Override usage metrics
const overrideHitCounter = new Counter({
  name: 'routing_override_hits_total',
  help: 'Times routing overrides were applied',
  labelNames: ['override_pattern'],
});
```

### Structured Logging

```typescript
// Log format for routing events
logger.info('routing_decision', {
  decisionId: decision.id,
  institutionId: context.institutionId,
  selectedProvider: decision.selectedProvider,
  reason: decision.reason,
  candidateCount: decision.candidates.length,
  fallbackCount: decision.fallbackChain.length,
  decisionTimeMs: decisionTime,
  traceId: context.traceId,
});

logger.warn('routing_failover', {
  decisionId: decision.id,
  fromProvider: previousProvider,
  toProvider: nextProvider,
  errorCode: error.code,
  attemptNumber: attempt,
  traceId: context.traceId,
});
```

---

## Appendix: Quick Reference

### Default Provider Order
1. FDX (if supported)
2. Plaid
3. MX
4. Finicity

### Health Thresholds
- Healthy: ≥80
- Degraded: 50-79
- Unhealthy: <50

### Failover Rules
- Max 3 total attempts
- 5xx → retry once (1s delay) → failover
- 429 → wait if ≤60s, else failover
- Timeout → immediate failover
- Auth errors → no failover (user action needed)

### Key Overrides
- Fidelity → Finicity (401k)
- Chase → Plaid (stability)
- Credit unions → MX (coverage)
- FDX-enabled → FDX first (quality)
