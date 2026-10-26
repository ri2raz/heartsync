import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Infinite horizontal scroller. Content is rendered twice so the loop is seamless. */
export function Marquee({
  children,
  className,
  duration = 40,
  reverse = false,
}: {
  children: ReactNode;
  className?: string;
  duration?: number;
  reverse?: boolean;
}) {
  return (
    <div className={cn("group flex overflow-hidden mask-fade-x", className)}>
      {[0, 1].map((copy) => (
        <div
          key={copy}
          aria-hidden={copy === 1}
          className="flex shrink-0 animate-marquee items-center gap-3 pr-3 group-hover:[animation-play-state:paused]"
          style={{
            ["--marquee-duration" as string]: `${duration}s`,
            animationDirection: reverse ? "reverse" : "normal",
          }}
        >
          {children}
        </div>
      ))}
    </div>
  );
}
