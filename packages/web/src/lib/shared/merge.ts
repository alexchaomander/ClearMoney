export function mergeDeep<T>(base: T, patch?: Partial<T>): T {
  if (!patch) return base;
  if (Array.isArray(base) || Array.isArray(patch)) {
    return (patch as T) ?? base;
  }
  if (typeof base !== "object" || base === null) {
    return (patch as T) ?? base;
  }
  const result: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const [key, value] of Object.entries(patch as Record<string, unknown>)) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      result[key] = mergeDeep(result[key] as unknown, value as Record<string, unknown>);
    } else if (value !== undefined) {
      result[key] = value;
    }
  }
  return result as T;
}
