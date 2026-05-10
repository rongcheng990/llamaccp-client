import { create } from 'zustand';
import type { ServerState, DownloadProgress } from '@llamaccp/shared';

interface AppState {
  // Server
  serverState: ServerState | null;
  setServerState: (state: ServerState) => void;

  // Downloads
  downloads: DownloadProgress[];
  updateDownload: (progress: DownloadProgress) => void;
  removeDownload: (id: string) => void;

  // UI
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Server
  serverState: null,
  setServerState: (state) => set({ serverState: state }),

  // Downloads
  downloads: [],
  updateDownload: (progress) =>
    set((s) => {
      const idx = s.downloads.findIndex((d) => d.id === progress.id);
      const next = [...s.downloads];
      if (idx >= 0) next[idx] = progress;
      else next.unshift(progress);
      return { downloads: next };
    }),
  removeDownload: (id) =>
    set((s) => ({ downloads: s.downloads.filter((d) => d.id !== id) })),

  // UI
  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
}));
