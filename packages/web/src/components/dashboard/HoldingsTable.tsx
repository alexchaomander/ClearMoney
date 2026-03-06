"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { formatTitleCase } from "@/lib/shared/formatters";
import { AnimatedAmount } from "@/components/shared/AnimatedAmount";

interface Holding {
  id: string;
  ticker: string | null;
  name: string;
  security_type: string;
  quantity: number;
  market_value: number;
  cost_basis?: number | null;
  account_name: string;
  account_type: string;
}

interface HoldingsTableProps {
  holdings: Holding[];
  totalValue: number;
}

const PAGE_SIZE = 20;

type SortKey = "name" | "market_value" | "quantity" | "account_name";
type SortDirection = "asc" | "desc";

function SortHeader({
  label,
  sortKeyValue,
  sortKey,
  sortDirection,
  onSort,
  className = "",
}: {
  label: string;
  sortKeyValue: SortKey;
  sortKey: SortKey;
  sortDirection: SortDirection;
  onSort: (key: SortKey) => void;
  className?: string;
}) {
  return (
    <button
      onClick={() => onSort(sortKeyValue)}
      className={`flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors ${className}`}
    >
      {label}
      {sortKey === sortKeyValue ? (
        sortDirection === "asc" ? (
          <ChevronUp className="w-3 h-3" />
        ) : (
          <ChevronDown className="w-3 h-3" />
        )
      ) : (
        <ArrowUpDown className="w-3 h-3 opacity-50" />
      )}
    </button>
  );
}

export function HoldingsTable({ holdings, totalValue }: HoldingsTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("market_value");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [expandedHolding, setExpandedHolding] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("desc");
    }
    setCurrentPage(0);
  };

  const sortedHoldings = [...holdings].sort((a, b) => {
    let aValue: string | number;
    let bValue: string | number;

    switch (sortKey) {
      case "name":
        aValue = a.ticker || a.name;
        bValue = b.ticker || b.name;
        break;
      case "market_value":
        aValue = a.market_value;
        bValue = b.market_value;
        break;
      case "quantity":
        aValue = a.quantity;
        bValue = b.quantity;
        break;
      case "account_name":
        aValue = a.account_name;
        bValue = b.account_name;
        break;
      default:
        return 0;
    }

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    return sortDirection === "asc"
      ? (aValue as number) - (bValue as number)
      : (bValue as number) - (aValue as number);
  });

  const totalPages = Math.ceil(sortedHoldings.length / PAGE_SIZE);
  const paginatedHoldings = sortedHoldings.slice(
    currentPage * PAGE_SIZE,
    (currentPage + 1) * PAGE_SIZE
  );
  const showPagination = holdings.length > PAGE_SIZE;
  const rangeStart = currentPage * PAGE_SIZE + 1;
  const rangeEnd = Math.min((currentPage + 1) * PAGE_SIZE, sortedHoldings.length);

  function formatSecurityType(type: string): string {
    const typeMap: Record<string, string> = {
      stock: "Stock",
      etf: "ETF",
      mutual_fund: "Mutual Fund",
      bond: "Bond",
      crypto: "Crypto",
      cash: "Cash",
      option: "Option",
      other: "Other",
    };
    return typeMap[type] || type;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm dark:shadow-none"
    >
      <div className="p-6 border-b border-slate-200 dark:border-slate-800">
        <h3 className="font-serif text-xl text-slate-900 dark:text-white">Holdings</h3>
        <div className="flex items-center gap-1.5 text-sm text-slate-500 mt-1">
          <span>{holdings.length} positions</span>
          <span>•</span>
          <div className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300">
            <AnimatedAmount value={totalValue} />
            <span>total</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
      <div className="min-w-[640px]">
      {/* Table Header */}
      <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
        <div className="col-span-4">
          <SortHeader
            label="Name"
            sortKeyValue="name"
            sortKey={sortKey}
            sortDirection={sortDirection}
            onSort={handleSort}
          />
        </div>
        <div className="col-span-2 text-right">
          <SortHeader
            label="Quantity"
            sortKeyValue="quantity"
            sortKey={sortKey}
            sortDirection={sortDirection}
            onSort={handleSort}
            className="justify-end"
          />
        </div>
        <div className="col-span-2 text-right">
          <SortHeader
            label="Value"
            sortKeyValue="market_value"
            sortKey={sortKey}
            sortDirection={sortDirection}
            onSort={handleSort}
            className="justify-end"
          />
        </div>
        <div className="col-span-2 text-right">
          <span className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Allocation</span>
        </div>
        <div className="col-span-2">
          <SortHeader
            label="Account"
            sortKeyValue="account_name"
            sortKey={sortKey}
            sortDirection={sortDirection}
            onSort={handleSort}
          />
        </div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {paginatedHoldings.map((holding) => {
          const percentOfPortfolio = totalValue > 0
            ? (holding.market_value / totalValue) * 100
            : 0;
          const isExpanded = expandedHolding === holding.id;
          const gainLoss = holding.cost_basis
            ? holding.market_value - holding.cost_basis
            : null;
          const gainLossPercent = holding.cost_basis && holding.cost_basis > 0
            ? ((holding.market_value - holding.cost_basis) / holding.cost_basis) * 100
            : null;

          return (
            <div key={holding.id}>
              <button
                onClick={() => setExpandedHolding(isExpanded ? null : holding.id)}
                className="w-full grid grid-cols-12 gap-4 px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors text-left group"
              >
                {/* Name */}
                <div className="col-span-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-black uppercase tracking-tighter text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700">
                    {holding.ticker ? holding.ticker.slice(0, 3) : "—"}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-slate-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {holding.ticker || holding.name}
                    </p>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      {formatSecurityType(holding.security_type)}
                    </p>
                  </div>
                </div>

                {/* Quantity */}
                <div className="col-span-2 text-right self-center">
                  <p className="text-sm font-mono text-slate-600 dark:text-slate-400">
                    {holding.quantity.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>

                {/* Value */}
                <div className="col-span-2 text-right self-center">
                  <p className="font-bold text-sm text-slate-900 dark:text-white">
                    <AnimatedAmount value={holding.market_value} />
                  </p>
                </div>

                {/* % of Portfolio */}
                <div className="col-span-2 text-right self-center">
                  <div className="inline-flex flex-col items-end gap-1.5 w-full">
                    <span className="text-xs font-black text-slate-500">
                      {percentOfPortfolio.toFixed(1)}%
                    </span>
                    <div className="w-full h-1 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(percentOfPortfolio, 100)}%` }}
                        className="h-full rounded-full bg-emerald-500/60"
                      />
                    </div>
                  </div>
                </div>

                {/* Account */}
                <div className="col-span-2 self-center">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
                    {holding.account_name}
                  </p>
                </div>
              </button>

              {/* Expanded Details */}
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="px-6 pb-6 bg-slate-50 dark:bg-slate-950/30"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 pt-6 pl-4 sm:pl-12">
                    {holding.cost_basis !== null && holding.cost_basis !== undefined && (
                      <>
                        <div>
                          <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1.5">Cost Basis</p>
                          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                            <AnimatedAmount value={holding.cost_basis} />
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1.5">Unrealized Gain</p>
                          <div
                            className={`flex items-center gap-1.5 text-sm font-black ${
                              gainLoss && gainLoss >= 0
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-rose-600 dark:text-rose-400"
                            }`}
                          >
                            {gainLoss !== null && (
                              <>
                                <span>{gainLoss >= 0 ? "+" : ""}</span>
                                <AnimatedAmount value={Math.abs(gainLoss)} />
                                {gainLossPercent !== null && (
                                  <span className="ml-1 text-xs px-1.5 py-0.5 rounded bg-current/10">
                                    {gainLossPercent >= 0 ? "+" : ""}
                                    {gainLossPercent.toFixed(2)}%
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1.5">Account Strategy</p>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                        {formatTitleCase(holding.account_type)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          );
        })}
      </div>
      </div>
      </div>

      {showPagination && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-transparent">
          <span className="text-xs font-black uppercase tracking-widest text-slate-400">
            Page {currentPage + 1} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => p - 1)}
              disabled={currentPage === 0}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold uppercase tracking-widest rounded-lg bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
            >
              <ChevronLeft className="w-3 h-3" />
              Prev
            </button>
            <button
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={currentPage >= totalPages - 1}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold uppercase tracking-widest rounded-lg bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
            >
              Next
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
