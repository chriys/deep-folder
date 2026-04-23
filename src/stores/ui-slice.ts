import { StateCreator } from "zustand";

export interface UISlice {
  sidebarOpen: boolean;
  citationPanelOpen: boolean;
  activeCitationIndex: number | null;
  toggleSidebar: () => void;
  setCitationPanelOpen: (open: boolean) => void;
  setActiveCitationIndex: (index: number | null) => void;
}

export const createUISlice: StateCreator<UISlice> = (set) => ({
  sidebarOpen: true,
  citationPanelOpen: false,
  activeCitationIndex: null,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setCitationPanelOpen: (open) => set({ citationPanelOpen: open }),
  setActiveCitationIndex: (index) => set({ activeCitationIndex: index }),
});
