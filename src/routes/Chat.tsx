import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useStore } from "../stores";
import { fetchConversation } from "../api";
import type { Conversation } from "../types";
export function Chat() {
  const { convId } = useParams();
  const folders = useStore((s) => s.folders);
  const messages = useStore((s) => s.messages);
  const activeConversation = useStore((s) => s.activeConversation);
  const setActiveConversation = useStore((s) => s.setActiveConversation);
  const setMessages = useStore((s) => s.setMessages);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!convId) return;
    setLoading(true);
    setError(false);
    fetchConversation(convId)
      .then((conv: Conversation) => {
        setActiveConversation(conv);
        setMessages([]);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [convId]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-gray-400" data-testid="chat-loading">Loading conversation...</p>
      </div>
    );
  }

  if (error || !activeConversation) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center">
        <h2 className="mb-2 text-xl font-semibold text-gray-900">
          Conversation not found
        </h2>
        <p className="text-gray-500">This conversation doesn't exist.</p>
      </div>
    );
  }

  const folder = folders.find((f) => f.id === activeConversation.folder_id);
  const folderName = folder
    ? (folder.drive_url.split("/").pop() ?? folder.drive_url)
    : "your folder";

  if (messages.length === 0) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex flex-1 flex-col items-center justify-center text-center px-6">
          <h2 className="mb-2 text-xl font-semibold text-gray-900">
            {activeConversation.title}
          </h2>
          <p className="text-gray-500" data-testid="empty-chat-prompt">
            Ask anything about {folderName}
          </p>
        </div>
        <div className="border-t border-gray-200 p-4">
          <div className="mx-auto flex max-w-3xl gap-2">
            <input
              type="text"
              placeholder="Ask a question..."
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
            />
            <button className="rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700">
              Send
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-3xl space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`rounded-lg p-4 ${
                m.role === "user"
                  ? "bg-blue-50 ml-12"
                  : "bg-gray-50 mr-12"
              }`}
            >
              <p className="text-sm font-medium text-gray-500 mb-1">
                {m.role === "user" ? "You" : "Assistant"}
              </p>
              <p className="text-gray-900 whitespace-pre-wrap">{m.content}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-gray-200 p-4">
        <div className="mx-auto flex max-w-3xl gap-2">
          <input
            type="text"
            placeholder="Ask a question..."
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
          />
          <button className="rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700">
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
