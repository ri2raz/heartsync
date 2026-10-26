"use client";

import { useOptimistic, useTransition } from "react";

import { setOnline } from "@/actions/listener";
import { cn } from "@/lib/utils";

export function OnlineToggle({ online }: { online: boolean }) {
  const [optimistic, setOptimistic] = useOptimistic(online);
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      role="switch"
      aria-checked={optimistic}
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          setOptimistic(!optimistic);
          await setOnline(!optimistic);
        })
      }
      className={cn(
        "group inline-flex items-center gap-3 rounded-full py-2 pl-2 pr-5 text-sm font-medium shadow-soft ring-1 transition",
        optimistic ? "bg-emerald-500/12 text-emerald-700 ring-emerald-500/30 dark:text-emerald-300" : "bg-surface text-muted ring-line",
      )}
    >
      <span className={cn("relative h-7 w-12 rounded-full transition", optimistic ? "bg-emerald-500" : "bg-muted/30")}>
        <span className={cn("absolute top-1 size-5 rounded-full bg-white shadow transition-all", optimistic ? "left-6" : "left-1")} />
      </span>
      {optimistic ? "You're online — seekers can request you" : "You're offline"}
    </button>
  );
}
