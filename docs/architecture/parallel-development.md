# Parallel Development Architecture

This document describes how multiple coding agents (or developers) can work on ClearMoney apps simultaneously without conflicts.

## Overview

ClearMoney is designed as a collection of independent mini-apps (calculators) that share common infrastructure. Each app is self-contained, allowing parallel development by multiple agents.

```
┌─────────────────────────────────────────────────────────────────┐
│                     ClearMoney Platform                          │
├─────────────────────────────────────────────────────────────────┤
│  Shared Infrastructure                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │ AppShell    │  │ SliderInput │  │ ResultCard  │  ...        │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │ formatters  │  │ site-config │  │ tokens.css  │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
├─────────────────────────────────────────────────────────────────┤
│  Independent Apps (can be developed in parallel)                │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │ Annual   │ │  Debt    │ │  Roth    │ │Emergency │  ...     │
│  │   Fee    │ │Destroyer │ │   vs     │ │  Fund    │          │
│  │ Analyzer │ │          │ │  Trad    │ │          │          │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

## Branch Strategy

Each app is developed on its own feature branch:

```
main
├── feature/app-annual-fee-analyzer    (Agent A)
├── feature/app-debt-destroyer         (Agent B)
├── feature/app-roth-vs-traditional    (Agent C)
├── feature/app-emergency-fund         (Agent D)
├── feature/app-chase-trifecta         (Agent E)
├── feature/app-fire-calculator        (Agent F)
├── feature/app-credit-score-simulator (Agent G)
├── feature/app-conscious-spending     (Agent H)
├── feature/app-dividend-tracker       (Agent I)
├── feature/app-points-valuation       (Agent J)
├── feature/app-amex-comparison        (Agent K)
└── feature/app-tpg-transparency       (Agent L)
```

## File Ownership

### Files Each Agent Owns (No Conflicts)

Each agent has exclusive ownership of their app's files:

```
src/
├── app/
│   └── tools/
│       └── [agent's-app-slug]/     ← Agent owns this directory
│           ├── page.tsx
│           └── calculator.tsx
└── lib/
    └── calculators/
        └── [agent's-app-slug]/     ← Agent owns this directory
            ├── types.ts
            ├── constants.ts
            └── calculations.ts
```

### Shared Files (Expect Merge Conflicts)

Only one file will have merge conflicts when PRs are merged:

```
src/lib/site-config.ts    ← Tool registration
```

**Resolution Strategy:** When merging, keep ALL tool entries from both branches. The tools array should grow, not conflict.

### Files Agents Should NOT Modify

```
src/components/shared/    ← Shared components
src/lib/shared/           ← Shared utilities
src/styles/tokens.css     ← Design tokens
docs/                     ← Documentation (unless updating your app spec)
```

If an agent needs changes to shared code, they should:
1. Note the requirement in their PR description
2. Build around it for now
3. A separate PR can update shared code later

## Agent Workflow

### 1. Setup

```bash
# Clone the repository
git clone [repository-url]
cd clearmoney

# Create feature branch
git checkout -b feature/app-[your-app-slug]

# Install dependencies
npm install
```

### 2. Read Documentation

Before writing any code:

1. Read `/docs/app-specs/shared-patterns.md`
2. Read your app spec: `/docs/app-specs/apps/[your-app].md`
3. Review existing calculator: `/src/app/tools/bilt-calculator/`

### 3. Development

```bash
# Start dev server
npm run dev

# Create your app structure
mkdir -p src/app/tools/[your-slug]
mkdir -p src/lib/calculators/[your-slug]

# Build your app following the spec
# ...

# Run build to check for errors
npm run build

# Run linter
npm run lint
```

### 4. Registration

Add your tool to `src/lib/site-config.ts`:

```typescript
export const tools: Tool[] = [
  // ... existing tools
  {
    id: "[your-slug]",
    name: "[Your App Name]",
    description: "[One-line description]",
    href: "/tools/[your-slug]",
    categoryId: "[category]",
    status: "live",
    primaryColor: "#[hex]",
    designStyle: "[style]",
    inspiredBy: ["[influencer]"],
    featured: false,
  },
];
```

### 5. Testing

Before submitting PR:

- [ ] `npm run build` passes
- [ ] `npm run lint` passes
- [ ] App works on mobile (375px viewport)
- [ ] All calculations verified
- [ ] Edge cases handled

### 6. Pull Request

```bash
# Commit your changes
git add .
git commit -m "Add [app-name] calculator"

# Push to remote
git push -u origin feature/app-[your-slug]

# Create PR via GitHub
```

PR should include:
- Summary of what the app does
- Desktop screenshot
- Mobile screenshot
- Link to app spec

## Merge Order

Apps can be merged in any order since they're independent. However:

1. **Shared infrastructure must exist first** (already in main)
2. **Each PR updates site-config.ts** (expect conflicts)
3. **Resolve site-config.ts conflicts by keeping all entries**

## Communication Protocol

If agents need to communicate:

### Issue: Need shared component change
```markdown
## Shared Component Request

**App:** [Your app name]
**Component:** SliderInput
**Request:** Add support for [feature]
**Workaround:** For now, I'm [doing X instead]
```

### Issue: Found bug in another app
```markdown
## Bug Report (Another App)

**App:** [Affected app name]
**Issue:** [Description]
**Don't fix it** - just report. Let that app's agent handle it.
```

### Issue: Unclear spec
```markdown
## Spec Clarification

**App:** [Your app name]
**Question:** [Your question]
**Assumption:** I'm assuming [X]. Please confirm or correct.
```

## Parallel Execution Plan

For maximum parallelism, apps can be assigned in batches:

### Batch 1 (Foundation - Highest Priority)
- Annual Fee Analyzer
- Debt Destroyer
- Roth vs Traditional
- Emergency Fund Planner

### Batch 2 (Credit Cards)
- Chase Trifecta
- Amex Gold vs Platinum
- TPG Transparency

### Batch 3 (Advanced Investing)
- FIRE Calculator
- Credit Score Simulator
- Conscious Spending

### Batch 4 (Specialized)
- Dividend Tracker
- Points Valuation Dashboard

## Quality Checklist

Every app must pass before merge:

### Functionality
- [ ] All calculations are correct
- [ ] Edge cases handled (0, max, negative)
- [ ] Results update when inputs change

### Design
- [ ] Follows app's design spec (color, personality)
- [ ] Works on mobile (375px)
- [ ] Accessible (labels, focus states)

### Code Quality
- [ ] TypeScript types defined
- [ ] Calculations in separate file from UI
- [ ] No console errors

### Integration
- [ ] Registered in site-config.ts
- [ ] Build passes
- [ ] Lint passes

## Troubleshooting

### "My changes conflict with another agent's"
- Only `site-config.ts` should conflict
- Resolve by keeping both tool entries
- If other files conflict, something went wrong—ask for help

### "I need to change a shared component"
- Don't change it in your PR
- Build around the limitation
- Note the need in your PR description

### "The spec is unclear"
- Make a reasonable assumption
- Document the assumption in code comments
- Note it in your PR description

### "Build is failing"
- Run `npm run build` locally first
- Check for TypeScript errors
- Check for missing imports

---

## Summary

The key principles for parallel development:

1. **Each app is isolated** in its own directories
2. **Only site-config.ts conflicts** (resolve by keeping all entries)
3. **Don't modify shared code** without coordination
4. **Follow the spec exactly** to ensure consistency
5. **Test thoroughly** before submitting PR

This architecture allows multiple agents to work simultaneously without stepping on each other's toes.
