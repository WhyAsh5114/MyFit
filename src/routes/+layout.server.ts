import { redirect } from "@sveltejs/kit";
const unprotectedRoutes = [
  "/",
  "/login",
  "/offline",
  "/privacyPolicy"
];

export const load = async ({ locals, url }) => {
  const session = await locals.auth();
  if (!session && !unprotectedRoutes.includes(url.pathname)) {
    throw redirect(303, `/login?callbackURL=${url.pathname}`);
  }
  return { session };
};
