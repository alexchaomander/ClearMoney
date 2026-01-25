"use client";

import { X, Check, XCircle, Database, GitBranch, Lightbulb, HelpCircle, Link2 } from "lucide-react";
import { colors } from "../shared";
import { MockDecisionTrace } from "../mocks/platform-mocks";

// ============================================================================
// DECISION TRACE DRAWER
// "Why this recommendation?" explainer drawer
// ============================================================================

interface DecisionTraceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  recommendation: MockDecisionTrace;
}

function getSourceIcon(source: 'calculated' | 'user_input' | 'default') {
  switch (source) {
    case 'calculated':
      return { icon: GitBranch, color: colors.accent };
    case 'user_input':
      return { icon: Database, color: colors.success };
    case 'default':
      return { icon: Lightbulb, color: colors.textMuted };
  }
}

function getSourceLabel(source: 'calculated' | 'user_input' | 'default') {
  switch (source) {
    case 'calculated':
      return 'Calculated';
    case 'user_input':
      return 'You provided';
    case 'default':
      return 'Default';
  }
}

export function DecisionTraceDrawer({ isOpen, onClose, recommendation }: DecisionTraceDrawerProps) {
  if (!isOpen) return null;

  const confidencePercent = Math.round(recommendation.confidence * 100);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className="fixed right-0 top-0 h-full w-full max-w-lg bg-white z-50 overflow-y-auto shadow-2xl"
        style={{ borderLeft: `1px solid ${colors.border}` }}
      >
        {/* Header */}
        <div
          className="sticky top-0 bg-white/95 backdrop-blur-sm z-10 p-6 border-b"
          style={{ borderColor: colors.border }}
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <HelpCircle className="w-5 h-5" style={{ color: colors.accent }} />
                <span className="text-sm font-medium" style={{ color: colors.accent }}>
                  Why this recommendation?
                </span>
              </div>
              <h2 className="text-xl font-bold" style={{ color: colors.text }}>
                {recommendation.title}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg transition-colors hover:bg-black/5"
              style={{ color: colors.textMuted }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Confidence */}
          <div className="mt-4 flex items-center gap-3">
            <span className="text-sm" style={{ color: colors.textMuted }}>
              Confidence
            </span>
            <div className="flex-1 h-2 rounded-full" style={{ backgroundColor: colors.border }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${confidencePercent}%`,
                  backgroundColor: confidencePercent >= 80 ? colors.success : colors.warning,
                }}
              />
            </div>
            <span
              className="text-sm font-bold"
              style={{ color: confidencePercent >= 80 ? colors.success : colors.warning }}
            >
              {confidencePercent}%
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Data Used Section */}
          <section>
            <h3 className="text-sm font-semibold uppercase tracking-wide mb-4" style={{ color: colors.textMuted }}>
              Data Used
            </h3>
            <div className="space-y-3">
              {recommendation.inputsUsed.map((input, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl"
                  style={{ backgroundColor: colors.bg }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-sm font-medium" style={{ color: colors.text }}>
                      {input.label}
                    </span>
                    <span className="text-sm font-bold" style={{ color: colors.accent }}>
                      {input.value}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link2 className="w-3 h-3" style={{ color: colors.textLight }} />
                    <span className="text-xs" style={{ color: colors.textMuted }}>
                      {input.source}
                    </span>
                    <span className="text-xs" style={{ color: colors.textLight }}>
                      {input.lastUpdated}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Rules Applied Section */}
          <section>
            <h3 className="text-sm font-semibold uppercase tracking-wide mb-4" style={{ color: colors.textMuted }}>
              Rules Applied
            </h3>
            <div className="space-y-2">
              {recommendation.rulesApplied.map((rule, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ backgroundColor: rule.passed ? `${colors.success}08` : `${colors.warning}08` }}
                >
                  {rule.passed ? (
                    <Check className="w-5 h-5 flex-shrink-0" style={{ color: colors.success }} />
                  ) : (
                    <XCircle className="w-5 h-5 flex-shrink-0" style={{ color: colors.warning }} />
                  )}
                  <span className="text-sm" style={{ color: colors.text }}>
                    {rule.name}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Assumptions Section */}
          <section>
            <h3 className="text-sm font-semibold uppercase tracking-wide mb-4" style={{ color: colors.textMuted }}>
              Assumptions
            </h3>
            <div className="space-y-2">
              {recommendation.assumptions.map((assumption, index) => {
                const sourceConfig = getSourceIcon(assumption.source);
                const SourceIcon = sourceConfig.icon;

                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-xl"
                    style={{ backgroundColor: colors.bg }}
                  >
                    <div className="flex items-center gap-3">
                      <SourceIcon className="w-4 h-4" style={{ color: sourceConfig.color }} />
                      <span className="text-sm" style={{ color: colors.text }}>
                        {assumption.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium" style={{ color: colors.text }}>
                        {assumption.value}
                      </span>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: `${sourceConfig.color}15`,
                          color: sourceConfig.color,
                        }}
                      >
                        {getSourceLabel(assumption.source)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Calculation Breakdown (if available) */}
          {recommendation.calculationBreakdown && (
            <section>
              <h3 className="text-sm font-semibold uppercase tracking-wide mb-4" style={{ color: colors.textMuted }}>
                How We Calculated This
              </h3>
              <div
                className="p-4 rounded-xl prose prose-sm max-w-none"
                style={{
                  backgroundColor: colors.bg,
                  color: colors.text,
                }}
              >
                <pre
                  className="whitespace-pre-wrap text-sm leading-relaxed"
                  style={{ color: colors.textMuted, fontFamily: 'inherit' }}
                >
                  {recommendation.calculationBreakdown.trim()}
                </pre>
              </div>
            </section>
          )}

          {/* Learn More Link */}
          <div className="pt-4" style={{ borderTop: `1px solid ${colors.border}` }}>
            <a
              href="#"
              className="text-sm font-medium flex items-center gap-2 transition-colors hover:opacity-80"
              style={{ color: colors.accent }}
            >
              Learn more about our methodology
              <span>&#8594;</span>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
