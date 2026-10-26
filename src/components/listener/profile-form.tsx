"use client";

import { useActionState } from "react";

import { updateListenerProfile } from "@/actions/listener";
import { SubmitButton } from "@/components/auth/submit-button";
import { ChipGroup } from "@/components/ui/chip-group";
import { Field, FormError, Input, Textarea } from "@/components/ui/field";
import { LANGUAGES, TOPICS } from "@/lib/constants";
import type { FormState } from "@/lib/form";

export function ProfileForm({
  profile,
}: {
  profile: { displayName: string; bio: string; languages: string[]; topics: string[] };
}) {
  const [state, action] = useActionState<FormState, FormData>(updateListenerProfile, {});
  const fe = state.fieldErrors ?? {};

  return (
    <form action={action} className="space-y-5">
      <FormError message={state.error} />
      {state.success ? <p className="rounded-2xl bg-emerald-500/12 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">{state.success}</p> : null}
      <Field label="Display name" htmlFor="displayName" hint="First name or a nickname." error={fe.displayName}>
        <Input id="displayName" name="displayName" defaultValue={profile.displayName} maxLength={30} required />
      </Field>
      <Field label="Bio" htmlFor="bio" error={fe.bio}>
        <Textarea id="bio" name="bio" defaultValue={profile.bio} maxLength={600} required />
      </Field>
      <ChipGroup name="languages" legend="Languages" options={LANGUAGES} defaultSelected={profile.languages} error={fe.languages} />
      <ChipGroup name="topics" legend="Topics" options={TOPICS} defaultSelected={profile.topics} error={fe.topics} />
      <SubmitButton size="md" pendingLabel="Saving…" className="sm:w-auto">
        Save profile
      </SubmitButton>
    </form>
  );
}
