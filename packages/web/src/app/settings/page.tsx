"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Trash2, RefreshCw, Wifi, Landmark, CreditCard, Info, Check, Shield, Lock, AlertCircle, TrendingUp } from "lucide-react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import {
  useConnections,
  useAccounts,
  usePopularInstitutions,
  useSyncConnection,
  useDeleteConnection,
  useCashAccountMutations,
  useDebtAccountMutations,
  useInvestmentAccountMutations,
  useConsentStatus,
  useConsents,
  useRevokeConsent,
  useFinancialMemory,
  useUpdateMemory,
  useActionPolicy,
  useUpsertActionPolicy,
} from "@/lib/strata/hooks";
import { formatTitleCase, getInitials } from "@/lib/shared/formatters";
import type { Institution, FinancialMemoryUpdate, ActionPolicyRequest } from "@clearmoney/strata-sdk";
import { ConsentGate } from "@/components/shared/ConsentGate";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

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

function PreferenceField({
  label,
  prefKey,
  preferences,
  onSave,
  suffix,
  step = 0.1,
}: {
  label: string;
  prefKey: string;
  preferences: Record<string, any>;
  onSave: (val: any) => void;
  suffix?: string;
  step?: number;
}) {
  const [localValue, setLocalValue] = useState(
    preferences[prefKey] != null ? String(preferences[prefKey]) : ""
  );
  const [dirty, setDirty] = useState(false);

  const handleBlur = () => {
    if (!dirty) return;
    onSave(localValue === "" ? null : Number(localValue));
    setDirty(false);
  };

  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-neutral-300">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={localValue}
          step={step}
          onChange={(e) => {
            setLocalValue(e.target.value);
            setDirty(true);
          }}
          onBlur={handleBlur}
          className="w-20 rounded-lg bg-neutral-800 border border-neutral-700 px-2 py-1 text-right text-sm text-neutral-100 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
        />
        {suffix && <span className="text-xs text-neutral-500 w-4">{suffix}</span>}
      </div>
    </div>
  );
}

function ActionPolicySettings() {
  const { data: policy, isLoading, isError } = useActionPolicy();
  const upsertPolicy = useUpsertActionPolicy();

  const defaultPolicy: ActionPolicyRequest = {
    allowed_actions: ["savings_transfer"],
    max_amount: 500,
    require_confirmation: true,
    require_mfa: false,
    status: "active",
  };

  const currentPolicy = policy || defaultPolicy;

  const toggleAction = (action: string) => {
    const nextActions = currentPolicy.allowed_actions.includes(action)
      ? currentPolicy.allowed_actions.filter((a: string) => a !== action)
      : [...currentPolicy.allowed_actions, action];
    upsertPolicy.mutate({ ...currentPolicy, allowed_actions: nextActions });
  };

  const updatePolicy = (patch: Partial<ActionPolicyRequest>) => {
    upsertPolicy.mutate({ ...currentPolicy, ...patch });
  };

  if (isLoading) return <div className="h-48 rounded-xl bg-neutral-800/50 animate-pulse" />;

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-neutral-200">Allowed Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { id: "savings_transfer", label: "Savings Transfers" },
            { id: "debt_payment", label: "Debt Payments" },
            { id: "rebalance_portfolio", label: "Portfolio Rebalancing" },
            { id: "tax_estimated_payment", label: "Estimated Tax Payments" },
          ].map((action) => (
            <button
              key={action.id}
              onClick={() => toggleAction(action.id)}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all text-left ${
                currentPolicy.allowed_actions.includes(action.id)
                  ? "bg-emerald-900/20 border-emerald-800/40 text-emerald-300"
                  : "bg-neutral-800/50 border-neutral-700 text-neutral-400 hover:border-neutral-600"
              }`}
            >
              <span className="text-xs font-medium">{action.label}</span>
              {currentPolicy.allowed_actions.includes(action.id) && <Check className="w-3 h-3" />}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4 pt-2">
        <h3 className="text-sm font-medium text-neutral-200">Guardrails</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm text-neutral-300">Auto-confirmation Threshold</Label>
              <p className="text-xs text-neutral-500">Require manual approval for actions above this amount.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-500">$</span>
              <input
                type="number"
                value={currentPolicy.max_amount ?? ""}
                onChange={(e) => updatePolicy({ max_amount: e.target.value ? Number(e.target.value) : null })}
                className="w-24 rounded-lg bg-neutral-800 border border-neutral-700 px-2 py-1 text-right text-sm text-neutral-100 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm text-neutral-300">Require MFA</Label>
              <p className="text-xs text-neutral-500">Biometric or secondary factor for all execution requests.</p>
            </div>
            <Switch
              checked={currentPolicy.require_mfa}
              onCheckedChange={(checked) => updatePolicy({ require_mfa: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm text-neutral-300">Manual Confirmation</Label>
              <p className="text-xs text-neutral-500">Always ask for confirmation before any money movement.</p>
            </div>
            <Switch
              checked={currentPolicy.require_confirmation}
              onCheckedChange={(checked) => updatePolicy({ require_confirmation: checked })}
            />
          </div>
        </div>
      </div>

      {isError && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-900/20 border border-rose-800/40 text-rose-400 text-xs">
          <AlertCircle className="w-4 h-4" />
          Error loading or updating policy. Please try again.
        </div>
      )}
    </div>
  );
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
  const investmentMutations = useInvestmentAccountMutations();
  const { data: consents } = useConsents();
  const revokeConsent = useRevokeConsent();

  const { hasConsent: hasMemoryConsent } = useConsentStatus(["memory:read", "memory:write"]);
  const { data: memory } = useFinancialMemory({ enabled: hasMemoryConsent });
  const updateMemory = useUpdateMemory();

  const preferences = memory?.preferences || {};

  const savePreference = (key: string, value: any) => {
    updateMemory.mutate({
      preferences: { ...preferences, [key]: value },
    });
  };

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
                    <div className="flex gap-1 shrink-0 items-center">
                      <button
                        onClick={() => cashMutations.update.mutate({ id: account.id, data: { is_business: !account.is_business } })}
                        className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md border transition-all ${
                          account.is_business
                            ? "bg-emerald-900/20 border-emerald-800/40 text-emerald-400"
                            : "bg-neutral-800 border-neutral-700 text-neutral-500 hover:text-neutral-400"
                        }`}
                      >
                        {account.is_business ? "Business" : "Personal"}
                      </button>
                      <button
                        onClick={() => cashMutations.remove.mutate(account.id)}
                        className="p-2 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-red-400/10 transition-all shrink-0"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
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
                    <div className="flex gap-1 shrink-0 items-center">
                      <button
                        onClick={() => debtMutations.update.mutate({ id: account.id, data: { is_business: !account.is_business } })}
                        className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md border transition-all ${
                          account.is_business
                            ? "bg-emerald-900/20 border-emerald-800/40 text-emerald-400"
                            : "bg-neutral-800 border-neutral-700 text-neutral-500 hover:text-neutral-400"
                        }`}
                      >
                        {account.is_business ? "Business" : "Personal"}
                      </button>
                      <button
                        onClick={() => debtMutations.remove.mutate(account.id)}
                        className="p-2 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-red-400/10 transition-all shrink-0"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {allAccounts?.investment_accounts.filter(a => !a.connection_id).map((account) => (
                  <div key={account.id} className={rowClass}>
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-sky-900/30 text-sky-400 text-sm font-medium">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-neutral-100 truncate">
                        {account.name}
                      </p>
                      <p className="text-xs text-neutral-500">
                        Investment &middot; {formatTitleCase(account.account_type)}
                      </p>
                    </div>
                    <div className="flex gap-1 shrink-0 items-center">
                      <button
                        onClick={() => investmentMutations.update.mutate({ id: account.id, data: { is_business: !account.is_business } })}
                        className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md border transition-all ${
                          account.is_business
                            ? "bg-emerald-900/20 border-emerald-800/40 text-emerald-400"
                            : "bg-neutral-800 border-neutral-700 text-neutral-500 hover:text-neutral-400"
                        }`}
                      >
                        {account.is_business ? "Business" : "Personal"}
                      </button>
                      <button
                        onClick={() => investmentMutations.remove.mutate(account.id)}
                        className="p-2 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-red-400/10 transition-all shrink-0"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {(!allAccounts?.cash_accounts.length && !allAccounts?.debt_accounts.length && !allAccounts?.investment_accounts.filter(a => !a.connection_id).length) && (
                  <p className="text-sm text-neutral-500">No manual accounts</p>
                )}
              </div>
            )}
          </motion.div>
        </div>
        </ConsentGate>

        <div className="space-y-6">
          {/* Security Policy */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className={sectionClass}
          >
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-emerald-400" />
              <h2 className="font-serif text-xl text-neutral-100">
                Action Policy & Guardrails
              </h2>
            </div>
            <p className="text-sm text-neutral-400 mb-6">
              Define the boundaries for the AI Advisor's execution capabilities.
            </p>
            <ActionPolicySettings />
          </motion.div>

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
              Financial Assumptions (Seven Pillars)
            </h2>
            <p className="text-sm text-neutral-400 mb-4">
              Customize the global constants used for projections and analysis.
            </p>
            <div className="divide-y divide-neutral-800">
              <PreferenceField
                label="Inflation Target"
                prefKey="inflation_target"
                preferences={preferences}
                onSave={(v) => savePreference("inflation_target", v)}
                suffix="%"
              />
              <PreferenceField
                label="Market Return Target (Conservative)"
                prefKey="market_return_conservative"
                preferences={preferences}
                onSave={(v) => savePreference("market_return_conservative", v)}
                suffix="%"
              />
              <PreferenceField
                label="Market Return Target (Moderate)"
                prefKey="market_return_moderate"
                preferences={preferences}
                onSave={(v) => savePreference("market_return_moderate", v)}
                suffix="%"
              />
              <PreferenceField
                label="Market Return Target (Aggressive)"
                prefKey="market_return_aggressive"
                preferences={preferences}
                onSave={(v) => savePreference("market_return_aggressive", v)}
                suffix="%"
              />
              <PreferenceField
                label="Mortgage Rate Baseline"
                prefKey="mortgage_rate_baseline"
                preferences={preferences}
                onSave={(v) => savePreference("mortgage_rate_baseline", v)}
                suffix="%"
              />
              <PreferenceField
                label="Home Price Appreciation"
                prefKey="home_appreciation"
                preferences={preferences}
                onSave={(v) => savePreference("home_appreciation", v)}
                suffix="%"
              />
            </div>
          </motion.div>

          {/* Account Settings */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className={sectionClass}
          >
            <h2 className="font-serif text-xl text-neutral-100 mb-4">
              Notifications
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
