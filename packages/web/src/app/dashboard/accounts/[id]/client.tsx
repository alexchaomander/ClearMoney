"use client";

import { useParams } from "next/navigation";
import { AccountDetail } from "@/components/dashboard/AccountDetail";
import { DashboardLoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { ApiErrorState } from "@/components/shared/ApiErrorState";
import { useInvestmentAccount } from "@/lib/strata/hooks";
import type { InvestmentAccountWithHoldings } from "@clearmoney/strata-sdk";

function mapToAccountData(data: InvestmentAccountWithHoldings) {
  const holdings = data.holdings.map((h) => ({
    id: h.id,
    ticker: h.security.ticker,
    name: h.security.name,
    security_type: h.security.security_type,
    quantity: h.quantity,
    market_value: h.market_value ?? 0,
    cost_basis: h.cost_basis,
    account_name: data.name,
    account_type: data.account_type,
  }));

  const totalValue = holdings.reduce((sum, h) => sum + h.market_value, 0);
  const allocationMap: Record<string, number> = {};
  for (const h of holdings) {
    allocationMap[h.security_type] =
      (allocationMap[h.security_type] ?? 0) + h.market_value;
  }
  const allocation = Object.entries(allocationMap).map(([category, value]) => ({
    category,
    value,
    percentage: totalValue > 0 ? (value / totalValue) * 100 : 0,
  }));

  return {
    id: data.id,
    name: data.name,
    balance: data.balance,
    account_type: data.account_type,
    is_tax_advantaged: data.is_tax_advantaged,
    institution_name: data.institution_id ?? "Unknown",
    provider_account_id: data.provider_account_id ?? "",
    holdings,
    allocation,
  };
}

export function AccountDetailClient() {
  const { id } = useParams<{ id: string }>();

  const {
    data: accountData,
    isLoading,
    isError,
    refetch,
  } = useInvestmentAccount(id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-950 p-8">
        <div className="max-w-7xl mx-auto">
          <DashboardLoadingSkeleton />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <ApiErrorState
          message="Could not load account details. Please check that the API is running."
          onRetry={refetch}
        />
      </div>
    );
  }

  const account = accountData ? mapToAccountData(accountData) : null;

  return <AccountDetail account={account} />;
}
