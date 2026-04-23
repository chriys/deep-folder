import { StateCreator } from "zustand";

export interface AuthSlice {
  status: "loading" | "authenticated" | "unauthenticated";
  email: string | null;
  setStatus: (status: AuthSlice["status"]) => void;
  setEmail: (email: string | null) => void;
  disconnect: () => void;
}

export const createAuthSlice: StateCreator<AuthSlice> = (set) => ({
  status: "loading",
  email: null,
  setStatus: (status) => set({ status }),
  setEmail: (email) => set({ email }),
  disconnect: () => set({ status: "unauthenticated", email: null }),
});
