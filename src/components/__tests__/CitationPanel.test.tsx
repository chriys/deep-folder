import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useStore } from "../../stores";
import { CitationPanel } from "../CitationPanel";

const initialState = useStore.getState();

const messageId = "msg_1";
const citation = {
  file_id: "f1",
  file_name: "report-2024-q4.pdf",
  primary_unit: { type: "page" as const, value: "12" },
  quote: "Q4 revenue grew 23% year-over-year to $4.2M",
  deep_link: "https://drive.google.com/open?id=drive_f1&page=12",
};

function openPanel() {
  useStore.setState({
    messages: [
      {
        id: messageId,
        role: "assistant" as const,
        content: "Some text",
        citations: [citation],
        tool_calls: [] as [],
      },
    ],
    citationPanelOpen: true,
    activeCitationMessageId: messageId,
    activeCitationIndex: 0,
  });
}

describe("CitationPanel", () => {
  beforeEach(() => useStore.setState(initialState));

  it("renders file name", () => {
    openPanel();
    render(<CitationPanel />);
    expect(screen.getByTestId("citation-file-name")).toHaveTextContent("report-2024-q4.pdf");
  });

  it("renders quote text", () => {
    openPanel();
    render(<CitationPanel />);
    expect(screen.getAllByText(/Q4 revenue grew 23%/).length).toBeGreaterThan(0);
  });

  it("renders page number", () => {
    openPanel();
    render(<CitationPanel />);
    expect(screen.getByTestId("citation-primary-value")).toHaveTextContent("12");
  });

  it("renders heading label for heading type", () => {
    useStore.setState({
      messages: [
        {
          id: messageId,
          role: "assistant",
          content: "text",
          citations: [
            { ...citation, primary_unit: { type: "heading", value: "Introduction" } },
          ],
          tool_calls: [],
        },
      ],
      citationPanelOpen: true,
      activeCitationMessageId: messageId,
      activeCitationIndex: 0,
    });
    render(<CitationPanel />);
    expect(screen.getByText("Heading")).toBeInTheDocument();
    expect(screen.getByTestId("citation-primary-value")).toHaveTextContent("Introduction");
  });

  it("deep link opens in new tab", () => {
    openPanel();
    render(<CitationPanel />);
    const link = screen.getByRole("link", { name: /Open in Drive/i });
    expect(link).toHaveAttribute("href", citation.deep_link);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders nothing when panel is closed", () => {
    render(<CitationPanel />);
    expect(screen.queryByTestId("citation-file-name")).not.toBeInTheDocument();
  });

  it("close button closes the panel", async () => {
    const user = userEvent.setup();
    openPanel();
    render(<CitationPanel />);
    await user.click(screen.getByLabelText("Close citation panel"));
    expect(useStore.getState().citationPanelOpen).toBe(false);
    expect(useStore.getState().activeCitationMessageId).toBeNull();
    expect(useStore.getState().activeCitationIndex).toBeNull();
  });
});
