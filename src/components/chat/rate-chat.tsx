"use client";

import { Star } from "lucide-react";
import { useActionState, useState } from "react";

import { rateChat } from "@/actions/chat";
import { SubmitButton } from "@/components/auth/submit-button";
import { FormError, Textarea } from "@/components/ui/field";
import type { FormState } from "@/lib/form";
import { cn } from "@/lib/utils";

const LABELS = ["", "Didn't help", "Not great", "Okay", "Helpful", "Really helped"];

export function RateChat({ sessionId, name }: { sessionId: string; name: string }) {
  const [state, action] = useActionState<FormState, FormData>(rateChat, {});
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);

  if (state.success) return <p className="mt-5 rounded-2xl bg-surface-2 px-4 py-3 text-sm">{state.success}</p>;

  const shown = hover || rating;
  return (
    <form action={action} className="mt-6 space-y-4 text-left">
      <input type="hidden" name="sessionId" value={sessionId} />
      <input type="hidden" name="rating" value={rating} />
      <fieldset>
        <legend className="text-center text-sm font-medium">How was your chat with {name}?</legend>
        <div className="mt-3 flex justify-center gap-1" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              aria-label={`${n} star${n > 1 ? "s" : ""} — ${LABELS[n]}`}
              aria-pressed={rating === n}
              onMouseEnter={() => setHover(n)}
              onFocus={() => setHover(n)}
              onBlur={() => setHover(0)}
              onClick={() => setRating(n)}
              className="rounded-full p-1.5 transition hover:scale-110"
            >
              <Star className={cn("size-8 transition", n <= shown ? "fill-rose text-rose" : "text-muted/40")} />
            </button>
          ))}
        </div>
        <p className="mt-1 h-5 text-center text-sm text-muted">{LABELS[shown]}</p>
      </fieldset>
      {rating ? (
        <>
          <label htmlFor="feedback" className="sr-only">
            Anything you&apos;d like to share? (optional)
          </label>
          <Textarea id="feedback" name="feedback" maxLength={500} placeholder="Anything you'd like to share? (optional, private)" className="min-h-20" />
          <FormError message={state.error} />
          <SubmitButton size="md" pendingLabel="Saving…">
            Submit rating
          </SubmitButton>
        </>
      ) : null}
    </form>
  );
}
