"use client";

import { BellRing, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState, useTransition } from "react";

import { acceptChat, declineChat } from "@/actions/chat";
import { Avatar } from "@/components/ui/avatar";
import { Button, ButtonLink } from "@/components/ui/button";
import { useMounted } from "@/lib/use-mounted";
import { hueFromString } from "@/lib/utils";

type Data = {
  isOnline: boolean;
  requests: { id: string; minutes: number; alias: string; createdAt: string }[];
  active: string | null;
};

const POLL_MS = 4000;

export function RequestsPanel({ initial }: { initial: Data }) {
  const [data, setData] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const mounted = useMounted();

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/listener/requests", { cache: "no-store" });
      if (res.ok) setData((await res.json()) as Data);
    } catch {
      // Retry on the next tick.
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    let timer: number | undefined;
    async function tick() {
      await refresh();
      if (!cancelled) timer = window.setTimeout(tick, POLL_MS);
    }
    timer = window.setTimeout(tick, POLL_MS);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [refresh]);

  // A small heads-up in the tab title when someone is waiting.
  useEffect(() => {
    const base = "Dashboard · HeartSync";
    document.title = data.requests.length ? `(${data.requests.length}) ${base}` : base;
  }, [data.requests.length]);

  function act(fn: () => Promise<{ error?: string | null }>) {
    setError(null);
    startTransition(async () => {
      const result = await fn();
      if (result?.error) setError(result.error);
      await refresh();
    });
  }

  return (
    <div className="space-y-4">
      {data.active ? (
        <div className="flex flex-col gap-3 rounded-3xl bg-ink p-5 text-bg sm:flex-row sm:items-center">
          <MessageCircle className="size-6 text-rose" aria-hidden />
          <p className="flex-1 font-medium">You have a chat in progress.</p>
          <ButtonLink href={`/chat/${data.active}`} variant="rose" size="sm">
            Return to chat
          </ButtonLink>
        </div>
      ) : null}

      {error ? <p role="alert" className="rounded-2xl bg-danger-soft px-4 py-3 text-sm text-danger">{error}</p> : null}

      {data.requests.length ? (
        <ul className="space-y-3">
          {data.requests.map((r) => (
            <li key={r.id} className="flex flex-col gap-4 rounded-3xl border border-rose/30 bg-rose-soft p-5 sm:flex-row sm:items-center">
              <Avatar name={r.alias} hue={hueFromString(r.alias)} size={44} />
              <div className="flex-1">
                <p className="font-semibold">{r.alias} wants to talk</p>
                <p className="text-sm text-muted">
                  {r.minutes}-minute chat
                  {mounted ? ` · requested ${new Date(r.createdAt).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}` : ""}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" disabled={pending} onClick={() => act(() => declineChat(r.id))}>
                  Decline
                </Button>
                <Button variant="rose" size="sm" disabled={pending || Boolean(data.active)} onClick={() => act(() => acceptChat(r.id))}>
                  Accept
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex items-center gap-4 rounded-3xl border border-dashed border-line p-6">
          <BellRing className="size-6 shrink-0 text-muted" aria-hidden />
          <p className="text-muted">
            {data.isOnline
              ? "No requests right now. Keep this tab open — new requests appear here automatically."
              : "Go online to start receiving chat requests."}{" "}
            <Link href="/safety#code" className="text-ink underline underline-offset-2">
              Refresh the code of conduct
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}
