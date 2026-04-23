import { StateCreator } from "zustand";
import type { Folder, FolderDetail } from "../types";
import { apiUrl } from "../api/client";
import * as api from "../api/folders";

export interface FolderSlice {
  folders: Folder[];
  foldersLoading: boolean;
  foldersError: string | null;
  activeFolderId: string | null;
  activeFolderDetail: Folder | null;
  folderDetailLoading: boolean;
  folderDetailError: string | null;
  setFolders: (folders: Folder[]) => void;
  setActiveFolder: (id: string | null) => void;
  createFolder: (driveUrl: string) => Promise<Folder>;
  fetchFolders: () => Promise<void>;
  fetchFolderDetail: (id: string) => Promise<void>;
  loadFolders: () => Promise<void>;
  loadFolder: (id: string) => Promise<FolderDetail>;
  removeFolder: (id: string) => Promise<void>;
  updateFolder: (id: string, updates: Partial<Folder>) => void;
}

export const createFolderSlice: StateCreator<FolderSlice> = (set) => ({
  folders: [],
  foldersLoading: false,
  foldersError: null,
  activeFolderId: null,
  activeFolderDetail: null,
  folderDetailLoading: false,
  folderDetailError: null,
  setFolders: (folders) => set({ folders }),
  setActiveFolder: (id) => set({ activeFolderId: id }),

  createFolder: async (driveUrl) => {
    const folder = await api.createFolder(driveUrl);
    set((s) => ({ folders: [...s.folders, folder] }));
    return folder;
  },

  fetchFolders: async () => {
    set({ foldersLoading: true, foldersError: null });
    try {
      const res = await fetch(apiUrl("/folders"), { credentials: "include" });
      if (!res.ok) throw new Error(`Failed to load folders (${res.status})`);
      const data = (await res.json()) as Folder[];
      set({ folders: data, foldersLoading: false });
    } catch (e) {
      set({ foldersError: (e as Error).message, foldersLoading: false });
    }
  },

  fetchFolderDetail: async (id: string) => {
    set({ folderDetailLoading: true, folderDetailError: null });
    try {
      const res = await fetch(apiUrl(`/folders/${id}`), { credentials: "include" });
      if (!res.ok) throw new Error(`Failed to load folder (${res.status})`);
      const data = (await res.json()) as Folder;
      set({ activeFolderDetail: data, folderDetailLoading: false });
    } catch (e) {
      set({ folderDetailError: (e as Error).message, folderDetailLoading: false });
    }
  },

  loadFolders: async () => {
    set({ foldersLoading: true, foldersError: null });
    try {
      const folders = await api.fetchFolders();
      set({ folders, foldersLoading: false });
    } catch {
      set({ foldersError: "Failed to load folders", foldersLoading: false });
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
