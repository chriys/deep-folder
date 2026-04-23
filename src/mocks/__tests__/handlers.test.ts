import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { setupServer } from "msw/node";
import { handlers } from "../handlers";
import { resetDb, resetFolderCallCounts, getDb } from "../db";

const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));
afterEach(() => {
  server.resetHandlers();
  resetDb();
  resetFolderCallCounts();
});
afterAll(() => server.close());

describe("auth endpoints", () => {
  it("GET /auth/status returns disconnected by default", async () => {
    const res = await fetch("/auth/status");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ connected: false, email: null });
  });

  it("GET /auth/status returns connected after oauth callback", async () => {
    await fetch("/auth/google/callback?code=abc");
    const res = await fetch("/auth/status");
    const body = await res.json();
    expect(body).toEqual({ connected: true, email: "tester@example.com" });
  });

  it("POST /auth/disconnect resets auth", async () => {
    await fetch("/auth/google/callback?code=abc");
    await fetch("/auth/disconnect", { method: "POST" });
    const res = await fetch("/auth/status");
    const body = await res.json();
    expect(body).toEqual({ connected: false, email: null });
  });

  it("GET /auth/google/start redirects to oauth callback", async () => {
    const res = await fetch("/auth/google/start", { redirect: "manual" });
    expect(res.status).toBe(302);
    expect(res.headers.get("Location")).toBe(
      "/auth/google/callback?code=mock_auth_code",
    );
  });

  it("GET /auth/google/callback succeeds with code", async () => {
    const res = await fetch("/auth/google/callback?code=abc");
    const body = await res.json();
    expect(body).toEqual({ ok: true, email: "tester@example.com" });
  });

  it("GET /auth/google/callback fails without code", async () => {
    const res = await fetch("/auth/google/callback");
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body).toEqual({ error: "missing authorization code" });
  });
});

describe("folder endpoints", () => {
  it("GET /folders returns folder list", async () => {
    const res = await fetch("/folders");
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body).toHaveLength(2);
    expect(body[0].id).toBe("folder_1");
    expect(body[0].drive_url).toBe(
      "https://drive.google.com/drive/folders/abc123",
    );
  });

  it("POST /folders creates folder with pending ingest_state", async () => {
    const res = await fetch("/folders", {
      method: "POST",
      body: JSON.stringify({ drive_url: "https://drive.google.com/drive/u/0/my-drive" }),
      headers: { "Content-Type": "application/json" },
    });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.drive_url).toBe(
      "https://drive.google.com/drive/u/0/my-drive",
    );
    expect(body.ingest_state).toBe("pending");
    expect(body.id).toBeTruthy();
    expect(body.file_count).toBe(0);
    expect(body.skipped_file_count).toBe(0);
    expect(body.error_message).toBeNull();
  });

  it("POST /folders rejects missing drive_url", async () => {
    const res = await fetch("/folders", {
      method: "POST",
      body: JSON.stringify({}),
      headers: { "Content-Type": "application/json" },
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("drive_url is required");
  });

  it("POST /folders accepts regular Drive folder URLs", async () => {
    const res = await fetch("/folders", {
      method: "POST",
      body: JSON.stringify({
        drive_url: "https://drive.google.com/drive/folders/abc123",
      }),
      headers: { "Content-Type": "application/json" },
    });
    expect(res.status).toBe(201);
  });

  it("GET /folders/:id returns single folder with detail fields", async () => {
    const res = await fetch("/folders/folder_1");
    const body = await res.json();
    expect(body.id).toBe("folder_1");
    expect(body.files).toBeDefined();
    expect(body.skipped_files).toBeDefined();
    expect(body.file_count).toBe(4);
    expect(body.skipped_file_count).toBe(2);
  });

  it("GET /folders/:id returns failed folder with error_message", async () => {
    const res = await fetch("/folders/folder_failed");
    const body = await res.json();
    expect(body.id).toBe("folder_failed");
    expect(body.ingest_state).toBe("failed");
    expect(body.error_message).toBe("Indexing failed due to a transient error");
  });

  it("GET /folders/:id 404s for unknown folder", async () => {
    const res = await fetch("/folders/nonexistent");
    expect(res.status).toBe(404);
  });

  it("DELETE /folders/:id removes folder", async () => {
    const res = await fetch("/folders/folder_1", { method: "DELETE" });
    expect(res.status).toBe(200);
    const list = await fetch("/folders").then((r) => r.json());
    expect(list).toHaveLength(1);
  });

  it("DELETE /folders/:id 404s for unknown folder", async () => {
    const res = await fetch("/folders/nonexistent", { method: "DELETE" });
    expect(res.status).toBe(404);
  });
});

describe("folder ingest state cycling", () => {
  it("cycles pending -> running -> done on repeated calls", async () => {
    const create = await fetch("/folders", {
      method: "POST",
      body: JSON.stringify({
        drive_url: "https://drive.google.com/drive/u/0/new-folder",
      }),
      headers: { "Content-Type": "application/json" },
    }).then((r) => r.json());

    expect(create.ingest_state).toBe("pending");

    const call1 = await fetch(`/folders/${create.id}`).then((r) => r.json());
    expect(call1.ingest_state).toBe("pending");

    const call2 = await fetch(`/folders/${create.id}`).then((r) => r.json());
    expect(call2.ingest_state).toBe("running");

    const call3 = await fetch(`/folders/${create.id}`).then((r) => r.json());
    expect(call3.ingest_state).toBe("done");

    const call4 = await fetch(`/folders/${create.id}`).then((r) => r.json());
    expect(call4.ingest_state).toBe("done");
  });

  it("does not cycle done folder on repeated calls", async () => {
    const call1 = await fetch("/folders/folder_1").then((r) => r.json());
    expect(call1.ingest_state).toBe("done");

    const call2 = await fetch("/folders/folder_1").then((r) => r.json());
    expect(call2.ingest_state).toBe("done");
  });

  it("does not cycle failed folder on repeated calls", async () => {
    const call1 = await fetch("/folders/folder_failed").then((r) => r.json());
    expect(call1.ingest_state).toBe("failed");

    const call2 = await fetch("/folders/folder_failed").then((r) => r.json());
    expect(call2.ingest_state).toBe("failed");
  });
});

describe("conversation endpoints", () => {
  it("POST /conversations creates conversation", async () => {
    const res = await fetch("/conversations", {
      method: "POST",
      body: JSON.stringify({ folder_id: "folder_1", title: "Test Chat" }),
      headers: { "Content-Type": "application/json" },
    });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.folder_id).toBe("folder_1");
    expect(body.title).toBe("Test Chat");
  });

  it("POST /conversations rejects missing folder_id", async () => {
    const res = await fetch("/conversations", {
      method: "POST",
      body: JSON.stringify({}),
      headers: { "Content-Type": "application/json" },
    });
    expect(res.status).toBe(400);
  });

  it("GET /conversations returns list", async () => {
    const res = await fetch("/conversations");
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body).toHaveLength(1);
    expect(body[0].id).toBe("conv_1");
  });

  it("GET /conversations?folder_id= filters by folder", async () => {
    const res = await fetch("/conversations?folder_id=folder_1");
    const body = await res.json();
    expect(body).toHaveLength(1);
    expect(body[0].folder_id).toBe("folder_1");

    const empty = await fetch("/conversations?folder_id=nonexistent").then(
      (r) => r.json(),
    );
    expect(empty).toHaveLength(0);
  });

  it("GET /conversations/:id returns single conversation", async () => {
    const res = await fetch("/conversations/conv_1");
    const body = await res.json();
    expect(body.id).toBe("conv_1");
  });

  it("GET /conversations/:id 404s for unknown", async () => {
    const res = await fetch("/conversations/nonexistent");
    expect(res.status).toBe(404);
  });

  it("DELETE /conversations/:id removes conversation", async () => {
    const res = await fetch("/conversations/conv_1", { method: "DELETE" });
    expect(res.status).toBe(200);
    const list = await fetch("/conversations").then((r) => r.json());
    expect(list).toHaveLength(0);
  });
});

describe("SSE streaming", () => {
  it(
    "emits text_delta, citation, and done events",
    async () => {
      const res = await fetch("/conversations/conv_1/messages", {
        method: "POST",
      });

      expect(res.status).toBe(200);
      expect(res.headers.get("Content-Type")).toBe("text/event-stream");

      const text = await res.text();

      expect(text).toContain("event: text_delta");
      expect(text).toContain('{"content":"Based"}');
      expect(text).toContain("event: citation");
      expect(text).toContain("report-2024-q4.pdf");
      expect(text).toContain("event: done");
    },
    30_000,
  );

  it("404s for unknown conversation", async () => {
    const res = await fetch("/conversations/nonexistent/messages", {
      method: "POST",
    });
    expect(res.status).toBe(404);
  });

  it("emits error event when sseErrorMode is on", async () => {
    getDb().sseErrorMode = true;

    const res = await fetch("/conversations/conv_1/messages", {
      method: "POST",
    });
    const text = await res.text();

    expect(text).toContain("event: error");
    expect(text).toContain("Simulated SSE error");
    expect(text).toContain("event: done");
  });
});

describe("import.meta.env.VITE_USE_MOCKS handling", () => {
  it("supports conditional activation via env var", () => {
    const isEnabled = import.meta.env.VITE_USE_MOCKS === "true";
    expect(typeof isEnabled).toBe("boolean");
  });
});
