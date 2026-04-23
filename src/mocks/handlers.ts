import { http, HttpResponse, delay } from "msw";
import { getDb, fakeId, nextIngestState, incrementFolderCallCount, getFolderCallCount } from "./db";

function sseEvent(event: string, data: Record<string, unknown>): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export const handlers = [
  // --- Auth ---
  http.get("/auth/status", () => {
    const { auth } = getDb();
    return HttpResponse.json({
      connected: auth.connected,
      email: auth.connected ? auth.email : null,
    });
  }),

  http.post("/auth/disconnect", () => {
    const db = getDb();
    db.auth.connected = false;
    db.auth.email = "";
    return HttpResponse.json({ ok: true });
  }),

  http.get("/auth/google/start", () => {
    const db = getDb();
    if (db.authAllowlistError) {
      return HttpResponse.json({ error: "Access denied. Your account is not allowlisted." }, { status: 403 });
    }
    return new HttpResponse(null, {
      status: 302,
      headers: { Location: "/auth/google/callback?code=mock_auth_code" },
    });
  }),

  http.get("/auth/google/callback", ({ request }: { request: Request }) => {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    if (!code) {
      return HttpResponse.json({ error: "missing authorization code" }, { status: 400 });
    }
    const db = getDb();
    db.auth.connected = true;
    db.auth.email = "tester@example.com";
    return HttpResponse.json({ ok: true, email: db.auth.email });
  }),

  // --- Folders ---
  http.post("/folders", async ({ request }: { request: Request }) => {
    const body = (await request.json()) as { drive_url?: string };
    if (!body?.drive_url) {
      return HttpResponse.json({ error: "drive_url is required" }, { status: 400 });
    }
    if (body.drive_url.includes("/folders/")) {
      return HttpResponse.json({ error: "Shared Drive URLs are not supported" }, { status: 400 });
    }
    const db = getDb();
    const folder = {
      id: `folder_${fakeId()}`,
      drive_url: body.drive_url,
      ingest_state: "pending" as const,
      created_at: new Date().toISOString(),
      files: [],
      skipped_files: [],
    };
    db.folders.push(folder);
    return HttpResponse.json(folder, { status: 201 });
  }),

  http.get("/folders", () => {
    const { folders } = getDb();
    return HttpResponse.json(folders);
  }),

  http.get<{ id: string }>("/folders/:id", ({ params }) => {
    const { folders } = getDb();
    const folder = folders.find((f) => f.id === params.id);
    if (!folder) {
      return HttpResponse.json({ error: "folder not found" }, { status: 404 });
    }
    const callCount = getFolderCallCount(folder.id);
    incrementFolderCallCount(folder.id);
    if (callCount > 0) {
      folder.ingest_state = nextIngestState(folder.ingest_state);
    }
    return HttpResponse.json(folder);
  }),

  http.delete<{ id: string }>("/folders/:id", ({ params }) => {
    const db = getDb();
    const idx = db.folders.findIndex((f) => f.id === params.id);
    if (idx === -1) {
      return HttpResponse.json({ error: "folder not found" }, { status: 404 });
    }
    db.folders.splice(idx, 1);
    return HttpResponse.json({ ok: true });
  }),

  // --- Conversations ---
  http.post("/conversations", async ({ request }: { request: Request }) => {
    const body = (await request.json()) as { folder_id?: string; title?: string };
    if (!body?.folder_id) {
      return HttpResponse.json({ error: "folder_id is required" }, { status: 400 });
    }
    const db = getDb();
    const conv = {
      id: `conv_${fakeId()}`,
      folder_id: body.folder_id,
      title: body.title ?? "New Conversation",
      created_at: new Date().toISOString(),
    };
    db.conversations.push({ ...conv, messageCount: 0 });
    return HttpResponse.json(conv, { status: 201 });
  }),

  http.get("/conversations", ({ request }: { request: Request }) => {
    const url = new URL(request.url);
    const folderId = url.searchParams.get("folder_id");
    const { conversations } = getDb();
    const filtered = folderId
      ? conversations.filter((c) => c.folder_id === folderId)
      : conversations;
    return HttpResponse.json(filtered);
  }),

  http.get<{ id: string }>("/conversations/:id", ({ params }) => {
    const { conversations } = getDb();
    const conv = conversations.find((c) => c.id === params.id);
    if (!conv) {
      return HttpResponse.json({ error: "conversation not found" }, { status: 404 });
    }
    return HttpResponse.json(conv);
  }),

  http.post<{ id: string }>("/conversations/:id/messages", async ({ params }) => {
    const { conversations, sseErrorMode } = getDb();
    const conv = conversations.find((c) => c.id === params.id);
    if (!conv) {
      return HttpResponse.json({ error: "conversation not found" }, { status: 404 });
    }
    conv.messageCount += 1;

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        if (sseErrorMode) {
          controller.enqueue(encoder.encode(sseEvent("error", { type: "server_error", message: "Simulated SSE error" })));
          controller.enqueue(encoder.encode(sseEvent("done", {})));
          controller.close();
          return;
        }

        const tokens = [
          "Based", " on", " the", " documents", " in", " your", " folder", ",",
          " the", " Q4", " revenue", " grew", " by", " 23%", " year-over-year", ".",
        ];
        for (const token of tokens) {
          await delay(30);
          controller.enqueue(encoder.encode(sseEvent("text_delta", { content: token })));
        }

        controller.enqueue(
          encoder.encode(
            sseEvent("citation", {
              citation: {
                file_id: "f1",
                file_name: "report-2024-q4.pdf",
                primary_unit: { type: "page", value: "12" },
                quote: "Q4 revenue grew 23% year-over-year to $4.2M",
                deep_link: "https://drive.google.com/open?id=drive_f1&page=12",
              },
            }),
          ),
        );

        controller.enqueue(encoder.encode(sseEvent("done", {})));
        controller.close();
      },
    });

    return new HttpResponse(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  }),

  http.delete<{ id: string }>("/conversations/:id", ({ params }) => {
    const db = getDb();
    const idx = db.conversations.findIndex((c) => c.id === params.id);
    if (idx === -1) {
      return HttpResponse.json({ error: "conversation not found" }, { status: 404 });
    }
    db.conversations.splice(idx, 1);
    return HttpResponse.json({ ok: true });
  }),
];
