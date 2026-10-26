import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

const control =
  "w-full rounded-2xl border border-line bg-surface px-4 text-[15px] text-ink placeholder:text-muted/70 shadow-[inset_0_1px_0_rgb(0_0_0/0.02)] transition focus:border-rose focus:outline-none focus:ring-4 focus:ring-[var(--ring)] disabled:opacity-60";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(control, "h-12", className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(control, "min-h-28 py-3 leading-relaxed", className)} {...props} />;
}

export function Select({ className, ...props }: ComponentProps<"select">) {
  return <select className={cn(control, "h-12 appearance-none bg-[length:16px] pr-10", className)} {...props} />;
}

export function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: ReactNode;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-ink">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-sm text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

export function FormError({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <div role="alert" className="rounded-2xl bg-danger-soft px-4 py-3 text-sm text-danger">
      {message}
    </div>
  );
}

export function CheckboxRow({ id, name, children, required }: { id: string; name: string; children: ReactNode; required?: boolean }) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-start gap-3 rounded-2xl p-1 text-sm leading-relaxed text-muted">
      <input
        id={id}
        name={name}
        type="checkbox"
        required={required}
        className="mt-0.5 size-5 shrink-0 cursor-pointer rounded-md border-line accent-[var(--rose)]"
      />
      <span>{children}</span>
    </label>
  );
}
