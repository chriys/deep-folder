import { StateCreator } from "zustand";
import type { Message, Conversation, Citation } from "../types";

export type StreamStatus = "idle" | "streaming" | "done" | "error";

export interface ChatSlice {
  activeConversation: Conversation | null;
  messages: Message[];
  streamStatus: StreamStatus;
  streamingMessageId: string | null;
  setActiveConversation: (conversation: Conversation | null) => void;
  addMessage: (message: Message) => void;
  setMessages: (messages: Message[]) => void;
  appendStreamContent: (messageId: string, content: string) => void;
  appendStreamCitation: (messageId: string, citation: Citation) => void;
  finalizeMessage: (messageId: string) => void;
  setMessageError: (messageId: string, errorMessage: string) => void;
  removeMessage: (messageId: string) => void;
  resetStreamStatus: () => void;
}

export const createChatSlice: StateCreator<ChatSlice> = (set) => ({
  activeConversation: null,
  messages: [],
  streamStatus: "idle",
  streamingMessageId: null,
  setActiveConversation: (conversation) => set({ activeConversation: conversation }),
  addMessage: (message) => set((s) => ({ messages: [...s.messages, message] })),
  setMessages: (messages) => set({ messages }),
  appendStreamContent: (messageId, content) =>
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === messageId
          ? { ...m, content: m.content + content, status: "streaming" as const }
          : m,
      ),
    })),
  appendStreamCitation: (messageId, citation) =>
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === messageId
          ? { ...m, citations: [...m.citations, citation] }
          : m,
      ),
    })),
  finalizeMessage: (messageId) =>
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === messageId ? { ...m, status: "done" as const } : m,
      ),
      streamingMessageId: null,
      streamStatus: "idle",
    })),
  setMessageError: (messageId, errorMessage) =>
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === messageId
          ? { ...m, status: "error" as const, error: errorMessage }
          : m,
      ),
      streamingMessageId: null,
      streamStatus: "idle",
    })),
  removeMessage: (messageId) =>
    set((s) => ({
      messages: s.messages.filter((m) => m.id !== messageId),
    })),
  resetStreamStatus: () => set({ streamStatus: "idle", streamingMessageId: null }),
});
