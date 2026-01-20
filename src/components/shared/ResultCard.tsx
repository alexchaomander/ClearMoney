"use client";

import React from "react";
import { cn } from "@/lib/utils";

type ColorVariant =
  | "green"
  | "red"
  | "blue"
  | "purple"
  | "amber"
  | "emerald"
  | "neutral";

interface ResultItem {
  label: string;
  value: string;
  highlight?: boolean;
}

interface ResultCardProps {
  title: string;
  primaryValue: string;
  primaryLabel: string;
  items?: ResultItem[];
  variant?: ColorVariant;
  className?: string;
  footer?: React.ReactNode;
}

const variantStyles: Record<
  ColorVariant,
  { accent: string; badge: string; highlight: string }
> = {
  green: {
    accent: "text-green-400",
    badge: "bg-green-500/20 text-green-400",
    highlight: "text-green-400",
  },
  red: {
    accent: "text-red-400",
    badge: "bg-red-500/20 text-red-400",
    highlight: "text-red-400",
  },
  blue: {
    accent: "text-blue-400",
    badge: "bg-blue-500/20 text-blue-400",
    highlight: "text-blue-400",
  },
  purple: {
    accent: "text-purple-400",
    badge: "bg-purple-500/20 text-purple-400",
    highlight: "text-purple-400",
  },
  amber: {
    accent: "text-amber-400",
    badge: "bg-amber-500/20 text-amber-400",
    highlight: "text-amber-400",
  },
  emerald: {
    accent: "text-emerald-400",
    badge: "bg-emerald-500/20 text-emerald-400",
    highlight: "text-emerald-400",
  },
  neutral: {
    accent: "text-white",
    badge: "bg-neutral-700 text-neutral-300",
    highlight: "text-white",
  },
};

/**
 * ResultCard - Displays calculation results in a visually appealing card
 *
 * Features:
 * - Large primary value display
 * - Breakdown items with optional highlighting
 * - Color variants for different app personalities
 * - Dark mode optimized
 */
export function ResultCard({
  title,
  primaryValue,
  primaryLabel,
  items = [],
  variant = "neutral",
  className,
  footer,
}: ResultCardProps) {
  const styles = variantStyles[variant];

  return (
    <div
      className={cn(
        "rounded-2xl bg-neutral-900 border border-neutral-800 overflow-hidden",
        className
      )}
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-neutral-800">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>

      {/* Primary Value */}
      <div className="px-6 py-8 text-center">
        <p className={cn("text-4xl sm:text-5xl font-bold tracking-tight", styles.accent)}>
          {primaryValue}
        </p>
        <p className="text-sm text-neutral-400 mt-2">{primaryLabel}</p>
      </div>

      {/* Breakdown Items */}
      {items.length > 0 && (
        <div className="px-6 pb-6">
          <div className="bg-neutral-800/50 rounded-xl p-4 space-y-3">
            {items.map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-center text-sm"
              >
                <span className="text-neutral-400">{item.label}</span>
                <span
                  className={cn(
                    "font-medium",
                    item.highlight ? styles.highlight : "text-white"
                  )}
                >
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Optional Footer */}
      {footer && (
        <div className="px-6 pb-6">
          {footer}
        </div>
      )}
    </div>
  );
}

/**
 * ComparisonCard - For side-by-side comparisons (e.g., Roth vs Traditional)
 */
interface ComparisonCardProps {
  title: string;
  leftTitle: string;
  leftValue: string;
  rightTitle: string;
  rightValue: string;
  winner?: "left" | "right" | "tie";
  leftItems?: ResultItem[];
  rightItems?: ResultItem[];
  className?: string;
}

export function ComparisonCard({
  title,
  leftTitle,
  leftValue,
  rightTitle,
  rightValue,
  winner,
  leftItems = [],
  rightItems = [],
  className,
}: ComparisonCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-neutral-900 border border-neutral-800 overflow-hidden",
        className
      )}
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-neutral-800">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-2 divide-x divide-neutral-800">
        {/* Left Side */}
        <div className={cn(
          "p-6 text-center",
          winner === "left" && "bg-green-500/5"
        )}>
          <p className="text-sm font-medium text-neutral-400 mb-2">{leftTitle}</p>
          <p className={cn(
            "text-2xl sm:text-3xl font-bold",
            winner === "left" ? "text-green-400" : "text-white"
          )}>
            {leftValue}
          </p>
          {winner === "left" && (
            <span className="inline-block mt-2 px-2 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded">
              Winner
            </span>
          )}
          {leftItems.length > 0 && (
            <div className="mt-4 space-y-2 text-left">
              {leftItems.map((item, index) => (
                <div key={index} className="flex justify-between text-xs">
                  <span className="text-neutral-500">{item.label}</span>
                  <span className="text-neutral-300">{item.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side */}
        <div className={cn(
          "p-6 text-center",
          winner === "right" && "bg-green-500/5"
        )}>
          <p className="text-sm font-medium text-neutral-400 mb-2">{rightTitle}</p>
          <p className={cn(
            "text-2xl sm:text-3xl font-bold",
            winner === "right" ? "text-green-400" : "text-white"
          )}>
            {rightValue}
          </p>
          {winner === "right" && (
            <span className="inline-block mt-2 px-2 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded">
              Winner
            </span>
          )}
          {rightItems.length > 0 && (
            <div className="mt-4 space-y-2 text-left">
              {rightItems.map((item, index) => (
                <div key={index} className="flex justify-between text-xs">
                  <span className="text-neutral-500">{item.label}</span>
                  <span className="text-neutral-300">{item.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tie indicator */}
      {winner === "tie" && (
        <div className="px-6 py-3 bg-neutral-800/50 text-center">
          <span className="text-sm text-neutral-400">
            Both options are equivalent for your situation
          </span>
        </div>
      )}
    </div>
  );
}

export default ResultCard;
