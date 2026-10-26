"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireUser } from "@/lib/auth";
import { LANGUAGES, LISTENER_TITLES, TOPICS } from "@/lib/constants";
import { db } from "@/lib/db";
import { sendAdminEmail } from "@/lib/email";
import { fieldErrorsFrom, keep, str, type FormState } from "@/lib/form";

const languageCodes = Object.keys(LANGUAGES) as [string, ...string[]];
const topicSlugs = Object.keys(TOPICS) as [string, ...string[]];
const titleKeys = Object.keys(LISTENER_TITLES) as [string, ...string[]];

const applicationSchema = z.object({
  fullName: z.string().trim().min(3, "Enter your full legal name.").max(80),
  phone: z
    .string()
    .trim()
    .regex(/^(\+91[\s-]?)?[6-9]\d{9}$/, "Enter a valid Indian mobile number."),
  city: z.string().trim().min(2, "Enter your city.").max(60),
  title: z.enum(titleKeys, "Choose how you'd like to be introduced."),
  languages: z.array(z.enum(languageCodes)).min(1, "Pick at least one language.").max(5),
  topics: z.array(z.enum(topicSlugs)).min(1, "Pick at least one topic.").max(10),
  about: z.string().trim().min(80, "Tell us a bit more — at least 80 characters.").max(800),
  motivation: z.string().trim().min(80, "Tell us a bit more — at least 80 characters.").max(800),
  conduct: z.literal("on", "You need to accept the listener code of conduct."),
  verification: z.literal("on", "You need to agree to ID and police verification."),
});

export async function applyAsListener(_prev: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser("/become-a-listener");
  if (user.role !== "SEEKER") return { error: "This account is already a listener or admin." };

  const existing = await db.listenerApplication.findUnique({ where: { userId: user.id } });
  if (existing && existing.status !== "REJECTED") {
    return { error: "You've already applied. We'll email you once your application has been reviewed." };
  }

  const parsed = applicationSchema.safeParse({
    fullName: str(form, "fullName"),
    phone: str(form, "phone").replace(/\s+/g, ""),
    city: str(form, "city"),
    title: str(form, "title"),
    languages: form.getAll("languages"),
    topics: form.getAll("topics"),
    about: str(form, "about"),
    motivation: str(form, "motivation"),
    conduct: form.get("conduct") ?? undefined,
    verification: form.get("verification") ?? undefined,
  });
  if (!parsed.success) {
    return {
      fieldErrors: fieldErrorsFrom(parsed.error),
      values: keep(form, ["fullName", "phone", "city", "title", "about", "motivation"], ["languages", "topics"]),
    };
  }

  const data = {
    fullName: parsed.data.fullName,
    phone: parsed.data.phone,
    city: parsed.data.city,
    title: parsed.data.title,
    languages: parsed.data.languages.join(","),
    topics: parsed.data.topics.join(","),
    about: parsed.data.about,
    motivation: parsed.data.motivation,
    status: "PENDING",
    reviewNote: null,
    reviewedAt: null,
  };
  await db.listenerApplication.upsert({
    where: { userId: user.id },
    create: { userId: user.id, ...data },
    update: data,
  });

  // Notify admin
  await sendAdminEmail({
    type: "application",
    title: `New Listener Application: ${data.fullName}`,
    senderName: data.fullName,
    senderEmail: user.email,
    subject: `Application for ${data.title} (${data.city})`,
    details: `About:\n${data.about}\n\nMotivation:\n${data.motivation}`,
    metadata: {
      Phone: data.phone,
      City: data.city,
      Role: data.title,
      Languages: data.languages,
      Topics: data.topics,
    },
  });

  revalidatePath("/become-a-listener");
  return { success: "Application received! Our team will contact you for ID and police verification." };
}

export async function setOnline(online: boolean): Promise<FormState> {
  const user = await requireUser();
  if (user.role !== "LISTENER" || !user.listenerProfile) return { error: "Only listeners can go online." };
  if (!user.listenerProfile.isActive) return { error: "Your listener profile is paused. Contact the safety team." };
  await db.listenerProfile.update({ where: { userId: user.id }, data: { isOnline: online, lastSeenAt: new Date() } });
  revalidatePath("/listener/dashboard");
  revalidatePath("/listeners");
  revalidatePath(`/listeners/${user.listenerProfile.id}`);

  // Notify admin in real time
  await sendAdminEmail({
    type: "listener_online",
    title: online
      ? `🟢 Listener Online: ${user.listenerProfile.displayName}`
      : `⚪ Listener Offline: ${user.listenerProfile.displayName}`,
    senderName: user.listenerProfile.displayName,
    senderEmail: user.email,
    subject: online ? `Listener is ONLINE & available for chats` : `Listener changed presence to OFFLINE`,
    details: `${user.listenerProfile.displayName} changed status to ${online ? "ONLINE (Active)" : "OFFLINE"}.`,
    metadata: {
      "Listener ID": user.listenerProfile.id,
      "Display Name": user.listenerProfile.displayName,
      "Status": online ? "ONLINE (Available)" : "OFFLINE",
      "Languages": user.listenerProfile.languages,
      "Topics": user.listenerProfile.topics,
      "Time": new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) + " IST",
    },
  }).catch((e) => console.error("[HeartSync] Listener online email error:", e));

  return { error: null };
}

const profileSchema = z.object({
  displayName: z.string().trim().min(2).max(30),
  bio: z.string().trim().min(40, "Write at least 40 characters.").max(600),
  languages: z.array(z.enum(languageCodes)).min(1, "Pick at least one language.").max(5),
  topics: z.array(z.enum(topicSlugs)).min(1, "Pick at least one topic.").max(10),
});

export async function updateListenerProfile(_prev: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser();
  if (user.role !== "LISTENER" || !user.listenerProfile) return { error: "Only listeners can edit a listener profile." };
  const parsed = profileSchema.safeParse({
    displayName: str(form, "displayName"),
    bio: str(form, "bio"),
    languages: form.getAll("languages"),
    topics: form.getAll("topics"),
  });
  if (!parsed.success) return { fieldErrors: fieldErrorsFrom(parsed.error) };
  await db.listenerProfile.update({
    where: { userId: user.id },
    data: {
      displayName: parsed.data.displayName,
      bio: parsed.data.bio,
      languages: parsed.data.languages.join(","),
      topics: parsed.data.topics.join(","),
    },
  });
  revalidatePath("/listener/dashboard");
  revalidatePath(`/listeners/${user.listenerProfile.id}`);
  return { success: "Profile saved." };
}
