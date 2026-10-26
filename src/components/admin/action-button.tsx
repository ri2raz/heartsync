"use client";

import { useState, useTransition } from "react";

import { Button, type ButtonVariant } from "@/components/ui/button";
import type { FormState } from "@/lib/form";

/** Runs a server action from a button, with optional confirm and inline result. */
export function ActionButton({
  action,
  children,
  variant = "secondary",
  confirm,
}: {
  action: () => Promise<FormState>;
  children: React.ReactNode;
  variant?: ButtonVariant;
  confirm?: string;
}) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<FormState | null>(null);

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <Button
        variant={variant}
        size="sm"
        disabled={pending}
        onClick={() => {
          if (confirm && !window.confirm(confirm)) return;
          startTransition(async () => setResult(await action()));
        }}
      >
        {pending ? "Working…" : children}
      </Button>
      {result?.error ? <span className="text-xs text-danger">{result.error}</span> : null}
      {result?.success ? <span className="text-xs text-muted">{result.success}</span> : null}
    </span>
  );
}
