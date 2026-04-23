import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import { handlers } from "../../mocks/handlers";
import { resetDb } from "../../mocks/db";
import { AuthCallback } from "../AuthCallback";
import { useStore } from "../../stores";

const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));
afterEach(() => {
  server.resetHandlers();
  resetDb();
});
afterAll(() => server.close());

describe("AuthCallback", () => {
  it("calls API with code, sets authenticated and email", async () => {
    const router = createMemoryRouter(
      [
        { path: "/auth/callback", element: <AuthCallback /> },
        { path: "/folders", element: <div data-testid="folders">Folders</div> },
      ],
      { initialEntries: ["/auth/callback?code=abc"] },
    );
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(useStore.getState().status).toBe("authenticated");
      expect(useStore.getState().email).toBe("tester@example.com");
    });
  });

  it("redirects to landing with error when no code", async () => {
    const router = createMemoryRouter(
      [
        { path: "/auth/callback", element: <AuthCallback /> },
        { path: "/", element: <div data-testid="landing">Landing</div> },
      ],
      { initialEntries: ["/auth/callback"] },
    );
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(screen.getByTestId("landing")).toBeInTheDocument();
    });
  });

  it("redirects with error on 403 allowlist rejection", async () => {
    server.use(
      http.get("/auth/google/callback", () => {
        return HttpResponse.json(
          { error: "Access denied. Your account is not allowlisted." },
          { status: 403 },
        );
      }),
    );

    const router = createMemoryRouter(
      [
        { path: "/auth/callback", element: <AuthCallback /> },
        {
          path: "/",
          element: <div data-testid="landing-with-error">Landing With Error</div>,
        },
      ],
      { initialEntries: ["/auth/callback?code=abc"] },
    );
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(screen.getByTestId("landing-with-error")).toBeInTheDocument();
    });
  });

  it("redirects on API failure", async () => {
    server.use(
      http.get("/auth/google/callback", () => {
        return HttpResponse.json({ error: "server error" }, { status: 500 });
      }),
    );

    const router = createMemoryRouter(
      [
        { path: "/auth/callback", element: <AuthCallback /> },
        { path: "/", element: <div data-testid="landing">Landing</div> },
      ],
      { initialEntries: ["/auth/callback?code=abc"] },
    );
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(screen.getByTestId("landing")).toBeInTheDocument();
    });
  });
});
