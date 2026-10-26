import { Activity, ArrowRight, BookOpen, Compass, MapPin, ShieldCheck } from "lucide-react";
import type { ComponentType } from "react";

import { Aurora } from "@/components/effects/aurora";
import { BlurText } from "@/components/effects/blur-text";
import { GradientText } from "@/components/effects/gradient-text";
import { Avatar } from "@/components/ui/avatar";
import { ButtonLink, ShimmerLink } from "@/components/ui/button";
import { Container } from "@/components/ui/section";
import { TAGLINE_EN, TAGLINE_HI, TAGLINE_HI_ACCENT } from "@/lib/constants";
import { cn } from "@/lib/utils";

type Mood = { text: string; icon: ComponentType<{ className?: string }>; tone: string; height: string };

const MOODS_LEFT: Mood[] = [
  { text: "Physical burnout: 3 ghante ki neend, zero energy?", icon: Activity, tone: "bg-lilac/35", height: "min-h-60" },
  { text: "Naya sheher, hostel aur akelapan?", icon: MapPin, tone: "bg-sky/40", height: "min-h-40" },
];
const MOODS_RIGHT: Mood[] = [
  { text: "Mock test drop aur failure ka darr?", icon: BookOpen, tone: "bg-butter/45", height: "min-h-40" },
  { text: "Family expectations aur life beyond the exam?", icon: Compass, tone: "bg-rose-soft", height: "min-h-56" },
];

function MoodCard({ mood, delay }: { mood: Mood; delay: number }) {
  const Icon = mood.icon;
  return (
    <div
      className={cn("flex animate-float flex-col justify-between rounded-3xl border border-line p-5 shadow-soft", mood.tone, mood.height)}
      style={{ animationDelay: `${delay}s` }}
    >
      <span className="inline-flex size-9 items-center justify-center rounded-full bg-surface/80 text-ink shadow-soft">
        <Icon className="size-4" />
      </span>
      <p className="mt-6 font-serif text-[23px] leading-[1.08] text-ink">{mood.text}</p>
    </div>
  );
}

function ExampleChat() {
  return (
    <div className="rounded-3xl border border-line bg-surface p-4 shadow-soft">
      <div className="flex items-center gap-3 border-b border-line pb-3">
        <Avatar name="Big Sis" hue={330} size={36} />
        <div className="min-w-0">
          <p className="text-sm font-medium">Big Sis</p>
          <p className="text-xs text-muted">Example chat · Hinglish</p>
        </div>
        <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-emerald-500/12 px-2 py-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
          <ShieldCheck className="size-3" /> Verified
        </span>
      </div>
      <div className="space-y-2 pt-3 text-[13.5px] leading-snug">
        <p className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-ink px-3.5 py-2 text-bg">
          Result aaya… expected se bahut kam. Ghar pe kaise bataun samajh nahi aa raha.
        </p>
        <p className="w-fit max-w-[85%] rounded-2xl rounded-bl-md bg-surface-2 px-3.5 py-2">
          Yeh sach mein heavy hai, aur tumne share kiya — that takes guts. Abhi sabse zyada kya chubh raha hai?
        </p>
        <p className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-ink px-3.5 py-2 text-bg">
          Papa ka reaction. Unhone bahut umeed lagayi thi.
        </p>
      </div>
    </div>
  );
}

export function Hero({ signedIn }: { signedIn: boolean }) {
  return (
    <section className="relative isolate overflow-hidden">
      <Aurora />
      <Container className="relative grid items-center gap-14 pb-20 pt-12 sm:pt-20 lg:grid-cols-[1.08fr_1fr] lg:pb-28">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/70 px-3 py-1.5 text-xs font-medium text-muted shadow-soft backdrop-blur">
            <span className="size-1.5 rounded-full bg-rose" />
            Peer support · Not therapy · 18+
          </p>

          <h1 className="mt-6 font-serif text-[clamp(2.75rem,7vw,5.25rem)] leading-[0.98] tracking-tight">
            <BlurText text={TAGLINE_HI} />
            <span className="mt-1 block italic">
              <GradientText>{TAGLINE_HI_ACCENT}</GradientText>
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted sm:text-xl">{TAGLINE_EN}</p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <ShimmerLink href={signedIn ? "/listeners" : "/signup"}>
              Start your free chat <ArrowRight className="size-4" />
            </ShimmerLink>
            <ButtonLink href="/become-a-listener" variant="secondary" size="lg">
              Become a listener
            </ButtonLink>
          </div>

          <ul className="mt-10 grid max-w-lg grid-cols-2 gap-x-6 gap-y-3 text-sm text-muted">
            {["ID + police verified listeners", "Anonymous — nickname only", "Hindi + 9 languages", "First 20 minutes free"].map(
              (item) => (
                <li key={item} className="flex items-center gap-2">
                  <ShieldCheck className="size-4 shrink-0 text-rose" aria-hidden />
                  {item}
                </li>
              ),
            )}
          </ul>
        </div>

        <div className="relative" aria-label="Things people come to talk about">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-4">
              {MOODS_LEFT.map((mood, i) => (
                <MoodCard key={mood.text} mood={mood} delay={i * -2.1} />
              ))}
            </div>
            <div className="flex flex-col gap-4 pt-14">
              {MOODS_RIGHT.map((mood, i) => (
                <MoodCard key={mood.text} mood={mood} delay={i * -2.1 - 1} />
              ))}
            </div>
          </div>
          <div className="relative z-10 mx-auto -mt-6 w-[92%] -rotate-1 sm:w-[84%] lg:-ml-6 lg:w-[82%]">
            <ExampleChat />
          </div>
        </div>
      </Container>
    </section>
  );
}
