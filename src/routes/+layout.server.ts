// TODO: enable again after issue https://github.com/nextauthjs/next-auth/issues/9809 fixed
export const prerender = false;

export const load = async ({ locals }) => {
  const session = await locals.auth();
  return { session };
};
