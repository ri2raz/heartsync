import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ChatRoom } from "@/components/chat/chat-room";
import { Container } from "@/components/ui/section";
import { requireUser } from "@/lib/auth";
import { getSessionView } from "@/lib/chat-service";

export const metadata: Metadata = { title: "Chat", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser(`/chat/${id}`);
  const view = await getSessionView(user.id, id);
  if (!view) notFound();

  return (
    <Container className="max-w-3xl py-4 sm:py-6">
      <ChatRoom initial={view} />
    </Container>
  );
}
