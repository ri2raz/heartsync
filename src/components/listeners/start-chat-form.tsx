"use client";

import { Clock } from "lucide-react";
import Link from "next/link";
import { useActionState, useState } from "react";

import { startChat } from "@/actions/chat";
import { SubmitButton } from "@/components/auth/submit-button";
import { FormError } from "@/components/ui/field";
import { CHAT_LENGTHS, FREE_CHAT_MINUTES } from "@/lib/constants";
import type { FormState } from "@/lib/form";
import { cn } from "@/lib/utils";

export function StartChatForm({
  listenerId,
  listenerName,
  freeAvailable,
  balance,
  online,
}: {
  listenerId: string;
  listenerName: string;
  freeAvailable: boolean;
  balance: number;
  online: boolean;
}) {
  const [state, action] = useActionState<FormState, FormData>(startChat, {});
  const [minutes, setMinutes] = useState<number>(freeAvailable ? FREE_CHAT_MINUTES : CHAT_LENGTHS[0]);
  const isFree = freeAvailable && minutes === FREE_CHAT_MINUTES;
  const affordable = isFree || balance >= minutes;

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="listenerId" value={listenerId} />
      <fieldset>
        <legend className="text-sm font-medium">How long do you want to talk?</legend>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {CHAT_LENGTHS.map((m) => {
            const free = freeAvailable && m === FREE_CHAT_MINUTES;
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
                {free ? (
                  <span className="absolute -top-2.5 rounded-full bg-rose px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-rose-ink">
                    Free
                  </span>
                ) : null}
              </label>
            );
          })}
        </div>
      </fieldset>

      <p className="flex items-center gap-2 text-sm text-muted">
        <Clock className="size-4" aria-hidden />
        {isFree
          ? "Your free first chat — nothing will be charged."
          : `Uses ${minutes} of your ${balance} minutes. Unused minutes come back if the chat ends early.`}
      </p>

      <FormError message={state.error} />

      {online ? (
        affordable ? (
          <SubmitButton variant="rose" pendingLabel="Sending request…">
            Request a chat with {listenerName}
          </SubmitButton>
        ) : (
          <Link href="/account#top-up" className="flex h-13 w-full items-center justify-center rounded-full bg-ink font-medium text-bg">
            Top up minutes to continue
          </Link>
        )
      ) : (
        <p className="rounded-2xl bg-surface-2 px-4 py-3 text-center text-sm text-muted">
          {listenerName} is offline right now. Try someone who&apos;s online, or come back later.
        </p>
      )}
    </form>
  );
}
