import {
  BASE_PART_B_PREMIUM_2026,
  IRMAA_BRACKETS_2026,
  LIFE_CHANGING_EVENTS,
  PROJECTION_GROWTH_RATE,
} from "./constants";
import type {
  BracketCliffAnalysis,
  CalculatorInputs,
  CalculatorResults,
  FilingStatus,
  IRMAABracket,
  LifeChangingEvent,
  LifeChangingEventEligibility,
  RothConversionImpact,
} from "./types";

export function calculateMAGI(
  inputs: CalculatorInputs,
  includeRothConversion: boolean
): number {
  let magi = inputs.socialSecurityIncome * 0.85;
  magi += inputs.pensionIncome;
  magi += inputs.taxExemptInterest;

  if (includeRothConversion) {
    magi += inputs.plannedRothConversion;
  }

  return Math.max(0, magi);
}

export function getIRMAABracket(
  magi: number,
  filingStatus: FilingStatus
): IRMAABracket {
  const brackets = IRMAA_BRACKETS_2026[filingStatus];

  for (const bracket of brackets) {
    if (magi >= bracket.min && magi <= bracket.max) {
      const totalMonthlySurcharge =
        bracket.partBSurcharge + bracket.partDSurcharge;
      return {
        minIncome: bracket.min,
        maxIncome: bracket.max,
        partBPremium: BASE_PART_B_PREMIUM_2026 + bracket.partBSurcharge,
        partBSurcharge: bracket.partBSurcharge,
        partDSurcharge: bracket.partDSurcharge,
        totalMonthlySurcharge,
        annualSurcharge: totalMonthlySurcharge * 12,
      };
    }
  }

  const fallback = brackets[brackets.length - 1];
  const totalMonthlySurcharge =
    fallback.partBSurcharge + fallback.partDSurcharge;

  return {
    minIncome: fallback.min,
    maxIncome: fallback.max,
    partBPremium: BASE_PART_B_PREMIUM_2026 + fallback.partBSurcharge,
    partBSurcharge: fallback.partBSurcharge,
    partDSurcharge: fallback.partDSurcharge,
    totalMonthlySurcharge,
    annualSurcharge: totalMonthlySurcharge * 12,
  };
}

export function calculateRothConversionImpact(
  inputs: CalculatorInputs
): RothConversionImpact {
  const magiWithout = calculateMAGI(inputs, false);
  const magiWith = calculateMAGI(inputs, true);

  const bracketWithout = getIRMAABracket(magiWithout, inputs.filingStatus);
  const bracketWith = getIRMAABracket(magiWith, inputs.filingStatus);

  const annualWithout = bracketWithout.annualSurcharge;
  const annualWith = bracketWith.annualSurcharge;
  const additionalCost = annualWith - annualWithout;

  let recommendation = "";
  if (additionalCost === 0) {
    recommendation = "This Roth conversion won't trigger additional IRMAA.";
  } else if (additionalCost < 1000) {
    recommendation =
      "Minor IRMAA impact. May still be worth converting for long-term tax benefits.";
  } else if (additionalCost < 5000) {
    recommendation =
      "Moderate IRMAA impact. Consider splitting conversion across multiple years.";
  } else {
    recommendation =
      "Significant IRMAA impact. Strongly consider smaller conversions over multiple years.";
  }

  return {
    withoutConversion: { magi: magiWithout, annualIRMAA: annualWithout },
    withConversion: { magi: magiWith, annualIRMAA: annualWith },
    additionalCost,
    recommendation,
  };
}

export function analyzeBracketCliff(
  magi: number,
  filingStatus: FilingStatus
): BracketCliffAnalysis {
  const brackets = IRMAA_BRACKETS_2026[filingStatus];
  const currentBracket = getIRMAABracket(magi, filingStatus);

  const nextBracketIndex = brackets.findIndex((bracket) => bracket.min > magi);
  if (nextBracketIndex === -1) {
    return {
      currentBracket,
      nextBracket: currentBracket,
      incomeUntilNextBracket: 0,
      costOfCrossingBracket: 0,
    };
  }

  const nextBracketRaw = brackets[nextBracketIndex];
  const nextBracket = getIRMAABracket(nextBracketRaw.min, filingStatus);

  const incomeUntilNextBracket = nextBracketRaw.min - magi;
  const costOfCrossingBracket =
    nextBracket.annualSurcharge - currentBracket.annualSurcharge;

  return {
    currentBracket,
    nextBracket,
    incomeUntilNextBracket: Math.max(0, incomeUntilNextBracket),
    costOfCrossingBracket,
  };
}

export function checkLifeChangingEventEligibility(
  event: LifeChangingEvent,
  currentMAGI: number,
  filingStatus: FilingStatus
): LifeChangingEventEligibility {
  if (event === "none") {
    return {
      eligible: false,
      eventType: "None",
      potentialSavings: 0,
      howToAppeal: "",
    };
  }

  const currentBracket = getIRMAABracket(currentMAGI, filingStatus);
  const eventDescription =
    LIFE_CHANGING_EVENTS.find((item) => item.code === event)?.description ??
    event;

  return {
    eligible: true,
    eventType: eventDescription,
    potentialSavings: currentBracket.annualSurcharge,
    howToAppeal:
      "File SSA-44 form with Social Security. Include documentation of the life-changing event and proof of reduced income.",
  };
}

export function generateStrategies(inputs: CalculatorInputs): string[] {
  const strategies: string[] = [];

  const bracket = getIRMAABracket(inputs.magi2024, inputs.filingStatus);

  if (bracket.partBSurcharge > 0) {
    strategies.push(
      "You're currently paying IRMAA surcharges. Consider income reduction strategies."
    );
  }

  if (inputs.traditionalBalance > 500000) {
    strategies.push(
      "With a significant traditional IRA/401(k) balance, consider spreading Roth conversions over multiple years to manage IRMAA impact."
    );
  }

  const cliffAnalysis = analyzeBracketCliff(inputs.magi2024, inputs.filingStatus);
  if (
    cliffAnalysis.incomeUntilNextBracket < 10000 &&
    cliffAnalysis.incomeUntilNextBracket > 0
  ) {
    strategies.push(
      `You're only $${cliffAnalysis.incomeUntilNextBracket.toLocaleString()} from the next IRMAA bracket, which would cost an additional $${cliffAnalysis.costOfCrossingBracket.toLocaleString()}/year.`
    );
  }

  if (inputs.taxExemptInterest > 0) {
    strategies.push(
      "Remember: Tax-exempt interest is included in MAGI for IRMAA. Factor this in before buying municipal bonds."
    );
  }

  if (inputs.lifeChangingEvent !== "none") {
    strategies.push(
      "You may be eligible to appeal your IRMAA determination based on a life-changing event. File Form SSA-44."
    );
  }

  strategies.push(
    "Consider qualified charitable distributions (QCDs) from IRAs after age 70½ to reduce MAGI."
  );
  strategies.push(
    "Time large income events (property sales, Roth conversions) to avoid IRMAA bracket cliffs."
  );

  return strategies;
}

export function calculate(inputs: CalculatorInputs): CalculatorResults {
  const currentBracket = getIRMAABracket(inputs.magi2024, inputs.filingStatus);
  const projectedBracket = getIRMAABracket(inputs.magi2025, inputs.filingStatus);

  const current2026 = {
    bracket: currentBracket,
    magi: inputs.magi2024,
    monthlyPartB: currentBracket.partBPremium,
    monthlyPartD: currentBracket.partDSurcharge,
    totalMonthlyCost: currentBracket.partBPremium + currentBracket.partDSurcharge,
    annualCost:
      (currentBracket.partBPremium + currentBracket.partDSurcharge) * 12,
    surchargeAmount: currentBracket.annualSurcharge,
  };

  const projected2027 = {
    bracket: projectedBracket,
    magi: inputs.magi2025,
    monthlyPartB: projectedBracket.partBPremium,
    monthlyPartD: projectedBracket.partDSurcharge,
    totalMonthlyCost:
      projectedBracket.partBPremium + projectedBracket.partDSurcharge,
    annualCost:
      (projectedBracket.partBPremium + projectedBracket.partDSurcharge) * 12,
    surchargeAmount: projectedBracket.annualSurcharge,
  };

  const rothConversionImpact = calculateRothConversionImpact(inputs);
  const bracketCliffAnalysis = analyzeBracketCliff(
    inputs.magi2024,
    inputs.filingStatus
  );

  const lifeChangingEventEligibility = checkLifeChangingEventEligibility(
    inputs.lifeChangingEvent,
    inputs.magi2024,
    inputs.filingStatus
  );

  const fiveYearProjection = Array.from({ length: 5 }, (_, index) => {
    const year = 2026 + index;
    let projectedMAGI = inputs.magi2024;

    if (year === 2027) {
      projectedMAGI = inputs.magi2025;
    } else if (year > 2027) {
      const yearsAfter2027 = year - 2027;
      projectedMAGI =
        inputs.magi2025 *
        Math.pow(1 + PROJECTION_GROWTH_RATE, yearsAfter2027);
    }

    const bracket = getIRMAABracket(projectedMAGI, inputs.filingStatus);

    return {
      year,
      projectedMAGI,
      projectedIRMAA: bracket.annualSurcharge,
    };
  });

  return {
    current2026,
    projected2027,
    rothConversionImpact,
    bracketCliffAnalysis,
    lifeChangingEventEligibility,
    strategies: generateStrategies(inputs),
    fiveYearProjection,
  };
}
