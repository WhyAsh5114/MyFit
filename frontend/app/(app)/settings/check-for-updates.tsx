"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  useLastCheckedForUpdateStore,
  useUpdateAvailableStore,
} from "@/hooks/use-sw-state";
import { LoaderCircle, RefreshCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";

export function CheckForUpdates() {
  const [lastChecked, setLastChecked] = useLastCheckedForUpdateStore(
    useShallow((state) => [state.lastChecked, state.setLastChecked])
  );
  const [swStatus, setSwStatus] = useState<
    "checking" | "installing" | "waiting"
  >();
  const swStatusRef = useRef(swStatus);

  useEffect(() => {
    swStatusRef.current = swStatus;
  }, [swStatus]);

  async function checkForUpdate() {
    setSwStatus("checking");
    try {
      const { Serwist } = await import("@serwist/window");
      const sw = new Serwist("/sw.js", { scope: "/", type: "classic" });
      await sw.register();

      sw.addEventListener("installing", () => {
        setSwStatus("installing");
      });

      sw.addEventListener("waiting", () => {
        setSwStatus("waiting");
      });

      await sw.update();
    } catch (error) {
      setSwStatus(undefined);
      toast.error("Failed to check for updates");
      console.error(error);
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
    if (swStatusRef.current === "checking") {
      setSwStatus(undefined);
      toast.success("App is already at the latest version");
    }
    setLastChecked(new Date());
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Check for updates</CardTitle>
        <CardDescription>
          Last checked at:{" "}
          <span className="font-semibold">
            {lastChecked?.toLocaleString(undefined, {
              dateStyle: "long",
              timeStyle: "medium",
            }) ?? "Never"}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SwButton swState={swStatus} checkForUpdate={checkForUpdate} />
      </CardContent>
    </Card>
  );
}

function SwButton({
  swState,
  checkForUpdate,
}: {
  swState: undefined | "checking" | "installing" | "waiting";
  checkForUpdate: () => void;
}) {
  const [skipWaiting, setUpdateDialogOpen] = useUpdateAvailableStore(
    useShallow((state) => [state.skipWaiting, state.setUpdateDialogOpen])
  );

  if (skipWaiting) {
    return (
      <Button onClick={() => setUpdateDialogOpen(true)}>
        <RefreshCcw /> Update and refresh
      </Button>
    );
  }

  if (swState === undefined) {
    return (
      <Button onClick={checkForUpdate}>
        <RefreshCcw /> Check now
      </Button>
    );
  }

  if (swState === "checking") {
    return (
      <Button disabled>
        <LoaderCircle className="animate-spin" /> Checking for updates
      </Button>
    );
  }

  return (
    <Button disabled>
      <LoaderCircle className="animate-spin" /> Installing update
    </Button>
  );
}
