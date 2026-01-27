"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Calculator, Clock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Header } from "@/components/layout/Header";
import { NewsletterSignup } from "@/components/shared/NewsletterSignup";
import { type Tool, type Category, getToolsByCategory, getLiveTools } from "@/lib/site-config";

interface CategoryPageProps {
  category: Category;
}

/**
 * CategoryPage - Reusable landing page for tool categories
 */
export function CategoryPage({ category }: CategoryPageProps) {
  const categoryTools = getToolsByCategory(category.id);
  const liveTools = categoryTools.filter((t) => t.status === "live");
  const comingSoonTools = categoryTools.filter((t) => t.status === "coming-soon");
  const totalLiveTools = getLiveTools().length;

  return (
    <div className="min-h-screen bg-neutral-950">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-16 pb-12 sm:pt-24 sm:pb-16">
        {/* Background */}
        <div className="absolute inset-0 bg-grid opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/0 via-neutral-950/50 to-neutral-950" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-neutral-500 mb-8">
            <Link
              href="/"
              className="hover:text-white transition-colors"
            >
              Home
            </Link>
            <span>/</span>
            <span className="text-neutral-400">{category.shortName}</span>
          </div>

          {/* Header */}
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">{category.icon}</span>
              <div className="px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20">
                <span className="text-xs font-medium text-brand-400">
                  {liveTools.length} Tools
                </span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              {category.name}
            </h1>

            <p className="text-lg sm:text-xl text-neutral-400 leading-relaxed">
              {category.description}
            </p>
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Live Tools */}
          {liveTools.length > 0 && (
            <div className="mb-16">
              <div className="flex items-center gap-2 mb-6">
                <Calculator className="w-5 h-5 text-brand-400" />
                <h2 className="text-lg font-semibold text-white">
                  Available Tools
                </h2>
              </div>

              <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {liveTools.map((tool, index) => (
                  <ToolCard key={tool.id} tool={tool} index={index} />
                ))}
              </div>
            </div>
          )}

          {/* Coming Soon Tools */}
          {comingSoonTools.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Clock className="w-5 h-5 text-neutral-500" />
                <h2 className="text-lg font-semibold text-neutral-400">
                  Coming Soon
                </h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {comingSoonTools.map((tool) => (
                  <div
                    key={tool.id}
                    className="p-5 rounded-xl border border-neutral-800/50 bg-neutral-900/30"
                  >
                    <h3 className="text-sm font-medium text-neutral-500 mb-1">
                      {tool.name}
                    </h3>
                    <p className="text-xs text-neutral-600">
                      {tool.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-12 sm:py-16 border-t border-neutral-800">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <NewsletterSignup
            title="Get updates on new tools"
            description={`Be the first to know when we launch new ${category.shortName.toLowerCase()} calculators and guides.`}
          />
        </div>
      </section>

      {/* Explore Other Categories */}
      <section className="py-12 sm:py-16 bg-neutral-900/50 border-t border-neutral-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-brand-400" />
            <h2 className="text-lg font-semibold text-white">
              Explore All Tools
            </h2>
          </div>
          <p className="text-neutral-500 mb-6">
            {totalLiveTools} calculators across all categories
          </p>
          <Link
            href="/#tools"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-medium transition-colors"
          >
            View all tools
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-neutral-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-neutral-500">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-brand-400" />
              <span className="font-medium text-white">ClearMoney</span>
              <span>- Financial literacy for everyone</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/about" className="hover:text-white transition-colors">
                About
              </Link>
              <Link href="/blog" className="hover:text-white transition-colors">
                Blog
              </Link>
              <span className="text-neutral-700">|</span>
              <span>No affiliate bias</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

interface ToolCardProps {
  tool: Tool;
  index: number;
}

function ToolCard({ tool, index }: ToolCardProps) {
  const accentColor = tool.primaryColor || "#0ea5e9";

  return (
    <Link
      href={tool.href}
      className={cn(
        "group relative block p-6 rounded-2xl border border-neutral-800 bg-neutral-900/50",
        "hover:border-neutral-700 hover:bg-neutral-900 transition-all duration-300",
        "animate-fade-up"
      )}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-6 right-6 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ backgroundColor: accentColor }}
      />

      {/* Featured badge */}
      {tool.featured && (
        <div className="absolute top-4 right-4">
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-500/10 border border-brand-500/20">
            <Sparkles className="w-3 h-3 text-brand-400" />
            <span className="text-xs font-medium text-brand-400">Featured</span>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="relative">
        {/* Tool name */}
        <h3 className="text-lg font-semibold text-white group-hover:text-brand-400 transition-colors mb-2 pr-16">
          {tool.name}
        </h3>

        {/* Description */}
        <p className="text-sm text-neutral-400 line-clamp-2 mb-4">
          {tool.description}
        </p>

        {/* Inspired by */}
        {tool.inspiredBy && tool.inspiredBy.length > 0 && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs text-neutral-600">Inspired by:</span>
            <div className="flex flex-wrap gap-1">
              {tool.inspiredBy.slice(0, 2).map((source) => (
                <span
                  key={source}
                  className="text-xs px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-500"
                >
                  {source.replace(" (counter)", "")}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="flex items-center gap-2 text-sm font-medium text-neutral-500 group-hover:text-white transition-colors">
          <span>Open calculator</span>
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

export default CategoryPage;
