import { createContext } from '$lib/trpc/context';
import { createCaller, type RouterInputs } from '$lib/trpc/router';

export const load = async (event) => {
	event.depends('workouts:all');
	const trpc = createCaller(await createContext(event));

	const currentFilters: Exclude<RouterInputs['workouts']['load']['filters'], undefined> = {};

	const startDate = event.url.searchParams.get('startDate');
	if (startDate) {
		currentFilters.startDate = new Date(startDate);
	}

	const endDate = event.url.searchParams.get('endDate');
	if (endDate) {
		currentFilters.endDate = new Date(endDate);
	}

	const selectedMesocycles = event.url.searchParams.get('selectedMesocycles');
	if (selectedMesocycles) {
		currentFilters.selectedMesocycles = JSON.parse(selectedMesocycles);
	}

	const selectedWorkoutStatuses = event.url.searchParams.get('selectedWorkoutStatuses');
	if (selectedWorkoutStatuses) {
		currentFilters.selectedWorkoutStatuses = JSON.parse(selectedWorkoutStatuses);
	}

	const workouts = trpc.workouts.load({ filters: currentFilters });
	const filterData = trpc.workouts.getFilterData();
	return { workouts, filterData, currentFilters };
};
