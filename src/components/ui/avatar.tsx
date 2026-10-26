import { cn, initials } from "@/lib/utils";

/** Gradient avatar generated from a hue, so no photos of listeners are ever needed. */
export function Avatar({ name, hue, size = 48, className }: { name: string; hue: number; size?: number; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("inline-flex shrink-0 items-center justify-center rounded-full font-serif text-white shadow-soft", className)}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.42,
        background: `radial-gradient(120% 120% at 20% 15%, hsl(${(hue + 40) % 360} 95% 78%), hsl(${hue} 75% 58%) 55%, hsl(${(hue + 330) % 360} 60% 38%))`,
      }}
    >
      {initials(name)}
    </span>
  );
}
