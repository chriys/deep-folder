import { StateCreator } from "zustand";
import type { Folder } from "../types";

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
  fetchFolders: () => Promise<void>;
  fetchFolderDetail: (id: string) => Promise<void>;
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
  fetchFolders: async () => {
    set({ foldersLoading: true, foldersError: null });
    try {
      const res = await fetch("/folders");
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
      const res = await fetch(`/folders/${id}`);
      if (!res.ok) throw new Error(`Failed to load folder (${res.status})`);
      const data = (await res.json()) as Folder;
      set({ activeFolderDetail: data, folderDetailLoading: false });
    } catch (e) {
      set({ folderDetailError: (e as Error).message, folderDetailLoading: false });
    }
  },
});
