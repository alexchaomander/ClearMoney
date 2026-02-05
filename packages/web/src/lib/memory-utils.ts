/**
 * Shared utilities for memory data transformations used in useMemoryPreFill mappings.
 */

/**
 * Safely normalize a value to a finite number, returning null for invalid values.
 */
export const normalizeNumber = (value: unknown): number | null =>
  typeof value === "number" && Number.isFinite(value) ? value : null;

/**
 * Safely extract an object from an unknown value.
 * Returns null if the value is not a non-array object.
 */
export const extractObject = (value: unknown): Record<string, unknown> | null => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
};

/**
 * Extract a nested numeric value from an object field.
 * Combines extractObject and normalizeNumber for common memory profile patterns.
 */
export const extractNestedNumber = (
  value: unknown,
  key: string
): number | null => {
  const obj = extractObject(value);
  return normalizeNumber(obj?.[key]);
};
