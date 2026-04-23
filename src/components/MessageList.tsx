import { useEffect, useRef } from "react";
import type { Message } from "../types";
import { MessageBubble } from "./MessageBubble";

interface MessageListProps {
  messages: Message[];
  onRetry?: (messageId: string) => void;
}

export function MessageList({ messages, onRetry }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center">
        <h2 className="mb-2 text-xl font-semibold text-gray-900">
          Conversation
        </h2>
        <p className="text-gray-400">Ask anything about your folder</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-6">
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} onRetry={onRetry} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
