import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { postMessage } from "@/lib/chat-service";
import { isSameOrigin } from "@/lib/request";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const payload = (await request.json().catch(() => null)) as { body?: unknown } | null;
  if (!payload || typeof payload.body !== "string") {
    return NextResponse.json({ error: "Message is empty." }, { status: 400 });
  }

  const { id } = await params;
  const result = await postMessage(user.id, id, payload.body);
  return NextResponse.json(result, { status: result.ok ? 201 : 422 });
}
