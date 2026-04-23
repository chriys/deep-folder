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
});
