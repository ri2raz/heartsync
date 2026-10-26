import { Check } from "lucide-react";
import type { Metadata } from "next";

import { PricingCards } from "@/components/landing/sections";
import { ShimmerLink } from "@/components/ui/button";
import { Container, PageHeader } from "@/components/ui/section";
import { getCurrentUser } from "@/lib/auth";
import { FREE_CHAT_MINUTES } from "@/lib/constants";

export const metadata: Metadata = { title: "Pricing" };

const RULES = [
  `Your first ${FREE_CHAT_MINUTES}-minute chat is free — no card needed.`,
  "Minutes never expire and work with any listener.",
  "If a chat ends early, unused whole minutes go straight back to your balance.",
  "If a listener declines or doesn't join in 5 minutes, you get everything back.",
  "Never pay a listener directly. All payments happen through HeartSync.",
];

export default async function PricingPage() {
  const user = await getCurrentUser();
  return (
    <Container>
      <PageHeader
        eyebrow="Pricing"
        title={
          <>
            Simple, fair, <span className="italic text-rose">pocket-friendly.</span>
          </>
        }
        description="Buy minutes once, use them whenever you need someone to talk to."
      />
      <PricingCards />
      <div className="mt-12 grid gap-8 rounded-3xl border border-line bg-surface p-7 shadow-soft md:grid-cols-[1.4fr_1fr] md:items-center sm:p-9">
        <ul className="space-y-3">
          {RULES.map((rule) => (
            <li key={rule} className="flex gap-3">
              <Check className="mt-1 size-4 shrink-0 text-rose" aria-hidden />
              <span className="leading-relaxed">{rule}</span>
            </li>
          ))}
        </ul>
        <div className="md:justify-self-end">
          <ShimmerLink href={user ? "/account#top-up" : "/signup"}>{user ? "Top up minutes" : "Start your free chat"}</ShimmerLink>
        </div>
      </div>
    </Container>
  );
}
