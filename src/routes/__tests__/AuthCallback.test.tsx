import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { AuthCallback } from "../AuthCallback";
import { useStore } from "../../stores";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("AuthCallback", () => {
  it("calls API with code, sets authenticated and email", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ ok: true, email: "tester@example.com" }),
    } as unknown as Response);

    const router = createMemoryRouter(
      [
        { path: "/auth/callback", element: <AuthCallback /> },
        { path: "/", element: <div data-testid="root">Root</div> },
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
        { path: "/login", element: <div data-testid="landing">Landing</div> },
      ],
      { initialEntries: ["/auth/callback"] },
    );
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(screen.getByTestId("landing")).toBeInTheDocument();
    });
  });

  it("redirects with error on 403 allowlist rejection", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 403,
      json: () => Promise.resolve({ error: "Access denied. Your account is not allowlisted." }),
    } as unknown as Response);

    const router = createMemoryRouter(
      [
        { path: "/auth/callback", element: <AuthCallback /> },
        {
          path: "/login",
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
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ error: "server error" }),
    } as unknown as Response);

    const router = createMemoryRouter(
      [
        { path: "/auth/callback", element: <AuthCallback /> },
        { path: "/login", element: <div data-testid="landing">Landing</div> },
      ],
      { initialEntries: ["/auth/callback?code=abc"] },
    );
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(screen.getByTestId("landing")).toBeInTheDocument();
    });
  });

  it("redirects to / by default after successful auth", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ ok: true, email: "tester@example.com" }),
    } as unknown as Response);

    const router = createMemoryRouter(
      [
        { path: "/auth/callback", element: <AuthCallback /> },
        { path: "/", element: <div data-testid="root">Root</div> },
      ],
      { initialEntries: ["/auth/callback?code=abc"] },
    );
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(screen.getByTestId("root")).toBeInTheDocument();
    });
  });

  it("honours return_to param after successful auth", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ ok: true, email: "tester@example.com" }),
    } as unknown as Response);

    const router = createMemoryRouter(
      [
        { path: "/auth/callback", element: <AuthCallback /> },
        { path: "/folders", element: <div data-testid="folders">Folders</div> },
      ],
      { initialEntries: ["/auth/callback?code=abc&return_to=%2Ffolders"] },
    );
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(screen.getByTestId("folders")).toBeInTheDocument();
    });
  });
});
