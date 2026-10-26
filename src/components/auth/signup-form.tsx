"use client";

import Link from "next/link";
import { useActionState } from "react";

import { signup } from "@/actions/auth";
import { CheckboxRow, Field, FormError, Input } from "@/components/ui/field";
import type { FormState } from "@/lib/form";

import { SubmitButton } from "./submit-button";

export function SignupForm({ next }: { next?: string }) {
  const [state, action] = useActionState<FormState, FormData>(signup, {});
  const fe = state.fieldErrors ?? {};
  const v = (key: string) => (typeof state.values?.[key] === "string" ? (state.values[key] as string) : undefined);
  const maxDob = new Date(Date.now() - 18 * 365.25 * 864e5).toISOString().slice(0, 10);

  return (
    <form action={action} className="space-y-5" noValidate>
      {next ? <input type="hidden" name="next" value={next} /> : null}
      <FormError message={state.error} />
      <Field label="What should we call you?" htmlFor="alias" hint="A nickname is perfect. This is all listeners see." error={fe.alias}>
        <Input id="alias" name="alias" autoComplete="nickname" placeholder="e.g. Sunny" defaultValue={v("alias")} required maxLength={30} />
      </Field>
      <Field label="Email" htmlFor="email" hint="Private. Never shown to anyone." error={fe.email}>
        <Input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" defaultValue={v("email")} required />
      </Field>
      <Field label="Password" htmlFor="password" hint="At least 8 characters." error={fe.password}>
        <Input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} />
      </Field>
      <Field label="Date of birth" htmlFor="dateOfBirth" hint="HeartSync is for adults (18+) only." error={fe.dateOfBirth}>
        <Input id="dateOfBirth" name="dateOfBirth" type="date" max={maxDob} defaultValue={v("dateOfBirth")} required />
      </Field>
      <div className="space-y-1">
        <CheckboxRow id="agree" name="agree" required>
          I&apos;m 18 or older, I accept the{" "}
          <Link href="/terms" className="font-medium text-ink underline underline-offset-2" target="_blank">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="font-medium text-ink underline underline-offset-2" target="_blank">
            Privacy Policy
          </Link>
          , and I understand HeartSync is peer support, not therapy or an emergency service.
        </CheckboxRow>
        {fe.agree ? <p className="pl-9 text-sm text-danger">{fe.agree}</p> : null}
      </div>
      <SubmitButton pendingLabel="Creating your account…">Create account — first chat free</SubmitButton>
      <p className="text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"} className="font-medium text-ink underline underline-offset-2">
          Log in
        </Link>
      </p>
    </form>
  );
}
