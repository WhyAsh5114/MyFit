"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { GithubIcon, UserRoundIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import GoogleIcon from "~icons/mdi/google.jsx";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackURL = searchParams.get("callbackURL") ?? "/dashboard";

  const session = authClient.useSession();
  useEffect(() => {
    if (session.data) {
      toast.error("You are already signed in");
      router.push(callbackURL);
    }
  }, [session, callbackURL, router]);

  return (
    <div className={cn("flex flex-col gap-6")}>
      <Card>
        <CardContent className="pt-6 flex flex-col gap-2">
          <Button
            variant="outline"
            className="w-full"
            onClick={async () => {
              const signInAndGetSession = async () => {
                const { error } = await authClient.signIn.anonymous();
                if (error) throw error;
                return await authClient.getSession();
              };

              const { unwrap } = toast.promise(signInAndGetSession(), {
                loading: "Signing in",
                success: "Signed in successfully",
                error: "Failed to sign in",
              });
              const session = await unwrap();

              if (session.error) {
                toast.error(session.error.message);
                return;
              }

              router.push(callbackURL);
            }}
          >
            <UserRoundIcon /> Continue as anonymous
          </Button>
          <Button
            variant="outline"
            className="w-full"
            disabled
            onClick={() =>
              authClient.signIn.social({ provider: "google", callbackURL })
            }
          >
            <GoogleIcon /> Continue with Google
          </Button>
          <Button
            variant="outline"
            disabled
            className="w-full"
            onClick={() =>
              authClient.signIn.social({ provider: "github", callbackURL })
            }
          >
            <GithubIcon /> Continue with GitHub
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
