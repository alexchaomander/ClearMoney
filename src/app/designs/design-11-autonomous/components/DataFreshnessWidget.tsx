"use client";

import { RefreshCw, Check, AlertTriangle, Clock, LucideIcon } from "lucide-react";
import { colors } from "../shared";
import { MockConnection, FreshnessStatus, formatRelativeTime } from "../mocks/platform-mocks";

// Error color constant (used for expired/error states across components)
const ERROR_COLOR = '#ef4444';

interface FreshnessConfig {
  label: string;
  color: string;
  bgColor: string;
  icon: LucideIcon;
}

interface DataFreshnessWidgetProps {
  connections: MockConnection[];
  onRefresh?: (connectionId: string) => void;
}

function getFreshnessConfig(status: FreshnessStatus): FreshnessConfig {
  switch (status) {
    case 'fresh':
      return {
        label: 'Live',
        color: colors.success,
        bgColor: `${colors.success}15`,
        icon: Check,
      };
    case 'stale':
      return {
        label: 'Stale',
        color: colors.warning,
        bgColor: `${colors.warning}15`,
        icon: Clock,
      };
    case 'expired':
      return {
        label: 'Outdated',
        color: ERROR_COLOR,
        bgColor: `${ERROR_COLOR}15`,
        icon: AlertTriangle,
      };
  }
}

function getConnectionOverallStatus(connection: MockConnection): FreshnessStatus {
  const statuses = connection.dataTypes.map(dt => dt.status);
  if (statuses.includes('expired')) return 'expired';
  if (statuses.includes('stale')) return 'stale';
  return 'fresh';
}

function calculateOverallConfidence(connections: MockConnection[]): number {
  if (connections.length === 0) return 0;
  const totalConfidence = connections.reduce((sum, c) => sum + c.confidence, 0);
  return Math.round((totalConfidence / connections.length) * 100);
}

function countFreshDataSources(connections: MockConnection[]): { fresh: number; total: number } {
  const fresh = connections.reduce(
    (sum, c) => sum + c.dataTypes.filter(dt => dt.status === 'fresh').length,
    0
  );
  const total = connections.reduce((sum, c) => sum + c.dataTypes.length, 0);
  return { fresh, total };
}

export function DataFreshnessWidget({ connections, onRefresh }: DataFreshnessWidgetProps): React.ReactElement {
  const overallConfidence = calculateOverallConfidence(connections);
  const freshnessStats = countFreshDataSources(connections);
  const isHighConfidence = overallConfidence >= 80;

  return (
    <div
      className="p-6 rounded-3xl"
      style={{
        backgroundColor: colors.bgAlt,
        border: `1px solid ${colors.border}`,
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold" style={{ color: colors.text }}>
          Data Freshness
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm" style={{ color: colors.textMuted }}>
            Confidence
          </span>
          <span
            className="text-sm font-bold px-2 py-1 rounded-full"
            style={{
              backgroundColor: isHighConfidence ? `${colors.success}15` : `${colors.warning}15`,
              color: isHighConfidence ? colors.success : colors.warning,
            }}
          >
            {overallConfidence}%
          </span>
        </div>
      </div>

      {/* Confidence bar */}
      <div className="mb-6">
        <div
          className="w-full h-2 rounded-full overflow-hidden"
          style={{ backgroundColor: colors.border }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${overallConfidence}%`,
              background: isHighConfidence
                ? `linear-gradient(90deg, ${colors.success} 0%, ${colors.blob4} 100%)`
                : `linear-gradient(90deg, ${colors.warning} 0%, ${colors.warningLight} 100%)`,
            }}
          />
        </div>
      </div>

      {/* Connection list */}
      <div className="space-y-3">
        {connections.map((connection) => {
          const overallStatus = getConnectionOverallStatus(connection);
          const config = getFreshnessConfig(overallStatus);
          const StatusIcon = config.icon;

          return (
            <div
              key={connection.id}
              className="flex items-center justify-between p-3 rounded-xl"
              style={{ backgroundColor: colors.bg }}
            >
              <div className="flex items-center gap-3">
                {/* Institution logo */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white"
                  style={{
                    backgroundColor: connection.institutionColor,
                    boxShadow: `0 2px 8px ${connection.institutionColor}40`,
                  }}
                >
                  {connection.institutionLogo}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium" style={{ color: colors.text }}>
                      {connection.institutionName}
                    </span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1"
                      style={{ backgroundColor: config.bgColor, color: config.color }}
                    >
                      <StatusIcon className="w-3 h-3" />
                      {config.label}
                    </span>
                  </div>
                  <span className="text-xs" style={{ color: colors.textMuted }}>
                    Updated {formatRelativeTime(connection.lastSyncedAt)}
                  </span>
                </div>
              </div>

              {/* Refresh button */}
              <button
                onClick={() => onRefresh?.(connection.id)}
                className="p-2 rounded-lg transition-all duration-200 hover:bg-black/5"
                style={{ color: colors.textMuted }}
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Data source freshness summary */}
      <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${colors.border}` }}>
        <p className="text-xs" style={{ color: colors.textMuted }}>
          {freshnessStats.fresh} of {freshnessStats.total} data sources are fresh
        </p>
      </div>
    </div>
  );
}
