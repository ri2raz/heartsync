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

  let emailTestResult = null;
  if (request.nextUrl.searchParams.get("testEmail") === "1") {
    emailTestResult = await sendAdminEmail({
      type: "contact",
      title: "Test Notification",
      senderName: "HeartSync System Verification",
      senderEmail: "verify@heartsync.local",
      subject: "Resend Live Integration Test",
      details: "This is a verification test to confirm your live email notifications are working.",
    });
  }

  return NextResponse.json({
    status: dbOk ? "ok" : "error",
    dbConnected: dbOk,
    userCount,
    hasResendKey: Boolean(resendApiKey),
    resendKeyPrefix: resendApiKey ? resendApiKey.slice(0, 7) + "..." : null,
    adminNotificationEmail: ADMIN_NOTIFICATION_EMAIL,
    emailTestResult,
    error: errorMsg,
  });
}
