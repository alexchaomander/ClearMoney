"use client";

import React, { useState } from "react";
import {
  ChevronDown,
  BookOpen,
  Calculator,
  ExternalLink,
  FileText,
  Info,
  Scale,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Formula {
  /** Name of the formula */
  name: string;
  /** The formula expression (can use LaTeX-style notation) */
  formula: string;
  /** Explanation of what the formula calculates */
  description?: string;
}

interface Source {
  /** Name of the source */
  name: string;
  /** URL to the source */
  url?: string;
  /** Description or context */
  description?: string;
}

interface Assumption {
  /** The assumption made */
  assumption: string;
  /** Why this assumption was made */
  rationale?: string;
}

interface MethodologySectionProps {
  /** Title for the methodology section */
  title?: string;
  /** Brief overview of the calculation approach */
  overview?: string;
  /** List of formulas used */
  formulas?: Formula[];
  /** Data sources and references */
  sources?: Source[];
  /** Assumptions made in calculations */
  assumptions?: Assumption[];
  /** Additional notes or caveats */
  notes?: string[];
  /** Whether to start expanded */
  defaultExpanded?: boolean;
  /** Additional className */
  className?: string;
}

/**
 * MethodologySection - Collapsible section showing calculation transparency
 *
 * Shows formulas, sources, and assumptions in an expandable format.
 * Key differentiator from TPG - we show our math.
 */
export function MethodologyDetails({
  title = "How We Calculate This",
  overview,
  formulas = [],
  sources = [],
  assumptions = [],
  notes = [],
  defaultExpanded = false,
  className,
}: MethodologySectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const hasContent =
    overview ||
    formulas.length > 0 ||
    sources.length > 0 ||
    assumptions.length > 0 ||
    notes.length > 0;

  if (!hasContent) {
    return null;
  }

  return (
    <section
      className={cn(
        "rounded-xl border border-neutral-800 bg-neutral-900/50 overflow-hidden",
        className
      )}
    >
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-neutral-800/30 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-brand-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">{title}</h3>
            <p className="text-xs text-neutral-500">
              Transparent methodology - see the math
            </p>
          </div>
        </div>
        <ChevronDown
          className={cn(
            "w-5 h-5 text-neutral-400 transition-transform",
            isExpanded && "rotate-180"
          )}
        />
      </button>

      {/* Expandable content */}
      <div
        className={cn(
          "grid transition-all duration-300",
          isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <div className="p-4 sm:p-5 pt-0 space-y-6">
            {/* Divider */}
            <div className="h-px bg-neutral-800" />

            {/* Overview */}
            {overview && (
              <div>
                <p className="text-sm text-neutral-300 leading-relaxed">
                  {overview}
                </p>
              </div>
            )}

            {/* Formulas */}
            {formulas.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Calculator className="w-4 h-4 text-brand-400" />
                  <h4 className="text-sm font-medium text-white">Formulas</h4>
                </div>
                <div className="space-y-3">
                  {formulas.map((formula, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-lg bg-neutral-800/50 border border-neutral-700/50"
                    >
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <span className="text-xs font-medium text-neutral-400">
                          {formula.name}
                        </span>
                      </div>
                      <code className="block text-sm text-brand-300 font-mono bg-neutral-900 px-3 py-2 rounded">
                        {formula.formula}
                      </code>
                      {formula.description && (
                        <p className="mt-2 text-xs text-neutral-500">
                          {formula.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Assumptions */}
            {assumptions.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Scale className="w-4 h-4 text-warning-400" />
                  <h4 className="text-sm font-medium text-white">Assumptions</h4>
                </div>
                <ul className="space-y-2">
                  {assumptions.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-warning-400 mt-2 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-neutral-300">
                          {item.assumption}
                        </p>
                        {item.rationale && (
                          <p className="text-xs text-neutral-500 mt-0.5">
                            {item.rationale}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Sources */}
            {sources.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-4 h-4 text-success-400" />
                  <h4 className="text-sm font-medium text-white">Sources</h4>
                </div>
                <ul className="space-y-2">
                  {sources.map((source, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-success-400 mt-2 flex-shrink-0" />
                      <div>
                        {source.url ? (
                          <a
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-brand-400 hover:text-brand-300 transition-colors inline-flex items-center gap-1"
                          >
                            {source.name}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-sm text-neutral-300">
                            {source.name}
                          </span>
                        )}
                        {source.description && (
                          <p className="text-xs text-neutral-500 mt-0.5">
                            {source.description}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Notes */}
            {notes.length > 0 && (
              <div className="p-3 rounded-lg bg-neutral-800/30 border border-neutral-700/30">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-4 h-4 text-neutral-400" />
                  <h4 className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
                    Notes
                  </h4>
                </div>
                <ul className="space-y-1.5">
                  {notes.map((note, index) => (
                    <li key={index} className="text-xs text-neutral-500">
                      {note}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Trust footer */}
            <div className="pt-4 border-t border-neutral-800">
              <p className="text-xs text-neutral-500 text-center">
                We show our methodology because transparency builds trust.{" "}
                <span className="text-neutral-400">
                  No hidden affiliate incentives.
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * MethodologyInline - Compact version for embedding in tool pages
 */
export function MethodologyInline({
  formula,
  source,
  className,
}: {
  formula?: string;
  source?: { name: string; url?: string };
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 text-xs text-neutral-500",
        className
      )}
    >
      {formula && (
        <span className="flex items-center gap-1">
          <Calculator className="w-3 h-3" />
          <code className="font-mono text-neutral-400">{formula}</code>
        </span>
      )}
      {formula && source && <span className="text-neutral-700">|</span>}
      {source && (
        <span className="flex items-center gap-1">
          <FileText className="w-3 h-3" />
          {source.url ? (
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-400 hover:text-brand-300 transition-colors"
            >
              {source.name}
            </a>
          ) : (
            <span>{source.name}</span>
          )}
        </span>
      )}
    </div>
  );
}

export default MethodologyDetails;
