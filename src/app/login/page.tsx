import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { getCurrentUser } from "@/lib/auth";
import { safeRedirectPath } from "@/lib/utils";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  if (await getCurrentUser()) redirect(safeRedirectPath(next));
  const safeNext = next ? safeRedirectPath(next) : undefined;

  return (
    <AuthShell
      title={
        <>
          Welcome <span className="italic text-rose">back.</span>
        </>
      }
      subtitle="Pick up where you left off. Your listeners are a tap away."
    >
      <LoginForm next={safeNext} />
    </AuthShell>
  );
}
