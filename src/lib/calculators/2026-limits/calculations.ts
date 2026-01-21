import {
  IRA_PHASEOUTS_2026,
  KEY_DATES_2026,
  LIMITS_2026,
  MANDATORY_ROTH_CATCHUP_INCOME,
  YEAR_OVER_YEAR_ACCOUNTS,
} from "./constants";
import { formatCurrency } from "@/lib/shared/formatters";
import type {
  ContributionLimit,
  FilingStatus,
  LimitsInputs,
  LimitsResults,
} from "./types";

const MONTHS_IN_YEAR = 12;

const filingStatusMap: Record<FilingStatus, "single" | "married"> = {
  single: "single",
  married: "married",
  head_of_household: "single",
};

function getCatchUpLimit(age: number, accountType: string): number {
  if (age < 50) return 0;

  switch (accountType) {
    case "401k":
    case "403b":
    case "457":
    case "solo401k":
      if (age >= 60 && age <= 63) return LIMITS_2026.catchUp60to63;
      return LIMITS_2026.catchUp50Plus;
    case "IRA":
      return LIMITS_2026.iraCatchUp50Plus;
    case "HSA":
      if (age >= 55) return LIMITS_2026.hsaCatchUp55Plus;
      return 0;
    case "SIMPLE":
      if (age >= 60 && age <= 63) return LIMITS_2026.simpleCatchUp60to63;
      return LIMITS_2026.simpleCatchUp50Plus;
    default:
      return 0;
  }
}

function buildLimit({
  accountType,
  baseLimit,
  catchUpLimit,
  notes = [],
  incomePhaseOut,
}: {
  accountType: string;
  baseLimit: number;
  catchUpLimit: number;
  notes?: string[];
  incomePhaseOut?: ContributionLimit["incomePhaseOut"];
}): ContributionLimit {
  const totalLimit = baseLimit + catchUpLimit;
  const yourLimit = totalLimit;

  return {
    accountType,
    baseLimit,
    catchUpLimit,
    totalLimit,
    yourLimit,
    monthlyToMax: yourLimit / MONTHS_IN_YEAR,
    notes,
    incomePhaseOut,
  };
}

function calculateIRALimit(
  income: number,
  filingStatus: FilingStatus,
  age: number,
  accountType: "traditional" | "roth",
  coveredByWorkplacePlan: boolean
): ContributionLimit {
  const baseLimit = LIMITS_2026.iraLimit;
  const catchUp = getCatchUpLimit(age, "IRA");
  const fullLimit = baseLimit + catchUp;
  const statusKey = filingStatusMap[filingStatus];

  if (accountType === "traditional" && !coveredByWorkplacePlan) {
    return {
      accountType: "Traditional IRA",
      baseLimit,
      catchUpLimit: catchUp,
      totalLimit: fullLimit,
      yourLimit: fullLimit,
      monthlyToMax: fullLimit / MONTHS_IN_YEAR,
      notes: ["Full deduction available (not covered by workplace plan)."],
    };
  }

  const phaseOut =
    accountType === "roth"
      ? IRA_PHASEOUTS_2026.roth[statusKey]
      : IRA_PHASEOUTS_2026.traditional[statusKey];

  if (income <= phaseOut.start) {
    return {
      accountType: accountType === "roth" ? "Roth IRA" : "Traditional IRA",
      baseLimit,
      catchUpLimit: catchUp,
      totalLimit: fullLimit,
      yourLimit: fullLimit,
      monthlyToMax: fullLimit / MONTHS_IN_YEAR,
      notes: ["Full contribution allowed."],
      incomePhaseOut: {
        startPhaseOut: phaseOut.start,
        completePhaseOut: phaseOut.end,
        yourStatus: "full",
      },
    };
  }

  if (income >= phaseOut.end) {
    return {
      accountType: accountType === "roth" ? "Roth IRA" : "Traditional IRA",
      baseLimit,
      catchUpLimit: catchUp,
      totalLimit: fullLimit,
      yourLimit: 0,
      monthlyToMax: 0,
      notes:
        accountType === "roth"
          ? [
              "Income too high for direct Roth contribution.",
              "Consider a Backdoor Roth IRA strategy.",
            ]
          : [
              "Contribution not deductible.",
              "Consider non-deductible contribution + conversion.",
            ],
      incomePhaseOut: {
        startPhaseOut: phaseOut.start,
        completePhaseOut: phaseOut.end,
        yourStatus: "none",
      },
    };
  }

  const phaseOutRange = phaseOut.end - phaseOut.start;
  const incomeOverStart = income - phaseOut.start;
  const reductionRatio = incomeOverStart / phaseOutRange;
  const reducedLimit = Math.round((fullLimit * (1 - reductionRatio)) / 10) * 10;

  return {
    accountType: accountType === "roth" ? "Roth IRA" : "Traditional IRA",
    baseLimit,
    catchUpLimit: catchUp,
    totalLimit: fullLimit,
    yourLimit: reducedLimit,
    monthlyToMax: reducedLimit / MONTHS_IN_YEAR,
    notes: ["Partial contribution due to income phase-out."],
    incomePhaseOut: {
      startPhaseOut: phaseOut.start,
      completePhaseOut: phaseOut.end,
      yourStatus: "reduced",
    },
  };
}

function get401kNotes(age: number, income: number): string[] {
  const notes = [
    `Total 415(c) annual additions cap: ${formatCurrency(LIMITS_2026.total415Limit)}.`,
    `Potential after-tax 401(k) room (mega backdoor): ${formatCurrency(
      LIMITS_2026.total415Limit - LIMITS_2026.deferral401k
    )}.`,
  ];

  if (age >= 60 && age <= 63) {
    notes.push("Super catch-up applies for ages 60-63.");
  }

  if (age >= 50 && income > MANDATORY_ROTH_CATCHUP_INCOME) {
    notes.push("Catch-up contributions must be Roth for incomes above $150k.");
  }

  return notes;
}

function getStrategy(inputs: LimitsInputs, totalMax: number): string[] {
  const strategies: string[] = [];
  const { age, annualIncome, accounts } = inputs;

  if (totalMax === 0) {
    strategies.push("Select accounts above to see your personalized max-out plan.");
    return strategies;
  }

  if (age >= 60 && age <= 63) {
    strategies.push("You qualify for the 2026 super catch-up boost on 401(k)/403(b)/457/SIMPLE plans.");
  } else if (age >= 50) {
    strategies.push("Catch-up contributions are available for retirement accounts starting at age 50.");
  }

  if (accounts.hasHSA) {
    strategies.push("Max the HSA first for triple-tax savings, then focus on retirement accounts.");
  }

  if (accounts.has401k || accounts.has403b || accounts.hasSimpleIRA) {
    strategies.push("Secure any employer match before funding other accounts.");
  }

  if (annualIncome > MANDATORY_ROTH_CATCHUP_INCOME && age >= 50) {
    strategies.push("If you use catch-up contributions, plan for mandatory Roth treatment above $150k income.");
  }

  if (accounts.hasRothIRA) {
    strategies.push("Keep an eye on Roth IRA income phase-outs; backdoor options may help.");
  }

  if (accounts.hasFSA) {
    strategies.push("Align FSA elections with expected healthcare or dependent care spending to avoid forfeiture.");
  }

  if (accounts.hasSepIRA || accounts.hasSolo401k) {
    strategies.push("Self-employed? Coordinate SEP and Solo 401(k) contributions to avoid exceeding plan caps.");
  }

  if (strategies.length === 0) {
    strategies.push("Use monthly automation to stay on track with your contribution targets.");
  }

  return strategies;
}

export function calculate(inputs: LimitsInputs): LimitsResults {
  const retirement: ContributionLimit[] = [];
  const health: ContributionLimit[] = [];
  const education: ContributionLimit[] = [];

  const coveredByWorkplacePlan =
    inputs.accounts.has401k ||
    inputs.accounts.has403b ||
    inputs.accounts.has457b ||
    inputs.accounts.hasSimpleIRA;

  if (inputs.accounts.has401k) {
    retirement.push(
      buildLimit({
        accountType: "401(k)",
        baseLimit: LIMITS_2026.deferral401k,
        catchUpLimit: getCatchUpLimit(inputs.age, "401k"),
        notes: get401kNotes(inputs.age, inputs.annualIncome),
      })
    );
  }

  if (inputs.accounts.has403b) {
    retirement.push(
      buildLimit({
        accountType: "403(b)",
        baseLimit: LIMITS_2026.deferral401k,
        catchUpLimit: getCatchUpLimit(inputs.age, "403b"),
        notes: ["Same deferral limits as 401(k)."],
      })
    );
  }

  if (inputs.accounts.has457b) {
    retirement.push(
      buildLimit({
        accountType: "457(b)",
        baseLimit: LIMITS_2026.deferral401k,
        catchUpLimit: getCatchUpLimit(inputs.age, "457"),
        notes: ["Most governmental 457(b) plans follow 401(k) deferral limits."],
      })
    );
  }

  if (inputs.accounts.hasSimpleIRA) {
    retirement.push(
      buildLimit({
        accountType: "SIMPLE IRA",
        baseLimit: LIMITS_2026.simpleIRA,
        catchUpLimit: getCatchUpLimit(inputs.age, "SIMPLE"),
        notes: ["Super catch-up applies ages 60-63."],
      })
    );
  }

  if (inputs.accounts.hasSolo401k) {
    retirement.push(
      buildLimit({
        accountType: "Solo 401(k) employee deferral",
        baseLimit: LIMITS_2026.solo401kEmployee,
        catchUpLimit: getCatchUpLimit(inputs.age, "solo401k"),
        notes: ["Employee deferral portion of Solo 401(k)."],
      })
    );

    retirement.push(
      buildLimit({
        accountType: "Solo 401(k) total annual additions",
        baseLimit: LIMITS_2026.solo401kTotal,
        catchUpLimit: 0,
        notes: ["Includes employer profit-sharing; employee deferrals count toward the total.", "Catch-up contributions may allow totals above this cap."],
      })
    );
  }

  if (inputs.accounts.hasSepIRA) {
    const sepCap = Math.min(LIMITS_2026.sepIRA, inputs.annualIncome * 0.25);
    retirement.push({
      accountType: "SEP IRA",
      baseLimit: LIMITS_2026.sepIRA,
      catchUpLimit: 0,
      totalLimit: LIMITS_2026.sepIRA,
      yourLimit: sepCap,
      monthlyToMax: sepCap / MONTHS_IN_YEAR,
      notes: ["Limited to 25% of compensation; your cap uses 25% of income."],
    });
  }

  const iraLimits: ContributionLimit[] = [];

  if (inputs.accounts.hasTraditionalIRA) {
    iraLimits.push(
      calculateIRALimit(
        inputs.annualIncome,
        inputs.filingStatus,
        inputs.age,
        "traditional",
        coveredByWorkplacePlan
      )
    );
  }

  if (inputs.accounts.hasRothIRA) {
    iraLimits.push(
      calculateIRALimit(
        inputs.annualIncome,
        inputs.filingStatus,
        inputs.age,
        "roth",
        coveredByWorkplacePlan
      )
    );
  }

  if (iraLimits.length > 0) {
    const combinedCap = Math.max(...iraLimits.map((limit) => limit.yourLimit));
    const combinedNote = `Combined IRA limit across Traditional + Roth is capped at ${formatCurrency(
      combinedCap
    )}.`;
    iraLimits.forEach((limit) => {
      limit.notes = [...limit.notes, combinedNote];
    });
    retirement.push(...iraLimits);
  }

  if (inputs.accounts.hasHSA) {
    const baseLimit =
      inputs.accounts.hsaCoverageType === "family"
        ? LIMITS_2026.hsaFamily
        : LIMITS_2026.hsaSelf;
    const catchUp = getCatchUpLimit(inputs.age, "HSA");

    health.push(
      buildLimit({
        accountType: `HSA (${inputs.accounts.hsaCoverageType === "family" ? "family" : "self-only"})`,
        baseLimit,
        catchUpLimit: catchUp,
        notes: ["Catch-up available at age 55+.", "Must be enrolled in an HSA-qualified HDHP."],
      })
    );
  }

  if (inputs.accounts.hasFSA) {
    health.push(
      buildLimit({
        accountType: "Health FSA",
        baseLimit: LIMITS_2026.healthFSA,
        catchUpLimit: 0,
        notes: ["Use-it-or-lose-it rules may apply."],
      })
    );

    health.push(
      buildLimit({
        accountType: "Dependent Care FSA",
        baseLimit: LIMITS_2026.dependentCareFSA,
        catchUpLimit: 0,
        notes: ["$2,500 limit if married filing separately."],
      })
    );
  }

  education.push({
    accountType: "Coverdell ESA",
    baseLimit: LIMITS_2026.coverdell,
    catchUpLimit: 0,
    totalLimit: LIMITS_2026.coverdell,
    yourLimit: LIMITS_2026.coverdell,
    monthlyToMax: LIMITS_2026.coverdell / MONTHS_IN_YEAR,
    notes: ["Limit is per beneficiary."],
  });

  education.push({
    accountType: "529 Plan",
    baseLimit: 0,
    catchUpLimit: 0,
    totalLimit: 0,
    yourLimit: 0,
    monthlyToMax: 0,
    notes: ["No federal contribution limit; state rules apply."],
  });

  const eligibleLimits = [...retirement, ...health].filter((limit) => limit.yourLimit > 0);
  const totalMaxContributions = eligibleLimits.reduce(
    (total, limit) => total + limit.yourLimit,
    0
  );

  const monthlyToMaxAll = totalMaxContributions / MONTHS_IN_YEAR;

  const yearOverYear = YEAR_OVER_YEAR_ACCOUNTS.map((entry) => {
    const limit2025 = Number(entry.limit2025);
    const limit2026 = Number(entry.limit2026);
    const change = limit2026 - limit2025;
    const percentChange = limit2025 === 0 ? 0 : change / limit2025;
    return {
      accountType: entry.accountType,
      limit2025,
      limit2026,
      change,
      percentChange,
    };
  });

  return {
    limits: {
      retirement,
      health,
      education,
    },
    totalMaxContributions,
    monthlyToMaxAll,
    keyDates: [...KEY_DATES_2026],
    yearOverYear,
    personalizedStrategy: getStrategy(inputs, totalMaxContributions),
  };
}
