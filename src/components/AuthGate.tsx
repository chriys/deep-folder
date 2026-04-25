import { Navigate, Outlet } from "react-router";
import { motion } from "framer-motion";
import { useStore } from "../stores";
import { Logo } from "./Logo";
import { easeOutExpo } from "../lib/motion";

export function AuthGate() {
  const status = useStore((s) => s.status);

  if (status === "loading") {
    return (
      <div className="relative flex h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-white via-white to-violet-50/40">
        <div className="pointer-events-none absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-violet-300/30 blur-3xl" />
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: easeOutExpo }}
          className="relative flex flex-col items-center gap-5"
        >
          <Logo size="lg" withWordmark={false} />
          <div
            data-testid="loading-spinner"
            className="h-7 w-7 animate-spin rounded-full border-[3px] border-violet-200 border-t-violet-600"
          />
          <p className="text-xs font-medium uppercase tracking-widest text-gray-400">
            Preparing your workspace
          </p>
        </motion.div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
