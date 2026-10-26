import { BadgeCheck, Clock, GraduationCap, IndianRupee } from "lucide-react";
import type { Metadata } from "next";

import { ApplyForm } from "@/components/listener/apply-form";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Container, PageHeader } from "@/components/ui/section";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { fmtDateLong } from "@/lib/format";

export const metadata: Metadata = { title: "Become a listener" };

const STEPS = [
  { icon: BadgeCheck, title: "Apply & verify", body: "Share a little about yourself. We verify your ID through DigiLocker and arrange police verification." },
  { icon: GraduationCap, title: "Train", body: "About 15 hours of listening-skills training: active listening, boundaries, and how to handle a crisis." },
  { icon: Clock, title: "Go online when you want", body: "Flip the switch when you're free. Accept the chats you can give your full attention to." },
  { icon: IndianRupee, title: "Get paid per minute", body: "Earn for every minute you listen, paid out monthly. No joining fee — ever." },
];

export default async function BecomeListenerPage() {
  const user = await getCurrentUser();
  const application = user ? await db.listenerApplication.findUnique({ where: { userId: user.id } }) : null;

  return (
    <Container className="max-w-5xl">
      <PageHeader
        eyebrow="Listen with HeartSync"
        title={
          <>
            Be the big bro or big sis <span className="italic text-rose">you once needed.</span>
          </>
        }
        description="Kind, patient, 18+? Been through exams, heartbreak, a new city or family pressure? People out there need exactly you."
      />

      <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map(({ icon: Icon, title, body }, i) => (
          <li key={title} className="rounded-3xl border border-line bg-surface p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <Icon className="size-6 text-rose" aria-hidden />
              <span className="font-serif text-2xl italic text-muted">0{i + 1}</span>
            </div>
            <h2 className="mt-4 font-semibold">{title}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">{body}</p>
          </li>
        ))}
      </ol>

      <section className="mt-12 rounded-[2rem] border border-line bg-surface p-6 shadow-soft sm:p-10">
        <h2 className="font-serif text-4xl">Your application</h2>
        <p className="mt-1 text-muted">Takes about 5 minutes. We never charge listeners to join.</p>
        <div className="mt-8">
          {!user ? (
            <div className="flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/signup?next=/become-a-listener" variant="rose" size="lg">
                Create an account to apply
              </ButtonLink>
              <ButtonLink href="/login?next=/become-a-listener" variant="secondary" size="lg">
                Log in
              </ButtonLink>
            </div>
          ) : user.role !== "SEEKER" ? (
            <p className="rounded-2xl bg-surface-2 px-4 py-3 text-muted">
              {user.role === "LISTENER" ? "You're already a listener. Head to your dashboard to go online." : "Admins can't apply as listeners."}
            </p>
          ) : application && application.status !== "REJECTED" ? (
            <div className="rounded-3xl bg-surface-2 p-6">
              <Badge tone={application.status === "APPROVED" ? "green" : "amber"}>
                {application.status === "PENDING" ? "Under review" : "Approved"}
              </Badge>
              <p className="mt-3 text-lg">
                Thanks, {application.fullName.split(" ")[0]}. We received your application on{" "}
                {fmtDateLong(application.createdAt)}.
              </p>
              <p className="mt-1 text-muted">Our team will call you on the number you gave us to arrange verification and training.</p>
            </div>
          ) : (
            <>
              {application?.status === "REJECTED" ? (
                <p className="mb-6 rounded-2xl bg-surface-2 px-4 py-3 text-sm text-muted">
                  Your last application wasn&apos;t approved. You&apos;re welcome to apply again.
                </p>
              ) : null}
              <ApplyForm />
            </>
          )}
        </div>
      </section>
    </Container>
  );
}
