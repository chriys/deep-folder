import { Navigate, Outlet } from "react-router";
import { useStore } from "../stores";

export function AuthGate() {
  const status = useStore((s) => s.status);

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <div data-testid="loading-spinner" className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
