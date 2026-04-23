import { describe, it, expect, beforeAll, afterAll, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { setupServer } from "msw/node";
import { handlers } from "../../mocks/handlers";
import { resetDb, getDb } from "../../mocks/db";
import { useStore } from "../../stores";
import { Chat } from "../Chat";

const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));
afterEach(() => {
  cleanup();
  server.resetHandlers();
  resetDb();
});
afterAll(() => server.close());

const initialState = useStore.getState();

function createRouter(initialRoute = "/chat/conv_1") {
  return createMemoryRouter(
    [
      { path: "/chat/:convId", element: <Chat /> },
    ],
    { initialEntries: [initialRoute] },
  );
}

describe("Chat route", () => {
  beforeEach(() => {
    useStore.setState(initialState);
    // Set up folders in store so Chat can find folder name
    useStore.getState().setFolders([
      {
        id: "folder_1",
        drive_url: "https://drive.google.com/drive/folders/abc123",
        ingest_state: "done",
        created_at: "2026-04-20T10:00:00Z",
      },
    ]);
  });

  it("shows loading state while fetching conversation", () => {
    render(<RouterProvider router={createRouter()} />);
    expect(screen.getByTestId("chat-loading")).toBeInTheDocument();
  });

  it("loads conversation and shows empty state with folder name", async () => {
    render(<RouterProvider router={createRouter()} />);
    await screen.findByTestId("empty-chat-prompt");
    expect(screen.getByTestId("empty-chat-prompt")).toHaveTextContent(
      "Ask anything about abc123",
    );
  });

  it("falls back to generic folder name when folder not in store", async () => {
    // Override default beforeEach folder setup by clearing folders
    useStore.getState().setFolders([]);

    render(<RouterProvider router={createRouter()} />);
    await screen.findByTestId("empty-chat-prompt");
    expect(screen.getByTestId("empty-chat-prompt")).toHaveTextContent(
      "Ask anything about your folder",
    );
  });

  it("shows conversation not found for invalid id", async () => {
    render(<RouterProvider router={createRouter("/chat/nonexistent")} />);
    await screen.findByText("Conversation not found");
    expect(screen.getByText("This conversation doesn't exist.")).toBeInTheDocument();
  });

  it("shows conversation title in empty state", async () => {
    render(<RouterProvider router={createRouter()} />);
    await screen.findByText("Q4 Report Questions");
    expect(screen.getByText("Q4 Report Questions")).toBeInTheDocument();
  });
});
