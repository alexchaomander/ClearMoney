import { addMonths } from "date-fns";
import type {
  CalculatorInputs,
  ComparisonResult,
  DebtItem,
  MonthlySnapshot,
  PayoffResult,
} from "./types";

export function calculateDebtPayoff(
  inputs: CalculatorInputs
): ComparisonResult {
  const snowball = simulatePayoff(inputs, "snowball");
  const avalanche = simulatePayoff(inputs, "avalanche");

  return {
    snowball,
    avalanche,
    interestSaved: snowball.totalInterest - avalanche.totalInterest,
    timeSaved: snowball.monthsToPayoff - avalanche.monthsToPayoff,
    motivationCost: Math.max(0, snowball.totalInterest - avalanche.totalInterest),
  };
}

function simulatePayoff(
  inputs: CalculatorInputs,
  method: "snowball" | "avalanche"
): PayoffResult {
  // Deep copy debts to avoid mutating inputs
  let debts = inputs.debts.map((d) => ({ ...d }));
  const timeline: MonthlySnapshot[] = [];
  const debtsPaidOrder: string[] = [];
  let totalInterestPaid = 0;
  let months = 0;

  let activeDebts = debts.filter((d) => d.balance > 0);

  while (activeDebts.length > 0 && months < 1200) { // Cap at 100 years to prevent infinite loops
    months++;
    
    // Sort active debts each month to ensure strategy is followed dynamically
    // (e.g. if balances cross, Snowball priority should switch)
    activeDebts.sort((a, b) => {
      if (method === "snowball") {
        return a.balance - b.balance;
      } else {
        return b.interestRate - a.interestRate;
      }
    });

    // Standard Snowball/Avalanche behavior: The total monthly commitment remains constant.
    // As debts are paid off, their minimum payments are "rolled over" into the extra payment pool.
    let monthlyBudget =
      inputs.monthlyExtraPayment +
      inputs.debts.reduce((sum, d) => sum + d.minimumPayment, 0);

    let monthInterest = 0;
    const debtSnapshots: { id: string; balance: number; paid: number }[] = [];

    // 1. Accrue Interest
    for (const debt of activeDebts) {
      const interest = debt.balance * (debt.interestRate / 100 / 12);
      debt.balance += interest;
      monthInterest += interest;
      totalInterestPaid += interest;
    }

    // 2. Pay Minimums
    for (const debt of activeDebts) {
      const payment = Math.min(debt.balance, debt.minimumPayment);
      debt.balance -= payment;
      monthlyBudget -= payment;
      
      // Store draft snapshot (will update with extra payments)
      debtSnapshots.push({ id: debt.id, balance: debt.balance, paid: payment });
    }

    // 3. Apply Extra Payment (Snowball/Avalanche ordering is already set)
    for (const debt of activeDebts) {
      if (monthlyBudget <= 0.01) break;
      if (debt.balance > 0) {
        const extra = Math.min(debt.balance, monthlyBudget);
        debt.balance -= extra;
        monthlyBudget -= extra;
        
        // Update snapshot
        const snap = debtSnapshots.find(s => s.id === debt.id);
        if (snap) snap.paid += extra;
        else debtSnapshots.push({ id: debt.id, balance: debt.balance, paid: extra }); // Should already exist
      }
    }

    // 4. Check for paid off debts
    const paidOffThisMonth = activeDebts.filter(d => d.balance <= 0.01);
    for (const debt of paidOffThisMonth) {
        debtsPaidOrder.push(debt.id);
    }
    
    // Filter out paid debts for next iteration
    activeDebts = activeDebts.filter((d) => d.balance > 0.01);

    timeline.push({
      month: months,
      debts: debtSnapshots.map(d => ({ ...d, balance: Math.max(0, d.balance) })),
      totalBalance: Math.max(0, activeDebts.reduce((sum, d) => sum + d.balance, 0)),
      totalInterestPaid: totalInterestPaid,
    });
  }

  return {
    method,
    totalInterest: totalInterestPaid,
    monthsToPayoff: months,
    payoffDate: addMonths(new Date(), months),
    timeline,
    debtsPaidOrder,
  };
}