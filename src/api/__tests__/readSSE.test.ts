import { describe, it, expect, vi } from "vitest";
import { readSSEStream } from "../readSSE";
import type { Citation } from "../../types";

function sseBody(...chunks: string[]): Response {
  const encoder = new TextEncoder();
  const body = chunks.join("");
  return new Response(encoder.encode(body), {
    headers: { "Content-Type": "text/event-stream" },
  });
}

describe("readSSEStream", () => {
  it("dispatches text_delta to its handler", async () => {
    const handler = vi.fn();
    const res = sseBody('event: text_delta\ndata: {"content":"Hello"}\n\n');

    await readSSEStream(res, { text_delta: handler });

    expect(handler).toHaveBeenCalledWith({ content: "Hello" });
  });

  it("dispatches citation to its handler", async () => {
    const citation: Citation = {
      file_id: "f1",
      file_name: "doc.pdf",
      primary_unit: { type: "page", value: "3" },
      quote: "important data",
      deep_link: "https://drive.google.com/doc",
    };
    const handler = vi.fn();
    const res = sseBody(
      `event: citation\ndata: ${JSON.stringify({ citation })}\n\n`,
    );

    await readSSEStream(res, { citation: handler });

    expect(handler).toHaveBeenCalledWith({ citation });
  });

  it("dispatches done to its handler", async () => {
    const handler = vi.fn();
    const res = sseBody('event: done\ndata: {}\n\n');

    await readSSEStream(res, { done: handler });

    expect(handler).toHaveBeenCalledWith({});
  });

  it("dispatches error to its handler", async () => {
    const handler = vi.fn();
    const res = sseBody(
      'event: error\ndata: {"type":"server_error","message":"oops"}\n\n',
    );

    await readSSEStream(res, { error: handler });

    expect(handler).toHaveBeenCalledWith({
      type: "server_error",
      message: "oops",
    });
  });

  it("handles multiple events in sequence", async () => {
    const textHandler = vi.fn();
    const doneHandler = vi.fn();
    const res = sseBody(
      'event: text_delta\ndata: {"content":"Hello"}\n\n' +
        'event: text_delta\ndata: {"content":" world"}\n\n' +
        'event: done\ndata: {}\n\n',
    );

    const status = await readSSEStream(res, {
      text_delta: textHandler,
      done: doneHandler,
    });

    expect(textHandler).toHaveBeenCalledTimes(2);
    expect(textHandler).toHaveBeenNthCalledWith(1, { content: "Hello" });
    expect(textHandler).toHaveBeenNthCalledWith(2, { content: " world" });
    expect(doneHandler).toHaveBeenCalledTimes(1);
    expect(status).toBe("done");
  });

  it("returns implicit_done when stream ends without done event", async () => {
    const handler = vi.fn();
    const res = sseBody('event: text_delta\ndata: {"content":"Hi"}\n\n');

    const status = await readSSEStream(res, { text_delta: handler });

    expect(status).toBe("implicit_done");
  });

  it("returns done when stream includes done event", async () => {
    const res = sseBody('event: done\ndata: {}\n\n');

    const status = await readSSEStream(res, {});

    expect(status).toBe("done");
  });

  it("ignores unknown event types", async () => {
    const handler = vi.fn();
    const res = sseBody(
      'event: text_delta\ndata: {"content":"A"}\n\n' +
        'event: unknown_event\ndata: {}\n\n' +
        'event: done\ndata: {}\n\n',
    );

    const status = await readSSEStream(res, {
      text_delta: handler,
      done: () => {},
    });

    expect(handler).toHaveBeenCalledTimes(1);
    expect(status).toBe("done");
  });

  it("resolves when a missing handler receives no dispatch", async () => {
    const res = sseBody('event: done\ndata: {}\n\n');

    const status = await readSSEStream(res, {});

    expect(status).toBe("done");
  });

  it("handles multiple data lines per event", async () => {
    const handler = vi.fn();
    const res = sseBody(
      'event: text_delta\ndata: {"content":"line1"}\ndata: {"content":"line2"}\n\n',
    );

    await readSSEStream(res, { text_delta: handler });

    expect(handler).toHaveBeenCalledTimes(2);
  });
});
