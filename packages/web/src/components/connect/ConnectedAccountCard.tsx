"use client";

import { motion } from "framer-motion";
import { formatCurrency, formatTitleCase, getInitials } from "@/lib/shared/formatters";
import { staggerItem } from "@/lib/shared/animations";

interface ConnectedAccount {
  id: string;
  name: string;
  balance: number;
  account_type: string;
  is_tax_advantaged?: boolean;
}

interface ConnectedAccountCardProps {
  account: ConnectedAccount;
}

export function ConnectedAccountCard({ account }: ConnectedAccountCardProps) {
  const isNegative = account.balance < 0;
  const initials = getInitials(account.name);
  const accountTypeDisplay = formatTitleCase(account.account_type);

  return (
    <motion.div
      variants={staggerItem}
      className="p-4 rounded-xl bg-neutral-900 border border-neutral-800"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-neutral-800 text-neutral-200 font-serif text-lg font-medium">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate text-neutral-200">
            {account.name}
          </p>
          <p className="text-xs text-neutral-500">
            {accountTypeDisplay}
            {account.is_tax_advantaged && (
              <span className="ml-1 text-emerald-500">• Tax-advantaged</span>
            )}
          </p>
        </div>
        <div className="text-right">
          <p
            className={`font-serif text-lg font-medium ${
              isNegative ? "text-red-400" : "text-emerald-300"
            }`}
          >
            {formatCurrency(Math.abs(account.balance))}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
