"use client";

import { useActionState } from "react";

import { applyAsListener } from "@/actions/listener";
import { SubmitButton } from "@/components/auth/submit-button";
import { ChipGroup } from "@/components/ui/chip-group";
import { CheckboxRow, Field, FormError, Input, Select, Textarea } from "@/components/ui/field";
import { LANGUAGES, LISTENER_TITLES, TOPICS } from "@/lib/constants";
import type { FormState } from "@/lib/form";

export function ApplyForm() {
  const [state, action] = useActionState<FormState, FormData>(applyAsListener, {});
  const fe = state.fieldErrors ?? {};
  const v = state.values ?? {};
  const s = (k: string) => (typeof v[k] === "string" ? (v[k] as string) : undefined);
  const m = (k: string) => (Array.isArray(v[k]) ? (v[k] as string[]) : []);

  if (state.success) {
    return (
      <div className="rounded-3xl bg-rose-soft p-8 text-center">
        <p className="font-serif text-3xl">Thank you 💛</p>
        <p className="mx-auto mt-2 max-w-md text-muted">{state.success}</p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-6" noValidate>
      <FormError message={state.error} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full legal name" htmlFor="fullName" hint="For verification only. Never shown." error={fe.fullName}>
          <Input id="fullName" name="fullName" autoComplete="name" defaultValue={s("fullName")} required />
        </Field>
        <Field label="Mobile number" htmlFor="phone" hint="Only our team will call you." error={fe.phone}>
          <Input id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="98765 43210" defaultValue={s("phone")} required />
        </Field>
        <Field label="City" htmlFor="city" error={fe.city}>
          <Input id="city" name="city" autoComplete="address-level2" defaultValue={s("city")} required />
        </Field>
        <Field label="Introduce me as" htmlFor="title" error={fe.title}>
          <Select id="title" name="title" defaultValue={s("title") ?? "BIG_BRO"} required>
            {Object.entries(LISTENER_TITLES).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <ChipGroup name="languages" legend="Languages you can chat in" options={LANGUAGES} defaultSelected={m("languages")} error={fe.languages} />
      <ChipGroup name="topics" legend="Topics you're comfortable with" options={TOPICS} defaultSelected={m("topics")} error={fe.topics} />

      <Field label="About you" htmlFor="about" hint="This becomes your public bio. What have you been through? What are you like to talk to?" error={fe.about}>
        <Textarea id="about" name="about" maxLength={800} defaultValue={s("about")} required />
      </Field>
      <Field label="Why do you want to listen?" htmlFor="motivation" hint="Private — only our team reads this." error={fe.motivation}>
        <Textarea id="motivation" name="motivation" maxLength={800} defaultValue={s("motivation")} required />
      </Field>

      <div className="space-y-2 rounded-3xl bg-surface-2 p-4">
        <CheckboxRow id="conduct" name="conduct" required>
          I&apos;ve read the{" "}
          <a href="/safety#code" target="_blank" className="font-medium text-ink underline underline-offset-2">
            listener code of conduct
          </a>
          . I will keep every chat platonic and on HeartSync, never ask for contact details or money, and never present
          myself as a therapist or doctor.
        </CheckboxRow>
        {fe.conduct ? <p className="pl-9 text-sm text-danger">{fe.conduct}</p> : null}
        <CheckboxRow id="verification" name="verification" required>
          I agree to ID verification (DigiLocker), police verification and the listening-skills training before my first chat.
        </CheckboxRow>
        {fe.verification ? <p className="pl-9 text-sm text-danger">{fe.verification}</p> : null}
      </div>

      <SubmitButton variant="rose" pendingLabel="Sending application…">
        Send application
      </SubmitButton>
    </form>
  );
}
