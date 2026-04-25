import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router";
import { AnimatePresence, motion } from "framer-motion";
import { disconnect as apiDisconnect } from "../api/auth";
import { useStore } from "../stores";
import { fetchConversations, createConversation } from "../api";
import { SkeletonFolderList, SkeletonConversationList } from "./Skeletons";
import { Logo } from "./Logo";
import { easeOutExpo, listItem } from "../lib/motion";
import type { Conversation } from "../types";

const SECTION_LABEL =
  "px-2 text-[10px] font-bold uppercase tracking-widest text-gray-400";

function FolderItem({
  label,
  active,
  onClick,
  testId,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  testId: string;
}) {
  return (
    <motion.button
      variants={listItem}
      onClick={onClick}
      data-active={active}
      data-testid={testId}
      whileTap={{ scale: 0.98 }}
      className={`group flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition ${
        active
          ? "bg-violet-100 text-violet-700 font-medium"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      }`}
    >
      <svg
        className={`h-3.5 w-3.5 flex-shrink-0 transition ${
          active ? "text-violet-600" : "text-gray-400 group-hover:text-gray-500"
        }`}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {active ? (
          <>
            <path d="M5 19a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4l2 3h9a2 2 0 0 1 2 2v1" />
            <path d="M3 15l4-4 4 4 4-5 4 4" />
            <path d="M21 19H3" />
          </>
        ) : (
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        )}
      </svg>
      <span className="truncate">{label}</span>
    </motion.button>
  );
}

function ConversationItem({
  title,
  date,
  active,
  onClick,
  testId,
}: {
  title: string;
  date: string;
  active: boolean;
  onClick: () => void;
  testId: string;
}) {
  return (
    <motion.button
      variants={listItem}
      onClick={onClick}
      data-active={active}
      data-testid={testId}
      whileTap={{ scale: 0.98 }}
      className={`block w-full rounded-lg px-2 py-2 text-left transition ${
        active
          ? "bg-violet-100 text-violet-700"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      }`}
    >
      <p className="truncate text-sm font-medium">{title}</p>
      <p
        className={`text-xs ${active ? "text-violet-500/80" : "text-gray-400"}`}
      >
        {date}
      </p>
    </motion.button>
  );
}

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
      const { folders, activeFolderId } = useStore.getState();
      if (folders.length > 0 && !activeFolderId) {
        setActiveFolder(folders[0].id);
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
    <div className="relative flex h-screen overflow-hidden bg-gradient-to-b from-white via-white to-violet-50/30">
      <div className="pointer-events-none absolute -top-32 right-1/4 h-64 w-64 rounded-full bg-violet-200/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 left-1/3 h-72 w-72 rounded-full bg-indigo-200/20 blur-3xl" />

      <motion.aside
        animate={{ width: sidebarOpen ? 264 : 0 }}
        transition={{ duration: 0.32, ease: easeOutExpo }}
        className="relative z-10 flex-shrink-0 overflow-hidden border-r border-gray-100/80 bg-white/70 backdrop-blur-xl"
      >
        <div className="flex h-full w-[264px] flex-col">
          <div className="flex h-14 items-center justify-between border-b border-gray-100/80 px-4">
            <Logo size="md" withWordmark />
            <button
              onClick={() => setSidebarOpen(false)}
              data-testid="sidebar-toggle-collapse"
              className="rounded-md p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 active:scale-95"
              title="Collapse sidebar (⌘B)"
              aria-label="Collapse sidebar"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 17l-5-5 5-5" />
                <path d="M18 17l-5-5 5-5" />
              </svg>
            </button>
          </div>

          <div className="border-b border-gray-100/80 px-3 py-3">
            <p className={`mb-2 ${SECTION_LABEL}`}>Folders</p>
            {foldersLoading ? (
              <SkeletonFolderList />
            ) : folders.length === 0 ? (
              <div
                className="px-2 py-2 text-sm text-gray-400"
                data-testid="no-folders"
              >
                No folders yet
              </div>
            ) : (
              <motion.div
                initial="hidden"
                animate="show"
                variants={{ show: { transition: { staggerChildren: 0.04 } } }}
                className="space-y-0.5"
              >
                {folders.map((f) => (
                  <FolderItem
                    key={f.id}
                    label={f.drive_url.split("/").pop() ?? f.drive_url}
                    active={f.id === activeFolderId}
                    onClick={() => setActiveFolder(f.id)}
                    testId={`folder-${f.id}`}
                  />
                ))}
              </motion.div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-3">
            <div className="mb-2 flex items-center justify-between">
              <p className={SECTION_LABEL}>Conversations</p>
              <button
                onClick={handleNewConversation}
                disabled={!activeFolderId || creating}
                data-testid="new-conversation"
                className="flex items-center gap-1 rounded-md bg-gradient-to-r from-violet-600 to-indigo-600 px-2 py-1 text-[11px] font-semibold text-white shadow-sm shadow-violet-200/60 transition hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:hover:opacity-40"
              >
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                New
              </button>
            </div>

            {convLoading ? (
              <SkeletonConversationList />
            ) : conversations.length === 0 ? (
              <div
                className="rounded-lg border border-dashed border-gray-200 bg-white/40 px-3 py-6 text-center text-sm text-gray-400"
                data-testid="no-conversations"
              >
                No conversations yet
              </div>
            ) : (
              <motion.div
                initial="hidden"
                animate="show"
                variants={{ show: { transition: { staggerChildren: 0.04 } } }}
                className="space-y-0.5"
              >
                <AnimatePresence initial={false}>
                  {conversations.map((c) => (
                    <ConversationItem
                      key={c.id}
                      title={c.title}
                      date={formatDate(c.created_at)}
                      active={c.id === activeConversation?.id}
                      onClick={() => {
                        setActiveConversation(c);
                        navigate(`/chat/${c.id}`);
                      }}
                      testId={`conv-${c.id}`}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>

          <div className="border-t border-gray-100/80 bg-white/40 p-4">
            <div
              className="flex items-center gap-2"
              data-testid="session-indicator"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span
                  data-testid="status-dot"
                  className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"
                />
              </span>
              <span
                className="truncate text-xs font-medium text-gray-700"
                data-testid="user-email"
              >
                {email}
              </span>
            </div>
            <button
              data-testid="disconnect-button"
              onClick={handleDisconnect}
              className="mt-2 text-[11px] font-medium text-gray-400 transition hover:text-gray-700"
            >
              Disconnect
            </button>
          </div>
        </div>
      </motion.aside>

      <AnimatePresence>
        {!sidebarOpen && (
          <motion.button
            key="collapsed-toggle"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.2, ease: easeOutExpo }}
            onClick={() => setSidebarOpen(true)}
            data-testid="sidebar-toggle-collapsed"
            className="relative z-10 flex w-10 shrink-0 items-start justify-center border-r border-gray-100/80 bg-white/70 pt-4 text-gray-400 backdrop-blur-xl transition hover:text-gray-700"
            title="Expand sidebar (⌘B)"
            aria-label="Expand sidebar"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 17l5-5-5-5" />
              <path d="M6 17l5-5-5-5" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>

      <main className="relative z-0 flex flex-1 flex-col overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
