"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Calculator, Search, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  categories,
  getCategoryById,
  getComingSoonTools,
  getLiveTools,
  type Category,
  type Tool,
} from "@/lib/site-config";
import { Header } from "@/components/layout/Header";
import { Input } from "@/components/ui/input";

const categoryList: Category[] = Array.from(
  new Map(categories.map((category) => [category.id, category])).values()
);

export default function ToolsIndexPage() {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const liveTools = useMemo(() => getLiveTools(), []);
  const comingSoonTools = useMemo(() => getComingSoonTools(), []);

  const filteredLiveTools = useMemo(() => {
    return liveTools.filter((tool) => matchesTool(tool, query, selectedCategory));
  }, [liveTools, query, selectedCategory]);

  const filteredComingSoonTools = useMemo(() => {
    return comingSoonTools.filter((tool) => matchesTool(tool, query, selectedCategory));
  }, [comingSoonTools, query, selectedCategory]);

  const totalLive = liveTools.length;
  const totalTools = totalLive + comingSoonTools.length;

  return (
    <div className="min-h-screen bg-neutral-950">
      <Header />

      {/* Hero */}
      <section className="relative pt-16 pb-10 sm:pt-24 sm:pb-12">
        <div className="absolute inset-0 bg-grid opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/0 via-neutral-950/70 to-neutral-950" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20">
              <Calculator className="w-4 h-4 text-brand-400" />
              <span className="text-xs font-medium text-brand-400 uppercase tracking-wider">
                {totalLive} Live Tools
              </span>
            </div>
            <div className="text-xs text-neutral-500">
              {totalTools} total calculators including upcoming releases
            </div>
          </div>

          <div className="max-w-3xl">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              All tools, zero fluff.
            </h1>
            <p className="text-lg sm:text-xl text-neutral-400 leading-relaxed">
              Every calculator is built to show the math, the tradeoffs, and the conclusion you can verify.
            </p>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search tools by name or outcome"
                className="pl-10 bg-neutral-900/60 border-neutral-800 text-white placeholder:text-neutral-600"
              />
            </div>
            <Link
              href="/tools"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-sm font-medium transition-colors"
            >
              Featured tools
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Category Filters */}
      <section className="pb-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap gap-2">
            <FilterPill
              label="All"
              isActive={selectedCategory === "all"}
              onClick={() => setSelectedCategory("all")}
              count={totalLive}
            />
            {categoryList.map((category) => {
              const count = liveTools.filter((tool) => tool.categoryId === category.id).length;
              return (
                <FilterPill
                  key={category.id}
                  label={category.shortName}
                  isActive={selectedCategory === category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  count={count}
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-400" />
              <h2 className="text-lg font-semibold text-white">Live tools</h2>
            </div>
            <span className="text-sm text-neutral-500">
              {filteredLiveTools.length} results
            </span>
          </div>

          {filteredLiveTools.length === 0 ? (
            <EmptyState query={query} />
          ) : (
            <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredLiveTools.map((tool, index) => (
                <ToolCard key={tool.id} tool={tool} index={index} />
              ))}
            </div>
          )}
        </div>
      </section>

      {filteredComingSoonTools.length > 0 && (
        <section className="pb-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-xs uppercase tracking-widest text-neutral-500">Coming soon</span>
              <span className="text-xs text-neutral-700">{filteredComingSoonTools.length}</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredComingSoonTools.map((tool) => (
                <div
                  key={tool.id}
                  className="p-5 rounded-2xl border border-neutral-800/60 bg-neutral-900/30"
                >
                  <h3 className="text-sm font-semibold text-neutral-300 mb-2">
                    {tool.name}
                  </h3>
                  <p className="text-xs text-neutral-600">{tool.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <footer className="py-10 border-t border-neutral-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between text-sm text-neutral-500">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-brand-400" />
            <span className="font-medium text-white">ClearMoney</span>
            <span>- Tools first, content second.</span>
          </div>
          <Link href="/tools" className="hover:text-white transition-colors">
            Back to featured tools
          </Link>
        </div>
      </footer>
    </div>
  );
}

function matchesTool(tool: Tool, query: string, categoryId: string) {
  const normalizedQuery = query.trim().toLowerCase();
  const matchesQuery =
    normalizedQuery.length === 0 ||
    tool.name.toLowerCase().includes(normalizedQuery) ||
    tool.description.toLowerCase().includes(normalizedQuery);
  const matchesCategory = categoryId === "all" || tool.categoryId === categoryId;
  return matchesQuery && matchesCategory;
}

function FilterPill({
  label,
  isActive,
  onClick,
  count,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
  count: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-colors",
        isActive
          ? "bg-white text-black"
          : "bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800"
      )}
    >
      <span>{label}</span>
      <span className={cn("text-xs", isActive ? "text-neutral-600" : "text-neutral-600")}>
        {count}
      </span>
    </button>
  );
}

function ToolCard({ tool, index }: { tool: Tool; index: number }) {
  const category = getCategoryById(tool.categoryId);
  const accentColor = tool.primaryColor || "#0ea5e9";

  return (
    <Link
      href={tool.href}
      className={cn(
        "group relative block p-6 rounded-2xl border border-neutral-800 bg-neutral-900/50",
        "hover:border-neutral-700 hover:bg-neutral-900 transition-all duration-300",
        "animate-fade-up"
      )}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${accentColor}10, transparent 40%)`,
        }}
      />

      <div
        className="absolute top-0 left-6 right-6 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ backgroundColor: accentColor }}
      />

      <div className="relative">
        {category && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">{category.icon}</span>
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
              {category.shortName}
            </span>
          </div>
        )}

        <h3 className="text-lg font-semibold text-white group-hover:text-brand-400 transition-colors mb-2">
          {tool.name}
        </h3>
        <p className="text-sm text-neutral-400 line-clamp-2 mb-4">
          {tool.description}
        </p>
        <div className="flex items-center gap-2 text-sm font-medium text-neutral-500 group-hover:text-white transition-colors">
          <span>Open calculator</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>

      <div
        className="absolute bottom-6 right-6 w-2 h-2 rounded-full opacity-50 group-hover:opacity-100 transition-opacity"
        style={{ backgroundColor: accentColor }}
      />
    </Link>
  );
}

function EmptyState({ query }: { query: string }) {
  return (
    <div className="p-8 rounded-2xl border border-neutral-800 bg-neutral-900/40 text-center">
      <p className="text-white font-medium mb-2">No tools match that search.</p>
      <p className="text-sm text-neutral-500">
        {query.trim().length > 0
          ? `Try a broader term or clear the search to see all tools.`
          : "Try switching categories to find more calculators."}
      </p>
    </div>
  );
}
