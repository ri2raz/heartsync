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
  type: "contact" | "application" | "report" | "crisis";
  title: string;
  senderName?: string;
  senderEmail?: string;
  subject?: string;
  details?: string;
  metadata?: Record<string, string | number | undefined | null>;
};

export async function sendAdminEmail(payload: EmailPayload): Promise<{ success: boolean; message?: string }> {
  const recipient = ADMIN_NOTIFICATION_EMAIL;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://heartsync-navy.vercel.app";

  const emailSubject = `[HeartSync Alert] ${payload.title} - ${payload.senderName || "New Event"}`;

  const textBody = `
HeartSync Administrative Alert
=====================================
Alert Type: ${payload.type.toUpperCase()}
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
  <div style="margin-bottom: 20px; border-bottom: 2px solid #ff4d6d; padding-bottom: 12px;">
    <h2 style="color: #111; margin: 0; font-size: 22px;">HeartSync Safety & Admin Desk</h2>
    <span style="display: inline-block; margin-top: 6px; font-size: 12px; font-weight: bold; background: #ffe3e8; color: #ff1244; padding: 3px 8px; border-radius: 12px;">${payload.type.toUpperCase()} ALERT</span>
  </div>

  <p style="font-size: 16px; font-weight: 600; color: #222; margin-top: 0;">${payload.title}</p>

  <div style="background-color: #f8f9fa; border-radius: 8px; padding: 16px; margin: 16px 0; font-size: 14px; line-height: 1.6; color: #333;">
    ${payload.senderName ? `<p style="margin: 4px 0;"><strong>Name:</strong> ${escapeHtml(payload.senderName)}</p>` : ""}
    ${payload.senderEmail ? `<p style="margin: 4px 0;"><strong>Email:</strong> <a href="mailto:${escapeHtml(payload.senderEmail)}">${escapeHtml(payload.senderEmail)}</a></p>` : ""}
    ${payload.subject ? `<p style="margin: 4px 0;"><strong>Subject:</strong> ${escapeHtml(payload.subject)}</p>` : ""}
    ${
      payload.details
        ? `<div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e0e0e0;">
            <strong>Message / Details:</strong>
            <p style="white-space: pre-wrap; margin: 6px 0 0 0; color: #111;">${escapeHtml(payload.details)}</p>
           </div>`
        : ""
    }
  </div>

  ${
    payload.metadata
      ? `<div style="font-size: 13px; color: #666; margin: 12px 0;">
          ${Object.entries(payload.metadata)
            .filter(([, v]) => v !== undefined && v !== null)
            .map(([k, v]) => `<div><strong>${escapeHtml(k)}:</strong> ${escapeHtml(String(v))}</div>`)
            .join("")}
        </div>`
      : ""
  }

  <div style="margin-top: 24px; text-align: center;">
    <a href="${siteUrl}/admin" style="display: inline-block; background-color: #111; color: #fff; text-decoration: none; font-weight: 500; font-size: 14px; padding: 10px 20px; border-radius: 50px;">Open Admin Panel</a>
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

      console.log("[HeartSync] Admin notification email dispatched successfully via Resend.");
      return { success: true };
    } catch (error) {
      console.error("[HeartSync] Error sending email via Resend:", error);
      return { success: false, message: String(error) };
    }
  }

  return { success: true, message: "Logged to admin inbox (Add RESEND_API_KEY in Vercel to dispatch live SMTP)" };
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
