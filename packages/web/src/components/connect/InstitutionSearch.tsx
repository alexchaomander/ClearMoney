"use client";

import {
  Search,
  Building2,
  CreditCard,
  TrendingUp,
  PiggyBank,
  Wallet,
  type LucideIcon,
} from "lucide-react";

// Category configuration
const categories: {
  id: string;
  name: string;
  icon: LucideIcon;
  description: string;
}[] = [
  { id: "banking", name: "Banking", icon: Building2, description: "Checking & Savings" },
  { id: "credit", name: "Credit", icon: CreditCard, description: "Credit Cards" },
  { id: "investments", name: "Investments", icon: TrendingUp, description: "Brokerage Accounts" },
  { id: "retirement", name: "Retirement", icon: PiggyBank, description: "401(k) & IRA" },
  { id: "liabilities", name: "Liabilities", icon: Wallet, description: "Loans & Mortgages" },
];

interface InstitutionSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
}

export function InstitutionSearch({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
}: InstitutionSearchProps) {
  return (
    <div className="space-y-4">
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search for your bank or brokerage..."
          className="w-full pl-12 pr-4 py-4 rounded-xl text-base outline-none transition-all duration-300 bg-neutral-900 border border-neutral-800 text-neutral-100 focus:border-emerald-500 placeholder:text-neutral-500"
        />
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onCategoryChange(null)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${
            !selectedCategory
              ? "bg-emerald-800 text-emerald-100 border-emerald-700"
              : "bg-transparent text-neutral-400 border-neutral-800 hover:border-neutral-700"
          }`}
        >
          All
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 border ${
              selectedCategory === category.id
                ? "bg-emerald-800 text-emerald-100 border-emerald-700"
                : "bg-transparent text-neutral-400 border-neutral-800 hover:border-neutral-700"
            }`}
          >
            <category.icon className="w-4 h-4" />
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
}
