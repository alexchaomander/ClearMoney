export interface CalculatorInputs {
  portfolioValue: number;
  allocationToSell: number;
  costBasisPercent: number;
  shortTermRate: number;
  longTermRate: number;
  shortTermPortion: number;
}

export interface CalculatorResults {
  valueSold: number;
  totalGains: number;
  shortTermGains: number;
  longTermGains: number;
  shortTermTax: number;
  longTermTax: number;
  totalTax: number;
  afterTaxProceeds: number;
  breakevenDriftPercent: number;
}

export function calculate(inputs: CalculatorInputs): CalculatorResults {
  const valueSold = inputs.portfolioValue * (inputs.allocationToSell / 100);
  const costBasisRate = inputs.costBasisPercent / 100;
  const totalGains = valueSold * (1 - costBasisRate);

  const shortTermRate = inputs.shortTermRate / 100;
  const longTermRate = inputs.longTermRate / 100;
  const shortTermPortion = inputs.shortTermPortion / 100;

  const shortTermGains = totalGains * shortTermPortion;
  const longTermGains = totalGains * (1 - shortTermPortion);

  const shortTermTax = shortTermGains * shortTermRate;
  const longTermTax = longTermGains * longTermRate;
  const totalTax = shortTermTax + longTermTax;

  const afterTaxProceeds = valueSold - totalTax;
  const breakevenDriftPercent = inputs.portfolioValue
    ? (totalTax / inputs.portfolioValue) * 100
    : 0;

  return {
    valueSold,
    totalGains,
    shortTermGains,
    longTermGains,
    shortTermTax,
    longTermTax,
    totalTax,
    afterTaxProceeds,
    breakevenDriftPercent,
  };
}
