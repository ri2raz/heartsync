import {
  ArrowRight,
  BadgeCheck,
  Ban,
  Check,
  EyeOff,
  Flame,
  HandHeart,
  Languages,
  LifeBuoy,
  MessageCircleHeart,
  Plus,
  Quote,
  ShieldAlert,
  Sparkles,
  Wallet,
  X,
} from "lucide-react";
import Link from "next/link";

import { DailyQuoteCard } from "@/components/effects/daily-quote";
import { Marquee } from "@/components/effects/marquee";
import { Reveal } from "@/components/effects/reveal";
import { SpotlightCard } from "@/components/effects/spotlight-card";
import { Avatar } from "@/components/ui/avatar";
import { Badge, OnlineDot } from "@/components/ui/badge";
import { ButtonLink, ShimmerLink } from "@/components/ui/button";
import { FavoriteButton } from "@/components/listeners/favorite-button";
import { Container, SectionHeading } from "@/components/ui/section";
import { FREE_CHAT_MINUTES, HELPLINES, LANGUAGES, LISTENER_TITLES, PACKS, SUPPORT_PILLARS, TOPICS } from "@/lib/constants";
import { formatRupees } from "@/lib/session-rules";
import { cn, splitList } from "@/lib/utils";

const MARQUEE_ROW_A = [
  "No rank defines your soul",
  "Physical health & energy",
  "Ek score tumhari qeemat tay nahi karta",
  "Academic pressure & failure",
  "Rest is not surrender",
  "Life beyond the exam",
  "Tum akele nahi ho",
  "Study fatigue & burnout",
  "Hostel life & homesick",
];
const MARQUEE_ROW_B = [
  "Failure is an event, never a person",
  "Family expectations & guilt",
  "Breathe. One day at a time",
  "Loneliness & friendship",
  "Your parents need you alive, not just successful",
  "A safe space to talk",
  "5 saal baad koi attempt nahi puchega",
  "Mock tests & drop year",
  "Zero judgment listening",
];

export function TopicMarquee() {
  return (
    <section aria-label="Topics people talk about" className="space-y-3 py-6">
      {[MARQUEE_ROW_A, MARQUEE_ROW_B].map((row, i) => (
        <Marquee key={i} duration={i === 0 ? 45 : 55} reverse={i === 1}>
          {row.map((topic) => (
            <span
              key={topic}
              className="whitespace-nowrap rounded-full border border-line bg-surface px-5 py-2.5 font-serif text-xl italic text-ink/80 shadow-soft"
            >
              {topic}
            </span>
          ))}
        </Marquee>
      ))}
    </section>
  );
}

export function SupportPillars() {
  return (
    <section id="pillars" className="py-24">
      <Container>
        <SectionHeading
          eyebrow="What you can talk about"
          title={
            <>
              7 areas where you don&apos;t have to{" "}
              <span className="italic text-rose">carry it alone.</span>
            </>
          }
          description="From study fatigue and sleep debt to homesickness and failure. Talk to someone who gets it."
        />

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SUPPORT_PILLARS.map((pillar, i) => (
            <Reveal
              key={pillar.id}
              delay={i * 0.05}
              className={pillar.isPriority ? "sm:col-span-2 lg:col-span-3" : undefined}
            >
              <Link href={`/listeners?topic=${pillar.slug}`} className="group block h-full">
                <SpotlightCard
                  className={cn(
                    "relative flex h-full flex-col justify-between transition-shadow hover:shadow-hover",
                    pillar.isPriority && "border-rose/30 bg-rose-soft/20 dark:bg-rose-soft/10",
                  )}
                >
                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-serif text-3xl italic text-rose/80">{pillar.num}</span>
                      {pillar.badge ? (
                        <Badge tone="rose">{pillar.badge}</Badge>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-medium text-muted transition group-hover:text-rose">
                          Find listeners <ArrowRight className="size-3" />
                        </span>
                      )}
                    </div>
                    <h3 className="mt-4 text-xl font-semibold tracking-tight text-ink transition group-hover:text-rose">
                      {pillar.title}
                    </h3>
                    <p className="mt-1 text-sm font-medium italic text-muted">{pillar.tagline}</p>
                    <p className="mt-3 text-sm leading-relaxed text-muted">{pillar.description}</p>
                  </div>

                  <div className="mt-6 border-t border-line/60 pt-4">
                    <p className="text-xs font-medium text-muted">
                      <span className="font-semibold text-ink/80">Focus: </span>
                      {pillar.focus}
                    </p>
                  </div>
                </SpotlightCard>
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

const STEPS = [
  {
    title: "Pick your person",
    body: "Browse verified big bros and big sisters by language and topic. See who's online right now.",
  },
  {
    title: "Talk, anonymously",
    body: "Chat with just a nickname. No numbers, no profiles to stalk, no judgement — just someone who listens.",
  },
  {
    title: "Feel a little lighter",
    body: "20, 40 or 60 minutes, at your pace. Your first chat is free, and unused minutes are returned to you.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="py-24">
      <Container>
        <SectionHeading
          eyebrow="How it works"
          title={
            <>
              Three steps. <span className="italic text-rose">Zero awkwardness.</span>
            </>
          }
        />
        <ol className="mt-14 grid gap-5 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <li key={step.title}>
              <Reveal delay={i * 0.08} className="h-full">
                <div className="relative h-full rounded-3xl border border-line bg-surface p-7 shadow-soft">
                  <span className="font-serif text-6xl italic leading-none text-rose/80">0{i + 1}</span>
                  <h3 className="mt-6 text-xl font-semibold tracking-tight">{step.title}</h3>
                  <p className="mt-2 leading-relaxed text-muted">{step.body}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}

function BlockedPreview() {
  return (
    <div className="mt-6 space-y-2 text-sm">
      <div className="ml-auto w-fit max-w-[90%] rounded-2xl rounded-br-md bg-ink/90 px-3.5 py-2 text-bg line-through decoration-rose decoration-2">
        insta id do na, wahan baat karte hai
      </div>
      <div className="flex items-start gap-2 rounded-2xl bg-rose-soft px-3.5 py-2.5 text-rose">
        <Ban className="mt-0.5 size-4 shrink-0" aria-hidden />
        <span>Handles and numbers aren&apos;t allowed. Keep the conversation here.</span>
      </div>
    </div>
  );
}

export function WhyMannMitr() {
  return (
    <section className="py-24">
      <Container>
        <SectionHeading
          eyebrow="Why MannMitr"
          title={
            <>
              Built for trust, <span className="italic">not for swipes.</span>
            </>
          }
          description="Talking to a stranger only works when it's safe. So safety isn't a feature here — it's the whole product."
        />

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          <Reveal className="md:col-span-2">
            <SpotlightCard className="h-full">
              <BadgeCheck className="size-7 text-rose" aria-hidden />
              <h3 className="mt-5 text-2xl font-semibold tracking-tight">Verified, not random</h3>
              <p className="mt-2 max-w-lg leading-relaxed text-muted">
                Every listener passes ID verification, police verification and our listening-skills training before
                their first chat. Ratings and reports keep everyone accountable.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {["DigiLocker ID", "Police verification", "15-hour training", "Ongoing reviews"].map((s) => (
                  <Badge key={s} tone="rose">
                    <Check className="size-3" aria-hidden /> {s}
                  </Badge>
                ))}
              </div>
            </SpotlightCard>
          </Reveal>

          <Reveal delay={0.05}>
            <SpotlightCard className="h-full">
              <EyeOff className="size-7 text-rose" aria-hidden />
              <h3 className="mt-5 text-2xl font-semibold tracking-tight">Anonymous by default</h3>
              <p className="mt-2 leading-relaxed text-muted">
                Use any nickname. Your email, number and real name are never shown to anyone.
              </p>
            </SpotlightCard>
          </Reveal>

          <Reveal>
            <SpotlightCard className="h-full">
              <Languages className="size-7 text-rose" aria-hidden />
              <h3 className="mt-5 text-2xl font-semibold tracking-tight">Your language</h3>
              <p className="mt-2 leading-relaxed text-muted">Dil ki baat dil ki bhasha mein.</p>
              <div className="mt-5 flex flex-wrap gap-1.5">
                {Object.values(LANGUAGES).map((l) => (
                  <Badge key={l}>{l}</Badge>
                ))}
              </div>
            </SpotlightCard>
          </Reveal>

          <Reveal delay={0.05} className="md:col-span-2">
            <SpotlightCard className="h-full">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <ShieldAlert className="size-7 text-rose" aria-hidden />
                  <h3 className="mt-5 text-2xl font-semibold tracking-tight">Safety that works on its own</h3>
                  <p className="mt-2 leading-relaxed text-muted">
                    Numbers, social handles, links, money requests and meet-up plans are blocked automatically.
                    Crisis words alert our safety team instantly and show helplines to both of you.
                  </p>
                </div>
                <BlockedPreview />
              </div>
            </SpotlightCard>
          </Reveal>

          <Reveal>
            <SpotlightCard className="h-full">
              <Wallet className="size-7 text-rose" aria-hidden />
              <h3 className="mt-5 text-2xl font-semibold tracking-tight">Pocket-friendly</h3>
              <p className="mt-2 leading-relaxed text-muted">
                First {FREE_CHAT_MINUTES} minutes free. After that, from {formatRupees(PACKS[0].pricePaise)} for{" "}
                {PACKS[0].minutes} minutes.
              </p>
            </SpotlightCard>
          </Reveal>

          <Reveal delay={0.05} className="md:col-span-2">
            <SpotlightCard className="h-full">
              <HandHeart className="size-7 text-rose" aria-hidden />
              <h3 className="mt-5 text-2xl font-semibold tracking-tight">Honest about what we are</h3>
              <p className="mt-2 max-w-xl leading-relaxed text-muted">
                We&apos;re peer support — like a caring older sibling — not therapy. When something needs a
                professional, your listener will say so and point you to one.
              </p>
            </SpotlightCard>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}

export function HowWeStarted() {
  return (
    <section id="story" className="py-24">
      <Container>
        <SectionHeading
          eyebrow="How we started"
          title={
            <>
              We started this because we saw too many friends{" "}
              <span className="italic text-rose">suffer in silence.</span>
            </>
          }
          description="MannMitr wasn't created in a boardroom. It was born from hostel rooms, coaching corridors, and the painful reality of losing peers to academic pressure. We already went through that fire — and we couldn't just look away."
        />

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          <Reveal className="md:col-span-2">
            <SpotlightCard className="h-full">
              <span className="inline-flex size-10 items-center justify-center rounded-2xl bg-rose-soft text-rose">
                <Quote className="size-5" aria-hidden />
              </span>
              <h3 className="mt-5 text-2xl font-semibold tracking-tight">
                The silence in coaching hubs is what broke us
              </h3>
              <p className="mt-3 leading-relaxed text-muted">
                Kota, Delhi, Hyderabad, Bengaluru — in crowded hostel rooms across the country, millions of young aspirants wake up to 14-hour study grinds, sleep deprivation, and the suffocating guilt of middle-class family sacrifices.
              </p>
              <p className="mt-2.5 leading-relaxed text-muted">
                Too often, when scores drop or backlogs mount, students isolate themselves. We saw friends break down behind closed doors, and tragically, we saw news headlines of student suicides that were never just statistics to us. They were our friends, peers, and roommates who felt completely alone with nowhere safe to turn.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-line/60 pt-4 text-xs font-medium text-muted">
                <Badge tone="rose">The Core Truth</Badge>
                <span>No exam score or rank is worth a human life. Ever.</span>
              </div>
            </SpotlightCard>
          </Reveal>

          <Reveal delay={0.06}>
            <SpotlightCard className="flex h-full flex-col justify-between">
              <div>
                <span className="inline-flex size-10 items-center justify-center rounded-2xl bg-lilac/35 text-ink">
                  <Flame className="size-5 text-rose" aria-hidden />
                </span>
                <h3 className="mt-5 text-2xl font-semibold tracking-tight">
                  We already went through it
                </h3>
                <p className="mt-3 leading-relaxed text-muted">
                  We aren&apos;t distant corporate observers. We are former aspirants, drop-year survivors, and students who know the physical burnout, the 3 AM panic spirals, and the terror of letting parents down.
                </p>
                <p className="mt-2.5 leading-relaxed text-muted">
                  We built the space we desperately needed when we were 18 and drowning in silence.
                </p>
              </div>
              <div className="mt-6 rounded-2xl bg-surface-2 p-3.5 text-xs text-muted">
                &ldquo;You don&apos;t need someone to fix you or judge you. You just need someone who has walked that road to listen.&rdquo;
              </div>
            </SpotlightCard>
          </Reveal>

          <Reveal delay={0.12}>
            <SpotlightCard className="h-full">
              <span className="inline-flex size-10 items-center justify-center rounded-2xl bg-sky/40 text-ink">
                <HandHeart className="size-5 text-sky-600 dark:text-sky-400" aria-hidden />
              </span>
              <h3 className="mt-5 text-2xl font-semibold tracking-tight">
                Peer support, not clinical lectures
              </h3>
              <p className="mt-3 leading-relaxed text-muted">
                Therapy is vital for clinical diagnosis, but when you&apos;re feeling worthless at midnight after a mock test, clinical jargon can feel cold and intimidating.
              </p>
              <p className="mt-2.5 leading-relaxed text-muted">
                What helps first is a Big Bro or Big Sis — an older peer who sits with you in the dark, reminds you to breathe, and helps you see that there is a vast, beautiful life beyond any entrance exam.
              </p>
            </SpotlightCard>
          </Reveal>

          <Reveal delay={0.18} className="md:col-span-2">
            <SpotlightCard className="flex h-full flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="inline-flex size-10 items-center justify-center rounded-2xl bg-emerald-500/12 text-emerald-600 dark:text-emerald-400">
                    <LifeBuoy className="size-5" aria-hidden />
                  </span>
                  <Badge tone="green">100% Free &amp; Confidential</Badge>
                </div>
                <h3 className="mt-5 text-2xl font-semibold tracking-tight">
                  Our promise: A safe corner with zero barriers
                </h3>
                <p className="mt-3 leading-relaxed text-muted">
                  MannMitr is 100% free, strictly anonymous, and platonic. No credit cards, no public profiles, no phone numbers shared. Every listener is verified and trained to listen with empathy, patience, and zero judgment.
                </p>
              </div>
              <div className="mt-6 flex flex-col gap-3 border-t border-line/60 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-muted">
                  In crisis? Call Tele-MANAS on <strong className="text-ink">14416</strong> or <strong className="text-ink">112</strong> (24×7, free).
                </p>
                <Link
                  href="/listeners"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose hover:underline"
                >
                  Talk to a Big Bro or Sis <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </SpotlightCard>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}

export function DailyAffirmationSection() {
  return (
    <section className="py-16 sm:py-20 border-y border-line/40 bg-surface/40">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose/10 px-3.5 py-1 text-xs font-semibold text-rose">
            <Sparkles className="size-3.5" /> Daily Affirmations &amp; Punchlines
          </span>
          <h2 className="mt-3 font-serif text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Words to remind you that your life is{" "}
            <span className="italic text-rose">bigger than any exam.</span>
          </h2>
          <p className="mx-auto mt-2.5 max-w-xl text-sm leading-relaxed text-muted">
            Hostel rooms at 3 AM can feel overwhelmingly lonely. Here are unfiltered punchline truths from people who survived the exact same storm.
          </p>
        </div>
        <div className="mx-auto mt-8 max-w-2xl">
          <DailyQuoteCard />
          <div className="mt-4 text-center">
            <Link
              href="/how-we-started#quotes"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-rose hover:underline"
            >
              Browse all 16 motivational punchlines &rarr;
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}

const CAN = [
  "Listen without judging",
  "Share what helped them",
  "Help you think through exams, career, family, breakups",
  "Point you to professional help when it's needed",
];
const CANNOT = [
  "Diagnose anything or suggest medicines",
  "Call themselves a therapist or doctor",
  "Ask for your number, socials or to meet",
  "Take money outside MannMitr",
];

export function CanAndCannot() {
  return (
    <section className="py-24">
      <Container>
        <SectionHeading
          eyebrow="Clear lines"
          title={
            <>
              What a big bro or big sis <span className="italic">is — and isn&apos;t.</span>
            </>
          }
        />
        <div className="mx-auto mt-14 grid max-w-4xl gap-5 md:grid-cols-2">
          <Reveal>
            <div className="h-full rounded-3xl border border-line bg-surface p-7 shadow-soft">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-600 dark:text-emerald-400">They will</p>
              <ul className="mt-5 space-y-4">
                {CAN.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/12 text-emerald-600 dark:text-emerald-400">
                      <Check className="size-3.5" aria-hidden />
                    </span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal delay={0.06}>
            <div className="h-full rounded-3xl border border-line bg-surface p-7 shadow-soft">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-rose">They won&apos;t</p>
              <ul className="mt-5 space-y-4">
                {CANNOT.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-rose-soft text-rose">
                      <X className="size-3.5" aria-hidden />
                    </span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}

export type ListenerCardData = {
  id: string;
  displayName: string;
  title: string;
  bio: string;
  languages: string;
  topics: string;
  avatarHue: number;
  isOnline: boolean;
  isVerified?: boolean;
  isFavorited?: boolean;
  ratingSum: number;
  ratingCount: number;
};

export function ListenerCard({ listener, className }: { listener: ListenerCardData; className?: string }) {
  const title = LISTENER_TITLES[listener.title as keyof typeof LISTENER_TITLES] ?? "Listener";
  const rating = listener.ratingCount ? (listener.ratingSum / listener.ratingCount).toFixed(1) : null;
  const langs = splitList(listener.languages).map((c) => LANGUAGES[c as keyof typeof LANGUAGES] ?? c);
  const topics = splitList(listener.topics).map((t) => TOPICS[t as keyof typeof TOPICS] ?? t);

  return (
    <Link href={`/listeners/${listener.id}`} className={cn("block h-full", className)}>
      <SpotlightCard className="flex h-full flex-col">
        <div className="flex items-start justify-between gap-3">
          <Avatar name={listener.displayName} hue={listener.avatarHue} size={56} />
          <div className="flex items-center gap-1.5">
            <span className="rounded-full bg-surface-2 px-2.5 py-1 text-xs font-medium">
              {rating ? `★ ${rating}` : <span className="text-muted">New</span>}
            </span>
            <FavoriteButton listenerProfileId={listener.id} initialFavorited={listener.isFavorited} />
          </div>
        </div>
        <div className="mt-4 min-w-0">
          <p className="flex items-center gap-1.5 text-lg font-semibold tracking-tight">
            <span className="truncate">{listener.displayName}</span>
            {listener.isVerified ? (
              <BadgeCheck className="size-4 shrink-0 text-rose" aria-label="Verified Listener" />
            ) : null}
          </p>
          <p className="mt-0.5 flex items-center gap-2 text-sm text-muted">
            <OnlineDot online={listener.isOnline} />
            {title} · {listener.isOnline ? "Online now" : "Offline"}
          </p>
        </div>
        <p className="mt-3 line-clamp-3 flex-1 leading-relaxed text-muted">{listener.bio}</p>
        <div className="mt-5 flex flex-wrap gap-1.5">
          {topics.slice(0, 3).map((t) => (
            <Badge key={t} tone="rose">
              {t}
            </Badge>
          ))}
          {langs.slice(0, 3).map((l) => (
            <Badge key={l}>{l}</Badge>
          ))}
        </div>
      </SpotlightCard>
    </Link>
  );
}

export function ListenerPreview({ listeners }: { listeners: ListenerCardData[] }) {
  return (
    <section className="py-24">
      <Container>
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading
            className="mx-0 text-left"
            eyebrow="Meet the listeners"
            title={
              <>
                Real people. <span className="italic">Really listening.</span>
              </>
            }
          />
          {listeners.length ? (
            <ButtonLink href="/listeners" variant="secondary">
              See all listeners <ArrowRight className="size-4" />
            </ButtonLink>
          ) : null}
        </div>

        {listeners.length ? (
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {listeners.map((l, i) => (
              <Reveal key={l.id} delay={i * 0.05}>
                <ListenerCard listener={l} />
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="mt-12 rounded-3xl border border-dashed border-line bg-surface/60 p-10 text-center">
            <Sparkles className="mx-auto size-8 text-rose" aria-hidden />
            <p className="mt-4 font-serif text-3xl">Our first listeners are in training.</p>
            <p className="mx-auto mt-2 max-w-md text-muted">
              Want to be one of them? We&apos;re looking for kind, patient people who&apos;ve been through things.
            </p>
            <ButtonLink href="/become-a-listener" className="mt-6">
              Apply to listen
            </ButtonLink>
          </div>
        )}
      </Container>
    </section>
  );
}

export function PricingCards({ compact = false }: { compact?: boolean }) {
  return (
    <div className={cn("grid gap-5", compact ? "md:grid-cols-4" : "md:grid-cols-2 lg:grid-cols-4")}>
      <div className="flex flex-col rounded-3xl border border-line bg-surface p-7 shadow-soft">
        <p className="text-sm font-medium text-muted">First chat</p>
        <p className="mt-3 font-serif text-5xl">Free</p>
        <p className="mt-1 text-sm text-muted">{FREE_CHAT_MINUTES} minutes, once</p>
        <p className="mt-5 flex-1 leading-relaxed text-muted">See how it feels. No card needed.</p>
      </div>
      {PACKS.map((pack) => {
        const featured = "featured" in pack && pack.featured;
        return (
          <div
            key={pack.id}
            className={cn(
              "relative flex flex-col rounded-3xl border p-7 shadow-soft",
              featured ? "border-transparent bg-ink text-bg" : "border-line bg-surface",
            )}
          >
            {featured ? (
              <span className="absolute -top-3 left-7 rounded-full bg-rose px-3 py-1 text-xs font-semibold text-rose-ink">
                Most chosen
              </span>
            ) : null}
            <p className={cn("text-sm font-medium", featured ? "text-bg/70" : "text-muted")}>{pack.name}</p>
            <p className="mt-3 font-serif text-5xl">{formatRupees(pack.pricePaise)}</p>
            <p className={cn("mt-1 text-sm", featured ? "text-bg/70" : "text-muted")}>
              {pack.minutes} minutes · {formatRupees(Math.round(pack.pricePaise / pack.minutes))}/min
            </p>
            <p className={cn("mt-5 flex-1 leading-relaxed", featured ? "text-bg/80" : "text-muted")}>{pack.blurb}</p>
          </div>
        );
      })}
    </div>
  );
}

export function PricingTeaser() {
  return (
    <section className="py-24">
      <Container>
        <SectionHeading
          eyebrow="100% Free"
          title={
            <>
              Community peer support. <span className="italic">Always free.</span>
            </>
          }
          description="We do not charge by the minute or sell subscription packs. MannMitr is powered by verified peers who believe in listening without judgment."
        />
        <div className="mt-10 rounded-3xl border border-rose/30 bg-rose-soft/20 p-8 text-center sm:p-12 shadow-soft">
          <p className="font-serif text-3xl font-medium sm:text-4xl text-ink">
            No credit cards, no top-ups, no paywalls.
          </p>
          <p className="mx-auto mt-3 max-w-xl text-muted text-sm sm:text-base leading-relaxed">
            Connect anonymously with verified Big Bros and Big Sisters for 20, 40, or 60 minute chats whenever you need someone to talk to.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <ButtonLink href="/listeners" variant="rose" size="lg">
              Talk to someone now
            </ButtonLink>
          </div>
        </div>
      </Container>
    </section>
  );
}

export function ListenerCta() {
  return (
    <section className="py-12">
      <Container>
        <div className="relative overflow-hidden rounded-[2.5rem] bg-ink px-6 py-16 text-bg sm:px-14">
          <div
            aria-hidden
            className="absolute -right-24 -top-24 size-96 rounded-full bg-[radial-gradient(circle,var(--rose),transparent_65%)] opacity-50 blur-2xl"
          />
          <div
            aria-hidden
            className="absolute -bottom-32 left-10 size-96 rounded-full bg-[radial-gradient(circle,var(--lilac),transparent_65%)] opacity-40 blur-2xl"
          />
          <div className="relative grid gap-10 md:grid-cols-[1.3fr_1fr] md:items-center">
            <div>
              <MessageCircleHeart className="size-9 text-rose" aria-hidden />
              <h2 className="mt-5 font-serif text-4xl leading-[1.05] sm:text-5xl">
                Be someone&apos;s <span className="italic">big bro or big sis.</span>
              </h2>
              <p className="mt-4 max-w-lg text-lg leading-relaxed text-bg/75">
                Earn per minute, on your own schedule, doing something that matters. We train you, verify you, and
                have your back with a safety team on call.
              </p>
            </div>
            <ul className="space-y-3">
              {["Flexible hours, from home", "Free listening-skills training", "Safety team + psychologist advisor", "Paid for every minute you listen"].map(
                (item) => (
                  <li key={item} className="flex items-center gap-3 rounded-2xl bg-white/6 px-4 py-3 ring-1 ring-white/10">
                    <Check className="size-4 text-rose" aria-hidden /> {item}
                  </li>
                ),
              )}
              <li className="pt-2">
                <ShimmerLink href="/become-a-listener" className="w-full">
                  Apply to be a listener <ArrowRight className="size-4" />
                </ShimmerLink>
              </li>
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}

export const FAQS = [
  {
    q: "Is this therapy?",
    a: "No. MannMitr is peer support — trained, verified people who listen and share life experience, like an older sibling would. Listeners don't diagnose, treat or prescribe. If you need a therapist or doctor, your listener will encourage you to see one.",
  },
  {
    q: "Who are the listeners?",
    a: "Adults (18+) who applied, passed ID and police verification, and completed our listening-skills training. They follow a strict code of conduct and are rated after every chat.",
  },
  {
    q: "Is it really anonymous?",
    a: "Yes. Listeners only see the nickname you choose. Your email, phone number and real name are never shown. Phone numbers, social handles and links are blocked in chat for both sides.",
  },
  {
    q: "Can I meet my listener or get their number?",
    a: "No — and that's on purpose. Every conversation stays inside MannMitr. Meet-up requests, contact sharing and anything romantic are blocked and can get an account removed.",
  },
  {
    q: "What if I'm in crisis?",
    a: "If you're in danger or thinking about ending your life, please call Tele-MANAS on 14416 (free, 24×7) or 112 right now. If crisis words come up in a chat, we show helplines to both people and alert our safety team.",
  },
  {
    q: "Who can use MannMitr?",
    a: "Anyone 18 or older in India. If you're under 18 and need to talk, Childline (1098) and Tele-MANAS (14416) are free and available 24×7.",
  },
  {
    q: "How do payments and refunds work?",
    a: `Your first ${FREE_CHAT_MINUTES}-minute chat is free. After that, buy a minutes pack. If a chat ends early, unused whole minutes go straight back to your balance. If a listener doesn't accept your request, you get everything back.`,
  },
];

export function Faq() {
  return (
    <section id="faq" className="py-24">
      <Container className="max-w-3xl">
        <SectionHeading eyebrow="FAQ" title={<>Questions, <span className="italic">answered honestly.</span></>} />
        <div className="mt-12 divide-y divide-line rounded-3xl border border-line bg-surface shadow-soft">
          {FAQS.map((item) => (
            <details key={item.q} className="group px-6 py-5 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-lg font-medium">
                {item.q}
                <Plus className="size-5 shrink-0 text-muted transition-transform duration-300 group-open:rotate-45" aria-hidden />
              </summary>
              <p className="mt-3 leading-relaxed text-muted">{item.a}</p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}

export function CrisisBand() {
  return (
    <section className="py-12">
      <Container>
        <div className="flex flex-col gap-6 rounded-3xl border border-danger/20 bg-danger-soft p-7 sm:p-9 md:flex-row md:items-center">
          <LifeBuoy className="size-10 shrink-0 text-danger" aria-hidden />
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-ink">In danger right now? Please don&apos;t wait for a chat.</h2>
            <p className="mt-1 text-muted">These helplines are free and answer 24×7.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {HELPLINES.map((h) => (
              <a
                key={h.number}
                href={`tel:${h.number}`}
                className="rounded-full bg-surface px-4 py-2 text-sm font-semibold text-ink shadow-soft ring-1 ring-line transition hover:ring-danger/40"
              >
                {h.number} <span className="font-normal text-muted">· {h.name.split(" (")[0]}</span>
              </a>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

export function FinalCta({ signedIn }: { signedIn: boolean }) {
  return (
    <section className="py-24">
      <Container className="text-center">
        <h2 className="mx-auto max-w-3xl text-balance font-serif text-5xl leading-[1.02] sm:text-6xl">
          Kisi se baat karni hai? <span className="italic text-rose">Hum sun rahe hain.</span>
        </h2>
        <p className="mx-auto mt-5 max-w-lg text-lg text-muted">Your first {FREE_CHAT_MINUTES} minutes are on us.</p>
        <div className="mt-9 flex justify-center">
          <ShimmerLink href={signedIn ? "/listeners" : "/signup"}>
            Start your free chat <ArrowRight className="size-4" />
          </ShimmerLink>
        </div>
      </Container>
    </section>
  );
}
