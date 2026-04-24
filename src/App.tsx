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

const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/folders" replace /> },
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
      .then((res) => res.json())
      .then((data: { connected: boolean; email: string | null }) => {
        if (data.connected) {
          setEmail(data.email);
          setStatus("authenticated");
        } else {
          setStatus("unauthenticated");
        }
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
