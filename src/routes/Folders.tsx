import { useState } from "react";
import { Link } from "react-router";
import { useStore } from "../stores";
import { useIngestPolling } from "../hooks/useIngestPolling";
import { ConfirmModal } from "../components/ConfirmModal";
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
    case "pending": return "Queued...";
    case "running": return "Indexing...";
    case "done": return "Done";
    case "failed": return "Failed";
  }
}

function FolderCard({ folder, onDelete }: { folder: Folder; onDelete: () => void }) {
  const [deleting, setDeleting] = useState(false);

  return (
    <div className={`relative rounded-lg border p-4 ${folder.ingest_state === "failed" ? "border-red-300 bg-red-50" : "border-gray-200 bg-white"}`}>
      <Link to={`/folders/${folder.id}`} className="block">
        <p className="mb-1 truncate pr-8 font-medium text-gray-900">{folder.drive_url}</p>
        <div className="flex items-center gap-2">
          {folder.ingest_state === "pending" || folder.ingest_state === "running" ? (
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          ) : folder.ingest_state === "failed" ? (
            <span className="inline-block h-4 w-4 rounded-full bg-red-500" />
          ) : (
            <span className="inline-block h-4 w-4 rounded-full bg-green-500" />
          )}
          <span className={`text-sm ${folder.ingest_state === "failed" ? "text-red-700 font-medium" : "text-gray-500"}`}>
            {ingestLabel(folder.ingest_state)}
            {folder.ingest_state === "done" && ` (${folder.file_count} files${folder.skipped_file_count > 0 ? `, ${folder.skipped_file_count} skipped` : ""})`}
          </span>
        </div>
        {folder.ingest_state === "failed" && folder.error_message && (
          <p className="mt-1 text-xs text-red-600">{folder.error_message}</p>
        )}
      </Link>
      <button
        onClick={(e) => { e.preventDefault(); setDeleting(true); }}
        className="absolute right-3 top-3 text-gray-400 hover:text-red-500"
        title="Delete folder"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
      </button>
      <ConfirmModal
        open={deleting}
        title="Delete folder?"
        confirmLabel="Delete"
        onConfirm={() => { setDeleting(false); onDelete(); }}
        onCancel={() => setDeleting(false)}
      >
        <p>This will permanently delete the folder and all its data. This action cannot be undone.</p>
      </ConfirmModal>
    </div>
  );
}

export function Folders() {
  const { folders, createFolder, removeFolder, foldersLoading } = useStore((s) => ({
    folders: s.folders,
    createFolder: s.createFolder,
    removeFolder: s.removeFolder,
    foldersLoading: s.foldersLoading,
  }));

  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const activeIngestFolder = folders.find((f) => f.ingest_state === "pending" || f.ingest_state === "running");
  useIngestPolling(activeIngestFolder?.id ?? null);

  const handleSubmit = async () => {
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

  if (folders.length === 0 && !foldersLoading) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center">
        <h2 className="mb-2 text-xl font-semibold text-gray-900">No folders yet</h2>
        <p className="mb-6 text-gray-500">Paste a Google Drive folder URL to start</p>
        <div className="w-full max-w-md">
          <div className="flex gap-2">
            <input
              type="text"
              value={url}
              onChange={(e) => { setUrl(e.target.value); setError(null); }}
              onKeyDown={(e) => e.key === "Enter" && !submitting && handleSubmit()}
              placeholder="https://drive.google.com/drive/folders/..."
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none disabled:opacity-50"
              disabled={submitting}
            />
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit"}
            </button>
          </div>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
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
    <div className="p-6">
      {showInput && (
        <div className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={url}
              onChange={(e) => { setUrl(e.target.value); setError(null); }}
              onKeyDown={(e) => e.key === "Enter" && !submitting && handleSubmit()}
              placeholder="https://drive.google.com/drive/folders/..."
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none disabled:opacity-50"
              disabled={submitting}
            />
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit"}
            </button>
          </div>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
      )}

      <ConfirmModal
        open={showConfirm}
        title="Large folder"
        onConfirm={handleConfirmed}
        onCancel={() => setShowConfirm(false)}
      >
        <p>This folder has more than 500 files. Indexing may take a while. Continue?</p>
      </ConfirmModal>

      {folders.length === 0 && foldersLoading ? (
        <div className="flex items-center justify-center py-12 text-gray-500">Loading folders...</div>
      ) : (
        <div className="space-y-3">
          {folders.map((f) => (
            <FolderCard key={f.id} folder={f} onDelete={() => handleDelete(f.id)} />
          ))}
        </div>
      )}
    </div>
  );
}
