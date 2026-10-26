import { EyeOff, Gift, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthShell } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/auth/signup-form";
import { getCurrentUser } from "@/lib/auth";
import { FREE_CHAT_MINUTES } from "@/lib/constants";
import { safeRedirectPath } from "@/lib/utils";

export const metadata: Metadata = { title: "Create your account" };

const POINTS = [
  { icon: EyeOff, text: "Only your nickname is ever shown" },
  { icon: ShieldCheck, text: "Every listener is ID and police verified" },
  { icon: Gift, text: `Your first ${FREE_CHAT_MINUTES} minutes are free` },
];

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  if (await getCurrentUser()) redirect(safeRedirectPath(next));
  const safeNext = next ? safeRedirectPath(next) : undefined;

  return (
    <AuthShell
      title={
        <>
          Kisi se baat <span className="italic text-rose">karni hai?</span>
        </>
      }
      subtitle="Create a private account in under a minute. No real name needed."
      aside={
        <ul className="mt-10 space-y-4">
          {POINTS.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-3 text-muted">
              <span className="inline-flex size-10 items-center justify-center rounded-full bg-surface shadow-soft">
                <Icon className="size-4 text-rose" aria-hidden />
              </span>
              {text}
            </li>
          ))}
        </ul>
      }
    >
      <SignupForm next={safeNext} />
    </AuthShell>
  );
}
