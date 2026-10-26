import { Check, MessageCircle, Sparkles } from "lucide-react";
import type { Metadata } from "next";

import { ButtonLink } from "@/components/ui/button";
import { Container, PageHeader } from "@/components/ui/section";

export const metadata: Metadata = { title: "100% Free Peer Support" };

const PLEDGES = [
  {
    title: "Zero Fees, Always",
    description: "HeartSync was built to ensure mental well-being and empathetic peer listening is accessible to every person, without financial barriers.",
  },
  {
    title: "No Cards or Payments Required",
    description: "You will never be asked for credit card details, UPI payments, or wallet top-ups. Simply choose an available listener and connect.",
  },
  {
    title: "Verified, Kind Big Bros & Big Sisters",
    description: "Every listener undergoes ID verification and training to provide confidential, judgment-free peer support.",
  },
  {
    title: "Safe, Moderated Environment",
    description: "Real-time moderation, automated crisis helpline assistance, and an active safety desk ensure conversations remain platonic and safe.",
  },
];

export default function PricingPage() {

  return (
    <Container className="max-w-4xl">
      <PageHeader
        eyebrow="Community Pledge"
        title={
          <>
            Completely free. <span className="italic text-rose">No paywalls.</span>
          </>
        }
        description="Because everyone deserves someone who listens without charging by the minute."
      />

      <div className="relative mt-8 overflow-hidden rounded-3xl border border-rose/30 bg-gradient-to-b from-rose/10 via-surface to-surface p-8 shadow-soft sm:p-12">
        <div className="inline-flex items-center gap-2 rounded-full bg-rose px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-rose-ink">
          <Sparkles className="size-3.5" /> 100% Free Peer Support
        </div>
        <h2 className="mt-4 font-serif text-3xl font-medium sm:text-4xl">
          Talk to a verified listener whenever you need to be heard.
        </h2>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
          We have completely eliminated paid packs and minute balances. All chat sessions on HeartSync are community-powered and free for everyone.
        </p>

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {PLEDGES.map((pledge) => (
            <div key={pledge.title} className="rounded-2xl border border-line bg-surface/80 p-5 shadow-sm">
              <div className="flex items-center gap-2 font-medium text-ink">
                <Check className="size-4 text-rose" />
                <span>{pledge.title}</span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted">{pledge.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <ButtonLink href="/listeners" variant="rose" size="lg">
            <MessageCircle className="size-4" /> Find an online listener
          </ButtonLink>
          <ButtonLink href="/contact" variant="secondary" size="lg">
            Have questions? Contact us
          </ButtonLink>
        </div>
      </div>
    </Container>
  );
}
