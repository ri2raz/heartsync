import { Clock, MessageCircle, ShieldCheck, Star } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { OnlineToggle } from "@/components/listener/online-toggle";
import { ProfileForm } from "@/components/listener/profile-form";
import { RequestsPanel } from "@/components/listener/requests-panel";
import { Container, PageHeader } from "@/components/ui/section";
import { requireUser } from "@/lib/auth";
import { pendingRequestsForListener } from "@/lib/chat-service";
import { db } from "@/lib/db";
import { splitList } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard", robots: { index: false } };
export const dynamic = "force-dynamic";

const REMINDERS = [
  "Listen first. Reflect back what you hear before offering advice.",
  "Never diagnose, never suggest medicines. Suggest a professional when it's beyond peer support.",
  "If crisis words come up: stay calm, stay with them, share 14416, and use Report if you're worried.",
  "Keep it platonic and on HeartSync. No numbers, socials, money or meetups — ever.",
];

export default async function ListenerDashboard() {
  const user = await requireUser("/listener/dashboard");
  if (user.role !== "LISTENER" || !user.listenerProfile) redirect("/");
  const profile = user.listenerProfile;

  const [requests, completed] = await Promise.all([
    pendingRequestsForListener(user.id),
    db.chatSession.count({ where: { listenerId: profile.id, status: "ENDED" } }),
  ]);
  const rating = profile.ratingCount ? (profile.ratingSum / profile.ratingCount).toFixed(1) : "—";

  return (
    <Container className="max-w-5xl">
      <PageHeader
        eyebrow="Listener dashboard"
        title={
          <>
            Namaste, <span className="italic text-rose">{profile.displayName}</span>
          </>
        }
      />

      {!profile.isActive ? (
        <p className="mb-6 rounded-2xl bg-danger-soft px-4 py-3 text-sm text-danger">
          Your profile is paused by the safety team, so you can&apos;t go online. Please check your email.
        </p>
      ) : null}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <OnlineToggle online={profile.isOnline} />
        <Link href={`/listeners/${profile.id}`} className="text-sm text-muted underline-offset-2 hover:text-ink hover:underline">
          View my public profile →
        </Link>
      </div>

      <dl className="mt-8 grid grid-cols-3 gap-3">
        {[
          { icon: MessageCircle, label: "Chats", value: String(completed) },
          { icon: Clock, label: "Minutes heard", value: profile.minutesHeard.toLocaleString("en-IN") },
          { icon: Star, label: "Rating", value: rating },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="rounded-3xl border border-line bg-surface p-5 shadow-soft">
            <dt className="flex items-center gap-1.5 text-xs text-muted">
              <Icon className="size-3.5" aria-hidden /> {label}
            </dt>
            <dd className="mt-1 font-serif text-4xl">{value}</dd>
          </div>
        ))}
      </dl>

      <section className="mt-10">
        <h2 className="mb-4 text-lg font-semibold">Incoming requests</h2>
        {requests ? <RequestsPanel initial={requests} /> : null}
      </section>

      <div className="mt-10 grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        <section className="rounded-3xl border border-line bg-surface p-6 shadow-soft sm:p-8">
          <h2 className="font-serif text-3xl">Your profile</h2>
          <div className="mt-6">
            <ProfileForm
              profile={{
                displayName: profile.displayName,
                bio: profile.bio,
                languages: splitList(profile.languages),
                topics: splitList(profile.topics),
              }}
            />
          </div>
        </section>
        <aside className="rounded-3xl bg-surface-2 p-6 sm:p-8">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <ShieldCheck className="size-5 text-rose" aria-hidden /> Before every chat
          </h2>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted">
            {REMINDERS.map((r) => (
              <li key={r} className="flex gap-2">
                <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-rose" />
                {r}
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </Container>
  );
}
