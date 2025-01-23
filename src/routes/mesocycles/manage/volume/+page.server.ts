import { createContext } from '$lib/trpc/context';
import { createCaller } from '$lib/trpc/router';
import { error } from '@sveltejs/kit';

export const load = async (event) => {
	const editing = event.url.searchParams.has('editing');
	if (editing) return { editing };

	const exerciseSplitId = event.url.searchParams.get('exerciseSplitId');
	if (!exerciseSplitId) error(400, 'No exercise split ID given');

	const trpc = createCaller(await createContext(event));
	const exerciseSplit = trpc.exerciseSplits.findById(exerciseSplitId);
	return { exerciseSplit };
};
