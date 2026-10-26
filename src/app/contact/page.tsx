"use client";

import { useActionState } from "react";
import { Mail, PhoneCall, Send, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { submitContactMessage } from "@/actions/contact";
import { SubmitButton } from "@/components/auth/submit-button";
import { Field, FormError, Input, Textarea } from "@/components/ui/field";
import { Container, PageHeader } from "@/components/ui/section";
import type { FormState } from "@/lib/form";

export default function ContactPage() {
  const [state, action] = useActionState<FormState, FormData>(submitContactMessage, {});

  return (
    <Container className="max-w-4xl">
      <PageHeader
        eyebrow="Contact & Support"
        title={
          <>
            We&apos;re here to <span className="italic text-rose">help you.</span>
          </>
        }
        description="Have a question, feedback, or need administrative assistance? Send us a message and our team will get back to you."
      />

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.3fr_1fr]">
        <div className="rounded-3xl border border-line bg-surface p-7 shadow-soft sm:p-9">
          <h2 className="font-serif text-2xl font-medium sm:text-3xl">Send us a message</h2>
          <p className="mt-1 text-sm text-muted">
            All messages are directly delivered to our administrative safety desk.
          </p>

          {state.success ? (
            <div className="mt-6 rounded-2xl bg-rose-soft/50 border border-rose/30 p-6 text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-rose text-rose-ink">
                <ShieldCheck className="size-6" />
              </div>
              <h3 className="mt-3 font-medium text-lg text-ink">Message Sent</h3>
              <p className="mt-2 text-sm text-muted leading-relaxed">
                {state.success}
              </p>
              <Link
                href="/"
                className="mt-6 inline-flex rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-bg hover:opacity-90 transition"
              >
                Return to home
              </Link>
            </div>
          ) : (
            <form action={action} className="mt-6 space-y-4">
              <Field label="Your Name or Nickname" htmlFor="name">
                <Input id="name" name="name" placeholder="Aarav" required minLength={2} maxLength={80} />
              </Field>

              <Field label="Email Address" htmlFor="email" hint="We will reply to this address">
                <Input id="email" name="email" type="email" placeholder="you@example.com" required />
              </Field>

              <Field label="Subject" htmlFor="subject">
                <Input id="subject" name="subject" placeholder="Question about listener verification / general support" required minLength={3} maxLength={120} />
              </Field>

              <Field label="Message" htmlFor="message">
                <Textarea
                  id="message"
                  name="message"
                  rows={4}
                  placeholder="How can we help you today? Please share as much detail as needed."
                  required
                  minLength={10}
                  maxLength={2000}
                />
              </Field>

              <FormError message={state.error} />

              <div className="pt-2">
                <SubmitButton variant="rose" size="lg" pendingLabel="Sending message…" className="w-full">
                  <Send className="size-4" /> Send message to admin desk
                </SubmitButton>
              </div>
            </form>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-line bg-surface p-6 shadow-soft">
            <div className="flex items-center gap-3 text-ink font-semibold">
              <Mail className="size-5 text-rose" />
              <span>Direct Support</span>
            </div>
            <p className="mt-2 text-sm text-muted leading-relaxed">
              Our safety team monitors inquiries around the clock. You can reach out directly via this form or by email.
            </p>
          </div>

          <div className="rounded-3xl border border-danger/30 bg-danger-soft/20 p-6 shadow-soft">
            <div className="flex items-center gap-3 text-danger font-semibold">
              <PhoneCall className="size-5" />
              <span>In Urgent Crisis?</span>
            </div>
            <p className="mt-2 text-sm text-muted leading-relaxed">
              If you or someone you know is in immediate danger or emotional distress, please do not wait for an email reply. Call free, confidential national helplines:
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <a
                href="tel:14416"
                className="flex items-center justify-between rounded-xl bg-surface px-4 py-2.5 text-sm font-medium border border-line hover:border-danger/40 transition"
              >
                <span>Tele-MANAS (Govt of India)</span>
                <span className="font-serif text-lg font-bold text-danger">14416</span>
              </a>
              <a
                href="tel:9152987821"
                className="flex items-center justify-between rounded-xl bg-surface px-4 py-2.5 text-sm font-medium border border-line hover:border-danger/40 transition"
              >
                <span>KIRAN Mental Health</span>
                <span className="font-serif text-lg font-bold text-danger">1800-599-0019</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}
