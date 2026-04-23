import { createBrowserRouter, RouterProvider } from "react-router";
import { AuthGate } from "./components/AuthGate";
import { Shell } from "./components/Shell";
import { Landing } from "./components/Landing";
import { AuthCallback } from "./routes/AuthCallback";
import { Folders } from "./routes/Folders";
import { FolderDetail } from "./routes/FolderDetail";
import { Chat } from "./routes/Chat";

const router = createBrowserRouter([
  { path: "/", element: <Landing /> },
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

export function App() {
  return <RouterProvider router={router} />;
}
