import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { getSessionView } from "@/lib/chat-service";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const { id } = await params;
  const after = Number(new URL(request.url).searchParams.get("after") ?? 0);
  const view = await getSessionView(user.id, id, Number.isFinite(after) && after > 0 ? Math.floor(after) : 0);
  if (!view) return NextResponse.json({ error: "Chat not found." }, { status: 404 });

  return NextResponse.json(view, { headers: { "Cache-Control": "no-store" } });
}
