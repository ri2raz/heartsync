import { Calendar, Heart, MessageCircle, Sparkles } from "lucide-react";
import type { Metadata } from "next";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Container, PageHeader } from "@/components/ui/section";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { fmtMonthYear } from "@/lib/format";
import { hueFromString } from "@/lib/utils";

export const metadata: Metadata = { title: "Account", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await requireUser("/account");
  const [chatCount, favorites, bookings] = await Promise.all([
    db.chatSession.count({
      where: { seekerId: user.id, status: "ENDED" },
    }),
    db.favoriteListener.findMany({
      where: { userId: user.id },
      include: { listener: true },
      take: 10,
    }),
    db.scheduledBooking.findMany({
      where: {
        seekerId: user.id,
        status: { not: "CANCELLED" },
        scheduledFor: { gte: new Date() },
      },
      include: { listener: true },
      orderBy: { scheduledFor: "asc" },
      take: 10,
    }),
  ]);

  return (
    <Container className="max-w-4xl">
      <PageHeader eyebrow="Account" title={<>Hi, <span className="italic text-rose">{user.alias}</span></>} />

      <div className="grid gap-5 md:grid-cols-3">
        <div className="rounded-3xl border border-line bg-surface p-6 shadow-soft">
          <p className="flex items-center gap-2 text-sm text-muted">
            <Sparkles className="size-4 text-rose" aria-hidden /> Support Tier
          </p>
          <p className="mt-2 font-serif text-3xl font-medium text-rose">100% Free</p>
          <p className="mt-1 text-xs text-muted">Unlimited peer listening</p>
        </div>
        <div className="rounded-3xl border border-line bg-surface p-6 shadow-soft">
          <p className="flex items-center gap-2 text-sm text-muted">
            <Heart className="size-4 text-rose" aria-hidden /> Account Status
          </p>
          <p className="mt-3">
            <Badge tone="green">Active Member</Badge>
          </p>
          <p className="mt-1 text-xs text-muted">Role: {user.role}</p>
        </div>
        <div className="rounded-3xl border border-line bg-surface p-6 shadow-soft">
          <p className="flex items-center gap-2 text-sm text-muted">
            <MessageCircle className="size-4 text-rose" aria-hidden /> Chats Completed
          </p>
          <p className="mt-2 font-serif text-5xl">{chatCount}</p>
          <p className="mt-1 text-xs text-muted">Anonymous conversations</p>
        </div>
      </div>

      <section className="mt-10 grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-line bg-surface p-6 shadow-soft">
          <h2 className="text-lg font-semibold">Your Profile</h2>
          <div className="mt-4 flex items-center gap-3">
            <Avatar name={user.alias} hue={hueFromString(user.alias)} size={52} />
            <div className="min-w-0">
              <p className="truncate font-medium text-ink text-base">{user.alias}</p>
              <p className="truncate text-sm text-muted">{user.email}</p>
            </div>
          </div>
          <p className="mt-4 text-sm text-muted leading-relaxed">
            Member since {fmtMonthYear(user.createdAt)}. To protect your privacy, listeners only ever see your nickname.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <ButtonLink href="/chat" variant="rose" size="sm">
              View my chats
            </ButtonLink>
            <ButtonLink href="/listeners" variant="secondary" size="sm">
              Talk to a listener
            </ButtonLink>
          </div>
        </div>

        <div className="rounded-3xl border border-rose/30 bg-rose-soft/30 p-6 shadow-soft">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="size-4 text-rose" /> Community Peer Support
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            MannMitr is completely free. We do not charge fees, require paid minute packs, or ask for payment information.
          </p>
          <ul className="mt-4 space-y-2 text-xs text-muted">
            <li>✓ Connect with verified Big Bros & Big Sisters</li>
            <li>✓ 100% confidential and anonymous</li>
            <li>✓ Always free, no hidden costs</li>
          </ul>
          <div className="mt-6">
            <ButtonLink href="/contact" variant="ghost" size="sm" className="text-xs">
              Need help or have suggestions? Contact us →
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* Bookmarked Listeners & Scheduled Bookings */}
      <section className="mt-10 grid gap-6 md:grid-cols-2">
        {/* Bookmarked Listeners */}
        <div className="rounded-3xl border border-line bg-surface p-6 shadow-soft">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Heart className="size-4 text-rose fill-rose" /> Bookmarked Listeners
          </h2>
          <p className="mt-1 text-xs text-muted">Listeners you like to stay connected with.</p>

          {favorites.length ? (
            <ul className="mt-4 divide-y divide-line/60">
              {favorites.map((f) => (
                <li key={f.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={f.listener.displayName} hue={f.listener.avatarHue} size={40} />
                    <div>
                      <p className="font-medium text-sm text-ink">{f.listener.displayName}</p>
                      <p className="text-xs text-muted">{f.listener.title}</p>
                    </div>
                  </div>
                  <ButtonLink href={`/listeners/${f.listener.id}`} variant="secondary" size="sm">
                    View profile
                  </ButtonLink>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-6 text-center py-6 border border-dashed border-line rounded-2xl">
              <p className="text-xs text-muted">No bookmarked listeners yet.</p>
              <ButtonLink href="/listeners" variant="ghost" size="sm" className="mt-2 text-xs text-rose">
                Explore listeners →
              </ButtonLink>
            </div>
          )}
        </div>

        {/* Scheduled Chats */}
        <div className="rounded-3xl border border-line bg-surface p-6 shadow-soft">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="size-4 text-rose" /> Scheduled Upcoming Chats
          </h2>
          <p className="mt-1 text-xs text-muted">Pre-planned conversations on your schedule.</p>

          {bookings.length ? (
            <ul className="mt-4 divide-y divide-line/60">
              {bookings.map((b) => (
                <li key={b.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={b.listener.displayName} hue={b.listener.avatarHue} size={40} />
                    <div>
                      <p className="font-medium text-sm text-ink">With {b.listener.displayName}</p>
                      <p className="text-xs text-muted">
                        {new Date(b.scheduledFor).toLocaleDateString("en-IN", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}{" "}
                        at{" "}
                        {new Date(b.scheduledFor).toLocaleTimeString("en-IN", {
                          hour: "numeric",
                          minute: "2-digit",
                        })}{" "}
                        ({b.minutes} mins)
                      </p>
                    </div>
                  </div>
                  <Badge tone="rose" className="text-xs">
                    Confirmed
                  </Badge>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-6 text-center py-6 border border-dashed border-line rounded-2xl">
              <p className="text-xs text-muted">No upcoming scheduled chats.</p>
              <ButtonLink href="/listeners" variant="ghost" size="sm" className="mt-2 text-xs text-rose">
                Find a listener to schedule →
              </ButtonLink>
            </div>
          )}
        </div>
      </section>
    </Container>
  );
}
