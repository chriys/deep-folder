import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router";
import { useStore } from "../stores";
import { CitationPanel } from "../components/CitationPanel";

export function Chat() {
  const { convId } = useParams();
  const [input, setInput] = useState("");
  const messages = useStore((s) => s.messages);
  const streamState = useStore((s) => s.streamState);
  const addMessage = useStore((s) => s.addMessage);
  const setStreamState = useStore((s) => s.setStreamState);
  const appendToLastMessage = useStore((s) => s.appendToLastMessage);
  const addCitationToLastMessage = useStore((s) => s.addCitationToLastMessage);
  const closeCitationPanel = useStore((s) => s.closeCitationPanel);
  const openCitationPanel = useStore((s) => s.openCitationPanel);
  const citationMessageId = useStore((s) => s.activeCitationMessageId);
  const citationIndex = useStore((s) => s.activeCitationIndex);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!input.trim() || !convId || streamState === "streaming") return;

    closeCitationPanel();

    const userMsg = {
      id: `msg_${Date.now()}`,
      role: "user" as const,
      content: input.trim(),
      citations: [],
      tool_calls: [] as [],
    };
    const assistantId = `msg_${Date.now() + 1}`;
    const assistantMsg = {
      id: assistantId,
      role: "assistant" as const,
      content: "",
      citations: [],
      tool_calls: [] as [],
    };

    addMessage(userMsg);
    addMessage(assistantMsg);
    setInput("");
    setStreamState("streaming");

    try {
      const res = await fetch(`/conversations/${convId}/messages`, { method: "POST" });
      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        let eventType = "";
        for (const line of lines) {
          if (line.startsWith("event: ")) {
            eventType = line.slice(7).trim();
          } else if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (eventType === "text_delta") {
                appendToLastMessage(data.content);
              } else if (eventType === "citation") {
                addCitationToLastMessage(data.citation);
              }
            } catch {
              // skip malformed JSON
            }
          }
        }
      }
    } catch (err) {
      console.error("Stream failed:", err);
    } finally {
      setStreamState("idle");
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="relative flex-1 overflow-y-auto p-6">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <h2 className="mb-2 text-xl font-semibold text-gray-900">Conversation</h2>
            <p className="text-gray-500">Conversation ID: {convId}</p>
            <p className="mt-2 text-gray-400">Ask anything about your folder</p>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  {msg.citations.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {msg.citations.map((citation, i) => {
                        const isActive =
                          citationMessageId === msg.id && citationIndex === i;
                        return (
                          <button
                            key={i}
                            onClick={() => openCitationPanel(msg.id, i)}
                            className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-medium ${
                              isActive
                                ? "bg-blue-600 text-white"
                                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                            }`}
                            title={citation.file_name}
                          >
                            {i + 1}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 p-4">
        <div className="mx-auto flex max-w-3xl gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask a question..."
            disabled={streamState === "streaming"}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={streamState === "streaming" || !input.trim()}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {streamState === "streaming" ? "..." : "Send"}
          </button>
        </div>
      </div>

      <CitationPanel />
    </div>
  );
}
