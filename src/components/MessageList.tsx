import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Message } from "../types";
import { MessageBubble } from "./MessageBubble";
import { easeOutExpo, fadeUp } from "../lib/motion";

interface MessageListProps {
  messages: Message[];
  onRetry?: (messageId: string) => void;
}

const SUGGESTIONS = [
  "Summarize the key takeaways across all files",
  "What deadlines or dates are mentioned?",
  "List action items and who owns each",
];

export function MessageList({ messages, onRetry }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="relative flex h-full flex-col items-center justify-center overflow-hidden px-6 text-center">
        <div className="pointer-events-none absolute -top-20 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-violet-300/25 blur-3xl" />
        <motion.div
          initial="hidden"
          animate="show"
          variants={fadeUp}
          className="relative z-10"
        >
          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-200">
            <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <h2 className="mb-1 text-2xl font-semibold tracking-tight text-gray-900">
            Conversation
          </h2>
          <p className="mb-7 text-sm text-gray-500">
            Ask anything about your folder
          </p>
          <div className="mx-auto grid w-full max-w-xl gap-2">
            {SUGGESTIONS.map((s, i) => (
              <motion.div
                key={s}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.35,
                  delay: 0.1 + i * 0.06,
                  ease: easeOutExpo,
                }}
                className="rounded-xl border border-gray-100 bg-white/70 px-4 py-2.5 text-left text-sm text-gray-600 ring-1 ring-gray-50 backdrop-blur"
              >
                <span className="mr-2 text-violet-500">›</span>
                {s}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-6 py-6">
      <AnimatePresence initial={false}>
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} onRetry={onRetry} />
        ))}
      </AnimatePresence>
      <div ref={bottomRef} />
    </div>
  );
}
