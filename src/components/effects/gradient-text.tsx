import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Slowly shifting gradient fill, after React Bits "GradientText". */
export function GradientText({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "animate-shimmer bg-[linear-gradient(90deg,var(--rose),var(--peach),var(--lilac),var(--rose))] bg-[length:200%_auto] bg-clip-text text-transparent",
        className,
      )}
    >
      {children}
    </span>
  );
}
