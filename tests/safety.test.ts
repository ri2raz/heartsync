import { describe, expect, it } from "vitest";

import {
  containsContactInfo,
  containsCrisisLanguage,
  containsMoneyRequest,
  containsRomanticSolicitation,
  moderateMessage,
} from "@/lib/safety";

describe("contact details", () => {
  it.each([
    "call me 9876543210",
    "my no is +91 98765 43210",
    "98765-43210",
    "write to me at riya.k@gmail.com",
    "check www.example.com",
    "https://t.me/someone",
    "add me @riya_k",
    "what's your insta id?",
    "whatsapp pe aa jao",
    "give me your number",
    "can we meet tomorrow?",
    "kal milte hai kya",
    "send me your address",
  ])("blocks %s", (text) => {
    expect(containsContactInfo(text)).toBe(true);
  });

  it.each([
    "I scored 98 in maths and 87 in physics",
    "my exam is on 12 March 2026",
    "I saw a reel on insta that made me sad",
    "my friends meet up without me and I feel left out",
    "I took a snap decision and regret it",
    "please update me on how you feel",
    "my rank was 14500",
  ])("allows %s", (text) => {
    expect(containsContactInfo(text)).toBe(false);
  });
});

describe("money", () => {
  it("blocks requests to pay off-platform", () => {
    expect(containsMoneyRequest("send me money on gpay")).toBe(true);
    expect(containsMoneyRequest("what's your UPI ID")).toBe(true);
    expect(containsMoneyRequest("paise bhej do")).toBe(true);
  });
  it("allows talking about money worries", () => {
    expect(containsMoneyRequest("I'm stressed about my fees and money at home")).toBe(false);
  });
});

describe("romantic or sexual solicitation", () => {
  it("blocks solicitation", () => {
    expect(containsRomanticSolicitation("be my girlfriend")).toBe(true);
    expect(containsRomanticSolicitation("send pic na")).toBe(true);
    expect(containsRomanticSolicitation("you sound sexy")).toBe(true);
  });
  it("allows talking about relationships and harassment", () => {
    expect(containsRomanticSolicitation("my girlfriend broke up with me")).toBe(false);
    expect(containsRomanticSolicitation("someone sent me sexual messages and I feel scared")).toBe(false);
    expect(containsRomanticSolicitation("please update me later")).toBe(false);
  });
});

describe("crisis language", () => {
  it.each([
    "I want to die",
    "sometimes I think about suicide",
    "I don’t want to live anymore",
    "main mar jaana chahta hoon",
    "jeena nahi chahti",
    "I've been cutting myself",
  ])("detects %s", (text) => {
    expect(containsCrisisLanguage(text)).toBe(true);
  });

  it("does not fire on ordinary sadness", () => {
    expect(containsCrisisLanguage("I'm dying to know my result lol")).toBe(false);
    expect(containsCrisisLanguage("I feel low today")).toBe(false);
  });
});

describe("moderateMessage", () => {
  it("delivers crisis messages and flags them", () => {
    expect(moderateMessage("I want to die")).toEqual({ allowed: true, crisis: true });
  });

  it("still flags crisis when the message is blocked", () => {
    const result = moderateMessage("I want to end my life, call me 9876543210");
    expect(result.allowed).toBe(false);
    expect(result.crisis).toBe(true);
  });

  it("allows ordinary messages", () => {
    expect(moderateMessage("Exams are stressing me out")).toEqual({ allowed: true, crisis: false });
  });
});
