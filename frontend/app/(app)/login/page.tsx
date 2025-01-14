import { TypographyH1 } from "@/components/typography/h1";
import { LoginForm } from "./login-form";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function LoginPage() {
  return (
    <>
      <TypographyH1>Login</TypographyH1>
      <Suspense fallback={<Skeleton className="w-full h-32" />}>
        <LoginForm />
      </Suspense>
    </>
  );
}
