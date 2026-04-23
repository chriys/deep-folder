import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router";
import { useStore } from "../../stores";
import { Shell } from "../Shell";

const defaultFolders = [
  {
    id: "folder_1",
    drive_url: "https://drive.google.com/drive/folders/abc123",
    ingest_state: "done" as const,
    created_at: "2026-04-20T10:00:00Z",
    file_count: 4,
    skipped_file_count: 2,
    error_message: null,
  },
  {
    id: "folder_failed",
    drive_url: "https://drive.google.com/drive/folders/failed123",
    ingest_state: "failed" as const,
    created_at: "2026-04-21T10:00:00Z",
    file_count: 0,
    skipped_file_count: 0,
    error_message: "Indexing failed due to a transient error",
  },
];

const defaultConversations = [
  { id: "conv_1", folder_id: "folder_1", title: "Q4 Report Questions", created_at: "2026-04-21T14:00:00Z", messageCount: 3 },
];

function mockFetchResponse(data: unknown) {
  return Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve(data),
  } as unknown as Response);
}

function defaultMockFetch(url: RequestInfo | URL): Promise<Response> {
  const urlStr = url.toString();
  if (urlStr.includes("/folders")) {
    return mockFetchResponse(defaultFolders);
  }
  if (urlStr.includes("/conversations")) {
    return mockFetchResponse(defaultConversations);
  }
  return mockFetchResponse({});
}

const initialState = useStore.getState();

function createRouter(initialRoute = "/folders") {
  return createMemoryRouter(
    [
      {
        element: <Shell />,
        children: [
          { path: "/folders", element: <div data-testid="shell-outlet">Outlet</div> },
          { path: "/chat/:convId", element: <div data-testid="chat-page">Chat</div> },
        ],
      },
    ],
    { initialEntries: [initialRoute] },
  );
}

describe("Shell sidebar", () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    useStore.setState(initialState);
    localStorage.clear();
    fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(defaultMockFetch);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("shows user email and green dot when authenticated", () => {
    useStore.getState().setStatus("authenticated");
    useStore.getState().setEmail("user@example.com");

    render(<RouterProvider router={createRouter("/folders")} />);
    expect(screen.getAllByTestId("session-indicator")[0]).toBeInTheDocument();
    expect(screen.getAllByTestId("user-email")[0]).toHaveTextContent(
      "user@example.com",
    );
    expect(screen.getAllByTestId("status-dot")[0]).toBeInTheDocument();
  });

  it("renders disconnect button", () => {
    useStore.getState().setStatus("authenticated");
    useStore.getState().setEmail("user@example.com");

    render(<RouterProvider router={createRouter("/folders")} />);
    expect(screen.getAllByTestId("disconnect-button")[0]).toBeInTheDocument();
    expect(screen.getAllByTestId("disconnect-button")[0]).toHaveTextContent(
      "Disconnect",
    );
  });

  it("loads and shows folders from API", async () => {
    render(<RouterProvider router={createRouter()} />);
    await screen.findByTestId("folder-folder_1");
    expect(screen.getByTestId("folder-folder_1")).toHaveTextContent("abc123");
  });

  it("selects first folder by default", async () => {
    render(<RouterProvider router={createRouter()} />);
    await screen.findByTestId("folder-folder_1");
    expect(screen.getByTestId("folder-folder_1").getAttribute("data-active")).toBe("true");
  });

  it("switching folder updates active state", async () => {
    const threeFolders = [
      ...defaultFolders,
      {
        id: "folder_2",
        drive_url: "https://drive.google.com/drive/u/0/my-drive",
        ingest_state: "done" as const,
        created_at: "2026-04-22T10:00:00Z",
        file_count: 0,
        skipped_file_count: 0,
        error_message: null,
      },
    ];

    fetchSpy.mockImplementation((url: RequestInfo | URL) => {
      const urlStr = url.toString();
      if (urlStr.includes("/folders")) {
        return mockFetchResponse(threeFolders);
      }
      if (urlStr.includes("/conversations")) {
        return mockFetchResponse([]);
      }
      return mockFetchResponse({});
    });

    render(<RouterProvider router={createRouter()} />);
    await screen.findByTestId("folder-folder_2");
    await userEvent.click(screen.getByTestId("folder-folder_2"));
    expect(screen.getByTestId("folder-folder_2").getAttribute("data-active")).toBe("true");
    expect(screen.getByTestId("folder-folder_1").getAttribute("data-active")).toBe("false");
  });

  it("shows conversations for active folder", async () => {
    render(<RouterProvider router={createRouter()} />);
    await screen.findByTestId("conv-conv_1");
    expect(screen.getByTestId("conv-conv_1")).toHaveTextContent("Q4 Report Questions");
  });

  it("shows empty state when no conversations", async () => {
    fetchSpy.mockImplementation((url: RequestInfo | URL) => {
      const urlStr = url.toString();
      if (urlStr.includes("/folders")) {
        return mockFetchResponse(defaultFolders);
      }
      if (urlStr.includes("/conversations")) {
        return mockFetchResponse([]);
      }
      return mockFetchResponse({});
    });

    render(<RouterProvider router={createRouter()} />);
    await screen.findByTestId("no-conversations");
    expect(screen.getByTestId("no-conversations")).toHaveTextContent("No conversations yet");
  });

  it("new conversation button disabled when no folders exist", async () => {
    fetchSpy.mockImplementation((url: RequestInfo | URL) => {
      if (url.toString().includes("/folders")) {
        return mockFetchResponse([]);
      }
      return mockFetchResponse({});
    });

    render(<RouterProvider router={createRouter()} />);
    await screen.findByTestId("new-conversation");
    expect(screen.getByTestId("new-conversation")).toBeDisabled();
  });

  it("clicking conversation navigates to chat page", async () => {
    render(<RouterProvider router={createRouter()} />);
    await screen.findByTestId("conv-conv_1");
    await userEvent.click(screen.getByTestId("conv-conv_1"));
    expect(screen.getByTestId("chat-page")).toBeInTheDocument();
  });

  it("cmd+b toggles sidebar", async () => {
    render(<RouterProvider router={createRouter()} />);

    expect(useStore.getState().sidebarOpen).toBe(true);

    await userEvent.keyboard("{Meta>}b{/Meta}");
    expect(useStore.getState().sidebarOpen).toBe(false);

    await userEvent.keyboard("{Meta>}b{/Meta}");
    expect(useStore.getState().sidebarOpen).toBe(true);
  });

  it("collapsed sidebar shows toggle affordance", () => {
    useStore.setState({ ...useStore.getState(), sidebarOpen: false });
    render(<RouterProvider router={createRouter()} />);

    expect(screen.getByTestId("sidebar-toggle-collapsed")).toBeInTheDocument();
  });

  it("toggle affordance reopens sidebar", async () => {
    useStore.setState({ ...useStore.getState(), sidebarOpen: false });
    render(<RouterProvider router={createRouter()} />);

    await userEvent.click(screen.getByTestId("sidebar-toggle-collapsed"));
    expect(useStore.getState().sidebarOpen).toBe(true);
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
