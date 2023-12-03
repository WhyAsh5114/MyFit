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

	const { workoutId, workout }: APIWorkoutsUpdateWorkout = await request.json();
	const client = await clientPromise;
	try {
		const performedMesocycle = await client
			.db()
			.collection<MesocycleDocument>("mesocycles")
			.findOne({
				userId: new ObjectId(session.user.id)
			});

		if (!performedMesocycle) {
			return new Response("Performed mesocycle not found", { status: 400 });
		}

		const savedWorkout = await client
			.db()
			.collection<WorkoutDocument>("workouts")
			.findOne({
				userId: new ObjectId(session.user.id),
				_id: new ObjectId(workoutId)
			});

		if (savedWorkout === null) {
			return new Response("Workout not found", { status: 404 });
		}

		await client
			.db()
			.collection<WorkoutDocument>("workouts")
			.updateOne({ _id: new ObjectId(workoutId) }, { $set: { ...workout } });

		return new Response("Workout updated successfully", {
			status: 200
		});
	} catch (e) {
		return new Response(JSON.stringify(e), {
			status: 500
		});
	}
};
