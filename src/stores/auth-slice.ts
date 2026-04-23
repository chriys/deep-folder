import { StateCreator } from "zustand";

export interface AuthSlice {
  status: "loading" | "authenticated" | "unauthenticated";
  setStatus: (status: AuthSlice["status"]) => void;
  disconnect: () => void;
}

export const createAuthSlice: StateCreator<AuthSlice> = (set) => ({
  status: "unauthenticated",
  setStatus: (status) => set({ status }),
  disconnect: () => set({ status: "unauthenticated" }),
});
