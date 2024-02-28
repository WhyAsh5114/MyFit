import { SvelteKitAuth } from "@auth/sveltekit";
import Google from "@auth/sveltekit/providers/google";

export const { handle, signIn, signOut } = SvelteKitAuth({
  basePath: "/auth",
  providers: [Google],
  trustHost: true
});
