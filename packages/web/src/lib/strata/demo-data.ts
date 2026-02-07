import type {
  AllAccountsResponse,
  CashAccount,
  Connection,
  DebtAccount,
  HoldingDetail,
  HoldingWithSecurity,
  Institution,
  InvestmentAccount,
  InvestmentAccountWithHoldings,
  PortfolioHistoryPoint,
  PortfolioHistoryRange,
  PortfolioSummary,
  PointsProgram,
  CreditCardData,
  SavingsProduct,
  InvestmentData,
  RealAssetData,
  LiabilityData,
  IncomeData,
  CreditData,
  ProtectionData,
  ToolPreset,
  ToolPresetBundle,
} from "@clearmoney/strata-sdk";

const NOW = "2026-01-15T12:00:00Z";
const DEMO_USER_ID = "demo-user-001";

// === Institutions ===

export const DEMO_INSTITUTIONS: Institution[] = [
  {
    id: "demo-inst-fidelity",
    name: "Fidelity Investments",
    logo_url: null,
    providers: null,
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: "demo-inst-vanguard",
    name: "Vanguard",
    logo_url: null,
    providers: null,
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: "demo-inst-schwab",
    name: "Charles Schwab",
    logo_url: null,
    providers: null,
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: "demo-inst-chase",
    name: "Chase",
    logo_url: null,
    providers: null,
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: "demo-inst-robinhood",
    name: "Robinhood",
    logo_url: null,
    providers: null,
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: "demo-inst-wealthfront",
    name: "Wealthfront",
    logo_url: null,
    providers: null,
    created_at: NOW,
    updated_at: NOW,
  },
];

// === Connections ===

export const DEMO_CONNECTIONS: Connection[] = [
  {
    id: "demo-conn-001",
    user_id: DEMO_USER_ID,
    institution_id: "demo-inst-fidelity",
    provider: "snaptrade",
    provider_user_id: "demo-provider-001",
    status: "active",
    last_synced_at: NOW,
    error_code: null,
    error_message: null,
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: "demo-conn-002",
    user_id: DEMO_USER_ID,
    institution_id: "demo-inst-vanguard",
    provider: "snaptrade",
    provider_user_id: "demo-provider-002",
    status: "active",
    last_synced_at: NOW,
    error_code: null,
    error_message: null,
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: "demo-conn-003",
    user_id: DEMO_USER_ID,
    institution_id: "demo-inst-schwab",
    provider: "snaptrade",
    provider_user_id: "demo-provider-003",
    status: "active",
    last_synced_at: NOW,
    error_code: null,
    error_message: null,
    created_at: NOW,
    updated_at: NOW,
  },
];

// === Investment Accounts ===

export const DEMO_INVESTMENT_ACCOUNTS: InvestmentAccount[] = [
  {
    id: "demo-acc-001",
    user_id: DEMO_USER_ID,
    connection_id: "demo-conn-001",
    institution_id: "demo-inst-fidelity",
    institution_name: "Fidelity Investments",
    name: "Fidelity 401(k)",
    account_type: "401k",
    provider_account_id: "demo-prov-acc-001",
    balance: 451415.0,
    currency: "USD",
    is_tax_advantaged: true,
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: "demo-acc-002",
    user_id: DEMO_USER_ID,
    connection_id: "demo-conn-002",
    institution_id: "demo-inst-vanguard",
    institution_name: "Vanguard",
    name: "Vanguard Roth IRA",
    account_type: "roth_ira",
    provider_account_id: "demo-prov-acc-002",
    balance: 215250.0,
    currency: "USD",
    is_tax_advantaged: true,
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: "demo-acc-003",
    user_id: DEMO_USER_ID,
    connection_id: "demo-conn-003",
    institution_id: "demo-inst-schwab",
    institution_name: "Charles Schwab",
    name: "Schwab Individual Brokerage",
    account_type: "brokerage",
    provider_account_id: "demo-prov-acc-003",
    balance: 197365.0,
    currency: "USD",
    is_tax_advantaged: false,
    created_at: NOW,
    updated_at: NOW,
  },
];

// === Cash Accounts ===

export const DEMO_CASH_ACCOUNTS: CashAccount[] = [
  {
    id: "demo-cash-001",
    user_id: DEMO_USER_ID,
    name: "Chase Total Checking",
    account_type: "checking",
    balance: 12340.0,
    apy: 0.01,
    institution_name: "Chase",
    connection_id: null,
    provider_account_id: null,
    available_balance: null,
    mask: null,
    is_manual: true,
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: "demo-cash-002",
    user_id: DEMO_USER_ID,
    name: "Marcus Online Savings",
    account_type: "savings",
    balance: 45000.0,
    apy: 4.1,
    institution_name: "Goldman Sachs",
    connection_id: null,
    provider_account_id: null,
    available_balance: null,
    mask: null,
    is_manual: true,
    created_at: NOW,
    updated_at: NOW,
  },
];

// === Debt Accounts ===

export const DEMO_DEBT_ACCOUNTS: DebtAccount[] = [
  {
    id: "demo-debt-001",
    user_id: DEMO_USER_ID,
    name: "Chase Sapphire Reserve",
    debt_type: "credit_card",
    balance: 3245.0,
    interest_rate: 21.49,
    minimum_payment: 89.0,
    institution_name: "Chase",
    created_at: NOW,
    updated_at: NOW,
  },
];

// === Shared Data ===

export const DEMO_LIQUID_ASSETS: SavingsProduct[] = [
  {
    id: "demo-hysa",
    name: "Demo High-Yield Savings",
    provider: "ClearMoney Bank",
    product_type: "savings",
    apy: 4.2,
    minimum_balance: 0,
    monthly_fee: 0,
    fdic_insured: true,
    last_updated: NOW,
    notes: "Baseline HYSA rate for demos.",
  },
];

export const DEMO_INVESTMENT_DATA: InvestmentData = {
  last_updated: NOW,
  contribution_limits: [
    {
      id: "401k",
      account_type: "401k",
      year: 2026,
      base_limit: 24500,
      catch_up_50: 8000,
      catch_up_60_63: 11250,
      notes: "Employee deferral limit.",
    },
  ],
  market_assumptions: [
    {
      id: "us_stocks",
      name: "US Stocks",
      expected_return: 0.07,
      volatility: 0.15,
      inflation: 0.025,
      notes: "Long-run equity assumption.",
    },
  ],
};

export const DEMO_REAL_ASSET_DATA: RealAssetData = {
  last_updated: NOW,
  mortgage_rates: [
    {
      id: "30yr-fixed",
      loan_type: "fixed",
      term_years: 30,
      rate: 0.068,
      points: 0,
      notes: "Demo mortgage rate.",
    },
  ],
  home_price_assumptions: [
    {
      id: "national-appreciation",
      name: "National Home Price Growth",
      appreciation_rate: 0.03,
      notes: "Long-run assumption.",
    },
  ],
};

export const DEMO_LIABILITY_DATA: LiabilityData = {
  last_updated: NOW,
  loan_rates: [
    {
      id: "credit-card",
      loan_type: "credit_card",
      rate: 0.219,
      term_years: null,
      notes: "Average credit card APR.",
    },
  ],
};

export const DEMO_INCOME_DATA: IncomeData = {
  last_updated: NOW,
  tax_brackets: [
    {
      id: "single-2026",
      year: 2026,
      filing_status: "single",
      brackets: [
        { rate: 0.1, cap: 11950 },
        { rate: 0.12, cap: 48500 },
        { rate: 0.22, cap: 103500 },
        { rate: 0.24, cap: 198500 },
        { rate: 0.32, cap: 252000 },
        { rate: 0.35, cap: 616000 },
        { rate: 0.37, cap: null },
      ],
    },
  ],
  standard_deductions: [
    { year: 2026, filing_status: "single", amount: 14600 },
  ],
  payroll_limits: [
    { year: 2026, social_security_wage_base: 174000, medicare_additional_threshold: 200000 },
  ],
};

export const DEMO_CREDIT_DATA: CreditData = {
  last_updated: NOW,
  score_factors: [
    { id: "payment_history", name: "Payment History", weight: 0.35, description: "On-time payments." },
    { id: "utilization", name: "Utilization", weight: 0.3, description: "Balance-to-limit ratio." },
  ],
  utilization_guidelines: [
    { label: "Excellent", min: 0, max: 10, notes: "Best range." },
    { label: "Good", min: 10, max: 30, notes: "Healthy range." },
  ],
};

export const DEMO_PROTECTION_DATA: ProtectionData = {
  last_updated: NOW,
  insurance_estimates: [
    {
      id: "term-life",
      name: "Term Life Insurance",
      coverage_multiple_income: 10,
      typical_cost_pct_income: 0.005,
      notes: "Typical starting point.",
    },
  ],
};

const RAW_TOOL_PRESETS: Omit<ToolPreset, "updated_at">[] = [
    {
      "tool_id": "annual-fee-analyzer",
      "defaults": {
        "annualFee": 550,
        "annualSpending": 30000,
        "rewardsRate": 2.0,
        "totalCredits": 300,
        "creditUtilization": 50,
        "pointsValueCpp": 1.0
      }
    },
    {
      "tool_id": "amex-comparison",
      "defaults": {
        "spending": {
          "dining": 500,
          "groceries": 600,
          "flights": 200,
          "hotels": 100,
          "other": 1000
        },
        "creditUsage": {
          "uberCreditUsage": 80,
          "diningCreditUsage": 70,
          "airlineFeeUsage": 50,
          "hotelCreditUsage": 50,
          "entertainmentUsage": 60,
          "saksUsage": 30
        },
        "preferences": {
          "valuesLoungeAccess": false,
          "flightsPerYear": 6,
          "pointsValue": 1.2
        }
      }
    },
    {
      "tool_id": "tpg-transparency",
      "defaults": {
        "selectedCard": "sapphire-preferred",
        "spending": {
          "dining": 400,
          "travel": 200,
          "groceries": 500,
          "other": 1500
        },
        "redemptionStyle": "cashBack"
      }
    },
    {
      "tool_id": "chase-trifecta",
      "defaults": {
        "pointsValue": 1.25,
        "spending": {
          "dining": 400,
          "groceries": 600,
          "gas": 150,
          "travel": 200,
          "streaming": 50,
          "drugstores": 50,
          "other": 1500
        },
        "cards": {
          "hasSapphirePreferred": false,
          "hasSapphireReserve": true,
          "hasFreedomFlex": true,
          "hasFreedomUnlimited": true
        }
      }
    },
    {
      "tool_id": "points-valuation",
      "defaults": {
        "holdings": {
          "chase-ur": 0,
          "amex-mr": 0,
          "citi-ty": 0,
          "capital-one": 0,
          "marriott": 0,
          "hilton": 0,
          "hyatt": 0
        },
        "redemptionStyle": "conservative"
      }
    },
    {
      "tool_id": "bilt-calculator",
      "defaults": {
        "rent": 3000,
        "dining": 500,
        "grocery": 500,
        "travel": 500,
        "misc": 750,
        "mode": "Multiplier",
        "timeframe": "year1"
      }
    },
    {
      "tool_id": "conscious-spending",
      "defaults": {
        "monthlyIncome": 5000,
        "fixedCosts": 2500,
        "investments": 500,
        "savings": 300,
        "guiltFree": 700,
        "moneyDials": []
      }
    },
    {
      "tool_id": "dividend-tracker",
      "defaults": {
        "portfolioValue": 50000,
        "dividendYield": 3.0,
        "monthlyContribution": 500,
        "dividendGrowthRate": 6,
        "reinvestDividends": true,
        "monthlyExpenses": 4000,
        "yearsToProject": 20
      }
    },
    {
      "tool_id": "investment-growth",
      "defaults": {
        "initialInvestment": 20000,
        "monthlyContribution": 600,
        "investmentHorizon": 25,
        "annualReturnRate": 7,
        "inflationRate": 2.5
      }
    },
    {
      "tool_id": "fire-calculator",
      "defaults": {
        "annualIncome": 100000,
        "annualExpenses": 60000,
        "currentSavings": 85000,
        "expectedReturn": 6.5,
        "withdrawalRate": 4
      }
    },
    {
      "tool_id": "savings-goal",
      "defaults": {
        "goalAmount": 25000,
        "currentSavings": 2000,
        "monthlyContribution": 500,
        "annualReturnRate": 5
      }
    },
    {
      "tool_id": "debt-destroyer",
      "defaults": {
        "debts": [
          {
            "id": "preset-cc",
            "name": "Credit Card",
            "balance": 6500,
            "interestRate": 21.9,
            "minimumPayment": 200
          },
          {
            "id": "preset-auto",
            "name": "Auto Loan",
            "balance": 18000,
            "interestRate": 7.1,
            "minimumPayment": 375
          }
        ],
        "extraPayment": 250
      }
    },
    {
      "tool_id": "student-loan-strategy",
      "defaults": {
        "loanBalance": 28000,
        "interestRate": 6.2,
        "loanType": "direct",
        "annualIncome": 65000,
        "incomeGrowthRate": 3,
        "filingStatus": "single",
        "familySize": 1,
        "state": "CA",
        "yearsInRepayment": 0,
        "pslfEligible": false,
        "pslfPaymentsMade": 0,
        "hasParentPlus": false
      }
    },
    {
      "tool_id": "credit-score-simulator",
      "defaults": {
        "profile": {
          "estimatedScore": 700,
          "totalCreditLimit": 20000,
          "currentBalance": 3000,
          "oldestAccountYears": 5,
          "totalAccounts": 4,
          "recentInquiries": 1,
          "missedPayments": 0
        }
      }
    },
    {
      "tool_id": "mortgage",
      "defaults": {
        "homePrice": 600000,
        "downPaymentPercent": 20,
        "loanTermYears": 30,
        "interestRate": 6.8,
        "propertyTaxRate": 1.1,
        "homeInsurance": 1800,
        "pmiRate": 0.5
      }
    },
    {
      "tool_id": "home-affordability",
      "defaults": {
        "annualIncome": 120000,
        "monthlyDebt": 500,
        "downPaymentSaved": 80000,
        "targetDownPaymentPercent": 20,
        "currentRent": 2000,
        "mortgageRate": 6.8,
        "propertyTaxRate": 1.1,
        "hoa": 0,
        "riskTolerance": "moderate"
      }
    },
    {
      "tool_id": "rent-vs-buy",
      "defaults": {
        "monthlyRent": 2000,
        "annualRentIncrease": 3,
        "homePrice": 400000,
        "downPaymentPercent": 20,
        "mortgageRate": 6.5,
        "loanTermYears": 30,
        "propertyTaxRate": 1.2,
        "homeAppreciationRate": 3,
        "maintenanceRate": 1,
        "investmentReturnRate": 7,
        "timeHorizon": 10
      }
    },
    {
      "tool_id": "capital-gains",
      "defaults": {
        "purchasePrice": 15000,
        "salePrice": 32000,
        "holdingPeriod": "long",
        "filingStatus": "single",
        "annualIncome": 90000,
        "state": "CA"
      }
    },
    {
      "tool_id": "tax-bracket-optimizer",
      "defaults": {
        "filingStatus": "single",
        "income": {
          "wagesIncome": 150000
        },
        "deductions": {
          "deductionType": "standard"
        },
        "scenario": {
          "rothConversionAmount": 0,
          "additionalIncome": 0,
          "additionalDeduction": 0
        }
      }
    },
    {
      "tool_id": "obbb-tax-optimizer",
      "defaults": {
        "filingStatus": "single",
        "age": 40,
        "spouseAge": 40,
        "modifiedAGI": 75000,
        "annualTips": 0,
        "annualOvertime": 0,
        "carLoanInterest": 0,
        "saltPaid": 10000,
        "otherItemized": 0,
        "marginalRate": 0.22
      }
    },
    {
      "tool_id": "2026-limits",
      "defaults": {
        "age": 35,
        "filingStatus": "single",
        "annualIncome": 100000,
        "accounts": {
          "has401k": true,
          "hasTraditionalIRA": true,
          "hasRothIRA": true,
          "hasHSA": true,
          "hsaCoverageType": "family",
          "hasFSA": false,
          "hasSimpleIRA": false,
          "has403b": false,
          "has457b": false,
          "hasSolo401k": false,
          "hasSepIRA": false
        }
      }
    },
    {
      "tool_id": "backdoor-roth",
      "defaults": {
        "income": 200000,
        "filingStatus": "single",
        "hasWorkplacePlan": true,
        "traditionalIRABalance": 0,
        "sepIRABalance": 0,
        "simpleIRABalance": 0,
        "contributionAmount": 7000,
        "age": 35
      }
    },
    {
      "tool_id": "mega-backdoor-roth",
      "defaults": {
        "age": 35,
        "annualIncome": 250000,
        "plan": {
          "allowsAfterTax": false,
          "allowsInPlanConversion": false,
          "allowsInServiceDistribution": false,
          "employeeContribution": 23000,
          "employeeContributionType": "traditional",
          "employerMatch": 10000,
          "afterTaxContributionLimit": 0
        },
        "currentRothBalance": 50000,
        "yearsUntilRetirement": 25,
        "expectedReturn": 7
      }
    },
    {
      "tool_id": "roth-vs-traditional",
      "defaults": {
        "annualContribution": 7000,
        "currentTaxRate": 22,
        "retirementTaxRate": 22,
        "yearsUntilRetirement": 30,
        "expectedReturn": 7
      }
    },
    {
      "tool_id": "roth-catch-up",
      "defaults": {
        "priorYearW2Wages": 175000,
        "currentAge": 55,
        "currentBalance": 500000,
        "currentMarginalRate": 32,
        "retirementTaxRate": 24,
        "yearsUntilRetirement": 10,
        "expectedReturn": 7,
        "stateTaxRate": 5,
        "employerOffersRoth": true,
        "filingStatus": "single"
      }
    },
    {
      "tool_id": "super-catch-up",
      "defaults": {
        "currentAge": 58,
        "birthDate": "",
        "currentBalance": 500000,
        "annualSalary": 150000,
        "contributionRate": 15,
        "employerMatchPercent": 4,
        "employerMatchCap": 6,
        "expectedReturn": 7,
        "retirementAge": 65,
        "priorYearWages": 150000,
        "filingStatus": "single"
      }
    },
    {
      "tool_id": "hsa-maximization",
      "defaults": {
        "eligibility": {
          "hasHDHP": true,
          "coverageType": "individual",
          "age": 35,
          "enrolledInMedicare": false,
          "monthsOfCoverage": 12
        },
        "contribution": {
          "currentContribution": 3000,
          "employerContribution": 500,
          "currentHSABalance": 5000
        },
        "investment": {
          "expectedReturn": 7,
          "yearsToRetirement": 30,
          "yearsInRetirement": 25
        },
        "tax": {
          "marginalTaxRate": 32,
          "retirementTaxRate": 24,
          "stateCode": "CA"
        },
        "medical": {
          "annualMedicalExpenses": 2000,
          "retirementMedicalExpenses": 10000
        }
      }
    },
    {
      "tool_id": "i-bond-comparison",
      "defaults": {
        "amount": 10000,
        "years": 3,
        "hysaRate": 4.5,
        "federalBracket": 0.22,
        "stateRate": 5,
        "needsFullLiquidity": false,
        "expectedInflation": 2.5,
        "iBondFixedRate": 0.9,
        "iBondInflationRate": 3.12
      }
    },
    {
      "tool_id": "529-roth-rollover",
      "defaults": {
        "accountBalance": 50000,
        "accountOpenDate": "2010-01-01",
        "beneficiaryAge": 22,
        "earnedIncome": 40000,
        "otherIRAContributions": 0,
        "contributionsMade5YearsAgo": 30000,
        "priorRollovers": 0,
        "expectedReturn": 7,
        "yearsUntilRetirement": 40
      }
    },
    {
      "tool_id": "appreciated-stock-donation",
      "defaults": {
        "stock": {
          "stockValue": 10000,
          "costBasis": 2000,
          "holdingPeriod": 24
        },
        "tax": {
          "filingStatus": "single",
          "adjustedGrossIncome": 200000,
          "marginalTaxRate": 32,
          "stateCode": "CA",
          "itemizesDeductions": true
        },
        "donation": {
          "donationAmount": 10000,
          "donationType": "public_charity"
        }
      }
    },
    {
      "tool_id": "estate-tax",
      "defaults": {
        "assets": {
          "bankAccounts": 100000,
          "brokerageAccounts": 500000,
          "retirementAccounts": 500000,
          "primaryResidence": 1000000,
          "otherRealEstate": 0,
          "lifeInsurance": 1000000,
          "businessInterests": 0,
          "otherAssets": 100000
        },
        "liabilities": {
          "mortgages": 400000,
          "otherDebts": 0
        },
        "personal": {
          "maritalStatus": "single",
          "stateOfResidence": "CA",
          "age": 45,
          "spouseAge": 43
        },
        "lifetimeGiftsMade": 0
      }
    },
    {
      "tool_id": "equity-concentration",
      "defaults": {
        "equity": {
          "currentSharesValue": 500000,
          "vestedOptionsValue": 100000,
          "unvestedEquityValue": 200000,
          "costBasis": 50000
        },
        "assets": {
          "cashSavings": 50000,
          "retirementAccounts": 200000,
          "otherInvestments": 100000,
          "realEstate": 300000,
          "otherAssets": 0
        },
        "income": {
          "annualSalary": 200000,
          "annualEquityGrant": 100000,
          "yearsAtCompany": 3
        },
        "tax": {
          "filingStatus": "single",
          "marginalTaxRate": 37,
          "stateCode": "CA"
        }
      }
    },
    {
      "tool_id": "total-compensation",
      "defaults": {
        "baseSalary": 180000,
        "targetBonus": 15,
        "expectedBonusMultiplier": 100,
        "rsuGrant": {
          "totalValue": 200000,
          "vestingSchedule": "standard",
          "vestingYears": 4,
          "currentPrice": 150,
          "grantPrice": 150
        },
        "signOnBonus": 0,
        "signOnVestingYears": 1,
        "match401k": 4,
        "match401kLimit": 11600,
        "esppDiscount": 15,
        "esppContribution": 10000,
        "hsaContribution": 500,
        "annualRefresher": 50000,
        "refresherVestingYears": 4
      }
    },
    {
      "tool_id": "rsu-tax-calculator",
      "defaults": {
        "sharesVesting": 100,
        "stockPrice": 150,
        "filingStatus": "single",
        "annualSalary": 200000,
        "otherIncome": 0,
        "state": "CA",
        "withholdingMethod": "sell_to_cover"
      }
    },
    {
      "tool_id": "stock-option-exercise",
      "defaults": {
        "option": {
          "optionType": "iso",
          "totalOptions": 10000,
          "strikePrice": 5,
          "currentFMV": 50,
          "vestedOptions": 2500,
          "grantDate": "2022-01-01",
          "vestStartDate": "2022-01-01"
        },
        "tax": {
          "filingStatus": "single",
          "annualIncome": 200000,
          "stateCode": "CA",
          "existingAMTPreference": 0
        },
        "scenario": {
          "optionsToExercise": 2500,
          "exerciseDate": "2026-01-01",
          "holdingPeriod": 12,
          "expectedFMVAtSale": 75
        }
      }
    },
    {
      "tool_id": "crypto-cost-basis",
      "defaults": {
        "numberOfWallets": 3,
        "totalHoldings": 50000,
        "totalCostBasis": 30000,
        "plannedSaleAmount": 10000,
        "holdingPeriodMix": 50,
        "ordinaryIncome": 100000,
        "filingStatus": "single",
        "state": "CA",
        "applyTransitionalRelief": true
      }
    },
    {
      "tool_id": "medicare-irmaa",
      "defaults": {
        "filingStatus": "married",
        "currentAge": 63,
        "magi2024": 200000,
        "magi2025": 200000,
        "socialSecurityIncome": 40000,
        "pensionIncome": 0,
        "traditionalBalance": 1000000,
        "plannedRothConversion": 0,
        "taxExemptInterest": 0,
        "lifeChangingEvent": "none"
      }
    },
    {
      "tool_id": "emergency-fund",
      "defaults": {
        "monthlyExpenses": 4000,
        "jobStability": "stable",
        "incomeSource": "single_stable",
        "dependents": "partner",
        "healthSituation": "good",
        "housingSituation": "rent_normal"
      }
    },
    {
      "tool_id": "founder-coverage-planner",
      "defaults": {
        "annualNetIncome": 240000,
        "ownersCount": 1,
        "employeesCount": 0,
        "legalEntityType": "llc",
        "fundingPlan": "bootstrapped",
        "ownerRole": "operator",
        "marketSalary": 160000,
        "plannedSalary": 120000,
        "payrollAdminCosts": 3200,
        "statePayrollTaxRate": 2.5,
        "ssWageBase": 174000,
        "stateCode": "CA",
        "filingStatus": "single",
        "priorYearTax": 52000,
        "projectedCurrentTax": 61000,
        "federalWithholding": 12000,
        "estimatedPayments": 9000,
        "currentQuarter": 1,
        "entityStartDate": "2025-04-01",
        "taxYearStartDate": "2026-01-01",
        "taxElection": "s_corp",
        "payrollCadence": "biweekly",
        "businessAccounts": 1,
        "personalAccounts": 2,
        "mixedTransactionsPerMonth": 6,
        "reimbursementPolicy": "manual",
        "hasEquityGrants": false,
        "equityGrantType": "options",
        "daysSinceGrant": 0,
        "vestingYears": 4,
        "cliffMonths": 12,
        "strikePrice": 1.25,
        "fairMarketValue": 5,
        "sharesGranted": 100000,
        "exerciseWindowMonths": 90,
        "isQualifiedBusiness": true,
        "assetsAtIssuance": 12000000,
        "expectedHoldingYears": 5
      }
    }
];

export const DEMO_TOOL_PRESETS: ToolPresetBundle = {
  "last_updated": "2026-01-15",
  "presets": RAW_TOOL_PRESETS.map((preset) => ({
    ...preset,
    updated_at: NOW,
  })),
};

// === Shared Data (Points + Cards) ===

export const DEMO_POINTS_PROGRAMS: PointsProgram[] = [
  {
    id: "chase-ur",
    name: "Chase Ultimate Rewards",
    short_name: "Chase UR",
    issuer: "Chase",
    category: "bank",
    valuations: { tpg: 2.0, conservative: 1.25, moderate: 1.35, optimistic: 1.5 },
    methodology: {
      cash_out: 1.0,
      portal_value: 1.25,
      transfer_value: "Hyatt transfers often yield 1.5-2cpp.",
    },
    best_uses: ["Hyatt transfers", "Pay Yourself Back", "Travel portal with Sapphire Reserve"],
    worst_uses: ["Amazon checkout (0.8cpp)", "Cash back without Sapphire"],
    last_updated: "2026-01-15",
  },
  {
    id: "amex-mr",
    name: "Amex Membership Rewards",
    short_name: "Amex MR",
    issuer: "American Express",
    category: "bank",
    valuations: { tpg: 2.0, conservative: 1.1, moderate: 1.25, optimistic: 1.5 },
    methodology: {
      cash_out: 0.6,
      portal_value: 1.0,
      transfer_value: "ANA/Virgin transfers can yield 1.5-2cpp.",
    },
    best_uses: ["Transfer to ANA", "Transfer to Virgin Atlantic", "Schwab cash out (1.1cpp)"],
    worst_uses: ["Statement credits", "Amazon (0.7cpp)"],
    last_updated: "2026-01-15",
  },
  {
    id: "citi-ty",
    name: "Citi ThankYou Points",
    short_name: "Citi TY",
    issuer: "Citi",
    category: "bank",
    valuations: { tpg: 1.7, conservative: 1.0, moderate: 1.1, optimistic: 1.25 },
    methodology: {
      cash_out: 1.0,
      portal_value: 1.0,
      transfer_value: "Limited transfer partners; JetBlue can be solid.",
    },
    best_uses: ["Cash back", "JetBlue transfers", "Travel portal"],
    worst_uses: ["Gift cards", "Merchandise"],
    last_updated: "2026-01-15",
  },
  {
    id: "capital-one",
    name: "Capital One Miles",
    short_name: "Capital One",
    issuer: "Capital One",
    category: "bank",
    valuations: { tpg: 1.85, conservative: 0.85, moderate: 0.9, optimistic: 1.0 },
    methodology: {
      cash_out: 0.5,
      portal_value: 1.0,
      transfer_value: "Some partners are 1:1, but value varies by route.",
    },
    best_uses: ["Erase travel purchases", "Select transfer partners at 1:1"],
    worst_uses: ["Cash out", "Gift cards"],
    last_updated: "2026-01-15",
  },
  {
    id: "marriott",
    name: "Marriott Bonvoy",
    short_name: "Marriott",
    issuer: "Marriott",
    category: "hotel",
    valuations: { tpg: 0.8, conservative: 0.6, moderate: 0.7, optimistic: 0.8 },
    methodology: {
      cash_out: null,
      portal_value: null,
      transfer_value: "Transfers to airlines run about 3:1.",
    },
    best_uses: ["Off-peak hotel stays", "5th night free on 5-night stays"],
    worst_uses: ["Peak pricing properties", "Airline transfers (3:1)"],
    last_updated: "2026-01-15",
  },
  {
    id: "hilton",
    name: "Hilton Honors",
    short_name: "Hilton",
    issuer: "Hilton",
    category: "hotel",
    valuations: { tpg: 0.5, conservative: 0.4, moderate: 0.45, optimistic: 0.5 },
    methodology: {
      cash_out: null,
      portal_value: null,
      transfer_value: "Devalued over time, 5th night free helps.",
    },
    best_uses: ["Standard room redemptions", "5th night free"],
    worst_uses: ["Premium properties", "Points + Cash"],
    last_updated: "2026-01-15",
  },
  {
    id: "hyatt",
    name: "World of Hyatt",
    short_name: "Hyatt",
    issuer: "Hyatt",
    category: "hotel",
    valuations: { tpg: 1.7, conservative: 1.5, moderate: 1.7, optimistic: 1.9 },
    methodology: {
      cash_out: null,
      portal_value: null,
      transfer_value: "Best hotel currency with consistent value.",
    },
    best_uses: ["Category 1-4 properties", "Suite upgrades"],
    worst_uses: ["All-inclusive resorts (lower cpp)"],
    last_updated: "2026-01-15",
  },
  {
    id: "bilt",
    name: "Bilt Rewards",
    short_name: "Bilt",
    issuer: "Bilt",
    category: "bank",
    valuations: { tpg: 1.8, conservative: 1.2, moderate: 1.4, optimistic: 1.7 },
    methodology: {
      cash_out: 0.55,
      portal_value: 1.25,
      transfer_value: "Strong airline partners; transfer value varies by route.",
    },
    best_uses: ["Hyatt transfers", "Airline transfers", "Rent day bonuses"],
    worst_uses: ["Cash out", "Low-value gift cards"],
    last_updated: "2026-01-15",
  },
];

export const DEMO_CREDIT_CARD_DATA: CreditCardData[] = [
  {
    id: "chase-sapphire-preferred",
    name: "Chase Sapphire Preferred",
    issuer: "Chase",
    annual_fee: 95,
    currency_id: "chase-ur",
    image_url: null,
    apply_url: null,
    affiliate_payout_estimate: 175,
    tpg_rank: 1,
    default_rewards_rate: 2.1,
    credits: [
      {
        name: "$50 Hotel Credit",
        value: 50,
        period: "annual",
        description: "Statement credit for hotel stays booked through Chase Travel.",
        category: "travel",
        default_usable_pct: 70,
      },
    ],
    benefits: [
      {
        name: "Primary rental car insurance",
        description: "Primary coverage for rentals when paid with the card.",
        valuation_method: "subjective",
        default_value: 50,
      },
    ],
    earn_rates: { dining: 3, travel: 2, online_grocery: 3, other: 1 },
    signup_bonus: { points: 60000, spend_required: 4000, timeframe_months: 3 },
  },
  {
    id: "amex-gold",
    name: "American Express Gold",
    issuer: "American Express",
    annual_fee: 250,
    currency_id: "amex-mr",
    image_url: null,
    apply_url: null,
    affiliate_payout_estimate: 175,
    tpg_rank: 1,
    default_rewards_rate: 2.6,
    credits: [
      {
        name: "$120 Dining Credit",
        value: 120,
        period: "annual",
        description: "Monthly dining credits at select partners.",
        category: "dining",
        default_usable_pct: 70,
      },
      {
        name: "$120 Uber Cash",
        value: 120,
        period: "annual",
        description: "Monthly Uber Cash for rides or Uber Eats.",
        category: "transportation",
        default_usable_pct: 80,
      },
    ],
    benefits: [
      {
        name: "Amex Offers",
        description: "Targeted merchant offers with statement credits.",
        valuation_method: "subjective",
        default_value: 60,
      },
    ],
    earn_rates: { dining: 4, groceries: 4, travel: 3, other: 1 },
    signup_bonus: { points: 60000, spend_required: 6000, timeframe_months: 6 },
  },
  {
    id: "chase-freedom-flex",
    name: "Chase Freedom Flex",
    issuer: "Chase",
    annual_fee: 0,
    currency_id: "chase-ur",
    image_url: null,
    apply_url: null,
    affiliate_payout_estimate: 150,
    tpg_rank: 2,
    default_rewards_rate: 1.6,
    credits: [],
    benefits: [],
    earn_rates: { dining: 3, drugstores: 3, travel: 5, other: 1 },
    signup_bonus: { points: 20000, spend_required: 500, timeframe_months: 3 },
  },
];

// === Holdings per account ===

function makeSecurity(
  id: string,
  ticker: string | null,
  name: string,
  type: "stock" | "etf" | "mutual_fund" | "bond",
  price: number
) {
  return {
    id,
    ticker,
    name,
    security_type: type,
    cusip: null,
    isin: null,
    close_price: price,
    close_price_as_of: NOW,
    created_at: NOW,
    updated_at: NOW,
  };
}

function makeHolding(
  id: string,
  accountId: string,
  securityId: string,
  qty: number,
  costBasis: number,
  marketValue: number
) {
  return {
    id,
    account_id: accountId,
    security_id: securityId,
    quantity: qty,
    cost_basis: costBasis,
    market_value: marketValue,
    as_of: NOW,
    created_at: NOW,
    updated_at: NOW,
  };
}

// Fidelity 401(k) holdings
const FIDELITY_HOLDINGS: HoldingWithSecurity[] = [
  {
    ...makeHolding("demo-h-001", "demo-acc-001", "demo-sec-vti", 420, 78540, 119700),
    security: makeSecurity("demo-sec-vti", "VTI", "Vanguard Total Stock Market ETF", "etf", 285.0),
  },
  {
    ...makeHolding("demo-h-002", "demo-acc-001", "demo-sec-vxus", 580, 28420, 33640),
    security: makeSecurity("demo-sec-vxus", "VXUS", "Vanguard Total International Stock ETF", "etf", 58.0),
  },
  {
    ...makeHolding("demo-h-003", "demo-acc-001", "demo-sec-bnd", 310, 22940, 22475),
    security: makeSecurity("demo-sec-bnd", "BND", "Vanguard Total Bond Market ETF", "bond", 72.5),
  },
  {
    ...makeHolding("demo-h-004", "demo-acc-001", "demo-sec-voo", 520, 178360, 275600),
    security: makeSecurity("demo-sec-voo", "VOO", "Vanguard S&P 500 ETF", "etf", 530.0),
  },
];

// Vanguard Roth IRA holdings
const VANGUARD_HOLDINGS: HoldingWithSecurity[] = [
  {
    ...makeHolding("demo-h-005", "demo-acc-002", "demo-sec-qqq", 145, 38640, 76850),
    security: makeSecurity("demo-sec-qqq", "QQQ", "Invesco QQQ Trust", "etf", 530.0),
  },
  {
    ...makeHolding("demo-h-006", "demo-acc-002", "demo-sec-aapl", 180, 21600, 45900),
    security: makeSecurity("demo-sec-aapl", "AAPL", "Apple Inc.", "stock", 255.0),
  },
  {
    ...makeHolding("demo-h-007", "demo-acc-002", "demo-sec-msft", 110, 24200, 50600),
    security: makeSecurity("demo-sec-msft", "MSFT", "Microsoft Corporation", "stock", 460.0),
  },
  {
    ...makeHolding("demo-h-008", "demo-acc-002", "demo-sec-googl", 140, 16800, 27300),
    security: makeSecurity("demo-sec-googl", "GOOGL", "Alphabet Inc.", "stock", 195.0),
  },
  {
    ...makeHolding("demo-h-009", "demo-acc-002", "demo-sec-vgit", 200, 10400, 14600),
    security: makeSecurity("demo-sec-vgit", "VGIT", "Vanguard Intermediate-Term Treasury ETF", "bond", 73.0),
  },
];

// Schwab Brokerage holdings
const SCHWAB_HOLDINGS: HoldingWithSecurity[] = [
  {
    ...makeHolding("demo-h-010", "demo-acc-003", "demo-sec-amzn", 120, 14400, 28200),
    security: makeSecurity("demo-sec-amzn", "AMZN", "Amazon.com Inc.", "stock", 235.0),
  },
  {
    ...makeHolding("demo-h-011", "demo-acc-003", "demo-sec-nvda", 85, 10200, 14025),
    security: makeSecurity("demo-sec-nvda", "NVDA", "NVIDIA Corporation", "stock", 165.0),
  },
  {
    ...makeHolding("demo-h-012", "demo-acc-003", "demo-sec-tsla", 60, 12000, 16800),
    security: makeSecurity("demo-sec-tsla", "TSLA", "Tesla Inc.", "stock", 280.0),
  },
  {
    ...makeHolding("demo-h-013", "demo-acc-003", "demo-sec-schd", 340, 23800, 29240),
    security: makeSecurity("demo-sec-schd", "SCHD", "Schwab U.S. Dividend Equity ETF", "etf", 86.0),
  },
  {
    ...makeHolding("demo-h-014", "demo-acc-003", "demo-sec-vti", 200, 42000, 57000),
    security: makeSecurity("demo-sec-vti", "VTI", "Vanguard Total Stock Market ETF", "etf", 285.0),
  },
  {
    ...makeHolding("demo-h-015", "demo-acc-003", "demo-sec-jpst", 700, 35000, 35350),
    security: makeSecurity("demo-sec-jpst", "JPST", "JPMorgan Ultra-Short Income ETF", "bond", 50.5),
  },
  {
    ...makeHolding("demo-h-016", "demo-acc-003", "demo-sec-schx", 250, 14250, 16750),
    security: makeSecurity("demo-sec-schx", "SCHX", "Schwab U.S. Large-Cap ETF", "etf", 67.0),
  },
];

const HOLDINGS_BY_ACCOUNT: Record<string, HoldingWithSecurity[]> = {
  "demo-acc-001": FIDELITY_HOLDINGS,
  "demo-acc-002": VANGUARD_HOLDINGS,
  "demo-acc-003": SCHWAB_HOLDINGS,
};

// === Pre-computed derived data (static, so computed once at module load) ===

function computeHoldings(): HoldingDetail[] {
  const details: HoldingDetail[] = [];
  for (const account of DEMO_INVESTMENT_ACCOUNTS) {
    const holdings = HOLDINGS_BY_ACCOUNT[account.id] ?? [];
    for (const h of holdings) {
      details.push({
        id: h.id,
        account_id: account.id,
        account_name: account.name,
        account_type: account.account_type,
        is_tax_advantaged: account.is_tax_advantaged,
        security: {
          id: h.security.id,
          ticker: h.security.ticker,
          name: h.security.name,
          security_type: h.security.security_type,
          close_price: h.security.close_price,
        },
        quantity: h.quantity,
        cost_basis: h.cost_basis,
        market_value: h.market_value,
        as_of: h.as_of,
      });
    }
  }
  return details;
}

function computePortfolioSummary(allHoldings: HoldingDetail[]): PortfolioSummary {
  const totalInvestment = DEMO_INVESTMENT_ACCOUNTS.reduce((s, a) => s + a.balance, 0);
  const totalCash = DEMO_CASH_ACCOUNTS.reduce((s, a) => s + a.balance, 0);
  const totalDebt = DEMO_DEBT_ACCOUNTS.reduce((s, a) => s + a.balance, 0);

  const taxAdvantaged = DEMO_INVESTMENT_ACCOUNTS
    .filter((a) => a.is_tax_advantaged)
    .reduce((s, a) => s + a.balance, 0);
  const taxable = totalInvestment - taxAdvantaged;

  const byType: Record<string, number> = {};
  for (const h of allHoldings) {
    const type = h.security.security_type;
    byType[type] = (byType[type] ?? 0) + (h.market_value ?? 0);
  }

  const allocationByAssetType = Object.entries(byType).map(([category, value]) => ({
    category,
    value,
    percentage: Math.round((value / totalInvestment) * 10000) / 100,
  }));

  const allocationByAccountType = DEMO_INVESTMENT_ACCOUNTS.map((a) => ({
    category: a.account_type,
    value: a.balance,
    percentage: Math.round((a.balance / totalInvestment) * 10000) / 100,
  }));

  const sorted = [...allHoldings].sort(
    (a, b) => (b.market_value ?? 0) - (a.market_value ?? 0)
  );
  const topHoldings = sorted.slice(0, 10).map((h) => ({
    ticker: h.security.ticker,
    name: h.security.name,
    security_type: h.security.security_type,
    quantity: h.quantity,
    market_value: h.market_value ?? 0,
    cost_basis: h.cost_basis,
    account_name: h.account_name,
  }));

  const concentrationAlerts = allHoldings
    .filter((h) => ((h.market_value ?? 0) / totalInvestment) > 0.08)
    .map((h) => ({
      ticker: h.security.ticker,
      name: h.security.name,
      percentage: Math.round(((h.market_value ?? 0) / totalInvestment) * 10000) / 100,
      message: `${h.security.ticker ?? h.security.name} represents ${(((h.market_value ?? 0) / totalInvestment) * 100).toFixed(1)}% of your portfolio`,
    }));

  return {
    total_investment_value: totalInvestment,
    total_cash_value: totalCash,
    total_debt_value: totalDebt,
    net_worth: totalInvestment + totalCash - totalDebt,
    tax_advantaged_value: taxAdvantaged,
    taxable_value: taxable,
    allocation_by_asset_type: allocationByAssetType,
    allocation_by_account_type: allocationByAccountType,
    top_holdings: topHoldings,
    concentration_alerts: concentrationAlerts,
  };
}

const DEMO_HOLDINGS = computeHoldings();
const DEMO_PORTFOLIO_SUMMARY = computePortfolioSummary(DEMO_HOLDINGS);

// === Public accessors ===

export function getDemoAccountsResponse(): AllAccountsResponse {
  return {
    investment_accounts: DEMO_INVESTMENT_ACCOUNTS,
    cash_accounts: DEMO_CASH_ACCOUNTS,
    debt_accounts: DEMO_DEBT_ACCOUNTS,
  };
}

export function getDemoInvestmentAccountWithHoldings(
  accountId: string
): InvestmentAccountWithHoldings | null {
  const account = DEMO_INVESTMENT_ACCOUNTS.find((a) => a.id === accountId);
  if (!account) return null;
  return {
    ...account,
    holdings: HOLDINGS_BY_ACCOUNT[accountId] ?? [],
  };
}

export function getDemoHoldings(): HoldingDetail[] {
  return DEMO_HOLDINGS;
}

export function getDemoPortfolioSummary(): PortfolioSummary {
  return DEMO_PORTFOLIO_SUMMARY;
}

// === Portfolio History ===

function mulberry32(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const RANGE_CONFIG: Record<
  PortfolioHistoryRange,
  { startValue: number; points: number; intervalDays: number }
> = {
  "30d": { startValue: 905000, points: 30, intervalDays: 1 },
  "90d": { startValue: 880000, points: 90, intervalDays: 1 },
  "1y": { startValue: 780000, points: 52, intervalDays: 7 },
  all: { startValue: 200000, points: 66, intervalDays: 30 },
};

export function getDemoPortfolioHistory(
  range: PortfolioHistoryRange
): PortfolioHistoryPoint[] {
  const endValue = DEMO_PORTFOLIO_SUMMARY.net_worth;
  const { startValue, points, intervalDays } = RANGE_CONFIG[range];
  const rng = mulberry32(42 + points);

  const totalDrift = endValue - startValue;
  const driftPerStep = totalDrift / (points - 1);
  const noiseScale = Math.abs(totalDrift) * 0.02;

  const now = new Date();
  const result: PortfolioHistoryPoint[] = [];

  for (let i = 0; i < points; i++) {
    const daysBack = (points - 1 - i) * intervalDays;
    const d = new Date(now);
    d.setDate(d.getDate() - daysBack);

    let value: number;
    if (i === 0) {
      value = startValue;
    } else if (i === points - 1) {
      value = endValue;
    } else {
      value = startValue + driftPerStep * i + (rng() - 0.5) * 2 * noiseScale;
    }

    result.push({
      date: d.toISOString().slice(0, 10),
      value: Math.round(value * 100) / 100,
    });
  }

  return result;
}
