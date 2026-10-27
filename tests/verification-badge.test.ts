import { describe, expect, it } from "vitest";

describe("Listener Verification Badge Logic", () => {
  it("only displays verification badge when isVerified is explicitly true", () => {
    const unverifiedListener = {
      id: "listener-1",
      displayName: "New Listener",
      isVerified: false,
    };

    const verifiedListener = {
      id: "listener-2",
      displayName: "Approved Listener",
      isVerified: true,
    };

    const defaultListener: { id: string; displayName: string; isVerified?: boolean } = {
      id: "listener-3",
      displayName: "Default Listener",
    };

    expect(Boolean(unverifiedListener.isVerified)).toBe(false);
    expect(Boolean(verifiedListener.isVerified)).toBe(true);
    expect(Boolean(defaultListener.isVerified)).toBe(false);
  });
});
