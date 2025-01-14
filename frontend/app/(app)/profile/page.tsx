"use client";

import { TypographyH1 } from "@/components/typography/h1";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const [isHydrated, setIsHydrated] = useState(false);
  const session = authClient.useSession();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated || session.isPending) {
    return (
      <>
        <TypographyH1>Profile</TypographyH1>
        <Skeleton className="w-full h-40" />
      </>
    );
  }

  return (
    <>
      <TypographyH1>Profile</TypographyH1>
      <Card>
        <CardContent className="pt-6 grid gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-muted-foreground">
              Username
            </span>
            <span>{session.data?.user.name}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-muted-foreground">
              Email
            </span>
            <span>{session.data?.user.email}</span>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
