import type { z } from "zod";

export type FormState = {
  error?: string | null;
  fieldErrors?: Record<string, string>;
  success?: string | null;
  /** Submitted values, echoed back so React's post-action form reset doesn't wipe what the user typed. */
  values?: Record<string, string | string[]>;
};

export function fieldErrorsFrom(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

export function str(form: FormData, key: string): string {
  const value = form.get(key);
  return typeof value === "string" ? value : "";
}

export function keep(form: FormData, keys: string[], multi: string[] = []): Record<string, string | string[]> {
  const out: Record<string, string | string[]> = {};
  for (const key of keys) out[key] = str(form, key);
  for (const key of multi) out[key] = form.getAll(key).filter((v): v is string => typeof v === "string");
  return out;
}
