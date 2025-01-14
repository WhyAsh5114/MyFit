import { createAuthClient } from "better-auth/react";
import { anonymousClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  plugins: [anonymousClient()],
});
