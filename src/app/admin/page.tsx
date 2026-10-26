import { AlertTriangle, Flag, UserCheck, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { approveApplication, rejectApplication, resolveReport, setListenerActive, suspendUser } from "@/actions/admin";
import { ActionButton } from "@/components/admin/action-button";
import { Badge } from "@/components/ui/badge";
import { Container, PageHeader } from "@/components/ui/section";
import { requireRole } from "@/lib/auth";
import { LANGUAGES, LISTENER_TITLES, TOPICS } from "@/lib/constants";
import { db } from "@/lib/db";
import { fmtDate, fmtDateTime } from "@/lib/format";
import { isListenerOnline } from "@/lib/session-rules";
import { splitList } from "@/lib/utils";

export const metadata: Metadata = { title: "Safety desk", robots: { index: false } };
export const dynamic = "force-dynamic";

function labelList(value: string, map: Record<string, string>) {
  return splitList(value)
    .map((v) => map[v] ?? v)
    .join(", ");
}

function SectionTitle({ icon: Icon, title, count }: { icon: React.ComponentType<{ className?: string }>; title: string; count: number }) {
  return (
    <h2 className="flex items-center gap-2 text-lg font-semibold">
      <Icon className="size-5 text-rose" /> {title}
      <Badge tone={count ? "rose" : "neutral"}>{count}</Badge>
    </h2>
  );
}

export default async function AdminPage() {
  await requireRole("ADMIN", "/admin");
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [applications, reports, crisis, listeners] = await Promise.all([
    db.listenerApplication.findMany({ where: { status: "PENDING" }, orderBy: { createdAt: "asc" }, include: { user: true } }),
    db.report.findMany({
      where: { status: "OPEN" },
      orderBy: { createdAt: "asc" },
      include: {
        reporter: { select: { alias: true } },
        session: { select: { id: true, seekerId: true, seeker: { select: { alias: true } }, listener: { select: { displayName: true, userId: true } } } },
      },
    }),
    db.chatSession.findMany({
      where: { crisisFlaggedAt: { gte: weekAgo } },
      orderBy: { crisisFlaggedAt: "desc" },
      include: { seeker: { select: { alias: true } }, listener: { select: { displayName: true } } },
    }),
    db.listenerProfile.findMany({ orderBy: { createdAt: "desc" }, include: { user: { select: { email: true, isSuspended: true } } } }),
  ]);

  return (
    <Container className="max-w-6xl">
      <PageHeader
        eyebrow="Safety desk"
        title={<>Keep it <span className="italic text-rose">safe and kind.</span></>}
        description="Crisis flags first, then reports, then applications. Transcripts are only opened for flagged or reported chats."
      />

      <div className="space-y-12">
        <section>
          <SectionTitle icon={AlertTriangle} title="Crisis flags (last 7 days)" count={crisis.length} />
          {crisis.length ? (
            <ul className="mt-4 divide-y divide-line overflow-hidden rounded-3xl border border-danger/25 bg-surface shadow-soft">
              {crisis.map((s) => (
                <li key={s.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
                  <Badge tone="danger">Crisis</Badge>
                  <p className="flex-1">
                    <span className="font-medium">{s.seeker.alias}</span> with {s.listener.displayName}
                    <span className="block text-xs text-muted">
                      Flagged {s.crisisFlaggedAt ? fmtDateTime(s.crisisFlaggedAt) : ""} · {s.status.toLowerCase()}
                    </span>
                  </p>
                  <Link href={`/admin/sessions/${s.id}`} className="text-sm font-medium text-rose underline-offset-2 hover:underline">
                    Open transcript
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-muted">No crisis flags this week.</p>
          )}
        </section>

        <section>
          <SectionTitle icon={Flag} title="Open reports" count={reports.length} />
          {reports.length ? (
            <ul className="mt-4 space-y-3">
              {reports.map((r) => {
                const reportedUserId = r.reporterId === r.session.seekerId ? r.session.listener.userId : r.session.seekerId;
                const reportedName = r.reporterId === r.session.seekerId ? r.session.listener.displayName : r.session.seeker.alias;
                return (
                  <li key={r.id} className="rounded-3xl border border-line bg-surface p-5 shadow-soft">
                    <div className="flex flex-wrap items-start gap-4">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium">{r.reason}</p>
                        <p className="text-sm text-muted">
                          {r.reporter.alias} reported {reportedName} · {fmtDateTime(r.createdAt)}
                        </p>
                        {r.details ? <p className="mt-2 whitespace-pre-line text-sm">{r.details}</p> : null}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Link href={`/admin/sessions/${r.session.id}`} className="inline-flex h-9 items-center rounded-full px-4 text-sm font-medium ring-1 ring-line hover:bg-surface-2">
                          Transcript
                        </Link>
                        <ActionButton action={resolveReport.bind(null, r.id)}>Resolve</ActionButton>
                        <ActionButton
                          action={suspendUser.bind(null, reportedUserId)}
                          variant="danger"
                          confirm={`Suspend ${reportedName}? They will be logged out and blocked.`}
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
            <p className="mt-4 text-sm text-muted">No open reports.</p>
          )}
        </section>

        <section>
          <SectionTitle icon={UserCheck} title="Listener applications" count={applications.length} />
          <p className="mt-1 text-sm text-muted">
            Approve only after DigiLocker ID check, police verification and training are complete.
          </p>
          {applications.length ? (
            <ul className="mt-4 space-y-3">
              {applications.map((a) => (
                <li key={a.id} className="rounded-3xl border border-line bg-surface p-5 shadow-soft">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-lg font-semibold">
                        {a.fullName} <span className="text-sm font-normal text-muted">· {LISTENER_TITLES[a.title as keyof typeof LISTENER_TITLES]} · {a.city}</span>
                      </p>
                      <p className="text-sm text-muted">
                        {a.user.email} · {a.phone} · applied {fmtDate(a.createdAt)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <ActionButton action={rejectApplication.bind(null, a.id)} confirm="Reject this application?">
                        Reject
                      </ActionButton>
                      <ActionButton action={approveApplication.bind(null, a.id)} variant="rose" confirm="Verification and training complete? Approve as listener.">
                        Approve
                      </ActionButton>
                    </div>
                  </div>
                  <dl className="mt-4 grid gap-4 text-sm md:grid-cols-2">
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Languages</dt>
                      <dd>{labelList(a.languages, LANGUAGES)}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Topics</dt>
                      <dd>{labelList(a.topics, TOPICS)}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-muted">About (public bio)</dt>
                      <dd className="whitespace-pre-line">{a.about}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Motivation</dt>
                      <dd className="whitespace-pre-line">{a.motivation}</dd>
                    </div>
                  </dl>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-muted">No pending applications.</p>
          )}
        </section>

        <section>
          <SectionTitle icon={Users} title="Listeners" count={listeners.length} />
          {listeners.length ? (
            <div className="mt-4 overflow-x-auto rounded-3xl border border-line bg-surface shadow-soft">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="border-b border-line text-xs uppercase tracking-wide text-muted">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Listener</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold">Rating</th>
                    <th className="px-5 py-3 font-semibold">Minutes</th>
                    <th className="px-5 py-3 font-semibold" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {listeners.map((l) => (
                    <tr key={l.id}>
                      <td className="px-5 py-3">
                        <p className="font-medium">{l.displayName}</p>
                        <p className="text-xs text-muted">{l.user.email}</p>
                      </td>
                      <td className="px-5 py-3">
                        {l.user.isSuspended ? (
                          <Badge tone="danger">Suspended</Badge>
                        ) : !l.isActive ? (
                          <Badge tone="amber">Paused</Badge>
                        ) : isListenerOnline(l) ? (
                          <Badge tone="green">Online</Badge>
                        ) : (
                          <Badge>Offline</Badge>
                        )}
                      </td>
                      <td className="px-5 py-3">{l.ratingCount ? `${(l.ratingSum / l.ratingCount).toFixed(1)} (${l.ratingCount})` : "—"}</td>
                      <td className="px-5 py-3">{l.minutesHeard}</td>
                      <td className="px-5 py-3 text-right">
                        {l.user.isSuspended ? null : l.isActive ? (
                          <ActionButton action={setListenerActive.bind(null, l.id, false)} confirm={`Pause ${l.displayName}?`}>
                            Pause
                          </ActionButton>
                        ) : (
                          <ActionButton action={setListenerActive.bind(null, l.id, true)}>Re-activate</ActionButton>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted">No listeners yet.</p>
          )}
        </section>
      </div>
    </Container>
  );
}
