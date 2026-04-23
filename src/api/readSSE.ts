import type { Citation } from "../types";

export type SSEEventMap = {
  text_delta: { content: string };
  citation: { citation: Citation };
  done: Record<string, never>;
  error: { type: string; message: string };
};

export type SSEHandlers = {
  [K in keyof SSEEventMap]: (data: SSEEventMap[K]) => void;
};

export type SSEPartialHandlers = Partial<SSEHandlers>;

export type SSEStatus = "done" | "implicit_done" | "error";

export async function readSSEStream(
  response: Response,
  handlers: SSEPartialHandlers,
  signal?: AbortSignal,
): Promise<SSEStatus> {
  const contentType = response.headers.get("Content-Type") ?? "";
  if (!contentType.includes("text/event-stream")) {
    return "error";
  }

  const reader = response.body?.getReader();
  if (!reader) return "error";

  const decoder = new TextDecoder();
  let buffer = "";
  let currentEvent = "";
  let receivedDone = false;

  try {
    while (true) {
      if (signal?.aborted) return "error";

      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (line.startsWith("event: ")) {
          currentEvent = line.slice(7).trim();
        } else if (line.startsWith("data: ")) {
          const jsonStr = line.slice(6);
          try {
            const data = JSON.parse(jsonStr);
            const handler = handlers[currentEvent as keyof SSEHandlers];
            if (handler) {
              (handler as (data: unknown) => void)(data);
            }
            if (currentEvent === "done") {
              receivedDone = true;
            }
          } catch {
            // skip malformed JSON
          }
        }
      }
    }

    return receivedDone ? "done" : "implicit_done";
  } catch {
    return "error";
  }
}
