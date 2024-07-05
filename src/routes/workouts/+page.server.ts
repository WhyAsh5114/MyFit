export const load = async (event) => {
	event.depends('workouts:all');
};
