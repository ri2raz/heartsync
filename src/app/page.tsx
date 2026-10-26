import { Hero } from "@/components/landing/hero";
import {
  CanAndCannot,
  CrisisBand,
  Faq,
  FinalCta,
  HowItWorks,
  ListenerCta,
  ListenerPreview,
  PricingTeaser,
  TopicMarquee,
  WhyHeartSync,
} from "@/components/landing/sections";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { withPresence } from "@/lib/session-rules";

export default async function HomePage() {
  let user = null;
  let candidates: Awaited<ReturnType<typeof db.listenerProfile.findMany>> = [];

  try {
    [user, candidates] = await Promise.all([
      getCurrentUser(),
      db.listenerProfile.findMany({ where: { isActive: true }, orderBy: { createdAt: "asc" }, take: 200 }),
    ]);
  } catch (error: unknown) {
    if ((error as { digest?: string })?.digest === "DYNAMIC_SERVER_USAGE") {
      throw error;
    }
    console.error("[HeartSync] Failed to fetch home page data:", error);
  }

  const listeners = withPresence(candidates).slice(0, 4);
  const signedIn = Boolean(user);

  return (
    <>
      <Hero signedIn={signedIn} />
      <TopicMarquee />
      <HowItWorks />
      <WhyHeartSync />
      <CanAndCannot />
      <ListenerPreview listeners={listeners} />
      <PricingTeaser />
      <ListenerCta />
      <Faq />
      <CrisisBand />
      <FinalCta signedIn={signedIn} />
    </>
  );
}
