import { describe, it, expect, beforeAll, afterEach, afterAll } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import { useStore } from "../../stores";
import { Shell } from "../Shell";

const MOCK_FOLDERS = [
  {
    id: "f1",
    drive_url: "https://drive.google.com/drive/folders/abc123",
    ingest_state: "done" as const,
    created_at: "2024-01-01",
  },
  {
    id: "f2",
    drive_url: "https://drive.google.com/drive/folders/def456",
    ingest_state: "running" as const,
    created_at: "2024-01-02",
  },
  {
    id: "f3",
    drive_url: "https://drive.google.com/drive/folders/ghi789",
    ingest_state: "failed" as const,
    created_at: "2024-01-03",
  },
];

const server = setupServer(
  http.get("/folders", () => HttpResponse.json(MOCK_FOLDERS)),
);

function TestContent() {
  return <div data-testid="outlet-content">Content</div>;
}

function createRouter(initialRoute = "/") {
  return createMemoryRouter(
    [
      {
        element: <Shell />,
        children: [
          { path: "/", element: <TestContent /> },
          { path: "/folders/:id", element: <TestContent /> },
        ],
      },
    ],
    { initialEntries: [initialRoute] },
  );
}

const initialState = useStore.getState();

describe("Shell sidebar", () => {
  beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));
  afterEach(() => {
    cleanup();
    server.resetHandlers();
    localStorage.clear();
    useStore.setState(initialState);
  });
  afterAll(() => server.close());

  it("shows user email and green dot when authenticated", () => {
    useStore.getState().setStatus("authenticated");
    useStore.getState().setEmail("user@example.com");

    const router = createMemoryRouter(
      [
        {
          element: <Shell />,
          children: [
            { path: "/folders", element: <div>Folders Content</div> },
          ],
        },
      ],
      { initialEntries: ["/folders"] },
    );

    render(<RouterProvider router={router} />);
    expect(screen.getAllByTestId("session-indicator")[0]).toBeInTheDocument();
    expect(screen.getAllByTestId("user-email")[0]).toHaveTextContent(
      "user@example.com",
    );
    expect(screen.getAllByTestId("status-dot")[0]).toBeInTheDocument();
  });

  it("renders disconnect button", () => {
    useStore.getState().setStatus("authenticated");
    useStore.getState().setEmail("user@example.com");

    const router = createMemoryRouter(
      [
        {
          element: <Shell />,
          children: [
            { path: "/folders", element: <div>Folders Content</div> },
          ],
        },
      ],
      { initialEntries: ["/folders"] },
    );

    render(<RouterProvider router={router} />);
    expect(screen.getAllByTestId("disconnect-button")[0]).toBeInTheDocument();
    expect(screen.getAllByTestId("disconnect-button")[0]).toHaveTextContent(
      "Disconnect",
    );
  });

  it("renders folder cards with correct state badges", async () => {
    render(<RouterProvider router={createRouter()} />);

    await waitFor(() => {
      expect(screen.getByTestId("folder-card-f1")).toBeInTheDocument();
    });

    expect(screen.getByTestId("folder-card-f1")).toBeInTheDocument();
    expect(screen.getByTestId("folder-card-f2")).toBeInTheDocument();
    expect(screen.getByTestId("folder-card-f3")).toBeInTheDocument();

    expect(screen.getByTestId("badge-f1")).toHaveTextContent("done");
    expect(screen.getByTestId("badge-f2")).toHaveTextContent("running");
    expect(screen.getByTestId("badge-f3")).toHaveTextContent("failed");
  });

  it("highlights active folder on matching route", async () => {
    render(<RouterProvider router={createRouter("/folders/f1")} />);

    await waitFor(() => {
      const card = screen.getByTestId("folder-card-f1");
      expect(card.className).toContain("bg-blue-100");
    });

    const card2 = screen.getByTestId("folder-card-f2");
    expect(card2.className).not.toContain("bg-blue-100");
  });

  it("sets active folder on click", async () => {
    render(<RouterProvider router={createRouter()} />);

    await waitFor(() => {
      expect(screen.getByTestId("folder-card-f1")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("folder-card-f1"));
    expect(useStore.getState().activeFolderId).toBe("f1");
  });

  it("cmd+b toggles sidebar", async () => {
    render(<RouterProvider router={createRouter()} />);

    expect(useStore.getState().sidebarOpen).toBe(true);

    fireEvent.keyDown(window, { metaKey: true, key: "b" });
    expect(useStore.getState().sidebarOpen).toBe(false);

    fireEvent.keyDown(window, { metaKey: true, key: "b" });
    expect(useStore.getState().sidebarOpen).toBe(true);
  });

  it("collapsed sidebar shows toggle affordance", () => {
    useStore.setState({ ...useStore.getState(), sidebarOpen: false });
    render(<RouterProvider router={createRouter()} />);

    expect(screen.getByTestId("sidebar-toggle-collapsed")).toBeInTheDocument();
  });

  it("toggle affordance reopens sidebar", () => {
    useStore.setState({ ...useStore.getState(), sidebarOpen: false });
    render(<RouterProvider router={createRouter()} />);

    fireEvent.click(screen.getByTestId("sidebar-toggle-collapsed"));
    expect(useStore.getState().sidebarOpen).toBe(true);
  });

  it("shows conversations section placeholder", async () => {
    render(<RouterProvider router={createRouter()} />);

    await waitFor(() => {
      expect(screen.getByText("Conversations")).toBeInTheDocument();
    });
  });

  it("persists sidebar state to localStorage", () => {
    const key = "df:sidebarOpen";

    expect(localStorage.getItem(key)).toBeNull();

    useStore.getState().toggleSidebar();
    expect(localStorage.getItem(key)).toBe("false");

    useStore.getState().toggleSidebar();
    expect(localStorage.getItem(key)).toBe("true");
  });
});
