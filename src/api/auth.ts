import { apiUrl } from "./client";

export interface AuthStatusResponse {
  connected: boolean;
  email: string | null;
}

export interface AuthCallbackResponse {
  ok: boolean;
  email: string;
}

export interface AuthErrorResponse {
  error: string;
}

export async function getAuthStatus(): Promise<AuthStatusResponse> {
  const res = await fetch(apiUrl("/auth/status"), { credentials: "include" });
  return res.json();
}

export function startGoogleAuth(returnTo = "/folders"): void {
  window.location.href = apiUrl(`/auth/google/start?return_to=${encodeURIComponent(returnTo)}`);
}

export async function handleAuthCallback(
  code: string,
): Promise<AuthCallbackResponse | AuthErrorResponse> {
  const res = await fetch(
    apiUrl(`/auth/google/callback?code=${encodeURIComponent(code)}`),
    { credentials: "include" },
  );
  const body = await res.json();
  if (!res.ok) {
    return { error: body.error ?? "authentication failed", ...body };
  }
  return body;
}

export async function disconnect(): Promise<void> {
  await fetch(apiUrl("/auth/disconnect"), {
    method: "POST",
    credentials: "include",
  });
}
