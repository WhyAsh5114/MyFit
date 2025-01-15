import { createAuthClient } from "better-auth/react";
import { anonymousClient } from "better-auth/client/plugins";

if (!process.env.NEXT_PUBLIC_BACKEND_URL) {
  throw new Error("NEXT_PUBLIC_BACKEND_URL env var not set!");
}

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  plugins: [anonymousClient()],
});
