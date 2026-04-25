import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "../stores";
import { easeOutExpo } from "../lib/motion";

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

  return (
    <AnimatePresence>
      {citation && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closePanel}
            className="fixed inset-0 z-40 bg-gray-900/10 backdrop-blur-[1px]"
          />
          <motion.aside
            key="panel"
            initial={{ x: 360, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 360, opacity: 0 }}
            transition={{ duration: 0.32, ease: easeOutExpo }}
            className="fixed right-0 top-0 z-50 flex h-full w-[360px] flex-col border-l border-gray-100 bg-white shadow-2xl ring-1 ring-gray-100"
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-violet-700">
                  Citation
                </span>
              </div>
              <button
                onClick={closePanel}
                className="rounded-md p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 active:scale-95"
                aria-label="Close citation panel"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              <div className="space-y-5">
                <Field label="File">
                  <p className="text-sm font-medium text-gray-900" data-testid="citation-file-name">
                    {citation.file_name}
                  </p>
                </Field>
                <Field label="Quote">
                  <blockquote className="rounded-xl border-l-2 border-violet-400 bg-violet-50/50 px-4 py-3 text-sm italic leading-relaxed text-gray-700">
                    &ldquo;{citation.quote}&rdquo;
                  </blockquote>
                </Field>
                <Field label={citation.primary_unit.type === "page" ? "Page" : "Heading"}>
                  <p className="text-sm text-gray-900" data-testid="citation-primary-value">
                    {citation.primary_unit.value}
                  </p>
                </Field>
                <motion.a
                  whileTap={{ scale: 0.97 }}
                  href={citation.deep_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-violet-200/70 transition hover:opacity-90"
                >
                  Open in Drive
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 17L17 7" />
                    <path d="M7 7h10v10" />
                  </svg>
                </motion.a>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400">
        {label}
      </p>
      {children}
    </div>
  );
}
