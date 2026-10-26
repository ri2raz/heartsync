import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

const tones = {
  neutral: "bg-surface-2 text-muted",
  rose: "bg-rose-soft text-rose",
  green: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300",
  amber: "bg-amber-500/14 text-amber-800 dark:text-amber-300",
  danger: "bg-danger-soft text-danger",
} as const;

export function Badge({ tone = "neutral", className, ...props }: ComponentProps<"span"> & { tone?: keyof typeof tones }) {
  return (
    <span
      className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium", tones[tone], className)}
      {...props}
    />
  );
}

export function OnlineDot({ online }: { online: boolean }) {
  return (
    <span
      aria-label={online ? "Online" : "Offline"}
      className={cn("inline-block size-2.5 rounded-full", online ? "animate-pulse-ring bg-emerald-500" : "bg-muted/40")}
    />
  );
}
