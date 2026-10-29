import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { chatEventBus } from "@/lib/chat-events";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return new NextResponse("Not signed in", { status: 401 });

  const { id: sessionId } = await params;
  const session = await db.chatSession.findUnique({
    where: { id: sessionId },
    select: { id: true, seekerId: true, listener: { select: { userId: true } } },
  });

  if (!session || (session.seekerId !== user.id && session.listener.userId !== user.id)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const encoder = new TextEncoder();
  let unsub: (() => void) | null = null;
  let heartbeatTimer: NodeJS.Timeout | null = null;

  const stream = new ReadableStream({
    start(controller) {
      // Confirm connection
      controller.enqueue(encoder.encode(`event: connected\ndata: ${JSON.stringify({ connected: true })}\n\n`));

      // Subscribe to real-time events for this session
      unsub = chatEventBus.onChatEvent(sessionId, (event) => {
        try {
          controller.enqueue(encoder.encode(`event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`));
        } catch {
          // Client disconnected
        }
      });

      // Heartbeat ping every 15s to keep proxy/cloud connection alive
      heartbeatTimer = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`event: ping\ndata: {}\n\n`));
        } catch {
          if (heartbeatTimer) clearInterval(heartbeatTimer);
        }
      }, 15000);

      // Handle disconnect
      request.signal.addEventListener("abort", () => {
        if (heartbeatTimer) clearInterval(heartbeatTimer);
        if (unsub) unsub();
        try {
          controller.close();
        } catch {
          // Already closed
        }
      });
    },
    cancel() {
      if (heartbeatTimer) clearInterval(heartbeatTimer);
      if (unsub) unsub();
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
