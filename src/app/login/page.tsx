import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { getCurrentUser } from "@/lib/auth";
import { safeRedirectPath } from "@/lib/utils";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ next?: string | string[] }>;
}) {
  const params = searchParams ? await searchParams : {};
  const rawNext = Array.isArray(params?.next) ? params.next[0] : params?.next;
  const safeNext = rawNext ? safeRedirectPath(rawNext) : undefined;

  const user = await getCurrentUser();
  if (user) {
    if (safeNext === "/admin" && user.role !== "ADMIN") {
      redirect("/listeners");
    }
    redirect(
      safeNext ||
        (user.role === "ADMIN" ? "/admin" : user.role === "LISTENER" ? "/listener/dashboard" : "/listeners"),
    );
  }

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
