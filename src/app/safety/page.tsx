import { Ban, Eye, LifeBuoy, ShieldCheck, UserCheck } from "lucide-react";
import type { Metadata } from "next";

import { Container, PageHeader } from "@/components/ui/section";
import { Prose } from "@/components/ui/prose";

export const metadata: Metadata = { title: "Safety" };

const PILLARS = [
  { icon: UserCheck, title: "Verified listeners", body: "DigiLocker ID check, police verification and listening training before anyone goes live." },
  { icon: Eye, title: "Anonymous seekers", body: "Only your nickname is ever shared. Emails and phone numbers stay private." },
  { icon: Ban, title: "Automatic blocking", body: "Phone numbers, emails, handles, links, money requests, meet-ups and romantic messages are blocked." },
  { icon: LifeBuoy, title: "Crisis response", body: "Crisis words show helplines to both people instantly and alert our safety team." },
  { icon: ShieldCheck, title: "Report in one tap", body: "Reporting ends the chat immediately and goes straight to a human reviewer." },
];

export default function SafetyPage() {
  return (
    <Container>
      <PageHeader
        eyebrow="Safety"
        title={
          <>
            Safe to open up. <span className="italic text-rose">That&apos;s the point.</span>
          </>
        }
        description="HeartSync is a peer-support platform for adults. These are the rules that keep it platonic, private and kind."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {PILLARS.map(({ icon: Icon, title, body }) => (
          <div key={title} className="rounded-3xl border border-line bg-surface p-5 shadow-soft">
            <Icon className="size-6 text-rose" aria-hidden />
            <h2 className="mt-4 font-semibold">{title}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">{body}</p>
          </div>
        ))}
      </div>

      <div className="mt-16">
        <Prose>
          <h2>What HeartSync is — and isn&apos;t</h2>
          <p>
            HeartSync connects you with trained, verified peers who listen and share life experience, like a caring
            older sibling. <strong>It is not therapy, counselling, medical care or an emergency service.</strong>{" "}
            Listeners do not diagnose, treat or prescribe. If what you&apos;re going through needs a professional, your
            listener will encourage you to see one.
          </p>

          <h2 id="code" className="scroll-mt-24">Listener code of conduct</h2>
          <p>Every listener agrees to this before their first chat. Breaking it means removal from HeartSync.</p>
          <ol>
            <li><strong>Listen first.</strong> No judging, lecturing or moralising. The chat is about the seeker, not you.</li>
            <li><strong>Stay in your lane.</strong> Never diagnose, never suggest medicines, never call yourself a therapist, counsellor or doctor.</li>
            <li><strong>Strictly platonic.</strong> No flirting, romantic talk, sexual content or requests for photos.</li>
            <li><strong>Stay on HeartSync.</strong> Never share or ask for phone numbers, social handles, addresses or meet-ups.</li>
            <li><strong>No money outside the app.</strong> Never ask for or accept payments, gifts or favours.</li>
            <li><strong>Protect privacy.</strong> Never record, screenshot or share anything from a chat.</li>
            <li><strong>Crisis protocol.</strong> If someone mentions suicide or self-harm: stay calm and stay with them, share Tele-MANAS 14416 and 112, encourage them to reach someone they trust, and report the chat so the safety team can follow up.</li>
            <li><strong>Report abuse.</strong> If you learn a child is being harmed, report it to the safety team immediately — we are required to inform the authorities.</li>
          </ol>

          <h2>Rules for everyone</h2>
          <ul>
            <li>You must be 18 or older.</li>
            <li>Be respectful. Harassment, hate speech and threats lead to a permanent ban.</li>
            <li>Don&apos;t try to move the conversation off HeartSync or pay anyone directly.</li>
            <li>Ratings and reports are reviewed by people, not just algorithms.</li>
          </ul>

          <h2>Who can see your chats?</h2>
          <p>
            Only you and your listener. Our safety team can open a transcript only when a chat has been reported or
            flagged for crisis language — never otherwise.
          </p>
        </Prose>
      </div>
    </Container>
  );
}
