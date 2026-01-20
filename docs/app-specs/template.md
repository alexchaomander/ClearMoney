# App Specification Template

Use this template when creating specs for new ClearMoney apps.

---

# [App Name]

## Overview

**Slug:** `[url-safe-slug]`
**Category:** [credit-cards | debt | investing | budgeting | credit-building]
**Primary Color:** [color name] (#[hex])
**Design Style:** [analytical | playful | minimal | serious]

### One-Line Description
[What does this tool do in one sentence?]

### Target User
[Who is this tool for? What situation are they in?]

### Problem It Solves
[What specific problem does this tool address?]

---

## Inspired By

### Influencer Connection
- **[Influencer Name]:** [What concept/philosophy we're building on]
- See: `/docs/research/influencer-profiles/[name].md`

### What Existing Tools Get Wrong
[What do competitors miss or do poorly?]

### Our Differentiated Approach
[How is ClearMoney's version better?]

---

## User Inputs

| Input | Type | Default | Min | Max | Step | Format |
|-------|------|---------|-----|-----|------|--------|
| [input1] | slider | [val] | [min] | [max] | [step] | currency |
| [input2] | slider | [val] | [min] | [max] | [step] | percent |
| [input3] | toggle | [val] | - | - | - | boolean |

### Input Explanations
- **[input1]:** [Why we need this, what it affects]
- **[input2]:** [Why we need this, what it affects]

---

## Calculations

### Core Formula
```
[Main calculation explained in words]

result = [formula]
```

### TypeScript Implementation

```typescript
// src/lib/calculators/[slug]/types.ts
export interface CalculatorInputs {
  input1: number;
  input2: number;
  // ...
}

export interface CalculatorResults {
  primaryResult: number;
  // ...
}
```

```typescript
// src/lib/calculators/[slug]/calculations.ts
import type { CalculatorInputs, CalculatorResults } from "./types";

export function calculate(inputs: CalculatorInputs): CalculatorResults {
  const { input1, input2 } = inputs;

  // [Calculation logic with comments explaining each step]
  const primaryResult = input1 * input2;

  return {
    primaryResult,
    // ...
  };
}
```

### Edge Cases
- **Zero values:** [How to handle]
- **Maximum values:** [How to handle]
- **Negative results:** [How to handle]

---

## UI Structure

### Sections (top to bottom)
1. **Hero:** Title, subtitle, one-line value proposition
2. **Inputs:** All user inputs in a card
3. **Results:** Primary result + breakdown
4. **Methodology:** Expandable explanation of calculations
5. **Related Content:** Links to related tools/articles (optional)

### Visual Design
- **Primary color usage:** [Where the accent color appears]
- **Personality notes:** [Playful animations? Serious charts? Minimal text?]
- **Special visualizations:** [Any charts, graphs, or unique elements]

---

## Files to Create

```
src/
├── app/
│   └── tools/
│       └── [slug]/
│           ├── page.tsx           # Metadata + wrapper
│           └── calculator.tsx     # Main component
└── lib/
    └── calculators/
        └── [slug]/
            ├── types.ts           # Interfaces
            ├── constants.ts       # Static data (if needed)
            └── calculations.ts    # Pure calculation functions
```

---

## Registration

Add to `/src/lib/site-config.ts`:

```typescript
{
  id: "[slug]",
  name: "[App Name]",
  description: "[One-line description]",
  href: "/tools/[slug]",
  categoryId: "[category]",
  status: "live",
  primaryColor: "#[hex]",
  designStyle: "[style]",
  inspiredBy: ["[influencer]"],
  featured: false,
}
```

---

## Agent Prompt

> **Copy everything below this line for the coding agent.**

---

# Agent Prompt: [App Name]

## Your Mission
Build the [App Name] calculator for ClearMoney. This is a standalone mini-app that [one-line description].

## Context
- **Repository:** `/Users/alexchao/projects/clearmoney`
- **Your app directory:** `/src/app/tools/[slug]/`
- **Your calculator logic:** `/src/lib/calculators/[slug]/`
- **Tech stack:** Next.js 15+, React 19, TypeScript, Tailwind CSS

## Before You Start
1. Read `/docs/app-specs/shared-patterns.md`
2. Review the existing Bilt calculator at `/src/app/tools/bilt-calculator/` for patterns
3. Check that shared components exist at `/src/components/shared/`

## Design Requirements
- **Primary Color:** [color] (#[hex])
- **Personality:** [description]
- **Base:** Dark mode (bg-neutral-950)
- **Mobile-first:** Must work on 375px viewport

## What You're Building
[Detailed description of the calculator, what problem it solves, who uses it]

## User Inputs
[Copy the inputs table from above]

## Calculation Logic
[Copy the calculation section from above]

## UI Structure
[Copy the UI structure from above]

## Files to Create
[List all files with their purposes]

## Testing Checklist
- [ ] `npm run build` passes
- [ ] `npm run lint` passes
- [ ] Mobile viewport (375px) works
- [ ] All calculations verified
- [ ] Edge cases handled (0, max, negative)
- [ ] Registered in site-config.ts

## Branch & PR
1. Create branch: `feature/app-[slug]`
2. Complete all work
3. Add entry to site-config.ts
4. Create PR with desktop + mobile screenshots

## Do NOT
- Modify shared components
- Add dependencies without justification
- Change other apps or global styles
- Skip mobile testing

---

## Verification Checklist

Before marking this spec complete:

- [ ] All inputs defined with ranges and defaults
- [ ] Calculations fully specified with formulas
- [ ] TypeScript interfaces complete
- [ ] UI structure clear
- [ ] Files to create listed
- [ ] Registration entry specified
- [ ] Agent prompt is self-contained
- [ ] Edge cases documented

---

## Related Documentation

- Research: `/docs/research/[relevant-file].md`
- Tool Opportunities: `/docs/research/tool-opportunities/[category].md`
- Shared Patterns: `/docs/app-specs/shared-patterns.md`
