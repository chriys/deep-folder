import { StateCreator } from "zustand";
import type { Message, Conversation, Citation } from "../types";
import { apiUrl } from "../api/client";

export type StreamStatus = "idle" | "streaming" | "done" | "error";

export interface ChatSlice {
  activeConversation: Conversation | null;
  messages: Message[];
  streamStatus: StreamStatus;
  streamingMessageId: string | null;
  conversations: Conversation[];
  conversationsLoading: boolean;
  conversationsError: string | null;
  activeConversationLoading: boolean;
  activeConversationError: string | null;
  setActiveConversation: (conversation: Conversation | null) => void;
  addMessage: (message: Message) => void;
  setMessages: (messages: Message[]) => void;
  appendStreamContent: (messageId: string, content: string) => void;
  appendStreamCitation: (messageId: string, citation: Citation) => void;
  finalizeMessage: (messageId: string) => void;
  setMessageError: (messageId: string, errorMessage: string) => void;
  removeMessage: (messageId: string) => void;
  resetStreamStatus: () => void;
  fetchConversations: () => Promise<void>;
  fetchConversation: (id: string) => Promise<void>;
}

export const createChatSlice: StateCreator<ChatSlice> = (set) => ({
  activeConversation: null,
  messages: [],
  streamStatus: "idle",
  streamingMessageId: null,
  conversations: [],
  conversationsLoading: false,
  conversationsError: null,
  activeConversationLoading: false,
  activeConversationError: null,
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
  fetchConversations: async () => {
    set({ conversationsLoading: true, conversationsError: null });
    try {
      const res = await fetch(apiUrl("/conversations"), { credentials: "include" });
      if (!res.ok) throw new Error(`Failed to load conversations (${res.status})`);
      const data = (await res.json()) as Conversation[];
      set({ conversations: data, conversationsLoading: false });
    } catch (e) {
      set({ conversationsError: (e as Error).message, conversationsLoading: false });
    }
  },
  fetchConversation: async (id: string) => {
    set({ activeConversationLoading: true, activeConversationError: null });
    try {
      const res = await fetch(apiUrl(`/conversations/${id}`), { credentials: "include" });
      if (!res.ok) throw new Error(`Failed to load conversation (${res.status})`);
      const data = (await res.json()) as Conversation;
      set({ activeConversation: data, activeConversationLoading: false });
    } catch (e) {
      set({ activeConversationError: (e as Error).message, activeConversationLoading: false });
    }
  },
});
