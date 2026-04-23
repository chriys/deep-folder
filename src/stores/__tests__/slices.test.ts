import { describe, it, expect, beforeEach, beforeAll, afterAll, afterEach } from "vitest";
import { setupServer } from "msw/node";
import { handlers } from "../../mocks/handlers";
import { resetDb, resetFolderCallCounts } from "../../mocks/db";
import { useStore } from "../index";

const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));
afterEach(() => {
  server.resetHandlers();
  resetDb();
  resetFolderCallCounts();
});
afterAll(() => server.close());

const initialState = useStore.getState();

describe("auth slice", () => {
  beforeEach(() => useStore.setState(initialState));

  it("starts loading", () => {
    expect(useStore.getState().status).toBe("loading");
  });

  it("starts with null email", () => {
    expect(useStore.getState().email).toBeNull();
  });
  });

  it("setStatus updates auth status", () => {
    useStore.getState().setStatus("authenticated");
    expect(useStore.getState().status).toBe("authenticated");
  });

  it("setEmail updates email", () => {
    useStore.getState().setEmail("user@example.com");
    expect(useStore.getState().email).toBe("user@example.com");
  });

  it("disconnect resets to unauthenticated and clears email", () => {
    useStore.getState().setStatus("authenticated");
    useStore.getState().setEmail("user@example.com");
    useStore.getState().disconnect();
    expect(useStore.getState().status).toBe("unauthenticated");
    expect(useStore.getState().email).toBeNull();
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
      file_count: 0,
      skipped_file_count: 0,
      error_message: null,
    };
    useStore.getState().setFolders([folder]);
    expect(useStore.getState().folders).toHaveLength(1);
    expect(useStore.getState().folders[0].id).toBe("1");
  });

  it("createFolder posts URL and adds folder to list", async () => {
    const folder = await useStore.getState().createFolder("https://drive.google.com/drive/folders/xyz");
    expect(folder.ingest_state).toBe("pending");
    expect(folder.drive_url).toBe("https://drive.google.com/drive/folders/xyz");
    const state = useStore.getState();
    expect(state.folders).toHaveLength(1);
    expect(state.folders[0].drive_url).toBe("https://drive.google.com/drive/folders/xyz");
  });

  it("removeFolder deletes folder from store and API", async () => {
    const folder = await useStore.getState().createFolder("https://drive.google.com/drive/folders/xyz");
    expect(useStore.getState().folders).toHaveLength(1);

    await useStore.getState().removeFolder(folder.id);
    expect(useStore.getState().folders).toHaveLength(0);
  });

  it("updateFolder patches specific fields", () => {
    const folder = {
      id: "1",
      drive_url: "https://drive.google.com/drive/folders/abc",
      ingest_state: "done" as const,
      created_at: "2024-01-01",
      file_count: 0,
      skipped_file_count: 0,
      error_message: null,
    };
    useStore.getState().setFolders([folder]);
    useStore.getState().updateFolder("1", { ingest_state: "running" });
    expect(useStore.getState().folders[0].ingest_state).toBe("running");
    expect(useStore.getState().folders[0].drive_url).toBe("https://drive.google.com/drive/folders/abc");
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
=======
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
