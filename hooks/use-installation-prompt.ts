import { create } from "zustand";

type InstallationPromptState = {
  deferredPrompt: (Event & { prompt: () => void }) | null;
  setDeferredPrompt: (deferredPrompt: Event) => void;
};

export const useInstallationPromptStore = create<InstallationPromptState>(
  (set) => ({
    deferredPrompt: null,
    setDeferredPrompt: (deferredPrompt) =>
      set({ deferredPrompt } as {
        deferredPrompt: Event & { prompt: () => void };
      }),
  })
);
