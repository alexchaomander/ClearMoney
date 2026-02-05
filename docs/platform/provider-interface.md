# Provider Abstraction Interface

Version: 1.1.0
Last Updated: 2026-02-05

## Overview

This document defines the internal provider abstraction layer that enables the Strata API to work with multiple financial data providers through unified interfaces. There are two separate provider interfaces:

1. **Investment Providers** (`BaseProvider`) — For brokerage and investment account connectivity (SnapTrade, etc.)
2. **Banking Providers** (`BaseBankingProvider`) — For bank account and transaction data (Plaid)

The abstraction handles:

- **Normalization**: Converting provider-specific formats to canonical platform formats
- **Error Handling**: Mapping provider errors to platform error codes with retry guidance
- **Resilience**: Rate limiting, circuit breakers, and timeouts
- **Observability**: Metrics, logging, and distributed tracing

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                            Strata API                               │
└─────────────────────────────────────────────────────────────────────┘
                                  │
          ┌───────────────────────┴───────────────────────┐
          ▼                                               ▼
┌───────────────────────────────────┐   ┌───────────────────────────────────┐
│   Investment Provider Layer        │   │     Banking Provider Layer         │
│         (BaseProvider)             │   │     (BaseBankingProvider)          │
│  ┌──────────┐  ┌──────────────┐   │   │  ┌──────────┐  ┌──────────────┐   │
│  │Normalizer│  │ Error Mapper │   │   │  │Normalizer│  │ Error Mapper │   │
│  └──────────┘  └──────────────┘   │   │  └──────────┘  └──────────────┘   │
└────────────────┬──────────────────┘   └────────────────┬──────────────────┘
                 │                                       │
    ┌────────────┼────────────┐                  ┌───────┴───────┐
    ▼            ▼            ▼                  ▼               ▼
┌─────────┐ ┌─────────┐ ┌─────────┐        ┌─────────┐    ┌─────────┐
│SnapTrade│ │   MX    │ │ Future  │        │  Plaid  │    │ Future  │
│(invest) │ │(invest) │ │Providers│        │(banking)│    │Providers│
└─────────┘ └─────────┘ └─────────┘        └─────────┘    └─────────┘
```

**Key Design Decision:** Banking and investment providers are separate interfaces because they serve fundamentally different data models:
- Investment providers handle holdings, securities, and investment transactions
- Banking providers handle bank accounts, spending transactions, and categorization

This separation avoids forcing banking providers to implement no-op stubs for `get_holdings()` or investment providers to implement `get_transactions()` with spending categories.

## Interface Definition

### Core Provider Interface

```typescript
/**
 * Provider abstraction interface.
 * Each provider adapter must implement this interface.
 */
interface ProviderAdapter {
  readonly providerId: ProviderType;

  // Connection lifecycle
  createLinkToken(userId: string, options: LinkTokenOptions): Promise<LinkTokenResult>;
  exchangeToken(publicToken: string, userId: string): Promise<ExchangeTokenResult>;
  refreshItem(connectionId: string): Promise<RefreshResult>;
  getItemStatus(connectionId: string): Promise<ItemStatusResult>;

  // Data sync
  syncAccounts(connectionId: string): Promise<SyncAccountsResult>;
  syncBalances(connectionId: string): Promise<SyncBalancesResult>;
  syncTransactions(connectionId: string, options?: TransactionSyncOptions): Promise<SyncTransactionsResult>;
  syncHoldings(connectionId: string): Promise<SyncHoldingsResult>;
  syncLiabilities(connectionId: string): Promise<SyncLiabilitiesResult>;

  // Webhooks
  verifyWebhook(headers: Record<string, string>, body: string): Promise<WebhookVerificationResult>;
}

type ProviderType = 'plaid' | 'mx' | 'finicity' | 'fdx';
```

### Method Signatures

#### `createLinkToken`

Creates a one-time-use token for initializing the client-side Link SDK.

```typescript
interface LinkTokenOptions {
  products: ProductType[];           // ['accounts', 'transactions', 'holdings']
  institutionId?: string;            // Pre-select institution (optional)
  redirectUri: string;               // OAuth redirect URI
  webhookUrl?: string;               // Override default webhook URL
  accountFilters?: AccountFilter[];  // Filter account types
}

type ProductType = 'accounts' | 'transactions' | 'balances' | 'holdings' | 'liabilities' | 'identity';

interface AccountFilter {
  type: AccountType;
  subtypes?: string[];
}

interface LinkTokenResult {
  linkToken: string;
  expiration: string;  // ISO 8601 datetime
}
```

#### `exchangeToken`

Exchanges a public token (from Link callback) for a persistent connection.

```typescript
interface ExchangeTokenResult {
  connectionId: string;              // Platform-generated connection ID
  providerItemId: string;            // Provider's item/connection ID
  accounts: NormalizedAccount[];     // Initial account list
  institution: {
    id: string;
    name: string;
  };
}
```

#### `syncAccounts`

Fetches all accounts for a connection.

```typescript
interface SyncAccountsResult {
  accounts: NormalizedAccount[];
  syncedAt: string;  // ISO 8601 datetime
}

interface NormalizedAccount {
  id: string;                        // Platform-generated UUID
  providerAccountId: string;         // Provider's account ID
  type: AccountType;
  subtype: string | null;
  name: string;
  mask: string | null;               // Last 4 digits
  currency: string;                  // ISO 4217 currency code
  isClosed: boolean;
}

type AccountType =
  | 'checking'
  | 'savings'
  | 'money_market'
  | 'cd'
  | 'investment'
  | 'brokerage'
  | '401k'
  | 'ira'
  | 'credit'
  | 'loan'
  | 'mortgage'
  | 'other';
```

#### `syncBalances`

Fetches current balances for all accounts in a connection.

```typescript
interface SyncBalancesResult {
  balances: NormalizedBalance[];
  syncedAt: string;  // ISO 8601 datetime
}

interface NormalizedBalance {
  accountId: string;                 // Platform account ID (maps to provider account via NormalizedAccount)
  current: number;                   // Current balance
  available: number | null;          // Available balance
  limit: number | null;              // Credit limit (for credit accounts)
  currency: string;                  // ISO 4217 currency code
  asOf: string;                      // ISO 8601 datetime
}
```

#### `syncTransactions`

Fetches transactions with incremental sync support.

```typescript
interface TransactionSyncOptions {
  startDate?: string;                // ISO 8601 date (YYYY-MM-DD)
  endDate?: string;                  // ISO 8601 date (YYYY-MM-DD)
  cursor?: string;                   // Pagination cursor from previous sync
  count?: number;                    // Max transactions to return (default: 500)
}

interface SyncTransactionsResult {
  added: NormalizedTransaction[];    // New transactions
  modified: NormalizedTransaction[]; // Updated transactions
  removed: string[];                 // IDs of removed transactions
  nextCursor: string | null;         // Cursor for next page
  hasMore: boolean;
  syncedAt: string;                  // ISO 8601 datetime
}

interface NormalizedTransaction {
  id: string;                        // Platform-generated UUID
  providerTransactionId: string;     // Provider's transaction ID
  accountId: string;                 // Platform account ID
  amount: number;                    // Positive = credit, Negative = debit
  currency: string;                  // ISO 4217 currency code
  date: string;                      // ISO 8601 date (YYYY-MM-DD)
  datetime: string | null;           // ISO 8601 datetime (if available)
  name: string;                      // Raw description
  merchantName: string | null;       // Cleaned merchant name
  category: string[];                // Category hierarchy
  pending: boolean;
  checkNumber: string | null;

  // Location (if available)
  location: {
    address: string | null;
    city: string | null;
    region: string | null;
    postalCode: string | null;
    country: string | null;
    lat: number | null;
    lon: number | null;
  } | null;
}
```

#### `syncHoldings`

Fetches investment holdings and associated securities.

```typescript
interface SyncHoldingsResult {
  holdings: NormalizedHolding[];
  securities: NormalizedSecurity[];
  syncedAt: string;  // ISO 8601 datetime
}

interface NormalizedHolding {
  id: string;                        // Platform-generated UUID
  accountId: string;                 // Platform account ID
  securityId: string;                // Platform security ID
  providerHoldingId: string | null;  // Provider's holding ID (if any)
  quantity: number;                  // Number of shares/units
  costBasis: number | null;          // Total cost basis
  marketValue: number | null;        // Current market value
  price: number | null;              // Price per share
  priceAsOf: string | null;          // ISO 8601 datetime
  currency: string;                  // ISO 4217 currency code
}

interface NormalizedSecurity {
  id: string;                        // Platform-generated UUID
  providerSecurityId: string;        // Provider's security ID
  name: string;
  ticker: string | null;
  type: SecurityType;
  currency: string | null;
  cusip: string | null;
  isin: string | null;
  sedol: string | null;
  closePrice: number | null;
  closePriceAsOf: string | null;     // ISO 8601 date
}

type SecurityType =
  | 'stock'
  | 'bond'
  | 'mutual_fund'
  | 'etf'
  | 'option'
  | 'crypto'
  | 'cash'
  | 'other';
```

#### `syncLiabilities`

Fetches liability details for loan and credit accounts.

```typescript
interface SyncLiabilitiesResult {
  liabilities: NormalizedLiability[];
  syncedAt: string;  // ISO 8601 datetime
}

interface NormalizedLiability {
  id: string;                        // Platform-generated UUID
  accountId: string;                 // Platform account ID
  providerLiabilityId: string;       // Provider's liability ID
  type: LiabilityType;

  // Balances
  currentBalance: number;
  principalBalance: number | null;

  // Interest
  interestRate: number | null;       // As decimal (e.g., 0.0525 for 5.25%)
  interestRateType: 'fixed' | 'variable' | null;

  // Payment info
  minimumPayment: number | null;
  nextPaymentDueDate: string | null; // ISO 8601 date
  nextPaymentAmount: number | null;
  lastPaymentDate: string | null;    // ISO 8601 date
  lastPaymentAmount: number | null;

  // Loan-specific
  originationDate: string | null;    // ISO 8601 date
  originationPrincipal: number | null;
  termMonths: number | null;

  // Year-to-date
  ytdInterestPaid: number | null;
  ytdPrincipalPaid: number | null;

  // Credit-specific
  creditLimit: number | null;

  // Mortgage-specific
  escrowBalance: number | null;
  propertyAddress: string | null;
}

type LiabilityType =
  | 'credit_card'
  | 'mortgage'
  | 'student_loan'
  | 'auto_loan'
  | 'personal_loan'
  | 'heloc'
  | 'other';
```

#### `refreshItem`

Triggers a manual refresh of connection data.

```typescript
interface RefreshResult {
  status: 'refreshing' | 'complete';
  estimatedCompletion: string | null;  // ISO 8601 datetime
}
```

#### `getItemStatus`

Checks the health status of a connection.

```typescript
interface ItemStatusResult {
  status: ConnectionStatus;
  lastSyncedAt: string | null;       // ISO 8601 datetime
  errorCode: string | null;          // Platform error code
  errorMessage: string | null;       // Human-readable error
  consentExpiresAt: string | null;   // ISO 8601 datetime (FDX)
}

type ConnectionStatus =
  | 'active'
  | 'degraded'
  | 'error'
  | 'pending'
  | 'disconnected'
  | 'revoked';
```

#### `verifyWebhook`

Verifies an inbound webhook signature.

```typescript
interface WebhookVerificationResult {
  valid: boolean;
  eventType: string | null;          // e.g., 'TRANSACTIONS_SYNC_COMPLETE'
  payload: Record<string, unknown> | null;
  itemId: string | null;             // Provider's item/connection ID
}
```

---

## Banking Provider Interface

The `BaseBankingProvider` interface is specifically designed for banking data providers that handle checking/savings accounts and spending transactions. This is separate from the investment `ProviderAdapter` interface.

### Interface Definition

```python
class BaseBankingProvider(ABC):
    """Base class for banking data providers (e.g., Plaid)."""

    provider_name: str = "base_banking"

    @abstractmethod
    async def create_link_token(
        self,
        user_id: str,
        redirect_uri: str | None = None,
    ) -> LinkSession:
        """Create a link token for initializing Plaid Link."""
        ...

    @abstractmethod
    async def exchange_public_token(
        self,
        user_id: str,
        public_token: str,
    ) -> dict:
        """Exchange a public token for an access token."""
        ...

    @abstractmethod
    async def get_accounts(
        self,
        connection: Connection,
    ) -> list[NormalizedBankAccount]:
        """Get all bank accounts for a connection."""
        ...

    @abstractmethod
    async def get_transactions(
        self,
        connection: Connection,
        start_date: date,
        end_date: date,
    ) -> list[NormalizedBankTransaction]:
        """Get transactions for all accounts in a connection."""
        ...

    @abstractmethod
    async def delete_connection(
        self,
        connection: Connection,
    ) -> None:
        """Delete a connection from the provider."""
        ...
```

### Normalized Data Types

#### `NormalizedBankAccount`

```python
@dataclass
class NormalizedBankAccount:
    provider_account_id: str
    name: str
    account_type: CashAccountType  # checking, savings, money_market, cd, other
    balance: Decimal
    available_balance: Decimal | None = None
    currency: str = "USD"
    institution_name: str | None = None
    mask: str | None = None  # Last 4 digits
```

#### `NormalizedBankTransaction`

```python
@dataclass
class NormalizedBankTransaction:
    provider_transaction_id: str
    amount: Decimal  # Negative=debit, Positive=credit
    transaction_date: date
    name: str
    pending: bool = False
    posted_date: date | None = None
    primary_category: str | None = None      # e.g., "FOOD_AND_DRINK"
    detailed_category: str | None = None     # e.g., "RESTAURANTS"
    plaid_category: list[str] | None = None  # Raw Plaid category array
    merchant_name: str | None = None
    payment_channel: str | None = None       # "online", "in_store", "other"
    iso_currency_code: str = "USD"
```

### Current Implementations

| Provider | Status | Description |
|----------|--------|-------------|
| Plaid | Implemented | Full banking connectivity with transaction categorization |

---

## Normalization Mapping Tables

### Accounts Normalization

| Platform Field | Plaid | MX | Finicity | FDX |
|----------------|-------|-----|----------|-----|
| `id` | Generated UUID | Generated UUID | Generated UUID | Generated UUID |
| `providerAccountId` | `account_id` | `guid` | `id` | `accountId` |
| `type` | `type` (map to enum) | `account_type` (map) | `type` (map) | `accountType` (map) |
| `subtype` | `subtype` | `account_subtype` | `detail.accountType` | `accountSubType` |
| `name` | `name` \|\| `official_name` | `name` | `name` | `displayName` \|\| `nickname` |
| `mask` | `mask` | `account_number` (last 4) | `accountNumber` (last 4) | `maskedAccountNumber` |
| `currency` | `iso_currency_code` \|\| `unofficial_currency_code` \|\| 'USD' | `currency_code` \|\| 'USD' | `currency` \|\| 'USD' | `currencyCode` \|\| 'USD' |
| `isClosed` | `false` (not provided) | `is_closed` | `status === 'closed'` | `status === 'CLOSED'` |

**Account Type Mapping:**

| Platform Type | Plaid | MX | Finicity | FDX |
|---------------|-------|-----|----------|-----|
| `checking` | `depository` + `checking` | `CHECKING` | `checking` | `CHECKING` |
| `savings` | `depository` + `savings` | `SAVINGS` | `savings` | `SAVINGS` |
| `money_market` | `depository` + `money market` | `MONEY_MARKET` | `moneyMarket` | `MONEYMARKET` |
| `cd` | `depository` + `cd` | `CERTIFICATE_OF_DEPOSIT` | `cd` | `CD` |
| `investment` | `investment` | `INVESTMENT` | `investment` | `INVESTMENT` |
| `brokerage` | `brokerage` | `BROKERAGE` | `brokerage` | `BROKERAGE` |
| `401k` | `investment` + `401k` | `RETIREMENT_401K` | `401k` | `RETIREMENT_401K` |
| `ira` | `investment` + `ira` | `RETIREMENT_IRA` | `ira` | `RETIREMENT_IRA` |
| `credit` | `credit` | `CREDIT_CARD` | `creditCard` | `CREDITCARD` |
| `loan` | `loan` | `LOAN` | `loan` | `LOAN` |
| `mortgage` | `loan` + `mortgage` | `MORTGAGE` | `mortgage` | `MORTGAGE` |
| `other` | (default) | (default) | (default) | (default) |

### Transactions Normalization

| Platform Field | Plaid | MX | Finicity | FDX |
|----------------|-------|-----|----------|-----|
| `id` | Generated UUID | Generated UUID | Generated UUID | Generated UUID |
| `providerTransactionId` | `transaction_id` | `guid` | `id` | `transactionId` |
| `accountId` | Lookup by `account_id` | Lookup by `account_guid` | Lookup by `accountId` | Lookup by `accountId` |
| `amount` | `-amount` (Plaid uses positive for debits) | `amount` | `-amount` (Finicity uses positive for debits) | `amount` (check sign via `debitCreditMemo`) |
| `currency` | `iso_currency_code` \|\| 'USD' | `currency_code` \|\| 'USD' | `currency` \|\| 'USD' | `currencyCode` \|\| 'USD' |
| `date` | `date` | `transacted_at` (parse date) | `postedDate` (parse) | `postedTimestamp` (parse date) |
| `datetime` | `datetime` \|\| null | `transacted_at` | `transactionDate` | `postedTimestamp` |
| `name` | `name` | `description` | `description` | `description` |
| `merchantName` | `merchant_name` | `merchant.name` | `categorization.normalizedPayeeName` | `merchant.name` |
| `category` | `personal_finance_category.detailed` | `category` (map) | `categorization.category` | `category` (map) |
| `pending` | `pending` | `status === 'PENDING'` | `status === 'pending'` | `status === 'PENDING'` |
| `checkNumber` | `check_number` | `check_number` | `checkNum` | `checkNumber` |

**Amount Sign Convention:**

```typescript
// Normalize all providers to: positive = credit (money in), negative = debit (money out)
function normalizeAmount(provider: ProviderType, amount: number, type?: string): number {
  switch (provider) {
    case 'plaid':
      // Plaid: positive = debit, negative = credit (inverted)
      return -amount;
    case 'mx':
      // MX: positive = credit, negative = debit (standard)
      return amount;
    case 'finicity':
      // Finicity: positive = debit, negative = credit (inverted)
      return -amount;
    case 'fdx':
      // FDX: depends on debitCreditMemo field
      // 'DEBIT' = money out (negative), 'CREDIT' = money in (positive)
      return amount;  // Already normalized
  }
}
```

### Holdings Normalization

| Platform Field | Plaid | MX | Finicity | FDX |
|----------------|-------|-----|----------|-----|
| `id` | Generated UUID | Generated UUID | Generated UUID | Generated UUID |
| `accountId` | Lookup by `account_id` | Lookup by `account_guid` | Lookup by `accountId` | Lookup by `accountId` |
| `securityId` | Lookup by `security_id` | Lookup by `holding.guid` | Generated from security | Lookup by `securityId` |
| `providerHoldingId` | null (not provided) | `guid` | `id` | `holdingId` |
| `quantity` | `quantity` | `shares` | `units` | `units` |
| `costBasis` | `cost_basis` | `cost_basis` | `costBasis` | `costBasis` |
| `marketValue` | `institution_value` | `market_value` | `marketValue` | `currentValue` |
| `price` | `institution_price` | `price` | `unitPrice` | `unitPrice` |
| `priceAsOf` | `institution_price_as_of` | `updated_at` | `priceDate` | `priceAsOf` |
| `currency` | `iso_currency_code` \|\| 'USD' | `currency_code` \|\| 'USD' | `currency` \|\| 'USD' | `currencyCode` \|\| 'USD' |

### Securities Normalization

| Platform Field | Plaid | MX | Finicity | FDX |
|----------------|-------|-----|----------|-----|
| `id` | Generated UUID | Generated UUID | Generated UUID | Generated UUID |
| `providerSecurityId` | `security_id` | `guid` | Generated hash | `securityId` |
| `name` | `name` | `name` | `description` | `securityName` |
| `ticker` | `ticker_symbol` | `symbol` | `symbol` | `ticker` |
| `type` | `type` (map) | `holding_type` (map) | `assetClass` (map) | `securityType` (map) |
| `currency` | `iso_currency_code` | `currency_code` | `currency` | `currencyCode` |
| `cusip` | `cusip` | `cusip` | `cusipNo` | `cusip` |
| `isin` | `isin` | `isin` | null | `isin` |
| `sedol` | `sedol` | null | null | `sedol` |
| `closePrice` | `close_price` | `market_price` | `currentPrice` | `unitPrice` |
| `closePriceAsOf` | `close_price_as_of` | `updated_at` | `priceDate` | `priceAsOf` |

**Security Type Mapping:**

| Platform Type | Plaid | MX | Finicity | FDX |
|---------------|-------|-----|----------|-----|
| `stock` | `equity` | `STOCK` | `STOCK` | `STOCK` |
| `bond` | `fixed income` | `BOND` | `BOND` | `BOND` |
| `mutual_fund` | `mutual fund` | `MUTUAL_FUND` | `MUTUALFUND` | `MUTUALFUND` |
| `etf` | `etf` | `ETF` | `ETF` | `ETF` |
| `option` | `derivative` | `OPTION` | `OPTION` | `OPTION` |
| `crypto` | `cryptocurrency` | `CRYPTOCURRENCY` | `CRYPTOCURRENCY` | `CRYPTOCURRENCY` |
| `cash` | `cash` | `CASH` | `CASH` | `CASH` |
| `other` | (default) | (default) | (default) | (default) |

### Liabilities Normalization

| Platform Field | Plaid | MX | Finicity | FDX |
|----------------|-------|-----|----------|-----|
| `id` | Generated UUID | Generated UUID | Generated UUID | Generated UUID |
| `accountId` | Lookup by `account_id` | Lookup by `account_guid` | Lookup by `accountId` | Lookup by `accountId` |
| `providerLiabilityId` | `account_id` | `guid` | `id` | `accountId` |
| `type` | Infer from account type | `loan_type` (map) | `type` (map) | `loanType` (map) |
| `currentBalance` | `balances.current` | `balance` | `currentBalance` | `currentBalance` (use directly; includes accrued interest) |
| `principalBalance` | Varies by type | `principal_balance` | `principal` | `principalBalance` |
| `interestRate` | `aprs[].apr_percentage` / 100 (see APR selection below) | `interest_rate` / 100 | `interestRate` / 100 | `interestRate` / 100 |
| `interestRateType` | `aprs[0].apr_type` (map) | `interest_rate_type` | `interestRateType` | `interestRateType` |
| `minimumPayment` | `minimum_payment_amount` | `minimum_payment` | `minimumPaymentAmount` | `minimumPaymentAmount` |
| `nextPaymentDueDate` | `next_payment_due_date` | `payment_due_at` | `nextPaymentDate` | `nextPaymentDate` |
| `nextPaymentAmount` | Varies by type | `next_payment` | `paymentAmount` | `paymentAmount` |
| `originationDate` | `origination_date` | `originated_at` | `originatingDate` | `originationDate` |
| `originationPrincipal` | `origination_principal_amount` | `original_principal` | `originalPrincipal` | `originalPrincipal` |
| `ytdInterestPaid` | `ytd_interest_paid` | `ytd_interest_paid` | `ytdInterestPaid` | `ytdInterestPaid` |

**Plaid APR Selection Logic:**

Plaid's `aprs` array can contain multiple APR entries with different types. Use this priority order to select the most relevant rate:

```typescript
const aprPriority = ['purchase_apr', 'balance_transfer_apr', 'cash_apr', 'special'];

function selectPlaidApr(aprs: Array<{ apr_type: string; apr_percentage: number }>): number | null {
  if (!aprs || aprs.length === 0) return null;

  // Find the highest-priority APR type available
  for (const aprType of aprPriority) {
    const match = aprs.find(apr => apr.apr_type === aprType);
    if (match) return match.apr_percentage / 100;
  }

  // Fallback to first APR if no priority match
  return aprs[0].apr_percentage / 100;
}
```

---

## Error Mapping

### Error Code Taxonomy

```typescript
type PlatformErrorCode =
  // Authentication errors (user action required)
  | 'REAUTHENTICATION_REQUIRED'    // User must re-link account
  | 'INVALID_CREDENTIALS'           // Credentials rejected
  | 'MFA_REQUIRED'                  // MFA challenge needed
  | 'UNSUPPORTED_MFA'               // Institution requires unsupported MFA method (terminal)
  | 'CONSENT_EXPIRED'               // FDX consent expired
  | 'CONSENT_REVOKED'               // User revoked consent

  // Provider errors (may be retryable)
  | 'PROVIDER_UNAVAILABLE'          // Provider is down
  | 'PROVIDER_TIMEOUT'              // Request timed out
  | 'INSTITUTION_NOT_SUPPORTED'     // Institution not available
  | 'INSTITUTION_DOWN'              // Specific institution is down

  // Rate limiting
  | 'RATE_LIMITED'                  // Too many requests

  // Data errors
  | 'NO_ACCOUNTS'                   // No accounts found
  | 'ACCOUNT_NOT_FOUND'             // Specific account missing
  | 'DATA_UNAVAILABLE'              // Data temporarily unavailable

  // Internal errors
  | 'UNKNOWN_PROVIDER_ERROR'        // Unmapped provider error
  | 'INTERNAL_ERROR';               // Platform internal error

type PlatformErrorType =
  | 'authentication_error'          // User action required
  | 'provider_error'                // Provider-side issue
  | 'rate_limit'                    // Rate limiting
  | 'api_error';                    // Other errors
```

### Provider Error Mapping

#### Plaid Errors

| Plaid Error Code | Platform Error Code | Error Type | Retryable | Notes |
|------------------|---------------------|------------|-----------|-------|
| `ITEM_LOGIN_REQUIRED` | `REAUTHENTICATION_REQUIRED` | `authentication_error` | No | User must re-link |
| `INVALID_CREDENTIALS` | `INVALID_CREDENTIALS` | `authentication_error` | No | Wrong username/password |
| `MFA_NOT_SUPPORTED` | `UNSUPPORTED_MFA` | `authentication_error` | No | Institution requires MFA method not supported by provider; user must link via alternative institution |
| `INSTITUTION_NOT_RESPONDING` | `INSTITUTION_DOWN` | `provider_error` | Yes | Exponential backoff |
| `INSTITUTION_NOT_AVAILABLE` | `INSTITUTION_NOT_SUPPORTED` | `provider_error` | No | Not supported |
| `RATE_LIMIT_EXCEEDED` | `RATE_LIMITED` | `rate_limit` | Yes | Respect `Retry-After` |
| `INTERNAL_SERVER_ERROR` | `PROVIDER_UNAVAILABLE` | `provider_error` | Yes | Retry with backoff |
| `PRODUCT_NOT_READY` | `DATA_UNAVAILABLE` | `provider_error` | Yes | Data still syncing |
| `NO_ACCOUNTS` | `NO_ACCOUNTS` | `api_error` | No | No accounts at institution |
| (unknown) | `UNKNOWN_PROVIDER_ERROR` | `api_error` | Yes (1x) | Log for investigation |

#### MX Errors

| MX HTTP Status / Error | Platform Error Code | Error Type | Retryable | Notes |
|------------------------|---------------------|------------|-----------|-------|
| `401 Unauthorized` | `INVALID_CREDENTIALS` | `authentication_error` | No | API key or user creds |
| `403 Forbidden` | `CONSENT_REVOKED` | `authentication_error` | No | Access revoked |
| `404 Not Found` | `ACCOUNT_NOT_FOUND` | `api_error` | No | Resource doesn't exist |
| `409 Conflict (challenged)` | `MFA_REQUIRED` | `authentication_error` | No | MFA required |
| `429 Too Many Requests` | `RATE_LIMITED` | `rate_limit` | Yes | Respect `Retry-After` |
| `500 Internal Server Error` | `PROVIDER_UNAVAILABLE` | `provider_error` | Yes | Retry with backoff |
| `503 Service Unavailable` | `PROVIDER_UNAVAILABLE` | `provider_error` | Yes | Retry with backoff |
| `504 Gateway Timeout` | `PROVIDER_TIMEOUT` | `provider_error` | Yes | Retry once |

#### Finicity Errors

| Finicity Error Code | Platform Error Code | Error Type | Retryable | Notes |
|---------------------|---------------------|------------|-----------|-------|
| `103` (Invalid credentials) | `INVALID_CREDENTIALS` | `authentication_error` | No | Re-link required |
| `108` (MFA required) | `MFA_REQUIRED` | `authentication_error` | No | MFA flow needed |
| `109` (Session expired) | `REAUTHENTICATION_REQUIRED` | `authentication_error` | No | Re-link required |
| `185` (Account not found) | `ACCOUNT_NOT_FOUND` | `api_error` | No | Account removed |
| `187` (Institution down) | `INSTITUTION_DOWN` | `provider_error` | Yes | Retry later |
| Timeout | `PROVIDER_TIMEOUT` | `provider_error` | Yes | 3 attempts max |
| 5xx errors | `PROVIDER_UNAVAILABLE` | `provider_error` | Yes | Exponential backoff |

#### FDX Errors

| FDX Error | Platform Error Code | Error Type | Retryable | Notes |
|-----------|---------------------|------------|-----------|-------|
| `401 Unauthorized` | `INVALID_CREDENTIALS` | `authentication_error` | No | Token invalid |
| `403 Consent Expired` | `CONSENT_EXPIRED` | `authentication_error` | No | Re-consent required |
| `403 Consent Revoked` | `CONSENT_REVOKED` | `authentication_error` | No | User revoked |
| `404 Not Found` | `ACCOUNT_NOT_FOUND` | `api_error` | No | Resource missing |
| `429 Too Many Requests` | `RATE_LIMITED` | `rate_limit` | Yes | Check `Retry-After` |
| `500+` | `PROVIDER_UNAVAILABLE` | `provider_error` | Yes | Retry with backoff |

### Error Response Format

```typescript
interface ProviderError extends Error {
  code: PlatformErrorCode;
  type: PlatformErrorType;
  message: string;
  retryable: boolean;
  retryAfter?: number;              // Seconds to wait before retry
  providerErrorCode?: string;       // Original provider error code
  providerErrorMessage?: string;    // Original provider message
  connectionId?: string;
  requestId?: string;               // For debugging
}
```

---

## Resilience Patterns

### Rate Limiting

**Strategy:** Token bucket algorithm per provider with separate buckets per operation type.

```typescript
interface RateLimitConfig {
  provider: ProviderType;
  limits: {
    default: { requestsPerMinute: number; burstSize: number };
    sync: { requestsPerMinute: number; burstSize: number };
    link: { requestsPerMinute: number; burstSize: number };
  };
}

const rateLimitConfigs: Record<ProviderType, RateLimitConfig> = {
  plaid: {
    provider: 'plaid',
    limits: {
      default: { requestsPerMinute: 100, burstSize: 20 },
      sync: { requestsPerMinute: 50, burstSize: 10 },
      link: { requestsPerMinute: 30, burstSize: 5 },
    },
  },
  mx: {
    provider: 'mx',
    limits: {
      default: { requestsPerMinute: 120, burstSize: 25 },
      sync: { requestsPerMinute: 60, burstSize: 15 },
      link: { requestsPerMinute: 40, burstSize: 10 },
    },
  },
  finicity: {
    provider: 'finicity',
    limits: {
      default: { requestsPerMinute: 80, burstSize: 15 },
      sync: { requestsPerMinute: 40, burstSize: 10 },
      link: { requestsPerMinute: 20, burstSize: 5 },
    },
  },
  fdx: {
    provider: 'fdx',
    limits: {
      // FDX limits vary by institution; use conservative defaults
      default: { requestsPerMinute: 60, burstSize: 10 },
      sync: { requestsPerMinute: 30, burstSize: 5 },
      link: { requestsPerMinute: 20, burstSize: 3 },
    },
  },
};
```

**Implementation Notes:**

- Store token bucket state in Redis for distributed rate limiting
- Always respect provider's `Retry-After` header when present
- Implement request queuing for burst handling
- Log rate limit events for capacity planning

### Circuit Breaker

**Pattern:** Per-provider circuit breaker with configurable thresholds.

```typescript
interface CircuitBreakerConfig {
  // Failure thresholds
  failureThreshold: number;         // % failure rate to open circuit (default: 50)
  minimumRequests: number;          // Min requests before evaluating (default: 10)
  windowDuration: number;           // Evaluation window in ms (default: 300000 = 5min)

  // Recovery
  halfOpenTimeout: number;          // Time before half-open in ms (default: 30000)
  successThreshold: number;         // Successes to close circuit (default: 3)
}

const defaultCircuitBreakerConfig: CircuitBreakerConfig = {
  failureThreshold: 50,             // 50% failure rate
  minimumRequests: 10,              // At least 10 requests in window
  windowDuration: 5 * 60 * 1000,    // 5-minute window
  halfOpenTimeout: 30 * 1000,       // 30 seconds
  successThreshold: 3,              // 3 consecutive successes to close
};
```

**State Machine:**

```
┌──────────┐  failure rate   ┌──────────┐  timeout   ┌──────────┐
│  CLOSED  │ ──────────────► │   OPEN   │ ─────────► │HALF-OPEN │
└──────────┘   >= threshold  └──────────┘            └──────────┘
     ▲                                                    │
     │                                                    │
     │         3 consecutive successes                    │
     └────────────────────────────────────────────────────┘
                                                          │
                                                          │ failure
                                                          ▼
                                                     ┌──────────┐
                                                     │   OPEN   │
                                                     └──────────┘
                                                     (reset timer)
```

**Behavior:**

| State | Behavior |
|-------|----------|
| **CLOSED** | Normal operation. Track failures. |
| **OPEN** | Fail fast with `PROVIDER_UNAVAILABLE`. No requests sent. |
| **HALF-OPEN** | Allow limited requests. Success → CLOSED, Failure → OPEN |

### Timeouts

| Operation | Timeout | Retry Behavior |
|-----------|---------|----------------|
| `createLinkToken` | 10s | No retry (fast operation) |
| `exchangeToken` | 30s | No retry (credential verification) |
| `syncAccounts` | 30s | 1 retry with 2s delay |
| `syncBalances` | 30s | 1 retry with 2s delay |
| `syncTransactions` | 120s | No retry (long-running; timeout excluded from default retry) |
| `syncHoldings` | 60s | 1 retry with 5s delay |
| `syncLiabilities` | 60s | 1 retry with 5s delay |
| `refreshItem` | 5s | No retry (async trigger) |
| `getItemStatus` | 10s | 1 retry with 1s delay |
| `verifyWebhook` | 5s | No retry (webhook validation) |

### Retry Strategy

```typescript
interface RetryConfig {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  retryableErrors: PlatformErrorCode[];
}

const defaultRetryConfig: RetryConfig = {
  maxAttempts: 3,
  baseDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
  retryableErrors: [
    'PROVIDER_UNAVAILABLE',
    'PROVIDER_TIMEOUT',  // Note: operation-specific retry behavior in Timeouts table overrides this
    'INSTITUTION_DOWN',
    'DATA_UNAVAILABLE',
    'UNKNOWN_PROVIDER_ERROR',
  ],
};

// Note: The Timeouts table above specifies per-operation retry behavior.
// Operations marked "No retry" should NOT retry on timeout, even though
// PROVIDER_TIMEOUT is listed as retryable by default. The operation-specific
// configuration takes precedence over the default retry config.

// Delay calculation: min(baseDelay * (multiplier ^ attempt), maxDelay)
// Attempt 1: 1000ms
// Attempt 2: 2000ms
// Attempt 3: 4000ms
```

---

## Observability

### Metrics

All metrics use Prometheus format with the following labels:

| Label | Description |
|-------|-------------|
| `provider` | Provider ID (plaid, mx, finicity, fdx) |
| `method` | Interface method name |
| `status` | Result status (success, error, timeout) |
| `error_code` | Platform error code (when status=error) |

**Request Metrics:**

```prometheus
# Request duration histogram
provider_request_duration_seconds{provider, method, status}

# Request count
provider_request_total{provider, method, status, error_code}

# Active requests gauge
provider_requests_in_flight{provider, method}
```

**Circuit Breaker Metrics:**

```prometheus
# Circuit breaker state (0=closed, 1=open, 2=half-open)
provider_circuit_breaker_state{provider}

# State transitions
provider_circuit_breaker_transitions_total{provider, from_state, to_state}
```

**Rate Limiter Metrics:**

```prometheus
# Requests rejected due to rate limiting
provider_rate_limit_rejections_total{provider}

# Current token bucket fill level
provider_rate_limit_tokens{provider}
```

**Data Quality Metrics:**

```prometheus
# Normalization errors
provider_normalization_errors_total{provider, method, field}

# Records processed
provider_records_normalized_total{provider, method, record_type}
```

### Structured Logging

All provider interactions are logged with consistent structure:

```typescript
interface ProviderLogEvent {
  // Identity
  timestamp: string;              // ISO 8601
  level: 'debug' | 'info' | 'warn' | 'error';

  // Context
  traceId: string;                // Distributed trace ID
  spanId: string;                 // Span ID
  requestId: string;              // Unique request ID

  // Provider details
  provider: ProviderType;
  method: string;
  connectionId?: string;

  // Performance
  durationMs: number;

  // Result
  status: 'success' | 'error' | 'timeout';
  statusCode?: number;            // HTTP status code
  errorCode?: string;             // Platform error code
  errorMessage?: string;

  // Request/response (redacted)
  requestSize?: number;
  responseSize?: number;
  recordCount?: number;           // Number of records returned
}
```

**Example Log Entry:**

```json
{
  "timestamp": "2026-01-24T10:30:00.123Z",
  "level": "info",
  "traceId": "abc123",
  "spanId": "def456",
  "requestId": "req_789",
  "provider": "plaid",
  "method": "syncTransactions",
  "connectionId": "conn_abc",
  "durationMs": 1523,
  "status": "success",
  "statusCode": 200,
  "recordCount": 147
}
```

### Distributed Tracing

- Propagate trace context (W3C Trace Context format) to all provider calls
- Create child spans for each provider operation
- Include provider-specific metadata as span attributes

```typescript
// Span attributes
{
  "provider.name": "plaid",
  "provider.method": "syncTransactions",
  "provider.connection_id": "conn_abc",
  "provider.item_id": "item_xyz",
  "http.status_code": 200,
  "records.added": 47,
  "records.modified": 3,
  "records.removed": 0
}
```

---

## Related Documents

- [OpenAPI Specification](./openapi.yaml) — Platform API contract
- [Data Model](./data-model.md) — Database schema (includes `BankTransaction` and `CashAccount` models)
- [Provider Routing](./provider-routing.md) — Multi-provider routing strategy
- [Sync and Freshness](./sync-and-freshness.md) — Data sync cadence
