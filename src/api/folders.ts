import type { Folder, FolderDetail } from "../types";

export async function createFolder(driveUrl: string): Promise<Folder> {
  const res = await fetch("/folders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ drive_url: driveUrl }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error ?? "Failed to create folder");
  return body as Folder;
}

export async function fetchFolders(): Promise<Folder[]> {
  const res = await fetch("/folders");
  const body = await res.json();
  if (!res.ok) throw new Error("Failed to fetch folders");
  return body as Folder[];
}

export async function fetchFolder(id: string): Promise<FolderDetail> {
  const res = await fetch(`/folders/${id}`);
  const body = await res.json();
  if (!res.ok) throw new Error(body.error ?? "Folder not found");
  return body as FolderDetail;
}

export async function deleteFolder(id: string): Promise<void> {
  const res = await fetch(`/folders/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete folder");
}
