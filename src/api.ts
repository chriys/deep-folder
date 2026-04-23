import type { Conversation, Folder } from "./types";

export async function fetchFolders(): Promise<Folder[]> {
  const res = await fetch("/folders");
  if (!res.ok) throw new Error("Failed to fetch folders");
  return res.json();
}

export async function fetchConversations(folderId: string): Promise<Conversation[]> {
  const res = await fetch(`/conversations?folder_id=${encodeURIComponent(folderId)}`);
  if (!res.ok) throw new Error("Failed to fetch conversations");
  return res.json();
}

export async function fetchConversation(id: string): Promise<Conversation> {
  const res = await fetch(`/conversations/${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error("Conversation not found");
  return res.json();
}

export async function createConversation(folderId: string, title?: string): Promise<Conversation> {
  const res = await fetch("/conversations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ folder_id: folderId, title }),
  });
  if (!res.ok) throw new Error("Failed to create conversation");
  return res.json();
}
