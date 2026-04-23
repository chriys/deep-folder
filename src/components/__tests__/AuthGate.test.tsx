import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { useStore } from "../../stores";
import { AuthGate } from "../AuthGate";

const initialState = useStore.getState();

function createRouter(initialRoute = "/folders") {
  return createMemoryRouter(
    [
      {
        path: "/",
        element: <div data-testid="landing">Landing</div>,
      },
      {
        element: <AuthGate />,
        children: [
          {
            path: "/folders",
            element: <div data-testid="folders">Folders</div>,
          },
        ],
      },
    ],
    { initialEntries: [initialRoute] },
  );
}

describe("AuthGate", () => {
  beforeEach(() => useStore.setState(initialState));

  it("redirects to landing when unauthenticated", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);
    expect(screen.getByTestId("landing")).toBeInTheDocument();
    expect(screen.queryByTestId("folders")).not.toBeInTheDocument();
  });

  it("renders children when authenticated", () => {
    useStore.getState().setStatus("authenticated");
    const router = createRouter();
    render(<RouterProvider router={router} />);
    expect(screen.getByTestId("folders")).toBeInTheDocument();
  });

  it("shows loading spinner when loading", () => {
    useStore.getState().setStatus("loading");
    const router = createRouter();
    render(<RouterProvider router={router} />);
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
  });
});
