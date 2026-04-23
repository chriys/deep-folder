import { useEffect, useState } from "react";
import { Navigate, useSearchParams } from "react-router";
import { useStore } from "../stores";
import { apiUrl } from "../api/client";

export function AuthCallback() {
  const [searchParams] = useSearchParams();
  const setStatus = useStore((s) => s.setStatus);
  const setEmail = useStore((s) => s.setEmail);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) {
      setError("No authorization code provided");
      return;
    }

    fetch(apiUrl(`/auth/google/callback?code=${encodeURIComponent(code)}`), { credentials: "include" })
      .then(async (res) => {
        const body = await res.json();
        if (res.status === 403) {
          setError(body.error ?? "Access denied. Your account is not allowlisted.");
          return;
        }
        if (!res.ok) {
          setError(body.error ?? "Authentication failed");
          return;
        }
        setEmail(body.email);
        setStatus("authenticated");
      })
      .catch(() => {
        setError("Network error during authentication");
      });
  }, [searchParams, setStatus, setEmail]);

  if (error) {
    return <Navigate to={`/?error=${encodeURIComponent(error)}`} replace />;
  }

  return (
    <div className="flex h-screen items-center justify-center">
      <div
        data-testid="auth-callback-loading"
        className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"
      />
    </div>
  );
}
