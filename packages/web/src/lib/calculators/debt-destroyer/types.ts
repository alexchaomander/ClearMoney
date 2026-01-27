export interface Debt {
  id: string;
  name: string;
  balance: number;
  interestRate: number;
  minimumPayment: number;
}

export interface CalculatorInputs {
  debts: Debt[];
  extraPayment: number;
}

export interface PayoffEvent {
  month: number;
  debtName: string;
  totalPaidToDate: number;
}

export interface MethodResult {
  totalMonths: number;
  totalInterest: number;
  totalPaid: number;
  payoffOrder: PayoffEvent[];
  monthlySchedule: MonthlySnapshot[];
}

export interface MonthlySnapshot {
  month: number;
  debts: { id: string; balance: number; payment: number }[];
  totalBalance: number;
}

export interface CalculatorResults {
  snowball: MethodResult;
  avalanche: MethodResult;
  interestSaved: number;
  monthsDifference: number;
  firstPayoffSnowball: PayoffEvent;
  firstPayoffAvalanche: PayoffEvent;
  recommendation: string;
}
