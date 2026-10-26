"use server";

import { revalidatePath } from "next/cache";

import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import type { FormState } from "@/lib/form";
import { hueFromString } from "@/lib/utils";

export async function approveApplication(applicationId: string): Promise<FormState> {
  await requireRole("ADMIN");
  const app = await db.listenerApplication.findUnique({ where: { id: applicationId }, include: { user: true } });
  if (!app || app.status !== "PENDING") return { error: "Application not found or already reviewed." };
  if (app.user.role !== "SEEKER") return { error: "This user already has a different role." };

  const displayName = app.fullName.split(/\s+/)[0] ?? app.user.alias;
  await db.$transaction([
    db.listenerApplication.update({ where: { id: app.id }, data: { status: "APPROVED", reviewedAt: new Date() } }),
    db.user.update({ where: { id: app.userId }, data: { role: "LISTENER" } }),
    db.listenerProfile.create({
      data: {
        userId: app.userId,
        displayName,
        title: app.title,
        bio: app.about,
        languages: app.languages,
        topics: app.topics,
        avatarHue: hueFromString(app.userId),
        isOnline: true,
        lastSeenAt: new Date(),
      },
    }),
  ]);
  revalidatePath("/admin");
  return { success: `${displayName} is now a listener.` };
}

export async function rejectApplication(applicationId: string): Promise<FormState> {
  await requireRole("ADMIN");
  const { count } = await db.listenerApplication.updateMany({
    where: { id: applicationId, status: "PENDING" },
    data: { status: "REJECTED", reviewedAt: new Date() },
  });
  revalidatePath("/admin");
  return count ? { success: "Application rejected." } : { error: "Application not found or already reviewed." };
}

export async function resolveReport(reportId: string): Promise<FormState> {
  await requireRole("ADMIN");
  await db.report.updateMany({ where: { id: reportId }, data: { status: "RESOLVED" } });
  revalidatePath("/admin");
  return { success: "Report resolved." };
}

export async function setListenerActive(listenerId: string, active: boolean): Promise<FormState> {
  await requireRole("ADMIN");
  await db.listenerProfile.update({
    where: { id: listenerId },
    data: active ? { isActive: true } : { isActive: false, isOnline: false },
  });
  revalidatePath("/admin");
  revalidatePath("/listeners");
  return { success: active ? "Listener re-activated." : "Listener paused." };
}

export async function suspendUser(userId: string): Promise<FormState> {
  const admin = await requireRole("ADMIN");
  if (admin.id === userId) return { error: "You can't suspend yourself." };
  await db.$transaction([
    db.user.update({ where: { id: userId }, data: { isSuspended: true } }),
    db.listenerProfile.updateMany({ where: { userId }, data: { isActive: false, isOnline: false } }),
  ]);
  revalidatePath("/admin");
  return { success: "User suspended." };
}

export async function unsuspendUser(userId: string): Promise<FormState> {
  await requireRole("ADMIN");
  await db.user.update({ where: { id: userId }, data: { isSuspended: false } });
  revalidatePath("/admin");
  return { success: "User unsuspended." };
}

export async function resolveContactMessage(messageId: string): Promise<FormState> {
  await requireRole("ADMIN");
  await db.contactMessage.update({
    where: { id: messageId },
    data: { status: "RESOLVED" },
  });
  revalidatePath("/admin");
  return { success: "Inquiry marked as resolved." };
}

export async function deleteContactMessage(messageId: string): Promise<FormState> {
  await requireRole("ADMIN");
  await db.contactMessage.delete({ where: { id: messageId } });
  revalidatePath("/admin");
  return { success: "Message deleted." };
}

