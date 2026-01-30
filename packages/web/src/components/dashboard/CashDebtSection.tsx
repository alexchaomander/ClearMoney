"use client";

import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import { formatCurrency, getInitials } from "@/lib/shared/formatters";
import { staggerContainer, staggerItemHorizontal } from "@/lib/shared/animations";
import type { CashAccount, DebtAccount } from "@clearmoney/strata-sdk";

interface CashDebtSectionProps {
  cashAccounts: CashAccount[];
  debtAccounts: DebtAccount[];
  onDeleteCashAccount?: (id: string) => void;
  onDeleteDebtAccount?: (id: string) => void;
}

export function CashDebtSection({ cashAccounts, debtAccounts, onDeleteCashAccount, onDeleteDebtAccount }: CashDebtSectionProps) {
  if (cashAccounts.length === 0 && debtAccounts.length === 0) return null;

  return (
    <div className="p-6 rounded-xl bg-neutral-900 border border-neutral-800">
      <h3 className="font-serif text-xl text-neutral-100 mb-4">
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
            className="group flex items-center gap-3 p-3 rounded-xl bg-neutral-900 border border-neutral-800"
          >
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-neutral-800 text-neutral-300 text-sm font-medium">
              {getInitials(account.name)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium text-sm text-neutral-100 truncate">
                  {account.name}
                </p>
                <p className="font-medium text-sm text-emerald-300 shrink-0">
                  {formatCurrency(account.balance)}
                </p>
              </div>
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-neutral-500">
                  {account.institution_name}
                </p>
                {account.apy != null && account.apy > 0 && (
                  <span className="text-xs text-emerald-400/70 bg-emerald-400/10 px-1.5 py-0.5 rounded">
                    {account.apy}% APY
                  </span>
                )}
              </div>
            </div>
            {onDeleteCashAccount && (
              <button
                onClick={() => onDeleteCashAccount(account.id)}
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-red-400/10 transition-all shrink-0"
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
            className="group flex items-center gap-3 p-3 rounded-xl bg-neutral-900 border border-neutral-800"
          >
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-neutral-800 text-neutral-300 text-sm font-medium">
              {getInitials(account.name)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium text-sm text-neutral-100 truncate">
                  {account.name}
                </p>
                <p className="font-medium text-sm text-red-400 shrink-0">
                  -{formatCurrency(account.balance)}
                </p>
              </div>
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-neutral-500">
                  {account.institution_name}
                </p>
                <span className="text-xs text-red-400/70 bg-red-400/10 px-1.5 py-0.5 rounded">
                  {account.interest_rate}% APR
                </span>
              </div>
            </div>
            {onDeleteDebtAccount && (
              <button
                onClick={() => onDeleteDebtAccount(account.id)}
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-red-400/10 transition-all shrink-0"
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
