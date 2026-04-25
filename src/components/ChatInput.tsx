import { type FormEvent, useState } from "react";
import { motion } from "framer-motion";

interface ChatInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  }

  const canSend = !disabled && value.trim().length > 0;

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-gray-100/80 bg-white/60 px-4 py-4 backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-3xl items-center gap-2">
        <div
          className={`flex flex-1 items-center gap-2 rounded-2xl border bg-white px-3 py-1 shadow-sm ring-1 transition ${
            focused
              ? "border-violet-300 ring-violet-200"
              : "border-gray-200 ring-gray-100"
          }`}
        >
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Ask a question..."
            disabled={disabled}
            className="flex-1 bg-transparent px-1 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none disabled:opacity-50"
          />
        </div>
        <motion.button
          type="submit"
          whileTap={{ scale: 0.96 }}
          disabled={!canSend}
          className={`flex flex-shrink-0 items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition ${
            canSend
              ? "bg-gradient-to-br from-violet-600 to-indigo-600 shadow-violet-200/70 hover:opacity-90"
              : "bg-gray-200 text-gray-400 shadow-none"
          }`}
        >
          Send
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 19V5" />
            <path d="M5 12l7-7 7 7" />
          </svg>
        </motion.button>
      </div>
    </form>
  );
}
