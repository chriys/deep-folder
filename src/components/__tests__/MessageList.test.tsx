import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MessageList } from "../MessageList";

describe("MessageList", () => {
  it("shows empty state when no messages", () => {
    render(<MessageList messages={[]} />);
    expect(screen.getByText("Conversation")).toBeTruthy();
    expect(screen.getByText("Ask anything about your folder")).toBeTruthy();
  });

  it("renders all messages", () => {
    const messages = [
      {
        id: "m1",
        role: "user" as const,
        content: "Hello",
        citations: [],
        tool_calls: [] as [],
      },
      {
        id: "m2",
        role: "assistant" as const,
        content: "Hi",
        citations: [],
        tool_calls: [] as [],
      },
    ];
    render(<MessageList messages={messages} />);
    expect(screen.getByText("Hello")).toBeTruthy();
    expect(screen.getByText("Hi")).toBeTruthy();
  });
});
