import { Lock, MailCheck, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthShell } from "@/components/auth/auth-shell";
import { VerifyOtpForm } from "@/components/auth/verify-otp-form";
import { getCurrentUser } from "@/lib/auth";
import { safeRedirectPath } from "@/lib/utils";

export const metadata: Metadata = { title: "Verify your email · HeartSync" };

const POINTS = [
  { icon: MailCheck, text: "Verification keeps our community safe and spam-free" },
  { icon: ShieldCheck, text: "Your email is 100% private and never visible to listeners" },
  { icon: Lock, text: "Instant access to peer support once verified" },
];

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; next?: string; unverified?: string }>;
}) {
  const { email, next, unverified } = await searchParams;

  const currentUser = await getCurrentUser();
  if (currentUser && currentUser.emailVerified) {
    redirect(safeRedirectPath(next, currentUser.role === "ADMIN" ? "/admin" : "/listeners"));
  }

  if (!email) {
    redirect("/signup");
  }

  const safeNext = next ? safeRedirectPath(next) : undefined;

  return (
    <AuthShell
      title={
        <>
          Verify your <span className="italic text-rose">email.</span>
        </>
      }
      subtitle="Safety and mutual trust start here. Enter the one-time code sent to your email to activate your account."
      aside={
        <ul className="mt-10 space-y-4">
          {POINTS.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-3 text-muted">
              <span className="inline-flex size-10 items-center justify-center rounded-full bg-surface shadow-soft">
                <Icon className="size-4 text-rose" aria-hidden />
              </span>
              {text}
            </li>
          ))}
        </ul>
      }
    >
      <VerifyOtpForm email={email} unverified={unverified === "1"} next={safeNext} />
    </AuthShell>
  );
}
