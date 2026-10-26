import type { ReactNode } from "react";

import { Aurora } from "@/components/effects/aurora";

export function AuthShell({ title, subtitle, children, aside }: { title: ReactNode; subtitle: ReactNode; children: ReactNode; aside?: ReactNode }) {
  return (
    <section className="relative isolate overflow-hidden">
      <Aurora />
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_440px] lg:py-20">
        <div className="hidden lg:block">
          <h1 className="font-serif text-6xl leading-[1] tracking-tight">{title}</h1>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-muted">{subtitle}</p>
          {aside}
        </div>
        <div className="rounded-[2rem] border border-line bg-surface/90 p-6 shadow-soft backdrop-blur-xl sm:p-8">
          <div className="mb-6 lg:hidden">
            <h1 className="font-serif text-4xl leading-[1.05] tracking-tight">{title}</h1>
            <p className="mt-2 text-muted">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </section>
  );
}
