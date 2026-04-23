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
  const res = await fetch("/auth/status");
  return res.json();
}

export function startGoogleAuth(): void {
  window.location.href = "/auth/google/start";
}

export async function handleAuthCallback(
  code: string,
): Promise<AuthCallbackResponse | AuthErrorResponse> {
  const res = await fetch(
    `/auth/google/callback?code=${encodeURIComponent(code)}`,
  );
  const body = await res.json();
  if (!res.ok) {
    return { error: body.error ?? "authentication failed", ...body };
  }
  return body;
}

export async function disconnect(): Promise<void> {
  await fetch("/auth/disconnect", { method: "POST" });
}
