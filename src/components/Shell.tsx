import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router";
import { motion } from "framer-motion";
import { disconnect as apiDisconnect } from "../api/auth";
import { useStore } from "../stores";

export function Shell() {
  const sidebarOpen = useStore((s) => s.sidebarOpen);
  const toggleSidebar = useStore((s) => s.toggleSidebar);
  const email = useStore((s) => s.email);
  const disconnect = useStore((s) => s.disconnect);
  const navigate = useNavigate();

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

  async function handleDisconnect() {
    await apiDisconnect();
    disconnect();
    navigate("/");
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
          <nav className="flex-1 overflow-y-auto p-4">
            <p className="text-sm text-gray-500">Folders</p>
          </nav>

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

      <main className="flex flex-1 flex-col overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
