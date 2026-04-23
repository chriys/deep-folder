import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { Landing } from "../Landing";
import { useStore } from "../../stores";

const initialState = useStore.getState();

function createRouter(initialRoute = "/") {
  return createMemoryRouter(
    [{ path: "/", element: <Landing /> }],
    { initialEntries: [initialRoute] },
  );
}

describe("Landing", () => {
  beforeEach(() => useStore.setState(initialState));
  afterEach(cleanup);

  it("renders connect google button when unauthenticated", () => {
    useStore.getState().setStatus("unauthenticated");
    render(<RouterProvider router={createRouter()} />);
    expect(screen.getByTestId("connect-google")).toBeInTheDocument();
    expect(screen.getByText("Connect Google")).toBeInTheDocument();
  });

  it("shows error message from query param", () => {
    useStore.getState().setStatus("unauthenticated");
    render(
      <RouterProvider
        router={createRouter("/?error=Access+denied.+Not+allowlisted.")}
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
    expect(screen.getAllByText("Connected")[0]).toBeInTheDocument();
    expect(screen.queryByTestId("connect-google")).not.toBeInTheDocument();
  });
});
