import { redirect } from "@sveltejs/kit";
const unprotectedRoutes = ["/", "/login", "/offline", "/privacyPolicy"];

export const load = async ({ locals, url }) => {
  const session = await locals.auth();
  if (!session?.user?.id && !unprotectedRoutes.includes(url.pathname)) {
    redirect(303, `/login?callbackURL=${url.pathname}`);
  }
  return { session };
};
