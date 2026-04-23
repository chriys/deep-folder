import { useParams, Link } from "react-router";
import { useStore } from "../stores";

export function FolderDetail() {
  const { id } = useParams();
  const folders = useStore((s) => s.folders);
  const folder = folders.find((f) => f.id === id);

  if (!folder) {
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
    </div>
  );
}
