import { useEffect, useState } from "react";
import { Navigate, useSearchParams } from "react-router";
import { motion } from "framer-motion";
import { useStore } from "../stores";
import { apiUrl } from "../api/client";
import { Logo } from "../components/Logo";
import { easeOutExpo } from "../lib/motion";

export function AuthCallback() {
  const [searchParams] = useSearchParams();
  const setStatus = useStore((s) => s.setStatus);
  const setEmail = useStore((s) => s.setEmail);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

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
        setDone(true);
      })
      .catch(() => {
        setError("Network error during authentication");
      });
  }, [searchParams, setStatus, setEmail]);

  if (error) {
    return <Navigate to={`/login?error=${encodeURIComponent(error)}`} replace />;
  }

  if (done) {
    const returnTo = searchParams.get("return_to") ?? "/";
    return <Navigate to={returnTo} replace />;
  }

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
          data-testid="auth-callback-loading"
          className="h-7 w-7 animate-spin rounded-full border-[3px] border-violet-200 border-t-violet-600"
        />
        <p className="text-xs font-medium uppercase tracking-widest text-gray-400">
          Signing you in
        </p>
      </motion.div>
    </div>
  );
}
