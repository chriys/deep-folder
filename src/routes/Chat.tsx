import { useEffect, useCallback } from "react";
import { useParams } from "react-router";
import { useStore } from "../stores";
import { SkeletonChatThread } from "../components/Skeletons";
import { ErrorState } from "../components/States";

export function Chat() {
  const { convId } = useParams();
  const activeConversation = useStore((s) => s.activeConversation);
  const activeConversationLoading = useStore((s) => s.activeConversationLoading);
  const activeConversationError = useStore((s) => s.activeConversationError);
  const messages = useStore((s) => s.messages);
  const fetchConversation = useStore((s) => s.fetchConversation);

  useEffect(() => {
    if (convId) fetchConversation(convId);
  }, [convId, fetchConversation]);

  const handleRetry = useCallback(() => {
    if (convId) fetchConversation(convId);
  }, [convId, fetchConversation]);

  if (activeConversationLoading) return <SkeletonChatThread />;
  if (activeConversationError) return <ErrorState message={activeConversationError} onRetry={handleRetry} />;

  const hasMessages = messages.length > 0;

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-6">
        {!activeConversation ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <h2 className="mb-2 text-xl font-semibold text-gray-900">
              Conversation
            </h2>
            <p className="text-gray-500">Conversation ID: {convId}</p>
          </div>
        ) : !hasMessages ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <h2 className="mb-2 text-xl font-semibold text-gray-900">
              {activeConversation.title}
            </h2>
            <p className="text-gray-500">
              Ask anything about {activeConversation.folder_id}
            </p>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl space-y-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl p-4 ${
                    m.role === "user"
                      ? "rounded-br-sm bg-blue-600 text-white"
                      : "rounded-bl-sm bg-gray-100 text-gray-900"
                  }`}
                >
                  {m.content}
                  {m.citations.length > 0 && (
                    <div className="mt-2 border-t border-blue-400 pt-2 text-xs text-blue-200">
                      {m.citations.length} citation(s)
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
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
