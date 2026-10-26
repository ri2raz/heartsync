/**
 * Message safety checks, run on the server before any chat message is stored.
 *
 * Blocks: sharing contact details or trying to meet, money requests outside the
 * platform, and romantic or sexual solicitation. These keep HeartSync a
 * platonic, on-platform peer-support space.
 *
 * Crisis language is never blocked. The message is delivered, the session is
 * flagged for the safety team, and both people see helpline numbers.
 */

export type BlockCategory = "contact" | "money" | "romantic";

export type ModerationResult =
  | { allowed: true; crisis: boolean }
  | { allowed: false; crisis: boolean; category: BlockCategory; notice: string };

const NOTICES: Record<BlockCategory, string> = {
  contact:
    "For everyone's safety, phone numbers, social handles, links and meeting up aren't allowed. Keep the conversation here.",
  money:
    "Payments only happen through HeartSync. Never send or ask for money directly.",
  romantic:
    "HeartSync is strictly platonic. Romantic or sexual messages aren't allowed.",
};

const CONTACT_PHRASES = [
  "my number",
  "your number",
  "ur number",
  "phone number",
  "mobile number",
  "number de",
  "number do",
  "number bhej",
  "number send",
  "call me on",
  "text me on",
  "add me on",
  "follow me on",
  "dm me",
  "let's meet",
  "lets meet",
  "can we meet",
  "shall we meet",
  "meet me",
  "meet in person",
  "milte hai kya",
  "milte hain kya",
  "mil sakte",
  "milna hai",
  "mil lo",
  "my address",
  "your address",
];

const PLATFORMS = [
  "instagram",
  "insta",
  "whatsapp",
  "watsapp",
  "whats app",
  "snapchat",
  "snap",
  "telegram",
  "facebook",
  "fb",
  "discord",
  "twitter",
];

/** Words that, next to a platform name, signal an attempt to move off HeartSync. */
const SHARING_WORDS = ["id", "handle", "username", "add", "follow", "dm", "message me", "pe aa", "par aa", "number", "link"];

const MONEY_PHRASES = [
  "send money",
  "send me money",
  "pay me",
  "upi id",
  "my upi",
  "your upi",
  "gpay me",
  "gpay kar",
  "paytm me",
  "paytm kar",
  "phonepe kar",
  "paise bhej",
  "paise de do",
  "paise do",
  "transfer money",
];

const ROMANTIC_PHRASES = [
  "send nudes",
  "nudes",
  "nude pic",
  "sext",
  "sexting",
  "sexy",
  "hook up",
  "hookup",
  "be my girlfriend",
  "be my boyfriend",
  "be my gf",
  "be my bf",
  "date me",
  "go on a date",
  "kiss you",
  "send pic",
  "send your pic",
  "send photo",
  "send your photo",
  "pic bhej",
  "photo bhej",
  "gf banogi",
  "bf banoge",
  "girlfriend banogi",
  "boyfriend banoge",
];

const CRISIS_PHRASES = [
  "suicide",
  "suicidal",
  "kill myself",
  "killing myself",
  "end my life",
  "end it all",
  "want to die",
  "wanna die",
  "don't want to live",
  "dont want to live",
  "no reason to live",
  "better off dead",
  "self harm",
  "self-harm",
  "hurt myself",
  "cut myself",
  "cutting myself",
  "overdose",
  "khudkushi",
  "khud khushi",
  "aatmahatya",
  "atmahatya",
  "mar jaana chahta",
  "mar jana chahta",
  "mar jaana chahti",
  "mar jana chahti",
  "marna chahta",
  "marna chahti",
  "jeena nahi chahta",
  "jeena nahi chahti",
  "jina nahi chahta",
  "jina nahi chahti",
  "jeene ka mann nahi",
  "zindagi khatam",
  "khatam kar lunga",
  "khatam kar lungi",
  "sab khatam kar",
];

const EMAIL_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;
const URL_RE = /(https?:\/\/|www\.)\S+|\b[a-z0-9-]+\.(com|in|net|org|io|me|co|app|link|ly|gg|xyz)\b/i;
const HANDLE_RE = /(^|\s)@[a-z0-9_.]{3,}/i;
/** Indian mobile numbers, with or without +91 and separators. */
const IN_MOBILE_RE = /(?:\+?91[\s-]?)?(?<!\d)[6-9]\d{4}[\s-]?\d{5}(?!\d)/;
/** Any 10+ digit run, e.g. landlines or numbers typed without a leading 6-9. */
const LONG_DIGITS_RE = /\d{10,}/;

export function normalize(text: string): string {
  return text
    .normalize("NFKC")
    .replace(/[​-‍﻿]/g, "")
    .replace(/[‘’]/g, "'")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function compilePhrases(phrases: readonly string[]): RegExp {
  const alternatives = phrases.map(escapeRegExp).join("|");
  return new RegExp(`(^|[^a-z])(?:${alternatives})($|[^a-z])`);
}

const CONTACT_PHRASE_RE = compilePhrases(CONTACT_PHRASES);
const PLATFORM_RE = compilePhrases(PLATFORMS);
const SHARING_RE = compilePhrases(SHARING_WORDS);
const MONEY_RE = compilePhrases(MONEY_PHRASES);
const ROMANTIC_RE = compilePhrases(ROMANTIC_PHRASES);
const CRISIS_RE = compilePhrases(CRISIS_PHRASES);

export function containsContactInfo(text: string): boolean {
  const t = normalize(text);
  return (
    EMAIL_RE.test(t) ||
    URL_RE.test(t) ||
    HANDLE_RE.test(t) ||
    IN_MOBILE_RE.test(t) ||
    LONG_DIGITS_RE.test(t) ||
    CONTACT_PHRASE_RE.test(t) ||
    (PLATFORM_RE.test(t) && SHARING_RE.test(t))
  );
}

export function containsMoneyRequest(text: string): boolean {
  return MONEY_RE.test(normalize(text));
}

export function containsRomanticSolicitation(text: string): boolean {
  return ROMANTIC_RE.test(normalize(text));
}

export function containsCrisisLanguage(text: string): boolean {
  return CRISIS_RE.test(normalize(text));
}

export function moderateMessage(text: string): ModerationResult {
  const crisis = containsCrisisLanguage(text);
  const category: BlockCategory | null = containsContactInfo(text)
    ? "contact"
    : containsMoneyRequest(text)
      ? "money"
      : containsRomanticSolicitation(text)
        ? "romantic"
        : null;

  if (category) return { allowed: false, crisis, category, notice: NOTICES[category] };
  return { allowed: true, crisis };
}

export const CRISIS_SYSTEM_MESSAGE =
  "It sounds like things are really heavy right now. You don't have to go through this alone. " +
  "Please call Tele-MANAS on 14416 (free, 24×7) or 112 if you are in immediate danger. " +
  "Our safety team has been alerted and your listener is here with you.";
