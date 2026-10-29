import type { Metadata } from "next";
import Link from "next/link";

import { ListenerCard } from "@/components/landing/sections";
import { ButtonLink } from "@/components/ui/button";
import { Container, PageHeader } from "@/components/ui/section";
import { LANGUAGES, TOPICS } from "@/lib/constants";
import { db } from "@/lib/db";
import { withPresence } from "@/lib/session-rules";
import { cn, splitList } from "@/lib/utils";

export const metadata: Metadata = { title: "Find a listener" };

type Search = { lang?: string; topic?: string; online?: string };

function filterHref(current: Search, patch: Partial<Search>): string {
  const next = { ...current, ...patch };
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(next)) if (v) params.set(k, v);
  const qs = params.toString();
  return qs ? `/listeners?${qs}` : "/listeners";
}

function Chip({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={active ? "true" : undefined}
      className={cn(
        "whitespace-nowrap rounded-full px-3.5 py-2 text-sm transition",
        active ? "bg-ink text-bg" : "bg-surface text-muted ring-1 ring-line hover:text-ink",
      )}
    >
      {children}
    </Link>
  );
}

export default async function ListenersPage({ searchParams }: { searchParams: Promise<Search> }) {
  const search = await searchParams;
  const lang = search.lang && search.lang in LANGUAGES ? search.lang : undefined;
  const topic = search.topic && search.topic in TOPICS ? search.topic : undefined;
  const onlineOnly = search.online === "1";
  const current: Search = { lang, topic, online: onlineOnly ? "1" : undefined };

  let rawListeners: Awaited<ReturnType<typeof db.listenerProfile.findMany>> = [];
  try {
    rawListeners = await db.listenerProfile.findMany({ where: { isActive: true }, orderBy: { createdAt: "asc" } });
  } catch (error) {
    console.error("[MannMitr] Failed to fetch listeners:", error);
  }
  const all = withPresence(rawListeners);
  const listeners = all.filter(
    (l) =>
      (!onlineOnly || l.isOnline) &&
      (!lang || splitList(l.languages).includes(lang)) &&
      (!topic || splitList(l.topics).includes(topic)),
  );
  const onlineCount = all.filter((l) => l.isOnline).length;

  return (
    <Container>
      <PageHeader
        eyebrow="Listeners"
        title={
          <>
            Find someone who <span className="italic text-rose">gets it.</span>
          </>
        }
        description="Every listener is 18+, ID and police verified, and trained to listen without judging."
      />

      <div className="space-y-3">
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          <Chip href={filterHref(current, { online: onlineOnly ? undefined : "1" })} active={onlineOnly}>
            ● Online now{onlineCount ? ` (${onlineCount})` : ""}
          </Chip>
          {Object.entries(TOPICS).map(([slug, label]) => (
            <Chip key={slug} href={filterHref(current, { topic: topic === slug ? undefined : slug })} active={topic === slug}>
              {label}
            </Chip>
          ))}
        </div>
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          {Object.entries(LANGUAGES).map(([code, label]) => (
            <Chip key={code} href={filterHref(current, { lang: lang === code ? undefined : code })} active={lang === code}>
              {label}
            </Chip>
          ))}
        </div>
      </div>

      {listeners.length ? (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {listeners.map((l) => (
            <ListenerCard key={l.id} listener={l} />
          ))}
        </div>
      ) : (
        <div className="mt-10 rounded-3xl border border-dashed border-line bg-surface/60 p-10 text-center">
          <p className="font-serif text-3xl">No one matches that yet.</p>
          <p className="mx-auto mt-2 max-w-md text-muted">
            {all.length ? "Try removing a filter — or check back soon, new listeners join every week." : "Our first listeners are finishing training. Check back soon."}
          </p>
          <ButtonLink href="/listeners" variant="secondary" className="mt-6">
            Clear filters
          </ButtonLink>
        </div>
      )}
    </Container>
  );
}
