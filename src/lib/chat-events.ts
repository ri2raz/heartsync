import { EventEmitter } from "node:events";

export type ChatEventType = "message" | "typing" | "read" | "status" | "crisis";

export type ChatEvent =
  | {
      type: "message";
      sessionId: string;
      message: {
        id: number;
        sessionId: string;
        senderId: string | null;
        kind: string;
        body: string;
        mediaType: string;
        mediaUrl: string | null;
        audioDuration: number | null;
        status: string;
        createdAt: string;
        mine?: boolean;
      };
      crisisFlagged?: boolean;
    }
  | {
      type: "typing";
      sessionId: string;
      userId: string;
      alias?: string;
      isTyping: boolean;
    }
  | {
      type: "read";
      sessionId: string;
      readerId: string;
      readUpToId: number;
      readAt: string;
    }
  | {
      type: "status";
      sessionId: string;
      status: string;
      endReason?: string | null;
    }
  | {
      type: "crisis";
      sessionId: string;
      crisisFlagged: boolean;
      flaggedAt: string;
    };

class ChatEventBus extends EventEmitter {
  constructor() {
    super();
    // Allow many concurrent room listeners without leak warnings
    this.setMaxListeners(200);
  }

  emitChatEvent(sessionId: string, event: ChatEvent) {
    this.emit(`session:${sessionId}`, event);
  }

  onChatEvent(sessionId: string, listener: (event: ChatEvent) => void) {
    const channel = `session:${sessionId}`;
    this.on(channel, listener);
    return () => {
      this.off(channel, listener);
    };
  }
}

const globalForEvents = globalThis as unknown as { chatEventBus?: ChatEventBus };
export const chatEventBus = globalForEvents.chatEventBus ?? new ChatEventBus();
if (process.env.NODE_ENV !== "production") globalForEvents.chatEventBus = chatEventBus;
