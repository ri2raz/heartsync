import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function Container({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("mx-auto w-full max-w-6xl px-4 sm:px-6", className)}>{children}</div>;
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("text-xs font-semibold uppercase tracking-[0.18em] text-rose", className)}>{children}</p>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto max-w-2xl text-center", className)}>
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <h2 className="mt-3 text-balance font-serif text-4xl leading-[1.05] tracking-tight sm:text-5xl">{title}</h2>
      {description ? <p className="mt-4 text-pretty text-lg leading-relaxed text-muted">{description}</p> : null}
    </div>
  );
}

export function PageHeader({ eyebrow, title, description }: { eyebrow?: string; title: ReactNode; description?: ReactNode }) {
  return (
    <div className="pb-8 pt-10 sm:pt-14">
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <h1 className="mt-3 text-balance font-serif text-4xl leading-[1.05] tracking-tight sm:text-5xl">{title}</h1>
      {description ? <p className="mt-3 max-w-2xl text-pretty text-lg leading-relaxed text-muted">{description}</p> : null}
    </div>
  );
}
