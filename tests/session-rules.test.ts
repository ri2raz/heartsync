import { describe, expect, it } from "vitest";

import {
  ageInYears,
  formatRupees,
  isAdult,
  isRequestExpired,
  minutesUsed,
  secondsRemaining,
  unusedMinutes,
} from "@/lib/session-rules";

const at = (iso: string) => new Date(iso);

describe("age checks", () => {
  it("counts birthdays correctly", () => {
    expect(ageInYears(at("2008-10-27"), at("2026-10-26"))).toBe(17);
    expect(ageInYears(at("2008-10-26"), at("2026-10-26"))).toBe(18);
  });
  it("requires 18+", () => {
    expect(isAdult(at("2008-10-27"), at("2026-10-26"))).toBe(false);
    expect(isAdult(at("2000-01-01"), at("2026-10-26"))).toBe(true);
  });
});

describe("refunds", () => {
  const startedAt = at("2026-10-26T10:00:00Z");

  it("refunds whole unused minutes, counting any started minute as used", () => {
    expect(unusedMinutes({ minutes: 20, isFree: false, startedAt }, at("2026-10-26T10:05:30Z"))).toBe(14);
    expect(unusedMinutes({ minutes: 20, isFree: false, startedAt }, at("2026-10-26T10:05:00Z"))).toBe(15);
  });
  it("never refunds below zero or for free chats", () => {
    expect(unusedMinutes({ minutes: 20, isFree: false, startedAt }, at("2026-10-26T11:00:00Z"))).toBe(0);
    expect(unusedMinutes({ minutes: 20, isFree: true, startedAt }, at("2026-10-26T10:01:00Z"))).toBe(0);
  });
  it("refunds everything when the chat never started", () => {
    expect(unusedMinutes({ minutes: 40, isFree: false, startedAt: null }, at("2026-10-26T10:01:00Z"))).toBe(40);
  });
  it("caps minutes used at the chat length", () => {
    expect(minutesUsed({ minutes: 20, startedAt }, at("2026-10-26T12:00:00Z"))).toBe(20);
  });
});

describe("timers", () => {
  it("counts down remaining seconds", () => {
    expect(secondsRemaining(at("2026-10-26T10:00:00Z"), 20, at("2026-10-26T10:19:00Z"))).toBe(60);
    expect(secondsRemaining(at("2026-10-26T10:00:00Z"), 20, at("2026-10-26T10:30:00Z"))).toBe(0);
  });
  it("expires requests after five minutes", () => {
    expect(isRequestExpired(at("2026-10-26T10:00:00Z"), at("2026-10-26T10:04:59Z"))).toBe(false);
    expect(isRequestExpired(at("2026-10-26T10:00:00Z"), at("2026-10-26T10:05:00Z"))).toBe(true);
  });
});

it("formats rupees", () => {
  expect(formatRupees(9900)).toBe("₹99");
  expect(formatRupees(24950)).toBe("₹249.50");
});
