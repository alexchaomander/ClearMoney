"use client";

import { Link2, AlertCircle, RefreshCw, Plus, CheckCircle2 } from "lucide-react";
import { colors } from "../shared";
import { MockConnection, formatRelativeTime } from "../mocks/platform-mocks";

// ============================================================================
// CONNECTION STATUS CARD
// Enhanced connection status with actionable CTAs
// ============================================================================

interface ConnectionStatusCardProps {
  connections: MockConnection[];
  insightAccuracy: number;
  onAddConnection: () => void;
  onReconnect: (connectionId: string) => void;
}

function getStatusConfig(status: MockConnection['status']) {
  switch (status) {
    case 'active':
      return {
        color: colors.success,
        label: 'Connected',
        showPulse: true,
      };
    case 'degraded':
      return {
        color: colors.warning,
        label: 'Limited',
        showPulse: false,
      };
    case 'error':
      return {
        color: '#ef4444',
        label: 'Error',
        showPulse: false,
      };
    case 'needs_reauth':
      return {
        color: '#ef4444',
        label: 'Reconnect needed',
        showPulse: false,
      };
  }
}

export function ConnectionStatusCard({
  connections,
  insightAccuracy,
  onAddConnection,
  onReconnect,
}: ConnectionStatusCardProps) {
  const activeConnections = connections.filter(c => c.status === 'active');
  const problemConnections = connections.filter(c => c.status !== 'active');

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
            style={{ backgroundColor: `${colors.success}10` }}
          >
            <Link2 className="w-5 h-5" style={{ color: colors.success }} />
          </div>
          <div>
            <h3 className="text-lg font-semibold" style={{ color: colors.text }}>
              Connected Accounts
            </h3>
            <p className="text-sm" style={{ color: colors.textMuted }}>
              {connections.length} institution{connections.length !== 1 ? 's' : ''} connected
            </p>
          </div>
        </div>
      </div>

      {/* Institution tiles grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
        {connections.map((connection) => {
          const statusConfig = getStatusConfig(connection.status);
          const needsAction = connection.status === 'needs_reauth' || connection.status === 'error';

          return (
            <div
              key={connection.id}
              className={`relative p-4 rounded-xl transition-all duration-200 ${
                needsAction ? 'ring-2 ring-offset-2' : ''
              }`}
              style={{
                backgroundColor: colors.bg,
                border: `1px solid ${needsAction ? statusConfig.color : colors.border}`,
                ringColor: needsAction ? statusConfig.color : undefined,
              }}
            >
              {/* Status indicator */}
              <div
                className={`absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full ${
                  statusConfig.showPulse ? 'animate-pulse' : ''
                }`}
                style={{
                  backgroundColor: statusConfig.color,
                  boxShadow: statusConfig.showPulse ? `0 0 8px ${statusConfig.color}` : undefined,
                }}
              />

              {/* Institution logo */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold text-white mb-3"
                style={{
                  backgroundColor: connection.institutionColor,
                  boxShadow: `0 4px 12px ${connection.institutionColor}40`,
                }}
              >
                {connection.institutionLogo}
              </div>

              <p className="text-sm font-medium mb-1 truncate" style={{ color: colors.text }}>
                {connection.institutionName}
              </p>
              <p className="text-xs mb-2" style={{ color: colors.textMuted }}>
                {connection.accountCount} account{connection.accountCount !== 1 ? 's' : ''}
              </p>

              {/* Action buttons based on status */}
              {needsAction ? (
                <button
                  onClick={() => onReconnect(connection.id)}
                  className="w-full text-xs font-medium py-1.5 px-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-1"
                  style={{
                    backgroundColor: `${statusConfig.color}15`,
                    color: statusConfig.color,
                  }}
                >
                  <RefreshCw className="w-3 h-3" />
                  Reconnect
                </button>
              ) : (
                <p className="text-xs" style={{ color: colors.textLight }}>
                  {formatRelativeTime(connection.lastSyncedAt)}
                </p>
              )}

              {/* Error message tooltip */}
              {connection.errorMessage && (
                <div
                  className="absolute left-0 right-0 -bottom-1 transform translate-y-full p-2 rounded-lg text-xs z-10 opacity-0 hover:opacity-100 transition-opacity pointer-events-none"
                  style={{ backgroundColor: colors.text, color: 'white' }}
                >
                  {connection.errorMessage}
                </div>
              )}
            </div>
          );
        })}

        {/* Add account button */}
        <button
          onClick={onAddConnection}
          className="p-4 rounded-xl transition-all duration-200 hover:bg-black/5 flex flex-col items-center justify-center min-h-[120px]"
          style={{ border: `2px dashed ${colors.border}` }}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
            style={{ backgroundColor: colors.bg }}
          >
            <Plus className="w-6 h-6" style={{ color: colors.textLight }} />
          </div>
          <span className="text-sm font-medium" style={{ color: colors.textMuted }}>
            Add account
          </span>
        </button>
      </div>

      {/* Insight accuracy meter */}
      <div
        className="p-4 rounded-2xl mb-4"
        style={{ backgroundColor: `${colors.success}08` }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" style={{ color: colors.success }} />
            <span className="text-sm font-medium" style={{ color: colors.text }}>
              Insight Accuracy
            </span>
          </div>
          <span className="text-sm font-bold" style={{ color: colors.success }}>
            {insightAccuracy}%
          </span>
        </div>
        <div
          className="w-full h-2 rounded-full overflow-hidden"
          style={{ backgroundColor: colors.border }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${insightAccuracy}%`,
              background: `linear-gradient(90deg, ${colors.success} 0%, ${colors.blob4} 100%)`,
            }}
          />
        </div>
        {insightAccuracy < 100 && (
          <p className="text-xs mt-2" style={{ color: colors.textMuted }}>
            Connect more accounts to improve accuracy
          </p>
        )}
      </div>

      {/* Problem connections alert */}
      {problemConnections.length > 0 && (
        <div
          className="p-4 rounded-xl flex items-start gap-3"
          style={{ backgroundColor: '#ef444410' }}
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#ef4444' }} />
          <div>
            <p className="text-sm font-medium" style={{ color: colors.text }}>
              {problemConnections.length} connection{problemConnections.length !== 1 ? 's' : ''} need attention
            </p>
            <p className="text-xs mt-1" style={{ color: colors.textMuted }}>
              Reconnect to keep your recommendations accurate
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
