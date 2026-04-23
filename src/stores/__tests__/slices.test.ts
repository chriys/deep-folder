import { describe, it, expect, beforeAll, afterEach, afterAll, beforeEach } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../../test-utils";
import { useStore } from "../index";

const initialState = useStore.getState();

beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

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

  it("starts with not loading and no error", () => {
    expect(useStore.getState().foldersLoading).toBe(false);
    expect(useStore.getState().foldersError).toBeNull();
    expect(useStore.getState().folderDetailLoading).toBe(false);
    expect(useStore.getState().folderDetailError).toBeNull();
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

  it("fetchFolders loads folders via API", async () => {
    const { fetchFolders } = useStore.getState();
    const promise = fetchFolders();
    expect(useStore.getState().foldersLoading).toBe(true);
    await promise;
    expect(useStore.getState().foldersLoading).toBe(false);
    expect(useStore.getState().foldersError).toBeNull();
    expect(useStore.getState().folders.length).toBeGreaterThan(0);
    expect(useStore.getState().folders[0].id).toBe("folder_1");
  });

  it("fetchFolders sets error on failure", async () => {
    server.use(http.get("/folders", () => HttpResponse.error()));
    const { fetchFolders } = useStore.getState();
    await fetchFolders();
    expect(useStore.getState().foldersLoading).toBe(false);
    expect(useStore.getState().foldersError).toBeTruthy();
  });

  it("fetchFolderDetail loads detail via API", async () => {
    const { fetchFolderDetail } = useStore.getState();
    const promise = fetchFolderDetail("folder_1");
    expect(useStore.getState().folderDetailLoading).toBe(true);
    await promise;
    expect(useStore.getState().folderDetailLoading).toBe(false);
    expect(useStore.getState().folderDetailError).toBeNull();
    expect(useStore.getState().activeFolderDetail).toBeTruthy();
    expect(useStore.getState().activeFolderDetail?.id).toBe("folder_1");
  });

  it("fetchFolderDetail sets error on failure", async () => {
    server.use(http.get("/folders/folder_1", () => HttpResponse.error()));
    const { fetchFolderDetail } = useStore.getState();
    await fetchFolderDetail("folder_1");
    expect(useStore.getState().folderDetailLoading).toBe(false);
    expect(useStore.getState().folderDetailError).toBeTruthy();
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

  it("starts with empty conversations and no loading/error", () => {
    expect(useStore.getState().conversations).toEqual([]);
    expect(useStore.getState().conversationsLoading).toBe(false);
    expect(useStore.getState().conversationsError).toBeNull();
    expect(useStore.getState().activeConversationLoading).toBe(false);
    expect(useStore.getState().activeConversationError).toBeNull();
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

  it("fetchConversations loads conversations via API", async () => {
    const { fetchConversations } = useStore.getState();
    const promise = fetchConversations();
    expect(useStore.getState().conversationsLoading).toBe(true);
    await promise;
    expect(useStore.getState().conversationsLoading).toBe(false);
    expect(useStore.getState().conversationsError).toBeNull();
    expect(useStore.getState().conversations.length).toBeGreaterThan(0);
    expect(useStore.getState().conversations[0].id).toBe("conv_1");
  });

  it("fetchConversations sets error on failure", async () => {
    server.use(http.get("/conversations", () => HttpResponse.error()));
    const { fetchConversations } = useStore.getState();
    await fetchConversations();
    expect(useStore.getState().conversationsLoading).toBe(false);
    expect(useStore.getState().conversationsError).toBeTruthy();
  });

  it("fetchConversation loads single conversation via API", async () => {
    const { fetchConversation } = useStore.getState();
    const promise = fetchConversation("conv_1");
    expect(useStore.getState().activeConversationLoading).toBe(true);
    await promise;
    expect(useStore.getState().activeConversationLoading).toBe(false);
    expect(useStore.getState().activeConversationError).toBeNull();
    expect(useStore.getState().activeConversation).toBeTruthy();
    expect(useStore.getState().activeConversation?.id).toBe("conv_1");
  });

  it("fetchConversation sets error on failure", async () => {
    server.use(http.get("/conversations/conv_1", () => HttpResponse.error()));
    const { fetchConversation } = useStore.getState();
    await fetchConversation("conv_1");
    expect(useStore.getState().activeConversationLoading).toBe(false);
    expect(useStore.getState().activeConversationError).toBeTruthy();
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
