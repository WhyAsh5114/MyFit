export const load = async ({ locals, url }) => {
  const session = await locals.getSession();
  return { session };
};
