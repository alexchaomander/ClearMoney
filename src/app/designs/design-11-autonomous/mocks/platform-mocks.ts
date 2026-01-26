// ============================================================================
// PLATFORM MOCK DATA
// Mock data for Context Graph platform UI components
// ============================================================================

// Shared type definitions
export type FreshnessStatus = 'fresh' | 'stale' | 'expired';
export type ConnectionStatus = 'active' | 'degraded' | 'error' | 'needs_reauth';
export type DataType = 'balances' | 'transactions' | 'holdings' | 'liabilities';
export type AssumptionSource = 'calculated' | 'user_input' | 'default';
export type GapType = 'missing_account_type' | 'stale_data' | 'incomplete_history';
export type Severity = 'low' | 'medium' | 'high';

export interface ConnectionDataType {
  type: DataType;
  status: FreshnessStatus;
  lastUpdated: string;
}

export interface MockConnection {
  id: string;
  institutionName: string;
  institutionLogo: string;
  institutionColor: string;
  status: ConnectionStatus;
  accountCount: number;
  lastSyncedAt: string;
  dataTypes: ConnectionDataType[];
  confidence: number;
  errorMessage?: string;
}

export interface DecisionTraceInput {
  label: string;
  value: string;
  source: string;
  lastUpdated: string;
}

export interface DecisionTraceRule {
  name: string;
  passed: boolean;
}

export interface DecisionTraceAssumption {
  label: string;
  value: string;
  source: AssumptionSource;
}

export interface MockDecisionTrace {
  title: string;
  inputsUsed: DecisionTraceInput[];
  rulesApplied: DecisionTraceRule[];
  assumptions: DecisionTraceAssumption[];
  confidence: number;
  calculationBreakdown?: string;
}

export interface CoverageGap {
  type: GapType;
  title: string;
  impact: string;
  severity: Severity;
  cta: {
    label: string;
    action: () => void;
  };
}

// ============================================================================
// MOCK CONNECTIONS
// ============================================================================

export const mockConnections: MockConnection[] = [
  {
    id: 'conn_chase',
    institutionName: 'Chase',
    institutionLogo: 'C',
    institutionColor: '#1a73e8',
    status: 'active',
    accountCount: 2,
    lastSyncedAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(), // 10 min ago
    dataTypes: [
      { type: 'balances', status: 'fresh', lastUpdated: new Date(Date.now() - 1000 * 60 * 10).toISOString() },
      { type: 'transactions', status: 'fresh', lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString() },
    ],
    confidence: 0.95,
  },
  {
    id: 'conn_fidelity',
    institutionName: 'Fidelity',
    institutionLogo: 'F',
    institutionColor: '#4a8c3c',
    status: 'active',
    accountCount: 1,
    lastSyncedAt: new Date(Date.now() - 1000 * 60 * 60 * 7).toISOString(), // 7 hours ago
    dataTypes: [
      { type: 'balances', status: 'stale', lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 7).toISOString() },
      { type: 'holdings', status: 'stale', lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString() },
    ],
    confidence: 0.78,
  },
  {
    id: 'conn_amex',
    institutionName: 'American Express',
    institutionLogo: 'AE',
    institutionColor: '#006fcf',
    status: 'active',
    accountCount: 1,
    lastSyncedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
    dataTypes: [
      { type: 'balances', status: 'fresh', lastUpdated: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
      { type: 'transactions', status: 'fresh', lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString() },
      { type: 'liabilities', status: 'fresh', lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
    ],
    confidence: 0.92,
  },
  {
    id: 'conn_navient',
    institutionName: 'Navient',
    institutionLogo: 'N',
    institutionColor: '#003c71',
    status: 'needs_reauth',
    accountCount: 1,
    lastSyncedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
    dataTypes: [
      { type: 'balances', status: 'expired', lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString() },
      { type: 'liabilities', status: 'expired', lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString() },
    ],
    confidence: 0.35,
    errorMessage: 'Your session has expired. Please reconnect.',
  },
];

// ============================================================================
// MOCK DECISION TRACES
// ============================================================================

export const mockDecisionTrace: MockDecisionTrace = {
  title: 'Build your emergency fund',
  inputsUsed: [
    {
      label: 'Current savings balance',
      value: '$8,500',
      source: 'Chase Savings',
      lastUpdated: '10 minutes ago',
    },
    {
      label: 'Monthly expenses (3-month avg)',
      value: '$5,000',
      source: 'Calculated from transactions',
      lastUpdated: '6 hours ago',
    },
    {
      label: 'Current emergency fund coverage',
      value: '1.7 months',
      source: 'Calculated',
      lastUpdated: '10 minutes ago',
    },
  ],
  rulesApplied: [
    { name: 'Emergency fund target: 3 months of expenses', passed: false },
    { name: 'Current coverage below target threshold', passed: true },
    { name: 'User has active income source', passed: true },
    { name: 'No high-interest debt blocking progress', passed: true },
  ],
  assumptions: [
    { label: 'Target emergency fund', value: '3 months', source: 'default' },
    { label: 'Monthly expenses', value: '$5,000', source: 'calculated' },
    { label: 'Include checking balance', value: 'No', source: 'default' },
  ],
  confidence: 0.92,
  calculationBreakdown: `
### How we calculated this

**Current State:**
- Savings balance: $8,500
- Monthly expenses: $5,000 (average of last 3 months)
- Current coverage: $8,500 / $5,000 = **1.7 months**

**Target:**
- Recommended coverage: 3 months
- Target amount: $5,000 × 3 = **$15,000**

**Gap:**
- Amount needed: $15,000 - $8,500 = **$6,500**
- Months of coverage needed: 3.0 - 1.7 = **1.3 months**

**Confidence: 92%**
- High confidence due to fresh data from connected accounts
- Slight reduction due to expense variability
  `,
};

export const mockDebtPayoffTrace: MockDecisionTrace = {
  title: 'Pay off high-interest credit card',
  inputsUsed: [
    {
      label: 'Current Amex balance',
      value: '$6,000',
      source: 'American Express',
      lastUpdated: '30 minutes ago',
    },
    {
      label: 'APR',
      value: '22%',
      source: 'American Express',
      lastUpdated: '30 minutes ago',
    },
    {
      label: 'Available savings',
      value: '$8,500',
      source: 'Chase Savings',
      lastUpdated: '10 minutes ago',
    },
  ],
  rulesApplied: [
    { name: 'Debt APR above 10% threshold', passed: true },
    { name: 'Sufficient liquid savings available', passed: true },
    { name: 'Maintains minimum 1-month emergency buffer', passed: true },
  ],
  assumptions: [
    { label: 'High-interest threshold', value: '10% APR', source: 'default' },
    { label: 'Minimum emergency buffer', value: '1 month', source: 'default' },
  ],
  confidence: 0.95,
};

export const mockRothTrace: MockDecisionTrace = {
  title: 'Consider Roth 401(k) contributions',
  inputsUsed: [
    {
      label: 'Annual income',
      value: '$150,000',
      source: 'User profile',
      lastUpdated: '30 days ago',
    },
    {
      label: 'Current 401k contribution',
      value: '$15,600/year',
      source: 'Fidelity',
      lastUpdated: '7 hours ago',
    },
    {
      label: 'Current tax bracket',
      value: '32%',
      source: 'Calculated',
      lastUpdated: '7 hours ago',
    },
  ],
  rulesApplied: [
    { name: 'Current tax bracket > projected retirement bracket', passed: true },
    { name: 'Years to retirement > 25', passed: true },
    { name: 'Employer offers Roth 401(k) option', passed: true },
  ],
  assumptions: [
    { label: 'Growth rate', value: '7%', source: 'default' },
    { label: 'Inflation rate', value: '3%', source: 'default' },
    { label: 'Retirement tax bracket', value: '24%', source: 'calculated' },
    { label: 'Retirement age', value: '62', source: 'user_input' },
  ],
  confidence: 0.78,
};

// ============================================================================
// MOCK COVERAGE GAPS
// ============================================================================

export const mockCoverageGaps: CoverageGap[] = [
  {
    type: 'missing_account_type',
    title: 'No mortgage connected',
    impact: 'Home equity not reflected in net worth calculation',
    severity: 'medium',
    cta: { label: 'Connect mortgage', action: () => {} },
  },
  {
    type: 'stale_data',
    title: 'Fidelity data is outdated',
    impact: 'Investment recommendations may not reflect current holdings',
    severity: 'high',
    cta: { label: 'Refresh now', action: () => {} },
  },
  {
    type: 'missing_account_type',
    title: 'No HSA account connected',
    impact: 'Missing tax-advantaged savings opportunity analysis',
    severity: 'low',
    cta: { label: 'Connect HSA', action: () => {} },
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const MS_PER_MINUTE = 1000 * 60;
const MS_PER_HOUR = MS_PER_MINUTE * 60;
const MS_PER_DAY = MS_PER_HOUR * 24;

function pluralize(count: number, singular: string): string {
  return `${count} ${singular}${count === 1 ? '' : 's'}`;
}

export function formatRelativeTime(dateString: string): string {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const diffMinutes = Math.floor(diffMs / MS_PER_MINUTE);
  const diffHours = Math.floor(diffMs / MS_PER_HOUR);
  const diffDays = Math.floor(diffMs / MS_PER_DAY);

  if (diffMinutes < 1) return 'just now';
  if (diffMinutes < 60) return `${pluralize(diffMinutes, 'minute')} ago`;
  if (diffHours < 24) return `${pluralize(diffHours, 'hour')} ago`;
  if (diffDays < 7) return `${pluralize(diffDays, 'day')} ago`;
  return new Date(dateString).toLocaleDateString();
}

export function getOverallFreshness(connections: MockConnection[]): FreshnessStatus {
  const statuses = connections.flatMap(c => c.dataTypes.map(dt => dt.status));
  if (statuses.includes('expired')) return 'expired';
  if (statuses.includes('stale')) return 'stale';
  return 'fresh';
}

export function getAverageConfidence(connections: MockConnection[]): number {
  if (connections.length === 0) return 0;
  const total = connections.reduce((sum, c) => sum + c.confidence, 0);
  return Math.round((total / connections.length) * 100) / 100;
}
