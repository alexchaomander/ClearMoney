"use client";

import { AlertTriangle, CheckCircle, ArrowRight, Info, Clock, FileQuestion } from "lucide-react";
import { colors } from "../shared";
import { CoverageGap } from "../mocks/platform-mocks";

// ============================================================================
// COVERAGE GAPS CARD
// Shows what data is missing and why it matters
// ============================================================================

interface CoverageGapsCardProps {
  gaps: CoverageGap[];
}

function getSeverityConfig(severity: CoverageGap['severity']) {
  switch (severity) {
    case 'high':
      return {
        color: '#ef4444',
        bgColor: '#ef444415',
        icon: AlertTriangle,
        label: 'High impact',
      };
    case 'medium':
      return {
        color: colors.warning,
        bgColor: `${colors.warning}15`,
        icon: Info,
        label: 'Medium impact',
      };
    case 'low':
      return {
        color: colors.textMuted,
        bgColor: colors.bg,
        icon: Info,
        label: 'Low impact',
      };
  }
}

function getTypeIcon(type: CoverageGap['type']) {
  switch (type) {
    case 'missing_account_type':
      return FileQuestion;
    case 'stale_data':
      return Clock;
    case 'incomplete_history':
      return Info;
  }
}

export function CoverageGapsCard({ gaps }: CoverageGapsCardProps) {
  // If no gaps, show "all caught up" state
  if (gaps.length === 0) {
    return (
      <div
        className="p-6 rounded-3xl"
        style={{
          backgroundColor: colors.bgAlt,
          border: `1px solid ${colors.border}`,
        }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${colors.success}10` }}
          >
            <CheckCircle className="w-5 h-5" style={{ color: colors.success }} />
          </div>
          <h3 className="text-lg font-semibold" style={{ color: colors.text }}>
            Data Coverage
          </h3>
        </div>

        <div
          className="p-6 rounded-xl text-center"
          style={{ backgroundColor: `${colors.success}08` }}
        >
          <CheckCircle className="w-12 h-12 mx-auto mb-3" style={{ color: colors.success }} />
          <p className="text-lg font-semibold mb-1" style={{ color: colors.text }}>
            All caught up!
          </p>
          <p className="text-sm" style={{ color: colors.textMuted }}>
            Your connected accounts provide complete coverage for accurate recommendations.
          </p>
        </div>
      </div>
    );
  }

  // Sort gaps by severity (high first)
  const sortedGaps = [...gaps].sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.severity] - order[b.severity];
  });

  const highPriorityCount = gaps.filter(g => g.severity === 'high').length;

  return (
    <div
      className="p-6 rounded-3xl"
      style={{
        backgroundColor: colors.bgAlt,
        border: `1px solid ${colors.border}`,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              backgroundColor: highPriorityCount > 0 ? '#ef444415' : `${colors.warning}15`,
            }}
          >
            <AlertTriangle
              className="w-5 h-5"
              style={{ color: highPriorityCount > 0 ? '#ef4444' : colors.warning }}
            />
          </div>
          <div>
            <h3 className="text-lg font-semibold" style={{ color: colors.text }}>
              Coverage Gaps
            </h3>
            <p className="text-sm" style={{ color: colors.textMuted }}>
              {gaps.length} item{gaps.length !== 1 ? 's' : ''} affecting your insights
            </p>
          </div>
        </div>
      </div>

      {/* Gap list */}
      <div className="space-y-3">
        {sortedGaps.map((gap, index) => {
          const severityConfig = getSeverityConfig(gap.severity);
          const TypeIcon = getTypeIcon(gap.type);
          const SeverityIcon = severityConfig.icon;

          return (
            <div
              key={index}
              className="p-4 rounded-xl transition-all duration-200 hover:shadow-md"
              style={{
                backgroundColor: severityConfig.bgColor,
                border: gap.severity === 'high' ? `1px solid ${severityConfig.color}30` : 'none',
              }}
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${severityConfig.color}20` }}
                >
                  <TypeIcon className="w-4 h-4" style={{ color: severityConfig.color }} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold" style={{ color: colors.text }}>
                      {gap.title}
                    </span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: `${severityConfig.color}20`, color: severityConfig.color }}
                    >
                      {severityConfig.label}
                    </span>
                  </div>
                  <p className="text-sm mb-3" style={{ color: colors.textMuted }}>
                    {gap.impact}
                  </p>

                  {/* CTA Button */}
                  <button
                    onClick={gap.cta.action}
                    className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition-all duration-200 hover:shadow-md"
                    style={{
                      backgroundColor: severityConfig.color,
                      color: 'white',
                    }}
                  >
                    {gap.cta.label}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${colors.border}` }}>
        <p className="text-xs" style={{ color: colors.textMuted }}>
          Resolving these gaps will improve your recommendation accuracy by up to{' '}
          <span className="font-semibold" style={{ color: colors.accent }}>
            {Math.min(gaps.length * 5, 15)}%
          </span>
        </p>
      </div>
    </div>
  );
}
