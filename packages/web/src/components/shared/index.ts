/**
 * ClearMoney Shared Components
 *
 * These components are used across all calculator apps.
 * Import from this file for consistent access.
 *
 * @example
 * import { SliderInput, ResultCard, AppShell } from "@/components/shared";
 */

// Calculator building blocks
export { SliderInput } from "./SliderInput";
export { ResultCard, ComparisonCard } from "./ResultCard";
export { AppShell, MethodologySection, VerdictCard } from "./AppShell";

// Site-wide components
export { RelatedTools, getRelatedToolIds } from "./RelatedTools";
export { NewsletterSignup } from "./NewsletterSignup";
export { FeaturedTools, FeaturedToolsCompact } from "./FeaturedTools";
export { MethodologyDetails, MethodologyInline } from "./MethodologySection";
export { ShareResults, useSharedParams } from "./ShareResults";
export { CategoryPage } from "./CategoryPage";
export { UnifiedIntakeForm } from "./UnifiedIntakeForm";
