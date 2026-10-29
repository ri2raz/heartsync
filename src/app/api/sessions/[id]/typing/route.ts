import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { chatEventBus } from "@/lib/chat-events";
import { db } from "@/lib/db";
import { isSameOrigin } from "@/lib/request";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const { id: sessionId } = await params;
  const session = await db.chatSession.findUnique({
    where: { id: sessionId },
    select: { id: true, seekerId: true, listener: { select: { userId: true, displayName: true } } },
  });

  if (!session || (session.seekerId !== user.id && session.listener.userId !== user.id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const payload = (await request.json().catch(() => null)) as { isTyping?: unknown } | null;
  const isTyping = Boolean(payload?.isTyping);

  chatEventBus.emitChatEvent(sessionId, {
    type: "typing",
    sessionId,
    userId: user.id,
    isTyping,
  });

  return NextResponse.json({ ok: true });
}
