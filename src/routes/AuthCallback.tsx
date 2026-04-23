import { Navigate } from "react-router";
import { useStore } from "../stores";

export function AuthCallback() {
  const setStatus = useStore((s) => s.setStatus);

  // OAuth handler — set authenticated and redirect
  setStatus("authenticated");

  return <Navigate to="/folders" replace />;
}
