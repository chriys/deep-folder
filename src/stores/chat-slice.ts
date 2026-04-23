import { StateCreator } from "zustand";
import type { Message, Conversation, Citation } from "../types";

export type StreamState = "idle" | "streaming" | "error";

export interface ChatSlice {
  activeConversation: Conversation | null;
  messages: Message[];
  streamState: StreamState;
  citations: Citation[];
  setActiveConversation: (conversation: Conversation | null) => void;
  addMessage: (message: Message) => void;
  setMessages: (messages: Message[]) => void;
  setStreamState: (state: StreamState) => void;
  setCitations: (citations: Citation[]) => void;
}

export const createChatSlice: StateCreator<ChatSlice> = (set) => ({
  activeConversation: null,
  messages: [],
  streamState: "idle",
  citations: [],
  setActiveConversation: (conversation) => set({ activeConversation: conversation }),
  addMessage: (message) => set((s) => ({ messages: [...s.messages, message] })),
  setMessages: (messages) => set({ messages }),
  setStreamState: (streamState) => set({ streamState }),
  setCitations: (citations) => set({ citations }),
});
