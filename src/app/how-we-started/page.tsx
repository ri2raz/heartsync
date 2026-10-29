import { ArrowRight, Sparkles } from "lucide-react";
import type { Metadata } from "next";

import { DailyQuoteCard, MotivationalQuotesGrid } from "@/components/effects/daily-quote";
import { HowWeStarted } from "@/components/landing/sections";
import { ButtonLink } from "@/components/ui/button";
import { Container, PageHeader } from "@/components/ui/section";

export const metadata: Metadata = {
  title: "How We Started · MannMitr",
  description: "The story behind MannMitr. Why we built an anonymous, free peer-support sanctuary for students and young adults in India.",
};

export default function HowWeStartedPage() {
  return (
    <>
      <Container className="pt-6 sm:pt-10">
        <PageHeader
          eyebrow="Our Story"
          title={
            <>
              Why MannMitr was <span className="italic text-rose">born.</span>
            </>
          }
          description="We didn't build MannMitr as a corporate product. We built it because we saw too many friends break down in coaching hostels, and we knew the crushing weight of academic pressure firsthand."
        />

        <div className="mx-auto max-w-3xl space-y-8 text-base leading-relaxed text-muted">
          <div className="rounded-3xl border border-rose/30 bg-rose-soft/20 p-6 sm:p-8 dark:bg-rose-soft/10">
            <p className="font-serif text-2xl italic leading-snug text-ink sm:text-3xl">
              &ldquo;When a student is crying at 3 AM in a dark hostel room, they don&apos;t need a lecture on hard work, and they don&apos;t need clinical jargon. They just need an older sibling to say: I hear you. Breathe. Your life is worth so much more than this rank.&rdquo;
            </p>
          </div>

          <DailyQuoteCard className="my-2" />

          <div className="space-y-4">
            <h2 className="font-serif text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              What we saw in Kota, Delhi, and beyond
            </h2>
            <p>
              Every year, millions of Indian teenagers leave their families to prepare for entrance exams — JEE, NEET, UPSC, CA, and board exams. They are thrust into high-stress coaching hubs, sleeping 3 to 4 hours a night, skipping meals, and suffocating under the silent guilt of their parents&apos; financial sacrifices.
            </p>
            <p>
              When test scores plunge or backlogs pile up, fear and shame set in. You can&apos;t tell your parents because you don&apos;t want to break their hearts. You can&apos;t tell your hostel mates because everyone is competing for the same few seats. The silence becomes unbearable.
            </p>
            <p>
              Tragically, that silence often ends in heartbreak. Every news headline reporting another student suicide in a coaching city broke something inside us. Those weren&apos;t just headlines or statistics — they were young people who had dreams, laughter, and so much life left to live.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="font-serif text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              We already went through that fire
            </h2>
            <p>
              The founders, creators, and listeners of MannMitr aren&apos;t distant psychologists or tech executives. We are former aspirants, drop-year survivors, and elders who stumbled through the exact same dark tunnels.
            </p>
            <p>
              We know what it feels like to believe you are a failure. We know what it feels like when physical burnout wrecks your sleep and your mind won&apos;t stop racing. But we also know that with time, perspective, and just one human being who genuinely listens without judging, you can make it to the other side.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="font-serif text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              Why Big Bros &amp; Big Sisters?
            </h2>
            <p>
              Professional therapy is essential for severe clinical illness, and MannMitr will always guide you to professional helplines like Tele-MANAS (14416) when clinical care is needed.
            </p>
            <p>
              However, for day-to-day emotional survival, what most young people need is peer solidarity — a trusted Big Bro or Big Sis who listens unconditionally. A place where you can be 100% anonymous, where no numbers or identities are shared, and where support is 100% free.
            </p>
          </div>

          <div className="rounded-3xl border border-line bg-surface p-6 sm:p-8 shadow-soft">
            <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
              <div>
                <h3 className="text-xl font-semibold text-ink">Need someone to talk to right now?</h3>
                <p className="mt-1 text-sm text-muted">
                  Choose a verified listener who understands your language and topic. No judgment, ever.
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2.5">
                <ButtonLink href="/listeners" variant="primary">
                  Find a listener <ArrowRight className="size-4" />
                </ButtonLink>
              </div>
            </div>
          </div>
        </div>

        {/* Motivational Quotes & Punchlines Wall */}
        <div className="mt-20 border-t border-line/60 pt-16" id="quotes">
          <div className="text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose/10 px-4 py-1.5 text-xs font-semibold text-rose">
              <Sparkles className="size-3.5" /> Words to Hold Onto
            </span>
            <h2 className="mt-3 font-serif text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Punchline Reminders for <span className="italic text-rose">Heavy Nights.</span>
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-muted">
              When mock test scores drop, drop-year anxiety kicks in, or the guilt feels too heavy — read these, take a deep breath, and remember that survival comes before achievement.
            </p>
          </div>

          <div className="mt-10">
            <MotivationalQuotesGrid />
          </div>
        </div>
      </Container>

      <div className="mt-12">
        <HowWeStarted />
      </div>
    </>
  );
}
