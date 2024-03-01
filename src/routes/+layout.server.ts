export const prerender = true;

export const load = async ({ locals }) => {
  // const session = await locals.auth();
  return { session: null };
};
