import { StateCreator } from "zustand";

const SIDEBAR_KEY = "df:sidebarOpen";

function loadSidebarState(): boolean {
  try {
    const saved = localStorage.getItem(SIDEBAR_KEY);
    return saved !== null ? (JSON.parse(saved) as boolean) : true;
  } catch {
    return true;
  }
}

export interface UISlice {
  sidebarOpen: boolean;
  citationPanelOpen: boolean;
  activeCitationIndex: number | null;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setCitationPanelOpen: (open: boolean) => void;
  setActiveCitationIndex: (index: number | null) => void;
}

export const createUISlice: StateCreator<UISlice> = (set) => ({
  sidebarOpen: loadSidebarState(),
  citationPanelOpen: false,
  activeCitationIndex: null,
  toggleSidebar: () =>
    set((s) => {
      const next = !s.sidebarOpen;
      try {
        localStorage.setItem(SIDEBAR_KEY, JSON.stringify(next));
      } catch { /* localStorage unavailable */ }
      return { sidebarOpen: next };
    }),
  setSidebarOpen: (open) => {
    try {
      localStorage.setItem(SIDEBAR_KEY, JSON.stringify(open));
    } catch { /* localStorage unavailable */ }
    set({ sidebarOpen: open });
  },
  setCitationPanelOpen: (open) => set({ citationPanelOpen: open }),
  setActiveCitationIndex: (index) => set({ activeCitationIndex: index }),
});
