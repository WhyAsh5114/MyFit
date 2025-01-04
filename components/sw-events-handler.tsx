"use client";

import type { Serwist } from "@serwist/window";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import ResponsiveDialog from "./responsive-dialog";
import { Button } from "./ui/button";

export default function SwEventsHandler() {
  const router = useRouter();
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
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

        serwist.addEventListener("activating", (event) => {
          if (!event.isExternal && !event.isUpdate) return;
          toast.promise(new Promise(() => {}), {
            loading: "Updating...",
          });
        });

        serwist.addEventListener("activated", () => {
          new Promise((resolve) => setTimeout(resolve, 1000)).then(() => {
            localStorage.clear();
            router.refresh();
          });
        });
      });
    }
  }, [router]);

  return (
    <ResponsiveDialog
      title="Update app?"
      description="Any unsaved data, like a workout in progress, will be lost."
      open={updateDialogOpen}
      setOpen={setUpdateDialogOpen}
    >
      <Button
        className="w-full"
        onClick={() => {
          setUpdateDialogOpen(false);
          serwistRef.current!.messageSkipWaiting();
        }}
      >
        Update
      </Button>
    </ResponsiveDialog>
  );
}
