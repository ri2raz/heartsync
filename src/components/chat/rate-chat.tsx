"use client";

import { LifeBuoy, PhoneCall, Star } from "lucide-react";
import { useActionState, useState } from "react";

import { rateChat } from "@/actions/chat";
import { SubmitButton } from "@/components/auth/submit-button";
import { FormError, Textarea } from "@/components/ui/field";
import { HELPLINES } from "@/lib/constants";
import type { FormState } from "@/lib/form";
import { cn } from "@/lib/utils";

const WELLBEING_OPTIONS = [
  { score: 1, emoji: "🌧️", label: "Still very heavy", desc: "Overwhelmed / unchanged", alert: true },
  { score: 2, emoji: "😐", label: "A bit uneasy", desc: "Still carrying tension", alert: true },
  { score: 3, emoji: "🌤️", label: "A little lighter", desc: "Felt okay to share", alert: false },
  { score: 4, emoji: "✨", label: "Heard & supported", desc: "Relieved to talk", alert: false },
  { score: 5, emoji: "💛", label: "Much better", desc: "Calmer & hopeful", alert: false },
];

const STAR_LABELS = ["", "Didn't help", "Not great", "Okay", "Helpful", "Really helped"];

export function RateChat({ sessionId, name }: { sessionId: string; name: string }) {
  const [state, action] = useActionState<FormState, FormData>(rateChat, {});
  const [wellbeingScore, setWellbeingScore] = useState<number | null>(null);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);

  if (state.success) {
    const isLow = wellbeingScore !== null && wellbeingScore <= 2;
    return (
      <div className="mt-5 space-y-4 rounded-3xl border border-line bg-surface-2 p-5 text-center text-sm">
        <p className="font-medium text-ink">{state.success}</p>
        {isLow ? (
          <div className="rounded-2xl border border-danger/20 bg-danger-soft p-4 text-left text-xs leading-relaxed">
            <p className="flex items-center gap-1.5 font-semibold text-danger">
              <LifeBuoy className="size-4" /> 24×7 Helplines available for you:
            </p>
            <p className="mt-1 text-ink">
              You are never alone. Professional counsellors are ready to listen free of charge anytime.
            </p>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {HELPLINES.slice(0, 2).map((h) => (
                <a
                  key={h.number}
                  href={`tel:${h.number}`}
                  className="inline-flex items-center gap-1 rounded-full bg-surface px-3 py-1 font-semibold text-danger shadow-soft ring-1 ring-danger/20 hover:bg-danger-soft"
                >
                  <PhoneCall className="size-3" /> Call {h.name} ({h.number})
                </a>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  const shownStar = hover || rating;

  return (
    <form action={action} className="mt-6 space-y-6 text-left">
      <input type="hidden" name="sessionId" value={sessionId} />
      <input type="hidden" name="wellbeingScore" value={wellbeingScore ?? ""} />
      <input type="hidden" name="rating" value={rating} />

      {/* Part 1: Post-Chat Wellbeing Check */}
      <fieldset className="space-y-3">
        <legend className="text-center font-serif text-xl font-medium text-ink">
          How are you feeling right now?
        </legend>
        <p className="text-center text-xs text-muted">
          Your honest check-in helps us protect your emotional wellbeing.
        </p>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {WELLBEING_OPTIONS.map((opt) => {
            const selected = wellbeingScore === opt.score;
            return (
              <button
                key={opt.score}
                type="button"
                onClick={() => setWellbeingScore(opt.score)}
                aria-pressed={selected}
                className={cn(
                  "flex flex-col items-center rounded-2xl border p-3 text-center transition hover:scale-[1.02]",
                  selected
                    ? "border-rose bg-rose-soft/80 shadow-soft ring-2 ring-rose/20"
                    : "border-line bg-surface/60 hover:bg-surface",
                )}
              >
                <span className="text-2xl">{opt.emoji}</span>
                <span className="mt-1 text-xs font-semibold text-ink">{opt.label}</span>
                <span className="mt-0.5 text-[10px] text-muted">{opt.desc}</span>
              </button>
            );
          })}
        </div>

        {wellbeingScore !== null && wellbeingScore <= 2 ? (
          <div className="rounded-2xl border border-danger/20 bg-danger-soft/60 px-4 py-2.5 text-xs text-danger">
            <span className="font-semibold">It&apos;s okay to take your time.</span> Our safety team is flagged to
            support you, and 24×7 helplines like Tele-MANAS (14416) are always here.
          </div>
        ) : null}
      </fieldset>

      {/* Part 2: Listener Rating (unlocked after wellbeing selection) */}
      {wellbeingScore !== null ? (
        <fieldset className="space-y-3 border-t border-line/60 pt-5">
          <legend className="text-center text-sm font-medium text-ink">
            How was your chat with {name}?
          </legend>
          <div className="mt-2 flex justify-center gap-1.5" onMouseLeave={() => setHover(0)}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                aria-label={`${n} star${n > 1 ? "s" : ""} — ${STAR_LABELS[n]}`}
                aria-pressed={rating === n}
                onMouseEnter={() => setHover(n)}
                onFocus={() => setHover(n)}
                onBlur={() => setHover(0)}
                onClick={() => setRating(n)}
                className="rounded-full p-1.5 transition hover:scale-110"
              >
                <Star
                  className={cn("size-7 transition", n <= shownStar ? "fill-rose text-rose" : "text-muted/30")}
                />
              </button>
            ))}
          </div>
          <p className="h-4 text-center text-xs font-medium text-muted">{STAR_LABELS[shownStar]}</p>

          {rating ? (
            <div className="space-y-3 pt-2">
              <label htmlFor="feedback" className="sr-only">
                Anything you&apos;d like to share? (optional)
              </label>
              <Textarea
                id="feedback"
                name="feedback"
                maxLength={500}
                placeholder={`Anything you'd like to share about ${name}? (private, optional)`}
                className="min-h-20"
              />
              <FormError message={state.error} />
              <SubmitButton size="md" pendingLabel="Submitting…">
                Submit reflection
              </SubmitButton>
            </div>
          ) : null}
        </fieldset>
      ) : null}
    </form>
  );
}
