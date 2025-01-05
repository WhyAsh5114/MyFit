"use client";

import { DownloadIcon, RefreshCcwIcon } from "lucide-react";
import { Button } from "../ui/button";
import {
  useInstallationPromptStore,
  useUpdateAvailableStore,
} from "@/hooks/use-sw-state";

export function SwInstallButton() {
  const deferredPrompt = useInstallationPromptStore(
    (state) => state.deferredPrompt
  );

  if (!deferredPrompt) return <></>;

  return (
    <Button
      aria-label="Install app"
      onClick={() => deferredPrompt.prompt()}
      className="w-full"
    >
      <DownloadIcon />
      Download
    </Button>
  );
}

export function SwUpdateButton() {
  const skipWaiting = useUpdateAvailableStore((state) => state.skipWaiting);
  const setUpdateDialogOpen = useUpdateAvailableStore(
    (state) => state.setUpdateDialogOpen
  );
  if (!skipWaiting) return <></>;

  return (
    <Button
      aria-label="Update app"
      className="w-full"
      variant="outline"
      onClick={(e) => {
        e.currentTarget.blur();
        setUpdateDialogOpen(true);
      }}
    >
      <RefreshCcwIcon />
      Update
    </Button>
  );
}
