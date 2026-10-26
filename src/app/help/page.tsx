import { PhoneCall } from "lucide-react";
import type { Metadata } from "next";

import { Container, PageHeader } from "@/components/ui/section";
import { HELPLINES } from "@/lib/constants";

export const metadata: Metadata = { title: "Crisis helplines" };

export default function HelpPage() {
  return (
    <Container className="max-w-4xl">
      <PageHeader
        eyebrow="Get help now"
        title={
          <>
            If you&apos;re in danger, <span className="italic text-rose">call now.</span>
          </>
        }
        description="These services are free, confidential and answer 24×7. You don't need to explain everything — just say you need help."
      />
      <ul className="grid gap-4 sm:grid-cols-2">
        {HELPLINES.map((h) => (
          <li key={h.number}>
            <a
              href={`tel:${h.number}`}
              className="flex items-center gap-5 rounded-3xl border border-line bg-surface p-6 shadow-soft transition hover:-translate-y-0.5 hover:border-danger/30"
            >
              <span className="inline-flex size-14 shrink-0 items-center justify-center rounded-full bg-danger-soft text-danger">
                <PhoneCall className="size-6" aria-hidden />
              </span>
              <span>
                <span className="block font-serif text-4xl leading-none">{h.number}</span>
                <span className="mt-1 block text-sm text-muted">{h.name}</span>
                {"alt" in h ? <span className="block text-xs text-muted">Also: {h.alt}</span> : null}
              </span>
            </a>
          </li>
        ))}
      </ul>
      <div className="mt-10 rounded-3xl bg-surface-2 p-6 text-muted">
        <p className="font-medium text-ink">While you wait</p>
        <ul className="mt-3 list-disc space-y-1.5 pl-5">
          <li>Move away from anything you could use to hurt yourself.</li>
          <li>Call or message someone you trust and tell them you&apos;re not okay.</li>
          <li>If you can, go to the nearest hospital emergency department.</li>
        </ul>
      </div>
    </Container>
  );
}
