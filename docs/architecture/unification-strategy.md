# Unification Strategy

This document describes how independently developed ClearMoney apps are merged into a unified platform.

## Design Philosophy: Shared Shell, Unique Interiors

ClearMoney apps share common infrastructure while maintaining unique visual identities.

### Shared Elements (The Shell)

Every app includes:

```
┌─────────────────────────────────────────────────────────────────┐
│  [← Back to ClearMoney]                    [ClearMoney Logo]    │  ← Header
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                     APP-SPECIFIC CONTENT                        │  ← Unique per app
│                     (Unique color, personality)                 │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  ClearMoney                              All Tools              │  ← Footer
│  Honest financial tools                  Methodology            │
│                                          About                  │
│                                                                 │
│  Disclaimer: Educational purposes only...                       │
│  © 2026 ClearMoney                                              │
└─────────────────────────────────────────────────────────────────┘
```

**Shared via `AppShell` component:**
- Navigation header with back button
- ClearMoney branding
- Consistent footer with links
- Legal disclaimer
- Dark mode base (bg-neutral-950)
- Font family (Inter)

### Unique Elements (The Interior)

Each app has:
- **Primary accent color** (defined in app spec)
- **Visual personality** (playful, analytical, serious, etc.)
- **Custom visualizations** (charts, progress bars, etc.)
- **Specific result card styling**

## Color System

### App Color Assignments

| App | Primary Color | Hex | Usage |
|-----|---------------|-----|-------|
| Annual Fee Analyzer | Green | #22c55e | Positive values, accent |
| Debt Destroyer | Red/Orange | #ef4444 | Urgency, progress |
| Roth vs Traditional | Purple | #a855f7 | Premium, sophisticated |
| Emergency Fund | Blue | #3b82f6 | Safety, calm |
| Chase Trifecta | Chase Blue | #005EB8 | Brand alignment |
| FIRE Calculator | Amber | #f59e0b | Aspirational, warm |
| Credit Score Sim | Purple | #8b5cf6 | Premium, sophisticated |
| Conscious Spending | Emerald | #10b981 | Growth, positive |
| Dividend Tracker | Green | #22c55e | Income, growth |
| Points Valuation | Blue | #3b82f6 | Trust, data |
| Amex Comparison | Gold | #d4a017 | Premium, luxurious |
| TPG Transparency | Emerald | #10b981 | Honesty, trust |

### Semantic Colors (Shared)

All apps use consistent semantic colors:

```css
--color-positive: #22c55e;  /* Green - good results */
--color-negative: #ef4444;  /* Red - bad results */
--color-warning: #f59e0b;   /* Amber - caution */
--color-info: #3b82f6;      /* Blue - information */
```

## App Registration

All apps register in `src/lib/site-config.ts`:

```typescript
export interface Tool {
  id: string;
  name: string;
  description: string;
  href: string;
  categoryId: string;
  status: "live" | "coming-soon" | "beta";

  // New fields for unified platform
  primaryColor?: string;
  designStyle?: "analytical" | "playful" | "minimal" | "serious";
  inspiredBy?: string[];
  featured?: boolean;
  thumbnail?: string;
}
```

## Merge Process

### Pre-Merge Checklist

Before merging any app PR:

1. **Build passes:** `npm run build` succeeds
2. **Lint passes:** `npm run lint` succeeds
3. **Mobile tested:** Works on 375px viewport
4. **Calculations verified:** Results are correct
5. **Registered:** Entry added to site-config.ts
6. **Screenshots included:** Desktop + mobile in PR

### Merge Order

Apps can be merged in any order because:
- They live in separate directories
- They don't depend on each other
- Only site-config.ts has potential conflicts

### Handling site-config.ts Conflicts

When merging, the `tools` array will conflict. Resolution:

```typescript
// Branch A adds:
{
  id: "debt-destroyer",
  name: "Debt Destroyer",
  // ...
}

// Branch B adds:
{
  id: "fire-calculator",
  name: "FIRE Calculator",
  // ...
}

// Resolution: Keep BOTH entries
export const tools: Tool[] = [
  // ... existing tools
  {
    id: "debt-destroyer",
    // ...
  },
  {
    id: "fire-calculator",
    // ...
  },
];
```

### Post-Merge Verification

After merging each app:

1. Pull latest main
2. Run `npm run build`
3. Verify app appears in tool list
4. Test the app works correctly
5. Check no regressions in other apps

## Category Organization

Apps are organized by category on the ClearMoney homepage:

```typescript
export const categories = [
  {
    id: "credit-cards",
    name: "Credit Cards",
    tools: ["bilt-calculator", "annual-fee-analyzer", "chase-trifecta", "amex-comparison", "points-valuation", "tpg-transparency"],
  },
  {
    id: "debt",
    name: "Debt",
    tools: ["debt-destroyer"],
  },
  {
    id: "investing",
    name: "Investing",
    tools: ["roth-vs-traditional", "fire-calculator", "dividend-tracker"],
  },
  {
    id: "budgeting",
    name: "Budgeting",
    tools: ["emergency-fund", "conscious-spending"],
  },
  {
    id: "credit-building",
    name: "Credit Building",
    tools: ["credit-score-simulator"],
  },
];
```

## Homepage Integration

The ClearMoney homepage displays apps from the registry:

```tsx
// src/app/page.tsx
import { tools, categories } from "@/lib/site-config";

export default function HomePage() {
  return (
    <div>
      {/* Featured Tools */}
      <section>
        <h2>Featured Tools</h2>
        {tools.filter(t => t.featured && t.status === "live").map(tool => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </section>

      {/* Tools by Category */}
      {categories.map(category => (
        <section key={category.id}>
          <h2>{category.name}</h2>
          {tools.filter(t => t.categoryId === category.id).map(tool => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </section>
      ))}
    </div>
  );
}
```

## Visual Consistency Checks

### Automated

- Build must pass (TypeScript errors caught)
- Lint must pass (code style enforced)

### Manual (PR Review)

- [ ] App uses assigned primary color
- [ ] Results cards follow shared pattern
- [ ] Sliders use SliderInput component
- [ ] Dark mode looks correct
- [ ] Mobile layout works

## Future Considerations

### Cross-App Linking

Apps may link to related apps:

```tsx
<Link href="/tools/debt-destroyer">
  Related: Try our Debt Destroyer →
</Link>
```

### Shared State (Not Currently Needed)

If apps ever need to share state (e.g., user's income):
1. Use URL parameters for simple values
2. Use localStorage for persistence
3. Consider a shared context provider

### A/B Testing

For testing different designs:
1. Use feature flags in site-config
2. Or create variant branches

## Summary

The unification strategy ensures:

1. **Visual Consistency:** Shared shell, consistent navigation
2. **Design Freedom:** Unique colors and personalities per app
3. **Easy Integration:** Simple registration process
4. **Parallel Development:** Independent apps, minimal conflicts
5. **Scalability:** Easy to add new apps

The ClearMoney platform grows organically as apps are merged, with each app contributing to a cohesive but diverse collection of financial tools.
