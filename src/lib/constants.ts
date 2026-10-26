export const APP_NAME = "HeartSync";
export const TAGLINE_HI = "Kisi se baat karni hai?";
export const TAGLINE_HI_ACCENT = "Bina judge kiye sunne wale.";
export const TAGLINE_EN =
  "Talk to a verified big bro or big sis — anonymously, safely, in your language.";

export const ROLES = ["SEEKER", "LISTENER", "ADMIN"] as const;
export type Role = (typeof ROLES)[number];

export const SESSION_STATUSES = ["REQUESTED", "ACTIVE", "ENDED", "DECLINED", "CANCELLED"] as const;
export type SessionStatus = (typeof SESSION_STATUSES)[number];

export const LISTENER_TITLES = {
  BIG_BRO: "Big Bro",
  BIG_SIS: "Big Sis",
  BIG_SIB: "Big Sib",
} as const;
export type ListenerTitle = keyof typeof LISTENER_TITLES;

export const LANGUAGES = {
  hi: "Hindi",
  en: "English",
  bn: "Bengali",
  mr: "Marathi",
  ta: "Tamil",
  te: "Telugu",
  gu: "Gujarati",
  pa: "Punjabi",
  kn: "Kannada",
  ml: "Malayalam",
} as const;
export type LanguageCode = keyof typeof LANGUAGES;

export const TOPICS = {
  exams: "Exam pressure",
  career: "Career confusion",
  breakups: "Breakups",
  loneliness: "Loneliness",
  family: "Family pressure",
  "new-city": "New city, no friends",
  friendship: "Friendship issues",
  overthinking: "Overthinking",
  "self-worth": "Self-worth",
  work: "Work stress",
} as const;
export type TopicSlug = keyof typeof TOPICS;

/** Length of the free first chat, in minutes. */
export const FREE_CHAT_MINUTES = 20;
/** Chat lengths a seeker can pick. */
export const CHAT_LENGTHS = [20, 40, 60] as const;
/** A request nobody accepts within this window is cancelled and refunded. */
export const REQUEST_TIMEOUT_MS = 5 * 60 * 1000;
export const MAX_MESSAGE_LENGTH = 1000;
/** A listener counts as online only if their dashboard or chat has checked in this recently. */
export const ONLINE_GRACE_MS = 2 * 60 * 1000;

export const PACKS = [
  {
    id: "quick",
    name: "Quick Baat",
    minutes: 20,
    pricePaise: 9900,
    blurb: "When you just need to get it off your chest.",
  },
  {
    id: "dil-se",
    name: "Dil Se",
    minutes: 60,
    pricePaise: 24900,
    blurb: "Time for a proper, unhurried conversation.",
    featured: true,
  },
  {
    id: "saathi",
    name: "Saathi",
    minutes: 150,
    pricePaise: 54900,
    blurb: "For the weeks when you need someone around.",
  },
] as const;
export type Pack = (typeof PACKS)[number];
export type PackId = Pack["id"];

export const HELPLINES = [
  { name: "Tele-MANAS (24×7, free, Govt. of India)", number: "14416", alt: "1-800-891-4416" },
  { name: "Emergency", number: "112" },
  { name: "Women helpline", number: "181" },
  { name: "Childline (under 18)", number: "1098" },
] as const;

export const REPORT_REASONS = [
  "Romantic or sexual talk",
  "Asked for contact details or to meet",
  "Asked for money",
  "Harassment or abuse",
  "Gave medical or harmful advice",
  "Something else",
] as const;

/** Shown on legal pages. Set NEXT_PUBLIC_SUPPORT_EMAIL / NEXT_PUBLIC_GRIEVANCE_OFFICER before launch. */
export const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@example.com";
export const GRIEVANCE_OFFICER = process.env.NEXT_PUBLIC_GRIEVANCE_OFFICER || "Grievance Officer (name to be published before launch)";
