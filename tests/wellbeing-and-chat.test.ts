import { describe, expect, it } from "vitest";

import { chatEventBus } from "@/lib/chat-events";

describe("chatEventBus", () => {
  it("emits and receives session events", () => {
    const events: unknown[] = [];
    const unsubscribe = chatEventBus.onChatEvent("session_123", (evt) => {
      events.push(evt);
    });

    chatEventBus.emitChatEvent("session_123", {
      type: "typing",
      sessionId: "session_123",
      userId: "user_a",
      isTyping: true,
    });

    chatEventBus.emitChatEvent("session_123", {
      type: "crisis",
      sessionId: "session_123",
      crisisFlagged: true,
      flaggedAt: new Date().toISOString(),
    });

    unsubscribe();

    expect(events.length).toBe(2);
    expect(events[0]).toMatchObject({ type: "typing", isTyping: true });
    expect(events[1]).toMatchObject({ type: "crisis", crisisFlagged: true });
  });

  it("does not receive events after unsubscribe", () => {
    let count = 0;
    const unsub = chatEventBus.onChatEvent("session_unsub", () => {
      count++;
    });

    chatEventBus.emitChatEvent("session_unsub", {
      type: "typing",
      sessionId: "session_unsub",
      userId: "user_b",
      isTyping: true,
    });

    unsub();

    chatEventBus.emitChatEvent("session_unsub", {
      type: "typing",
      sessionId: "session_unsub",
      userId: "user_b",
      isTyping: false,
    });

    expect(count).toBe(1);
  });
});
