"use client";

import {
  useInstallationPromptStore,
  useUpdateAvailableStore,
} from "@/hooks/use-sw-state";
import { DownloadIcon, RefreshCcwIcon } from "lucide-react";
import { SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar";

export function SwInstallOrUpdateButton() {
  const skipWaiting = useUpdateAvailableStore((state) => state.skipWaiting);
  const setUpdateDialogOpen = useUpdateAvailableStore(
    (state) => state.setUpdateDialogOpen
  );
  const deferredPrompt = useInstallationPromptStore(
    (state) => state.deferredPrompt
  );

  if (skipWaiting) {
    return (
      <SidebarMenuItem className="w-full">
        <SidebarMenuButton
          aria-label="Update app"
          variant="outline"
          onClick={(e) => {
            e.currentTarget.blur();
            setUpdateDialogOpen(true);
          }}
        >
          <RefreshCcwIcon />
          Update
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }
  if (!deferredPrompt) return null;

  return (
    <SidebarMenuItem className="w-full">
      <SidebarMenuButton
        aria-label="Install app"
        onClick={() => deferredPrompt.prompt()}
        variant="outline"
      >
        <DownloadIcon />
        Install
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
