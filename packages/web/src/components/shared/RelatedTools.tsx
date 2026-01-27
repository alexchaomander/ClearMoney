"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { tools, getToolById, getCategoryById, type Tool } from "@/lib/site-config";

interface RelatedToolsProps {
  /** Array of tool IDs to display */
  toolIds: string[];
  /** Current tool ID (to exclude from related) */
  currentToolId?: string;
  /** Optional title override */
  title?: string;
  /** Optional description override */
  description?: string;
  /** Additional className */
  className?: string;
}

/**
 * RelatedTools - Shows related calculators at the bottom of tool pages
 *
 * Usage:
 * <RelatedTools
 *   toolIds={["mega-backdoor-roth", "backdoor-roth", "2026-limits"]}
 *   currentToolId="roth-vs-traditional"
 * />
 */
export function RelatedTools({
  toolIds,
  currentToolId,
  title = "Related Calculators",
  description = "Continue your research with these tools",
  className,
}: RelatedToolsProps) {
  // Filter out current tool and get tool details
  const relatedTools = toolIds
    .filter((id) => id !== currentToolId)
    .map((id) => getToolById(id))
    .filter((tool): tool is Tool => tool !== undefined && tool.status === "live")
    .slice(0, 4);

  if (relatedTools.length === 0) {
    return null;
  }

  return (
    <section className={cn("py-12", className)}>
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-brand-400" />
            <h2 className="text-lg font-semibold text-white">{title}</h2>
          </div>
          <p className="text-sm text-neutral-500">{description}</p>
        </div>

        {/* Tools Grid */}
        <div className="grid gap-3 sm:grid-cols-2">
          {relatedTools.map((tool, index) => {
            const category = getCategoryById(tool.categoryId);
            const accentColor = tool.primaryColor || "#0ea5e9";

            return (
              <Link
                key={tool.id}
                href={tool.href}
                className={cn(
                  "group relative block p-4 rounded-xl border border-neutral-800 bg-neutral-900/50",
                  "hover:border-neutral-700 hover:bg-neutral-900 transition-all duration-200",
                  "animate-fade-up"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Accent line */}
                <div
                  className="absolute top-0 left-4 right-4 h-px opacity-50 group-hover:opacity-100 transition-opacity"
                  style={{ backgroundColor: accentColor }}
                />

                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Category */}
                    {category && (
                      <div className="flex items-center gap-1.5 mb-2">
                        <span className="text-sm">{category.icon}</span>
                        <span className="text-xs text-neutral-500 uppercase tracking-wider">
                          {category.shortName}
                        </span>
                      </div>
                    )}

                    {/* Tool Name */}
                    <h3 className="text-sm font-semibold text-white group-hover:text-brand-400 transition-colors truncate">
                      {tool.name}
                    </h3>

                    {/* Description */}
                    <p className="mt-1 text-xs text-neutral-500 line-clamp-2">
                      {tool.description}
                    </p>
                  </div>

                  {/* Arrow */}
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center group-hover:bg-brand-500 transition-colors">
                    <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* View All Link */}
        <div className="mt-6 text-center">
          <Link
            href="/#tools"
            className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors"
          >
            View all {tools.filter((t) => t.status === "live").length} tools
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/**
 * Utility function to get related tools based on category and common patterns
 * Can be used to auto-generate related tools for a given tool
 */
export function getRelatedToolIds(currentToolId: string, limit: number = 4): string[] {
  const currentTool = getToolById(currentToolId);
  if (!currentTool) return [];

  const liveTools = tools.filter(
    (t) => t.status === "live" && t.id !== currentToolId
  );

  // First, get tools from the same category
  const sameCategoryTools = liveTools.filter(
    (t) => t.categoryId === currentTool.categoryId
  );

  // Then get featured tools from other categories
  const otherFeaturedTools = liveTools.filter(
    (t) => t.categoryId !== currentTool.categoryId && t.featured
  );

  // Combine and limit
  const related = [...sameCategoryTools, ...otherFeaturedTools].slice(0, limit);

  return related.map((t) => t.id);
}

export default RelatedTools;
