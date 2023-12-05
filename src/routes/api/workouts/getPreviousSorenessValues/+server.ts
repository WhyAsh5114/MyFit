import type { RequestHandler } from "@sveltejs/kit";
import clientPromise from "$lib/mongo/mongodb";
import { ObjectId, type WithId } from "mongodb";
import type {
	MesocycleDocument,
	MesocycleTemplateDocument,
	WorkoutDocument
} from "$lib/types/documents";

export const POST: RequestHandler = async ({ request, locals }) => {
	const session = await locals.getSession();
	if (!session?.user?.id) {
		return new Response("Invalid session", {
			status: 403
		});
	}

	const { muscleGroups, mesocycleId }: APIGetPreviousSorenessValues = await request.json();
	const client = await clientPromise;
	try {
		const performedMesocycle = await client
			.db()
			.collection<MesocycleDocument>("mesocycles")
			.findOne({
				userId: new ObjectId(session.user.id),
				_id: new ObjectId(mesocycleId)
			});

		if (!performedMesocycle) {
			return new Response("No active mesocycle found", { status: 400 });
		}

		const { exerciseSplit } = (await client
			.db()
			.collection<MesocycleTemplateDocument>("mesocycleTemplates")
			.findOne(
				{
					userId: new ObjectId(session.user.id),
					_id: performedMesocycle.templateMesoId
				},
				{ projection: { exerciseSplit: 1 } }
			)) as WithId<MesocycleTemplateDocument>;

		const workoutsCursor = client
			.db()
			.collection<WorkoutDocument>("workouts")
			.find(
				{
					userId: new ObjectId(session.user.id),
					performedMesocycleId: performedMesocycle._id
				},
				{ limit: exerciseSplit.length }
			)
			.sort({ startTimestamp: -1 });

		const previouslyTargetedWorkouts: APIGetPreviousSorenessValuesResponse = {};
		muscleGroups.forEach((muscleGroup) => {
			previouslyTargetedWorkouts[muscleGroup] = undefined;
		});

		while ((await workoutsCursor.hasNext()) && muscleGroups.length > 0) {
			const workout = await workoutsCursor.next();
			if (workout === null) continue;

			muscleGroups.forEach((muscleGroup) => {
				if (previouslyTargetedWorkouts[muscleGroup] !== undefined) return;
				if (workout.muscleSorenessToNextWorkout[muscleGroup] !== undefined) {
					previouslyTargetedWorkouts[muscleGroup] =
						workout.muscleSorenessToNextWorkout[muscleGroup];
				}
			});
		}

		return new Response(JSON.stringify(previouslyTargetedWorkouts), {
			status: 200
		});
	} catch (e) {
		return new Response(JSON.stringify(e), {
			status: 500
		});
	}
};
