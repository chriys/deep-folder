import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router";
import { motion } from "framer-motion";
import { disconnect as apiDisconnect } from "../api/auth";
import { useStore } from "../stores";
import { fetchConversations, createConversation } from "../api";
import { SkeletonFolderList, SkeletonConversationList } from "./Skeletons";
import type { Conversation } from "../types";

export function Shell() {
  const sidebarOpen = useStore((s) => s.sidebarOpen);
  const toggleSidebar = useStore((s) => s.toggleSidebar);
  const setSidebarOpen = useStore((s) => s.setSidebarOpen);
  const email = useStore((s) => s.email);
  const disconnect = useStore((s) => s.disconnect);
  const activeFolderId = useStore((s) => s.activeFolderId);
  const setActiveFolder = useStore((s) => s.setActiveFolder);
  const storeFetchFolders = useStore((s) => s.fetchFolders);
  const activeConversation = useStore((s) => s.activeConversation);
  const setActiveConversation = useStore((s) => s.setActiveConversation);
  const navigate = useNavigate();

  const folders = useStore((s) => s.folders);
  const foldersLoading = useStore((s) => s.foldersLoading);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [convLoading, setConvLoading] = useState(false);
  const [creating, setCreating] = useState(false);

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

  useEffect(() => {
    storeFetchFolders().then(() => {
      const { folders: loaded, activeFolderId: current, setActiveFolder: setActive } =
        useStore.getState();
      if (loaded.length > 0 && !current) {
        setActive(loaded[0].id);
      }
    });
  }, []);

  useEffect(() => {
    if (!activeFolderId) {
      setConversations([]);
      return;
    }
    setConvLoading(true);
    fetchConversations(activeFolderId)
      .then(setConversations)
      .finally(() => setConvLoading(false));
  }, [activeFolderId]);

  async function handleDisconnect() {
    await apiDisconnect();
    disconnect();
    navigate("/");
  }

  function handleFolderClick(id: string) {
    setActiveFolder(id);
  }

  async function handleNewConversation() {
    if (!activeFolderId || creating) return;
    setCreating(true);
    try {
      const conv = await createConversation(activeFolderId);
      setConversations((prev) => [conv, ...prev]);
      setActiveConversation(conv);
      navigate(`/chat/${conv.id}`);
    } finally {
      setCreating(false);
    }
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
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

          <div className="border-b border-gray-200 px-3 py-3">
            <p className="mb-1 text-xs font-medium uppercase text-gray-400">
              Folders
            </p>
            {foldersLoading ? (
              <SkeletonFolderList />
            ) : folders.length === 0 ? (
              <div className="py-2 text-sm text-gray-400" data-testid="no-folders">No folders yet</div>
            ) : (
              <div className="space-y-0.5">
                {folders.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => handleFolderClick(f.id)}
                    data-active={f.id === activeFolderId}
                    data-testid={`folder-${f.id}`}
                    className={`w-full rounded-md px-2 py-1.5 text-left text-sm transition ${
                      f.id === activeFolderId
                        ? "bg-blue-100 text-blue-700 font-medium"
                        : "text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {f.drive_url.split("/").pop() ?? f.drive_url}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-medium uppercase text-gray-400">
                Conversations
              </p>
              <button
                onClick={handleNewConversation}
                disabled={!activeFolderId || creating}
                data-testid="new-conversation"
                className="rounded px-1.5 py-0.5 text-xs font-medium text-blue-600 transition hover:bg-blue-100 disabled:opacity-40"
              >
                + New
              </button>
            </div>

            {convLoading ? (
              <SkeletonConversationList />
            ) : conversations.length === 0 ? (
              <div className="py-4 text-center text-sm text-gray-400" data-testid="no-conversations">
                No conversations yet
              </div>
            ) : (
              <div className="space-y-0.5">
                {conversations.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setActiveConversation(c);
                      navigate(`/chat/${c.id}`);
                    }}
                    data-active={c.id === activeConversation?.id}
                    data-testid={`conv-${c.id}`}
                    className={`w-full rounded-md px-2 py-2 text-left transition ${
                      c.id === activeConversation?.id
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <p className="truncate text-sm font-medium">{c.title}</p>
                    <p className="text-xs text-gray-400">{formatDate(c.created_at)}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center gap-2" data-testid="session-indicator">
              <span
                data-testid="status-dot"
                className="inline-block h-2 w-2 rounded-full bg-green-500"
              />
              <span className="truncate text-sm text-gray-700" data-testid="user-email">
                {email}
              </span>
            </div>
            <button
              data-testid="disconnect-button"
              onClick={handleDisconnect}
              className="mt-2 text-xs text-gray-400 underline transition hover:text-gray-600"
            >
              Disconnect
            </button>
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
