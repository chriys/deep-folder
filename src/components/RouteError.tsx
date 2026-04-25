import { Link, useRouteError, isRouteErrorResponse } from "react-router";
import { motion } from "framer-motion";
import { Logo } from "./Logo";
import { easeOutExpo } from "../lib/motion";

export function RouteError() {
  const error = useRouteError();

  let title = "Something went wrong";
  let detail = "An unexpected error occurred. Please try again.";

  if (isRouteErrorResponse(error)) {
    title = `${error.status} ${error.statusText}`;
    detail = typeof error.data === "string" ? error.data : detail;
  } else if (error instanceof Error) {
    detail = error.message;
  }

  return (
    <div className="relative flex h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-white via-white to-violet-50/40 px-6">
      <div className="pointer-events-none absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-violet-300/30 blur-3xl" />
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: easeOutExpo }}
        className="relative flex max-w-md flex-col items-center gap-5 text-center"
      >
        <Logo size="lg" withWordmark={false} />
        <div>
          <h1 className="mb-2 text-xl font-semibold tracking-tight text-gray-900">
            {title}
          </h1>
          <p className="text-sm text-gray-500">{detail}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => window.location.reload()}
            className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-violet-200/70 transition hover:opacity-90"
          >
            Reload
          </button>
          <Link
            to="/"
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Go home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
