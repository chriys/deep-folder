import { useEffect } from "react";
import { Link, Outlet } from "react-router";
import { motion } from "framer-motion";
import { useStore } from "../stores";
import { SkeletonFolderList, SkeletonConversationList } from "./Skeletons";
import { ErrorState } from "./States";

function SidebarFolderList() {
  const folders = useStore((s) => s.folders);
  const foldersLoading = useStore((s) => s.foldersLoading);
  const foldersError = useStore((s) => s.foldersError);
  const fetchFolders = useStore((s) => s.fetchFolders);

  if (foldersLoading) return <SkeletonFolderList />;
  if (foldersError) return <ErrorState message={foldersError} onRetry={fetchFolders} />;

  return (
    <div className="p-4">
      <Link to="/folders" className="mb-3 block text-sm font-semibold text-gray-900">
        Folders
      </Link>
      {folders.length === 0 ? (
        <p className="text-xs text-gray-400">No folders yet</p>
      ) : (
        <div className="space-y-1">
          {folders.map((f) => (
            <Link
              key={f.id}
              to={`/folders/${f.id}`}
              className="block truncate rounded px-2 py-1.5 text-sm text-gray-700 transition hover:bg-gray-200"
            >
              {f.drive_url.split("/").pop()}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function SidebarConversationList() {
  const conversations = useStore((s) => s.conversations);
  const conversationsLoading = useStore((s) => s.conversationsLoading);
  const conversationsError = useStore((s) => s.conversationsError);
  const fetchConversations = useStore((s) => s.fetchConversations);

  if (conversationsLoading) return <SkeletonConversationList />;
  if (conversationsError) return <ErrorState message={conversationsError} onRetry={fetchConversations} />;

  return (
    <div className="border-t border-gray-200 p-4">
      <p className="mb-3 text-sm font-semibold text-gray-900">Conversations</p>
      {conversations.length === 0 ? (
        <p className="text-xs text-gray-400">No conversations yet</p>
      ) : (
        <div className="space-y-1">
          {conversations.map((c) => (
            <Link
              key={c.id}
              to={`/chat/${c.id}`}
              className="block truncate rounded px-2 py-1.5 text-sm text-gray-700 transition hover:bg-gray-200"
            >
              {c.title}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function Shell() {
  const sidebarOpen = useStore((s) => s.sidebarOpen);
  const toggleSidebar = useStore((s) => s.toggleSidebar);
  const fetchFolders = useStore((s) => s.fetchFolders);
  const fetchConversations = useStore((s) => s.fetchConversations);

  useEffect(() => {
    fetchFolders();
    fetchConversations();
  }, [fetchFolders, fetchConversations]);

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
          <nav className="flex-1 overflow-y-auto">
            <SidebarFolderList />
            <SidebarConversationList />
          </nav>
        </div>
      </motion.aside>

      <main className="flex flex-1 flex-col overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
