"use client";

import { DownloadIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";

// TODO: appinstalled event
// remove download button after installation

// TODO: hides in mobile and doesn't load prompt in background as expected
// maybe add event listeners in the layout and pass the prompt to the button via zustand state

// TODO: cleanup commit history
// squash commits

// TODO: remove fake promises
// in sw-events-handler.tsx

// TODO: instead of toast promise, use a loading spinner in the responsive dialog itself

// TODO: metadata
// add metadata to the pages, like title, description, head tags, meta tags, etc.

// TODO: theming

// TODO: changelog management
// fetch the changelog from the github releases and display it in the app

// TODO: data backup mechanism
// download data as JSON and upload it back to the app

export function SwInstallButton() {
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<unknown>();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  if (!showInstallButton || !deferredPrompt) return <></>;
  return (
    <Button
      aria-label="Install app"
      onClick={() => (deferredPrompt as { prompt: () => void }).prompt()}
      className="w-full"
    >
      <DownloadIcon />
      Download
    </Button>
  );
}
