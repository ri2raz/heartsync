"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";

import { endSession, isAdminEmail, startSession } from "@/lib/auth";
import { db } from "@/lib/db";
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
          "HeartSync is only for people who are 18 or older. If you need to talk to someone now, call Tele-MANAS on 14416 or Childline on 1098 — both are free.",
        values,
      };
    }

    const existing = await db.user.findUnique({ where: { email }, select: { id: true } });
    if (existing) return { fieldErrors: { email: "An account with this email already exists. Try logging in." }, values };

    const user = await db.user.create({
      data: {
        alias,
        email,
        passwordHash: await bcrypt.hash(password, 12),
        dateOfBirth: dob,
        role: isAdminEmail(email) ? "ADMIN" : "SEEKER",
      },
    });

    await startSession(user.id);
    redirect(safeRedirectPath(str(form, "next"), user.role === "ADMIN" ? "/admin" : "/listeners"));
  } catch (error: unknown) {
    if ((error as { digest?: string })?.digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    console.error("[HeartSync] Signup error:", error);
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
    console.error("[HeartSync] Login error:", error);
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
