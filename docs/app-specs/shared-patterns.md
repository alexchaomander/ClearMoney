# Shared Patterns for ClearMoney Apps

> **REQUIRED READING:** Every agent building an app MUST follow these patterns.

## File Structure

Every app follows this structure:

```
src/
├── app/
│   └── tools/
│       └── [your-slug]/
│           ├── page.tsx           # Server component with metadata
│           └── calculator.tsx     # Client component with logic + UI
├── lib/
│   └── calculators/
│       └── [your-slug]/
│           ├── types.ts           # TypeScript interfaces
│           └── constants.ts       # Static data, magic numbers
└── components/
    └── shared/                    # DO NOT MODIFY - use as-is
        ├── SliderInput.tsx
        ├── ResultCard.tsx
        └── AppShell.tsx
```

## Page Component Pattern

Every app's `page.tsx` should look like this:

```tsx
// src/app/tools/[slug]/page.tsx
import { Metadata } from "next";
import { Calculator } from "./calculator";

export const metadata: Metadata = {
  title: "[App Name] | ClearMoney",
  description: "[One-line description of what this calculator does]",
  openGraph: {
    title: "[App Name] | ClearMoney",
    description: "[One-line description]",
    type: "website",
  },
};

export default function Page() {
  return <Calculator />;
}
```

## Calculator Component Pattern

Every app's `calculator.tsx` should follow this structure:

```tsx
// src/app/tools/[slug]/calculator.tsx
"use client";

import { useState } from "react";
import { SliderInput } from "@/components/shared/SliderInput";
import { ResultCard } from "@/components/shared/ResultCard";
import { formatCurrency, formatPercent } from "@/lib/shared/formatters";
import { calculate } from "@/lib/calculators/[slug]/calculations";
import type { CalculatorInputs, CalculatorResults } from "@/lib/calculators/[slug]/types";

const DEFAULT_INPUTS: CalculatorInputs = {
  // sensible defaults
};

export function Calculator() {
  const [inputs, setInputs] = useState<CalculatorInputs>(DEFAULT_INPUTS);

  // Calculate results whenever inputs change
  const results = calculate(inputs);

  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Hero Section */}
      <section className="px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            [App Title]
          </h1>
          <p className="text-lg text-neutral-400">
            [Subtitle explaining what this tool does]
          </p>
        </div>
      </section>

      {/* Calculator Section */}
      <section className="px-4 pb-16">
        <div className="mx-auto max-w-2xl space-y-8">
          {/* Input Card */}
          <div className="rounded-2xl bg-neutral-900 p-6">
            <h2 className="text-xl font-semibold text-white mb-6">
              Your Information
            </h2>

            <div className="space-y-6">
              <SliderInput
                label="[Input Label]"
                value={inputs.someValue}
                onChange={(value) => setInputs(prev => ({ ...prev, someValue: value }))}
                min={0}
                max={10000}
                step={100}
                format="currency"
              />
              {/* More inputs... */}
            </div>
          </div>

          {/* Results Card */}
          <ResultCard
            title="Your Results"
            primaryValue={formatCurrency(results.primaryResult)}
            primaryLabel="[What this number means]"
            items={results.breakdown.map(item => ({
              label: item.label,
              value: formatCurrency(item.value)
            }))}
            variant="[your-color]"
          />
        </div>
      </section>

      {/* Methodology Section (optional but recommended) */}
      <section className="px-4 pb-16">
        <div className="mx-auto max-w-2xl">
          <details className="rounded-2xl bg-neutral-900/50 p-6">
            <summary className="text-lg font-semibold text-white cursor-pointer">
              How we calculate this
            </summary>
            <div className="mt-4 text-neutral-400 space-y-2">
              <p>[Explain the methodology]</p>
            </div>
          </details>
        </div>
      </section>
    </div>
  );
}
```

## Types Pattern

Every app's `types.ts` should define clear interfaces:

```tsx
// src/lib/calculators/[slug]/types.ts

export interface CalculatorInputs {
  amount: number;
  rate: number;
  // ... all inputs
}

export interface CalculatorResults {
  primaryResult: number;
  breakdown: BreakdownItem[];
  // ... all outputs
}

export interface BreakdownItem {
  label: string;
  value: number;
}
```

## Calculation Functions Pattern

Keep calculations separate from UI:

```tsx
// src/lib/calculators/[slug]/calculations.ts
import type { CalculatorInputs, CalculatorResults } from "./types";

export function calculate(inputs: CalculatorInputs): CalculatorResults {
  // All calculation logic here
  // Pure function: same inputs → same outputs
  // No side effects

  return {
    primaryResult: calculatedValue,
    breakdown: [...],
  };
}
```

## Shared Components Reference

### SliderInput

The primary input component for all calculators.

```tsx
<SliderInput
  label="Annual Fee"
  value={inputs.annualFee}
  onChange={(value) => setInputs(prev => ({ ...prev, annualFee: value }))}
  min={0}
  max={700}
  step={5}
  format="currency"  // "currency" | "percent" | "number"
/>
```

**Props:**
- `label: string` - Display label
- `value: number` - Current value
- `onChange: (value: number) => void` - Value change handler
- `min: number` - Minimum value
- `max: number` - Maximum value
- `step: number` - Step increment
- `format: "currency" | "percent" | "number"` - Display format

### ResultCard

The primary output component for displaying results.

```tsx
<ResultCard
  title="Your Results"
  primaryValue="$1,234"
  primaryLabel="Annual Savings"
  items={[
    { label: "Monthly", value: "$102.83" },
    { label: "Effective Rate", value: "2.5%" },
  ]}
  variant="green"  // matches app's primary color
/>
```

**Props:**
- `title: string` - Card title
- `primaryValue: string` - Main result (large text)
- `primaryLabel: string` - What the primary value represents
- `items: Array<{label: string, value: string}>` - Additional details
- `variant: string` - Color variant (green, red, blue, purple, amber, etc.)

## Formatting Utilities

Use these from `/src/lib/shared/formatters.ts`:

```tsx
import { formatCurrency, formatPercent, formatNumber } from "@/lib/shared/formatters";

formatCurrency(1234.5);     // "$1,234.50"
formatCurrency(1234.5, 0);  // "$1,235" (no decimals)
formatPercent(0.125);       // "12.5%"
formatPercent(0.125, 0);    // "13%" (no decimals)
formatNumber(1234567);      // "1,234,567"
```

## Design Tokens

Use these CSS classes consistently:

### Colors
- Background: `bg-neutral-950` (page), `bg-neutral-900` (cards)
- Text: `text-white` (headings), `text-neutral-400` (body)
- Accent: Use your app's assigned primary color

### Spacing
- Page padding: `px-4` (mobile), `py-12 sm:py-16` (sections)
- Card padding: `p-6`
- Content width: `max-w-2xl mx-auto` (calculator), `max-w-3xl mx-auto` (hero)
- Element spacing: `space-y-6` (inputs), `space-y-8` (sections)

### Border Radius
- Cards: `rounded-2xl`
- Buttons: `rounded-lg`
- Inputs: `rounded-lg`

### Typography
- Page title: `text-3xl sm:text-4xl font-bold`
- Section titles: `text-xl font-semibold`
- Body text: `text-base` or `text-lg`
- Small text: `text-sm`

## Mobile-First Design

All apps MUST work on mobile (375px width minimum).

**Requirements:**
- Touch-friendly inputs (minimum 44px tap targets)
- Readable text without zooming
- No horizontal scrolling
- Stack elements vertically on mobile
- Test on actual mobile devices or Chrome DevTools

## Accessibility Requirements

- All inputs have labels
- Color is not the only indicator of meaning
- Interactive elements are keyboard accessible
- Focus states are visible
- Sufficient color contrast (WCAG AA minimum)

## Registration in site-config.ts

When your app is complete, add it to the tools array:

```tsx
// src/lib/site-config.ts
export const tools: Tool[] = [
  // ... existing tools
  {
    id: "[your-slug]",
    name: "[Your App Name]",
    description: "[One-line description]",
    href: "/tools/[your-slug]",
    categoryId: "[category]", // "credit-cards", "debt", "investing", etc.
    status: "live",
    primaryColor: "#[hex]",
    designStyle: "analytical", // or "playful", "minimal", "serious"
    inspiredBy: ["[influencer]"],
    featured: false, // set true for homepage feature
  },
];
```

## Testing Checklist

Before submitting your PR:

- [ ] `npm run build` passes without errors
- [ ] `npm run lint` passes without errors
- [ ] Calculator works on mobile (375px viewport)
- [ ] All inputs have sensible defaults
- [ ] Edge cases handled (0 values, max values, etc.)
- [ ] Results update correctly when inputs change
- [ ] No console errors in browser
- [ ] App registered in site-config.ts
- [ ] PR includes desktop and mobile screenshots

## Common Mistakes to Avoid

### ❌ DON'T: Modify shared components
If you need a feature, work around it or note it for a future PR.

### ❌ DON'T: Put calculation logic in components
Keep calculations in `/src/lib/calculators/[slug]/calculations.ts`.

### ❌ DON'T: Use hardcoded strings for numbers
Use formatters for all displayed numbers.

### ❌ DON'T: Forget mobile testing
Every app must work on 375px viewport.

### ❌ DON'T: Skip the methodology section
Users should understand how we calculate results.

### ❌ DON'T: Use colors outside the design system
Stick to the assigned primary color and neutral scale.

### ✅ DO: Write pure calculation functions
Same inputs → same outputs, no side effects.

### ✅ DO: Use TypeScript strictly
Define interfaces, avoid `any`.

### ✅ DO: Test edge cases
What happens with 0? Max values? Negative results?

### ✅ DO: Keep it simple
Build what's in the spec, nothing more.

---

## Questions?

If something in the spec is unclear, check:
1. This shared patterns document
2. The existing Bilt calculator for reference (`/src/app/tools/bilt-calculator/`)
3. The specific app spec in `/docs/app-specs/apps/`

If still unclear, note the assumption you're making and proceed. We can iterate.
