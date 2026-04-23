import { motion } from "framer-motion";
import { useStore } from "../stores";

export function CitationPanel() {
  const isOpen = useStore((s) => s.citationPanelOpen);
  const messageId = useStore((s) => s.activeCitationMessageId);
  const index = useStore((s) => s.activeCitationIndex);
  const closePanel = useStore((s) => s.closeCitationPanel);
  const messages = useStore((s) => s.messages);

  const citation =
    isOpen && messageId && index !== null
      ? messages.find((m) => m.id === messageId)?.citations[index]
      : undefined;

  if (!citation) return null;

  return (
    <motion.aside
      initial={{ x: 320 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="fixed right-0 top-0 z-50 h-full w-80 border-l border-gray-200 bg-white shadow-lg"
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <h3 className="font-semibold text-gray-900">Citation</h3>
          <button
            onClick={closePanel}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close citation panel"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium uppercase text-gray-500">File</p>
              <p className="text-sm text-gray-900" data-testid="citation-file-name">
                {citation.file_name}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-gray-500">Quote</p>
              <blockquote className="mt-1 border-l-2 border-blue-300 pl-3 text-sm italic text-gray-700">
                &ldquo;{citation.quote}&rdquo;
              </blockquote>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-gray-500">
                {citation.primary_unit.type === "page" ? "Page" : "Heading"}
              </p>
              <p className="text-sm text-gray-900" data-testid="citation-primary-value">
                {citation.primary_unit.value}
              </p>
            </div>
            <a
              href={citation.deep_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              Open in Drive
            </a>
          </div>
        </div>
      </div>
    </motion.aside>
  );
}
