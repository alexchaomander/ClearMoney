"use client";

import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import { getInitials } from "@/lib/shared/formatters";
import { staggerContainer, staggerItemHorizontal } from "@/lib/shared/animations";
import type { CashAccount, DebtAccount } from "@clearmoney/strata-sdk";
import { AnimatedAmount } from "@/components/shared/AnimatedAmount";

function BusinessBadge() {
  return (
    <span className="shrink-0 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest border border-slate-200 dark:border-slate-700">
      Biz
    </span>
  );
}

interface CashDebtSectionProps {
  cashAccounts: CashAccount[];
  debtAccounts: DebtAccount[];
  onDeleteCashAccount?: (id: string) => void;
  onDeleteDebtAccount?: (id: string) => void;
}

export function CashDebtSection({ cashAccounts, debtAccounts, onDeleteCashAccount, onDeleteDebtAccount }: CashDebtSectionProps) {
  if (cashAccounts.length === 0 && debtAccounts.length === 0) return null;

  return (
    <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none">
      <h3 className="font-serif text-xl text-slate-900 dark:text-slate-100 mb-4">
        Cash &amp; Debt
      </h3>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="space-y-2"
      >
        {cashAccounts.map((account) => (
          <motion.div
            key={account.id}
            variants={staggerItemHorizontal}
            className="group flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 hover:border-emerald-500/30 transition-all shadow-sm dark:shadow-none"
          >
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-medium border border-slate-300/50 dark:border-slate-700">
              {getInitials(account.name)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <p className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {account.name}
                  </p>
                  {account.is_business && <BusinessBadge />}
                </div>
                <p className="font-black text-sm text-emerald-600 dark:text-emerald-400 shrink-0">
                  <AnimatedAmount value={account.balance} />
                </p>
              </div>
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  {account.institution_name}
                </p>
                {account.apy != null && account.apy > 0 && (
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/10">
                    {account.apy}% APY
                  </span>
                )}
              </div>
            </div>
            {onDeleteCashAccount && (
              <button
                onClick={() => onDeleteCashAccount(account.id)}
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all shrink-0"
                title="Delete account"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </motion.div>
        ))}

        {debtAccounts.map((account) => (
          <motion.div
            key={account.id}
            variants={staggerItemHorizontal}
            className="group flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 hover:border-rose-500/30 transition-all shadow-sm dark:shadow-none"
          >
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-medium border border-slate-300/50 dark:border-slate-700">
              {getInitials(account.name)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <p className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                    {account.name}
                  </p>
                  {account.is_business && <BusinessBadge />}
                </div>
                <p className="font-black text-sm text-rose-600 dark:text-rose-400 shrink-0">
                  <AnimatedAmount value={account.balance} prefix="-$" />
                </p>
              </div>
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  {account.institution_name}
                </p>
                <span className="text-xs font-black text-rose-600 dark:text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/10">
                  {account.interest_rate}% APR
                </span>
              </div>
            </div>
            {onDeleteDebtAccount && (
              <button
                onClick={() => onDeleteDebtAccount(account.id)}
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all shrink-0"
                title="Delete account"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
