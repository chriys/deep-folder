import { useSearchParams } from "react-router";
import { startGoogleAuth } from "../api/auth";
import { useStore } from "../stores";

export function Landing() {
  const status = useStore((s) => s.status);
  const [searchParams] = useSearchParams();
  const authError = searchParams.get("error");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="mx-auto max-w-md text-center">
        <h1 className="mb-4 text-4xl font-bold text-gray-900">Deep Folder</h1>
        <p className="mb-8 text-lg text-gray-600">
          Talk to your Google Drive folders
        </p>
        {authError && (
          <div
            data-testid="auth-error"
            className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {authError}
          </div>
        )}
        {status === "authenticated" ? (
          <p className="text-green-600">Connected</p>
        ) : (
          <button
            data-testid="connect-google"
            onClick={startGoogleAuth}
            className="rounded-lg bg-blue-600 px-6 py-3 text-white transition hover:bg-blue-700"
          >
            Connect Google
          </button>
        )}
      </div>
    </div>
  );
}
