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

### Institution Methods

#### Search Institutions
Search for supported financial institutions.

```typescript
const institutions = await client.searchInstitutions('Fidelity');

for (const inst of institutions) {
  console.log(`${inst.name} (${inst.id})`);
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

  // Portfolio
  PortfolioSummary,
  AssetAllocation,
  TopHolding,
  ConcentrationAlert,
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
```
