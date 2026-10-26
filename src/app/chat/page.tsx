import { MessageCircleHeart } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Container, PageHeader } from "@/components/ui/section";
import { requireUser } from "@/lib/auth";
import { reconcileSession } from "@/lib/chat-service";
import { LISTENER_TITLES } from "@/lib/constants";
import { db } from "@/lib/db";
import { fmtDate } from "@/lib/format";
import { hueFromString } from "@/lib/utils";

export const metadata: Metadata = { title: "My chats", robots: { index: false } };
export const dynamic = "force-dynamic";

const STATUS: Record<string, { label: string; tone: "green" | "amber" | "neutral" | "danger" }> = {
  REQUESTED: { label: "Waiting", tone: "amber" },
  ACTIVE: { label: "Live", tone: "green" },
  ENDED: { label: "Ended", tone: "neutral" },
  DECLINED: { label: "Declined", tone: "neutral" },
  CANCELLED: { label: "Cancelled", tone: "neutral" },
};

export default async function ChatsPage() {
  const user = await requireUser("/chat");
  const where =
    user.role === "LISTENER" && user.listenerProfile ? { listenerId: user.listenerProfile.id } : { seekerId: user.id };

  const open = await db.chatSession.findMany({ where: { ...where, status: { in: ["REQUESTED", "ACTIVE"] } }, select: { id: true } });
  for (const s of open) await reconcileSession(s.id);

  const sessions = await db.chatSession.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      listener: { select: { displayName: true, title: true, avatarHue: true } },
      seeker: { select: { alias: true } },
      messages: { orderBy: { id: "desc" }, take: 1, where: { kind: "TEXT" }, select: { body: true } },
    },
  });

  return (
    <Container className="max-w-3xl">
      <PageHeader eyebrow="Your chats" title={<>Conversations</>} description="Only you and your listener can see your chats. Chats flagged for safety may be reviewed by our safety team." />

      {sessions.length ? (
        <ul className="divide-y divide-line overflow-hidden rounded-3xl border border-line bg-surface shadow-soft">
          {sessions.map((s) => {
            const asListener = user.role === "LISTENER";
            const name = asListener ? s.seeker.alias : s.listener.displayName;
            const hue = asListener ? hueFromString(s.seeker.alias) : s.listener.avatarHue;
            const sub = asListener ? "Seeker" : LISTENER_TITLES[s.listener.title as keyof typeof LISTENER_TITLES] ?? "Listener";
            const status = STATUS[s.status] ?? STATUS.CANCELLED!;
            return (
              <li key={s.id}>
                <Link href={`/chat/${s.id}`} className="flex items-center gap-4 px-5 py-4 transition hover:bg-surface-2">
                  <Avatar name={name} hue={hue} size={44} />
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 font-medium">
                      <span className="truncate">{name}</span>
                      <span className="text-xs font-normal text-muted">· {sub}</span>
                    </p>
                    <p className="truncate text-sm text-muted">{s.messages[0]?.body ?? `${s.minutes}-minute chat${s.isFree ? " (free)" : ""}`}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <Badge tone={status.tone}>{status.label}</Badge>
                    <span className="text-xs text-muted">
                      {fmtDate(s.createdAt)}
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="rounded-3xl border border-dashed border-line bg-surface/60 p-10 text-center">
          <MessageCircleHeart className="mx-auto size-9 text-rose" aria-hidden />
          <p className="mt-4 font-serif text-3xl">No chats yet.</p>
          <p className="mx-auto mt-2 max-w-sm text-muted">Pick a listener who feels right — your first 20 minutes are free.</p>
          <ButtonLink href="/listeners" className="mt-6">
            Find a listener
          </ButtonLink>
        </div>
      )}
    </Container>
  );
}
