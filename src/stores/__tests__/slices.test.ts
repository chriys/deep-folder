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

  it("starts with idle streamState", () => {
    expect(useStore.getState().streamState).toBe("idle");
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

  it("appendToLastMessage appends text to last assistant message", () => {
    useStore.getState().addMessage({ id: "u1", role: "user", content: "hi", citations: [], tool_calls: [] });
    useStore.getState().addMessage({ id: "a1", role: "assistant", content: "Hel", citations: [], tool_calls: [] });
    useStore.getState().appendToLastMessage("lo");
    expect(useStore.getState().messages[1].content).toBe("Hello");
  });

  it("appendToLastMessage is no-op when last message is not assistant", () => {
    useStore.getState().addMessage({ id: "u1", role: "user", content: "hi", citations: [], tool_calls: [] });
    useStore.getState().appendToLastMessage("lo");
    expect(useStore.getState().messages[0].content).toBe("hi");
  });

  it("addCitationToLastMessage adds citation to last assistant message", () => {
    const citation = { file_id: "f1", file_name: "doc.pdf", primary_unit: { type: "page", value: "5" }, quote: "text", deep_link: "https://example.com" };
    useStore.getState().addMessage({ id: "a1", role: "assistant", content: "foo", citations: [], tool_calls: [] });
    useStore.getState().addCitationToLastMessage(citation);
    expect(useStore.getState().messages[0].citations).toHaveLength(1);
    expect(useStore.getState().messages[0].citations[0]).toEqual(citation);
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

  it("starts with null activeCitationMessageId", () => {
    expect(useStore.getState().activeCitationMessageId).toBeNull();
  });

  it("openCitationPanel sets messageId, index, and opens panel", () => {
    useStore.getState().openCitationPanel("msg_1", 2);
    expect(useStore.getState().citationPanelOpen).toBe(true);
    expect(useStore.getState().activeCitationMessageId).toBe("msg_1");
    expect(useStore.getState().activeCitationIndex).toBe(2);
  });

  it("closeCitationPanel clears all citation state", () => {
    useStore.getState().openCitationPanel("msg_1", 0);
    useStore.getState().closeCitationPanel();
    expect(useStore.getState().citationPanelOpen).toBe(false);
    expect(useStore.getState().activeCitationMessageId).toBeNull();
    expect(useStore.getState().activeCitationIndex).toBeNull();
  });

  it("openCitationPanel overwrites previous state", () => {
    useStore.getState().openCitationPanel("msg_1", 0);
    useStore.getState().openCitationPanel("msg_2", 3);
    expect(useStore.getState().activeCitationMessageId).toBe("msg_2");
    expect(useStore.getState().activeCitationIndex).toBe(3);
    expect(useStore.getState().citationPanelOpen).toBe(true);
  });
});
