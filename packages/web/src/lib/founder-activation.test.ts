import { describe, expect, test } from "vitest";

import {
  classifyFounderConnectContinuePath,
  shouldTrackInviteCodeStarted,
} from "./founder-activation";

describe("founder activation helpers", () => {
  test("tracks invite-code start on first non-empty input", () => {
    expect(shouldTrackInviteCodeStarted("", false)).toBe(false);
    expect(shouldTrackInviteCodeStarted("A", false)).toBe(true);
    expect(shouldTrackInviteCodeStarted("CLEARMONEY2026", false)).toBe(true);
    expect(shouldTrackInviteCodeStarted("A", true)).toBe(false);
  });

  test("classifies connect continuation only after account state resolves", () => {
    expect(classifyFounderConnectContinuePath(true, 2)).toBeNull();
    expect(classifyFounderConnectContinuePath(false, 2)).toBe("linked_accounts");
    expect(classifyFounderConnectContinuePath(false, 0)).toBe("manual_fallback");
  });
});
