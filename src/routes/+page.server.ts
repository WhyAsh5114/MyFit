import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, parent }) => {
	const session = await locals.getSession();
	if (!session) {
		return { loggedIn: false, mesocycles: null, activeMesocycle: null };
	}

	const { userData } = await parent();

	return {
		loggedIn: true,
		mesocycles: userData?.mesocycles as undefined | Mesocycle[],
		activeMesocycle: userData?.activeMesocycle as undefined | ActiveMesocycle
	};
};
