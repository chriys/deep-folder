import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "../stores";
import { useIngestPolling } from "../hooks/useIngestPolling";
import { ConfirmModal } from "../components/ConfirmModal";
import { easeOutExpo, fadeUp } from "../lib/motion";
import type { Folder } from "../types";

function ingestLabel(state: Folder["ingest_state"]): string {
  switch (state) {
    case "pending": return "Queued";
    case "running": return "Indexing";
    case "done": return "Ready";
    case "failed": return "Failed";
  }
}

function statusColor(state: Folder["ingest_state"]) {
  if (state === "failed") return "bg-red-100 text-red-700";
  if (state === "done") return "bg-emerald-100 text-emerald-700";
  if (state === "running") return "bg-violet-100 text-violet-700";
  return "bg-amber-100 text-amber-700";
}

export function FolderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { folders, createFolder, removeFolder, loadFolder } = useStore((s) => ({
    folders: s.folders,
    createFolder: s.createFolder,
    removeFolder: s.removeFolder,
    loadFolder: s.loadFolder,
  }));

  const folder = folders.find((f) => f.id === id);
  const [showDelete, setShowDelete] = useState(false);
  const [showSkipped, setShowSkipped] = useState(false);

  useIngestPolling(id ?? null);

  useEffect(() => {
    if (id && !folder) {
      loadFolder(id);
    }
  }, [id, folder, loadFolder]);

  const f = folder;

  if (!f) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-6 text-center">
        <motion.div initial="hidden" animate="show" variants={fadeUp}>
          <h2 className="mb-2 text-xl font-semibold tracking-tight text-gray-900">
            Folder not found
          </h2>
          <Link
            to="/folders"
            className="inline-flex items-center gap-1 text-sm font-medium text-violet-600 hover:text-violet-700"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Back to folders
          </Link>
        </motion.div>
      </div>
    );
  }

  const handleDelete = async () => {
    await removeFolder(f.id);
    navigate("/folders");
  };

  const handleRetry = async () => {
    await createFolder(f.drive_url);
    if (f.id) {
      await removeFolder(f.id);
    }
    navigate("/folders");
  };

  const inProgress = f.ingest_state === "pending" || f.ingest_state === "running";

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-8">
      <motion.div initial="hidden" animate="show" variants={fadeUp}>
        <Link
          to="/folders"
          className="mb-5 inline-flex items-center gap-1 text-sm font-medium text-gray-500 transition hover:text-gray-900"
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Back
        </Link>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm ring-1 ring-gray-50">
          <div className="mb-4 flex items-start gap-3">
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-md shadow-violet-200">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Folder
              </p>
              <p className="break-all text-sm text-gray-900">{f.drive_url}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {inProgress && (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-violet-200 border-t-violet-600" />
            )}
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusColor(f.ingest_state)}`}
            >
              {ingestLabel(f.ingest_state)}
            </span>
          </div>
        </div>

        {f.ingest_state === "failed" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: easeOutExpo }}
            className="mt-5 overflow-hidden rounded-2xl border border-red-200 bg-red-50/60 p-5 ring-1 ring-red-100/60"
          >
            <p className="mb-1 font-semibold text-red-900">Ingest failed</p>
            <p className="mb-4 text-sm text-red-700">
              {f.error_message ?? "An unknown error occurred during indexing."}
            </p>
            <div className="flex gap-3">
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={handleRetry}
                className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-violet-200/70 transition hover:opacity-90"
              >
                Try again
              </motion.button>
              <button
                onClick={() => setShowDelete(true)}
                className="rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100 active:scale-95"
              >
                Delete folder
              </button>
            </div>
          </motion.div>
        )}

        {f.ingest_state === "done" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05, ease: easeOutExpo }}
            className="mt-5 space-y-5"
          >
            <div className="grid grid-cols-2 gap-3">
              <Stat label="Files indexed" value={f.file_count} />
              <Stat
                label="Skipped"
                value={f.skipped_file_count}
                muted={f.skipped_file_count === 0}
              />
            </div>

            {f.skipped_file_count > 0 && (
              <div className="rounded-2xl border border-gray-100 bg-white p-5 ring-1 ring-gray-50">
                <button
                  onClick={() => setShowSkipped(!showSkipped)}
                  className="flex w-full items-center justify-between text-sm font-medium text-gray-700"
                >
                  <span className="flex items-center gap-2">
                    <motion.svg
                      animate={{ rotate: showSkipped ? 90 : 0 }}
                      transition={{ duration: 0.2, ease: easeOutExpo }}
                      className="h-3.5 w-3.5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </motion.svg>
                    Skipped files
                  </span>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-500">
                    {f.skipped_file_count}
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {showSkipped && (
                    <motion.div
                      key="skipped"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: easeOutExpo }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 space-y-1.5">
                        {(f as unknown as { skipped_files?: Array<{ id: string; name: string; skip_reason: string }> }).skipped_files?.map((sf) => (
                          <div
                            key={sf.id}
                            className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm"
                          >
                            <span className="truncate text-gray-700">{sf.name}</span>
                            <span className="ml-2 flex-shrink-0 text-[11px] text-gray-400">
                              {sf.skip_reason}
                            </span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            <button
              onClick={() => setShowDelete(true)}
              className="text-xs font-medium text-gray-400 transition hover:text-red-600"
            >
              Delete folder
            </button>
          </motion.div>
        )}

        {inProgress && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="mt-5 text-sm text-gray-500"
          >
            Waiting for ingest to complete…
          </motion.p>
        )}
      </motion.div>

      <ConfirmModal
        open={showDelete}
        title="Delete folder?"
        confirmLabel="Delete"
        destructive
        onConfirm={() => { setShowDelete(false); handleDelete(); }}
        onCancel={() => setShowDelete(false)}
      >
        <p>This will permanently delete the folder and all its data. This action cannot be undone.</p>
      </ConfirmModal>
    </div>
  );
}

function Stat({ label, value, muted = false }: { label: string; value: number; muted?: boolean }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 ring-1 ring-gray-50">
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
        {label}
      </p>
      <p className={`mt-1 text-2xl font-semibold tracking-tight ${muted ? "text-gray-300" : "text-gray-900"}`}>
        {value}
      </p>
    </div>
  );
}
