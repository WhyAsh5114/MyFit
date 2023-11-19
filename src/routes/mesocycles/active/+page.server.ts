import type { PageServerLoad } from "./$types";
import { error } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ locals, parent }) => {
	const session = await locals.getSession();
	if (!session?.user?.id) {
		throw error(403, "Not logged in");
	}

	const { activeMesocycle, activeMesocycleTemplate } = await parent();
	if (!activeMesocycle) {
		throw error(404, "No active mesocycle found");
	}

	return {
		activeMesocycle,
		activeMesocycleTemplate
	};
};
