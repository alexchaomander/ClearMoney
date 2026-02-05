# Strata SDK

TypeScript client library for the Strata API. Provides typed methods for investment account connectivity, portfolio management, and data retrieval.

## Installation

```bash
npm install @clearmoney/strata-sdk
# or
pnpm add @clearmoney/strata-sdk
```

## Quick Start

```typescript
import { StrataClient } from '@clearmoney/strata-sdk';

const client = new StrataClient({
  baseUrl: 'https://api.strata.example.com',
  userId: 'user_abc123', // Clerk user ID
});

// Get portfolio summary
const portfolio = await client.getPortfolioSummary();
console.log(`Net Worth: $${portfolio.net_worth}`);

// List investment accounts
const accounts = await client.getInvestmentAccounts();
for (const account of accounts) {
  console.log(`${account.name}: $${account.balance}`);
}
```

## API Reference

### Client Configuration

```typescript
interface StrataClientConfig {
  baseUrl: string;    // Strata API base URL
  userId: string;     // User ID for authentication
  headers?: Record<string, string>; // Additional headers
}
```

### Connection Methods

#### Create Link Session
Start the OAuth flow to connect a brokerage account.

```typescript
const session = await client.createLinkSession({
  institution_id: 'inst_123',  // Optional
  redirect_uri: 'https://app.example.com/callback',
});

// Redirect user to session.redirect_url
window.location.href = session.redirect_url;
```

#### Handle Callback
Process the OAuth callback after user authorization.

```typescript
const connection = await client.handleConnectionCallback({
  code: 'auth_code_from_provider',
  state: 'state_from_provider',
});
```

#### List Connections
Get all connected accounts for the user.

```typescript
const connections = await client.getConnections();
```

#### Delete Connection
Remove a connected account.

```typescript
await client.deleteConnection('connection_id');
```

#### Sync Connection
Trigger a manual data sync for a connection.

```typescript
await client.syncConnection('connection_id');
```

### Account Methods

#### List All Accounts
Get all accounts grouped by type.

```typescript
const accounts = await client.getAccounts();
// accounts.cash_accounts
// accounts.debt_accounts
// accounts.investment_accounts
```

#### List Investment Accounts
Get investment accounts only.

```typescript
const accounts = await client.getInvestmentAccounts();
```

#### Get Investment Account Detail
Get account with holdings.

```typescript
const account = await client.getInvestmentAccount('account_id');
// account.holdings contains HoldingWithSecurity[]
```

### Portfolio Methods

#### Get Portfolio Summary
Get aggregated portfolio data including net worth, allocations, and alerts.

```typescript
const summary = await client.getPortfolioSummary();

console.log(`Net Worth: $${summary.net_worth}`);
console.log(`Investment Value: $${summary.total_investment_value}`);
console.log(`Cash: $${summary.total_cash_value}`);
console.log(`Debt: $${summary.total_debt_value}`);

// Asset allocation
for (const alloc of summary.allocation_by_asset_type) {
  console.log(`${alloc.category}: ${alloc.percentage}%`);
}

// Concentration alerts
for (const alert of summary.concentration_alerts) {
  console.log(`Warning: ${alert.message}`);
}
```

#### Get All Holdings
Get holdings across all accounts.

```typescript
const holdings = await client.getHoldings();

for (const holding of holdings) {
  console.log(`${holding.security.ticker}: ${holding.quantity} shares`);
  console.log(`  Value: $${holding.market_value}`);
  console.log(`  Account: ${holding.account_name}`);
}
```

### Transaction Methods

#### Get Transactions
List investment transactions with optional filtering and pagination.

```typescript
// Get recent transactions (default: 100 most recent)
const transactions = await client.getTransactions();

// Filter by account
const accountTxns = await client.getTransactions({
  accountId: 'account_id',
});

// Filter by date range
const dateFiltered = await client.getTransactions({
  startDate: '2026-01-01',
  endDate: '2026-01-31',
});

for (const txn of transactions) {
  console.log(`${txn.type}: ${txn.description}`);
  console.log(`  Amount: $${txn.amount}`);
  console.log(`  Date: ${txn.trade_date}`);
}
```

**Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `accountId` | `string` | Filter by investment account ID |
| `startDate` | `string` | Filter transactions on or after this date (YYYY-MM-DD) |
| `endDate` | `string` | Filter transactions on or before this date (YYYY-MM-DD) |

### Institution Methods

#### Search Institutions
Search for supported financial institutions.

```typescript
const institutions = await client.searchInstitutions('Fidelity');

for (const inst of institutions) {
  console.log(`${inst.name} (${inst.id})`);
}
```

### Banking Methods (Plaid)

#### Create Plaid Link Token
Get a link token to initialize Plaid Link on the client.

```typescript
const linkToken = await client.createPlaidLinkToken({
  redirect_uri: 'https://app.example.com/connect', // Optional
});

// Use linkToken.link_token to initialize Plaid Link
```

#### Handle Plaid Callback
Process the Plaid Link success callback after user authorization.

```typescript
const connection = await client.handlePlaidCallback({
  public_token: 'public-sandbox-xxx', // From Plaid Link onSuccess
});
```

#### List Bank Accounts
Get all bank accounts (linked via Plaid and manual).

```typescript
const accounts = await client.getBankAccounts();

for (const account of accounts) {
  console.log(`${account.name}: $${account.balance}`);
  console.log(`  Type: ${account.account_type}`);
  console.log(`  Linked: ${!account.is_manual}`);
}
```

#### List Bank Transactions
Get bank transactions with filtering and pagination.

```typescript
// Get recent transactions
const result = await client.getBankTransactions();

// Filter by account
const filtered = await client.getBankTransactions({
  account_id: 'account-uuid',
});

// Filter by date range and category
const dateFiltered = await client.getBankTransactions({
  start_date: '2026-01-01',
  end_date: '2026-01-31',
  category: 'FOOD_AND_DRINK',
  page: 1,
  page_size: 100,
});

for (const txn of result.transactions) {
  console.log(`${txn.name}: $${txn.amount}`);
  console.log(`  Category: ${txn.primary_category}`);
  console.log(`  Date: ${txn.transaction_date}`);
}
```

**Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `account_id` | `string` | Filter by bank account ID |
| `start_date` | `string` | Filter transactions on or after this date (YYYY-MM-DD) |
| `end_date` | `string` | Filter transactions on or before this date (YYYY-MM-DD) |
| `category` | `string` | Filter by primary category |
| `page` | `number` | Page number (default: 1) |
| `page_size` | `number` | Items per page (1-500, default: 50) |

#### Get Spending Summary
Get spending breakdown by category for a time period.

```typescript
const summary = await client.getSpendingSummary(3); // Last 3 months

console.log(`Total Spending: $${summary.total_spending}`);
console.log(`Monthly Average: $${summary.monthly_average}`);

for (const cat of summary.categories) {
  console.log(`${cat.category}: $${cat.total} (${cat.percentage}%)`);
}
```

## Types

The SDK exports all TypeScript types for use in your application:

```typescript
import type {
  // Connections
  Connection,
  ConnectionStatus,
  LinkSessionRequest,
  LinkSessionResponse,

  // Institutions
  Institution,

  // Accounts
  InvestmentAccount,
  InvestmentAccountType,
  CashAccount,
  DebtAccount,
  AllAccountsResponse,
  InvestmentAccountWithHoldings,

  // Securities & Holdings
  Security,
  SecurityType,
  Holding,
  HoldingWithSecurity,
  HoldingDetail,

  // Investment Transactions
  Transaction,
  TransactionType,

  // Portfolio
  PortfolioSummary,
  PortfolioHistoryPoint,
  PortfolioHistoryRange,
  AssetAllocation,
  TopHolding,
  ConcentrationAlert,

  // Banking (Plaid)
  PlaidLinkRequest,
  PlaidLinkResponse,
  PlaidCallbackRequest,
  BankAccount,
  BankTransaction,
  BankTransactionQuery,
  PaginatedBankTransactions,
  SpendingSummary,
  SpendingCategory,
} from '@clearmoney/strata-sdk';
```

### Account Types

| Type | Description |
|------|-------------|
| `brokerage` | Taxable brokerage account |
| `ira` | Traditional IRA |
| `roth_ira` | Roth IRA |
| `401k` | 401(k) retirement account |
| `403b` | 403(b) retirement account |
| `hsa` | Health Savings Account |
| `sep_ira` | SEP IRA |
| `simple_ira` | SIMPLE IRA |
| `pension` | Pension account |
| `trust` | Trust account |
| `other` | Other account type |

### Security Types

| Type | Description |
|------|-------------|
| `stock` | Individual stock |
| `etf` | Exchange-traded fund |
| `mutual_fund` | Mutual fund |
| `bond` | Bond |
| `crypto` | Cryptocurrency |
| `cash` | Cash or money market |
| `option` | Options contract |
| `other` | Other security type |

## Error Handling

The client throws errors for failed requests:

```typescript
try {
  const account = await client.getInvestmentAccount('invalid_id');
} catch (error) {
  if (error instanceof Error) {
    console.error('Failed to fetch account:', error.message);
  }
}
```

## Usage with React Query

```typescript
import { useQuery } from '@tanstack/react-query';
import { StrataClient } from '@clearmoney/strata-sdk';

const client = new StrataClient({
  baseUrl: process.env.NEXT_PUBLIC_STRATA_API_URL!,
  userId: user.id,
});

function usePortfolio() {
  return useQuery({
    queryKey: ['portfolio'],
    queryFn: () => client.getPortfolioSummary(),
  });
}

function useInvestmentAccounts() {
  return useQuery({
    queryKey: ['investment-accounts'],
    queryFn: () => client.getInvestmentAccounts(),
  });
}

function useTransactions(accountId?: string) {
  return useQuery({
    queryKey: ['transactions', accountId],
    queryFn: () => client.getTransactions({ accountId }),
  });
}
```
