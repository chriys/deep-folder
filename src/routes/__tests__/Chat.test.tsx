import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router";
import { useStore } from "../../stores";
import { Chat } from "../Chat";

const initialState = useStore.getState();

afterEach(() => {
  cleanup();
  useStore.setState(initialState);
});

function renderChat() {
  const router = createMemoryRouter(
    [{ path: "/chat/:convId", element: <Chat /> }],
    { initialEntries: ["/chat/conv_1"] },
  );
  return render(<RouterProvider router={router} />);
}

const citation = {
  file_id: "f1",
  file_name: "report-2024-q4.pdf",
  primary_unit: { type: "page" as const, value: "12" },
  quote: "Q4 revenue grew 23% year-over-year to $4.2M",
  deep_link: "https://drive.google.com/open?id=drive_f1&page=12",
};

describe("Chat", () => {
  it("shows empty state when no messages", () => {
    renderChat();
    expect(screen.getByText("Ask anything about your folder")).toBeInTheDocument();
  });

  it("renders input and send button", () => {
    renderChat();
    expect(screen.getByPlaceholderText("Ask a question...")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send/i })).toBeInTheDocument();
  });

  it("displays messages from store", () => {
    useStore.getState().addMessage({
      id: "u1", role: "user", content: "What was Q4 revenue?", citations: [], tool_calls: [],
    });
    useStore.getState().addMessage({
      id: "a1", role: "assistant", content: "Revenue grew 23%.",
      citations: [citation],
      tool_calls: [],
    });
    renderChat();
    expect(screen.getByText("What was Q4 revenue?")).toBeInTheDocument();
    expect(screen.getByText("Revenue grew 23%.")).toBeInTheDocument();
  });

  it("renders citation chips for assistant messages with citations", () => {
    useStore.getState().addMessage({
      id: "a1", role: "assistant", content: "Revenue grew 23%.",
      citations: [citation],
      tool_calls: [],
    });
    renderChat();
    expect(screen.getByTitle("report-2024-q4.pdf")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("clicking citation chip opens citation panel", async () => {
    const user = userEvent.setup();
    useStore.getState().addMessage({
      id: "a1", role: "assistant", content: "Revenue grew 23%.",
      citations: [citation],
      tool_calls: [],
    });
    renderChat();
    await user.click(screen.getByTitle("report-2024-q4.pdf"));
    expect(useStore.getState().citationPanelOpen).toBe(true);
    expect(useStore.getState().activeCitationMessageId).toBe("a1");
    expect(useStore.getState().activeCitationIndex).toBe(0);
  });
});
