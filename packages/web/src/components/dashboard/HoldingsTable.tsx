"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { formatCurrency, formatTitleCase } from "@/lib/shared/formatters";

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
      className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden"
    >
      <div className="p-4 border-b border-slate-200 dark:border-slate-800">
        <h3 className="font-serif text-xl text-slate-900 dark:text-white">Holdings</h3>
        <p className="text-sm text-slate-500">
          {holdings.length} positions • {formatCurrency(totalValue)} total
        </p>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-slate-100 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
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
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">% of Portfolio</span>
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
      <div className="divide-y divide-slate-200 dark:divide-slate-800">
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
                className="w-full grid grid-cols-12 gap-4 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors text-left"
              >
                {/* Name */}
                <div className="col-span-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-medium text-slate-700 dark:text-slate-300">
                    {holding.ticker ? holding.ticker.slice(0, 3) : "—"}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900 dark:text-white truncate">
                      {holding.ticker || holding.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatSecurityType(holding.security_type)}
                    </p>
                  </div>
                </div>

                {/* Quantity */}
                <div className="col-span-2 text-right self-center">
                  <p className="text-sm text-slate-800 dark:text-slate-200">
                    {holding.quantity.toLocaleString(undefined, {
                      maximumFractionDigits: 4,
                    })}
                  </p>
                </div>

                {/* Value */}
                <div className="col-span-2 text-right self-center">
                  <p className="font-medium text-slate-900 dark:text-white">
                    {formatCurrency(holding.market_value)}
                  </p>
                </div>

                {/* % of Portfolio */}
                <div className="col-span-2 text-right self-center">
                  <div className="inline-flex items-center gap-2">
                    <div className="w-16 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-emerald-500"
                        style={{ width: `${Math.min(percentOfPortfolio, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm text-slate-500 dark:text-slate-400 w-12">
                      {percentOfPortfolio.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Account */}
                <div className="col-span-2 self-center">
                  <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
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
                  className="px-4 pb-4 bg-slate-50 dark:bg-slate-800/20"
                >
                  <div className="grid grid-cols-3 gap-4 pt-4 pl-11">
                    {holding.cost_basis !== null && holding.cost_basis !== undefined && (
                      <>
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Cost Basis</p>
                          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                            {formatCurrency(holding.cost_basis)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Gain/Loss</p>
                          <p
                            className={`text-sm font-medium ${
                              gainLoss && gainLoss >= 0
                                ? "text-emerald-400"
                                : "text-red-400"
                            }`}
                          >
                            {gainLoss !== null && (
                              <>
                                {gainLoss >= 0 ? "+" : ""}
                                {formatCurrency(gainLoss)}
                                {gainLossPercent !== null && (
                                  <span className="ml-1 text-xs">
                                    ({gainLossPercent >= 0 ? "+" : ""}
                                    {gainLossPercent.toFixed(2)}%)
                                  </span>
                                )}
                              </>
                            )}
                          </p>
                        </div>
                      </>
                    )}
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Account Type</p>
                      <p className="text-sm text-slate-800 dark:text-slate-200">
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

      {showPagination && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-800">
          <span className="text-sm text-slate-500 dark:text-slate-400">
            Showing {rangeStart}-{rangeEnd} of {sortedHoldings.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => p - 1)}
              disabled={currentPage === 0}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={currentPage >= totalPages - 1}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
