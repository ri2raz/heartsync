import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { chatEventBus } from "@/lib/chat-events";
import { db } from "@/lib/db";
import { isSameOrigin } from "@/lib/request";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const { id: sessionId } = await params;
  const session = await db.chatSession.findUnique({
    where: { id: sessionId },
    select: { id: true, status: true, seekerId: true, listener: { select: { userId: true } } },
  });

  if (!session || (session.seekerId !== user.id && session.listener.userId !== user.id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (session.status !== "ACTIVE") {
    return NextResponse.json({ error: "Chat is not active." }, { status: 422 });
  }

  const formData = await request.formData().catch(() => null);
  if (!formData) return NextResponse.json({ error: "Invalid form data." }, { status: 400 });

  const file = formData.get("file") as File | null;
  const duration = Math.min(60, Math.max(1, Math.round(Number(formData.get("duration") || 0))));
  const isAnonymized = formData.get("anonymized") === "true";

  if (!file) {
    return NextResponse.json({ error: "No audio file attached." }, { status: 400 });
  }

  // Ensure upload directory exists
  const uploadsDir = join(process.cwd(), "public", "uploads", "audio");
  await mkdir(uploadsDir, { recursive: true });

  const ext = file.name.endsWith(".wav") ? "wav" : file.name.endsWith(".ogg") ? "ogg" : "webm";
  const fileName = `audio_${sessionId}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
  const filePath = join(uploadsDir, fileName);

  const arrayBuffer = await file.arrayBuffer();
  await writeFile(filePath, Buffer.from(arrayBuffer));

  const mediaUrl = `/uploads/audio/${fileName}`;
  const body = isAnonymized ? "Voice note (anonymized)" : "Voice note";

  const message = await db.message.create({
    data: {
      sessionId,
      senderId: user.id,
      kind: "AUDIO",
      mediaType: "AUDIO",
      mediaUrl,
      audioDuration: duration,
      body,
      status: "SENT",
    },
  });

  chatEventBus.emitChatEvent(sessionId, {
    type: "message",
    sessionId,
    message: {
      id: message.id,
      sessionId,
      senderId: user.id,
      kind: "AUDIO",
      body,
      mediaType: "AUDIO",
      mediaUrl,
      audioDuration: duration,
      status: "SENT",
      createdAt: message.createdAt.toISOString(),
      mine: true,
    },
  });

  return NextResponse.json({ ok: true, messageId: message.id, mediaUrl }, { status: 201 });
}
