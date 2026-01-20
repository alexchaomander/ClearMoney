# Agent Prompts for Parallel Development

This directory contains standalone prompts for coding agents to build ClearMoney calculator apps in parallel.

## How to Use

1. Each prompt is completely self-contained
2. Give one prompt to one coding agent
3. Agents can work simultaneously without conflicts
4. Only `src/lib/site-config.ts` will have merge conflicts (resolve by keeping all entries)

## Prompts

| # | App | Prompt File | Priority |
|---|-----|-------------|----------|
| 1 | Annual Fee Analyzer | `01-annual-fee-analyzer.md` | High |
| 2 | Debt Destroyer | `02-debt-destroyer.md` | High |
| 3 | Roth vs Traditional | `03-roth-vs-traditional.md` | High |
| 4 | Emergency Fund Planner | `04-emergency-fund-planner.md` | High |
| 5 | Chase Trifecta | `05-chase-trifecta.md` | Medium |
| 6 | FIRE Calculator | `06-fire-calculator.md` | Medium |
| 7 | Credit Score Simulator | `07-credit-score-simulator.md` | Medium |
| 8 | Conscious Spending | `08-conscious-spending.md` | Medium |
| 9 | Dividend Tracker | `09-dividend-tracker.md` | Low |
| 10 | Points Valuation | `10-points-valuation.md` | Low |
| 11 | Amex Gold vs Platinum | `11-amex-comparison.md` | Low |
| 12 | TPG Transparency | `12-tpg-transparency.md` | Low |

## Batch Assignments

For maximum parallelism, assign by batch:

**Batch 1 (Foundation):** Apps 1-4
**Batch 2 (Credit & Investing):** Apps 5-8
**Batch 3 (Specialized):** Apps 9-12

## Post-Development

After each agent completes:
1. Create PR from their feature branch
2. Verify build passes
3. Merge to main (resolve site-config.ts conflicts by keeping all tool entries)
