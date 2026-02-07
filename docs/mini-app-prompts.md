# ClearMoney Mini-App Implementation Prompts (Comprehensive)

This file contains four fully specified, independent implementation prompts. Each prompt is designed to be handed to a coding agent and implemented in isolation while keeping integration smooth when all apps are merged. All apps follow the same mini-app structure used elsewhere in this repo: inputs -> computed outputs -> methodology -> related tools. All calculations are deterministic and educational (no advice or forecasts).

General integration rules for ALL four apps
- Place calculator logic in: src/lib/calculators/<slug>/calculations.ts
- Place Next.js page in: src/app/<category>/<slug>/page.tsx
- Use shared components where available: AppShell, ResultCard, MethodologySection, RelatedTools, ShareResults, SliderInput.
- Add tool metadata to src/lib/site-config.ts (category, name, description, href, status, primaryColor).
- Use in-page copy that clearly states the tool is educational, not financial advice.
- Keep math transparent in a Methodology section.
- Keep code ASCII-only. No external APIs.

--------------------------------------------------------------------------------

PROMPT 1: Strategy Match Finder

Purpose and why this exists
Build a mini-app that translates complex investment strategy choices into a clear, educational "fit" recommendation. This mirrors the appeal of hedge-fund-like strategy selection while staying in ClearMoney's math-first and transparent style. It helps users understand which strategy archetypes align with their risk, tax, and behavioral profile without giving investment advice or executing trades.

User story
"As a user, I want a simple way to understand which strategy styles fit me best so I can evaluate options without sales fluff or hidden incentives."

Scope
- A form-based questionnaire that produces a ranked list of the top 3 strategy archetypes with rationale and tradeoffs.
- Deterministic scoring logic. No market data, no APIs.
- Clear explanation of the scoring model.

Routes and files
- Page: src/app/investing/strategy-match-finder/page.tsx
- Calculator: src/lib/calculators/strategy-match-finder/calculations.ts
- Update: src/lib/site-config.ts

Inputs (required)
- Risk tolerance: Conservative | Moderate | Aggressive
- Time horizon: 1-3 years | 3-7 years | 7-15 years | 15+ years
- Tax sensitivity: Low | Medium | High
- Income stability: Low | Medium | High
- Drawdown tolerance: Low | Medium | High

Strategy archetypes (define in calculations.ts)
Create 6-8 archetypes, each with properties:
- id, name, shortDescription
- riskProfile (low/med/high)
- turnover (low/med/high)
- taxEfficiency (low/med/high)
- volatility (low/med/high)
- complexity (low/med/high)
- bestFor (string list)
- tradeoffs (string list)

Example archetypes (use these exact names to keep consistent across app copy)
- "Core Index + Cash" (low risk, low turnover, high tax efficiency)
- "Balanced 60/40" (moderate risk, low turnover, medium tax efficiency)
- "Factor Tilt (Quality/Value)" (moderate risk, medium turnover)
- "Momentum Tilt" (higher risk, higher turnover)
- "Dividend Focus" (moderate risk, medium tax efficiency)
- "All-Weather Risk Parity" (moderate risk, higher complexity)
- "Aggressive Growth" (high risk, high volatility)

Scoring model (deterministic, transparent)
- Create a weighted score based on how well user inputs match archetype traits.
- Example: if tax sensitivity is High, add weight for taxEfficiency=high and subtract for turnover=high.
- Ensure scores are normalized to 0-100.
- Output: top 3 strategies + 1 sentence fit summary.

UI requirements
- Use a clean form with toggle buttons or select controls for each input.
- Results section shows:
  - Result card for each top 3 archetype: score, shortDescription, bestFor, tradeoffs.
  - A "Fit Summary" callout paragraph at top.
- Include ShareResults and MethodologySection.

Copy requirements
- Use educational tone.
- Must include a note that this does not provide financial advice.

Acceptance criteria
- Changing any input alters ranking deterministically.
- The top 3 are always shown even with identical scores (stable sort by score then id).
- Methodology clearly lists weights and how scores are derived.

--------------------------------------------------------------------------------

PROMPT 2: Rebalance vs Drift Calculator

Purpose and why this exists
Users often hear "rebalance" without understanding the tradeoff between tax costs and risk drift. This mini-app quantifies when rebalancing is worth it, presenting a math-based recommendation. It captures the "institutional discipline" pitch in a simple tool.

User story
"As a user, I want to know if I should rebalance now or wait, and what the cost of waiting is."

Scope
- Compute drift, tax drag, and risk drag.
- Output a recommendation with confidence indicator.

Routes and files
- Page: src/app/investing/rebalance-vs-drift/page.tsx
- Calculator: src/lib/calculators/rebalance-vs-drift/calculations.ts
- Update: src/lib/site-config.ts

Inputs
- Target allocation: Stocks % / Bonds % (must sum to 100)
- Current allocation: Stocks % / Bonds %
- Drift threshold % (e.g., 5%)
- Estimated tax rate on gains % (0-50)
- Transaction cost % (0-1)
- Expected volatility: Low | Medium | High

Outputs
- Drift percent (max absolute drift)
- Tax drag estimate (normalized to $100,000 portfolio)
- Risk drag estimate (normalized to $100,000 portfolio)
- Recommendation: "Rebalance now" or "Wait"
- Confidence: Low / Medium / High

Logic
- Drift = max(|currentStocks - targetStocks|, |currentBonds - targetBonds|)
- Tax drag = portfolioValue * drift * taxRate (use $100,000 for normalization)
- Risk drag = portfolioValue * drift * volatilityCoefficient
- Volatility coefficients: Low=0.4, Medium=0.7, High=1.0
- Recommendation:
  - If drift >= threshold AND riskDrag > taxDrag + transactionCost -> Rebalance now
  - Else Wait
- Confidence based on margin between riskDrag and taxDrag

UI requirements
- Sliders for allocations, drift threshold, tax rate, transaction cost.
- Toggle for volatility.
- Results: summary card + a small table comparing costs (tax vs risk).
- Include MethodologySection and ShareResults.

Copy requirements
- Educational tone; no advice language.
- Explain that tax drag is estimated and uses a normalized portfolio value.

Acceptance criteria
- Validation for allocations summing to 100 (auto-adjust sliders or show warning).
- Recommendation updates live with inputs.
- Methodology lists formulas.

--------------------------------------------------------------------------------

PROMPT 3: Tax-Aware Rebalance Impact

Purpose and why this exists
Investors underestimate tax impact when rebalancing. This mini-app estimates tax cost and shows a breakeven drift threshold. It aligns with ClearMoney's transparency and helps users evaluate tradeoffs before acting.

User story
"As a user, I want to know how much tax a rebalance could trigger and what drift makes it worthwhile."

Scope
- Compute gains, taxes, after-tax proceeds, and breakeven drift.

Routes and files
- Page: src/app/taxes/tax-aware-rebalance/page.tsx
- Calculator: src/lib/calculators/tax-aware-rebalance/calculations.ts
- Update: src/lib/site-config.ts

Inputs
- Portfolio value ($)
- Allocation to sell (%)
- Cost basis (% of current value)
- Short-term tax rate (%)
- Long-term tax rate (%)
- Portion of gains that are short-term (%)

Outputs
- Total gains realized
- Short-term tax owed
- Long-term tax owed
- Total taxes owed
- After-tax proceeds
- Breakeven drift % (tax / portfolio value)

Logic
- Value sold = portfolioValue * allocationToSell
- Gains = valueSold * (1 - costBasis)
- Short-term gains = gains * shortTermPortion
- Long-term gains = gains * (1 - shortTermPortion)
- Taxes = shortTermGains * shortTermRate + longTermGains * longTermRate
- After-tax proceeds = valueSold - taxes
- Breakeven drift = taxes / portfolioValue

UI requirements
- Numeric inputs with formatting.
- Results section with 4 cards: Gains, Taxes, After-tax proceeds, Breakeven drift.
- Include MethodologySection and ShareResults.

Copy requirements
- Explicitly educational; note that tax treatment varies.

Acceptance criteria
- Values update live.
- Breakeven drift formatted as percent.
- Methodology shows formulas and assumptions.

--------------------------------------------------------------------------------

PROMPT 4: Factor Tilt Comparator

Purpose and why this exists
Factor tilts are often pitched as "institutional alpha" without clarity on risks. This mini-app compares base vs tilted portfolios with simple, transparent assumptions. It helps users understand tradeoffs and time-horizon effects.

User story
"As a user, I want to compare a base portfolio vs a factor tilt so I can see expected return range and risk."

Scope
- Compare expected return and volatility.
- Show how time horizon changes the uncertainty range.

Routes and files
- Page: src/app/investing/factor-tilt-comparator/page.tsx
- Calculator: src/lib/calculators/factor-tilt-comparator/calculations.ts
- Update: src/lib/site-config.ts

Inputs
- Base portfolio expected return %
- Base portfolio volatility %
- Factor tilt type: Value | Quality | Momentum | Small Cap
- Expected factor premium %
- Additional volatility from tilt %
- Time horizon (years)

Outputs
- Base expected return range
- Tilted expected return range
- Base volatility
- Tilted volatility
- "When tilt helps" qualitative summary

Logic
- Tilted return = baseReturn + factorPremium
- Tilted volatility = baseVol + addedVol
- Range heuristic: return +/- (volatility / sqrt(years))
- Summary rules:
  - If horizon <= 3: emphasize higher uncertainty
  - If 3-7: balanced note
  - If 7+: premium more likely to matter

UI requirements
- Sliders for numeric inputs; select for tilt type.
- Side-by-side comparison cards.
- Include MethodologySection and ShareResults.

Copy requirements
- Avoid advice; frame as scenario comparison.

Acceptance criteria
- Range math correct and stable for all inputs.
- Summary text updates with horizon.


--------------------------------------------------------------------------------

PROMPT 5: S-Corp Savings Estimator

Purpose and why this exists
Founders often delay S-Corp elections because they don’t understand the tradeoffs or administrative burden. This mini-app estimates payroll tax savings vs pass-through self-employment tax and includes a compliance checklist so users can make an informed decision.

User story
"As a solo founder, I want to estimate the potential tax savings of an S-Corp election and understand the steps required to stay compliant."

Scope
- Deterministic estimate of payroll tax savings and net benefit after admin costs.
- Display a compliance checklist and deadlines.
- Educational tone, no advice, no external APIs.

Routes and files
- Page: src/app/taxes/s-corp-savings/page.tsx
- Calculator: src/lib/calculators/s-corp-savings/calculations.ts
- Update: src/lib/site-config.ts

Inputs
- Net business income ($)
- Owner role (Operator / Investor)
- Estimated market salary ($)
- Payroll admin costs ($/year)
- State payroll tax rate (%)
- Filing status (Single / MFJ)

Outputs
- Recommended wage base (bounded by "reasonable compensation" input assumptions)
- Estimated payroll taxes vs self-employment taxes
- Estimated net savings
- Compliance checklist + deadline reminder

Logic (transparent + deterministic)
- Assume pass-through self-employment tax applies to full net income (educational simplification).
- S-Corp payroll taxes apply to wage base; distributions are not subject to payroll tax.
- Net savings = (pass-through payroll tax estimate - S-Corp payroll tax estimate) - admin costs.
- Provide range output if salary is below a market salary minimum (warn about reasonable comp risk).

Compliance checklist (display list)
- Form 2553 election
- Run payroll and withhold taxes
- File quarterly payroll reports
- File 1120-S and issue K-1
- Document reasonable compensation methodology

Copy requirements
- Educational tone.
- Explicit note: "This is an estimate and not tax advice."
- Include a reminder about the general election deadline (2 months + 15 days after tax year start).

Acceptance criteria
- Changing any input changes output deterministically.
- Methodology explains assumptions and limitations clearly.
