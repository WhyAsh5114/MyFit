"use client";

import { authClient } from "@/lib/auth-client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

const unprotectedRoutes = ["/privacy-policy", "/dashboard", "/docs", "/login"];

export function RouteProtector() {
  const router = useRouter();
  const pathname = usePathname();
  const session = authClient.useSession();

  useEffect(() => {
    const { data, error, isPending } = session;
    if (error || isPending) return;

    if (!data?.session && !unprotectedRoutes.includes(pathname)) {
      toast.error("You must be logged in to view that");
      router.push("/login?callbackURL=" + encodeURIComponent(pathname));
      return;
    }
  }, [session, pathname, router]);

  return null;
}
