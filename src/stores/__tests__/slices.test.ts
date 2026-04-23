import { describe, it, expect, beforeEach } from "vitest";
import { useStore } from "../index";

const initialState = useStore.getState();

describe("auth slice", () => {
  it("starts unauthenticated", () => {
    expect(useStore.getState().status).toBe("unauthenticated");
  });

  it("setStatus updates auth status", () => {
    useStore.getState().setStatus("authenticated");
    expect(useStore.getState().status).toBe("authenticated");
  });

  it("disconnect resets to unauthenticated", () => {
    useStore.getState().setStatus("authenticated");
    useStore.getState().disconnect();
    expect(useStore.getState().status).toBe("unauthenticated");
  });
});

describe("folder slice", () => {
  beforeEach(() => useStore.setState(initialState));

  it("starts with empty folders array", () => {
    expect(useStore.getState().folders).toEqual([]);
  });

  it("starts with null activeFolderId", () => {
    expect(useStore.getState().activeFolderId).toBeNull();
  });

  it("setFolders updates folder list", () => {
    const folder = {
      id: "1",
      drive_url: "https://drive.google.com/drive/folders/abc",
      ingest_state: "done" as const,
      created_at: "2024-01-01",
    };
    useStore.getState().setFolders([folder]);
    expect(useStore.getState().folders).toHaveLength(1);
    expect(useStore.getState().folders[0].id).toBe("1");
  });
});

describe("chat slice", () => {
  beforeEach(() => useStore.setState(initialState));

  it("starts with null activeConversation", () => {
    expect(useStore.getState().activeConversation).toBeNull();
  });

  it("starts with empty messages", () => {
    expect(useStore.getState().messages).toEqual([]);
  });

  it("starts with idle streamStatus", () => {
    expect(useStore.getState().streamStatus).toBe("idle");
  });

  it("addMessage appends to messages", () => {
    const msg = {
      id: "m1",
      role: "user" as const,
      content: "hello",
      citations: [],
      tool_calls: [] as [],
    };
    useStore.getState().addMessage(msg);
    expect(useStore.getState().messages).toHaveLength(1);
    expect(useStore.getState().messages[0].content).toBe("hello");
  });

  it("appendStreamContent appends text to message", () => {
    useStore.setState({
      messages: [
        {
          id: "m1",
          role: "assistant",
          content: "",
          citations: [],
          tool_calls: [],
        },
      ],
    });
    useStore.getState().appendStreamContent("m1", "Hello");
    useStore.getState().appendStreamContent("m1", " world");
    expect(useStore.getState().messages[0].content).toBe("Hello world");
  });

  it("appendStreamCitation appends citation to message", () => {
    const citation = {
      file_id: "f1",
      file_name: "doc.pdf",
      primary_unit: { type: "page" as const, value: "3" },
      quote: "data",
      deep_link: "https://drive.google.com/doc",
    };
    useStore.setState({
      messages: [
        {
          id: "m1",
          role: "assistant",
          content: "text",
          citations: [],
          tool_calls: [],
        },
      ],
    });
    useStore.getState().appendStreamCitation("m1", citation);
    expect(useStore.getState().messages[0].citations).toHaveLength(1);
    expect(useStore.getState().messages[0].citations[0].file_id).toBe("f1");
  });

  it("finalizeMessage sets message status to done and clears streamingMessageId", () => {
    useStore.setState({
      messages: [
        { id: "m1", role: "assistant", content: "hi", citations: [], tool_calls: [] },
      ],
      streamingMessageId: "m1",
      streamStatus: "streaming",
    });
    useStore.getState().finalizeMessage("m1");
    const state = useStore.getState();
    expect(state.messages[0].status).toBe("done");
    expect(state.streamingMessageId).toBeNull();
    expect(state.streamStatus).toBe("idle");
  });

  it("setMessageError marks message with error", () => {
    useStore.setState({
      messages: [
        { id: "m1", role: "assistant", content: "", citations: [], tool_calls: [] },
      ],
      streamingMessageId: "m1",
      streamStatus: "streaming",
    });
    useStore.getState().setMessageError("m1", "Connection lost");
    const state = useStore.getState();
    expect(state.messages[0].status).toBe("error");
    expect(state.messages[0].error).toBe("Connection lost");
    expect(state.streamingMessageId).toBeNull();
    expect(state.streamStatus).toBe("idle");
  });

  it("removeMessage removes message by id", () => {
    useStore.setState({
      messages: [
        { id: "m1", role: "user", content: "hi", citations: [], tool_calls: [] },
        { id: "m2", role: "assistant", content: "hello", citations: [], tool_calls: [] },
      ],
    });
    useStore.getState().removeMessage("m1");
    expect(useStore.getState().messages).toHaveLength(1);
    expect(useStore.getState().messages[0].id).toBe("m2");
  });
});

describe("ui slice", () => {
  beforeEach(() => useStore.setState(initialState));

  it("starts with sidebar open", () => {
    expect(useStore.getState().sidebarOpen).toBe(true);
  });

  it("toggleSidebar flips sidebar state", () => {
    useStore.getState().toggleSidebar();
    expect(useStore.getState().sidebarOpen).toBe(false);
    useStore.getState().toggleSidebar();
    expect(useStore.getState().sidebarOpen).toBe(true);
  });

  it("starts with citation panel closed", () => {
    expect(useStore.getState().citationPanelOpen).toBe(false);
  });
});
