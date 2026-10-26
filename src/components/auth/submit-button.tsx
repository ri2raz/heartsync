"use client";

import { LoaderCircle } from "lucide-react";
import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

import { Button, type ButtonSize, type ButtonVariant } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SubmitButton({
  children,
  pendingLabel,
  variant = "primary",
  size = "lg",
  className,
}: {
  children: ReactNode;
  pendingLabel?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant={variant} size={size} disabled={pending} aria-busy={pending} className={cn("w-full", className)}>
      {pending ? (
        <>
          <LoaderCircle className="size-4 animate-spin" aria-hidden /> {pendingLabel ?? "Please wait…"}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
