"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Calculator, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { tools, getCategoryById, type Tool } from "@/lib/site-config";

interface FeaturedToolsProps {
  /** Optional title override */
  title?: string;
  /** Optional description override */
  description?: string;
  /** Maximum number of tools to show */
  limit?: number;
  /** Additional className */
  className?: string;
}

/**
 * FeaturedTools - Showcase flagship calculators on homepage
 *
 * Features:
 * - Uses tool's primaryColor for visual differentiation
 * - Staggered animation on load
 * - Hover effects with color accent
 */
export function FeaturedTools({
  title = "Decision Tools",
  description = "Plug in your numbers. Get an answer. No affiliate bias.",
  limit = 6,
  className,
}: FeaturedToolsProps) {
  // Get featured tools that are live
  const featuredPriority = ["strategy-match-finder"];
  const featuredTools = tools
    .map((tool, index) => ({ tool, index }))
    .filter(({ tool }) => tool.status === "live" && tool.featured)
    .sort((a, b) => {
      const aPriority = featuredPriority.indexOf(a.tool.id);
      const bPriority = featuredPriority.indexOf(b.tool.id);
      const aRank = aPriority === -1 ? Number.MAX_SAFE_INTEGER : aPriority;
      const bRank = bPriority === -1 ? Number.MAX_SAFE_INTEGER : bPriority;
      if (aRank !== bRank) {
        return aRank - bRank;
      }
      return a.index - b.index;
    })
    .map(({ tool }) => tool)
    .slice(0, limit);

  // If not enough featured tools, fill with other live tools
  const allLiveTools = tools.filter((t) => t.status === "live");
  const displayTools =
    featuredTools.length >= limit
      ? featuredTools
      : [
          ...featuredTools,
          ...allLiveTools
            .filter((t) => !featuredTools.find((f) => f.id === t.id))
            .slice(0, limit - featuredTools.length),
        ];

  if (displayTools.length === 0) {
    return null;
  }

  return (
    <section className={cn("py-16 sm:py-24", className)}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 mb-4">
            <Calculator className="w-4 h-4 text-brand-400" />
            <span className="text-xs font-medium text-brand-400 uppercase tracking-wider">
              {allLiveTools.length} Tools Available
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            {title}
          </h2>
          <p className="text-lg text-neutral-400 max-w-2xl mx-auto">
            {description}
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {displayTools.map((tool, index) => (
            <ToolCard key={tool.id} tool={tool} index={index} />
          ))}
        </div>

        {/* View All Link */}
        {allLiveTools.length > limit && (
          <div className="mt-12 text-center">
            <Link
              href="/#tools"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-medium transition-colors"
            >
              View all {allLiveTools.length} tools
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

interface ToolCardProps {
  tool: Tool;
  index: number;
}

function ToolCard({ tool, index }: ToolCardProps) {
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
      style={{ animationDelay: `${index * 75}ms` }}
    >
      {/* Accent glow on hover */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${accentColor}08, transparent 40%)`,
        }}
      />

      {/* Top accent line */}
      <div
        className="absolute top-0 left-6 right-6 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ backgroundColor: accentColor }}
      />

      {/* Content */}
      <div className="relative">
        {/* Category badge */}
        {category && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">{category.icon}</span>
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
              {category.shortName}
            </span>
          </div>
        )}

        {/* Tool name */}
        <h3 className="text-lg font-semibold text-white group-hover:text-brand-400 transition-colors mb-2">
          {tool.name}
        </h3>

        {/* Description */}
        <p className="text-sm text-neutral-400 line-clamp-2 mb-4">
          {tool.description}
        </p>

        {/* CTA */}
        <div className="flex items-center gap-2 text-sm font-medium text-neutral-500 group-hover:text-white transition-colors">
          <span>Calculate now</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>

      {/* Color indicator */}
      <div
        className="absolute bottom-6 right-6 w-2 h-2 rounded-full opacity-50 group-hover:opacity-100 transition-opacity"
        style={{ backgroundColor: accentColor }}
      />
    </Link>
  );
}

/**
 * FeaturedToolsCompact - Smaller version for sidebars
 */
export function FeaturedToolsCompact({
  limit = 4,
  className,
}: {
  limit?: number;
  className?: string;
}) {
  const featuredTools = tools
    .filter((tool) => tool.status === "live" && tool.featured)
    .slice(0, limit);

  if (featuredTools.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="w-4 h-4 text-brand-400" />
        <h3 className="text-sm font-semibold text-white">Popular Tools</h3>
      </div>
      {featuredTools.map((tool) => {
        const accentColor = tool.primaryColor || "#0ea5e9";
        return (
          <Link
            key={tool.id}
            href={tool.href}
            className="group flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-neutral-800/50 transition-colors"
          >
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: accentColor }}
            />
            <span className="text-sm text-neutral-400 group-hover:text-white transition-colors truncate">
              {tool.name}
            </span>
          </Link>
        );
      })}
    </div>
  );
}

export default FeaturedTools;
