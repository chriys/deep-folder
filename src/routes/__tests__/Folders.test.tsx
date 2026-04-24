import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { useStore } from "../../stores";
import { Shell } from "../../components/Shell";
import { Folders } from "../Folders";

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
];

function mockFetchResponse(data: unknown) {
  return Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve(data),
  } as unknown as Response);
}

const initialState = useStore.getState();

function createRouter() {
  return createMemoryRouter(
    [
      {
        element: <Shell />,
        children: [{ path: "/folders", element: <Folders /> }],
      },
    ],
    { initialEntries: ["/folders"] },
  );
}

describe("Folders route", () => {
  beforeEach(() => {
    useStore.setState(initialState);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("shows loading indicator while fetching, not the empty state input", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation((url) => {
      if (url.toString().includes("/folders")) {
        return new Promise(() => {}); // never resolves — keeps loading
      }
      return mockFetchResponse({});
    });

    render(<RouterProvider router={createRouter()} />);

    // Effect fires async; wait for loading state to appear
    expect(await screen.findByText("Loading folders...")).toBeInTheDocument();
    expect(
      screen.queryByPlaceholderText("https://drive.google.com/drive/folders/..."),
    ).not.toBeInTheDocument();
  });

  it("shows empty state with input when no folders", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation((url) => {
      if (url.toString().includes("/folders")) {
        return mockFetchResponse([]);
      }
      return mockFetchResponse({});
    });

    render(<RouterProvider router={createRouter()} />);

    expect(
      await screen.findByPlaceholderText("https://drive.google.com/drive/folders/..."),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /no folders yet/i })).toBeInTheDocument();
  });

  it("shows folder cards when folders exist", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation((url) => {
      if (url.toString().includes("/conversations")) {
        return mockFetchResponse([]);
      }
      if (url.toString().includes("/folders/")) {
        return mockFetchResponse(defaultFolders[0]);
      }
      if (url.toString().includes("/folders")) {
        return mockFetchResponse(defaultFolders);
      }
      return mockFetchResponse({});
    });

    render(<RouterProvider router={createRouter()} />);

    expect(await screen.findByText("abc123")).toBeInTheDocument();
    expect(screen.queryByText(/no folders yet/i)).not.toBeInTheDocument();
  });
});
