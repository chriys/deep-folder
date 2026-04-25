import { useState } from "react";
import { Link } from "react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "../stores";
import { useIngestPolling } from "../hooks/useIngestPolling";
import { ConfirmModal } from "../components/ConfirmModal";
import { easeOutExpo, fadeUp, listItem, popIn } from "../lib/motion";
import type { Folder } from "../types";

function isSharedDriveUrl(url: string): boolean {
  return /\/drive\/(?:shared(-drives?)?)\//i.test(url) || /\/shared-drives?\//i.test(url);
}

function looksLikeDriveUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return false;
  if (/^https?:\/\/drive\.google\.com\/.+/.test(trimmed)) return true;
  if (/^[a-zA-Z0-9_-]{10,}$/.test(trimmed)) return true;
  return false;
}

function ingestLabel(state: Folder["ingest_state"]): string {
  switch (state) {
    case "pending": return "Queued";
    case "running": return "Indexing";
    case "done": return "Ready";
    case "failed": return "Failed";
  }
}

function StatusPill({ state }: { state: Folder["ingest_state"] }) {
  const map = {
    pending: "bg-amber-100 text-amber-700",
    running: "bg-violet-100 text-violet-700",
    done: "bg-emerald-100 text-emerald-700",
    failed: "bg-red-100 text-red-700",
  } as const;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ${map[state]}`}>
      {state === "pending" || state === "running" ? (
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
      ) : state === "done" ? (
        <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
      )}
      {ingestLabel(state)}
    </span>
  );
}

function FolderCard({ folder, onDelete }: { folder: Folder; onDelete: () => void }) {
  const [deleting, setDeleting] = useState(false);
  const failed = folder.ingest_state === "failed";

  return (
    <motion.div
      variants={listItem}
      layout
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2, ease: easeOutExpo }}
      className={`group relative overflow-hidden rounded-2xl border bg-white p-5 ring-1 transition-shadow hover:shadow-lg hover:shadow-violet-100/60 ${
        failed
          ? "border-red-200 ring-red-100/60"
          : "border-gray-100 ring-gray-50"
      }`}
    >
      <Link to={`/folders/${folder.id}`} className="block">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-sm shadow-violet-200">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <p className="truncate font-medium text-gray-900">
              {folder.drive_url}
            </p>
          </div>
          <StatusPill state={folder.ingest_state} />
        </div>

        {folder.ingest_state === "done" && (
          <p className="text-xs text-gray-500">
            <span className="font-semibold text-gray-700">{folder.file_count}</span> files indexed
            {folder.skipped_file_count > 0 && (
              <>
                <span className="mx-1.5 text-gray-300">·</span>
                <span className="font-semibold text-gray-700">{folder.skipped_file_count}</span> skipped
              </>
            )}
          </p>
        )}

        {(folder.ingest_state === "pending" || folder.ingest_state === "running") && (
          <p className="text-xs text-gray-500">
            We're reading your files. This usually takes a minute.
          </p>
        )}

        {failed && folder.error_message && (
          <p className="text-xs text-red-600">{folder.error_message}</p>
        )}
      </Link>
      <button
        onClick={(e) => { e.preventDefault(); setDeleting(true); }}
        className="absolute right-3 top-3 rounded-md p-1.5 text-gray-300 opacity-0 transition group-hover:opacity-100 hover:bg-gray-100 hover:text-red-500 active:scale-95"
        title="Delete folder"
        aria-label="Delete folder"
      >
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
      <ConfirmModal
        open={deleting}
        title="Delete folder?"
        confirmLabel="Delete"
        destructive
        onConfirm={() => { setDeleting(false); onDelete(); }}
        onCancel={() => setDeleting(false)}
      >
        <p>This will permanently delete the folder and all its data. This action cannot be undone.</p>
      </ConfirmModal>
    </motion.div>
  );
}

function PasteInput({
  url,
  onChange,
  onSubmit,
  submitting,
  error,
  hero = false,
}: {
  url: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  submitting: boolean;
  error: string | null;
  hero?: boolean;
}) {
  return (
    <div className={hero ? "w-full max-w-xl" : "w-full"}>
      <div
        className={`flex items-center gap-2 rounded-2xl border bg-white p-1.5 shadow-sm ring-1 transition focus-within:border-violet-300 focus-within:ring-violet-200 ${
          error ? "border-red-200 ring-red-100" : "border-gray-200 ring-gray-100"
        }`}
      >
        <svg className="ml-2 h-4 w-4 flex-shrink-0 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
        <input
          type="text"
          value={url}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !submitting && onSubmit()}
          placeholder="https://drive.google.com/drive/folders/..."
          className="flex-1 bg-transparent px-1 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none disabled:opacity-50"
          disabled={submitting}
        />
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={onSubmit}
          disabled={submitting}
          className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-violet-200/80 transition hover:opacity-90 disabled:opacity-50"
        >
          {submitting && (
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          )}
          {submitting ? "Submitting" : "Index folder"}
        </motion.button>
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            key="err"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="mt-2 text-sm text-red-600"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Folders() {
  const folders = useStore((s) => s.folders);
  const createFolder = useStore((s) => s.createFolder);
  const removeFolder = useStore((s) => s.removeFolder);
  const foldersLoading = useStore((s) => s.foldersLoading);

  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const activeIngestFolder = folders.find(
    (f) => f.ingest_state === "pending" || f.ingest_state === "running",
  );
  useIngestPolling(activeIngestFolder?.id ?? null);

  const handleSubmit = () => {
    const trimmed = url.trim();
    if (!trimmed) { setError("Paste a Google Drive folder URL"); return; }
    if (!looksLikeDriveUrl(trimmed)) { setError("Not a valid Google Drive URL"); return; }
    if (isSharedDriveUrl(trimmed)) { setError("Shared Drives not yet supported"); return; }
    setError(null);
    setShowConfirm(true);
  };

  const handleConfirmed = async () => {
    setShowConfirm(false);
    setSubmitting(true);
    try {
      await createFolder(url.trim());
      setUrl("");
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create folder");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await removeFolder(id);
    } catch {
      setError("Failed to delete folder");
    }
  };

  const showInput = (() => {
    if (folders.length === 0) return true;
    if (folders.length === 1 && (folders[0].ingest_state === "pending" || folders[0].ingest_state === "running")) return false;
    return true;
  })();

  if (folders.length === 0 && foldersLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-violet-200 border-t-violet-600" />
          Loading folders...
        </div>
      </div>
    );
  }

  if (folders.length === 0 && !foldersLoading) {
    return (
      <div className="relative flex h-full flex-col items-center justify-center overflow-hidden px-6 text-center">
        <div className="pointer-events-none absolute -top-20 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-violet-300/30 blur-3xl" />
        <motion.div
          initial="hidden"
          animate="show"
          variants={fadeUp}
          className="relative z-10"
        >
          <span className="mb-5 inline-block rounded-full bg-violet-100 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-violet-700">
            Get started
          </span>
          <h2 className="mb-2 text-3xl font-semibold tracking-tight text-gray-900">
            No folders yet
          </h2>
          <p className="mb-8 max-w-md text-gray-500">
            Paste any Google Drive folder URL. We'll read every file and let you
            chat with the contents in seconds.
          </p>
          <div className="flex justify-center">
            <PasteInput
              url={url}
              onChange={(v) => { setUrl(v); setError(null); }}
              onSubmit={handleSubmit}
              submitting={submitting}
              error={error}
              hero
            />
          </div>
          <p className="mt-6 text-xs text-gray-400">
            Read-only access. Your files never leave Google's servers.
          </p>
        </motion.div>
        <ConfirmModal
          open={showConfirm}
          title="Large folder"
          onConfirm={handleConfirmed}
          onCancel={() => setShowConfirm(false)}
        >
          <p>This folder has more than 500 files. Indexing may take a while. Continue?</p>
        </ConfirmModal>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-8">
      <motion.div
        initial="hidden"
        animate="show"
        variants={fadeUp}
        className="mb-6"
      >
        <h1 className="mb-1 text-2xl font-semibold tracking-tight text-gray-900">
          Folders
        </h1>
        <p className="text-sm text-gray-500">
          Manage indexed Drive folders and start new conversations.
        </p>
      </motion.div>

      {showInput && (
        <motion.div
          variants={popIn}
          initial="hidden"
          animate="show"
          className="mb-6"
        >
          <PasteInput
            url={url}
            onChange={(v) => { setUrl(v); setError(null); }}
            onSubmit={handleSubmit}
            submitting={submitting}
            error={error}
          />
        </motion.div>
      )}

      <ConfirmModal
        open={showConfirm}
        title="Large folder"
        onConfirm={handleConfirmed}
        onCancel={() => setShowConfirm(false)}
      >
        <p>This folder has more than 500 files. Indexing may take a while. Continue?</p>
      </ConfirmModal>

      <motion.div
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.06 } } }}
        className="space-y-3"
      >
        <AnimatePresence initial={false}>
          {folders.map((f) => (
            <FolderCard key={f.id} folder={f} onDelete={() => handleDelete(f.id)} />
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
