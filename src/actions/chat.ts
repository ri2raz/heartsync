"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth";
import {
  acceptSession,
  cancelRequest,
  declineSession,
  endChat,
  rateSession,
  reportSession,
  requestSession,
  ServiceError,
} from "@/lib/chat-service";
import { str, type FormState } from "@/lib/form";
import { clientIp } from "@/lib/request";

async function run(fn: () => Promise<unknown>): Promise<FormState> {
  try {
    await fn();
    return { error: null };
  } catch (err) {
    if (err instanceof ServiceError) return { error: err.message };
    throw err;
  }
}

export async function startChat(_prev: FormState, form: FormData): Promise<FormState> {
  const listenerId = str(form, "listenerId");
  const user = await requireUser(`/listeners/${listenerId}`);
  if (user.role !== "SEEKER") return { error: "Only seeker accounts can start chats." };
  const minutes = Number(str(form, "minutes"));

  let sessionId: string;
  try {
    const ip = await clientIp();
    sessionId = (await requestSession(user.id, listenerId, minutes, ip)).id;
  } catch (err) {
    if (err instanceof ServiceError) return { error: err.message };
    throw err;
  }
  redirect(`/chat/${sessionId}`);
}

export async function cancelChatRequest(sessionId: string): Promise<FormState> {
  const user = await requireUser();
  return run(() => cancelRequest(user.id, sessionId));
}

export async function endActiveChat(sessionId: string): Promise<FormState> {
  const user = await requireUser();
  return run(() => endChat(user.id, sessionId));
}

export async function acceptChat(sessionId: string): Promise<FormState> {
  const user = await requireUser();
  if (user.role !== "LISTENER") return { error: "Only listeners can accept chats." };
  const ip = await clientIp();
  const result = await run(() => acceptSession(user.id, sessionId, ip));
  if (result.error) return result;
  redirect(`/chat/${sessionId}`);
}

export async function declineChat(sessionId: string): Promise<FormState> {
  const user = await requireUser();
  if (user.role !== "LISTENER") return { error: "Only listeners can decline chats." };
  const result = await run(() => declineSession(user.id, sessionId));
  revalidatePath("/listener/dashboard");
  return result;
}

export async function rateChat(_prev: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser();
  const sessionId = str(form, "sessionId");
  const result = await run(() =>
    rateSession(user.id, sessionId, Number(str(form, "rating")), str(form, "feedback").trim() || null),
  );
  return result.error ? result : { success: "Thank you — your rating helps keep HeartSync safe and kind." };
}

export async function reportChat(_prev: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser();
  const sessionId = str(form, "sessionId");
  const ip = await clientIp();
  const result = await run(() =>
    reportSession(user.id, sessionId, str(form, "reason"), str(form, "details").trim() || null, ip),
  );
  return result.error ? result : { success: "Report sent. Our safety team reviews every report, usually within 24 hours." };
}
