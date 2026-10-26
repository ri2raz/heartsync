import { Gift, Hourglass, MessageCircle } from "lucide-react";
import type { Metadata } from "next";

import { TopUp } from "@/components/account/top-up";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Container, PageHeader } from "@/components/ui/section";
import { requireUser } from "@/lib/auth";
import { FREE_CHAT_MINUTES, PACKS } from "@/lib/constants";
import { db } from "@/lib/db";
import { fmtDate, fmtMonthYear } from "@/lib/format";
import { formatRupees } from "@/lib/session-rules";
import { hueFromString } from "@/lib/utils";

export const metadata: Metadata = { title: "Account", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await requireUser("/account");
  const [payments, chatCount] = await Promise.all([
    db.payment.findMany({ where: { userId: user.id, status: "PAID" }, orderBy: { paidAt: "desc" }, take: 20 }),
    db.chatSession.count({ where: { seekerId: user.id, status: "ENDED" } }),
  ]);

  return (
    <Container className="max-w-4xl">
      <PageHeader eyebrow="Account" title={<>Hi, <span className="italic text-rose">{user.alias}</span></>} />

      <div className="grid gap-5 md:grid-cols-3">
        <div className="rounded-3xl border border-line bg-surface p-6 shadow-soft">
          <p className="flex items-center gap-2 text-sm text-muted">
            <Hourglass className="size-4" aria-hidden /> Minutes balance
          </p>
          <p className="mt-2 font-serif text-5xl">{user.minutesBalance}</p>
        </div>
        <div className="rounded-3xl border border-line bg-surface p-6 shadow-soft">
          <p className="flex items-center gap-2 text-sm text-muted">
            <Gift className="size-4" aria-hidden /> Free first chat
          </p>
          <p className="mt-3">
            {user.freeChatUsed ? <Badge>Used</Badge> : <Badge tone="rose">{FREE_CHAT_MINUTES} minutes available</Badge>}
          </p>
        </div>
        <div className="rounded-3xl border border-line bg-surface p-6 shadow-soft">
          <p className="flex items-center gap-2 text-sm text-muted">
            <MessageCircle className="size-4" aria-hidden /> Chats completed
          </p>
          <p className="mt-2 font-serif text-5xl">{chatCount}</p>
        </div>
      </div>

      {user.role === "SEEKER" ? (
        <section id="top-up" className="mt-10 scroll-mt-24 rounded-3xl border border-line bg-surface p-6 shadow-soft sm:p-8">
          <h2 className="font-serif text-3xl">Top up minutes</h2>
          <p className="mt-1 text-muted">Minutes never expire and work with any listener.</p>
          <div className="mt-6">
            <TopUp />
          </div>
        </section>
      ) : null}

      <section className="mt-10 grid gap-5 md:grid-cols-[1fr_1.4fr]">
        <div className="rounded-3xl border border-line bg-surface p-6 shadow-soft">
          <h2 className="text-lg font-semibold">Profile</h2>
          <div className="mt-4 flex items-center gap-3">
            <Avatar name={user.alias} hue={hueFromString(user.alias)} size={48} />
            <div className="min-w-0">
              <p className="truncate font-medium">{user.alias}</p>
              <p className="truncate text-sm text-muted">{user.email}</p>
            </div>
          </div>
          <p className="mt-4 text-sm text-muted">
            Member since {fmtMonthYear(user.createdAt)}. Listeners only
            ever see your nickname.
          </p>
          <ButtonLink href="/chat" variant="secondary" size="sm" className="mt-5">
            View my chats
          </ButtonLink>
        </div>
        <div className="rounded-3xl border border-line bg-surface p-6 shadow-soft">
          <h2 className="text-lg font-semibold">Payments</h2>
          {payments.length ? (
            <ul className="mt-4 divide-y divide-line text-sm">
              {payments.map((p) => (
                <li key={p.id} className="flex items-center justify-between py-3">
                  <span>
                    {PACKS.find((pk) => pk.id === p.packId)?.name ?? p.packId} · {p.minutes} min
                  </span>
                  <span className="text-muted">
                    {formatRupees(p.amountPaise)} · {p.paidAt ? fmtDate(p.paidAt) : ""}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-muted">No payments yet.</p>
          )}
        </div>
      </section>
    </Container>
  );
}
