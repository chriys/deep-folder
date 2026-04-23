import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router";
import { motion } from "framer-motion";
import { useStore } from "../stores";
import { fetchFolders, fetchConversations, createConversation } from "../api";
import type { Conversation, Folder } from "../types";

export function Shell() {
  const sidebarOpen = useStore((s) => s.sidebarOpen);
  const toggleSidebar = useStore((s) => s.toggleSidebar);
  const activeFolderId = useStore((s) => s.activeFolderId);
  const setActiveFolder = useStore((s) => s.setActiveFolder);
  const setFoldersInStore = useStore((s) => s.setFolders);
  const activeConversation = useStore((s) => s.activeConversation);
  const setActiveConversation = useStore((s) => s.setActiveConversation);
  const navigate = useNavigate();

  const [folders, setFolders] = useState<Folder[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [foldersLoading, setFoldersLoading] = useState(true);
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
    fetchFolders()
      .then((data) => {
        setFolders(data);
        setFoldersInStore(data);
        if (data.length > 0 && !activeFolderId) {
          setActiveFolder(data[0].id);
        }
      })
      .finally(() => setFoldersLoading(false));
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
              <div className="py-2 text-sm text-gray-400" data-testid="folders-loading">Loading...</div>
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
              <div className="py-4 text-center text-sm text-gray-400" data-testid="conv-loading">
                Loading...
              </div>
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
        </div>
      </motion.aside>

      <main className="flex flex-1 flex-col overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
