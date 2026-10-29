"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import type { FormState } from "@/lib/form";

export async function toggleFavorite(listenerProfileId: string): Promise<{ favorited: boolean }> {
  const user = await requireUser();
  const existing = await db.favoriteListener.findUnique({
    where: {
      userId_listenerId: {
        userId: user.id,
        listenerId: listenerProfileId,
      },
    },
  });

  if (existing) {
    await db.favoriteListener.delete({ where: { id: existing.id } });
    revalidatePath(`/listeners/${listenerProfileId}`);
    revalidatePath("/listeners");
    revalidatePath("/account");
    return { favorited: false };
  } else {
    await db.favoriteListener.create({
      data: {
        userId: user.id,
        listenerId: listenerProfileId,
      },
    });
    revalidatePath(`/listeners/${listenerProfileId}`);
    revalidatePath("/listeners");
    revalidatePath("/account");
    return { favorited: true };
  }
}

export async function isFavorite(listenerProfileId: string): Promise<boolean> {
  try {
    const user = await requireUser();
    const count = await db.favoriteListener.count({
      where: {
        userId: user.id,
        listenerId: listenerProfileId,
      },
    });
    return count > 0;
  } catch {
    return false;
  }
}

export async function createBooking(
  listenerProfileId: string,
  scheduledForIso: string,
  minutes = 20,
  topic?: string,
  note?: string,
): Promise<{ ok: boolean; error?: string; bookingId?: string }> {
  const user = await requireUser();
  if (user.role !== "SEEKER") {
    return { ok: false, error: "Only seekers can book scheduled chats." };
  }

  const listener = await db.listenerProfile.findUnique({
    where: { id: listenerProfileId },
    select: { id: true, displayName: true, user: { select: { email: true } } },
  });
  if (!listener) return { ok: false, error: "Listener not found." };

  const scheduledFor = new Date(scheduledForIso);
  if (isNaN(scheduledFor.getTime()) || scheduledFor.getTime() <= Date.now()) {
    return { ok: false, error: "Please pick a date and time in the future." };
  }

  const booking = await db.scheduledBooking.create({
    data: {
      seekerId: user.id,
      listenerId: listenerProfileId,
      scheduledFor,
      minutes,
      topic: topic?.slice(0, 50) || null,
      note: note?.slice(0, 300) || null,
      status: "CONFIRMED",
    },
  });

  revalidatePath("/account");
  revalidatePath("/listener/dashboard");
  return { ok: true, bookingId: booking.id };
}

export async function cancelBooking(bookingId: string): Promise<FormState> {
  const user = await requireUser();
  const booking = await db.scheduledBooking.findUnique({
    where: { id: bookingId },
    include: { listener: true },
  });
  if (!booking || (booking.seekerId !== user.id && booking.listener.userId !== user.id)) {
    return { error: "Booking not found." };
  }

  await db.scheduledBooking.update({
    where: { id: bookingId },
    data: { status: "CANCELLED" },
  });

  revalidatePath("/account");
  revalidatePath("/listener/dashboard");
  return { success: "Scheduled booking cancelled." };
}
