import { useEffect } from "react";
import { Outlet } from "react-router";
import { motion } from "framer-motion";
import { useStore } from "../stores";

export function Shell() {
  const sidebarOpen = useStore((s) => s.sidebarOpen);
  const toggleSidebar = useStore((s) => s.toggleSidebar);

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
          <nav className="flex-1 overflow-y-auto p-4">
            <p className="text-sm text-gray-500">Folders</p>
          </nav>
        </div>
      </motion.aside>

      <main className="flex flex-1 flex-col overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
