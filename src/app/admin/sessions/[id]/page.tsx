import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Container, PageHeader } from "@/components/ui/section";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { fmtDateTime, fmtTime } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Transcript", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function TranscriptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireRole("ADMIN", `/admin/sessions/${id}`);

  const session = await db.chatSession.findUnique({
    where: { id },
    include: {
      seeker: { select: { id: true, alias: true } },
      listener: { select: { displayName: true, userId: true } },
      messages: { orderBy: { id: "asc" } },
      reports: { select: { id: true } },
    },
  });
  // Privacy: only chats that were crisis-flagged or reported can be opened by the safety team.
  if (!session || (!session.crisisFlaggedAt && session.reports.length === 0)) notFound();

  return (
    <Container className="max-w-3xl">
      <Link href="/admin" className="mt-8 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
        <ArrowLeft className="size-4" aria-hidden /> Safety desk
      </Link>
      <PageHeader
        title={
          <>
            {session.seeker.alias} <span className="italic text-muted">with</span> {session.listener.displayName}
          </>
        }
        description={`${session.minutes}-minute chat · ${session.status.toLowerCase()}${session.endReason ? ` (${session.endReason.replace("_", " ")})` : ""} · ${fmtDateTime(session.createdAt)}`}
      />
      <div className="mb-6 flex flex-wrap gap-2">
        {session.crisisFlaggedAt ? <Badge tone="danger">Crisis flagged</Badge> : null}
        {session.reports.length ? <Badge tone="amber">{session.reports.length} report(s)</Badge> : null}
        <Badge tone="neutral">Seeker IP: {session.seekerIp || "Unavailable"}</Badge>
        <Badge tone="neutral">Listener IP: {session.listenerIp || "Unavailable"}</Badge>
      </div>
      <ol className="space-y-2 rounded-3xl border border-line bg-surface p-5 shadow-soft">
        {session.messages.map((m) => {
          const who = !m.senderId ? "System" : m.senderId === session.seeker.id ? session.seeker.alias : session.listener.displayName;
          return (
            <li key={m.id} className={cn("rounded-2xl px-4 py-2.5 text-sm", m.kind === "TEXT" ? "bg-surface-2" : m.kind === "CRISIS" ? "bg-danger-soft" : "text-muted")}>
              <p className="text-xs font-semibold text-muted">
                {who} · {fmtTime(m.createdAt)}
              </p>
              <p className="mt-0.5 whitespace-pre-wrap break-words">{m.body}</p>
            </li>
          );
        })}
      </ol>
    </Container>
  );
}
