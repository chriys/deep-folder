import { motion } from "framer-motion";
import { useStore } from "../stores";
import { easeOutExpo } from "../lib/motion";
import type { Message } from "../types";

interface MessageBubbleProps {
  message: Message;
  onRetry?: (messageId: string) => void;
}

function Avatar() {
  return (
    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 text-[10px] font-bold text-white shadow-sm shadow-violet-200">
      DF
    </div>
  );
}

export function MessageBubble({ message, onRetry }: MessageBubbleProps) {
  const openCitationPanel = useStore((s) => s.openCitationPanel);
  const isUser = message.role === "user";
  const error = message.status === "error";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: easeOutExpo }}
      className={`flex items-start gap-3 ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && <Avatar />}
      <div className={`flex max-w-[78%] flex-col ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
            isUser
              ? "rounded-tr-md bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-violet-200/60"
              : error
                ? "rounded-tl-md border border-red-200 bg-red-50 text-red-900"
                : "rounded-tl-md border border-gray-100 bg-white text-gray-800 ring-1 ring-gray-50"
          }`}
        >
          {message.status === "pending" && !message.content ? (
            <>
              <span className="sr-only">Thinking...</span>
              <ThinkingDots />
            </>
          ) : (
            <>
              <p className="whitespace-pre-wrap">{message.content}</p>
              {message.status === "streaming" && (
                <motion.span
                  animate={{ opacity: [1, 0.2, 1] }}
                  transition={{ duration: 0.9, repeat: Infinity }}
                  className={`ml-1 inline-block h-3 w-0.5 animate-pulse rounded-full align-middle ${
                    isUser ? "bg-white/80" : "bg-violet-500"
                  }`}
                />
              )}
            </>
          )}
        </div>

        {message.citations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: easeOutExpo }}
            className="mt-1.5 flex flex-wrap gap-1"
          >
            {message.citations.map((c, i) => (
              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.94 }}
                key={i}
                onClick={() => openCitationPanel(message.id, i)}
                className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-violet-100 px-1.5 text-[10px] font-semibold text-violet-700 transition hover:bg-violet-200"
                title={c.file_name}
              >
                {i + 1}
              </motion.button>
            ))}
          </motion.div>
        )}

        {error && message.error && (
          <div className="mt-2 w-full rounded-xl border border-red-200 bg-red-50/70 p-3">
            <p className="text-xs text-red-700">{message.error}</p>
            {onRetry && (
              <button
                onClick={() => onRetry(message.id)}
                className="mt-2 rounded-lg bg-white px-3 py-1 text-xs font-medium text-red-700 ring-1 ring-red-200 transition hover:bg-red-100 active:scale-95"
              >
                Retry
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function ThinkingDots() {
  return (
    <div className="flex items-center gap-1 py-0.5">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          animate={{ opacity: [0.25, 1, 0.25], y: [0, -2, 0] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
          className="h-1.5 w-1.5 rounded-full bg-violet-400"
        />
      ))}
    </div>
  );
}
