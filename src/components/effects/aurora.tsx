import { cn } from "@/lib/utils";

/**
 * Soft drifting colour field, inspired by the React Bits "Aurora" background.
 * Pure CSS (blurred blobs) so it costs nothing on low-end phones.
 */
export function Aurora({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <div className="absolute -left-[10%] -top-[20%] h-[60vmax] w-[60vmax] animate-aurora rounded-full bg-[radial-gradient(circle,var(--rose)_0%,transparent_60%)] opacity-[0.22] blur-3xl dark:opacity-[0.28]" />
      <div
        className="absolute -right-[15%] top-[0%] h-[55vmax] w-[55vmax] animate-aurora rounded-full bg-[radial-gradient(circle,var(--lilac)_0%,transparent_60%)] opacity-[0.28] blur-3xl dark:opacity-[0.22]"
        style={{ animationDelay: "-6s" }}
      />
      <div
        className="absolute bottom-[-30%] left-[25%] h-[50vmax] w-[50vmax] animate-aurora rounded-full bg-[radial-gradient(circle,var(--peach)_0%,transparent_60%)] opacity-[0.25] blur-3xl dark:opacity-[0.16]"
        style={{ animationDelay: "-12s" }}
      />
      <Grain />
    </div>
  );
}

/** Subtle film grain that keeps gradients from looking flat. */
export function Grain({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-multiply dark:opacity-[0.08] dark:mix-blend-screen", className)}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
      }}
    />
  );
}
