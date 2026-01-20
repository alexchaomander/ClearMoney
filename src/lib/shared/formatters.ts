/**
 * ClearMoney Shared Formatters
 *
 * Consistent number formatting across all calculators.
 * Use these instead of raw Intl.NumberFormat calls.
 */

/**
 * Format a number as US currency
 *
 * @param value - The number to format
 * @param decimals - Number of decimal places (default: 0)
 * @returns Formatted currency string (e.g., "$1,234" or "$1,234.56")
 */
export function formatCurrency(value: number, decimals: number = 0): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format a number as a percentage
 *
 * @param value - The number to format (0.12 = 12%, 12 = 12% based on isRaw)
 * @param decimals - Number of decimal places (default: 1)
 * @param isRaw - If true, value is already in percentage form (12 = 12%)
 * @returns Formatted percentage string (e.g., "12.5%")
 */
export function formatPercent(
  value: number,
  decimals: number = 1,
  isRaw: boolean = false
): string {
  const normalizedValue = isRaw ? value / 100 : value;
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(normalizedValue);
}

/**
 * Format a raw percentage value (input: 12 → output: "12%")
 *
 * @param value - The percentage value (12 = 12%)
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted percentage string (e.g., "12.5%")
 */
export function formatPercentRaw(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format a number with thousands separators
 *
 * @param value - The number to format
 * @param decimals - Number of decimal places (default: 0)
 * @returns Formatted number string (e.g., "1,234,567")
 */
export function formatNumber(value: number, decimals: number = 0): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format a large number in compact form
 *
 * @param value - The number to format
 * @returns Compact formatted string (e.g., "1.2M", "500K")
 */
export function formatCompact(value: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

/**
 * Format months as years and months
 *
 * @param totalMonths - Total number of months
 * @returns Formatted string (e.g., "2 years, 3 months" or "8 months")
 */
export function formatMonthsAsYears(totalMonths: number): string {
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  if (years === 0) {
    return `${months} month${months !== 1 ? "s" : ""}`;
  }
  if (months === 0) {
    return `${years} year${years !== 1 ? "s" : ""}`;
  }
  return `${years} year${years !== 1 ? "s" : ""}, ${months} month${months !== 1 ? "s" : ""}`;
}

/**
 * Format a date as a month and year
 *
 * @param date - The date to format
 * @returns Formatted string (e.g., "January 2030")
 */
export function formatMonthYear(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(date);
}

/**
 * Format cents per point
 *
 * @param cpp - Cents per point value
 * @returns Formatted string (e.g., "1.5¢")
 */
export function formatCPP(cpp: number): string {
  return `${cpp.toFixed(2)}¢`;
}

/**
 * Format a value as positive or negative with sign
 *
 * @param value - The number to format
 * @param format - The format function to use
 * @returns Formatted string with + or - prefix
 */
export function formatWithSign(
  value: number,
  format: (v: number) => string = formatCurrency
): string {
  const prefix = value >= 0 ? "+" : "";
  return `${prefix}${format(value)}`;
}

/**
 * Pluralize a word based on count
 *
 * @param count - The count
 * @param singular - Singular form
 * @param plural - Plural form (defaults to singular + "s")
 * @returns Pluralized string
 */
export function pluralize(
  count: number,
  singular: string,
  plural?: string
): string {
  return count === 1 ? singular : plural || `${singular}s`;
}

/**
 * Format years with proper pluralization
 *
 * @param years - Number of years (can be decimal)
 * @returns Formatted string (e.g., "1 year", "2.5 years")
 */
export function formatYears(years: number): string {
  if (years === 1) return "1 year";
  if (Number.isInteger(years)) return `${years} years`;
  return `${years.toFixed(1)} years`;
}
