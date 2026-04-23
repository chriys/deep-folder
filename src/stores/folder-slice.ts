import { StateCreator } from "zustand";
import type { Folder, FolderDetail } from "../types";
import * as api from "../api/folders";

export interface FolderSlice {
  folders: Folder[];
  activeFolderId: string | null;
  folderLoading: boolean;
  folderError: string | null;
  fetchFolders: () => Promise<void>;
  setFolders: (folders: Folder[]) => void;
  setActiveFolder: (id: string | null) => void;
  createFolder: (driveUrl: string) => Promise<Folder>;
  loadFolders: () => Promise<void>;
  loadFolder: (id: string) => Promise<FolderDetail>;
  removeFolder: (id: string) => Promise<void>;
  updateFolder: (id: string, updates: Partial<Folder>) => void;
}

export const createFolderSlice: StateCreator<FolderSlice> = (set) => ({
  folders: [],
  activeFolderId: null,
  folderLoading: false,
  folderError: null,
  fetchFolders: async () => {
    try {
      const res = await fetch("/folders");
      const folders = await res.json();
      set({ folders });
    } catch {
      // Silently fail
    }
  },
  setFolders: (folders) => set({ folders }),
  setActiveFolder: (id) => set({ activeFolderId: id }),

  createFolder: async (driveUrl) => {
    const folder = await api.createFolder(driveUrl);
    set((s) => ({ folders: [...s.folders, folder] }));
    return folder;
  },

  loadFolders: async () => {
    set({ folderLoading: true, folderError: null });
    try {
      const folders = await api.fetchFolders();
      set({ folders, folderLoading: false });
    } catch {
      set({ folderError: "Failed to load folders", folderLoading: false });
    }
  },

  loadFolder: async (id) => {
    const detail = await api.fetchFolder(id);
    set((s) => ({
      folders: s.folders.map((f) => (f.id === id ? { ...f, ...detail } : f)),
    }));
    return detail;
  },

  removeFolder: async (id) => {
    await api.deleteFolder(id);
    set((s) => ({
      folders: s.folders.filter((f) => f.id !== id),
      activeFolderId: s.activeFolderId === id ? null : s.activeFolderId,
    }));
  },

  updateFolder: (id, updates) => {
    set((s) => ({
      folders: s.folders.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    }));
  },
});
