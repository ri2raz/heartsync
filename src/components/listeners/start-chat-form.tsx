"use client";

import { Clock } from "lucide-react";
import { useActionState, useState } from "react";

import { startChat } from "@/actions/chat";
import { SubmitButton } from "@/components/auth/submit-button";
import { FormError } from "@/components/ui/field";
import { CHAT_LENGTHS } from "@/lib/constants";
import type { FormState } from "@/lib/form";
import { cn } from "@/lib/utils";

export function StartChatForm({
  listenerId,
  listenerName,
  online,
}: {
  listenerId: string;
  listenerName: string;
  freeAvailable?: boolean;
  balance?: number;
  online: boolean;
}) {
  const [state, action] = useActionState<FormState, FormData>(startChat, {});
  const [minutes, setMinutes] = useState<number>(20);

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="listenerId" value={listenerId} />
      <fieldset>
        <legend className="text-sm font-medium">How long do you want to talk?</legend>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {CHAT_LENGTHS.map((m) => {
            return (
              <label
                key={m}
                className={cn(
                  "relative flex cursor-pointer flex-col items-center rounded-2xl border px-2 py-3 text-center transition",
                  minutes === m ? "border-rose bg-rose-soft" : "border-line bg-surface hover:border-ink/20",
                )}
              >
                <input
                  type="radio"
                  name="minutes"
                  value={m}
                  checked={minutes === m}
                  onChange={() => setMinutes(m)}
                  className="sr-only"
                />
                <span className="font-serif text-3xl leading-none">{m}</span>
                <span className="mt-1 text-xs text-muted">minutes</span>
                <span className="absolute -top-2.5 rounded-full bg-rose px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-rose-ink">
                  Free
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <p className="flex items-center gap-2 text-sm text-muted">
        <Clock className="size-4" aria-hidden />
        100% free community peer support — no fees, no credit card required.
      </p>

      <FormError message={state.error} />

      {online ? (
        <SubmitButton variant="rose" pendingLabel="Sending request…">
          Request a chat with {listenerName}
        </SubmitButton>
      ) : (
        <p className="rounded-2xl bg-surface-2 px-4 py-3 text-center text-sm text-muted">
          {listenerName} is offline right now. Try someone who&apos;s online, or come back later.
        </p>
      )}
    </form>
  );
}
