import { error } from '@sveltejs/kit';

export const load = async ({ parent }) => {
	const { mesocycle } = await parent();
	const loadedMesocycle = await mesocycle;
	if (!loadedMesocycle) error(404, 'Mesocycle not found');
	return { mesocycle: loadedMesocycle };
};
