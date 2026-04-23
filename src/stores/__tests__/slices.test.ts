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
