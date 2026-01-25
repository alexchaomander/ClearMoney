# Consent Ledger + Token Vault

Version: 1.0.0
Last Updated: 2026-01-25

## Overview

This document defines the consent management and token storage architecture for the Context Graph API. The system ensures:

- **User Control**: Granular consent scopes with the ability to narrow or revoke at any time
- **Data Minimization**: Only access data that users have explicitly consented to
- **Secure Token Storage**: Provider credentials encrypted at rest with strict access controls
- **Audit Trail**: Complete history of consent changes and token access for compliance
- **Multi-Tenancy**: All consents and tokens scoped to apps, with tenant isolation

---

## Scope Model

### Scope Hierarchy

Users grant permission through granular scopes. Some scopes imply others (e.g., viewing balances requires knowing which accounts exist).

```
                                    ┌─────────────────┐
                                    │  identity:read  │ (standalone)
                                    └─────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                            accounts:read                                 │
│                          (foundation scope)                              │
└───────────┬──────────────────┬──────────────────┬──────────────────┬────┘
            │                  │                  │                  │
            ▼                  ▼                  ▼                  ▼
    ┌──────────────┐  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐
    │balances:read │  │transactions:   │  │investments:read│  │liabilities:read│
    └──────────────┘  │     read       │  └────────────────┘  └────────────────┘
                      └───────┬────────┘
                              │
                              ▼
                    ┌─────────────────────┐
                    │transactions:read:90d│
                    │   (time-limited)    │
                    └─────────────────────┘
```

### Scope Definitions

| Scope | Description | Implies | Data Accessed |
|-------|-------------|---------|---------------|
| `accounts:read` | View account names, types, and masked numbers | — | Account list, institution info |
| `balances:read` | View current and available balances | `accounts:read` | Current balance, available balance, credit limits |
| `transactions:read` | View full transaction history | `accounts:read` | All transactions (no time limit) |
| `transactions:read:90d` | View last 90 days of transactions | `accounts:read` | Transactions from last 90 days only |
| `investments:read` | View holdings, securities, cost basis | `accounts:read` (investment accounts only) | Holdings, securities, positions |
| `liabilities:read` | View loan details, rates, payment schedules | `accounts:read` (liability accounts only) | Loan balances, APR, payment info |
| `identity:read` | View personal information | — (standalone) | Name, email, phone, address |

### Scope Expansion Rules

```typescript
// Scope hierarchy for automatic expansion
const SCOPE_HIERARCHY: Record<string, string[]> = {
  'balances:read': ['accounts:read'],
  'transactions:read': ['accounts:read'],
  'transactions:read:90d': ['accounts:read'],
  'investments:read': ['accounts:read'],
  'liabilities:read': ['accounts:read'],
  'identity:read': [],  // Standalone, no dependencies
  'accounts:read': [],  // Base scope
};

// Expand scopes to include implied dependencies
function expandScopes(requestedScopes: string[]): string[] {
  const expanded = new Set<string>();

  for (const scope of requestedScopes) {
    expanded.add(scope);
    const implied = SCOPE_HIERARCHY[scope] || [];
    implied.forEach(s => expanded.add(s));
  }

  return Array.from(expanded);
}

// Check if a scope is valid for an account type
function isScopeValidForAccount(scope: string, accountType: AccountType): boolean {
  const investmentScopes = ['investments:read'];
  const liabilityScopes = ['liabilities:read'];

  if (investmentScopes.includes(scope)) {
    return ['investment', 'brokerage', '401k', 'ira'].includes(accountType);
  }

  if (liabilityScopes.includes(scope)) {
    return ['credit', 'loan', 'mortgage', 'student'].includes(accountType);
  }

  return true;  // Other scopes apply to all account types
}
```

### Time-Limited Scope Handling

```typescript
// Parse time-limited scopes
interface ParsedScope {
  base: string;
  timeLimit?: number;  // Days
}

function parseScope(scope: string): ParsedScope {
  const timeLimitMatch = scope.match(/^(.+):(\d+)d$/);
  if (timeLimitMatch) {
    return {
      base: timeLimitMatch[1],
      timeLimit: parseInt(timeLimitMatch[2], 10),
    };
  }
  return { base: scope };
}

// Apply time limits when querying data
function buildTransactionQuery(consent: Consent): TransactionQuery {
  const scope = consent.scopes.find(s => s.startsWith('transactions:read'));
  if (!scope) {
    throw new InsufficientScopeError('transactions:read');
  }

  const parsed = parseScope(scope);
  const query: TransactionQuery = {
    connectionId: consent.connectionId,
  };

  if (parsed.timeLimit) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parsed.timeLimit);
    query.startDate = startDate.toISOString().split('T')[0];
  }

  return query;
}
```

---

## Consent Ledger

### Schema Definition

```sql
-- Consent records table
-- Consents are scoped to apps via user_id FK (users belong to apps)
-- app_id is denormalized for query efficiency
CREATE TABLE consent_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Multi-tenancy: app_id denormalized from users table
  app_id UUID NOT NULL REFERENCES apps(id) ON DELETE CASCADE,

  -- User and connection
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  connection_id UUID REFERENCES connections(id) ON DELETE SET NULL,  -- NULL for pre-connection consent

  -- Granted permissions
  scopes TEXT[] NOT NULL,
  purpose TEXT NOT NULL,                    -- Human-readable: "Personal finance tracking"

  -- Consent timing
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,                   -- NULL = no expiration
  revoked_at TIMESTAMPTZ,
  revocation_reason TEXT,                   -- 'user_request', 'app_request', 'admin_action', 'expired'

  -- Request context (for audit)
  ip_address INET,
  user_agent TEXT,
  consent_version INTEGER NOT NULL DEFAULT 1,  -- For tracking terms/policy versions

  -- Audit columns
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT valid_scopes CHECK (
    scopes <@ ARRAY[
      'accounts:read',
      'balances:read',
      'transactions:read',
      'transactions:read:90d',
      'investments:read',
      'liabilities:read',
      'identity:read'
    ]::TEXT[]
  ),
  CONSTRAINT scopes_not_empty CHECK (array_length(scopes, 1) > 0),
  CONSTRAINT purpose_not_empty CHECK (length(trim(purpose)) > 0)
);

-- Ensure app_id matches user's app_id (tenant consistency)
-- Requires unique index on users(app_id, id) to support composite FK
CREATE UNIQUE INDEX idx_users_app_id_id ON users(app_id, id);

-- Composite FK ensures consent's app_id matches the user's app_id
ALTER TABLE consent_records ADD CONSTRAINT fk_consent_user_app
  FOREIGN KEY (app_id, user_id) REFERENCES users(app_id, id) ON DELETE CASCADE;

-- Index for active consents by user
CREATE INDEX idx_consent_active_user ON consent_records(app_id, user_id)
  WHERE revoked_at IS NULL AND (expires_at IS NULL OR expires_at > now());

-- Index for connection lookups
CREATE INDEX idx_consent_connection ON consent_records(connection_id)
  WHERE revoked_at IS NULL;

-- Index for expiration checks (background job)
CREATE INDEX idx_consent_expires ON consent_records(expires_at)
  WHERE revoked_at IS NULL AND expires_at IS NOT NULL;

-- Trigger to update updated_at
CREATE TRIGGER consent_records_updated_at
  BEFORE UPDATE ON consent_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Consent Record Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Unique consent identifier |
| `app_id` | UUID | App this consent belongs to (denormalized) |
| `user_id` | UUID | User who granted consent |
| `connection_id` | UUID | Associated connection (null for pre-connection) |
| `scopes` | TEXT[] | Array of granted scopes |
| `purpose` | TEXT | Human-readable consent purpose |
| `granted_at` | TIMESTAMPTZ | When consent was granted |
| `expires_at` | TIMESTAMPTZ | When consent expires (null = never) |
| `revoked_at` | TIMESTAMPTZ | When consent was revoked (null = active) |
| `revocation_reason` | TEXT | Why consent was revoked |
| `ip_address` | INET | IP address at time of consent |
| `user_agent` | TEXT | Browser/client info at time of consent |
| `consent_version` | INTEGER | Version of consent terms accepted |

---

## Consent Lifecycle

### State Machine

```
                              ┌────────────────────────────────────────┐
                              │                                        │
                              ▼                                        │
┌─────────────┐  user grants  ┌─────────────┐  user narrows  ┌─────────────┐
│   PENDING   │ ────────────► │   ACTIVE    │ ─────────────► │   ACTIVE    │
│ (pre-link)  │               │             │    scopes      │ (narrowed)  │
└─────────────┘               └──────┬──────┘                └──────┬──────┘
                                     │                              │
                    ┌────────────────┼────────────────┬─────────────┘
                    │                │                │
                    ▼                ▼                ▼
             ┌───────────┐    ┌───────────┐    ┌───────────┐
             │  REVOKED  │    │  EXPIRED  │    │  REVOKED  │
             │ (by user) │    │(by system)│    │ (by app)  │
             └───────────┘    └───────────┘    └───────────┘
                    │                │                │
                    └────────────────┼────────────────┘
                                     │
                                     ▼
                           ┌─────────────────┐
                           │  DATA DELETION  │
                           │    WORKFLOW     │
                           └─────────────────┘
```

### Lifecycle Operations

#### 1. Grant Consent

```typescript
interface ConsentGrantRequest {
  userId: string;
  scopes: string[];
  purpose: string;
  connectionId?: string;       // Optional: link to existing connection
  expiresAt?: string;          // Optional: ISO 8601 datetime
  consentVersion?: number;     // Terms version accepted
}

async function grantConsent(
  appId: string,
  request: ConsentGrantRequest,
  context: RequestContext
): Promise<ConsentRecord> {
  // Validate user belongs to app
  const user = await getUser(request.userId);
  if (user.appId !== appId) {
    throw new ForbiddenError('User does not belong to this app');
  }

  // Expand scopes to include implied dependencies
  const expandedScopes = expandScopes(request.scopes);

  // Create consent record
  const consent = await db.insert('consent_records', {
    appId,
    userId: request.userId,
    connectionId: request.connectionId,
    scopes: expandedScopes,
    purpose: request.purpose,
    expiresAt: request.expiresAt,
    consentVersion: request.consentVersion || CURRENT_CONSENT_VERSION,
    ipAddress: context.ipAddress,
    userAgent: context.userAgent,
  });

  // Audit log
  await logConsentEvent({
    eventType: 'consent_granted',
    appId,
    userId: request.userId,
    consentId: consent.id,
    scopesAffected: expandedScopes,
    actorType: 'user',
    actorId: request.userId,
    context,
  });

  // Webhook notification to app
  await sendWebhook(appId, {
    event: 'consent.granted',
    data: {
      consentId: consent.id,
      userId: request.userId,
      scopes: expandedScopes,
      grantedAt: consent.grantedAt,
    },
  });

  return consent;
}
```

#### 2. Query Active Consents

```typescript
interface ConsentQuery {
  userId?: string;
  connectionId?: string;
  includeExpired?: boolean;
  includeRevoked?: boolean;
}

async function queryConsents(appId: string, query: ConsentQuery): Promise<ConsentRecord[]> {
  let sql = `
    SELECT * FROM consent_records
    WHERE app_id = $1
  `;
  const params: any[] = [appId];
  let paramIndex = 2;

  if (query.userId) {
    sql += ` AND user_id = $${paramIndex++}`;
    params.push(query.userId);
  }

  if (query.connectionId) {
    sql += ` AND connection_id = $${paramIndex++}`;
    params.push(query.connectionId);
  }

  if (!query.includeRevoked) {
    sql += ` AND revoked_at IS NULL`;
  }

  if (!query.includeExpired) {
    sql += ` AND (expires_at IS NULL OR expires_at > now())`;
  }

  sql += ` ORDER BY granted_at DESC`;

  return db.query(sql, params);
}
```

#### 3. Narrow Scopes

Users can reduce their consented scopes but never expand without re-authentication.

```typescript
interface ScopeNarrowRequest {
  scopes: string[];  // New (reduced) scope set
}

async function narrowScopes(
  appId: string,
  consentId: string,
  request: ScopeNarrowRequest,
  context: RequestContext
): Promise<ConsentRecord> {
  const consent = await getConsent(consentId);

  // Verify ownership
  if (consent.appId !== appId) {
    throw new ForbiddenError('Consent does not belong to this app');
  }

  if (consent.revokedAt) {
    throw new ConflictError('Consent has already been revoked');
  }

  // Verify this is a narrowing operation (subset of existing scopes)
  const newScopes = new Set(request.scopes);
  const currentScopes = new Set(consent.scopes);

  for (const scope of newScopes) {
    if (!currentScopes.has(scope)) {
      throw new BadRequestError(
        `Cannot add new scope '${scope}'. Narrowing can only remove scopes.`
      );
    }
  }

  if (newScopes.size === 0) {
    throw new BadRequestError('Cannot remove all scopes. Use revoke instead.');
  }

  const removedScopes = consent.scopes.filter(s => !newScopes.has(s));

  // Update consent
  const updated = await db.update('consent_records', consentId, {
    scopes: Array.from(newScopes),
    updatedAt: new Date(),
  });

  // Audit log
  await logConsentEvent({
    eventType: 'scope_narrowed',
    appId,
    userId: consent.userId,
    consentId,
    scopesAffected: removedScopes,
    metadata: {
      previousScopes: consent.scopes,
      newScopes: Array.from(newScopes),
    },
    actorType: 'user',
    actorId: consent.userId,
    context,
  });

  // Trigger data deletion for removed scopes
  if (consent.connectionId) {
    await enqueueDataDeletion({
      connectionId: consent.connectionId,
      scopesRevoked: removedScopes,
      reason: 'scope_narrowed',
    });
  }

  // Webhook notification
  await sendWebhook(appId, {
    event: 'consent.narrowed',
    data: {
      consentId,
      userId: consent.userId,
      previousScopes: consent.scopes,
      newScopes: Array.from(newScopes),
      removedScopes,
    },
  });

  return updated;
}
```

#### 4. Revoke Consent

```typescript
interface ConsentRevokeRequest {
  reason?: string;
}

async function revokeConsent(
  appId: string,
  consentId: string,
  request: ConsentRevokeRequest,
  context: RequestContext
): Promise<void> {
  const consent = await getConsent(consentId);

  // Verify ownership
  if (consent.appId !== appId) {
    throw new ForbiddenError('Consent does not belong to this app');
  }

  if (consent.revokedAt) {
    return;  // Already revoked, idempotent
  }

  // Mark as revoked
  await db.update('consent_records', consentId, {
    revokedAt: new Date(),
    revocationReason: request.reason || 'user_request',
    updatedAt: new Date(),
  });

  // Audit log
  await logConsentEvent({
    eventType: 'consent_revoked',
    appId,
    userId: consent.userId,
    consentId,
    connectionId: consent.connectionId,
    scopesAffected: consent.scopes,
    metadata: { reason: request.reason },
    actorType: context.actorType,
    actorId: context.actorId,
    context,
  });

  // Trigger full data deletion workflow
  if (consent.connectionId) {
    await enqueueDataDeletion({
      connectionId: consent.connectionId,
      scopesRevoked: consent.scopes,
      reason: 'consent_revoked',
      fullRevocation: true,
    });
  }

  // Webhook notification
  await sendWebhook(appId, {
    event: 'consent.revoked',
    data: {
      consentId,
      userId: consent.userId,
      connectionId: consent.connectionId,
      scopes: consent.scopes,
      revokedAt: new Date().toISOString(),
      reason: request.reason,
    },
  });
}
```

#### 5. Expiration Handler (Background Job)

```typescript
// Runs every hour
async function processExpiredConsents(): Promise<void> {
  const expiredConsents = await db.query(`
    SELECT * FROM consent_records
    WHERE revoked_at IS NULL
      AND expires_at IS NOT NULL
      AND expires_at <= now()
    LIMIT 100
  `);

  for (const consent of expiredConsents) {
    await db.update('consent_records', consent.id, {
      revokedAt: consent.expiresAt,
      revocationReason: 'expired',
      updatedAt: new Date(),
    });

    await logConsentEvent({
      eventType: 'consent_expired',
      appId: consent.appId,
      userId: consent.userId,
      consentId: consent.id,
      scopesAffected: consent.scopes,
      actorType: 'system',
      actorId: 'expiration_job',
    });

    // Trigger data deletion
    if (consent.connectionId) {
      await enqueueDataDeletion({
        connectionId: consent.connectionId,
        scopesRevoked: consent.scopes,
        reason: 'consent_expired',
        fullRevocation: true,
      });
    }

    // Notify app
    await sendWebhook(consent.appId, {
      event: 'consent.expired',
      data: {
        consentId: consent.id,
        userId: consent.userId,
        expiredAt: consent.expiresAt,
      },
    });
  }
}
```

---

## Data Deletion Flow

### Deletion Workflow

When consent is revoked or scopes are narrowed, the platform must delete associated data.

```
┌─────────────────────┐
│  Consent Revoked/   │
│   Scopes Narrowed   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Enqueue Deletion   │
│       Job           │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Delete Data by     │◄────────────────────┐
│  Revoked Scopes     │                     │
└──────────┬──────────┘                     │
           │                                │
           ▼                                │
    ┌──────────────┐                        │
    │ Full Revoke? │───── No ──────────────►│
    └──────┬───────┘                        │
           │                                │
          Yes                               │
           │                                │
           ▼                                │
┌─────────────────────┐                     │
│  Revoke Provider    │                     │
│      Tokens         │                     │
└──────────┬──────────┘                     │
           │                                │
           ▼                                │
┌─────────────────────┐                     │
│  Delete Connection  │                     │
│      Record         │                     │
└──────────┬──────────┘                     │
           │                                │
           ▼                                │
┌─────────────────────┐                     │
│  Log Deletion in    │◄────────────────────┘
│    Audit Trail      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Send Webhook:     │
│   data.deleted      │
└─────────────────────┘
```

### Deletion Job Implementation

```typescript
interface DataDeletionJob {
  connectionId: string;
  scopesRevoked: string[];
  reason: 'scope_narrowed' | 'consent_revoked' | 'consent_expired' | 'admin_action';
  fullRevocation: boolean;
  requestedAt: string;
}

async function processDataDeletion(job: DataDeletionJob): Promise<DeletionResult> {
  const connection = await getConnection(job.connectionId);
  const deletionRecords: DeletionRecord[] = [];

  // Map scopes to data tables
  const scopeDataMap: Record<string, string[]> = {
    'transactions:read': ['transactions'],
    'transactions:read:90d': ['transactions'],
    'balances:read': ['balances'],
    'investments:read': ['holdings', 'securities'],
    'liabilities:read': ['liabilities'],
    'identity:read': ['user_identity'],
    'accounts:read': [],  // Account shells may be retained
  };

  // Delete data for each revoked scope
  for (const scope of job.scopesRevoked) {
    const tables = scopeDataMap[scope] || [];
    for (const table of tables) {
      const deletedCount = await db.delete(table, {
        connectionId: job.connectionId,
      });

      deletionRecords.push({
        table,
        scope,
        deletedCount,
        deletedAt: new Date().toISOString(),
      });
    }
  }

  // Full revocation: also delete tokens and connection
  if (job.fullRevocation) {
    // Revoke provider tokens
    await revokeProviderTokens(connection);

    // Delete from token vault
    await db.delete('token_vault', { connectionId: job.connectionId });
    deletionRecords.push({
      table: 'token_vault',
      scope: 'all',
      deletedCount: 1,
      deletedAt: new Date().toISOString(),
    });

    // Soft-delete connection (keep for audit trail)
    await db.update('connections', job.connectionId, {
      deletedAt: new Date(),
      deletionReason: job.reason,
    });
  }

  // Log deletion in audit trail
  await logConsentEvent({
    eventType: 'data_deleted',
    appId: connection.appId,
    userId: connection.userId,
    connectionId: job.connectionId,
    scopesAffected: job.scopesRevoked,
    metadata: {
      reason: job.reason,
      deletionRecords,
      fullRevocation: job.fullRevocation,
    },
    actorType: 'system',
    actorId: 'deletion_worker',
  });

  return {
    connectionId: job.connectionId,
    deletionRecords,
    completedAt: new Date().toISOString(),
  };
}

// Revoke tokens with provider (FDX, etc.)
async function revokeProviderTokens(connection: Connection): Promise<void> {
  const tokenRecord = await getTokenFromVault(connection.id);
  if (!tokenRecord) return;

  const provider = getProviderAdapter(tokenRecord.provider);

  try {
    // Call provider's revocation endpoint
    await provider.revokeAccess({
      accessToken: await decryptToken(tokenRecord.accessTokenEncrypted),
    });
  } catch (error) {
    // Log but don't fail - we'll delete our tokens regardless
    logger.warn('provider_revocation_failed', {
      connectionId: connection.id,
      provider: tokenRecord.provider,
      error: error.message,
    });
  }
}
```

### Deletion Timeline

| Phase | Timeline | Actions |
|-------|----------|---------|
| **Immediate** | 0-5 minutes | Consent marked revoked, deletion job enqueued |
| **Fast Delete** | 5-60 minutes | Transactions, balances, holdings deleted |
| **Token Revocation** | 1-4 hours | Provider tokens revoked (may require retries) |
| **Completion** | < 24 hours | All data deleted, webhook sent, audit logged |
| **SLA** | **24 hours max** | Regulatory requirement for deletion completion |

### Deletion Job Queue

```sql
CREATE TABLE deletion_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID NOT NULL,
  scopes_revoked TEXT[] NOT NULL,
  reason TEXT NOT NULL,
  full_revocation BOOLEAN NOT NULL DEFAULT false,

  -- Job status
  status TEXT NOT NULL DEFAULT 'pending',  -- pending, processing, completed, failed
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 5,
  last_error TEXT,

  -- Timing
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  next_retry_at TIMESTAMPTZ,

  -- Results
  deletion_records JSONB
);

CREATE INDEX idx_deletion_jobs_pending ON deletion_jobs(next_retry_at)
  WHERE status IN ('pending', 'failed') AND attempts < max_attempts;
```

---

## Token Vault

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          Context Graph API                               │
│                        (API Servers - No Token Access)                   │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     │ Internal RPC
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           Token Service                                  │
│                    (Only service with vault access)                      │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐         │
│  │ Token Encrypt/  │  │  Provider API   │  │  Access Logging │         │
│  │    Decrypt      │  │     Proxy       │  │                 │         │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘         │
└───────────┼─────────────────────┼─────────────────────┼─────────────────┘
            │                     │                     │
            ▼                     ▼                     ▼
┌───────────────────┐  ┌───────────────────┐  ┌───────────────────┐
│    AWS KMS        │  │ Provider APIs     │  │   Audit Log       │
│ (Key Management)  │  │ (Plaid, MX, etc.) │  │   (PostgreSQL)    │
└───────────────────┘  └───────────────────┘  └───────────────────┘
            │
            ▼
┌───────────────────────────────────────────────────────────────────────┐
│                         Token Vault Table                              │
│                    (Encrypted at rest, restricted access)              │
└───────────────────────────────────────────────────────────────────────┘
```

### Token Vault Schema

```sql
-- Token vault table
-- CRITICAL: Access restricted to token_service_role only
CREATE TABLE token_vault (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Connection reference
  connection_id UUID NOT NULL UNIQUE REFERENCES connections(id) ON DELETE CASCADE,

  -- Provider info
  provider TEXT NOT NULL,
  provider_item_id TEXT,              -- Provider's item/connection ID

  -- Encrypted tokens (AES-256-GCM)
  access_token_encrypted BYTEA NOT NULL,
  refresh_token_encrypted BYTEA,
  access_token_expires_at TIMESTAMPTZ,

  -- Encryption metadata
  key_id TEXT NOT NULL,               -- KMS key ID used for encryption
  encryption_version INTEGER NOT NULL DEFAULT 1,

  -- Provider-specific data (encrypted JSON)
  provider_metadata_encrypted BYTEA,  -- Additional provider-specific fields

  -- Audit columns
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_accessed_at TIMESTAMPTZ,
  access_count INTEGER NOT NULL DEFAULT 0
);

-- NO indexes on encrypted columns (security)
-- Only index on connection_id for lookups
CREATE INDEX idx_token_vault_connection ON token_vault(connection_id);

-- Index for key rotation queries
CREATE INDEX idx_token_vault_key_id ON token_vault(key_id);

-- Restrict access to token_service_role
REVOKE ALL ON token_vault FROM PUBLIC;
REVOKE ALL ON token_vault FROM app_api_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON token_vault TO token_service_role;

-- Trigger to update timestamps
CREATE TRIGGER token_vault_updated_at
  BEFORE UPDATE ON token_vault
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Note: Token access tracking (last_accessed_at, access_count) is handled at the
-- application layer in TokenServiceImpl.executeProviderCall(), not via database
-- triggers. PostgreSQL triggers cannot fire on SELECT, so access auditing must
-- be done when the TokenService reads and decrypts tokens. The application
-- explicitly updates these fields after each successful token decryption.
```

### Encryption Implementation

```typescript
import { KMSClient, EncryptCommand, DecryptCommand, GenerateDataKeyCommand } from '@aws-sdk/client-kms';

const kmsClient = new KMSClient({ region: process.env.AWS_REGION });

// KMS key configuration
const KMS_CONFIG = {
  keyAlias: `alias/context-graph-tokens-${process.env.ENVIRONMENT}`,
  algorithm: 'AES_256',
  encryptionContext: {
    service: 'context-graph',
    component: 'token-vault',
  },
};

// Encrypted payload with clearly separated components
// Note: encryptedDataKey and ciphertext are stored separately to avoid
// hardcoded size assumptions about KMS encrypted data key length
interface EncryptedPayload {
  encryptedDataKey: Buffer;  // KMS-encrypted data encryption key
  ciphertext: Buffer;        // AES-256-GCM encrypted data
  nonce: Buffer;             // 12 bytes for AES-GCM
  authTag: Buffer;           // 16 bytes for AES-GCM
  keyId: string;             // KMS key ID for audit/rotation
}

// Encrypt a token using envelope encryption
async function encryptToken(plaintext: string): Promise<EncryptedPayload> {
  // Generate a data key from KMS
  const generateKeyCommand = new GenerateDataKeyCommand({
    KeyId: KMS_CONFIG.keyAlias,
    KeySpec: KMS_CONFIG.algorithm,
    EncryptionContext: KMS_CONFIG.encryptionContext,
  });

  const { Plaintext: dataKey, CiphertextBlob: encryptedDataKey, KeyId } =
    await kmsClient.send(generateKeyCommand);

  if (!dataKey || !encryptedDataKey || !KeyId) {
    throw new Error('Failed to generate data key from KMS');
  }

  // Use the plaintext data key to encrypt locally with AES-256-GCM
  const nonce = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', dataKey, nonce);

  const ciphertext = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  // Zero out the plaintext data key from memory
  dataKey.fill(0);

  return {
    encryptedDataKey: Buffer.from(encryptedDataKey),
    ciphertext,
    nonce,
    authTag,
    keyId: KeyId,
  };
}

// Decrypt a token
async function decryptToken(payload: EncryptedPayload): Promise<string> {
  // Decrypt the data key using KMS
  const decryptCommand = new DecryptCommand({
    CiphertextBlob: payload.encryptedDataKey,
    EncryptionContext: KMS_CONFIG.encryptionContext,
  });

  const { Plaintext: dataKey } = await kmsClient.send(decryptCommand);

  if (!dataKey) {
    throw new Error('Failed to decrypt data key from KMS');
  }

  // Use the plaintext data key to decrypt locally
  const decipher = crypto.createDecipheriv('aes-256-gcm', dataKey, payload.nonce);
  decipher.setAuthTag(payload.authTag);

  const decrypted = Buffer.concat([
    decipher.update(payload.ciphertext),
    decipher.final(),
  ]);

  // Zero out the plaintext data key from memory
  dataKey.fill(0);

  return decrypted.toString('utf8');
}

// Serialize EncryptedPayload for database storage (as JSONB or concatenated BYTEA)
function serializeEncryptedPayload(payload: EncryptedPayload): Buffer {
  // Format: [4-byte DEK length][encryptedDataKey][ciphertext][nonce][authTag]
  const dekLength = Buffer.alloc(4);
  dekLength.writeUInt32BE(payload.encryptedDataKey.length, 0);

  return Buffer.concat([
    dekLength,
    payload.encryptedDataKey,
    payload.ciphertext,
    payload.nonce,
    payload.authTag,
  ]);
}

// Deserialize from database storage
function deserializeEncryptedPayload(data: Buffer, keyId: string): EncryptedPayload {
  const dekLength = data.readUInt32BE(0);
  let offset = 4;

  const encryptedDataKey = data.slice(offset, offset + dekLength);
  offset += dekLength;

  // Remaining: ciphertext + nonce (12) + authTag (16)
  const ciphertext = data.slice(offset, data.length - 28);
  const nonce = data.slice(data.length - 28, data.length - 16);
  const authTag = data.slice(data.length - 16);

  return { encryptedDataKey, ciphertext, nonce, authTag, keyId };
}
```

### Token Service Interface

```typescript
// TokenService - the ONLY service that can access the token vault
interface TokenService {
  // Store tokens after link flow
  storeTokens(params: StoreTokensParams): Promise<void>;

  // Execute a provider API call (tokens never leave this service)
  executeProviderCall<T>(params: ProviderCallParams): Promise<T>;

  // Refresh tokens proactively
  refreshTokens(connectionId: string): Promise<void>;

  // Revoke and delete tokens
  revokeTokens(connectionId: string): Promise<void>;
}

interface StoreTokensParams {
  connectionId: string;
  provider: ProviderType;
  providerItemId: string;
  accessToken: string;
  refreshToken?: string;
  accessTokenExpiresAt?: string;
  providerMetadata?: Record<string, any>;
}

interface ProviderCallParams {
  connectionId: string;
  operation: string;           // e.g., 'syncTransactions', 'syncAccounts'
  params: Record<string, any>;
  requestId: string;           // For audit trail
  callerService: string;       // Which service is requesting
  _isRetryAfterRefresh?: boolean;  // Internal: prevents infinite refresh loops
}

// Implementation
class TokenServiceImpl implements TokenService {
  async storeTokens(params: StoreTokensParams): Promise<void> {
    const encryptedAccess = await encryptToken(params.accessToken);
    const encryptedRefresh = params.refreshToken
      ? await encryptToken(params.refreshToken)
      : null;
    const encryptedMetadata = params.providerMetadata
      ? await encryptToken(JSON.stringify(params.providerMetadata))
      : null;

    await db.upsert('token_vault', {
      connectionId: params.connectionId,
      provider: params.provider,
      providerItemId: params.providerItemId,
      accessTokenEncrypted: serializeEncryptedPayload(encryptedAccess),
      refreshTokenEncrypted: encryptedRefresh
        ? serializeEncryptedPayload(encryptedRefresh)
        : null,
      accessTokenExpiresAt: params.accessTokenExpiresAt,
      keyId: encryptedAccess.keyId,
      providerMetadataEncrypted: encryptedMetadata
        ? serializeEncryptedPayload(encryptedMetadata)
        : null,
    });

    // Audit log
    await this.logTokenAccess({
      eventType: 'token_stored',
      connectionId: params.connectionId,
      provider: params.provider,
    });
  }

  async executeProviderCall<T>(params: ProviderCallParams): Promise<T> {
    // Get and decrypt tokens
    const tokenRecord = await db.queryOne(
      'SELECT * FROM token_vault WHERE connection_id = $1',
      [params.connectionId]
    );

    if (!tokenRecord) {
      throw new NotFoundError('No tokens found for connection');
    }

    // Check if token needs refresh (but only if we haven't just refreshed)
    // The _isRetryAfterRefresh flag prevents infinite loops if refresh fails
    // to update expiration or there's clock skew
    if (this.isTokenExpiringSoon(tokenRecord.access_token_expires_at) && !params._isRetryAfterRefresh) {
      await this.refreshTokens(params.connectionId);
      // Re-fetch with flag to prevent another refresh attempt
      return this.executeProviderCall({ ...params, _isRetryAfterRefresh: true });
    }

    const accessToken = await decryptToken(
      deserializeEncryptedPayload(tokenRecord.access_token_encrypted, tokenRecord.key_id)
    );

    // Update access tracking (application-level, since triggers can't fire on SELECT)
    await db.query(
      'UPDATE token_vault SET last_accessed_at = now(), access_count = access_count + 1 WHERE id = $1',
      [tokenRecord.id]
    );

    // Audit log the access
    await this.logTokenAccess({
      eventType: 'token_accessed',
      connectionId: params.connectionId,
      provider: tokenRecord.provider,
      operation: params.operation,
      requestId: params.requestId,
      callerService: params.callerService,
    });

    // Execute the provider call
    const provider = getProviderAdapter(tokenRecord.provider);
    return provider.execute({
      operation: params.operation,
      accessToken,
      params: params.params,
    });
  }

  private isTokenExpiringSoon(expiresAt: string | null): boolean {
    if (!expiresAt) return false;
    const expiry = new Date(expiresAt);
    const bufferMinutes = 5;
    return expiry.getTime() - Date.now() < bufferMinutes * 60 * 1000;
  }
}
```

---

## Key Rotation Strategy

### Rotation Schedule

| Key Type | Rotation Period | Automatic | Notes |
|----------|-----------------|-----------|-------|
| KMS Master Key | 365 days | Yes (AWS managed) | Automatic rotation in KMS |
| Data Encryption Keys | On each token write | Yes | New DEK per encryption |
| API Keys (apps) | Manual | No | Apps rotate on demand |

### Key Rotation Process

```typescript
// Key rotation is largely automatic with envelope encryption
// KMS handles master key rotation; DEKs are generated per-encryption

// For manual re-encryption (e.g., after security incident):
async function reEncryptAllTokens(newKeyAlias: string): Promise<void> {
  const batchSize = 100;
  let offset = 0;

  while (true) {
    const tokens = await db.query(`
      SELECT id, connection_id, access_token_encrypted, refresh_token_encrypted,
             provider_metadata_encrypted
      FROM token_vault
      ORDER BY id
      LIMIT $1 OFFSET $2
    `, [batchSize, offset]);

    if (tokens.length === 0) break;

    for (const token of tokens) {
      // Decrypt with old key
      const accessToken = await decryptToken(
        deserializeEncrypted(token.access_token_encrypted)
      );
      const refreshToken = token.refresh_token_encrypted
        ? await decryptToken(deserializeEncrypted(token.refresh_token_encrypted))
        : null;

      // Re-encrypt with new key
      const newAccessEncrypted = await encryptTokenWithKey(accessToken, newKeyAlias);
      const newRefreshEncrypted = refreshToken
        ? await encryptTokenWithKey(refreshToken, newKeyAlias)
        : null;

      // Update record
      await db.update('token_vault', token.id, {
        accessTokenEncrypted: serializeEncrypted(newAccessEncrypted),
        refreshTokenEncrypted: newRefreshEncrypted
          ? serializeEncrypted(newRefreshEncrypted)
          : null,
        keyId: newAccessEncrypted.keyId,
        encryptionVersion: token.encryption_version + 1,
      });
    }

    offset += batchSize;
    logger.info('key_rotation_progress', { processed: offset });
  }

  logger.info('key_rotation_complete', { totalReEncrypted: offset });
}
```

### Key Management Best Practices

1. **Never delete old KMS keys** — Old keys needed to decrypt historical data
2. **Enable KMS key audit logging** — CloudTrail for all key usage
3. **Use separate keys per environment** — Dev, staging, production isolation
4. **Implement key access policies** — Only TokenService IAM role can use keys
5. **Monitor for anomalies** — Alert on unusual decryption patterns

---

## Access Control Model

### Role-Based Access

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Access Control Matrix                            │
├─────────────────────┬───────────────┬───────────────┬───────────────────┤
│       Role          │ Token Vault   │ Consent Ledger│ Audit Logs        │
├─────────────────────┼───────────────┼───────────────┼───────────────────┤
│ token_service_role  │ READ/WRITE    │ READ          │ WRITE             │
│ api_service_role    │ NONE          │ READ/WRITE    │ WRITE             │
│ admin_role          │ NONE          │ READ          │ READ              │
│ audit_role          │ NONE          │ READ          │ READ              │
│ public              │ NONE          │ NONE          │ NONE              │
└─────────────────────┴───────────────┴───────────────┴───────────────────┘
```

### Database Role Setup

```sql
-- Create roles
CREATE ROLE token_service_role;
CREATE ROLE api_service_role;
CREATE ROLE admin_role;
CREATE ROLE audit_role;

-- Token vault: only token_service_role
REVOKE ALL ON token_vault FROM PUBLIC;
GRANT SELECT, INSERT, UPDATE, DELETE ON token_vault TO token_service_role;

-- Consent records: api and admin can read, api can write
GRANT SELECT, INSERT, UPDATE ON consent_records TO api_service_role;
GRANT SELECT ON consent_records TO admin_role;
GRANT SELECT ON consent_records TO audit_role;

-- Audit logs: token and api can write, admin and audit can read
GRANT INSERT ON consent_audit_log TO token_service_role;
GRANT INSERT ON consent_audit_log TO api_service_role;
GRANT SELECT ON consent_audit_log TO admin_role;
GRANT SELECT ON consent_audit_log TO audit_role;

-- Row-level security for multi-tenancy
ALTER TABLE consent_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_audit_log ENABLE ROW LEVEL SECURITY;

-- Apps can only see their own data
CREATE POLICY consent_app_isolation ON consent_records
  FOR ALL
  USING (app_id = current_setting('app.current_app_id')::UUID);

CREATE POLICY audit_app_isolation ON consent_audit_log
  FOR ALL
  USING (app_id = current_setting('app.current_app_id')::UUID);
```

### Service Authentication

```typescript
// Service-to-service authentication for TokenService
interface ServiceAuthConfig {
  // mTLS for service-to-service
  mtls: {
    enabled: true;
    certPath: '/etc/ssl/service-cert.pem';
    keyPath: '/etc/ssl/service-key.pem';
    caPath: '/etc/ssl/ca-cert.pem';
  };

  // Additional JWT validation for requests
  jwt: {
    issuer: 'context-graph-api';
    audience: 'token-service';
    algorithm: 'RS256';
  };
}

// Middleware to validate service calls
async function validateServiceCall(req: Request): Promise<ServiceIdentity> {
  // 1. Verify mTLS client certificate
  const clientCert = req.socket.getPeerCertificate();
  if (!clientCert || !isValidServiceCert(clientCert)) {
    throw new UnauthorizedError('Invalid service certificate');
  }

  // 2. Verify JWT token
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    throw new UnauthorizedError('Missing service token');
  }

  const payload = await verifyServiceJwt(token);

  // 3. Return service identity
  return {
    serviceName: payload.sub,
    permissions: payload.permissions,
    requestId: payload.jti,
  };
}
```

---

## Audit Log

### Schema Definition

```sql
CREATE TABLE consent_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Multi-tenancy
  app_id UUID NOT NULL REFERENCES apps(id),

  -- Event details
  event_type TEXT NOT NULL,
  -- Valid types: 'consent_granted', 'consent_revoked', 'consent_expired',
  --              'scope_narrowed', 'token_stored', 'token_accessed',
  --              'token_refreshed', 'token_revoked', 'data_deleted'

  -- Entity references
  user_id UUID,
  connection_id UUID,
  consent_id UUID,

  -- Actor information
  actor_type TEXT NOT NULL,        -- 'user', 'system', 'admin', 'app', 'service'
  actor_id TEXT,                   -- User ID, service name, etc.

  -- Event details
  scopes_affected TEXT[],
  metadata JSONB,                  -- Additional context (previous/new values, etc.)

  -- Request context
  ip_address INET,
  user_agent TEXT,
  request_id UUID,
  trace_id TEXT,                   -- Distributed tracing ID

  -- Timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for common query patterns
CREATE INDEX idx_audit_app_created ON consent_audit_log(app_id, created_at DESC);
CREATE INDEX idx_audit_user ON consent_audit_log(user_id, created_at DESC)
  WHERE user_id IS NOT NULL;
CREATE INDEX idx_audit_connection ON consent_audit_log(connection_id, created_at DESC)
  WHERE connection_id IS NOT NULL;
CREATE INDEX idx_audit_consent ON consent_audit_log(consent_id, created_at DESC)
  WHERE consent_id IS NOT NULL;
CREATE INDEX idx_audit_event_type ON consent_audit_log(event_type, created_at DESC);

-- Partition by month for efficient archival
-- (Implementation depends on PostgreSQL version)
```

### Audit Event Types

| Event Type | Description | Key Metadata |
|------------|-------------|--------------|
| `consent_granted` | User granted new consent | scopes, purpose, consent_version |
| `consent_revoked` | Consent revoked | reason, scopes_revoked |
| `consent_expired` | Consent auto-expired | expiration_date |
| `scope_narrowed` | User reduced scopes | previous_scopes, new_scopes |
| `token_stored` | New tokens encrypted and stored | provider |
| `token_accessed` | Tokens decrypted for API call | operation, caller_service |
| `token_refreshed` | Access token refreshed | provider |
| `token_revoked` | Tokens revoked with provider | provider |
| `data_deleted` | User data deleted | deletion_records, reason |

### Logging Implementation

```typescript
interface AuditLogEntry {
  eventType: string;
  appId: string;
  userId?: string;
  connectionId?: string;
  consentId?: string;
  actorType: 'user' | 'system' | 'admin' | 'app' | 'service';
  actorId?: string;
  scopesAffected?: string[];
  metadata?: Record<string, any>;
  context?: RequestContext;
}

async function logConsentEvent(entry: AuditLogEntry): Promise<void> {
  await db.insert('consent_audit_log', {
    appId: entry.appId,
    eventType: entry.eventType,
    userId: entry.userId,
    connectionId: entry.connectionId,
    consentId: entry.consentId,
    actorType: entry.actorType,
    actorId: entry.actorId,
    scopesAffected: entry.scopesAffected,
    metadata: entry.metadata,
    ipAddress: entry.context?.ipAddress,
    userAgent: entry.context?.userAgent,
    requestId: entry.context?.requestId,
    traceId: entry.context?.traceId,
  });

  // Also emit to structured logging for real-time monitoring
  logger.info('consent_audit', {
    event_type: entry.eventType,
    app_id: entry.appId,
    user_id: entry.userId,
    consent_id: entry.consentId,
    actor_type: entry.actorType,
    request_id: entry.context?.requestId,
  });
}
```

### Retention Policy

| Age | Storage | Access | Notes |
|-----|---------|--------|-------|
| 0-30 days | Hot (PostgreSQL) | Full query | Real-time access |
| 30-365 days | Warm (PostgreSQL archive partition) | Query with delay | Partitioned tables |
| 1-7 years | Cold (S3 Glacier) | Restore on request | Regulatory retention |
| 7+ years | Delete | — | Unless legal hold |

```typescript
// Archival job (runs monthly)
async function archiveOldAuditLogs(): Promise<void> {
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  // Export to S3
  const records = await db.query(`
    SELECT * FROM consent_audit_log
    WHERE created_at < $1
    ORDER BY created_at
  `, [oneYearAgo]);

  const s3Key = `audit-archive/${oneYearAgo.toISOString().slice(0, 7)}.jsonl.gz`;
  await uploadToS3Glacier(s3Key, records);

  // Delete from PostgreSQL
  await db.query(`
    DELETE FROM consent_audit_log
    WHERE created_at < $1
  `, [oneYearAgo]);

  logger.info('audit_archive_complete', {
    recordsArchived: records.length,
    s3Key,
    cutoffDate: oneYearAgo.toISOString(),
  });
}
```

---

## Consent Management API

### Endpoints

#### List User Consents

```yaml
GET /v1/users/{user_id}/consents:
  summary: List active consents for a user
  security:
    - ApiKey: []
  parameters:
    - name: user_id
      in: path
      required: true
      schema:
        type: string
    - name: include_expired
      in: query
      schema:
        type: boolean
        default: false
    - name: include_revoked
      in: query
      schema:
        type: boolean
        default: false
  responses:
    '200':
      description: List of consents
      content:
        application/json:
          schema:
            type: object
            properties:
              consents:
                type: array
                items:
                  $ref: '#/components/schemas/Consent'
```

#### Get Consent Details

```yaml
GET /v1/consents/{consent_id}:
  summary: Get consent details
  security:
    - ApiKey: []
  parameters:
    - name: consent_id
      in: path
      required: true
      schema:
        type: string
  responses:
    '200':
      description: Consent details
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Consent'
    '404':
      description: Consent not found
```

#### Narrow Consent Scopes

```yaml
PATCH /v1/consents/{consent_id}:
  summary: Narrow consent scopes (can only remove, not add)
  security:
    - ApiKey: []
  parameters:
    - name: consent_id
      in: path
      required: true
      schema:
        type: string
  requestBody:
    required: true
    content:
      application/json:
        schema:
          type: object
          required:
            - scopes
          properties:
            scopes:
              type: array
              items:
                type: string
              description: New (reduced) set of scopes
  responses:
    '200':
      description: Consent updated
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Consent'
    '400':
      description: Invalid scope change (cannot add scopes)
```

#### Revoke Consent

```yaml
DELETE /v1/consents/{consent_id}:
  summary: Revoke consent and trigger data deletion
  security:
    - ApiKey: []
  parameters:
    - name: consent_id
      in: path
      required: true
      schema:
        type: string
  requestBody:
    content:
      application/json:
        schema:
          type: object
          properties:
            reason:
              type: string
              description: Reason for revocation
  responses:
    '204':
      description: Consent revoked successfully
    '404':
      description: Consent not found
```

#### Get Consent Audit History

```yaml
GET /v1/users/{user_id}/consents/audit:
  summary: View consent change history for a user
  security:
    - ApiKey: []
  parameters:
    - name: user_id
      in: path
      required: true
      schema:
        type: string
    - name: limit
      in: query
      schema:
        type: integer
        default: 50
        maximum: 100
    - name: cursor
      in: query
      schema:
        type: string
  responses:
    '200':
      description: Audit log entries
      content:
        application/json:
          schema:
            type: object
            properties:
              events:
                type: array
                items:
                  $ref: '#/components/schemas/AuditLogEntry'
              next_cursor:
                type: string
```

### Response Schemas

```yaml
components:
  schemas:
    Consent:
      type: object
      required:
        - id
        - user_id
        - scopes
        - purpose
        - granted_at
        - status
      properties:
        id:
          type: string
          format: uuid
        user_id:
          type: string
          format: uuid
        connection_id:
          type: string
          format: uuid
          nullable: true
        scopes:
          type: array
          items:
            type: string
            enum:
              - accounts:read
              - balances:read
              - transactions:read
              - transactions:read:90d
              - investments:read
              - liabilities:read
              - identity:read
        purpose:
          type: string
        granted_at:
          type: string
          format: date-time
        expires_at:
          type: string
          format: date-time
          nullable: true
        status:
          type: string
          enum: [active, expired, revoked]
        consent_version:
          type: integer

    AuditLogEntry:
      type: object
      required:
        - id
        - event_type
        - actor_type
        - created_at
      properties:
        id:
          type: string
          format: uuid
        event_type:
          type: string
        user_id:
          type: string
          format: uuid
          nullable: true
        connection_id:
          type: string
          format: uuid
          nullable: true
        consent_id:
          type: string
          format: uuid
          nullable: true
        actor_type:
          type: string
          enum: [user, system, admin, app, service]
        actor_id:
          type: string
          nullable: true
        scopes_affected:
          type: array
          items:
            type: string
          nullable: true
        created_at:
          type: string
          format: date-time
```

---

## Encryption Specification Summary

| Data Type | Encryption Method | Key Management | Notes |
|-----------|-------------------|----------------|-------|
| **Provider Tokens** | AES-256-GCM (envelope encryption) | AWS KMS per-environment | Encrypted at application layer |
| **Consent Records** | None (not sensitive) | — | Contains no secrets |
| **Transaction Data** | TDE (Transparent Data Encryption) | AWS RDS managed | Database-level encryption |
| **PII (name, email)** | AES-256-GCM (optional column-level) | Application-managed keys | When required by compliance |
| **Audit Logs** | TDE | AWS RDS managed | Database-level encryption |
| **S3 Archives** | SSE-S3 or SSE-KMS | AWS S3/KMS managed | For cold storage |

---

## Appendix: Quick Reference

### Scope Hierarchy
- `accounts:read` — Base scope (required by all others except identity)
- `balances:read` → requires `accounts:read`
- `transactions:read` → requires `accounts:read`
- `transactions:read:90d` → requires `accounts:read` (time-limited)
- `investments:read` → requires `accounts:read` (investment accounts only)
- `liabilities:read` → requires `accounts:read` (liability accounts only)
- `identity:read` — Standalone (no dependencies)

### Consent Operations
- **Grant**: User approves in link flow
- **Narrow**: User can reduce scopes (never expand)
- **Revoke**: Triggers data deletion workflow
- **Expire**: Background job handles expiration

### Token Security
- AES-256-GCM encryption
- AWS KMS for key management
- Only TokenService can access vault
- All access logged in audit trail

### Data Deletion Timeline
- **24 hours max** from revocation to completion
- Transactions, balances deleted first
- Provider tokens revoked
- Connection soft-deleted (audit trail preserved)
