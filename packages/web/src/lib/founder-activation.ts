export type FounderConnectContinuePath = "linked_accounts" | "manual_fallback";

export function shouldTrackInviteCodeStarted(
  nextValue: string,
  hasTracked: boolean
): boolean {
  return !hasTracked && nextValue.trim().length > 0;
}

export function classifyFounderConnectContinuePath(
  accountsLoading: boolean,
  totalConnected: number
): FounderConnectContinuePath | null {
  if (accountsLoading) {
    return null;
  }

  return totalConnected > 0 ? "linked_accounts" : "manual_fallback";
}
