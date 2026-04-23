import { Link } from "react-router";
import { useStore } from "../stores";
import { SkeletonFolderList } from "../components/Skeletons";
import { ErrorState } from "../components/States";

export function Folders() {
  const folders = useStore((s) => s.folders);
  const foldersLoading = useStore((s) => s.foldersLoading);
  const foldersError = useStore((s) => s.foldersError);
  const fetchFolders = useStore((s) => s.fetchFolders);

  if (foldersLoading && folders.length === 0) return <SkeletonFolderList />;
  if (foldersError) return <ErrorState message={foldersError} onRetry={fetchFolders} />;

  if (folders.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center">
        <h2 className="mb-2 text-xl font-semibold text-gray-900">
          No folders yet
        </h2>
        <p className="mb-6 text-gray-500">
          Paste a Google Drive folder URL to start
        </p>
        <input
          type="text"
          placeholder="https://drive.google.com/drive/folders/..."
          className="w-full max-w-md rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="mb-4 text-xl font-semibold text-gray-900">Folders</h2>
      <div className="space-y-2">
        {folders.map((f) => (
          <Link
            key={f.id}
            to={`/folders/${f.id}`}
            className="block rounded-lg border border-gray-200 p-4 transition hover:border-blue-300 hover:shadow-sm"
          >
            <p className="font-medium text-gray-900">{f.drive_url}</p>
            <p className="text-sm text-gray-500">State: {f.ingest_state}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
