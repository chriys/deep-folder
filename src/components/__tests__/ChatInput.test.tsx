import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChatInput } from "../ChatInput";

describe("ChatInput", () => {
  it("calls onSend with trimmed content on submit", async () => {
    const onSend = vi.fn();
    render(<ChatInput onSend={onSend} />);
    const input = screen.getByPlaceholderText("Ask a question...");
    await userEvent.type(input, "  hello  ");
    await userEvent.click(screen.getByText("Send"));
    expect(onSend).toHaveBeenCalledWith("hello");
  });

  it("clears input after send", async () => {
    const onSend = vi.fn();
    render(<ChatInput onSend={onSend} />);
    const input = screen.getByPlaceholderText("Ask a question...") as HTMLInputElement;
    await userEvent.type(input, "hello");
    await userEvent.click(screen.getByText("Send"));
    expect(input.value).toBe("");
  });

  it("disables input and button when disabled is true", () => {
    render(<ChatInput onSend={() => {}} disabled={true} />);
    const input = screen.getByPlaceholderText("Ask a question...") as HTMLInputElement;
    const btn = screen.getByText("Send") as HTMLButtonElement;
    expect(input.disabled).toBe(true);
    expect(btn.disabled).toBe(true);
  });

  it("does not send empty content", async () => {
    const onSend = vi.fn();
    render(<ChatInput onSend={onSend} />);
    await userEvent.click(screen.getByText("Send"));
    expect(onSend).not.toHaveBeenCalled();
  });
});
