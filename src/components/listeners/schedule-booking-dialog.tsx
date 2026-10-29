"use client";

import { Calendar, Check, X } from "lucide-react";
import { useState, useTransition } from "react";

import { createBooking } from "@/actions/booking";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { TOPICS } from "@/lib/constants";

interface ScheduleBookingDialogProps {
  listenerId: string;
  listenerName: string;
}

export function ScheduleBookingDialog({ listenerId, listenerName }: ScheduleBookingDialogProps) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [dateStr, setDateStr] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1); // default tomorrow
    return d.toISOString().split("T")[0];
  });
  const [timeStr, setTimeStr] = useState("20:00"); // default 8:00 PM
  const [minutes, setMinutes] = useState(20);
  const [topic, setTopic] = useState("");
  const [note, setNote] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parts = (dateStr ?? "").split("-").map(Number);
    const timeParts = (timeStr ?? "").split(":").map(Number);
    const year = parts[0] ?? new Date().getFullYear();
    const month = (parts[1] ?? 1) - 1;
    const day = parts[2] ?? 1;
    const hours = timeParts[0] ?? 20;
    const mins = timeParts[1] ?? 0;
    const scheduledDate = new Date(year, month, day, hours, mins);

    if (scheduledDate.getTime() <= Date.now()) {
      setError("Please pick a future time slot.");
      return;
    }

    startTransition(async () => {
      const res = await createBooking(listenerId, scheduledDate.toISOString(), minutes, topic, note);
      if (res.ok) {
        setSuccess(
          `Your chat with ${listenerName} is booked for ${scheduledDate.toLocaleDateString("en-IN", {
            weekday: "short",
            month: "short",
            day: "numeric",
          })} at ${scheduledDate.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}.`,
        );
      } else {
        setError(res.error ?? "Failed to schedule chat.");
      }
    });
  }

  return (
    <>
      <Button
        type="button"
        variant="secondary"
        onClick={() => {
          setOpen(true);
          setSuccess(null);
          setError(null);
        }}
        className="gap-2"
      >
        <Calendar className="size-4 text-rose" />
        Schedule for later
      </Button>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-ink/40 animate-fade-in"
        >
          <div className="relative w-full max-w-lg rounded-3xl border border-line bg-surface p-6 shadow-soft sm:p-8">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-5 top-5 rounded-full p-2 text-muted hover:bg-surface-2 hover:text-ink"
              aria-label="Close"
            >
              <X className="size-5" />
            </button>

            {success ? (
              <div className="py-4 text-center space-y-4">
                <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-rose-soft text-rose">
                  <Check className="size-7" />
                </div>
                <p className="font-serif text-2xl font-bold text-ink">Chat Scheduled! 💛</p>
                <p className="text-sm leading-relaxed text-muted">{success}</p>
                <p className="text-xs text-muted">
                  We&apos;ll remind you and {listenerName} before the session begins. You can see your bookings in your
                  account.
                </p>
                <Button variant="rose" onClick={() => setOpen(false)} className="w-full mt-2">
                  Done
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <h3 className="font-serif text-2xl font-bold text-ink">Schedule with {listenerName}</h3>
                  <p className="mt-1 text-xs text-muted">
                    Pick a slot when you have quiet time to chat. Platonic, confidential peer support.
                  </p>
                </div>

                {error ? (
                  <p role="alert" className="rounded-2xl bg-danger-soft px-4 py-2.5 text-xs text-danger">
                    {error}
                  </p>
                ) : null}

                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Day" htmlFor="bookingDate">
                    <Input
                      id="bookingDate"
                      type="date"
                      value={dateStr}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => setDateStr(e.target.value)}
                      required
                    />
                  </Field>
                  <Field label="Time slot" htmlFor="bookingTime">
                    <Input
                      id="bookingTime"
                      type="time"
                      value={timeStr}
                      onChange={(e) => setTimeStr(e.target.value)}
                      required
                    />
                  </Field>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Duration" htmlFor="bookingMinutes">
                    <Select
                      id="bookingMinutes"
                      value={minutes}
                      onChange={(e) => setMinutes(Number(e.target.value))}
                    >
                      <option value={20}>20 minutes</option>
                      <option value={40}>40 minutes</option>
                    </Select>
                  </Field>

                  <Field label="Topic (optional)" htmlFor="bookingTopic">
                    <Select id="bookingTopic" value={topic} onChange={(e) => setTopic(e.target.value)}>
                      <option value="">Anything on my mind</option>
                      {Object.entries(TOPICS).map(([slug, name]) => (
                        <option key={slug} value={slug}>
                          {name}
                        </option>
                      ))}
                    </Select>
                  </Field>
                </div>

                <Field label="Note for listener (optional)" htmlFor="bookingNote">
                  <Textarea
                    id="bookingNote"
                    value={note}
                    onChange={(e) => setNote(e.target.value.slice(0, 300))}
                    maxLength={300}
                    placeholder="Briefly share what you'd like to talk through…"
                    className="min-h-16"
                  />
                </Field>

                <div className="pt-2">
                  <Button type="submit" variant="rose" disabled={pending} className="w-full">
                    {pending ? "Confirming slot…" : "Confirm Booking"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
