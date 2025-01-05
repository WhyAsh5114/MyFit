import { create } from "zustand";

type InstallationPromptState = {
  deferredPrompt: (Event & { prompt: () => void }) | null;
  setDeferredPrompt: (deferredPrompt: Event | null) => void;
};

export const useInstallationPromptStore = create<InstallationPromptState>(
  (set) => ({
    deferredPrompt: null,
    setDeferredPrompt: (deferredPrompt) =>
      set({ deferredPrompt } as {
        deferredPrompt: InstallationPromptState["deferredPrompt"];
      }),
  })
);

type UpdateAvailableState = {
  skipWaiting: null | (() => void);
  setSkipWaiting: (value: () => void) => void;
  updateDialogOpen: boolean;
  setUpdateDialogOpen: (value: boolean) => void;
};

export const useUpdateAvailableStore = create<UpdateAvailableState>((set) => ({
  skipWaiting: null,
  setSkipWaiting: (value) =>
    set({ skipWaiting: value, updateDialogOpen: true }),
  updateDialogOpen: false,
  setUpdateDialogOpen: (value) => set({ updateDialogOpen: value }),
}));

type DownloadProgressState = {
  progress: number | undefined;
  setProgress: (progress: number) => void;
};

export const useDownloadProgressStore = create<DownloadProgressState>(
  (set) => ({
    progress: undefined,
    setProgress: (progress) => set({ progress }),
  })
);
