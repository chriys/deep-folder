import { StateCreator } from "zustand";
import type { Folder } from "../types";

export interface FolderSlice {
  folders: Folder[];
  activeFolderId: string | null;
  fetchFolders: () => Promise<void>;
  setFolders: (folders: Folder[]) => void;
  setActiveFolder: (id: string | null) => void;
}

export const createFolderSlice: StateCreator<FolderSlice> = (set) => ({
  folders: [],
  activeFolderId: null,
  fetchFolders: async () => {
    try {
      const res = await fetch("/folders");
      const folders = await res.json();
      set({ folders });
    } catch {
      // Silently fail — network errors handled by UI state
    }
  },
  setFolders: (folders) => set({ folders }),
  setActiveFolder: (id) => set({ activeFolderId: id }),
});
