-- PostgreSQL 15+ schema for the Context Graph data model.
-- Design goals: multi-tenant isolation, provider provenance, and auditability.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Enumerations aligned to API semantics.
CREATE TYPE connection_status AS ENUM ('pending', 'active', 'degraded', 'error', 'disconnected', 'revoked');
CREATE TYPE account_type AS ENUM ('checking', 'savings', 'money_market', 'cd', 'investment', 'brokerage', '401k', 'ira', 'credit', 'loan', 'mortgage', 'other');
CREATE TYPE sync_job_status AS ENUM ('pending', 'running', 'completed', 'failed', 'cancelled');
CREATE TYPE consent_status AS ENUM ('active', 'revoked', 'expired');
CREATE TYPE liability_type AS ENUM ('credit_card', 'student_loan', 'mortgage', 'auto_loan', 'personal_loan', 'heloc', 'other');

-- Keep updated_at consistent across all tables.
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Tenants (apps) are the root of isolation.
CREATE TABLE apps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  webhook_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE TRIGGER trg_apps_updated_at
BEFORE UPDATE ON apps
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- API keys are app-scoped credentials.
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id UUID NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
  key_hash TEXT NOT NULL,
  key_prefix TEXT NOT NULL,
  name TEXT,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at TIMESTAMPTZ
);

CREATE TRIGGER trg_api_keys_updated_at
BEFORE UPDATE ON api_keys
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Users are scoped to apps; external_user_id is unique per app.
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id UUID NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
  external_user_id TEXT NOT NULL,
  email TEXT,
  provider TEXT,
  provider_user_id TEXT,
  last_refreshed_at TIMESTAMPTZ,
  data_quality_score NUMERIC(4,3) CHECK (data_quality_score BETWEEN 0 AND 1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT users_app_external_unique UNIQUE (app_id, external_user_id)
);

CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Consents capture scopes and lifecycle; app_id denormalizes for easier filtering.
CREATE TABLE consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id UUID NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scopes JSONB NOT NULL,
  status consent_status NOT NULL,
  provider TEXT,
  provider_consent_id TEXT,
  last_refreshed_at TIMESTAMPTZ,
  data_quality_score NUMERIC(4,3) CHECK (data_quality_score BETWEEN 0 AND 1),
  granted_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_consents_updated_at
BEFORE UPDATE ON consents
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Financial institutions are shared across apps.
CREATE TABLE institutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT,
  primary_color TEXT,
  routing_numbers TEXT[],
  supported_products JSONB NOT NULL,
  providers JSONB,
  provider TEXT,
  provider_institution_id TEXT,
  last_refreshed_at TIMESTAMPTZ,
  data_quality_score NUMERIC(4,3) CHECK (data_quality_score BETWEEN 0 AND 1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_institutions_updated_at
BEFORE UPDATE ON institutions
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Connections link users to institutions and provider items.
CREATE TABLE connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE RESTRICT,
  provider TEXT,
  provider_item_id TEXT,
  status connection_status NOT NULL,
  error_code TEXT,
  last_synced_at TIMESTAMPTZ,
  last_refreshed_at TIMESTAMPTZ,
  data_quality_score NUMERIC(4,3) CHECK (data_quality_score BETWEEN 0 AND 1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE TRIGGER trg_connections_updated_at
BEFORE UPDATE ON connections
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Accounts are provider-backed financial accounts.
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID NOT NULL REFERENCES connections(id) ON DELETE CASCADE,
  provider TEXT,
  provider_account_id TEXT,
  type account_type NOT NULL,
  subtype TEXT,
  name TEXT NOT NULL,
  mask TEXT,
  currency TEXT NOT NULL,
  is_closed BOOLEAN NOT NULL DEFAULT false,
  last_refreshed_at TIMESTAMPTZ,
  data_quality_score NUMERIC(4,3) CHECK (data_quality_score BETWEEN 0 AND 1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE TRIGGER trg_accounts_updated_at
BEFORE UPDATE ON accounts
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Balance snapshots are immutable point-in-time records.
CREATE TABLE balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  provider TEXT,
  provider_balance_id TEXT,
  current NUMERIC(20,4) NOT NULL,
  available NUMERIC(20,4),
  "limit" NUMERIC(20,4),
  currency TEXT NOT NULL,
  as_of TIMESTAMPTZ,
  last_refreshed_at TIMESTAMPTZ,
  data_quality_score NUMERIC(4,3) CHECK (data_quality_score BETWEEN 0 AND 1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_balances_updated_at
BEFORE UPDATE ON balances
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Transactions are normalized to provider ids and an ISO date.
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  provider TEXT,
  provider_transaction_id TEXT,
  amount NUMERIC(20,4) NOT NULL,
  currency TEXT NOT NULL,
  date DATE NOT NULL,
  description TEXT NOT NULL,
  merchant_name TEXT,
  category TEXT[],
  pending BOOLEAN NOT NULL DEFAULT false,
  last_refreshed_at TIMESTAMPTZ,
  data_quality_score NUMERIC(4,3) CHECK (data_quality_score BETWEEN 0 AND 1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_transactions_updated_at
BEFORE UPDATE ON transactions
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Securities are shared across apps.
CREATE TABLE securities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT,
  provider_security_id TEXT,
  ticker TEXT,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  cusip TEXT,
  isin TEXT,
  close_price NUMERIC(20,6),
  close_price_as_of TIMESTAMPTZ,
  last_refreshed_at TIMESTAMPTZ,
  data_quality_score NUMERIC(4,3) CHECK (data_quality_score BETWEEN 0 AND 1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_securities_updated_at
BEFORE UPDATE ON securities
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Holdings link investment accounts to securities.
CREATE TABLE holdings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  security_id UUID NOT NULL REFERENCES securities(id) ON DELETE RESTRICT,
  provider TEXT,
  provider_holding_id TEXT,
  quantity NUMERIC(20,6) NOT NULL,
  cost_basis NUMERIC(20,4),
  market_value NUMERIC(20,4),
  currency TEXT,
  as_of TIMESTAMPTZ,
  last_refreshed_at TIMESTAMPTZ,
  data_quality_score NUMERIC(4,3) CHECK (data_quality_score BETWEEN 0 AND 1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_holdings_updated_at
BEFORE UPDATE ON holdings
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Liabilities capture loan/credit details for an account.
CREATE TABLE liabilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  provider TEXT,
  provider_liability_id TEXT,
  type liability_type NOT NULL,
  balance NUMERIC(20,4),
  interest_rate_percentage NUMERIC(6,3),
  interest_rate_type TEXT,
  origination_date DATE,
  next_payment_due_date DATE,
  next_payment_amount NUMERIC(20,4),
  ytd_interest_paid NUMERIC(20,4),
  due_date DATE,
  last_refreshed_at TIMESTAMPTZ,
  data_quality_score NUMERIC(4,3) CHECK (data_quality_score BETWEEN 0 AND 1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_liabilities_updated_at
BEFORE UPDATE ON liabilities
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Sync jobs track background data pulls.
CREATE TABLE sync_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID NOT NULL REFERENCES connections(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  status sync_job_status NOT NULL,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  items_synced INTEGER,
  provider TEXT,
  provider_job_id TEXT,
  last_refreshed_at TIMESTAMPTZ,
  data_quality_score NUMERIC(4,3) CHECK (data_quality_score BETWEEN 0 AND 1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_sync_jobs_updated_at
BEFORE UPDATE ON sync_jobs
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Webhook events log inbound/outbound payloads.
CREATE TABLE webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id UUID REFERENCES apps(id) ON DELETE CASCADE,
  direction TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  last_attempt_at TIMESTAMPTZ,
  provider TEXT,
  provider_event_id TEXT,
  last_refreshed_at TIMESTAMPTZ,
  data_quality_score NUMERIC(4,3) CHECK (data_quality_score BETWEEN 0 AND 1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_webhook_events_updated_at
BEFORE UPDATE ON webhook_events
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Decision traces model context graph events.
CREATE TABLE decision_traces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  trace_id TEXT NOT NULL,
  parent_trace_id TEXT,
  event_type TEXT NOT NULL,
  input_data JSONB,
  rules_applied JSONB,
  result JSONB,
  confidence NUMERIC(4,3),
  provider TEXT,
  provider_trace_id TEXT,
  last_refreshed_at TIMESTAMPTZ,
  data_quality_score NUMERIC(4,3) CHECK (data_quality_score BETWEEN 0 AND 1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_decision_traces_updated_at
BEFORE UPDATE ON decision_traces
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Multi-tenancy and hot-path indexes.
CREATE UNIQUE INDEX idx_users_app_external ON users(app_id, external_user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_app_id ON users(app_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_api_keys_app_id ON api_keys(app_id) WHERE revoked_at IS NULL;
CREATE INDEX idx_api_keys_key_prefix ON api_keys(key_prefix) WHERE revoked_at IS NULL;

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

-- Partial indexes for soft deletes.
CREATE INDEX idx_users_active ON users(id) WHERE deleted_at IS NULL;
CREATE INDEX idx_connections_active ON connections(id) WHERE deleted_at IS NULL;
CREATE INDEX idx_accounts_active ON accounts(id) WHERE deleted_at IS NULL;
