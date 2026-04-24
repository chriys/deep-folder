import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { useStore } from "../../stores";
import { RootRedirect } from "../../App";

const initialState = useStore.getState();

function createRouter() {
  return createMemoryRouter(
    [
      { path: "/", element: <RootRedirect /> },
      { path: "/login", element: <div data-testid="login">Login</div> },
      { path: "/folders", element: <div data-testid="folders">Folders</div> },
    ],
    { initialEntries: ["/"] },
  );
}

describe("RootRedirect", () => {
  beforeEach(() => useStore.setState(initialState));

  it("shows spinner while loading", () => {
    useStore.getState().setStatus("loading");
    render(<RouterProvider router={createRouter()} />);
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
  });

  it("redirects authenticated users to /folders", () => {
    useStore.getState().setStatus("authenticated");
    render(<RouterProvider router={createRouter()} />);
    expect(screen.getByTestId("folders")).toBeInTheDocument();
  });

  it("redirects unauthenticated users to /login", () => {
    useStore.getState().setStatus("unauthenticated");
    render(<RouterProvider router={createRouter()} />);
    expect(screen.getByTestId("login")).toBeInTheDocument();
  });
});
