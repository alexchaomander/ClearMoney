import type {
  CalculatorInputs,
  CalculatorResults,
  MilestonePoint,
} from "./types";

export function calculate(inputs: CalculatorInputs): CalculatorResults {
  const { goalAmount, currentSavings, monthlyContribution, annualReturnRate } =
    inputs;

  const monthlyRate = annualReturnRate / 100 / 12;
  const amountNeeded = Math.max(0, goalAmount - currentSavings);

  // Calculate months to goal with monthly compounding
  const monthsToGoal = calculateMonthsToGoal(
    currentSavings,
    monthlyContribution,
    monthlyRate,
    goalAmount
  );

  // Build month-by-month balances to find milestones
  const milestones = calculateMilestones(
    currentSavings,
    monthlyContribution,
    monthlyRate,
    goalAmount,
    monthsToGoal
  );

  // Total contributions (excluding initial savings)
  const totalMonths = Math.ceil(monthsToGoal);
  const totalContributions = monthlyContribution * totalMonths;

  // Final balance at goal month
  const finalBalance = simulateBalance(
    currentSavings,
    monthlyContribution,
    monthlyRate,
    totalMonths
  );
  const totalInterestEarned = Math.max(
    0,
    finalBalance - currentSavings - totalContributions
  );

  // Target date
  const targetDate = new Date();
  targetDate.setMonth(targetDate.getMonth() + totalMonths);

  // Monthly needed if no investment return
  const monthlyNeededIfNoReturn =
    amountNeeded > 0 && totalMonths > 0
      ? amountNeeded / totalMonths
      : amountNeeded > 0
        ? amountNeeded
        : 0;

  // Generate recommendation
  const recommendation = generateRecommendation(
    monthsToGoal,
    totalInterestEarned,
    totalContributions,
    monthlyContribution,
    goalAmount,
    currentSavings
  );

  return {
    monthsToGoal,
    totalContributions,
    totalInterestEarned,
    targetDate,
    milestones,
    monthlyNeededIfNoReturn,
    recommendation,
  };
}

function calculateMonthsToGoal(
  currentSavings: number,
  monthlyContribution: number,
  monthlyRate: number,
  goalAmount: number
): number {
  if (goalAmount <= 0) return 0;
  if (currentSavings >= goalAmount) return 0;
  if (monthlyContribution <= 0 && monthlyRate <= 0) return Infinity;

  let balance = currentSavings;
  let months = 0;
  const maxMonths = 1200; // 100 years cap

  while (balance < goalAmount && months < maxMonths) {
    const interest = balance * monthlyRate;
    balance = balance + interest + monthlyContribution;
    months++;
  }

  // Interpolate for fractional month precision
  if (months > 0 && balance >= goalAmount) {
    const prevBalance =
      (balance - monthlyContribution) / (1 + monthlyRate);
    const overshoot = balance - goalAmount;
    const monthGrowth = balance - prevBalance;
    if (monthGrowth > 0) {
      months -= overshoot / monthGrowth;
    }
  }

  return Math.max(0, months);
}

function simulateBalance(
  currentSavings: number,
  monthlyContribution: number,
  monthlyRate: number,
  months: number
): number {
  let balance = currentSavings;
  for (let m = 0; m < months; m++) {
    const interest = balance * monthlyRate;
    balance = balance + interest + monthlyContribution;
  }
  return balance;
}

function calculateMilestones(
  currentSavings: number,
  monthlyContribution: number,
  monthlyRate: number,
  goalAmount: number,
  monthsToGoal: number
): MilestonePoint[] {
  if (goalAmount <= 0 || !Number.isFinite(monthsToGoal)) return [];

  const milestoneTargets = [0.25, 0.5, 0.75, 1.0];
  const milestones: MilestonePoint[] = [];
  const totalMonths = Math.ceil(monthsToGoal);

  let balance = currentSavings;
  let lastMilestoneIndex = 0;

  // Check if we already passed some milestones with current savings
  const startPercent = goalAmount > 0 ? currentSavings / goalAmount : 0;
  for (let i = 0; i < milestoneTargets.length; i++) {
    if (startPercent >= milestoneTargets[i]) {
      milestones.push({
        month: 0,
        balance: currentSavings,
        percentComplete: milestoneTargets[i] * 100,
      });
      lastMilestoneIndex = i + 1;
    }
  }

  for (let month = 1; month <= totalMonths && lastMilestoneIndex < milestoneTargets.length; month++) {
    const interest = balance * monthlyRate;
    balance = balance + interest + monthlyContribution;
    const percentComplete = goalAmount > 0 ? balance / goalAmount : 0;

    while (
      lastMilestoneIndex < milestoneTargets.length &&
      percentComplete >= milestoneTargets[lastMilestoneIndex]
    ) {
      milestones.push({
        month,
        balance: Math.min(balance, goalAmount),
        percentComplete: milestoneTargets[lastMilestoneIndex] * 100,
      });
      lastMilestoneIndex++;
    }
  }

  return milestones;
}

function generateRecommendation(
  monthsToGoal: number,
  totalInterestEarned: number,
  totalContributions: number,
  monthlyContribution: number,
  goalAmount: number,
  currentSavings: number
): string {
  if (currentSavings >= goalAmount) {
    return "You've already reached your savings goal! Consider setting a new, higher target or reallocating these funds.";
  }

  if (!Number.isFinite(monthsToGoal)) {
    return "At your current contribution rate, this goal may not be reachable. Try increasing your monthly contribution or adjusting your target.";
  }

  const years = monthsToGoal / 12;
  const interestPercent =
    totalContributions > 0
      ? (totalInterestEarned / totalContributions) * 100
      : 0;

  if (years <= 1) {
    return `You're on track to reach your goal in under a year. Your ${monthlyContribution > 0 ? "consistent contributions are" : "savings are"} doing the heavy lifting.`;
  }

  if (years <= 3) {
    return `Solid plan. In about ${Math.round(years)} years, compound growth will contribute ${Math.round(interestPercent)}% on top of your contributions.`;
  }

  if (years <= 5) {
    return `With patience, you'll reach your goal in about ${Math.round(years)} years. Investment returns are projected to add ${formatAsCurrency(totalInterestEarned)} beyond your contributions.`;
  }

  return `This is a long-term goal spanning about ${Math.round(years)} years. Consider whether increasing your monthly contribution could shorten the timeline.`;
}

function formatAsCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}
