import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ADMIN_NOTIFICATION_EMAIL, resendApiKey, sendAdminEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const rawUrl = process.env.DATABASE_URL;
  let dbOk = false;
  let userCount = 0;
  let errorMsg = null;

  try {
    userCount = await db.user.count();
    dbOk = true;
  } catch (err) {
    errorMsg = err instanceof Error ? err.message : String(err);
  }

  return NextResponse.json({
    status: dbOk ? "ok" : "error",
    dbConnected: dbOk,
    userCount,
    hasResendKey: Boolean(resendApiKey),
    resendKeyPrefix: resendApiKey ? resendApiKey.slice(0, 7) + "..." : null,
    adminNotificationEmail: ADMIN_NOTIFICATION_EMAIL,
    error: errorMsg,
  });
}
