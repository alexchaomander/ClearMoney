import type {
  CreditProfile,
  SimulationAction,
  SimulationResult,
  FactorStatus,
} from "./types";

const IMPACT_RANGES = {
  utilization: {
    above50ToBelow30: { min: 20, max: 50 },
    above30ToBelow10: { min: 10, max: 30 },
    above10ToBelow1: { min: 5, max: 15 },
  },
  newAccount: {
    hardInquiry: { min: -5, max: -10 },
    newAccountAgeImpact: { min: -5, max: -15 },
    utilizationBenefit: { min: 0, max: 30 },
  },
  missedPayment: {
    first: { min: -60, max: -110 },
    subsequent: { min: -40, max: -80 },
  },
  closingAccount: {
    utilizationImpact: { min: -10, max: -50 },
    ageImpact: { min: -5, max: -20 },
  },
  authorizedUser: {
    goodAccount: { min: 10, max: 40 },
    badAccount: { min: -20, max: -50 },
  },
};

export function analyzeProfile(profile: CreditProfile): FactorStatus[] {
  const utilization =
    profile.totalCreditLimit > 0
      ? profile.currentBalance / profile.totalCreditLimit
      : 0;

  const factors: FactorStatus[] = [
    {
      name: "Payment History",
      weight: 35,
      status:
        profile.missedPayments === 0
          ? "excellent"
          : profile.missedPayments <= 1
            ? "good"
            : profile.missedPayments <= 3
              ? "fair"
              : "poor",
      currentValue:
        profile.missedPayments === 0
          ? "Perfect"
          : `${profile.missedPayments} missed`,
      description:
        profile.missedPayments === 0
          ? "Perfect payment history—keep it up!"
          : "Missed payments hurt your score significantly.",
    },
    {
      name: "Credit Utilization",
      weight: 30,
      status:
        utilization < 0.1
          ? "excellent"
          : utilization < 0.3
            ? "good"
            : utilization < 0.5
              ? "fair"
              : "poor",
      currentValue: `${(utilization * 100).toFixed(0)}%`,
      description:
        utilization < 0.1
          ? "Excellent! Under 10% utilization."
          : utilization < 0.3
            ? "Good. Aim for under 10% for best scores."
            : "High utilization hurts your score. Pay down balances.",
    },
    {
      name: "Credit Age",
      weight: 15,
      status:
        profile.oldestAccountYears >= 10
          ? "excellent"
          : profile.oldestAccountYears >= 5
            ? "good"
            : profile.oldestAccountYears >= 2
              ? "fair"
              : "poor",
      currentValue: `${profile.oldestAccountYears} years`,
      description:
        profile.oldestAccountYears >= 7
          ? "Established credit history."
          : "Newer credit history. Time helps this factor.",
    },
    {
      name: "Credit Mix",
      weight: 10,
      status:
        profile.totalAccounts >= 5
          ? "excellent"
          : profile.totalAccounts >= 3
            ? "good"
            : profile.totalAccounts >= 2
              ? "fair"
              : "poor",
      currentValue: `${profile.totalAccounts} accounts`,
      description:
        profile.totalAccounts >= 3
          ? "Good variety of accounts."
          : "Consider diversifying your credit mix over time.",
    },
    {
      name: "New Credit",
      weight: 10,
      status:
        profile.recentInquiries === 0
          ? "excellent"
          : profile.recentInquiries <= 2
            ? "good"
            : profile.recentInquiries <= 4
              ? "fair"
              : "poor",
      currentValue: `${profile.recentInquiries} inquiries`,
      description:
        profile.recentInquiries <= 2
          ? "Low inquiry count is good."
          : "Many recent inquiries can lower your score temporarily.",
    },
  ];

  return factors;
}

export function simulate(
  profile: CreditProfile,
  actions: SimulationAction[]
): SimulationResult {
  const factors = analyzeProfile(profile);
  const currentUtilization =
    profile.totalCreditLimit > 0
      ? profile.currentBalance / profile.totalCreditLimit
      : 0;

  let totalMinChange = 0;
  let totalMaxChange = 0;
  const actionImpacts: SimulationResult["actionImpacts"] = [];
  const warnings: string[] = [];

  for (const action of actions) {
    let impact = { min: 0, max: 0 };
    let explanation = "";

    switch (action.type) {
      case "payDownDebt": {
        const payAmount = action.params.amount || 0;
        const newBalance = Math.max(0, profile.currentBalance - payAmount);
        const newUtilization =
          profile.totalCreditLimit > 0
            ? newBalance / profile.totalCreditLimit
            : 0;

        if (currentUtilization > 0.5 && newUtilization < 0.3) {
          impact = IMPACT_RANGES.utilization.above50ToBelow30;
          explanation =
            "Dropping from 50%+ to under 30% utilization has significant positive impact.";
        } else if (currentUtilization > 0.3 && newUtilization < 0.1) {
          impact = IMPACT_RANGES.utilization.above30ToBelow10;
          explanation =
            "Getting under 10% utilization is excellent for your score.";
        } else if (newUtilization < currentUtilization) {
          impact = { min: 5, max: 20 };
          explanation = "Lower utilization generally helps your score.";
        }
        break;
      }

      case "openNewCard": {
        const newLimit = action.params.creditLimit || 5000;
        impact.min += IMPACT_RANGES.newAccount.hardInquiry.max;
        impact.max += IMPACT_RANGES.newAccount.hardInquiry.min;

        impact.min += IMPACT_RANGES.newAccount.newAccountAgeImpact.max;
        impact.max += IMPACT_RANGES.newAccount.newAccountAgeImpact.min;

        const newTotalLimit = profile.totalCreditLimit + newLimit;
        const newUtilization =
          newTotalLimit > 0 ? profile.currentBalance / newTotalLimit : 0;
        if (newUtilization < currentUtilization - 0.1) {
          impact.min += 10;
          impact.max += 30;
          explanation =
            "Short-term drop from inquiry, but lower utilization may help.";
        } else {
          explanation =
            "Expect a temporary drop from the hard inquiry and new account.";
        }

        warnings.push(
          "New cards temporarily lower your score but can help long-term."
        );
        break;
      }

      case "closeAccount": {
        const accountAge = action.params.accountAge || 3;

        if (profile.currentBalance > 0) {
          impact.min += IMPACT_RANGES.closingAccount.utilizationImpact.max;
          impact.max += IMPACT_RANGES.closingAccount.utilizationImpact.min;
        }

        if (accountAge >= profile.oldestAccountYears) {
          impact.min += -20;
          impact.max += -5;
          warnings.push(
            "Closing your oldest account can significantly hurt your credit age."
          );
          explanation = "Closing old accounts hurts your average credit age.";
        } else {
          impact.min += -10;
          impact.max += -3;
          explanation =
            "Closing accounts can raise utilization and lower average age.";
        }
        break;
      }

      case "missPayment": {
        if (profile.missedPayments === 0) {
          impact = IMPACT_RANGES.missedPayment.first;
          explanation = "First missed payment has the biggest impact.";
        } else {
          impact = IMPACT_RANGES.missedPayment.subsequent;
          explanation = "Additional missed payments continue to hurt.";
        }
        warnings.push(
          "Missing payments is the most damaging action for your credit."
        );
        break;
      }

      case "authorizedUser": {
        const auAge = action.params.accountAge || 5;
        if (auAge >= 5) {
          impact = IMPACT_RANGES.authorizedUser.goodAccount;
          explanation =
            "Becoming AU on an old, well-managed account can help.";
        } else {
          impact = { min: 5, max: 20 };
          explanation =
            "Newer authorized user accounts have modest positive impact.";
        }
        break;
      }
    }

    actionImpacts.push({
      action: formatActionName(action.type),
      impact,
      explanation,
    });

    totalMinChange += impact.min;
    totalMaxChange += impact.max;
  }

  const likelyChange = (totalMinChange + totalMaxChange) / 2;
  const estimatedNewScore = {
    min: Math.max(300, Math.min(850, profile.estimatedScore + totalMinChange)),
    max: Math.max(300, Math.min(850, profile.estimatedScore + totalMaxChange)),
    likely: Math.max(
      300,
      Math.min(850, profile.estimatedScore + likelyChange)
    ),
  };

  let recommendation: string;
  if (likelyChange > 20) {
    recommendation = "These actions could significantly improve your score!";
  } else if (likelyChange > 0) {
    recommendation = "These actions should have a modest positive effect.";
  } else if (likelyChange > -20) {
    recommendation = "These actions may have a small negative effect short-term.";
  } else {
    recommendation = "Caution: These actions could notably lower your score.";
  }

  return {
    currentScore: profile.estimatedScore,
    estimatedNewScore,
    change: {
      min: totalMinChange,
      max: totalMaxChange,
      likely: Math.round(likelyChange),
    },
    factors,
    actionImpacts,
    warnings,
    recommendation,
  };
}

function formatActionName(type: string): string {
  const names: Record<string, string> = {
    payDownDebt: "Pay Down Debt",
    openNewCard: "Open New Card",
    closeAccount: "Close Account",
    missPayment: "Miss Payment",
    authorizedUser: "Become Authorized User",
  };
  return names[type] || type;
}
