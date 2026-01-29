import { AccountDetail } from "@/components/dashboard/AccountDetail";

// Mock account data (in production, this would be fetched from the API)
const mockAccounts: Record<string, {
  id: string;
  name: string;
  balance: number;
  account_type: string;
  is_tax_advantaged: boolean;
  institution_name: string;
  provider_account_id: string;
  holdings: Array<{
    id: string;
    ticker: string | null;
    name: string;
    security_type: string;
    quantity: number;
    market_value: number;
    cost_basis: number | null;
    account_name: string;
    account_type: string;
  }>;
  allocation: Array<{
    category: string;
    value: number;
    percentage: number;
  }>;
}> = {
  "acc-1": {
    id: "acc-1",
    name: "Fidelity 401(k)",
    balance: 125000,
    account_type: "401k",
    is_tax_advantaged: true,
    institution_name: "Fidelity",
    provider_account_id: "xxx-1234",
    holdings: [
      { id: "h1", ticker: "VTI", name: "Vanguard Total Stock Market ETF", security_type: "etf", quantity: 150, market_value: 38500, cost_basis: 32000, account_name: "Fidelity 401(k)", account_type: "401k" },
      { id: "h2", ticker: "BND", name: "Vanguard Total Bond Market ETF", security_type: "bond", quantity: 150, market_value: 11850, cost_basis: 12000, account_name: "Fidelity 401(k)", account_type: "401k" },
      { id: "h3", ticker: "FXAIX", name: "Fidelity 500 Index Fund", security_type: "mutual_fund", quantity: 120, market_value: 23700, cost_basis: 20000, account_name: "Fidelity 401(k)", account_type: "401k" },
      { id: "h4", ticker: "FTBFX", name: "Fidelity Total Bond Fund", security_type: "bond", quantity: 200, market_value: 18950, cost_basis: 19000, account_name: "Fidelity 401(k)", account_type: "401k" },
      { id: "h5", ticker: null, name: "Money Market", security_type: "cash", quantity: 32000, market_value: 32000, cost_basis: 32000, account_name: "Fidelity 401(k)", account_type: "401k" },
    ],
    allocation: [
      { category: "etf", value: 38500, percentage: 30.8 },
      { category: "mutual_fund", value: 23700, percentage: 19.0 },
      { category: "bond", value: 30800, percentage: 24.6 },
      { category: "cash", value: 32000, percentage: 25.6 },
    ],
  },
  "acc-2": {
    id: "acc-2",
    name: "Fidelity Brokerage",
    balance: 67000,
    account_type: "brokerage",
    is_tax_advantaged: false,
    institution_name: "Fidelity",
    provider_account_id: "xxx-5678",
    holdings: [
      { id: "h6", ticker: "AAPL", name: "Apple Inc.", security_type: "stock", quantity: 100, market_value: 19200, cost_basis: 15000, account_name: "Fidelity Brokerage", account_type: "brokerage" },
      { id: "h7", ticker: "MSFT", name: "Microsoft Corporation", security_type: "stock", quantity: 50, market_value: 18900, cost_basis: 14000, account_name: "Fidelity Brokerage", account_type: "brokerage" },
      { id: "h8", ticker: "GOOGL", name: "Alphabet Inc.", security_type: "stock", quantity: 30, market_value: 4200, cost_basis: 3800, account_name: "Fidelity Brokerage", account_type: "brokerage" },
      { id: "h9", ticker: "NVDA", name: "NVIDIA Corporation", security_type: "stock", quantity: 25, market_value: 12100, cost_basis: 8000, account_name: "Fidelity Brokerage", account_type: "brokerage" },
      { id: "h10", ticker: "AMZN", name: "Amazon.com Inc.", security_type: "stock", quantity: 40, market_value: 7400, cost_basis: 6500, account_name: "Fidelity Brokerage", account_type: "brokerage" },
      { id: "h11", ticker: null, name: "Cash", security_type: "cash", quantity: 5200, market_value: 5200, cost_basis: 5200, account_name: "Fidelity Brokerage", account_type: "brokerage" },
    ],
    allocation: [
      { category: "stock", value: 61800, percentage: 92.2 },
      { category: "cash", value: 5200, percentage: 7.8 },
    ],
  },
  "acc-3": {
    id: "acc-3",
    name: "Roth IRA",
    balance: 45000,
    account_type: "roth_ira",
    is_tax_advantaged: true,
    institution_name: "Fidelity",
    provider_account_id: "xxx-9012",
    holdings: [
      { id: "h12", ticker: "VOO", name: "Vanguard S&P 500 ETF", security_type: "etf", quantity: 40, market_value: 17600, cost_basis: 15500, account_name: "Roth IRA", account_type: "roth_ira" },
      { id: "h13", ticker: "VGT", name: "Vanguard Information Technology ETF", security_type: "etf", quantity: 30, market_value: 15200, cost_basis: 12000, account_name: "Roth IRA", account_type: "roth_ira" },
      { id: "h14", ticker: "VXUS", name: "Vanguard Total International Stock ETF", security_type: "etf", quantity: 150, market_value: 8700, cost_basis: 9000, account_name: "Roth IRA", account_type: "roth_ira" },
      { id: "h15", ticker: null, name: "Cash", security_type: "cash", quantity: 3500, market_value: 3500, cost_basis: 3500, account_name: "Roth IRA", account_type: "roth_ira" },
    ],
    allocation: [
      { category: "etf", value: 41500, percentage: 92.2 },
      { category: "cash", value: 3500, percentage: 7.8 },
    ],
  },
};

// Generate static params for all known account IDs
export function generateStaticParams() {
  return Object.keys(mockAccounts).map((id) => ({
    id,
  }));
}

export default async function AccountDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const account = mockAccounts[id] || null;

  return <AccountDetail account={account} />;
}
