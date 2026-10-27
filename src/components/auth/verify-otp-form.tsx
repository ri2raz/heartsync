"use client";

import { MailCheck, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useActionState, useEffect, useState, useTransition } from "react";

import { resendOtp, verifyOtp } from "@/actions/auth";
import { FormError, Input } from "@/components/ui/field";
import type { FormState } from "@/lib/form";

import { SubmitButton } from "./submit-button";

export function VerifyOtpForm({
  email,
  unverified,
  next,
}: {
  email: string;
  unverified?: boolean;
  next?: string;
}) {
  const [state, action] = useActionState<FormState, FormData>(verifyOtp, {});
  const [resendState, setResendState] = useState<FormState | null>(null);
  const [isPendingResend, startResendTransition] = useTransition();
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleResend = () => {
    if (cooldown > 0 || isPendingResend) return;
    const fd = new FormData();
    fd.append("email", email);
    startResendTransition(async () => {
      const res = await resendOtp({}, fd);
      setResendState(res);
      if (res.success) {
        setCooldown(45);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-rose/20 bg-rose-soft/40 p-4 text-center">
        <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-surface shadow-soft">
          <MailCheck className="size-6 text-rose animate-pulse" />
        </div>
        <p className="text-xs uppercase tracking-wider font-semibold text-rose">Check your inbox</p>
        <p className="mt-1 text-sm text-ink/80">
          We sent a 6-digit confirmation code to:
        </p>
        <p className="mt-0.5 font-medium text-ink underline decoration-rose/40">{email}</p>
      </div>

      {unverified ? (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-700">
          Please verify your email address to continue to your account.
        </div>
      ) : null}

      <form action={action} className="space-y-5" noValidate>
        <input type="hidden" name="email" value={email} />
        {next ? <input type="hidden" name="next" value={next} /> : null}

        <FormError message={state.error || resendState?.error} />

        {resendState?.success ? (
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3.5 text-center text-sm font-medium text-emerald-800">
            {resendState.success}
          </div>
        ) : null}

        <div className="space-y-2 text-center">
          <label htmlFor="otp" className="block text-sm font-medium text-ink">
            Enter 6-Digit Code
          </label>
          <div className="mx-auto max-w-xs">
            <Input
              id="otp"
              name="otp"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              autoComplete="one-time-code"
              autoFocus
              required
              placeholder="123456"
              className="text-center font-mono text-2xl tracking-[0.4em] font-bold py-3 text-rose placeholder:text-muted/40 placeholder:tracking-normal"
            />
          </div>
          {state.fieldErrors?.otp ? (
            <p className="text-xs text-danger">{state.fieldErrors.otp}</p>
          ) : (
            <p className="text-xs text-muted">The code will expire in 10 minutes</p>
          )}
        </div>

        <SubmitButton pendingLabel="Verifying code…">Verify & Continue</SubmitButton>
      </form>

      <div className="flex flex-col items-center justify-center gap-3 pt-2 text-center text-sm">
        <button
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0 || isPendingResend}
          className="inline-flex items-center gap-1.5 font-medium text-rose hover:underline disabled:opacity-60 disabled:no-underline disabled:cursor-not-allowed text-xs sm:text-sm"
        >
          <RefreshCw className={`size-3.5 ${isPendingResend ? "animate-spin" : ""}`} />
          {cooldown > 0 ? `Resend code in ${cooldown}s` : "Didn't get the code? Resend"}
        </button>

        <div className="flex items-center gap-4 text-xs text-muted">
          <Link href={next ? `/signup?next=${encodeURIComponent(next)}` : "/signup"} className="hover:text-ink underline">
            Change email
          </Link>
          <span>·</span>
          <Link href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"} className="hover:text-ink underline">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
