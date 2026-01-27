import type {
  CalculatorInputs,
  CalculatorResults,
  Debt,
  MethodResult,
  MonthlySnapshot,
  PayoffEvent,
} from "./types";

function simulatePayoff(
  debts: Debt[],
  extraPayment: number,
  sortFn: (a: Debt, b: Debt) => number
): MethodResult {
  let remaining = debts.map((debt) => ({ ...debt })).sort(sortFn);

  const payoffOrder: PayoffEvent[] = [];
  const monthlySchedule: MonthlySnapshot[] = [];
  let month = 0;
  let totalInterest = 0;
  let totalPaid = 0;

  while (remaining.length > 0 && month < 360) {
    month += 1;

    const totalMinimums = remaining.reduce(
      (sum, debt) => sum + debt.minimumPayment,
      0
    );
    const availableExtra = extraPayment;

    const monthSnapshot: MonthlySnapshot = {
      month,
      debts: [],
      totalBalance: 0,
    };

    for (let i = 0; i < remaining.length; i += 1) {
      const debt = remaining[i];

      const monthlyRate = debt.interestRate / 100 / 12;
      const interestCharge = debt.balance * monthlyRate;
      debt.balance += interestCharge;
      totalInterest += interestCharge;

      let payment = debt.minimumPayment;
      if (i === 0 && availableExtra > 0) {
        payment += availableExtra;
      }

      if (totalMinimums + extraPayment > 0) {
        payment = Math.min(payment, debt.balance);
      }

      debt.balance -= payment;
      totalPaid += payment;

      monthSnapshot.debts.push({
        id: debt.id,
        balance: Math.max(0, debt.balance),
        payment,
      });
    }

    remaining = remaining.filter((debt) => {
      if (debt.balance <= 0.01) {
        payoffOrder.push({
          month,
          debtName: debt.name,
          totalPaidToDate: totalPaid,
        });
        return false;
      }
      return true;
    });

    remaining.sort(sortFn);

    monthSnapshot.totalBalance = remaining.reduce(
      (sum, debt) => sum + debt.balance,
      0
    );
    monthlySchedule.push(monthSnapshot);
  }

  return {
    totalMonths: month,
    totalInterest: Math.round(totalInterest * 100) / 100,
    totalPaid: Math.round(totalPaid * 100) / 100,
    payoffOrder,
    monthlySchedule,
  };
}

export function calculate(inputs: CalculatorInputs): CalculatorResults {
  const { debts, extraPayment } = inputs;

  if (debts.length === 0) {
    return {
      snowball: {
        totalMonths: 0,
        totalInterest: 0,
        totalPaid: 0,
        payoffOrder: [],
        monthlySchedule: [],
      },
      avalanche: {
        totalMonths: 0,
        totalInterest: 0,
        totalPaid: 0,
        payoffOrder: [],
        monthlySchedule: [],
      },
      interestSaved: 0,
      monthsDifference: 0,
      firstPayoffSnowball: { month: 0, debtName: "", totalPaidToDate: 0 },
      firstPayoffAvalanche: { month: 0, debtName: "", totalPaidToDate: 0 },
      recommendation: "Add some debts to get started",
    };
  }

  const snowball = simulatePayoff(
    debts,
    extraPayment,
    (a, b) => a.balance - b.balance
  );
  const avalanche = simulatePayoff(
    debts,
    extraPayment,
    (a, b) => b.interestRate - a.interestRate
  );

  const interestSaved = snowball.totalInterest - avalanche.totalInterest;
  const firstPayoffSnowball =
    snowball.payoffOrder[0] || { month: 0, debtName: "", totalPaidToDate: 0 };
  const firstPayoffAvalanche =
    avalanche.payoffOrder[0] || { month: 0, debtName: "", totalPaidToDate: 0 };
  const monthsDifference = firstPayoffAvalanche.month - firstPayoffSnowball.month;

  let recommendation: string;
  if (interestSaved < 100) {
    recommendation = "Either method works—choose what keeps you motivated!";
  } else if (interestSaved < 500) {
    recommendation = `Avalanche saves ${formatCurrency(
      interestSaved
    )}, but snowball gives faster wins. Your call!`;
  } else {
    recommendation = `Avalanche saves ${formatCurrency(
      interestSaved
    )}—that's significant! Consider the math.`;
  }

  return {
    snowball,
    avalanche,
    interestSaved,
    monthsDifference,
    firstPayoffSnowball,
    firstPayoffAvalanche,
    recommendation,
  };
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}
