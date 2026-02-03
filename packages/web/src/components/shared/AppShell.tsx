"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
  showBackButton?: boolean;
  backHref?: string;
  backLabel?: string;
  className?: string;
}

/**
 * AppShell - Consistent wrapper for all ClearMoney calculator apps
 *
 * Provides:
 * - Consistent navigation header with back button
 * - ClearMoney branding
 * - Consistent footer
 * - Dark mode base styling
 */
export function AppShell({
  children,
  showBackButton = true,
  backHref = "/",
  backLabel = "Back to ClearMoney",
  className,
}: AppShellProps) {
  return (
    <div className={cn("min-h-screen bg-neutral-950 text-white", className)}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-neutral-950/80 backdrop-blur-lg border-b border-neutral-800">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          {showBackButton ? (
            <Link
              href={backHref}
              className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">{backLabel}</span>
            </Link>
          ) : (
            <div />
          )}

          <Link
            href="/"
            className="text-sm font-semibold text-white hover:text-neutral-300 transition-colors"
          >
            ClearMoney
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="border-t border-neutral-800 bg-neutral-900/50 mt-16">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
            {/* Branding */}
            <div className="text-center sm:text-left">
              <Link href="/" className="text-lg font-bold text-white">
                ClearMoney
              </Link>
              <p className="text-sm text-neutral-500 mt-1">
                Honest financial tools. No affiliate agenda.
              </p>
            </div>

            {/* Links */}
            <div className="flex flex-wrap justify-center gap-6 text-sm text-neutral-400">
              <Link href="/tools" className="hover:text-white transition-colors">
                All Tools
              </Link>
              <Link
                href="/methodology"
                className="hover:text-white transition-colors"
              >
                Methodology
              </Link>
              <Link
                href="/about"
                className="hover:text-white transition-colors"
              >
                About
              </Link>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="mt-8 pt-8 border-t border-neutral-800">
            <p className="text-xs text-neutral-600 text-center max-w-2xl mx-auto">
              ClearMoney provides educational calculators for informational
              purposes only. These tools are not financial advice. Consult with
              a qualified financial advisor before making financial decisions.
              Results are estimates and may not reflect actual outcomes.
            </p>
          </div>

          {/* Copyright */}
          <p className="text-xs text-neutral-700 text-center mt-6">
            © {new Date().getFullYear()} ClearMoney. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

/**
 * MethodologySection - Expandable section for explaining calculations
 */
interface MethodologySectionProps {
  title?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function MethodologySection({
  title = "How we calculate this",
  children,
  defaultOpen = false,
}: MethodologySectionProps) {
  return (
    <details
      className="rounded-2xl bg-neutral-900/50 border border-neutral-800 overflow-hidden group"
      open={defaultOpen}
    >
      <summary className="px-6 py-4 text-lg font-semibold text-white cursor-pointer hover:bg-neutral-800/50 transition-colors list-none flex items-center justify-between">
        {title}
        <span className="text-neutral-500 group-open:rotate-180 transition-transform">
          ▼
        </span>
      </summary>
      <div className="px-6 pb-6 text-neutral-400 space-y-4">{children}</div>
    </details>
  );
}

/**
 * VerdictCard - For displaying a recommendation or verdict
 */
interface VerdictCardProps {
  verdict: string;
  description: string;
  type?: "positive" | "negative" | "neutral";
  className?: string;
}

export function VerdictCard({
  verdict,
  description,
  type = "neutral",
  className,
}: VerdictCardProps) {
  const typeStyles = {
    positive: "bg-green-500/10 border-green-500/30 text-green-400",
    negative: "bg-red-500/10 border-red-500/30 text-red-400",
    neutral: "bg-neutral-800 border-neutral-700 text-white",
  };

  return (
    <div
      className={cn(
        "rounded-xl border p-6 text-center",
        typeStyles[type],
        className
      )}
    >
      <p className="text-xl font-bold mb-2">{verdict}</p>
      <p className="text-sm opacity-80">{description}</p>
    </div>
  );
}

export default AppShell;
