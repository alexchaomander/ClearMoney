# ClearMoney App Specifications

This directory contains complete specifications for each mini-app in the ClearMoney platform. Each spec is designed to enable an independent coding agent to build the app without asking questions.

## Purpose

These specifications enable **parallel development** of the ClearMoney app suite. Multiple agents can work simultaneously on different apps, then merge their work into a unified platform.

## Directory Structure

```
docs/app-specs/
├── README.md                        # This file
├── shared-patterns.md               # Common patterns all apps MUST follow
├── template.md                      # Template for creating new app specs
└── apps/
    ├── 01-annual-fee-analyzer.md    # Credit card annual fee calculator
    ├── 02-debt-destroyer.md         # Snowball vs avalanche comparison
    ├── 03-roth-vs-traditional.md    # IRA type comparison calculator
    ├── 04-emergency-fund-planner.md # Personalized emergency fund target
    ├── 05-chase-trifecta.md         # Chase ecosystem optimizer
    ├── 06-fire-calculator.md        # Financial independence calculator
    ├── 07-credit-score-simulator.md # What-if credit score analysis
    ├── 08-conscious-spending.md     # Ramit-style budget planner
    ├── 09-dividend-tracker.md       # Passive income visualizer
    ├── 10-points-valuation.md       # Open-source points valuations
    ├── 11-amex-gold-vs-platinum.md  # Popular card comparison
    └── 12-tpg-transparency.md       # TPG vs reality calculator
```

## How to Use These Specs

### For Coding Agents

1. **Read first:** Before writing any code, read:
   - This README
   - `/docs/app-specs/shared-patterns.md` (required patterns)
   - Your specific app spec in `/docs/app-specs/apps/`

2. **Follow the agent prompt:** Each app spec contains a complete "Agent Prompt" section with everything you need.

3. **Use shared components:** Components in `/src/components/shared/` are pre-built for your use.

4. **Register your app:** Add an entry to `/src/lib/site-config.ts` when complete.

5. **Don't modify shared code:** If you need a shared component to change, note it in your PR but don't modify it.

### For Project Managers

1. **Assign apps:** Each app can be assigned to a different agent/developer.

2. **Check dependencies:** Most apps are independent. Any dependencies are noted in specs.

3. **Review PRs:** Each app PR should include:
   - All app code in `/src/app/tools/[slug]/`
   - Calculator logic in `/src/lib/calculators/[slug]/`
   - Registration in `site-config.ts`
   - Screenshots (desktop + mobile)

## App Status

| App | Status | Assigned | Priority |
|-----|--------|----------|----------|
| Annual Fee Analyzer | Spec Ready | - | HIGH |
| Debt Destroyer | Spec Ready | - | HIGH |
| Roth vs Traditional | Spec Ready | - | HIGH |
| Emergency Fund Planner | Spec Ready | - | HIGH |
| Chase Trifecta | Spec Ready | - | MEDIUM |
| FIRE Calculator | Spec Ready | - | HIGH |
| Credit Score Simulator | Spec Ready | - | HIGH |
| Conscious Spending | Spec Ready | - | MEDIUM |
| Dividend Tracker | Spec Ready | - | MEDIUM |
| Points Valuation | Spec Ready | - | MEDIUM |
| Amex Gold vs Platinum | Spec Ready | - | HIGH |
| TPG Transparency | Spec Ready | - | HIGH |

## Design Philosophy

### Shared Shell, Unique Interiors

All apps share:
- ClearMoney header/navigation
- Consistent footer
- Dark mode base (bg-neutral-950)
- Same font family

Each app has unique:
- Primary accent color
- Visual personality
- Component styling within the app
- Illustrations or iconography

### Color Assignments

| App | Primary Color | Hex | Personality |
|-----|---------------|-----|-------------|
| Annual Fee Analyzer | Green | #22c55e | Honest, transparent |
| Debt Destroyer | Red/Orange | #ef4444 | Aggressive, motivational |
| Roth vs Traditional | Purple | #a855f7 | Sophisticated |
| Emergency Fund | Blue | #3b82f6 | Calm, reassuring |
| Chase Trifecta | Chase Blue | #005EB8 | Brand-aligned |
| FIRE Calculator | Amber | #f59e0b | Aspirational, warm |
| Credit Score Sim | Purple | #8b5cf6 | Premium, sophisticated |
| Conscious Spending | Emerald | #10b981 | Growth, positivity |
| Dividend Tracker | Green | #22c55e | Income, growth |
| Points Valuation | Blue | #3b82f6 | Trustworthy, data-forward |
| Amex Gold/Platinum | Gold | #d4a017 | Premium, luxurious |
| TPG Transparency | Emerald | #10b981 | Honest, trustworthy |

## Quick Links

- [Shared Patterns](./shared-patterns.md) - REQUIRED reading before building any app
- [Template](./template.md) - For creating new app specs
- [Architecture: Parallel Development](../architecture/parallel-development.md)
- [Architecture: Unification Strategy](../architecture/unification-strategy.md)
- [Research Documentation](../research/README.md)

## FAQ

### Can I modify shared components?
No. If you need changes to shared components, note the requirement in your PR but build your app with the current components. A separate PR can update shared components.

### What if my app needs a new dependency?
Add it to your PR's package.json changes, but justify why it's needed. Prefer existing dependencies.

### How do I handle merge conflicts in site-config.ts?
When merging, keep all tool entries from both branches. The tools array should grow, not conflict.

### What if I find a bug in another app?
Note it separately; don't fix it in your PR. Each app should be independent.

### Can I work on multiple apps?
Yes, but use separate branches for each: `feature/app-[slug]`.

---

*Last updated: January 2026*
