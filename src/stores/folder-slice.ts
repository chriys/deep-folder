import { StateCreator } from "zustand";
import type { Folder } from "../types";

export interface FolderSlice {
  folders: Folder[];
  activeFolderId: string | null;
  setFolders: (folders: Folder[]) => void;
  setActiveFolder: (id: string | null) => void;
}

export const createFolderSlice: StateCreator<FolderSlice> = (set) => ({
  folders: [],
  activeFolderId: null,
  setFolders: (folders) => set({ folders }),
  setActiveFolder: (id) => set({ activeFolderId: id }),
});
