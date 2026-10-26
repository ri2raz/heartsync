import { ONLINE_GRACE_MS, REQUEST_TIMEOUT_MS } from "./constants";

/** Pure rules for chat sessions and accounts. Kept free of I/O so they can be unit-tested. */

export function ageInYears(dateOfBirth: Date, now: Date = new Date()): number {
  let age = now.getUTCFullYear() - dateOfBirth.getUTCFullYear();
  const beforeBirthday =
    now.getUTCMonth() < dateOfBirth.getUTCMonth() ||
    (now.getUTCMonth() === dateOfBirth.getUTCMonth() && now.getUTCDate() < dateOfBirth.getUTCDate());
  if (beforeBirthday) age -= 1;
  return age;
}

export function isAdult(dateOfBirth: Date, now: Date = new Date()): boolean {
  return ageInYears(dateOfBirth, now) >= 18;
}

export function sessionEndsAt(startedAt: Date, minutes: number): Date {
  return new Date(startedAt.getTime() + minutes * 60_000);
}

export function secondsRemaining(startedAt: Date, minutes: number, now: Date = new Date()): number {
  return Math.max(0, Math.floor((sessionEndsAt(startedAt, minutes).getTime() - now.getTime()) / 1000));
}

export function isRequestExpired(createdAt: Date, now: Date = new Date()): boolean {
  return now.getTime() - createdAt.getTime() >= REQUEST_TIMEOUT_MS;
}

export function isTimeUp(startedAt: Date, minutes: number, now: Date = new Date()): boolean {
  return now.getTime() >= sessionEndsAt(startedAt, minutes).getTime();
}

/**
 * Minutes to give back to a seeker when a paid chat ends early.
 * Any started minute counts as used. Free chats never refund minutes.
 */
export function unusedMinutes(
  session: { minutes: number; isFree: boolean; startedAt: Date | null },
  endedAt: Date,
): number {
  if (session.isFree) return 0;
  if (!session.startedAt) return session.minutes;
  const elapsedMs = Math.max(0, endedAt.getTime() - session.startedAt.getTime());
  const used = Math.ceil(elapsedMs / 60_000);
  return Math.max(0, session.minutes - used);
}

export function minutesUsed(session: { minutes: number; startedAt: Date | null }, endedAt: Date): number {
  if (!session.startedAt) return 0;
  const elapsedMs = Math.max(0, endedAt.getTime() - session.startedAt.getTime());
  return Math.min(session.minutes, Math.ceil(elapsedMs / 60_000));
}

export function isListenerOnline(
  listener: { isOnline: boolean; isActive?: boolean; lastSeenAt: Date | null },
  now: Date = new Date(),
): boolean {
  if (listener.isActive === false || !listener.isOnline || !listener.lastSeenAt) return false;
  return now.getTime() - listener.lastSeenAt.getTime() <= ONLINE_GRACE_MS;
}

/** Listeners sorted for display: online first, then by number of ratings. */
export function withPresence<T extends { isOnline: boolean; lastSeenAt: Date | null; ratingCount: number }>(
  listeners: T[],
  now: Date = new Date(),
): T[] {
  return listeners
    .map((l) => ({ ...l, isOnline: isListenerOnline(l, now) }))
    .sort((a, b) => Number(b.isOnline) - Number(a.isOnline) || b.ratingCount - a.ratingCount);
}

export function formatRupees(paise: number): string {
  const rupees = paise / 100;
  return `₹${Number.isInteger(rupees) ? rupees : rupees.toFixed(2)}`;
}
