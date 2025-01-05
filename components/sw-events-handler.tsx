"use client";

import {
  useDownloadProgressStore,
  useInstallationPromptStore,
  useUpdateAvailableStore,
} from "@/hooks/use-sw-state";
import { Serwist } from "@serwist/window";
import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";
import { ResponsiveDialog } from "./responsive-dialog";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";

export default function SwEventsHandler() {
  const router = useRouter();
  const [serwist, setSerwist] = useState<Serwist>();
  const [updating, setUpdating] = useState(false);
  const [progress, setProgress] = useDownloadProgressStore(
    useShallow((state) => [state.progress, state.setProgress])
  );
  const progressRef = useRef(progress);

  const setDeferredPrompt = useInstallationPromptStore(
    (state) => state.setDeferredPrompt
  );
  const [updateDialogOpen, setUpdateDialogOpen, skipWaiting, setSkipWaiting] =
    useUpdateAvailableStore(
      useShallow((state) => [
        state.updateDialogOpen,
        state.setUpdateDialogOpen,
        state.skipWaiting,
        state.setSkipWaiting,
      ])
    );

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    if (process.env.NODE_ENV === "development") return;
    if (!("serviceWorker" in navigator)) return;

    import("@serwist/window").then(({ Serwist }) => {
      const sw = new Serwist("/sw.js", { scope: "/", type: "classic" });
      setSerwist(sw);
      sw.register();

      const checkForUpdate = () => {
        try {
          sw.update();
        } catch (error) {
          console.error(error);
        }
      };
      checkForUpdate();
      const updateInterval = setInterval(checkForUpdate, 1000 * 20);

      sw.addEventListener("waiting", () => {
        setSkipWaiting(() => sw.messageSkipWaiting());
      });

      sw.addEventListener("activated", () => {
        localStorage.clear();
        router.refresh();
      });

      return () => {
        clearInterval(updateInterval);
      };
    });
  }, [router, setSkipWaiting]);

  useEffect(() => {
    if (!serwist) return;

    serwist.addEventListener("installing", async (event) => {
      if (event.isUpdate || event.isExternal) return;

      const response = await fetch("./precache-entries.json");
      const { count } = (await response.json()) as { count: number };
      const cache = await caches.open(`serwist-precache`);

      let animationFrameId: number;
      const updateProgress = async () => {
        const totalCached = (await cache.keys()).length;
        setProgress(totalCached / count);

        if (totalCached < count) {
          animationFrameId = requestAnimationFrame(updateProgress);
        }
      };

      updateProgress();
      return () => {
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
      };
    });
  }, [setProgress, serwist]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const installHandler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", installHandler);

    const installedHandler = () => {
      setDeferredPrompt(null);
    };
    window.addEventListener("appinstalled", installedHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", installHandler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, [setDeferredPrompt]);

  return (
    <>
      <ResponsiveDialog
        title="Update available 🎉"
        description="Any unsaved data, like a workout in progress, will be lost. Are you sure you want to update?"
        open={updateDialogOpen}
        setOpen={setUpdateDialogOpen}
      >
        <Button
          className="w-full"
          disabled={updating}
          onClick={() => {
            setUpdating(true);
            skipWaiting!();
          }}
        >
          {updating ? (
            <>
              Updating <LoaderCircle className="animate-spin" />
            </>
          ) : (
            "Update"
          )}
        </Button>
      </ResponsiveDialog>
      <DownloadProgressToast />
    </>
  );
}

function DownloadProgressToast() {
  const installationProgressToast = useRef<unknown>(undefined);
  const progress = useDownloadProgressStore((state) => state.progress);
  const progressRef = useRef(progress);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    if (progress === undefined) return;
    if (installationProgressToast.current) return;

    const installationProgressPromise = new Promise<void>((resolve) => {
      const checkProgress = () => {
        console.log("checking progress", progressRef.current);
        if (progressRef.current === 1) resolve();
        else requestAnimationFrame(checkProgress);
      };
      checkProgress();
    });

    console.log("creating toast");
    installationProgressToast.current = toast.promise(
      installationProgressPromise,
      {
        loading: <DownloadProgressToastBody />,
        success: "App ready for offline use",
      }
    );
  }, [progress]);

  return null;
}

function DownloadProgressToastBody() {
  const progress = useDownloadProgressStore((state) => state.progress);

  return (
    <div className="grid w-full gap-2">
      <div className="flex justify-between">
        <span className="font-medium">Downloading the app</span>
        <span className="text-muted-foreground">
          {Math.round((progress ?? 0) * 100)}%
        </span>
      </div>
      <Progress className="h-2" value={(progress ?? 0) * 100} max={100} />
    </div>
  );
}
