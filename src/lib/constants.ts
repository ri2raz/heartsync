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
  // 7 Core Pillars
  "stress-wellbeing": "Stress and mental well-being",
  "loneliness-friendship": "Loneliness and friendship",
  "physical-health-energy": "Physical health and energy",
  "family-pressure-homesick": "Family pressure and homesickness",
  "academic-pressure-failure": "Academic pressure and failure",
  "safe-space-to-talk": "A safe space to talk",
  "life-beyond-exam": "Life beyond the exam",
  // Additional topics & backwards compatibility
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

export type SupportPillar = {
  id: string;
  num: string;
  title: string;
  tagline: string;
  description: string;
  slug: string;
  focus: string;
  badge?: string;
  isPriority?: boolean;
};

export const SUPPORT_PILLARS: readonly SupportPillar[] = [
  {
    id: "stress-wellbeing",
    num: "01",
    title: "Stress & mental well-being",
    tagline: "When your thoughts feel too loud and heavy to carry alone.",
    description: "Constant anxiety spirals, overthinking every outcome, and feeling mentally overloaded. Talk it out without holding back.",
    slug: "stress-wellbeing",
    focus: "Overthinking · Anxiety · Mental overload",
  },
  {
    id: "loneliness-friendship",
    num: "02",
    title: "Loneliness & friendship",
    tagline: "Surrounded by hundreds in coaching or hostel, but completely alone.",
    description: "Drifting apart from old school friends, feeling like no one truly understands what you're going through, or having no one to talk to on weekends.",
    slug: "loneliness-friendship",
    focus: "Hostel life · Drifting friends · Social isolation",
  },
  {
    id: "physical-health-energy",
    num: "03",
    title: "Physical health & energy",
    tagline: "Burnout, wrecked sleep cycles, and running on empty.",
    description: "Study fatigue, irregular sleep, chronic burnout, skipped meals, caffeine crashes, and somatic stress symptoms like tension headaches or tight chests.",
    slug: "physical-health-energy",
    badge: "Core focus",
    focus: "Study fatigue · Sleep debt · Somatic stress · Low energy",
    isPriority: true,
  },
  {
    id: "family-pressure-homesick",
    num: "04",
    title: "Family pressure & homesickness",
    tagline: "Loving them deeply, but suffocating under their silent expectations.",
    description: "Missing home-cooked food and family comfort while carrying the weight of financial sacrifices, comparisons with relatives, and parental hopes.",
    slug: "family-pressure-homesick",
    focus: "Parental expectations · Homesickness · Comparison",
  },
  {
    id: "academic-pressure-failure",
    num: "05",
    title: "Academic pressure & failure",
    tagline: "When mock test scores drop and the fear of failing paralyzes you.",
    description: "Backlogs piling up, syllabus overwhelm, drop-year anxiety, and the terrifying feeling that a single exam determines your entire worth.",
    slug: "academic-pressure-failure",
    focus: "Mock test scores · Drop years · Fear of failure",
  },
  {
    id: "safe-space-to-talk",
    num: "06",
    title: "A safe space to talk",
    tagline: "Zero judgment, no unsolicited lectures, and completely anonymous.",
    description: "A private corner where you don't have to pretend you're strong. Vent honestly, cry if you need to, or simply have someone listen quietly.",
    slug: "safe-space-to-talk",
    focus: "100% Anonymous · No judgment · Empathetic ears",
  },
  {
    id: "life-beyond-exam",
    num: "07",
    title: "Life beyond the exam",
    tagline: "You are so much bigger than a percentile or an entrance exam rank.",
    description: "Reconnecting with who you were before the exam took over your identity. Exploring alternative paths, passions, and life's possibilities.",
    slug: "life-beyond-exam",
    focus: "Identity · Plan B · Life perspectives",
  },
] as const;

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
