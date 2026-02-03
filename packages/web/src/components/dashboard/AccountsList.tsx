"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronRight, RefreshCw, AlertCircle } from "lucide-react";
import { formatCurrency, formatTitleCase, getInitials } from "@/lib/shared/formatters";
import { staggerContainer, staggerItemHorizontal } from "@/lib/shared/animations";

interface Account {
  id: string;
  name: string;
  balance: number;
  account_type: string;
  is_tax_advantaged: boolean;
  last_synced_at?: string;
  status?: "active" | "error" | "syncing";
}

interface AccountsListProps {
  accounts: Account[];
}

export function AccountsList({ accounts }: AccountsListProps) {
  // Group accounts by tax status
  const groupedAccounts = accounts.reduce(
    (acc, account) => {
      const group = account.is_tax_advantaged ? "tax_advantaged" : "taxable";
      if (!acc[group]) acc[group] = [];
      acc[group].push(account);
      return acc;
    },
    {} as Record<string, Account[]>
  );

  const renderAccountGroup = (title: string, accounts: Account[]) => (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-neutral-400 px-1">{title}</h3>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="space-y-2"
      >
        {accounts.map((account) => (
          <motion.div
            key={account.id}
            variants={staggerItemHorizontal}
          >
            <Link
              href={`/dashboard/accounts/${account.id}`}
              className="group flex items-center gap-3 p-3 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-all duration-200"
            >
              {/* Logo/Initials */}
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-neutral-800 text-neutral-300 text-sm font-medium">
                {getInitials(account.name)}
              </div>

              {/* Account Info + Balance stacked */}
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
                    {formatTitleCase(account.account_type)}
                    {account.status === "error" && (
                      <AlertCircle className="inline w-3 h-3 text-red-400 ml-1" />
                    )}
                  </p>
                  {account.last_synced_at && (
                    <p className="text-xs text-neutral-500 shrink-0">
                      {new Date(account.last_synced_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              {/* Arrow */}
              {account.status === "syncing" ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <RefreshCw className="w-4 h-4 text-neutral-500" />
                </motion.div>
              ) : (
                <ChevronRight className="w-4 h-4 shrink-0 text-neutral-500 group-hover:text-neutral-300 group-hover:translate-x-0.5 transition-all duration-200" />
              )}
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );

  return (
    <div className="space-y-6">
      {groupedAccounts.tax_advantaged && groupedAccounts.tax_advantaged.length > 0 && (
        renderAccountGroup("Tax-Advantaged Accounts", groupedAccounts.tax_advantaged)
      )}
      {groupedAccounts.taxable && groupedAccounts.taxable.length > 0 && (
        renderAccountGroup("Taxable Accounts", groupedAccounts.taxable)
      )}
    </div>
  );
}
