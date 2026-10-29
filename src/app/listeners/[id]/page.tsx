import { ArrowLeft, BadgeCheck, Clock, Languages, MessageCircle, Star } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { StartChatForm } from "@/components/listeners/start-chat-form";
import { FavoriteButton } from "@/components/listeners/favorite-button";
import { ScheduleBookingDialog } from "@/components/listeners/schedule-booking-dialog";
import { Avatar } from "@/components/ui/avatar";
import { Badge, OnlineDot } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/section";
import { getCurrentUser } from "@/lib/auth";
import { LANGUAGES, LISTENER_TITLES, TOPICS } from "@/lib/constants";
import { db } from "@/lib/db";
import { isListenerOnline } from "@/lib/session-rules";
import { splitList } from "@/lib/utils";

type Params = { params: Promise<{ id: string }> };

async function getListener(id: string) {
  try {
    return await db.listenerProfile.findFirst({ where: { id, isActive: true } });
  } catch (error) {
    console.error("[MannMitr] Failed to fetch listener:", error);
    return null;
  }
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const listener = await getListener((await params).id);
  return { title: listener ? `${listener.displayName} — listener` : "Listener" };
}

export const dynamic = "force-dynamic";

export default async function ListenerPage({ params }: Params) {
  const { id } = await params;
  const [listener, user] = await Promise.all([getListener(id), getCurrentUser()]);
  if (!listener) notFound();
  const online = isListenerOnline(listener);

  const title = LISTENER_TITLES[listener.title as keyof typeof LISTENER_TITLES] ?? "Listener";
  const rating = listener.ratingCount ? (listener.ratingSum / listener.ratingCount).toFixed(1) : null;
  const langs = splitList(listener.languages).map((c) => LANGUAGES[c as keyof typeof LANGUAGES] ?? c);
  const topics = splitList(listener.topics).map((t) => TOPICS[t as keyof typeof TOPICS] ?? t);
  let chats = 0;
  let isFav = false;
  try {
    const [c, fav] = await Promise.all([
      db.chatSession.count({ where: { listenerId: listener.id, status: "ENDED" } }),
      user && user.role === "SEEKER"
        ? db.favoriteListener.count({ where: { userId: user.id, listenerId: listener.id } })
        : 0,
    ]);
    chats = c;
    isFav = fav > 0;
  } catch (error) {
    console.error("[MannMitr] Failed to count chats/favorites:", error);
  }

  return (
    <Container className="max-w-5xl">
      <Link href="/listeners" className="mt-8 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
        <ArrowLeft className="size-4" aria-hidden /> All listeners
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_380px]">
        <section>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <Avatar name={listener.displayName} hue={listener.avatarHue} size={96} />
            <div className="flex-1">
              <div className="flex items-center justify-between gap-3">
                <h1 className="flex items-center gap-2 font-serif text-5xl leading-none tracking-tight">
                  {listener.displayName}
                  {listener.isVerified ? (
                    <BadgeCheck className="size-6 text-rose" aria-label="Verified Listener" />
                  ) : null}
                </h1>
                {user && user.role === "SEEKER" ? (
                  <FavoriteButton listenerProfileId={listener.id} initialFavorited={isFav} />
                ) : null}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-muted">
                <OnlineDot online={online} /> {title} · {online ? "Online now" : "Offline"}
                {listener.isVerified ? (
                  <Badge tone="rose" className="gap-1 ml-1 text-xs py-0.5">
                    <BadgeCheck className="size-3" /> ID & Police Verified
                  </Badge>
                ) : (
                  <Badge tone="neutral" className="ml-1 text-xs py-0.5">
                    Verification Pending
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <dl className="mt-8 grid grid-cols-3 gap-3">
            {[
              { icon: Star, label: "Rating", value: rating ? `${rating} / 5` : "New" },
              { icon: MessageCircle, label: "Chats", value: String(chats) },
              { icon: Clock, label: "Minutes heard", value: listener.minutesHeard.toLocaleString("en-IN") },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-2xl border border-line bg-surface p-4 shadow-soft">
                <dt className="flex items-center gap-1.5 text-xs text-muted">
                  <Icon className="size-3.5" aria-hidden /> {label}
                </dt>
                <dd className="mt-1 text-lg font-semibold">{value}</dd>
              </div>
            ))}
          </dl>

          <h2 className="mt-10 text-sm font-semibold uppercase tracking-[0.16em] text-muted">About</h2>
          <p className="mt-3 whitespace-pre-line text-lg leading-relaxed">{listener.bio}</p>

          <h2 className="mt-10 text-sm font-semibold uppercase tracking-[0.16em] text-muted">Good to talk to about</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {topics.map((t) => (
              <Badge key={t} tone="rose" className="px-3 py-1.5 text-sm">
                {t}
              </Badge>
            ))}
          </div>

          <h2 className="mt-8 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-muted">
            <Languages className="size-4" aria-hidden /> Speaks
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {langs.map((l) => (
              <Badge key={l} className="px-3 py-1.5 text-sm">
                {l}
              </Badge>
            ))}
          </div>
        </section>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-3xl border border-line bg-surface p-6 shadow-soft">
            <h2 className="font-serif text-3xl">Talk to {listener.displayName}</h2>
            <p className="mt-1 text-sm text-muted">Anonymous. Only your nickname is shared.</p>
            <div className="mt-6">
              {!user ? (
                <div className="space-y-3">
                  <ButtonLink href={`/signup?next=/listeners/${listener.id}`} variant="rose" size="lg" className="w-full">
                    Sign up — first chat free
                  </ButtonLink>
                  <ButtonLink href={`/login?next=/listeners/${listener.id}`} variant="secondary" size="lg" className="w-full">
                    I have an account
                  </ButtonLink>
                </div>
              ) : user.role !== "SEEKER" ? (
                <p className="rounded-2xl bg-surface-2 px-4 py-3 text-sm text-muted">
                  You&apos;re signed in as a {user.role === "ADMIN" ? "safety team member" : "listener"}. Use a separate
                  personal account to start chats.
                </p>
              ) : (
                <div className="space-y-4">
                  <StartChatForm
                    listenerId={listener.id}
                    listenerName={listener.displayName}
                    freeAvailable={!user.freeChatUsed}
                    balance={user.minutesBalance}
                    online={online}
                  />
                  <div className="relative flex items-center justify-center border-t border-line/60 pt-3 text-center">
                    <span className="bg-surface px-2 text-[11px] font-medium uppercase tracking-wider text-muted">
                      or plan ahead
                    </span>
                  </div>
                  <div className="flex justify-center">
                    <ScheduleBookingDialog listenerId={listener.id} listenerName={listener.displayName} />
                  </div>
                </div>
              )}
            </div>
          </div>
          <p className="mt-4 px-2 text-xs leading-relaxed text-muted">
            Peer support, not therapy. Numbers, socials, links and meet-ups are blocked. In crisis, call{" "}
            <a href="tel:14416" className="font-semibold text-ink">
              14416
            </a>
            .
          </p>
        </aside>
      </div>
    </Container>
  );
}
