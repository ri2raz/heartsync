import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { sendAdminEmail } from "@/lib/email";

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

  const resendKey = process.env.RESEND_API_KEY?.trim();
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
    hasResendKey: Boolean(resendKey),
    resendKeyPrefix: resendKey ? resendKey.slice(0, 6) + "..." : null,
    adminNotificationEmail: process.env.ADMIN_NOTIFICATION_EMAIL || "riturajverma2009@gmail.com",
    emailTestResult,
    error: errorMsg,
  });
}
