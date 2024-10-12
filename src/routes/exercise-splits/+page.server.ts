import { error } from '@sveltejs/kit';

export const load = async ({ locals }) => {
	const session = await locals.auth();
	if (!session) error(401, 'Not logged in');
};
