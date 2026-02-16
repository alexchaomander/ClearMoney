"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useParams } from "next/navigation";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { ConsentGate } from "@/components/shared/ConsentGate";
import { ApiErrorState } from "@/components/shared/ApiErrorState";
import { DashboardLoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { DataSourceStatusStrip, type DataSourceStatusItem } from "@/components/dashboard/DataSourceStatusStrip";
import { AccountDetail } from "@/components/dashboard/AccountDetail";
import { getPreviewInvestmentAccount, PREVIEW_INVESTMENT_ACCOUNT_IDS } from "../../_shared/preview-data";
import { useConnections, useConsentStatus, useInvestmentAccount, useSyncAllConnections } from "@/lib/strata/hooks";
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
    institution_name: data.institution_name ?? data.institution_id ?? "Unknown",
    provider_account_id: data.provider_account_id ?? "",
    holdings,
    allocation,
  };
}

export function AccountDetailClient() {
  const { id } = useParams<{ id: string }>();
  const { hasConsent: hasAccountConsent, isLoading: accountConsentLoading } = useConsentStatus(["accounts:read"]);
  const { hasConsent: hasConnectionsConsent, isLoading: connectionsConsentLoading } =
    useConsentStatus(["connections:read"]);
  const { hasConsent: hasSyncConsent } = useConsentStatus(["connections:write"]);
  const syncAllConnections = useSyncAllConnections();

  const {
    data: accountData,
    isLoading: accountLoading,
    isError: accountError,
    error: accountErrorDetails,
    refetch: refetchAccount,
  } = useInvestmentAccount(id, { enabled: hasAccountConsent });

  const {
    data: connections,
    isLoading: connectionsLoading,
    isError: connectionsError,
    error: connectionsErrorDetails,
    refetch: refetchConnections,
  } = useConnections({ enabled: hasConnectionsConsent });

  const fallbackAccount = useMemo(
    () =>
      getPreviewInvestmentAccount(id) ??
      getPreviewInvestmentAccount(PREVIEW_INVESTMENT_ACCOUNT_IDS[0]),
    [id]
  );
  const account = useMemo(
    () => (accountData ? mapToAccountData(accountData) : fallbackAccount ? mapToAccountData(fallbackAccount) : null),
    [accountData, fallbackAccount],
  );
  const usingDemoData = !hasAccountConsent || !accountData || account?.id !== accountData.id;

  const isLoading =
    accountConsentLoading ||
    connectionsConsentLoading ||
    accountLoading ||
    connectionsLoading;

  const lastSyncedAt = useMemo(() => {
    if (!connections?.length) return null;
    const syncTimes = connections
      .map((connection) => connection.last_synced_at)
      .filter((date): date is string => Boolean(date))
      .map((date) => new Date(date).getTime())
      .filter((timestamp) => !Number.isNaN(timestamp));
    if (!syncTimes.length) return null;
    return new Date(Math.max(...syncTimes)).toISOString();
  }, [connections]);

  const sourceItems = useMemo<DataSourceStatusItem[]>(() => {
    const previewName = fallbackAccount?.name ?? "Demo account";
    return [
      {
        id: "account",
        title: "Account detail",
        value: accountData ? "Live" : "Demo",
        detail: accountData
          ? `${accountData.name} loaded from your Strata source.`
          : `Preview account ${previewName} is active.`,
        tone: accountData ? "live" : "warning",
        href: "/connect",
        actionLabel: "Add account",
      },
      {
        id: "connections",
        title: "Connections",
        value: connections?.length ? `${connections.length} active` : "No active links",
        detail: connections?.length
          ? "Connection metadata is available."
          : "No active connection metadata yet.",
        tone: connections?.length ? "live" : "warning",
        href: "/connect",
        actionLabel: "Manage links",
        lastSyncedAt,
      },
    ];
  }, [accountData, connections, fallbackAccount?.name, lastSyncedAt]);

  async function handleRefresh() {
    if (!hasSyncConsent) {
      await refetchAccount();
      if (hasConnectionsConsent) {
        await refetchConnections();
      }
      return;
    }
    await syncAllConnections.mutateAsync();
    await refetchAccount();
    if (hasConnectionsConsent) {
      await refetchConnections();
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-950 p-8">
        <div className="max-w-7xl mx-auto">
          {!hasAccountConsent && (
            <ConsentGate
              scopes={["accounts:read"]}
              purpose="Load account details and holdings."
            >
              <div className="text-sm text-neutral-400">
                Authorize access to view account details.
              </div>
            </ConsentGate>
          )}
          <DashboardLoadingSkeleton />
        </div>
      </div>
    );
  }

  if (!account && (accountError || connectionsError)) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <ApiErrorState
          message="Could not load account detail snapshot."
          error={accountErrorDetails ?? connectionsErrorDetails}
          onRetry={handleRefresh}
        />
      </div>
    );
  }

  if (!account) {
    return (
      <div className="min-h-screen bg-neutral-950 p-8">
        <div className="max-w-7xl mx-auto">
          <DataSourceStatusStrip items={sourceItems} usingDemoData={usingDemoData} />
          <p className="mt-3 rounded-lg border border-neutral-800 bg-neutral-900 p-4 text-sm text-neutral-300">
            This account is not available in live or preview data. Connect a source account in Strata to continue.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex mt-4 text-sm text-emerald-400 hover:text-emerald-300"
          >
            ← Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950">
      <DashboardHeader
        showRefresh={hasSyncConsent}
        isRefreshing={syncAllConnections.isPending}
        onRefresh={handleRefresh}
      />

      <main className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <DataSourceStatusStrip items={sourceItems} usingDemoData={usingDemoData} />
        {usingDemoData ? (
          <p className="mt-2 text-xs text-amber-300 inline-flex items-center gap-2">
            Synthetic account preview is active until live Strata data is connected.
          </p>
        ) : null}
        <section className="mt-4">
          <AccountDetail account={account} />
        </section>
      </main>
    </div>
  );
}
