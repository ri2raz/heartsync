import "server-only";

import type { ChatSession, Prisma } from "@prisma/client";

import {
  CHAT_LENGTHS,
  FREE_CHAT_MINUTES,
  LISTENER_TITLES,
  MAX_MESSAGE_LENGTH,
  REPORT_REASONS,
  REQUEST_TIMEOUT_MS,
} from "./constants";
import { db } from "./db";
import { rateLimit } from "./rate-limit";
import { CRISIS_SYSTEM_MESSAGE, moderateMessage } from "./safety";
import {
  isListenerOnline,
  isRequestExpired,
  isTimeUp,
  minutesUsed,
  secondsRemaining,
  sessionEndsAt,
  unusedMinutes,
} from "./session-rules";

/** An error whose message is safe to show to the user. */
export class ServiceError extends Error {}

type Tx = Prisma.TransactionClient;

const OPEN_STATUSES = ["REQUESTED", "ACTIVE"];
const CRISIS_REPEAT_MS = 10 * 60 * 1000;

/**
 * Move a session out of REQUESTED or ACTIVE exactly once, refunding the seeker as needed.
 * The conditional update means two racing callers can never both refund.
 */
async function closeSession(
  tx: Tx,
  session: ChatSession,
  to: "ENDED" | "DECLINED" | "CANCELLED",
  reason: string,
  now: Date,
): Promise<boolean> {
  const from = session.status;
  if (from !== "REQUESTED" && from !== "ACTIVE") return false;

  const wasActive = from === "ACTIVE";
  // Time-up endings are stamped at the scheduled end, not when someone happened to notice.
  const endedAt =
    wasActive && session.startedAt && isTimeUp(session.startedAt, session.minutes, now)
      ? sessionEndsAt(session.startedAt, session.minutes)
      : now;
  const refund = wasActive ? unusedMinutes(session, endedAt) : session.isFree ? 0 : session.minutes;

  const { count } = await tx.chatSession.updateMany({
    where: { id: session.id, status: from },
    data: { status: to, endedAt, endReason: reason, minutesRefunded: refund },
  });
  if (count === 0) return false;

  if (refund > 0) {
    await tx.user.update({ where: { id: session.seekerId }, data: { minutesBalance: { increment: refund } } });
  }
  if (!wasActive && session.isFree) {
    // The free chat never happened, so give it back.
    await tx.user.update({ where: { id: session.seekerId }, data: { freeChatUsed: false } });
  }
  if (wasActive) {
    await tx.listenerProfile.update({
      where: { id: session.listenerId },
      data: { minutesHeard: { increment: minutesUsed(session, endedAt) } },
    });
    await tx.message.create({
      data: { sessionId: session.id, kind: "SYSTEM", body: endMessage(reason) },
    });
  }
  return true;
}

function endMessage(reason: string): string {
  switch (reason) {
    case "time_up":
      return "Time's up — this chat has ended. Take care of yourself today.";
    case "seeker_ended":
      return "The chat was ended. Thank you for opening up.";
    case "listener_ended":
      return "Your listener ended the chat. If something felt wrong, please report it.";
    case "moderation":
      return "This chat was ended and sent to our safety team for review.";
    default:
      return "This chat has ended.";
  }
}

async function touchListener(listenerId: string) {
  await db.listenerProfile.update({ where: { id: listenerId }, data: { lastSeenAt: new Date() } });
}

/** Apply any time-based transitions (expired requests, finished chats) and return the fresh row. */
export async function reconcileSession(sessionId: string, now: Date = new Date()) {
  const session = await db.chatSession.findUnique({ where: { id: sessionId } });
  if (!session) return null;

  if (session.status === "REQUESTED" && isRequestExpired(session.createdAt, now)) {
    await db.$transaction((tx) => closeSession(tx, session, "CANCELLED", "expired", now));
  } else if (session.status === "ACTIVE" && session.startedAt && isTimeUp(session.startedAt, session.minutes, now)) {
    await db.$transaction((tx) => closeSession(tx, session, "ENDED", "time_up", now));
  } else {
    return session;
  }
  return db.chatSession.findUnique({ where: { id: sessionId } });
}

async function reconcileOpenSessionsForSeeker(seekerId: string) {
  const open = await db.chatSession.findMany({
    where: { seekerId, status: { in: OPEN_STATUSES } },
    select: { id: true },
  });
  for (const s of open) await reconcileSession(s.id);
}

export async function requestSession(seekerId: string, listenerId: string, minutes: number) {
  if (!(CHAT_LENGTHS as readonly number[]).includes(minutes)) throw new ServiceError("Pick a valid chat length.");

  await reconcileOpenSessionsForSeeker(seekerId);

  return db.$transaction(async (tx) => {
    const listener = await tx.listenerProfile.findUnique({ where: { id: listenerId } });
    if (!listener || !listener.isActive) throw new ServiceError("This listener isn't available.");
    if (listener.userId === seekerId) throw new ServiceError("You can't start a chat with yourself.");
    if (!isListenerOnline(listener)) throw new ServiceError(`${listener.displayName} is offline right now. Try someone who's online.`);

    const busy = await tx.chatSession.findFirst({
      where: { listenerId, status: "ACTIVE" },
      select: { id: true },
    });
    if (busy) throw new ServiceError(`${listener.displayName} is in another chat. Try again in a bit.`);

    const existing = await tx.chatSession.findFirst({
      where: { seekerId, status: { in: OPEN_STATUSES } },
      select: { id: true },
    });
    if (existing) throw new ServiceError("You already have a chat open. Finish or cancel it first.");

    let isFree = false;
    if (minutes === FREE_CHAT_MINUTES) {
      const claimed = await tx.user.updateMany({
        where: { id: seekerId, freeChatUsed: false },
        data: { freeChatUsed: true },
      });
      isFree = claimed.count === 1;
    }
    if (!isFree) {
      const charged = await tx.user.updateMany({
        where: { id: seekerId, minutesBalance: { gte: minutes } },
        data: { minutesBalance: { decrement: minutes } },
      });
      if (charged.count === 0) throw new ServiceError("Not enough minutes. Top up to start this chat.");
    }

    return tx.chatSession.create({ data: { seekerId, listenerId, minutes, isFree } });
  });
}

async function loadForListener(listenerUserId: string, sessionId: string) {
  const session = await reconcileSession(sessionId);
  const profile = await db.listenerProfile.findUnique({ where: { userId: listenerUserId } });
  if (!session || !profile || session.listenerId !== profile.id) throw new ServiceError("Chat not found.");
  return { session, profile };
}

export async function acceptSession(listenerUserId: string, sessionId: string) {
  const { session, profile } = await loadForListener(listenerUserId, sessionId);
  if (session.status !== "REQUESTED") throw new ServiceError("This request is no longer waiting.");

  const busy = await db.chatSession.findFirst({ where: { listenerId: profile.id, status: "ACTIVE" } });
  if (busy) {
    const fresh = await reconcileSession(busy.id);
    if (fresh?.status === "ACTIVE") throw new ServiceError("Finish your current chat before accepting another.");
  }

  const now = new Date();
  await db.$transaction(async (tx) => {
    const { count } = await tx.chatSession.updateMany({
      where: { id: session.id, status: "REQUESTED" },
      data: { status: "ACTIVE", startedAt: now },
    });
    if (count === 0) throw new ServiceError("This request is no longer waiting.");
    const title = LISTENER_TITLES[profile.title as keyof typeof LISTENER_TITLES] ?? "Listener";
    await tx.message.create({
      data: {
        sessionId: session.id,
        kind: "SYSTEM",
        body:
          `${profile.displayName} (${title}) joined. You have ${session.minutes} minutes. ` +
          "This is peer support, not therapy. Keep it kind, keep it here — no numbers, handles or meetups.",
      },
    });
  });
}

export async function declineSession(listenerUserId: string, sessionId: string) {
  const { session } = await loadForListener(listenerUserId, sessionId);
  if (session.status !== "REQUESTED") throw new ServiceError("This request is no longer waiting.");
  await db.$transaction((tx) => closeSession(tx, session, "DECLINED", "declined", new Date()));
}

export async function cancelRequest(seekerId: string, sessionId: string) {
  const session = await reconcileSession(sessionId);
  if (!session || session.seekerId !== seekerId) throw new ServiceError("Chat not found.");
  if (session.status !== "REQUESTED") return;
  await db.$transaction((tx) => closeSession(tx, session, "CANCELLED", "cancelled", new Date()));
}

async function participantRole(userId: string, session: ChatSession): Promise<"seeker" | "listener" | null> {
  if (session.seekerId === userId) return "seeker";
  const profile = await db.listenerProfile.findUnique({ where: { id: session.listenerId }, select: { userId: true } });
  return profile?.userId === userId ? "listener" : null;
}

export async function endChat(userId: string, sessionId: string) {
  const session = await reconcileSession(sessionId);
  if (!session) throw new ServiceError("Chat not found.");
  const role = await participantRole(userId, session);
  if (!role) throw new ServiceError("Chat not found.");
  if (session.status !== "ACTIVE") return;
  await db.$transaction((tx) =>
    closeSession(tx, session, "ENDED", role === "seeker" ? "seeker_ended" : "listener_ended", new Date()),
  );
}

export type PostMessageResult = { ok: true } | { ok: false; error: string };

export async function postMessage(userId: string, sessionId: string, rawBody: string): Promise<PostMessageResult> {
  const body = rawBody.trim();
  if (!body) return { ok: false, error: "Message is empty." };
  if (body.length > MAX_MESSAGE_LENGTH) return { ok: false, error: `Keep messages under ${MAX_MESSAGE_LENGTH} characters.` };
  if (!rateLimit(`msg:${userId}`, 30, 60_000)) return { ok: false, error: "You're sending messages too fast. Slow down a little." };

  const session = await reconcileSession(sessionId);
  if (!session) return { ok: false, error: "Chat not found." };
  const role = await participantRole(userId, session);
  if (!role) return { ok: false, error: "Chat not found." };
  if (session.status !== "ACTIVE") return { ok: false, error: "This chat isn't active." };

  const result = moderateMessage(body);
  const now = new Date();

  await db.$transaction(async (tx) => {
    if (result.allowed) {
      await tx.message.create({ data: { sessionId, senderId: userId, body, kind: "TEXT" } });
    }
    if (result.crisis) {
      const lastCrisis = await tx.message.findFirst({
        where: { sessionId, kind: "CRISIS" },
        orderBy: { id: "desc" },
        select: { createdAt: true },
      });
      if (!session.crisisFlaggedAt) {
        await tx.chatSession.update({ where: { id: sessionId }, data: { crisisFlaggedAt: now } });
      }
      if (!lastCrisis || now.getTime() - lastCrisis.createdAt.getTime() > CRISIS_REPEAT_MS) {
        await tx.message.create({ data: { sessionId, kind: "CRISIS", body: CRISIS_SYSTEM_MESSAGE } });
      }
    }
  });

  return result.allowed ? { ok: true } : { ok: false, error: result.notice };
}

export async function getSessionView(userId: string, sessionId: string, afterId = 0) {
  const session = await reconcileSession(sessionId);
  if (!session) return null;
  const role = await participantRole(userId, session);
  if (!role) return null;
  if (role === "listener") await touchListener(session.listenerId);

  const [messages, details] = await Promise.all([
    db.message.findMany({
      where: { sessionId, id: { gt: afterId } },
      orderBy: { id: "asc" },
      take: 200,
      select: { id: true, body: true, kind: true, senderId: true, createdAt: true },
    }),
    db.chatSession.findUniqueOrThrow({
      where: { id: sessionId },
      select: {
        seeker: { select: { alias: true } },
        listener: { select: { displayName: true, title: true, avatarHue: true } },
      },
    }),
  ]);

  return {
    id: session.id,
    role,
    status: session.status,
    minutes: session.minutes,
    isFree: session.isFree,
    endReason: session.endReason,
    rating: session.rating,
    secondsRemaining:
      session.status === "ACTIVE" && session.startedAt ? secondsRemaining(session.startedAt, session.minutes) : null,
    requestExpiresAt:
      session.status === "REQUESTED" ? new Date(session.createdAt.getTime() + REQUEST_TIMEOUT_MS).toISOString() : null,
    crisisFlagged: Boolean(session.crisisFlaggedAt),
    seekerAlias: details.seeker.alias,
    listener: details.listener,
    messages: messages.map((m) => ({
      id: m.id,
      body: m.body,
      kind: m.kind as "TEXT" | "SYSTEM" | "CRISIS",
      mine: m.senderId === userId,
      createdAt: m.createdAt.toISOString(),
    })),
  };
}

export type SessionView = NonNullable<Awaited<ReturnType<typeof getSessionView>>>;

export async function rateSession(seekerId: string, sessionId: string, rating: number, feedback: string | null) {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new ServiceError("Pick a rating from 1 to 5.");
  const session = await db.chatSession.findUnique({ where: { id: sessionId } });
  if (!session || session.seekerId !== seekerId) throw new ServiceError("Chat not found.");
  if (session.status !== "ENDED") throw new ServiceError("You can rate a chat once it has ended.");

  await db.$transaction(async (tx) => {
    const { count } = await tx.chatSession.updateMany({
      where: { id: sessionId, rating: null },
      data: { rating, feedback: feedback?.slice(0, 500) || null },
    });
    if (count === 0) throw new ServiceError("You've already rated this chat.");
    await tx.listenerProfile.update({
      where: { id: session.listenerId },
      data: { ratingSum: { increment: rating }, ratingCount: { increment: 1 } },
    });
  });
}

export async function reportSession(userId: string, sessionId: string, reason: string, details: string | null) {
  if (!(REPORT_REASONS as readonly string[]).includes(reason)) throw new ServiceError("Pick a reason.");
  const session = await reconcileSession(sessionId);
  if (!session) throw new ServiceError("Chat not found.");
  const role = await participantRole(userId, session);
  if (!role) throw new ServiceError("Chat not found.");

  await db.report.upsert({
    where: { sessionId_reporterId: { sessionId, reporterId: userId } },
    create: { sessionId, reporterId: userId, reason, details: details?.slice(0, 1000) || null },
    update: { reason, details: details?.slice(0, 1000) || null, status: "OPEN" },
  });

  // Reporting always ends a live chat so nobody has to keep talking to someone they flagged.
  if (session.status === "ACTIVE") {
    await db.$transaction((tx) => closeSession(tx, session, "ENDED", "moderation", new Date()));
  } else if (session.status === "REQUESTED") {
    await db.$transaction((tx) => closeSession(tx, session, "CANCELLED", "moderation", new Date()));
  }
}

export async function pendingRequestsForListener(listenerUserId: string) {
  const profile = await db.listenerProfile.findUnique({ where: { userId: listenerUserId } });
  if (!profile) return null;
  await touchListener(profile.id);
  const candidates = await db.chatSession.findMany({
    where: { listenerId: profile.id, status: { in: OPEN_STATUSES } },
    select: { id: true },
  });
  for (const c of candidates) await reconcileSession(c.id);

  const sessions = await db.chatSession.findMany({
    where: { listenerId: profile.id, status: { in: OPEN_STATUSES } },
    orderBy: { createdAt: "asc" },
    select: { id: true, status: true, minutes: true, createdAt: true, seeker: { select: { alias: true } } },
  });
  return {
    isOnline: profile.isOnline,
    requests: sessions
      .filter((s) => s.status === "REQUESTED")
      .map((s) => ({ id: s.id, minutes: s.minutes, alias: s.seeker.alias, createdAt: s.createdAt.toISOString() })),
    active: sessions.find((s) => s.status === "ACTIVE")?.id ?? null,
  };
}
