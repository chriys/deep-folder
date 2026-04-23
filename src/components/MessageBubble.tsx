import type { Message } from "../types";

interface MessageBubbleProps {
  message: Message;
  onRetry?: (messageId: string) => void;
}

export function MessageBubble({ message, onRetry }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-lg px-4 py-2 ${
          isUser
            ? "bg-blue-600 text-white"
            : message.status === "error"
              ? "border border-red-300 bg-red-50 text-red-900"
              : "bg-gray-100 text-gray-900"
        }`}
      >
        {message.status === "pending" && !message.content ? (
          <span className="text-gray-400 italic">Thinking...</span>
        ) : (
          <>
            <p className="whitespace-pre-wrap">{message.content}</p>
            {message.citations.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {message.citations.map((c, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center rounded bg-white/80 px-2 py-0.5 text-xs text-gray-600"
                  >
                    {c.file_name}
                  </span>
                ))}
              </div>
            )}
          </>
        )}
        {message.status === "error" && message.error && (
          <div className="mt-2 border-t border-red-200 pt-2">
            <p className="text-sm text-red-700">{message.error}</p>
            {onRetry && (
              <button
                onClick={() => onRetry(message.id)}
                className="mt-1 rounded bg-red-200 px-3 py-1 text-sm text-red-800 transition hover:bg-red-300"
              >
                Retry
              </button>
            )}
          </div>
        )}
        {message.status === "streaming" && (
          <span className="ml-1 inline-block h-2 w-2 animate-pulse rounded-full bg-gray-400" />
        )}
      </div>
    </div>
  );
}
