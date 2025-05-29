export const load = async ({ locals, url }) => {
	if (url.pathname !== '/notice') {
		return { redirect: '/notice' };
	}
	const session = await locals.auth();
	return { session };
};
