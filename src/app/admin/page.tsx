import {
  AlertTriangle,
  BadgeCheck,
  Clock,
  Flag,
  LifeBuoy,
  Mail,
  MessageCircle,
  Trash2,
  UserCheck,
  Users,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import {
  approveApplication,
  deleteContactMessage,
  rejectApplication,
  resolveContactMessage,
  resolveReport,
  setListenerActive,
  suspendUser,
  toggleListenerVerification,
  unsuspendUser,
} from "@/actions/admin";
import { ActionButton } from "@/components/admin/action-button";
import { Badge } from "@/components/ui/badge";
import { Container, PageHeader } from "@/components/ui/section";
import { requireRole } from "@/lib/auth";
import { LANGUAGES, LISTENER_TITLES, TOPICS } from "@/lib/constants";
import { db } from "@/lib/db";
import { fmtDate, fmtDateTime } from "@/lib/format";
import { isListenerOnline } from "@/lib/session-rules";
import { splitList } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin & Safety Desk", robots: { index: false } };
export const dynamic = "force-dynamic";

function labelList(value: string, map: Record<string, string>) {
  return splitList(value)
    .map((v) => map[v] ?? v)
    .join(", ");
}

function SectionTitle({
  icon: Icon,
  title,
  count,
  tone = "neutral",
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  count?: number;
  tone?: "rose" | "neutral" | "danger" | "amber";
}) {
  return (
    <h2 className="flex items-center gap-2 text-xl font-semibold">
      <Icon className="size-5 text-rose" /> {title}
      {count !== undefined && <Badge tone={count ? tone : "neutral"}>{count}</Badge>}
    </h2>
  );
}

export default async function AdminPage() {
  await requireRole("ADMIN", "/admin");
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  let applications: Awaited<ReturnType<typeof db.listenerApplication.findMany<{ include: { user: true } }>>> = [];
  let reports: Awaited<ReturnType<typeof db.report.findMany<{ include: { reporter: { select: { alias: true } }; session: { select: { id: true; seekerId: true; seekerIp: true; listenerIp: true; seeker: { select: { alias: true } }; listener: { select: { displayName: true; userId: true } } } } } }>>> = [];
  let crisis: Awaited<ReturnType<typeof db.chatSession.findMany<{ include: { seeker: { select: { alias: true } }; listener: { select: { displayName: true } } } }>>> = [];
  let lowWellbeing: Awaited<ReturnType<typeof db.chatSession.findMany<{ include: { seeker: { select: { alias: true } }; listener: { select: { displayName: true } } } }>>> = [];
  let listeners: Awaited<ReturnType<typeof db.listenerProfile.findMany<{ include: { user: { select: { email: true; isSuspended: true } } } }>>> = [];
  let contactMessages: Awaited<ReturnType<typeof db.contactMessage.findMany>> = [];
  let recentSessions: Awaited<ReturnType<typeof db.chatSession.findMany<{ include: { seeker: { select: { alias: true } }; listener: { select: { displayName: true } } } }>>> = [];
  let allUsers: Awaited<ReturnType<typeof db.user.findMany<{ select: { id: true; email: true; alias: true; role: true; isSuspended: true; createdAt: true } }>>> = [];
  let totalMinutesHeard: { _sum: { minutesHeard: number | null } } = { _sum: { minutesHeard: 0 } };

  try {
    const results = await Promise.all([
      db.listenerApplication.findMany({
        where: { status: "PENDING" },
        orderBy: { createdAt: "asc" },
        include: { user: true },
      }),
      db.report.findMany({
        where: { status: "OPEN" },
        orderBy: { createdAt: "asc" },
        include: {
          reporter: { select: { alias: true } },
          session: {
            select: {
              id: true,
              seekerId: true,
              seekerIp: true,
              listenerIp: true,
              seeker: { select: { alias: true } },
              listener: { select: { displayName: true, userId: true } },
            },
          },
        },
      }),
      db.chatSession.findMany({
        where: { crisisFlaggedAt: { gte: weekAgo } },
        orderBy: { crisisFlaggedAt: "desc" },
        include: { seeker: { select: { alias: true } }, listener: { select: { displayName: true } } },
      }),
      db.listenerProfile.findMany({
        orderBy: { createdAt: "desc" },
        include: { user: { select: { email: true, isSuspended: true } } },
      }),
      db.contactMessage.findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      db.chatSession.findMany({
        orderBy: { createdAt: "desc" },
        take: 20,
        include: {
          seeker: { select: { alias: true } },
          listener: { select: { displayName: true } },
        },
      }),
      db.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
        select: {
          id: true,
          email: true,
          alias: true,
          role: true,
          isSuspended: true,
          createdAt: true,
        },
      }),
      db.listenerProfile.aggregate({
        _sum: { minutesHeard: true },
      }),
      db.chatSession.findMany({
        where: { wellbeingFlaggedAt: { gte: weekAgo } },
        orderBy: { wellbeingFlaggedAt: "desc" },
        include: { seeker: { select: { alias: true } }, listener: { select: { displayName: true } } },
      }),
    ]);

    applications = results[0];
    reports = results[1];
    crisis = results[2];
    listeners = results[3];
    contactMessages = results[4];
    recentSessions = results[5];
    allUsers = results[6];
    totalMinutesHeard = results[7];
    lowWellbeing = results[8];
  } catch (error) {
    console.error("[MannMitr] Failed to load some admin dashboard queries:", error);
  }

  const activeSessions = recentSessions.filter((s) => s.status === "ACTIVE");
  const unreadContactCount = contactMessages.filter((m) => m.status === "UNREAD").length;

  return (
    <Container className="max-w-6xl">
      <PageHeader
        eyebrow="MannMitr Operations"
        title={
          <>
            Admin & <span className="italic text-rose">Safety Hub.</span>
          </>
        }
        description="Comprehensive dashboard to manage incoming contact inquiries, listener verifications, safety reports, active chat monitoring, and platform users."
      />

      {/* KPI Overview Cards */}
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-2xl border border-line bg-surface p-4 shadow-soft">
          <p className="flex items-center gap-1.5 text-xs font-medium text-muted">
            <Mail className="size-4 text-rose" /> Inquiries
          </p>
          <p className="mt-2 text-2xl font-bold font-serif">{unreadContactCount}</p>
          <span className="text-[11px] text-muted">{unreadContactCount ? "Needs reply" : "All clear"}</span>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-4 shadow-soft">
          <p className="flex items-center gap-1.5 text-xs font-medium text-muted">
            <AlertTriangle className="size-4 text-danger" /> Crisis Flags
          </p>
          <p className="mt-2 text-2xl font-bold font-serif text-danger">{crisis.length}</p>
          <span className="text-[11px] text-muted">Last 7 days</span>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-4 shadow-soft">
          <p className="flex items-center gap-1.5 text-xs font-medium text-muted">
            <Flag className="size-4 text-amber-500" /> Open Reports
          </p>
          <p className="mt-2 text-2xl font-bold font-serif">{reports.length}</p>
          <span className="text-[11px] text-muted">Awaiting review</span>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-4 shadow-soft">
          <p className="flex items-center gap-1.5 text-xs font-medium text-muted">
            <UserCheck className="size-4 text-rose" /> Applications
          </p>
          <p className="mt-2 text-2xl font-bold font-serif">{applications.length}</p>
          <span className="text-[11px] text-muted">Pending ID check</span>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-4 shadow-soft">
          <p className="flex items-center gap-1.5 text-xs font-medium text-muted">
            <MessageCircle className="size-4 text-rose" /> Active Chats
          </p>
          <p className="mt-2 text-2xl font-bold font-serif text-rose">{activeSessions.length}</p>
          <span className="text-[11px] text-muted">Live now</span>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-4 shadow-soft">
          <p className="flex items-center gap-1.5 text-xs font-medium text-muted">
            <Clock className="size-4 text-rose" /> Total Heard
          </p>
          <p className="mt-2 text-2xl font-bold font-serif">
            {(totalMinutesHeard._sum.minutesHeard ?? 0).toLocaleString("en-IN")}m
          </p>
          <span className="text-[11px] text-muted">Free support</span>
        </div>
      </div>

      <div className="mt-12 space-y-14">
        {/* Contact Messages Section */}
        <section id="contact-inquiries">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <SectionTitle icon={Mail} title="Contact Inquiries" count={unreadContactCount} tone="rose" />
            <span className="text-xs text-muted">Notifications are sent to riturajverma2009@gmail.com</span>
          </div>

          {contactMessages.length ? (
            <ul className="mt-4 space-y-3">
              {contactMessages.map((msg) => (
                <li
                  key={msg.id}
                  className={`rounded-3xl border bg-surface p-6 shadow-soft transition ${
                    msg.status === "UNREAD" ? "border-rose/40 ring-1 ring-rose/20" : "border-line opacity-85"
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold text-ink">{msg.name}</span>
                        <a
                          href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject)}`}
                          className="text-xs text-rose hover:underline"
                        >
                          {msg.email}
                        </a>
                        <Badge tone={msg.status === "UNREAD" ? "rose" : "neutral"}>
                          {msg.status}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm font-medium text-ink/90">
                        Subject: <span className="text-ink">{msg.subject}</span>
                      </p>
                      <p className="text-xs text-muted">Received {fmtDateTime(msg.createdAt)}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <a
                        href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject)}`}
                        className="inline-flex h-9 items-center rounded-full bg-ink px-4 text-xs font-medium text-bg hover:opacity-90 transition"
                      >
                        Reply via Email
                      </a>
                      {msg.status === "UNREAD" ? (
                        <ActionButton action={resolveContactMessage.bind(null, msg.id)}>
                          Mark Resolved
                        </ActionButton>
                      ) : null}
                      <ActionButton
                        action={deleteContactMessage.bind(null, msg.id)}
                        variant="ghost"
                        confirm="Permanently delete this inquiry?"
                      >
                        <Trash2 className="size-3.5 text-muted hover:text-danger" />
                      </ActionButton>
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl bg-surface-2 p-4 text-sm leading-relaxed text-ink/90 whitespace-pre-wrap border border-line/60">
                    {msg.message}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-muted">No contact inquiries yet.</p>
          )}
        </section>

        {/* Crisis Flags Section */}
        <section id="crisis-flags">
          <SectionTitle icon={AlertTriangle} title="Crisis Flags (Last 7 Days)" count={crisis.length} tone="danger" />
          {crisis.length ? (
            <ul className="mt-4 divide-y divide-line overflow-hidden rounded-3xl border border-danger/30 bg-surface shadow-soft">
              {crisis.map((s) => (
                <li key={s.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
                  <Badge tone="danger">Crisis Detected</Badge>
                  <p className="flex-1">
                    <span className="font-medium text-ink">{s.seeker.alias}</span>{" "}
                    <span className="text-xs text-muted font-mono">({s.seekerIp || "IP: N/A"})</span> talking with{" "}
                    <span className="font-medium text-ink">{s.listener.displayName}</span>{" "}
                    <span className="text-xs text-muted font-mono">({s.listenerIp || "IP: N/A"})</span>
                    <span className="block text-xs text-muted">
                      Flagged {s.crisisFlaggedAt ? fmtDateTime(s.crisisFlaggedAt) : ""} · Status: {s.status.toLowerCase()}
                    </span>
                  </p>
                  <Link
                    href={`/admin/sessions/${s.id}`}
                    className="inline-flex items-center gap-1.5 rounded-full bg-danger-soft px-4 py-2 text-xs font-semibold text-danger hover:bg-danger/20 transition"
                  >
                    Open Live Transcript
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-muted">No crisis flags this week. Helplines are continuously presented to seekers.</p>
          )}
        </section>

        {/* Low Wellbeing Follow-ups */}
        <section id="wellbeing-flags">
          <SectionTitle icon={LifeBuoy} title="Low Wellbeing Check-ins (Last 7 Days)" count={lowWellbeing.length} tone="amber" />
          {lowWellbeing.length ? (
            <ul className="mt-4 divide-y divide-line overflow-hidden rounded-3xl border border-amber-500/30 bg-surface shadow-soft">
              {lowWellbeing.map((s) => (
                <li key={s.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
                  <Badge tone="amber">Score: {s.wellbeingScore}/5</Badge>
                  <p className="flex-1">
                    <span className="font-medium text-ink">{s.seeker.alias}</span> completed chat with{" "}
                    <span className="font-medium text-ink">{s.listener.displayName}</span>
                    <span className="block text-xs text-muted">
                      Reported low emotional score · Helplines presented automatically · {s.wellbeingFlaggedAt ? fmtDateTime(s.wellbeingFlaggedAt) : ""}
                    </span>
                  </p>
                  <Link
                    href={`/admin/sessions/${s.id}`}
                    className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-4 py-2 text-xs font-semibold text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 transition"
                  >
                    Review Session
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-muted">No seekers reported low wellbeing scores post-session this week.</p>
          )}
        </section>

        {/* Open Reports Section */}
        <section id="reports">
          <SectionTitle icon={Flag} title="Open User Reports" count={reports.length} tone="amber" />
          {reports.length ? (
            <ul className="mt-4 space-y-3">
              {reports.map((r) => {
                const reportedUserId =
                  r.reporterId === r.session.seekerId ? r.session.listener.userId : r.session.seekerId;
                const reportedName =
                  r.reporterId === r.session.seekerId ? r.session.listener.displayName : r.session.seeker.alias;
                return (
                  <li key={r.id} className="rounded-3xl border border-line bg-surface p-5 shadow-soft">
                    <div className="flex flex-wrap items-start gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-base text-ink">{r.reason}</p>
                          <Badge tone="amber">Pending Resolution</Badge>
                        </div>
                        <p className="mt-1 text-sm text-muted">
                          Reported by <span className="font-medium text-ink">{r.reporter.alias}</span> against{" "}
                          <span className="font-medium text-ink">{reportedName}</span> · {fmtDateTime(r.createdAt)}
                          <span className="block text-xs text-muted font-mono mt-0.5">
                            Seeker IP: {r.session.seekerIp || "Unavailable"} · Listener IP: {r.session.listenerIp || "Unavailable"}
                          </span>
                        </p>
                        {r.details ? (
                          <p className="mt-3 rounded-2xl bg-surface-2 p-3 text-sm text-ink/90 whitespace-pre-line border border-line">
                            {r.details}
                          </p>
                        ) : null}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/admin/sessions/${r.session.id}`}
                          className="inline-flex h-9 items-center rounded-full px-4 text-xs font-medium ring-1 ring-line hover:bg-surface-2 transition"
                        >
                          View Transcript
                        </Link>
                        <ActionButton action={resolveReport.bind(null, r.id)}>Resolve Report</ActionButton>
                        <ActionButton
                          action={suspendUser.bind(null, reportedUserId)}
                          variant="danger"
                          confirm={`Suspend ${reportedName}? Their account will be deactivated.`}
                        >
                          Suspend {reportedName}
                        </ActionButton>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-muted">No open moderation reports.</p>
          )}
        </section>

        {/* Listener Applications Section */}
        <section id="applications">
          <SectionTitle icon={UserCheck} title="Listener Applications" count={applications.length} tone="rose" />
          <p className="mt-1 text-sm text-muted">
            Carefully verify legal identity and check readiness before approving new peer listeners.
          </p>
          {applications.length ? (
            <ul className="mt-4 space-y-4">
              {applications.map((a) => (
                <li key={a.id} className="rounded-3xl border border-line bg-surface p-6 shadow-soft">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xl font-bold font-serif text-ink">
                        {a.fullName}{" "}
                        <span className="text-sm font-normal text-muted font-sans">
                          · {LISTENER_TITLES[a.title as keyof typeof LISTENER_TITLES]} · {a.city}
                        </span>
                      </p>
                      <p className="mt-1 text-sm text-muted">
                        <a href={`mailto:${a.user.email}`} className="text-rose hover:underline">
                          {a.user.email}
                        </a>{" "}
                        · Phone: {a.phone} · Applied {fmtDate(a.createdAt)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <ActionButton action={rejectApplication.bind(null, a.id)} confirm="Reject this application?">
                        Reject
                      </ActionButton>
                      <ActionButton
                        action={approveApplication.bind(null, a.id)}
                        variant="rose"
                        confirm="Verification complete? Approve as verified listener."
                      >
                        Approve Listener
                      </ActionButton>
                    </div>
                  </div>
                  <dl className="mt-4 grid gap-4 text-sm md:grid-cols-2">
                    <div className="rounded-2xl bg-surface-2 p-3.5 border border-line">
                      <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Languages</dt>
                      <dd className="mt-1 font-medium">{labelList(a.languages, LANGUAGES)}</dd>
                    </div>
                    <div className="rounded-2xl bg-surface-2 p-3.5 border border-line">
                      <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Topics</dt>
                      <dd className="mt-1 font-medium">{labelList(a.topics, TOPICS)}</dd>
                    </div>
                    <div className="rounded-2xl bg-surface-2 p-3.5 border border-line">
                      <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Public Bio</dt>
                      <dd className="mt-1 whitespace-pre-line text-ink/90">{a.about}</dd>
                    </div>
                    <div className="rounded-2xl bg-surface-2 p-3.5 border border-line">
                      <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Motivation</dt>
                      <dd className="mt-1 whitespace-pre-line text-ink/90">{a.motivation}</dd>
                    </div>
                  </dl>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-muted">No pending listener applications.</p>
          )}
        </section>

        {/* Live & Recent Chat Sessions Section */}
        <section id="sessions">
          <SectionTitle icon={MessageCircle} title="Recent Chat Sessions & Monitoring" count={recentSessions.length} />
          {recentSessions.length ? (
            <div className="mt-4 overflow-x-auto rounded-3xl border border-line bg-surface shadow-soft">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead className="border-b border-line bg-surface-2 text-xs uppercase tracking-wide text-muted">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Session ID</th>
                    <th className="px-5 py-3 font-semibold">Seeker</th>
                    <th className="px-5 py-3 font-semibold">Listener</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold">Duration</th>
                    <th className="px-5 py-3 font-semibold">Started</th>
                    <th className="px-5 py-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {recentSessions.map((s) => (
                    <tr key={s.id} className="hover:bg-surface-2/50 transition">
                      <td className="px-5 py-3 font-mono text-xs text-muted">{s.id.slice(0, 8)}</td>
                      <td className="px-5 py-3">
                        <span className="font-medium text-ink">{s.seeker.alias}</span>
                        <span className="block font-mono text-[11px] text-muted">{s.seekerIp || "IP: N/A"}</span>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-ink">{s.listener.displayName}</span>
                        <span className="block font-mono text-[11px] text-muted">{s.listenerIp || "IP: N/A"}</span>
                      </td>
                      <td className="px-5 py-3">
                        {s.status === "ACTIVE" ? (
                          <Badge tone="green">● Live Now</Badge>
                        ) : s.status === "REQUESTED" ? (
                          <Badge tone="amber">Requested</Badge>
                        ) : s.status === "ENDED" ? (
                          <Badge tone="neutral">Ended</Badge>
                        ) : (
                          <Badge tone="neutral">{s.status}</Badge>
                        )}
                      </td>
                      <td className="px-5 py-3">{s.minutes}m (Free)</td>
                      <td className="px-5 py-3 text-xs text-muted">{fmtDateTime(s.createdAt)}</td>
                      <td className="px-5 py-3 text-right">
                        <Link
                          href={`/admin/sessions/${s.id}`}
                          className="text-xs font-semibold text-rose hover:underline"
                        >
                          Transcript
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted">No chat sessions recorded yet.</p>
          )}
        </section>

        {/* Listeners Management Section */}
        <section id="listeners">
          <SectionTitle icon={Users} title="Active Listeners Roster" count={listeners.length} />
          {listeners.length ? (
            <div className="mt-4 overflow-x-auto rounded-3xl border border-line bg-surface shadow-soft">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="border-b border-line bg-surface-2 text-xs uppercase tracking-wide text-muted">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Listener</th>
                    <th className="px-5 py-3 font-semibold">Verification</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold">Rating</th>
                    <th className="px-5 py-3 font-semibold">Minutes Heard</th>
                    <th className="px-5 py-3 font-semibold text-right">Moderation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {listeners.map((l) => (
                    <tr key={l.id} className="hover:bg-surface-2/40 transition">
                      <td className="px-5 py-3">
                        <p className="font-semibold text-ink flex items-center gap-1.5">
                          {l.displayName}
                          {l.isVerified ? (
                            <BadgeCheck className="size-4 text-rose" aria-label="Verified" />
                          ) : null}
                        </p>
                        <p className="text-xs text-muted">{l.user.email}</p>
                      </td>
                      <td className="px-5 py-3">
                        {l.isVerified ? (
                          <Badge tone="green" className="gap-1 font-medium">
                            <BadgeCheck className="size-3 text-emerald-600" /> Verified
                          </Badge>
                        ) : (
                          <Badge tone="amber">Unverified</Badge>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        {l.user.isSuspended ? (
                          <Badge tone="danger">Suspended</Badge>
                        ) : !l.isActive ? (
                          <Badge tone="amber">Paused</Badge>
                        ) : isListenerOnline(l) ? (
                          <Badge tone="green">● Online</Badge>
                        ) : (
                          <Badge>Offline</Badge>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        {l.ratingCount ? `${(l.ratingSum / l.ratingCount).toFixed(1)} (${l.ratingCount})` : "—"}
                      </td>
                      <td className="px-5 py-3 font-medium">{l.minutesHeard}m</td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {l.isVerified ? (
                            <ActionButton
                              action={toggleListenerVerification.bind(null, l.id, false)}
                              confirm={`Revoke verified badge from ${l.displayName}?`}
                            >
                              Revoke Badge
                            </ActionButton>
                          ) : (
                            <ActionButton
                              action={toggleListenerVerification.bind(null, l.id, true)}
                              variant="rose"
                              confirm={`Manually verify ID & credentials and grant verified badge to ${l.displayName}?`}
                            >
                              Verify Badge
                            </ActionButton>
                          )}
                          {l.user.isSuspended ? null : l.isActive ? (
                            <ActionButton
                              action={setListenerActive.bind(null, l.id, false)}
                              confirm={`Pause listener profile for ${l.displayName}?`}
                            >
                              Pause
                            </ActionButton>
                          ) : (
                            <ActionButton action={setListenerActive.bind(null, l.id, true)}>
                              Re-activate
                            </ActionButton>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted">No listeners approved yet.</p>
          )}
        </section>

        {/* User Directory Section */}
        <section id="users">
          <SectionTitle icon={Users} title="User Directory & Access Control" count={allUsers.length} />
          {allUsers.length ? (
            <div className="mt-4 overflow-x-auto rounded-3xl border border-line bg-surface shadow-soft">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="border-b border-line bg-surface-2 text-xs uppercase tracking-wide text-muted">
                  <tr>
                    <th className="px-5 py-3 font-semibold">User Alias</th>
                    <th className="px-5 py-3 font-semibold">Email</th>
                    <th className="px-5 py-3 font-semibold">Role</th>
                    <th className="px-5 py-3 font-semibold">Joined</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {allUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-surface-2/40 transition">
                      <td className="px-5 py-3 font-medium text-ink">{u.alias}</td>
                      <td className="px-5 py-3 text-muted text-xs font-mono">{u.email}</td>
                      <td className="px-5 py-3">
                        <Badge tone={u.role === "ADMIN" ? "rose" : u.role === "LISTENER" ? "green" : "neutral"}>
                          {u.role}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-xs text-muted">{fmtDate(u.createdAt)}</td>
                      <td className="px-5 py-3">
                        {u.isSuspended ? (
                          <Badge tone="danger">Suspended</Badge>
                        ) : (
                          <Badge tone="green">Active</Badge>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right">
                        {u.isSuspended ? (
                          <ActionButton action={unsuspendUser.bind(null, u.id)}>
                            Unsuspend
                          </ActionButton>
                        ) : u.role !== "ADMIN" ? (
                          <ActionButton
                            action={suspendUser.bind(null, u.id)}
                            variant="danger"
                            confirm={`Suspend account for ${u.alias}?`}
                          >
                            Suspend
                          </ActionButton>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted">No users found.</p>
          )}
        </section>
      </div>
    </Container>
  );
}
