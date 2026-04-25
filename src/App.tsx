import { useEffect } from "react";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router";
import { AuthGate } from "./components/AuthGate";
import { Shell } from "./components/Shell";
import { Landing } from "./components/Landing";
import { AuthCallback } from "./routes/AuthCallback";
import { Folders } from "./routes/Folders";
import { FolderDetail } from "./routes/FolderDetail";
import { Chat } from "./routes/Chat";
import { useStore } from "./stores";
import { apiUrl } from "./api/client";

export function RootRedirect() {
  const status = useStore((s) => s.status);

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <div data-testid="loading-spinner" className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
      </div>
    );
  }

  if (status === "authenticated") {
    return <Navigate to="/folders" replace />;
  }

  return <Navigate to="/login" replace />;
}

const router = createBrowserRouter([
  { path: "/", element: <RootRedirect /> },
  { path: "/login", element: <Landing /> },
  { path: "/auth/callback", element: <AuthCallback /> },
  {
    element: <AuthGate />,
    children: [
      {
        element: <Shell />,
        children: [
          { path: "/folders", element: <Folders /> },
          { path: "/folders/:id", element: <FolderDetail /> },
          { path: "/chat/:convId", element: <Chat /> },
        ],
      },
    ],
  },
]);

function AppInner() {
  const setStatus = useStore((s) => s.setStatus);
  const setEmail = useStore((s) => s.setEmail);

  useEffect(() => {
    fetch(apiUrl("/auth/status"), { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) {
          setStatus("unauthenticated");
          return;
        }
        const data: { email: string; drive_connected: boolean } = await res.json();
        setEmail(data.email);
        setStatus("authenticated");
      })
      .catch(() => {
        setStatus("unauthenticated");
      });
  }, [setStatus, setEmail]);

  return <RouterProvider router={router} />;
}

export function App() {
  return <AppInner />;
}
