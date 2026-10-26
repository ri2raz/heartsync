import type { Metadata } from "next";

import { Prose } from "@/components/ui/prose";
import { Container, PageHeader } from "@/components/ui/section";
import { APP_NAME, GRIEVANCE_OFFICER, SUPPORT_EMAIL } from "@/lib/constants";

export const metadata: Metadata = { title: "Privacy policy" };

export default function PrivacyPage() {
  return (
    <Container>
      <PageHeader
        eyebrow="Legal"
        title="Privacy policy"
        description="What we collect, why, and the control you have — written to meet the Digital Personal Data Protection Act, 2023."
      />
      <Prose>
        <h2>What we collect</h2>
        <ul>
          <li><strong>Account:</strong> nickname, email, password (stored only as a secure hash) and date of birth, to confirm you are 18+.</li>
          <li><strong>Chats:</strong> the messages you send and receive, so the conversation works and so we can act on reports and crisis flags.</li>
          <li><strong>Payments:</strong> pack, amount and Razorpay order/payment IDs. We never see or store card or UPI details.</li>
          <li><strong>Listener applicants:</strong> legal name, phone, city and the information needed for ID and police verification.</li>
        </ul>

        <h2>What others see</h2>
        <p>
          Listeners see only your nickname and your messages. Your email, date of birth and payment details are never
          shown to anyone. Listener legal names and phone numbers are never shown to seekers.
        </p>

        <h2>How we use it</h2>
        <ul>
          <li>To run your account, your chats and your minutes balance.</li>
          <li>To keep the platform safe: automatic message checks, crisis alerts and review of reported chats.</li>
          <li>To meet legal obligations, including responding to lawful requests from authorities.</li>
        </ul>
        <p>We do not sell your data and we do not use your chats for advertising.</p>

        <h2>Who can read chats</h2>
        <p>
          Only the two people in a chat. Our safety team can open a transcript only if the chat was reported or flagged
          for crisis language.
        </p>

        <h2>How long we keep it</h2>
        <p>
          Chat messages are kept for as long as your account is active so you can see your history, and for up to 180
          days after you delete your account where we need them for safety investigations or legal compliance.
          Payment records are kept as required by tax law.
        </p>

        <h2>Your rights</h2>
        <p>
          Under the DPDP Act you can ask to access, correct or erase your personal data, withdraw consent, and nominate
          someone to exercise these rights for you. Email <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
        </p>

        <h2>Security</h2>
        <p>
          Passwords are hashed with bcrypt, sessions use signed HTTP-only cookies, and access to safety tools is limited
          to authorised staff. No system is perfectly secure; if we learn of a breach affecting you, we will tell you and
          the Data Protection Board as the law requires.
        </p>

        <h2>Contact</h2>
        <p>
          {APP_NAME} {GRIEVANCE_OFFICER}: <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
        </p>
      </Prose>
    </Container>
  );
}
