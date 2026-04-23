import { StateCreator } from "zustand";

export interface UISlice {
  sidebarOpen: boolean;
  citationPanelOpen: boolean;
  activeCitationMessageId: string | null;
  activeCitationIndex: number | null;
  toggleSidebar: () => void;
  openCitationPanel: (messageId: string, index: number) => void;
  closeCitationPanel: () => void;
}

export const createUISlice: StateCreator<UISlice> = (set) => ({
  sidebarOpen: true,
  citationPanelOpen: false,
  activeCitationMessageId: null,
  activeCitationIndex: null,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  openCitationPanel: (messageId, index) =>
    set({ citationPanelOpen: true, activeCitationMessageId: messageId, activeCitationIndex: index }),
  closeCitationPanel: () =>
    set({ citationPanelOpen: false, activeCitationMessageId: null, activeCitationIndex: null }),
});
