import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import {
	getCycleNumber,
	getDayNumber,
	getPlannedRIR,
	getTodaysSplitWorkout
} from "$lib/util/MesocycleTemplate";
import { applyProgressiveOverload } from "$lib/util/ProgressiveOverload";
import { splitExercisesToWorkoutExercise } from "$lib/util/CommonFunctions";

export const load: PageServerLoad = async ({ locals, parent }) => {
	const session = await locals.getSession();
	if (!session?.user?.id) {
		throw error(403, "Not logged in");
	}

	const { activeMesocycle, activeMesocycleTemplate, referenceWorkout, userBodyweight } = await parent();
	if (!activeMesocycle) {
		throw error(404, "No active mesocycle found");
	}

	const todaysSplitWorkout = getTodaysSplitWorkout(
		activeMesocycle.workouts,
		activeMesocycleTemplate.exerciseSplit
	);
	if (todaysSplitWorkout === null) {
		throw error(400, "No workout found for today");
	}

	const todaysWorkout: Partial<WorkoutBeingPerformed> = {
		startTimestamp: +new Date(),
		referenceWorkout: null,
		dayNumber: getDayNumber(activeMesocycle.workouts, activeMesocycleTemplate.exerciseSplit),
		cycleNumber: getCycleNumber(activeMesocycleTemplate.exerciseSplit, activeMesocycle.workouts),
		plannedRIR: getPlannedRIR(activeMesocycleTemplate, activeMesocycle.workouts),
		deload: false
	};

	if (referenceWorkout) {
		todaysWorkout.exercisesPerformed = applyProgressiveOverload(
			referenceWorkout.exercisesPerformed,
			userBodyweight
		);
		todaysWorkout.referenceWorkout = referenceWorkout._id.toString();
	} else {
		todaysWorkout.exercisesPerformed = splitExercisesToWorkoutExercise(
			todaysSplitWorkout.exercises,
			userBodyweight ?? -1
		);
	}

	return {
		activeMesocycle,
		activeMesocycleTemplate,
		todaysWorkout: todaysWorkout as WorkoutBeingPerformed,
		todaysSplitWorkout
	};
};
