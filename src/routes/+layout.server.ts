import { redirect } from "@sveltejs/kit";

const unprotectedRoutes = ["/", "/login", "/offline"];

export const load = async ({ locals, url }) => {
  const session = await locals.getSession();
  if (!session && !unprotectedRoutes.includes(url.pathname)) {
    redirect(303, `/login?callbackURL=${url.pathname}`);
  }

  return { session };
};
