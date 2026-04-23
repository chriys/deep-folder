import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MessageBubble } from "../MessageBubble";

describe("MessageBubble", () => {
  it("renders user message right-aligned", () => {
    const msg = {
      id: "m1",
      role: "user" as const,
      content: "Hello",
      citations: [],
      tool_calls: [] as [],
    };
    const { container } = render(<MessageBubble message={msg} />);
    expect(container.firstElementChild!.className).toContain("justify-end");
    expect(screen.getByText("Hello")).toBeTruthy();
  });

  it("renders assistant message left-aligned", () => {
    const msg = {
      id: "m1",
      role: "assistant" as const,
      content: "Hi there",
      citations: [],
      tool_calls: [] as [],
    };
    const { container } = render(<MessageBubble message={msg} />);
    expect(container.firstElementChild!.className).toContain("justify-start");
    expect(screen.getByText("Hi there")).toBeTruthy();
  });

  it("shows pending state for empty pending message", () => {
    const msg = {
      id: "m1",
      role: "assistant" as const,
      content: "",
      citations: [],
      tool_calls: [] as [],
      status: "pending" as const,
    };
    render(<MessageBubble message={msg} />);
    expect(screen.getByText("Thinking...")).toBeTruthy();
  });

  it("shows error message and retry button", async () => {
    const onRetry = vi.fn();
    const msg = {
      id: "m1",
      role: "assistant" as const,
      content: "partial",
      citations: [],
      tool_calls: [] as [],
      status: "error" as const,
      error: "Connection lost",
    };
    render(<MessageBubble message={msg} onRetry={onRetry} />);
    expect(screen.getByText("Connection lost")).toBeTruthy();
    const btn = screen.getByText("Retry");
    await userEvent.click(btn);
    expect(onRetry).toHaveBeenCalledWith("m1");
  });

  it("displays citations", () => {
    const msg = {
      id: "m1",
      role: "assistant" as const,
      content: "Answer",
      citations: [
        {
          file_id: "f1",
          file_name: "doc.pdf",
          primary_unit: { type: "page" as const, value: "3" },
          quote: "data",
          deep_link: "https://drive.google.com/doc",
        },
      ],
      tool_calls: [] as [],
    };
    render(<MessageBubble message={msg} />);
    expect(screen.getByText("doc.pdf")).toBeTruthy();
  });

  it("shows streaming indicator for streaming message", () => {
    const msg = {
      id: "m1",
      role: "assistant" as const,
      content: "partial text",
      citations: [],
      tool_calls: [] as [],
      status: "streaming" as const,
    };
    const { container } = render(<MessageBubble message={msg} />);
    expect(screen.getByText("partial text")).toBeTruthy();
    expect(container.querySelector(".animate-pulse")).toBeTruthy();
  });
});
