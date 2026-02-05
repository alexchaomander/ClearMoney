"use client";

import { motion } from "framer-motion";
import { Trash2, RefreshCw, Wifi, Landmark, CreditCard, Info } from "lucide-react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import {
  useConnections,
  useAccounts,
  usePopularInstitutions,
  useSyncConnection,
  useDeleteConnection,
  useCashAccountMutations,
  useDebtAccountMutations,
  useConsentStatus,
  useConsents,
  useRevokeConsent,
} from "@/lib/strata/hooks";
import { formatTitleCase, getInitials } from "@/lib/shared/formatters";
import type { Institution } from "@clearmoney/strata-sdk";
import { ConsentGate } from "@/components/shared/ConsentGate";

const CONSENT_SCOPES = [
  "connections:read",
  "connections:write",
  "accounts:read",
  "accounts:write",
  "portfolio:read",
  "holdings:read",
  "transactions:read",
  "memory:read",
  "memory:write",
  "decision_traces:read",
];

function getInstitutionName(
  institutionId: string | null,
  institutions: Institution[] | undefined,
): string {
  if (!institutionId) return "Unknown";
  const inst = institutions?.find((i) => i.id === institutionId);
  return inst?.name ?? "Unknown";
}

export default function SettingsPage() {
  const { hasConsent: hasSettingsConsent } = useConsentStatus([
    "connections:read",
    "connections:write",
    "accounts:read",
    "accounts:write",
  ]);
  const { data: connections, isLoading: connectionsLoading } = useConnections({ enabled: hasSettingsConsent });
  const { data: institutions } = usePopularInstitutions({ enabled: hasSettingsConsent });
  const { data: allAccounts, isLoading: accountsLoading } = useAccounts({ enabled: hasSettingsConsent });
  const syncConnection = useSyncConnection();
  const deleteConnection = useDeleteConnection();
  const cashMutations = useCashAccountMutations();
  const debtMutations = useDebtAccountMutations();
  const { data: consents } = useConsents();
  const revokeConsent = useRevokeConsent();

  const sectionClass = "p-6 rounded-xl bg-neutral-900 border border-neutral-800";
  const rowClass = "flex items-center gap-3 p-3 rounded-xl bg-neutral-900 border border-neutral-800";

  return (
    <div className="min-h-screen bg-neutral-950">
      <div
        className="fixed inset-0 opacity-30 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(16, 185, 129, 0.15) 0%, transparent 60%)",
        }}
      />

      <DashboardHeader />

      <main className="relative z-10 max-w-4xl mx-auto px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="font-serif text-3xl text-white mb-1">Settings</h1>
          <p className="text-neutral-400 mb-8">
            Manage your accounts, connections, and preferences
          </p>
        </motion.div>

        <ConsentGate
          scopes={["connections:read", "connections:write", "accounts:read", "accounts:write"]}
          purpose="Manage connected accounts and manual entries."
        >
        <div className="space-y-6">
          {/* Connected Accounts */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={sectionClass}
          >
            <div className="flex items-center gap-2 mb-4">
              <Wifi className="w-5 h-5 text-emerald-400" />
              <h2 className="font-serif text-xl text-neutral-100">
                Connected Accounts
              </h2>
            </div>

            {connectionsLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 rounded-xl bg-neutral-800/50 animate-pulse" />
                ))}
              </div>
            ) : connections && connections.length > 0 ? (
              <div className="space-y-2">
                {connections.map((conn) => (
                  <div key={conn.id} className={rowClass}>
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-neutral-800 text-neutral-300 text-sm font-medium">
                      {getInitials(getInstitutionName(conn.institution_id, institutions))}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-neutral-100 truncate">
                        {getInstitutionName(conn.institution_id, institutions)}
                      </p>
                      <p className="text-xs text-neutral-500">
                        Status: {conn.status} &middot; Provider: {conn.provider}
                      </p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => syncConnection.mutate(conn.id)}
                        disabled={syncConnection.isPending}
                        className="p-2 rounded-lg text-neutral-400 hover:text-emerald-400 hover:bg-emerald-400/10 transition-all"
                        title="Sync"
                      >
                        <RefreshCw className={`w-4 h-4 ${syncConnection.isPending ? "animate-spin" : ""}`} />
                      </button>
                      <button
                        onClick={() => deleteConnection.mutate(conn.id)}
                        disabled={deleteConnection.isPending}
                        className="p-2 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-red-400/10 transition-all"
                        title="Disconnect"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-neutral-500">No connected accounts</p>
            )}
          </motion.div>

          {/* Manual Accounts */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={sectionClass}
          >
            <div className="flex items-center gap-2 mb-4">
              <Landmark className="w-5 h-5 text-emerald-400" />
              <h2 className="font-serif text-xl text-neutral-100">
                Manual Accounts
              </h2>
            </div>

            {accountsLoading ? (
              <div className="space-y-2">
                {[1, 2].map((i) => (
                  <div key={i} className="h-14 rounded-xl bg-neutral-800/50 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {allAccounts?.cash_accounts.map((account) => (
                  <div key={account.id} className={rowClass}>
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-emerald-900/30 text-emerald-400 text-sm font-medium">
                      {getInitials(account.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-neutral-100 truncate">
                        {account.name}
                      </p>
                      <p className="text-xs text-neutral-500">
                        Cash &middot; {formatTitleCase(account.account_type)}
                        {account.institution_name ? ` &middot; ${account.institution_name}` : ""}
                      </p>
                    </div>
                    <button
                      onClick={() => cashMutations.remove.mutate(account.id)}
                      className="p-2 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-red-400/10 transition-all shrink-0"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {allAccounts?.debt_accounts.map((account) => (
                  <div key={account.id} className={rowClass}>
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-red-900/30 text-red-400 text-sm font-medium">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-neutral-100 truncate">
                        {account.name}
                      </p>
                      <p className="text-xs text-neutral-500">
                        Debt &middot; {formatTitleCase(account.debt_type)}
                        {account.institution_name ? ` &middot; ${account.institution_name}` : ""}
                      </p>
                    </div>
                    <button
                      onClick={() => debtMutations.remove.mutate(account.id)}
                      className="p-2 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-red-400/10 transition-all shrink-0"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {(!allAccounts?.cash_accounts.length && !allAccounts?.debt_accounts.length) && (
                  <p className="text-sm text-neutral-500">No manual accounts</p>
                )}
              </div>
            )}
          </motion.div>
        </div>
        </ConsentGate>

        <div className="space-y-6">
          {/* Consent Controls */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={sectionClass}
          >
            <div className="flex items-center gap-2 mb-4">
              <Info className="w-5 h-5 text-emerald-400" />
              <h2 className="font-serif text-xl text-neutral-100">
                Data Access & Consent
              </h2>
            </div>
            <p className="text-sm text-neutral-400 mb-4">
              You control what data ClearMoney can use. Revoke access at any time.
            </p>
            <div className="space-y-3">
              {CONSENT_SCOPES.map((scope) => {
                const active = consents?.find(
                  (c) =>
                    c.status === "active" && c.scopes.includes(scope)
                );
                return (
                  <div key={scope} className={rowClass}>
                    <div className="flex-1">
                      <p className="text-sm text-neutral-100">{scope.replace(/:/g, " ")}</p>
                      <p className="text-xs text-neutral-500">
                        {active ? "Active consent" : "Not granted"}
                      </p>
                    </div>
                    {active ? (
                      <button
                        onClick={() => revokeConsent.mutate(active.id)}
                        disabled={revokeConsent.isPending}
                        className="text-xs rounded-full border border-neutral-700 px-3 py-1 text-neutral-300 hover:border-rose-400 hover:text-rose-300 transition"
                      >
                        Revoke
                      </button>
                    ) : (
                      <span className="text-xs text-neutral-500">—</span>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Preferences */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={sectionClass}
          >
            <h2 className="font-serif text-xl text-neutral-100 mb-4">
              Preferences
            </h2>
            <div className="space-y-3">
              <label className="flex items-center justify-between">
                <span className="text-sm text-neutral-300">
                  Email notifications
                </span>
                <div className="w-10 h-6 rounded-full bg-neutral-700 relative cursor-not-allowed opacity-50">
                  <div className="w-4 h-4 rounded-full bg-neutral-400 absolute top-1 left-1" />
                </div>
              </label>
              <label className="flex items-center justify-between">
                <span className="text-sm text-neutral-300">
                  Weekly portfolio summary
                </span>
                <div className="w-10 h-6 rounded-full bg-neutral-700 relative cursor-not-allowed opacity-50">
                  <div className="w-4 h-4 rounded-full bg-neutral-400 absolute top-1 left-1" />
                </div>
              </label>
              <p className="text-xs text-neutral-600 mt-2">
                Preferences coming soon
              </p>
            </div>
          </motion.div>

          {/* About */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={sectionClass}
          >
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-5 h-5 text-emerald-400" />
              <h2 className="font-serif text-xl text-neutral-100">About</h2>
            </div>
            <div className="space-y-1 text-sm text-neutral-400">
              <p>
                <span className="text-neutral-300 font-medium">ClearMoney</span>{" "}
                — Portfolio Dashboard
              </p>
              <p>Version 0.1.0</p>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
