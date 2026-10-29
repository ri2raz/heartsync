"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";

import { endSession, isAdminEmail, startSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendAdminEmail, sendOtpEmail } from "@/lib/email";
import { fieldErrorsFrom, keep, str, type FormState } from "@/lib/form";
import { rateLimit } from "@/lib/rate-limit";
import { clientIp } from "@/lib/request";
import { isAdult } from "@/lib/session-rules";
import { safeRedirectPath } from "@/lib/utils";

const signupSchema = z.object({
  alias: z
    .string()
    .trim()
    .min(2, "Pick a name with at least 2 characters.")
    .max(30, "Keep it under 30 characters.")
    .regex(/^[\p{L}\p{N} ._-]+$/u, "Use letters, numbers, spaces, dots or dashes."),
  email: z.string().trim().toLowerCase().pipe(z.email("Enter a valid email.")),
  password: z.string().min(8, "Use at least 8 characters.").max(128, "That's too long."),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Enter your date of birth."),
  agree: z.literal("on", "Please confirm you're 18+ and accept the terms."),
});

export async function signup(_prev: FormState, form: FormData): Promise<FormState> {
  const values = keep(form, ["alias", "email", "dateOfBirth"]);
  try {
    const ip = await clientIp();
    if (!rateLimit(`signup:${ip}`, 10, 60 * 60_000)) {
      return { error: "Too many sign-ups from this network. Try again later.", values };
    }

    const parsed = signupSchema.safeParse({
      alias: str(form, "alias"),
      email: str(form, "email"),
      password: str(form, "password"),
      dateOfBirth: str(form, "dateOfBirth"),
      agree: form.get("agree") ?? undefined,
    });
    if (!parsed.success) return { fieldErrors: fieldErrorsFrom(parsed.error), values };

    const { alias, email, password, dateOfBirth } = parsed.data;
    const dob = new Date(`${dateOfBirth}T00:00:00Z`);
    if (Number.isNaN(dob.getTime()) || dob.getUTCFullYear() < 1900) {
      return { fieldErrors: { dateOfBirth: "Enter a real date of birth." }, values };
    }
    if (!isAdult(dob)) {
      return {
        error:
          "MannMitr is only for people who are 18 or older. If you need to talk to someone now, call Tele-MANAS on 14416 or Childline on 1098 — both are free.",
        values,
      };
    }

    const existing = await db.user.findUnique({ where: { email }, select: { id: true, emailVerified: true } });
    if (existing && existing.emailVerified) {
      return { fieldErrors: { email: "An account with this email already exists. Try logging in." }, values };
    }

    // Save or update unverified user
    await db.user.upsert({
      where: { email },
      create: {
        alias,
        email,
        passwordHash: await bcrypt.hash(password, 12),
        dateOfBirth: dob,
        role: isAdminEmail(email) ? "ADMIN" : "SEEKER",
        emailVerified: false,
      },
      update: {
        alias,
        passwordHash: await bcrypt.hash(password, 12),
        dateOfBirth: dob,
        role: isAdminEmail(email) ? "ADMIN" : "SEEKER",
        emailVerified: false,
      },
    });

    // Notify admin at riturajverma2009@gmail.com
    sendAdminEmail({
      type: "signup",
      title: `📝 User Registration Initiated: ${alias}`,
      senderName: alias,
      senderEmail: email,
      subject: `New registration initiated on MannMitr (OTP Sent)`,
      details: `A user initiated signup on MannMitr.\n\nAlias: ${alias}\nEmail: ${email}\nDate of Birth: ${dateOfBirth}`,
      metadata: {
        Alias: alias,
        Email: email,
        "Date of Birth": dateOfBirth,
        "Initiated At": new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) + " IST",
      },
    }).catch((e) => console.error("[MannMitr] Signup admin email error:", e));

    // Generate 6-digit OTP valid for 10 minutes
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await db.emailVerificationOtp.upsert({
      where: { email },
      create: { email, otp, expiresAt, attempts: 0 },
      update: { otp, expiresAt, attempts: 0 },
    });

    // Send verification code to user's email
    await sendOtpEmail({ email, otp, alias });

    const nextPath = str(form, "next");
    redirect(`/verify-email?email=${encodeURIComponent(email)}${nextPath ? `&next=${encodeURIComponent(nextPath)}` : ""}`);
  } catch (error: unknown) {
    if ((error as { digest?: string })?.digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    console.error("[MannMitr] Signup error:", error);
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes("DATABASE_URL") || msg.includes("PrismaClientInitializationError") || !process.env.DATABASE_URL) {
      return {
        error:
          "Database connection is missing. Please add DATABASE_URL in Vercel Project Settings → Environment Variables and redeploy.",
        values,
      };
    }
    return { error: "Could not create account right now. Please try again.", values };
  }
}

const otpSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email("Invalid email address.")),
  otp: z.string().trim().regex(/^\d{6}$/, "Enter the complete 6-digit code."),
});

export async function verifyOtp(_prev: FormState, form: FormData): Promise<FormState> {
  const email = str(form, "email").trim().toLowerCase();
  const rawOtp = str(form, "otp").trim();
  const nextPath = str(form, "next");
  const values = { email, otp: rawOtp };

  try {
    const ip = await clientIp();
    if (!rateLimit(`otp-verify:${ip}`, 25, 10 * 60_000)) {
      return { error: "Too many attempts from this network. Please wait a few minutes.", values };
    }

    const parsed = otpSchema.safeParse({ email, otp: rawOtp });
    if (!parsed.success) {
      return { fieldErrors: fieldErrorsFrom(parsed.error), values };
    }

    const record = await db.emailVerificationOtp.findUnique({ where: { email } });
    if (!record) {
      return {
        error: "No pending verification code found for this email. Please request a new code.",
        values,
      };
    }

    if (new Date() > record.expiresAt) {
      return {
        error: "This verification code has expired. Click 'Resend Code' below for a new one.",
        values,
      };
    }

    if (record.attempts >= 5) {
      return {
        error: "Too many incorrect attempts. Please request a new code.",
        values,
      };
    }

    if (record.otp !== parsed.data.otp) {
      await db.emailVerificationOtp.update({
        where: { email },
        data: { attempts: { increment: 1 } },
      });
      return {
        error: "Incorrect code. Please double-check your email and try again.",
        values,
      };
    }

    // OTP is valid! Mark user as verified
    const user = await db.user.update({
      where: { email },
      data: { emailVerified: true },
    });

    // Remove consumed OTP record
    await db.emailVerificationOtp.deleteMany({ where: { email } });

    // Notify admin at riturajverma2009@gmail.com
    sendAdminEmail({
      type: "signup",
      title: `🎉 New User Verified & Joined: ${user.alias}`,
      senderName: user.alias,
      senderEmail: user.email,
      subject: `New member account activated on MannMitr`,
      details: `A new user verified their email via OTP and activated their account.\n\nRole: ${user.role}\nEmail: ${user.email}`,
      metadata: {
        "User ID": user.id,
        Alias: user.alias,
        Email: user.email,
        Role: user.role,
        "Activated At": new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) + " IST",
      },
    }).catch((e) => console.error("[MannMitr] Signup admin email error:", e));

    // Start authenticated session
    await startSession(user.id);

    const fallback = user.role === "ADMIN" ? "/admin" : user.role === "LISTENER" ? "/listener/dashboard" : "/listeners";
    redirect(safeRedirectPath(nextPath, fallback));
  } catch (error: unknown) {
    if ((error as { digest?: string })?.digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    console.error("[MannMitr] OTP verification error:", error);
    return { error: "Could not verify code right now. Please try again.", values };
  }
}

export async function resendOtp(_prev: FormState, form: FormData): Promise<FormState> {
  const email = str(form, "email").trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return { error: "Please provide a valid email address." };
  }

  try {
    const ip = await clientIp();
    if (!rateLimit(`otp-resend:${ip}:${email}`, 1, 45_000)) {
      return { error: "Please wait 45 seconds before requesting another code." };
    }

    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      return { error: "No account found with this email. Please sign up first." };
    }

    if (user.emailVerified) {
      return { error: "This account is already verified. You can log in directly." };
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await db.emailVerificationOtp.upsert({
      where: { email },
      create: { email, otp, expiresAt, attempts: 0 },
      update: { otp, expiresAt, attempts: 0 },
    });

    await sendOtpEmail({ email, otp, alias: user.alias });
    return { success: "A new 6-digit verification code has been sent to your email!" };
  } catch (error) {
    console.error("[MannMitr] Resend OTP error:", error);
    return { error: "Could not resend verification code right now. Please try again." };
  }
}

/** Compared against when the email is unknown, so response time doesn't reveal which emails exist. */
const DUMMY_HASH = "$2a$12$o2v/Rhi/xOqNg0RP.Ru5lOx3f2hBydui6Sqglv8d45ZWF12dC3CH.";

const loginSchema = z.object({
  email: z.string().trim().min(1, "Enter your email or username."),
  password: z.string().min(1, "Enter your password."),
});

export async function login(_prev: FormState, form: FormData): Promise<FormState> {
  const values = keep(form, ["email"]);
  try {
    const parsed = loginSchema.safeParse({ email: str(form, "email"), password: str(form, "password") });
    if (!parsed.success) return { fieldErrors: fieldErrorsFrom(parsed.error), values };
    const { email: identifier, password } = parsed.data;

    const ip = await clientIp();
    if (!rateLimit(`login:${ip}`, 20, 15 * 60_000) || !rateLimit(`login:${identifier}`, 15, 15 * 60_000)) {
      return { error: "Too many attempts. Wait a few minutes and try again.", values };
    }

    const normalized = identifier.toLowerCase();
    const user = await db.user.findFirst({
      where: {
        OR: [
          { email: normalized },
          { alias: identifier },
          { alias: normalized },
        ],
      },
    });

    const ok = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
    if (!user || !ok) return { error: "That email and password don't match.", values };
    if (user.isSuspended) return { error: "This account has been suspended. Contact support if you think this is a mistake.", values };

    // If the account has not been verified yet, send a fresh OTP and require verification
    if (!user.emailVerified) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      await db.emailVerificationOtp.upsert({
        where: { email: user.email },
        create: { email: user.email, otp, expiresAt, attempts: 0 },
        update: { otp, expiresAt, attempts: 0 },
      });

      await sendOtpEmail({ email: user.email, otp, alias: user.alias });

      const nextPath = str(form, "next");
      redirect(`/verify-email?email=${encodeURIComponent(user.email)}&unverified=1${nextPath ? `&next=${encodeURIComponent(nextPath)}` : ""}`);
    }

    await startSession(user.id);
    const fallback = user.role === "ADMIN" ? "/admin" : user.role === "LISTENER" ? "/listener/dashboard" : "/listeners";
    const nextPath = str(form, "next");
    if (nextPath && nextPath.startsWith("/admin") && user.role !== "ADMIN") {
      redirect("/listeners");
    }
    redirect(safeRedirectPath(nextPath, fallback));
  } catch (error: unknown) {
    if ((error as { digest?: string })?.digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    console.error("[MannMitr] Login error:", error);
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes("DATABASE_URL") || msg.includes("PrismaClientInitializationError") || !process.env.DATABASE_URL) {
      return {
        error:
          "Database connection is missing. Please add DATABASE_URL in Vercel Project Settings → Environment Variables and redeploy.",
        values,
      };
    }
    return { error: "An unexpected error occurred during login. Please try again.", values };
  }
}

export async function logout() {
  await endSession();
  redirect("/");
}
