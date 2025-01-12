"use client";

import { usePidbClient } from "@/hooks/use-pidb";
import { useEffect } from "react";

export function PIDBComponent() {
  const createClient = usePidbClient((state) => state.createClient);

  useEffect(() => {
    if (typeof navigator !== "undefined") {
      createClient();
    }
  }, [createClient]);

  return null;
}
