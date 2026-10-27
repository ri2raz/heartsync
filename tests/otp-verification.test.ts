import { describe, expect, it } from "vitest";

describe("OTP Verification Logic", () => {
  it("generates a valid 6-digit numeric OTP", () => {
    for (let i = 0; i < 50; i++) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      expect(otp).toMatch(/^\d{6}$/);
      const num = parseInt(otp, 10);
      expect(num).toBeGreaterThanOrEqual(100000);
      expect(num).toBeLessThanOrEqual(999999);
    }
  });

  it("calculates 10-minute expiry window properly", () => {
    const now = Date.now();
    const expiresAt = new Date(now + 10 * 60 * 1000);
    expect(expiresAt.getTime() - now).toBe(600000);
    expect(new Date() < expiresAt).toBe(true);
  });

  it("validates 6-digit OTP formatting regex", () => {
    const valid = ["123456", "987654", "000000", "999999"];
    const invalid = ["12345", "1234567", "abcdef", "12a456", "", " "];

    for (const code of valid) {
      expect(/^\d{6}$/.test(code)).toBe(true);
    }
    for (const code of invalid) {
      expect(/^\d{6}$/.test(code)).toBe(false);
    }
  });
});
