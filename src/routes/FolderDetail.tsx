import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { useStore } from "../stores";
import { useIngestPolling } from "../hooks/useIngestPolling";
import { ConfirmModal } from "../components/ConfirmModal";
import type { Folder } from "../types";

function ingestLabel(state: Folder["ingest_state"]): string {
  switch (state) {
    case "pending": return "Queued...";
    case "running": return "Indexing...";
    case "done": return "Done";
    case "failed": return "Failed";
  }
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

  if (id && !folder) {
    loadFolder(id);
  }

  const f = folder;

  if (!f) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center">
        <h2 className="mb-2 text-xl font-semibold text-gray-900">Folder not found</h2>
        <Link to="/folders" className="text-blue-600 hover:text-blue-700">Back to folders</Link>
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

  return (
    <div className="p-6">
      <Link to="/folders" className="mb-4 block text-sm text-blue-600 hover:text-blue-700">
        &larr; Back
      </Link>

      <div className="mb-6">
        <h2 className="mb-1 text-xl font-semibold text-gray-900">Folder Detail</h2>
        <p className="mb-3 break-all text-gray-600">{f.drive_url}</p>

        <div className="flex items-center gap-2">
          {(f.ingest_state === "pending" || f.ingest_state === "running") && (
            <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          )}
          <span className={`text-sm font-medium ${f.ingest_state === "failed" ? "text-red-700" : f.ingest_state === "done" ? "text-green-700" : "text-blue-700"}`}>
            {ingestLabel(f.ingest_state)}
          </span>
        </div>
      </div>

      {f.ingest_state === "failed" && (
        <div className="mb-6 rounded-lg border border-red-300 bg-red-50 p-4">
          <p className="mb-2 font-medium text-red-800">Ingest failed</p>
          <p className="mb-3 text-sm text-red-600">{f.error_message ?? "An unknown error occurred during indexing."}</p>
          <div className="flex gap-3">
            <button onClick={handleRetry} className="rounded-md bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700">
              Try again
            </button>
            <button onClick={() => setShowDelete(true)} className="rounded-md border border-red-300 px-4 py-2 text-sm text-red-700 hover:bg-red-100">
              Delete folder
            </button>
          </div>
        </div>
      )}

      {f.ingest_state === "done" && (
        <>
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              <span className="font-medium">{f.file_count}</span> files indexed
              {f.skipped_file_count > 0 && (
                <span> &middot; <span className="font-medium">{f.skipped_file_count}</span> skipped</span>
              )}
            </p>
          </div>

          {f.skipped_file_count > 0 && (
            <div className="mb-6">
              <button
                onClick={() => setShowSkipped(!showSkipped)}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
              >
                <svg className={`h-3 w-3 transition-transform ${showSkipped ? "rotate-90" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                Skipped files ({f.skipped_file_count})
              </button>
              {showSkipped && (
                <div className="mt-2 space-y-1">
                  {(f as any).skipped_files?.map((sf: any) => (
                    <div key={sf.id} className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2 text-sm">
                      <span className="text-gray-700">{sf.name}</span>
                      <span className="text-xs text-gray-400">{sf.skip_reason}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <button
            onClick={() => setShowDelete(true)}
            className="text-sm text-red-600 hover:text-red-700"
          >
            Delete folder
          </button>
        </>
      )}

      {f.ingest_state !== "done" && f.ingest_state !== "failed" && (
        <p className="text-sm text-gray-400">Waiting for ingest to complete...</p>
      )}

      <ConfirmModal
        open={showDelete}
        title="Delete folder?"
        confirmLabel="Delete"
        onConfirm={() => { setShowDelete(false); handleDelete(); }}
        onCancel={() => setShowDelete(false)}
      >
        <p>This will permanently delete the folder and all its data. This action cannot be undone.</p>
      </ConfirmModal>
    </div>
  );
}
