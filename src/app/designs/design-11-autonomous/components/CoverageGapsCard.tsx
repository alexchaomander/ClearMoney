"use client";

import { AlertTriangle, CheckCircle, ArrowRight, Info, Clock, FileQuestion, LucideIcon } from "lucide-react";
import { colors } from "../shared";
import { CoverageGap, Severity, GapType } from "../mocks/platform-mocks";

// Error color constant (consistent with other components)
const ERROR_COLOR = '#ef4444';

// Accuracy improvement estimate when gaps are resolved
const ACCURACY_IMPACT_PER_GAP = 5;
const MAX_ACCURACY_IMPACT = 15;

interface SeverityConfig {
  color: string;
  bgColor: string;
  icon: LucideIcon;
  label: string;
}

interface CoverageGapsCardProps {
  gaps: CoverageGap[];
}

const SEVERITY_CONFIGS: Record<Severity, SeverityConfig> = {
  high: { color: ERROR_COLOR, bgColor: `${ERROR_COLOR}15`, icon: AlertTriangle, label: 'High impact' },
  medium: { color: colors.warning, bgColor: `${colors.warning}15`, icon: Info, label: 'Medium impact' },
  low: { color: colors.textMuted, bgColor: colors.bg, icon: Info, label: 'Low impact' },
};

const GAP_TYPE_ICONS: Record<GapType, LucideIcon> = {
  missing_account_type: FileQuestion,
  stale_data: Clock,
  incomplete_history: Info,
};

const SEVERITY_ORDER: Record<Severity, number> = { high: 0, medium: 1, low: 2 };

function sortBySeverity(gaps: CoverageGap[]): CoverageGap[] {
  return [...gaps].sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);
}

function calculateAccuracyImprovement(gapCount: number): number {
  return Math.min(gapCount * ACCURACY_IMPACT_PER_GAP, MAX_ACCURACY_IMPACT);
}

function pluralize(count: number, singular: string): string {
  return `${count} ${singular}${count === 1 ? '' : 's'}`;
}

function EmptyState(): React.ReactElement {
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

export function CoverageGapsCard({ gaps }: CoverageGapsCardProps): React.ReactElement {
  if (gaps.length === 0) {
    return <EmptyState />;
  }

  const sortedGaps = sortBySeverity(gaps);
  const hasHighPriorityGaps = gaps.some(g => g.severity === 'high');
  const headerColor = hasHighPriorityGaps ? ERROR_COLOR : colors.warning;

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
            style={{ backgroundColor: `${headerColor}15` }}
          >
            <AlertTriangle className="w-5 h-5" style={{ color: headerColor }} />
          </div>
          <div>
            <h3 className="text-lg font-semibold" style={{ color: colors.text }}>
              Coverage Gaps
            </h3>
            <p className="text-sm" style={{ color: colors.textMuted }}>
              {pluralize(gaps.length, 'item')} affecting your insights
            </p>
          </div>
        </div>
      </div>

      {/* Gap list */}
      <div className="space-y-3">
        {sortedGaps.map((gap, index) => {
          const config = SEVERITY_CONFIGS[gap.severity];
          const TypeIcon = GAP_TYPE_ICONS[gap.type];
          const isHighSeverity = gap.severity === 'high';

          return (
            <div
              key={index}
              className="p-4 rounded-xl transition-all duration-200 hover:shadow-md"
              style={{
                backgroundColor: config.bgColor,
                border: isHighSeverity ? `1px solid ${config.color}30` : 'none',
              }}
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${config.color}20` }}
                >
                  <TypeIcon className="w-4 h-4" style={{ color: config.color }} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold" style={{ color: colors.text }}>
                      {gap.title}
                    </span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: `${config.color}20`, color: config.color }}
                    >
                      {config.label}
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
                      backgroundColor: config.color,
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
            {calculateAccuracyImprovement(gaps.length)}%
          </span>
        </p>
      </div>
    </div>
  );
}
