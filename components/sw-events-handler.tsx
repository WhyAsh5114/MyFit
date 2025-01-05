"use client";

import type { Serwist } from "@serwist/window";
import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ResponsiveDialog from "./responsive-dialog";
import { Button } from "./ui/button";

export default function SwEventsHandler() {
  const router = useRouter();
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const serwistRef = useRef<Serwist>(null);

  useEffect(() => {
    if (
      "serviceWorker" in navigator &&
      process.env.NODE_ENV !== "development"
    ) {
      import("@serwist/window").then(({ Serwist }) => {
        const serwist = new Serwist("/sw.js", { scope: "/", type: "classic" });
        serwist.register();
        serwistRef.current = serwist;

        const checkForUpdate = () => {
          try {
            serwist.update();
          } catch (error) {
            console.error(error);
          }
        };
        checkForUpdate();
        setInterval(checkForUpdate, 1000 * 20);

        serwist.addEventListener("waiting", () => {
          setUpdateDialogOpen(true);
        });

        serwist.addEventListener("activated", () => {
          localStorage.clear();
          router.refresh();
        });
      });
    }
  }, [router]);

  return (
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
          serwistRef.current!.messageSkipWaiting();
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
  );
}
