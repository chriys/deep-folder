import { create } from "zustand";
import { createAuthSlice, type AuthSlice } from "./auth-slice";
import { createFolderSlice, type FolderSlice } from "./folder-slice";
import { createChatSlice, type ChatSlice } from "./chat-slice";
import { createUISlice, type UISlice } from "./ui-slice";

export type Store = AuthSlice & FolderSlice & ChatSlice & UISlice;

export const useStore = create<Store>()((...a) => ({
  ...createAuthSlice(...a),
  ...createFolderSlice(...a),
  ...createChatSlice(...a),
  ...createUISlice(...a),
}));
