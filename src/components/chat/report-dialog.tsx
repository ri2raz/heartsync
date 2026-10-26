"use client";

import { X } from "lucide-react";
import { useActionState, useEffect, useRef } from "react";

import { reportChat } from "@/actions/chat";
import { SubmitButton } from "@/components/auth/submit-button";
import { Button } from "@/components/ui/button";
import { FormError, Textarea } from "@/components/ui/field";
import { REPORT_REASONS } from "@/lib/constants";
import type { FormState } from "@/lib/form";

export function ReportDialog({
  sessionId,
  open,
  onClose,
  onReported,
}: {
  sessionId: string;
  open: boolean;
  onClose: () => void;
  onReported: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [state, action] = useActionState<FormState, FormData>(reportChat, {});

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  const notified = useRef(false);
  useEffect(() => {
    if (state.success && !notified.current) {
      notified.current = true;
      onReported();
    }
  }, [state.success, onReported]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className="m-auto w-[min(92vw,460px)] rounded-[2rem] border border-line bg-surface p-0 text-ink shadow-2xl backdrop:bg-black/40 backdrop:backdrop-blur-sm"
      aria-labelledby="report-title"
    >
      <div className="p-6 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="report-title" className="font-serif text-3xl">
              Report this chat
            </h2>
            <p className="mt-1 text-sm text-muted">Reporting ends the chat immediately. Our safety team reviews every report.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-full p-1.5 hover:bg-surface-2">
            <X className="size-5" />
          </button>
        </div>

        {state.success ? (
          <div className="mt-6 space-y-4">
            <p className="rounded-2xl bg-surface-2 px-4 py-3 text-sm">{state.success}</p>
            <Button variant="primary" className="w-full" onClick={onClose}>
              Close
            </Button>
          </div>
        ) : (
          <form action={action} className="mt-6 space-y-4">
            <input type="hidden" name="sessionId" value={sessionId} />
            <fieldset className="space-y-2">
              <legend className="sr-only">Reason</legend>
              {REPORT_REASONS.map((reason, i) => (
                <label key={reason} className="flex cursor-pointer items-center gap-3 rounded-2xl border border-line px-4 py-3 text-sm has-[:checked]:border-rose has-[:checked]:bg-rose-soft">
                  <input type="radio" name="reason" value={reason} required defaultChecked={i === 0} className="accent-[var(--rose)]" />
                  {reason}
                </label>
              ))}
            </fieldset>
            <label htmlFor="report-details" className="sr-only">
              Details (optional)
            </label>
            <Textarea id="report-details" name="details" maxLength={1000} placeholder="What happened? (optional)" className="min-h-20" />
            <FormError message={state.error} />
            <SubmitButton variant="danger" size="md" pendingLabel="Sending…">
              Send report & end chat
            </SubmitButton>
          </form>
        )}
      </div>
    </dialog>
  );
}
