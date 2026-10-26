import type { Metadata } from "next";
import Link from "next/link";

import { Prose } from "@/components/ui/prose";
import { Container, PageHeader } from "@/components/ui/section";
import { APP_NAME, FREE_CHAT_MINUTES, GRIEVANCE_OFFICER, SUPPORT_EMAIL } from "@/lib/constants";

export const metadata: Metadata = { title: "Terms of use" };

export default function TermsPage() {
  return (
    <Container>
      <PageHeader eyebrow="Legal" title="Terms of use" description="Please read these carefully. By creating an account you agree to them." />
      <Prose>
        <h2>1. What {APP_NAME} is</h2>
        <p>
          {APP_NAME} is an online <strong>peer-support platform</strong>. It connects adults who want to talk
          (&quot;seekers&quot;) with trained, verified volunteers and gig workers who listen (&quot;listeners&quot;).
          Listeners offer emotional support and share life experience.
        </p>
        <p>
          <strong>
            {APP_NAME} does not provide therapy, counselling, psychological or psychiatric treatment, medical advice or
            emergency services.
          </strong>{" "}
          Listeners are not mental health professionals as defined in the Mental Healthcare Act, 2017. Nothing on{" "}
          {APP_NAME} is a substitute for professional care. If you are in danger, call 112 or Tele-MANAS on 14416.
        </p>

        <h2>2. Who can use it</h2>
        <ul>
          <li>You must be at least 18 years old and able to enter a binding contract under Indian law.</li>
          <li>You must give accurate information when you sign up, including your date of birth.</li>
          <li>One personal account per person. Keep your password private.</li>
        </ul>

        <h2>3. Rules of conduct</h2>
        <p>
          You agree to follow our <Link href="/safety">safety rules and code of conduct</Link>. In particular, you will
          not share or ask for contact details, try to meet in person, request or send money outside {APP_NAME}, send
          romantic or sexual content, harass anyone, or use {APP_NAME} for anything unlawful. We may block messages,
          end chats, and suspend or remove accounts that break these rules.
        </p>

        <h2>4. Minutes, payments and refunds</h2>
        <ul>
          <li>Each new account gets one free {FREE_CHAT_MINUTES}-minute chat.</li>
          <li>Paid minutes are bought in packs through our payment partner, Razorpay. Prices are shown in INR.</li>
          <li>Minutes are deducted when you request a chat. If the listener declines, or nobody joins within 5 minutes, all minutes are returned.</li>
          <li>If a chat ends early, unused whole minutes are returned to your balance. Any started minute counts as used.</li>
          <li>Minutes have no cash value and cannot be transferred. For payment problems, write to <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.</li>
        </ul>

        <h2>5. Listeners</h2>
        <p>
          Listeners are independent and are not employees of {APP_NAME}. They are verified and trained before going
          live, but {APP_NAME} does not guarantee any particular outcome from a conversation. Listeners must never take
          payments directly from seekers.
        </p>

        <h2>6. Safety monitoring</h2>
        <p>
          To keep people safe, messages are checked automatically for contact details, money requests, romantic
          solicitation and crisis language. Chats that are reported or flagged for crisis language may be reviewed by
          our safety team, and we may share information with authorities where the law requires it or where someone&apos;s
          life may be at risk.
        </p>

        <h2>7. Liability</h2>
        <p>
          {APP_NAME} is provided &quot;as is&quot;. To the extent permitted by law, we are not liable for indirect or
          consequential loss arising from conversations on the platform. Nothing in these terms limits liability that
          cannot be limited under Indian law.
        </p>

        <h2>8. Grievances</h2>
        <p>
          Under the Information Technology Act, 2000 and the IT (Intermediary Guidelines and Digital Media Ethics Code)
          Rules, 2021, you can raise a complaint with our {GRIEVANCE_OFFICER} at{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>. We acknowledge complaints within 24 hours and aim to
          resolve them within 15 days.
        </p>

        <h2>9. Changes and governing law</h2>
        <p>
          We may update these terms and will tell you about significant changes. These terms are governed by the laws
          of India.
        </p>
      </Prose>
    </Container>
  );
}
