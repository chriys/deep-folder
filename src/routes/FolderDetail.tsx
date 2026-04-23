import { useEffect } from "react";
import { useParams, Link } from "react-router";
import { useStore } from "../stores";
import { SkeletonFolderDetail } from "../components/Skeletons";
import { ErrorState } from "../components/States";

export function FolderDetail() {
  const { id } = useParams();
  const activeFolderDetail = useStore((s) => s.activeFolderDetail);
  const folderDetailLoading = useStore((s) => s.folderDetailLoading);
  const folderDetailError = useStore((s) => s.folderDetailError);
  const fetchFolderDetail = useStore((s) => s.fetchFolderDetail);

  useEffect(() => {
    if (id) fetchFolderDetail(id);
  }, [id, fetchFolderDetail]);

  if (folderDetailLoading) return <SkeletonFolderDetail />;
  if (folderDetailError) return <ErrorState message={folderDetailError} onRetry={() => id && fetchFolderDetail(id)} />;

  if (!activeFolderDetail) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center">
        <h2 className="mb-2 text-xl font-semibold text-gray-900">
          Folder not found
        </h2>
        <Link
          to="/folders"
          className="text-blue-600 hover:text-blue-700"
        >
          Back to folders
        </Link>
      </div>
    );
  }

  const folder = activeFolderDetail;
  const files = folder.files ?? [];
  const skipped = folder.skipped_files ?? [];

  return (
    <div className="p-6">
      <Link
        to="/folders"
        className="mb-4 block text-sm text-blue-600 hover:text-blue-700"
      >
        &larr; Back
      </Link>
      <h2 className="mb-2 text-xl font-semibold text-gray-900">
        Folder Detail
      </h2>
      <p className="text-gray-600 break-all">{folder.drive_url}</p>
      <p className="mt-2 text-sm text-gray-500">
        Status: {folder.ingest_state}
      </p>

      <h3 className="mb-3 mt-6 font-semibold text-gray-900">
        Indexed Files ({files.length})
      </h3>
      {files.length === 0 ? (
        <p className="text-sm text-gray-400">No files indexed yet.</p>
      ) : (
        <div className="space-y-2">
          {files.map((f) => (
            <div
              key={f.id}
              className="rounded-lg border border-gray-200 p-3"
            >
              <p className="font-medium text-gray-900">{f.name}</p>
              <p className="text-xs text-gray-500">{f.mime_type}</p>
            </div>
          ))}
        </div>
      )}

      <h3 className="mb-3 mt-6 font-semibold text-gray-900">
        Skipped Files ({skipped.length})
      </h3>
      {skipped.length === 0 ? (
        <p className="text-sm text-gray-400">No skipped files.</p>
      ) : (
        <div className="space-y-2">
          {skipped.map((f) => (
            <div
              key={f.id}
              className="rounded-lg border border-yellow-200 bg-yellow-50 p-3"
            >
              <p className="font-medium text-gray-900">{f.name}</p>
              <p className="text-xs text-gray-500">{f.skip_reason}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
