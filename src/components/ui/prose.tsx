import type { ReactNode } from "react";

/** Long-form typography for policy pages. */
export function Prose({ children }: { children: ReactNode }) {
  return (
    <div className="max-w-3xl space-y-5 text-[17px] leading-relaxed text-ink/90 [&_a]:font-medium [&_a]:text-rose [&_a]:underline-offset-2 hover:[&_a]:underline [&_h2]:pt-6 [&_h2]:font-serif [&_h2]:text-3xl [&_h2]:text-ink [&_h3]:pt-2 [&_h3]:text-lg [&_h3]:font-semibold [&_li]:pl-1 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-6 [&_strong]:text-ink [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6">
      {children}
    </div>
  );
}
