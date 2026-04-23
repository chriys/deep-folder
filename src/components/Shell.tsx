import { useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router";
import { motion } from "framer-motion";
import { useStore } from "../stores";
import type { IngestState } from "../types";

const BADGE_COLORS: Record<IngestState, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  running: "bg-blue-100 text-blue-800",
  done: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
};

function folderName(driveUrl: string): string {
  const parts = driveUrl.split("/");
  return parts[parts.length - 1] || driveUrl;
}

export function Shell() {
  const sidebarOpen = useStore((s) => s.sidebarOpen);
  const toggleSidebar = useStore((s) => s.toggleSidebar);
  const setSidebarOpen = useStore((s) => s.setSidebarOpen);
  const folders = useStore((s) => s.folders);
  const fetchFolders = useStore((s) => s.fetchFolders);
  const setActiveFolder = useStore((s) => s.setActiveFolder);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchFolders();
  }, [fetchFolders]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.metaKey && e.key === "b") {
        e.preventDefault();
        toggleSidebar();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar]);

  const isActive = (folderId: string) =>
    location.pathname === `/folders/${folderId}`;

  function handleFolderClick(id: string) {
    setActiveFolder(id);
    navigate(`/folders/${id}`);
  }

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <motion.aside
        animate={{ width: sidebarOpen ? 260 : 0 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="flex-shrink-0 overflow-hidden border-r border-gray-200 bg-gray-50"
      >
        <div className="flex h-full w-[260px] flex-col">
          <div className="flex h-14 items-center border-b border-gray-200 px-4">
            <h2 className="font-semibold text-gray-900">Deep Folder</h2>
          </div>

          <nav className="flex-1 overflow-y-auto p-3">
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-400">
              Folders
            </p>
            <div className="space-y-1">
              {folders.map((f) => (
                <button
                  key={f.id}
                  onClick={() => handleFolderClick(f.id)}
                  data-testid={`folder-card-${f.id}`}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition ${
                    isActive(f.id)
                      ? "bg-blue-100 text-blue-900"
                      : "text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <span className="truncate">{folderName(f.drive_url)}</span>
                  <span
                    data-testid={`badge-${f.id}`}
                    className={`ml-2 shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                      BADGE_COLORS[f.ingest_state]
                    }`}
                  >
                    {f.ingest_state}
                  </span>
                </button>
              ))}
            </div>
          </nav>

          <div className="border-t border-gray-200 p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
              Conversations
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Select a folder to view conversations
            </p>
          </div>
        </div>
      </motion.aside>

      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          data-testid="sidebar-toggle-collapsed"
          className="flex w-9 shrink-0 items-start justify-center border-r border-gray-200 bg-gray-50 pt-4 text-gray-400 hover:text-gray-600"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}

      <main className="flex flex-1 flex-col overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
