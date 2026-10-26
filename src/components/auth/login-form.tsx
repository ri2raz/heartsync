"use client";

import Link from "next/link";
import { useActionState } from "react";

import { login } from "@/actions/auth";
import { Field, FormError, Input } from "@/components/ui/field";
import type { FormState } from "@/lib/form";

import { SubmitButton } from "./submit-button";

export function LoginForm({ next }: { next?: string }) {
  const [state, action] = useActionState<FormState, FormData>(login, {});
  const fe = state.fieldErrors ?? {};

  return (
    <form action={action} className="space-y-5" noValidate>
      {next ? <input type="hidden" name="next" value={next} /> : null}
      <FormError message={state.error} />
      <Field label="Admin ID or Email" htmlFor="email" error={fe.email}>
        <Input id="email" name="email" type="text" placeholder="ritu123 or your email" autoComplete="username" defaultValue={typeof state.values?.email === "string" ? state.values.email : undefined} required />
      </Field>
      <Field label="Password" htmlFor="password" error={fe.password}>
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </Field>
      <SubmitButton pendingLabel="Logging in…">Log in</SubmitButton>
      <p className="text-center text-sm text-muted">
        New here?{" "}
        <Link href={next ? `/signup?next=${encodeURIComponent(next)}` : "/signup"} className="font-medium text-ink underline underline-offset-2">
          Create a free account
        </Link>
      </p>
    </form>
  );
}
