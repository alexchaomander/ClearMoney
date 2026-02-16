export interface MetricTraceData {
  metricId: string;
  label: string;
  formula: string;
  description: string;
  dataPoints: {
    label: string;
    value: string | number;
    source?: string;
  }[];
  confidenceScore: number; // 0 to 1
}

export const METRIC_METHODOLOGY: Record<string, MetricTraceData> = {
  netWorth: {
    metricId: "netWorth",
    label: "Net Worth",
    formula: "Total Assets - Total Liabilities",
    description: "The total value of everything you own minus everything you owe.",
    dataPoints: [
      { label: "Total Assets", value: "Sum of Cash + Investment account balances" },
      { label: "Total Liabilities", value: "Sum of all Debt account balances" },
    ],
    confidenceScore: 0.98,
  },
  totalAssets: {
    metricId: "totalAssets",
    label: "Total Assets",
    formula: "Cash + Investments",
    description: "The sum of all liquid and semi-liquid holdings.",
    dataPoints: [
      { label: "Cash Accounts", value: "Balances from all checking and savings accounts" },
      { label: "Investment Accounts", value: "Balances from all brokerage and retirement accounts" },
    ],
    confidenceScore: 1.0,
  },
  savingsRate: {
    metricId: "savingsRate",
    label: "Savings Rate",
    formula: "(Monthly Income - Monthly Spend) / Monthly Income",
    description: "The percentage of your income that you keep each month.",
    dataPoints: [
      { label: "Monthly Income", value: "Derived from linked payroll or self-reported in Profile" },
      { label: "Monthly Spend", value: "Observed average from the last 90 days of transactions" },
    ],
    confidenceScore: 0.85,
  },
  personalRunway: {
    metricId: "personalRunway",
    label: "Personal Runway",
    formula: "Liquid Cash / Monthly Burn",
    description: "How many months you can survive without new income.",
    dataPoints: [
      { label: "Liquid Cash", value: "Total across personal checking and savings" },
      { label: "Monthly Burn", value: "Average monthly personal spending" },
    ],
    confidenceScore: 0.9,
  },
};
