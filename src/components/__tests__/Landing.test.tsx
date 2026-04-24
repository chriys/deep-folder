import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { Landing } from "../Landing";
import { useStore } from "../../stores";

const initialState = useStore.getState();

function createRouter(initialRoute = "/login") {
  return createMemoryRouter(
    [{ path: "/login", element: <Landing /> }],
    { initialEntries: [initialRoute] },
  );
}

describe("Landing", () => {
  beforeEach(() => useStore.setState(initialState));
  afterEach(cleanup);

  it("renders connect google button when unauthenticated", () => {
    useStore.getState().setStatus("unauthenticated");
    render(<RouterProvider router={createRouter()} />);
    expect(screen.getByText("Sign up")).toBeInTheDocument();
    expect(screen.getByText("Log in")).toBeInTheDocument();
  });

  it("shows error message from query param", () => {
    useStore.getState().setStatus("unauthenticated");
    render(
      <RouterProvider
        router={createRouter("/login?error=Access+denied.+Not+allowlisted.")}
      />,
    );
    expect(screen.getByTestId("auth-error")).toBeInTheDocument();
    expect(screen.getByTestId("auth-error")).toHaveTextContent(
      "Access denied. Not allowlisted.",
    );
  });

  it("shows connected message when authenticated", () => {
    useStore.getState().setStatus("authenticated");
    render(<RouterProvider router={createRouter()} />);
    // Component returns null when authenticated (redirects to /folders)
    expect(screen.queryByText("Sign up")).not.toBeInTheDocument();
    expect(screen.queryByText("Log in")).not.toBeInTheDocument();
  });
});
