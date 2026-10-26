import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { pendingRequestsForListener } from "@/lib/chat-service";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "LISTENER") return NextResponse.json({ error: "Not a listener." }, { status: 403 });
  const data = await pendingRequestsForListener(user.id);
  if (!data) return NextResponse.json({ error: "No listener profile." }, { status: 404 });
  return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
}
