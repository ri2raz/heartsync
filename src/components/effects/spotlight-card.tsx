"use client";

import { useRef, type ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Card with a soft light that follows the pointer, after React Bits "SpotlightCard". */
export function SpotlightCard({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={ref}
      onPointerMove={(e) => {
        const el = ref.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        el.style.setProperty("--x", `${e.clientX - rect.left}px`);
        el.style.setProperty("--y", `${e.clientY - rect.top}px`);
      }}
      className={cn(
        "group relative overflow-hidden rounded-3xl border border-line bg-surface p-6 shadow-soft transition-transform duration-300 hover:-translate-y-0.5",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: "radial-gradient(360px circle at var(--x, 50%) var(--y, 50%), var(--rose-soft), transparent 70%)" }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}
