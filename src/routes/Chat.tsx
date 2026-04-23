import { useParams } from "react-router";

export function Chat() {
  const { convId } = useParams();

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex h-full flex-col items-center justify-center text-center">
          <h2 className="mb-2 text-xl font-semibold text-gray-900">
            Conversation
          </h2>
          <p className="text-gray-500">Conversation ID: {convId}</p>
          <p className="mt-2 text-gray-400">Ask anything about your folder</p>
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
