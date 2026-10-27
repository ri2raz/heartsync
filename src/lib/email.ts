import "server-only";

const rawAdminEmail = process.env.ADMIN_NOTIFICATION_EMAIL?.trim();
const rawResendKey = process.env.RESEND_API_KEY?.trim();

export const resendApiKey =
  (rawResendKey && rawResendKey.startsWith("re_") ? rawResendKey : undefined) ||
  (rawAdminEmail && rawAdminEmail.startsWith("re_") ? rawAdminEmail : undefined);

export const ADMIN_NOTIFICATION_EMAIL =
  rawAdminEmail && !rawAdminEmail.startsWith("re_")
    ? rawAdminEmail
    : "riturajverma2009@gmail.com";

export type EmailPayload = {
  type:
    | "contact"
    | "application"
    | "report"
    | "crisis"
    | "signup"
    | "listener_online"
    | "chat_requested"
    | "chat_active"
    | "chat_ended"
    | "rating";
  title: string;
  senderName?: string;
  senderEmail?: string;
  subject?: string;
  details?: string;
  metadata?: Record<string, string | number | undefined | null>;
};

function getBadgeStyles(type: EmailPayload["type"]): { bg: string; color: string; label: string } {
  switch (type) {
    case "crisis":
      return { bg: "#ffe4e6", color: "#be123c", label: "URGENT CRISIS" };
    case "report":
      return { bg: "#fee2e2", color: "#991b1b", label: "SAFETY REPORT" };
    case "signup":
      return { bg: "#ccfbf1", color: "#0f766e", label: "NEW USER SIGNUP" };
    case "listener_online":
      return { bg: "#dcfce7", color: "#15803d", label: "LISTENER PRESENCE" };
    case "chat_requested":
      return { bg: "#e0e7ff", color: "#3730a3", label: "CHAT REQUEST" };
    case "chat_active":
      return { bg: "#ffedd5", color: "#c2410c", label: "CHAT IN PROGRESS" };
    case "chat_ended":
      return { bg: "#f1f5f9", color: "#475569", label: "CHAT ENDED" };
    case "rating":
      return { bg: "#fef3c7", color: "#92400e", label: "RATING & REVIEW" };
    case "application":
      return { bg: "#fae8ff", color: "#86198f", label: "NEW APPLICATION" };
    case "contact":
    default:
      return { bg: "#f1f5f9", color: "#334155", label: "CONTACT INQUIRY" };
  }
}

export async function sendAdminEmail(payload: EmailPayload): Promise<{ success: boolean; message?: string }> {
  const recipient = ADMIN_NOTIFICATION_EMAIL;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://heartsync-navy.vercel.app";

  const emailSubject = `[HeartSync] ${payload.title}`;
  const badge = getBadgeStyles(payload.type);

  const textBody = `
HeartSync Administrative Alert
=====================================
Alert Type: ${badge.label}
Title: ${payload.title}
Date: ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST

${payload.senderName ? `From: ${payload.senderName}` : ""}
${payload.senderEmail ? `Email: ${payload.senderEmail}` : ""}
${payload.subject ? `Subject: ${payload.subject}` : ""}

Details:
${payload.details || "None provided"}

${
  payload.metadata
    ? `\nMetadata:\n` +
      Object.entries(payload.metadata)
        .filter(([, v]) => v !== undefined && v !== null)
        .map(([k, v]) => `- ${k}: ${v}`)
        .join("\n")
    : ""
}

=====================================
View Admin Panel: ${siteUrl}/admin
`.trim();

  const htmlBody = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e5e5; border-radius: 12px; background-color: #ffffff;">
  <div style="margin-bottom: 20px; border-bottom: 2px solid #ff4d6d; padding-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
    <div>
      <h2 style="color: #111; margin: 0; font-size: 20px; font-weight: 700;">HeartSync Administrative Alert</h2>
      <span style="display: inline-block; margin-top: 6px; font-size: 11px; font-weight: 700; letter-spacing: 0.05em; background: ${badge.bg}; color: ${badge.color}; padding: 4px 10px; border-radius: 20px;">${badge.label}</span>
    </div>
  </div>

  <p style="font-size: 16px; font-weight: 600; color: #111; margin-top: 0; line-height: 1.4;">${escapeHtml(payload.title)}</p>

  <div style="background-color: #f8f9fa; border-radius: 8px; padding: 16px; margin: 16px 0; font-size: 14px; line-height: 1.6; color: #333;">
    ${payload.senderName ? `<p style="margin: 4px 0;"><strong>User / Sender:</strong> ${escapeHtml(payload.senderName)}</p>` : ""}
    ${payload.senderEmail ? `<p style="margin: 4px 0;"><strong>Email:</strong> <a href="mailto:${escapeHtml(payload.senderEmail)}" style="color: #2563eb;">${escapeHtml(payload.senderEmail)}</a></p>` : ""}
    ${payload.subject ? `<p style="margin: 4px 0;"><strong>Subject:</strong> ${escapeHtml(payload.subject)}</p>` : ""}
    ${
      payload.details
        ? `<div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e5e7eb;">
            <strong>Details:</strong>
            <p style="white-space: pre-wrap; margin: 6px 0 0 0; color: #111;">${escapeHtml(payload.details)}</p>
           </div>`
        : ""
    }
  </div>

  ${
    payload.metadata
      ? `<div style="background-color: #ffffff; border: 1px solid #f1f5f9; border-radius: 8px; padding: 12px 16px; font-size: 13px; color: #4b5563; margin: 16px 0;">
          <div style="font-weight: 600; color: #111; margin-bottom: 8px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Event Metadata</div>
          ${Object.entries(payload.metadata)
            .filter(([, v]) => v !== undefined && v !== null)
            .map(([k, v]) => `<div style="margin: 4px 0;"><strong>${escapeHtml(k)}:</strong> ${escapeHtml(String(v))}</div>`)
            .join("")}
        </div>`
      : ""
  }

  <div style="margin-top: 24px; text-align: center; border-top: 1px solid #f3f4f6; padding-top: 18px;">
    <a href="${siteUrl}/admin" style="display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 13px; padding: 10px 22px; border-radius: 50px;">Open Admin Dashboard</a>
    <p style="font-size: 11px; color: #9ca3af; margin-top: 12px;">Sent automatically by HeartSync Engine to ${escapeHtml(recipient)}</p>
  </div>
</div>
`.trim();

  // Log alert to server output
  console.log(`[HeartSync Notification Email -> ${recipient}]:\nSubject: ${emailSubject}\n${textBody}`);

  // Send via Resend if resendApiKey is configured
  if (resendApiKey) {
    try {
      const fromEmail = process.env.EMAIL_FROM || "HeartSync Desk <onboarding@resend.dev>";
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [recipient],
          subject: emailSubject,
          text: textBody,
          html: htmlBody,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error("[HeartSync] Resend API error:", errText);
        return { success: false, message: errText };
      }

      console.log(`[HeartSync] Admin notification email dispatched successfully via Resend: "${emailSubject}"`);
      return { success: true };
    } catch (error) {
      console.error("[HeartSync] Error sending email via Resend:", error);
      return { success: false, message: String(error) };
    }
  }

  return { success: true, message: "Logged to admin inbox (Add RESEND_API_KEY in Vercel to dispatch live SMTP)" };
}

export async function sendOtpEmail({
  email,
  otp,
  alias,
}: {
  email: string;
  otp: string;
  alias?: string;
}): Promise<{ success: boolean; message?: string }> {
  const greeting = alias ? `Hi ${alias}` : "Hello";
  const emailSubject = `${otp} is your HeartSync verification code`;

  const textBody = `
${greeting},

Welcome to HeartSync. Here is your 6-digit verification code:

  ${otp}

This code will expire in 10 minutes.
If you didn't create an account on HeartSync, you can safely ignore this email.

Warm regards,
HeartSync Team
https://heartsync-navy.vercel.app
`.trim();

  const htmlBody = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; border: 1px solid #f0f0f0; border-radius: 16px; background-color: #ffffff;">
  <div style="text-align: center; margin-bottom: 24px;">
    <h1 style="color: #0f172a; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">HeartSync</h1>
    <p style="color: #64748b; margin: 4px 0 0 0; font-size: 13px;">Talk to a verified big bro or big sis</p>
  </div>

  <div style="border-top: 1px solid #f1f5f9; padding-top: 24px;">
    <p style="font-size: 16px; color: #1e293b; margin: 0 0 16px 0; font-weight: 500;">${escapeHtml(greeting)},</p>
    <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 24px 0;">
      Thank you for joining HeartSync. To verify your email address and activate your account, please enter this 6-digit confirmation code:
    </p>

    <div style="text-align: center; margin: 28px 0;">
      <div style="display: inline-block; background-color: #fff1f2; border: 1.5px dashed #f43f5e; border-radius: 12px; padding: 16px 32px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #e11d48;">
        ${otp}
      </div>
      <p style="margin: 10px 0 0 0; font-size: 12px; color: #94a3b8;">Valid for 10 minutes · Do not share this code</p>
    </div>

    <p style="font-size: 13px; line-height: 1.5; color: #64748b; margin: 24px 0 0 0;">
      If you did not request this code or create an account, you can safely ignore this email. Someone may have typed your address by mistake.
    </p>
  </div>

  <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #f1f5f9; text-align: center; font-size: 12px; color: #94a3b8;">
    HeartSync · A safe, anonymous space for young adults
  </div>
</div>
`.trim();

  // Always log OTP for instant local development/testing visibility
  console.log(`[HeartSync OTP] 🔑 Verification code for ${email} is: ${otp}`);

  if (resendApiKey) {
    try {
      const fromEmail = process.env.EMAIL_FROM || "HeartSync Desk <onboarding@resend.dev>";
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [email],
          subject: emailSubject,
          text: textBody,
          html: htmlBody,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error("[HeartSync] Resend API error sending OTP:", errText);
        return { success: false, message: errText };
      }

      console.log(`[HeartSync] Verification OTP successfully dispatched to ${email} via Resend.`);
      return { success: true };
    } catch (error) {
      console.error("[HeartSync] Error sending OTP via Resend:", error);
      return { success: false, message: String(error) };
    }
  }

  return { success: true, message: "OTP logged to server output (RESEND_API_KEY optional for local dev)" };
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
