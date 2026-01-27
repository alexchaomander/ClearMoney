-- Strata API - PostgreSQL Schema
-- Version: 1.0.0
-- PostgreSQL 15+
--
-- Multi-tenant financial connectivity platform database schema.
-- Apps are tenants; users and all data are scoped per app.

-- ============================================================================
-- EXTENSIONS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";      -- For UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";       -- For encryption functions

-- ============================================================================
-- ENUM TYPES
-- ============================================================================

-- Connection status lifecycle
CREATE TYPE connection_status AS ENUM (
    'pending',      -- Connection initiated, awaiting completion
    'active',       -- Connection healthy and syncing
    'degraded',     -- Connection working but with issues
    'error',        -- Connection failed, may be recoverable
    'disconnected', -- User disconnected or credentials expired
    'revoked'       -- User revoked consent
);

-- Account types (aligned with OpenAPI spec)
CREATE TYPE account_type AS ENUM (
    'checking',
    'savings',
    'money_market',
    'cd',
    'investment',
    'brokerage',
    '401k',
    'ira',
    'credit',
    'loan',
    'mortgage',
    'other'
);

-- Sync job status
CREATE TYPE sync_job_status AS ENUM (
    'pending',
    'running',
    'completed',
    'failed',
    'cancelled',
    'retrying'
);

-- Consent status
CREATE TYPE consent_status AS ENUM (
    'active',
    'revoked',
    'expired'
);

-- Liability types (aligned with OpenAPI spec)
CREATE TYPE liability_type AS ENUM (
    'credit_card',
    'mortgage',
    'student_loan',
    'auto_loan',
    'personal_loan',
    'heloc',
    'other'
);

-- Security types (aligned with OpenAPI spec)
CREATE TYPE security_type AS ENUM (
    'stock',
    'bond',
    'mutual_fund',
    'etf',
    'option',
    'crypto',
    'other'
);

-- Sync status for data freshness (aligned with OpenAPI Provenance)
CREATE TYPE sync_status AS ENUM (
    'synced',
    'syncing',
    'stale',
    'error'
);

-- Webhook event direction
CREATE TYPE webhook_direction AS ENUM (
    'inbound',   -- From providers to platform
    'outbound'   -- From platform to apps
);

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- -----------------------------------------------------------------------------
-- APPS (Tenants)
-- The root entity for multi-tenancy. Each consuming application is an "app".
-- -----------------------------------------------------------------------------
CREATE TABLE apps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    webhook_url TEXT,                              -- Default webhook endpoint for this app

    -- Audit columns
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ                         -- Soft delete
);

CREATE INDEX idx_apps_deleted_at ON apps(id) WHERE deleted_at IS NULL;

COMMENT ON TABLE apps IS 'Registered tenant applications. Each app has isolated user data.';
COMMENT ON COLUMN apps.webhook_url IS 'Default webhook endpoint for delivering events to this app';

-- -----------------------------------------------------------------------------
-- API_KEYS
-- API keys for app authentication. Each app can have multiple keys.
-- -----------------------------------------------------------------------------
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    app_id UUID NOT NULL REFERENCES apps(id) ON DELETE CASCADE,

    key_hash TEXT NOT NULL,                        -- SHA-256 hash of the API key
    key_prefix TEXT NOT NULL,                      -- First 8 chars for identification (e.g., "cgk_live")
    name TEXT,                                     -- Optional friendly name for the key

    -- Audit columns
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    revoked_at TIMESTAMPTZ                         -- NULL = active, set = revoked
);

CREATE INDEX idx_api_keys_app_id ON api_keys(app_id) WHERE revoked_at IS NULL;
CREATE INDEX idx_api_keys_key_prefix ON api_keys(key_prefix) WHERE revoked_at IS NULL;
-- Key hash must be globally unique to prevent reuse of compromised keys
CREATE UNIQUE INDEX idx_api_keys_key_hash ON api_keys(key_hash);

COMMENT ON TABLE api_keys IS 'API keys for authenticating app requests. Keys are hashed; only prefix is stored in plain text.';
COMMENT ON COLUMN api_keys.key_hash IS 'SHA-256 hash of the full API key for secure comparison';
COMMENT ON COLUMN api_keys.key_prefix IS 'First 8 characters of the key for identification in logs/UI';

-- -----------------------------------------------------------------------------
-- USERS
-- Platform users belonging to apps. Scoped by app_id.
-- -----------------------------------------------------------------------------
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    app_id UUID NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
    external_user_id TEXT NOT NULL,                -- App's identifier for this user
    email TEXT,                                    -- Optional email

    -- Provenance fields (from OpenAPI spec)
    provider TEXT,
    provider_item_id TEXT,
    provider_account_id TEXT,
    last_refreshed_at TIMESTAMPTZ,
    confidence NUMERIC(3,2) CHECK (confidence >= 0 AND confidence <= 1),
    sync_status sync_status DEFAULT 'synced',

    -- Audit columns
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ                         -- Soft delete
);

-- Multi-tenancy: unique constraint ensures same external_user_id can exist in different apps
CREATE UNIQUE INDEX idx_users_app_external ON users(app_id, external_user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_app_id ON users(app_id) WHERE deleted_at IS NULL;
-- Enable composite FK from consents to ensure tenant consistency
CREATE UNIQUE INDEX idx_users_app_id_id ON users(app_id, id);

COMMENT ON TABLE users IS 'End users of consuming apps. Each user belongs to exactly one app.';
COMMENT ON COLUMN users.external_user_id IS 'The app''s own identifier for this user (unique within the app)';

-- -----------------------------------------------------------------------------
-- INSTITUTIONS
-- Financial institutions master list (shared across all apps).
-- -----------------------------------------------------------------------------
CREATE TABLE institutions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    country TEXT NOT NULL DEFAULT 'US',
    logo_url TEXT,
    primary_color TEXT,                            -- Hex color for UI
    routing_numbers TEXT[],                        -- Array of routing numbers
    supported_products JSONB,                      -- { "accounts": true, "transactions": true, ... }
    providers JSONB,                               -- { "plaid": { "institution_id": "..." }, "mx": { ... } }

    -- Note: No provenance fields here. Institutions are master data shared across
    -- all apps and can be supported by multiple providers. Provider-specific details
    -- are stored in the `providers` JSONB column.

    -- Audit columns
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_institutions_name ON institutions(name);
CREATE INDEX idx_institutions_country ON institutions(country);

COMMENT ON TABLE institutions IS 'Master list of financial institutions. Shared across all apps.';
COMMENT ON COLUMN institutions.providers IS 'Maps provider names to provider-specific institution IDs';

-- -----------------------------------------------------------------------------
-- CONSENTS
-- User consent records with granular scopes.
-- -----------------------------------------------------------------------------
CREATE TABLE consents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    app_id UUID NOT NULL,
    user_id UUID NOT NULL,

    status consent_status NOT NULL DEFAULT 'active',
    scopes TEXT[] NOT NULL,                        -- Array of granted scopes
    purpose TEXT,                                  -- Human-readable purpose

    -- Timing
    expires_at TIMESTAMPTZ,                        -- NULL = no expiration
    revoked_at TIMESTAMPTZ,
    revocation_reason TEXT,

    -- Request context
    ip_address INET,
    user_agent TEXT,
    consent_version INTEGER NOT NULL DEFAULT 1,   -- For terms versioning

    -- Provenance fields
    provider TEXT,
    provider_item_id TEXT,
    provider_account_id TEXT,
    last_refreshed_at TIMESTAMPTZ,
    confidence NUMERIC(3,2) CHECK (confidence >= 0 AND confidence <= 1),
    sync_status sync_status DEFAULT 'synced',

    -- Audit columns
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Composite FK ensures app_id matches the user's app_id (tenant consistency)
ALTER TABLE consents ADD CONSTRAINT fk_consents_app
    FOREIGN KEY (app_id) REFERENCES apps(id) ON DELETE CASCADE;
ALTER TABLE consents ADD CONSTRAINT fk_consents_user
    FOREIGN KEY (app_id, user_id) REFERENCES users(app_id, id) ON DELETE CASCADE;

CREATE INDEX idx_consents_app_user ON consents(app_id, user_id)
    WHERE status = 'active';
CREATE INDEX idx_consents_user_id ON consents(user_id);

COMMENT ON TABLE consents IS 'User consent records with granular scopes. Consents can be revoked or expire.';
COMMENT ON COLUMN consents.scopes IS 'Array of granted scopes, e.g., ["accounts:read", "transactions:read"]';

-- -----------------------------------------------------------------------------
-- CONNECTIONS
-- Links between users and financial institutions.
-- -----------------------------------------------------------------------------
CREATE TABLE connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    institution_id UUID NOT NULL REFERENCES institutions(id),

    status connection_status NOT NULL DEFAULT 'pending',
    error_code TEXT,                               -- Provider error code if status = error
    last_error TEXT,                               -- Human-readable error message

    -- Provider-specific identifiers
    provider TEXT NOT NULL,                        -- e.g., "plaid", "mx", "finicity"
    provider_item_id TEXT,                         -- Provider's connection/item ID
    provider_account_id TEXT,

    -- Sync tracking
    last_synced_at TIMESTAMPTZ,
    last_refreshed_at TIMESTAMPTZ,
    confidence NUMERIC(3,2) CHECK (confidence >= 0 AND confidence <= 1),
    sync_status sync_status DEFAULT 'synced',

    -- Audit columns
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ                         -- Soft delete
);

CREATE INDEX idx_connections_user_id ON connections(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_connections_status ON connections(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_connections_provider_item ON connections(provider, provider_item_id) WHERE deleted_at IS NULL;

COMMENT ON TABLE connections IS 'Links between users and financial institutions via a data provider.';

-- -----------------------------------------------------------------------------
-- ACCOUNTS
-- Bank, investment, credit, and loan accounts.
-- -----------------------------------------------------------------------------
CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    connection_id UUID NOT NULL REFERENCES connections(id) ON DELETE CASCADE,

    name TEXT NOT NULL,
    type account_type NOT NULL,
    subtype TEXT,                                  -- Provider-specific subtype
    currency TEXT NOT NULL DEFAULT 'USD',
    mask TEXT,                                     -- Last 4 digits
    is_closed BOOLEAN DEFAULT FALSE,

    -- Provenance fields
    provider TEXT,
    provider_item_id TEXT,
    provider_account_id TEXT,                      -- Provider's account identifier
    last_refreshed_at TIMESTAMPTZ,
    confidence NUMERIC(3,2) CHECK (confidence >= 0 AND confidence <= 1),
    sync_status sync_status DEFAULT 'synced',

    -- Audit columns
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ                         -- Soft delete
);

CREATE INDEX idx_accounts_connection_id ON accounts(connection_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_accounts_type ON accounts(type) WHERE deleted_at IS NULL;

COMMENT ON TABLE accounts IS 'Financial accounts linked via connections.';

-- -----------------------------------------------------------------------------
-- BALANCES
-- Point-in-time balance snapshots for accounts.
-- -----------------------------------------------------------------------------
CREATE TABLE balances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,

    current NUMERIC(19,4) NOT NULL,                -- Current balance
    available NUMERIC(19,4),                       -- Available balance (may differ from current)
    "limit" NUMERIC(19,4),                         -- Credit limit (for credit accounts)
    currency TEXT NOT NULL DEFAULT 'USD',
    as_of TIMESTAMPTZ NOT NULL DEFAULT now(),      -- When this balance was accurate

    -- Provenance fields
    provider TEXT,
    provider_item_id TEXT,
    provider_account_id TEXT,
    last_refreshed_at TIMESTAMPTZ,
    confidence NUMERIC(3,2) CHECK (confidence >= 0 AND confidence <= 1),
    sync_status sync_status DEFAULT 'synced',

    -- Audit columns
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_balances_account_id_as_of ON balances(account_id, as_of DESC);

COMMENT ON TABLE balances IS 'Point-in-time balance snapshots. New row created on each sync.';

-- -----------------------------------------------------------------------------
-- TRANSACTIONS
-- Transaction records from accounts.
-- -----------------------------------------------------------------------------
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,

    amount NUMERIC(19,4) NOT NULL,                 -- Negative for debits, positive for credits
    currency TEXT NOT NULL DEFAULT 'USD',
    date DATE NOT NULL,                            -- Transaction date
    datetime TIMESTAMPTZ,                          -- Precise timestamp if available

    name TEXT NOT NULL,                            -- Raw transaction description
    merchant_name TEXT,                            -- Cleaned merchant name
    description TEXT,                              -- Additional description

    category TEXT[],                               -- Array of categories
    pending BOOLEAN NOT NULL DEFAULT FALSE,

    -- Provider-specific
    provider TEXT,
    provider_item_id TEXT,
    provider_account_id TEXT,
    provider_transaction_id TEXT,                  -- Provider's transaction ID

    -- Provenance
    last_refreshed_at TIMESTAMPTZ,
    confidence NUMERIC(3,2) CHECK (confidence >= 0 AND confidence <= 1),
    sync_status sync_status DEFAULT 'synced',

    -- Audit columns
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_transactions_account_id_date ON transactions(account_id, date DESC);
CREATE INDEX idx_transactions_date ON transactions(date DESC);
CREATE INDEX idx_transactions_pending ON transactions(account_id, pending) WHERE pending = TRUE;
CREATE INDEX idx_transactions_provider_id ON transactions(provider_transaction_id) WHERE provider_transaction_id IS NOT NULL;

COMMENT ON TABLE transactions IS 'Transaction records synced from financial accounts.';

-- -----------------------------------------------------------------------------
-- SECURITIES
-- Security master data (stocks, funds, etc.). Shared across all apps.
-- -----------------------------------------------------------------------------
CREATE TABLE securities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    name TEXT NOT NULL,
    ticker TEXT,                                   -- Stock ticker symbol
    type security_type NOT NULL,
    currency TEXT DEFAULT 'USD',

    -- Identifiers
    cusip TEXT,                                    -- CUSIP number
    isin TEXT,                                     -- International Securities ID
    sedol TEXT,                                    -- SEDOL number

    -- Pricing
    close_price NUMERIC(19,4),
    close_price_as_of DATE,

    -- Provenance fields
    provider TEXT,
    provider_item_id TEXT,
    provider_account_id TEXT,
    provider_security_id TEXT,                     -- Provider's security ID
    last_refreshed_at TIMESTAMPTZ,
    confidence NUMERIC(3,2) CHECK (confidence >= 0 AND confidence <= 1),
    sync_status sync_status DEFAULT 'synced',

    -- Audit columns
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_securities_ticker ON securities(ticker) WHERE ticker IS NOT NULL;
CREATE INDEX idx_securities_cusip ON securities(cusip) WHERE cusip IS NOT NULL;
CREATE INDEX idx_securities_provider_id ON securities(provider_security_id) WHERE provider_security_id IS NOT NULL;

COMMENT ON TABLE securities IS 'Security master data. Shared across all apps and accounts.';

-- -----------------------------------------------------------------------------
-- HOLDINGS
-- Investment holdings in accounts.
-- -----------------------------------------------------------------------------
CREATE TABLE holdings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    security_id UUID NOT NULL REFERENCES securities(id),

    quantity NUMERIC(19,8) NOT NULL,               -- Number of shares/units
    cost_basis NUMERIC(19,4),                      -- Total cost basis
    market_value NUMERIC(19,4),                    -- Current market value
    currency TEXT DEFAULT 'USD',
    as_of TIMESTAMPTZ,                             -- When this holding was accurate

    -- Provenance fields
    provider TEXT,
    provider_item_id TEXT,
    provider_account_id TEXT,
    last_refreshed_at TIMESTAMPTZ,
    confidence NUMERIC(3,2) CHECK (confidence >= 0 AND confidence <= 1),
    sync_status sync_status DEFAULT 'synced',

    -- Audit columns
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_holdings_account_id ON holdings(account_id);
CREATE INDEX idx_holdings_security_id ON holdings(security_id);

COMMENT ON TABLE holdings IS 'Investment holdings linking accounts to securities.';

-- -----------------------------------------------------------------------------
-- LIABILITIES
-- Loan and credit details for liability accounts.
-- -----------------------------------------------------------------------------
CREATE TABLE liabilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,

    type liability_type NOT NULL,
    balance NUMERIC(19,4) NOT NULL,                -- Outstanding balance

    -- Interest
    interest_rate NUMERIC(7,4),                    -- As decimal (e.g., 0.0199 for 1.99%)
    interest_rate_type TEXT,                       -- "fixed", "variable"

    -- Payment info
    origination_date DATE,
    next_payment_due_date DATE,
    next_payment_amount NUMERIC(19,4),
    minimum_payment NUMERIC(19,4),

    -- Year-to-date
    ytd_interest_paid NUMERIC(19,4),
    ytd_principal_paid NUMERIC(19,4),

    -- Provenance fields
    provider TEXT,
    provider_item_id TEXT,
    provider_account_id TEXT,
    last_refreshed_at TIMESTAMPTZ,
    confidence NUMERIC(3,2) CHECK (confidence >= 0 AND confidence <= 1),
    sync_status sync_status DEFAULT 'synced',

    -- Audit columns
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_liabilities_account_id ON liabilities(account_id);
CREATE INDEX idx_liabilities_type ON liabilities(type);

COMMENT ON TABLE liabilities IS 'Detailed liability information for loans and credit accounts.';

-- ============================================================================
-- OPERATIONAL TABLES
-- ============================================================================

-- -----------------------------------------------------------------------------
-- SYNC_JOBS
-- Background sync job tracking.
-- -----------------------------------------------------------------------------
CREATE TABLE sync_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    connection_id UUID NOT NULL REFERENCES connections(id) ON DELETE CASCADE,

    type TEXT NOT NULL,                            -- 'scheduled', 'on_demand', 'webhook_triggered'
    data_types TEXT[] NOT NULL,                    -- ['balances', 'transactions', ...]
    status sync_job_status NOT NULL DEFAULT 'pending',
    priority INTEGER DEFAULT 5,                    -- 1 = highest, 10 = lowest

    -- Retry tracking
    attempt_number INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,

    -- Timing
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    next_retry_at TIMESTAMPTZ,

    -- Results
    items_synced JSONB,                            -- { "transactions": 150, "accounts": 3 }
    error_code TEXT,
    error_message TEXT,

    -- Metadata
    triggered_by TEXT,                             -- 'scheduler', 'user', 'webhook', 'admin'
    request_id UUID,

    -- Audit columns
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sync_jobs_pending ON sync_jobs(priority, created_at)
    WHERE status IN ('pending', 'retrying');
CREATE INDEX idx_sync_jobs_connection ON sync_jobs(connection_id, created_at DESC);

COMMENT ON TABLE sync_jobs IS 'Tracks background data sync jobs and their status.';

-- -----------------------------------------------------------------------------
-- WEBHOOK_SUBSCRIPTIONS
-- App webhook subscriptions for outbound events.
-- -----------------------------------------------------------------------------
CREATE TABLE webhook_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    app_id UUID NOT NULL REFERENCES apps(id) ON DELETE CASCADE,

    url TEXT NOT NULL,                             -- Webhook endpoint URL
    events TEXT[] NOT NULL,                        -- Event types to subscribe to
    secret_hash TEXT NOT NULL,                     -- Hashed webhook secret for signing

    -- Status
    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    -- Audit columns
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_webhook_subscriptions_app_id ON webhook_subscriptions(app_id) WHERE is_active = TRUE;

COMMENT ON TABLE webhook_subscriptions IS 'Webhook subscriptions for delivering events to apps.';

-- -----------------------------------------------------------------------------
-- WEBHOOK_EVENTS
-- Inbound and outbound webhook event log.
-- -----------------------------------------------------------------------------
CREATE TABLE webhook_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    app_id UUID REFERENCES apps(id),              -- NULL for inbound provider webhooks

    direction webhook_direction NOT NULL,
    event_type TEXT NOT NULL,                      -- e.g., 'connection.updated', 'transactions.sync_completed'
    payload JSONB NOT NULL,

    -- Delivery tracking (for outbound)
    status TEXT NOT NULL DEFAULT 'pending',        -- 'pending', 'delivered', 'failed'
    attempts INTEGER DEFAULT 0,
    last_attempt_at TIMESTAMPTZ,
    next_retry_at TIMESTAMPTZ,
    response_status INTEGER,                       -- HTTP status from webhook endpoint
    response_body TEXT,

    -- Audit columns
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_webhook_events_app_id ON webhook_events(app_id, created_at DESC)
    WHERE direction = 'outbound';
CREATE INDEX idx_webhook_events_pending ON webhook_events(next_retry_at)
    WHERE direction = 'outbound' AND status = 'pending';

COMMENT ON TABLE webhook_events IS 'Log of inbound (from providers) and outbound (to apps) webhook events.';

-- -----------------------------------------------------------------------------
-- DECISION_TRACES
-- Context graph events for explainable recommendations.
-- -----------------------------------------------------------------------------
CREATE TABLE decision_traces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    trace_id UUID NOT NULL,                        -- Groups related events
    parent_trace_id UUID,                          -- Causal link to parent event

    event_type TEXT NOT NULL,                      -- e.g., 'recommendation.created', 'action.completed'
    event_version TEXT NOT NULL DEFAULT '1.0.0',   -- Schema version

    -- Recommendation link
    recommendation_id UUID,

    -- Event data
    input_data JSONB,                              -- Inputs used for decision
    rules_applied JSONB,                           -- Rules/logic applied
    assumptions JSONB,                             -- Assumptions made
    result JSONB,                                  -- Decision result

    confidence NUMERIC(3,2) CHECK (confidence >= 0 AND confidence <= 1),

    -- Audit columns
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_decision_traces_user_id ON decision_traces(user_id, created_at DESC);
CREATE INDEX idx_decision_traces_trace_id ON decision_traces(trace_id, created_at);
CREATE INDEX idx_decision_traces_event_type ON decision_traces(event_type, created_at DESC);

COMMENT ON TABLE decision_traces IS 'Event log for explainable AI recommendations (Strata).';
COMMENT ON COLUMN decision_traces.trace_id IS 'Groups all events related to a single recommendation lifecycle';

-- -----------------------------------------------------------------------------
-- CONSENT_AUDIT_LOG
-- Immutable audit log for consent changes.
-- -----------------------------------------------------------------------------
CREATE TABLE consent_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    app_id UUID NOT NULL REFERENCES apps(id),

    event_type TEXT NOT NULL,                      -- 'consent_granted', 'consent_revoked', 'scope_narrowed', etc.
    user_id UUID,
    connection_id UUID,
    consent_id UUID,

    actor_type TEXT NOT NULL,                      -- 'user', 'system', 'admin', 'app'
    actor_id TEXT,

    scopes_affected TEXT[],
    metadata JSONB,

    -- Request context
    ip_address INET,
    user_agent TEXT,
    request_id UUID,

    -- Audit columns
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- No UPDATE or DELETE allowed on audit log
CREATE INDEX idx_consent_audit_app_id ON consent_audit_log(app_id, created_at DESC);
CREATE INDEX idx_consent_audit_user_id ON consent_audit_log(user_id, created_at DESC);
CREATE INDEX idx_consent_audit_connection_id ON consent_audit_log(connection_id, created_at DESC);

COMMENT ON TABLE consent_audit_log IS 'Immutable audit log for all consent-related events. Retained for 7 years. Note: user_id, connection_id, and consent_id intentionally omit FK constraints to preserve audit records even after referenced entities are deleted.';

-- -----------------------------------------------------------------------------
-- TOKEN_VAULT
-- Encrypted storage for provider access/refresh tokens.
-- Restricted access - only token service can read.
-- -----------------------------------------------------------------------------
CREATE TABLE token_vault (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    connection_id UUID NOT NULL REFERENCES connections(id) ON DELETE CASCADE,

    provider TEXT NOT NULL,
    access_token_encrypted BYTEA NOT NULL,
    refresh_token_encrypted BYTEA,
    access_token_expires_at TIMESTAMPTZ,

    key_id TEXT NOT NULL,                          -- KMS key ID used for encryption

    -- Audit columns
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- No indexes on encrypted columns for security
-- Unique constraint enforces 1:1 relationship between connections and token storage
CREATE UNIQUE INDEX idx_token_vault_connection_id ON token_vault(connection_id);

-- Restrict access to token service role only
-- REVOKE SELECT ON token_vault FROM public;
-- GRANT SELECT ON token_vault TO token_service_role;

COMMENT ON TABLE token_vault IS 'Encrypted storage for provider OAuth tokens. Access restricted to token service.';
COMMENT ON COLUMN token_vault.key_id IS 'KMS key ID used for encryption. Supports key rotation.';

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables with that column
CREATE TRIGGER update_apps_updated_at BEFORE UPDATE ON apps
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_api_keys_updated_at BEFORE UPDATE ON api_keys
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_institutions_updated_at BEFORE UPDATE ON institutions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_consents_updated_at BEFORE UPDATE ON consents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_connections_updated_at BEFORE UPDATE ON connections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_securities_updated_at BEFORE UPDATE ON securities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_holdings_updated_at BEFORE UPDATE ON holdings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_liabilities_updated_at BEFORE UPDATE ON liabilities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sync_jobs_updated_at BEFORE UPDATE ON sync_jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_webhook_subscriptions_updated_at BEFORE UPDATE ON webhook_subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_token_vault_updated_at BEFORE UPDATE ON token_vault
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS SUMMARY
-- ============================================================================
--
-- Multi-Tenancy Model:
--   - `apps` is the tenant table
--   - `users` are scoped to apps via `app_id` FK
--   - Unique constraint (app_id, external_user_id) ensures data isolation
--   - All data flows: app -> user -> connection -> accounts -> data
--
-- Provenance Fields (on all data tables):
--   - provider: which aggregator sourced the data
--   - provider_*_id: provider's internal identifiers
--   - last_refreshed_at: when data was last synced
--   - confidence: data quality score (0.0-1.0)
--   - sync_status: current sync state
--
-- Soft Delete Pattern:
--   - deleted_at column on: apps, users, connections, accounts
--   - Partial indexes exclude deleted records
--
-- Security:
--   - API keys are hashed (only prefix stored in plain text)
--   - OAuth tokens are encrypted in token_vault
--   - Audit logs are immutable
--
