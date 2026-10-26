"use client";

import { ArrowUp, Flag, LifeBuoy, LoaderCircle, PhoneCall, ShieldCheck, Timer, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";

import { acceptChat, cancelChatRequest, declineChat, endActiveChat } from "@/actions/chat";
import { Avatar } from "@/components/ui/avatar";
import { Button, ButtonLink } from "@/components/ui/button";
import type { SessionView } from "@/lib/chat-service";
import { HELPLINES, LISTENER_TITLES, MAX_MESSAGE_LENGTH } from "@/lib/constants";
import { useMounted } from "@/lib/use-mounted";
import { cn, hueFromString } from "@/lib/utils";

import { RateChat } from "./rate-chat";
import { ReportDialog } from "./report-dialog";

type Message = SessionView["messages"][number];

const ACTIVE_POLL_MS = 2000;
const IDLE_POLL_MS = 6000;

function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/** Seconds until `targetMs`, ticking every second. Null until mounted so SSR and hydration agree. */
function useCountdown(targetMs: number | null): number | null {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    if (targetMs === null) return;
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [targetMs]);
  return targetMs === null || now === null ? null : Math.max(0, Math.round((targetMs - now) / 1000));
}

export function ChatRoom({ initial }: { initial: SessionView }) {
  const router = useRouter();
  const [view, setView] = useState<Omit<SessionView, "messages">>(initial);
  const [messages, setMessages] = useState<Message[]>(initial.messages);
  const [endsAt, setEndsAt] = useState<number | null>(
    initial.secondsRemaining !== null ? Date.now() + initial.secondsRemaining * 1000 : null,
  );
  const [draft, setDraft] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [pending, startTransition] = useTransition();
  const [reportOpen, setReportOpen] = useState(false);
  const mounted = useMounted();

  const lastIdRef = useRef(initial.messages.at(-1)?.id ?? 0);
  const listRef = useRef<HTMLDivElement>(null);
  const stickToBottom = useRef(true);
  const pollNow = useRef<() => void>(() => {});

  const secondsLeft = useCountdown(view.status === "ACTIVE" ? endsAt : null);
  const requestSecondsLeft = useCountdown(
    view.status === "REQUESTED" && view.requestExpiresAt ? new Date(view.requestExpiresAt).getTime() : null,
  );

  const isOpen = view.status === "REQUESTED" || view.status === "ACTIVE";
  const listenerTitle = LISTENER_TITLES[view.listener.title as keyof typeof LISTENER_TITLES] ?? "Listener";
  const counterpart =
    view.role === "seeker"
      ? { name: view.listener.displayName, hue: view.listener.avatarHue, sub: listenerTitle }
      : { name: view.seekerAlias, hue: hueFromString(view.seekerAlias), sub: "Seeker" };

  const applyView = useCallback((next: SessionView) => {
    const { messages: incoming, ...rest } = next;
    setView(rest);
    setEndsAt(rest.secondsRemaining !== null ? Date.now() + rest.secondsRemaining * 1000 : null);
    if (incoming.length) {
      setMessages((prev) => {
        const seen = new Set(prev.map((m) => m.id));
        const merged = [...prev, ...incoming.filter((m) => !seen.has(m.id))];
        return merged;
      });
      lastIdRef.current = Math.max(lastIdRef.current, incoming.at(-1)?.id ?? 0);
    }
  }, []);

  // Poll for new messages and status changes while the chat is open.
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    let timer: number | undefined;
    let controller: AbortController | undefined;

    async function tick() {
      window.clearTimeout(timer);
      controller?.abort();
      controller = new AbortController();
      try {
        const res = await fetch(`/api/sessions/${initial.id}?after=${lastIdRef.current}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        if (res.status === 401) {
          router.push(`/login?next=/chat/${initial.id}`);
          return;
        }
        if (res.ok && !cancelled) applyView((await res.json()) as SessionView);
      } catch {
        // Network blips and aborts are fine — the next tick retries.
      }
      if (!cancelled) timer = window.setTimeout(tick, document.hidden ? IDLE_POLL_MS : ACTIVE_POLL_MS);
    }

    pollNow.current = () => void tick();
    timer = window.setTimeout(tick, ACTIVE_POLL_MS);
    const onVisible = () => !document.hidden && void tick();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      controller?.abort();
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [initial.id, isOpen, applyView, router]);

  // When the local countdown hits zero, ask the server to close the chat.
  useEffect(() => {
    if ((secondsLeft === 0 && view.status === "ACTIVE") || (requestSecondsLeft === 0 && view.status === "REQUESTED")) {
      pollNow.current();
    }
  }, [secondsLeft, requestSecondsLeft, view.status]);

  // Keep the newest message in view unless the user has scrolled up to read.
  useEffect(() => {
    const el = listRef.current;
    if (el && stickToBottom.current) el.scrollTop = el.scrollHeight;
  }, [messages]);

  async function send() {
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true);
    setNotice(null);
    try {
      const res = await fetch(`/api/sessions/${initial.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (data.ok) {
        setDraft("");
        stickToBottom.current = true;
      } else {
        setNotice(data.error ?? "Couldn't send that. Try again.");
      }
    } catch {
      setNotice("You seem to be offline. Check your connection and try again.");
    } finally {
      setSending(false);
      pollNow.current();
    }
  }

  function runAction(fn: () => Promise<{ error?: string | null }>) {
    startTransition(async () => {
      const result = await fn();
      if (result?.error) setNotice(result.error);
      pollNow.current();
      router.refresh();
    });
  }

  const lowTime = secondsLeft !== null && secondsLeft <= 120;

  return (
    <div className="flex h-[calc(100dvh-7.5rem)] min-h-[520px] flex-col overflow-hidden rounded-[2rem] border border-line bg-surface shadow-soft">
      {/* Header */}
      <header className="flex items-center gap-3 border-b border-line px-4 py-3 sm:px-6">
        <Avatar name={counterpart.name} hue={counterpart.hue} size={42} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{counterpart.name}</p>
          <p className="flex items-center gap-1.5 text-xs text-muted">
            {view.role === "seeker" ? <ShieldCheck className="size-3.5 text-rose" aria-hidden /> : null}
            {counterpart.sub} · {statusLabel(view.status)}
          </p>
        </div>
        {view.status === "ACTIVE" && secondsLeft !== null ? (
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-mono text-sm tabular-nums",
              lowTime ? "bg-danger-soft text-danger" : "bg-surface-2",
            )}
            aria-label={`${formatClock(secondsLeft)} left`}
          >
            <Timer className="size-3.5" aria-hidden /> {formatClock(secondsLeft)}
          </span>
        ) : null}
        {view.status !== "DECLINED" ? (
          <Button variant="ghost" size="sm" onClick={() => setReportOpen(true)} aria-label="Report this chat" className="px-3">
            <Flag className="size-4" aria-hidden />
            <span className="hidden sm:inline">Report</span>
          </Button>
        ) : null}
        {view.status === "ACTIVE" ? (
          <Button
            variant="secondary"
            size="sm"
            disabled={pending}
            onClick={() => {
              if (window.confirm("End this chat now?")) runAction(() => endActiveChat(initial.id));
            }}
          >
            End
          </Button>
        ) : null}
      </header>

      {view.crisisFlagged ? (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-danger/20 bg-danger-soft px-4 py-3 text-sm sm:px-6">
          <LifeBuoy className="size-4 shrink-0 text-danger" aria-hidden />
          <span className="font-medium text-ink">You&apos;re not alone. Free help, 24×7:</span>
          {HELPLINES.slice(0, 2).map((h) => (
            <a key={h.number} href={`tel:${h.number}`} className="inline-flex items-center gap-1 font-semibold text-danger underline-offset-2 hover:underline">
              <PhoneCall className="size-3.5" aria-hidden /> {h.number}
            </a>
          ))}
        </div>
      ) : null}

      {/* Messages */}
      <div
        ref={listRef}
        onScroll={(e) => {
          const el = e.currentTarget;
          stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
        }}
        className="flex-1 space-y-3 overflow-y-auto px-4 py-6 sm:px-6"
        aria-live="polite"
        aria-label="Messages"
      >
        {view.status === "REQUESTED" ? (
          <WaitingCard
            role={view.role}
            name={counterpart.name}
            secondsLeft={requestSecondsLeft}
            pending={pending}
            onCancel={() => runAction(() => cancelChatRequest(initial.id))}
            onAccept={() => runAction(() => acceptChat(initial.id))}
            onDecline={() => runAction(() => declineChat(initial.id))}
          />
        ) : null}

        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} mounted={mounted} />
        ))}

        {!isOpen ? (
          <EndedCard view={view} counterpartName={counterpart.name} />
        ) : null}
      </div>

      {/* Composer */}
      {view.status === "ACTIVE" ? (
        <div className="border-t border-line p-3 sm:p-4">
          {notice ? (
            <div role="alert" className="mb-3 flex items-start gap-2 rounded-2xl bg-rose-soft px-4 py-2.5 text-sm text-rose">
              <span className="flex-1">{notice}</span>
              <button type="button" onClick={() => setNotice(null)} aria-label="Dismiss" className="shrink-0">
                <X className="size-4" />
              </button>
            </div>
          ) : null}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void send();
            }}
            className="flex items-end gap-2"
          >
            <label htmlFor="composer" className="sr-only">
              Message
            </label>
            <textarea
              id="composer"
              value={draft}
              onChange={(e) => setDraft(e.target.value.slice(0, MAX_MESSAGE_LENGTH))}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  void send();
                }
              }}
              rows={1}
              placeholder="Type what's on your mind…"
              className="max-h-40 min-h-12 flex-1 resize-none rounded-3xl border border-line bg-bg px-5 py-3 text-[15px] leading-relaxed placeholder:text-muted/70 focus:border-rose focus:outline-none focus:ring-4 focus:ring-[var(--ring)]"
            />
            <Button type="submit" variant="rose" className="size-12 shrink-0 p-0" disabled={!draft.trim() || sending} aria-label="Send">
              {sending ? <LoaderCircle className="size-5 animate-spin" /> : <ArrowUp className="size-5" />}
            </Button>
          </form>
          <p className="mt-2 px-2 text-[11px] text-muted">
            Peer support, not therapy · Numbers, socials and links are blocked · Enter to send, Shift+Enter for a new line
          </p>
        </div>
      ) : notice ? (
        <p role="alert" className="border-t border-line px-6 py-3 text-sm text-danger">
          {notice}
        </p>
      ) : null}

      <ReportDialog sessionId={initial.id} open={reportOpen} onClose={() => setReportOpen(false)} onReported={() => pollNow.current()} />
    </div>
  );
}

function statusLabel(status: string): string {
  switch (status) {
    case "REQUESTED":
      return "Waiting";
    case "ACTIVE":
      return "In chat";
    case "ENDED":
      return "Ended";
    case "DECLINED":
      return "Declined";
    default:
      return "Cancelled";
  }
}

function MessageBubble({ message, mounted }: { message: Message; mounted: boolean }) {
  if (message.kind === "CRISIS") {
    return (
      <div className="mx-auto max-w-md rounded-3xl border border-danger/20 bg-danger-soft px-5 py-4 text-sm leading-relaxed">
        <p className="flex items-center gap-2 font-semibold text-danger">
          <LifeBuoy className="size-4" aria-hidden /> We&apos;re here with you
        </p>
        <p className="mt-1.5 text-ink">{message.body}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {HELPLINES.slice(0, 2).map((h) => (
            <a key={h.number} href={`tel:${h.number}`} className="rounded-full bg-surface px-3 py-1.5 text-xs font-semibold text-danger ring-1 ring-danger/20">
              Call {h.number}
            </a>
          ))}
        </div>
      </div>
    );
  }
  if (message.kind === "SYSTEM") {
    return <p className="mx-auto max-w-md text-balance text-center text-xs leading-relaxed text-muted">{message.body}</p>;
  }
  const time = mounted ? new Date(message.createdAt).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" }) : "\u00a0";
  return (
    <div className={cn("flex", message.mine ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[82%] rounded-3xl px-4 py-2.5 text-[15px] leading-relaxed shadow-soft sm:max-w-[70%]",
          message.mine ? "rounded-br-lg bg-ink text-bg" : "rounded-bl-lg bg-surface-2 text-ink",
        )}
      >
        <p className="whitespace-pre-wrap break-words">{message.body}</p>
        <p className={cn("mt-1 text-right text-[10px]", message.mine ? "text-bg/60" : "text-muted")}>{time}</p>
      </div>
    </div>
  );
}

function WaitingCard({
  role,
  name,
  secondsLeft,
  pending,
  onCancel,
  onAccept,
  onDecline,
}: {
  role: "seeker" | "listener";
  name: string;
  secondsLeft: number | null;
  pending: boolean;
  onCancel: () => void;
  onAccept: () => void;
  onDecline: () => void;
}) {
  return (
    <div className="mx-auto mt-6 max-w-sm rounded-3xl border border-line bg-bg p-8 text-center">
      <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-rose-soft">
        <span className="relative flex size-4">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-rose opacity-60" />
          <span className="relative inline-flex size-4 rounded-full bg-rose" />
        </span>
      </div>
      {role === "seeker" ? (
        <>
          <p className="mt-5 font-serif text-3xl">Waiting for {name}…</p>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            They&apos;ll get a notification now. If they can&apos;t join within{" "}
            <span className="font-mono tabular-nums text-ink">{secondsLeft === null ? "5:00" : formatClock(secondsLeft)}</span>, the request is
            cancelled and nothing is charged.
          </p>
          <Button variant="secondary" className="mt-6" onClick={onCancel} disabled={pending}>
            Cancel request
          </Button>
        </>
      ) : (
        <>
          <p className="mt-5 font-serif text-3xl">{name} wants to talk</p>
          <p className="mt-2 text-sm text-muted">
            Expires in <span className="font-mono tabular-nums text-ink">{secondsLeft === null ? "—" : formatClock(secondsLeft)}</span>
          </p>
          <div className="mt-6 flex justify-center gap-2">
            <Button variant="secondary" onClick={onDecline} disabled={pending}>
              Decline
            </Button>
            <Button variant="rose" onClick={onAccept} disabled={pending}>
              Accept & start
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

function EndedCard({ view, counterpartName }: { view: Omit<SessionView, "messages">; counterpartName: string }) {
  const title =
    view.status === "ENDED"
      ? "This chat has ended"
      : view.status === "DECLINED"
        ? `${counterpartName} couldn't take this chat`
        : view.endReason === "expired"
          ? "Nobody could join in time"
          : "Request cancelled";
  const refundNote =
    view.status === "ENDED"
      ? null
      : view.isFree
        ? "Your free chat is still available."
        : view.role === "seeker"
          ? "All minutes have been returned to your balance."
          : null;

  return (
    <div className="mx-auto mt-6 max-w-md rounded-3xl border border-line bg-bg p-7 text-center">
      <p className="font-serif text-3xl">{title}</p>
      {refundNote ? <p className="mt-2 text-sm text-muted">{refundNote}</p> : null}
      {view.role === "seeker" && view.status === "ENDED" && view.rating === null ? (
        <RateChat sessionId={view.id} name={counterpartName} />
      ) : null}
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {view.role === "seeker" ? (
          <ButtonLink href="/listeners" variant="primary">
            Find a listener
          </ButtonLink>
        ) : (
          <ButtonLink href="/listener/dashboard" variant="primary">
            Back to dashboard
          </ButtonLink>
        )}
        <Link href="/help" className="inline-flex h-11 items-center px-4 text-sm text-muted underline-offset-2 hover:underline">
          More support options
        </Link>
      </div>
    </div>
  );
}
