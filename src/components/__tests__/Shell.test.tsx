import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { Shell } from "../Shell";
import { useStore } from "../../stores";

const initialState = useStore.getState();

describe("Shell", () => {
  beforeEach(() => useStore.setState(initialState));
  afterEach(cleanup);

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
});
