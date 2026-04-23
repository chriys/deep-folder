import { describe, it, expect, beforeAll, afterAll, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router";
import { setupServer } from "msw/node";
import { handlers } from "../../mocks/handlers";
import { resetDb, getDb } from "../../mocks/db";
import { useStore } from "../../stores";
import { Shell } from "../Shell";

const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));
afterEach(() => {
  cleanup();
  server.resetHandlers();
  resetDb();
});
afterAll(() => server.close());

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
  beforeEach(() => {
    useStore.setState(initialState);
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
    getDb().folders.push({
      id: "folder_2",
      drive_url: "https://drive.google.com/drive/u/0/my-drive",
      ingest_state: "done",
      created_at: "2026-04-22T10:00:00Z",
      files: [],
      skipped_files: [],
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
    getDb().conversations = [];

    render(<RouterProvider router={createRouter()} />);
    await screen.findByTestId("no-conversations");
    expect(screen.getByTestId("no-conversations")).toHaveTextContent("No conversations yet");
  });

  it("new conversation button disabled when no folders exist", async () => {
    getDb().folders = [];

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

  it("toggle affordance reopens sidebar", () => {
    useStore.setState({ ...useStore.getState(), sidebarOpen: false });
    render(<RouterProvider router={createRouter()} />);

    userEvent.click(screen.getByTestId("sidebar-toggle-collapsed"));
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
